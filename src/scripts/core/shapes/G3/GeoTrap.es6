
import * as THREE from 'three';

class GeoTrap extends THREE.Geometry {

    constructor({ dz, thet, phi, h1, bl1, tl1, alp1, h2, bl2, tl2, alp2, twist }) {
        super();
        this.parameters = { dz, thet, phi, h1, bl1, tl1, alp1, h2, bl2, tl2, alp2, twist };
        this.type = 'GeoTrap';
        this.fromBufferGeometry( new GeoTrapBuffer({ dz, thet, phi, h1, bl1, tl1, alp1, h2, bl2, tl2, alp2, twist }) );
    }

}

class GeoTrapBuffer extends THREE.BufferGeometry {

    constructor({ dz = 60, thet = 20, phi = 5, h1 = 40, bl1 = 30, tl1 = 40, alp1 = 10, h2 = 16, bl2 = 10, tl2 = 14, alp2 = 10, twist = false }) {
        super();
        this.parameters = { dz, thet, phi, h1, bl1, tl1, alp1, h2, bl2, tl2, alp2, twist };
        this.type = 'GeoTrapBuffer';

        // helper arrays
        let vertices = []; // 3 entries per vector
        let indices  = []; // 1 entry per index, 3 entries form face3

		thet = thet * Math.PI / 180.0; phi  = phi  * Math.PI / 180.0;
		alp1 = alp1 * Math.PI / 180.0; alp2 = alp2 * Math.PI / 180.0;

		let fDz = dz, fTthetaCphi = Math.tan(thet) * Math.cos(phi),
			fTthetaSphi = Math.tan(thet) * Math.sin(phi),
			fDy1 = h1, fDx1=bl1, fDx2=tl1, fTalpha1=Math.tan(alp1),
			fDy2 = h2, fDx3=bl2, fDx4=tl2, fTalpha2=Math.tan(alp2);

		// eight vertices to define trapezoid
		vertices.push(	+fDz*fTthetaCphi+fDy2*fTalpha2-fDx4, +fDz*fTthetaSphi+fDy2, +fDz,
						+fDz*fTthetaCphi+fDy2*fTalpha2+fDx4, +fDz*fTthetaSphi+fDy2, +fDz,
						-fDz*fTthetaCphi+fDy1*fTalpha1+fDx2, -fDz*fTthetaSphi+fDy1, -fDz,
						-fDz*fTthetaCphi+fDy1*fTalpha1-fDx2, -fDz*fTthetaSphi+fDy1, -fDz,
						+fDz*fTthetaCphi-fDy2*fTalpha2-fDx3, +fDz*fTthetaSphi-fDy2, +fDz,
						+fDz*fTthetaCphi-fDy2*fTalpha2+fDx3, +fDz*fTthetaSphi-fDy2, +fDz,
						-fDz*fTthetaCphi-fDy1*fTalpha1+fDx1, -fDz*fTthetaSphi-fDy1, -fDz,
						-fDz*fTthetaCphi-fDy1*fTalpha1-fDx1, -fDz*fTthetaSphi-fDy1, -fDz);

		let i0, i1, i2, i3;

		// six planes of the trapezoid
		i0 = 0, i1 = 1, i2 = 2, i3 = 3;
		indices.push( i3, i0, i1, i3, i1, i2 );
		i0 = 7, i1 = 6, i2 = 5, i3 = 4;
		indices.push( i3, i0, i1, i3, i1, i2 );
		i0 = 0, i1 = 3, i2 = 7, i3 = 4;
		indices.push( i3, i0, i1, i3, i1, i2 );
		i0 = 5, i1 = 6, i2 = 2, i3 = 1;
		indices.push( i3, i0, i1, i3, i1, i2 );
		i0 = 1, i1 = 0, i2 = 4, i3 = 5;
		indices.push( i3, i0, i1, i3, i1, i2 );
		i0 = 6, i1 = 7, i2 = 3, i3 = 2;
		indices.push( i3, i0, i1, i3, i1, i2 );


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

export { GeoTrap, GeoTrapBuffer };
