window.onSpotifyWebPlaybackSDKReady = () => {
    const token = 'BQDR09rIel47fKuE0HCVPCf8ZuTAZ5-vAh3w5fM14ewKDI8ppwqay_PfrmxVnqBJ1N31Zs5k9isCvvUSOuvCyyXSMRb0fx_Q7o7wm4Xg2hlY4upnmrbJjr28-7rj81Z1DHBVNgPXhfHVgXMO9JIE56SyEbnJVzfKG4yHD1-Um4H3efkt0r36rcsrnifAzI3CPuM7MQVgUesUwUplSIFJHx81vysdTJL1kToY';
    const player = new Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.1
    });

    // Ready
    player.addListener('ready', ({ device_id }) => {
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

    document.getElementById('startBingo').onclick = function() {
      player.togglePlay();
    };

    player.connect();
}