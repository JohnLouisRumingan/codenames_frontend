let masterKeyShowing = false;
let teamArray;

const teamColorRed = '#AA2D19'
const teamColorBlue = '#2D1F92'
const teamColorAssasin = '#403251'

document.addEventListener("DOMContentLoaded", (e)=> {

    console.log('connected to main.js')

    const masterKeyBtn = document.querySelector('#master-key-button');
    const masterKeyCard = document.querySelector('#master-key-card');

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
    
    
    
});

function currentTurn(){ 
    
    
    let div =  getCurrentTurn() 
    if (div.dataset.id === ""){ 
        let coinflip = Math.floor(Math.random() * 2) + 1
        if (coinflip === 1){ 
            div.dataset.id = teamArray[2].id
        }
        else{ 
            div.dataset.id = teamArray[3].id
        }
        
    }
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
        newClue.style.backgroundColor = 'beige';
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
    
    let randWords = wordShuffler(wordArray);
    console.log(randWords);
    let gameWords = randWords.slice(0,10);
    gameWords[0].team_id = teamArray[0].id
    gameWords[1].team_id = teamArray[1].id
    
    gameWords.slice(2,6).forEach( word => word.team_id = teamArray[2].id)
    gameWords.slice(6,10).forEach( word => word.team_id = teamArray[3].id)

    gameWords = wordShuffler(gameWords);
    for(let i = 0; i<gameWords.length; i++){
        renderCard(gameWords[i], i)
    }

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
    
    if(teamNumber=== `${teamArray[0].id}`){
        event.target.style.backgroundColor = teamColorAssasin
    }
    else if(teamNumber===`${teamArray[1].id}`){
        event.target.style.backgroundColor = 'beige'
    }
    else if(teamNumber===`${teamArray[2].id}`){
        event.target.style.backgroundColor = teamColorRed
    }
    else if(teamNumber===`${teamArray[3].id}`){
        event.target.style.backgroundColor = teamColorBlue
    }
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

function fetchWordArray(){
    
    
        console.log("Fetching words")
    fetch(wordURL())
        .then(response => response.json())
        .then(wordArray => {
            populateCards(wordArray)
        currentTurn()})
    
}

function fetchTeams(){
    fetch(teamURL())
        .then(response => response.json())
        .then(teams => { 
            teamArray = teams
            fetchWordArray()
        })
        
}