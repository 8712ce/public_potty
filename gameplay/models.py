from django.db import models
import random

class Character(models.Model):
    name = models.CharField(max_length=100, unique=True)
    toilet_meter_drain_rate = models.FloatField(help_text="Rate at which toilet meter depletese (lower = slower)")
    sprite_url = models.CharField(max_length=255)

    def __str__(self):
        return self.name
    


    

class Pedestrian(models.Model):
    name = models.CharField(
        max_length=100,
        blank=True, # "reqired: false"
        null=True
    )
    score = models.IntegerField(
        default=0   # "required: true, default: 0"
    )
    image = models.CharField(
        max_length=225  # "required: true"
    )
    is_drunk = models.BooleanField(
        default=False
    )
    bladder = models.IntegerField(
        default=0
    )
    bowels = models.IntegerField(
        default=0
    )
    # ADD NUMBER OF TIMES WASHED HANDS FOR PART OF TOTAL PLAYER STATS AT LEVEL END AND MAIN SCOREBOARD

    def __str__(self):
        # THIS IS HOW THIS MODEL APPEARS IN TEH ADMIN / SHELL #
        return self.name or f"Pedestrian {self.pk}"
    
    def assign_random_bladder_bowels(self):
        # EXAMPLE METHOD TO ASSIGN RANDOM BLADDER/BOWELS AFTER CREATION OR AT THE START OF THE GAME #
        self.bladder = random.randint(0, 100)
        self.bowels = random.randint(0, 100)
        self.save()





# LOCATION MODEL #
class Location(models.Model):
    LOCATION_TYPES = [
        ("park", "Park"),
        ("restaurant", "Restaurant"),
        ("store", "Store"),
        ("bar", "Bar"),
        ("house", "House"),
        ("apartment", "Appartment"),
        ("gas_station", "Gas Station"),
        ("office", "Office"),
    ]

    SUBTYPES = [
        (1, "Fancy"),
        (2, "Average"),
        (3, "Scuzzy"),
    ]

    type = models.CharField(max_length=50, choices=LOCATION_TYPES)

    name = models.CharField(max_length=100, blank=True, null=True)

    has_restroom = models.BooleanField(default=False)

    open_now = models.BooleanField(default=True)

    open_to_public = models.BooleanField(default=True)

    hours_open = models.CharField(max_length=50, blank=True, null=True, help_text="For display, e.g., '9AM - 5PM'")

    subtype = models.IntegerField(choices=SUBTYPES, blank=True, null=True, help_text="Only applies to stores, bars, and restaurants")

    def __str__(self):
        if self.subtype and self.type in ["store", "bar", "restaurant"]:
            return f"{self.get_type_display()} ({self.get_subtype_display()})"
        return self.name or f"{self.get_type_display()}"
    
    def randomize_location(self):
        # EXAMPLE METHOD TO RANDOMLY ASSIGN ATTRIBUTES TO LOCATIONS #
        self.type = random.choice([t[0] for t in self.LOCATION_TYPES])
        self.has_restroom = random.choice([True, False])
        self.open_now = random.choice([True, False])
        self.open_to_public = random.choice([True, False])

        # ASSIGN A SUBTYPE ONLY FOR STORES, BARS, OR RESTAURANTS #
        if self.type in ["store", "bar", "restaurant"]:
            self.subtype = random.choice([1, 2, 3])
        else:
            self.subtype = None
            
        # self.save()