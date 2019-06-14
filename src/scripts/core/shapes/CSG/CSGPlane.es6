
import { CSGCore } from './CSGCore';

function CSGPlaneXY({ DX = 10000, DY = 10000 }) {

	let vertices = [
		new CSGCore.Vertex(-DX,-DY, 0),
		new CSGCore.Vertex( DX,-DY, 0),
		new CSGCore.Vertex( DX, DY, 0),
		new CSGCore.Vertex(-DX, DY, 0)
	];

	let polygon = new CSGCore.Polygon( vertices );
	polygon.calculateProperties();

	let planeNode = new CSGCore.Node([ polygon ]);
	return new CSGCore( planeNode );
}

function CSGPlaneYZ({ DY = 10000, DZ = 10000 }) {

	let vertices = [
		new CSGCore.Vertex( 0, DY, -DZ ),
		new CSGCore.Vertex( 0, DY,  DZ ),
		new CSGCore.Vertex( 0,-DY,  DZ ),
		new CSGCore.Vertex( 0,-DY, -DZ )
	];

	let polygon = new CSGCore.Polygon( vertices );
	polygon.calculateProperties();

	let planeNode = new CSGCore.Node([ polygon ]);
	return new CSGCore( planeNode );
}

function CSGPlaneXZ({ DX = 10000, DZ = 10000 }) {

	let vertices = [
		new CSGCore.Vertex( -DX, 0,-DZ ),
		new CSGCore.Vertex( -DX, 0, DZ ),
		new CSGCore.Vertex(  DX, 0, DZ ),
		new CSGCore.Vertex(  DX, 0,-DZ )
	];

	let polygon = new CSGCore.Polygon( vertices );
	polygon.calculateProperties();

	let planeNode = new CSGCore.Node([ polygon ]);
	return new CSGCore( planeNode );
}

export { CSGPlaneXY, CSGPlaneYZ, CSGPlaneXZ }
