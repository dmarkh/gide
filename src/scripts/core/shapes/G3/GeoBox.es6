
import * as THREE from 'three';

class GeoBox extends THREE.Geometry {

	constructor({ dx, dy, dz, twist }) {
		super();
		this.parameters = { dx, dy, dz, twist };
		this.type = 'GeoBox';
		this.fromBufferGeometry( new GeoBoxBuffer({ dx, dy, dz, twist }) );
	}

}

class GeoBoxBuffer extends THREE.BufferGeometry {

	constructor({ dx = 30, dy = 40, dz = 60, twist = false }) {
		super();
		this.parameters = { dx, dy, dz };
		this.type = 'GeoBoxBuffer';

		// helper arrays
		let vertices = [], // 3 entries per vector
			indices  = []; // 1 entry per index, 3 entries form face3

		vertices.push(
			// bottom
			dx, dy,-dz,
			dx,-dy,-dz,
			-dx,-dy,-dz,
			-dx, dy,-dz,
			// top
			dx, dy, dz,
			dx,-dy, dz,
			-dx,-dy, dz,
			-dx, dy, dz
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

export { GeoBox, GeoBoxBuffer };
