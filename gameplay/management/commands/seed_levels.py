from django.core.management.base import BaseCommand
from gameplay.models import Level

class Command(BaseCommand):
    help = "Seed default levels."

    def handle(self, *args, **kwargs):
        Level.objects.all().delete() # CLEAR EXISTING

        levels = [
            {
                "name": "Main Street North",
                "description": "A polished, bustling corridor of upscale shops, bars, and restaurants catering to the daytime and evening crowd.",
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
                "description": "A lively commercial strip with late-night spots and a more eclectic, lived-in charm.",
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
                "description": "A dense, high-energy district packed with offices, nightlife, and a full range of gritty and refined city spaces.",
                "type_weights": {
                    "restaurant": 6,
                    "bar": 6,
                    "store": 5,
                    "house": 0,
                    "apartment": 4,
                    "park": 2,
                    "gas_station": 2,
                    "office": 6,
                },
                "subtype_weights": {
                    "1": 1, # FANCY
                    "2": 1, # NICE
                    "3": 1,
                    "4": 1,
                    "5": 1, # SCUZZY
                },
            },
            {
                "name": "Northfield Hollow",
                "description": "A quiet, upscale residential enclave with a mix of private homes and tasteful apartments hiding unexpected quirks.",
                "type_weights": {
                    "restaurant": 2,
                    "bar": 2,
                    "store": 2,
                    "house": 6,
                    "apartment": 5,
                    "park": 3,
                    "gas_station": 1,
                    "office": 1,
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
                "name": "Elbridge",
                "description": "A modest, lived-in neighborhood full of homes and businesses that feel unpretentious.",
                "type_weights": {
                    "restaurant": 3,
                    "bar": 2,
                    "store": 2,
                    "house": 5,
                    "apartment": 5,
                    "park": 2,
                    "gas_station": 1,
                    "office": 1,
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
                "name": "Orchard Terrace",
                "description": "A tidy, family-oriented area where the nightlife fades and quiet parks and pleasant homes take center stage.",
                "type_weights": {
                    "restaurant": 2,
                    "bar": 1,
                    "store": 2,
                    "house": 6,
                    "apartment": 5,
                    "park": 3,
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
                "name": "Glenbar",
                "description": "A peaceful, family-focused suburb with plenty of parks, schools, and not a bar in sight.",
                "type_weights": {
                    "restaurant": 2,
                    "bar": 0,
                    "store": 2,
                    "house": 6,
                    "apartment": 5,
                    "park": 4,
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
        ]

        for level_data in levels:
            Level.objects.create(**level_data)

        self.stdout.write(self.style.SUCCESS("Levels seeded!"))