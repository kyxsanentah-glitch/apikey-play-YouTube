const API_KEY = 'b61f53b81836bf0d0c6625e390f6005b';
        const IMG_URL = 'https://image.tmdb.org/t/p/w500';
        const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';
        let currentMovieId = null;
        let heroMovieId = null;

        window.onload = () => {
            fetchMovies(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=id-ID&region=ID`, 'now-playing');
            fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=id-ID`, 'popular', true);
        };

        async function fetchMovies(url, elementId, isHero = false) {
            try {
                const res = await fetch(url);
                const data = await res.json();
                if(isHero && data.results) setupHero(data.results[0]);
                
                const container = document.getElementById(elementId);
                container.innerHTML = '';
                data.results.forEach(movie => {
                    if(movie.poster_path) {
                        const card = document.createElement('div');
                        card.className = 'movie-card min-w-[160px] md:min-w-[200px] relative rounded-md overflow-hidden bg-gray-900';
                        card.onclick = () => openModal(movie);
                        card.innerHTML = `<img src="${IMG_URL + movie.poster_path}" class="w-full h-full object-cover">`;
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
            document.getElementById('hero-rating').innerText = `★ ${movie.vote_average.toFixed(1)}`;
            document.getElementById('hero-content').classList.remove('opacity-0');
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
                    card.className = 'movie-card rounded overflow-hidden';
                    card.onclick = () => openModal(movie);
                    card.innerHTML = `<img src="${IMG_URL + movie.poster_path}" class="w-full">`;
                    grid.appendChild(card);
                }
            });
            window.scrollTo({top: 0, behavior: 'smooth'});
        }

        function closeSearch() { document.getElementById('search-section').classList.add('hidden'); }

        function openModal(movie) {
            currentMovieId = movie.id;
            document.getElementById('video-frame').src = '';
            document.getElementById('video-frame').classList.add('hidden');
            document.getElementById('modal-img').classList.remove('hidden');
            document.getElementById('play-overlay').classList.remove('hidden');
            document.getElementById('info-section').classList.remove('hidden');
            document.getElementById('video-section').classList.replace('w-full', 'md:w-3/4');
            
            document.getElementById('modal-img').src = BACKDROP_URL + (movie.backdrop_path || movie.poster_path);
            document.getElementById('modal-title').innerText = movie.title;
            document.getElementById('modal-desc').innerText = movie.overview;
            document.getElementById('modal-date').innerText = movie.release_date.split('-')[0];
            document.getElementById('modal-rating').innerText = movie.vote_average.toFixed(1);
            document.getElementById('movie-modal').classList.remove('hidden');
        }

        function playMovie() {
            document.getElementById('modal-img').classList.add('hidden');
            document.getElementById('play-overlay').classList.add('hidden');
            document.getElementById('info-section').classList.add('hidden');
            document.getElementById('video-section').classList.replace('md:w-3/4', 'w-full');
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
            window.scrollY > 50 ? nav.classList.add('bg-black') : nav.classList.remove('bg-black');
        });
