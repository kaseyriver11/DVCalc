"""Local dev server for DVC Companion: python scripts/dev_server.py [port]

Same as `python -m http.server`, but it keeps Chrome from running stale
copies of app.js/styles.css/tokens.css:

- Every response says Cache-Control: no-cache -- Chrome may keep a copy
  but must check with this server before using it, so a changed file
  always wins. (no-store was tried first and made things worse: it stops
  Chrome saving the NEW file but leaves an OLD saved copy in place, so a
  hard refresh looked fixed and the next normal load went back to old
  styles.)
- Every page (.html) also says Clear-Site-Data: "cache", which wipes
  whatever Chrome saved for localhost earlier -- copies from a plain
  http.server, which sends no caching headers at all, can otherwise stay
  "fresh" for days.

Serves the repo root whatever directory it's started from. (GitHub Pages,
in production, sends its own short max-age.)
"""
import http.server
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        path = self.path.split("?", 1)[0]
        if path.endswith("/") or path.endswith(".html"):
            self.send_header("Clear-Site-Data", '"cache"')
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8791
    print(f"Serving {ROOT} at http://localhost:{port}/ (no stale caching)")
    http.server.ThreadingHTTPServer(("", port), NoCacheHandler).serve_forever()
