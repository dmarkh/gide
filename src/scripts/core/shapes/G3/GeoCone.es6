
import * as THREE from 'three';

class GeoCone extends THREE.Geometry {

    constructor({ dz, rmin1, rmax1, rmin2, rmax2, twist, numSegs }) {
        super();
        this.parameters = { dz, rmin1, rmax1, rmin2, rmax2, twist, numSegs };
        this.type = 'GeoCone';
        this.fromBufferGeometry( new GeoConeBuffer({ dz, rmin1, rmax1, rmin2, rmax2, twist, numSegs }) );
    }

}

class GeoConeBuffer extends THREE.BufferGeometry {

    constructor({ dz = 50, rmin1 = 10, rmax1 = 20, rmin2 = 50, rmax2 = 60, twist = false, numSegs = 12 }) {
        super();
        this.parameters = { dz, rmin1, rmax1, rmin2, rmax2, twist, numSegs };
        this.type = 'GeoConeBuffer';

        // helper arrays
        let vertices = []; // 3 entries per vector
        let indices  = []; // 1 entry per index, 3 entries form face3

		let PI2 = Math.PI * 2, i;
		let offset1, offset2, offset3, offset4;

		// Top circle outer vertices
		for ( i = 0; i < numSegs; i ++ ) {
			vertices.push( Math.cos( PI2 * i / numSegs ) * rmax1, Math.sin( PI2 * i / numSegs ) * rmax1, - dz );
		}
		offset1 = Math.floor( vertices.length / 3 );

		// Bottom circle outer vertices
		for ( i = 0; i < numSegs; i ++ ) {
			vertices.push( Math.cos( PI2 * i / numSegs ) * rmax2, Math.sin( PI2 * i / numSegs ) * rmax2, dz );
		}
		offset2 = Math.floor( vertices.length / 3 );

		// Top circle inner vertices
		for ( i = 0; i < numSegs; i ++ ) {
			vertices.push( Math.cos( PI2 * i / numSegs ) * rmin1, Math.sin( PI2 * i / numSegs ) * rmin1, - dz );
		}
		offset3 = Math.floor( vertices.length / 3 );

		// Bottom circle inner vertices
		for ( i = 0; i < numSegs; i ++ ) {
			vertices.push( Math.cos( PI2 * i / numSegs ) * rmin2, Math.sin( PI2 * i / numSegs ) * rmin2, dz );
		}
		offset4 = Math.floor( vertices.length / 3 );

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

		let i0, i1, i2, i3;

		// Outer Body face indices
		for ( i = 0; i < numSegs; i++ ) {
			i0 = i; i1 = i + numSegs; i2 = numSegs + ( i + 1 ) % numSegs; i3 = ( i + 1 ) % numSegs;
			indices.push( i3, i1, i0, i3, i2, i1 );
		}

		// Inner Body face indices
		for ( i = 0; i < numSegs; i++ ) {
			i0 = (i + 1 ) % numSegs + numSegs*2; i1 = numSegs + ( i + 1 ) % numSegs + numSegs*2; i2 = i + numSegs + numSegs*2; i3 = i + numSegs*2;
			indices.push( i3, i1, i0, i3, i2, i1 );
		}

		// Top circle face indices
		for (i = 0; i < (numSegs - 1); i++) {
			i0 = i + 1; i1 = i + numSegs*2 + 1; i2 = i + numSegs*2; i3 = i;
			indices.push( i3, i1, i0, i3, i2, i1 );
		}

		i0 = 0; i1 = numSegs * 2; i2 = numSegs - 1 + numSegs * 2; i3 = numSegs - 1;
		indices.push( i3, i1, i0, i3, i2, i1 );

		// Bottom circle face indices
		for (i = 0; i < (numSegs - 1); i++) {
			i0 = i + numSegs; i1 = i + numSegs*3; i2 = i + numSegs*3 + 1; i3 = i + numSegs + 1;
			indices.push( i3, i1, i0, i3, i2, i1 );
		}

		i0 = numSegs - 1 + numSegs; i1 = numSegs - 1 + numSegs * 3; i2 = numSegs * 3; i3 = numSegs;
		indices.push( i3, i1, i0, i3, i2, i1 );

        // convert data into buffers
        this.setIndex( indices );
        this.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
		this.computeVertexNormals();
	}
}

export { GeoCone, GeoConeBuffer };
