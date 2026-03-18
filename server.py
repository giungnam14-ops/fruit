import http.server
import socketserver

PORT = 5000

Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({
    '.webapp': 'application/x-web-app-manifest+json',
});

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    import socket
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    print(f"Serving at:")
    print(f" - Local: http://localhost:{PORT}")
    print(f" - Network: http://{local_ip}:{PORT}")
    httpd.serve_forever()
