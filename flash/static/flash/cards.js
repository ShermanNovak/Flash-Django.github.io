// Vertical scroll referenced from CS50w Lecture 6

// Start with the 0th card
let counter = 0

// load 10 cards each time
const quantity = 10

document.addEventListener('DOMContentLoaded', () => {
    // Load the cards in the '#cards' div based on the deck name on the page
    load(document.querySelector("#deck_name").dataset.deckid)

    // Add the sketchpad function
    add_sketchpad()
})

// If scrolled to the bottom of the window, load the next 10 cards
window.onscroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        load()
    }
}

function load(deckid) {

    // Get start and end points, and update counter
    const start = counter
    const end = start + quantity - 1
    counter = end + 1

    console.log(start)   
    console.log(end)  
    console.log(counter)  

    // Get new set of cards and add the cards to the page
    fetch(`/load_cards?deckid=${deckid}&start=${start}&end=${end}`)
    .then(response => response.json())
    .then(data => {
        console.log(data)
        data.cards_zipped.forEach(each_card => {
            add_card(each_card, data.current_user)
        })

        // Add the card_flipper function
        card_flipper()

        if (data.current_user != null) {
            // Filter which cards are shown based on status
            filter_cards()
            
            // Make spans change status when status box is checked
            load_status()
        }
    })
}

// Each card will have a div
// The markdown content for the header and contents will each have its own div
function add_card(card_data, current_user) {
    console.log(card_data)

    var each_card = document.createElement('div')
    each_card.className = 'each_card'
    each_card.id = `each_card_${card_data['id']}`

    var card_text = document.createElement('div')
    card_text.style.borderRadius = '2px'
    card_text.className = 'card_text'
    card_text.id = `card_text_${card_data['id']}`

    var header = document.createElement('div')
    header.className = 'header'
    header.innerHTML = card_data['card_header']

    var content = document.createElement('div')
    content.className = 'content'
    content.style.display = 'none'
    content.innerHTML = card_data['card_content']

    const line = document.createElement('hr')

    // If the user is logged in, the card_data will be zipped
    if (current_user != null) {
        each_card.id = `each_card_${card_data[0]['id']}`
        card_text.id = `card_text_${card_data[0]['id']}`
        content.innerHTML = card_data[0]['card_content']
        header.innerHTML = card_data[0]['card_header']

        // Set classname of each_card as each_card colour
        if (card_data[1] === "green") {
            each_card.className = "each_card green"
        } else if (card_data[1] === "yellow") {
            each_card.className = "each_card yellow"
        } else if (card_data[1] === "red") {
            each_card.className = "each_card red"
        } else {
            each_card.className = "each_card grey"
        }

        // If status checkbox is ticked, show the borders of the cards
        document.querySelector("#status_checkbox").addEventListener('change', function() {
            if (status_checkbox.checked) {
                if (card_data[1] === "green") {
                    card_text.style.border = "solid green"
                } else if (card_data[1] === "yellow") {
                    card_text.style.border = "solid yellow"
                } else if (card_data[1] === "red") {
                    card_text.style.border = "solid red"
                } else {
                    card_text.style.border = "solid grey"
                }
            } 
            else {
                card_text.style.border = ""
            }
        })

        var status_buttons = document.createElement('div')
        status_buttons.className = 'status_buttons'

        var green_status = document.createElement('span')
        green_status.style.borderRadius = '50%'
        green_status.style.height = '15px'
        green_status.style.width = '15px'
        green_status.className = 'green_status'
        green_status.style.backgroundColor = 'green'
        green_status.style.display = 'none'
        green_status.dataset.cardid = card_data[0]['id']

        var yellow_status = document.createElement('span')
        yellow_status.style.borderRadius = '50%'
        yellow_status.style.height = '15px'
        yellow_status.style.width = '15px'
        yellow_status.className = 'yellow_status'
        yellow_status.style.backgroundColor = 'yellow'
        yellow_status.style.display = 'none'
        yellow_status.dataset.cardid = card_data[0]['id']

        var red_status = document.createElement('span')
        red_status.style.borderRadius = '50%'
        red_status.style.height = '15px'
        red_status.style.width = '15px'
        red_status.className = 'red_status'
        red_status.style.backgroundColor = 'red'
        red_status.style.display = 'none'
        red_status.dataset.cardid = card_data[0]['id']
        
        var grey_status = document.createElement('span')
        grey_status.style.borderRadius = '50%'
        grey_status.style.height = '15px'
        grey_status.style.width = '15px'
        grey_status.className = 'grey_status'
        grey_status.style.backgroundColor = 'grey'
        grey_status.style.display = 'none'
        grey_status.dataset.cardid = card_data[0]['id']
    }

    document.querySelector('#cards').append(each_card)
    each_card.append(card_text)
    card_text.append(header)
    card_text.append(content)

    // If the user is not logged in, there will not be status options
    if (current_user != null) {
        each_card.append(status_buttons)
        status_buttons.append(green_status)
        status_buttons.append(yellow_status)
        status_buttons.append(red_status)
        status_buttons.append(grey_status)
    }
    each_card.append(line)
}

