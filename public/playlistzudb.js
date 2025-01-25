let token;

window.onload = async () => {
    token = await fetch('/getAccessToken').then(res => res.text());
}

document.getElementById('playlistzudb_button').onclick = function () {
    const input_url = document.getElementById('playlistId').value;
    const playlistId = extractUriFromUrl(input_url);

    if (playlistId) {
        playlistZuDb(playlistId, token);
    } else {
        document.getElementById('output').innerText = 'Ungültige Spotify-Playlist-URL';
    }
}

async function playlistZuDb(playlistid, token) {
    const playlist_id = playlistid;
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks?market=DE&fields=items(track(artists(name),name,uri,explicit,album(images(url),release_date)))`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    const data = await response.json();
    document.getElementById('output').innerText = JSON.stringify(data, null, 2);

    // Daten an den Server senden, damit diese in die DB eingetragen werden
    const saveResponse = await fetch('/savePlaylist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const saveResult = await saveResponse.json();
}

function extractUriFromUrl(url) {
    try {
        const urlParts = new URL(url);
        if (urlParts.hostname !== 'open.spotify.com') {
            throw new Error('Die URL ist keine Spotify-Playlist-URL.');
        }

        const pathSegments = urlParts.pathname.split('/');
        if (pathSegments.length > 2 && pathSegments[1] === 'playlist') {
            return pathSegments[2];
        } else {
            throw new Error('Ungültige Spotify-Playlist-URL');
        }
    } catch (e) {
        console.error(e.message);
        return null;
    }
}