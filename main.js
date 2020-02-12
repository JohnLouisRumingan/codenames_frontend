let masterKeyShowing = false 
let rulesShowing = true;
let teamArray;
let guessLimit
let wordList = [];
let bluePoints; // number of guesses team must have to win. 9 if first team, 8 if second
let redPoints;  
let clueWindow = undefined;
let firstGuess = false; // you cannot pass the turn without guessing at least one card - working
let clueBeforeGuess = false;  // you cannot guess before a clue is given

const teamColorRed = '#AA2D19'
const teamColorBlue = '#99b3ff'
const teamColorAssasin = '#403251'
const teamColorNeutral = 'beige';

document.addEventListener("DOMContentLoaded", (e)=> {

    console.log('connected to main.js')

    const masterKeyBtn = document.querySelector('#master-key-button');
    const masterKeyCard = document.querySelector('#master-key-card');
    const rulesButton = document.querySelector('#rules-button');
    const rulesCard = document.querySelector('#rules-card');
    
    masterKeyCard.style.display = "none";
    rulesCard.style.display = "block";

    masterKeyBtn.addEventListener('click', (e) => masterKeyHandler(e, masterKeyCard));
    rulesButton.addEventListener('click', (e)=> rulesHandler(e, rulesCard));

    makeRules();
    fetchTeams();
    getPassTurnButton().addEventListener('click', switchTurn)
    getClueForm().addEventListener('submit', (e) => clueFormHandler(e,currentTurn() ))
    getResetButton().addEventListener('click', (e) => resetGameHandler(e))
});

function currentTurn(){ 
    
    
    let div =  getCurrentTurn() 

    //if statement is only for setting a team name at start of game and after resets 
    if (div.dataset.id === ""){ 
        let coinflip = Math.floor(Math.random() * 2) + 1
        if (coinflip === 1){ 
            div.dataset.id = teamArray[2].id
            redPoints = 9;
            bluePoints = 8;
            setCurrentTurnText()
            
        }
        else{ 
            
            div.dataset.id = teamArray[3].id
            bluePoints = 9;
            redPoints = 8;
            setCurrentTurnText()
        }
        
    }

    return div.dataset.id 
}
function makeMasterKeyCard(gameWords){

    gameWords.forEach(word => renderKeyCards(word))
}

function renderKeyCards(word){
    let masterKey = document.getElementById('master-key-card');

    let newClue = document.createElement('div');
    newClue.innerText = word.name;
    newClue.dataset.team = word.team_id;
    newClue.className = "master-card"

    if(newClue.dataset.team ===`${teamArray[0].id}`){
        newClue.style.backgroundColor = teamColorAssasin
    }
    else if(newClue.dataset.team === `${teamArray[1].id}`){
        newClue.style.backgroundColor = teamColorNeutral;
    }
    else if(newClue.dataset.team === `${teamArray[2].id}`){
        newClue.style.backgroundColor = teamColorRed
    }
    else if(newClue.dataset.team === `${teamArray[3].id}`){
        newClue.style.backgroundColor = teamColorBlue
    }
    
    masterKey.appendChild(newClue);
}


function populateCards(wordArray){
    
    let firstPlayerTurn = currentTurn();
    let randWords = wordShuffler(wordArray);
    console.log(randWords);
    let gameWords = randWords.slice(0,25);
    gameWords[0].team_id = teamArray[0].id

    // gameWords[1].team_id = teamArray[1].id
    gameWords.slice(1,8).forEach(word => word.team_id = teamArray[1].id)
    
    if (parseInt(firstPlayerTurn) === teamArray[2].id){

        gameWords.slice(8,17).forEach( word => word.team_id = teamArray[2].id)
        gameWords.slice(17,25).forEach( word => word.team_id = teamArray[3].id)
    }
    else{
        gameWords.slice(8,17).forEach( word => word.team_id = teamArray[3].id)
        gameWords.slice(17,25).forEach( word => word.team_id = teamArray[2].id)
    }
      
        //saves game words array to current_games table
      for(let i =1; i<= 25; i++){ 
          postClue(gameWords[i-1], i)
      }
      
    gameWords = wordShuffler(gameWords);
    for(let i = 0; i<gameWords.length; i++){
        renderCard(gameWords[i], i)
    }
    gameWords.forEach(word => {
        wordList.push(word.name.toLowerCase());
    })
    makeMasterKeyCard(gameWords);
}

function renderCard(word, index){
    let wordContainer = getWordContainer();
    let newCardDiv = document.createElement('div');
    newCardDiv.innerText = word.name;
    newCardDiv.dataset.location = index;
    newCardDiv.dataset.team = word.team_id
    newCardDiv.className = "word-card";
    newCardDiv.addEventListener('click', (e) => wordHandler(e))
    wordContainer.append(newCardDiv);
    
}

