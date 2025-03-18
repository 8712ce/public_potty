from django.db import models
import random

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