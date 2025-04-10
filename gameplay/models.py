from django.db import models
import random

class Character(models.Model):
    name = models.CharField(max_length=100, unique=True)
    toilet_meter_drain_rate = models.FloatField(help_text="Rate at which toilet meter depletese (lower = slower)")
    sprite_url = models.CharField(max_length=255)
    follow_distance_min = models.IntegerField(default=30)
    follow_distance_max = models.IntegerField(default=60)

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




class Level(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    # JSON FIELDS FOR FLEXIBILITY
    type_weights = models.JSONField(default=dict)
    subtype_weights = models.JSONField(default=dict)

    def __str__(self):
        return self.name





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
        (2, "Nice"),
        (3, "Average"),
        (4, "Poor"),
        (5, "Scuzzy"),
    ]

    type = models.CharField(max_length=50, choices=LOCATION_TYPES)

    name = models.CharField(max_length=100, blank=True, null=True)

    has_restroom = models.BooleanField(default=False)
    restroom_requires_permission = models.BooleanField(default=False)
    restroom_occupied = models.BooleanField(default=False)
    restroom_out_of_order = models.BooleanField(default=False)
    restroom_visible = models.BooleanField(default=False)
    restroom_line = models.IntegerField(default=0)
    restroom_requires_code = models.BooleanField(default=False)
    restroom_code = models.CharField(max_length=4, blank=True, null=True)

    open_now = models.BooleanField(default=True)
    open_to_public = models.BooleanField(default=True)
    hours_open = models.CharField(max_length=50, blank=True, null=True, help_text="For display, e.g., '9AM - 5PM'")

    subtype = models.IntegerField(choices=SUBTYPES, blank=True, null=True, help_text="Applies to all locations")

    # def __str__(self):
    #     if self.subtype and self.type in ["store", "bar", "restaurant"]:
    #         return f"{self.get_type_display()} ({self.get_subtype_display()})"
    #     return self.name or f"{self.get_type_display()}"
    def __str__(self):
        subtype_display = self.get_subtype_display() if self.subtype else ""
        return f"{subtype_display} {self.get_type_display()}".strip() or self.name or "Unnamed Location"
    
    def randomize_location(self, level=None):
        if level:
            type_weights = level.type_weights
            type_choices = [t for t in self.LOCATION_TYPES if t[0] in type_weights]
            types, weights = zip(*[(t[0], type_weights[t[0]]) for t in type_choices])
            self.type = random.choices(types, weights=weights)[0]

            subtype_weights = level.subtype_weights
            subtypes, sub_weights = zip(*[(int(k), v) for k, v in subtype_weights.items()])
            self.subtype = random.choices(subtypes, weights=sub_weights)[0]
        else:
        # EXAMPLE METHOD TO RANDOMLY ASSIGN ATTRIBUTES TO LOCATIONS #
            self.type = random.choice([t[0] for t in self.LOCATION_TYPES])
            self.subtype = random.randint(1, 5)
            
        # self.has_restroom = random.choice([True, False])
        self.open_now = random.choice([True, False])
        
        # OPEN TO PUBLIC PROBABILITY
        # self.open_to_public = random.choice([True, False])
        if self.type in ["bar", "restaurant", "store", "gas_station", "park"]:
            self.open_to_public = random.choices([True, False], weights=[9, 1])[0]
        elif self.type in ["office"]:
            self.open_to_public = random.choices([True, False], weights=[3, 7])[0]
        else: # HOUSES, APARTMENTS
            self.open_to_public = random.choices([True, False], weights=[1, 9])[0]
        
        if self.type in ["bar", "restaurant", "gas_station"]:
            self.has_restroom = random.choices([True, False], weights=[9, 1])[0]
        elif self.type in ["store", "office", "park"]:
            self.has_restroom = random.choices([True, False], weights=[6, 4])[0]
        else: # APARTMENTS, HOUSES //
            self.has_restroom = random.choices([True, False], weights=[2, 8])[0]

        self.restroom_visible = random.choice([True, False]) if self.has_restroom else False
        self.restroom_requires_permission = random.choice([True, False]) if self.has_restroom else False
        self.restroom_occupied = random.choice([True, False]) if self.has_restroom else False
        self.restroom_line = random.randint(0, 5) if self.has_restroom else 0

        # LINK PROBABILITY OF OUT OF ORDER STATUS TO SUBTYPE
        # self.restroom_out_of_order = random.choices([True, False], weights=[1, 4])[0] if self.has_restroom else False
        if self.has_restroom:
            out_of_order_weights = {
                1: [1, 9],
                2: [2, 8],
                3: [3, 7],
                4: [4, 6],
                5: [5, 5],
            }
            ooo_weights = out_of_order_weights.get(self.subtype, [3, 7]) # DEFAULT TO 30%
            self.restroom_out_of_order = random.choices([True, False], weights=ooo_weights)[0]
        else:
            self.restroom_out_of_order = False

        # ALIGN PROBABILITY OF REQUIRING A CODE TO SUBTYPE
        # self.restroom_requires_code = random.choice([True, False]) if self.has_restroom else False
        if self.has_restroom:
            code_weights = {
                1: [1, 9], # FANCY: 10% CHANCE OF REQUIRING A CODE
                2: [2, 8], # NICE: 20%
                3: [4, 6], # AVERAGE: 40%
                4: [6, 4], # POOR: 60%
                5: [8, 2], # SCUZZY: 80%
            }
            weights = code_weights.get(self.subtype, [4, 6]) # DEFAULT TO 40/60 IF SOMEHOW INVALID
            self.restroom_requires_code = random.choices([True, False], weights=weights)[0]
        else:
            self.restroom_requires_code = False

        self.restroom_code = (
            f"{random.randint(0, 9999):04}" if self.restroom_requires_code else None
        )
            
        # self.save()