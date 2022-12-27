
import * as THREE from 'three';

class GeoCons extends THREE.Geometry {

    constructor({ dz, rmin1, rmax1, rmin2, rmax2, phi1, phi2, twist, numSegs }) {
        super();
        this.parameters = { dz, rmin1, rmax1, rmin2, rmax2, phi1, phi2, twist, numSegs };
        this.type = 'GeoCons';
        this.fromBufferGeometry( new GeoConsBuffer({ dz, rmin1, rmax1, rmin2, rmax2, phi1, phi2, twist, numSegs }) );
    }

}

class GeoConsBuffer extends THREE.BufferGeometry {

    constructor({ dz = 50, rmin1 = 10, rmax1 = 20, rmin2 = 50, rmax2 = 60, phi1 = 0, phi2 = 180, twist = false, numSegs = 24 }) {
        super();
        this.parameters = { dz, rmin1, rmax1, rmin2, rmax2, phi1, phi2, numSegs };
        this.type = 'GeoConsBuffer';

        // helper arrays
        let vertices = []; // 3 entries per vector
        let indices  = []; // 1 entry per index, 3 entries form face3

		let i;
		let offset1, offset2, offset3, offset4;

		let dPHI = phi2 - phi1;
		if ( dPHI > 360 ) { dPHI = 360; }
		let phi1_RAD = phi1 * Math.PI / 180.0,
			sPHI = dPHI * Math.PI / 180.0 / numSegs;

		// Top circle outer vertices
		for ( i = 0; i <= numSegs; i++ ) {
			vertices.push( Math.cos( phi1_RAD + sPHI * i ) * rmax1, Math.sin( phi1_RAD + sPHI * i ) * rmax1, - dz );
		}
		offset1 = Math.floor( vertices.length / 3 );

		// Bottom circle outer vertices
		for ( i = 0; i <= numSegs; i++ ) {
			vertices.push( Math.cos( phi1_RAD + sPHI * i ) * rmax2, Math.sin( phi1_RAD + sPHI * i ) * rmax2, dz );
		}
		offset2 = Math.floor( vertices.length / 3 );

		// Top circle inner vertices
		for ( i = 0; i <= numSegs; i++ ) {
			vertices.push( Math.cos( phi1_RAD + sPHI * i ) * rmin1, Math.sin( phi1_RAD + sPHI * i ) * rmin1, - dz );
		}
		offset3 = Math.floor( vertices.length / 3 );

		// Bottom circle inner vertices
		for ( i = 0; i <= numSegs; i++ ) {
			vertices.push( Math.cos( phi1_RAD + sPHI * i ) * rmin2, Math.sin( phi1_RAD + sPHI * i ) * rmin2, dz );
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

		// Outer body face indices
		for ( i = 0; i < numSegs; i++ ) {
			i0 = i; i1 = i + numSegs + 1; i2 = i + numSegs + 2; i3 = i + 1;
			indices.push( i3, i1, i0, i3, i2, i1 );
		}

		// Inner body face indices
		for ( i = 0; i < numSegs; i++ ) {
			i0 = i + (numSegs + 1)*2 + 1; i1 = i + (numSegs + 1)*3 + 1; i2 = i + (numSegs + 1)*3; i3 = i + (numSegs + 1)*2;
			indices.push( i3, i1, i0, i3, i2, i1 );
		}

		// side pane: phi1
        i0 = (numSegs + 1)*3; i1 = numSegs + 1; i2 = 0; i3 = (numSegs + 1)*2;
		indices.push( i3, i1, i0, i3, i2, i1 );
        i0 = (numSegs + 1)*2+numSegs; i1 = numSegs; i2 = numSegs + 1 + numSegs; i3 = (numSegs + 1)*3 + numSegs;
		indices.push( i3, i1, i0, i3, i2, i1 );

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

        // convert data into buffers
        this.setIndex( indices );
        this.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        this.computeVertexNormals();
	}

}

export { GeoCons, GeoConsBuffer };
