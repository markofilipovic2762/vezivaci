#!/bin/bash
REMOTE_USER="aplikacija"
REMOTE_HOST="react.zelsd.rs"
PASSWORD="aplikacije"
#############################################################################
# Definisi samo ove 2 varijable za svoju aplikaciju (build folder aplikacije i naziv aplikacije):

BUILD_DIR="D:\marko\vezivaci\dist\*"
APP_NAME="vezivaci"

# Konfiguracija varijabli .env fajla
FILE_ENV=".env"
TEXT_ENV=$(cat <<EOF
PUBLIC_URL=/${APP_NAME}
EOF
)
ESCAPED_TEXT_ENV=$(echo "$TEXT_ENV" | sed ':a;N;$!ba;s/\n/\\n/g; s/'\''/'"'\''"'"'\''/g')

# Konfiguracija varijabli package.json
FILE_JSON="package.json"
LINE_NUMBER_JSON=2
TEXT_JSON=$(cat <<EOF
"homepage": "/${APP_NAME}",
EOF
)

#Konfiguracione varijable za nginx
REMOTE_DIR="/var/www/${APP_NAME}"
FILENAME="/etc/nginx/sites-available/default"
LINE_NUMBER=7
TEXT=$(cat <<EOF
\\n    location /${APP_NAME}/ {
        try_files \\\$uri \\\$uri/ /${APP_NAME}/index.html =404;
    }
EOF
)

ESCAPED_TEXT=$(echo "$TEXT" | sed ':a;N;$!ba;s/\n/\\n/g; s/'\''/'"'\''"'"'\''/g')
REMOTE_COMMAND="sudo -S sed -i '${LINE_NUMBER} a\\
${ESCAPED_TEXT}' ${FILENAME}"

#############################################################################



if grep -q '"homepage":' "$FILE_JSON"; then
    echo "The 'homepage' property already exists in the file."
else
    ESCAPED_TEXT_JSON=$(echo "$TEXT_JSON" | sed ':a;N;$!ba;s/\n/\\n/g; s/'\''/'"'\''"'"'\''/g')

    sed -i "${LINE_NUMBER_JSON} a\\
  ${ESCAPED_TEXT_JSON}" "$FILE_JSON"
fi

if grep -q 'PUBLIC_URL' "$FILE_ENV"; then
    echo "The 'PUBLIC_URL' variable already exists in the file."
else
    if [ -s "$FILE_ENV" ]; then
        ESCAPED_TEXT_ENV=$(echo "$TEXT_ENV" | sed ':a;N;$!ba;s/\n/\\n/g; s/'\''/'"'\''"'"'\''/g')
        touch .env && sed -i "a\\
${ESCAPED_TEXT_ENV}" "$FILE_ENV"
    else
        echo "$TEXT_ENV" > "$FILE_ENV"
    fi
fi

npm run build

# Ubacuje konfiguraciju aplikacije za nginx na server(samo jednom pokrenuti uz flag -init npr "npm run deploy -init")  #

if [[ "$1" == "init" ]]; then

    echo "$PASSWORD" | plink -ssh "$REMOTE_USER@$REMOTE_HOST" -pw "$PASSWORD" "$REMOTE_COMMAND"

    echo "Konfigurisem nginx..."

    sleep 5

    echo "Restartujem nginx..."

    # Restartuje nginx
    echo "$PASSWORD" | plink -ssh "$REMOTE_USER@$REMOTE_HOST" -pw "$PASSWORD" "sudo -S systemctl restart nginx"
fi

##################################################################################


# # Kreira folder sa nazivom projekta na Linux, ako vec ne postoji
KREIRAJ_FOLDER="sudo -S mkdir -p $REMOTE_DIR"
DAJ_PRIVILEGIJE="sudo -S chmod -R 777 $REMOTE_DIR"
echo "pravim folder aplikacije..."
echo $PASSWORD | plink -ssh "$REMOTE_USER@$REMOTE_HOST" -pw "$PASSWORD" "$KREIRAJ_FOLDER"
echo "dajem privilegije folderu"
sleep 1
echo $PASSWORD | plink -ssh "$REMOTE_USER@$REMOTE_HOST" -pw "$PASSWORD" "$DAJ_PRIVILEGIJE"


# # Kopira sadrzaj build foldera na Linux server
pscp -pw $PASSWORD -r $BUILD_DIR $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR