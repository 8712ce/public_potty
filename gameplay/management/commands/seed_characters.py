from django.core.management.base import BaseCommand
from gameplay.models import Character

class Command(BaseCommand):
    help = "Seed starter characters"

    def handle(self, *args, **kwargs):
        Character.objects.all().delete() # CLEAR EXISTING CHARACTERS
        characters = [
            {"name": "Jennifer", "toilet_meter_drain_rate": 0.5, "follow_distance_min": 30, "follow_distance_max": 60},
            {"name": "Abe", "toilet_meter_drain_rate": 1.0, "follow_distance_min": 10, "follow_distance_max": 40},
            {"name": "Brittany", "toilet_meter_drain_rate": 1.2, "follow_distance_min": 20, "follow_distance_max": 70},
            {"name": "Jet", "toilet_meter_drain_rate": 0.8, "follow_distance_min": 40, "follow_distance_max": 70},
            {"name": "Ezekiel", "toilet_meter_drain_rate": 1.5, "follow_distance_min": 25, "follow_distance_max": 55},
            {"name": "Kaleb", "toilet_meter_drain_rate": 1.1, "follow_distance_min": 50, "follow_distance_max": 80},
        ]

        for data in characters:
            # Character.objects.get_or_create(**data)
            Character.objects.create(**data)

        self.stdout.write(self.style.SUCCESS("Characters seeded!"))