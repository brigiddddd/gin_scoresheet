var activeGameClassName = "gameTable active";
var inactiveGameClassName = "gameTable";

var numberOfGames;
var latestGameNumber;
var player1Name;
var player2Name;
var numberOfPoints;
var usingKnockCard;
var spadesAreDouble;
var isKnockSuitSpades;

var p1ScoreArray = [[1]];
var p2ScoreArray = [[1]];
var endedGamesArray = [];

///////////////////////////////////////////////////////////
//////////////////// GENERAL FUNCITONS ////////////////////
///////////////////////////////////////////////////////////

function toggleVisibilityId(id) {
   var e = document.getElementById(id);
   if (e.style.display == "block") {
      e.style.display = "none";
   }
   else {
      e.style.display = "block";
   }
}

function toggleVisibilityClassName(className) {
   var e = document.getElementsByClassName(className);
   for (var i=0; i<e.length; i++) {
       if (e[i].style.display == "block") {
           e[i].style.display = "none";
       }
       else {
           e[i].style.display = "block";
       }
   }
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

function addScoreTemplate(addItHere, p1Score, p2Score) {
    // Test to see if the browser supports the HTML template element by checking
    // for the presence of the template element's content attribute.
    if ("content" in document.createElement("template")) {
        // Instantiate the table with the existing HTML tbody and the row with the template
        var template = document.querySelector(".newScoreRow");

        var td = template.content.querySelectorAll("td");
        td[0].innerHTML = p1Score;
        td[1].innerHTML = p2Score;

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

function startGame() { // Triggered by onClick of #startGameButton
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
        var knockCardButton = document.getElementById("generateKnockCardButton");
        knockCardButton.style.display = "block";
    }

    // TODO: There must be a better way to UpdatePlayers References in Template before cloning???

    // Add game tables
    for (var i=1; i <= getNumberOfGames(); i++) {
        addGameTemplate(i);
    }

    // Update player references.
    updatePlayerReferences("player1Name", getPlayer1Name());
    updatePlayerReferences("player2Name", getPlayer2Name());

}

function initializeData() {
    setPlayer1Name(document.getElementById("player1Input").value);
    setPlayer2Name(document.getElementById("player2Input").value);
    setNumberOfGames(parseInt(document.getElementById("numberOfGames").value));
    setNumberOfPoints(parseInt(document.getElementById("numberOfPoints").value));
    setUsingKnockCard(document.getElementById("useKnockCard").checked);
    setSpadesAreDouble(document.getElementById("spadesDouble").checked);
    setLatestGameNumber(0);
}

function updatePlayerReferences(className, playerName) {
    var playerRefs = document.getElementsByClassName(className);
    for (var i = 0; i < playerRefs.length; i++) {
        playerRefs[i].innerHTML = playerName;
    }
}

function clearBody() {
    var currentBodies = document.getElementsByClassName("points");
    for (var i=0; i<currentBodies.length; i++) {
        currentBodies[i].innerHTML = "";
    }
}

function updateBody() {
    var games = document.getElementsByClassName("gameTable");
    var gameMax = Math.max(p1ScoreArray.length,p2ScoreArray.length);
    var maxPointsLength = 0;
    for (var gameIndex=0; gameIndex<gameMax; gameIndex++) {
        var currentGameTable = games[gameIndex];
        var addItHere = currentGameTable.getElementsByClassName("points");
        var currentMaxPointsLength = Math.max(p1ScoreArray[gameIndex].length, p2ScoreArray[gameIndex].length);
        maxPointsLength = Math.max(currentMaxPointsLength, maxPointsLength);
        for (var pointIndex=0; pointIndex<maxPointsLength; pointIndex++) {
            var p1Score = p1ScoreArray[gameIndex][pointIndex];
            if (p1Score === undefined) {
                p1Score = "";
            }

            var p2Score = p2ScoreArray[gameIndex][pointIndex];
            if (p2Score === undefined) {
                p2Score = "";
            }
            
            addScoreTemplate(addItHere[0], p1Score, p2Score);
        }
    }
}

function updateScoreTable() {
    clearBody();
    updateBody();
    updateTotals();
}

function addScoreToArray() {
    var scoreArray = getScoreAndBoxes();
    var winner = document.getElementById("playerSelect").value;
    if (winner === "player1") {
        addP1Score(scoreArray);
    } else {
        addP2Score(scoreArray);
    }
}

function updateScore() { // Triggered on submitScore click.
    addScoreToArray();
    this.endedGamesArray = [];
    updateScoreTable();
    toggleAddScore();
    resetKnockCardParagraph();
}


///////////////////////////////////////////////////////////
//////////////////// SCORING FUNCITONS ////////////////////
///////////////////////////////////////////////////////////

function toggleScoresheet() {
    toggleVisibilityId("scoreInputForm");
    toggleVisibilityId("addScoreButton");
}

function toggleKnockCard() {
    if (getUsingKnockCard()) {
        toggleVisibilityId("knockCardParagraph");
        toggleVisibilityId("generateKnockCardButton");
    }
}

function toggleAddScore() { // Triggered on addScoreButton or cancelAddScoreButton click
    // Toggle and reset Scoresheet
    toggleScoresheet();
    clearScoresheet();

    // Toggle and reset Knock Card
    toggleKnockCard();
}

function clearScoresheet() {
    // Reset form
    document.getElementById("scoreInputForm").reset();

    // Remove Points Input Paragraph
    document.getElementById("pointsInputParagraph").innerHTML = "";
}


function createPointsInputParagraph() {
    var selectElement = document.getElementById("playerSelect");
    var selectedPlayerIndex = selectElement.selectedIndex;

    var otherPlayerIndex = -1;
    if (selectedPlayerIndex === 1) {
        otherPlayerIndex = 2;
    }
    else if (selectedPlayerIndex === 2) {
        otherPlayerIndex = 1;
    }

    if (otherPlayerIndex > 0) {
        var otherPlayer = selectElement.options[otherPlayerIndex].text;
    }

    if (otherPlayer) {
        var html = " had <input type='text' name='points' maxlength='3' min='0' class='pointsInput' id='pointsInput' > points in hand."
        document.getElementById("pointsInputParagraph").innerHTML = otherPlayer + html;
    }
}

function getScoreAndBoxes() {
    var score = parseInt(document.getElementById("pointsInput").value);
    var multiplier = 1;

    // TODO: VERIFY SCORING...
    // DOES GIN GET DOUBLED ON SPADES??
    // POINTS FOR UNDERCUTTING?
    // SPECIAL BONUS FOR ALL CARDS BEING PLAYED??
    // OTHER OUTLIERS?

    if (getSpadesAreDouble() && getIsKnockSuitSpades()) {
        score = score*2;
        console.log("But spadesAreDouble... ", score);
    }

    var scoreAndBoxes = [];

    // Add boxes to array
    var action = document.getElementById("actionSelect").value;
    if (action === "gin") {
        score = score + 25;
        scoreAndBoxes.push(score);
        scoreAndBoxes.push("X");
        scoreAndBoxes.push("X");
    }
    else if (action === "undercut") {
        scoreAndBoxes.push(score);
        scoreAndBoxes.push("X");
    }
    else {
        scoreAndBoxes.push(score);
    }

    return scoreAndBoxes;
}

function calculateTotal(scoreList) {
    var total = 0;
    for (var i=0; i<scoreList.length; i++) {
        if (scoreList[i] !== "x" && scoreList[i] !== "X") {
            total += scoreList[i];
        }
    }
    return total;
}

function updateTotals() {
    var p1Total = document.getElementsByClassName("p1Total");
    var p2Total = document.getElementsByClassName("p2Total");

    for (var i = 0; i<getNumberOfGames(); i++) {
        var calculatedTotalP1 = calculateTotal(p1ScoreArray[i]);
        p1Total[i].innerHTML = calculatedTotalP1;

        var calculatedTotalP2 = calculateTotal(p2ScoreArray[i]);
        p2Total[i].innerHTML = calculatedTotalP2;

        var gameOver = checkGameOver(Math.max(calculatedTotalP1,calculatedTotalP2));
        if (gameOver) {
            var gameNumber = i + 1;
            endSingleGame(gameNumber);
        }
    }
}


///////////////////////////////////////////////////////////
////////////////////// ENDING GAMES ///////////////////////
///////////////////////////////////////////////////////////

function checkGameOver(value) {
    if (parseInt(value) >= getNumberOfPoints()) {
         return true;
    }
    return false;
}

function endSingleGame(gameNumber) {
    // Add game number of ended game to array
    getEndedGamesArray().push(gameNumber);

    if (gameNumber === getNumberOfGames()) {
        // Game is over.
        calculateWinner();
    }
}

function singlePlayerBoxes(input) {
    var count = 0;
    for (var gameIndex=0; gameIndex<input.length; gameIndex++) {
        count += input[gameIndex].length;
    }
    return count;
}

function totalBoxes() {
    var p1Boxes = singlePlayerBoxes(p1ScoreArray);
    var p2Boxes = singlePlayerBoxes(p2ScoreArray);

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
    toggleVisibilityId("addScoreButton");
    toggleVisibilityId("totals");

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

function getLatestGameNumber() {
    return this.latestGameNumber;
}

function setLatestGameNumber(latestNo) {
    this.latestGameNumber = latestNo;
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

function getP1ScoreArray() {
    return this.p1ScoreArray;
}

function addP1Score(input) {
    if (this.p1ScoreArray.length < getNumberOfGames()) {
        // Add new game.
        this.p1ScoreArray.push([]);
    }

    var numberOfEndedGames = getNumberOfEndedGames();

    // Add input to all active games.
    for (var gameIndex=numberOfEndedGames; gameIndex<this.p1ScoreArray.length; gameIndex++) {
        for (var inputIndex=0; inputIndex<input.length; inputIndex++) {
            this.p1ScoreArray[gameIndex].push(input[inputIndex]);
        }
    }
}

function addP2Score(input) {
    if (this.p2ScoreArray.length < getNumberOfGames()) {
        // Add new game.
        this.p2ScoreArray.push([]);
    }

    var numberOfEndedGames = getNumberOfEndedGames();

    // Add input to all existing games.
    for (var gameIndex=numberOfEndedGames; gameIndex<this.p2ScoreArray.length; gameIndex++) {
        for (var inputIndex=0; inputIndex<input.length; inputIndex++) {
            this.p2ScoreArray[gameIndex].push(input[inputIndex]);
        }
    }
}

function getP2ScoreArray() {
    return this.p2ScoreArray;
}

function getEndedGamesArray() {
    return this.endedGamesArray;
};

function getNumberOfEndedGames() {
    return this.endedGamesArray.length;
}

// todo: MAKE SCORE TABLES EDITABLE??
// todo: ONLY SHOW SPADES ARE DOUBLE IF USE KNOCK CARD IS CHECKED
// TODO: Switch dropdowns to radio boxes.
// TODO: switch to hand based data structure.
// Fix starting from scratch errors. 