
import * as THREE from 'three';

class GeoTrd2 extends THREE.Geometry {

    constructor({ dx1, dx2, dy1, dy2, dz, twist }) {
        super();
        this.parameters = { dx1, dx2, dy1, dy2, dz, twist };
        this.type = 'GeoTrd2';
        this.fromBufferGeometry( new GeoTrd2Buffer({ dx1, dx2, dy1, dy2, dz, twist }) );
    }

}

class GeoTrd2Buffer extends THREE.BufferGeometry {

    constructor({ dx1 = 30, dx2 = 10, dy1 = 40, dy2 = 15, dz = 60, twist = false }) {
        super();
        this.parameters = { dx1, dx2, dy1, dy2, dz, twist };
        this.type = 'GeoTrd2Buffer';

        // helper arrays
        let vertices = []; // 3 entries per vector
        let indices  = []; // 1 entry per index, 3 entries form face3

		vertices.push(
			// bottom
             dx1, dy1,-dz,
             dx1,-dy1,-dz,
            -dx1,-dy1,-dz,
            -dx1, dy1,-dz,
			// top
             dx2, dy2, dz,
             dx2,-dy2, dz,
            -dx2,-dy2, dz,
            -dx2, dy2, dz
		);

		indices.push( 
			0,1,2, 0,2,3,
			4,6,5, 4,7,6,
			5,1,4, 1,0,4,
			0,3,7, 0,7,4,
			3,6,7, 3,2,6,
			2,5,6, 2,1,5
		);

        if ( twist !== false ) {
            let x, y, i;
            for ( i = 0; i < 4; i++ ) {
                x = vertices[ i * 3 ];
                y = vertices[ i * 3 + 1 ];
                vertices[ i * 3 ]     =   x * Math.cos( -0.5 * twist * Math.PI / 180.0 ) - y * Math.sin( -0.5 * twist * Math.PI / 180.0 );
                vertices[ i * 3 + 1 ] =   x * Math.sin( -0.5 * twist * Math.PI / 180.0 ) + y * Math.cos( -0.5 * twist * Math.PI / 180.0 );
            }
            for ( i = 4; i < 8; i++ ) {
                x = vertices[ i * 3 ];
                y = vertices[ i * 3 + 1 ];
                vertices[ i * 3 ]     =   x * Math.cos( 0.5 * twist * Math.PI / 180.0 ) - y * Math.sin( 0.5 * twist * Math.PI / 180.0 );
                vertices[ i * 3 + 1 ] =   x * Math.sin( 0.5 * twist * Math.PI / 180.0 ) + y * Math.cos( 0.5 * twist * Math.PI / 180.0 );
            }
        }

        // convert data into buffers
        this.setIndex( indices );
        this.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        this.computeVertexNormals();
    }

}

export { GeoTrd2, GeoTrd2Buffer };
