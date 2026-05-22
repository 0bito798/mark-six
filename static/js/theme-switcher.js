(function() {
    const modes = ['auto', 'light', 'dark'];
    const modeMeta = {
        auto: {
            label: '自动模式',
            shortLabel: '自动',
            title: '主题：自动模式，点击切换为浅色模式',
            path: 'M4 5.5h16v10H4zM8 19h8m-4-3.5V19'
        },
        light: {
            label: '浅色模式',
            shortLabel: '浅色',
            title: '主题：浅色模式，点击切换为深色模式',
            path: 'M12 3v2m0 14v2m9-9h-2M5 12H3m15.07-6.07-1.42 1.42M7.35 16.65l-1.42 1.42m12.14 0-1.42-1.42M7.35 7.35 5.93 5.93M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z'
        },
        dark: {
            label: '深色模式',
            shortLabel: '深色',
            title: '主题：深色模式，点击切换为自动模式',
            path: 'M21 14.35A7.5 7.5 0 0 1 9.65 3 8.5 8.5 0 1 0 21 14.35Z'
        }
    };

    const themeStyle = document.createElement('style');
    themeStyle.id = 'theme-switcher-style';
    themeStyle.textContent = `
        html[data-theme="dark"] {
            color-scheme: dark;
        }

        html[data-theme="light"] {
            color-scheme: light;
            --glass-bg: rgba(255, 255, 255, 0.9);
            --glass-border: rgba(148, 163, 184, 0.26);
            --panel-bg: rgba(255, 255, 255, 0.94);
            --panel-soft: rgba(241, 245, 249, 0.94);
            --surface-elevated: #ffffff;
            --text-primary: #0f172a;
            --text-secondary: #475569;
            --text-muted: #64748b;
            --primary-gradient: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
            --secondary-gradient: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            --success-gradient: linear-gradient(135deg, #059669 0%, #0d9488 100%);
            --warning-gradient: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
            --danger-gradient: linear-gradient(135deg, #dc2626 0%, #f97316 100%);
            --shadow-light: 0 12px 30px rgba(15, 23, 42, 0.08);
            --shadow-medium: 0 16px 36px rgba(15, 23, 42, 0.11);
            --shadow-heavy: 0 22px 48px rgba(15, 23, 42, 0.14);
        }

        .theme-switcher-slot {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 auto;
            margin-right: 0.4rem;
            vertical-align: middle;
        }

        .theme-switcher-slot:empty {
            display: none;
        }

        .theme-toggle-button {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            height: 36px;
            min-width: 36px;
            padding: 0 10px;
            border: 1px solid rgba(148, 163, 184, 0.24);
            border-radius: 999px;
            background: rgba(15, 23, 42, 0.64);
            color: #e2e8f0;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
            cursor: pointer;
            touch-action: manipulation;
            transition: background 180ms ease, border-color 180ms ease, color 180ms ease, transform 180ms ease, box-shadow 180ms ease;
        }

        .theme-toggle-button::before {
            content: "";
            position: absolute;
            inset: -4px;
        }

        .theme-toggle-button:hover,
        .theme-toggle-button:focus-visible {
            background: rgba(30, 41, 59, 0.9);
            border-color: rgba(125, 211, 252, 0.62);
            color: #f8fafc;
            box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.12);
            outline: none;
        }

        .theme-toggle-button:active {
            transform: scale(0.97);
        }

        .theme-toggle-button svg {
            width: 18px;
            height: 18px;
            display: block;
            stroke: currentColor;
            stroke-width: 1.9;
            stroke-linecap: round;
            stroke-linejoin: round;
            fill: none;
        }

        .theme-toggle-button[data-mode="dark"] svg {
            fill: rgba(226, 232, 240, 0.16);
        }

        .theme-toggle-text {
            color: inherit;
            font-size: 12px;
            line-height: 1;
            font-weight: 700;
            letter-spacing: 0;
            white-space: nowrap;
        }

        html[data-theme="light"] body {
            background: linear-gradient(135deg, #eef4ff 0%, #f8fafc 48%, #edf2f7 100%) !important;
            color: #102033 !important;
        }

        html[data-theme="light"] .particles {
            opacity: 0.18;
        }

        html[data-theme="light"] .navbar,
        html[data-theme="light"] nav.navbar {
            background: rgba(255, 255, 255, 0.92) !important;
            border-color: rgba(148, 163, 184, 0.28) !important;
            box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08) !important;
        }

        html[data-theme="light"] .navbar .navbar-brand,
        html[data-theme="light"] .navbar .nav-link,
        html[data-theme="light"] .navbar .nav-user-label,
        html[data-theme="light"] .navbar-dark .navbar-brand,
        html[data-theme="light"] .navbar-dark .navbar-nav .nav-link {
            color: #0f172a !important;
        }

        html[data-theme="light"] .navbar-toggler {
            border-color: rgba(15, 23, 42, 0.22) !important;
        }

        html[data-theme="light"] .navbar-toggler-icon {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%2815, 23, 42, 0.82%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e") !important;
        }

        html[data-theme="light"] .dropdown-menu {
            background: rgba(255, 255, 255, 0.98) !important;
            border-color: rgba(148, 163, 184, 0.24) !important;
            box-shadow: 0 18px 42px rgba(15, 23, 42, 0.14) !important;
        }

        html[data-theme="light"] .dropdown-item {
            color: #1e293b !important;
        }

        html[data-theme="light"] .sidebar {
            background: rgba(255, 255, 255, 0.9) !important;
            border-color: rgba(148, 163, 184, 0.24) !important;
            box-shadow: 12px 0 34px rgba(15, 23, 42, 0.08) !important;
        }

        html[data-theme="light"] .sidebar-brand,
        html[data-theme="light"] .sidebar-nav a {
            color: #1e293b !important;
        }

        html[data-theme="light"] .sidebar-toggle {
            background: rgba(241, 245, 249, 0.92) !important;
            border-color: rgba(148, 163, 184, 0.28) !important;
            color: #0f172a !important;
        }

        html[data-theme="light"] .sidebar-nav a:hover,
        html[data-theme="light"] .sidebar-nav a.active {
            background: rgba(226, 232, 240, 0.76) !important;
            color: #0f172a !important;
        }

        html[data-theme="light"] .main-container,
        html[data-theme="light"] .main-content,
        html[data-theme="light"] main,
        html[data-theme="light"] body,
        html[data-theme="light"] p,
        html[data-theme="light"] li,
        html[data-theme="light"] label,
        html[data-theme="light"] small,
        html[data-theme="light"] td {
            color: #334155 !important;
        }

        html[data-theme="light"] h1,
        html[data-theme="light"] h2,
        html[data-theme="light"] h3,
        html[data-theme="light"] h4,
        html[data-theme="light"] .main-title,
        html[data-theme="light"] .page-title,
        html[data-theme="light"] .card-title,
        html[data-theme="light"] .card-title-compact,
        html[data-theme="light"] .prediction-title-compact,
        html[data-theme="light"] .section-title,
        html[data-theme="light"] .chart-title,
        html[data-theme="light"] .strategy-name,
        html[data-theme="light"] .region-name,
        html[data-theme="light"] .region-stat-title,
        html[data-theme="light"] .ml-record-title,
        html[data-theme="light"] .panel-title,
        html[data-theme="light"] .learning-title,
        html[data-theme="light"] .learning-name,
        html[data-theme="light"] .comparison-title,
        html[data-theme="light"] .suggestion-content h4,
        html[data-theme="light"] .period-compare-title,
        html[data-theme="light"] .strategy-special-zodiac,
        html[data-theme="light"] .table-main,
        html[data-theme="light"] .stat-number,
        html[data-theme="light"] .region-stat-value,
        html[data-theme="light"] .setting-text,
        html[data-theme="light"] .mini-checkbox,
        html[data-theme="light"] .empty-state h3 {
            color: #0f172a !important;
            text-shadow: none !important;
        }

        html[data-theme="light"] .subtitle,
        html[data-theme="light"] .control-label,
        html[data-theme="light"] .stat-label,
        html[data-theme="light"] .table-sub,
        html[data-theme="light"] .empty-text,
        html[data-theme="light"] .help-text,
        html[data-theme="light"] .comparison-meta,
        html[data-theme="light"] .learning-meta,
        html[data-theme="light"] .region-stat-total,
        html[data-theme="light"] .region-stat-label,
        html[data-theme="light"] .ml-record-time,
        html[data-theme="light"] .ball-zodiac,
        html[data-theme="light"] .special-zodiac,
        html[data-theme="light"] .group-title,
        html[data-theme="light"] .setting-label,
        html[data-theme="light"] .table-main + div,
        html[data-theme="light"] .user-info,
        html[data-theme="light"] .top-user-info,
        html[data-theme="light"] .app-footer {
            color: #475569 !important;
        }

        html[data-theme="light"] .top-bar,
        html[data-theme="light"] .top-user-info,
        html[data-theme="light"] .login-container,
        html[data-theme="light"] .register-container,
        html[data-theme="light"] .auth-container,
        html[data-theme="light"] .activate-container,
        html[data-theme="light"] .forgot-container,
        html[data-theme="light"] .reset-container,
        html[data-theme="light"] .chat-wrapper,
        html[data-theme="light"] .side-panel,
        html[data-theme="light"] .chat-container,
        html[data-theme="light"] .result-item,
        html[data-theme="light"] .ai-message,
        html[data-theme="light"] .quick-questions,
        html[data-theme="light"] .mobile-sidebar-content,
        html[data-theme="light"] .info-box,
        html[data-theme="light"] .glass-card,
        html[data-theme="light"] .card,
        html[data-theme="light"] .card-compact,
        html[data-theme="light"] .stat-card,
        html[data-theme="light"] .stat-card-compact,
        html[data-theme="light"] .prediction-card-compact,
        html[data-theme="light"] .prediction-period-compare,
        html[data-theme="light"] .strategy-compare-card,
        html[data-theme="light"] .help-card,
        html[data-theme="light"] .help-item,
        html[data-theme="light"] .accuracy-item,
        html[data-theme="light"] .learning-card,
        html[data-theme="light"] .strategy-item,
        html[data-theme="light"] .region-item,
        html[data-theme="light"] .region-stat-card,
        html[data-theme="light"] .region-stat-item,
        html[data-theme="light"] .ml-record-card,
        html[data-theme="light"] .ml-panel,
        html[data-theme="light"] .trend-item,
        html[data-theme="light"] .suggestion-item,
        html[data-theme="light"] .comparison-row,
        html[data-theme="light"] .accuracy-grid,
        html[data-theme="light"] .checkbox-group,
        html[data-theme="light"] .mini-checkbox,
        html[data-theme="light"] .setting-group,
        html[data-theme="light"] .hero-card,
        html[data-theme="light"] .invite-code-item,
        html[data-theme="light"] .table-wrap,
        html[data-theme="light"] .chart-card,
        html[data-theme="light"] .recommendation-card,
        html[data-theme="light"] .modal-content,
        html[data-theme="light"] [style*="background: white"],
        html[data-theme="light"] [style*="background:white"],
        html[data-theme="light"] [style*="background-color: #fff"],
        html[data-theme="light"] [style*="background-color:#fff"],
        html[data-theme="light"] [style*="background: #fff"],
        html[data-theme="light"] [style*="background:#fff"],
        html[data-theme="light"] [style*="background-color: #f8f9fa"],
        html[data-theme="light"] [style*="background-color:#f8f9fa"],
        html[data-theme="light"] [style*="background: #f8f9fa"],
        html[data-theme="light"] [style*="background:#f8f9fa"],
        html[data-theme="light"] [style*="#f8f9fa"],
        html[data-theme="light"] [style*="#f8f9ff"],
        html[data-theme="light"] [style*="#fbfcfe"],
        html[data-theme="light"] [style*="#ffffff"],
        html[data-theme="light"] [style*="rgba(15,23,42"],
        html[data-theme="light"] [style*="rgba(18,40,50"],
        html[data-theme="light"] [style*="rgba(20,32,56"],
        html[data-theme="light"] [style*="rgba(30,41,59"],
        html[data-theme="light"] [style*="rgba(51,65,85"],
        html[data-theme="light"] [style*="rgba(12,18,32"],
        html[data-theme="light"] [style*="rgba(9,14,26"],
        html[data-theme="light"] [style*="rgba(15, 23, 42"],
        html[data-theme="light"] [style*="rgba(18, 40, 50"],
        html[data-theme="light"] [style*="rgba(20, 32, 56"],
        html[data-theme="light"] [style*="rgba(30, 41, 59"],
        html[data-theme="light"] [style*="rgba(51, 65, 85"],
        html[data-theme="light"] [style*="rgba(12, 18, 32"],
        html[data-theme="light"] [style*="rgba(9, 14, 26"],
        html[data-theme="light"] [style*="#0f172a"],
        html[data-theme="light"] [style*="#111827"],
        html[data-theme="light"] [style*="#020617"] {
            background: rgba(255, 255, 255, 0.88) !important;
            color: #1e293b !important;
            border-color: rgba(148, 163, 184, 0.24) !important;
            box-shadow: 0 14px 34px rgba(15, 23, 42, 0.1) !important;
        }

        html[data-theme="light"] .card-header,
        html[data-theme="light"] .card-header-compact,
        html[data-theme="light"] .period-compare-header,
        html[data-theme="light"] [style*="border-bottom"],
        html[data-theme="light"] [style*="border-top"],
        html[data-theme="light"] [style*="border: 1px solid"],
        html[data-theme="light"] [style*="border:1px solid"] {
            border-color: rgba(148, 163, 184, 0.24) !important;
        }

        html[data-theme="light"] .card-header-compact,
        html[data-theme="light"] .period-compare-header {
            background: linear-gradient(135deg, #f8fafc 0%, #eef4ff 100%) !important;
            color: #0f172a !important;
            border-bottom: 1px solid rgba(148, 163, 184, 0.22) !important;
            box-shadow: inset 4px 0 0 rgba(37, 99, 235, 0.72) !important;
        }

        html[data-theme="light"] .card-header {
            background: transparent !important;
            color: #0f172a !important;
            border-color: rgba(148, 163, 184, 0.22) !important;
            box-shadow: none !important;
        }

        html[data-theme="light"] .card-title-compact,
        html[data-theme="light"] .period-compare-title,
        html[data-theme="light"] .card-header-compact h1,
        html[data-theme="light"] .card-header-compact h2,
        html[data-theme="light"] .card-header-compact h3 {
            color: #0f172a !important;
        }

        html[data-theme="light"] .modal-header {
            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%) !important;
            color: #ffffff !important;
        }

        html[data-theme="light"] table,
        html[data-theme="light"] .table,
        html[data-theme="light"] .modern-table,
        html[data-theme="light"] .analytics-table,
        html[data-theme="light"] .zodiac-table,
        html[data-theme="light"] .markdown-content table,
        html[data-theme="light"] .message-content table {
            background: rgba(255, 255, 255, 0.9) !important;
            color: #1e293b !important;
            border-color: rgba(148, 163, 184, 0.24) !important;
        }

        html[data-theme="light"] th,
        html[data-theme="light"] thead th,
        html[data-theme="light"] .modern-table th,
        html[data-theme="light"] .analytics-table th,
        html[data-theme="light"] .zodiac-table th {
            background: #e8eef8 !important;
            color: #0f172a !important;
            border-color: rgba(148, 163, 184, 0.28) !important;
        }

        html[data-theme="light"] td,
        html[data-theme="light"] .modern-table td,
        html[data-theme="light"] tr {
            color: #334155 !important;
            border-color: rgba(148, 163, 184, 0.22) !important;
        }

        html[data-theme="light"] input,
        html[data-theme="light"] select,
        html[data-theme="light"] textarea,
        html[data-theme="light"] .form-control,
        html[data-theme="light"] .modern-select,
        html[data-theme="light"] .compact-select,
        html[data-theme="light"] .compact-input,
        html[data-theme="light"] .search-input {
            background: rgba(255, 255, 255, 0.96) !important;
            color: #0f172a !important;
            border-color: rgba(100, 116, 139, 0.28) !important;
            box-shadow: none !important;
        }

        html[data-theme="light"] input::placeholder,
        html[data-theme="light"] textarea::placeholder {
            color: #64748b !important;
        }

        html[data-theme="light"] .alert,
        html[data-theme="light"] .alert-card {
            background: rgba(239, 246, 255, 0.92) !important;
            color: #1e3a8a !important;
            border-color: rgba(96, 165, 250, 0.28) !important;
        }

        html[data-theme="light"] .top-user-info {
            background: transparent !important;
            border-color: transparent !important;
            box-shadow: none !important;
            color: #334155 !important;
        }

        html[data-theme="light"] .top-user-label,
        html[data-theme="light"] .user-info > span:not(.theme-switcher-slot) {
            display: inline-flex;
            align-items: center;
            min-height: 36px;
            padding: 0 0.85rem;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.9) !important;
            border: 1px solid rgba(148, 163, 184, 0.28) !important;
            color: #0f172a !important;
            box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08) !important;
            white-space: nowrap;
        }

        html[data-theme="light"] .region-selector {
            background: rgba(241, 245, 249, 0.96) !important;
            border-color: rgba(148, 163, 184, 0.3) !important;
            box-shadow: inset 0 1px 1px rgba(15, 23, 42, 0.04) !important;
        }

        html[data-theme="light"] .region-btn {
            color: #475569 !important;
            background: transparent !important;
            box-shadow: none !important;
        }

        html[data-theme="light"] .region-btn:hover {
            background: rgba(226, 232, 240, 0.95) !important;
            color: #0f172a !important;
        }

        html[data-theme="light"] .region-btn.active,
        html[data-theme="light"] .region-btn.active:hover {
            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%) !important;
            color: #ffffff !important;
            box-shadow: 0 8px 18px rgba(37, 99, 235, 0.22) !important;
        }

        html[data-theme="light"] .region-btn.disabled {
            background: rgba(226, 232, 240, 0.82) !important;
            color: #64748b !important;
        }

        html[data-theme="light"] .modern-btn,
        html[data-theme="light"] .btn,
        html[data-theme="light"] .compact-btn,
        html[data-theme="light"] .action-btn,
        html[data-theme="light"] .save-btn,
        html[data-theme="light"] .page-btn,
        html[data-theme="light"] .generate-btn {
            border: 1px solid transparent !important;
            color: #ffffff !important;
            box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12) !important;
        }

        html[data-theme="light"] .btn-primary,
        html[data-theme="light"] .action-primary,
        html[data-theme="light"] .modern-btn.btn-primary {
            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%) !important;
        }

        html[data-theme="light"] .btn-info,
        html[data-theme="light"] .action-info,
        html[data-theme="light"] .modern-btn.btn-info,
        html[data-theme="light"] .btn-search {
            background: linear-gradient(135deg, #0891b2 0%, #2563eb 100%) !important;
        }

        html[data-theme="light"] .btn-success,
        html[data-theme="light"] .action-success,
        html[data-theme="light"] .modern-btn.btn-success,
        html[data-theme="light"] .generate-btn,
        html[data-theme="light"] .save-btn,
        html[data-theme="light"] .page-btn {
            background: linear-gradient(135deg, #059669 0%, #0d9488 100%) !important;
        }

        html[data-theme="light"] .btn-warning,
        html[data-theme="light"] .action-warning,
        html[data-theme="light"] .modern-btn.btn-warning {
            background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%) !important;
            color: #111827 !important;
        }

        html[data-theme="light"] .btn-danger,
        html[data-theme="light"] .modern-btn.btn-danger {
            background: linear-gradient(135deg, #dc2626 0%, #f97316 100%) !important;
        }

        html[data-theme="light"] .btn-secondary,
        html[data-theme="light"] .modern-btn.btn-secondary,
        html[data-theme="light"] .btn-reset,
        html[data-theme="light"] .quick-question-btn {
            background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%) !important;
            color: #334155 !important;
            border-color: rgba(148, 163, 184, 0.36) !important;
        }

        html[data-theme="light"] .accuracy-item,
        html[data-theme="light"] .region-stat-item,
        html[data-theme="light"] .ml-panel,
        html[data-theme="light"] .stat-item,
        html[data-theme="light"] .help-item,
        html[data-theme="light"] .comparison-row {
            background: rgba(248, 250, 252, 0.92) !important;
            border-color: rgba(148, 163, 184, 0.22) !important;
            box-shadow: none !important;
        }

        html[data-theme="light"] .ball-zodiac,
        html[data-theme="light"] .special-zodiac,
        html[data-theme="light"] .zodiac-label,
        html[data-theme="light"] .invite-code,
        html[data-theme="light"] .page-info {
            background: rgba(241, 245, 249, 0.96) !important;
            color: #1e293b !important;
            border-color: rgba(148, 163, 184, 0.24) !important;
            box-shadow: none !important;
        }

        html[data-theme="light"] .region-progress {
            background: rgba(226, 232, 240, 0.96) !important;
        }

        html[data-theme="light"] .chat-container {
            background: rgba(248, 250, 252, 0.92) !important;
        }

        html[data-theme="light"] .chat-header,
        html[data-theme="light"] .panel-header,
        html[data-theme="light"] .chat-form,
        html[data-theme="light"] .mobile-sidebar-header {
            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%) !important;
            color: #ffffff !important;
        }

        html[data-theme="light"] .chat-header a {
            background: rgba(255, 255, 255, 0.18) !important;
            color: #ffffff !important;
        }

        html[data-theme="light"] .chat-header a:hover {
            background: rgba(255, 255, 255, 0.26) !important;
        }

        html[data-theme="light"] .ai-message::before {
            background: linear-gradient(225deg, #f1f5f9 0%, #f1f5f9 50%, transparent 50%, transparent 100%) !important;
        }

        html[data-theme="light"] .user-message::before {
            background: linear-gradient(135deg, #4f46e5 0%, #4f46e5 50%, transparent 50%, transparent 100%) !important;
        }

        html[data-theme="light"] .ai-name,
        html[data-theme="light"] .message-content a,
        html[data-theme="light"] .quick-question-title {
            color: #2563eb !important;
        }

        html[data-theme="light"] .message-content pre,
        html[data-theme="light"] .message-content code {
            background: rgba(226, 232, 240, 0.92) !important;
            color: #0f172a !important;
            border-color: rgba(148, 163, 184, 0.28) !important;
        }

        html[data-theme="light"] .message-content blockquote {
            color: #475569 !important;
            border-left-color: #2563eb !important;
        }

        html[data-theme="light"] #chat-input {
            background: rgba(255, 255, 255, 0.96) !important;
            color: #0f172a !important;
            border-color: rgba(148, 163, 184, 0.36) !important;
            box-shadow: 0 8px 18px rgba(15, 23, 42, 0.1) !important;
        }

        html[data-theme="light"] .result-pending {
            background: rgba(245, 158, 11, 0.12) !important;
            color: #92400e !important;
        }

        html[data-theme="light"] .result-success,
        html[data-theme="light"] .comparison-up,
        html[data-theme="light"] .delta-up,
        html[data-theme="light"] .stat-value.accuracy,
        html[data-theme="light"] .region-accuracy {
            color: #047857 !important;
        }

        html[data-theme="light"] .result-partial {
            background: rgba(14, 116, 144, 0.1) !important;
            color: #0e7490 !important;
        }

        html[data-theme="light"] .result-failed,
        html[data-theme="light"] .comparison-down,
        html[data-theme="light"] .delta-down {
            color: #b91c1c !important;
        }

        html[data-theme="light"] .comparison-flat,
        html[data-theme="light"] .comparison-neutral,
        html[data-theme="light"] .delta-flat {
            color: #475569 !important;
        }

        html[data-theme="light"] .theme-toggle-button {
            background: rgba(255, 255, 255, 0.9);
            color: #0f172a;
            border-color: rgba(100, 116, 139, 0.28);
            box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
        }

        html[data-theme="light"] .theme-toggle-button:hover,
        html[data-theme="light"] .theme-toggle-button:focus-visible {
            background: #eef6ff;
            border-color: rgba(37, 99, 235, 0.38);
            color: #0f172a;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14), 0 8px 18px rgba(15, 23, 42, 0.1);
        }

        @media (max-width: 575.98px) {
            .theme-switcher-slot {
                margin-right: 0.25rem;
            }

            .theme-toggle-button {
                width: 34px;
                height: 34px;
                min-width: 34px;
                padding: 0;
            }

            .theme-toggle-button::before {
                inset: -5px;
            }

            .theme-toggle-button svg {
                width: 17px;
                height: 17px;
            }

            .theme-toggle-text {
                display: none;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .theme-toggle-button {
                transition: none;
            }

            .theme-toggle-button:active {
                transform: none;
            }
        }
    `;

    if (!document.getElementById(themeStyle.id)) {
        document.head.appendChild(themeStyle);
    }

    function createButton() {
        const button = document.createElement('button');
        button.className = 'theme-toggle-button';
        button.type = 'button';
        button.innerHTML = `
            <svg aria-hidden="true" viewBox="0 0 24 24">
                <path class="theme-icon-path"></path>
            </svg>
            <span class="theme-toggle-text"></span>
        `;
        return button;
    }

    function getSlots() {
        const slots = Array.from(document.querySelectorAll('.theme-switcher-slot'));
        if (slots.length > 0) {
            return slots;
        }

        const userInfo = document.querySelector('.user-info');
        if (userInfo) {
            const slot = document.createElement('span');
            slot.className = 'theme-switcher-slot';
            userInfo.prepend(slot);
            return [slot];
        }

        const navUser = document.querySelector('#navbarDropdown');
        if (navUser && navUser.parentElement) {
            const item = document.createElement('li');
            item.className = 'nav-item d-flex align-items-center';
            item.innerHTML = '<span class="theme-switcher-slot"></span>';
            navUser.parentElement.before(item);
            return Array.from(item.querySelectorAll('.theme-switcher-slot'));
        }

        return [];
    }

    function getStoredMode() {
        const storedMode = localStorage.getItem('user-theme-pref');
        return modes.includes(storedMode) ? storedMode : 'auto';
    }

    function resolveIsLight(mode) {
        if (mode === 'light') {
            return true;
        }
        if (mode === 'dark') {
            return false;
        }
        return window.matchMedia('(prefers-color-scheme: light)').matches;
    }

    function updateButtons(mode) {
        const nextMode = modes[(modes.indexOf(mode) + 1) % modes.length];
        const meta = modeMeta[mode] || modeMeta.auto;
        const nextMeta = modeMeta[nextMode] || modeMeta.auto;

        document.querySelectorAll('.theme-toggle-button').forEach((button) => {
            const iconPath = button.querySelector('.theme-icon-path');
            const label = button.querySelector('.theme-toggle-text');
            button.dataset.mode = mode;
            button.dataset.nextMode = nextMode;
            button.setAttribute('aria-label', `${meta.label}，点击切换为${nextMeta.label}`);
            button.setAttribute('title', meta.title);
            if (iconPath) {
                iconPath.setAttribute('d', meta.path);
            }
            if (label) {
                label.textContent = meta.shortLabel;
            }
        });
    }

    function applyTheme(mode) {
        const resolvedMode = resolveIsLight(mode) ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', resolvedMode);
        document.documentElement.setAttribute('data-bs-theme', resolvedMode);
        localStorage.setItem('user-theme-pref', mode);
        updateButtons(mode);
    }

    function mountButtons() {
        getSlots().forEach((slot) => {
            if (!slot.querySelector('.theme-toggle-button')) {
                const button = createButton();
                button.addEventListener('click', () => {
                    applyTheme(button.dataset.nextMode || 'auto');
                });
                slot.appendChild(button);
            }
        });
        updateButtons(getStoredMode());
    }

    function init() {
        mountButtons();
        applyTheme(getStoredMode());

        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
            if (localStorage.getItem('user-theme-pref') === 'auto') {
                applyTheme('auto');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
