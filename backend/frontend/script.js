document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.removeEventListener('click', handleNavClick); // Evitar duplicados
        link.addEventListener('click', handleNavClick);
    });

    document.getElementById('search-button').addEventListener('click', () => {
        const query = document.getElementById('search-input').value;
        const filter = document.getElementById('filterType').value;
        search(query, filter);
    });

    // Agregar búsqueda al presionar Enter en el campo de búsqueda
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value;
            const filter = document.getElementById('filterType').value;
            search(query, filter);
        }
    });

    loadArtists(); // Cargar artistas al inicio
    loadAlbums(); // Cargar álbumes al inicio
    loadTopContent(); // Cargar contenido de inicio
});

// Modificar la función loadTopContent
async function loadTopContent() {
    try {
        // Cargar artistas top (aumentamos a 10)
        const artistsResponse = await fetch('/api/artists?sort=popularity&limit=10');
        const topArtists = await artistsResponse.json();

        // Cargar álbumes 2024 (aumentamos a 10)
        const albums2024Response = await fetch('/api/albums?year=2024&sort=releaseDate&limit=10');
        const albums2024 = await albums2024Response.json();

        // Cargar álbumes 2023 (aumentamos a 10)
        const albums2023Response = await fetch('/api/albums?year=2023&sort=releaseDate&limit=10');
        const albums2023 = await albums2023Response.json();

        // Cargar canciones trending (aumentamos a 10)
        const songsResponse = await fetch('/api/songs?sort=popularity&limit=10');
        const topSongs = await songsResponse.json();

        displayTopArtists(topArtists);
        displayTopAlbums(albums2024, '2024');
        displayTopAlbums(albums2023, '2023');
        displayTopSongs(topSongs);
    } catch (error) {
        console.error('Error cargando contenido top:', error);
    }
}

// Añadir función para mostrar álbumes
function displayTopAlbums(albums, year) {
    const container = document.getElementById(`top-albums-${year}`);
    container.innerHTML = '';

    albums.forEach(album => {
        const card = document.createElement('div');
        card.className = 'top-artist-card';
        card.innerHTML = `
            <div class="album-card" data-album-id="${album._id}">
                <img src="${album.image}" alt="${album.name}" class="top-artist-image">
                <div class="top-artist-info">
                    <h3 class="top-artist-name">${album.name}</h3>
                    <p class="top-artist-followers">
                        ${new Date(album.releaseDate).toLocaleDateString()}
                    </p>
                </div>
            </div>
        `;

        // Añadir event listener para ver detalles del álbum
        card.addEventListener('click', () => loadDirectAlbumDetails(album._id));
        container.appendChild(card);
    });
}

function displayTopArtists(artists) {
    const container = document.getElementById('top-artists');
    container.innerHTML = '';

    artists.forEach(artist => {
        const card = document.createElement('div');
        card.className = 'top-artist-card';
        card.innerHTML = `
            <a href="${artist.url}" target="_blank" class="artist-image-link">
                <img src="${artist.image}" alt="${artist.name}" class="top-artist-image">
            </a>
            <div class="top-artist-info">
                <a href="#" class="top-artist-name" data-artist-id="${artist._id}">${artist.name}</a>
                <p class="top-artist-followers">${artist.followers.toLocaleString()} seguidores</p>
            </div>
        `;

        container.appendChild(card);

        // Event listener para el nombre del artista
        card.querySelector('.top-artist-name').addEventListener('click', async (e) => {
            e.preventDefault();
            const artistId = e.target.dataset.artistId;
            await loadArtistDetails(artistId);
        });
    });
}

