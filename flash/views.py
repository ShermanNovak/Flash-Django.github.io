from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import re
import json
import markdown2
from django.utils import timezone

from .models import User, Deck, Card, Status, Like


# Create your views here.
def index(request):
    return render(request, "flash/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse('home'))
        else:
            return render(request, "flash/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "flash/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse('index'))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "flash/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "flash/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse('home'))
    else:
        return render(request, "flash/register.html")


@csrf_exempt
@login_required
def home(request):
    if request.method == "GET":
        current_user = User.objects.get(pk=request.user.id)
        liked = Deck.objects.filter(like__user=current_user).order_by('deck_name')
        liked_accessed = []
        for like in liked:
            try:
                last_accessed = Like.objects.get(user=current_user, deck_id=like)
                liked_accessed.append(last_accessed)
            except Like.DoesNotExist:
                liked_accessed.append(None)
        zipped = zip(liked, liked_accessed)

        return render(request, "flash/home.html",{
            "decks": Deck.objects.filter(owner_id=current_user).order_by('deck_name'),
            "liked": zipped
        })

    elif request.method == "PUT":
        # Load PUT data and check that the data is not None
        data = json.loads(request.body)

        if data.get("deckid") is None:
            return JsonResponse({"error": "Deck ID is None."}, status=404)
        deck_id = data["deckid"]
        
        if data.get("action") is None:
            return JsonResponse({"error": "No action specified."}, status=404)
        action = data["action"]

        # Query for the requested deck
        try:
            deck = Deck.objects.get(pk=deck_id)
            print(deck)
        except Deck.DoesNotExist:
            return JsonResponse({"error": "Deck not found."}, status=404)

        if action == "Delete":
            deck.delete()
            return JsonResponse({"message": "Successfully deleted deck."}, status=201)
        
        elif action == "Make Public":
            # Update database 
            deck.public = True
            deck.save(update_fields=['public'])
            return JsonResponse({"message": "Successfully made deck public."}, status=201)

        elif action == "Make Private":
            # Update database 
            deck.public = False
            deck.save(update_fields=['public'])
            return JsonResponse({"message": "Successfully made deck private."}, status=201)

    else:
        return HttpResponseRedirect(reverse('index'))

@login_required
def create(request):
    if request.method == "POST":
        notes_format = request.POST.get('textarea')

        # Split the string into substrings
        temp_list = re.split("#|\\\\", notes_format)
        card_format = list(filter(None, temp_list))

        print(f"card_format:{card_format}")

        # Organise the substrings into different lists
        deck_name = []
        headers = []
        contents = []
        for i in range(len(card_format)):
            if i == 0:
                deck_name.append(card_format[i])
            elif i % 2 == 0:
                contents.append(card_format[i])
            else:
                headers.append(card_format[i])
        print(f"headers:{headers}")
        print(f"contents:{contents}")
        print(f"deck:{deck_name}")

        if len(headers) != len(contents):
            return JsonResponse({"error": "Number of Headers is not equal to the Number of Contents."}, status=404)
        if len(deck_name) != 1:   
            return JsonResponse({"error": "There should only be one deck name."}, status=404)

        current_user = User.objects.get(pk=request.user.id)

        # Create Deck
        create_deck = Deck.objects.create(deck_name=str(deck_name[0]), owner_id=current_user, notes_format=notes_format)

        # Add Cards to the deck by iterating through the lists
        for i in range(len(headers)):
            Card.objects.create(deck_id=create_deck, card_header=headers[i], card_content=contents[i], owner_id=current_user)

        return HttpResponseRedirect(reverse('home'))

    else:
        return render(request, "flash/create.html")


