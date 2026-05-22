(function() {
    const style = document.createElement('style');
    style.innerHTML = `
        html[data-theme="light"] {
            filter: invert(1) hue-rotate(180deg);
        }
        /* Keep these from being inverted */
        html[data-theme="light"] img,
        html[data-theme="light"] canvas,
        html[data-theme="light"] iframe,
        html[data-theme="light"] .ball,
        html[data-theme="light"] .lottery-ball,
        html[data-theme="light"] .ball-r,
        html[data-theme="light"] .ball-b,
        html[data-theme="light"] .ball-g {
            filter: invert(1) hue-rotate(180deg) !important;
        }
        
        #theme-switcher-widget {
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 999999;
            background: rgba(15, 23, 42, 0.9);
            border-radius: 30px;
            display: flex;
            padding: 5px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
        }
        .theme-btn {
            background: transparent;
            border: none;
            color: #94a3b8;
            padding: 6px 12px;
            cursor: pointer;
            border-radius: 20px;
            transition: all 0.3s;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 5px;
            opacity: 0.6;
        }
        .theme-btn:hover {
            opacity: 1;
        }
        .theme-btn.active {
            background: rgba(255,255,255,0.2);
            opacity: 1;
        }
        /* Stop switcher from inverting */
        html[data-theme="light"] #theme-switcher-widget {
            filter: invert(1) hue-rotate(180deg);
        }
    `;
    document.head.appendChild(style);

    const widget = document.createElement('div');
    widget.id = 'theme-switcher-widget';
    widget.innerHTML = `
        <button class="theme-btn" data-mode="light" title="浅色模式">☀️</button>
        <button class="theme-btn" data-mode="auto" title="自动模式">💻</button>
        <button class="theme-btn" data-mode="dark" title="深色模式">🌙</button>
    `;
    
    // Attempt to append to body, retrying if body isn't fully ready
    if(document.body) {
        document.body.appendChild(widget);
        initSwitcher();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            document.body.appendChild(widget);
            initSwitcher();
        });
    }

    function initSwitcher() {
        const buttons = document.querySelectorAll('#theme-switcher-widget .theme-btn');
        
        function applyTheme(mode) {
            let isLight = false;
            if (mode === 'light') {
                isLight = true;
            } else if (mode === 'dark') {
                isLight = false;
            } else {
                isLight = window.matchMedia('(prefers-color-scheme: light)').matches;
            }
            
            if (isLight) {
                document.documentElement.setAttribute('data-theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
            }

            buttons.forEach(btn => {
                if (btn.dataset.mode === mode) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            localStorage.setItem('user-theme-pref', mode);
        }

        buttons.forEach(btn => {
            btn.addEventListener('click', () => applyTheme(btn.dataset.mode));
        });

        const savedMode = localStorage.getItem('user-theme-pref') || 'auto';
        applyTheme(savedMode);

        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
            if (localStorage.getItem('user-theme-pref') === 'auto') {
                applyTheme('auto');
            }
        });
    }
})();
