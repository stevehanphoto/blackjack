/********************************************************************************
CNIT 133 FINAL PROJECT
BLACKJACK GAME
STEVE HAN

Simple blackjack game with no splitting, currently no bank roll and doubling.
New deck or reshuffling of the cards every time a hand is played.

NOTES: 
- Const was introduced in ES2015 and is a variable that can't be re-assigned.

HISTORY:
4/25/19 Started coding
5/10/19 Updated documentation (comments)

KNOWN ISSUE:
The card flipping is tested on Chrome and Microsoft Edge, but doesn't work on 
Firefox.  The front face should be hidden and after flipping the the back face of 
the card should be hidden.  On Firefox both the back and front face appears.

TO DOS:
1. Change alert box announcing the winner to appear in the middle of the screen.
2. Add sound effects such as card flipping over and speaker icon UI to mute sound. 
3. Find a better solution to the problem of having to wait before checking for 
winner after flipping the card over.  (See comments at hit() and dealerTurn()).
One way may be to updateScore before the card is flipped over but not display it on 
the screen and perhaps using a custom event that gets trigger the updating.  Another
solution may be to use a promise, which was available with ES6.

Additional features
1. Add a bank for the player.  Player would use chips to place bets before the
hands are dealt.

/********************************************************************************

/* The "use strict" directive was new in ECMAScript version 5.  In "strict mode"
   the browser will flag undeclared variables as an error. */
"use strict"

/********************************************************************************/
/* GLOBAL VARIABLES */

/* An array of the 52 cards in the deck with 1 to 2 characters (2 for an it's 10) 
   for the rank followed by 1 character for the suite.  The following are the 
   letters and it's corresponding rank or suite.
   A = Ace
   J = Jack
   Q = Queen
   K = King
   C = Club
   D = Diamond
   S = Spades
   H = Heart
*/
const cards = [
    "AC", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "10C", "JC", "QC", "KC",
    "AD", "2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "10D", "JD", "QD", "KD",
    "AS", "2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "10S", "JS", "QS", "KS",
    "AH", "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "10H", "JH", "QH", "KH"
];

/* A boolean array corresponding to each of the 52 cards in the deck and is used to
   determine each if card has been used.  It is initialize to false with the 
   array.fill() method since none of the cards has been used at the start. */
var usedCards = new Array(52).fill(false);

// Folder the images are located on the disk
const imagePath = "images/";

// Number of player cards dealt
var numPlayerCards = 0;
var numDealerCards = 0;

// Player and dealer scores for the current hand
var playerScore = 0;
var dealerScore = 0;

// Indicates whether player has decided to stand.  If so, it is now the dealer's turn.
var isPlayerStanding = false;

// This variables will be set to the corresponding buttons on the HTML page
var hitButton;
var dealButton;
var standButton;

/********************************************************************************/

window.addEventListener("load", initAll, false);

function initAll() {
    initButtons();
}

/* This function prepares the table to deal a new hand. */
function resetTable()
{
    // List of all the cards in the player's and dealer's hand to be removed
    var cardsToRemove;

    // Total number of cards to remove
    var numCardsToRemove;

    // The player is no longer on stand mode
    isPlayerStanding = false;

    // The number of player and dealer cards are reset back to 0
    numPlayerCards = 0;
    numDealerCards = 0;

    // The player and dealer scores for the hand are reset back to 0
    playerScore = 0;
    dealerScore = 0;
    
    // The buttons are set to show only the Deal button.
    hitButton.style.visibility = "hidden";
    dealButton.style.visibility = "visible";
    standButton.style.visibility = "hidden";

    /* Currently usedCards is cleared every time a winner or player wins, which is 
       equlivalent to a new deck or reshuffling.  Realistically dealers doesn't 
       reshuffle every time, but there is no rule for when. */
    usedCards = new Array(52).fill(false);

    /* Get an array of all the cards on the table by searching for all elements with
       the class of card-container, which is a container for each card on the table */ 
    cardsToRemove = document.getElementsByClassName('card-container');

    // Get the number of cards to remove with the length of the cardsToRemove array 
    numCardsToRemove = cardsToRemove.length;

    /* Loop through each item in the cardsToRemove array and have it remove itself
       from it's parent and thus the card is removed from the HTML page */
    for (var i = 0; i < numCardsToRemove; i++)
        cardsToRemove[0].parentNode.removeChild(cardsToRemove[0]);
}

