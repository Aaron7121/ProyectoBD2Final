document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.removeEventListener('click', handleNavClick);
        link.addEventListener('click', handleNavClick);
    });


    document.getElementById('search-button').addEventListener('click', async () => {
        const query = document.getElementById('search-input').value.trim();
        const filter = document.getElementById('filterType').value;
        search(query, filter);
        if (!query) {
            alert("Por favor, ingresa un término de búsqueda.");
            return;
        }

        let url = '';
        if (filter === 'artists') {
            url = `/api/search?query=${encodeURIComponent(query)}&filter=artists`;
        } else if (filter === 'albums') {
            url = `/api/search?query=${encodeURIComponent(query)}&filter=albums`;
        }

        try {
            const response = await fetch(url);
            const results = await response.json();
            displaySearchResults(results, filter);
        } catch (error) {
            console.error("Error en la búsqueda:", error);
        }
    });

    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            const filter = document.getElementById('filterType').value;
            if (query) {
                search(query, filter);
            }
        }
    });

    loadArtists();
});







function handleNavClick(e) {
    e.preventDefault();
    const sectionId = e.target.getAttribute('data-section');
    showSection(sectionId);
    setActiveLink(e.target);
}

function navigateToSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo(0, 0);
    }
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.dataset.section;
        navigateToSection(sectionId);
        loadSectionContent(sectionId);
    });
});





function loadSectionContent(sectionId) {
    switch(sectionId) {
        case 'artists':
            loadArtistasDestacados();
            break;
        case 'albums':
            loadAlbumesPopulares();
            break;
        case 'songs':
            loadCancionesTrending();
            break;
        case 'about':
            break;
    }
}

async function loadArtistasDestacados() {
    try {
        const response = await fetch('/api/artists?sort=popularity');
        const artists = await response.json();
        renderArtists(artists);
    } catch (error) {
        console.error('Error cargando artistas:', error);
    }
}

function renderArtists(artists) {
    const container = document.getElementById('artists-container');
    container.innerHTML = '';

    artists.forEach(artist => {
        const card = document.createElement('div');
        card.className = 'artist-card clickable';
        card.innerHTML = `
            <img src="${artist.image}" alt="${artist.name}" data-id="${artist._id}">
            <h3>${artist.name}</h3>
            <p>${artist.followers} seguidores</p>
        `;

        // Evento click para ver detalles del artista
        card.addEventListener('click', () => showArtistDetail(artist._id));
        container.appendChild(card);
    });
}
async function showAlbumDetail(albumId) {
    try {
        const [album, songs] = await Promise.all([
            fetch(`/api/albums/${albumId}`).then(res => res.json()),
            fetch(`/api/albums/${albumId}/songs`).then(res => res.json())
        ]);

        let html = `
            <button class="back-button" onclick="showArtistDetail('${album.artistId}')">← Volver</button>
            <div class="album-header">
                <img src="${album.image}" class="detail-image">
                <h2>${album.name}</h2>
                <p>${album.totalTracks} canciones</p>
            </div>
            <div class="songs-list">
        `;

        songs.forEach(song => {
            html += `
                <div class="song-card clickable" data-id="${song._id}">
                    <div class="song-info">
                        <h4>${song.title}</h4>
                        <p>${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}</p>
                    </div>
                </div>
            `;
        });

        html += `</div>`;

        const detailSection = document.getElementById('album-detail');
        detailSection.innerHTML = html;
        detailSection.classList.add('active');

        // Event listeners para canciones
        document.querySelectorAll('.song-card').forEach(card => {
            card.addEventListener('click', () => showSongDetail(card.dataset.id));
        });

    } catch (error) {
        console.error('Error:', error);
    }
}


async function showSongDetail(songId) {
    try {
        const song = await fetch(`/api/songs/${songId}`).then(res => res.json());

        const html = `
            <button class="back-button" onclick="showAlbumDetail('${song.album}')">← Volver</button>
            <div class="song-header">
                <h2>${song.title}</h2>
                <p>Duración: ${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}</p>
            </div>
            <div class="lyrics-container">
                <h3>Letra</h3>
                <pre>${song.lyrics}</pre>
            </div>
        `;

        const detailSection = document.getElementById('song-detail');
        detailSection.innerHTML = html;
        detailSection.classList.add('active');

    } catch (error) {
        console.error('Error:', error);
    }
}

async function showArtistDetail(artistId) {
    try {
        const response = await fetch(`/api/artists/${artistId}`);
        const artist = await response.json();

        document.querySelector('main').style.display = 'none';
        document.getElementById('artist-detail').innerHTML = `
            <div class="detail-header">
                <button class="back-button" onclick="goBack()">← Volver</button>
                <h2>${artist.name}</h2>
            </div>
            <div class="artist-info">
                <img src="${artist.image}" class="detail-image">
                <div class="stats">
                    <p>Géneros: ${artist.genres.join(', ')}</p>
                    <p>Popularidad: ${artist.popularity}/100</p>
                </div>
            </div>
            <h3>Álbumes</h3>
            <div id="artist-albums"></div>
        `;

        document.getElementById('artist-detail').classList.add('active');
        loadAlbums(artistId);
    } catch (error) {
        console.error('Error:', error);
    }
}

