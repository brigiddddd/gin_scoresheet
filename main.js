var numberOfGames;
var player1Name;
var player2Name;
var numberOfPoints;
var usingKnockCard;
var spadesAreDouble;
var isKnockSuitSpades;
var handWinner;
var handAction;

var p1HandsArray = [];
var p2HandsArray = [];
var endedGamesArray = [];

///////////////////////////////////////////////////////////
//////////////////// GENERAL FUNCITONS ////////////////////
///////////////////////////////////////////////////////////

function hideVisibilityById(id) {
   document.getElementById(id).style.display = "none";
}

function showVisibilityById(id) {
   document.getElementById(id).style.display = "block";
}

function addGameTemplate(gameNo) {
    // Test to see if the browser supports the HTML template element by checking
    // for the presence of the template element's content attribute.
    if ("content" in document.createElement("template")) {
        // Instantiate the table with the existing HTML tbody and the row with the template
        var template = document.querySelector(".singleGame"),
        td = template.content.querySelectorAll("th");
        td[0].textContent = "Game " + gameNo;

        var table = template.content.querySelector("table");
        table.id = "gameNumber" + gameNo;

        // Clone the new row and insert it into the table
        var gameTable = document.getElementsByClassName("gameTables");
        var clone = document.importNode(template.content, true);
        gameTable[0].appendChild(clone);
    } else {
        // Find another way to add the rows to the table because
        // the HTML template element is not supported.
    }
}

function addScoreTemplate(addItHere, boxValue) {
    // Test to see if the browser supports the HTML template element by checking
    // for the presence of the template element's content attribute.
    if ("content" in document.createElement("template")) {
        // Instantiate the table with the existing HTML tbody and the row with the template
        var template = document.querySelector(".newScoreRow");

        var td = template.content.querySelectorAll("td");
        td[0].innerHTML = boxValue;

        // Clone the new row and insert it into the table
        var clone = document.importNode(template.content, true);
        addItHere.appendChild(clone);
    } else {
        // Find another way to add the rows to the table because
        // the HTML template element is not supported.
    }
}

///////////////////////////////////////////////////////////
////////////////// INITIALIZE AND UPDATE //////////////////
///////////////////////////////////////////////////////////

function onStartGame() { // Triggered by onClick of #startGameButton
    // Hide preGame classes
    var preGameRefs = document.getElementsByClassName("preGame");
    for (var i=0; i<preGameRefs.length; i++) {
        preGameRefs[i].style.display = "none";
    }

    // Unhide startGame classes
    var startGameRefs = document.getElementsByClassName("startGame");
    for (var i=0; i<startGameRefs.length; i++) {
        startGameRefs[i].style.display = "block";
    }

    initializeData();

    if (getUsingKnockCard()) {
        // SHOW PICK KNOCK CARD BUTTON
        document.getElementById("generateKnockCardButton").style.display = "block";
    }

    // Add game tables
    for (var i=1; i <= getNumberOfGames(); i++) {
        addGameTemplate(i);
    }

    // TODO: Is there a better way to UpdatePlayers References in Template before cloning???
    updateReferences("player1Name", getPlayer1Name());
    updateReferences("player2Name", getPlayer2Name());
    updateReferences("p1Total", 0);
    updateReferences("p2Total", 0);

}

function initializeData() {
    setPlayer1Name(document.getElementById("player1Input").value);
    setPlayer2Name(document.getElementById("player2Input").value);
    setNumberOfGames(parseInt(document.getElementById("numberOfGames").value));
    setNumberOfPoints(parseInt(document.getElementById("numberOfPoints").value));
    setUsingKnockCard(document.getElementById("useKnockCard").checked);
    setSpadesAreDouble(document.getElementById("spadesDouble").checked);
}

function updateReferences(className, value) {
    var refs = document.getElementsByClassName(className);
    for (var i = 0; i < refs.length; i++) {
        refs[i].innerHTML = value;
    }
}

///////////////////////////////////////////////////////////
////////////////////// ADDING SCORE ///////////////////////
///////////////////////////////////////////////////////////

function isGameOpenForPlayer(gameNumber, player) {
    // Game is open if it has started, and hasn't ended for a specific player.
    var handsWon = (player === "player1") ? getP1HandsArray().length : getP2HandsArray().length;
    var gameHasStarted = handsWon >= gameNumber;
    var gameIsOver = getNumberOfEndedGames() >= gameNumber;
    var gameIsOpen = gameHasStarted && !gameIsOver;
    
    return gameIsOpen;
}

