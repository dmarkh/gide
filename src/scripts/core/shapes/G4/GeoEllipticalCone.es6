
import * as THREE from 'three';

class GeoEllipticalCone extends THREE.Geometry {

//
//      pxSemiAxis      semi-axis, x, without dimentions
//      pySemiAxis      semi-axis, y, without dimentions
//      zMax         	height, z
//      zTopCut         upper cut plane level, z.
//
//   x = pxSemiAxis * ( zMax - u ) * Cos(v)  // NOTE: " / u " part is removed, G4 manual provides wrong equation
//   y = pySemiAxis * ( zMax - u ) * Sin(v)
//   z = u
//   Where v is between 0 and 2*Pi, and u between -pzTopCut and +pzTopCut respectively. 
//

    constructor({ pxSemiAxis, pySemiAxis, zMax, pzTopCut, numSegs, numSegsZ }) {
        super();
        this.parameters = { pxSemiAxis, pySemiAxis, zMax, pzTopCut, numSegs, numSegsZ };
        this.type = 'GeoEllipticalCone';
        this.fromBufferGeometry( new GeoEllipticalConeBuffer({ pxSemiAxis, pySemiAxis, zMax, pzTopCut, numSegs, numSegsZ }) );
    }

}

class GeoEllipticalConeBuffer extends THREE.BufferGeometry {

    constructor({ pxSemiAxis = 30/75, pySemiAxis = 60/75, zMax = 50, pzTopCut = 25, numSegs = 12, numSegsZ = 12 }) {
        super();
        this.parameters = { pxSemiAxis, pySemiAxis, zMax, pzTopCut, numSegs, numSegsZ };
        this.type = 'GeoEllipticalConeBuffer';

        // helper arrays
        let vertices = []; // 3 entries per vector
        let indices  = []; // 1 entry per index, 3 entries form face3

		let x, y, z, i, j,
			z_start = pzTopCut,
			dz = pzTopCut * 2 / numSegsZ;

        // vertices
		for ( j = 0; j <= numSegsZ; j++ ) {
			z = z_start - dz * j;
			for ( i = 0; i < numSegs; i ++ ) {
				x = pxSemiAxis * ( zMax - z ) * Math.cos( 2 * Math.PI * i / numSegs );
				y = pySemiAxis * ( zMax - z ) * Math.sin( 2 * Math.PI * i / numSegs );
                vertices.push( x, y, z );
			}
		}

		vertices.push( 0, 0,  pzTopCut );
		vertices.push( 0, 0, -pzTopCut );

		// indices
        let i0, i1, i2, i3;
		let segStop = numSegsZ;

        for ( j = 0; j < segStop; j++ ) {
            for (i = 0; i < (numSegs - 1); i++) {

                i0 = j*numSegs + i;
                i1 = j*numSegs + i + 1;
                i2 = j*numSegs + i + numSegs,
                i3 = j*numSegs + i + 1 + numSegs;

                indices.push( i0, i2, i1, i2, i3, i1 );
            }

            i0 = j*numSegs + numSegs - 1;
            i1 = j*numSegs + 0;
            i2 = j*numSegs + numSegs - 1 + numSegs;
            i3 = j*numSegs + numSegs;

            indices.push( i0, i2, i1, i2, i3, i1 );
        }

        // top cap:
        i2 = Math.floor( vertices.length / 3 ) - 2;
        for ( i = 0; i < ( numSegs - 1 ); i++ ) {
            i0 = i; i1 = i + 1;
            indices.push( i0, i1, i2 );
        }
        indices.push( numSegs - 1, 0, i2 );

        // bottom cap:
        i2 = Math.floor( vertices.length / 3 ) - 1;
        let start = Math.floor( vertices.length / 3 ) - 3,
            stop  = start - (numSegs - 1);
        for ( i = start; i > stop ; i-- ) {
            i0 = i; i1 = i - 1;
            indices.push( i0, i1, i2 );
        }
        indices.push( start - (numSegs - 1), start, i2 );

        // convert data into buffers
        this.setIndex( indices );
        this.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        this.computeVertexNormals();
    }

}

export { GeoEllipticalCone, GeoEllipticalConeBuffer };
