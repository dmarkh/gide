
// Three.js
import * as THREE from 'three';

// Physics Geometry Library
import PHYS from '../shapes/PHYS';

import G4Materials from './G4Materials';
import G4Constants from './G4Constants';
import G4Units from './G4Units';

import { EdgesGeometry } from './EdgesGeometry';

import pako from 'pako';

import * as mathjs from 'mathjs';

export default class GDML {

	constructor({ WorldRef = false, VisWorld = true, VisContainers = true, VisLevel = 3, VisEdges = 3355443, VisClip = false,
					VisClipInvert = false,
					VisPalette = 'nature2', StopOnSolids = true, AuxVisibility = false, AuxColor = false, MergeVolumes = false,
					GasBoundary = 0.01, LiquidBoundary = 1.5 }) {
		// container for settings
		this.settings = { WorldRef: WorldRef || '', sOpacity: 0.1 };

		// primary container
		this.group = new THREE.Group();


		// progress callbacks
		this.callbacks = {
			onStart: false,		// no parameters
			onProgress: false,	// ( "text", percentage 1..100 )
			onFinish: false		// no parameters
		};

		// statistics counters
		this.counters = { constants: 0, expressions: 0, variables: 0,
						materials: 0, solids: 0, volumes: 0, physvolumes: 0,
						cachedgeometries: 0, faces: 0, placedvolumes: 0, maxplacedvols: 0 };


		// GDML supporting structs

		// material lookup table: D, I
		this.materials = {};
		Object.assign( this.materials, G4Materials );

		// lookup table for constants: value
		this.constants = {};
		Object.assign( this.constants, G4Constants );

		// lookup table for units: multiplier
		this.units = {};
		Object.assign( this.units, G4Units );

		// lookup table for worldrefs: volume name
		this.worldrefs = {};
		this.worldrefsvislevel = {};

		this.defines = {};

		// hierarchical tree of volumes
		this.structure = {};

		// reversed tree of volumes for parent lookup
		this.revstructure = {};

		// material instance lookup table
		this.materialrefs = {};

		// material type lookup table
		this.materialtypes = {};

		// three.js geometries cache
		this.geometries = {};

		// lookup to prevent identical geometries from being instantiated
		// key = serialized string of ( shape name + attributes + lunit )
		this.geometries_lookup = {};

		// three.js edge geometries cache
		this.edgegeometries = {};

		this.startVolumeRef = false;
		// original gdml as text string
		this.text = false;
		// xml parser instance
		this.XMLPARSER = false;

		// color palette
		this.palettes = {
			"pastel": [	0xDEF5FB, 0xBBD8FA, 0xE1C3FF, 0xFAD6FA, 0xFFEAD7,
						0xD1E8EE, 0xB6D3FB, 0xDFC3FD, 0xFCCEEB, 0xFFEACB,
						0xCEE9FC, 0xA7E4FF, 0xE6C9F7, 0xFEC3E1, 0xFFEFC3,
						0xBADFFA, 0xC1EFFC, 0xCCC7FF, 0xFFBFDA, 0xFCE0C8 ],

			"rainbow":[	0xFF3F00, 0xFF7F00, 0xFFBF00, 0xFFFF00, 0xBFFF00,
						0x7FFF00, 0x3FFF00, 0x00FF00, 0x00FF3F, 0x00FF7F,
						0x00FFBF, 0x00FFFF, 0x00BFFF, 0x007FFF, 0x003FFF,
						0x0000FF, 0x3F00FF, 0x7F00FF, 0xBF00FF, 0xFF00FF ],

			"nature": [	0x001734, 0x00436B, 0x096C8F, 0x5C8494, 0x8799A3,
						0xCDCDC6, 0xAE9E93, 0xA2978B, 0x9EA67C, 0x809066,
						0x5F825A, 0x4B674C, 0x24442C, 0x18322A ],

			"nature2":[	0x9D5B34, 0xBF7A3B, 0xE6AF78, 0xE2D0B5, 0xEEE5D7,
						0xFBF7EB, 0xB2B9CC, 0x9A9FBB, 0x7F88AB, 0x60716D,
						0x4C5F4A, 0x415346, 0x6B2B29, 0xA31D1F, 0xAF4145,
						0xF34F5A, 0xFBE77B ],

			"random": [ 0xf0f8ff, 0xfaebd7, 0x7fffd4, 0xf0ffff, 0xf5f5dc,
						0xffe4c4, 0x0000ff, 0x8a2be2, 0xa52a2a, 0xdeb887,
						0x5f9ea0, 0xff7f50, 0x6495ed, 0xff8c00, 0x228b22 ],

			"root": [	0x000000, 0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0x47EB47, 0x4747EB, 0xFFFFFF,
						0xC0B6AC, 0x4B4B4B, 0x666666, 0x808080, 0x999999, 0xB2B2B2, 0xCCCCCC, 0xE5E5E5, 0xF2F2F2, 0xCCC7AB,
						0xCCC7AB, 0xC2BFA8, 0xBAB5A3, 0xB2A696, 0xB8A39C, 0xAD998C, 0x9C8F82, 0x876657, 0xB0CFC7, 0x85C2A3,
						0x8AA8A1, 0x829E8C, 0xADBDC7, 0x7A8F99, 0x758A91, 0x698296, 0x6E7A85, 0x7D99D1, 0x80809C, 0xABA6BF,
						0xD4CF87, 0xDEBA87, 0xBD9E82, 0xC7997D, 0xBF8278, 0xCF5E61, 0xAB8F94, 0xA6787A, 0x946970, 0xCF5E61 ],

			"white": [ 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF ]
		};

		this.palette = false;

		// settable/gettable parameters
		if ( WorldRef ) {
			this.WorldRef = WorldRef;
		} 
		// this.WorldRef = WorldRef;

		this.VisWorld = VisWorld;
		this.VisContainers = VisContainers;
		this.VisLevel = VisLevel;
		this.VisEdges = VisEdges;
		this.VisClipInvert = VisClipInvert;
		this.VisClip = VisClip;
		this.VisPalette = VisPalette;
		this.AuxVisibility = AuxVisibility;
		this.AuxColor = AuxColor;
		this.StopOnSolids = StopOnSolids;
		this.GasBoundary = GasBoundary;
		this.LiquidBoundary = LiquidBoundary;
		this.MergeVolumes = MergeVolumes;
		this.sPhiOpenTop = false; // Math.PI / 180; // false;
		this.sPhiOpenBot = false; // Math.PI / 2; // false;

		// color palette current (unused) color index
		this.palette_index_start = 6; // default = 7
		this.palette_index = this.palette_index_start; // Math.floor( Math.random() * ( this.palette.length - 2 ) );
	}

	updateParameters( param ) {
		let keys = Object.keys( this.settings ), is_updated = false;
		for ( let i = 0; i < keys.length; i++ ) {
			if ( param[ keys[i] ] === undefined ) { continue; }
			console.log('setting ' + keys[i] + ' = ' + param[keys[i]]);
			if ( this[keys[i]] !== param[keys[i]] ) {
				this[keys[i]] = param[keys[i]];
				is_updated = true;
			}
		}
		return is_updated
	}

	set cbOnStart( val )	{ this.callbacks.onStart = val;		}
	set cbOnProgress( val )	{ this.callbacks.onProgress = val;	}
	set cbOnFinish( val )	{ this.callbacks.onFinish = val;	}

	set WorldRef( val ) {
		console.log('setting WorldRef to: ' + val );
		if ( !val ) { return; }
		this.worldrefsvislevel = {};
		this.settings.WorldRef = val;
		let tmp = val.split(' ');

		if ( Array.isArray(tmp) && tmp.length > 1 ) {
			this.startVolumeRef = tmp;
			for ( let i = this.startVolumeRef.length - 1; i >= 0; i-- ) {

				// check if this.startVolumeRef[i] ends looks like <name>!<number>
				// if so, split by !, remember <number> in this.worldrefsvislevel[ <name> ]
				// set this.startVolumeRef[i] = <name>
				if ( this.startVolumeRef[i].indexOf('!') !== -1 ) {
					let name_level = this.startVolumeRef[i].split('!');
					this.worldrefsvislevel[ name_level[0] ] = parseInt( name_level[1] );
					this.startVolumeRef[i] = name_level[0];
				}

				if ( this.structure && !this.structure[ this.startVolumeRef[i] ] ) {
					this.startVolumeRef.splice(i, 1);
				}
			}
		} else if ( this.structure ) {
			if ( this.structure[ val ] ) {
				this.startVolumeRef = val;
			} else if ( val.indexOf('!') !== -1 ) {
				let name_level = val.split('!');
				if ( this.structure[ name_level[0] ] ) {
					this.worldrefsvislevel[ name_level[0] ] = parseInt( name_level[1] );
					this.startVolumeRef = name_level[0];
				}
			}
		}
		//console.log( this.startVolumeRef );
		//console.log( this.worldrefsvislevel );
	}

	set VisWorld( val ) { this.settings.VisWorld = val; }
	set VisContainers( val ) { this.settings.VisContainers = val; }
	set VisLevel( val ) { this.settings.VisLevel = val; }
	set VisEdges( val ) {
		this.settings.VisEdges = val ? parseInt(val) : false;
		this.materialrefs['__lines'] = new THREE.LineBasicMaterial({
				color: this.settings.VisEdges || 0x999999, linewidth: 1,
				clippingPlanes: this.clipPlanes,
				clipIntersection: this.settings.VisClipInvert
			});
	}

	set VisPalette( val ) {
		if ( this.palettes[ val ] ) {
			this.palette = this.palettes[ val ];
			this.settings.palette = val;
		} else {
			this.palette = this.palettes.nature;
			this.settings.palette = 'nature';
		}
		let materials = Object.keys( this.materialrefs ), color;
		if ( materials.length > 0 ) {
			this.palette_index = this.palette_index_start;
			for ( let i = 0, ilen = materials.length; i < ilen; i++ ) {
				if ( materials[ i ] === '__lines' ) { continue; }

				color = this.palette[ this.palette_index ];
				this.palette_index += 1;
				if ( this.palette_index === this.palette.length ) {
					this.palette_index = 0;
				}

				if ( !Array.isArray( this.materialrefs[ materials[i] ] ) ) {
					this.materialrefs[ materials[i] ].color.set( color );
					this.materialrefs[ materials[i] ].needsUpdate = true;
				} else {
					for ( let j = 0, jlen = this.materialrefs[ materials[i] ].length; j < jlen; j++ ) {
						this.materialrefs[ materials[i] ][j].color.set( color );
						this.materialrefs[ materials[i] ][j].needsUpdate = true;
					}
				}
			}
		}
	}

	set VisClipInvert( val ) {
		let changed = this.settings.VisClipInvert !== val;
		this.settings.VisClipInvert = val ? true : false;
		if ( changed ) {
			// update clipping
			this.VisClip = this.settings.VisClip;
		}
	}