// When each card is clicked, the display will switch between the header and the content
function card_flipper() {
    var card_texts = document.querySelectorAll('.card_text')
    console.log(card_texts)
    card_texts.forEach(card_text => {
        card_text.addEventListener('click', function() {
            card_header = card_text.getElementsByTagName('div')[0]
            card_content = card_text.getElementsByTagName('div')[1]
            if (card_content.style.display === 'none') {
                card_content.style.display = 'block'
                card_header.style.display = 'none'
            }
            else if (card_header.style.display === 'none') {
                card_header.style.display = 'block'
                card_content.style.display = 'none'
            }   
        })
    })
}

function add_sketchpad() {
    add_button = document.querySelector('#add_sketchpad')
    add_button.addEventListener('click', function() {

        // Hide irrelevant elements from view
        add_button.style.display = 'none'

        // Create and append canvas
        sketch_div = document.querySelector('#sketchpad')
        canvas = document.createElement('canvas')
        canvas.id = "canvas"
        canvas.height = window.innerHeight

        pen = document.createElement('button')
        pen.innerHTML = 'Pen'
        pen.className ="btn btn-outline-dark"
        pen.id = 'pentool'

        eraser = document.createElement('button')
        eraser.innerHTML = 'Eraser'
        eraser.className = "btn btn-outline-dark"
        eraser.id = 'erasertool'

        clear = document.createElement('button')
        clear.innerHTML = 'Clear'
        clear.className = "btn btn-outline-dark"
        clear.id = 'cleartool'

        sketch_div.append(document.createElement('br'))
        sketch_div.append(pen)
        sketch_div.append(eraser)
        sketch_div.append(clear)
        sketch_div.append(canvas)

        drawfunction()
    })
}

// References:
// https://www.youtube.com/watch?v=3GqUM4mEYKA
// https://github.com/nidhinp/paint-app-in-django

function drawfunction() {
    canvas = document.querySelector('#canvas')
    if (!canvas.getContext) {
        return
    }
    ctx = canvas.getContext("2d")

    // Get coordinates of canvas to offset coordinates
    canvas_coord = canvas.getBoundingClientRect()

    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle='black'

    let erasing = false
    document.querySelector('#pentool').addEventListener('click', function () {
        erasing = false
    })
    document.querySelector('#erasertool').addEventListener('click', function () {
        erasing = true
    })
    document.querySelector('#cleartool').addEventListener('click', function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    })

    let painting = false
    function startPosition(e){
        points = []
        points.push({x: e.clientX - canvas_coord.left, y: e.clientY - canvas_coord.top});
        painting = true
        console.log(painting)
        ink(e)
    }
    function endPosition() {
        painting = false
        console.log(painting)
        ctx.beginPath()
    }

    function ink(e) {
        points.push({x: e.clientX - canvas_coord.left, y: e.clientY - canvas_coord.top});
        console.log(points)

        if (painting === true) {
            if (erasing === true) {
                for (var i=0; i<points.length; i++) {
                    ctx.clearRect(points[i].x, points[i].y, 5, 5)
                    console.log('erase')
                }
            }
            else {
                for (var i=0; i<points.length; i++) {
                    ctx.beginPath()
                    ctx.moveTo(points[i].x, points[i].y)
                    ctx.lineTo(points[i+1].x, points[i+1].y)
                    ctx.stroke()
                    console.log('paint')
                }
            }
        }
    }

    canvas.addEventListener('mousedown', startPosition)
    canvas.addEventListener('mousemove', ink)
    canvas.addEventListener('mouseup', endPosition)
}