function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function setActiveLink(activeLink) {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}
async function loadArtists() {
    const response = await fetch('http://localhost:3000/api/artists');
    const artists = await response.json();
    renderData(artists, 'artists-container', (artist) => `
        <h3>${artist.name}</h3>
        <img src="${artist.image}" alt="${artist.name}">
        <p>Seguidores: ${artist.followers}</p>
        <p>Géneros: ${artist.genres.join(', ')}</p>
    `);
}

function renderData(data, containerId, template) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = containerId.split('-')[0];
        div.innerHTML = template(item);
        container.appendChild(div);
    });
}
async function loadAlbums() {
    const response = await fetch('http://localhost:3000/api/albums');
    const albums = await response.json();
    renderData(albums, 'albums-container', (album) => `
        <h3>${album.name}</h3>
        <img src="${album.image}" alt="${album.name}">
        <p>Fecha de lanzamiento: ${new Date(album.releaseDate).toLocaleDateString()}</p>
        <p>Canciones: ${album.totalTracks}</p>
    `);
}


async function loadSongs() {
    const response = await fetch('http://localhost:3000/api/songs');
    const songs = await response.json();
    renderData(songs, 'songs-container', (song) => `
        <h3>${song.title}</h3>
        <p>Duración: ${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}</p>
        <p>Álbum: ${song.album}</p>
    `);
}


document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('data-section');
        showSection(sectionId);
        setActiveLink(link);

        if (sectionId === 'artists') loadArtists();
        if (sectionId === 'albums') loadAlbums();
        if (sectionId === 'songs') loadSongs();
    });
})
/*function goBack() {
    document.querySelector('main').style.display = 'block';
    document.querySelector('.detail-page').classList.remove('active');
}*/

//seaarchs buscadores

async function performSearch() {
    const searchTerm = document.getElementById('searchInput').value;
    const filterType = document.getElementById('filterType').value;
    const filterGenre = document.getElementById('filterGenre').value;

    let endpoint = '';
    switch(filterType) {
        case 'artists': endpoint = '/api/artists'; break;
        case 'albums': endpoint = '/api/albums'; break;
        case 'songs': endpoint = '/api/songs'; break;
        default: endpoint = '/api/search?q=' + searchTerm; // Implementar endpoint de búsqueda global
    }

    const response = await fetch(`${endpoint}?search=${searchTerm}&genre=${filterGenre}`);
    const results = await response.json();
    renderSearchResults(results, filterType);
}