	set VisClip( val ) {
		switch(val) {
			case '1/2':
				// one plane
				this.clipPlanes = [
					new THREE.Plane( new THREE.Vector3( -1,  0,  0 ), 0 )
				];
				break;
			case '1/3':
				// two planes
				this.clipPlanes = [
					new THREE.Plane( new THREE.Vector3( - Math.sin( 30 / 180 * Math.PI ),  - Math.cos ( 30 / 180 * Math.PI ),  0 ), 0 ),
					new THREE.Plane( new THREE.Vector3( -1,  0,  0 ), 0 )
				];
				break;
			case '1/4':
				// two planes
				this.clipPlanes = [
					new THREE.Plane( new THREE.Vector3( -1,  0,  0 ), 0 ),
					new THREE.Plane( new THREE.Vector3( 0, -1,  0 ), 0 )
				];
				break;
			case '1/8':
				// three planes
				this.clipPlanes = [
					new THREE.Plane( new THREE.Vector3(-1,  0,  0 ), 0 ),
					new THREE.Plane( new THREE.Vector3( 0, -1,  0 ), 0 ),
					new THREE.Plane( new THREE.Vector3( 0,  0,  1 ), 0 )
				];
				break;
			default:
				// no clipping
				this.clipPlanes = [];
		}
		if ( !this.materialrefs['__lines'] ) {
			this.materialrefs['__lines'] = new THREE.LineBasicMaterial({
				color: this.settings.VisEdges || 0x999999, linewidth: 1,
				clippingPlanes: this.clipPlanes,
				clipIntersection: this.settings.VisClipInvert
			});
		}

		for ( let i in this.materialrefs ) {
			if ( !Array.isArray( this.materialrefs[i] ) ) {
					if ( this.clipPlanes.length > 0 ) {
						this.materialrefs[i].clippingPlanes = this.clipPlanes;
						this.materialrefs[i].clipIntersection = this.settings.VisClipInvert;
					} else {
						this.materialrefs[i].clippingPlanes = [];
						this.materialrefs[i].clipIntersection = this.settings.VisClipInvert;
					}
					this.materialrefs[i].needsUpdate = true;
			} else {
				for ( let j = 0; j < this.materialrefs[i].length; j++ ) {
					if ( this.clipPlanes.length > 0 ) {
						this.materialrefs[i][j].clippingPlanes = this.clipPlanes;
						this.materialrefs[i][j].clipIntersection = this.settings.VisClipInvert;
					} else {
						this.materialrefs[i][j].clippingPlanes = [];
						this.materialrefs[i][j].clipIntersection = this.settings.VisClipInvert;
					}
					this.materialrefs[i][j].needsUpdate = true;
				}
			}
		}

		if ( this.merged_materials ) {
			for ( let i = 0, ilen = this.merged_materials.length; i < ilen; i++ ) {
				if ( this.clipPlanes.length > 0 ) {
					this.merged_materials[i].clippingPlanes = this.clipPlanes;
					this.merged_materials[i].clipIntersection = this.settings.VisClipInvert;
				} else {
					this.merged_materials[i].clippingPlanes = [];
					this.merged_materials[i].clipIntersection = this.settings.VisClipInvert;
				}
				this.merged_materials[i].needsUpdate = true;
			}
		}
		console.log('materials updated');
		this.settings.VisClip = val;
	}
	set StopOnSolids( val ) { this.settings.StopOnSolids = val; }
	set AuxVisibility( val ) { this.settings.AuxVisibility = val; }
	set AuxColor( val ) { this.settings.AuxColor = val; }
	set GasBoundary( val ) { this.settings.GasBoundary = val; }
	set LiquidBoundary( val ) { this.settings.LiquidBoundary = val; }
	set MergeVolumes( val ) { this.settings.MergeVolumes = val; }
	set sPhiOpenTop( val ) { this.settings.sPhiOpenTop = val; }
	set sPhiOpenBot( val ) { this.settings.sPhiOpenBot = val; }

	get WorldRef() { return this.settings.WorldRef; }
	get VisWorld() { return this.settings.VisWorld; }
	get VisContainers() { return this.settings.VisContainers; }
	get VisLevel() { return this.settings.VisLevel; }
	get VisEdges() { return this.settings.VisEdges; }
	get VisClip()  { return this.settings.VisClip; }
	get VisCLipInvert() { return this.settings.VisClipInvert; }
	get VisPalette() { return this.settings.VisPalette; }
	get StopOnSolids() { return this.settings.StopOnSolids; }
	get AuxVisibility() { return this.settings.AuxVisibility; }
	get AuxColor() { return this.settings.AuxColor; }
	get WorldRefs() { return Object.keys( this.worldrefs ); }
	get GasBoundary() { return this.settings.GasBoundary; }
	get LiquidBoundary() { return this.settings.LiquidBoundary; }
	get MergeVolumes() { return this.settings.MergeVolumes; }
	get sPhiOpenTop() { return this.settings.sPhiOpenTop; }
	get sPhiOpenBot() { return this.settings.sPhiOpenBot; }

	async load( url ) {
		if ( this.callbacks.onStart ) { this.callbacks.onStart(); }
		return new Promise((resolve, reject) => {
			this.text = false;
			let loader = new THREE.FileLoader();
            if ( url.endsWith('.gdml.gz') ) {
                loader.setResponseType('arraybuffer');
            }
			loader.crossOrigin = 'anonymous';
			loader.setPath( this.path );
			loader.load( url, ( text ) => {
				if ( this.callbacks.onFinish ) { this.callbacks.onFinish(); }
				// onload
				if ( url.endsWith('.gdml.gz') ) {
					this.text = pako.inflate( text, { to: 'string' } );
				} else if ( url.endsWith('.gdml') ) {
					this.text = text;
				} else {
					reject();
				}
				return resolve();
			}, ( progress ) => {
				if ( progress.lengthComputable && this.callbacks.onProgress ) {
					let percentage = Math.floor( progress.loaded / progress.total * 100 );
					this.callbacks.onProgress( "loading file..", percentage );
				}
			},
			( error ) => {
				// onerror
				if ( this.callbacks.onFinish ) { this.callbacks.onFinish(); }
				console.log( 'ERROR - url failed to load - ' + url );
				console.log( error );
				reject();
			});
		});
	}

	getPlacementMatrix( volumeref, hierarchy ) {
		if ( this.revstructure[ volumeref ] ) {
			hierarchy.unshift( this.revstructure[ volumeref ][0] );
			this.getPlacementMatrix( this.revstructure[ volumeref ][0].name, hierarchy );
		}
	}

	getParentPath( group, startVolumeRef ) {

		// clean up local matrix
		group.position.set( 0, 0, 0 );
		group.rotation.set( 0, 0, 0 );
		group.scale.set( 1, 1, 1 );
		group.updateMatrix();

		let hierarchy = [];
		this.getPlacementMatrix( startVolumeRef, hierarchy );

		let name_path = [];
		for ( let i = 0, ilen = hierarchy.length; i < ilen; i++ ) {
			name_path.push( hierarchy[i].name );
		}
		group.__name_path = name_path.join(' / ');

		if ( hierarchy.length > 0 ) {
			for ( let i = 0, ilen = hierarchy.length - 1; i < ilen; i++ ) {
				let pv = hierarchy[i].physvol;
				if ( pv.positionref ) {
					group.position.set( parseFloat(pv.positionref.x), parseFloat(pv.positionref.y), parseFloat(pv.positionref.z) );
				}
				if ( pv.rotationref ) {
					group.rotation.set( pv.rotationref.x, pv.rotationref.y, pv.rotationref.z );
				}
				if ( pv.scaleref ) {
					group.scale.set( pv.scaleref.x, pv.scaleref.y, pv.scaleref.z );
				}
				// copy local matrix to world matrix
				group.updateMatrix();
				group.matrixWorld.multiplyMatrices( group.matrixWorld, group.matrix );

				// clean up local matrix
				group.position.set( 0, 0, 0 );
				group.rotation.set( 0, 0, 0 );
				group.scale.set( 1, 1, 1 );
			}
			group.matrix.copy( group.matrixWorld );
			group.matrix.decompose( group.position, group.quaternion, group.scale );
		}
	}

	async getPlacedVolumes() {
		if ( this.callbacks.onStart ) { this.callbacks.onStart(); }
		if ( this.callbacks.onProgress ) { this.callbacks.onProgress( "placing volumes..", 0 ); }
		this.group = new THREE.Group();
		this.counters.placedvolumes = 0;
		this.counters.faces = 0;

		if ( Array.isArray( this.startVolumeRef ) && this.startVolumeRef.length > 0 ) {

			let global_vis_level = this.settings.VisLevel;
			for ( let j = 0, jlen = this.startVolumeRef.length; j < jlen; j++ ) {
				let group = new THREE.Group();
				this.getParentPath( group, this.startVolumeRef[j] );
				let volumes = this.revstructure[ this.startVolumeRef[j] ];
				if ( volumes ) {
					for ( let i = 0, ilen = volumes.length; i < ilen; i++ ) {

						if ( this.worldrefsvislevel[ this.startVolumeRef[j] ] ) {
							this.settings.VisLevel = this.worldrefsvislevel[ this.startVolumeRef[j] ];
						} else {
							this.settings.VisLevel = global_vis_level;
						}

						this.placeVolume({ parentmesh: group, volumeref: this.startVolumeRef[j],
							position: volumes[i].physvol.positionref,
							rotation: volumes[i].physvol.rotationref,
							scale: volumes[i].physvol.scaleref,
							level: 0 });

					}
				} else {
					this.placeVolume({ parentmesh: group, volumeref: this.startVolumeRef[j] });
				}
				this.group.add( group );
			}
			this.settings.VisLevel = global_vis_level;

		} else {

			let global_vis_level = this.settings.VisLevel;
			if ( this.worldrefsvislevel[ this.startVolumeRef ] ) {
				this.settings.VisLevel = this.worldrefsvislevel[ this.startVolumeRef ];
			}

			this.getParentPath( this.group, this.startVolumeRef );
			let volumes = this.revstructure[ this.startVolumeRef ];
			if ( volumes ) {
				for ( let i = 0, ilen = volumes.length; i < ilen; i++ ) {
					this.placeVolume({ parentmesh: this.group, volumeref: this.startVolumeRef,
							position: volumes[i].physvol.positionref,
							rotation: volumes[i].physvol.rotationref,
							scale: volumes[i].physvol.scaleref,
							level: 0 });
				}
			} else {
				this.placeVolume({ parentmesh: this.group, volumeref: this.startVolumeRef });
			}

			this.settings.VisLevel = global_vis_level;
		}

		console.log( 'placed volumes: ' + this.counters.placedvolumes );
		console.log( 'placed volume faces: ' + this.counters.faces );

		if ( !this.settings.MergeVolumes ) {
			if ( this.callbacks.onFinish ) { this.callbacks.onFinish(); }
			return this.group;
		}

		let combined_geometry = new THREE.Geometry(),
			combined_edges_geometry = new THREE.Geometry(),
			ctr = { count: 0 };
		this.merged_materials = [];

		if ( this.callbacks.onProgress ) { this.callbacks.onProgress( "merging volumes..", 0 ); }

		// recursive merge of volume tree
		await this.merge_mesh( combined_geometry, combined_edges_geometry, this.merged_materials, this.group, ctr );

		if ( this.callbacks.onProgress ) { this.callbacks.onProgress( "merging volumes..", 100 ); }

		// volumes
		let combined_mesh = new THREE.Mesh( combined_geometry, new THREE.MeshFaceMaterial( this.merged_materials ) );

		let combined_edges_mesh = new THREE.LineSegments( combined_edges_geometry, this.materialrefs['__lines'] );
		combined_mesh.add( combined_edges_mesh );

		console.log( 'merged mesh material count: ' + this.merged_materials.length );

		if ( this.callbacks.onFinish ) { this.callbacks.onFinish(); }

		return combined_mesh;
	}

