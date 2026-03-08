#!/usr/bin/env bash
# Fetch DVC points chart PDF URLs from Disney's content API.
#
# The official DVC website (disneyvacationclub.disney.go.com/vacation-planning/points-charts)
# is an Angular SPA — HTML scraping doesn't work. This script hits their internal
# content API and extracts all PDF links with their component context (resort code).
#
# Usage:
#   ./fetch_pdf_urls.sh              # list all PDF URLs
#   ./fetch_pdf_urls.sh | grep 2027  # filter to a specific year
#   ./fetch_pdf_urls.sh --download   # download all PDFs to ./pdfs/
#
# Output format:
#   points-charts-contentblock-AKV: https://cdn1.parksmedia.wdprapps.disney.com/.../2027_AKV_AKV2.pdf
#   points-charts-contentblock-BLT: https://cdn1.parksmedia.wdprapps.disney.com/.../2027_BLT.pdf
#   ...

set -euo pipefail

API_URL="https://disneyvacationclub.disney.go.com/api/v1/content?url=/vacation-planning/points-charts&format=raw"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

urls=$(curl -s -A "$UA" "$API_URL" | python3 -c "
import json, sys
data = json.load(sys.stdin)
def find_pdfs(obj, context=''):
    if isinstance(obj, dict):
        cn = obj.get('componentName', obj.get('id', ''))
        ctx = cn if cn else context
        for k, v in obj.items():
            if k == 'href' and isinstance(v, str) and '.pdf' in v.lower():
                print(f'{ctx}: {v}')
            find_pdfs(v, ctx)
    elif isinstance(obj, list):
        for item in obj:
            find_pdfs(item, context)
find_pdfs(data)
")

if [[ "${1:-}" == "--download" ]]; then
  mkdir -p pdfs
  echo "$urls" | while IFS=': ' read -r label url; do
    filename=$(basename "$url")
    echo "Downloading $filename ..."
    curl -s -o "pdfs/$filename" "$url"
  done
  echo "Done. PDFs saved to ./pdfs/"
else
  echo "$urls"
fi
