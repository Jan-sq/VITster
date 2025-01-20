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

    document.getElementById('startBingo').onclick = async function () {
        console.log(token);
        player.togglePlay();

        // Wiedergabesteuerung an Brwoser übertragen
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

    player.connect();
}