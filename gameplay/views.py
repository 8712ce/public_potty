from django.shortcuts import render
from .models import Location
# from random import sample
import random

# Create your views here.
def game_view(request):
    Location.objects.all().delete()
    
    random_locations = []

    for _ in range(3):
        loc = Location()
        loc.randomize_location() # SETS TYPE, SUBTYPE, RESTROOM, ETC. #
        loc.save() # NOW IT'S PERSISTED IN THE DATABASE #
        random_locations.append(loc)


    return render(request, "game.html", {
        'locations': random_locations
    })