function load_status() {
    var status_checkbox = document.querySelector("#status_checkbox");

    // Query for all the status spans
    var green_status = document.querySelectorAll('.green_status')
    var yellow_status = document.querySelectorAll('.yellow_status')
    var red_status = document.querySelectorAll('.red_status')
    var grey_status = document.querySelectorAll('.grey_status')

    // Clicking the spans will change the status of the card
    green_status.forEach(green_span => {
        green_span.addEventListener('click', () => change_status("green", green_span.dataset.cardid))
    })
    yellow_status.forEach(yellow_span => {
        yellow_span.addEventListener('click', () => change_status("yellow", yellow_span.dataset.cardid))
    })
    red_status.forEach(red_span => {
        red_span.addEventListener('click', () => change_status("red", red_span.dataset.cardid))
    })
    grey_status.forEach(grey_span => {
        grey_span.addEventListener('click', () => change_status("grey", grey_span.dataset.cardid))
    })

    // When the status checkbox is ticked, add status spans
    status_checkbox.addEventListener('change', function() {
        if (status_checkbox.checked) {
            green_status.forEach(green_span => {
                green_span.style.display = 'inline-block'
            })
            yellow_status.forEach(yellow_span => {
                yellow_span.style.display = 'inline-block'
            })
            red_status.forEach(red_span => {
                red_span.style.display = 'inline-block'
            })
            grey_status.forEach(grey_span => {
                grey_span.style.display = 'inline-block'
            })
        } 
        else {
            green_status.forEach(green_span => {
                green_span.style.display = 'none'
            })
            yellow_status.forEach(yellow_span => {
                yellow_span.style.display = 'none'
            })
            red_status.forEach(red_span => {
                red_span.style.display = 'none'
            })
            grey_status.forEach(grey_span => {
                grey_span.style.display = 'none'
            })
        }
    })
}

function change_status(colour, cardid) {
    // Change border colour and class of card_text 
    card_text = document.querySelector(`#card_text_${cardid}`)
    card_text.style.border = `solid ${colour}`
    each_card = document.querySelector(`#each_card_${cardid}`)
    each_card.className = `each_card ${colour}`

    // Update database
    fetch(`/change_status?cardid=${cardid}&colour=${colour}`)
    .then(response => response.json())
    .then(data => {
        console.log(data)
    })

}

// Filtering the cards according to their status
function filter_cards () {
    var select_filter = document.querySelector('#filter')
    var card_div = document.querySelectorAll('.each_card')

    select_filter.addEventListener('change', function() {
        console.log(select_filter.value)

        if (select_filter.value === 'green') {
            // Hide every card first
            card_div.forEach(each_card => {
                each_card.style.display = 'none'
            })

            // Set green cards to view
            var green_cards = document.querySelectorAll('.green')
            console.log(green_cards)
            green_cards.forEach(green_card => {
                green_card.style.display = 'block'
            })
        }
        else if (select_filter.value === 'yellow') {
            card_div.forEach(each_card => {
                each_card.style.display = 'none'
            })

            var yellow_cards = document.querySelectorAll('.yellow')
            console.log(yellow_cards)
            yellow_cards.forEach(yellow_card => {
                yellow_card.style.display = 'block'
            })
        }
        else if (select_filter.value === 'red') {
            card_div.forEach(each_card => {
                each_card.style.display = 'none'
            })

            var red_cards = document.querySelectorAll('.red')
            console.log(red_cards)
            red_cards.forEach(red_card => {
                red_card.style.display = 'block'
            })
        }
        else if (select_filter.value === 'grey') {
            card_div.forEach(each_card => {
                each_card.style.display = 'none'
            })

            var grey_cards = document.querySelectorAll('.grey')
            console.log(grey_cards)
            grey_cards.forEach(grey_card => {
                grey_card.style.display = 'block'
            })
        }
        else {
            card_div.forEach(each_card => {
                each_card.style.display = 'block'
            })
        }
    })
}