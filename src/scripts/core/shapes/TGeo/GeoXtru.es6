
import * as THREE from 'three';

class GeoXtru extends THREE.Geometry {

    constructor({ x, y, sections }) {
        super();
        this.parameters = { };
        this.type = 'GeoXtru';
        this.fromBufferGeometry( new GeoXtruBuffer({ x, y, sections }) );
    }

}

class GeoXtruBuffer extends THREE.BufferGeometry {

    constructor({
			x = [ -30,-30, 30, 30, 15, 15,-15, -15 ],
			y = [ -30, 30, 30,-30,-30, 15, 15, -30 ],
			sections = [
				[-40,-20, 10, 1.5 ], // Z, X0, Y0, SCALE
				[ 10,  0,  0, 0.5 ],
				[ 10,  0,  0, 0.7 ],
				[ 40, 20, 20, 0.9 ]
			]
		}) {
        super();
        this.parameters = { x, y, sections };

        this.type = 'GeoXtruBuffer';

        // helper arrays
        let vertices = []; // 3 entries per vector
        let indices  = []; // 1 entry per index, 3 entries form face3

		let i, j, vec, vec3, len, triangles, offset;

		let n = x.length,			// vertices of the prototype
			nsec = sections.length; // sections

		// vertices
		for ( i = 0; i < nsec; i++ ) {
			for ( j = 0; j < n; j++ ) {
				vertices.push(
					x[j] * sections[i][3] + sections[i][1],
					y[j] * sections[i][3] + sections[i][2],
					sections[i][0]
				);
			}
		}

		// indices
		let i0, i1, i2, i3;
		for ( i = 0; i < ( nsec - 1 ); i++ ) {
			for ( j = 0; j < ( n - 1 ); j++ ) {
				i0 = n * i + j; i1 = n * i + j + 1;
				i2 = n * ( i + 1 ) + j; i3 = n * ( i + 1 ) + j + 1;
				indices.push( i3, i1, i0, i2, i3, i0 );
			}
			i0 = n * i;
			i1 = n * i + ( n - 1 );
			i2 = n * ( i + 1 );
			i3 = n * ( i + 1 ) + ( n - 1 );
			indices.push( i3, i0, i1, i2, i0, i3 );
		}

		// Top and bottom caps via triangulation helper
		offset = Math.floor( vertices.length / 3 ) - n;
		vec = vertices.slice( 0, n * 3 ); vec3 = [];
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

export { GeoXtru, GeoXtruBuffer };