function wordShuffler(array) {
    let newArray = array;
    let i = newArray.length,
        j = 0,
        temp;

    while (i--) {

        j = Math.floor(Math.random() * (i+1));

        // swap randomly chosen element with current element
        temp = newArray[i];
        newArray[i] = newArray[j];
        newArray[j] = temp;

    }
    return newArray;
}

function makeRules(){
    let rulesDiv = document.querySelector('#rules-card');
    let rulesString = `
    <p>
    Game Setup<br>
    Make 2 teams, Red and Blue, and choose a Spymaster for each team. Teams don’t have to be even.<br>
    • Spymasters and teammates sit on opposite sides of table. Spymasters manage Agent cards for team.<br>
    • Game will randomly choose 25 codenames cards. These will be assigned to red team, blue team, assassin, and neutral.<br>
    • The first team must get 9 codenames correct (vs 8 for 2nd team)<br>
    </p>
    <p>
    Game Play<br>
    • Spymaster gives 1 word + 1 number clue (ex: tree; 2) and can give no other clues of any kind.<br>
    • Team debates then touches a card. If it belongs to their team, the spymaster covers with team color<br>
    and they can guess again, up to the # of clues + 1. Must always make at least 1 guess.<br>
    • If Innocent Bystander or other team color, cover with respective card, turn is over<br>
    • If Assassin, game is over, team loses<br>
    • If Spymaster gives invalid clue, turn is over. No clues other than word and #. Timer is optional.</p>`;
    rulesDiv.innerHTML = rulesString;
}

// event handlers

function rulesHandler(event, rulesCard){

    console.log('You clicked on the rules')
    rulesShowing = !rulesShowing;

    if(rulesShowing){
        rulesCard.style.display = 'block';
    }
    else{
        rulesCard.style.display = 'none';
    }
}

function masterKeyHandler(event, masterKeyCard){
        //shows and hides the clue card
        masterKeyShowing = !masterKeyShowing;
        if (masterKeyShowing){
            // line below shows the keycard to the same page. Use this with the if statement so new windows don't show up every time.
            // masterKeyCard.style.display = 'block'

            //shows new clue window
            //If not used with the above, comment out the if statement so you can open up new windows if accidentally closed.
            // if(!clueWindow){
            clueWindow = window.open('clues.html', '_blank');
            // }
        }
        else{
            masterKeyCard.style.display = 'none'

            //closes clue window
            // clueWindow.close();
        }
}

function wordHandler(event){

    if(clueBeforeGuess){
    
        firstGuess = true;
        let teamNumber = event.target.dataset['team'];
        console.log(`This card belongs to ${teamNumber}`)

        let chosenWordCard = event.target;
        if (guessLimit === 0){ 
            alert("You've run out of clues")
            switchTurn()
        } 
        else {
            
            if(teamNumber=== `${teamArray[0].id}`){
                event.target.style.backgroundColor = teamColorAssasin
            alert("You hit the assasin. Game over.")
            guessLimit = 0
            
            }
            else if(teamNumber===`${teamArray[1].id}`){
                event.target.style.backgroundColor = 'beige'
                guessLimit = 0;
                alert("You've hit a neutral target. Your turn is now ended.")
                wordHandler(event);
            }
            else if(teamNumber===`${teamArray[2].id}`){
                event.target.style.backgroundColor = teamColorRed
                guessLimit--
                
                
                chosenWordCard.className = "tiny-card";
                getRedContainer().append(chosenWordCard);
                
                if(currentTurn()===`${teamArray[3].id}`){
                    guessLimit = 0;
                    alert("You've chosen an opponent team's card! Your turn is now ended.")
                    wordHandler(event);
                }
            }
            else if(teamNumber===`${teamArray[3].id}`){
                event.target.style.backgroundColor = teamColorBlue
                guessLimit--

                
                chosenWordCard.className = "tiny-card";
                getBlueContainer().append(chosenWordCard);

                if(currentTurn()===`${teamArray[2].id}`){
                    guessLimit = 0;
                    alert("You've chosen an opponent team's card! Your turn is now ended.")
                    wordHandler(event);
                }
            }
        }
        alert(`You have ${guessLimit} guesses left.`)
    }
    else{
        alert(`You must enter a clue before you can guess a word.`)
    }
    countRedCards();
    countBlueCards();

}

function switchTurn(e){ 
  if(firstGuess){  
  let turnSwitcher = true 
  setCurrentTurnText(turnSwitcher)
  firstGuess = false;
  clueBeforeGuess = false;
  }
  else if(!firstGuess){
      alert('You must guess at least once')
  }
}