function addValueToTotal(value, totalClass) {
    var totalValue = parseInt(totalClass.innerHTML);
    totalValue += value;
    totalClass.innerHTML = totalValue;

    if (totalValue >= getNumberOfPoints()) {
        endSingleGame(totalValue);
    }
}

function addScoreToAppropriateTables(winner, handArray) {
    var games = document.getElementsByClassName("gameTable");
    var winnerPrefix = (winner === "player1") ? "p1" : "p2";

    for (var gameIndex=0; gameIndex<games.length; gameIndex++) {
        var gameNumber = gameIndex + 1;

        if (isGameOpenForPlayer(gameNumber, winner)) {
            var currentGameTable = games[gameIndex];
            var winnerBoxesTable = currentGameTable.getElementsByClassName(winnerPrefix + "Boxes")[0];

            //we want to add all elements of scoreArray to currentGameTableBody
            for (var handIndex=0; handIndex<handArray.length; handIndex++) {
                var currentItem = handArray[handIndex];
                addScoreTemplate(winnerBoxesTable, currentItem);

                var int;
                if (int = parseInt(currentItem)) {
                    var totalClass = currentGameTable.getElementsByClassName(winnerPrefix+ "Total")[0];
                    addValueToTotal(int, totalClass);
                }
            }
        }
    }
}

// function calculateMaxBoxes() {
//     var gameTables = document.getElementsByClassName("gameTables");
//     var max = 0;
//     for (var i=0; i<gameTables.length; i++) {
//         var p1Boxes = gameTables[i].getElementsByClassName("p1Boxes")[0];
//         var p2Boxes = gameTables[i].getElementsByClassName("p2Boxes")[0];
//         var maxBoxes = Math.max(p1Boxes.children.length,p2Boxes.children.length);
//         max = Math.max(max, maxBoxes);
//     }
//     return max;
// }

// function fleshOutTables() {
//     var maxBoxes = calculateMaxBoxes();
//     console.log(maxBoxes);

//     //TODO: IMPLEMENT? Or Just keep scores in header?
// }

function updateScoreTable(winner, handArray) {
    addScoreToAppropriateTables(winner, handArray);
    //fleshOutTables();
}

function addHandToArray(winner, hand) {
    if (winner === "player1") {
        getP1HandsArray().push(hand);
    } else if (winner === "player2") {
        getP2HandsArray().push(hand);
    } else {
        // TODO: winner has not been set. Throw Error.
    }
}

function handleScoreInput() {
    var score;
    if (!pointsInput) {
        window.alert("You must select a player and specify a point value.");
        return false;
    } else if (isNaN(parseInt(pointsInput.value))) {
        window.alert("You must specify a point value.");
        return false;
    } else {
        score = parseInt(pointsInput.value);
    }
    return score;
}

function createHandArray() {
    var pointsInput = document.getElementById("pointsInput");
    var score = handleScoreInput(pointsInput);
    if (score === false) {
        return false;
    }

    var multiplier = 1;

    if (getSpadesAreDouble() && getIsKnockSuitSpades()) {
        multiplier = 2;
    }

    var handArray = [];

    // Add boxes to array
    var action = getHandAction();
    if (action === "gin") {
        handArray.push((score + 25) * multiplier);
        handArray.push("X");
        handArray.push("X");
    }
    else if (action === "undercut") {
        handArray.push((score + 25) * multiplier);
        handArray.push("X");
    }
    else {
        handArray.push(score * multiplier);
    }

    return handArray;
}

function updateScore() {
    var handArray = createHandArray();
    if (!handArray) {
        return false;
    }
    var winner = getHandWinner();

    addHandToArray(winner, handArray);
    updateScoreTable(winner, handArray);

    return true;
}


function handlePlayerRadioChange(winner) {
    setHandWinner(winner);
    showPointsInputParagraph(winner);
}

///////////////////////////////////////////////////////////
////////////////// SCORESHEET FUNCITONS ///////////////////
///////////////////////////////////////////////////////////

function showScoresheet() {
    showVisibilityById("scoreInputForm");
    hideVisibilityById("addScoreButton");

    hideKnockCard();
}

function hideKnockCard() {
    // Doesn't matter if we're using it or not
    hideVisibilityById("knockCardParagraph");
    hideVisibilityById("generateKnockCardButton");
}

function showKnockCard() {
    if (getUsingKnockCard()) {
        showVisibilityById("knockCardParagraph");
        showVisibilityById("generateKnockCardButton");
    }
}

