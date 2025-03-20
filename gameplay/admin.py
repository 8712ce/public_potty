from django.contrib import admin

# Register your models here.
from .models import Pedestrian, Location

@admin.register(Pedestrian)
class PedestrianAdmin(admin.ModelAdmin):
    list_display = ('name', 'score', 'is_drunk', 'bladder', 'bowels')

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('type', 'name', 'has_restroom', 'open_now', 'open_to_public')