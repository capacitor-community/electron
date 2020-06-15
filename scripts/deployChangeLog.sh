set -e

LERNA_JSON=`cat lerna.json`;
export LERNA_VERSION="$(node -pe "JSON.parse(\`$LERNA_JSON\`)['version']")"

echo "Deploying Capacitor v$LERNA_VERSION changelog"

# This is what we do instead of letting lerna git commit for us
git add CHANGELOG.md
git commit -m "chore: update changelog for $LERNA_VERSION"
git push origin master