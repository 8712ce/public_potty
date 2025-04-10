from django.core.management.base import BaseCommand
from gameplay.models import Level

class Command(BaseCommand):
    help = "Seed default levels."

    def handle(self, *args, **kwargs):
        Level.objects.all().delete() # CLEAR EXISTING

        levels = [
            {
                "name": "Main Street North",
                "description": "A lively area full of shops and restaurants.",
                "type_weights": {
                    "restaurant": 5,
                    "bar": 4,
                    "store": 4,
                    "house": 1,
                    "apartment": 1,
                    "park": 2,
                    "gas_station": 1,
                    "office": 2,
                },
                "subtype_weights": {
                    "1": 4, # FANCY
                    "2": 4, # NICE
                    "3": 3,
                    "4": 1,
                    "5": 1, # SCUZZY
                },
            },
            {
                "name": "Main Street South",
                "description": "A lively area full of shops and restaurants.",
                "type_weights": {
                    "restaurant": 5,
                    "bar": 4,
                    "store": 4,
                    "house": 1,
                    "apartment": 1,
                    "park": 2,
                    "gas_station": 1,
                    "office": 2,
                },
                "subtype_weights": {
                    "1": 1, # FANCY
                    "2": 1, # NICE
                    "3": 3,
                    "4": 4,
                    "5": 4, # SCUZZY
                },
            },
            {
                "name": "Downtown",
                "description": "The center of the city where all neighborhoods intersect.",
                "type_weights": {
                    "restaurant": 5,
                    "bar": 5,
                    "store": 4,
                    "house": 0,
                    "apartment": 1,
                    "park": 2,
                    "gas_station": 2,
                    "office": 5,
                },
                "subtype_weights": {
                    "1": 1, # FANCY
                    "2": 1, # NICE
                    "3": 1,
                    "4": 1,
                    "5": 1, # SCUZZY
                },
            },
        ]

        for level_data in levels:
            Level.objects.create(**level_data)

        self.stdout.write(self.style.SUCCESS("Levels seeded!"))