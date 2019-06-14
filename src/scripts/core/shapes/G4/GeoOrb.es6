
import * as THREE from 'three';

class GeoOrb extends THREE.Geometry {

    constructor({ rmax, numSegs, numSegsZ }) {
        super();
        this.parameters = { rmax, numSegs, numSegsZ };
        this.type = 'GeoOrb';
        this.fromBufferGeometry( new GeoOrbBuffer({ rmax, numSegs, numSegsZ }) );
		this.mergeVertices();
    }

}

class GeoOrbBuffer extends THREE.BufferGeometry {

	constructor({ rmax = 50, numSegs = 12, numSegsZ = 12 }) {
        super();
        this.parameters = { rmax, numSegs, numSegsZ };
        this.type = 'GeoOrbBuffer';

		// helper arrays
		let vertices = [],
			indices  = [];

		let fX, fY, fZ, fRds;

		// outer vertices
		for ( let j = 0; j <= numSegsZ; j++ ) {
			for ( let i = 0; i <= numSegs; i++ ) {
				fZ   = rmax * Math.cos( Math.PI * j / numSegsZ );
				fRds = rmax * Math.sin( Math.PI * j / numSegsZ );
				fX = fRds * Math.cos( 2 * Math.PI * i / numSegs );
				fY = fRds * Math.sin( 2 * Math.PI * i / numSegs );
				vertices.push( fX, fY, fZ );
			}
		}

		let i0, i1, i2, i3;

		// outer face indices
		for ( let j = 0; j < numSegsZ; j++ ) {
			for ( let i = 0; i < numSegs; i++) {
				i0 = j * (numSegs+1) + i;
				i1 = j * (numSegs+1) + i + 1;
				i2 = (j+1) * (numSegs+1) + i + 1;
				i3 = (j+1) * (numSegs+1) + i;
				indices.push( i3, i1, i0, i3, i2, i1 );
			}
		}

		// convert data into buffers
		this.setIndex( indices );
		this.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
		this.computeVertexNormals();
	}

}

export { GeoOrb, GeoOrbBuffer };
