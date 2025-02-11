document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
            setActiveLink(link);
        });
    });

    document.getElementById('search-button').addEventListener('click', () => {
        const query = document.getElementById('search-input').value;
        const filter = document.getElementById('filter-select').value;
        search(query, filter);
    });

    loadArtists();
});
// Manejar la navegación entre secciones
function navigateToSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });

    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo(0, 0); // Volver al inicio de la página
    }
}

// Event listeners para los enlaces del menú
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.dataset.section;
        navigateToSection(sectionId);
        loadSectionContent(sectionId); // Cargar datos dinámicos
    });
});

// Cargar contenido según la sección
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
            // No necesita carga dinámica
            break;
    }
}

async function loadArtistasDestacados() {
    try {
        const response = await fetch('/api/artists?sort=popularity');
        const artists = await response.json();
        renderArtistas(artists);
    } catch (error) {
        console.error('Error cargando artistas:', error);
    }
}

function renderArtistas(artists) {
    const container = document.getElementById('artists-container');
    container.innerHTML = ''; // Limpiar contenido previo

    artists.forEach(artist => {
        const card = `
            <div class="artist-card">
                <img src="${artist.image}" alt="${artist.name}">
                <h3>${artist.name}</h3>
                <p>${artist.followers} seguidores</p>
                <button onclick="showArtistDetail('${artist._id}')">Ver detalle</button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', card);
    });
}
async function showArtistDetail(artistId) {
    try {
        const response = await fetch(`/api/artists/${artistId}`);
        const artist = await response.json();

        // Ocultar main y mostrar detalle
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
        loadAlbumesDelArtista(artistId); // Cargar álbumes
    } catch (error) {
        console.error('Error:', error);
    }
}

function goBack() {
    document.querySelector('main').style.display = 'block';
    document.querySelector('.detail-page').classList.remove('active');
}









async function search(query, filter) {
    let url = `http://localhost:3000/api/search?query=${query}&filter=${filter}`;
    const response = await fetch(url);
    const results = await response.json();
    renderSearchResults(results);
}

function renderSearchResults(results) {
    const container = document.getElementById('search-results-container');
    container.innerHTML = '';
    results.forEach(result => {
        const div = document.createElement('div');
        div.className = 'search-result';
        div.innerHTML = `
            <h3>${result.name}</h3>
            <img src="${result.image}" alt="${result.name}">
            <p>${result.description}</p>
        `;
        container.appendChild(div);
    });
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
});

// Función de búsqueda unificada
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

// Función para mostrar detalles
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