	async merge_mesh( combined_geometry, combined_edges_geometry, materials_array, mesh, ctr ) {

		mesh.updateMatrixWorld();

		if ( this.settings.sPhiOpenTop !== false && this.settings.sPhiOpenBot !== false ) {
			console.log('checking phi top bot');
			let pos = new THREE.Vector3().setFromMatrixPosition( mesh.matrixWorld );
			if ( !( pos.x === 0 && pos.y === 0 && pos.z === 0 ) ) {
				let phi1 = this.settings.sPhiOpenTop, phi2 = this.settings.sPhiOpenBot,
				phi = Math.atan2( pos.y, pos.x );
				if ( phi >= phi1 && phi <= phi2 ) {
					return; // unit positioned at cut-out angle
				}
			}
		}

		// merge current mesh
		if ( mesh && mesh.geometry && mesh.type !== 'Group' ) {

			if ( mesh.type !== "LineSegments" && mesh.material ) {

				let matindex = materials_array.indexOf( mesh.material );
				if ( matindex === -1 ) {
					materials_array.push( mesh.material );
					matindex = materials_array.length - 1;
				}
				combined_geometry.merge( mesh.geometry, mesh.matrixWorld, matindex );
			} else {
				combined_edges_geometry.merge( mesh.geometry, mesh.matrixWorld );
			}
		}

		ctr.count += 1;
		if ( ctr.count % 1000 === 0 ) {
			if ( this.callbacks.onProgress ) {
				this.callbacks.onProgress( "merging volumes..", Math.floor( 100.0 * ctr.count / this.counters.placedvolumes ) );
				await this.delay(150);
			}
		}

		if ( !mesh.children.length ) { return; }
		// merge child objects
		for( let i = 0, ilen = mesh.children.length; i < ilen; i++ ) {
			await this.merge_mesh( combined_geometry, combined_edges_geometry, materials_array, mesh.children[i], ctr );
		}

	}

	async parse( text = this.text ) {
		if ( text === false ) {
			console.log( 'ERROR - no gdml to parse' );
			return;
		}
		if ( this.callbacks.onStart ) { this.callbacks.onStart(); } else { console.log('WARN - progress callback not set'); }

		this.counters = { constants: 0, expressions: 0, variables: 0,
						materials: 0, solids: 0, volumes: 0, physvolumes: 0,
						cachedgeometries: 0, faces: 0, placedvolumes: 0, maxplacedvols: 0 };

		// parse GDML structures into buffers and make geometries
		this.XMLPARSER = new DOMParser().parseFromString( text, 'text/xml' );
		if ( this.XMLPARSER.documentElement.nodeName === "parsererror" ) {
			if ( this.callbacks.onProgress ) { this.callbacks.onProgress( "ERROR: gdml file is not well-formed", 100 ); }
			console.log('ERROR - xml is not well-formed');
			await this.delay(3000);
			if ( this.callbacks.onFinish ) { this.callbacks.onFinish(); }
			return;
		}

		let blocks = [];

		blocks.push( async () => {
			console.log('--- parsing user info ---');
			await this.promisify( this.parseUserInfo.bind(this) );
		}, "parsing user info");

		blocks.push( async () => {
			console.log('--- parsing defines ---');
			await this.promisify( this.parseDefines.bind(this) );	// defines   => positionrefs, rotationrefs, scalerefs; constants => constantrefs
		}, "parsing defines");

		blocks.push( async () => {
			console.log('--- parsing materials ---');
			await this.promisify( this.parseMaterials.bind(this) );  	// materials => density lookup
		}, "parsing materials");

		blocks.push( async () => {
			await this.promisify( this.parseMaterialRefs.bind(this) );  // materials => three.js materials + colors
		}, "parsing materials");

		blocks.push( async () => {
			console.log('--- parsing solids ---');
			await this.promisify( this.parseSolids.bind(this) );		// solidrefs => three.js geometries
		}, "parsing solids");

		blocks.push( async () => {
			console.log('--- parsing structure ---');
			await this.promisify( this.parseStructure.bind(this) );	// volumes   => map of [name] => { solidref, placedVolumes = {} }
			console.log( this.counters );
		}, "parsing structure");

		blocks.push( async () => {
			console.log('--- parsing setup ---');
			await this.promisify( this.parseSetup.bind(this) );
		}, "parsing setup");

		blocks.push( async() => {
			await this.promisify( () => {
				console.log( '--- building volume tree, start: ' + this.startVolumeRef );
				this.calculateTotalVolumes( this.structure[ this.startVolumeRef ] );
				console.log( 'max possible placed volumes: ' + this.counters.maxplacedvols );
			});
		}, "building volume tree");


		for ( let b = 0, blen = blocks.length; b < blen; b += 2 ) {
			if ( this.callbacks.onProgress ) { this.callbacks.onProgress( blocks[b+1], Math.floor( b / blen * 100 ) ); }
			await blocks[b]();
			await this.delay(200);
		}

		if ( this.callbacks.onProgress ) { this.callbacks.onProgress( "parsing completed", 100 ); }
		if ( this.callbacks.onFinish ) { this.callbacks.onFinish(); }
		return await this.delay(150);
	}

	parseUserInfo() {
		let elements = this.XMLPARSER.querySelector('userinfo');
		if ( !elements ) {
			console.log('INFO - no <userinfo/> block found' );
			return;
		}
		let auxs = elements.childNodes, aux, nodeName, type, value,
			cauxs, caux, cnodeName, ctype, cvalue;
		if ( !auxs || auxs.length <= 0 ) {
			console.log('WARN - <userinfo/> block is found but looks empty');
			return;
		}
		console.log('WARN: found <userinfo/> block. It is not fully supported yet');
		for ( let i = 0, ilen = auxs.length; i < ilen; i++ ) {
			aux = auxs[i];
			nodeName = aux.nodeName;
			switch( nodeName ) {
				case 'auxiliary':
					type = aux.getAttribute('auxtype');
					value = aux.getAttribute('auxvalue');
					console.log('userinfo: ' + type + ' = ' + value );
					cauxs = aux.childNodes;
					if ( cauxs && cauxs.length > 0 ) {
						for ( let j = 0, jlen = cauxs.length; j < jlen; j++ ) {
							caux = cauxs[j];
							cnodeName = caux.nodeName;
							switch( cnodeName ) {
								case 'auxiliary':
									ctype = caux.getAttribute('auxtype');
									cvalue = caux.getAttribute('auxvalue');
									console.log('   cuserinfo: ' + ctype + ' = ' + cvalue );
									break;
								case '#text':
									break;
								default:
									console.log('unrecognized user info subtag: ' + cnodeName );
									break;
							}
						}
					}
					break;
				case '#text':
					break;
				default:
					console.log('unrecognized user info tag: ' + nodeName );
					break;
			}
		}
	}

	parseDefines() {
		this.defines = {};
		let elements = this.XMLPARSER.querySelector('define');
		let defs = elements.childNodes, name = '', value, type, unit, nodeName, def, attrs, coldim;
		for ( let i = 0, ilen = defs.length; i < ilen; i++ ) {
			nodeName = defs[i].nodeName;
			def = defs[i];
			switch( nodeName ) {

				case 'constant':
					name = def.getAttribute('name');
					value = def.getAttribute('value');
					this.constants[ name ] = mathjs.eval( value, this.constants );
					this.counters.constants += 1;
					break;

				case 'expression':
					name = def.getAttribute('name');
					value = def.childNodes[0].nodeValue;
					this.constants[ name ] = mathjs.eval( value, this.constants );
					this.counters.expressions += 1;
					break;

				case 'variable':
					name = def.getAttribute('name');
					value = def.getAttribute('value');
					this.constants[ name ] = mathjs.eval( value, this.constants );
					this.counters.variables += 1;
					break;

				case 'position':
					name = def.getAttribute('name');
					attrs = this.extract_attributes( def, { x: 0, y: 0, z: 0 }, true );
					unit = def.getAttribute('unit') || 'mm';
					attrs.x *= this.units[ unit ];
					attrs.y *= this.units[ unit ];
					attrs.z *= this.units[ unit ];
					this.defines[ name ] = { x: attrs.x, y: attrs.y, z: attrs.z };
					break;

				case 'rotation':
					name = def.getAttribute('name');
					attrs = this.extract_attributes( def, { x: 0, y: 0, z: 0 }, true );
					unit = def.getAttribute('unit') || 'rad';
					if ( unit === 'deg' || unit === 'degree' ) {
						attrs.x *= Math.PI / 180.0; attrs.y *= Math.PI / 180.0; attrs.z *= Math.PI / 180.0;
					}
					this.defines[ name ] = { x: -1*attrs.x, y: -1*attrs.y, z: -1*attrs.z };
					break;

				case 'scale':
					name = def.getAttribute('name');
					attrs = this.extract_attributes( def, { x: 1, y: 1, z: 1 }, true );
					this.defines[ name ] = { x: attrs.x, y: attrs.y, z: attrs.z };
					break;

				case 'quantity':
					name = def.getAttribute('name');
					value = def.getAttribute('value');
					type = def.getAttribute('type');
					unit = def.getAttribute('unit'); // no default unit
					if ( type === 'length' ) {
						if ( isNaN( value ) === true ) { value = mathjs.eval( value, this.constants ); }
						unit = unit || 'mm';
						value *= this.units[ unit ];
						this.constants[ name ] = value;
					} else {
						// FIXME: how to deal with type == 'density' or other types? Answer => G4 Units
						this.defines[ name ] = { value, type, unit };
					}

					break;

				case '#text':
					// skip unused "text" nodes
					break;

				case 'matrix':
					coldim = parseInt( def.getAttribute('coldim') );
					name = def.getAttribute('name');
					value = def.getAttribute('value');
					value = value.replace(/[\n\r]/g, ' ').split(' ').filter(Boolean);
					if ( !coldim || coldim < 1 ) {
						console.log('ERROR: bad <matrix> tag encountered');
						break;
					}
					for ( let i = 0, ilen = value.length; i < ilen; i++ ) {
						if ( isNaN( value[i] ) === true ) { value[i] = mathjs.eval( value[i], this.constants ); }
					}
					if ( coldim > 1 ) {
						value = value.reduce( (rows, key, index) => (index % coldim == 0 ? rows.push([key]) : rows[rows.length-1].push(key)) && rows, [] );
					}
					this.constants[ name ] = value;
					this.counters.constants += 1;
					break;

				default:
					console.log( 'ERROR - unsupported define tag - ' + nodeName );
					break;
			}
		}
	}

