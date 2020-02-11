const teamColorRed = '#AA2D19'
const teamColorBlue = '#99b3ff'
const teamColorAssasin = '#403251'
const teamColorNeutral = 'beige';


document.addEventListener("DOMContentLoaded", (e)=> {

    console.log('Connected to clues.js');

    fetchClues();
})


function getClueContainer(){
    return document.getElementById('master-key-card-clues-page')
}


function fetchClues(){

    fetch('http://localhost:3000/current_games')
        .then(response => response.json())
        .then(words => words.forEach(word => renderClues(word)))
}


function renderClues(word){
    let name = word.name;
    let team = parseInt(word.team_id, 10);
    console.log(`name: ${name} team: ${team}`)
    let newClue = document.createElement('div');
    newClue.dataset.team = team;
    newClue.innerText = name;
    newClue.className = "master-card";
    getClueContainer().appendChild(newClue);

    if(newClue.dataset.team ===`1`){
        newClue.style.backgroundColor = teamColorAssasin
    }
    else if(newClue.dataset.team === `2`){
        newClue.style.backgroundColor = teamColorNeutral;
    }
    else if(newClue.dataset.team === `3`){
        newClue.style.backgroundColor = teamColorRed
    }
    else if(newClue.dataset.team === `4`){
        newClue.style.backgroundColor = teamColorBlue
    }
}