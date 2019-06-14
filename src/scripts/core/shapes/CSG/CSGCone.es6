
import { CSGCore } from './CSGCore';

function CSGCone({ DZ = 50, RMN1 = 10, RMX1 = 20, RMN2 = 50, RMX2 = 60, numSegs = 12 }) {

        let vertices = [];
        let polygons  = [];

		let PI2 = Math.PI * 2, i;

		// Top circle outer vertices
		for ( i = 0; i < numSegs; i ++ ) {
			vertices.push( new CSGCore.Vertex( Math.cos( PI2 * i / numSegs ) * RMX1, Math.sin( PI2 * i / numSegs ) * RMX1, - DZ ) );
		}

		// Bottom circle outer vertices
		for ( i = 0; i < numSegs; i ++ ) {
			vertices.push( new CSGCore.Vertex( Math.cos( PI2 * i / numSegs ) * RMX2, Math.sin( PI2 * i / numSegs ) * RMX2, DZ ) );
		}

		// Top circle inner vertices
		for ( i = 0; i < numSegs; i ++ ) {
			vertices.push( new CSGCore.Vertex( Math.cos( PI2 * i / numSegs ) * RMN1, Math.sin( PI2 * i / numSegs ) * RMN1, - DZ ) );
		}

		// Bottom circle inner vertices
		for ( i = 0; i < numSegs; i ++ ) {
			vertices.push( new CSGCore.Vertex( Math.cos( PI2 * i / numSegs ) * RMN2, Math.sin( PI2 * i / numSegs ) * RMN2, DZ ) );
		}

		let i0, i1, i2, i3;

		// Outer Body face indices
		for ( i = 0; i < numSegs; i++ ) {
			i0 = i; i1 = i + numSegs; i2 = numSegs + ( i + 1 ) % numSegs; i3 = ( i + 1 ) % numSegs;
			polygons.push( new CSGCore.Polygon([ vertices[i3], vertices[i2], vertices[i1], vertices[i0] ]) );
		}

		// Inner Body face indices
		for ( i = 0; i < numSegs; i++ ) {
			i0 = (i + 1 ) % numSegs + numSegs*2; i1 = numSegs + ( i + 1 ) % numSegs + numSegs*2; i2 = i + numSegs + numSegs*2; i3 = i + numSegs*2;
			polygons.push( new CSGCore.Polygon([ vertices[i3], vertices[i2], vertices[i1], vertices[i0] ]) );
		}

		// Top circle face indices
		for (i = 0; i < (numSegs - 1); i++) {
			i0 = i + 1; i1 = i + numSegs*2 + 1; i2 = i + numSegs*2; i3 = i;
			polygons.push( new CSGCore.Polygon([ vertices[i3], vertices[i2], vertices[i1], vertices[i0] ]) );
		}

		i0 = 0; i1 = numSegs * 2; i2 = numSegs - 1 + numSegs * 2; i3 = numSegs - 1;
		polygons.push( new CSGCore.Polygon([ vertices[i3], vertices[i2], vertices[i1], vertices[i0] ]) );

		// Bottom circle face indices
		for (i = 0; i < (numSegs - 1); i++) {
			i0 = i + numSegs; i1 = i + numSegs*3; i2 = i + numSegs*3 + 1; i3 = i + numSegs + 1;
			polygons.push( new CSGCore.Polygon([ vertices[i3], vertices[i2], vertices[i1], vertices[i0] ]) );
		}

		i0 = numSegs - 1 + numSegs; i1 = numSegs - 1 + numSegs * 3; i2 = numSegs * 3; i3 = numSegs;
		polygons.push( new CSGCore.Polygon([ vertices[i3], vertices[i2], vertices[i1], vertices[i0] ]) );

		let node = new CSGCore.Node(polygons);
		return new CSGCore(node);
}

export { CSGCone };
