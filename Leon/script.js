document.addEventListener('DOMContentLoaded', function() {
    // Get all elements first to avoid scope issues
    const callScreen = document.getElementById('callScreen');
    const mainWebsite = document.getElementById('mainWebsite');
    const sliderThumb = document.getElementById('sliderThumb');
    const bgMusic = document.getElementById('bgMusic');
    const miniPlayPause = document.getElementById('miniPlayPause');
    const miniCover = document.getElementById('miniCover');
    // subtitles removed per user request
    let isPlaying = false;
    let emojiRainActive = true;
    let loopCount = 0;
    const maxLoops = 10;
    let userInteracted = false;

    // Playlist and cover mapping
    const playlist = [
        'songs/TheNightWeMet.mp3',
        'songs/Ordinary.mp3'
    ];
    let currentTrack = 0;

    const coverMap = {
        'songs/TheNightWeMet.mp3': 'images/TheNightWeMet.jpg',
        'songs/Ordinary.mp3': 'images/Ordinary.jpg'
    };

    // Subtitles fully removed (data, timers and helpers) per user request

    // --- Slider Functionality ---
    let isDragging = false;
    let startX = 0;
    let startLeft = 0;
    let currentX = 0;
    const sliderContainer = document.querySelector('.slider-container');

    function getClientX(e) {
        if (!e) return 0;
        if (typeof e.clientX === 'number') return e.clientX;
        if (e.touches && e.touches[0]) return e.touches[0].clientX;
        if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].clientX;
        return 0;
    }

    // Initialize slider
    let sliderWidth = 0;
    let thumbWidth = 0;
    let maxSlide = 0;

    function initSliderBounds() {
        if (!sliderContainer || !sliderThumb) return;
        
        sliderWidth = sliderContainer.offsetWidth;
        thumbWidth = sliderThumb.offsetWidth;
        maxSlide = Math.max(0, sliderWidth - thumbWidth - 10);
        sliderThumb.style.left = '5px';
    }

    // Add event listeners for slider
    if (sliderThumb && sliderContainer) {
        initSliderBounds();
        
        // Mouse/touch events
        sliderThumb.addEventListener('mousedown', startDrag);
        sliderThumb.addEventListener('touchstart', startDrag, { passive: false });
        
        // Click fallback
        sliderThumb.addEventListener('click', function(ev) {
            ev.preventDefault();
            if (sliderThumb) {
                sliderThumb.style.transition = 'left 0.25s ease';
                sliderThumb.style.left = maxSlide + 'px';
            }
            completeSwipe();
        });

        // Track click
        sliderContainer.addEventListener('click', function(ev) {
            if (isDragging) return;
            const clientX = getClientX(ev);
            const rect = sliderContainer.getBoundingClientRect();
            const relative = clientX - rect.left;
            const newX = Math.max(5, Math.min(maxSlide, relative - (thumbWidth / 2)));
            if (sliderThumb) {
                sliderThumb.style.transition = 'left 0.15s ease';
                sliderThumb.style.left = newX + 'px';
            }
            if (newX >= maxSlide - 10) completeSwipe();
        });

        // Global move/end events
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
        
        window.addEventListener('resize', initSliderBounds);
    }

    function startDrag(e) {
        if (!sliderThumb) return;
        isDragging = true;
        startX = getClientX(e);
        startLeft = parseInt(sliderThumb.style.left) || 5;
        sliderThumb.style.transition = 'none';
        sliderThumb.classList.add('active');
        if (e.cancelable) e.preventDefault();
    }

    function drag(e) {
        if (!isDragging) return;
        currentX = getClientX(e);
        const deltaX = currentX - startX;
        let newX = startLeft + deltaX;
        newX = Math.max(5, Math.min(maxSlide, newX));
        if (sliderThumb) sliderThumb.style.left = newX + 'px';
        if (newX >= maxSlide - 10) completeSwipe();
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        if (sliderThumb) sliderThumb.classList.remove('active');
        const currentLeft = parseInt(sliderThumb.style.left) || 5;
        if (currentLeft < maxSlide - 30) {
            sliderThumb.style.transition = 'left 0.3s ease';
            sliderThumb.style.left = '5px';
        }
    }

    function completeSwipe() {
        if (sliderThumb) {
            sliderThumb.style.transition = 'left 0.5s ease';
            sliderThumb.style.left = maxSlide + 'px';
        }
        
        setTimeout(() => {
            if (callScreen) callScreen.style.display = 'none';
            if (mainWebsite) mainWebsite.style.display = 'block';
            startBackgroundMusic();
        }, 800);
    }

    // --- Music Functions ---
    function loadTrack(index) {
        if (!bgMusic) return;
        currentTrack = index;
        bgMusic.src = playlist[index];
        bgMusic.load();
        
        const trackPath = playlist[index];
        const mapped = coverMap[trackPath];
        if (mapped && miniCover) {
            miniCover.src = mapped;
        }
    }

    function startBackgroundMusic() {
        if (!bgMusic) return;
        loadTrack(0);
        loopCount = 0;
        userInteracted = true;
        
        bgMusic.play().then(() => {
            isPlaying = true;
            if (miniPlayPause) miniPlayPause.textContent = '⏸';
        }).catch((error) => {
            console.log('Autoplay prevented:', error);
            isPlaying = false;
            if (miniPlayPause) miniPlayPause.textContent = '⏵';
        });
    }

    // Mini player controls
    if (miniPlayPause) {
        miniPlayPause.addEventListener('click', function(e) {
            e.preventDefault();
            if (!isPlaying) {
                loopCount = 0;
                userInteracted = true;
                if (!bgMusic.src) loadTrack(currentTrack);
                playBackgroundMusic();
            } else {
                pauseBackgroundMusic();
            }
        });
    }
    
    function playBackgroundMusic() {
        if (!bgMusic) return;
        bgMusic.play()
            .then(() => {
                if (miniPlayPause) miniPlayPause.textContent = '⏸';
                isPlaying = true;
            })
            .catch(error => {
                console.log('Error playing background music:', error);
            });
    }
    
    function pauseBackgroundMusic() {
        if (!bgMusic) return;
        bgMusic.pause();
        if (miniPlayPause) miniPlayPause.textContent = '⏵';
        isPlaying = false;
    }

    function nextTrack() {
        currentTrack = (currentTrack + 1) % playlist.length;
        
        if (currentTrack === 0) {
            loopCount++;
            if (loopCount >= maxLoops) {
                pauseBackgroundMusic();
                return;
            }
        }
        
        loadTrack(currentTrack);
        if (isPlaying) bgMusic.play().catch(() => {});
    }

    if (bgMusic) {
        bgMusic.addEventListener('ended', nextTrack);
    }

    // --- Emoji Rain ---
    function createEmoji(isSmall) {
        const backContainer = document.getElementById('emoji-rain-back');
        const frontContainer = document.getElementById('emoji-rain-front');
        const targetContainer = Math.random() < 0.3 && frontContainer ? frontContainer : backContainer;
        
        if (!targetContainer) return;
        
        const emojis = ['🎂','HAPPY','BIRTHDAY','I LOVE YOU', '🎉', '🎁', '🥳', '❤️', '✨', '🌟', '🎈', '🥂', '🎊','😍','💕','😊','🥰','🤩','🥺','😇','🐻','🦋'];
        const el = document.createElement('div');
        el.className = 'emoji' + (isSmall ? ' small' : '');
        
        const inner = document.createElement('span');
        inner.className = 'emoji-inner';
        inner.textContent = emojis[Math.floor(Math.random() * emojis.length)];

        const fall = (Math.random() * 6 + 8).toFixed(2);
        const rotate = (Math.random() * 3 + 3).toFixed(2);
        const delay = (Math.random() * 1.5).toFixed(2);

        el.style.left = Math.random() * 100 + 'vw';
        inner.style.animation = `driftSpin ${rotate}s linear ${delay}s infinite`;
        el.style.animation = `fall ${fall}s linear ${delay}s forwards`;
        el.appendChild(inner);
        targetContainer.appendChild(el);

        setTimeout(() => {
            if (el.parentNode === targetContainer) targetContainer.removeChild(el);
        }, (parseFloat(fall) + parseFloat(delay) + 0.5) * 1000);
    }

    function createEmojiRain() {
        setInterval(() => {
            if (emojiRainActive) createEmoji(false);
        }, 300);

        setInterval(() => {
            if (emojiRainActive) createEmoji(true);
        }, 500);
    }

    // Initialize emoji rain after call is answered
    setTimeout(() => {
        createEmojiRain();
    }, 1000);

    // Toggle emoji rain with spacebar
    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space') {
            emojiRainActive = !emojiRainActive;
        }
    });
});