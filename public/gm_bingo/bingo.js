window.addEventListener('DOMContentLoaded', init);

function init() {
    document.getElementById('new-round-btn').addEventListener('click', nextRound);
    // document.getElementById('new-round-btn').addEventListener('click', startSlowRandomPicker);
}

function nextRound() {
    document.getElementById('cat-finder').classList.remove('VITster-shadow-box');
    startSlowRandomPicker();
}

function getRandomCategory() {
    let catJSON = {
        'Interpret*innen': {"bgColor":'rgb(255, 0, 0)', "fontColor":'rgb(0, 0, 0)'},
        'Songtitel': {"bgColor":'rgb(0, 255, 0)', "fontColor":'rgb(0, 0, 0)'},
        'Veröffentlichungsjahr': {"bgColor":'rgb(0, 0, 255)', "fontColor":'rgb(255, 255, 255)'},
        'Veröffentlichungsjahr +/-4': {"bgColor":'rgb(255, 255, 0)', "fontColor":'rgb(0, 0, 0)'},
        'Veröffentlichungsjahr +/-2': {"bgColor":'rgb(255, 0, 255)', "fontColor":'rgb(0, 0, 0)'},
        'Veröffentlichungsjahrzehnt': {"bgColor":'rgb(0, 255, 255)', "fontColor":'rgb(0, 0, 0)'},
        'Vor 2000?': {"bgColor":'rgb(230, 157, 0)', "fontColor":'rgb(0, 0, 0)'},
    }
    let keys = Object.keys(catJSON);
    let randomCategory = keys[Math.floor(Math.random() * keys.length)];
    let randomCategoryColor = catJSON[randomCategory];
    let cat_finder = document.getElementById('cat-finder');
    cat_finder.innerHTML = randomCategory;
    cat_finder.style.background = randomCategoryColor["bgColor"];
    cat_finder.style.color = randomCategoryColor["fontColor"];
}

// Gesamtdauer in Millisekunden
function startSlowRandomPicker() {
    const gesamtDauer = 4000;
    let delay = 50;
    const verzögerungsFaktor = 1.1;
    const startZeit = Date.now();

    function durchlauf() {
        getRandomCategory();
        const verstricheneZeit = Date.now() - startZeit;

        if (verstricheneZeit < gesamtDauer) {
            delay *= verzögerungsFaktor;
            setTimeout(durchlauf, delay);
        } else {
            getRandomCategory();
            document.getElementById('cat-finder').classList.add('VITster-shadow-box');
            playRandomTrack();
        }
    }
    durchlauf();
}

async function playRandomTrack() {
    try {
        const randomTrackUri = await getRandomTrack();

        if (isAlreadyPlayed(randomTrackUri)) {
            return playRandomTrack();
        }

        const playResponse = await fetch(
            `https://api.spotify.com/v1/me/player/play?device_id=${currentDeviceId}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    uris: [randomTrackUri]
                })
            }
        );

        if (!playResponse.ok) {
            throw new Error('Fehler beim Abspielen des Songs');
        }
        console.log('Song wird abgespielt:', randomTrackUri);
        addTrackToHistory(randomTrackUri);
    }
    catch (error) {
        console.error(error);
    }
}