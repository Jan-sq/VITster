window.addEventListener('DOMContentLoaded', init);

function init() {
    document.getElementById('play-btn').addEventListener('click', getRandomCategory);
}

function getRandomCategory() {
    let catJSON = {
        'Interpret*innen': 'rgb(255, 0, 0)',
        'Songtitel': 'rgb(0, 255, 0)',
        'Veröffentlichungsjahr': 'rgb(0, 0, 255)',
        'Veröffentlichungsjahr +/-4': 'rgb(255, 255, 0)',
        'Veröffentlichungsjahr +/-2': 'rgb(255, 0, 255)',
        'Veröffentlichungsjahrzehnt': 'rgb(0, 255, 255)',
        'Vor 2000?': 'rgb(230, 157, 0)',
    }
    let keys = Object.keys(catJSON);
    let randomCategory = keys[Math.floor(Math.random() * keys.length)];
    let randomCategoryColor = catJSON[randomCategory];
    let cat_finder = document.getElementById('cat-finder');
    cat_finder.innerHTML = randomCategory;
    cat_finder.style.background = randomCategoryColor;
}
