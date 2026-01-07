const API_KEY = 'b61f53b81836bf0d0c6625e390f6005b'; // API Key
        const IMG_URL = 'https://image.tmdb.org/t/p/w500';
        const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';
        let currentMovieId = null;
        let heroMovieId = null;

        window.onload = () => {
            // Check Disclaimer
            if (!localStorage.getItem('seenDracinDisclaimer')) {
                const modal = document.getElementById('disclaimer-modal');
                modal.classList.remove('hidden');
                setTimeout(() => {
                    modal.querySelector('#modal-box').classList.remove('scale-95');
                    modal.querySelector('#modal-box').classList.add('scale-100');
                }, 100);
            }

            // Fetch Data
            fetchDracin(`https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=id-ID&sort_by=popularity.desc&with_original_language=zh`, 'popular-dracin', true);
            fetchDracin(`https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=id-ID&sort_by=popularity.desc&with_original_language=zh&with_genres=10749`, 'romance-dracin');
            fetchDracin(`https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=id-ID&sort_by=popularity.desc&with_original_language=zh&with_genres=10765`, 'fantasy-dracin');
        };

        function closeDisclaimer() {
            const modal = document.getElementById('disclaimer-modal');
            modal.style.opacity = '0';
            modal.querySelector('#modal-box').classList.add('scale-95');
            localStorage.setItem('seenDracinDisclaimer', 'true');
            setTimeout(() => modal.classList.add('hidden'), 500);
        }

        async function fetchDracin(url, elementId, isHero = false) {
            try {
                const res = await fetch(url);
                const data = await res.json();
                if(isHero && data.results) setupHero(data.results[0]); 
                
                const container = document.getElementById(elementId);
                container.innerHTML = '';
                data.results.forEach(movie => {
                    if(movie.poster_path) {
                        const card = document.createElement('div');
                        card.className = 'movie-card min-w-[180px] md:min-w-[220px] relative rounded-2xl overflow-hidden shadow-lg group bg-[#1f1f1f] border border-white/5';
                        const title = movie.name || movie.original_name;
                        
                        card.onclick = () => openModal(movie);
                        card.innerHTML = `
                            <img src="${IMG_URL + movie.poster_path}" class="w-full h-full object-cover group-hover:opacity-40 transition duration-500">
                            <div class="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                                <div class="w-14 h-14 bg-pink-600 rounded-full flex items-center justify-center shadow-2xl mb-3 transform scale-0 group-hover:scale-100 transition duration-300 delay-100">
                                    <i class="fa-solid fa-play text-white ml-1 text-xl"></i>
                                </div>
                                <span class="text-xs font-bold text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">★ ${movie.vote_average.toFixed(1)}</span>
                            </div>
                            <div class="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition duration-300">
                                <p class="text-white text-sm font-bold truncate">${title}</p>
                                <p class="text-gray-400 text-xs">${movie.first_air_date ? movie.first_air_date.split('-')[0] : ''}</p>
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
            
            document.getElementById('hero-title').innerText = movie.name || movie.original_name;
            document.getElementById('hero-desc').innerText = movie.overview || "Sinopsis tidak tersedia untuk drama ini.";
            document.getElementById('hero-date').innerText = movie.first_air_date ? movie.first_air_date.split('-')[0] : 'N/A';
            document.getElementById('hero-rating').innerText = movie.vote_average.toFixed(1);
            
            document.getElementById('hero-content').classList.remove('opacity-0', 'translate-y-8');
        }

        function openModal(movie) {
            currentMovieId = movie.id;
            
            // Reset Layout & Hide Player
            document.getElementById('video-frame').src = '';
            document.getElementById('video-frame').classList.add('hidden');
            document.getElementById('modal-img').classList.remove('hidden');
            document.getElementById('play-overlay').classList.remove('hidden');
            
            // Show Info & Resize
            document.getElementById('info-section').classList.remove('hidden');
            document.getElementById('video-section').classList.remove('w-full');
            document.getElementById('video-section').classList.add('md:w-[75%]');

            // Data
            document.getElementById('modal-img').src = BACKDROP_URL + (movie.backdrop_path || movie.poster_path);
            document.getElementById('modal-title').innerText = movie.name || movie.original_name;
            document.getElementById('modal-desc').innerText = movie.overview || "Sinopsis tidak tersedia.";
            document.getElementById('modal-date').innerText = movie.first_air_date ? movie.first_air_date.split('-')[0] : 'N/A';
            document.getElementById('modal-rating').innerText = movie.vote_average.toFixed(1);
            
            document.getElementById('movie-modal').classList.remove('hidden');
        }

        function playMovie() {
            playHero(); 
        }

        function playHero() {
            // UI Logic: Theater Mode
            document.getElementById('modal-img').classList.add('hidden');
            document.getElementById('play-overlay').classList.add('hidden');
            document.getElementById('info-section').classList.add('hidden'); // Hide Text
            
            const vidSec = document.getElementById('video-section');
            vidSec.classList.remove('md:w-[75%]');
            vidSec.classList.add('w-full'); // Full Width
            
            document.getElementById('video-loader').classList.remove('hidden');
            
            const frame = document.getElementById('video-frame');
            frame.src = `https://vidsrc.me/embed/tv/${currentMovieId}/1/1`; // Auto Episode 1
            
            frame.classList.remove('hidden');
            frame.onload = () => document.getElementById('video-loader').classList.add('hidden');
        }

        function infoHero() {
            // Manual object creation for Hero info
            openModal({
                id: heroMovieId,
                name: document.getElementById('hero-title').innerText,
                overview: document.getElementById('hero-desc').innerText,
                first_air_date: document.getElementById('hero-date').innerText,
                vote_average: parseFloat(document.getElementById('hero-rating').innerText),
                backdrop_path: document.getElementById('hero').style.backgroundImage.slice(5, -2).replace(BACKDROP_URL, '')
            });
        }

        function closeModal() {
            document.getElementById('movie-modal').classList.add('hidden');
            document.getElementById('video-frame').src = '';
        }
