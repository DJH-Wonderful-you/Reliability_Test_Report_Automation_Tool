#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Desktop launcher for the packaged application.

This keeps the development Flask entry point unchanged while giving PyInstaller
a stable script that starts the production server and opens the browser.
"""

import os
import socket
import sys
import threading
import webbrowser


CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from app import create_app  # noqa: E402


def _find_free_port(preferred=5000, limit=100):
    for port in range(preferred, preferred + limit):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(0.2)
            if sock.connect_ex(('127.0.0.1', port)) != 0:
                return port
    raise RuntimeError('No free local port found.')


def _open_browser(url):
    try:
        webbrowser.open(url)
    except Exception:
        pass


def main():
    preferred_port = int(os.environ.get('RELIABILITY_TOOL_PORT', '5100'))
    port = _find_free_port(preferred_port)
    url = f'http://127.0.0.1:{port}'

    app = create_app()

    print('Reliability Test Report Automation Tool')
    print(f'URL: {url}')
    print('Close this window to stop the application.')

    if os.environ.get('RELIABILITY_TOOL_NO_BROWSER') != '1':
        threading.Timer(1.0, _open_browser, args=(url,)).start()
    app.run(host='127.0.0.1', port=port, debug=False, use_reloader=False)


if __name__ == '__main__':
    main()