/* This function initializes the buttons and sets up its corresponding event
   handler functions */
function initButtons() {
    hitButton = document.getElementById("hit-button");
    dealButton = document.getElementById("deal-button");
    standButton = document.getElementById("stand-button");

    hitButton.addEventListener("click", hit, false);
    dealButton.addEventListener("click", deal, false);
    standButton.addEventListener("click", stand, false);
}

/* This function is called when the player clicks on the hit button to recieve a 
   new card.  The function 1st checks if the player has already decided to stand.  
   If so, it  is the dealer's turn and an alert message put up to inform the player.  
   If not, a new player card is created and flipped over.  Then checkWin() is called
   after a delay of 2 milliseconds.  The reason for the delay is currently takes 1 
   ms to flip the card over and update the score.  At this point, because the dealer 
   hasn't show his card yet, checkWin() would  return true if the player has gone over 
   21 and has lost and the hand is finished, so resetTable() is called. */
function hit() {
    var thisPlayerCard;

    if (isPlayerStanding == true)
        alert('Standing')
    else
    {
        createCard('player');
        thisPlayerCard = 'player-card-' + (numPlayerCards).toString();
        flipCard(thisPlayerCard);
        setTimeout(function() {
            if (checkWin() == true)
                resetTable();
        }, 2000)
    }
}

/* Dealer shows hand once player stands and the last card dealt to the dealer
   is flipped over.  Then dealerTurn is called. */
function stand() 
{
    var thisDealerCard = 'dealer-card-' + (numDealerCards).toString();
    isPlayerStanding = true;
    flipCard(thisDealerCard);
    dealerTurn(thisDealerCard);
}

/* This function is called when the player has decided to stand.  The function 
   calls the checkWin() function to checks if there's a winner.  If so, it 
   creates a dealer card and flips the card over and calls itself after 2 ms.
   The reason for the 2 ms delay is to account for the card flipping which 
   takes 1 ms.  There's probably a better, more full proof way to do
   it, but this is my current implementation.
*/
function dealerTurn(thisDealerCard)
{
    setTimeout(function() {
        if (checkWin() == false) {
            createCard('dealer')
            thisDealerCard = 'dealer-card-' + (numDealerCards).toString();        
            flipCard(thisDealerCard);    
            dealerTurn(thisDealerCard)
        } 
        else {      
            resetTable();
        }
    }, 2000);
}

/* This function checks for and announces the winner or if it's a push.  It 
   returns a true to calling function to let it know that this hand is finished.  
   If neither a winner is found or there's a tie a false is returned. */
function checkWin(){

   /* 1st checks if the player's score is over 21. If so the dealer has won and a 
      true is returned. */ 
    if (playerScore > 21) 
    {
        alert("Bust!  Dealer wins!");
        return true;
    }
    /* Next it checks if the dealer score is over  21.  If so, the player has won 
       and a true is returned. */  
    else if (dealerScore > 21) 
    {
        alert("Bust!  You win!");
        return true;
    }
    /* Next it checks if the dealer's score is greater than the player's.  If so the 
       dealer has won and a true is returned. */
    else if (dealerScore > playerScore)
    {
        alert("Dealer wins!");
        return true;
    }
    /* Next check if the scores are equal and it's equal or greater than 18, a true is
       return.  I set the value at 18 on whether the dealer should continue to hit, but 
       this can be changed. */
    else if ((dealerScore == playerScore) && dealerScore >= 18)
    {
        alert("It's a push!");
        return true;
    }
    /* Lastly return a false if we must continue.
    */
    return false;
}

/* Deal a new hand of 2 cards to the player and 2 cards to the dealer.  Both cards 
   from the  player are flipped over to reveal the values, while only one of the 
   dealer's card is flipped over. */
