# Flash

## What is Flash?

Flash is a flashcard web application designed to support markdown content.
Users can create flashcards for each deck in one shot without having to create each card individually.

## Why Flash?

In CS50w's capstone project, I decided to make an even better version of the flashcard web application I made for CS50x's final project.
I was able to implement many new features, which I was not able to in CS50x.

I was able to come up a vision for Flash using my own experience as a student.
Personally, I am studying Japanese, and I really wanted a flashcard app that could support my learning.
I found the spaced repetition function in normal flashcard apps unnecessary as I did not like how users had to select a timeframe for each card. Thus, I made this optional in my web application.
I also added an optional canvas when users view the flashcards so that users can test themselves. For me, this would allow me to test myself on kanji writing.
Therefore, I hope to launch this on Gitpages so that I can use this for my own purposes.

## Index (index.html)

The Index Page explains the special characteristics of Flash to users to encourage them to sign up.

## Public (public,html, public.js, search.html)

The Public Page is accessible to all users that visit the website, even those that do not have an account.
Users can access each deck in either the notes and cards format.
The decks are ordered according to the time in which they were last created or edited.

If Users are logged in, they can like or unlike decks other users have created. 
For their own decks on the public page, they can access the same functions found in their home page.

The Public Page has a search function that allows users to filter decks depending on whether the deck name or flashcards in the deck contain the search phrase.
The Search results return a table of decks in alphabetical order.

## Home (home.html, home.js)

The Home Page is separated into two tables: My Decks and Liked Decks.
The decks are all sorted according to alphabetical order.

My Decks contains all the decks the user has created, with Javascript functions allowing Editing and Deleting of decks, with the option to make the Deck private or Public. 

Liked Decks is a "watchlist" of sorts that contains public decks shared by other users that the user has liked. Users can unlike decks from the Home Page.

Accessing the Notes or Cards pages of any decks on this page updates the time the user has last accessed the deck, so the user can see when they last studied it.

## Create (create.html, createoredit.js)

The Create Page allows users to create decks using a single textarea.
The textarea changes its height according to the length of the input.

A specific format has to be used, where the deck name is the first line, deck headers (the front of the card) starts with a #, and deck content (the back of the card) starts with a backflash.

Instructions have been provided on the page for easy reference, along with a link to a website that explains markdown syntax in detail.

Markdown syntax is supported, which allows users to customise the formatting in their cards and add anything from bullet points to images.

The cards were created using split string and iteration.

## Notes (notes.html)

The Notes Page displays what the user typed in "Create", but in markdown format.

This allows the user to view everything in their deck at once for a bird's eye view, especially if they don't want to have to flip through the cards.

## Cards (cards.html, cards.js)

The Cards Page displays the cards in the relevant deck vertically.
To flip each card, the user can just click on the card.

There is a Status checkbox that when ticked, displays circle spans of different colours. 
Users can click each span to change the status of the card to that colour.
The status of the card is shown to the user through the colour of the border of the card.

There is a Add Sketchpad button that when clicked, adds a canvas and buttons that allow the user to toggle between Pen and Eraser, and clear the entire canvas.

## Edit (edit.html, createoredit.js)

The Edit Page has a textarea similar to the Create page that is already pre-filled with what the user submitted before.

Editing the deck will delete and recreate all the cards. I chose to do this as the user might have altered the order of the cards, or added or removed cards.

## Distinctiveness and Complexity

I believe that my project satisfies these requirements as it's purpose is significantly different from the other projects in this course. Even compared to other flashcard web applications that already exist, the incorporation of Markdown syntax makes my project distinct from others.

It is more complex as there are many Javascript functions, especially with regards to the Cards page. I had to learn how to use Javascript to code the canvas drawing functions, which was definitely not covered in previous projects.

## Potential

I definitely hope to improve this application in future, with more customisable options.
I think it would be a good idea to allow users to customise the colours of the user interface so that they would enjoy using the website more.
It would also be nice if users could group similar decks together so that it would be easier for them to access different decks, especially if they have numerous decks.
Although I did not implement automated spaced repetition (because I personally don't find it useful), I might do so in future.