
import * as THREE from 'three';

class GeoPara extends THREE.Geometry {

    constructor({ dx, dy, dz, alph, thet, phi }) {
        super();
        this.parameters = { dx, dy, dz, alph, thet, phi };
        this.type = 'GeoPara';
        this.fromBufferGeometry( new GeoParaBuffer({ dx, dy, dz, alph, thet, phi }) );
    }

}

class GeoParaBuffer extends THREE.BufferGeometry {

    constructor({ dx = 20, dy = 30, dz = 50, alph = 30, thet = 15, phi = 30 }) {
        super();
        this.parameters = { dx, dy, dz, alph, thet, phi };
        this.type = 'GeoParaBuffer';

        // helper arrays
        let vertices = []; // 3 entries per vector
        let indices  = []; // 1 entry per index, 3 entries form face3

		let deg2rad = Math.PI / 180.0,
			fTxy = Math.tan(alph*deg2rad),
			fTxz = Math.tan(thet*deg2rad)*Math.cos(phi*deg2rad),
			fTyz = Math.tan(thet*deg2rad)*Math.sin(phi*deg2rad);

		// eight vertices to define parallelepiped

		vertices.push( -dz * fTxz - dy * fTxy - dx, -dz * fTyz - dy, -dz);
		vertices.push( -dz * fTxz + dy * fTxy - dx, -dz * fTyz + dy, -dz);
		vertices.push( -dz * fTxz + dy * fTxy + dx, -dz * fTyz + dy, -dz);
		vertices.push( -dz * fTxz - dy * fTxy + dx, -dz * fTyz - dy, -dz);

		vertices.push(  dz * fTxz - dy * fTxy - dx,  dz * fTyz - dy,  dz);
		vertices.push(  dz * fTxz + dy * fTxy - dx,  dz * fTyz + dy,  dz);
		vertices.push(  dz * fTxz + dy * fTxy + dx,  dz * fTyz + dy,  dz);
		vertices.push(  dz * fTxz - dy * fTxy + dx,  dz * fTyz - dy,  dz);

        indices.push( 4,6,5,   4,7,6,   0,3,7,   7,4,0,
                               4,5,1,   1,0,4,   6,2,1,   1,5,6,
                               7,3,2,   2,6,7,   1,2,3,   3,0,1 );

        // convert data into buffers
        this.setIndex( indices );
        this.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        this.computeVertexNormals();
    }

}

export { GeoPara, GeoParaBuffer };
