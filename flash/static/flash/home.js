document.addEventListener('DOMContentLoaded', listen)

function listen() {
    // Add Event Listener to each Delete button
    var delete_buttons = document.querySelectorAll('.delete-button')
    console.log(delete_buttons)
    delete_buttons.forEach(delete_button => {
        delete_button.addEventListener('click', () => delete_deck(delete_button.dataset.deckid))
    })

    // Add Event Listener to each Public button
    var public_buttons = document.querySelectorAll('.public-button')
    console.log(public_buttons)
    public_buttons.forEach(public_button => {
        public_button.addEventListener('click', () => public_or_private(public_button))
    })

    // Add Event Listener to each Private button
    var private_buttons = document.querySelectorAll('.private-button')
    console.log(private_buttons)
    private_buttons.forEach(private_button => {
        private_button.addEventListener('click', () => public_or_private(private_button))
    })

    // Add Event Listener to each Unlike button
    var unlike_buttons = document.querySelectorAll('.unlike-button')
    console.log(unlike_buttons)
    unlike_buttons.forEach(unlike_button => {
        unlike_button.addEventListener('click', () => unlike_deck(unlike_button))
    })
}

function delete_deck(deckid) {
    console.log(deckid)

    // Hide the deleted deck (table row)
    deck_row = document.querySelector(`#deck_row_${deckid}`)
    console.log(deck_row)
    deck_row.style.display = 'none'

    // Send fetch request to delete specified deck
    fetch('/home', {
        method: 'PUT',
        body: JSON.stringify({
            deckid: deckid,
            action: "Delete"
        })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result)
    })
}

function public_or_private(button) {

    var action = button.innerHTML
    var deckid = button.dataset.deckid

    // Send fetch request to delete specified deck
    fetch('/home', {
        method: 'PUT',
        body: JSON.stringify({
            deckid: deckid,
            action: action
        })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result)

        if (action === 'Make Public') {
            button.innerHTML = 'Make Private'
            button.setAttribute("class", "private-button btn btn-outline-dark")
        }
        if (action === 'Make Private') {
            button.innerHTML = 'Make Public'
            button.setAttribute("class", "public-button btn btn-outline-dark")
        }
    })  
}

function unlike_deck(button) {

    var deckid = button.dataset.deckid

    // Send fetch request to unlike specified deck
    fetch('/public', {
        method: 'PUT',
        body: JSON.stringify({
            deckid: deckid,
            action: "Unlike"
        })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result)

        // Hide the deck row
        document.querySelector(`#deck_row_${deckid}`).style.display = 'none'
    })  
}