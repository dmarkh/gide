
import { CSGCore } from './CSGCore';

function CSGCut({ DX = 10000, DY = 10000, DZ = 10000 }) {

	let vertices1 = [
		// YZ
		new CSGCore.Vertex( 0,  0, -DZ ),
		new CSGCore.Vertex( 0,  0,  DZ ),
		new CSGCore.Vertex( 0, DY,  DZ ),
		new CSGCore.Vertex( 0, DY, -DZ )
	];

	let vertices2 = [
		// XZ
		new CSGCore.Vertex(  DX, 0,-DZ ),
		new CSGCore.Vertex(  DX, 0, DZ ),
		new CSGCore.Vertex(   0, 0, DZ ),
		new CSGCore.Vertex(   0, 0,-DZ )
	];

	let polygon1 = new CSGCore.Polygon( vertices1 );
		polygon1.calculateProperties();
	let polygon2 = new CSGCore.Polygon( vertices2 );
		polygon2.calculateProperties();

	let cutNode = new CSGCore.Node([ polygon1, polygon2 ]);
	return new CSGCore( cutNode );
}

export { CSGCut }
