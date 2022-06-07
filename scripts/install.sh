cd "$( dirname "$0" )/.."

# MAIN APP INSTALLATION
npm i
npm run build

# MAIN APP AUTOSTART
mv dist/hydrogen-energy-ui* dist/hydrogen-energy-ui.AppImage
chmod +x dist/hydrogen-energy-ui.AppImage
echo '~/inengergy-gui/hydrogen-energy-ui/dist/hydrogen-energy-ui.AppImage > ~/.inenergy/hydrogen-energy-ui.log' > ~/.config/openbox/autostart
mkdir ~/.inenergy
echo "{}" > ~/.inenergy/config.json