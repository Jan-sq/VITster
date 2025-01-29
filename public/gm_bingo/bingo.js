let currentDeviceId;
let player;

let trackData = {
    'track_uri': '',
    'track_name': '',
    'artist_name': '',
    'release_date': '',
    'track_cover': ''
}

function init() {
    if (currentDeviceId) {
        console.log('Player ready');
        transferPlayback();
        addEventListeners();
    } else {
        console.log('Player not ready yet');
        setTimeout(init, 1000);
    }
}

function addEventListeners() {
    document.getElementById('new-round-btn').addEventListener('click', nextRound);
    document.getElementById('prev-btn').addEventListener('click', fromBeginning);
    document.getElementById('playpause-btn').addEventListener('click', changePausePlay);
    document.getElementById('next-btn').addEventListener('click', skipCurrentTrack);
}

function changePausePlay() {
    if (document.getElementById('iconPlayPause').classList.contains('bi-pause')) {
        pause();
        iconsPauseToPlay();
    } else {
        resume();
        iconsPlayToPause();
    }
}

function iconsPlayToPause() {
    let icon = document.getElementById('iconPlayPause');
    icon.classList.remove('bi-play', 'play-icon');
    icon.classList.add('bi-pause', 'pause-icon');
}

function iconsPauseToPlay() {
    let icon = document.getElementById('iconPlayPause');
    icon.classList.remove('bi-pause', 'pause-icon');
    icon.classList.add('bi-play', 'play-icon');
}

function skipCurrentTrack() {
    if (document.getElementById('iconPlayPause').classList.contains('bi-play')) {
        iconsPlayToPause();
    }
    playRandomTrack();
}



// --------------------SpotifyShit--------------------
    // Wiedergabesteuerung an Browser übertragen 
async function transferPlayback () {
    const token = await fetch('/getAccessToken').then(res => res.text());
    const uebertrageWiedergabe = await fetch(`https://api.spotify.com/v1/me/player`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            device_ids: [currentDeviceId],
            play: false
        })
    });        
    console.log('Wiedergabesteuerung erfolgreich übertragen!');
}

    // Song abspielen
async function playRandomTrack() {
    const token = await fetch('/getAccessToken').then(res => res.text());
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
    if (player) {
        player.pause();
        console.log('Song wird pausiert!');
    }
}

    // Song fortsetzen
function resume() {
    if (player) {
        player.resume();
        console.log('Song wird fortgesetzt!');
    }
}

    // Song von vorne abspielen
function fromBeginning() {
    if (player) {
        player.seek(0).then(() => {
            console.log('Song wird von vorne abgespielt!');
        });
    }
}

function playPause() {
    if (player) {
        player.togglePlay();
        console.log('Song wird pausiert/fortgesetzt!');
    }
}

async function addToFavorites() {
    try {
        const token = await fetch('/getAccessToken').then(res => res.text());
        
        let track_uri = trackData.track_uri;
        console.log('Original Track URI:', track_uri);
        track_uri = track_uri.replace('spotify:track:', '');
        console.log('Bereinigte Track URI:', track_uri);

        const response = await fetch(`https://api.spotify.com/v1/me/tracks?ids=${track_uri}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            updateFavoriteIcon(true);
            console.log('Track erfolgreich zu den Favoriten hinzugefügt.');
        } else {
            console.error('Fehler beim Hinzufügen zu den Favoriten:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Ein Fehler ist aufgetreten:', error);
    }
}


async function checkIfInFavorites() {
    try {
        const token = await fetch('/getAccessToken').then(res => res.text());
        
        let track_uri = trackData.track_uri;
        console.log(track_uri);
        track_uri = track_uri.replace('spotify:track:', '');
        console.log(track_uri);

        const response = await fetch(`https://api.spotify.com/v1/me/tracks/contains?ids=${track_uri}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const isInFavorites = data[0];
            updateFavoriteIcon(isInFavorites);
        } else {
            console.error('Fehler beim Überprüfen der Favoriten:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Ein Fehler ist aufgetreten:', error);
    }
}


// --------------------NonSpotifyShit--------------------
function nextRound() {
    document.getElementById('new-round-btn').classList.add('disabled');
    if (document.getElementById('iconPlayPause').classList.contains('bi-pause')) {
        iconsPauseToPlay();
    }
    pause();
    document.getElementById('cat-finder').classList.remove('VITster-shadow-box');
    hideSolution();
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
            if (document.getElementById('iconPlayPause').classList.contains('bi-play')) {
                iconsPlayToPause();
            }
            playRandomTrack();
            roundTimer();
        }
    }
    durchlauf();
}

