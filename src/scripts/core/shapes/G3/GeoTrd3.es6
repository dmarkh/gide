
// Not really G3 shape
// projective "tower" trapezoid, defined by eta,phi and rmin,rmax params, with planes parallel to z axis

import * as THREE from 'three';

class GeoTrd3 extends THREE.Geometry {

    constructor({ eta, phi, deta, dphi, rmin, rmax }) {
        super();
        this.parameters = { eta, phi, deta, dphi, rmin, rmax };
        this.type = 'GeoTrd3';
        this.fromBufferGeometry( new GeoTrd3Buffer({ eta, phi, deta, dphi, rmin, rmax }) );
    }

}

class GeoTrd3Buffer extends THREE.BufferGeometry {

	// eta, phi - in radians
    constructor({ eta = 0.1, phi = 0.1, deta = 0.025, dphi = 0.025, rmin = 20, rmax = 50 }) {
        super();
        this.parameters = { eta, phi, deta, dphi, rmin, rmax };
        this.type = 'GeoTrd3Buffer';
 
        // helper arrays
        let vertices = []; // 3 entries per vector
        let indices  = []; // 1 entry per index, 3 entries form face3

		let theta1 = (Math.atan(Math.exp((-(eta - deta))))*2),
			theta2 = (Math.atan(Math.exp((-(eta + deta))))*2);

		let phi1 = phi - dphi,
			phi2 = phi + dphi;

		// four vertices, upper half
		vertices.push(	rmax*Math.cos(phi2), rmax*Math.sin(phi2), rmax/Math.tan(theta1),
						rmax*Math.cos(phi1), rmax*Math.sin(phi1), rmax/Math.tan(theta1),
						rmax*Math.cos(phi1), rmax*Math.sin(phi1), rmax/Math.tan(theta2),
						rmax*Math.cos(phi2), rmax*Math.sin(phi2), rmax/Math.tan(theta2) );

		// four vertices, lower half
		vertices.push(	rmin*Math.cos(phi2), rmin*Math.sin(phi2), rmin/Math.tan(theta1),
						rmin*Math.cos(phi1), rmin*Math.sin(phi1), rmin/Math.tan(theta1),
						rmin*Math.cos(phi1), rmin*Math.sin(phi1), rmin/Math.tan(theta2),
						rmin*Math.cos(phi2), rmin*Math.sin(phi2), rmin/Math.tan(theta2) );

		let i0, i1, i2, i3;

		// six planes of the trapezoid
		i0 = 3, i1 = 2, i2 = 1, i3 = 0;
		indices.push( i3, i0, i1, i3, i1, i2 );
		i0 = 4, i1 = 5, i2 = 6, i3 = 7;
		indices.push( i3, i0, i1, i3, i1, i2 );
		i0 = 4, i1 = 7, i2 = 3, i3 = 0;
		indices.push( i3, i0, i1, i3, i1, i2 );
		i0 = 1, i1 = 2, i2 = 6, i3 = 5;
		indices.push( i3, i0, i1, i3, i1, i2 );
		i0 = 5, i1 = 4, i2 = 0, i3 = 1;
		indices.push( i3, i0, i1, i3, i1, i2 );
		i0 = 2, i1 = 3, i2 = 7, i3 = 6;
		indices.push( i3, i0, i1, i3, i1, i2 );

        // convert data into buffers
        this.setIndex( indices );
        this.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        this.computeVertexNormals();
    }

}

export { GeoTrd3, GeoTrd3Buffer };

