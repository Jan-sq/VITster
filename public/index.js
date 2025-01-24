async function isUserLoggedIn() {
    try {
        const token = await fetch('/getAccessToken').then(res => res.text());

        if (!token) {
            return false;
        }

        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.error('Fehler bei der Überprüfung des Login-Status:', error);
        return false;
    }
}

async function loginCheck() {
    const loggedIn = await isUserLoggedIn();
    document.getElementById('start-bingo-game').addEventListener('click', () => {
        if (loggedIn) {
            window.location.href = '/gm_bingo/bingo.html';
        } else {
            const modal = new bootstrap.Modal(document.getElementById('spotifyModal'));
            modal.show();
        }
    });
}

function addEventListeners() {
    loginCheck();
}

function init() {
    addEventListeners();
}

window.addEventListener('DOMContentLoaded', init);