function roundTimer() {
    let timerText = document.getElementById('timer');
    let timer = 25;
    timerText.innerText = timer;
    let timerInterval = setInterval(() => {
        timer--;
        timerText.innerText = timer;
        if (timer <= 0) {
            clearInterval(timerInterval);
            pause();
            iconsPauseToPlay();
            showSolution();
            document.getElementById('new-round-btn').classList.remove('disabled');
        }
    }, 1000);
}

function showSolution() {
    // timerContainer schnappen und innerText ändern zu Button
    let timerContainer = document.getElementById('VITster-timer-container');
    let button = document.createElement('button');
    let eyeIcon = document.createElement('i');
    eyeIcon.classList.add('bi', 'bi-eye');
    button.classList.add('btn', 'btn-dark', 'VITster-shadow-box', 'VITster-shadow-text', 'w-100', 'h-100');
    button.id = 'showSolutionBtn';
    button.appendChild(eyeIcon);
    timerContainer.appendChild(button);
    document.getElementById('timer').classList.replace('d-flex', 'd-none');


    let trackCover = document.getElementById('trackCover');
    let trackName = document.getElementById('trackName');
    let trackArtists = document.getElementById('trackArtists');
    let trackDate = document.getElementById('trackDate');

    trackCover.src = trackData.track_cover;
    trackName.innerText = trackData.track_name;
    trackArtists.innerText = trackData.artist_name;
    trackDate.innerText = trackData.release_date.substring(0, 4);
    //hier denn Button einen EventListener geben, der die Lösung zeigt und dann die beiden folgenden Zeilen ausführt
    button.addEventListener('click', () => {
        document.getElementById('VITster-img-container').classList.replace('d-none', 'd-flex');
        document.getElementById('VITster-timer-container').classList.replace('d-flex', 'd-none');
        timerContainer.removeChild(button);
    })

    const addFavoriteBtn = document.getElementById('addFavouriteBtn');
    addFavoriteBtn.classList.remove('d-none');
    checkIfInFavorites();
}

function hideSolution() {
    let trackCover = document.getElementById('trackCover');
    let trackName = document.getElementById('trackName');
    let trackArtists = document.getElementById('trackArtists');
    let trackDate = document.getElementById('trackDate');

    trackCover.src = '';
    trackName.innerText = '';
    trackArtists.innerText = '';
    trackDate.innerText = '';
    if (document.getElementById('showSolutionBtn'))
        document.getElementById('showSolutionBtn').remove();
    document.getElementById('timer').classList.replace('d-none', 'd-flex');
    document.getElementById('timer').innerText = '25';
    document.getElementById('VITster-img-container').classList.replace('d-flex', 'd-none');
    document.getElementById('VITster-timer-container').classList.replace('d-none', 'd-flex');

    const addFavBtn = document.getElementById('addFavouriteBtn');
    addFavBtn.classList.add('d-none');
}

function updateFavoriteIcon(isFavorited) {
    const addFavBtn = document.getElementById('addFavouriteBtn');
    const icon = addFavBtn.querySelector('i');

    if (isFavorited) {
        icon.classList.remove('bi-bookmark-heart');
        icon.classList.add('bi-bookmark-heart-fill');
    } else {
        icon.classList.remove('bi-bookmark-heart-fill');
        icon.classList.add('bi-bookmark-heart');
    }
}

document.getElementById('addFavouriteBtn').addEventListener('click', async () => {
    await addToFavorites();
});

// --------------------Data Handler--------------------
    //random track aus DB holen
async function getRandomTrack() {
    const track = await fetch('/getRandomTrack').then(res => res.json());
    console.log(track);
    trackuri = track.track_uri;
    trackData = {
        'track_uri': track.track_uri,
        'track_name': track.track_name,
        'artist_name': track.artist_name,
        'track_cover': track.track_cover,
        'release_date': track.release_date
    }
    return trackuri;
}

    //checken ob track schon gespielt wurde
function isAlreadyPlayed(trackUri) {
    const history = JSON.parse(sessionStorage.getItem('playedTracks')) || [];
    return history.includes(trackUri);
}

    //track in history hinzufügen
function addTrackToHistory(trackUri) {
    const history = JSON.parse(sessionStorage.getItem('playedTracks')) || [];
    history.push(trackUri);
    sessionStorage.setItem('playedTracks', JSON.stringify(history));
}

// --------------------Ab hier Sp(h)otifyShit--------------------
window.onSpotifyWebPlaybackSDKReady = async () => {
    const token = await fetch('/getAccessToken').then(res => res.text());
    console.log(token);
    player = new Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.1
    });

    // Ready
    player.addListener('ready', ({ device_id }) => {
        currentDeviceId = device_id;
        console.log('Ready with Device ID', device_id);
        init();
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

    player.connect();
}