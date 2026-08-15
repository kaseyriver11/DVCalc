#!/usr/bin/env bash
# Download all DVC point chart PDFs from dvcfieldguide.com/point-archive
# for 2016 and later, organized by resort.
#
# Usage:
#   ./scripts/download_historical_pdfs.sh           # download all
#   ./scripts/download_historical_pdfs.sh --dry-run  # list what would be downloaded

set -euo pipefail

BASE_URL="https://dvcfieldguide.com/s"
PDF_DIR="$(cd "$(dirname "$0")/.." && pwd)/pdfs"
DRY_RUN=false

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

# Resort ID -> directory name mapping
# Format: "resort_dir|year|filename"
declare -a DOWNLOADS=(
  # Animal Kingdom Villas (AKV)
  "akv|2027|2027_AKV_AKV2.pdf"
  "akv|2026|AKV-AKV2-2026.pdf"
  "akv|2025|2025-AKV-111723.pdf"
  "akv|2024|2024_DAKK_Points_Chart.pdf"
  "akv|2023|AKV_2023.pdf"
  "akv|2022|AKV_2022_Revised.pdf"
  "akv|2021|FINAL_2021_DVC_AKV_Pt_Chts.pdf"
  "akv|2020|FINAL_2020_DVC_AKV_Pt_Chts.pdf"
  "akv|2019|2019-AKV-Pts-Cht-122117.pdf"
  "akv|2018|2018-DVC-AKV-Pt-Chart-112716.pdf"
  "akv|2017|AKV2017.pdf"
  "akv|2016|2016-DAKV-Pt-Cht-FINAL-121614.pdf"

  # Aulani
  "aul|2027|2027_AULV.pdf"
  "aul|2026|2026-AUL-V2.pdf"
  "aul|2025|2025-AUL-111723.pdf"
  "aul|2024|AUL2024.pdf"
  "aul|2023|AUL_2023-6tk2.pdf"
  "aul|2022|FINAL_2022_DVC_AUV_Pt_Chts.pdf"
  "aul|2021|FINAL_2021_DVC_AULANI_Pt_Chts.pdf"
  "aul|2020|FINAL_2020_DVC_AULV_Pt_Chts.pdf"
  "aul|2019|Dec-26-2019-AULV-Pts-Cht-122117.pdf"
  "aul|2018|2018-DVC-AULV-Pt-Chart-112716.pdf"
  "aul|2017|AULV_2017.pdf"
  "aul|2016|2016-AULANI-Pt-Cht-FINAL-121614-cmbf.pdf"

  # Bay Lake Tower (BLT)
  "blt|2027|2027_BLT.pdf"
  "blt|2026|2026-BLT.pdf"
  "blt|2025|2025-BLT-111723.pdf"
  "blt|2024|BLT2024.pdf"
  "blt|2023|BLT_2023-6bh5.pdf"
  "blt|2022|BLT_2022_Revised.pdf"
  "blt|2021|FINAL_2021_DVC_BLT_Pt_Chts.pdf"
  "blt|2020|FINAL_2020_DVC_BLT_Pt_Chts.pdf"
  "blt|2019|2019-BLT-Pts-Cht-122117.pdf"
  "blt|2018|2018-DVC-BLT-Pt-Chart-112716.pdf"
  "blt|2017|BLT2017.pdf"
  "blt|2016|2016-BLT-Pt-Cht-FINAL-121614-f57p.pdf"

  # Beach Club Villas (BCV)
  "bcv|2027|2027_BCV.pdf"
  "bcv|2026|BCV-2026.pdf"
  "bcv|2025|2025-BCV-111723.pdf"
  "bcv|2024|BCV_2024.pdf"
  "bcv|2023|BCV_2023.pdf"
  "bcv|2022|BCV_2022_Revised.pdf"
  "bcv|2021|FINAL_2021_DVC_BCV_Pt_Chts.pdf"
  "bcv|2020|FINAL_2020_DVC_BCV_Pt_Chts.pdf"
  "bcv|2019|2019-BCV-Pts-Cht-122117.pdf"
  "bcv|2018|2018-DVC-BCV-Pt-Chart-112716.pdf"
  "bcv|2017|BCV2017.pdf"
  "bcv|2016|2016-BCV-Pt-Cht-FINAL-121614.pdf"

  # BoardWalk Villas (BWV)
  "bwv|2027|2027_BWALK.pdf"
  "bwv|2026|BWALK-2026.pdf"
  "bwv|2025|2025-BWV-111723.pdf"
  "bwv|2024|BWV_2024.pdf"
  "bwv|2023|BWV_2023.pdf"
  "bwv|2022|BW_2022_Revised.pdf"
  "bwv|2021|FINAL_2021_DVC_BWV_Pt_Chts.pdf"
  "bwv|2020|FINAL_2020_DVC_BWV_Pt_Chts.pdf"
  "bwv|2019|2019-BWV-Pts-Cht-122117.pdf"
  "bwv|2018|2018_DVC_BoardWalkVilla_PtCht_2018.pdf"
  "bwv|2017|BWALK2017.pdf"
  "bwv|2016|2016-BWALK-Pt-Cht-FINAL-121614.pdf"

  # Boulder Ridge Villas (BRV/VWL)
  "brv|2027|2027_VWL-BRV.pdf"
  "brv|2026|VWL-BRV-2026.pdf"
  "brv|2025|2025-BRV-111723.pdf"
  "brv|2024|2024_BRV_DWL_Points_Chart.pdf"
  "brv|2023|BRV_2023.pdf"
  "brv|2022|VWL_2022_Revised.pdf"
  "brv|2021|FINAL_2021_DVC_VWL_Pt_Chts.pdf"
  "brv|2020|FINAL_2020_DVC_VWL_BRV_Pt_Chts.pdf"
  "brv|2019|2019-VWL-Pts-Cht-122117.pdf"
  "brv|2018|2018-DVC-BRVWL-Pt-Chart-112716.pdf"
  "brv|2017|VWL2017.pdf"
  "brv|2016|2016-VWL-Pt-Cht-FINAL-121614.pdf"

  # Cabins at Fort Wilderness (CFW) - only 2024+
  "cfw|2027|2027_CFW.pdf"
  "cfw|2026|CFW-2026.pdf"
  "cfw|2025|CFW-2024-2025-FINAL-1_8_25.pdf"
  "cfw|2024|CFW-2024-2025-FINAL-1_8_24.pdf"

  # Copper Creek Villas (CCV/WCC)
  "ccv|2027|2027_WCC-CCVC.pdf"
  "ccv|2026|WCC-CCVC-2026.pdf"
  "ccv|2025|2025-WCC-111723.pdf"
  "ccv|2024|2024_CCVC_Points_Chart.pdf"
  "ccv|2023|WCC_2023.pdf"
  "ccv|2022|WCC_2022_Revised.pdf"
  "ccv|2021|FINAL_2021_DVC_WCC_Pt_Chts_r.pdf"
  "ccv|2020|FINAL_2020_DVC_VWL_CCVC_Pt_Chts.pdf"
  "ccv|2019|2019-WCC-Pts-Cht-122117.pdf"
  "ccv|2018|2018-DVC-WCC-Pt-Chart-021317.pdf"
  "ccv|2017|2017-DVC-WCC.pdf"

  # Disneyland Hotel (VDH) - only 2023+
  "vdh|2027|2027_VDH.pdf"
  "vdh|2026|VDH-2026.pdf"
  "vdh|2025|2025-VDH-112223.pdf"
  "vdh|2024|VDH_Points_Charts_2024_FINAL.pdf"
  "vdh|2023|VDH_Points_Charts_2023_FINAL.pdf"

  # Grand Californian (GCV)
  "gcv|2027|2027_GCAL-VGC.pdf"
  "gcv|2026|GCAL-2026.pdf"
  "gcv|2025|2025-GCV-111723.pdf"
  "gcv|2024|GCV_2024.pdf"
  "gcv|2023|GCAL_2023-3sd4.pdf"
  "gcv|2022|FINAL_2022_DVC_GCAL_Pt_Chts.pdf"
  "gcv|2021|FINAL_2021_DVC_GCAL_Pt_Chts_Revised.pdf"
  "gcv|2020|FINAL_2020_DVC_GCAL_Pt_Chts.pdf"
  "gcv|2019|2019-VGC-Pts-Cht-122117.pdf"
  "gcv|2018|2018-NEW-DVC_VGC-Pt-Chart-112716.pdf"
  "gcv|2017|VGC2017.pdf"
  "gcv|2016|2016-GCAL-Pt-Cht-FINAL-121614.pdf"

  # Grand Floridian (VGF)
  "vgf|2027|2027_VGF.pdf"
  "vgf|2026|VGF-2026.pdf"
  "vgf|2025|2025-VGF-111723.pdf"
  "vgf|2024|VGF_2024.pdf"
  "vgf|2023|VGF_2023.pdf"
  "vgf|2022|VGF-2022-Revised-V21-Resort-Studio-revised-final-b3ls.pdf"
  "vgf|2021|FINAL_2021_DVC_VGF_Pt_Chts.pdf"
  "vgf|2020|FINAL_2020_DVC_VGF_Pt_Chts.pdf"
  "vgf|2019|2019-VGF-Pts-Cht-122117.pdf"
  "vgf|2018|2018-DVC-VGF-Pt-Chart-112716.pdf"
  "vgf|2017|VGF2017.pdf"
  "vgf|2016|2016-VGF-Pt-Cht-FINAL-121614-t94h.pdf"

  # Hilton Head Island (HHI)
  "hhi|2027|2027_HH.pdf"
  "hhi|2026|HH-2026.pdf"
  "hhi|2025|2025-HH-111723.pdf"
  "hhi|2024|HH_2024.pdf"
  "hhi|2023|HH_2023.pdf"
  "hhi|2022|FINAL_2022_DVC_HH_Pt_Chts.pdf"
  "hhi|2021|FINAL_2021_DVC_HH_Pt_Chts.pdf"
  "hhi|2020|FINAL_2020_DVC_HHI_Pt_Chts.pdf"
  "hhi|2019|2019-HHI-Pts-Cht-122117.pdf"
  "hhi|2018|2018-DVC-HHI-Pt-Chart-112716.pdf"
  "hhi|2017|HHI2017.pdf"
  "hhi|2016|2016-HHI-Pt-Cht-FINAL-121614.pdf"

  # Old Key West (OKW)
  "okw|2027|2027_CLUB-OKW.pdf"
  "okw|2026|CLUB-OKW-2026.pdf"
  "okw|2025|2025-OKW-111723.pdf"
  "okw|2024|OKW_2024.pdf"
  "okw|2023|OKW_2023.pdf"
  "okw|2022|OKW_2022_Revised.pdf"
  "okw|2021|FINAL_2021_DVC_OKW_Pt_Chts.pdf"
  "okw|2020|FINAL_2020_DVC_OKW_Pt_Chts.pdf"
  "okw|2019|2019-OKW-Pts-Cht-122117.pdf"
  "okw|2018|2018-DVC-OKW-Pt-Chart-112716.pdf"
  "okw|2017|OKW2017.pdf"
  "okw|2016|2016-OKW-Pt-Cht-FINAL-121614.pdf"

  # Polynesian Villas & Bungalows (PVB)
  "pvb|2027|2027_POLYV.pdf"
  "pvb|2026|POLYV-2026.pdf"
  "pvb|2025|2024-2025-PVB-090324.pdf"
  "pvb|2024|PVB_2024.pdf"
  "pvb|2023|POLY_2023.pdf"
  "pvb|2022|POLY_2022_Revised.pdf"
  "pvb|2021|FINAL_2021_DVC_POLY_Pt_Chts.pdf"
  "pvb|2020|FINAL_2020_DVC_PVB_Pt_Chts.pdf"
  "pvb|2019|2019-PVB-Pts-Cht-122117.pdf"
  "pvb|2018|2018-DVC-PVB-Pt-Chart-122616.pdf"
  "pvb|2017|PVB2017.pdf"
  "pvb|2016|2016-POLY-Pt-Cht-FINAL-121614.pdf"

  # Riviera Resort (RIV) - only 2020+
  "riv|2027|2027_RVA.pdf"
  "riv|2026|RIV-2026.pdf"
  "riv|2025|2025-RVA-111723.pdf"
  "riv|2024|RVA_2024.pdf"
  "riv|2023|RIV_2023.pdf"
  "riv|2022|RIV_2022_Revised.pdf"
  "riv|2021|FINAL_2021_DVC_RIVIERA_Pt_Chts.pdf"
  "riv|2020|FINAL-2020-DVC-RIVIERA-Pt-Chts.pdf"

  # Saratoga Springs (SSR)
  "ssr|2027|2027_SSR.pdf"
  "ssr|2026|SSR-2026.pdf"
  "ssr|2025|2025-SSR-111723.pdf"
  "ssr|2024|SSR_2024.pdf"
  "ssr|2023|SSR_2023.pdf"
  "ssr|2022|SSR_2022_Revised.pdf"
  "ssr|2021|FINAL_2021_DVC_SSR_Pt_Chts.pdf"
  "ssr|2020|FINAL_2020_DVC_DSSR_Pt_Chts.pdf"
  "ssr|2019|2019-SSR-Pts-Cht-122117.pdf"
  "ssr|2018|2018-DVC-SSR-Pt-Chart-112716.pdf"
  "ssr|2017|DSSR2017.pdf"
  "ssr|2016|2016-DSSR-Pt-Cht-FINAL-121614.pdf"

  # Vero Beach (VBR)
  "vbr|2027|2027_VERO.pdf"
  "vbr|2026|VERO-2026.pdf"
  "vbr|2025|2025-VB-111723.pdf"
  "vbr|2024|VB_2024.pdf"
  "vbr|2023|VB_2023.pdf"
  "vbr|2022|FINAL_2022_DVC_VERO_Pt_Chts.pdf"
  "vbr|2021|FINAL_2021_DVC_VERO_Pt_Chts.pdf"
  "vbr|2020|FINAL_2020_DVC_VERO_Pt_Chts.pdf"
  "vbr|2019|2019-VERO-Pts-Cht-122117.pdf"
  "vbr|2018|2018-DVC-VERO-Pt-Chart-122117.pdf"
  "vbr|2017|2017-Vero.pdf"
  "vbr|2016|2016-VERO-Pt-Cht-FINAL-121614.pdf"
)

