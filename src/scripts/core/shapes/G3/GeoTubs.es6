
import * as THREE from 'three';

class GeoTubs extends THREE.Geometry {

    constructor({ dz, rmin, rmax, phi1, phi2, twist, numSegs }) {
        super();
        this.parameters = { dz, rmin, rmax, phi1, phi2, twist, numSegs };
        this.type = 'GeoTubs';
        this.fromBufferGeometry( new GeoTubsBuffer({ dz, rmin, rmax, phi1, phi2, twist, numSegs }) );
    }

}

class GeoTubsBuffer extends THREE.BufferGeometry {

    constructor({ dz = 50, rmin = 20, rmax = 40, phi1 = 0, phi2 = 270, twist = false, numSegs = 12 }) {
        super();
        this.parameters = { dz, rmin, rmax, phi1, phi2, twist, numSegs };
        this.type = 'GeoTubsBuffer';

        // helper arrays
        let vertices = []; // 3 entries per vector
        let indices  = []; // 1 entry per index, 3 entries form face3

		let i, RMN1 = rmin, RMX1 = rmax, RMN2 = rmin, RMX2 = rmax;
		let isHollow = !( rmin > 0 );

		// phi1 should be smaller than phi2. If this is not the case, the system adds 360 degrees to phi2
		if ( phi1 > phi2 ) { phi2 += 360; }

		let dPHI = phi2 - phi1;
		if ( dPHI > 360 ) { dPHI = 360; }
		phi1 = normalize_angle_deg( phi1 );

		let isClosed = !( dPHI < 360 );

		let phi1_RAD = phi1 * Math.PI / 180.0,
			sPHI = dPHI * Math.PI / 180.0 / numSegs;
		let offset1, offset2, offset3, offset4;

		// Top circle outer vertices
		for ( i = 0; i <= numSegs; i++ ) {
			vertices.push( Math.cos( phi1_RAD + sPHI * i ) * RMX1, Math.sin( phi1_RAD + sPHI * i ) * RMX1, - dz );
		}
		offset1 = Math.floor( vertices.length / 3 );

		// Bottom circle outer vertices
		for ( i = 0; i <= numSegs; i++ ) {
			vertices.push( Math.cos( phi1_RAD + sPHI * i ) * RMX2, Math.sin( phi1_RAD + sPHI * i ) * RMX2, dz );
		}
		offset2 = Math.floor( vertices.length / 3 );

		if ( !isHollow ) {
			// Top circle inner vertices
			for ( i = 0; i <= numSegs; i++ ) {
				vertices.push( Math.cos( phi1_RAD + sPHI * i ) * RMN1, Math.sin( phi1_RAD + sPHI * i ) * RMN1, - dz );
			}
			offset3 = Math.floor( vertices.length / 3 );
			// Bottom circle inner vertices
			for ( i = 0; i <= numSegs; i++ ) {
				vertices.push( Math.cos( phi1_RAD + sPHI * i ) * RMN2, Math.sin( phi1_RAD + sPHI * i ) * RMN2, dz );
			}
			offset4 = Math.floor( vertices.length / 3 );
		} else {
            // add two vertices
            vertices.push( 0, 0, -dz );
            vertices.push( 0, 0,  dz );
		}

		if ( twist !== false ) {
            let x, y, i;
			// top outer
            for ( i = 0; i <= offset1-1; i++ ) {
                x = vertices[ i * 3 ];
                y = vertices[ i * 3 + 1 ];
                vertices[ i * 3 ]     =   x * Math.cos( -0.5 * twist * Math.PI / 180.0 ) - y * Math.sin( -0.5 * twist * Math.PI / 180.0 );
                vertices[ i * 3 + 1 ] =   x * Math.sin( -0.5 * twist * Math.PI / 180.0 ) + y * Math.cos( -0.5 * twist * Math.PI / 180.0 );
            }
			// bottom outer
            for ( i = offset1; i <= offset2-1; i++ ) {
                x = vertices[ i * 3 ];
                y = vertices[ i * 3 + 1 ];
                vertices[ i * 3 ]     =   x * Math.cos( 0.5 * twist * Math.PI / 180.0 ) - y * Math.sin( 0.5 * twist * Math.PI / 180.0 );
                vertices[ i * 3 + 1 ] =   x * Math.sin( 0.5 * twist * Math.PI / 180.0 ) + y * Math.cos( 0.5 * twist * Math.PI / 180.0 );
            }
			if ( !isHollow ) {
				// top inner
				for ( i = offset2; i <= offset3-1; i++ ) {
					x = vertices[ i * 3 ];
					y = vertices[ i * 3 + 1 ];
					vertices[ i * 3 ]     =   x * Math.cos( -0.5 * twist * Math.PI / 180.0 ) - y * Math.sin( -0.5 * twist * Math.PI / 180.0 );
					vertices[ i * 3 + 1 ] =   x * Math.sin( -0.5 * twist * Math.PI / 180.0 ) + y * Math.cos( -0.5 * twist * Math.PI / 180.0 );
				}
				// bottom inner
				for ( i = offset3; i <= offset4-1; i++ ) {
					x = vertices[ i * 3 ];
					y = vertices[ i * 3 + 1 ];
					vertices[ i * 3 ]     =   x * Math.cos( 0.5 * twist * Math.PI / 180.0 ) - y * Math.sin( 0.5 * twist * Math.PI / 180.0 );
					vertices[ i * 3 + 1 ] =   x * Math.sin( 0.5 * twist * Math.PI / 180.0 ) + y * Math.cos( 0.5 * twist * Math.PI / 180.0 );
				}
			}
		}

		let i0, i1, i2, i3;

		// Outer body face indices
		for ( i = 0; i < numSegs; i++ ) {
			i0 = i; i1 = i + numSegs + 1; i2 = i + numSegs + 2; i3 = i + 1;
			indices.push( i3, i1, i0, i3, i2, i1 );
		}

		if ( !isHollow ) {
			// Inner body face indices
			for ( i = 0; i < numSegs; i++ ) {
				i0 = i + (numSegs + 1)*2 + 1; i1 = i + (numSegs + 1)*3 + 1; i2 = i + (numSegs + 1)*3; i3 = i + (numSegs + 1)*2;
				indices.push( i3, i1, i0, i3, i2, i1 );
			}
		}

		if ( !isClosed ) {
			if ( !isHollow ) {
				// side pane: phi1
				i0 = (numSegs + 1)*3; i1 = numSegs + 1; i2 = 0; i3 = (numSegs + 1)*2;
				indices.push( i3, i1, i0, i3, i2, i1 );
				i0 = (numSegs + 1)*2+numSegs; i1 = numSegs; i2 = numSegs + 1 + numSegs; i3 = (numSegs + 1)*3 + numSegs;
				indices.push( i3, i1, i0, i3, i2, i1 );
			} else {
				// side pane: phi1
				i0 = 0; i1 = Math.floor( vertices.length / 3 ) - 2;
				i2 = numSegs + 1; i3 = Math.floor( vertices.length / 3 ) - 1;
				indices.push( i0, i2, i1,  i2, i3, i1 );
				i0 = numSegs; i1 = Math.floor( vertices.length / 3 ) - 2;
				i2 = numSegs * 2 + 1; i3 = Math.floor( vertices.length / 3 ) - 1;
				indices.push( i0, i1, i3,  i3, i2, i0 );
			}
		}

		if ( !isHollow ) {
			// Top circle face indices
			for (i = 0; i < numSegs; i++) {
				i0 = i + 1; i1 = i + (numSegs+1)*2 + 1; i2 = i + (numSegs+1)*2; i3 = i;
				indices.push( i3, i1, i0, i3, i2, i1 );
			}
			// Bottom circle face indices
			for (i = 0; i < numSegs; i++) {
				i0 = i + (numSegs+1); i1 = i + (numSegs+1)*3; i2 = i + (numSegs+1)*3 + 1; i3 = i + (numSegs+1) + 1;
				indices.push( i3, i1, i0, i3, i2, i1 );
			}
		} else {
            // Top outer circle face indices
            for (i = 0; i < numSegs; i++) {
                i0 = i; i1 = i + 1; i3 = Math.floor( vertices.length / 3 ) - 2;
                indices.push( i0, i3, i1 );
            }
            // Bottom outer circle face indices
            for (i = 0; i < numSegs; i++) {
                i0 = numSegs + 1 + i; i1 = numSegs + 1 + i + 1; i3 = Math.floor( vertices.length / 3 ) - 1;
                indices.push( i0, i1, i3 );
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

export { GeoTubs, GeoTubsBuffer };
