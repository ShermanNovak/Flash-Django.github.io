document.addEventListener('DOMContentLoaded', listen)

function listen() {
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

    // Add Event Listener to each Like button
    var like_buttons = document.querySelectorAll('.like-button')
    console.log(like_buttons)
    like_buttons.forEach(like_button => {
        like_button.addEventListener('click', () => like_or_unlike(like_button))
    })

    // Add Event Listener to each Unlike button
    var unlike_buttons = document.querySelectorAll('.unlike-button')
    console.log(unlike_buttons)
    unlike_buttons.forEach(unlike_button => {
        unlike_button.addEventListener('click', () => like_or_unlike(unlike_button))
    })
}

function public_or_private(button) {

    var deckid = button.dataset.deckid

    // Send fetch request to delete specified deck
    fetch('/home', {
        method: 'PUT',
        body: JSON.stringify({
            deckid: deckid,
            action: "Make Private"
        })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result)

        document.querySelector(`#deck_row_${deckid}`).style.display = 'none'
    })  
}

function like_or_unlike(button) {

    var action = button.innerHTML
    var deckid = button.dataset.deckid

    // Send fetch request to delete specified deck
    fetch('/public', {
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

        if (action === 'Like') {
            button.innerHTML = 'Unlike'
            button.setAttribute("class", "unlike-button btn btn-outline-dark")
        }
        if (action === 'Unlike') {
            button.innerHTML = 'Like'
            button.setAttribute("class", "like-button btn btn-outline-dark")
        }
    })  
}