
import * as THREE from 'three';

class GeoEltu extends THREE.Geometry {

    constructor({ dx, dy, dz, twist, numSegs }) {
        super();
        this.parameters = { dx, dy, dz, twist, numSegs };
        this.type = 'GeoEltu';
        this.fromBufferGeometry( new GeoEltuBuffer({ dx, dy, dz, twist, numSegs }) );
    }

}

class GeoEltuBuffer extends THREE.BufferGeometry {

    constructor({ dx = 30, dy = 10, dz = 40, twist = false, numSegs = 12 }) {
        super();
        this.parameters = { dx, dy, dz, twist, numSegs };
        this.type = 'GeoEltuBuffer';

        // helper arrays
        let vertices = []; // 3 entries per vector
        let indices  = []; // 1 entry per index, 3 entries form face3

        let PI2 = Math.PI * 2, i;
		let offset1, offset2;

		// Top circle outer vertices
		for ( i = 0; i < numSegs; i ++ ) {
			vertices.push( Math.cos( PI2 * i / numSegs ) * dx, Math.sin( PI2 * i / numSegs ) * dy, - dz );
		}
		offset1 = Math.floor( vertices.length / 3 );

		// Bottom circle outer vertices
		for ( i = 0; i < numSegs; i ++ ) {
			vertices.push( Math.cos( PI2 * i / numSegs ) * dx, Math.sin( PI2 * i / numSegs ) * dy, dz );
		}
		offset2 = Math.floor( vertices.length / 3 );

		// center points
		vertices.push(0,0,-dz); vertices.push(0,0,+dz);

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
		}

		let i0, i1, i2, i3;

		// Body face indices
		for ( i = 0; i < (numSegs-1); i++ ) {
			i0 = i+numSegs; i1 = i+1+numSegs; i2 = i + 1; i3 = i;
			indices.push( i3, i1, i0, i3, i2, i1 );
		}
		i0 = 0; i1 = numSegs - 1; i2 = numSegs + numSegs - 1; i3 = numSegs;
		indices.push( i3, i1, i0, i3, i2, i1 );

		// Top circle face indices
		for (i = 0; i < (numSegs - 1); i++) {
			i0 = i; i1 = i + 1; i2 = numSegs*2;
			indices.push( i0, i2, i1 );
		}
		i0 = numSegs - 1; i1 = 0; i2 = numSegs*2;
		indices.push( i0, i2, i1 );

		// Bottom circle face indices
		for (i = numSegs; i < (2*numSegs - 1); i++) {
			i0 = numSegs*2+1; i1 = i+1; i2 = i;
			indices.push( i0, i2, i1 );
		}
		i0 = numSegs*2+1; i1 = numSegs; i2 = numSegs*2 - 1;
		indices.push( i0, i2, i1 );

        // convert data into buffers
        this.setIndex( indices );
        this.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        this.computeVertexNormals();
    }

}

export { GeoEltu, GeoEltuBuffer };
