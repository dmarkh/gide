
import * as THREE from 'three';

class GeoParaboloid extends THREE.Geometry {

    constructor({ rlo, rhi, dz, nseg, nsegZ }) {
        super();
        this.parameters = { rlo, rhi, dz, nseg, nsegZ };
        this.type = 'GeoParaboloid';
        this.fromBufferGeometry( new GeoParaboloidBuffer({ rlo, rhi, dz, nseg, nsegZ }) );
    }

}

class GeoParaboloidBuffer extends THREE.BufferGeometry {

    constructor({ rlo = 0, rhi = 40, dz = 50, nseg = 12, nsegZ = 12 }) {
        super();
        this.parameters = { rlo, rhi, dz, nseg, nsegZ };

        this.type = 'GeoParaboloidBuffer';

        // helper arrays
        let vertices = []; // 3 entries per vector
        let indices  = []; // 1 entry per index, 3 entries form face3

		var _sin = new Float32Array( nseg ),
			_cos = new Float32Array( nseg );
		for ( let seg=0; seg < nseg; ++seg ) {
			_cos[ seg ] = Math.cos( seg / nseg * 2 * Math.PI );
			_sin[ seg ] = Math.sin( seg / nseg * 2 * Math.PI );
		}

		let dd = 1. / ( rhi * rhi - rlo * rlo ),
			fA = 2. * dz * dd,
			fB = -dz * ( rlo * rlo + rhi * rhi ) * dd,
			zmin = -dz, zmax = dz, rmin = rlo, rmax = rhi;

		if ( fA >= 0) {
			if ( fB > zmin ) {  zmin = fB; }
		} else {
			if ( fB < zmax ) { zmax = fB; }
		}

		let ttmin = Math.atan2( zmin, rmin ),
			ttmax = Math.atan2( zmax, rmax );

		let prev_indx = 0, prev_radius = 0;

		for ( let layer = 0; layer <= nsegZ + 1; ++layer ) {
			let layerz = zmax, radius = 0, tt, delta;
			if ( ( layer === nsegZ + 1 ) && ( prev_radius === 0 ) ) { break; }
			switch ( layer ) {
				case 0:
					layerz = zmin; radius = rmin;
					break;
				case nsegZ:
					layerz = zmax; radius = rmax;
					break;
				case nsegZ + 1:
					layerz = zmax; radius = 0;
					break;
				default:
					tt = Math.tan(ttmin + (ttmax-ttmin) * layer / nsegZ );
					delta = tt * tt - 4 * fA * fB;
					radius = 0.5 * ( tt + Math.sqrt( delta ) ) / fA;
					if ( radius < 1e-6 ) { radius = 0; }
					layerz = radius*tt;
					break;
			}
			let curr_indx = Math.floor( vertices.length / 3 );

			if ( radius === 0 ) {
				vertices.push( 0, 0, layerz );
			} else {
				for ( let seg = 0; seg < nseg; ++seg ) {
					vertices.push( radius * _cos[ seg ], radius * _sin[ seg ], layerz );
				}
			}

			// add faces of next layer
			if ( layer > 0 ) {
				for ( let seg = 0; seg < nseg; ++seg ) {
					let seg1 = ( seg + 1 ) % nseg;
					if (prev_radius === 0) {
						indices.push( prev_indx, curr_indx + seg1, curr_indx + seg );
					} else if (radius == 0) {
						indices.push( prev_indx + seg, prev_indx + seg1, curr_indx );
					} else {
						indices.push( prev_indx + seg, curr_indx + seg1, curr_indx + seg );
						indices.push( prev_indx + seg, prev_indx + seg1, curr_indx + seg1 );
					}
				}
			}

			prev_radius = radius;
			prev_indx = curr_indx;
		}

        // convert data into buffers
        this.setIndex( indices );
        this.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        this.computeVertexNormals();
    }

}

export { GeoParaboloid, GeoParaboloidBuffer };
