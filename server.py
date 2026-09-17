#!/usr/bin/env python3
"""
Lagos On Chain (LOC) Local Web Server
Runs standard zero-dependency HTTP server with clean CORS and MIME types.
"""

import http.server
import socketserver
import os
import sys

PORT = 8080

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def run():
    web_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(web_dir)
    
    # Allow port reuse to avoid address already in use error
    socketserver.TCPServer.allow_reuse_address = True
    
    # Try PORT or fallback
    port = PORT
    for p in [8080, 8081, 8082, 3000]:
        try:
            with socketserver.TCPServer(("", p), CORSRequestHandler) as httpd:
                print(f"⚡ Lagos On Chain (LOC) Server running at: http://localhost:{p}")
                print(f"Serving directory: {web_dir}")
                print("Press Ctrl+C to stop.")
                httpd.serve_forever()
                break
        except OSError:
            continue

if __name__ == '__main__':
    run()
