import * as THREE from 'three';

class GeoPcon extends THREE.Geometry {

    constructor({ phi1, dphi, nz, z, rmin, rmax, numSegs }) {
        super();
        this.parameters = { phi1, dphi, nz, z, rmin, rmax, numSegs };
        this.type = 'GeoPcon';
        this.fromBufferGeometry( new GeoPconBuffer({ phi1, dphi, nz, z, rmin, rmax, numSegs }) );
    }

}

class GeoPconBuffer extends THREE.BufferGeometry {

    constructor({ phi1 = 0, dphi = 270, nz = 10,
					z   =  [-50,-29,-29,-23,-17,   25, 31, 37, 43, 55 ],
					rmin = [ 10, 10, 10, 10, 10,   10, 10, 10, 10, 10 ],
					rmax = [ 25, 25, 50, 50, 25,   20, 50, 50, 20, 20 ],
					numSegs = 24 }) {
        super();
        this.parameters = { phi1, dphi, nz, z, rmin, rmax, numSegs };
        this.type = 'GeoPconBuffer';

        // helper arrays
        let vertices = []; // 3 entries per vector
        let indices  = []; // 1 entry per index, 3 entries form face3

		if ( dphi > 360 ) { dphi = 360; }

		phi1 = normalize_angle_deg( phi1 );
        let phi1_RAD = phi1 * Math.PI / 180.0;
        let step_phi = dphi * Math.PI / 180.0 / numSegs;
		let i, isClosed = ( dphi === 360 );

		for (i = 0; i < ( nz - 1 ); i++) {
			create_section( rmin[i], rmax[i], rmin[i+1], rmax[i+1], ( z[i+1] - z[i] ) / 2.0, ( z[i+1] + z[i] ) / 2.0,
				numSegs, phi1_RAD, step_phi, vertices, indices, isClosed );
		}

		let i0, i1, i2, i3;

		// Top circle faces
        for (i = 0; i < numSegs; i++) {
			i0 = i + 1; i1 = i + (numSegs+1)*2 + 1; i2 = i + (numSegs+1)*2; i3 = i;
			indices.push( i3, i1, i0, i3, i2, i1 );
		}

		// Bottom circle faces
        for (i = 0 + ((nz - 2) * (numSegs + 1) * 4); i < (numSegs + ((nz - 2) * (numSegs + 1) * 4)); i++) {
			i0 = i + (numSegs+1); i1 = i + (numSegs+1)*3; i2 = i + (numSegs+1)*3 + 1; i3 = i + (numSegs+1) + 1;
			indices.push( i3, i1, i0, i3, i2, i1 );
		}

        // convert data into buffers
        this.setIndex( indices );
        this.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        this.computeVertexNormals();

    }

}

export { GeoPcon, GeoPconBuffer };

function normalize_angle_deg( angle, need_pi_range = false ) {
    angle = angle % 360;
    angle = ( angle + 360 ) % 360;
    if ( need_pi_range && angle > 180 ) {
        angle -= 360;
    }
    return angle;
}

function create_section( RMN1, RMX1, RMN2, RMX2, DZ, OFFSET, numSegs, phi1_RAD, step_phi, vertices, indices, isClosed ) {
	let vlen = Math.floor( vertices.length / 3 ), i;

	// Top circle outer vertices
	for ( i = 0; i <= numSegs; i++ ) {
		vertices.push( Math.cos( phi1_RAD + step_phi * i ) * RMX1, Math.sin( phi1_RAD + step_phi * i ) * RMX1, - DZ + OFFSET);
	}

	// Bottom circle outer vertices
	for ( i = 0; i <= numSegs; i++ ) {
		vertices.push( Math.cos( phi1_RAD + step_phi * i ) * RMX2, Math.sin( phi1_RAD + step_phi * i ) * RMX2, + DZ + OFFSET);
	}

	// Top circle inner vertices
	for ( i = 0; i <= numSegs; i++ ) {
		vertices.push( Math.cos( phi1_RAD + step_phi * i ) * RMN1, Math.sin( phi1_RAD + step_phi * i ) * RMN1, - DZ + OFFSET);
	}

	// Bottom circle inner vertices
	for ( i = 0; i <= numSegs; i++ ) {
		vertices.push( Math.cos( phi1_RAD + step_phi * i ) * RMN2, Math.sin( phi1_RAD + step_phi * i ) * RMN2, + DZ + OFFSET);
	}

	let i0, i1, i2, i3;

	if ( !isClosed ) {
		// side pane: phi1
		i0 = (numSegs + 1)*3 + vlen; i1 = numSegs + 1 + vlen; i2 = 0 + vlen; i3 = (numSegs + 1)*2 + vlen;
		indices.push( i3, i1, i0, i3, i2, i1 );
		i0 = (numSegs + 1)*2 + numSegs + vlen; i1 = numSegs + vlen; i2 = numSegs + 1 + numSegs + vlen; i3 = (numSegs + 1)*3 + numSegs + vlen;
		indices.push( i3, i1, i0, i3, i2, i1 );
	}

	// Outer body faces
	for ( i = 0; i < numSegs; i++ ) {
		i0 = i + vlen; i1 = i + numSegs + 1 + vlen; i2 = i + numSegs + 2 + vlen; i3 = i + 1 + vlen;
		indices.push( i3, i1, i0, i3, i2, i1 );
	}

	// Inner body faces
	for ( i = 0; i < numSegs; i++ ) {
		i0 = i + (numSegs + 1)*2 + 1 + vlen; i1 = i + (numSegs + 1)*3 + 1 + vlen; i2 = i + (numSegs + 1)*3 + vlen; i3 = i + (numSegs + 1)*2 + vlen;
		indices.push( i3, i1, i0, i3, i2, i1 );
	}

}

