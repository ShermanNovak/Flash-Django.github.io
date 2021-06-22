from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("home", views.home, name="home"),
    path("public", views.public, name="public"),
    path("create", views.create, name="create"),
    path("search", views.search, name="search"),
    path("load_cards", views.load_cards, name="load_cards"),
    path("change_status", views.change_status, name="change_status"),
    path("cards/<int:deckid>", views.view_cards, name="view_cards"),
    path("<int:deckid>/<str:action>", views.notes, name="notes")
]
