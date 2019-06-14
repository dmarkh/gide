
import * as THREE from 'three';

class GeoTet extends THREE.Geometry {

    constructor({ anchor, p2, p3, p4, degeneracyFlag }) {
        super();
        this.parameters = { anchor, p2, p3, p4, degeneracyFlag };
        this.type = 'GeoTet';
        this.fromBufferGeometry( new GeoTetBuffer({ anchor, p2, p3, p4, degeneracyFlag }) );
    }

}

class GeoTetBuffer extends THREE.BufferGeometry {

    constructor({	anchor = [ 0, 0, Math.sqrt(3) * 50 ],
					p2 = [ 0, 2 * Math.sqrt(2/3) * 50 , -1 / Math.sqrt(3) * 50 ],
					p3 = [ -Math.sqrt(2) * 50, -Math.sqrt(2/3) * 50, -1 / Math.sqrt(3) * 50 ],
					p4 = [  Math.sqrt(2) * 50, -Math.sqrt(2/3) * 50, -1 / Math.sqrt(3) * 50 ],
					degeneracyFlag = false 
			}) {
        super();

        this.parameters = { anchor, p2, p3, p4, degeneracyFlag };
        this.type = 'GeoTetBuffer';

        // helper arrays
        let vertices = []; // 3 entries per vector
        let indices  = []; // 1 entry per index, 3 entries form face3

		vertices.push( anchor[0], anchor[1], anchor[2],
						p2[0], p2[1], p2[2],
						p3[0], p3[1], p3[2],
						p4[0], p4[1], p4[2] );

		indices.push( 0,1,2, 0,2,3, 0,3,1, 1,3,2 );


        // convert data into buffers
        this.setIndex( indices );
        this.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        this.computeVertexNormals();
    }

}

export { GeoTet, GeoTetBuffer };
