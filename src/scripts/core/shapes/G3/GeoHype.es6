import * as THREE from 'three';

class GeoHype extends THREE.Geometry {

    constructor({ rmin, rmax, dz, thet, numSegs, numSegsXY }) {
        super();
        this.parameters = { rmin, rmax, dz, thet, numSegs, numSegsXY };
        this.type = 'GeoHype';
        this.fromBufferGeometry( new GeoHypeBuffer({ rmin, rmax, dz, thet, numSegs, numSegsXY }) );
    }

}

class GeoHypeBuffer extends THREE.BufferGeometry {

    constructor({ rmin = 30, rmax = 40, dz = 50, thet = 45, inst = false, outst = false, numSegs = 12, numSegsXY = 12 }) {
        super();
        this.parameters = { rmin, rmax, dz, thet, numSegs, numSegsXY };
        this.type = 'GeoHypeBuffer';

        // helper arrays
        let vertices = []; // 3 entries per vector
        let indices  = []; // 1 entry per index, 3 entries form face3


        let PHI1_RAD = 0;
        let step_phi = 2 * Math.PI / numSegsXY;

		let tantheta = Math.tan( thet * Math.PI / 180.0 ),
			intheta, outtheta;

		if ( inst !== false && outst !== false ) {
			intheta  = Math.tan( inst * Math.PI / 180.0 ),
			outtheta = Math.tan( outst * Math.PI / 180.0 );
		} else {
			intheta  = tantheta,
			outtheta = tantheta;
		}

		let step = dz * 2.0 / numSegs;
		let step2 = step / 2.0;
		let r_in = 0, r_out = 0, i;

		let r_out_prev = Math.sqrt( Math.pow( -dz*outtheta, 2 ) + Math.pow( rmax, 2) ),
			r_in_prev  = Math.sqrt( Math.pow( -dz*intheta, 2 ) + Math.pow( rmin, 2) );

		for (i = 1; i <= numSegs; i++) {
			r_out = Math.sqrt( Math.pow( (-dz + i*step)*outtheta, 2 ) + Math.pow( rmax, 2) );
			r_in  = Math.sqrt( Math.pow( (-dz + i*step)*intheta, 2 ) + Math.pow( rmin, 2) );

			create_section( r_in_prev, r_out_prev, r_in, r_out, step2, -dz + i*step - step2,
								PHI1_RAD, step_phi, numSegsXY, vertices, indices );
			r_out_prev = r_out;
			r_in_prev  = r_in;
		}

		let i0, i1, i2, i3;

		// Top circle faces
		for (i = 0; i < numSegsXY; i++) {
			i0 = i + 1; i1 = i + (numSegsXY+1)*2 + 1; i2 = i + (numSegsXY+1)*2; i3 = i;
			indices.push( i3, i1, i0, i3, i2, i1 );
		}

		// Bottom circle faces
		for (i = 0 + ((numSegs - 1) * (numSegsXY + 1) * 4); i < (numSegsXY + ((numSegs - 1) * (numSegsXY + 1) * 4)); i++) {
			i0 = i + (numSegsXY+1); i1 = i + (numSegsXY+1)*3; i2 = i + (numSegsXY+1)*3 + 1; i3 = i + (numSegsXY+1) + 1;
			indices.push( i3, i1, i0, i3, i2, i1 );
		}

        // convert data into buffers
        this.setIndex( indices );
        this.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        this.computeVertexNormals();
    }

}

export { GeoHype, GeoHypeBuffer };

function create_section(RMN1, RMX1, RMN2, RMX2, dz, OFFSET,
		PHI1_RAD, step_phi, numSegsXY, vertices, indices ) {
	let vlen = Math.floor(vertices.length / 3);
	let i, i0, i1, i2, i3;

	// Top circle outer vertices
	for ( i = 0; i <= numSegsXY; i++ ) {
		vertices.push( Math.cos( PHI1_RAD + step_phi * i ) * RMX1, Math.sin( PHI1_RAD + step_phi * i ) * RMX1, - dz + OFFSET);
	}

	// Bottom circle outer vertices
	for ( i = 0; i <= numSegsXY; i++ ) {
		vertices.push( Math.cos( PHI1_RAD + step_phi * i ) * RMX2, Math.sin( PHI1_RAD + step_phi * i ) * RMX2, + dz + OFFSET);
	}

	// Top circle inner vertices
	for ( i = 0; i <= numSegsXY; i++ ) {
		vertices.push( Math.cos( PHI1_RAD + step_phi * i ) * RMN1, Math.sin( PHI1_RAD + step_phi * i ) * RMN1, - dz + OFFSET);
	}

	// Bottom circle inner vertices
	for ( i = 0; i <= numSegsXY; i++ ) {
		vertices.push( Math.cos( PHI1_RAD + step_phi * i ) * RMN2, Math.sin( PHI1_RAD + step_phi * i ) * RMN2, + dz + OFFSET);
	}

	// Outer body face indices
	for ( i = 0; i < numSegsXY; i++ ) {
		i0 = i + vlen; i1 = i + numSegsXY + 1 + vlen; i2 = i + numSegsXY + 2 + vlen; i3 = i + 1 + vlen;
		indices.push( i3, i1, i0, i3, i2, i1 );
	}

	// Inner body face indices
	for ( i = 0; i < numSegsXY; i++ ) {
		i0 = i + (numSegsXY + 1)*2 + 1 + vlen; i1 = i + (numSegsXY + 1)*3 + 1 + vlen; i2 = i + (numSegsXY + 1)*3 + vlen; i3 = i + (numSegsXY + 1)*2 + vlen;
		indices.push( i3, i1, i0, i3, i2, i1 );
	}

}