function showSpadesCheckbox() {
    if (getSpadesAreDouble()) {
        showVisibilityById("isSpadeCheckboxRow");
        if (getIsKnockSuitSpades()) {
            var checkbox = document.getElementById("isSpadeCheckbox")
            checkbox.checked = true;
        }
    }                
}

function onAddScoreButtonClick() {
    // show and reset Scoresheet
    clearScoresheet();
    showSpadesCheckbox();
    showScoresheet();

    // Hide and reset Knock Card
    hideKnockCard();
}

function onCancelAddScoreButtonClick() {
    hideVisibilityById("scoreInputForm");
    showVisibilityById("addScoreButton");

    showKnockCard();

}

function onSubmitScoreButtonClick() {
    var correctInput = updateScore();
    if (!correctInput) {
        return false;
    }

    // Update UI
    hideVisibilityById("scoreInputForm");
    showVisibilityById("addScoreButton");

    if (getUsingKnockCard()) {
        resetKnockCardParagraph();
    
        // SHOW PICK KNOCK CARD BUTTON
        document.getElementById("generateKnockCardButton").style.display = "block";
    }
}

function clearScoresheet() {
    // Reset form
    document.getElementById("scoreInputForm").reset();

    // Hide Points Input Paragraph
    hideVisibilityById("pointsInputParagraph");

    setHandWinner("");
    setHandAction("");
}


function showPointsInputParagraph(selectedPlayer) {
    var otherPlayerName;
    if (selectedPlayer === "player1") {
        otherPlayerName = getPlayer2Name();
    }
    else if (selectedPlayer === "player2") {
        otherPlayerName = getPlayer1Name();
    }

    if (otherPlayerName) {
        document.getElementById("pointsInputName").innerHTML = otherPlayerName;
    }

    showVisibilityById("pointsInputParagraph");
}


///////////////////////////////////////////////////////////
///////////////////////// TOTALS //////////////////////////
///////////////////////////////////////////////////////////

function calculateTotalFromClassName(className) {
    var classes = document.getElementsByClassName(className);
    var total;
    for (var i=0; i<classes.length; i++) {
    }
    return total;
}

function validateTotals() {
    var p1TotalClasses = document.getElementsByClassName("p1Total");
    var p2TotalClasses = document.getElementsByClassName("p2Total");

    for (var i = 0; i<getNumberOfGames(); i++) {
        var p1TotalValue = calculateTotalFromClassName("className");
        p1TotalClasses[i].innerHTML = p1TotalValue;

        var p2TotalValue = calculateTotalFromClassName("className");
        p2TotalClasses[i].innerHTML = p2TotalValue;
    }
}



///////////////////////////////////////////////////////////
////////////////////// ENDING GAMES ///////////////////////
///////////////////////////////////////////////////////////

function handleBlitz() {
    // Add empty array for hands if necessary.
    if (getP1HandsArray().length < getNumberOfEndedGames()) {
        getP1HandsArray().push([]);
    }
    if (getP2HandsArray().length < getNumberOfEndedGames()) {
        getP2HandsArray().push([]);
    }
}

function endSingleGame(total) {
    // Add game number of ended game to array
    getEndedGamesArray().push(total);

    handleBlitz();

    if (getNumberOfEndedGames() === getNumberOfGames()) {
        // Game is over.
        endGame();
    }
}

function endGame() {
    hideVisibilityById("addScoreButton");
    calculateWinner();
}

function singlePlayerBoxes(className) {
    var boxesClasses = document.getElementsByClassName(className);

    var count = 0;
    for (var gameIndex=0; gameIndex<boxesClasses.length; gameIndex++) {
        count += boxesClasses[gameIndex].rows.length;
    }
    return count;
}

function totalBoxes() {
    var p1Boxes = singlePlayerBoxes("p1Boxes");
    var p2Boxes = singlePlayerBoxes("p2Boxes");

    var p1BoxesDiv = document.getElementById("p1Boxes");
    p1BoxesDiv.innerHTML = p1Boxes;

    var p2BoxesDiv = document.getElementById("p2Boxes");
    p2BoxesDiv.innerHTML = p2Boxes;

    return p1Boxes - p2Boxes;
}

function singlePlayerTotals(className) {
    var totals = document.getElementsByClassName(className);
    var total = 0;
    for (var i=0; i<totals.length; i++) {
        total += parseInt(totals[i].innerHTML);
    }
    return total;
}