	parseMaterials() {
		// restore overwritten materials if any
		Object.assign( this.materials, G4Materials );

		let elements = this.XMLPARSER.querySelector('materials');
		let materials = elements.childNodes, material, type, name;
		for ( let i = 0, ilen = materials.length; i < ilen; i++ ) {
			material = materials[i];
			type = material.nodeName;
			if ( type !== 'material' ) { continue; }
			name = material.getAttribute('name');
			let params = material.childNodes, ptype;
			for ( let j = 0, lenj = params.length; j < lenj; j++ ) {
				ptype = params[j].nodeName;
				if ( ptype !== 'D' ) { continue; }
				let density = parseFloat( params[j].getAttribute('value') || 0.0 );
				if ( this.materials[ name ] ) {
					console.log('WARNING - duplicated material: ' + name + ', overwriting D: ' +
					this.materials[name].D + ' with D: ' + density);
				}
				this.materials[ name ] = { 'D': density };
			}
		}
	}

	parseMaterialRefs() {
		this.palette_index = this.palette_index_start;
		let elements = this.XMLPARSER.querySelector('materials');
		let materials = elements.childNodes, material, type, name, color, state;
		for ( let i = 0, ilen = materials.length; i < ilen; i++ ) {
			material = materials[i];
			type = material.nodeName;
			if ( type === 'loop' ) {
				console.log('ERROR - material loops are not supported yet');
			}
			if ( type !== 'material' ) { continue; }
			name = material.getAttribute('name');
			state = material.getAttribute('state');

			if ( !state || state !== 'gas' ) {
				state = 'solid';
				// parse further to get density
				let params = material.childNodes, ptype;
				for ( let j = 0, lenj = params.length; j < lenj; j++ ) {
					ptype = params[j].nodeName;
					if ( ptype === 'D' ) {
						let density = parseFloat( params[j].getAttribute('value') || 0.0 );
						if ( density < this.GasBoundary ) {
							state = 'gas';
						} else if ( density < this.LiquidBoundary ) {
							state = 'liquid';
						}
						break;
					}
				}
			}

			// color
			color = this.palette[ this.palette_index ];
			this.palette_index += 1;
			if ( this.palette_index >= this.palette.length ) { this.palette_index = 0; }

			this.materialtypes[ name ] = state || 'unknown';

			switch( state ) {
				case 'solid':
					this.materialrefs[ name ] = [ new THREE.MeshLambertMaterial({
							side: THREE.DoubleSide,
							color,
							clippingPlanes: this.clipPlanes,
							clipIntersection: this.settings.VisClipInvert
						}) ];
					break;
				case 'liquid':
					this.materialrefs[ name ] = [ new THREE.MeshLambertMaterial({
							side: THREE.FrontSide,
							color,
							wireframe: false,
							transparent: true,
							opacity: this.settings.sOpacity,
							clippingPlanes: this.clipPlanes,
							clipIntersection: this.settings.VisClipInvert
						}),
						new THREE.MeshLambertMaterial({
							side: THREE.BackSide,
							color,
							wireframe: false,
							transparent: true,
							opacity: this.settings.sOpacity,
							clippingPlanes: this.clipPlanes,
							clipIntersection: this.settings.VisClipInvert
						}) ];
					break;
				case 'gas':
					// this.materialrefs[ name ] = [];
					if ( this.LiquidBoundary > 1E5 ) {
						this.materialrefs[ name ] = [ new THREE.MeshLambertMaterial({
							side: THREE.FrontSide,
							color,
							wireframe: false,
							transparent: true,
							opacity: this.settings.sOpacity,
							clippingPlanes: this.clipPlanes,
							clipIntersection: this.settings.VisClipInvert
						}),
						new THREE.MeshLambertMaterial({
							side: THREE.BackSide,
							color,
							wireframe: false,
							transparent: true,
							opacity: this.settings.sOpacity,
							clippingPlanes: this.clipPlanes,
							clipIntersection: this.settings.VisClipInvert
						}) ];
					} else {
						this.materialrefs[ name ] =
							[ new THREE.MeshLambertMaterial({
								side: THREE.DoubleSide,
								color,
								clippingPlanes: this.clipPlanes,
								clipIntersection: this.settings.VisClipInvert
							}) ];
					}
					break;
				default:
					console.log('ERROR - unrecognized material - ' + name );
					break;
			}
			this.counters.materials += 1;
		}
	}

	parseSolids() {
		this.geometries = {};
		this.counters.cachedgeometries = 0;
		let elements = this.XMLPARSER.querySelector('solids');
		let solids = elements.childNodes;
		let name, type, solid, i, ilen, geo;
		for ( i = 0, ilen = solids.length; i < ilen; i++ ) {
			solid = solids[i];
			if ( !solid.getAttribute ) { continue; }
			type = solid.nodeName;
			name = solid.getAttribute('name');
			this.counters.solids += 1;
			switch( type ) {
				case 'scaledSolid':
					geo = this.make_scaledsolid( solid );
					if ( geo !== false ) { this.geometries[name] = geo; }
					break;
				case 'multiUnion':
					geo = this.make_multiunion( solid );
					if ( geo !== false ) { this.geometries[name] = geo; }
					break;
				case 'reflectedSolid':
					console.log('ERROR - reflected solids are not supported yet');
					break;
				case 'box':
					this.geometries[name] = this.make_box( solid );
					break;
				case 'cone':
					this.geometries[name] = this.make_cone( solid );
					break;
				case 'ellipsoid':
					this.geometries[name] = this.make_ellipsoid( solid );
					break;
				case 'eltube':
					this.geometries[name] = this.make_eltube( solid );
					break;
				case 'elcone':
					this.geometries[name] = this.make_elcone( solid );
					break;
				case 'orb':
					this.geometries[name] = this.make_orb( solid );
					break;
				case 'paraboloid':
					this.geometries[name] = this.make_paraboloid( solid );
					break;
				case 'para':
					this.geometries[name] = this.make_para( solid );
					break;
				case 'polycone':
					this.geometries[name] = this.make_polycone( solid );
					break;
				case 'genericPolycone':
					this.geometries[name] = this.make_genericPolycone( solid );
					break;
				case 'polyhedra':
					this.geometries[name] = this.make_polyhedra( solid );
					break;
				case 'genericPolyhedra':
					this.geometries[name] = this.make_genericPolyhedra( solid );
					break;
				case 'sphere':
					this.geometries[name] = this.make_sphere( solid );
					break;
				case 'torus':
					this.geometries[name] = this.make_torus( solid );
					break;
				case 'trd':
					this.geometries[name] = this.make_trd( solid );
					break;
				case 'trap':
					this.geometries[name] = this.make_trap( solid );
					break;
				case 'hype':
					this.geometries[name] = this.make_hype( solid );
					break;
				case 'cutTube':
					this.geometries[name] = this.make_cutTube( solid );
					break;
				case 'tube':
					this.geometries[name] = this.make_tube( solid );
					break;
				case 'twistedbox':
					this.geometries[name] = this.make_twistedbox( solid );
					break;
				case 'twistedtrd':
					this.geometries[name] = this.make_twistedtrd( solid );
					break;
				case 'twistedtrap':
					this.geometries[name] = this.make_twistedtrap( solid );
					break;
				case 'twistedtubs':
					this.geometries[name] = this.make_twistedtubs( solid );
					break;
				case 'xtru':
					this.geometries[name] = this.make_xtru( solid );
					break;
				case 'arb8':
					this.geometries[name] = this.make_arb8( solid );
					break;
				case 'tessellated':
					this.geometries[name] = this.make_tessellated( solid );
					break;
				case 'tet':
					this.geometries[name] = this.make_tet( solid );
					break;
				case 'union':
					this.geometries[name] = this.make_csg( solid, 'union' );
					break;
				case 'subtraction':
					this.geometries[name] = this.make_csg( solid, 'subtraction' );
					break;
				case 'intersection':
					this.geometries[name] = this.make_csg( solid, 'intersection' );
					break;
				default:
					console.log('ERROR - unsupported geo type - ' + type);
					this.counters.solids -= 1;
					break;
			}
			
            if ( this.settings.VisEdges !== false && this.geometries[ name ] ) {
				this.edgegeometries[ name ] = new EdgesGeometry( this.geometries[ name ] );
				//this.edgegeometries[ name ] = new THREE.EdgesGeometry( this.geometries[ name ] );
			}
			
		}
	}

	parseStructure() {
		this.structure = {};
		let structure = this.XMLPARSER.querySelector('structure');
		let nodes = structure.childNodes, childVolumes, child, type, name,
			i, ilen, j, jlen, physvol, auxunit, auxvalue;
		for ( i = 0, ilen = nodes.length; i < ilen; i++ ) {
			type = nodes[i].nodeName;
			if ( type === 'loop' ) {
				console.log('ERROR - loops over volumes are not supported yet');
			}
			if ( type !== 'volume' && type !== 'assembly' ) { continue; }
			this.counters.volumes += 1;
			name = nodes[i].getAttribute('name');
			this.structure[ name ] = { materialref: false, solidref: false, placedVolumes: [] };
			childVolumes = nodes[i].childNodes;
			for ( j = 0, jlen = childVolumes.length; j < jlen; j++ ) {
				child = childVolumes[j];
				switch( child.nodeName ) {
					case 'materialref':
						this.structure[ name ].materialref = child.getAttribute('ref');
						break;
					case 'solidref':
						this.structure[ name ].solidref = child.getAttribute('ref');
						break;
					case 'physvol':
						physvol = this.parsePhysVol( child );
						if ( physvol ) {
							this.structure[ name ].placedVolumes.push( physvol );
							this.counters.physvolumes += 1;
							// reverse lookup table, allow multi-placement for same volume
							if ( !this.revstructure[ physvol.volumeref ] ) { this.revstructure[ physvol.volumeref ] = []; }
							this.revstructure[ physvol.volumeref ].push( { name, physvol } );
						}
						break;
					case 'auxiliary':
						if ( !this.structure[ name ].auxref ) { this.structure[ name ].auxref = {}; }
						auxunit = child.getAttribute('auxunit');
						auxvalue = child.getAttribute('auxvalue');
						if ( auxunit && this.units[ auxunit ] && !isNaN( auxvalue ) ) {
							auxvalue = parseFloat( auxvalue ) * this.units[ auxunit ];
						}
						this.structure[ name ].auxref[ child.getAttribute('auxtype') ] = auxvalue;
						break;
					case 'loop':
						// unroll loop into series of physvols
						this.parseLoop( this.structure[ name ].placedVolumes, child );
						break;
					case '#text':
						// skip empty text
						break;

					case 'replicavol': // eslint-disable-line no-fallthrough
						// replicas along, not implemented
					case 'paramvol':   // eslint-disable-line no-fallthrough
						// parametrized volume, not implmeneted
					case 'divisionvol': // eslint-disable-line no-fallthrough
						// divided volume, not implemented
					default:	// eslint-disable-line no-fallthrough
						console.log( 'WARN - unsupported struct ref - ' + child.nodeName );
						break;
				}
			}
		}
	}

	parseLoop( physvol_container, node ) {
		// variable name
		let lvar = node.getAttribute('for'), physvol;
		let attrs = this.extract_attributes( node, { from: 0, to: 0, step: 1 }, true );
		for ( let loopvalue = attrs.from; loopvalue <= attrs.to; loopvalue += attrs.step ) {
			this.constants[ lvar ] = loopvalue;
			let childVolumes = node.childNodes;
			for ( let i = 0, ilen = childVolumes.length; i < ilen; i++ ) {
				let child = childVolumes[i];
				switch( child.nodeName ) {
					case 'loop':
						// unroll loop into series of physvols
						this.parseLoop( physvol_container, child );
						break;
					case 'physvol':
						physvol = this.parsePhysVol( child );
						if ( physvol ) {
							physvol_container.push( physvol );
							this.counters.physvolumes += 1;
						}
						break;
					case '#text':
						break;
					default:
						console.log( 'ERROR - unsupported struct ref inside loop - ' + child.nodeName );
						break;
				}
			}
		}
	}

