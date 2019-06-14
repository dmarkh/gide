
import * as THREE from 'three';

class GeoTessellatedSolid extends THREE.Geometry {

    constructor({ vertices, faces }) {
        super();
        this.parameters = { vertices, faces };
        this.type = 'GeoTessellatedSolid';
        this.fromBufferGeometry( new GeoTessellatedSolidBuffer({ vertices, faces }) );
    }

}

class GeoTessellatedSolidBuffer extends THREE.BufferGeometry {

    constructor({
			vertices = {
				'v1': [ 50, 50,  0],
				'v2': [-50, 50,  0],
				'v3': [-50,-50,  0],
				'v4': [ 50,-50,  0],
				'v5': [ 35, 15,100],
				'v6': [-15, 35, 25]
			},
			faces = [
				[ 'v1', 'v2', 'v6' ], [ 'v2', 'v3', 'v6' ], [ 'v3', 'v4', 'v5' ],
				[ 'v4', 'v1', 'v5' ], [ 'v1', 'v6', 'v5' ], [ 'v6', 'v3', 'v5' ],
				[ 'v4', 'v3', 'v2', 'v1' ]
			]
		}) {
        super();

        this.parameters = { };
        this.type = 'GeoTessellatedSolidBuffer';

        // helper arrays
        let m_vertices = []; // 3 entries per vector
        let m_indices  = []; // 1 entry per index, 3 entries form face3

		// triangular or quadrangular

		let ctr = 0, i, leni;

		for( i in vertices ) {
			m_vertices.push( vertices[i][0], vertices[i][1], vertices[i][2] );
			vertices[i]._i = ctr;
			ctr += 1;
		}

		let face;
		for ( i = 0, leni = faces.length; i < leni; i++ ) {
			face = faces[i];
			m_indices.push( vertices[ face[0] ]._i, vertices[ face[1] ]._i, vertices[ face[2] ]._i );
			if ( face.length === 4 ) {
				m_indices.push( vertices[ face[0] ]._i, vertices[ face[2] ]._i, vertices[ face[3] ]._i );
			}
		}

        // convert data into buffers
        this.setIndex( m_indices );
        this.addAttribute( 'position', new THREE.Float32BufferAttribute( m_vertices, 3 ) );
        this.computeVertexNormals();
    }

}

export { GeoTessellatedSolid, GeoTessellatedSolidBuffer };
