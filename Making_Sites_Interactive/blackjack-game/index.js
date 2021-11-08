function range(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => (start + idx));
}

function strRange(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => (start + idx).toString());
}

let message_status = document.querySelector("#message-status");
let message_dealer = document.querySelector("#message-dealer");
let message_hand   = document.querySelector("#message-hand");
let hand_button    = document.querySelector("#hand-button");
let hold_button    = document.querySelector("#hold-button");

let player_hand_container = document.querySelector("#player-hand-container");
let dealer_hand_container = document.querySelector("#dealer-hand-container");

const playerCards  = [];
const dealerCards  = [];
const cardNums     = ["ace"].concat(strRange(2, 10).concat(["jack", "queen", "king"]))
const cardValues   = [11].concat(range(2, 10).concat([10, 10, 10]))
const cardTypes    = ["clubs", "diamonds", "hearts", "spades"]
const card_items   = (cards, key) => cards.map((obj) => { return obj[key] });
const sum          = (cards) => { return cards.reduce((a, b) => a + b, 0) };
const hasBlackJack = (cards) => { return sum(cards) === 21 };
const isAlive      = (cards) => { return sum(cards) <= 21 };
const isGreater    = () => { return sum(card_items(playerCards, "card_value")) > sum(card_items(dealerCards, "card_value")) };
const cardImgPath  = (num, type) => { return `static/img/playing_cards/PNG-cards-1.3/${num}_of_${type}.png` };

function clearHands() {    
    playerCards.length = 0;
    dealerCards.length = 0;

    player_hand_container.innerHTML = "";
    dealer_hand_container.innerHTML = "";
}

function reset() {
    hand_button.textContent = "Deal Me"
    hold_button.disabled = true;
}

function getRandomIntRange(min=2, max=12) {
    return Math.floor(Math.random() * (max - min) + min);
}

function verifyUniqueCard(new_card_num, new_card_type) {
    let unique = true;
    let card_nums  = card_items(playerCards, "card_num").concat(card_items(dealerCards, "card_num"))
    let card_types = card_items(playerCards, "card_type").concat(card_items(dealerCards, "card_type"))

    for (var i = 0; i < card_nums.length; i++) {
        if (new_card_num === card_nums[i] && new_card_type === card_types[i]) {
            unique = false;
            return unique;
        }
    }

    return unique;
}

function addCard(cards) {
    let num  = getRandomIntRange();
    let type = getRandomIntRange(0, 4);

    while (!verifyUniqueCard(num, type)) {
        num  = getRandomIntRange();
        type = getRandomIntRange(0, 4);
    }
    
    let cardValue = cardValues[num-1];
    let cardStr   = cardNums[num - 1];
    let typeStr   = cardTypes[type];

    cards.push({
        card_num: num,
        card_value: cardValue, 
        card_type: type,
        card_num_str: cardStr,
        card_type_str: typeStr
    });
}

function printCard(card, card_div, player_str) {
    let cardStr = card.card_num_str;
    let typeStr = card.card_type_str;

    card_div.innerHTML += `<img src="${cardImgPath(cardStr, typeStr)}" class="hand-card" alt="${player_str} ${cardStr} of ${typeStr} card"/>`;
}

function deal() {
    if (hand_button.textContent === "Deal Me") { clearHands() }

    addCard(playerCards)
    printCard(playerCards[playerCards.length-1], player_hand_container, "Your");

    if (playerCards.length === 1) {
        addCard(playerCards);

        addCard(dealerCards);
        addCard(dealerCards);
        
        printCard(playerCards[playerCards.length-1], player_hand_container, "Your");
        printCard(dealerCards[0], dealer_hand_container, "Dealer's");
    }

    message_dealer.textContent = `Dealer's first card is ${dealerCards[0].card_num}.`;

    assessHand()
}

function assessHand() {
    let message = "";
    let player_card_values = card_items(playerCards, "card_value")

    message_hand.textContent = `Your cards are ${player_card_values.join(", ")} (sum of ${sum(player_card_values)}).`;

    if (hasBlackJack(player_card_values)) {
        message = "Woohoo! You've got Blackjack!";
        reset();
    } else if (isAlive(player_card_values)) {
        hand_button.textContent = "Hit Me!"
        hold_button.disabled = false;
        message = "Do you want to draw a new card?";
    } else {
        message = "You're out of the game...";
        reset();
    }

    message_status.textContent = message;
}

function hold() {
    let dealer_card_values = card_items(dealerCards, "card_value")

    printCard(dealerCards[1], dealer_hand_container, "Dealer's");

    if (isGreater() || !isAlive(dealer_card_values)) {
        message = "Woohoo! You've beat the dealer!";
    } else {
        message = "Sorry, the dealer wins!";
    }

    message_dealer.textContent = `The dealers cards are ${dealer_card_values.join(", ")} (sum of ${sum(dealer_card_values)}).`;
    message_status.textContent = message;

    reset();
}

clearHands();
reset();

