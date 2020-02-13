let masterKeyShowing = false 
let rulesShowing = true;
let teamArray;
let guessLimit
let wordList = [];
let bluePoints; // number of guesses team must have to win. 9 if first team, 8 if second
let redPoints;  
let clueWindow = undefined;
let firstGuess = false; // you cannot pass the turn without guessing at least one card
let clueBeforeGuess = false;  // you cannot guess before a clue is given
let gameContinue = true;

const teamColorRed = '#AA2D19'
const teamColorBlue = '#99b3ff'
const teamColorAssasin = '#403251'
const teamColorNeutral = 'beige';

document.addEventListener("DOMContentLoaded", (e)=> {
    console.log('connected to main.js')
    Swal.fire({
        title: 'Welcome to Codenames!',
        width: 300,
        padding: '3em',
        confirmButtonText: 'Play!',
        backdrop: `
          rgba(0,0,123,0.4)
          url("https://media.giphy.com/media/oIjmUZ70SzCIU/giphy.gif")
         center top
          no-repeat
        `
      })
    
    const masterKeyBtn = document.querySelector('#master-key-button');
    const masterKeyCard = document.querySelector('#master-key-card');
    const rulesButton = document.querySelector('#rules-button');
    const rulesCard = document.querySelector('#rules-card');
    
    masterKeyCard.style.display = "none";
    rulesCard.style.display = "block";
    
    masterKeyBtn.addEventListener('click', (e) => masterKeyHandler(e, masterKeyCard));
    rulesButton.addEventListener('click', (e)=> rulesHandler(e, rulesCard));
    
    redModal()
    blueModal()
    neutralModal()
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
        console.log(2000*i)
        
        setTimeout(() => renderCard(gameWords[i], i),100*i)
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
    • Make 2 teams, Red and Blue, and choose a Spymaster for each team. Teams don’t have to be even.<br>
    • Spymasters and teammates sit on opposite sides of table. Spymasters manage Agent cards for team.<br>
    • Game will randomly choose 25 codenames cards. These will be assigned to red team, blue team, assassin, and neutral.<br>
    • The first team must get 9 codenames correct (vs 8 for 2nd team)<br>
    </p>
    <p>
    Game Play<br>
    • Spymaster gives 1 word + 1 number clue (e.g.: tree 2) and can give no other clues of any kind.<br>
    • Spymaster can give a 0 number clue (e.g.: animal 0) and the team gets infinite guesses.<br>
    • If Spymaster says a clue that is a word on the list, the team forfeits their turn.<br>
    • Team debates then touches a card. If it belongs to their team, the spymaster places that card in their team container<br>
    and they can guess again, up to the # of clues + 1. Must always make at least 1 guess.<br>
    • If Innocent Bystander or other team color, places the card in the appropriate container, and their turn is over.<br>
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

    if(gameContinue){
        
        if(clueBeforeGuess){
        
            firstGuess = true;
            let teamNumber = event.target.dataset['team'];
            console.log(`This card belongs to ${teamNumber}`)

            let chosenWordCard = event.target;
            if (guessLimit === 0){ 
                switchTurn()
            } 
            else {
                
                if(teamNumber=== `${teamArray[0].id}`){
                    // event.target.style.backgroundColor = teamColorAssasin
                    Swal.fire({
                        title: 'You hit the assasin!',
                        width: 300,
                        padding: '3em',
                        confirmButtonText: 'I lost',
                        backdrop: `
                          rgba(0,0,123,0.4)
                          url("https://media2.giphy.com/media/11bV8o4fJ3vpOE/giphy.gif")
                         center top
                          no-repeat
                        `
                      })
                guessLimit = 0
                gameContinue = false;
                }
                else if(teamNumber===`${teamArray[1].id}`){
                    // event.target.style.backgroundColor = 'beige'
                    document.getElementById('neutral-modal-container').appendChild(chosenWordCard)
                    guessLimit = 0;
                    Swal.fire(
                        'Uh-oh',
                        "You hit a neutral card Your turn is up.",
                        'warning'
                      )
                      setTimeOut(() => wordHandler(event), 500)

                }
                else if(teamNumber===`${teamArray[2].id}`){
                    // event.target.style.backgroundColor = teamColorRed
                    guessLimit--    
                    chosenWordCard.className = "tiny-card";
                    // getRedContainer().append(chosenWordCard);
                    getRedModal().appendChild(chosenWordCard)
                        
                    if(currentTurn()===`${teamArray[3].id}`){
                        guessLimit = 0;
                        Swal.fire(
                            'Yikes',
                            "You hit an opponment card! Your turn is up.",
                            'error'
                          )
                        setTimeOut(() => wordHandler(event), 500)
                    }
                }
                else if(teamNumber===`${teamArray[3].id}`){
                    // event.target.style.backgroundColor = teamColorBlue
                    guessLimit--

                        
                    chosenWordCard.className = "tiny-card";
                    // getBlueContainer().append(chosenWordCard);
                    getBlueModal().appendChild(chosenWordCard)

                    if(currentTurn()===`${teamArray[2].id}`){
                        guessLimit = 0;
                        Swal.fire(
                            'Yikes',
                            "You hit an opponment card! Your turn is up.",
                            'error'
                          )
                          setTimeOut(() => wordHandler(event), 500)
                          
                    }
                }

                if(guessLimit!== 0){
                    Swal.fire('Nice Guess',
                        `You have ${guessLimit} guesses left.`, 
                        'success'
                        )
                
                }
            }

            countRedCards();
            countBlueCards();
        }
        else{
            Swal.fire('Must Enter A clue')
        }
    }
    else if(!gameContinue){Swal.fire('The game is over.')}
}

function switchTurn(e){ 

    if(gameContinue){
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
    else if(!gameContinue){
        alert('The game is over.')
    }
}

function clueFormHandler(e, currentTeam){ 
    
    
    e.preventDefault()
    let clue = e.target.clue.value 
    
    if(gameContinue){
        if(clue === ""){ 
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please enter a clue',
                
              })
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
            
            if(guesses===0){guessLimit = 99}
            else{guessLimit = guesses + 1}

            clueEntry.innerText = `${clue} ${guesses}`
            
            Swal.fire(
                `You have ${guessLimit} guesses left.`,
                )
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
    }
    else if(!gameContinue){alert('The game is over.')}
    e.target.reset()
}

function resetGameHandler(event){
 
    Swal.fire({
        title: 'Resetting Game....',
        width: 300,
        padding: '3em',
        confirmButtonText: 'Play!',
        backdrop: `
          rgba(0,0,123,0.4)
          url("https://media.giphy.com/media/UN4H6F7yjLGeY/giphy.gif")
         center top
          no-repeat
        `
      })
    teamArray = null;
    guessLimit = null;
    wordList = [];
    bluePoints = 0;
    redPoints = 0;
    if(clueWindow){
    clueWindow.close();
    clueWindow = undefined;
    }
    firstGuess = false;
    clueBeforeGuess = false;
    gameContinue = true;
    deleteChildElements(getWordContainer());
    deleteChildElements(getCurrentTurn());
    deleteChildElements(document.getElementById('red-team-ul'));
    deleteChildElements(document.getElementById('blue-team-ul'));
    deleteChildElements(document.getElementById('blue-team-container'));
    deleteChildElements(document.getElementById('red-team-container'));
    deleteChildElements(document.getElementById('neutral-team-container'));

    deleteChildElements(document.getElementById('master-key-card'));
    document.querySelector('#current-turn').dataset.id = ""
    fetchTeams();
    // clueFormStyle()
    getClueForm().style.display = "";
    
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

function getNeutralContainer(){
    return document.getElementById('neutral-team-container');
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
                Swal.fire(
                    'Youre Up!',
                     `It's ${teamArray[3].name}'s turn`,
                    'info'
                  )
                div.innerText = `It's ${teamArray[3].name}'s turn`
            }
            else if (div.dataset.id = `${teamArray[3].id}` ){ 
                div.dataset.id = `${teamArray[2].id}`
                div.innerText = `It's ${teamArray[2].name}'s turn`
                Swal.fire(
                    'Youre Up!',
                     `It's ${teamArray[2].name}'s turn`,
                    'info'
                  )
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
    // let redCards = getRedContainer().childElementCount
    let redCards = getRedModal().childElementCount

    if (redCards === redPoints){
        Swal.fire({
            title: 'Red Team Has Won!',
            width: 300,
            padding: '3em',
            confirmButtonText: 'Wohoo!',
            backdrop: `
              rgba(0,0,123,0.4)
              url("https://media.giphy.com/media/l1tN8dLRdtzU24pTod/giphy.gif")
             center top
              no-repeat
            `
          })
        gameContinue = false;
    }
}

function countBlueCards(){

    // let blueCards = getBlueContainer().childElementCount
    let blueCards = getBlueModal().childElementCount

    if (blueCards === bluePoints){
        Swal.fire({
            title: 'Red Team Has Won!',
            width: 300,
            padding: '3em',
            confirmButtonText: 'Wohoo!',
            backdrop: `
              rgba(0,0,123,0.4)
              url("https://media.giphy.com/media/5yjYSCkSpLU3e/giphy.gif")
             center top
              no-repeat
            `
          })
        gameContinue = false;
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

function animateCard(event){ 
    event.target.classList.add('animate-card')
   setTimeout( () =>event.target.classList.add('tiny-card'),1000)
}

function redModal(){ 
    let div = document.getElementById('red-team-container')
    div.addEventListener('click', showRedModal)
}

function showRedModal(){ 
    
   let test = document.getElementById('red-modal')
   test.style.display ="block"
   test.addEventListener('click', (e) => { 
       if(test.style.display ==="block"){
           test.style.display=""
       }
   })  
}

function getRedModal(){ 
    return document.getElementById('red-modal-container')
}

function blueModal(){ 
    let div = document.getElementById('blue-team-container')
    div.addEventListener('click', showBlueModal)
}

function getBlueModal(){ 
    return document.getElementById('blue-modal-container')

}

function showBlueModal(){ 
    
    let test = document.getElementById('blue-modal')
    test.style.display ="block"
    test.addEventListener('click', (e) => { 
        if(test.style.display ==="block"){
            test.style.display=""
        }
    })  
 }

 function neutralModal(){ 
    let div = document.getElementById('neutral-team-container')
    div.addEventListener('click', showNeutralModal)
}

function showNeutralModal(){ 
    let test = document.getElementById('neutral-modal')
    test.style.display ="block"
    test.addEventListener('click', (e) => { 
        if(test.style.display ==="block"){
            test.style.display=""
        }
    })  
}