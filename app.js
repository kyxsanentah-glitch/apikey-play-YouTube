const API_KEY = 'b61f53b81836bf0d0c6625e390f6005b';
        const IMG_URL = 'https://image.tmdb.org/t/p/w500';
        const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';
        let currentMovieId = null;
        let heroMovieId = null;

        window.onload = () => {
            fetchMovies(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=id-ID&region=ID`, 'now-playing');
            fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=id-ID`, 'popular', true);
        };

        // --- DISCLAIMER LOGIC ---
        function closeDisclaimer() {
            const modal = document.getElementById('disclaimer-modal');
            modal.style.opacity = '0'; // Fade out animation
            setTimeout(() => {
                modal.classList.add('hidden'); // Hilangkan element setelah fade out
            }, 500);
        }

        async function fetchMovies(url, elementId, isHero = false) {
            try {
                const res = await fetch(url);
                const data = await res.json();
                if(isHero && data.results) setupHero(data.results[Math.floor(Math.random() * 5)]); 
                
                const container = document.getElementById(elementId);
                container.innerHTML = '';
                data.results.forEach(movie => {
                    if(movie.poster_path) {
                        const card = document.createElement('div');
                        card.className = 'movie-card min-w-[180px] md:min-w-[220px] relative rounded-xl overflow-hidden shadow-lg group bg-[#1f1f1f]';
                        card.onclick = () => openModal(movie);
                        card.innerHTML = `
                            <img src="${IMG_URL + movie.poster_path}" class="w-full h-full object-cover group-hover:opacity-40 transition duration-300">
                            
                            <div class="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                                <div class="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg mb-2 transform scale-0 group-hover:scale-100 transition duration-300 delay-100">
                                    <i class="fa-solid fa-play text-white ml-1"></i>
                                </div>
                                <span class="text-xs font-bold text-white bg-black/60 px-2 py-1 rounded backdrop-blur-sm">★ ${movie.vote_average.toFixed(1)}</span>
                            </div>
                            
                            <div class="absolute bottom-0 w-full p-3 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition duration-300">
                                <p class="text-white text-sm font-bold truncate">${movie.title}</p>
                            </div>
                        `;
                        container.appendChild(card);
                    }
                });
            } catch (e) { console.error(e); }
        }

        function setupHero(movie) {
            heroMovieId = movie.id;
            const hero = document.getElementById('hero');
            hero.style.backgroundImage = `url(${BACKDROP_URL + movie.backdrop_path})`;
            hero.classList.remove('shimmer');
            
            document.getElementById('hero-title').innerText = movie.title;
            document.getElementById('hero-desc').innerText = movie.overview;
            document.getElementById('hero-date').innerText = movie.release_date.split('-')[0];
            document.getElementById('hero-rating').innerText = movie.vote_average.toFixed(1);
            
            document.getElementById('hero-content').classList.remove('opacity-0', 'translate-y-4');
        }

        async function searchMovie() {
            const query = document.getElementById('search').value;
            if(!query) return;
            const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=id-ID&query=${query}`);
            const data = await res.json();
            const grid = document.getElementById('search-grid');
            document.getElementById('search-section').classList.remove('hidden');
            grid.innerHTML = '';
            data.results.forEach(movie => {
                if(movie.poster_path) {
                    const card = document.createElement('div');
                    card.className = 'movie-card relative rounded-xl overflow-hidden shadow-lg group';
                    card.onclick = () => openModal(movie);
                    card.innerHTML = `<img src="${IMG_URL + movie.poster_path}" class="w-full h-full object-cover">`;
                    grid.appendChild(card);
                }
            });
            window.scrollTo({top: 0, behavior: 'smooth'});
        }

        function closeSearch() { document.getElementById('search-section').classList.add('hidden'); }

        function openModal(movie) {
            currentMovieId = movie.id;
            // Reset Layout
            document.getElementById('video-frame').src = '';
            document.getElementById('video-frame').classList.add('hidden');
            document.getElementById('modal-img').classList.remove('hidden');
            document.getElementById('play-overlay').classList.remove('hidden');
            
            // Show Info & Resize Video
            document.getElementById('info-section').classList.remove('hidden');
            document.getElementById('info-section').style.width = ''; 
            document.getElementById('info-section').classList.add('md:w-[25%]');
            
            const vidSec = document.getElementById('video-section');
            vidSec.classList.remove('w-full');
            vidSec.classList.add('md:w-[75%]');

            // Data
            document.getElementById('modal-img').src = BACKDROP_URL + (movie.backdrop_path || movie.poster_path);
            document.getElementById('modal-title').innerText = movie.title;
            document.getElementById('modal-desc').innerText = movie.overview || "Sinopsis tidak tersedia.";
            document.getElementById('modal-date').innerText = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
            document.getElementById('modal-rating').innerText = movie.vote_average.toFixed(1);
            
            document.getElementById('movie-modal').classList.remove('hidden');
        }

        function playMovie() {
            document.getElementById('modal-img').classList.add('hidden');
            document.getElementById('play-overlay').classList.add('hidden');
            
            // Theater Mode Animation
            document.getElementById('info-section').classList.add('hidden'); 
            
            const vidSec = document.getElementById('video-section');
            vidSec.classList.remove('md:w-[75%]');
            vidSec.classList.add('w-full'); 
            
            document.getElementById('video-loader').classList.remove('hidden');
            
            const frame = document.getElementById('video-frame');
            frame.src = `https://vidsrc.me/embed/movie/${currentMovieId}`;
            frame.classList.remove('hidden');
            frame.onload = () => document.getElementById('video-loader').classList.add('hidden');
        }

        function playHero() { 
            fetch(`https://api.themoviedb.org/3/movie/${heroMovieId}?api_key=${API_KEY}&language=id-ID`)
            .then(r => r.json()).then(m => { openModal(m); playMovie(); });
        }

        function infoHero() {
            fetch(`https://api.themoviedb.org/3/movie/${heroMovieId}?api_key=${API_KEY}&language=id-ID`)
            .then(r => r.json()).then(m => openModal(m));
        }

        function closeModal() {
            document.getElementById('movie-modal').classList.add('hidden');
            document.getElementById('video-frame').src = '';
        }

        window.addEventListener('scroll', () => {
            const nav = document.getElementById('navbar');
            window.scrollY > 50 ? nav.classList.add('bg-black/90', 'backdrop-blur-md', 'shadow-lg') : nav.classList.remove('bg-black/90', 'backdrop-blur-md', 'shadow-lg');
        });