def notes(request, deckid, action):
    if request.method == "GET":
        # Query to retrieve the deck
        try:
            deck = Deck.objects.get(pk=deckid)
        except Deck.DoesNotExist:
            return JsonResponse({"error": "Deck not found."}, status=404)

        # Make sure the deck is public if the user is not the owner
        try:
            current_user = User.objects.get(pk=request.user.id)
        except: 
            current_user = None

        if deck.public == False:
            if deck.owner_id != current_user:
                return JsonResponse({"error": "Access not allowed, Deck is not public."}, status=404)

        # If the user wants to view the deck in notes format
        if action == "notes":

            # Update last_accessed field if user is logged in
            if request.user.is_authenticated:
                # If current user is the owner of the deck, update deck object
                if deck.owner_id == current_user:
                    deck.last_accessed = timezone.now()
                    deck.save(update_fields=['last_accessed'])
                # If current user is not the owner of the deck, update like object
                else:
                    try:
                        liked = Like.objects.get(user=current_user, deck_id=deck)
                        liked.last_accessed = timezone.now()
                        liked.save(update_fields=['last_accessed'])
                    except Like.DoesNotExist:
                        return JsonResponse({"error": "Liked deck cannot be found."}, status=404)

            # Convert everything to markdown content
            deck.deck_name = markdown2.markdown(deck.deck_name)

            cards = Card.objects.filter(deck_id=deck).order_by('id')
            for card in cards:
                card.card_header = markdown2.markdown(card.card_header)
                card.card_content = markdown2.markdown(card.card_content)

            return render(request, "flash/notes.html",{
                "deck": deck,
                "cards": cards
            })
        
        # If the user wants to edit the deck in notes format
        if action == "edit":

            # Check that user is the owner of the deck
            if deck.owner_id != current_user:
                return JsonResponse({"error": "Access not allowed, Deck is not public."}, status=404)

            return render(request, "flash/edit.html", {
            "deck": deck 
            })

    # Edit deck (recreate cards)
    elif request.method == "POST":

        # Check that the current user is the owner of the deck
        current_user = User.objects.get(pk=request.user.id)
        try:
            deck = Deck.objects.get(pk=deckid)
        except Deck.DoesNotExist:
            return JsonResponse({"error": "Deck not found."}, status=404)

        if deck.owner_id != current_user:
            return JsonResponse({"error": "Only the owner of the deck can edit it."}, status=404)

        # Get the edited content from request.POST and update the database
        update_content = request.POST['textarea']
        if update_content is None:
            return JsonResponse({"error": "New content for deck update not found."}, status=404)

        # Split the string into substrings
        temp_list = re.split("#|\\\\", update_content)
        card_format = list(filter(None, temp_list))

        print(f"card_format:{card_format}")

        # Organise the substrings into different lists
        deck_name = []
        headers = []
        contents = []
        for i in range(len(card_format)):
            if i == 0:
                deck_name.append(card_format[i])
            elif i % 2 == 0:
                contents.append(card_format[i])
            else:
                headers.append(card_format[i])
        print(f"headers:{headers}")
        print(f"contents:{contents}")
        print(f"deck:{deck_name}")

        if len(headers) != len(contents):
            return JsonResponse({"error": "Number of Headers is not equal to the Number of Contents."}, status=404)
        if len(deck_name) != 1:   
            return JsonResponse({"error": "There should only be one deck name."}, status=404)

        # Delete pre-existing cards and create new cards
        Card.objects.filter(deck_id=deckid).delete()

        for i in range(len(headers)):
            Card.objects.create(deck_id=deck, card_header=headers[i], card_content=contents[i], owner_id=current_user)

        # Update notes_format in deck
        deck.notes_format = update_content
        deck.last_edited = timezone.now()
        deck.save(update_fields=['notes_format','last_edited'])

        return HttpResponseRedirect(reverse("notes", args=(deckid,"notes")))

    else:
        if request.user.is_authenticated():
            return HttpResponseRedirect(reverse('home'))
        else:
            return HttpResponseRedirect(reverse('index'))


def view_cards(request, deckid):
    # Retrieve deck to populate deck name on page
    try:
        deck = Deck.objects.get(pk=deckid)
    except Deck.DoesNotExist:
        return JsonResponse({"error": "Deck not found."}, status=404)

    # Make sure the deck is public if the user is not the owner
    try:
        current_user = User.objects.get(pk=request.user.id)
    except: 
        current_user = None
    
    if deck.public == False:
        if deck.owner_id != current_user:
            return JsonResponse({"error": "Access not allowed, Deck is not public."}, status=404)

    return render(request, "flash/cards.html",{
        "deck": deck
    })


