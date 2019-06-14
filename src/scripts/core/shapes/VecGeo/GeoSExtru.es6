
import * as THREE from 'three';

class GeoSExtru extends THREE.Geometry {

    constructor({ nvertices, x, y, lowerz, upperz }) {
        super();
        this.parameters = { };
        this.type = 'GeoSExtru';
        this.fromBufferGeometry( new GeoSExtruBuffer({ nvertices, x, y, lowerz, upperz }) );
    }

}

class GeoSExtruBuffer extends THREE.BufferGeometry {

    constructor({
			nvertices = 8,
			x = [ -30,-30, 30, 30, 15, 15,-15, -15 ],
			y = [ -30, 30, 30,-30,-30, 15, 15, -30 ],
			lowerz = -40, upperz = 40
		}) {
        super();
        this.parameters = { nvertices, x, y, lowerz, upperz };

        this.type = 'GeoSExtruBuffer';

        // helper arrays
        let vertices = []; // 3 entries per vector
        let indices  = []; // 1 entry per index, 3 entries form face3

		let i, j, triangles, offset;

		// vertices
		for ( j = 0; j < nvertices; j++ ) {
			vertices.push( x[j], y[j], lowerz );
		}
		for ( j = 0; j < nvertices; j++ ) {
			vertices.push( x[j], y[j], upperz );
		}

		// indices
		let i0, i1, i2, i3; i = 0;
		for ( j = 0; j < ( nvertices - 1 ); j++ ) {
			i0 = nvertices * i + j; i1 = nvertices * i + j + 1;
			i2 = nvertices * ( i + 1 ) + j; i3 = nvertices * ( i + 1 ) + j + 1;
			indices.push( i3, i1, i0, i2, i3, i0 );
		}
		i0 = nvertices * i;
		i1 = nvertices * i + ( nvertices - 1 );
		i2 = nvertices * ( i + 1 );
		i3 = nvertices * ( i + 1 ) + ( nvertices - 1 );
		indices.push( i3, i0, i1, i2, i0, i3 );

		// Top and bottom caps via triangulation helper
		offset = Math.floor( vertices.length / 3 ) - nvertices;
		let vec = vertices.slice( 0, nvertices * 3 ), vec3 = [], len;

		for ( i = 0, len = vec.length; i < len; i += 3 ) { vec3.push( new THREE.Vector3( vec[i], vec[i+1], vec[i+2] ) ); }
		triangles = THREE.ShapeUtils.triangulateShape ( vec3, [] );
		for ( i = 0; i < triangles.length; i++ ) {
			indices.push( triangles[i][0], triangles[i][2], triangles[i][1] );
		}
		for ( i = 0; i < triangles.length; i++ ) {
			indices.push( offset + triangles[i][0], offset + triangles[i][1], offset + triangles[i][2] );
		}

        // convert data into buffers
        this.setIndex( indices );
        this.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        this.computeVertexNormals();
    }

}

export { GeoSExtru, GeoSExtruBuffer };
