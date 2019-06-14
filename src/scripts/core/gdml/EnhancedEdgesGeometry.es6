
import * as THREE from 'three';

var EnhancedEdgesGeometry = function( geometry, thresholdAngle ) {

		THREE.BufferGeometry.call( this );

		thresholdAngle = ( thresholdAngle !== undefined ) ? thresholdAngle : 1;

		var thresholdDot = Math.cos( Math.PI / 180 * thresholdAngle );

		var edge = [ 0, 0 ], hash = {};

		function sortFunction( a, b ) {

			return a - b;

		}

		var keys = [ 'a', 'b', 'c' ];

		var geometry2;

		if ( geometry.isBufferGeometry ) {

			geometry2 = new THREE.Geometry();
			geometry2.fromBufferGeometry( geometry );

		} else {

			geometry2 = geometry.clone();

		}

		geometry2.mergeVertices();
		geometry2.computeFaceNormals();

		var vertices = geometry2.vertices;
		var faces = geometry2.faces;

		console.log('EnhancedEdgesGeometry: calculating ' + vertices.length + ' * ' + faces.length );

		for ( let i = 0; i < faces.length; i ++ ) {

			var face = faces[ i ];

			for ( let j = 0; j < 3; j ++ ) {

				edge[ 0 ] = face[ keys[ j ] ];
				edge[ 1 ] = face[ keys[ ( j + 1 ) % 3 ] ];

				var line = new THREE.Line3(vertices[edge[ 0 ]], vertices[edge[ 1 ]]);

				for ( var e = 0, l = vertices.length; e < l; e ++ ) {
					if (e === edge[ 0 ] || e === edge[ 1 ]) continue;
					var v = vertices[e];
					var closestPoint = line.closestPointToPoint(v, true);
					if (closestPoint.equals(vertices[edge[0]]) || closestPoint.equals(vertices[edge[0]])) continue;
					if ((new THREE.Line3(closestPoint, v)).distance() < 1e-5) { //1e-5
						// mark the current face as splitted so that his cords won't be considered
						face.splitted = true;
						// split the face in two using the new point
						faces.push(new THREE.Face3(
							e, face[ keys[ ( j + 2 ) % 3 ] ], face[ keys[ ( j ) % 3 ] ],
							face.normal, face.color, face.materialIndex
						));
						faces.push(new THREE.Face3(
							e, face[ keys[ ( j + 2 ) % 3 ] ], face[ keys[ ( j + 1 ) % 3 ] ],
							face.normal, face.color, face.materialIndex
						));
						break;
					}
				}
				if (face.splitted) break;

			}

		}

		for ( let i = 0, l = faces.length; i < l; i ++ ) {

			let face = faces[ i ];

			if (face.splitted) continue;

			for ( let j = 0; j < 3; j ++ ) {

				edge[ 0 ] = face[ keys[ j ] ];
				edge[ 1 ] = face[ keys[ ( j + 1 ) % 3 ] ];
				edge.sort( sortFunction );

				var key = edge.toString();

				if ( hash[ key ] === undefined ) {

					hash[ key ] = { vert1: edge[ 0 ], vert2: edge[ 1 ], face1: i, face2: undefined };

				} else {

					hash[ key ].face2 = i;

				}

			}

		}

		var coords = [];

		for ( let key in hash ) {

			let h = hash[ key ];

			// An edge is only rendered if the angle (in degrees) between the face normals of the adjoining faces exceeds this value. default = 1 degree.
			if ( h.face2 !== undefined && faces[ h.face1 ].normal.dot( faces[ h.face2 ].normal ) <= thresholdDot ) {

				var vertex = vertices[ h.vert1 ];
				coords.push( vertex.x );
				coords.push( vertex.y );
				coords.push( vertex.z );

				vertex = vertices[ h.vert2 ];
				coords.push( vertex.x );
				coords.push( vertex.y );
				coords.push( vertex.z );

			}

		}

		this.addAttribute( 'position', new THREE.Float32BufferAttribute( coords, 3 ) );

	}

EnhancedEdgesGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
EnhancedEdgesGeometry.prototype.constructor = EnhancedEdgesGeometry;

export { EnhancedEdgesGeometry };