// Modificar displayTopSongs para incluir funcionalidad de Spotify y letras
function displayTopSongs(songs) {
    const container = document.getElementById('top-songs');
    container.innerHTML = '';

    songs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
            <div class="song-info">
                <a href="${song.url}" target="_blank" class="top-song-title">
                    ${song.title}
                </a>
                <p class="song-duration">Duración: ${formatDuration(song.duration)}</p>
                ${song.lyrics ?
            `<button class="view-lyrics" data-lyrics="${encodeURIComponent(song.lyrics)}"
                     data-title="${song.title}">Ver letra</button>` :
            ''}
            </div>
        `;

        // Event listener para el botón de letras
        const lyricsBtn = card.querySelector('.view-lyrics');
        if (lyricsBtn) {
            lyricsBtn.addEventListener('click', () => {
                const lyrics = decodeURIComponent(lyricsBtn.dataset.lyrics);
                const title = lyricsBtn.dataset.title;
                showLyrics(title, lyrics);
            });
        }

        container.appendChild(card);
    });
}

function handleNavClick(e) {
    e.preventDefault();
    const sectionId = e.target.getAttribute('data-section');
    showSection(sectionId);
    setActiveLink(e.target);
}

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
        // case 'songs':
        //  loadCancionesTrending();
        //  break;
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
    container.innerHTML = '';

    artists.forEach(artist => {
        const card = `
            <div class="artist-card animated fadeIn" data-artist-id="${artist._id}">
                <div class="artist-image-container">
                    <img src="${artist.image}" alt="${artist.name}" class="artist-image">
                </div>
                <div class="artist-info">
                    <h3>${artist.name}</h3>
                    <p class="artist-followers">Seguidores: ${artist.followers.toLocaleString()}</p>
                    <p class="artist-genres">Géneros: ${artist.genres.join(', ')}</p>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', card);
    });

    // Agregar event listeners para los artistas
    document.querySelectorAll('.artist-card').forEach(card => {
        card.addEventListener('click', async (e) => {
            const artistId = card.dataset.artistId;
            await loadArtistDetails(artistId);
        });
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

// Modificar la función goBack existente
function goBack() {
    // Ocultar las páginas de detalle
    document.querySelectorAll('.detail-page').forEach(page => {
        page.classList.remove('active');
    });

    // Determinar la última sección activa o volver a inicio por defecto
    let lastSection = localStorage.getItem('lastSection') || 'home';

    // Mostrar la sección principal
    showSection(lastSection);

    // Actualizar la navegación
    const navLink = document.querySelector(`.nav-links a[data-section="${lastSection}"]`);
    if (navLink) {
        setActiveLink(navLink);
    }
}

async function search(query, filter) {
    if (!query.trim()) {
        alert('Por favor ingrese un término de búsqueda');
        return;
    }

    try {
        console.log('Realizando búsqueda:', { query, filter }); // Para debugging
        const searchUrl = `/api/search?query=${encodeURIComponent(query)}&filter=${filter}`;
        const response = await fetch(searchUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const results = await response.json();
        console.log('Resultados recibidos:', results); // Para debugging

        displaySearchResults(results, filter);
        showSection('search-results');
    } catch (error) {
        console.error('Error en búsqueda:', error);
        alert('Error al realizar la búsqueda');
    }
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

// Modificar la función showSection para guardar la última sección visitada
function showSection(sectionId) {
    // Guardar la sección actual antes de cambiar
    if (!sectionId.includes('detail')) {
        localStorage.setItem('lastSection', sectionId);
    }

    // Ocultar todas las secciones
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });

    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
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
        <div class="artist-card animated fadeIn" data-artist-id="${artist._id}">
            <div class="artist-image-container">
                <img src="${artist.image}" alt="${artist.name}" class="artist-image">
            </div>
            <div class="artist-info">
                <h3>${artist.name}</h3>
                <p class="artist-followers">Seguidores: ${artist.followers.toLocaleString()}</p>
                <p class="artist-genres">Géneros: ${artist.genres.join(', ')}</p>
            </div>
        </div>
    `);

    // Mantener solo el event listener para el click en la tarjeta
    document.querySelectorAll('.artist-card').forEach(card => {
        card.addEventListener('click', async (e) => {
            const artistId = card.dataset.artistId;
            await loadArtistDetails(artistId);
        });
    });
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

    // Agregar event listeners para los álbumes
    if (containerId === 'albums-container') {
        document.querySelectorAll('.album-card').forEach(card => {
            card.addEventListener('click', async (e) => {
                const albumId = card.dataset.albumId;
                await loadDirectAlbumDetails(albumId);
            });
        });
    }
}

async function loadAlbums() {
    const response = await fetch('http://localhost:3000/api/albums');
    const albums = await response.json();
    renderData(albums, 'albums-container', (album) => `
        <div class="album-card animated fadeIn" data-album-id="${album._id}">
            <div class="album-image-container">
                <img src="${album.image}" alt="${album.name}" class="album-image">
            </div>
            <div class="album-info">
                <h3>${album.name}</h3>
                <p class="album-release">Lanzamiento: ${new Date(album.releaseDate).toLocaleDateString()}</p>
                <p class="album-tracks">${album.totalTracks} canciones</p>
            </div>
        </div>
    `);

    // Mantener solo el event listener para el click en la tarjeta
    document.querySelectorAll('.album-card').forEach(card => {
        card.addEventListener('click', async (e) => {
            const albumId = card.dataset.albumId;
            await loadDirectAlbumDetails(albumId);
        });
    });
}

/*async function loadSongs() {
    const response = await fetch('http://localhost:3000/api/songs');
    const songs = await response.json();
    renderData(songs, 'songs-container', (song) => `
        <h3>${song.title}</h3>
        <p>Duración: ${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}</p>
        <p>Álbum: ${song.album}</p>
    `);
}
*/
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('data-section');
        showSection(sectionId);
        setActiveLink(link);

        if (sectionId === 'artists') loadArtists();
        if (sectionId === 'albums') loadAlbums();
        // if (sectionId === 'songs') loadSongs();
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

//Logica de BUSCAR

function displaySearchResults(results, filter) {
    const container = document.getElementById('search-results-container');
    container.innerHTML = '';

    if (results.length === 0) {
        container.innerHTML = '<p class="no-results">No se encontraron resultados</p>';
        return;
    }

    // Modificamos esta parte para manejar tanto 'artists' como 'genres'
    if (filter === 'artists' || filter === 'genres') {  // Añadimos 'genres' aquí
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

        // Event listeners para los nombres de artistas
        document.querySelectorAll('.artist-name').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const artistId = e.target.dataset.artistId;
                await loadArtistDetails(artistId);
            });
        });
    } else if (filter === 'albums') {
        results.forEach(album => {
            const albumCard = document.createElement('div');
            albumCard.className = 'grid-item album-card';

            albumCard.innerHTML = `
                <div class="album-image-container" data-album-id="${album._id}">
                    <img src="${album.image}" alt="${album.name}" class="artist-image">
                </div>
                <div class="album-info">
                    <h3>${album.name}</h3>
                    <p class="album-details">
                        Lanzamiento: ${new Date(album.releaseDate).toLocaleDateString()}
                    </p>
                    <p class="album-tracks">
                        ${album.totalTracks} canciones
                    </p>
                </div>
            `;

            container.appendChild(albumCard);
        });

        // Event listener para las imágenes de álbumes
        document.querySelectorAll('.album-image-container').forEach(container => {
            container.addEventListener('click', async (e) => {
                const albumId = container.dataset.albumId;
                await loadDirectAlbumDetails(albumId);
            });
        });
    } else if (filter === 'songs') {
        results.forEach(song => {
            const songCard = document.createElement('div');
            songCard.className = 'grid-item song-card';

            songCard.innerHTML = `
                <div class="song-info">
                    <h3>
                        <a href="${song.url}" target="_blank" class="song-title">
                            ${song.title}
                        </a>
                    </h3>
                    <p>Duración: ${formatDuration(song.duration)}</p>
                    ${song.lyrics ? `<button class="view-lyrics" data-song-id="${song._id}">Ver letra</button>` : ''}
                </div>
            `;

            container.appendChild(songCard);
        });

        // Agregar event listeners para los botones de letra
        document.querySelectorAll('.view-lyrics').forEach(button => {
            button.addEventListener('click', function() {
                const songId = this.dataset.songId;
                const song = results.find(s => s._id === songId);
                if (song.lyrics) {
                    showLyrics(song.title, song.lyrics);
                }
            });
        });
    }
}

// Nueva función para cargar detalles del álbum directamente
async function loadDirectAlbumDetails(albumId) {
    try {
        const response = await fetch(`/api/albums/${albumId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (!data.album || !data.songs) {
            console.error('Datos incompletos recibidos:', data);
            throw new Error('Datos del álbum incompletos');
        }

        displayAlbumDetails(data);
        showSection('album-detail');
    } catch (error) {
        console.error('Error cargando detalles del álbum:', error);
        alert('Error al cargar los detalles del álbum');
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

function displayAlbumDetails({ album, songs }) {
    const container = document.getElementById('album-detail');
    container.innerHTML = `
        <button class="back-button" onclick="goBack()">← Volver</button>
        <div class="album-header">
            <div class="album-info">
                <img src="${album.image}" alt="${album.name}" class="album-cover">
                <div class="album-details">
                    <h2>${album.name}</h2>
                    <p>Fecha de lanzamiento: ${new Date(album.releaseDate).toLocaleDateString()}</p>
                    <p>${album.totalTracks} canciones</p>
                </div>
            </div>
        </div>
        <div class="songs-list">
            <h3>Canciones</h3>
            ${songs.map((song, index) => `
                <div class="song-item">
                    <span class="song-number">${(index + 1).toString().padStart(2, '0')}</span>
                    <div class="song-info">
                        ${song.url ?
        `<a href="${song.url}" target="_blank" class="song-title">${song.title}</a>` :
        `<span class="song-title">${song.title}</span>`
    }
                        <span class="song-duration">${formatDuration(song.duration)}</span>
                    </div>
                    <div class="song-actions">
                        ${song.lyrics ?
        `<button class="view-lyrics" data-song-id="${song._id}">
                                Ver letra
                            </button>` :
        ''
    }
                    </div>
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

function displayArtistDetails({ artist, albums }) {
    const container = document.getElementById('artist-detail');
    container.innerHTML = `
        <button class="back-button" onclick="goBack()">← Volver</button>
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
            await loadDirectAlbumDetails(albumId); // Usar directamente loadDirectAlbumDetails
        });
    });
}

// Actualizar función showLyrics para incluir link a Spotify
function showLyrics(title, lyrics) {
    const modal = document.createElement('div');
    modal.className = 'lyrics-modal';
    modal.innerHTML = `
        <div class="lyrics-content">
            <h3>${title}</h3>
            <pre>${lyrics}</pre>
            <div class="lyrics-actions">
                <a href="https://open.spotify.com/search/${encodeURIComponent(title)}" 
                   target="_blank" class="spotify-link">
                    Escuchar en Spotify
                </a>
                <button class="close-lyrics">Cerrar</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.close-lyrics').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

async function loadAlbumDetails(albumId) {
    try {
        const response = await fetch(`/api/albums/${albumId}`);
        const data = await response.json();
        displayAlbumDetails(data);
        showSection('album-detail');
    } catch (error) {
        console.error('Error:', error);
    }
}

// Agregar la función formatDuration al inicio del archivo, después de las declaraciones iniciales
function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

// Modificar la función loadAlbumSongs para usar directamente loadDirectAlbumDetails
async function loadAlbumSongs(artistId, albumId) {
    try {
        // Simplificar usando la misma función que ya funciona para detalles del álbum
        await loadDirectAlbumDetails(albumId);
    } catch (error) {
        console.error('Error:', error);
    }
}