function deal() {
    isPlayerStanding = false;
    createCard("player");
    createCard("player");
    createCard("dealer");
    createCard("dealer");

    flipCard('player-card-1');
    flipCard('player-card-2');
    flipCard('dealer-card-1');

    /* The deal button will be turned off and the Hit and Stand buttons set to 
       visible after a delay.  The reason for the delay is to wait for the cards 
       to be flipped over. */
    setTimeout(toggleButtons, 1100);
}

/* This function flips over the card by rotating it 180 degrees in the Y axis after 
   a delay of 1 ms.  The reason for the delay is to show the back side of the back.
   Then it updates the score.  It uses the string search() method to determine whether 
   to update the player or dealer score.  The search() method returns the position the 
   string is found and returns -1 if it's not found. */
function flipCard(thisCard)
{
    var isPlayer = thisCard.search('player');
    var isDealer = thisCard.search('dealer');
    setTimeout(function() 
    { 
        document.getElementById(thisCard).style.transform = "rotateY(180deg)";
        if (isPlayer > -1)
            updateScore('player');
        else if (isDealer > -1)
            updateScore('dealer');
        else
            console.log("Can't find card to flip in flipCard()");   // Should not happen
    }, 1000);
}

/* This function is called when deal button is click and sets the deal button to 
   hidden, while setting the hit and stand buttons to visible */
function toggleButtons()
{
    hitButton.style.visibility = "visible";
    dealButton.style.visibility = "hidden";
    standButton.style.visibility = "visible";
}

/* 
   This function creates new card.  Input parameter cardType tells the function
   whether it's a player or dealer card, which will determine where the new
   card will be on the HTML page.  Dealer cards are placed at the id dealer-area,
   and player cards are placed at location player-area.  The cards have both
   a front and a back side.  The below example shows the HTML structure for the 
   1st dealer card and 1st player card.

    <div id="dealer-area">
        <div id="dealer-card-container-1">
			<div id="dealer-card-1">
				<div class="back face" id="dealer-card-back-1">
					<img src="#"/>
				</div>
				<div class="front face" id="dealer-card-front-1">
					<img src="#"/>
				</div>
			</div>
        </div>        
    </div>
    <div id="player-area">
        <div id="player-card-container-1">
			<div id="player-card-1">
				<div class="back face center" id="player-card-back-1">
					<img src="#"/>
				</div>
				<div class="front face" id="player-card-front-1">
					<img src="#"/>
				</div>
			</div>
        </div>
    </div> */
function createCard(cardType)
{
    var area = document.getElementById(cardType + "-area");
    var containerElement = document.createElement("div");
    var cardElement = document.createElement("div");
    var cardBackFace = document.createElement("div");
    var cardFrontFace = document.createElement("div");
    var frontImage = document.createElement("img");
    var backImage = document.createElement("img");

    // A regular expression is used to determine the suite
    var re = /[CDSH]/;

    var newCard = getNewCard();    
    var suite = newCard.match(re);

    var numCards;

    numCards = getNumCards(cardType);
    containerElement.className = "card-container";
    containerElement.id = cardType + "card-container-" + numCards;
    cardElement.id = cardType + "-card-" + numCards;
    cardElement.className = "cards " + cardType + "-cards";

    cardBackFace.id = cardType + "-card-back-" + numCards;
    cardBackFace.className = "back face center";
    cardFrontFace.id = cardType + "-card-front-" + numCards;
    cardFrontFace.className = "front face";

    frontImage.src = getCardFrontImage(newCard);
    backImage.src = getCardBackImage(suite);

    containerElement.appendChild(cardElement);
    cardElement.appendChild(cardBackFace);
    cardElement.appendChild(cardFrontFace);
    cardBackFace.appendChild(backImage);
    cardFrontFace.appendChild(frontImage);
    containerElement.style.left = ((numCards-1)*100).toString() + "px";
    area.appendChild(containerElement);
}

/* Returns the number of cards on the hand.  Parameter cardType tells the function
   whether it is a player or dealer card */
function getNumCards(cardType) 
{   
    var numCards;

    if (cardType == "player") {
        numPlayerCards += 1;
        numCards = numPlayerCards;
    }
    else if (cardType == "dealer") {
        numDealerCards += 1;
        numCards = numDealerCards;
    }
    else {
        console.log("Error: wrong card type")
    }
    return numCards;
}

