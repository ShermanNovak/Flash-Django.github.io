from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.fields import DateTimeField
from django.utils import timezone

# Create your models here.

class User(AbstractUser):
    pass

class Deck(models.Model):
    owner_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="deck_owner")
    deck_name = models.CharField(max_length=64)
    last_edited = models.DateTimeField(default=timezone.now)
    last_accessed = models.DateTimeField(default=timezone.now)
    notes_format = models.CharField(max_length=1000)
    public = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.deck_name} by {self.owner_id}"

class Card(models.Model):
    owner_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="card_owner")
    deck_id = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name="deck_id")
    card_header = models.CharField(max_length=64)
    card_content = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.card_header} in {self.deck_id}"

class Status(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    card_id = models.ForeignKey(Card, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, default="grey")

def __str__(self):
        return f"{self.card_id} has {self.status}"

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    deck_id = models.ForeignKey(Deck, on_delete=models.CASCADE)
    last_accessed = DateTimeField(null=True, blank=True)

def __str__(self):
    return f"{self.user} uses {self.deck_id}"

