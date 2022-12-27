
import * as THREE from 'three';

class GeoTube extends THREE.Geometry {

    constructor({ dz, rmin, rmax, twist, numSegs }) {
        super();
        this.parameters = { dz, rmin, rmax, twist, numSegs };
        this.type = 'GeoTube';
        this.fromBufferGeometry( new GeoTubeBuffer({ dz, rmin, rmax, twist, numSegs }) );
    }

}

class GeoTubeBuffer extends THREE.BufferGeometry {

    constructor({ dz = 50, rmin = 10, rmax = 20, twist = false, numSegs = 24 }) {
        super();
        this.parameters = { dz, rmin, rmax, twist, numSegs };
        this.type = 'GeoTubeBuffer';

        // helper arrays
        let vertices = []; // 3 entries per vector
        let indices  = []; // 1 entry per index, 3 entries form face3

		let PI2 = Math.PI * 2, i, RMN1 = rmin, RMX1 = rmax, RMN2 = rmin, RMX2 = rmax;
		let isHollow = !( rmin > 0 );
		let offset1, offset2, offset3, offset4;

		// Top circle outer vertices
		for ( i = 0; i < numSegs; i++ ) {
			vertices.push( Math.cos( PI2 * i / numSegs ) * RMX1, Math.sin( PI2 * i / numSegs ) * RMX1, -dz );
		}
		offset1 = Math.floor( vertices.length / 3 );

		// Bottom circle outer vertices
		for ( i = 0; i < numSegs; i++ ) {
			vertices.push( Math.cos( PI2 * i / numSegs ) * RMX2, Math.sin( PI2 * i / numSegs ) * RMX2, dz );
		}
		offset2 = Math.floor( vertices.length / 3 );

		if ( !isHollow ) {
			// Top circle inner vertices
			for ( i = 0; i < numSegs; i++ ) {
				vertices.push( Math.cos( PI2 * i / numSegs ) * RMN1, Math.sin( PI2 * i / numSegs ) * RMN1, - dz );
			}
			offset3 = Math.floor( vertices.length / 3 );
			// Bottom circle inner vertices
			for ( i = 0; i < numSegs; i++ ) {
				vertices.push( Math.cos( PI2 * i / numSegs ) * RMN2, Math.sin( PI2 * i / numSegs ) * RMN2, dz );
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

		// Outer Body face indices
		for ( i = 0; i < numSegs; i++ ) {
			i0 = i; i1 = i + numSegs; i2 = numSegs + ( i + 1 ) % numSegs; i3 = ( i + 1 ) % numSegs;
			indices.push( i3, i1, i0, i3, i2, i1 );
		}

		if ( !isHollow ) {
			// Inner Body face indices
			for ( i = 0; i < numSegs; i++ ) {
				i0 = (i + 1 ) % numSegs + numSegs*2; i1 = numSegs + ( i + 1 ) % numSegs + numSegs*2; i2 = i + numSegs + numSegs*2; i3 = i + numSegs*2;
				indices.push( i3, i1, i0, i3, i2, i1 );
			}
		}

		if ( !isHollow ) {
			// Top circle face indices
			for (i = 0; i < (numSegs - 1); i++) {
				i0 = i + 1;
				i1 = i + numSegs*2 + 1;
				i2 = i + numSegs*2;
				i3 = i;
				indices.push( i3, i1, i0, i3, i2, i1 );
			}
			i0 = 0; i1 = numSegs * 2; i2 = numSegs - 1 + numSegs * 2; i3 = numSegs - 1;
			indices.push( i3, i1, i0, i3, i2, i1 );

			// Bottom circle face indices
			for (i = 0; i < (numSegs - 1); i++) {
				i0 = i + numSegs;
				i1 = i + numSegs*3;
				i2 = i + numSegs*3 + 1;
				i3 = i + numSegs + 1;
				indices.push( i3, i1, i0, i3, i2, i1 );
			}
			i0 = numSegs - 1 + numSegs; i1 = numSegs - 1 + numSegs * 3; i2 = numSegs * 3; i3 = numSegs;
			indices.push( i3, i1, i0, i3, i2, i1 );

		} else {
			// Top outer circle face indices
			for (i = 0; i < ( numSegs - 1 ); i++) {
				i0 = i;
				i1 = i + 1;
				i3 = Math.floor( vertices.length / 3 ) - 2;
				indices.push( i0, i3, i1 );
			}
			i1 = 0; i0 = numSegs - 1; i3 = Math.floor( vertices.length / 3 ) - 2;
			indices.push( i0, i3, i1 );

			// Bottom outer circle face indices
			for (i = 0; i < ( numSegs - 1 ); i++) {
				i0 = numSegs + i;
				i1 = numSegs + i + 1;
				i3 = Math.floor( vertices.length / 3 ) - 1;
				indices.push( i0, i1, i3 );
			}
			i1 = numSegs; i0 = 2*numSegs - 1; i3 = Math.floor( vertices.length / 3 ) - 1;
			indices.push( i0, i1, i3 );

		}

        // convert data into buffers
        this.setIndex( indices );
        this.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
		this.computeVertexNormals();
	}
}

export { GeoTube, GeoTubeBuffer };
