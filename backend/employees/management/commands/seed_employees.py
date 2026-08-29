"""
Management command to seed 10,000 synthetic employees.

Usage:
    python manage.py seed_employees          # Creates 10,000 employees
    python manage.py seed_employees --count 500  # Creates 500 employees
    python manage.py seed_employees --clear  # Deletes existing data first

Design decisions:
- Uses a fixed random seed for deterministic output
- Employee IDs are sequential (EMP-00001 through EMP-10000)
- Emails are generated from names with dedup suffix when needed
- Salary ranges are realistic per country/job level
- Re-running without --clear skips if data already exists
"""

import random
from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from faker import Faker

from employees.models import COUNTRY_CURRENCY_MAP, DEPARTMENTS, Employee

# Fixed seed for deterministic generation
RANDOM_SEED = 42

# Job titles organized by department for realism
DEPARTMENT_JOB_TITLES = {
    "Engineering": [
        "Software Engineer",
        "Senior Software Engineer",
        "Staff Engineer",
        "Principal Engineer",
        "Engineering Manager",
        "QA Engineer",
        "DevOps Engineer",
        "Data Engineer",
        "Frontend Engineer",
        "Backend Engineer",
    ],
    "Product": [
        "Product Manager",
        "Senior Product Manager",
        "Product Analyst",
        "Product Owner",
    ],
    "Design": [
        "UX Designer",
        "Senior UX Designer",
        "UI Designer",
        "Design Lead",
        "UX Researcher",
    ],
    "Marketing": [
        "Marketing Manager",
        "Content Strategist",
        "Growth Marketer",
        "Brand Manager",
        "Marketing Analyst",
    ],
    "Sales": [
        "Account Executive",
        "Senior Account Executive",
        "Sales Manager",
        "Sales Development Representative",
        "Customer Success Manager",
    ],
    "HR": [
        "HR Business Partner",
        "Recruiter",
        "Senior Recruiter",
        "HR Manager",
        "Compensation Analyst",
    ],
    "Finance": [
        "Financial Analyst",
        "Senior Financial Analyst",
        "Accountant",
        "Finance Manager",
        "Controller",
    ],
    "Operations": [
        "Operations Manager",
        "Operations Analyst",
        "Project Manager",
        "Office Manager",
        "Facilities Coordinator",
    ],
}

# Salary ranges by country (annual, in local currency).
# Ranges represent realistic compensation for the country's market.
COUNTRY_SALARY_RANGES = {
    "US": (45_000, 250_000),
    "GB": (30_000, 180_000),
    "DE": (35_000, 160_000),
    "FR": (32_000, 150_000),
    "IN": (400_000, 5_000_000),  # INR
    "JP": (3_000_000, 20_000_000),  # JPY
    "AU": (50_000, 220_000),
    "CA": (45_000, 230_000),
    "BR": (30_000, 400_000),  # BRL
    "SG": (40_000, 250_000),
}

# Weight distribution for countries (higher = more employees from that country)
COUNTRY_WEIGHTS = {
    "US": 25,
    "GB": 12,
    "DE": 10,
    "FR": 8,
    "IN": 18,
    "JP": 5,
    "AU": 6,
    "CA": 7,
    "BR": 5,
    "SG": 4,
}


class Command(BaseCommand):
    help = "Seed the database with synthetic employee data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=10_000,
            help="Number of employees to create (default: 10000)",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing employees before seeding",
        )

    def handle(self, *args, **options):
        count = options["count"]
        clear = options["clear"]

        if clear:
            deleted, _ = Employee.objects.all().delete()
            self.stdout.write(f"Deleted {deleted} existing employees.")

        existing_count = Employee.objects.count()
        if existing_count > 0 and not clear:
            self.stdout.write(
                self.style.WARNING(
                    f"Database already contains {existing_count} employees. "
                    f"Use --clear to delete existing data first."
                )
            )
            return

        self.stdout.write(f"Seeding {count} employees...")
        employees = self._generate_employees(count)

        # Bulk create in batches for performance
        batch_size = 1000
        for i in range(0, len(employees), batch_size):
            batch = employees[i : i + batch_size]
            Employee.objects.bulk_create(batch)
            self.stdout.write(f"  Created {min(i + batch_size, count)}/{count}")

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {count} employees."))

    def _generate_employees(self, count):
        """Generate a list of Employee instances with deterministic data."""
        rng = random.Random(RANDOM_SEED)
        fake = Faker()
        Faker.seed(RANDOM_SEED)

        # Build weighted country list
        countries = []
        weights = []
        for country, weight in COUNTRY_WEIGHTS.items():
            countries.append(country)
            weights.append(weight)

        employees = []
        used_emails = set()

        for i in range(count):
            # Deterministic country selection based on weights
            country = rng.choices(countries, weights=weights, k=1)[0]
            currency = COUNTRY_CURRENCY_MAP[country]
            department = rng.choice(DEPARTMENTS)
            job_title = rng.choice(DEPARTMENT_JOB_TITLES[department])

            first_name = fake.first_name()
            last_name = fake.last_name()

            # Generate unique email with dedup handling
            base_email = f"{first_name.lower()}.{last_name.lower()}@acme.com"
            email = base_email
            suffix = 1
            while email in used_emails:
                email = f"{first_name.lower()}.{last_name.lower()}{suffix}@acme.com"
                suffix += 1
            used_emails.add(email)

            # Generate salary within country-appropriate range
            min_sal, max_sal = COUNTRY_SALARY_RANGES[country]
            salary = Decimal(str(rng.randint(min_sal, max_sal))).quantize(
                Decimal("0.01")
            )

            # Salary effective date: random date in the past 3 years
            days_ago = rng.randint(1, 1095)
            effective_date = date.today() - timedelta(days=days_ago)

            employees.append(
                Employee(
                    employee_id=f"EMP-{i + 1:05d}",
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    department=department,
                    job_title=job_title,
                    country=country,
                    currency=currency,
                    salary=salary,
                    salary_effective_date=effective_date,
                )
            )

        return employees
