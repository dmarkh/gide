
import * as THREE from 'three';

class GeoArb8 extends THREE.Geometry {

    constructor({ dz,	x0, y0, x1, y1, x2, y2,
						x3, y3, x4, y4, x5, y5,
						x6, y6, x7, y7 }) {
        super();
        this.parameters = { dz,
						x0, y0, x1, y1, x2, y2,
						x3, y3, x4, y4, x5, y5,
						x6, y6, x7, y7 };
        this.type = 'GeoArb8';
        this.fromBufferGeometry( new GeoArb8Buffer({ dz,
						x0, y0, x1, y1, x2, y2,
						x3, y3, x4, y4, x5, y5,
						x6, y6, x7, y7 }) );
		this.mergeVertices();
    }

}

class GeoArb8Buffer extends THREE.BufferGeometry {

    constructor({ dz = 20,	x0 = -30, y0 = -25, x1 = -25, y1 = 25,
						x2 = 5, y2 = 25, x3 = 25, y3 = -25, x4 = -28, y4 = -23,
						x5 = -23, y5 = 27, x6 = -23, y6 = 27, x7 = 13, y7 = -27 }) {
        super();
        this.parameters = { dz,	x0, y0, x1, y1, x2, y2,
						x3, y3, x4, y4, x5, y5,
						x6, y6, x7, y7 };

        this.type = 'GeoArb8Buffer';

        // helper arrays
        let vertices = []; // 3 entries per vector
        let indices  = []; // 1 entry per index, 3 entries form face3

		vertices.push(
			x0, y0, -dz, x1, y1, -dz,
			x2, y2, -dz, x3, y3, -dz,
			x4, y4,  dz, x5, y5,  dz,
			x6, y6,  dz, x7, y7,  dz
		);

		indices.push(	4,6,5,   4,7,6,   0,3,7,   7,4,0,
						4,5,1,   1,0,4,   6,2,1,   1,5,6,
						7,3,2,   2,6,7,   1,2,3,   3,0,1 );

        // convert data into buffers
        this.setIndex( indices );
        this.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        this.computeVertexNormals();
    }

}

export { GeoArb8, GeoArb8Buffer };
