from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.conf import settings
from .models import Location
from .models import Character
from .models import Level
import random
from django.utils import timezone
import time



def reset_session(request):
    request.session.flush()
    return redirect('select_character')



def level_select_view(request):
    if request.method == "POST":
        level_id = request.POST.get("level_id")
        if level_id:
            request.session["selected_level_id"] = level_id
            return redirect("game") # OR WHEREVER THE GAME STARTS
        
    levels = Level.objects.all()
    return render(request, "gameplay/level_select.html", {"levels": levels})




def generate_random_chunk(num_locations=5, level=None):

    # RETURNS A LIST OF DICTIONARIES, EACH REPRESENTING A RANDOM LOCATION.  WE'LL STORE THEM IN THE SESSION, SO NO DB WRITES UNLESS WE WANT THEM.

    chunk_data = []
    for _ in range(num_locations):
        location = Location()   # CREATE A BLANK LOCATION
        # location.randomize_location()   # FILL WITH RANDOM DATA
        location.randomize_location(level=level)   # FILL WITH RANDOM DATA

        # CONVERT TO A DICT SO WE CAN STORE IT IN SESSION
        location_dict = {
            "type_display": location.get_type_display(),
            "subtype_display": location.get_subtype_display() if location.subtype else "",
            "name": location.name or "",
            "open_to_public": location.open_to_public,
            "open_now": location.open_now,
            "has_restroom": location.has_restroom,
            "restroom_requires_permission": location.restroom_requires_permission,
            "restroom_occupied": location.restroom_occupied,
            "restroom_out_of_order": location.restroom_out_of_order,
            "restroom_visible": location.restroom_visible,
            "restroom_line": location.restroom_line,
            "restroom_requires_code": location.restroom_requires_code,
            "restroom_code": location.restroom_code,
        }
        chunk_data.append(location_dict)
    return chunk_data





def get_or_create_chunk(session, chunk_index):
    from gameplay.models import Level # AVOID CIRCULAR IMPORT

    # CHECK IF CHUNK_INDEX IS IN THE SESSION.  IF NOT, GENERATE 5 RANDOM LOCATIONS AND STORE TEHM. RETURNS THE LIST OF LOCATION DICTS FOR THAT CHUNK.

    if 'chunks' not in session:
        session['chunks'] = {} # CREATE A DICTIONARY

    chunks = session['chunks']  # REFERENCE

    # CONVERT CHUNK_INDEX TO STRING BECAUSE SESSION KEYS MUST BE JSON-SERIALIZABLE
    index_str = str(chunk_index)

    if index_str not in chunks:
        level = None
        level_id = session.get("selected_level_id")
        if level_id:
            try:
                level = Level.objects.get(id=level_id)
            except Level.DoesNotExist:
                pass

        # CREATE A NEW CHUNK WITH 5 RANDOM LOCATIONS
        chunk_data = generate_random_chunk(num_locations=5, level=level)
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
def game_view(request):
    # CLEARS SESSION ON EVERY GAME PAGE LAOD
    # request.session.flush()

    # REMOVE PREVIOUS CHUNK DATA SO WE GET A FRESH MAP ON LOAD 
    request.session.pop('chunks', None)

    # IF NO CHARACTER SELECTED YET, REDIRECT TO SELECTION SCREEN
    if "selected_character_id" not in request.session:
        return redirect("select_character")
    
    selected_id = request.session["selected_character_id"]
    selected_character = Character.objects.get(id=selected_id)

    # EXCLUDE THE SELECTED CHARACTER FROM THE LIST
    other_characters = Character.objects.exclude(id=selected_id)
    
    # MAYBE CREATE A STARTING CHUNK AT INDEX 0 SO THERE'S SOMETHING TO SEE RIGHT AWAY ON PAGE LOAD
    starting_chunk = get_or_create_chunk(request.session, 0)

    # char_id = request.session.get("selected_character_id")
    # character = None
    # if char_id:
    #     character = Character.objects.get(id=char_id)
    
    # PASS THESE TO THE TEMPLATE IF WE WANT TO DISPLAY THEM INITIALLY OR WE CAN PASS AN EMPTY LIST IF WE WANT THE FRONT-END TO REQUEST IT DYNAMICALLY
    # return render(request, 'gameplay/game.html', {"locations": starting_chunk, "character": character})
    return render(request, 'gameplay/game.html', {"locations": starting_chunk, "character": selected_character, "other_characters": other_characters, "timestamp": int(time.time()) })




def character_select_view(request):
    # IF PLAYER ALREADY SELECTED A CHARACTER, GO STRAIGHT TO THE GAME #
    if request.session.get("selected_character_id"):
        return redirect("game")
    
    if request.method == "POST":
        char_id = request.POST.get("character_id")
        if char_id:
            request.session["selected_character_id"] = char_id
            return redirect("game") # REDIRECT TO GAME VIEW
    
    # GET REQUEST - SHOW THE CHARACTERS
    characters = Character.objects.all()
    return render(request, "gameplay/character_select.html", {"characters": characters})



# def start_game_view(request):
#     if request.method == "POST":
#         char_id = request.POST.get("character_id")
#         request.session["selected_character_id"] = char_id
#         return redirect("game_view")