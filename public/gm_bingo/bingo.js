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
            // playRandomTrack();
        }
    }
    durchlauf();
}


// Ab hier Sp(h)otifyShit
window.onSpotifyWebPlaybackSDKReady = async () => {
    const token = await fetch('/getAccessToken').then(res => res.text());
    console.log(token);
    const player = new Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.1
    });

    // Ready
    player.addListener('ready', ({ device_id }) => {
        currentDeviceId = device_id;
        console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    player.addListener('initialization_error', ({ message }) => {
        console.error(message);
    });

    player.addListener('authentication_error', ({ message }) => {
        console.error(message);
    });

    player.addListener('account_error', ({ message }) => {
        console.error(message);
    });
    
    //DIESEN BTN NOCH EINBAUEN
    document.getElementById('transferPlayback').addEventListener('click', transferPlayback);
    
    // Wiedergabesteuerung an Brwoser übertragen 
    async function transferPlayback () {
        const uebertrageWiedergabe = await fetch(`https://api.spotify.com/v1/me/player`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                device_ids: [currentDeviceId]
            })
        });        
        console.log('Wiedergabesteuerung erfolgreich übertragen!');
    }

    // Zufälligen Song aus der Datenbank holen
    async function getRandomTrack() {
        const track = await fetch('/getRandomTrack').then(res => res.json());
        trackuri = track.track_uri;
        return trackuri;
    }

    function isAlreadyPlayed(trackUri) {
        const history = JSON.parse(localStorage.getItem('playedTracks')) || [];
        return history.includes(trackUri);
    }

    function addTrackToHistory(trackUri) {
        const history = JSON.parse(localStorage.getItem('playedTracks')) || [];
        history.push(trackUri);
        localStorage.setItem('playedTracks', JSON.stringify(history));
    }

    // Song abspielen
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

    // Song pausieren
    function pause() {
        player.pause();
        console.log('Song wird pausiert!');
    }

    // Song fortsetzen
    function resume() {
        player.resume();
        console.log('Song wird fortgesetzt!');
    }

    player.connect();
}