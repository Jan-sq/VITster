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

    // Wiedergabesteuerung an Brwoser übertragen 
    document.getElementById('transferPlayback').onclick = async function () {
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

    // Song URI übergeben und starten
    document.getElementById('startBingo').onclick = async function () { 
        await playRandomTrack();
    };

    // Song pausieren
    document.getElementById('pause').onclick = function () {
        player.pause();
        console.log('Song wird pausiert!');

    }

    // Song fortsetzen
    document.getElementById('resume').onclick = function () {
        player.resume();
        console.log('Song wird weiter abgespielt!');
    }

    player.connect();
}