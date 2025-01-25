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

// --------------------NonSpotifyShit--------------------
function nextRound() {
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
        }
    }, 1000);
}

function showSolution() {
    let trackCover = document.getElementById('trackCover');
    let trackName = document.getElementById('trackName');
    let trackArtists = document.getElementById('trackArtists');
    let trackDate = document.getElementById('trackDate');

    trackCover.src = trackData.track_cover;
    trackName.innerText = trackData.track_name;
    trackArtists.innerText = trackData.artist_name;
    trackDate.innerText = trackData.release_date.substring(0, 4);
    document.getElementById('VITster-img-container').classList.replace('d-none', 'd-flex');
    document.getElementById('VITster-timer-container').classList.replace('d-flex', 'd-none');
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
    document.getElementById('VITster-img-container').classList.replace('d-flex', 'd-none');
    document.getElementById('VITster-timer-container').classList.replace('d-none', 'd-flex');
}

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