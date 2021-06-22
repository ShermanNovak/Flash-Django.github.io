from django.contrib import admin
from .models import User, Deck, Card, Status, Like

# Register your models here.
admin.site.register(User)
admin.site.register(Deck)
admin.site.register(Card)
admin.site.register(Status)
admin.site.register(Like)