function totalPoints() {
    var p1Total = singlePlayerTotals("p1Total");
    var p2Total = singlePlayerTotals("p2Total");

    var p1GrandTotalDiv = document.getElementById("p1GrandTotal");
    p1GrandTotalDiv.innerHTML = p1Total;

    var p2GrandTotalDiv = document.getElementById("p2GrandTotal");
    p2GrandTotalDiv.innerHTML = p2Total;

    return p1Total - p2Total;
}

function totalDifference(diffBoxes, diffPoints) {
    var diffPointsDiv = document.getElementById("diffPoints");
    diffPointsDiv.innerHTML = diffPoints;
    var diffBoxesDiv = document.getElementById("diffBoxes");
    diffBoxesDiv.innerHTML = diffBoxes;
}

function calculateWinner() {
    // Hide addScoreButton
    hideVisibilityById("addScoreButton");
    showVisibilityById("totals");

    var diffBoxes = totalBoxes();
    var diffPoints = totalPoints();
    totalDifference(diffBoxes, diffPoints);
    //totalOwed();
}


///////////////////////////////////////////////////////////
///////////////////// KNOCK CARD INFO /////////////////////
///////////////////////////////////////////////////////////

function getRandomCardNumber() {
    var random = Math.floor(Math.random()*13)+1;
    if (random === 1) {
        return "A";
    }
    else if (random > 10) {
        var faceCards=["J","Q","K"];
        var arrayIndex = random - 11;
        return faceCards[arrayIndex];
    }
    else {
        return random;
    }
}

function getRandomCardSuit() {
    var random = Math.floor(Math.random()*4);
    var suits = ["&spades;","&hearts;","&diams;","&clubs;"];
    var suit = suits[random];
    setIsKnockSuitSpades(suit);
    return suit;
}

function getKnockCard() {
    var knockCardParagraph = document.getElementById("knockCardParagraph");
    knockCardParagraph.innerHTML = "Knock Card: " + getRandomCardNumber() + getRandomCardSuit();
    if (knockCardParagraph.style.display == "none") {
        knockCardParagraph.style.display = "block";
    }
}

function resetKnockCardParagraph() {
    var knockCardParagraph = document.getElementById("knockCardParagraph");
    knockCardParagraph.innerHTML = "";
}



///////////////////////////////////////////////////////////
/////////////////// GETTERS AND SETTERS ///////////////////
///////////////////////////////////////////////////////////

function getNumberOfGames() {
    return this.numberOfGames;
}

function setNumberOfGames(no) {
    this.numberOfGames = no;
}

function getPlayer1Name() {
    return this.player1Name;
}

function setPlayer1Name(name) {
    this.player1Name = name;
}

function getPlayer2Name() {
    return this.player2Name;
}

function setPlayer2Name(name) {
    this.player2Name = name;
}

function getNumberOfPoints() {
    return this.numberOfPoints;
}

function setNumberOfPoints(points) {
    this.numberOfPoints = points;
}

function getUsingKnockCard() {
    return this.usingKnockCard;
}

function setUsingKnockCard(using) {
    this.usingKnockCard = using;
}

function getSpadesAreDouble() {
    return this.spadesAreDouble;
}

function setSpadesAreDouble(double) {
    this.spadesAreDouble = double;
}

function getIsKnockSuitSpades() {
    return this.isKnockSuitSpades;
}

function setIsKnockSuitSpades(knockSuit) {
    this.isKnockSuitSpades = (knockSuit === "&spades;")
}

function getP1HandsArray() {
    return this.p1HandsArray;
}

function getP2HandsArray() {
    return this.p2HandsArray;
}

function getEndedGamesArray() {
    return this.endedGamesArray;
}

function getNumberOfEndedGames() {
    return this.endedGamesArray.length;
}

function getHandWinner() {
    return this.handWinner;
}

function setHandWinner(winner) {
    this.handWinner = winner;
}

function getHandAction() {
    return this.handAction;
}

function setHandAction(action) {
    this.handAction = action;
}

// TODO: MAKE SCORE TABLES EDITABLE??-> Undo from menu button?
// TODO: Add namespaces.
// TODO: Store totals instead of recalculating in place?
// TODO: VERIFY SCORING...
    // DO YOU GET 25 POINTS FOR UNDERCUTTING?
    // DO EXTRA POINTS GET GET DOUBLED ON SPADES??
    // IS THERE A SPECIAL BONUS FOR ALL CARDS BEING PLAYED??
    // OTHER OUTLIERS?