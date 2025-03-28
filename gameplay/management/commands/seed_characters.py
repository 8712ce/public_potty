from django.core.management.base import BaseCommand
from gameplay.models import Character

class Command(BaseCommand):
    help = "Seed starter characters"

    def handle(self, *args, **kwargs):
        characters = [
            {"name": "Jennifer", "toilet_meter_drain_rate": 0.5},
            {"name": "Abe", "toilet_meter_drain_rate": 0.5},
            {"name": "Brittany", "toilet_meter_drain_rate": 0.5},
            {"name": "Jet", "toilet_meter_drain_rate": 0.5},
            {"name": "Ezekiel", "toilet_meter_drain_rate": 0.5},
            {"name": "Caleb", "toilet_meter_drain_rate": 0.5},
        ]

        for data in characters:
            Character.objects.get_or_create(**data)

        self.stdout.write(self.style.SUCCESS("Characters seeded!"))