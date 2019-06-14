
import * as THREE from 'three';

class GeoSphe extends THREE.Geometry {

    constructor({ rmin, rmax, the1, the2, phi1, phi2, numSegs, numSegsZ }) {
        super();
        this.parameters = { rmin, rmax, the1, the2, phi1, phi2, numSegs, numSegsZ };
        this.type = 'GeoSphe';
        this.fromBufferGeometry( new GeoSpheBuffer({ rmin, rmax, the1, the2, phi1, phi2, numSegs, numSegsZ }) );
		this.mergeVertices();
    }

}

class GeoSpheBuffer extends THREE.BufferGeometry {

	constructor({ rmin = 40, rmax = 50, the1 = 30, the2 = 150, phi1 = 0, phi2 = 270, numSegs = 12, numSegsZ = 12 }) {
        super();
        this.parameters = { rmin, rmax, the1, the2, phi1, phi2, numSegs, numSegsZ };
        this.type = 'GeoSpheBuffer';

		// helper arrays
		let vertices = [],
			indices  = [];

		if ( the1 === 0 && the2 === 0 ) { the2 = 180; }
		if ( phi1 === 0 && phi2 === 0 ) { phi2 = 360; }

		let phiClosed = Math.abs( phi2 - phi1 ) === 360;
		let theClosed = Math.abs( the2 - the1 ) === 180;

		let isClosed = ( rmin === 0 && phiClosed && theClosed );
		let isHollow = ( rmin !== 0 && phiClosed && theClosed );

		let	THEL_RAD = ( the2 - the1 ) * Math.PI / 180.0,
			dTHE_RAD = THEL_RAD / numSegsZ,
			PHIL_RAD = ( phi2 - phi1 ) * Math.PI / 180.0,
			dPHI_RAD = PHIL_RAD / numSegs;

		the1 = normalize_angle_deg( the1, true );
		phi1 = normalize_angle_deg( phi1 );

		let the1_RAD = the1 * Math.PI / 180.0,
			phi1_RAD = phi1 * Math.PI / 180.0;

		let fX, fY, fZ, fRds;

		// outer vertices
		for ( let j = 0; j <= numSegsZ; j++ ) {
			for ( let i = 0; i <= numSegs; i++ ) {
				fZ   = rmax * Math.cos( the1_RAD + dTHE_RAD * j );
				fRds = rmax * Math.sin( the1_RAD + dTHE_RAD * j );
				fX = fRds * Math.cos( phi1_RAD + dPHI_RAD * i );
				fY = fRds * Math.sin( phi1_RAD + dPHI_RAD * i );
				vertices.push( fX, fY, fZ );
			}
		}

		// inner vertices
		for ( let j = 0; j <= numSegsZ && !isClosed; j++ ) {
			for ( let i = 0; i <= numSegs; i++ ) {
				fZ   = rmin * Math.cos( the1_RAD + dTHE_RAD * j );
				fRds = rmin * Math.sin( the1_RAD + dTHE_RAD * j );
				fX = fRds * Math.cos( phi1_RAD + dPHI_RAD * i );
				fY = fRds * Math.sin( phi1_RAD + dPHI_RAD * i );
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

		let shift = (numSegsZ+1)*(numSegs+1);
		// inner face indices
		for ( let j = 0; j < numSegsZ && !isClosed; j++ ) {
			for ( let i = 0; i < numSegs; i++) {
				i0 = (j+1) * (numSegs+1) + i + shift;
				i1 = (j+1) * (numSegs+1) + i + 1 + shift;
				i2 = j * (numSegs+1) + i + 1 + shift;
				i3 = j * (numSegs+1) + i + shift;
				indices.push( i3, i1, i0, i3, i2, i1 );
			}
		}

		// four side face indices
		let shift2 = (numSegs+1)*(numSegsZ);

		for ( let i = 0; i < numSegs && !isClosed && !isHollow; i++) {
			if ( !theClosed ) {
				i0 = i+shift; i1 = i+shift+1; i2 = i+1; i3 = i;
				indices.push( i3, i1, i0, i3, i2, i1 );
				i0 = i+shift2; i1 = i+1+shift2; i2 = i+shift+1+shift2; i3 = i+shift+shift2;
				indices.push( i3, i1, i0, i3, i2, i1 );
			}
		}


		for ( let i = 0; i < numSegsZ && !isClosed && !isHollow; i++) {
			if ( !phiClosed ) {
				i0 = i * (numSegs+1); i1 = i * (numSegs+1)+numSegs+1; i2 = i * (numSegs+1)+numSegs+1 + shift; i3 = i * (numSegs+1) + shift;
				indices.push( i3, i1, i0, i3, i2, i1 );
				i0 = i * (numSegs+1) + shift + numSegs; i1 = i * (numSegs+1)+numSegs+1 + shift + numSegs; i2 = i * (numSegs+1)+numSegs+1 + numSegs; i3 = i * (numSegs+1) + numSegs;
				indices.push( i3, i1, i0, i3, i2, i1 );
			}
		}

		// convert data into buffers
		this.setIndex( indices );
		this.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
		this.computeVertexNormals();
	}

}

function normalize_angle_deg( angle, need_pi_range = false ) {
	angle = angle % 360;
	angle = ( angle + 360 ) % 360;
	if ( need_pi_range && angle > 180 ) {
		angle -= 360;
	}
	return angle;
}

export { GeoSphe, GeoSpheBuffer };
