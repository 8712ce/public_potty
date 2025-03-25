from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from .models import Location
import random

# # Create your views here.
# def game_view(request):
#     Location.objects.all().delete()
    
#     random_locations = []

#     for _ in range(3):
#         loc = Location()
#         loc.randomize_location() # SETS TYPE, SUBTYPE, RESTROOM, ETC. #
#         loc.save() # NOW IT'S PERSISTED IN THE DATABASE #
#         random_locations.append(loc)


#     return render(request, "game.html", {
#         'locations': random_locations
#     })

def generate_random_chunk(num_locations=5):

    # RETURNS A LIST OF DICTIONARIES, EACH REPRESENTING A RANDOM LOCATION.  WE'LL STORE THEM IN THE SESSION, SO NO DB WRITES UNLESS WE WANT THEM.

    chunk_data = []
    for _ in range(num_locations):
        location = Location()   # CREATE A BLANK LOCATION
        location.randomize_location()   # FILL WITH RANDOM DATA

        # CONVERT TO A DICT SO WE CAN STORE IT IN SESSION
        location_dict = {
            "type_display": location.get_type_display(),
            "subtype_display": location.get_subtype_display() if location.subtype else "",
            "name": location.name or "",
            "has_restroom": location.has_restroom,
            "open_now": location.open_now,
            "open_to_public": location.open_to_public,
        }
        chunk_data.append(location_dict)
    return chunk_data