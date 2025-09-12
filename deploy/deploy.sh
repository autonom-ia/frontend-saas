#!/usr/bin/env bash
set -euo pipefail

# Deploy Next.js static export to AWS S3 + CloudFront
# Requirements:
# - AWS CLI v2 configured (aws configure)
# - jq, node, npm
# - Terraform applied in autonom.ia/terraform to create S3/CloudFront

ROOT_DIR="$(cd "$(dirname "$0")"/.. && pwd)"
TF_DIR="$(cd "$(dirname "$0")"/../../terraform && pwd)"

# Build and export Next app
pushd "$ROOT_DIR" >/dev/null

# Respect existing env (e.g. NEXT_PUBLIC_API_URL)
export NODE_ENV=production

npm ci
npm run build
# Build now emits static export into out/ (next.config.ts has output: 'export')

popd >/dev/null

# Optionally update Terraform (init + apply) before reading outputs
TF_UPDATE=${TF_UPDATE:-true}
if [[ "$TF_UPDATE" == "true" ]]; then
  if ! command -v terraform >/dev/null; then
    echo "terraform is required. Please install Terraform." >&2
    exit 1
  fi
  pushd "$TF_DIR" >/dev/null
  terraform init -upgrade
  terraform apply -auto-approve
  popd >/dev/null
else
  echo "Skipping Terraform apply (TF_UPDATE=false)"
fi

# Read terraform outputs
if ! command -v jq >/dev/null; then
  echo "jq is required. Please install jq." >&2
  exit 1
fi

TF_OUTPUT_JSON=$(cd "$TF_DIR" && terraform output -json)
BUCKET=$(echo "$TF_OUTPUT_JSON" | jq -r '.frontend_bucket_name.value')
DISTRIBUTION_ID=$(echo "$TF_OUTPUT_JSON" | jq -r '.frontend_cloudfront_distribution_id.value')

if [[ -z "$BUCKET" || "$BUCKET" == "null" ]]; then
  echo "Error: Could not read frontend_bucket_name from terraform outputs." >&2
  exit 1
fi

# Upload files
BUILD_DIR="$ROOT_DIR/out"

# 1) Upload cacheable static assets (long cache)
aws s3 sync "$BUILD_DIR" s3://"$BUCKET"/ \
  --delete \
  --exclude "*" \
  --include "**/*.css" \
  --include "**/*.js" \
  --include "**/*.png" \
  --include "**/*.jpg" \
  --include "**/*.jpeg" \
  --include "**/*.gif" \
  --include "**/*.svg" \
  --include "**/*.webp" \
  --include "**/*.ico" \
  --cache-control "public, max-age=31536000, immutable"

# 2) Upload HTML/TXT/JSON with no-cache (route files must always be fresh)
aws s3 sync "$BUILD_DIR" s3://"$BUCKET"/ \
  --delete \
  --exclude "*" \
  --include "**/*.html" \
  --include "**/*.txt" \
  --include "**/*.json" \
  --cache-control "no-cache, no-store, must-revalidate"

# 3) Upload the remaining assets (fonts, maps, etc.) with moderate cache
aws s3 sync "$BUILD_DIR" s3://"$BUCKET"/ \
  --delete \
  --exclude "**/*.css" \
  --exclude "**/*.js" \
  --exclude "**/*.png" \
  --exclude "**/*.jpg" \
  --exclude "**/*.jpeg" \
  --exclude "**/*.gif" \
  --exclude "**/*.svg" \
  --exclude "**/*.webp" \
  --exclude "**/*.ico" \
  --exclude "**/*.html" \
  --exclude "**/*.txt" \
  --exclude "**/*.json" \
  --cache-control "public, max-age=86400"

# Create CloudFront invalidation
if [[ -n "$DISTRIBUTION_ID" && "$DISTRIBUTION_ID" != "null" ]]; then
  aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"
else
  echo "Warning: CloudFront distribution id not found in terraform outputs. Skipping invalidation."
fi

echo "Deploy completed. Bucket: $BUCKET"
