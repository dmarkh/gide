
import * as THREE from 'three';

class GeoTorus extends THREE.Geometry {

    constructor({ r, rmin, rmax, phi1, dphi, numSegs, numSegsZ }) {
        super();
        this.parameters = { r, rmin, rmax, phi1, dphi, numSegs, numSegsZ };
        this.type = 'GeoTorus';
        this.fromBufferGeometry( new GeoTorusBuffer({ r, rmin, rmax, phi1, dphi, numSegs, numSegsZ }) );
    }

}

class GeoTorusBuffer extends THREE.BufferGeometry {

    constructor({ r = 40, rmin = 20, rmax = 25, phi1 = 0, dphi = 270, numSegs = 12, numSegsZ = 24 }) {
        super();
        this.parameters = { r, rmin, rmax, phi1, dphi, numSegs, numSegsZ };

        this.type = 'GeoTorusBuffer';

        // helper arrays
        let vertices = []; // 3 entries per vector
        let indices  = []; // 1 entry per index, 3 entries form face3

		let isClosed = !( dphi < 360 ),
			radialSegments = numSegs, tubularSegments = numSegsZ;

		let phistart = phi1 * Math.PI / 180.0,
			deltaphi = dphi * Math.PI / 180.0;

		let u, v, i, j,
			a, b, c, d;

		// outer vertices
		for ( j = 0; j <= radialSegments; j ++ ) {
			for ( i = 0; i <= tubularSegments; i ++ ) {
				u = phistart + i / tubularSegments * deltaphi;
				v = j / radialSegments * Math.PI * 2;
				vertices.push(	( r + rmax * Math.cos( v ) ) * Math.cos( u ),
								( r + rmax * Math.cos( v ) ) * Math.sin( u ),
								rmax * Math.sin( v ) );
			}
		}

		let offset = Math.floor( vertices.length / 3 );

		if ( rmin > 0 ) {
			// inner vertices
			for ( j = 0; j <= radialSegments; j ++ ) {
				for ( i = 0; i <= tubularSegments; i ++ ) {
					u = phistart + i / tubularSegments * deltaphi;
					v = j / radialSegments * Math.PI * 2;
					vertices.push(	( r + rmin * Math.cos( v ) ) * Math.cos( u ),
								( r + rmin * Math.cos( v ) ) * Math.sin( u ),
								rmin * Math.sin( v ) );
				}
			}
		} else {
			// add two center vertices if no inner radius
			u = phistart;
			vertices.push(	r * Math.cos( u ),
							r * Math.sin( u ),
							0 );
			u = phistart + deltaphi;
			vertices.push(	r * Math.cos( u ),
							r * Math.sin( u ),
							0 );
		}

		// outer body indices
		for ( j = 1; j <= radialSegments; j ++ ) {
			for ( i = 1; i <= tubularSegments; i ++ ) {
				a = ( tubularSegments + 1 ) * j + i - 1;
				b = ( tubularSegments + 1 ) * ( j - 1 ) + i - 1;
				c = ( tubularSegments + 1 ) * ( j - 1 ) + i;
				d = ( tubularSegments + 1 ) * j + i;
				indices.push( a, b, d );
				indices.push( b, c, d );
			}
		}

		if ( rmin > 0 ) {
			// inner body indices
			for ( j = 1; j <= radialSegments; j ++ ) {
				for ( i = 1; i <= tubularSegments; i ++ ) {
					a = offset + ( tubularSegments + 1 ) * j + i - 1;
					b = offset + ( tubularSegments + 1 ) * ( j - 1 ) + i - 1;
					c = offset + ( tubularSegments + 1 ) * ( j - 1 ) + i;
					d = offset + ( tubularSegments + 1 ) * j + i;
					indices.push( a, d, b );
					indices.push( b, d, c );
				}
			}
		}

		if ( !isClosed ) {
			if ( rmin > 0 ) {
				// start cap
				for ( i = 0; i < radialSegments; i++ ) {
					a = ( tubularSegments + 1 ) * i;
					b = ( tubularSegments + 1 ) * ( i + 1 );
					c = offset + ( tubularSegments + 1 ) * i;
					d = offset + ( tubularSegments + 1 ) * ( i + 1);
					indices.push( a, b, c );
					indices.push( b, d, c );
				}

				// end cap
				for ( i = 0; i < radialSegments; i++ ) {
					a = ( tubularSegments + 1 ) * i + tubularSegments;
					b = ( tubularSegments + 1 ) * ( i + 1 ) + tubularSegments;
					c = offset + ( tubularSegments + 1 ) * i + tubularSegments;
					d = offset + ( tubularSegments + 1 ) * ( i + 1) + tubularSegments;
					indices.push( a, c, b );
					indices.push( b, c, d );
				}
			} else {
				// solid caps if no rmin
				for ( i = 0; i < radialSegments; i++ ) {
					a = ( tubularSegments + 1 ) * i;
					b = ( tubularSegments + 1 ) * ( i + 1 );
					c = Math.floor( vertices.length / 3 ) - 2;
					indices.push( a, b, c );
				}
				for ( i = 0; i < radialSegments; i++ ) {
					a = ( tubularSegments + 1 ) * i + tubularSegments;
					b = ( tubularSegments + 1 ) * ( i + 1 ) + tubularSegments;
					c = Math.floor( vertices.length / 3 ) - 1;
					indices.push( a, c, b );
				}
			}
		}

        // convert data into buffers
        this.setIndex( indices );
        this.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        this.computeVertexNormals();
    }

}

export { GeoTorus, GeoTorusBuffer };
