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

    // Song URI übergeben und starten
    document.getElementById('startBingo').onclick = async function () {
        console.log(token);
        

        // Song abspielen
        const trackUri = "spotify:track:3rUGC1vUpkDG9CZFHMur1t";

        const songAbspielen = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${currentDeviceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                uris: [trackUri]
            })
        });
        console.log('Song wird abgespielt!');

    };

    document.getElementById('pause').onclick = async function () {
        player.togglePlay();


        const songPausieren = await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${currentDeviceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Song wird pausiert!');

    }

    document.getElementById('resume').onclick = async function () {
        const songResume = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${currentDeviceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Song wird weiter abgespielt!');
    }

    player.connect();
}