// Renderizado de resultados de búsqueda
function renderSearchResults(results, type) {
    const container = document.getElementById(`${type}-container`);
    container.innerHTML = '';

    results.forEach(item => {
        const card = document.createElement('div');
        card.className = type;
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name || item.title}</h3>
            ${type === 'artists' ? `<p>Seguidores: ${item.followers}</p>` : ''}
            ${type === 'songs' ? `<p>Duración: ${formatDuration(item.duration)}</p>` : ''}
        `;
        card.addEventListener('click', () => showDetail(type, item._id));
        container.appendChild(card);
    });
}

async function showDetail(type, id) {
    const response = await fetch(`/api/${type}/${id}`);
    const data = await response.json();

    const detailSection = document.getElementById(`${type}-detail`);
    detailSection.innerHTML = `
        <button class="back-button" onclick="history.back()">← Volver</button>
        ${type === 'artists' ? `
            <div class="artist-header">
                <img src="${data.image}" alt="${data.name}">
                <h2>${data.name}</h2>
                <p>${data.followers} seguidores</p>
            </div>
            <div class="albums-grid">
                ${data.albums.map(album => `
                    <div class="album-card" onclick="showDetail('albums', '${album._id}')">
                        <img src="${album.image}" alt="${album.name}">
                        <h4>${album.name}</h4>
                    </div>
                `).join('')}
            </div>
        ` : ''}
    `;

    // Ocultar todas las secciones y mostrar el detalle
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    detailSection.classList.add('active');
}

//logica de buscar
async function search(query, filter) {
    if (!query.trim()) {
        alert('Por favor ingrese un término de búsqueda');
        return;
    }

    try {
        const searchUrl = `/api/search?query=${encodeURIComponent(query)}&filter=${filter}`;
        const response = await fetch(searchUrl);
        const results = await response.json();

        displaySearchResults(results, filter);
        showSection('search-results');
    } catch (error) {
        console.error('Error en búsqueda:', error);
        alert('Error al realizar la búsqueda');
    }
}

function displaySearchResults(results, filter) {
    const container = document.getElementById('search-results-container');
    container.innerHTML = '';

    if (results.length === 0) {
        container.innerHTML = '<p class="no-results">No se encontraron resultados</p>';
        return;
    }

    if (filter === 'artists') {
        results.forEach(artist => {
            const artistCard = document.createElement('div');
            artistCard.className = 'grid-item artist-card';

            artistCard.innerHTML = `
                <a href="${artist.url}" target="_blank" class="artist-image-link">
                    <img src="${artist.image}" alt="${artist.name}" class="artist-image">
                </a>
                <div class="artist-info">
                    <h3>
                        <a href="#" class="artist-name" data-artist-id="${artist._id}">
                            ${artist.name}
                        </a>
                    </h3>
                    <p class="followers">Seguidores: ${artist.followers.toLocaleString()}</p>
                    <p class="popularity">Popularidad: ${artist.popularity}</p>
                    <p class="genres">Géneros: ${artist.genres.join(', ')}</p>
                </div>
            `;


            container.appendChild(artistCard);
        });
        // Agregar event listeners para los nombres de artistas
        document.querySelectorAll('.artist-name').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const artistId = e.target.dataset.artistId;
                await loadArtistDetails(artistId);
            });
        });
    } else if (filter === 'albums') {
        results.slice(0, 18).forEach(album => {
            const albumCard = document.createElement('div');
            albumCard.className = 'grid-item album-card';

            albumCard.innerHTML = `
                <a href="${album.spotify_url}" target="_blank" class="album-image-link">
                    <img src="${album.image }" alt="${album.name}" class="album-image">
                </a>
                <div class="album-info">
                    <h3>${album.name}</h3>
                    <p class="release-date">Lanzamiento: ${new Date(album.releaseDate).toLocaleDateString()}</p>
                    <p class="total-tracks">Canciones: ${album.releaseDate}</p>
                </div>
            `;

            container.appendChild(albumCard);
        });
    }
} 

async function loadArtistDetails(artistId) {
    try {
        const response = await fetch(`/api/artists/${artistId}`);
        const data = await response.json();
        displayArtistDetails(data);
        showSection('artist-detail');
    } catch (error) {
        console.error('Error:', error);
    }
}
function displayArtistDetails({ artist, albums }) {
    const container = document.getElementById('artist-detail');
    container.innerHTML = `
        <button class="back-button" onclick="history.back()">← Volver</button>
        <div class="albums-grid">
            ${albums.map(album => `
                <div class="album-card">
                    <a href="#" class="album-link" data-album-id="${album._id}">
                        <img src="${album.image}" alt="${album.name}" class="album-image">
                    </a>
                    <h3>${album.name}</h3>
                    <p>Canciones: ${album.totalTracks}</p>
                    <p>Fecha: ${new Date(album.releaseDate).toLocaleDateString()}</p>
                </div>
            `).join('')}
        </div>
    `;

    // Actualizar event listeners para los álbumes
    document.querySelectorAll('.album-link').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const albumId = e.target.closest('.album-link').dataset.albumId;
            const artistId = document.querySelector('.artist-name').dataset.artistId;
            await loadAlbumSongs(artistId, albumId);
        });
    });
}

//despliegue de las cancionesde lops albumes
async function loadAlbumSongs(artistId, albumId) {
    try {
        const response = await fetch(`/api/artists/${artistId}/album/${albumId}`);
        const data = await response.json();
        displayAlbumSongs(data);
        showSection('album-detail');
    } catch (error) {
        console.error('Error:', error);
    }
}
function displayAlbumSongs({ album, songs }) {
    const container = document.getElementById('album-detail');
    container.innerHTML = `
        <h2>${album.name}</h2>
        <div class="songs-list">
            ${songs.map(song => `
                <div class="song-item">
                    <h3>${song.title}</h3>
                    <a href="${song.url}" target="_blank" class="spotify-link">
                        Escuchar en Spotify
                    </a>
                    <button class="view-lyrics" data-song-id="${song._id}">
                        Ver letra
                    </button>
                </div>
            `).join('')}
        </div>
    `;

    // Event listeners para los botones de letra
    document.querySelectorAll('.view-lyrics').forEach(button => {
        button.addEventListener('click', function() {
            const songId = this.dataset.songId;
            const song = songs.find(s => s._id === songId);
            if (song.lyrics) {
                showLyrics(song.title, song.lyrics);
            }
        });
    });
}
function showLyrics(title, lyrics) {
    const modal = document.createElement('div');
    modal.className = 'lyrics-modal';
    modal.innerHTML = `
        <div class="lyrics-content">
            <h3>${title}</h3>
            <pre>${lyrics}</pre>
            <button class="close-lyrics">Cerrar</button>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.close-lyrics').addEventListener('click', () => {
        modal.remove();
    });
}