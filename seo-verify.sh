#!/bin/bash

# SEO Quick Verification Script for QuizKen
# Run this to quickly test if SEO is working

DOMAIN="https://quizken.vercel.app"
COLORS='\033[0m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'

echo -e "${BLUE}=== QuizKen SEO Verification Script ===${COLORS}\n"

# Function to check and print results
check_status() {
  local url=$1
  local description=$2
  
  echo -n "Testing: $description ... "
  
  status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
  
  if [ "$status_code" = "200" ]; then
    echo -e "${GREEN}✓ PASS (HTTP $status_code)${COLORS}"
    return 0
  elif [ "$status_code" = "000" ]; then
    echo -e "${RED}✗ FAIL - Connection error${COLORS}"
    return 1
  else
    echo -e "${YELLOW}⚠ Check needed (HTTP $status_code)${COLORS}"
    return 1
  fi
}

# Function to check file existence in HTML
check_meta() {
  local url=$1
  local meta=$2
  local description=$3
  
  echo -n "Checking: $description ... "
  
  result=$(curl -s "$url" | grep -i "$meta" | head -1)
  
  if [ -n "$result" ]; then
    echo -e "${GREEN}✓ FOUND${COLORS}"
    echo "  → $result" | head -c 100
    echo ""
    return 0
  else
    echo -e "${RED}✗ NOT FOUND${COLORS}"
    return 1
  fi
}

# ============ FILE CHECKS ============
echo -e "${BLUE}--- File Checks ---${COLORS}\n"

check_status "$DOMAIN/sitemap.xml" "Sitemap.xml"
check_status "$DOMAIN/robots.txt" "Robots.txt"
check_status "$DOMAIN/" "Homepage"
check_status "$DOMAIN/about" "About page"

echo ""

# ============ META TAG CHECKS ============
echo -e "${BLUE}--- Meta Tag Checks (Homepage) ---${COLORS}\n"

check_meta "$DOMAIN/" "<title>" "Page Title"
check_meta "$DOMAIN/" 'name="description"' "Meta Description"
check_meta "$DOMAIN/" 'name="keywords"' "Keywords"
check_meta "$DOMAIN/" 'property="og:title"' "OG Title"
check_meta "$DOMAIN/" 'property="og:image"' "OG Image"
check_meta "$DOMAIN/" 'rel="canonical"' "Canonical URL"

echo ""

# ============ SCHEMA CHECKS ============
echo -e "${BLUE}--- Schema Markup Checks ---${COLORS}\n"

check_meta "$DOMAIN/" '"@type": "Organization"' "Organization Schema"
check_meta "$DOMAIN/" '"@type": "SoftwareApplication"' "SoftwareApplication Schema"
check_meta "$DOMAIN/about" '"@type": "BreadcrumbList"' "BreadcrumbList Schema (About)"

echo ""

# ============ SUMMARY ============
echo -e "${BLUE}=== Test Summary ===${COLORS}"
echo -e "✓ Sitemap and robots.txt should be accessible"
echo -e "✓ All meta tags should be present"
echo -e "✓ Schema markup should be valid\n"

echo -e "${YELLOW}Next Steps:${COLORS}"
echo "1. Visit: https://search.google.com/test/mobile-friendly"
echo "2. Visit: https://pagespeed.web.dev/"
echo "3. Visit: https://search.google.com/test/rich-results"
echo "4. Setup: https://search.google.com/search-console\n"

echo -e "${GREEN}Test completed! 🚀${COLORS}"
