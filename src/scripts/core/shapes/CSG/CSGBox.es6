
import { CSGCore } from './CSGCore';

function CSGBox({ DX, DY, DZ }) {
	let vertices = [
		new CSGCore.Vertex(-DX, -DY, -DZ),
		new CSGCore.Vertex( DX, -DY, -DZ),
		new CSGCore.Vertex( DX,  DY, -DZ),
		new CSGCore.Vertex(-DX,  DY, -DZ),
		new CSGCore.Vertex(-DX, -DY,  DZ),
		new CSGCore.Vertex( DX, -DY,  DZ),
		new CSGCore.Vertex( DX,  DY,  DZ),
		new CSGCore.Vertex(-DX,  DY,  DZ)
	];
	let polygons = [
		new CSGCore.Polygon([vertices[3], vertices[2], vertices[1], vertices[0]]),
		new CSGCore.Polygon([vertices[4], vertices[5], vertices[6], vertices[7]]),
		new CSGCore.Polygon([vertices[0], vertices[1], vertices[5], vertices[4]]),
		new CSGCore.Polygon([vertices[2], vertices[3], vertices[7], vertices[6]]),
		new CSGCore.Polygon([vertices[0], vertices[4], vertices[7], vertices[3]]),
		new CSGCore.Polygon([vertices[1], vertices[2], vertices[6], vertices[5]])
	];

	let node = new CSGCore.Node(polygons);
	return new CSGCore(node);
}

export { CSGBox };