	parsePhysVol( node ) {
		let nodes = node.childNodes, child, unit, attrs,
			physvol = { volumeref: false, positionref: { x: 0, y: 0, z: 0 }, rotationref: { x: 0, y: 0, z: 0 }, scaleref: false };
		for ( let i = 0, ilen = nodes.length; i < ilen; i++ ) {
			child = nodes[i];
			if ( !child.getAttribute ) { continue; }
			switch( child.nodeName ) {
				case 'position':
					unit = child.getAttribute('unit') || 'mm';
					attrs = this.extract_attributes( child, { x: 0, y: 0, z: 0 }, true );
					attrs.x *= this.units[unit];
					attrs.y *= this.units[unit];
					attrs.z *= this.units[unit];
					physvol[ child.nodeName+'ref' ] = { x: attrs.x, y: attrs.y, z: attrs.z };
					break;
				case 'rotation':
					unit = child.getAttribute('unit') || 'rad';
					attrs = this.extract_attributes( child, { x: 0, y: 0, z: 0 }, true );
					if ( unit === 'deg' || unit === 'degree' ) {
						attrs.x *= Math.PI / 180.0;
						attrs.y *= Math.PI / 180.0;
						attrs.z *= Math.PI / 180.0;
					}
					physvol[ child.nodeName+'ref' ] = { x: -1*attrs.x, y: -1*attrs.y, z: -1*attrs.z };
					break;
				case 'scale':
					attrs = this.extract_attributes( child, { x: 1, y: 1, z: 1 }, true );
					physvol[ child.nodeName+'ref' ] = { x: attrs.x, y: attrs.y, z: attrs.z };
					break;
				case 'volumeref':
					physvol[ child.nodeName ] = child.getAttribute('ref');
					break;
				case 'positionref':
				case 'rotationref':
				case 'scaleref':
					physvol[ child.nodeName ] = this.defines[ child.getAttribute('ref') ];
					break;
				case '#text':
					break;
				default:
					console.log('ERROR - unsupported tag inside physvol - ' + child.nodeName );
					break;
			}
		}
		return physvol;
	}

	parseSetup() {
		this.worldrefs = {};
		this.startVolumeRef = false;

		let setup = this.XMLPARSER.querySelector('setup');
		let worlds = setup.childNodes;
		for ( let i = 0, ilen = worlds.length; i < ilen; i++ ) {
			let nodeName = worlds[i].nodeName;
			let node = worlds[i];
			if ( nodeName !== 'world' ) { continue; }
			let volumeref = node.getAttribute('ref'),
				vislevel = node.getAttribute('vislevel');
			if ( vislevel ) { vislevel = parseInt(vislevel); }
			this.worldrefs[ volumeref ] = vislevel ? vislevel : 3;
			if ( !this.startVolumeRef ) {
				this.startVolumeRef = volumeref;
			}
		}

		// override starting volume reference if settings say so
		if ( this.settings.WorldRef && this.structure[ this.settings.WorldRef ] ) {
			this.startVolumeRef = this.settings.WorldRef;
			return;
		}
		if ( !this.startVolumeRef ) {
			console.log('ERROR - no default world found ---');
		}
	}

	calculateTotalVolumes( volume ) {
		this.counters.maxplacedvols += 1;
		let children = volume.placedVolumes,
			nchildren = children.length;
		if ( !nchildren ) { return; }
		for ( let i = 0; i < nchildren; i++ ) {
			if ( !this.structure[ children[i].volumeref ] ) {
				console.log( 'ERROR - child of ' + volume.volumeref + 'not found: ' + children[i].volumeref );
			} else {
				this.calculateTotalVolumes( this.structure[ children[i].volumeref ] );
			}
		}
	}

	placeVolume({ parentmesh, volumeref, position = { x: 0, y: 0, z: 0 }, rotation = false, scale = false, level }) {
		if ( !this.structure[ volumeref ] ) {
			console.log('ERROR - cannot find mesh for volume ' + volumeref );
			return;
		}

		let children = this.structure[ volumeref ].placedVolumes,
			nchildren = children.length, child, mesh, mesh2;

		let auxvis = true, geo;
		if ( this.settings.AuxVisibility === true && this.structure[ volumeref ].auxref && this.structure[ volumeref ].auxref.Visibility &&
				this.structure[ volumeref ].auxref.Visibility === 'false' ) {
			auxvis = false;
		}

		//
		// FIXME: get material(s) on a fly instead of a query to prebuilt material cache
		//
		let is_air = this.materialtypes[ this.structure[ volumeref ].materialref ] === 'gas',
			is_container =	!( volumeref.indexOf('Container') === -1 ) ||
							!( volumeref.indexOf('Quadrant') === -1 ) ||
							!( volumeref.indexOf('Sector') === -1 ),
				materials = this.structure[ volumeref ].materialref ? this.materialrefs[ this.structure[ volumeref ].materialref ] : false;
		if ( is_air && !is_container ) {
			materials = [];
		}

		let meshes = [];

		if ( auxvis === false || materials.length === 0 || !this.geometries[ this.structure[ volumeref ].solidref ] ||
				( !this.settings.VisContainers && nchildren && level > 0 && level < this.settings.VisLevel ) ||
				( level === 0 && this.settings.VisWorld === false && level < this.settings.VisLevel ) ) {

			// no mesh, just a assembly-like container
			meshes.push( new THREE.Group() );

		} else {
			// get geometry for this volume, already processed (booleans etc)
			geo = this.geometries[ this.structure[ volumeref ].solidref ];

			// create parent mesh
			mesh = new THREE.Mesh( geo, materials[1] ? materials[1] : materials[0] );
			meshes.push( mesh );

			// if semitransparent, create child mesh
			if ( materials[1] ) {
				mesh2 = new THREE.Mesh( geo, materials[0] );
				meshes.push( mesh2 );
			}

			// if edges requested, create child mesh
			if ( this.settings.VisEdges !== false ) {
				let edges = new THREE.LineSegments( this.edgegeometries[ this.structure[ volumeref ].solidref ],
						this.materialrefs['__lines'] );
				meshes.push( edges );
			}
		}

		for ( let i = 0, ilen = meshes.length; i < ilen; i++ ) {
			mesh = meshes[i];
			if ( scale ) {
				mesh.scale.set( scale.x, scale.y, scale.z );
				// FIXME: negative scale inverts normals => bad light reflections
			}
			if ( rotation ) {
				mesh.rotation.set( rotation.x, rotation.y, rotation.z );
			}
			if ( position ) {
				mesh.position.set( position.x, position.y, position.z );
			}
			mesh.__name_path = parentmesh.__name_path ? ( parentmesh.__name_path + ' / ' + volumeref ) : volumeref;
			parentmesh.add( mesh );
			if ( mesh.geometry && mesh.geometry.faces ) {
				this.counters.faces += mesh.geometry.faces.length;
			}
		}

		// account for multi-mesh objects
		this.counters.placedvolumes += meshes.length;

		// don't place child volumes if solid material encountered
		if ( this.settings.StopOnSolids && materials && materials.length === 1 ) { return; }

		if ( !nchildren ) { return; }

		if ( level >= this.settings.VisLevel ) { return; }

		if ( is_air && is_container ) { return; } // air-filled, but turned into solid

		level += 1;

		for ( let i = 0; i < nchildren; i++ ) {
			child = children[ i ];
			this.placeVolume({ parentmesh: meshes[0], volumeref: child.volumeref,
				position: child.positionref, rotation: child.rotationref,
				scale: child.scaleref, level: level });
				//scale: child.scaleref, level: ( meshes[0].type !== 'Group' ) ? (level+1) : level });
		}
	}

	//--------------------------------
	//  GEO SHAPES
	//--------------------------------

	make_multiunion( solid ) {
		let children = solid.childNodes, children2, child, child2, name, name2, geo = false, lunit, aunit,
			a_bsp = false, positionref = false, rotationref = false, scaleref = false;
		for ( let i = 0, ilen = children.length; i < ilen; i++ ) {
			child = children[i];
			name = child.nodeName;
			if ( name !== 'multiUnionNode') { continue; }
			children2 = child.childNodes;
			positionref = { x: 0, y: 0, z: 0 };
			rotationref = { x: 1, y: 1, z: 1 };
			scaleref    = { x: 1, y: 1, z: 1 };
			for ( let j = 0, jlen = children2.length; j < jlen; j++ ) {
				child2 = children2[j];
				name2 = child2.nodeName;
				switch( name2 ) {
					case 'solid':
						geo = this.geometries[ child2.getAttribute('ref') ];
						break;
					case 'positionref':
						positionref = this.defines[ child2.getAttribute('ref') ]; // positionref { x, y, z }
						break;
					case 'rotationref':
						rotationref = this.defines[ child2.getAttribute('ref') ]; // rotationref { x, y, z }
						break;
					case 'scaleref':
						scaleref = this.defines[ child2.getAttribute('ref') ]; // scaleref { x, y, z }
						break;
					case 'position':
						positionref = this.extract_attributes( child2, { x: 0, y: 0, z: 0 }, true );
						lunit = child2.getAttribute('unit') || 'mm';
						positionref.x *= this.units[ lunit ];
						positionref.y *= this.units[ lunit ];
						positionref.z *= this.units[ lunit ];
						break;
					case 'rotation':
						rotationref = this.extract_attributes( child2, { x: 0, y: 0, z: 0 }, true );
						aunit = child2.getAttribute('unit') || 'rad';
						if ( aunit === 'rad' || aunit === 'radian' ) {
							rotationref.x = rotationref.x * 180.0 / Math.PI;
							rotationref.y = rotationref.y * 180.0 / Math.PI;
							rotationref.z = rotationref.z * 180.0 / Math.PI;
						}
						break;
					case 'scale':
						scaleref = this.extract_attributes( child2, { x: 1, y: 1, z: 1 }, true );
						break;
					default:
						break;
				}
			}
			if ( a_bsp === false ) {
				let a = new THREE.Mesh( geo );
				a.position.set( 0, 0, 0 );
				a.rotation.set( 0, 0, 0 );
				a_bsp = new PHYS.CSG( a );
			} else {
				let	b = new THREE.Mesh( geo );
				b.scale.set( scaleref.x, scaleref.y, scaleref.z );
				b.rotation.set( rotationref.x, rotationref.y, rotationref.z );
				b.position.set( positionref.x, positionref.y, positionref.z );
				let b_bsp = new PHYS.CSG( b );
				a_bsp = a_bsp.union( b_bsp );
			}
		}
		geo = a_bsp.toGeometry();
		return geo;
	}

