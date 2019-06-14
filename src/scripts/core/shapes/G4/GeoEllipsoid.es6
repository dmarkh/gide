
import * as THREE from 'three';

class GeoEllipsoid extends THREE.Geometry {

    constructor({ pxSemiAxis, pySemiAxis, pzSemiAxis, pzBottomCut, pzTopCut, numSegs, numSegsZ }) {
        super();
        this.parameters = { pxSemiAxis, pySemiAxis, pzSemiAxis, pzBottomCut, pzTopCut, numSegs, numSegsZ };
        this.type = 'GeoEllipsoid';
        this.fromBufferGeometry( new GeoEllipsoidBuffer({ pxSemiAxis, pySemiAxis, pzSemiAxis, pzBottomCut, pzTopCut, numSegs, numSegsZ }) );
    }

}

class GeoEllipsoidBuffer extends THREE.BufferGeometry {

    constructor({ pxSemiAxis = 30, pySemiAxis = 50, pzSemiAxis = 80, pzBottomCut = -50, pzTopCut = 70, numSegs = 12, numSegsZ = 12 }) {
        super();
        this.parameters = { pxSemiAxis, pySemiAxis, pzSemiAxis, pzBottomCut, pzTopCut, numSegs, numSegsZ };
        this.type = 'GeoEllipsoidBuffer';

        // helper arrays
        let vertices = []; // 3 entries per vector
        let indices  = []; // 1 entry per index, 3 entries form face3

        let PI2 = Math.PI * 2, i, j;

		let needTopCap = ( pzTopCut !== 0 && pzTopCut < pzSemiAxis ),
			needBotCap = ( pzBottomCut !== 0 && Math.abs( pzBottomCut ) < pzSemiAxis );

		let THE1 = needTopCap ? Math.acos( Math.abs( pzTopCut ) / pzSemiAxis ) : 0,
			THE2 = needBotCap ? Math.PI - Math.acos( Math.abs( pzBottomCut ) / pzSemiAxis ) : Math.PI,
			DTHE = ( THE2 - THE1 ) / numSegsZ;

		// vertices:
		for ( j = needTopCap ? 0 : 1; j <= ( needBotCap ? numSegsZ : numSegsZ - 1 ); j++ ) {
			let zf = Math.abs( Math.sin( THE1 + j * DTHE ) ),
				z = pzSemiAxis * Math.cos( THE1 + j * DTHE );
			for ( i = 0; i < numSegs; i ++ ) {
				vertices.push(	Math.cos( PI2 * i / numSegs ) * pxSemiAxis * zf,
								Math.sin( PI2 * i / numSegs ) * pySemiAxis * zf,
								z );
			}
		}

		vertices.push( 0, 0, needTopCap ? pzTopCut : pzSemiAxis );
		vertices.push( 0, 0, needBotCap ? pzBottomCut : -pzSemiAxis );

		// indices:
		let i0, i1, i2, i3;

		let segStop = needTopCap ? numSegsZ : numSegsZ - 1;
			segStop = needBotCap ? segStop : segStop - 1;

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

export { GeoEllipsoid, GeoEllipsoidBuffer };
