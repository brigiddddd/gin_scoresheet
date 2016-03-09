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

var p1Scores = [[1,2,3,"X","X",4], [2,3,"X","X",4], [3,"X","X",4]];
var p2Scores = [[10,"X",12,8], [12,8],[8]];

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

function addScoreToArray() {

}

function clearBody() {
    var currentBodies = document.getElementsByClassName("points");
    for (var i=0; i<currentBodies.length; i++) {
        currentBodies[i].innerHTML = "";
    }
}

function updateBody() {
    var games = document.getElementsByClassName("gameTable");
    var gameMax = Math.max(p1Scores.length,p2Scores.length);
    var maxPointsLength = 0;
    for (var gameIndex=0; gameIndex<gameMax; gameIndex++) {
        var currentGameTable = games[gameIndex];
        var addItHere = currentGameTable.getElementsByClassName("points");
        var currentMaxPointsLength = Math.max(p1Scores[gameIndex].length, p2Scores[gameIndex].length);
        maxPointsLength = Math.max(currentMaxPointsLength, maxPointsLength);
        for (var pointIndex=0; pointIndex<maxPointsLength; pointIndex++) {
            console.log(p1Scores[gameIndex][pointIndex],p2Scores[gameIndex][pointIndex]);
            if (p1Scores[gameIndex][pointIndex] === undefined) {
                p1Scores[gameIndex][pointIndex] = "";
            }
            if (p2Scores[gameIndex][pointIndex] === undefined) {
                p2Scores[gameIndex][pointIndex] = "";
            }
            addScoreTemplate(addItHere[0], p1Scores[gameIndex][pointIndex], p2Scores[gameIndex][pointIndex]);
        }
    }
}

function updateScoreTable() {
    clearBody();
    updateBody();
    updateTotals();
}

function updateScore() { // Triggered on submitScore click.
    addScoreToArray();
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
        var calculatedTotalP1 = calculateTotal(p1Scores[i]);
        p1Total[i].innerHTML = calculatedTotalP1;

        var calculatedTotalP2 = calculateTotal(p2Scores[i]);
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
    //Mark className as inactive.
    var endedGame = document.getElementById("gameNumber" + gameNumber);
    // TODO:
    var endedGameScoreLists = endedGame.getElementsByClassName("score");
    endedGameScoreLists.className = "score over";

    if (gameNumber === getNumberOfGames()) {
        // Game is over.
        calculateWinner();
    }
}

function calculateWinner() {
    // TODO:
    totalBoxes();
    totalPoints();
    totalOwed();
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

function getP1Scores() {
    return this.p1Scores;
}

function addP1Score(input) {
    if (this.p1Scores.length < getNumberOfGames()) {
        // Add new game.
        this.p1Scores.push([]);
    }

    // Add input to all existing games.
    for (var gameIndex=0; gameIndex<this.p1Scores.length; gameIndex++) {
        for (var inputIndex=0; inputIndex<input.length; inputIndex++) {
            newGame.push(input[inputIndex]);
        }
    }
}

function addP2Score(input) {
    if (this.p2Scores.length < getNumberOfGames()) {
        // Add new game.
        this.p2Scores.push([]);
    }

    // Add input to all existing games.
    for (var gameIndex=0; gameIndex<this.p2Scores.length; gameIndex++) {
        for (var inputIndex=0; inputIndex<input.length; inputIndex++) {
            newGame.push(input[inputIndex]);
        }
    }
}

function getP2Scores() {
    return this.p2Scores;
}

//todo: MAKE SCORE TABLE EDITABLE.