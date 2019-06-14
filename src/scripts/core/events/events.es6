
// Three.js
import * as THREE from 'three';

// Physics Geometry Library
import PHYS from '../shapes/PHYS';
import HEP from './hep';

import pako from 'pako';

export default class Events {

    constructor() {
        // container for settings
        this.settings = {};

		this.text = false; // raw event as text
		this.evt = false;  // parsed event as js object

        // progress callbacks
        this.callbacks = {
            onStart: false,     // no parameters
            onProgress: false,  // ( "text", percentage 1..100 )
            onFinish: false     // no parameters
        };

        // primary container for event objects
        this.group = new THREE.Group();

		// hits placeholder
		this.hits = new THREE.Group();
		this.group.add( this.hits );

		// tracks placeholder
		this.tracks = new THREE.Group();
		this.group.add( this.tracks );

		this.materials = {};
		this.materials.lines = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 1, linewidth: 1,
																vertexColors: THREE.VertexColors });
		this.materials_extra = {};

		this.track_color_theme = 'blue';

		this.cuts = {
			tracks: {
				enabled: false,
				preserve: false,
				pt:  { min: false, max: false, cmin: false, cmax: false, mode: true },	// autodetect min/max; mode: inc/exc
				p:   { min: false, max: false, cmin: false, cmax: false, mode: true },	// autodetect min/max; mode: inc/exc
				eta: { min: false, max: false, cmin: false, cmax: false, mode: true },	// autodetect min, max; mode: include / exclude
				phi: { min: false, max: false, cmin: false, cmax: false, mode: true },	// radian, autodetect min, max; mode: include / exclude
				charge: 0 // [ 0: 'all', -1: 'neg', 1: 'pos' ]
			},
			hits: {
				enabled: false,
				preserve: false,
				e: { min: false, max: false, cmin: false, cmax: false, mode: true },	// energy
				eta: { min: false, max: false, cmin: false, cmax: false, mode: true },	// autodetect min/max; mode: include/exclude
				phi: { min: false, max: false, cmin: false, cmax: false, mode: true },	// autodetect min/max; mode: include/exclude
				r: { min: 0, max: false, cmin: false, cmax: false, mode: true },		// autodetect max; mode: include/exclude
				z: { min: false, max: false, cmin: false, cmax: false, mode: true }		// autodetect min/max; mode: include/exclude range
			}
		};

		// known hit types:
		this.hitTypes = {
			"3D": {
				"size": 3, 			// default size
				"color": 0xffffff	// default color
			},
			"PROJECTIVE": {
				"deta": 0.025, // default deta/dphi cone
				"dphi": 0.025,
				"color": 0xffffff
			},
			"BOX": {
				"dx": 5,
				"dy": 5,
				"dz": 5,
				"color": 0xffffff,
				"axis": "+z",
				"scaleminmax": true
			}
		};
	}

    set cbOnStart( val )    { this.callbacks.onStart = val;     }
    set cbOnProgress( val ) { this.callbacks.onProgress = val;  }
    set cbOnFinish( val )   { this.callbacks.onFinish = val;    }

    async load( url ) {
        if ( this.callbacks.onStart ) { this.callbacks.onStart(); }
        return new Promise((resolve, reject) => {
            this.text = false;
            let loader = new THREE.FileLoader();
			if ( url.endsWith('.json.gz') ) {
				loader.setResponseType('arraybuffer');
			}
            loader.crossOrigin = 'anonymous';
            loader.setPath( this.path );
            loader.load( url, ( text ) => {
                    if ( this.callbacks.onFinish ) { this.callbacks.onFinish(); }
                    // onload
					if ( url.endsWith('.json.gz') ) {
						this.text = pako.inflate( text, { to: 'string' } );
					} else if ( url.endsWith('.json') ) {
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

	get_event() {
		return this.group;
	}

    clear_container( container ) {
        for ( var i = container.children.length - 1; i >= 0; i-- ) {
            container.remove( container.children[i] );
        }
    }

	parse( text = this.text ) {
		this.evt = JSON.parse( text );

		this.parse_tracks_cuts( this.evt );
		this.parse_hits_cuts( this.evt );

		this.parse_hits( this.evt );
		this.parse_tracks( this.evt );
		return this.group;
	}

	parse_tracks_cuts( evt ) {
		let minp = false, minpt = false, maxp = false, maxpt = false,
			mineta = false, maxeta = false, minphi = false, maxphi = false,
			tp, tpt, teta, tphi, vec = new HEP.ThreeVector(0,0,0), trk;
		if ( evt.TRACKS ) {
			for ( let i in evt.TRACKS ) {
				for ( let j in evt.TRACKS[i]) {
					trk = evt.TRACKS[i][j];
					if ( trk.pxyz !== undefined ) {
						// track is helix-defined
						vec.set( trk.pxyz[0], trk.pxyz[1], trk.pxyz[2] );
						tp  = vec.mag();
						tpt = vec.perp();
						tphi = vec.phi();
						teta = vec.pseudoRapidity();
						if ( minp   === false ) { minp   = tp;   }
						if ( maxp   === false ) { maxp   = tp;   }
						if ( minpt  === false ) { minpt  = tpt;  }
						if ( maxpt  === false ) { maxpt  = tpt;  }
						if ( mineta === false ) { mineta = teta; }
						if ( maxeta === false ) { maxeta = teta; }
						if ( minphi === false ) { minphi = tphi; }
						if ( maxphi === false ) { maxphi = tphi; }
						if ( tp < minp ) { minp = tp; }
						else if ( tp > maxp ) { maxp = tp; }
						if ( tpt < minpt ) { minpt = tpt; }
						else if ( tpt > maxpt ) { maxpt = tpt; }
						if ( tphi < minphi ) { minphi = tphi; }
						else if ( tphi > maxphi ) { maxphi = tphi; }
						if ( teta < mineta ) { mineta = teta; }
						else if ( teta > maxeta ) { maxeta = teta; }
					} else {
						// not helix-defined, try scalar values if provided
						if ( trk.pt !== undefined ) {
							if ( minpt === false ) { minpt = trk.pt; }
							if ( maxpt === false ) { maxpt = trk.pt; }
							if ( trk.pt < minpt  ) { minpt = trk.pt; }
							else if ( trk.pt > maxpt ) { maxpt = trk.pt; }
						}
						if ( trk.p !== undefined ) { // phi
							if ( minphi === false ) { minphi = trk.p; }
							if ( maxphi === false ) { maxphi = trk.p; }
							if ( trk.p < minphi ) { minphi = trk.p; }
							else if ( trk.p > maxphi ) { maxphi = trk.p; }
						}
						if ( trk.e !== undefined ) { // eta
							if ( mineta === false ) { mineta = trk.e; }
							if ( maxeta === false ) { maxeta = trk.e; }
							if ( trk.e < mineta ) { mineta = trk.e; }
							else if ( trk.e > maxeta ) { maxeta = trk.e; }
						}
						// strawman solution: eta, phi via vector from [0,0,0] to pts[0]
						if ( !trk.e && !trk.p && trk.pts ) {
							vec.set( trk.pts[0][0], trk.pts[0][1], trk.pts[0][2] );
							tphi = vec.phi();
							teta = vec.pseudoRapidity();
							if ( mineta === false ) { mineta = teta; }
							if ( maxeta === false ) { maxeta = teta; }
							if ( minphi === false ) { minphi = tphi; }
							if ( maxphi === false ) { maxphi = tphi; }
							if ( tphi < minphi ) { minphi = tphi; }
							else if ( tphi > maxphi ) { maxphi = tphi; }
							if ( teta < mineta ) { mineta = teta; }
							else if ( teta > maxeta ) { maxeta = teta; }
						}
					}
				}
			}
		} // if ( evt.TRACKS )

		// done, fill in params
		if ( minp !== false && maxp !== false && minp <= maxp ) {
			this.cuts.tracks.p.min = minp;
			this.cuts.tracks.p.max = maxp;
			if ( !this.cuts.tracks.preserve ) {
				this.cuts.tracks.p.cmin = minp;
				this.cuts.tracks.p.cmax = maxp;
			}
		}
		if ( minpt !== false && maxpt !== false && minpt <= maxpt ) {
			this.cuts.tracks.pt.min = minpt;
			this.cuts.tracks.pt.max = maxpt;
			if ( !this.cuts.tracks.preserve ) {
				this.cuts.tracks.pt.cmin = minpt;
				this.cuts.tracks.pt.cmax = maxpt;
			}
		}
		if ( mineta !== false && maxeta !== false && mineta < maxeta ) {
			this.cuts.tracks.eta.min = mineta;
			this.cuts.tracks.eta.max = maxeta;
			if ( !this.cuts.tracks.preserve ) {
				this.cuts.tracks.eta.cmin = mineta;
				this.cuts.tracks.eta.cmax = maxeta;
			}
		}
		if ( minphi !== false && maxphi !== false && minphi < maxphi ) {
			this.cuts.tracks.phi.min = minphi;
			this.cuts.tracks.phi.max = maxphi;
			if ( !this.cuts.tracks.preserve ) {
				this.cuts.tracks.phi.cmin = minphi;
				this.cuts.tracks.phi.cmax = maxphi;
			}
		}
		this.cuts.tracks.enabled = true; // FIXME:
	}

	parse_hits_cuts( evt ) {
		let mine = false, maxe = false,
			mineta = false, maxeta = false,
			minphi = false, maxphi = false,
			minz = false, maxz = false,
			minr = false, maxr = false,
			teta, tphi, tr,
			vec = new HEP.ThreeVector(0,0,0), hit;
		if ( evt.HITS ) {
			for ( let i in evt.HITS ) {
				for ( let j in evt.HITS[i]) {
					hit = evt.HITS[i][j];
					if ( hit.e !== undefined ) {
						hit.e = parseFloat( hit.e );
						if ( mine === false ) { mine = hit.e; }
						if ( maxe === false ) { maxe = hit.e; }
						if ( hit.e < mine ) { mine = hit.e; }
						if ( hit.e > maxe ) { maxe = hit.e; }
					}
					if ( hit.eta !== undefined ) {
						hit.eta = parseFloat( hit.eta );
						if ( mineta === false ) { mineta = hit.eta; }
						if ( maxeta === false ) { maxeta = hit.eta; }
						if ( hit.eta < mineta ) { mineta = hit.eta; }
						if ( hit.eta > maxeta ) { maxeta = hit.eta; }
					}
					if ( hit.phi !== undefined ) {
						hit.phi = parseFloat( hit.phi );
						if ( minphi === false ) { minphi = hit.phi; }
						if ( maxphi === false ) { maxphi = hit.phi; }
						if ( hit.phi < minphi ) { minphi = hit.phi; }
						if ( hit.phi > maxphi ) { maxphi = hit.phi; }
					}
					if ( hit.x !== undefined && hit.y !== undefined && hit.z !== undefined ) {
						hit.x = parseFloat( hit.x );
						hit.y = parseFloat( hit.y );
						hit.z = parseFloat( hit.z );
						vec.set( hit.x, hit.y, hit.z );
						tr = vec.perp();
						tphi = vec.phi();
						teta = vec.pseudoRapidity();

						if ( mineta === false ) { mineta = teta; }
						if ( maxeta === false ) { maxeta = teta; }
						if ( teta < mineta ) { mineta = teta; }
						if ( teta > maxeta ) { maxeta = teta; }

						if ( minphi === false ) { minphi = tphi; }
						if ( maxphi === false ) { maxphi = tphi; }
						if ( tphi < minphi ) { minphi = tphi; }
						if ( tphi > maxphi ) { maxphi = tphi; }

						if ( minz === false ) { minz = hit.z; }
						if ( maxz === false ) { maxz = hit.z; }
						if ( hit.z < minz ) { minz = hit.z; }
						if ( hit.z > maxz ) { maxz = hit.z; }

						if ( minr === false ) { minr = tr; }
						if ( maxr === false ) { maxr = tr; }
						if ( tr < minr ) { minr = tr; }
						if ( tr > maxr ) { maxr = tr; }
					}
				}
			}
		} // if ( evt.HITS )
		// done, fill in params
		if ( mine !== false && maxe !== false && mine <= maxe ) {
			this.cuts.hits.e.min = mine;
			this.cuts.hits.e.max = maxe;
			if ( !this.cuts.hits.preserve ) {
				this.cuts.hits.e.cmin = mine;
				this.cuts.hits.e.cmax = maxe;
			}
		}
		if ( mineta !== false && maxeta !== false && mineta < maxeta ) {
			this.cuts.hits.eta.min = mineta;
			this.cuts.hits.eta.max = maxeta;
			if ( !this.cuts.hits.preserve ) {
				this.cuts.hits.eta.cmin = mineta;
				this.cuts.hits.eta.cmax = maxeta;
			}
		}
		if ( minphi !== false && maxphi !== false && minphi < maxphi ) {
			this.cuts.hits.phi.min = minphi;
			this.cuts.hits.phi.max = maxphi;
			if ( !this.cuts.hits.preserve ) {
				this.cuts.hits.phi.cmin = minphi;
				this.cuts.hits.phi.cmax = maxphi;
			}
		}
		if ( minr !== false && maxr !== false && minr < maxr ) {
			this.cuts.hits.r.min = minr;
			this.cuts.hits.r.max = maxr;
			if ( !this.cuts.hits.preserve ) {
				this.cuts.hits.r.cmin = minr;
				this.cuts.hits.r.cmax = maxr;
			}
		}
		if ( minz !== false && maxz !== false && minz < maxz ) {
			this.cuts.hits.z.min = minz;
			this.cuts.hits.z.max = maxz;
			if ( !this.cuts.hits.preserve ) {
				this.cuts.hits.z.cmin = minz;
				this.cuts.hits.z.cmax = maxz;
			}
		}

		this.cuts.hits.enabled = true;
	}

	check_hit_cuts( hit ) {
		let vec = new HEP.ThreeVector(0,0,0), teta, tphi;
		if ( hit.e !== undefined ) {
			if ( hit.e < this.cuts.hits.e.cmin ) { return false; }
			if ( hit.e > this.cuts.hits.e.cmax ) { return false; }
		}
		if ( hit.eta !== undefined ) {
			if ( hit.eta < this.cuts.hits.eta.cmin ) { return false; }
			if ( hit.eta > this.cuts.hits.eta.cmax ) { return false; }
		} else if ( hit.x !== undefined && hit.y !== undefined && hit.z !== undefined ) {
			// convert x, y, z to eta
			vec.set( hit.x, hit.y, hit.z );
            teta = vec.pseudoRapidity();
			if ( teta < this.cuts.hits.eta.cmin ) { return false; }
			if ( teta > this.cuts.hits.eta.cmax ) { return false; }
		}
		if ( hit.phi !== undefined ) {
			if ( hit.phi < this.cuts.hits.phi.cmin ) { return false; }
			if ( hit.phi > this.cuts.hits.phi.cmax ) { return false; }
		} else if ( hit.x !== undefined && hit.y !== undefined && hit.z !== undefined ) {
			// convert x, y, z to phi
			vec.set( hit.x, hit.y, hit.z );
            tphi = vec.phi();
			if ( tphi < this.cuts.hits.phi.cmin ) { return false; }
			if ( tphi > this.cuts.hits.phi.cmax ) { return false; }
		}
		return true;
	}

	check_cuts( p, c ) { // p = HEP.ThreeVector, c: charge
		if ( this.cuts.tracks.p.min !== false &&
			( ( p.mag() < this.cuts.tracks.p.cmin ) || ( p.mag() > this.cuts.tracks.p.cmax ) ) &&
			this.cuts.tracks.p.mode === true
		) { return false; }
		if ( this.cuts.tracks.pt.min !== false &&
			( ( p.perp() < this.cuts.tracks.pt.cmin ) || ( p.perp() > this.cuts.tracks.pt.cmax ) ) &&
			this.cuts.tracks.pt.mode === true
		) {  return false; }
		if ( this.cuts.tracks.eta.min !== false &&
			( ( p.pseudoRapidity() < this.cuts.tracks.eta.cmin ) || ( p.pseudoRapidity() > this.cuts.tracks.eta.cmax ) ) &&
			this.cuts.tracks.eta.mode === true
		) {  return false; }
		if ( this.cuts.tracks.phi.min !== false &&
			( ( p.phi() < this.cuts.tracks.phi.cmin ) || ( p.phi() > this.cuts.tracks.phi.cmax ) ) &&
			this.cuts.tracks.phi.mode === true
		) { return false; }
		if ( this.cuts.tracks.charge !== 0 && c !== undefined && c !== false && c !== this.cuts.tracks.charge ) { return false; }
		return true;
	}

	check_cuts_plain( pt, eta, phi, c ) {
		if ( this.cuts.tracks.pt.min !== false && pt !== undefined && pt !== false &&
			( ( pt < this.cuts.tracks.pt.cmin ) || ( pt > this.cuts.tracks.pt.cmax ) ) &&
			this.cuts.tracks.pt.mode === true
		) { return false; }
		if ( this.cuts.tracks.eta.min !== false && eta !== undefined && eta !== false &&
			( ( eta < this.cuts.tracks.eta.cmin ) || ( eta > this.cuts.tracks.eta.cmax ) ) &&
			this.cuts.tracks.eta.mode === true
		) { return false; }
		if ( this.cuts.tracks.phi.min !== false && phi !== undefined && phi !== false &&
			( ( phi < this.cuts.tracks.phi.cmin ) || ( phi > this.cuts.tracks.phi.cmax ) ) &&
			this.cuts.tracks.phi.mode === true
		) { return false; }
		if ( this.cuts.tracks.charge !== 0 && c !== undefined && c !== false && c !== this.cuts.tracks.charge ) { return false; }
		return true;
	}

	parse_tracks( evt ) {
		//
		// *** track format ***
		// "TRACKS"/text => "TPC"/text => [ <track1>: { pts: [ [x1,y1,z1], ... [xn,yn,zn] ] }, <track2>, ... <trackN> ]
		//
		this.clear_container( this.tracks );
		if ( evt.TRACKS ) {

			let meta = ( evt.META && evt.META.TRACKS ) ? evt.META.TRACKS : false;

			for ( let i in evt.TRACKS ) {

				let geometry = new THREE.Geometry(),
					colors = [], vertices = [], trk, color, material = this.materials.lines;

				if ( meta && meta[i] ) {
					if ( meta[i].depth === false || ( meta[i].thickness && meta[i].thickness !== undefined ) ) {
						this.materials_extra[ i ] =
							new THREE.LineBasicMaterial({
								color: 0xffffff, opacity: 1,
								linewidth: ( ( meta[i].thickness || 1 ) | 0 ),
								vertexColors: THREE.VertexColors
							});
						material = this.materials_extra[ i ];
						if ( meta[i].depth === false ) {
							material.depthWrite = false;
							material.depthTest = false;
							material.renderOrder = 1;
						}
					}
				}

				for ( let j in evt.TRACKS[i]) {

					trk = evt.TRACKS[i][j];

					if ( meta && meta[i] && meta[i].cuts ) {
						if ( trk.pt !== undefined && meta[i].cuts.pt !== undefined && meta[i].cuts.pt.min !== undefined && trk.pt < meta[i].cuts.pt.min ) {
							continue;
						} else if ( trk.pt !== undefined && meta[i].cuts.pt !== undefined && meta[i].cuts.pt.min !== undefined && trk.pt > meta[i].cuts.pt.max ) {
							continue;
						} else if ( trk.pxyz !== undefined && meta[i].cuts.pt !== undefined && meta[i].cuts.pt.min !== undefined &&
							Math.sqrt( Math.pow( trk.pxyz[0],2 ) + Math.pow( trk.pxyz[1], 2 ) ) < meta[i].cuts.pt.min ) {
								continue;
						} else if ( trk.pxyz !== undefined && meta[i].cuts.pt !== undefined && meta[i].cuts.pt.max !== undefined &&
							Math.sqrt( Math.pow( trk.pxyz[0],2 ) + Math.pow( trk.pxyz[1], 2 ) ) > meta[i].cuts.pt.max ) {
							continue;
						}
					}

					if ( trk.xyz !== undefined && trk.pxyz !== undefined && trk.l !== undefined && trk.q !== undefined ) {
						if ( this.cuts.tracks.enabled === true &&
								this.check_cuts( new HEP.ThreeVector( trk.pxyz[0], trk.pxyz[1], trk.pxyz[2] ),
									( trk.c || trk.q || 0 ) ) === false ) {
							continue;
						}
						// helix-based track
						let p, o, step, h, color, pos1, pos2;
						p = new HEP.ThreeVector( trk.pxyz[0] * 10, trk.pxyz[1] * 10, trk.pxyz[2] * 10 );
						o = new HEP.ThreeVector( trk.xyz[0] * 10, trk.xyz[1] * 10, trk.xyz[2] * 10 );
						step = ( trk.l * 10 ) / trk.nh;
						h = new HEP.PhysicalHelix( p, o, evt.EVENT.B, trk.q );
						color = ( ( meta && meta[i] && meta[i].color ) ? meta[i].color : this.get_track_color( trk ) );
						for ( let k = 0; k < trk.nh; k++ ) {
							pos1 = h.at( step * k );
							if ( meta && meta[i] && meta[i].r_min !== undefined && Math.sqrt( pos1.x() * pos1.x() + pos1.y() * pos1.y() ) < meta[i].r_min ) {
								continue; }
							pos2 = h.at( step * ( k + 1 ) );
							if ( meta && meta[i] && meta[i].r_max !== undefined && Math.sqrt( pos2.x() * pos2.x() + pos2.y() * pos2.y() ) > meta[i].r_max ) {
								continue; }
							vertices.push( new THREE.Vector3( pos1.x(), pos1.y(), pos1.z() ) );
							vertices.push( new THREE.Vector3( pos2.x(), pos2.y(), pos2.z() ) );
							colors.push( new THREE.Color( color ) );
							colors.push( new THREE.Color( color ) );
						}
						if ( trk.pts ) {
							// treat points as hits on helix
							let hitGroup = new THREE.Group();
							this.hits.add( hitGroup );
							this.create_hits_3d_array( hitGroup, trk.pts, { size: 5, color: 0xffffff } );
						}
					} else if ( trk.pts ) {
						// point-based track
						if ( this.cuts.tracks.enabled === true &&
							this.check_cuts_plain( trk.pt, trk.e, trk.p, ( trk.c || trk.q || 0 ) ) === false ) {
							continue;
						}
						color = ( ( meta && meta[i] && meta[i].color ) ? meta[i].color : this.get_track_color( trk ) );
						for (let k = 0, len = trk['pts'].length - 1; k < len; k++) {
							vertices.push( new THREE.Vector3( trk.pts[k][0] * 10, trk.pts[k][1] * 10, trk.pts[k][2] * 10 ) );
							vertices.push( new THREE.Vector3( trk.pts[k+1][0] * 10, trk.pts[k+1][1] * 10, trk.pts[k+1][2] * 10 ) );
							colors.push( new THREE.Color( color ) );
							colors.push( new THREE.Color( color ) );

						}
						// treat points as hits on helix
						let hitGroup = new THREE.Group();
						this.hits.add( hitGroup );
						this.create_hits_3d_array( hitGroup, trk.pts, { size: 5, color: 0xffffff } );
					}
				}

				geometry.vertices.push( ...vertices );
				geometry.colors.push( ...colors );
				this.tracks.add( new THREE.LineSegments( geometry, material ) );

			}
		}
	}

	parse_hits( evt ) {
		this.clear_container( this.hits );
		if ( !evt.META || !evt.META.HITS || !evt.HITS ) {
			// console.log('INFO - no hits in the event');
			return;
		}
		let meta = evt.META.HITS, ehits = evt.HITS;
		for ( let i in ehits ) {
			if ( !meta[i] ) {
				console.log('HIT group "' + i + '" has no meta descriptor, skipping');
				continue;
			}
			switch( meta[i].type ) {
				case '3D':
					this.parse_hits_3d( i, ehits[i], meta[i].options, meta[i] );
					break;
				case 'PROJECTIVE':
					this.parse_hits_projective( i, ehits[i], meta[i].options, meta[i] );
					break;
				case 'BOX':
					this.parse_hits_box( i, ehits[i], meta[i].options, meta[i] );
					break;
				default:
					break;
			}
		}
	}

	parse_hits_3d( id, hits, options = this.hitTypes['3D'], meta = false ) {
		let hitGroup = new THREE.Group();
		this.hits.add( hitGroup );
		if ( Array.isArray( hits ) ) {
			this.create_hits_3d_array( hitGroup, hits, options, meta );
		} else {
			for( let i in hits ) {
				let hitSubGroup = new THREE.Group();
				hitGroup.add( hitSubGroup );
				this.create_hits_3d_array( hitSubGroup, hits[i], options, meta );
			}
		}
	}

	create_hits_3d_array( three_node, hits, options, meta = false ) {

		let combined_geometry = new THREE.Geometry(), h, geo;

		for( let i = 0, ilen = hits.length; i < ilen; i++ ) {
			h = hits[i];

			if ( !this.check_hit_cuts( h ) ) { continue; }

			if ( meta && meta.cuts && meta.cuts.e && meta.cuts.e.min && h.e < meta.cuts.e.min ) {
				continue;
			}
			if ( meta && meta.cuts && meta.cuts.e && meta.cuts.e.max && h.e > meta.cuts.e.max ) {
				continue;
			}
			geo = new PHYS.Geo.box({ dx: options.size, dy: options.size, dz: options.size });
			geo.applyMatrix( new THREE.Matrix4().makeTranslation( h[0] * 10, h[1] * 10, h[2] * 10 ) );
			combined_geometry.merge( geo );
		}
		three_node.add( new THREE.Mesh( combined_geometry,
			new THREE.MeshBasicMaterial({ color: options.color, transparent: false, opacity: 1 }) ) );
	}

	parse_hits_projective( id, hits, options = this.hitTypes.PROJECTIVE, meta = false ) {
		let hitGroup = new THREE.Group();
		this.hits.add( hitGroup );
		if ( Array.isArray( hits ) ) {
			this.create_hits_projective_array( hitGroup, hits, options, meta );
		} else {
			for( let i in hits ) {
				let hitSubGroup = new THREE.Group();
				hitGroup.add( hitSubGroup );
				this.create_hits_projective_array( hitSubGroup, hits[i], options, meta );
			}
		}
	}

	calculate_hits_array_min_max( hits ) {
		let h, min = hits[0].e, max = hits[0].e, dminmax = 0.0001;
		for ( let i = 1, ilen = hits.length; i < ilen; i++ ) {
			h = hits[i];
			if ( h.e < min ) { min = h.e; }
			else if ( h.e > max ) { max = h.e; }
		}
		dminmax = Math.abs( max - min );
		return { min, max, dminmax };
	}

	create_hits_projective_array( hitSubGroup, hits, options, meta = false ) {
		if ( options.rmin !== undefined && options.rmax !== undefined ) {
			return this.create_hits_projective_r_array( hitSubGroup, hits, options, meta );
		} else if ( options.zmin !== undefined && options.zmax !== undefined ) {
			return this.create_hits_projective_z_array( hitSubGroup, hits, options, meta );
		}
		console.log('ERROR - unknown projective hit?');
	}

	create_hits_projective_r_array( three_node, hits, options, meta = false ) {

		let minmax = false;
		if ( options && options.scaleminmax ) {
			minmax = this.calculate_hits_array_min_max( hits );
		}
		if ( options && options.scaleminmax && options.scaleminmax.min !== undefined ) {
			minmax.min = options.scaleminmax.min;
		}
		if ( options && options.scaleminmax && options.scaleminmax.max !== undefined ) {
			minmax.max = options.scaleminmax.max;
		}
		if ( options && options.scaleminmax && options.scaleminmax.min !== undefined || options.scaleminmax.max !== undefined ) {
			minmax.dminmax = minmax.max - minmax.min;
		}

		let combined_geometry = new THREE.Geometry(), h, geo, rmax, ratio;

		for ( let i = 0, ilen = hits.length; i < ilen; i++ ) {
			h = hits[i];

			if ( !this.check_hit_cuts( h ) ) { continue; }

			if ( meta && meta.cuts && meta.cuts.e && meta.cuts.e.min && h.e < meta.cuts.e.min ) {
				continue;
			}
			if ( meta && meta.cuts && meta.cuts.e && meta.cuts.e.max && h.e > meta.cuts.e.max ) {
				continue;
			}

			rmax = options.rmax * 10;
			if ( minmax !== false ) {
				ratio = ( h.e - minmax.min ) / minmax.dminmax;
				if ( ratio > 1.0 ) { ratio = 1.0; }
				rmax = ( options.rmin + ( options.rmax - options.rmin ) * ratio ) * 10;
			}
			geo = new PHYS.Geo.trd3({ eta: parseFloat(h.eta), phi: parseFloat(h.phi),
				deta: options.deta, dphi: options.dphi,
				rmin: options.rmin * 10, rmax });

			// face colors: array or single color
			let color = this.hitColorFunc( options.color, ratio );
			for ( let fc = 0; fc < geo.faces.length; fc++ ) {
				let face  = geo.faces[ fc ];
				face.color.setRGB( color.r, color.g, color.b );
			}

			combined_geometry.merge( geo );
		}

		three_node.add( new THREE.Mesh( combined_geometry,
			new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: options.transparent === undefined ? false : true,
				opacity: options.transparent === undefined ? 1 : options.transparent, side: THREE.DoubleSide, vertexColors: THREE.FaceColors }) ) );

	}

	create_hits_projective_z_array( three_node, hits, options, meta = false ) {
		if ( options.scaleminmax === true ) {
			this.calculate_hits_array_min_max( hits );
		}
		let combined_geometry = new THREE.Geometry(), h, geo;
		for ( let i = 0, ilen = hits.length; i < ilen; i++ ) {
			h = hits[i];
			if ( !this.check_hit_cuts( h ) ) { continue; }
			if ( meta && meta.cuts && meta.cuts.e && meta.cuts.e.min && h.e < meta.cuts.e.min ) {
				continue;
			}
			if ( meta && meta.cuts && meta.cuts.e && meta.cuts.e.max && h.e > meta.cuts.e.max ) {
				continue;
			}
			// FIXME: shape needed
			console.error('ERROR: unimplemented shape for projective z hits');
			combined_geometry.merge( geo );
		}
		three_node.add( new THREE.Mesh( combined_geometry,
			new THREE.MeshBasicMaterial({ color: options.color, transparent: options.transparent === undefined ? false : true,
				opacity: options.transparent === undefined ? 1 : options.transparent, side: THREE.DoubleSide, }) ) );
	}

	parse_hits_box( id, hits, options = this.hitTypes['BOX'], meta = false ) {
		let hitGroup = new THREE.Group();
		this.hits.add( hitGroup );
		if ( Array.isArray( hits ) ) {
			this.create_hits_box_array( hitGroup, hits, options, meta );
		} else {
			for( let i in hits ) {
				let hitSubGroup = new THREE.Group();
				hitGroup.add( hitSubGroup );
				this.create_hits_box_array( hitSubGroup, hits[i], options, meta );
			}
		}
	}

	// hit color processing
	hitColorFunc( colors, ratio ) {
		if ( Array.isArray( colors ) && colors.length >= 2 ) {
			let d = 1.0 / ( colors.length - 1 ),
				ind = Math.floor( ratio / d ),
				dist = ( ( ratio - ind * d ) / d ),
				color = ( new THREE.Color( colors[ ind ] ) ).lerp( new THREE.Color( colors[ ind + 1 ] ), dist );
			return color;
		} else if ( Array.isArray( colors ) && colors.length === 1 ) {
			return new THREE.Color( colors[0] );
		}
		return new THREE.Color( colors );
	}

	create_hits_box_array( three_node, hits, options, meta = false ) {

		let combined_geometry = new THREE.Geometry(),
			h, geo, ratio;

		let minmax = false;
		if ( options && options.scaleminmax ) {
			minmax = this.calculate_hits_array_min_max( hits );
		}
		if ( options && options.scaleminmax && options.scaleminmax.min !== undefined ) {
			minmax.min = options.scaleminmax.min;
		}
		if ( options && options.scaleminmax && options.scaleminmax.max !== undefined ) {
			minmax.max = options.scaleminmax.max;
		}
		if ( options && options.scaleminmax && options.scaleminmax.min !== undefined || options.scaleminmax.max !== undefined ) {
			minmax.dminmax = minmax.max - minmax.min;
		}

		for( let i = 0, ilen = hits.length; i < ilen; i++ ) {
			h = hits[i];
			if ( !this.check_hit_cuts( h ) ) { continue; }
			if ( meta.cuts && meta.cuts.e && meta.cuts.e.min && h.e < meta.cuts.e.min ) { continue; }
			if ( meta.cuts && meta.cuts.e && meta.cuts.e.max && h.e > meta.cuts.e.max ) { continue; }
			let d = { x: options.dx, y: options.dy, z: options.dz };
			if ( minmax !== false ) {
				ratio = ( h.e - minmax.min ) / minmax.dminmax;
				if ( ratio > 1.0 ) { ratio = 1.0; } else if ( ratio < 0 ) { ratio = 0.0000001; }
				if ( options.scalecut && ratio <= options.scalecut ) { continue; }
				d[options.axis] *= ratio;
			} else {
				ratio = 1.0;
			}
			geo = new PHYS.Geo.box({ dx: d.x, dy: d.y, dz: d.z });
			geo.applyMatrix( new THREE.Matrix4().makeTranslation( h.x * 10, h.y * 10, h.z * 10 ) );

			// face colors: array or single color
			let color = this.hitColorFunc( options.color, ratio );
			for ( let fc = 0; fc < geo.faces.length; fc++ ) {
				let face  = geo.faces[ fc ];
				face.color.setRGB( color.r, color.g, color.b );
			}

			combined_geometry.merge( geo );
		}

		three_node.add(
			new THREE.Mesh( combined_geometry,
				new THREE.MeshBasicMaterial({ color:  0xffffff, transparent: options.transparent ? true : false,
					opacity: options.transparent || 1, side: THREE.BackSide, vertexColors: THREE.FaceColors })
			)
		);
		three_node.add(
			new THREE.Mesh( combined_geometry,
				new THREE.MeshBasicMaterial({ color:  0xffffff, transparent: options.transparent ? true : false,
					opacity: options.transparent || 1, side: THREE.FrontSide, vertexColors: THREE.FaceColors })
			)
		);
	}

	get_track_color( trk ) {
		if ( trk.trk_color !== undefined && trk.trk_color !== false ) {
			return ( trk.trk_color | 0 );
		}
		switch( this.track_color_theme ) {
			case 'black':
				return 'rgb(0,0,0)';
			case 'white':
				return 'rgb(255,255,255)';
			case 'yellow':
				return 'rgb(255,244,0)';
			case 'blue':
			default: {
				let r = 0, g = 0, b = 0,
					p = Math.abs( trk['pt'] ),
					maxp = 4.5,
					colval = Math.min( 1.0, p / maxp ),
					colvaltimes4 = colval * 4.0;
				if ( colval < 0.25 ) {
					b = g = colvaltimes4;
					b += 1.0 - colvaltimes4;
				} else if ( colval < 0.5 ) {
					b = g = 1.0 - ( colvaltimes4 - 1.0 );
					g += colvaltimes4 - 1.0;
				} else if ( colval < 0.75 ) {
					g = r = colvaltimes4 - 2.0;
					g += 1.0 - ( colvaltimes4 - 2.0 );
				} else {
					g = r = 1.0 - ( colvaltimes4 - 3.0 );
					r += colvaltimes4 - 3.0;
				}
				if ( Math.random() < 0.01 ) { r = 1.0; }
				return 'rgb('+ ((255 * r)|0) +','+ ((255 * g)|0) +','+ ((255 * b)|0) +')';
			}
		}
	}

}
