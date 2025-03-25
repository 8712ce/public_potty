from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from .models import Location
import random


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





def get_or_create_chunk(session, chunk_index):

    # CHECK IF CHUNK_INDEX IS IN THE SESSION.  IF NOT, GENERATE 5 RANDOM LOCATIONS AND STORE TEHM. RETURNS THE LIST OF LOCATION DICTS FOR THAT CHUNK.

    if 'chunks' not in session:
        session['chunks'] = {} # CREATE A DICTIONARY

    chunks = session['chunks']  # REFERENCE

    # CONVERT CHUNK_INDEX TO STRING BECAUSE SESSION KEYS MUST BE JSON-SERIALIZABLE
    index_str = str(chunk_index)

    if index_str not in chunks:
        # CREATE A NEW CHUNK WITH 5 RANDOM LOCATIONS
        chunk_data = generate_random_chunk(num_locations=5)
        # STORE IN SESSION
        chunks[index_str] = chunk_data
        session.modified = True # MARK SESSION AS CHANGED

    return chunks[index_str]





def get_chunk(request):

    # /GET_CHUNK?INDEX=0 -> RETURNS THE CHUNK DATA (LIST OF 5 LOCATION DICTS).  IF CHUNK DOESN'T EXITS, CREATES IT.
    chunk_index = int(request.GET.get('index', 0))
    chunk_data = get_or_create_chunk(request.session, chunk_index)
    return JsonResponse(chunk_data, safe=False)





# Create your views here.
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
def game_view(request):
    # MAYBE CREATE A STARTING CHUNK AT INDEX 0 SO THERE'S SOMETHING TO SEE RIGHT AWAY ON PAGE LOAD
    starting_chunk = get_or_create_chunk(request.session, 0)

    # PASS THESE TO THE TEMPLATE IF WE WANT TO DISPLAY THEM INITIALLY OR WE CAN PASS AN EMPTY LIST IF WE WANT THE FRONT-END TO REQUEST IT DYNAMICALLY
    return render(request, 'game.html', {"locations": starting_chunk})