function clueFormHandler(e, currentTeam){ 
    
    
    e.preventDefault()
    let clue = e.target.clue.value 
    if(clue === ""){ 
        alert("Please enter a clue")
    }
    else{

    clueBeforeGuess = true; 

        if(wordList.includes(clue.toLowerCase())){
            alert("You cannot enter a word on the word list! It is now the other team's turn.");
            switchTurn();
        }
        else{
        document.querySelector('#master-key-card').style.display = 'none'
        masterKeyShowing = false 

        let guesses = parseInt(e.target.guesses.value);
        let clueEntry = document.createElement('li')
        guessLimit = guesses + 1 ;
        clueEntry.innerText = `${clue} ${guesses}`
        alert(`You have ${guessLimit} guesses remaining.`)
            if (currentTeam === `${teamArray[2].id}`){ 
            let ul = document.getElementById('red-team-ul')
            ul.appendChild(clueEntry)
            }
            else{ 
                let ul = document.getElementById('blue-team-ul')
                ul.appendChild(clueEntry)
            }
    
        clueFormStyle()
        }

    }
    
    e.target.reset()
}

function resetGameHandler(event){
 
    alert('Resetting game...')
    teamArray = null;
    guessLimit = null;
    wordList = [];
    bluePoints = 0;
    redPoints = 0;
    clueWindow.close();
    clueWindow = undefined;
    firstGuess = false;
    deleteChildElements(getWordContainer());
    deleteChildElements(getCurrentTurn());
    deleteChildElements(document.getElementById('red-team-ul'));
    deleteChildElements(document.getElementById('blue-team-ul'));
    deleteChildElements(document.getElementById('blue-team-container'));
    deleteChildElements(document.getElementById('red-team-container'));

    deleteChildElements(document.getElementById('master-key-card'));
    document.querySelector('#current-turn').dataset.id = ""
    fetchTeams();
    clueFormStyle()
    
    // setCurrentTurnText();
    document.querySelector('#master-key-card').style.display = "none";
}


// element fetchers and url fetchers 

function wordURL(){
    return 'http://localhost:3000/words'
}

function teamURL(){
    return 'http://localhost:3000/teams'
}

function getWordContainer(){
    return document.getElementById('word-card-container');
}
function getCurrentTurn(){ 
    return document.getElementById("current-turn")
    
}

function getPassTurnButton(){ 
    return document.getElementById("pass-turn-button")
}
 
function getClueForm(){ 
    return document.querySelector('#clue-form')
}

function getResetButton(){
    return document.querySelector('#reset-game')
}

function getRedContainer(){
    return document.getElementById('red-team-container')
}

function getBlueContainer(){
    return document.getElementById('blue-team-container')
}

// Api fecthes and renders

function fetchWordArray(){
    
    
        console.log("Fetching words")
    fetch(wordURL())
        .then(response => response.json())
        .then(wordArray => {
            populateCards(wordArray);
        // currentTurn()
    })
    
}

function fetchTeams(){
    fetch(teamURL())
        .then(response => response.json())
        .then(teams => { 
            teamArray = teams
            fetchWordArray()
        })
        
}
// helpers 
function setCurrentTurnText(switchTurn){ 
    
    let  div = getCurrentTurn()
    guessLimit = 0;
        if (!switchTurn){ 
            if (div.dataset.id === `${teamArray[2].id}`){ 
            div.innerText = `It's ${teamArray[2].name}'s turn`
            }
            else if (div.dataset.id = `${teamArray[3].id}` ){ 
            
            div.innerText = `It's ${teamArray[3].name}'s turn`
            }
        } 
        else if(switchTurn){ 
            if (div.dataset.id === `${teamArray[2].id}`){ 
                div.dataset.id = `${teamArray[3].id}`
                div.innerText = `It's ${teamArray[3].name}'s turn`
            }
            else if (div.dataset.id = `${teamArray[3].id}` ){ 
                div.dataset.id = `${teamArray[2].id}`
                div.innerText = `It's ${teamArray[2].name}'s turn`
            }
            appearClueForm()
        }
}

function deleteChildElements(parentNode){
    while (parentNode.firstChild) {
          parentNode.removeChild(parentNode.firstChild);
    } 
}

function countRedCards(){
    let redCards = getRedContainer().childElementCount
    
    if (redCards === redPoints){
        alert("Red Team has won!")
    }
}

function countBlueCards(){
    let blueCards = getBlueContainer().childElementCount
    if (blueCards === bluePoints){
        alert("Blue Team has won!")
    }
}

function postClue(word, i ) { 
    let newWord = word.name
    let newWordTeam = word.team_id
    let newObj = {name: newWord, team_id: newWordTeam}
    fetch(`http://localhost:3000/current_games/${i}`, { 
        method: "PATCH", 
        headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
        }, 
        body: JSON.stringify(newObj)
    })
}

function appearClueForm(){ 
    form = getClueForm()
    form.style.display = ""
}

function clueFormStyle(){ 
    form = getClueForm()
    if (form.style.display === ""){ 
        form.style.display = 'none'
    }
    else if(form.style.display === 'none'){ 
        form.style.display = ""
    }
}