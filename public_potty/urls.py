"""
URL configuration for public_potty project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from gameplay.views import reset_session, game_view, get_chunk, character_select_view, level_select_view
# from django.shortcuts import redirect

urlpatterns = [
    path('admin/', admin.site.urls),
    # path('', game_view, name='game'),   # RENDERSE GAME.HTML
    path('', character_select_view, name='select_character'),   # RENDERSE GAME.HTML
    path('get_chunk/', get_chunk, name='get_chunk'),    # RETURNS JSON FOR A GIVEN CHUNK
    # path('select-character/', character_select_view, name='select_character'),
    path('game/', game_view, name='game'),
    # path('reset/', lambda request: (request.session.flush(), redirect('select_character'))[1], name='reset'),
    path('reset/', reset_session, name='reset'),
    path('select-level/', level_select_view, name='select_level'),
]
