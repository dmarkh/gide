# Event Display v2

This is the Geometry and Event Display designed to be used for Nuclear and Particle Physics experiments.

## Features
   - web-based, zero-install
   - detector geometry import format: GDML
   - event data import format: JSON
   - hi-quality images export formats: PNG or SVG

## Install

Pre-requisite: Node.js-11.x or later.

After cloning the repository, install dependencies:
```sh
cd <project folder>
npm install
```

Now you can compile the Event Display:
```sh
npm run build
```
Build results will be stored to the <project folder>/www directory. Event Display does not have any external dependencies, and it does not 
upload anything to the server, so it can be hosted anywhere generic html hosting service is provided.

Now, one can add desired event collections to /www/events/collections.json, and geometries to the /www/gdml/geometries.json.

## License

MIT