downloaded=0
skipped=0
failed=0

for entry in "${DOWNLOADS[@]}"; do
  IFS='|' read -r resort year filename <<< "$entry"
  dir="$PDF_DIR/${resort}_archive"
  # Rename file to consistent format: resort_year.pdf
  dest="$dir/${resort}_${year}.pdf"

  if $DRY_RUN; then
    echo "[DRY RUN] $BASE_URL/$filename -> $dest"
    continue
  fi

  mkdir -p "$dir"

  if [[ -f "$dest" ]]; then
    skipped=$((skipped + 1))
    echo "SKIP (exists): $dest"
    continue
  fi

  echo "Downloading ${resort} ${year}..."
  if curl -sL -o "$dest" "$BASE_URL/$filename"; then
    # Verify it's actually a PDF (not an error page)
    if file "$dest" | grep -q "PDF"; then
      downloaded=$((downloaded + 1))
      echo "  OK: $dest"
    else
      echo "  WARN: $dest is not a valid PDF, removing"
      rm "$dest"
      failed=$((failed + 1))
    fi
  else
    echo "  FAIL: $BASE_URL/$filename"
    failed=$((failed + 1))
  fi
done

if ! $DRY_RUN; then
  echo ""
  echo "=== Summary ==="
  echo "Downloaded: $downloaded"
  echo "Skipped (already existed): $skipped"
  echo "Failed: $failed"
  echo "Total entries: ${#DOWNLOADS[@]}"
fi
