document.domain = 'index.html'
// document.origin = 'index.html'

document.addEventListener("DOMContentLoaded", (e)=> {

    console.log('Connected to clues.js')

    let clueCollection = window.opener.getClueCardsForCluePage();
    console.log(clueCollection);
    debugger;
})

function displayClueCards(){
    wordList.forEach(word => {
        renderClueCard(word);
    })
}

function renderClueCard(word){

    console.log(word)
}


function getClueContainer(){
    document.getElementById('master-key-card-clues-page')
}