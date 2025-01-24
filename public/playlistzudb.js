let token;

window.onload = async () => {
    token = await fetch('/getAccessToken').then(res => res.text());
}

document.getElementById('playlistzudb_button').onclick = function () {
    const input_playlistid = document.getElementById('playlistId').value;
    playlistZuDb(input_playlistid, token);
}

async function playlistZuDb(playlistid, token) {
    const playlist_id = playlistid;
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks?market=DE&fields=items(track(artists(name),name,uri,explicit,album(images(url))))`, {
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