def load_cards(request):
    # Get start and end points and deckid
    start = int(request.GET.get("start") or 0)
    end = int(request.GET.get("end") or (start + 9))
    deckid = int(request.GET.get("deckid"))
    if not deckid:
        return JsonResponse({"error": "No deck id in GET request."}, status=404)

    # Update last_accessed field if user is logged in
    if request.user.is_authenticated:
        current_user = User.objects.get(pk=request.user.id)

        # Query to retrieve the deck
        try:
            deck = Deck.objects.get(pk=deckid)
        except Deck.DoesNotExist:
            return JsonResponse({"error": "Deck not found."}, status=404)

        # If current user is the owner of the deck, update deck object
        if deck.owner_id == current_user:
            deck.last_accessed = timezone.now()
            deck.save(update_fields=['last_accessed'])
        # If current user is not the owner of the deck, update like object
        else:
            try:
                liked = Like.objects.get(user=current_user, deck_id=deck)
                liked.last_accessed = timezone.now()
                liked.save(update_fields=['last_accessed'])
            except Like.DoesNotExist:
                return JsonResponse({"error": "Liked deck cannot be found."}, status=404)
    
    # Get set of cards from database
    all_cards = Card.objects.filter(deck_id=deckid).order_by('id')
    cards_set = all_cards[start:end]

    # Check status of each card if user is logged in
    if request.user.is_authenticated:
        status_set = []

        for card in cards_set:
            try:
                card_status = Status.objects.get(card_id=card)
                status_set.append(card_status.status)
            except Status.DoesNotExist:
                status_set.append("grey")

    # Convert cards to markdown
    cards_set = list(cards_set.values())

    for card in cards_set:
        card['card_header'] = markdown2.markdown(card['card_header'])
        card['card_content'] = markdown2.markdown(card['card_content'])

    # Zip status list with cards if user is logged in
    if request.user.is_authenticated:
        # Wrap in list() because QuerySet is not JSON serialisable
        cards_zipped = list(zip(cards_set, status_set))

        return JsonResponse({
            "cards_zipped": cards_zipped,
            "current_user": True
        })
    
    else: 
        return JsonResponse({
            "cards_zipped": cards_set,
            "current_user": None
        })


@login_required
def change_status(request):
    # Get and check data
    cardid = int(request.GET.get("cardid"))
    if not cardid:
        return JsonResponse({"error": "No card id in GET request."}, status=404)

    colour = request.GET.get("colour")
    if not colour:
        return JsonResponse({"error": "No colour in GET request."}, status=404)

    current_user = User.objects.get(pk=request.user.id)

    # Get card to update
    try:
        update_card = Card.objects.get(pk=cardid)
    except Card.DoesNotExist:
        return JsonResponse({"error": "Card not found."}, status=404)

    # Update status of card
    try: 
        card_status = Status.objects.get(card_id=update_card, user=current_user)
        card_status.status = colour
        card_status.save(update_fields=['status'])
        return JsonResponse({"message": "Successfully changed status."}, status=404)
    except Status.DoesNotExist:
        Status.objects.create(card_id=update_card, user=current_user, status=colour)
        return JsonResponse({"message": "Successfully made status."}, status=404)
    

@csrf_exempt
def public(request):
    if request.method == "GET":
        decks = Deck.objects.filter(public=True).order_by('-last_edited')

        # If user is logged in, check if the user is following each deck
        if request.user.is_authenticated:
            current_user = User.objects.get(pk=request.user.id)
            like_check = [] 
            for i in range(len(decks)):
                try: 
                    like_check.append(Like.objects.get(user=current_user, deck_id=decks[i]))
                except Like.DoesNotExist:
                    like_check.append(None)

            zipped = zip(list(decks), like_check)

            return render(request, "flash/public.html",{
                "zipped": zipped
            })

        else:
            return render(request, "flash/public.html",{
                "zipped": decks
            })

    elif request.method == "PUT":
        # Load PUT data and check that the data is not None
        data = json.loads(request.body)

        if data.get("deckid") is None:
            return JsonResponse({"error": "Deck ID is None."}, status=404)
        deck_id = data["deckid"]
        
        if data.get("action") is None:
            return JsonResponse({"error": "No action specified."}, status=404)
        action = data["action"]

        # Query for the requested deck
        try:
            deck = Deck.objects.get(pk=deck_id)
        except Deck.DoesNotExist:
            return JsonResponse({"error": "Deck not found."}, status=404)

        current_user = User.objects.get(pk=request.user.id)

        if action == "Like":
            Like.objects.create(user=current_user, deck_id=deck)   
            return JsonResponse({"message": "Successfully liked deck."}, status=201)
        
        elif action == "Unlike":
            Like.objects.get(user=current_user,deck_id=deck).delete()
            return JsonResponse({"message": "Successfully unliked deck."}, status=201)
    
    else:
        if request.user.is_authenticated:
            return HttpResponseRedirect(reverse('home'))
        else:
            return HttpResponseRedirect(reverse('index'))


def search(request):
    if request.method == "POST":
        search = request.POST['search']
        if not search:
            return JsonResponse({"message": "No search criteria."}, status=201)
        results = Deck.objects.filter(notes_format__icontains=search, public=True).order_by('deck_name')
        
        if request.user.is_authenticated:
            current_user = User.objects.get(pk=request.user.id)
            # Check if the user is following each deck
            like_check = []
            for i in range(len(results)):
                try: 
                    like_check.append(Like.objects.get(user=current_user, deck_id=results[i]))
                except Like.DoesNotExist:
                    like_check.append(None)

            zipped = zip(list(results), like_check)

            return render(request, "flash/search.html",{
                "zipped": zipped
            })

        else:
            return render(request, "flash/search.html",{
                "zipped": results
            })