
// Three.js
import * as THREE from 'three';

import OrbitControls from '../../vendor/threejs/OrbitControls';

// GDML parser library
import GDML from '../../core/gdml/GDML';

// Events parser library
import Events from '../../core/events/events.es6';

// tree-view for volume selection as $.treeview
import '../../vendor/treeview/jquery.treeview.js';
import '../../vendor/treeview/jquery.treeview.async.js';
import '../../vendor/jquery.treeview.css';

import moment from '../../vendor/moment/moment-timezone-with-data.min.js';
window.moment = moment;
moment.tz.setDefault('America/New_York');

class Display {

	constructor({ canvas_id, VisAxes = false }) {
		this.parameters = { canvas_id };

		this.event = new THREE.Group();
		this.detector = new THREE.Group();
		this.axes = new THREE.Group();
		this.GDMLimporter = new GDML({});
		this.EVENTimporter = new Events();

		this.settings = { VisAxes, showArrows: false, showBbox:false };
		this.is_running = false;
		this.is_initialized = false;
		this.is_rotating = '0';
		this.rotation_theta = Math.PI / 180 / 3;

		this.event_collection = false;
		this.event_collection_idx = false;
		this.is_event_collection_playing = false;

		this.bbox = { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };

        this.materials = { lines: new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 1, linewidth: 1,
                                                                 vertexColors: THREE.VertexColors }) };

		this.callbacks = { cbOnStart: false, cbOnProgress: false, cbOnFinish: false };
		this.fonts = {};

		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();
	}

	set VisAxes( val ) { this.settings.VisAxes = ( val === false ) ? false : true;
		if ( val ) { this.add_axes(); }
		else { this.remove_axes(); }
	}

	get VisAxes() { return this.settings.VisAxes; }
	set ShowArrows( val ) { this.settings.showArrows = val; }
	get ShowArrows() { return this.settings.showArrows; }
	set ShowBbox( val ) { this.settings.showBbox = val; }
	get ShowBbox() { return this.settings.showBbox; }
 
	set cbOnStart( func )	{ this.GDMLimporter.cbOnStart = func;	}
	set cbOnProgress( func ){ this.GDMLimporter.cbOnProgress = func;}
	set cbOnFinish( func )	{ this.GDMLimporter.cbOnFinish = func;	}

	start() {
		if ( this.is_running ) { return; }
		this.is_running = true;
		this.render();
		this.animate();
	}

	stop() {
		this.is_running = false;
	}

	async init() {

		// load font
		await this.load_font();

		this.bbox = { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
		let canvas = $( '#' + this.parameters.canvas_id );
		if ( this.is_initialized ) {
			// update renderer
			this.camera_perspective.aspect = canvas.innerWidth() / canvas.innerHeight();
			this.camera_perspective.updateProjectionMatrix();
			this.camera_ortho.left  = -canvas.innerWidth();
			this.camera_ortho.right =  canvas.innerWidth();
			this.camera_ortho.top   =  canvas.innerHeight();
			this.camera_ortho.bottom =-canvas.innerHeight();
			this.camera_ortho.updateProjectionMatrix();
			this.renderer.setSize( canvas.innerWidth(), canvas.innerHeight() );
			this.render();
			return;
		}
		this.is_initialized = true;

		this.camera_perspective = new THREE.PerspectiveCamera( this.fov, canvas.innerWidth() / canvas.innerHeight(), 10, 200000 );

		let w = canvas.innerWidth(), h = canvas.innerHeight();
        this.camera_ortho = new THREE.OrthographicCamera( -w, w, h, -h, -50000, 50000 );
        this.camera_ortho.up = new THREE.Vector3(0,1,0);
		this.camera_ortho.updateProjectionMatrix();

		this.set_camera();

		this.scene = new THREE.Scene();

		this.scene.add( new THREE.AmbientLight( 0xffffff ) );
		this.light = new THREE.PointLight( 0xffffff, 1, 10000 );
		this.light.position.set( this.camera.position.x, this.camera.position.y, this.camera.position.z );
		this.scene.add( this.light );

		// root node for detector objects
		this.scene.add( this.detector );

		// root node for event objects
		this.scene.add( this.event );

		// root node for axes
		this.scene.add( this.axes );

		// RENDERER setup
		this.renderer = new THREE.WebGLRenderer({ antialias: true,  preserveDrawingBuffer: true, alpha: true,
								logarithmicDepthBuffer: false, canvas: canvas[0] });
		this.renderer.localClippingEnabled = true;
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( canvas.innerWidth(), canvas.innerHeight() );

		// VOLUME scanner setup
		canvas[0].addEventListener( 'mouseup', this.onCanvasMouseUp.bind(this), false );

		// LOG setup
		$('#edisplay .ui-content').append('<div id="log_window" style="display: none; position: absolute; top: 3px; left: 0; background-color: rgba(0,0,0,0.5); color: #FFFFFF; z-index: 100; padding: 10px;"><h3 style="margin: 0; padding: 0;">Logs</h3><ul style="list-style-type: none; margin: 0; padding: 0;"></ul></div>');

		$('#edisplay .ui-content').append('<div id="event_collection_nav" style="text-align: center; background-color: #FFF; border-radius: 3px; border: 1px solid #CCC; padding: 5px; padding-right: 30px;"><input id="event_collection_current" type="text" value="" style="margin-bottom: 5px; width: 94%;"/><br /><button id="event_collection_prev">&lt;PREV</button><input type="hidden" id="event_collection_prev_val" value="" /><button id="event_collection_play" style="font-weight: bold;">PLAY&nbsp;</button><button id="event_collection_pause" style="display: none; font-weight: bold;">PAUSE</button><input type="hidden" id="event_collection_next_val" value=""><button id="event_collection_next">NEXT&gt;</button><br/><div id="event_collection_info" style="background-color: #FFF; width: 100%;"></div><div id="event_collection_slide" style="position: absolute; top: 0; right: 0; width: 28px; height: 100%; background-color: #348098;">&nbsp;</div></div>');

		$('#event_collection_prev').off('click').on('click', async ( e ) => {
			e.preventDefault();
			await this.show_event_collection( $('#event_collection_prev_val').val() );
			this.render();
		});
		$('#event_collection_next').off('click').on('click', async ( e ) => {
			e.preventDefault();
			await this.show_event_collection( $('#event_collection_next_val').val() );
			this.render();
		});
		$('#event_collection_current').off('keypress').on( 'keypress', async ( e ) => {
			if ( e.which === 13 ) {
				e.preventDefault();
				await this.show_event_collection( $('#event_collection_current').val() );
				this.render();
			}
		});
		$('#event_collection_pause').off('click').on('click', ( e ) => {
			e.preventDefault();
			$('#event_collection_pause').hide(0);
			$('#event_collection_play').show(0);
			if ( this.is_event_collection_playing ) {
				clearInterval( this.is_event_collection_playing );
			}
			this.is_event_collection_playing = false;
		});
		$('#event_collection_play').off('click').on('click', ( e ) => {
			e.preventDefault();
			$('#event_collection_play').hide(0);
			$('#event_collection_pause').show(0);
			this.is_event_collection_playing = setInterval( () => {
				$('#event_collection_next').click();
			}, 3000 );
		});

		$('#event_collection_slide').off('click').on('click', ( e ) => {
			e.preventDefault();
			let m = parseInt( $('#event_collection_nav').css('margin-left') );
			if ( m === 0 ) {
				let w = $('#event_collection_nav').outerWidth() - 28;
				$('#event_collection_nav').css({ 'margin-left': '-' + w + 'px' });
			} else {
				$('#event_collection_nav').css({ 'margin-left': '0px' });
			}
		});
	}

	onCanvasMouseUp( e ) {
		//let canvas = $( '#' + this.parameters.canvas_id )[0];
		this.mouse.x =   ( e.layerX / this.renderer.domElement.clientWidth  ) * 2 - 1;
		this.mouse.y = - ( e.layerY / this.renderer.domElement.clientHeight ) * 2 + 1;
		this.raycaster.setFromCamera( this.mouse, this.camera );
		let intersects = this.raycaster.intersectObject( this.GDMLimporter.group, true );
		if ( intersects && intersects.length ) {
			// filter out clipped objects
			for ( let i = intersects.length - 1; i >= 0; i-- ) {
				let p = intersects[i].point, planes = intersects[i].object.material.clippingPlanes, clipped = true;
				if ( !planes || !planes.length ) { continue; }
				for( let j = 0, jlen = planes.length; j < jlen; j++ ) {
					if ( planes[ j ].distanceToPoint( p ) > 0 ) {
						clipped = false;
						break;
					}
				}
				if ( clipped ) {
					intersects.splice(i, 1);
				}
			}

			// add to log window
			if ( intersects && intersects.length > 0 ) {
				let o = intersects[0];
				this.log( o.object.__name_path + ', xyz: ' + Math.floor(o.point.x) + ', ' +
							Math.floor(o.point.y) + ', ' + Math.floor(o.point.z) );
			}
		}
	}

	add_event() {
		this.remove_event();
		let event = this.EVENTimporter.get_event();
		this.event.add( event );
	}

	remove_event() {
		this.clear_container( this.event );
	}

	async add_detector() {
		this.remove_detector();
		console.log('--- getting placed volumes ---');
		let tree = await this.GDMLimporter.getPlacedVolumes();
		this.detector.add( tree );
		this.bbox = this.get_bounding_box( this.detector );
		if ( this.settings.VisAxes ) {
			this.add_axes();
		}
	}

	remove_detector() {
		this.clear_container( this.detector );
		this.bbox = { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
	}

	add_axes() {
		this.remove_axes();

		// bbox and arrows via lines
		let geometry = new THREE.Geometry(),
            colors = [], vertices = [], color, b = this.bbox,
			tk1 = Math.min( ( b.max.x - b.min.x ) / 50, ( b.max.y - b.min.y ) / 50,  ( b.max.z - b.min.z ) / 50 ), // major ticks
			tk2 = tk1 / 2, // minor ticks
			tick_text;


		if ( this.settings.showArrows ) {
			// arrows

			vertices.push(
				new THREE.Vector3( b.min.x - 4*tk1, 0, 0 ),
				new THREE.Vector3( b.max.x + 4*tk1, 0, 0 ),

				new THREE.Vector3( b.min.x, 2*tk1, 0 ),
				new THREE.Vector3( b.min.x - 4*tk1, 0, 0 ),
				new THREE.Vector3( b.min.x, -2*tk1, 0 ),
				new THREE.Vector3( b.min.x - 4*tk1, 0, 0 ),
				new THREE.Vector3( b.max.x, 2*tk1, 0 ),
				new THREE.Vector3( b.max.x + 4*tk1, 0, 0 ),
				new THREE.Vector3( b.max.x, -2*tk1, 0 ),
				new THREE.Vector3( b.max.x + 4*tk1, 0, 0 ),

				new THREE.Vector3( 0, b.min.y - 4*tk1, 0 ),
				new THREE.Vector3( 0, b.max.y + 4*tk1, 0 ),

				new THREE.Vector3( 2*tk1, b.min.y, 2*tk1 ),
				new THREE.Vector3( 0, b.min.y - 4*tk1, 0 ),
				new THREE.Vector3( -2*tk1, b.min.y, -2*tk1 ),
				new THREE.Vector3( 0, b.min.y - 4*tk1, 0 ),
				new THREE.Vector3( 2*tk1, b.max.y, 2*tk1 ),
				new THREE.Vector3( 0, b.max.y + 4*tk1, 0 ),
				new THREE.Vector3( -2*tk1, b.max.y, -2*tk1 ),
				new THREE.Vector3( 0, b.max.y + 4*tk1, 0 ),

				new THREE.Vector3( 0, 0, b.min.z - 4*tk1 ),
				new THREE.Vector3( 0, 0, b.max.z + 4*tk1 ),

				new THREE.Vector3( 0, 0, b.min.z - 4*tk1 ),
				new THREE.Vector3( 0, 2*tk1, b.min.z ),
				new THREE.Vector3( 0, 0, b.min.z - 4*tk1 ),
				new THREE.Vector3( 0, -2*tk1, b.min.z ),
				new THREE.Vector3( 0, 0, b.max.z + 4*tk1 ),
				new THREE.Vector3( 0, 2*tk1, b.max.z ),
				new THREE.Vector3( 0, 0, b.max.z + 4*tk1 ),
				new THREE.Vector3( 0, -2*tk1, b.max.z ),
			);

			color = new THREE.Color( 0xff0000 );
			colors.push( color, color, color, color, color, color, color, color, color, color );
			color = new THREE.Color( 0x00ff00 );
			colors.push( color, color, color, color, color, color, color, color, color, color );
			color = new THREE.Color( 0x0000ff );
			colors.push( color, color, color, color, color, color, color, color, color, color );

			tick_text = this.create_text_mesh( Math.floor(b.max.x), { size: tk1 } );
			tick_text.position.set(  b.max.x + 6 * tk1, 0, 0 );
			this.axes.add( tick_text );
			tick_text = this.create_text_mesh( Math.floor(b.min.x), { size: tk1 } );
			tick_text.position.set(  b.min.x - 6 * tk1, 0, 0 );
			this.axes.add( tick_text );

			tick_text = this.create_text_mesh( Math.floor(b.max.y), { size: tk1 } );
			tick_text.position.set(  0, b.max.y + 6 * tk1, 0 );
			this.axes.add( tick_text );
			tick_text = this.create_text_mesh( Math.floor(b.min.y), { size: tk1 } );
			tick_text.position.set(  0, b.min.y - 6 * tk1, 0 );
			this.axes.add( tick_text );

			tick_text = this.create_text_mesh( Math.floor(b.max.z), { size: tk1 } );
			tick_text.position.set(  0, 0, b.max.z + 6 * tk1 );
			tick_text.rotation.set( 0, Math.PI/2, 0 );
			this.axes.add( tick_text );
			tick_text = this.create_text_mesh( Math.floor(b.min.z), { size: tk1 } );
			tick_text.position.set(  0, 0, b.min.z - 6 * tk1 );
			tick_text.rotation.set( 0, -Math.PI/2, 0 );
			this.axes.add( tick_text );

		}

		if ( this.settings.showBbox ) {
			// bbox

			let tx = Math.floor( b.max.x - b.min.x ),
				ty = Math.floor( b.max.y - b.min.y ),
				tz = Math.floor( b.max.z - b.min.z ),
				ix = this.calculate_axis_interval( tx ),
				iy = this.calculate_axis_interval( ty ),
				iz = this.calculate_axis_interval( tz ),
				ix4 = ix / 4,
				iy4 = iy / 4,
				iz4 = iz / 4;

			// box: X-axis
			vertices.push(
				new THREE.Vector3( b.min.x, b.min.y, b.min.z ),
				new THREE.Vector3( b.max.x, b.min.y, b.min.z ),
				new THREE.Vector3( b.min.x, b.max.y, b.min.z ),
				new THREE.Vector3( b.max.x, b.max.y, b.min.z ),
				new THREE.Vector3( b.min.x, b.min.y, b.max.z ),
				new THREE.Vector3( b.max.x, b.min.y, b.max.z ),
				new THREE.Vector3( b.min.x, b.max.y, b.max.z ),
				new THREE.Vector3( b.max.x, b.max.y, b.max.z )
			);
			color = new THREE.Color( 0xff0000 );
			colors.push( color, color, color, color, color, color, color, color );

			// X-ticks
			for ( let i = Math.ceil( b.min.x / ix ); i <= Math.floor( b.max.x / ix ); i++ ) {
				vertices.push(
					new THREE.Vector3( i * ix, b.min.y - tk1, b.min.z - tk1 ),
					new THREE.Vector3( i * ix, b.min.y, b.min.z ),
					new THREE.Vector3( i * ix, b.min.y - tk1, b.max.z + tk1 ),
					new THREE.Vector3( i * ix, b.min.y, b.max.z )
				);
				colors.push( color, color, color, color );

				tick_text = this.create_text_mesh( i * ix, { size: tk1 } );
				tick_text.position.set(  i * ix, b.min.y - tk1 - tk2, b.max.z + tk1 + tk2 );
				this.axes.add( tick_text );

				tick_text = this.create_text_mesh( i * ix, { size: tk1 } );
				tick_text.position.set(  i * ix, b.min.y - tk1 - tk2, b.min.z - tk1 - tk2 );
				tick_text.rotation.set( 0, Math.PI, 0 );
				this.axes.add( tick_text );

				if ( i < Math.floor( b.max.x / ix ) ) {
					for ( let j = 1; j < 4; j++ ) {
						vertices.push(
							new THREE.Vector3( i * ix + j * ix4, b.min.y - tk2, b.min.z - tk2 ),
							new THREE.Vector3( i * ix + j * ix4, b.min.y, b.min.z ),
							new THREE.Vector3( i * ix + j * ix4, b.min.y - tk2, b.max.z + tk2 ),
							new THREE.Vector3( i * ix + j * ix4, b.min.y, b.max.z )
						);
						colors.push( color, color, color, color );
					}
				}
			}

			// box: Y-axis
			vertices.push(
				new THREE.Vector3( b.min.x, b.min.y, b.min.z ),
				new THREE.Vector3( b.min.x, b.max.y, b.min.z ),
				new THREE.Vector3( b.max.x, b.min.y, b.min.z ),
				new THREE.Vector3( b.max.x, b.max.y, b.min.z ),
				new THREE.Vector3( b.min.x, b.min.y, b.max.z ),
				new THREE.Vector3( b.min.x, b.max.y, b.max.z ),
				new THREE.Vector3( b.max.x, b.min.y, b.max.z ),
				new THREE.Vector3( b.max.x, b.max.y, b.max.z )
			);
			color = new THREE.Color( 0x00ff00 );
			colors.push( color, color, color, color, color, color, color, color );

			// Y-ticks
			for ( let i = Math.ceil( b.min.y / iy ); i <= Math.floor( b.max.y / iy ); i++ ) {
				vertices.push(
					new THREE.Vector3( b.max.x + tk1, i * iy, b.min.z - tk1 ),
					new THREE.Vector3( b.max.x, i * iy, b.min.z ),
					new THREE.Vector3( b.min.x - tk1, i * iy, b.max.z + tk1 ),
					new THREE.Vector3( b.min.x, i * iy, b.max.z )
				);
				colors.push( color, color, color, color );

				tick_text = this.create_text_mesh( i * iy, { size: tk1 } );
				tick_text.position.set( b.max.x + tk1 + 2*tk2, i * iy, b.min.z - tk1 - 2*tk2);
				tick_text.rotation.set( 0, Math.PI/4 + Math.PI, 0 );
				this.axes.add( tick_text );

				tick_text = this.create_text_mesh( i * iy, { size: tk1 } );
				tick_text.position.set( b.min.x - tk1 - 2*tk2, i * iy, b.max.z + tk1 + 2*tk2 );
				tick_text.rotation.set( 0, Math.PI/4, 0 );
				this.axes.add( tick_text );

				if ( i < Math.floor( b.max.y / iy ) ) {
					for ( let j = 1; j < 4; j++ ) {
						vertices.push(
							new THREE.Vector3( b.max.x + tk2, i * iy + j * iy4, b.min.z - tk2 ),
							new THREE.Vector3( b.max.x, i * iy + j * iy4, b.min.z ),
							new THREE.Vector3( b.min.x - tk2, i * iy + j * iy4, b.max.z + tk2 ),
							new THREE.Vector3( b.min.x, i * iy + j * iy4, b.max.z )
						);
						colors.push( color, color, color, color );
					}
				}
			}

			// box: Z-axis
			vertices.push(
				new THREE.Vector3( b.min.x, b.min.y, b.min.z ),
				new THREE.Vector3( b.min.x, b.min.y, b.max.z ),
				new THREE.Vector3( b.max.x, b.min.y, b.min.z ),
				new THREE.Vector3( b.max.x, b.min.y, b.max.z ),
				new THREE.Vector3( b.min.x, b.max.y, b.min.z ),
				new THREE.Vector3( b.min.x, b.max.y, b.max.z ),
				new THREE.Vector3( b.max.x, b.max.y, b.min.z ),
				new THREE.Vector3( b.max.x, b.max.y, b.max.z )
			);
			color = new THREE.Color( 0x0000ff );
			colors.push( color, color, color, color, color, color, color, color );

			// Z-ticks
			for ( let i = Math.ceil( b.min.z / iz ); i <= Math.floor( b.max.z / iz ); i++ ) {
				vertices.push(
					new THREE.Vector3( b.min.x - tk1, b.min.y - tk1, i * iz ),
					new THREE.Vector3( b.min.x, b.min.y, i * iz),
					new THREE.Vector3( b.max.x + tk1, b.min.y - tk1, i * iz ),
					new THREE.Vector3( b.max.x, b.min.y, i * iz )
				);
				colors.push( color, color, color, color );

				tick_text = this.create_text_mesh( i * iz, { size: tk1 } );
				tick_text.position.set( b.max.x + tk1 + tk2, b.min.y - tk1 - tk2, i * iz );
				tick_text.rotation.set( 0, Math.PI/2, 0 );
				this.axes.add( tick_text );

				tick_text = this.create_text_mesh( i * iz, { size: tk1 } );
				tick_text.position.set( b.min.x - tk1 - tk2, b.min.y - tk1 - tk2, i * iz );
				tick_text.rotation.set( 0, -Math.PI/2, 0 );
				this.axes.add( tick_text );

				if ( i < Math.floor( b.max.z / iz ) ) {
					for ( let j = 1; j < 4; j++ ) {
						vertices.push(
							new THREE.Vector3( b.min.x - tk2, b.min.y - tk2, i * iz + j * iz4 ),
							new THREE.Vector3( b.min.x, b.min.y, i * iz + j * iz4 ),
							new THREE.Vector3( b.max.x + tk2, b.min.y - tk2, i * iz + j * iz4 ),
							new THREE.Vector3( b.max.x, b.min.y, i * iz + j * iz4 )
						);
						colors.push( color, color, color, color );
					}
				}
			}

		}

		geometry.vertices.push( ...vertices );
		geometry.colors.push( ...colors );
		if ( geometry.vertices.length > 0 && geometry.colors.length > 0 ) {
			this.axes.add( new THREE.LineSegments( geometry, this.materials.lines ) );
		}
	}

	remove_axes() {
		this.clear_container( this.axes );
	}

	get_bounding_box( tree ) {
		return new THREE.Box3().setFromObject( tree );
	}

	set_camera( type ) {
		if ( this.controls ) {
			this.controls.removeEventListener( 'change', this.render.bind(this), true );
		}
		let canvas = $( '#' + this.parameters.canvas_id );
		let w = canvas.innerWidth(), h = canvas.innerHeight();
		if ( type && type == 'ortho' ) {
			this.camera = this.camera_ortho;
			this.camera.left = -w;
			this.camera.right = w;
			this.camera.top = h;
			this.camera.bottom = -h;
		} else { // perspective
			this.camera = this.camera_perspective;
			this.camera.aspect = w / h;
		}
		this.camera.updateProjectionMatrix();
        this.reset_camera();
        this.controls = new OrbitControls( this.camera, canvas[0] );
        this.controls.addEventListener( 'change', this.render.bind(this), true );
	}

	reset_camera() {
		if ( this.detector.children.length > 0 ) {
			this.bbox = this.get_bounding_box( this.detector );
			this.camera.position.x = this.bbox.max.x * 3;
			this.camera.position.y = this.bbox.max.y * 3;
			this.camera.position.z = this.bbox.max.z * 3;
		} else {
			this.camera.position.x = 1500;
			this.camera.position.y = 1500;
			this.camera.position.z = 1500;
		}
		this.camera.up.set( 0, 1, 0 );
		this.camera.lookAt( new THREE.Vector3(0,0,0) );
	}

	async load_font() {
		let loader = new THREE.FontLoader();
		return new Promise(( resolve ) => {
			loader.load( 'fonts/helvetiker_regular.typeface.json', ( font ) => {
				this.fonts['helvetiker'] = font;
				resolve();
			});
		});
	}

	async set_event_collection( url ) {
		if ( this.callbacks.onStart ) { this.callbacks.onStart(); }
        return new Promise((resolve, reject) => {
            this.event_collection = false;
			this.event_collection_idx = false;
            let loader = new THREE.FileLoader();
            loader.crossOrigin = 'anonymous';
            loader.setPath( this.path );
            loader.load( url, ( text ) => {
                    if ( this.callbacks.onFinish ) { this.callbacks.onFinish(); }
                    // onload
					let tmp = url.split('/');
					tmp.pop();
                    this.event_collection = {
						"events": text.split("\n"),
						"url": tmp.join('/'),
						"idx": 0
					};
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

	async clear_event_collection() {
		this.event_collection = false;
	}

	async show_event_collection( event_file = false ) {
		if ( !this.event_collection ) { return false; }
		$('#event_collection_nav').css({ 'display': 'block' });
		let idx = event_file !== false ? this.event_collection.events.indexOf( event_file ) : 0,
			idx_prev, idx_next;
		if ( idx < 0 ) { idx = 0; }
		idx_prev = idx - 1;
		if ( idx_prev < 0 ) { idx_prev = this.event_collection.events.length - 1; }
		idx_next = idx + 1;
		if ( idx_next >= this.event_collection.events.length ) { idx_next = 0; }

		$('#event_collection_prev_val').val( this.event_collection.events[ idx_prev ] );
		$('#event_collection_current').val( this.event_collection.events[ idx ] );
		$('#event_collection_next_val').val( this.event_collection.events[ idx_next ] );

		// load event from the collection, display
		await this.load_event_as_file( this.event_collection.url + '/' + this.event_collection.events[idx] );
		this.add_event();
		if ( this.EVENTimporter.evt ) {
			let desc = [];
			if ( this.EVENTimporter.evt.EVENT.runid ) {
				desc.push( 'Run: ' + this.EVENTimporter.evt.EVENT.runid );
			}
			if ( this.EVENTimporter.evt.EVENT.time ) {
				desc.push( 'Time: ' + moment.unix( this.EVENTimporter.evt.EVENT.time ).format('YYYY-MM-DD HH:mm:ss T') );
			}
			if ( desc.length > 0 ) { 
				$('#event_collection_info').html('<input style="width:100%;font-weight:bold;" type="text" value="' + desc.join('; ') + '" />' );
			} else {
				$('#event_collection_info').empty();
			}
		} else {
			$('#event_collection_info').empty();
		}
	}

	async hide_event_collection() {
		$('#event_collection_nav').css({ 'display': 'none' });
	}

	async load_gdml_as_file( url ) {
		await this.GDMLimporter.load( url );
		return await this.GDMLimporter.parse();
	}

	async load_gdml_as_text( text ) {
		return await this.GDMLimporter.parse( text );
	}

	async load_gdml_as_uploadfile( file ) {
		let txt = await this.load_upload_file( file );
		return await this.load_gdml_as_text( txt );
	}

	async load_event_as_file( url ) {
		await this.EVENTimporter.load( url );
		return await this.EVENTimporter.parse();
	}

	async load_event_as_text( text ) {
		return await this.EVENTimporter.parse( text );
	}

	async load_event_as_uploadfile( file ) {
		let txt = await this.load_upload_file( file );
		return await this.load_event_as_text( txt );
	}

	async load_upload_file( file ) {
		return new Promise( ( resolve ) => {
			let reader = new FileReader();
			reader.onload = function (evt) {
				resolve( evt.target.result );
			}
			reader.readAsText(file, "UTF-8");
		});
	}

	set_rotation( rot = '0' ) {
		this.is_rotating = rot;
	}

	animate() {
		if ( !this.is_running ) { return }
		requestAnimationFrame( this.animate.bind(this) );
		if ( this.is_rotating === '0' ) {
			this.controls.update();
		} else {
			let posx = this.camera.position.x, posy = this.camera.position.y, posz = this.camera.position.z;
			let theta, alpha;
			switch( this.is_rotating ) {
				case '1':
					// around y => plane x-z
					alpha = Math.atan2( posz, posx );
					if ( alpha > ( Math.PI / 2 ) || alpha < ( -Math.PI / 2 ) ) { this.rotation_theta *= -1; }
					theta = this.rotation_theta;
					this.camera.position.x =  posx * Math.cos( theta ) + posz * Math.sin( theta );
					this.camera.position.z = -posx * Math.sin( theta ) + posz * Math.cos( theta );
					break;
				case '2':
					// around x => plane y-z
					alpha = Math.atan2( posz, posy );
					if ( alpha > Math.PI || alpha < -Math.PI ) { this.rotation_theta *= -1; }
					theta = this.rotation_theta;
					this.camera.position.y =  posy * Math.cos( theta ) + posz * Math.sin( theta );
					this.camera.position.z = -posy * Math.sin( theta ) + posz * Math.cos( theta );
					break;
				case '3':
					// around z => plane x-y
					alpha = Math.atan2( posy, posx );
					if ( alpha > Math.PI || alpha < -Math.PI ) { this.rotation_theta *= -1; }
					theta = this.rotation_theta;
					this.camera.position.x =  posx * Math.cos( theta ) + posy * Math.sin( theta );
					this.camera.position.y = -posx * Math.sin( theta ) + posy * Math.cos( theta );
					break;
				default:
					break;
			}
			this.camera.lookAt( new THREE.Vector3(0,0,0) );
			this.render();
		}
	}

	render() {
		this.light.position.set( this.camera.position.x, this.camera.position.y, this.camera.position.z );
		this.renderer.render( this.scene, this.camera );
	}

    get_query_params(qs = document.location.search ) {
        qs = qs.split('+').join(' ');
        var params = {},
            tokens,
            re = /[?&]?([^=]+)=([^&]*)/g;

		let val;
        while ( tokens = re.exec(qs) ) { // eslint-disable-line no-cond-assign
			val = decodeURIComponent(tokens[2]);
			if ( val === 'true' ) { val = true; }
			else if ( val === 'false' ) { val = false; }
            params[decodeURIComponent(tokens[1])] = val;
        }
        return params;
    }

	add_helper( a ) {
		let helper = new THREE.VertexNormalsHelper( a, 2, 0x00ff00, 1 );
		a.add( helper );
		helper = new THREE.FaceNormalsHelper( a, 2, 0x0000ff, 1 );
		a.add( helper );
	}

	clear_container( container ) {
		for ( var i = container.children.length - 1; i >= 0; i-- ) {
			var obj = container.children[i];
			container.remove( container.children[i] );
			if ( obj.geometry && obj.geometry.dispose ) {
				obj.geometry.dispose();
			}
			if ( obj.material && obj.material.dispose ) {
				obj.material.dispose();
			}
		}
	}

    delay(ms) {
        var ctr, rej, p = new Promise(function (resolve, reject) {
            ctr = setTimeout(resolve, ms);
            rej = reject;
        });
        p.cancel = function(){ clearTimeout(ctr); rej(Error("Cancelled"))};
        return p;
    }

	calculate_axis_interval( range ) {
		let x = Math.pow( 10.0, Math.floor( Math.log10( range ) ) );
		if ( ( range / x ) >= 5 ) {
			return x;
		} else if ( ( range / (x / 2.0) ) >= 5 ) {
			return x / 2.0;
		}
		return x / 5.0;
	}

	create_text_mesh( text, options = {} ) {
		if ( text === undefined ) { console.log('ERROR - no text provided as input'); return; }
		if ( typeof text !== 'string' ) { text = text.toString(); }
		var g = new THREE.TextGeometry( text, {
			color:		options.color	|| 0xffffff,
			font:		options.font	|| this.fonts['helvetiker'],
			weight:		options.weight	|| 'normal',
			size:		options.size	|| 16,
			height:		options.height	|| 1,
			bevelThickness: options.bevelThickness	|| 1,
			bevelSize:		options.bevelSize		|| 1,
			bevelEnabled:	options.bevelEnabled	|| false,
			curveSegments:	options.curveSegments	|| 8
		});
		g.center();
		return new THREE.Mesh( g, options.material || new THREE.MeshBasicMaterial({ color: 0xffffff }) );
	}

	// adds message to the log window
	log( data ) {
		$('#log_window ul').append('<li>' + ( Date.now() / 1000 | 0 ) + ': ' + data + '</li>');
		if ( $('#log_window ul').children('li').length > 5 ) {
			$('#log_window ul li').first().remove();
		}
	}

}

export default Display;
