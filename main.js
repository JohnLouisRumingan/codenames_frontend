let masterKeyShowing = false 
let teamArray;
let guessLimit
let wordList = [];
// let clueGiven = false;
const teamColorRed = '#AA2D19'
const teamColorBlue = '#2D1F92'
const teamColorAssasin = '#403251'
const teamColorNeutral = 'beige';

document.addEventListener("DOMContentLoaded", (e)=> {

    console.log('connected to main.js')

    const masterKeyBtn = document.querySelector('#master-key-button');
    const masterKeyCard = document.querySelector('#master-key-card');

    masterKeyCard.style.display = "none";

    masterKeyBtn.addEventListener('click', (e) => {

        //shows and hides the clue card
        masterKeyShowing = !masterKeyShowing;
        if (masterKeyShowing){
            masterKeyCard.style.display = 'block'
        }
        else{
            masterKeyCard.style.display = 'none'
        }
    });
    fetchTeams();
    getPassTurnButton().addEventListener('click', switchTurn)
    getClueForm().addEventListener('submit', (e) => clueFormHandler(e,currentTurn() ))
    
});

function currentTurn(){ 
    
    
    let div =  getCurrentTurn() 
    if (div.dataset.id === ""){ 
        let coinflip = Math.floor(Math.random() * 2) + 1
        if (coinflip === 1){ 
            div.dataset.id = teamArray[2].id
            
            setCurrentTurnText()
            
        }
        else{ 
            
            div.dataset.id = teamArray[3].id
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

// event handlers
function wordHandler(event){
    
     let teamNumber = event.target.dataset['team'];
     console.log(`This card belongs to ${teamNumber}`)
   if (guessLimit === 0){ 
       alert("Youve run out of clues")
       switchTurn()
   } 
   else {
    
    if(teamNumber=== `${teamArray[0].id}`){
        event.target.style.backgroundColor = teamColorAssasin
       alert("You hit the assasin")
       guessLimit = 0
       
    }
    else if(teamNumber===`${teamArray[1].id}`){
        event.target.style.backgroundColor = 'beige'
        guessLimit = 0;
        alert("You've hit a neutral target. Your turn is now ended.")
    }
    else if(teamNumber===`${teamArray[2].id}`){
        event.target.style.backgroundColor = teamColorRed
        guessLimit--
        if(currentTurn()===`${teamArray[3].id}`){
            guessLimit = 0;
            alert("You've chosen an opponent team's card! Your turn is now ended.")
            wordHandler(event);
        }
    }
    else if(teamNumber===`${teamArray[3].id}`){
        event.target.style.backgroundColor = teamColorBlue
        guessLimit--
        if(currentTurn()===`${teamArray[2].id}`){
            guessLimit = 0;
            alert("You've chosen an opponent team's card! Your turn is now ended.")
            wordHandler(event);
        }
    }
    alert(`You have ${guessLimit} gueses left.`)
}
}

function switchTurn(e){ 
  let turnSwitcher = true 
  setCurrentTurnText(turnSwitcher)
}

function clueFormHandler(e, currentTeam){ 
    e.preventDefault()
    let clue = e.target.clue.value 

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
    }
    
e.target.reset()
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
            div.innerText = `Its ${teamArray[2].name}'s turn`
            }
            else if (div.dataset.id = `${teamArray[3].id}` ){ 
            
            div.innerText = `Its ${teamArray[3].name}'s turn`
            }
        } 
        else if(switchTurn){ 
            if (div.dataset.id === `${teamArray[2].id}`){ 
                div.dataset.id = `${teamArray[3].id}`
                div.innerText = `Its ${teamArray[3].name}'s turn`
            }
            else if (div.dataset.id = `${teamArray[3].id}` ){ 
                div.dataset.id = `${teamArray[2].id}`
                div.innerText = `Its ${teamArray[2].name}'s turn`
            }

        }
}