/* This function is called when a new card is dealt and updates the score for either 
   the player or dealer based on input parameter cardType.
*/
function updateScore(cardType)
{
    var cardFrontFace = [];

    /* This regular expression is used get the rank of the card from it's file name. 
       To get the rank we only want 1-10, an A, J, Q, or K, we get that with [1-9AJQK]0?.  
       There's a 0 when the rank is a 10 and the 0? means there either 0 or 1 '0'.  I 
       put the [CDSH]\.png in parenthesis with ?= to the left side, because we want this to 
       be used for matching, but don't want this part to be included in the returned match */
    var re = /[1-9AJQK]0?(?=[CDSH]\.png)/;

    // Location on the web page the score will be display
    var score;

    // Rank of the card in string format
    var rank;

    // Used to convert the rank from string to integer
    var rankValue;

    // This is the running total score of the hand
    var cardValue = 0;

    // Number of aces in the hand
    var aces = 0;

    var numCardsToScore;
    
    if (cardType == "player") {
        numCardsToScore = numPlayerCards;
        cardFrontFace = document.getElementById('player-area').getElementsByTagName("img");
        score = document.getElementById('player-score');
    }
    else if (cardType == "dealer") {
        if (isPlayerStanding == false)
            numCardsToScore = 1;
        else if (isPlayerStanding == true)
            numCardsToScore = numDealerCards;
        cardFrontFace = document.getElementById('dealer-area').getElementsByTagName("img");
        score = document.getElementById('dealer-score');
    }

    // Loop through the all the cards and add each to the cardValue
    for (var i = 0; i < numCardsToScore; i++ )
    {
        /* For each card there's a front and a back, and front is comes after the back on the HTML
           page. */
        rank = cardFrontFace[i*2+1].src.match(re);

        // Convert rank from string to integer
        rankValue = parseInt(rank)

        /* Check if rank has an integer value.  If so, it should already be ready to add to the 
           running total */
        if (rankValue > -1) {       
            cardValue += rankValue;
        }

        // If it's an aces, we count it as 1 for now, and increment the aces count
        else if (rank == "A") {     
            cardValue += 1;
            aces += 1;
        }

        // If it's a J, Q, or K, we add 10 to the cardValue, running total
        else if (rank == "J" || rank == "Q" || rank == "K") {
            cardValue += 10;
        }
    }

    /* When there's an ace and the total value of cards is less than or equal to 11, we want 
       to add 10 to it.  An Ace counts for 11, but we already counted it as a one 
       earlier. */
    if (aces >= 1 && cardValue <= 11)
        cardValue += 10;

    // The score is displayed on the web page
    score.innerText = cardValue.toString();

    // Update either the player or dealer score based on cardType
    if (cardType == 'player')
        playerScore = cardValue;
    else 
        dealerScore = cardValue;
}


/* This function returns the full path the image file given the card name as the 
   parameter */
function getCardFrontImage(card)
{
    return imagePath + card + ".png";
}

/* The deck has one image for it's back side for each suite and this function returns
   the path to image file of the back side of the card giving it's input paramter
   suite. */
function getCardBackImage(suite) 
{
    var imageFile;
    switch(String(suite)) {
        case "C":
            imageFile = imagePath + "back_1.png";
            break;
        case "D":
            imageFile = imagePath + "back_2.png";
            break;
        case "S":
            imageFile = imagePath + "back_3.png";
            break;
        case "H":
            imageFile = imagePath + "back_4.png";
            break;
        default:
            imageFile = -1;     // Shouldn't happen. Card image file not found
            console.log("Missing file: Card back image")
            break;
    }
    return imageFile;
}

/* This function selects a card at random.  Checks if it has already been used.  If 
   it has reselects a card until it finds one that hasn't, and then returns the card */
function getNewCard()
{
    var randomNum;
    
    do {
        randomNum = Math.floor(Math.random() * 52);
    }
    while (usedCards[randomNum] == true);

    usedCards[randomNum] = true;
    return cards[randomNum];
}