	make_scaledsolid( solid ) {
		let children = solid.childNodes, child, name, scale = false, geo = false, matrix4;
		for ( let i = 0, ilen = children.length; i < ilen; i++ ) {
			child = children[i];
			name = child.nodeName;
			if ( name === 'solidref') {
				geo = this.geometries[ child.getAttribute('ref') ];
			} else if ( name === 'scaleref' ) {
				scale = this.defines[ child.getAttribute('ref') ];
			} else if ( name === 'scale' ) {
				scale = this.extract_attributes( child, { x: 1, y: 1, z: 1 }, true );
			}
		}
		if ( geo && scale ) {
			matrix4 = new THREE.Matrix4();
			matrix4.makeScale( scale.x, scale.y, scale.z );
			geo.applyMatrix( matrix4 );
			return geo;
		}
		return false;
	}

	make_box( solid ) {
		let attrs = this.extract_attributes( solid, { x: 0.0, y: 0.0, z: 0.0, PhiTwist: 0 }, true ),
			lunit = solid.getAttribute('lunit') || 'mm',
			aunit = solid.getAttribute('aunit') || 'rad';

		attrs.x *= this.units[ lunit ];
		attrs.y *= this.units[ lunit ];
		attrs.z *= this.units[ lunit ];
		if ( attrs.PhiTwist && aunit && !( aunit === 'deg' || aunit === 'degree' ) ) {
			attrs.PhiTwist = attrs.PhiTwist ? attrs.PhiTwist * 180.0 / Math.PI : 0;
		}

		let json_name = JSON.stringify([ 'box', attrs ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.box({ dx: attrs.x/2, dy: attrs.y/2, dz: attrs.z/2, twist: attrs.PhiTwist });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_cone( solid ) {
		let attrs = this.extract_attributes(solid,
			{ rmin1: 0.0, rmax1: 0.0, rmin2: 0.0, rmax2: 0.0, startphi: 0.0, deltaphi: 0.0, z: 0.0 }, true ),
			lunit = solid.getAttribute('lunit') || 'mm',
			aunit = solid.getAttribute('aunit') || 'rad';
		attrs.rmin1 *= this.units[ lunit ]; attrs.rmax1 *= this.units[ lunit ];
		attrs.rmin2 *= this.units[ lunit ]; attrs.rmax2 *= this.units[ lunit ];
		attrs.z *= this.units[ lunit ];
		if ( !( aunit === 'deg' || aunit === 'degree' ) ) {
			attrs.startphi = attrs.startphi * 180.0 / Math.PI; // back to deg
			attrs.dphi = attrs.dphi * 180.0 / Math.PI; // back to deg
		}
		let json_name = JSON.stringify([ 'cone', attrs,  ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.cons({	rmin1: attrs.rmin1, rmax1: attrs.rmax1,
									rmin2: attrs.rmin2, rmax2: attrs.rmax2,
									phi1: attrs.startphi, phi2: ( attrs.startphi + attrs.deltaphi ),
									dz: attrs.z/2
								});
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_ellipsoid( solid ) {
		let attrs = this.extract_attributes(solid, { ax: 0.0, by: 0.0, cz: 0.0, zcut1: 0, zcut2: 0 }, true ),
			lunit = solid.getAttribute('lunit') || 'mm';
		attrs.ax *= this.units[ lunit ];
		attrs.by *= this.units[ lunit ];
		attrs.cz *= this.units[ lunit ];
		attrs.zcut1 *= this.units[ lunit ];
		attrs.zcut2 *= this.units[ lunit ];

		let json_name = JSON.stringify([ 'ellipsoid', attrs ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.ellipsoid({ pxSemiAxis: attrs.ax, pySemiAxis: attrs.by,
				pzSemiAxis: attrs.cz, pzBottomCut: attrs.zcut1, pzTopCut: attrs.zcut2 });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_eltube( solid ) {
		let attrs = this.extract_attributes(solid, { dx: 0.0, dy: 0.0, dz: 0.0 }, true ),
			lunit = solid.getAttribute('lunit') || 'mm';
		attrs.dx *= this.units[ lunit ];
		attrs.dy *= this.units[ lunit ];
		attrs.dz *= this.units[ lunit ];
		let json_name = JSON.stringify([ 'eltube', attrs ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.eltu({ dx: attrs.dx, dy: attrs.dy, dz: attrs.dz });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_elcone( solid ) {
		let attrs = this.extract_attributes(solid, { dx: 0.0, dy: 0.0, zmax: 0, zcut: 0 }, true),
			lunit = solid.getAttribute('lunit') || 'mm';
		attrs.dx *= this.units[ lunit ];
		attrs.dy *= this.units[ lunit ];
		attrs.zmax *= this.units[ lunit ];
		attrs.zcut *= this.units[ lunit ];

		let json_name = JSON.stringify([ 'elcone', attrs ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.elcone({ pxSemiAxis: attrs.dx, pySemiAxis: attrs.dy, zMax: attrs.zmax, pzTopCut: attrs.zcut });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_orb( solid ) {
		let attrs = this.extract_attributes(solid, { r: 0.0 }, true),
			lunit = solid.getAttribute('lunit') || 'mm';
		attrs.r *= this.units[ lunit ];
		let json_name = JSON.stringify([ 'orb', attrs ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.orb({ rmax: attrs.r });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_paraboloid( solid ) {
		let attrs = this.extract_attributes(solid, { rlo: 0.0, rhi: 0.0, dz: 0.0 }, true),
			lunit = solid.getAttribute('lunit') || 'mm';
		attrs.rlo *= this.units[ lunit ];
		attrs.rhi *= this.units[ lunit ];
		attrs.dz *= this.units[ lunit ];
		let json_name = JSON.stringify([ 'paraboloid', attrs ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.paraboloid({ rlo: attrs.rlo, rhi: attrs.rhi, dz: attrs.dz });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_para( solid ) {
		let attrs = this.extract_attributes(solid, { x: 0.0, y: 0.0, z: 0.0, alpha: 0, theta: 0, phi: 0 }, true),
			lunit = solid.getAttribute('lunit') || 'mm',
			aunit = solid.getAttribute('aunit') || 'rad';
		attrs.x *= this.units[ lunit ];
		attrs.y *= this.units[ lunit ];
		attrs.z *= this.units[ lunit ];
		if ( !( aunit === 'deg' || aunit === 'degree' ) ) {
			attrs.alpha = attrs.alpha * 180.0 / Math.PI;
			attrs.theta = attrs.theta * 180.0 / Math.PI;
			attrs.phi = attrs.phi * 180.0 / Math.PI;
		}
		let json_name = JSON.stringify([ 'para', attrs ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.para({ dx: attrs.x/2, dy: attrs.y/2, dz: attrs.z/2, alph: attrs.alpha, thet: attrs.theta, phi: attrs.phi });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_polycone( solid ) {
		let attrs = this.extract_attributes(solid, { startphi: 0, deltaphi: 0 }, true),
			lunit = solid.getAttribute('lunit') || 'mm',
			aunit = solid.getAttribute('aunit') || 'rad';
		if ( !( aunit === 'deg' || aunit === 'degree' ) ) {
			attrs.startphi = attrs.startphi * 180.0 / Math.PI;
			attrs.deltaphi = attrs.deltaphi * 180.0 / Math.PI;
		}
		let nz = 0, z = [], rmin = [], rmax = [];
		// extract z planes
		let nodes = solid.childNodes, child, nodeName, attrs2;
		for ( let i = 0; i < nodes.length; i++ ) {
			child = nodes[i];
			nodeName = child.nodeName
			if ( nodeName !== 'zplane' ) { continue; }
			attrs2 = this.extract_attributes(child, { rmin: 0, rmax: 0, z: 0 }, true);
			attrs2.rmin *= this.units[ lunit ];
			attrs2.rmax *= this.units[ lunit ];
			attrs2.z *= this.units[ lunit ];
			nz += 1; z.push( attrs2.z ); rmin.push( attrs2.rmin ); rmax.push( attrs2.rmax );
		}
		let json_name = JSON.stringify([ 'polycone', attrs, nz, z, rmin, rmax ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.pcon({ phi1: attrs.startphi, dphi: attrs.deltaphi, nz: nz, z: z, rmin: rmin, rmax: rmax });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_genericPolycone( solid ) {
		let attrs = this.extract_attributes(solid, { startphi: 0, deltaphi: 0 }, true),
			lunit = solid.getAttribute('lunit') || 'mm',
			aunit = solid.getAttribute('aunit') || 'rad';
		if ( ( !aunit === 'deg' || aunit === 'degree' ) ) {
			attrs.startphi = attrs.startphi * 180.0 / Math.PI;
			attrs.deltaphi = attrs.deltaphi * 180.0 / Math.PI;
		}
		let nz = 0, z = [], rmin = [], rmax = [];
		// extract z planes
		let nodes = solid.childNodes, child, nodeName, attrs2;
		for ( let i = 0; i < nodes.length; i++ ) {
			child = nodes[i];
			nodeName = child.nodeName
			if ( nodeName !== 'rzpoint' ) { continue; }
			attrs2 = this.extract_attributes(child, { r: 0, z: 0 }, true);
			attrs2.r *= this.units[ lunit ];
			attrs2.z *= this.units[ lunit ];
			nz += 1; z.push( attrs2.z ); rmin.push( 0 ); rmax.push( attrs2.r );
		}
		let json_name = JSON.stringify([ 'genericPolycone', attrs, nz, z, rmin, rmax ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.pcon({ phi1: attrs.startphi, dphi: attrs.deltaphi, nz: nz, z: z, rmin: rmin, rmax: rmax });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_polyhedra( solid ) {
		let attrs = this.extract_attributes(solid, { startphi: 0, deltaphi: 0, numsides: 0 }, true),
			lunit = solid.getAttribute('lunit') || 'mm',
			aunit = solid.getAttribute('aunit') || 'rad';
		if ( !( aunit === 'deg' || aunit === 'degree' ) ) {
			attrs.startphi = attrs.startphi * 180.0 / Math.PI;
			attrs.deltaphi = attrs.deltaphi * 180.0 / Math.PI;
		}
		let nz = 0, z = [], rmin = [], rmax = [];
		// extract z planes
		let nodes = solid.childNodes, child, nodeName, attrs2;
		for ( let i = 0; i < nodes.length; i++ ) {
			child = nodes[i];
			nodeName = child.nodeName
			if ( nodeName !== 'zplane' ) { continue; }
			attrs2 = this.extract_attributes(child, { rmin: 0, rmax: 0, z: 0 }, true);
			attrs2.rmin *= this.units[ lunit ];
			attrs2.rmax *= this.units[ lunit ];
			attrs2.z *= this.units[ lunit ];
			nz += 1; z.push( attrs2.z ); rmin.push( attrs2.rmin ); rmax.push( attrs2.rmax );
		}
		let json_name = JSON.stringify([ 'polyhedra', attrs, nz, z, rmin, rmax ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.pgon({ phi1: attrs.startphi, dphi: attrs.deltaphi, npdv: attrs.numsides,
									nz: nz, z: z, rmin: rmin, rmax: rmax });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_genericPolyhedra( solid ) {
		let attrs = this.extract_attributes(solid, { startphi: 0, deltaphi: 0, numsides: 0 }, true),
			lunit = solid.getAttribute('lunit') || 'mm',
			aunit = solid.getAttribute('aunit') || 'rad';
		if ( !( aunit === 'deg' || aunit === 'degree' ) ) {
			attrs.startphi = attrs.startphi * 180.0 / Math.PI;
			attrs.deltaphi = attrs.deltaphi * 180.0 / Math.PI;
		}
		let nz = 0, z = [], rmin = [], rmax = [];
		// extract z planes
		let nodes = solid.childNodes, child, nodeName, attrs2;
		for ( let i = 0; i < nodes.length; i++ ) {
			child = nodes[i];
			nodeName = child.nodeName
			if ( nodeName !== 'rzpoint' ) { continue; }
			attrs2 = this.extract_attributes(child, { r: 0, z: 0 }, true);
			attrs2.r *= this.units[ lunit ];
			attrs2.z *= this.units[ lunit ];
			nz += 1; z.push( attrs2.z ); rmin.push( 0 ); rmax.push( attrs2.r );
		}

		let json_name = JSON.stringify([ 'genericPolyhedra', attrs, nz, z, rmin, rmax ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.pgon({ phi1: attrs.startphi, dphi: attrs.deltaphi, npdv: attrs.numsides,
									nz: nz, z: z, rmin: rmin, rmax: rmax });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_sphere( solid ) {
		let attrs = this.extract_attributes(solid, { rmin: 0, rmax: 0, starttheta: 0, deltatheta: 0, startphi: 0, deltaphi: 0 }, true),
			lunit = solid.getAttribute('lunit') || 'mm',
			aunit = solid.getAttribute('aunit') || 'rad';
		attrs.rmin *= this.units[ lunit ];
		attrs.rmax *= this.units[ lunit ];
		if ( !( aunit === 'deg' || aunit === 'degree' ) ) {
			attrs.startphi = attrs.startphi * 180.0 / Math.PI;
			attrs.deltaphi = attrs.deltaphi * 180.0 / Math.PI;
			attrs.starttheta = attrs.starttheta * 180.0 / Math.PI;
			attrs.deltatheta = attrs.deltatheta * 180.0 / Math.PI;
		}
		let json_name = JSON.stringify([ 'sphere', attrs ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.sphe({ rmin: attrs.rmin, rmax: attrs.rmax,
			the1: attrs.starttheta, the2: (attrs.starttheta + attrs.deltatheta),
			phi1: attrs.startphi, phi2: (attrs.startphi + attrs.deltaphi) });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_torus( solid ) {
		let attrs = this.extract_attributes( solid, { rtor: 0, rmin: 0, rmax: 0, startphi: 0, deltaphi: 0 }, true),
			lunit = solid.getAttribute('lunit') || 'mm',
			aunit = solid.getAttribute('aunit') || 'rad';
		attrs.rtor *= this.units[ lunit ];
		attrs.rmin *= this.units[ lunit ];
		attrs.rmax *= this.units[ lunit ];
		if ( !( aunit === 'deg' || aunit === 'degree' ) ) {
			attrs.startphi = attrs.startphi * 180.0 / Math.PI;
			attrs.deltaphi = attrs.deltaphi * 180.0 / Math.PI;
		}
		let json_name = JSON.stringify([ 'torus', attrs ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.torus({ r: attrs.rtor, rmin: attrs.rmin, rmax: attrs.rmax,
				phi1: attrs.startphi, dphi: attrs.deltaphi });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_trd( solid ) {
		let attrs = this.extract_attributes( solid, { x1: 0, x2: 0, y1: 0, y2: 0, z: 0, PhiTwist: 0 }, true),
			lunit = solid.getAttribute('lunit') || 'mm',
			aunit = solid.getAttribute('aunit') || 'rad';
		attrs.x1 *= this.units[ lunit ];
		attrs.x2 *= this.units[ lunit ];
		attrs.y1 *= this.units[ lunit ];
		attrs.y2 *= this.units[ lunit ];
		attrs.z  *= this.units[ lunit ];
		if ( !( aunit === 'deg' || aunit === 'degree' ) ) {
			attrs.PhiTwist = attrs.PhiTwist ? attrs.PhiTwist * 180.0 / Math.PI : 0;
		}
		let json_name = JSON.stringify([ 'trd', attrs ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.trd2({ dx1: attrs.x1 / 2, dx2: attrs.x2 / 2, dy1: attrs.y1 / 2, dy2: attrs.y2 / 2, dz: attrs.z / 2, twist: attrs.PhiTwist });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_trap( solid ) {
		let attrs = this.extract_attributes( solid, { z: 0, theta: 0, phi: 0, x1: 0, y1: 0, x2: 0, y2: 0,
														x3: 0, x4: 0, alpha1: 0, alpha2: 0, PhiTwist: 0 }, true),
			lunit = solid.getAttribute('lunit') || 'mm',
			aunit = solid.getAttribute('aunit') || 'rad';
		attrs.z *= this.units[ lunit ];
		attrs.y1 *= this.units[ lunit ];
		attrs.y2 *= this.units[ lunit ];
		attrs.x1 *= this.units[ lunit ];
		attrs.x2 *= this.units[ lunit ];
		attrs.x3 *= this.units[ lunit ];
		attrs.x4 *= this.units[ lunit ];
		if ( !( aunit === 'deg' || aunit === 'degree' ) ) {
			attrs.theta = attrs.theta * 180.0 / Math.PI;
			attrs.phi = attrs.phi * 180.0 / Math.PI;
			attrs.alpha1 = attrs.alpha1 * 180.0 / Math.PI;
			attrs.alpha2 = attrs.alpha2 * 180.0 / Math.PI;
			attrs.PhiTwist = attrs.PhiTwist ? attrs.PhiTwist * 180.0 / Math.PI : 0;
		}
		let json_name = JSON.stringify([ 'trap', attrs ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.trap({ dz: attrs.z/2, thet: attrs.theta, phi: attrs.phi,
				h1: attrs.y1 / 2, bl1: attrs.x1 / 2, tl1: attrs.x2 / 2,
				alp1: attrs.alpha1, h2: attrs.y2 / 2, bl2: attrs.x3 / 2, tl2: attrs.x4 / 2, alp2: attrs.alpha2, twist: attrs.PhiTwist });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}


	make_hype( solid ) {
		let attrs = this.extract_attributes( solid, { rmin: 0, rmax: 0, inst: 0, outst: 0, z: 0 }, true),
			lunit = solid.getAttribute('lunit') || 'mm',
			aunit = solid.getAttribute('aunit') || 'rad';
		attrs.rmin *= this.units[ lunit ];
		attrs.rmax *= this.units[ lunit ];
		attrs.z *= this.units[ lunit ];
		if ( !( aunit === 'deg' || aunit === 'degree' ) ) {
			attrs.inst = attrs.inst * 180.0 / Math.PI;
			attrs.outst = attrs.outst * 180.0 / Math.PI;
		}
		let json_name = JSON.stringify([ 'hype', attrs ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.hype({ rmin: attrs.rmin, rmax: attrs.rmax, dz: attrs.z/2, inst: attrs.inst, outst: attrs.outst });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_cutTube( solid ) {
		let attrs = this.extract_attributes( solid, { z: 0, rmin: 0, rmax: 0, startphi: 0, deltaphi: 0,
				lowX: 0, lowY: 0, lowZ: 0, highX: 0, highY: 0, highZ: 0 }, true),
			lunit = solid.getAttribute('lunit') || 'mm',
			aunit = solid.getAttribute('aunit') || 'rad';
		attrs.z *= this.units[ lunit ];
		attrs.rmin *= this.units[ lunit ];
		attrs.rmax *= this.units[ lunit ];
		if ( !( aunit === 'deg' || aunit === 'degree' ) ) {
			attrs.startphi = attrs.startphi * 180.0 / Math.PI;
			attrs.deltaphi = attrs.deltaphi * 180.0 / Math.PI;
		}
		let json_name = JSON.stringify([ 'cutTube', attrs ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.ctub({ dz: attrs.z/2, rmin: attrs.rmin, rmax: attrs.rmax, phi1: attrs.startphi,
			phi2: (attrs.startphi+attrs.deltaphi), lx: attrs.lowX, ly: attrs.lowY, lz: attrs.lowZ,
			hx: attrs.highX, hy: attrs.highY, hz: attrs.highZ });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_tube( solid ) {
		let attrs = this.extract_attributes( solid, { z: 0, rmin: 0, rmax: 0, startphi: 0, deltaphi: 0, twist: 0 }, true),
			lunit = solid.getAttribute('lunit') || 'mm',
			aunit = solid.getAttribute('aunit') || 'rad';
		attrs.z *= this.units[ lunit ];
		attrs.rmin *= this.units[ lunit ];
		attrs.rmax *= this.units[ lunit ];
		if ( !( aunit === 'deg' || aunit === 'degree' ) ) {
			attrs.startphi = attrs.startphi * 180.0 / Math.PI;
			attrs.deltaphi = attrs.deltaphi * 180.0 / Math.PI;
			attrs.twist = attrs.twist ? attrs.twist * 180.0 / Math.PI : 0;
		}
		let json_name = JSON.stringify([ 'tube', attrs ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.tubs({ dz: attrs.z/2, rmin: attrs.rmin, rmax: attrs.rmax,
				phi1: attrs.startphi, phi2: (attrs.startphi+attrs.deltaphi), twist: attrs.twist });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_twistedbox( solid ) {
		return this.make_box( solid );
	}

	make_twistedtrd( solid ) {
		return this.make_trd( solid );
	}

	make_twistedtrap( solid ) {
		let attrs = this.extract_attributes( solid, { z: 0, Theta: 0, Phi: 0, x1: 0, y1: 0, x2: 0, y2: 0,
														x3: 0, x4: 0, Alph: 0, PhiTwist: 0 }, true),
			lunit = solid.getAttribute('lunit') || 'mm',
			aunit = solid.getAttribute('aunit') || 'rad';
		attrs.z *= this.units[ lunit ];
		attrs.y1 *= this.units[ lunit ];
		attrs.y2 *= this.units[ lunit ];
		attrs.x1 *= this.units[ lunit ];
		attrs.x2 *= this.units[ lunit ];
		attrs.x3 *= this.units[ lunit ];
		attrs.x4 *= this.units[ lunit ];
		if ( !( aunit === 'deg' || aunit === 'degree' ) ) {
			attrs.Theta = attrs.Theta * 180.0 / Math.PI;
			attrs.Phi = attrs.Phi * 180.0 / Math.PI;
			attrs.Alph = attrs.Alph * 180.0 / Math.PI;
			attrs.PhiTwist = attrs.PhiTwist ? attrs.PhiTwist * 180.0 / Math.PI : 0;
		}
		let json_name = JSON.stringify([ 'twistedtrap', attrs ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.trap({ dz: attrs.z/2, thet: attrs.Theta, phi: attrs.Phi,
				h1: attrs.y1, bl1: attrs.x1, tl1: attrs.x2,
				alp1: attrs.Alph, h2: attrs.y2, bl2: attrs.x3, tl2: attrs.x4, alp2: attrs.Alph, twist: attrs.PhiTwist });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_twistedtubs( solid ) {
		let attrs = this.extract_attributes( solid, { zlen: 0, endinnerrad: 0, endouterrad: 0, phi: 0, twistedangle: 0 }, true),
			lunit = solid.getAttribute('lunit') || 'mm',
			aunit = solid.getAttribute('aunit') || 'rad';
		attrs.zlen *= this.units[ lunit ];
		attrs.endinnerrad *= this.units[ lunit ];
		attrs.endouterrad *= this.units[ lunit ];
		if ( !( aunit === 'deg' || aunit === 'degree' ) ) {
			attrs.phi = attrs.phi * 180.0 / Math.PI;
			attrs.twistedangle = attrs.twistedangle ? attrs.twistedangle * 180.0 / Math.PI : 0;
		}
		let json_name = JSON.stringify([ 'twistedtubs', attrs ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.tubs({ dz: attrs.zlen/2, rmin: attrs.endinnerrad, rmax: attrs.endouterrad,
				phi1: 0, phi2: attrs.phi, twist: attrs.twistedangle });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_xtru( solid ) {
		let x = [], y = [], sections = [],
			lunit = solid.getAttribute('lunit') || 'mm';

		let nodes = solid.childNodes, child, nodeName, attrs2;
		for ( let i = 0, ilen = nodes.length; i < ilen; i++ ) {
			child = nodes[i];
			nodeName = child.nodeName
			if ( nodeName === 'twoDimVertex' ) {
				attrs2 = this.extract_attributes(child, { x: 0, y: 0 }, true);
				attrs2.x *= this.units[ lunit ];
				attrs2.y *= this.units[ lunit ];
				x.push( attrs2.x ); y.push( attrs2.y );
			} else if ( nodeName === 'section' ) {
				attrs2 = this.extract_attributes(child, { zOrder: 0, zPosition: 0, xOffset: 0, yOffset: 0, scalingFactor: 0 }, true);
				attrs2.zPosition *= this.units[ lunit ];
				attrs2.xOffset *= this.units[ lunit ];
				attrs2.yOffset *= this.units[ lunit ];
				sections.push([ attrs2.zPosition, attrs2.xOffset, attrs2.yOffset, attrs2.scalingFactor ]);
			} else {
				continue;
			}
		}
		let json_name = JSON.stringify([ 'xtru', x, y, sections ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.xtru({ x, y, sections });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_arb8( solid ) {
		let attrs = this.extract_attributes( solid, { dz: 0, v1x: 0, v1y: 0, v2x: 0, v2y: 0, v3x: 0, v3y: 0, v4x: 0, v4y: 0,
								v5x: 0, v5y: 0, v6x: 0, v6y: 0, v7x: 0, v7y: 0, v8x: 0, v8y: 0 }, true),
			lunit = solid.getAttribute('lunit') || 'mm';
		attrs.dz *= this.units[ lunit ];
		attrs.v1x *= this.units[ lunit ]; attrs.v1y *= this.units[ lunit ];
		attrs.v2x *= this.units[ lunit ]; attrs.v2y *= this.units[ lunit ];
		attrs.v3x *= this.units[ lunit ]; attrs.v3y *= this.units[ lunit ];
		attrs.v4x *= this.units[ lunit ]; attrs.v4y *= this.units[ lunit ];
		attrs.v5x *= this.units[ lunit ]; attrs.v5y *= this.units[ lunit ];
		attrs.v6x *= this.units[ lunit ]; attrs.v6y *= this.units[ lunit ];
		attrs.v7x *= this.units[ lunit ]; attrs.v7y *= this.units[ lunit ];
		attrs.v8x *= this.units[ lunit ]; attrs.v8y *= this.units[ lunit ];

		let json_name = JSON.stringify([ 'arb8', attrs ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.arb8({ dz: attrs.dz,
				x0: attrs.v1x, y0: attrs.v1y,
				x1: attrs.v2x, y1: attrs.v2y,
				x2: attrs.v3x, y2: attrs.v3y,
				x3: attrs.v4x, y3: attrs.v4y,
				x4: attrs.v5x, y4: attrs.v5y,
				x5: attrs.v6x, y5: attrs.v6y,
				x6: attrs.v7x, y6: attrs.v7y,
				x7: attrs.v8x, y7: attrs.v8y
			});
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_tessellated( solid ) {
		let vertices = {},
			faces = [];
		let nodes = solid.childNodes, child, nodeName, attrs, def1, def2, def3, def4, type;
		for ( let i = 0, ilen = nodes.length; i < ilen; i++ ) {
			def1 = false; def2 = false; def3 = false; def4 = false;
			child = nodes[i];
			nodeName = child.nodeName;
			if ( nodeName !== 'triangular' && nodeName !== 'quadrangular' ) { continue; }
			attrs = this.extract_attributes( child, { vertex1: false, vertex2: false, vertex3: false, vertex4: false, type }, false );
			def1 = this.defines[ attrs.vertex1 ];
			def2 = this.defines[ attrs.vertex2 ];
			def3 = this.defines[ attrs.vertex3 ];
			if ( attrs.vertex4 ) {
				def4 = this.defines[ attrs.vertex4 ];
			}
			if ( attrs.type === 'RELATIVE' || attrs.type === 'relative' ) {
				def2.x += def1.x; def2.y += def1.y; def2.z += def1.z;
				def3.x += def1.x; def3.y += def1.y; def3.z += def1.z;
				if ( def4 ) {
					def4.x += def1.x; def4.y += def1.y; def4.z += def1.z;
				}
			}
			if ( !def4 ) {
				faces.push([ attrs.vertex1, attrs.vertex2, attrs.vertex3 ]);
			} else {
				faces.push([ attrs.vertex1, attrs.vertex2, attrs.vertex3, attrs.vertex4 ]);
			}

			if ( !vertices[ attrs.vertex1 ] ) {
				vertices[ attrs.vertex1 ] = [ def1.x, def1.y, def1.z ];
			}
			if ( !vertices[ attrs.vertex2 ] ) {
				vertices[ attrs.vertex2 ] = [ def2.x, def2.y, def2.z ];
			}
			if ( !vertices[ attrs.vertex3 ] ) {
				vertices[ attrs.vertex3 ] = [ def3.x, def3.y, def3.z ];
			}
			if ( def4 ) {
				if ( !vertices[ attrs.vertex4 ] ) {
					vertices[ attrs.vertex4 ] = [ def4.x, def4.y, def4.z ];
				}
			}
		}

		let json_name = JSON.stringify([ 'tessellated', vertices, faces ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.tessellated({ vertices, faces });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_tet( solid ) {
		let attrs = this.extract_attributes( solid, { vertex1: '', vertex2: '', vertex3: '', vertex4: '' }, false );
		let v1 = this.defines[ attrs.vertex1 ],
			v2 = this.defines[ attrs.vertex2 ],
			v3 = this.defines[ attrs.vertex3 ],
			v4 = this.defines[ attrs.vertex4 ];
		let json_name = JSON.stringify([ 'tet', v1, v2, v3, v4 ]);
		if ( !this.geometries_lookup[ json_name ] ) {
			this.geometries_lookup[ json_name ] = new PHYS.Geo.tet({ anchor: [ v1.x, v1.y, v1.z ], p2: [ v2.x, v2.y, v2.z ],
			p3: [ v3.x, v3.y, v3.z ], p4: [ v4.x, v4.y, v4.z ] });
		} else {
			this.counters.cachedgeometries += 1;
		}
		return this.geometries_lookup[ json_name ];
	}

	make_csg( solid, op ) {
		let nodes = solid.childNodes, child, nodeName,
			ref1 = false, ref2 = false, lunit, aunit,
			positionref = { x: 0, y: 0, z: 0 }, rotationref = { x: 0, y: 0, z: 0 }, scaleref = { x: 1, y: 1, z: 1 };
		for ( let i = 0, ilen = nodes.length; i < ilen; i++ ) {
			child = nodes[i];
			nodeName = child.nodeName
			switch( nodeName ) {
				case 'first':
					ref1 = child.getAttribute('ref');
					break;
				case 'second':
					ref2 = child.getAttribute('ref');
					break;
				case 'positionref':
					positionref = this.defines[ child.getAttribute('ref') ]; // positionref { x, y, z }
					break;
				case 'rotationref':
					rotationref = this.defines[ child.getAttribute('ref') ]; // rotationref { x, y, z }
					break;
				case 'scaleref':
					scaleref = this.defines[ child.getAttribute('ref') ]; // scaleref { x, y, z }
					break;
				case 'position':
					positionref = this.extract_attributes( child, { x: 0, y: 0, z: 0 }, true );
					lunit = child.getAttribute('unit') || 'mm';
					positionref.x *= this.units[ lunit ];
					positionref.y *= this.units[ lunit ];
					positionref.z *= this.units[ lunit ];
					break;
				case 'rotation':
					rotationref = this.extract_attributes( child, { x: 0, y: 0, z: 0 }, true );
					aunit = child.getAttribute('unit') || 'rad';
					if ( aunit === 'rad' || aunit === 'radian' ) {
						rotationref.x = rotationref.x * 180.0 / Math.PI;
						rotationref.y = rotationref.y * 180.0 / Math.PI;
						rotationref.z = rotationref.z * 180.0 / Math.PI;
					}
					break;
				case 'scale':
					scaleref = this.extract_attributes( child, { x: 1, y: 1, z: 1 }, true );
					break;
				default:
					break;
			}
		}
		// process CSG
		if ( !this.geometries[ ref1 ] ) { console.log('ERROR - missing geometry for volume - ' + ref1 ); return; }
		if ( !this.geometries[ ref2 ] ) { console.log('ERROR - missing geometry for volume - ' + ref2 ); return; }
		let geo = false, bsp,
			a = new THREE.Mesh( this.geometries[ ref1 ].clone() ),
			b = new THREE.Mesh( this.geometries[ ref2 ].clone() );
		a.position.set( 0, 0, 0 ); a.rotation.set( 0, 0, 0 );
		b.scale.set( scaleref.x, scaleref.y, scaleref.z );
		b.rotation.set( rotationref.x, rotationref.y, rotationref.z );
		b.position.set( positionref.x, positionref.y, positionref.z );
		let a_bsp = new PHYS.CSG( a ),
			b_bsp = new PHYS.CSG( b );
		switch( op ) {
			case 'union':
				bsp = a_bsp.union( b_bsp );
				break;
			case 'subtraction':
				bsp = a_bsp.subtract( b_bsp );
				break;
			case 'intersection':
				bsp = a_bsp.intersect( b_bsp );
				break;
			default:
				console.log('ERROR - unsupported csg operation - ' + op );
				break;
		}
		geo = bsp.toGeometry();
		return geo;
	}

	extract_attributes( tag, o, is_number = true ) {
		let keys = Object.keys( o ), attr;
		for ( let i = 0; i < keys.length; i++ ) {
			attr = keys[i];
			o[ attr ] = tag.getAttribute( attr ) || o[ attr ];
			if ( this.defines[ attr ] ) { o[ attr ] = this.defines[ attr ]; }
			if ( is_number ) {
				if ( isNaN( o[ attr ] ) === true ) { o[ attr ] = mathjs.eval( o[ attr ], this.constants ); }
				if ( o[ attr ] ) { o[ attr ] = parseFloat( o[ attr ] ); }
			}
		}
		return o;
	}

	promisify( func ) {
		return new Promise(function(resolve) {
			setTimeout(function() {
				resolve( func() );
			}, 0);
		});
	}

	delay(ms) {
		var ctr, rej, p = new Promise(function (resolve, reject) {
			ctr = setTimeout(resolve, ms);
			rej = reject;
		});
		p.cancel = function(){ clearTimeout(ctr); rej(Error("Cancelled"))};
		return p;
	}

} // class GDML

