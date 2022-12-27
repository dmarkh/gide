
import * as THREE from 'three';
import Display from '../display/display';

import * as Detector from '../../vendor/threejs/Detector';

import { SVGRenderer } from '../../vendor/threejs/SVGRenderer';

import * as FileSaver from '../../vendor/FileSaver';

export default class UIPageDisplay {

	constructor() {
		this.display = new Display({ canvas_id: 'webglcanvas' });

		// connect UI callbacks to GDML callbacks
		this.display.cbOnStart = this.progressOpen.bind(this);
		this.display.cbOnProgress = this.progressSetValue.bind(this);
		this.display.cbOnFinish = this.progressClose.bind(this);

		this.collections = {};
	}

	async init() {
        console.log('UIPageDisplay:init');

        await $.getJSON( "events/collections.json", ( data ) => {
			if ( data ) {
				this.collections = data;
			}
        });
        await $.getJSON( "gdml/geometries.json", ( data ) => {
			if ( data ) {
				this.geometries = data;
			}
        });

		let palettes = Object.keys( this.display.GDMLimporter.palettes ),
			palettes_sizes = {},
			palettes_options = [];
		for ( let i = 0, ilen = palettes.length; i < ilen; i++ ) {
			palettes_sizes[ palettes[i] ] = this.display.GDMLimporter.palettes[ palettes[i] ].length;
			palettes_options.push('<option value="'+palettes[i]+'">'+palettes[i]+'</option>');
		}
		palettes_options = palettes_options.join("\n");

		let track_colors = [ "black", "white", "yellow", "blue" ],
			track_color_options = [];
		for ( let i = 0, ilen = track_colors.length; i < ilen; i++ ) {
			track_color_options.push('<option value="'+track_colors[i]+'">'+track_colors[i]+'</option>');
		}
		track_color_options = track_color_options.join("\n");

		let geometries = [];
		for ( const key in this.geometries ) {
			geometries.push( '<option value="gdml/' + this.geometries[key].file + '">' + this.geometries[key].desc + '</option>' );
		}

        $('body').append(`
            <div data-role="page" id="edisplay" style="background-color: black;">
				<div data-role="panel" id="panel_2" data-display="overlay" data-position="right" data-theme="c" style="padding: 10px;" data-position-fixed="false" data-dismissible="false" data-rel="close" data-animate="false">

					<table width="100%" border=0 style="border-collapse: collapse;"><tr>
					<td width="50%" style="border: 0; padding-right: 3px;"><a href="#geometry-popup" data-rel="popup" data-transition="none" data-position-to="window" class="ui-btn ui-corner-all ui-shadow ui-icon-back">GEOMETRY</a></td>
					<td style="border: 0;"><a href="#event-popup" data-rel="popup" data-transition="none" data-position-to="window" class="ui-btn ui-corner-all ui-shadow ui-icon-back">EVENT</a></td>
					</tr></table>
					<a href="#collections-popup" data-rel="popup" data-transition="none" data-position-to="window" class="ui-btn ui-corner-all ui-shadow ui-icon-back">EVENT COLLECTIONS</a>
					<a href="#tree-popup" data-rel="popup" data-transition="none" data-position-to="window" class="ui-btn ui-corner-all ui-shadow ui-icon-back">VOLUME SETUP</a>
					<table width="100%" border=0 style="border-collapse: collapse;"><tr>
                    <td width="50%" style="border: 0; padding-right: 3px;"><a href="#clip-popup" data-rel="popup" data-transition="none" data-position-to="window" class="ui-btn ui-corner-all ui-shadow ui-icon-back">CLIP</a></td>
					<td style="border: 0;"><a href="#camera-popup" data-rel="popup" data-transition="none" data-position-to="window" class="ui-btn ui-corner-all ui-shadow ui-icon-back">CAMERA</a></td>
					</tr></table>
					<table width="100%" border=0 style="border-collapse: collapse;"><tr>
                    <td width="50%" style="border: 0; padding-right: 3px;"><a href="#visibility-popup" data-rel="popup" data-transition="none" data-position-to="window" class="ui-btn ui-corner-all ui-shadow ui-icon-back">VISIBILITY</a></td>
					<td style="border: 0;"><a href="#color-popup" data-rel="popup" data-transition="none" data-position-to="window" class="ui-btn ui-corner-all ui-shadow ui-icon-back">COLORS</a></td>
					</tr></table>
                    <a href="#animation-popup" data-rel="popup" data-transition="none" data-position-to="window" class="ui-btn ui-corner-all ui-shadow ui-icon-back">ANIMATION</a>
                    <a href="#screenshot-popup" data-rel="popup" data-transition="none" data-position-to="window" class="ui-btn ui-corner-all ui-shadow ui-icon-back">SCREENSHOT</a>
					<table width="100%" border=0 style="border-collapse: collapse;"><tr>
                    <td width="50%" style="border: 0; padding-right: 3px;"><a href="#track-cuts-popup" data-rel="popup" data-transition="none" data-position-to="window" class="ui-btn ui-corner-all ui-shadow ui-icon-back">TRACK CUTS</a></td>
					<td style="border: 0;"><a href="#hit-cuts-popup" data-rel="popup" data-transition="none" data-position-to="window" class="ui-btn ui-corner-all ui-shadow ui-icon-back">HIT CUTS</a></td>
					</tr></table>
				</div>

                <div data-role="header" data-position="fixed" data-fullscreen="true" data-tap-toggle="false">
				    <a href="#shapes" data-icon="info" class="ui-btn-left ui-btn-icon-notext">Info</a>
				    <a href="#panel_2" data-icon="gear" class="ui-btn-right ui-btn-icon-notext">Options</a>
                    <h1>EVENT DISPLAY</h1>
                </div>
                <div role="main" class="ui-content">
					<canvas id="webglcanvas" style="display: block;"></canvas>
                </div>
                <div data-role="footer" data-position="fixed" data-fullscreen="true" data-tap-toggle="false">
					<h3 id="volume_counter">written by Dmitry Arkhipkin, 2017-2019</h3>
                </div>

				<div data-role="popup" id="track-cuts-popup" data-overlay-theme="b" data-theme="b" data-dismissible="false" style="min-width: 500px; max-width:700px;">
				    <div data-role="header" data-theme="a">
					    <h1>Track Cuts</h1>
				    </div>
				    <div role="main" id="track-cuts-popup-main" style="padding: 10px; text-align: center;">
				    <div data-role="rangeslider" data-track-theme="b" data-theme="a" id="trk-p">
				        <label for="trk-p-1a">Momentum:</label>
				        <input name="trk-p-1a" id="trk-p-1a" min="0" max="1" step="0.001" value="0" type="range">
				        <label for="trk-p-1b">Momentum:</label>
				        <input name="trk-p-1b" id="trk-p-1b" min="0" max="1" step="0.001" value="1" type="range">
				    </div>
				    <div data-role="rangeslider" data-track-theme="b" data-theme="a" id="trk-pt">
				        <label for="trk-pt-1a">Transverse Momentum:</label>
				        <input name="trk-pt-1a" id="trk-pt-1a" min="0" max="1" step="0.001" value="0" type="range">
				        <label for="trk-pt-1b">Transverse Momentum:</label>
				        <input name="trk-pt-1b" id="trk-pt-1b" min="0" max="1" step="0.001" value="1" type="range">
				    </div>
				    <div data-role="rangeslider" data-track-theme="b" data-theme="a" id="trk-eta">
				        <label for="trk-eta-1a">Pseudorapidity:</label>
				        <input name="trk-eta-1a" id="trk-eta-1a" min="0" max="1" step="0.001" value="0" type="range">
				        <label for="trk-eta-1b">Pseudorapidity:</label>
				        <input name="trk-eta-1b" id="trk-eta-1b" min="0" max="1" step="0.001" value="1" type="range">
				    </div>
				    <div data-role="rangeslider" data-track-theme="b" data-theme="a" id="trk-phi">
				        <label for="trk-phi-1a">Phi:</label>
				        <input name="trk-phi-1a" id="trk-phi-1a" min="0" max="1" step="0.001" value="0" type="range">
				        <label for="trk-phi-1b">Phi:</label>
				        <input name="trk-phi-1b" id="trk-phi-1b" min="0" max="1" step="0.001" value="1" type="range">
				    </div>
					<label for="trk-c">Track charge</label>
					<select name="trk-c" id="trk-c">
						<option value="0">positive and negative charge</option>
						<option value="1">positive charge only</option>
						<option value="-1">negative charge only</option>
					</select>
					<label>
						<input id="track-cuts-preserve" name="track-cuts-preserve" type="checkbox">Preserve cuts across events
					</label>
						...THEN...
					<button id="track-cuts-popup-apply" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">APPLY</button>
						... OR ...
                    <a href="#" data-rel="back" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">CANCEL</a>
					</div>
				</div>

				<div data-role="popup" id="hit-cuts-popup" data-overlay-theme="b" data-theme="b" data-dismissible="false" style="min-width: 500px; max-width:700px;">
				    <div data-role="header" data-theme="a">
					    <h1>Hit Cuts</h1>
				    </div>
				    <div role="main" id="hit-cuts-popup-main" style="padding: 10px; text-align: center;">
				    <div data-role="rangeslider" data-track-theme="b" data-theme="a" id="hit-e">
				        <label for="hit-e-1a">Energy:</label>
				        <input name="hit-e-1a" id="hit-e-1a" min="0" max="1" step="0.001" value="0" type="range">
				        <label for="hit-e-1b">Energy:</label>
				        <input name="hit-e-1b" id="hit-e-1b" min="0" max="1" step="0.001" value="1" type="range">
				    </div>
				    <div data-role="rangeslider" data-track-theme="b" data-theme="a" id="hit-eta">
				        <label for="hit-eta-1a">Eta:</label>
				        <input name="hit-eta-1a" id="hit-eta-1a" min="0" max="1" step="0.001" value="0" type="range">
				        <label for="hit-eta-1b">Eta:</label>
				        <input name="hit-eta-1b" id="hit-eta-1b" min="0" max="1" step="0.001" value="1" type="range">
				    </div>
				    <div data-role="rangeslider" data-track-theme="b" data-theme="a" id="hit-phi">
				        <label for="hit-phi-1a">Phi:</label>
				        <input name="hit-phi-1a" id="hit-phi-1a" min="0" max="1" step="0.001" value="0" type="range">
				        <label for="hit-phi-1b">Phi:</label>
				        <input name="hit-phi-1b" id="hit-phi-1b" min="0" max="1" step="0.001" value="1" type="range">
				    </div>
					<label>
						<input id="hit-cuts-preserve" name="hit-cuts-preserve" type="checkbox">Preserve cuts across events
					</label>
						...THEN...
					<button id="hit-cuts-popup-apply" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">APPLY</button>
						... OR ...
                    <a href="#" data-rel="back" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">CANCEL</a>
					</div>
				</div>

				<div data-role="popup" id="geometry-popup" data-overlay-theme="b" data-theme="b" data-dismissible="false" style="min-width: 500px; max-width:700px;">
				    <div data-role="header" data-theme="a">
					    <h1>GDML File Selection</h1>
				    </div>
				    <div role="main" id="geometry-popup-main" style="padding: 10px; text-align: center;">

					<table border=0 width="100%">
					<tr>

					<td>
					<label for="geometry-remote">Remote File Location</label>
				    <input data-clear-btn="true" name="geometry-remote" id="geometry-remote" value="" placeholder="full URL of the remote file" type="text">
					</td>

					<td>
						...OR...
					</td>

					<td>
					<label for="geometry-local">Upload Local File</label>
					<input data-clear-btn="true" name="geometry-local" id="geometry-local" value="" type="file">
					</td>

					</tr>
					</table>
						...OR...
					<label for="geometry-list">Select File From Our List</label>
					<select name="geometry-list" id="geometry-list">
						<option value="">- not selected -</option>
						` + geometries.join("\n") + `
					</select>
						...OPTIONS...
					<label><input name="geometry-merge" id="geometry-merge" type="checkbox">Merge Volumes</label>

					<!-- <label><input name="geometry-trans" id="geometry-trans" type="checkbox">Liquids as Solids</label> //-->
					<fieldset data-role="controlgroup" data-type="horizontal" id="geometry-trans">
					    <legend>Volume Transparency</legend>
					    <input name="geometry-trans" id="geometry-trans-a" value="-1" type="radio">
					    <label for="geometry-trans-a">All solid (fast)</label>
					    <input name="geometry-trans" id="geometry-trans-b" value="0" type="radio">
					    <label for="geometry-trans-b">Normal (view)</label>
					    <input name="geometry-trans" id="geometry-trans-c" value="1" type="radio">
					    <label for="geometry-trans-c">All transparent (hits)</label>
					</fieldset>

						...THEN...
					<button id="geometry-popup-apply" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">APPLY</button>
						... OR ...
                    <a href="#" data-rel="back" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">CANCEL</a>
					</div>
				</div>

				<div data-role="popup" id="event-popup" data-overlay-theme="b" data-theme="b" data-dismissible="false" style="min-width: 500px; max-width:700px;">
				    <div data-role="header" data-theme="a">
					    <h1>Event File Selection</h1>
				    </div>
				    <div role="main" id="event-popup-main" style="padding: 10px; text-align: center;">

					<table border=0 width="100%">
					<tr><td>
					<label for="event-remote">Remote File Location</label>
				    <input data-clear-btn="true" name="event-remote" id="event-remote" value="" placeholder="full URL of the remote file" type="text">
					</td>
					<td>
						...OR...
					</td>
					<td>
					<label for="event-local">Upload Local File</label>
					<input data-clear-btn="true" name="event-local" id="event-local" value="" type="file">
					</td></tr>
					</table>
						...OR...
					<label for="event-list">Select File From Our List</label>
					<select name="event-list" id="event-list">
						<option value="">- not selected -</option>
						<option value="events/test/event1.json.gz">test event 1</option>
						<option value="events/test/event2.json.gz">test event 2</option>
					</select>

					...OR...
					<label for="event-collection-remote">Remote Event Collection Location</label>
				    <input data-clear-btn="true" name="event-collection-remote" id="event-collection-remote" value="" placeholder="full URL of the remote collection" type="text">

						...THEN...
						<button id="event-popup-apply" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">APPLY</button>
						... OR ...
                    	<a href="#" data-rel="back" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">CANCEL</a>
					</div>
				</div>

				<div data-role="popup" id="tree-popup" data-overlay-theme="b" data-theme="b" data-dismissible="false" style="min-width: 500px; max-width:700px;">
				    <div data-role="header" data-theme="a">
					    <h1>Volume Setup</h1>
				    </div>
				    <div role="main" id="tree-popup-main" style="padding: 10px; text-align: center;">
						<label for="tree-WorldRef">Starting Volume / WorldRef</label>
					    <input data-clear-btn="true" name="tree-WorldRef" id="tree-WorldRef" value="" placeholder="volume name" type="text">
						<div id="tree-popup-worldrefs"></div>
							...AND...
						<label for="tree-VisLevel">Visibility Depth</label>
						<input name="tree-VisLevel" id="tree-VisLevel" value="3" min="0" max="10" step="1" data-highlight="true" type="range">

							...AND...
					<fieldset data-role="controlgroup" data-type="horizontal" id="tree-VisEdges">
					    <legend>Edges Visibility:</legend>
					    <input name="tree-VisEdges" id="tree-VisEdges-a" value="false" type="radio">
					    <label for="tree-VisEdges-a">None</label>
					    <input name="tree-VisEdges" id="tree-VisEdges-b" value="3355443" type="radio">
					    <label for="tree-VisEdges-b">Black</label>
					    <input name="tree-VisEdges" id="tree-VisEdges-c" value="10066329" type="radio">
					    <label for="tree-VisEdges-c">Dark Gray</label>
					    <input name="tree-VisEdges" id="tree-VisEdges-d" value="13421772" type="radio">
					    <label for="tree-VisEdges-d">Light Gray</label>
					    <input name="tree-VisEdges" id="tree-VisEdges-e" value="16777215" type="radio">
					    <label for="tree-VisEdges-e">White</label>
					    <input name="tree-VisEdges" id="tree-VisEdges-f" value="48127" type="radio">
					    <label for="tree-VisEdges-f">Blue</label>
					</fieldset>
							...THEN...
						<button id="tree-popup-apply" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">APPLY</button>
						...OR...
                    	<a href="#" data-rel="back" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">CANCEL</a>
					</div>
				</div>

				<div data-role="popup" id="camera-popup" data-overlay-theme="b" data-theme="b" data-dismissible="false" style="min-width: 1200px; max-width:1200px;">
				    <div data-role="header" data-theme="a">
					    <h1>Camera Setup</h1>
				    </div>
				    <div role="main" id="camera-popup-main" style="padding: 10px; text-align: center;">
						<table width="100%">
							<tr><td width="33%">
						<label for="camera-x">Camera: X</label>
						<input name="camera-x" id="camera-x" value="0" min="-50000" max="50000" step="1" type="range">
							</td><td width="33%">
						<label for="camera-y">Camera: Y</label>
						<input name="camera-y" id="camera-y" value="0" min="-50000" max="50000" step="1" type="range">
							</td><td width="33%">
						<label for="camera-z">Camera: Z</label>
						<input name="camera-z" id="camera-z" value="0" min="-50000" max="50000" step="1" type="range">
							</td></tr>
						</table>
						..THEN..
						<table width="100%">
							<tr><td width="33%">
						<label for="target-x">Target: X</label>
						<input name="target-x" id="target-x" value="0" min="-50000" max="50000" step="1" type="range">
							</td><td width="33%">
						<label for="target-y">Target: Y</label>
						<input name="target-y" id="target-y" value="0" min="-50000" max="50000" step="1" type="range">
							</td><td width="33%">
						<label for="target-z">Target: Z</label>
						<input name="target-z" id="target-z" value="0" min="-50000" max="50000" step="1" type="range">
							</td></tr>
						</table>

						..THEN..
						<table width="100%">
							<tr><td width="33%">
						<fieldset data-role="controlgroup" data-type="horizontal" id="camera-up">
						    <legend>Camera UP direction</legend>
						    <input name="camera-up" id="camera-up-a" value="x" type="radio">
						    <label for="camera-up-a">X up</label>
						    <input name="camera-up" id="camera-up-b" value="y" type="radio">
						    <label for="camera-up-b">Y up</label>
					    	<input name="camera-up" id="camera-up-c" value="z" type="radio">
						    <label for="camera-up-c">Z up</label>
						</fieldset>
							</td><td width="33%">
						<fieldset data-role="controlgroup" data-type="horizontal" id="camera-background">
						    <legend>Background Color</legend>
						    <input name="camera-background" id="camera-background-a" value="black" type="radio">
						    <label for="camera-background-a">Black</label>
						    <input name="camera-background" id="camera-background-b" value="gray" type="radio">
						    <label for="camera-background-b">Gray</label>
					    	<input name="camera-background" id="camera-background-c" value="white" type="radio">
						    <label for="camera-background-c">White</label>
						</fieldset>
							</td><td width="33%">
						<fieldset data-role="controlgroup" data-type="horizontal" id="camera-fov">
						    <legend>Field of View</legend>
						    <input name="camera-fov" id="camera-fov-a" value="25" type="radio">
						    <label for="camera-fov-a">Normal</label>
						    <input name="camera-fov" id="camera-fov-b" value="50" type="radio">
						    <label for="camera-fov-b">Wide</label>
					    	<input name="camera-fov" id="camera-fov-c" value="90" type="radio">
						    <label for="camera-fov-c">X-Wide</label>
					    	<input name="camera-fov" id="camera-fov-d" value="ortho" type="radio">
						    <label for="camera-fov-d">Ortho</label>
						</fieldset>
							</td></tr>
						</table>

						...THEN...
						<button id="camera-popup-apply" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">APPLY</button>
						...OR...
                    	<a href="#" data-rel="back" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">CANCEL</a>
					</div>
				</div>


				<div data-role="popup" id="visibility-popup" data-overlay-theme="b" data-theme="b" data-dismissible="false" style="min-width: 800px; max-width:800px;">
				    <div data-role="header" data-theme="a">
					    <h1>Visibility Settings</h1>
				    </div>
				    <div role="main" id="visibility-popup-main" style="padding: 10px; text-align: center;">
					<table width="100%" border=0>
					<tr><td width="50%">
					<fieldset data-role="controlgroup" data-type="horizontal" id="VisWorld">
					    <legend>World Visibility:</legend>
					    <input name="VisWorld" id="VisWorld-a" value="true" type="radio">
					    <label for="VisWorld-a">Visible</label>
					    <input name="VisWorld" id="VisWorld-b" value="false" type="radio">
					    <label for="VisWorld-b">Invisible</label>
					</fieldset>

					<fieldset data-role="controlgroup" data-type="horizontal" id="VisAxes">
					    <legend>XYZ Axes Visibility:</legend>
					    <input name="VisAxes" id="VisAxes-a" value="1" type="radio">
					    <label for="VisAxes-a">BBox</label>
					    <input name="VisAxes" id="VisAxes-b" value="2" type="radio">
					    <label for="VisAxes-b">Arrows</label>
					    <input name="VisAxes" id="VisAxes-c" value="3" type="radio">
					    <label for="VisAxes-c">Invisible</label>
					</fieldset>
					</td><td>
					<fieldset data-role="controlgroup" data-type="horizontal" id="VisContainers">
					    <legend>Containers Visibility:</legend>
					    <input name="VisContainers" id="VisContainers-a" value="true" type="radio">
					    <label for="VisContainers-a">Visible</label>
					    <input name="VisContainers" id="VisContainers-b" value="false" type="radio">
					    <label for="VisContainers-b">Invisible</label>
					</fieldset>
					<fieldset data-role="controlgroup" data-type="horizontal" id="VisLogs">
					    <legend>Logs Visibility:</legend>
					    <input name="VisLogs" id="VisLogs-a" value="true" type="radio">
					    <label for="VisLogs-a">Visible</label>
					    <input name="VisLogs" id="VisLogs-b" value="false" type="radio">
					    <label for="VisLogs-b">Invisible</label>
					</fieldset>

					</td></tr></table>
							...THEN...
						<button id="visibility-popup-apply" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">APPLY</button>
						... OR ...
                    	<a href="#" data-rel="back" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">CANCEL</a>
					</div>
				</div>

				<div data-role="popup" id="clip-popup" data-overlay-theme="b" data-theme="b" data-dismissible="false" style="min-width: 500px; max-width:700px;">
				    <div data-role="header" data-theme="a">
					    <h1>Clip Settings</h1>
				    </div>
				    <div role="main" id="clip-popup-main" style="padding: 10px; text-align: center;">

					<fieldset data-role="controlgroup" id="VisClip">
					    <legend>Clip Detector:</legend>
					    <input name="VisClip" id="VisClip-a" value="0" checked="checked" type="radio">
					    <label for="VisClip-a">No Clip</label>
					    <input name="VisClip" id="VisClip-b" value="1/8" type="radio">
					    <label for="VisClip-b">1/8 Clip</label>
					    <input name="VisClip" id="VisClip-c" value="1/4" type="radio">
					    <label for="VisClip-c">1/4 Clip</label>
					    <input name="VisClip" id="VisClip-d" value="1/3" type="radio">
					    <label for="VisClip-d">1/3 Clip</label>
					    <input name="VisClip" id="VisClip-e" value="1/2" type="radio">
					    <label for="VisClip-e">1/2 Clip</label>
					</fieldset>

					<label><input name="VisClipInvert" id="VisClipInvert" type="checkbox">Invert Clipping</label>

							...THEN...
						<button id="clip-popup-apply" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">APPLY</button>
						...OR...
                    	<a href="#" data-rel="back" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">CANCEL</a>
					</div>
				</div>

				<div data-role="popup" id="color-popup" data-overlay-theme="b" data-theme="b" data-dismissible="false" style="min-width: 500px; max-width:700px;">
				    <div data-role="header" data-theme="a">
					    <h1>Color Settings</h1>
				    </div>
				    <div role="main" id="color-popup-main" style="padding: 10px; text-align: center;">
						<div class="ui-field-contain">
							<label for="palette-name">Detector Palette Selection</label>
							<select name="palette-name" id="palette-name">
								${palettes_options}
							</select>
						</div>
						<label for="palette-start-index">Palette Starting Index</label>
						<input name="palette-start-index" id="palette-start-index" value="0" min="0" max="10" step="1" data-highlight="true" type="range">
						..OR..
						<div class="ui-field-contain">
							<label for="track-color-name">Track Color Theme</label>
							<select name="track-color-name" id="track-color-name">
								${track_color_options}
							</select>
						</div>
							...THEN...
						<button id="color-popup-apply" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">APPLY</button>
						...OR...
                    	<a href="#" data-rel="back" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">CANCEL</a>
					</div>
				</div>

				<div data-role="popup" id="animation-popup" data-overlay-theme="b" data-theme="b" data-dismissible="false" style="min-width: 500px; max-width:700px;">
				    <div data-role="header" data-theme="a">
					    <h1>Animation Controls</h1>
				    </div>
				    <div role="main" id="animation-popup-main" style="padding: 10px; text-align: center;">

					<fieldset data-role="controlgroup" id="AniRotation">
					    <legend>Scene Rotation:</legend>
					    <input name="AniRotation" id="AniRotation-a" value="0" type="radio">
					    <label for="AniRotation-a">No Rotation</label>
					    <input name="AniRotation" id="AniRotation-b" value="1" type="radio">
					    <label for="AniRotation-b">Around Y axis</label>
					    <input name="AniRotation" id="AniRotation-c" value="2" type="radio">
					    <label for="AniRotation-c">Around X axis</label>
					    <input name="AniRotation" id="AniRotation-d" value="3" type="radio">
					    <label for="AniRotation-d">Around Z axis</label>
					</fieldset>

							...THEN...
						<button id="animation-popup-apply" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">APPLY</button>
						...OR...
                    	<a href="#" data-rel="back" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">CANCEL</a>
					</div>
				</div>

				<div data-role="popup" id="screenshot-popup" data-overlay-theme="b" data-theme="b" data-dismissible="false" style="min-width: 500px; max-width:700px;">
				    <div data-role="header" data-theme="a">
					    <h1>Screenshot Controls</h1>
				    </div>
				    <div role="main" id="screenshot-popup-main" style="padding: 10px; text-align: center;">

					<fieldset data-role="controlgroup" id="ScreenShot">
					    <legend>ScreenShot Size:</legend>
					    <input name="ScreenShot" id="ScreenShot-a" value="0" checked="checked" type="radio">
					    <label for="ScreenShot-a">screen size</label>
					    <input name="ScreenShot" id="ScreenShot-b" value="1" type="radio">
					    <label for="ScreenShot-b">512 x 512 px</label>
					    <input name="ScreenShot" id="ScreenShot-c" value="2" type="radio">
					    <label for="ScreenShot-c">1024 x 1024 px</label>
					    <input name="ScreenShot" id="ScreenShot-d" value="3" type="radio">
					    <label for="ScreenShot-d">2048 x 2048 px</label>
					    <input name="ScreenShot" id="ScreenShot-e" value="4" type="radio">
					    <label for="ScreenShot-e">4096 x 4096 px *</label>
					    <input name="ScreenShot" id="ScreenShot-f" value="5" type="radio">
					    <label for="ScreenShot-f">8192 x 8192 px *</label>
					    <input name="ScreenShot" id="ScreenShot-g" value="6" type="radio">
					    <label for="ScreenShot-g">SVG format</label>
					</fieldset>
					[*] if your videocard supports this mode<br/>

							...THEN...
						<button id="screenshot-popup-apply" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">TAKE SCREENSHOT</button>
						...OR...
                    	<a href="#" data-rel="back" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">CANCEL</a>
						<a id="hidden_screenshot" href="" style="visibility: hidden;">image placeholder</a>
					</div>
				</div>

				<div data-role="popup" id="collections-popup" data-overlay-theme="b" data-theme="b" data-dismissible="false" style="min-width: 500px; max-width:700px;">
				    <div data-role="header" data-theme="a">
					    <h1>Event Collections</h1>
				    </div>
				    <div role="main" id="screenshot-popup-main" style="padding: 10px; text-align: center;">

				<form>
				    <input id="filterTable-input" data-type="search">
				</form>
				<div id="collections-frame" style="width: 100%; max-height: 200px; overflow-y: scroll; overflow-x: hidden;">

					<table data-role="table" id="collections-table" data-filter="true" data-input="#filterTable-input" class="ui-responsive">
					    <thead>
					        <tr>
					            <th data-priority="1">N</th>
					            <th data-priority="persist">Description</th>
					            <th data-priority="2">Species</th>
					            <th data-priority="3">Energy</th>
					            <th data-priority="4">Year</th>
					        </tr>
					    </thead>
					    <tbody>
						</tbody>
					</table>

				</div>
						...THEN SELECT COLLECTION...<BR />
						...OR...
                    	<a href="#" data-rel="back" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">CANCEL</a>
					</div>
				</div>

				<div data-role="popup" id="progress-popup" data-overlay-theme="b" data-theme="b" data-dismissible="false" style="min-width: 250px; max-width: 500px;">
				    <div data-role="header" data-theme="a">
					    <h1>&nbsp;Processing:&nbsp;</h1>
				    </div>
				    <div role="main" id="progress-popup-main">
				        <h3 class="ui-title" id="progress-title" style="margin-left: 20px !important; margin-top: 10px !important;"></h3>
					    <div id="progress-placeholder"></div>
				    </div>
				</div>

				<div data-role="popup" id="error-popup" data-overlay-theme="b" data-theme="b" data-dismissible="false" style="min-width: 500px; max-width: 700px;">
				    <div data-role="header" data-theme="a">
					    <h1 style="color: #FF0000 !important; text-shadow: 1px 1px #CCCCCC;">ERROR</h1>
				    </div>
				    <div role="main" id="error-popup-main">
				        <h3 class="ui-title" id="error-title" style="color: #FF0000; margin-left: 20px !important; margin-top: 10px !important;"></h3>
						<p id="error-message" style="padding: 10px !important; text-align: justify;"></p>
				    </div>
				</div>

				<div data-role="popup" id="warning-popup" data-overlay-theme="b" data-theme="b" data-dismissible="false" style="min-width: 500px; max-width: 700px;">
				    <div data-role="header" data-theme="a">
					    <h1 style="color: #FF00FF !important; text-shadow: 1px 1px #CCCCCC;">WARNING</h1>
				    </div>
				    <div role="main" id="warning-popup-main">
				        <h3 class="ui-title" id="warning-title" style="color: #FF00FF; margin-left: 20px !important; margin-top: 10px !important;"></h3>
						<p id="warning-message" style="padding: 10px !important; text-align: justify;"></p>
                    	<a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow">OKAY</a>
				    </div>
				</div>

            </div>
        `);

		$(document).on( 'pageshow', '#edisplay', () => {
			$( window ).on('postresize', () => this.onResize() );
		});

		$(document).on( 'pagehide', '#edisplay', () => {
			if ( this.display ) {
				this.display.stop();
			}
			$( window ).off('postresize');
		});

		$( "#visibility-popup" ).on( "popupbeforeposition", ( event ) => { // eslint-disable-line no-unused-vars
			$('input:radio[name="VisWorld"]').filter('[value="'+this.display.GDMLimporter.VisWorld+'"]').attr('checked',true).checkboxradio('refresh');
			if ( !this.display.VisAxes ) {
				$('input:radio[name="VisAxes"]').filter('[value="3"]').attr('checked',true).checkboxradio('refresh');
			} else if ( this.display.ShowArrows ) {
				$('input:radio[name="VisAxes"]').filter('[value="2"]').attr('checked',true).checkboxradio('refresh');
			} else if ( this.display.ShowBbox ) {
				$('input:radio[name="VisAxes"]').filter('[value="1"]').attr('checked',true).checkboxradio('refresh');
			}
			$('input:radio[name="VisContainers"]').filter('[value="'+this.display.GDMLimporter.VisContainers+'"]').attr('checked',true).checkboxradio('refresh');

			let logs_visible = $('#log_window').is(":visible");
			$('input:radio[name="VisLogs"]').filter('[value="'+logs_visible+'"]').attr('checked',true).checkboxradio('refresh');
		});

		$( "#hit-cuts-popup" ).on( "popupbeforeposition", ( event, ui ) => { // eslint-disable-line no-unused-vars

			if ( this.display.EVENTimporter.cuts.hits.enabled === true ) {

				if ( this.display.EVENTimporter.cuts.hits.e.min !== false ) {
					$('#hit-e-1a').slider('enable');
					$("#hit-e-1a").attr( "min", this.display.EVENTimporter.cuts.hits.e.min );
					$("#hit-e-1a").attr( "max", this.display.EVENTimporter.cuts.hits.e.max );
					$("#hit-e-1a").attr( "step", 0.001 );
					$("#hit-e-1a").val( this.display.EVENTimporter.cuts.hits.e.cmin );
					$("#hit-e-1a").slider("refresh");

					$('#hit-e-1b').slider('enable');
					$("#hit-e-1b").attr( "min", this.display.EVENTimporter.cuts.hits.e.min  );
					$("#hit-e-1b").attr( "max", this.display.EVENTimporter.cuts.hits.e.max );
					$("#hit-e-1b").attr( "step", 0.001 );
					$("#hit-e-1b").val( this.display.EVENTimporter.cuts.hits.e.cmax );
					$("#hit-e-1b").slider("refresh");
				} else {
					$('#hit-e-1a').slider('disable');
					$('#hit-e-1b').slider('disable');
				}


				if ( this.display.EVENTimporter.cuts.hits.eta.min !== false ) {

					$('#hit-eta-1a').slider('enable');
					$("#hit-eta-1a").attr( "min", this.display.EVENTimporter.cuts.hits.eta.min );
					$("#hit-eta-1a").attr( "max", this.display.EVENTimporter.cuts.hits.eta.max );
					$("#hit-eta-1a").attr( "step", 0.001 );
					$("#hit-eta-1a").val( this.display.EVENTimporter.cuts.hits.eta.cmin );
					//$("#hit-eta-1a").slider("refresh");

					$('#hit-eta-1b').slider('enable');
					$("#hit-eta-1b").attr( "min", this.display.EVENTimporter.cuts.hits.eta.min  );
					$("#hit-eta-1b").attr( "max", this.display.EVENTimporter.cuts.hits.eta.max );
					$("#hit-eta-1b").attr( "step", 0.001 );
					$("#hit-eta-1b").val( this.display.EVENTimporter.cuts.hits.eta.cmax );
					$("#hit-eta-1b").slider("refresh");

				} else {
					$('#hit-eta-1a').slider('disable');
					$('#hit-eta-1b').slider('disable');
				}

				if ( this.display.EVENTimporter.cuts.hits.phi.min !== false ) {
					$('#hit-phi-1a').slider('enable');
					$("#hit-phi-1a").attr( "min", this.display.EVENTimporter.cuts.hits.phi.min );
					$("#hit-phi-1a").attr( "max", this.display.EVENTimporter.cuts.hits.phi.max );
					$("#hit-phi-1a").attr( "step", 0.001 );
					$("#hit-phi-1a").val( this.display.EVENTimporter.cuts.hits.phi.cmin );
					$("#hit-phi-1a").slider("refresh");

					$('#hit-phi-1b').slider('enable');
					$("#hit-phi-1b").attr( "min", this.display.EVENTimporter.cuts.hits.phi.min  );
					$("#hit-phi-1b").attr( "max", this.display.EVENTimporter.cuts.hits.phi.max );
					$("#hit-phi-1b").attr( "step", 0.001 );
					$("#hit-phi-1b").val( this.display.EVENTimporter.cuts.hits.phi.cmax );
					$("#hit-phi-1b").slider("refresh");
				} else {
					$('#hit-phi-1a').slider('disable');
					$('#hit-phi-1b').slider('disable');
				}

                if ( this.display.EVENTimporter.cuts.hits.preserve === true ) {
                    $('#track-hits-preserve').prop('checked', true).checkboxradio('refresh');
                } else {
                    $('#track-hits-preserve').prop('checked', false).checkboxradio('refresh');
                }

			}

		});

		$( "#track-cuts-popup" ).on( "popupbeforeposition", ( event, ui ) => { // eslint-disable-line no-unused-vars
			if ( this.display.EVENTimporter.cuts.tracks.enabled === true ) {
				if ( this.display.EVENTimporter.cuts.tracks.pt.min !== false ) {
					$('#trk-pt-1a').slider('enable');
					$('#trk-pt-1b').slider('enable');
					$("#trk-pt-1a").attr( "min", this.display.EVENTimporter.cuts.tracks.pt.min );
					$("#trk-pt-1a").attr( "max", this.display.EVENTimporter.cuts.tracks.pt.max );
					$("#trk-pt-1a").attr( "step", 0.001 );
					$("#trk-pt-1a").val( this.display.EVENTimporter.cuts.tracks.pt.cmin );
					$("#trk-pt-1a").slider("refresh");
					$("#trk-pt-1b").attr( "min", this.display.EVENTimporter.cuts.tracks.pt.min  );
					$("#trk-pt-1b").attr( "max", this.display.EVENTimporter.cuts.tracks.pt.max );
					$("#trk-pt-1b").attr( "step", 0.001 );
					$("#trk-pt-1b").val( this.display.EVENTimporter.cuts.tracks.pt.cmax );
					$("#trk-pt-1b").slider("refresh");
				} else {
					$('#trk-pt-1a').slider('disable');
					$('#trk-pt-1b').slider('disable');
				}
				if ( this.display.EVENTimporter.cuts.tracks.p.min !== false ) {
					$('#trk-p-1a').slider('enable');
					$('#trk-p-1b').slider('enable');
					$("#trk-p-1a").attr( "min", this.display.EVENTimporter.cuts.tracks.p.min );
					$("#trk-p-1a").attr( "max", this.display.EVENTimporter.cuts.tracks.p.max );
					$("#trk-p-1a").attr( "step", 0.001 );
					$("#trk-p-1a").val( this.display.EVENTimporter.cuts.tracks.p.cmin );
					$("#trk-p-1a").slider("refresh");
					$("#trk-p-1b").attr( "min", this.display.EVENTimporter.cuts.tracks.p.min  );
					$("#trk-p-1b").attr( "max", this.display.EVENTimporter.cuts.tracks.p.max );
					$("#trk-p-1b").attr( "step", 0.001 );
					$("#trk-p-1b").val( this.display.EVENTimporter.cuts.tracks.p.cmax );
					$("#trk-p-1b").slider("refresh");
				} else {
					$('#trk-p-1a').slider('disable');
					$('#trk-p-1b').slider('disable');
				}
				if ( this.display.EVENTimporter.cuts.tracks.eta.min !== false ) {
					$('#trk-eta-1a').slider('enable');
					$('#trk-eta-1b').slider('enable');
					$("#trk-eta-1a").attr( "min", this.display.EVENTimporter.cuts.tracks.eta.min );
					$("#trk-eta-1a").attr( "max", this.display.EVENTimporter.cuts.tracks.eta.max );
					$("#trk-eta-1a").attr( "step", 0.001 );
					$("#trk-eta-1a").val( this.display.EVENTimporter.cuts.tracks.eta.cmin );
					$("#trk-eta-1a").slider("refresh");
					$("#trk-eta-1b").attr( "min", this.display.EVENTimporter.cuts.tracks.eta.min  );
					$("#trk-eta-1b").attr( "max", this.display.EVENTimporter.cuts.tracks.eta.max );
					$("#trk-eta-1b").attr( "step", 0.001 );
					$("#trk-eta-1b").val( this.display.EVENTimporter.cuts.tracks.eta.cmax );
					$("#trk-eta-1b").slider("refresh");
				} else {
					$('#trk-eta-1a').slider('disable');
					$('#trk-eta-1b').slider('disable');
				}
				if ( this.display.EVENTimporter.cuts.tracks.phi.min !== false ) {
					$('#trk-phi-1a').slider('enable');
					$('#trk-phi-1b').slider('enable');
					$("#trk-phi-1a").attr( "min", this.display.EVENTimporter.cuts.tracks.phi.min );
					$("#trk-phi-1a").attr( "max", this.display.EVENTimporter.cuts.tracks.phi.max );
					$("#trk-phi-1a").attr( "step", 0.001 );
					$("#trk-phi-1a").val( this.display.EVENTimporter.cuts.tracks.phi.cmin );
					$("#trk-phi-1a").slider("refresh");
					$("#trk-phi-1b").attr( "min", this.display.EVENTimporter.cuts.tracks.phi.min  );
					$("#trk-phi-1b").attr( "max", this.display.EVENTimporter.cuts.tracks.phi.max );
					$("#trk-phi-1b").attr( "step", 0.001 );
					$("#trk-phi-1b").val( this.display.EVENTimporter.cuts.tracks.phi.cmax );
					$("#trk-phi-1b").slider("refresh");
				} else {
					$('#trk-phi-1a').slider('disable');
					$('#trk-phi-1b').slider('disable');
				}
				$('#trk-c').val( this.display.EVENTimporter.cuts.tracks.charge );
				$('#trk-c').selectmenu('refresh');

				if ( this.display.EVENTimporter.cuts.tracks.preserve === true ) {
					$('#track-cuts-preserve').prop('checked', true).checkboxradio('refresh');
				} else {
					$('#track-cuts-preserve').prop('checked', false).checkboxradio('refresh');
				}

			} else {
				$('#trk-p-1a').slider('disable');
				$('#trk-p-1b').slider('disable');
				$('#trk-pt-1a').slider('disable');
				$('#trk-pt-1b').slider('disable');
				$('#trk-eta-1a').slider('disable');
				$('#trk-eta-1b').slider('disable');
				$('#trk-phi-1a').slider('disable');
				$('#trk-phi-1b').slider('disable');
			}
		});

		$( "#color-popup" ).on( "popupbeforeposition", ( event, ui ) => { // eslint-disable-line no-unused-vars
			let palette = this.display.GDMLimporter.settings.palette;
			$('#palette-name').val( palette ).attr('selected', true).siblings('option').removeAttr('selected');
			$('#palette-name').selectmenu('refresh');
			$("#palette-start-index").val( this.display.GDMLimporter.palette_index_start ).slider('refresh');
			$('#track-color-name').val( this.display.EVENTimporter.track_color_theme ).attr('selected', true).siblings('option').removeAttr('selected');
			$('#track-color-name').selectmenu('refresh');
		});

		$('#palette-name').on('change', function(e) { // eslint-disable-line no-unused-vars
			let palette = this.value;
			$("#palette-start-index").attr("min", 0).attr("max", palettes_sizes[ palette ] - 1 ).val( 0 ).slider('refresh');
		});


		$( "#camera-popup" ).on( "popupbeforeposition", ( event, ui ) => { // eslint-disable-line no-unused-vars
			$('#camera-x').val( this.display.camera.position.x );
			$('#camera-x').slider('refresh');
			$('#camera-y').val( this.display.camera.position.y );
			$('#camera-y').slider('refresh');
			$('#camera-z').val( this.display.camera.position.z );
			$('#camera-z').slider('refresh');
			let background = $('#edisplay').data('bgcolor') || 'black',
				fov = this.display.camera.fov;
			$('input:radio[name="camera-up"]').filter('[value="y"]').attr('checked',true).checkboxradio('refresh');
			$('input:radio[name="camera-background"]').filter('[value="'+background+'"]').attr('checked',true).checkboxradio('refresh');
			$('input:radio[name="camera-fov"]').filter('[value="'+fov+'"]').attr('checked',true).checkboxradio('refresh');
		});

		$( "#tree-popup" ).on( "popupbeforeposition", ( event, ui ) => { // eslint-disable-line no-unused-vars
			if ( Array.isArray( this.display.GDMLimporter.startVolumeRef ) ) {
				let res = [];
				for ( let i = 0; i < this.display.GDMLimporter.startVolumeRef.length; i++ ) {
					if ( this.display.GDMLimporter.worldrefsvislevel[ this.display.GDMLimporter.startVolumeRef[i] ] ) {
						res.push( this.display.GDMLimporter.startVolumeRef[i] + '!' + this.display.GDMLimporter.worldrefsvislevel[ this.display.GDMLimporter.startVolumeRef[i] ] );
					} else {
						res.push( this.display.GDMLimporter.startVolumeRef[i] );
					}
				}
				$('#tree-WorldRef').val( res.join(' ') );
			} else {
				$('#tree-WorldRef').val( this.display.GDMLimporter.startVolumeRef + ( this.display.GDMLimporter.worldrefsvislevel[ this.display.GDMLimporter.startVolumeRef ] ? '!' + this.display.GDMLimporter.worldrefsvislevel[ this.display.GDMLimporter.startVolumeRef ] : '' ) );
			}
			let refs = this.display.GDMLimporter.WorldRefs,
				refsbuttons = [];
			for ( let i = 0; i < refs.length; i++ ) {
				refsbuttons.push( '<button id="tree-popup-but-'+i+'" data-vislevel="'+this.display.GDMLimporter.worldrefs[refs[i]]+'" class="tree-popup-btn ui-btn ui-corner-all ui-shadow ui-btn-inline">'+refs[i]+'</button>' );
			}
			$('#tree-popup-worldrefs').empty().append( refsbuttons.join(' ') ).trigger('create');
			$('.tree-popup-btn').on('click', function() {
				$('#tree-WorldRef').val( $(this).text() );
				$('#tree-VisLevel').val( $(this).data('vislevel') );
				$('#tree-VisLevel').slider('refresh');
			});
			$('#tree-VisLevel').val( this.display.GDMLimporter.VisLevel );
			$('#tree-VisLevel').slider('refresh');
			$('input:radio[name="tree-VisEdges"]').filter('[value="'+this.display.GDMLimporter.VisEdges+'"]').attr('checked',true).checkboxradio('refresh');
		});

		$( "#animation-popup" ).on( "popupbeforeposition", ( event, ui ) => { // eslint-disable-line no-unused-vars
			let rot = this.display.is_rotating;
			$('input:radio[name="AniRotation"]').filter('[value="'+rot+'"]').attr('checked',true).checkboxradio('refresh');
		});

		$( "#collections-popup" ).on( "popupbeforeposition", ( event, ui ) => { // eslint-disable-line no-unused-vars
			let ctr = 1;
			console.log('adding new rows to the table');
			$( "#collections-table tbody" ).empty();
			for ( let prop in this.collections ) {
				$( "#collections-table tbody" ).append(
					"<tr>"
						+ "<th>" + ctr + "</th>"
						+ "<th><a href=\"#\" id=\"collections-"+ ctr +"\" data-cid=\"" + prop + "\">" + this.collections[ prop ].desc + "</a></th>"
						+ "<th>" + this.collections[ prop ].species + "</th>"
						+ "<th>" + this.collections[ prop ].energy + "</th>"
						+ "<th>" + this.collections[ prop ].year + "</th>"
					+ "</tr>"
				);
				let that = this;
				$( '#collections-' + ctr ).click( async function() {
					await that.display.hide_event_collection();
					await that.display.set_event_collection( 'events/' + that.collections[ $(this).data('cid') ].file );
					if ( that.display.event_collection ) {
						await that.display.show_event_collection();
						that.display.render();
					}
					// close dialog
					$('#collections-popup').popup('close');
				});
				ctr += 1;
			}
		});

		$( "#geometry-popup" ).on( "popupbeforeposition", ( event, ui ) => { // eslint-disable-line no-unused-vars
			$('input:radio[name="geometry-trans"]').filter('[value="0"]').attr('checked',true).checkboxradio('refresh');
			$('input[name="geometry-merge"]').attr('checked',true).checkboxradio('refresh');
		});

		$('#geometry-popup-apply').on('click', async () => {
			let file_remote = $('#geometry-remote').val(),
				file_local = $('#geometry-local')[0].files[0],
				file_list = $('#geometry-list').val(),
				geometry_merge = $('#geometry-merge').prop("checked");

			let geometry_trans = parseInt( $('#geometry-trans :radio:checked').val() );

			$('#geometry-popup').popup('close');
			this.display.GDMLimporter.MergeVolumes = geometry_merge ? true : false;

			if ( geometry_trans > 0 ) {
				this.display.GDMLimporter.LiquidBoundary = 1E10;
			} else if ( geometry_trans < 0 ) {
				this.display.GDMLimporter.LiquidBoundary = this.display.GDMLimporter.GasBoundary;
			}

			if ( file_remote ) {
				await this.display.load_gdml_as_file( file_remote );
			} else if ( file_local ) {
				await this.display.load_gdml_as_uploadfile( file_local );
			} else if ( file_list && file_list.length > 0 ) {
				await this.display.load_gdml_as_file( file_list );
			}
			$('#tree-WorldRef').text( this.display.GDMLimporter.startVolumeRef );
			await this.display.add_detector();
			this.display.reset_camera();
			this.display.render();
			$('#volume_counter').text('volumes: ' + this.display.GDMLimporter.counters.placedvolumes );
		});

		$('#hit-cuts-popup-apply').on('click', async() => {
			this.display.EVENTimporter.cuts.hits.e.cmin = parseFloat( $('#hit-e-1a').val() );
			this.display.EVENTimporter.cuts.hits.e.cmax = parseFloat( $('#hit-e-1b').val() );
			this.display.EVENTimporter.cuts.hits.eta.cmin = parseFloat( $('#hit-eta-1a').val() );
			this.display.EVENTimporter.cuts.hits.eta.cmax = parseFloat( $('#hit-eta-1b').val() );
			this.display.EVENTimporter.cuts.hits.phi.cmin = parseFloat( $('#hit-phi-1a').val() );
			this.display.EVENTimporter.cuts.hits.phi.cmax = parseFloat( $('#hit-phi-1b').val() );
			this.display.EVENTimporter.cuts.hits.preserve = $('#hit-cuts-preserve').prop('checked');
			console.log('preserve hit cuts: ' + this.display.EVENTimporter.cuts.hits.preserve );
			$('#hit-cuts-popup').popup('close');
			this.display.EVENTimporter.parse_hits( this.display.EVENTimporter.evt );
			this.display.EVENTimporter.parse_tracks( this.display.EVENTimporter.evt );
			this.display.render();
		});

		$('#track-cuts-popup-apply').on('click', async() => {
			this.display.EVENTimporter.cuts.tracks.p.cmin = parseFloat( $('#trk-p-1a').val() );
			this.display.EVENTimporter.cuts.tracks.p.cmax = parseFloat( $('#trk-p-1b').val() );
			this.display.EVENTimporter.cuts.tracks.pt.cmin = parseFloat( $('#trk-pt-1a').val() );
			this.display.EVENTimporter.cuts.tracks.pt.cmax = parseFloat( $('#trk-pt-1b').val() );
			this.display.EVENTimporter.cuts.tracks.eta.cmin = parseFloat( $('#trk-eta-1a').val() );
			this.display.EVENTimporter.cuts.tracks.eta.cmax = parseFloat( $('#trk-eta-1b').val() );
			this.display.EVENTimporter.cuts.tracks.phi.cmin = parseFloat( $('#trk-phi-1a').val() );
			this.display.EVENTimporter.cuts.tracks.phi.cmax = parseFloat( $('#trk-phi-1b').val() );
			this.display.EVENTimporter.cuts.tracks.charge = parseInt( $('#trk-c').val() );
			this.display.EVENTimporter.cuts.tracks.preserve = $('#track-cuts-preserve').prop('checked');
			console.log( 'preserve track cuts: ' + this.display.EVENTimporter.cuts.tracks.preserve );
			$('#track-cuts-popup').popup('close');
			this.display.EVENTimporter.parse_hits( this.display.EVENTimporter.evt );
			this.display.EVENTimporter.parse_tracks( this.display.EVENTimporter.evt );
			this.display.render();
		});

		$('#event-popup-apply').on('click', async () => {
			let file_remote = $('#event-remote').val(),
				file_local = $('#event-local')[0].files[0],
				file_list = $('#event-list').val(),
				collection_remote = $('#event-collection-remote').val();

			$('#event-popup').popup('close');
			await this.display.hide_event_collection();

			if ( collection_remote && collection_remote.length > 1 ) {
				await this.display.set_event_collection( collection_remote );
				if ( this.display.event_collection ) {
					await this.display.show_event_collection();
				}
			} else if ( file_remote || file_local || ( file_list && file_list.length > 0 ) ) {
				if ( file_remote && file_remote.length > 1 ) {
					await this.display.load_event_as_file( file_remote );
				} else if ( file_local ) {
					await this.display.load_event_as_uploadfile( file_local );
				} else if ( file_list && file_list.length > 0 ) {
					await this.display.load_event_as_file( file_list );
				}
				this.display.add_event();
				await this.display.add_detector();
				this.display.render();
			} else {
				this.display.remove_event();
			}

			// cleanup
			$('#event-collection-remote').val( '' );
			$('#event-remote').val( '' );

			this.display.render();
		});

		$('#visibility-popup-apply').on('click', async () => {
			let VisWorld = $('#VisWorld :radio:checked').val(),
				VisAxes  = $('#VisAxes :radio:checked').val(),
				VisContainers = $('#VisContainers :radio:checked').val();

			switch( VisAxes ) {
				case '2':
					this.display.ShowArrows = true;
					this.display.ShowBbox = false;
					this.display.VisAxes = true;
					break;
				case '1':
					this.display.ShowBbox = true;
					this.display.ShowArrows = false;
					this.display.VisAxes = true;
					break;
				case '3':
				default:
					this.display.ShowBbox = false;
					this.display.ShowArrows = false;
					this.display.VisAxes = false;
					break;
			}
			//this.display.VisAxes = ( VisAxes === 'false' ) ? false : true;
			if ( this.display.GDMLimporter.updateParameters({ VisWorld: VisWorld === 'true' ? true : false,
					VisContainers: VisContainers === 'true' ? true : false }) ) {
				await this.display.add_detector();
			}
			this.display.render();

			let logs_visible = $('#log_window').is(":visible"),
				logs_vis = $('#VisLogs :radio:checked').val();
			console.log( 'logs_visible: ' + logs_visible );
			console.log( 'logs_vis: ' + logs_vis );
			if ( logs_visible !== logs_vis ) {
				if ( logs_vis === false || logs_vis === 'false' ) {
					$('#log_window').hide(0);
					console.log('hiding #log_window');
				} else {
					$('#log_window').show(0);
					console.log('showing #log_window');
				}
			}

			$('#visibility-popup').popup('close');
		});

		$('#clip-popup-apply').on('click', async () => {
			let VisClip = $('#VisClip :radio:checked').val(),
				VisClipInvert = !$('#VisClipInvert').prop("checked");
			this.display.GDMLimporter.updateParameters({ VisClip, VisClipInvert });
			this.display.render();

			$('#clip-popup').popup('close');
		});

		$('#tree-popup-apply').on('click', async () => {
			let WorldRef = $('#tree-WorldRef').val(),
				VisLevel = $('#tree-VisLevel').val(),
				VisEdges  = $('#tree-VisEdges :radio:checked').val(),
				params = {};
			if ( WorldRef && WorldRef.length > 0 ) { params.WorldRef = WorldRef; }
			if ( VisLevel && !isNaN( VisLevel ) ) { params.VisLevel = parseInt( VisLevel ); }
			if ( VisEdges ) { params.VisEdges = isNaN(VisEdges) ? false : parseInt( VisEdges ); }
			$('#tree-popup').popup('close');
			if ( this.display.GDMLimporter.updateParameters( params ) ) {
				await this.display.add_detector();
				this.display.render();
				$('#volume_counter').text('volumes: ' + this.display.GDMLimporter.counters.placedvolumes );
			}
		});

		$('#camera-popup-apply').on('click', () => {
			// camera is TBD
			let x = $('#camera-x').val() | 0, y = $('#camera-y').val() | 0, z = $('#camera-z').val() | 0,
				tx = $('#target-x').val() | 0, ty = $('#target-y').val() | 0, tz = $('#target-z').val() | 0,
				up = $('#camera-up :radio:checked').val(),
				background = $('#camera-background :radio:checked').val(),
				fov = $('#camera-fov :radio:checked').val();

			if ( ( fov === 'ortho' && this.display.camera.type === 'OrthographicCamera') ||
				( fov === this.display.camera.fov ) ) {
				// noop, same camera settings
			} else {
				if ( fov === 'ortho' ) {
					console.log( 'switching to ortho camera' );
					this.display.set_camera('ortho');
					this.display.camera.updateProjectionMatrix();
				} else {
					fov = parseInt(fov);
					console.log('setting perspective camera fov to: ' + fov );
					this.display.set_camera();
					this.display.camera.fov = fov;
					this.display.camera.updateProjectionMatrix();
				}
			}

			this.display.camera.position.set( x, y, z );
			this.display.camera.lookAt( new THREE.Vector3( tx, ty, tz ) );
			switch( up ) {
				case 'x':
					this.display.camera.up.set( 1, 0, 0 );
					break;
				case 'y':
					this.display.camera.up.set( 0, 1, 0 );
					break;
				case 'z':
					this.display.camera.up.set( 0, 0, 1 );
					break;
			}

			let item = $('#edisplay');
			item[0].style.removeProperty('background-color');
			item[0].style.setProperty('background-color', background, 'important');

			this.display.render();

			$('#camera-popup').popup('close');
		});

		$('#animation-popup-apply').on('click', async () => {
			let rot = $('#AniRotation :radio:checked').val();
			this.display.set_rotation( rot );
			$('#animation-popup').popup('close');
		});

		$('#color-popup-apply').on('click', async () => {
			let palette_start_index = $('#palette-start-index').val(),
				palette_name = $('#palette-name option:selected').val();
			this.display.GDMLimporter.palette_index_start = parseInt( palette_start_index );
			this.display.GDMLimporter.palette_index = this.display.GDMLimporter.palette_index_start;
			this.display.GDMLimporter.VisPalette = palette_name;
			let track_color_name = $('#track-color-name option:selected').val();
			this.display.EVENTimporter.track_color_theme = track_color_name;
			$('#color-popup').popup('close');
			this.display.EVENTimporter.parse_tracks( this.display.EVENTimporter.evt );
			this.display.render();
		});

		$('#screenshot-popup-apply').on('click', async () => {
			let size = $('#ScreenShot :radio:checked').val() | 0;
			let { width:oldsize_x, height:oldsize_y } = this.display.renderer.getSize();
			$('#screenshot-popup').popup('close');
			let left, right, top, bottom;
			if ( this.display.camera.type === 'OrthographicCamera' ) {
				left = this.display.camera.left;
				right = this.display.camera.right;
				top = this.display.camera.top;
				bottom = this.display.camera.bottom;
			}

			let canvas, svgRenderer, XMLS, file, blob;

			switch (size) {
				case 1:
					if ( this.display.camera.type === 'PerspectiveCamera' ) {
						this.display.camera.aspect = 1.0;
					} else {
						this.display.camera.left   = -512;
						this.display.camera.right  =  512;
						this.display.camera.top    =  512;
						this.display.camera.bottom = -512;
					}
					this.display.camera.updateProjectionMatrix();
                    this.display.renderer.setSize( 512, 512 );
					this.display.render();
					break;
				case 2:
					if ( this.display.camera.type === 'PerspectiveCamera' ) {
						this.display.camera.aspect = 1.0;
					} else {
						this.display.camera.left   = -1024;
						this.display.camera.right  =  1024;
						this.display.camera.top    =  1024;
						this.display.camera.bottom = -1024;
					}
					this.display.camera.updateProjectionMatrix();
                    this.display.renderer.setSize( 1024, 1024 );
					this.display.render();
					break;
				case 3:
					if ( this.display.camera.type === 'PerspectiveCamera' ) {
						this.display.camera.aspect = 1.0;
					} else {
						this.display.camera.left   = -2048;
						this.display.camera.right  =  2048;
						this.display.camera.top    =  2048;
						this.display.camera.bottom = -2048;
					}
					this.display.camera.updateProjectionMatrix();
                    this.display.renderer.setSize( 2048, 2048 );
					this.display.render();
					break;
				case 4:
					if ( this.display.camera.type === 'PerspectiveCamera' ) {
						this.display.camera.aspect = 1.0;
					} else {
						this.display.camera.left   = -4096;
						this.display.camera.right  =  4096;
						this.display.camera.top    =  4096;
						this.display.camera.bottom = -4096;
					}
					this.display.camera.updateProjectionMatrix();
                    this.display.renderer.setSize( 4096, 4096 );
					this.display.render();
					break;
				case 5:
					if ( this.display.camera.type === 'PerspectiveCamera' ) {
						this.display.camera.aspect = 1.0;
					} else {
						this.display.camera.left   = -8192;
						this.display.camera.right  =  8192;
						this.display.camera.top    =  8192;
						this.display.camera.bottom = -8192;
					}
					this.display.camera.updateProjectionMatrix();
                    this.display.renderer.setSize( 8192, 8192 );
					this.display.render();
					break;
				case 6: 
					canvas = $( '#' + this.display.parameters.canvas_id );
					svgRenderer = new SVGRenderer();
					if ( this.display.camera.type === 'PerspectiveCamera' ) {
						console.log('tuning perspective');
						this.display.camera.aspect = 1.0;
					} else {
						console.log('tuning ortho');
						this.display.camera.left   = -canvas.innerHeight();
						this.display.camera.right  =  canvas.innerHeight();
						this.display.camera.top    =  canvas.innerHeight();
						this.display.camera.bottom = -canvas.innerHeight();
					}
					this.display.camera.updateProjectionMatrix();

					svgRenderer.setClearColor( 0xf0f0f0 );
					svgRenderer.setSize( canvas.innerHeight(), canvas.innerHeight() );
					svgRenderer.setQuality( 'low' );
					svgRenderer.render( this.display.scene, this.display.camera );
					XMLS = new XMLSerializer();
					file = XMLS.serializeToString( svgRenderer.domElement );

					if ( this.display.camera.type === 'PerspectiveCamera' ) {
						console.log('restoring perspective');
						this.display.camera.aspect = oldsize_x / oldsize_y;
					} else {
						console.log('restoring ortho');
						this.display.camera.left   = left;
						this.display.camera.right  = right;
						this.display.camera.top    = top;
						this.display.camera.bottom = bottom;
					}
					this.display.camera.updateProjectionMatrix();

					blob = new Blob( [ file ], { type: "image/svg+xml" } );
					FileSaver.saveAs( blob, 'screenshot-'+Date.now()+'.svg' );

					return;
				case 0:
				default:
					console.log('dump default');
					// do not resize screen
					break;
			}

			let image = this.display.renderer.domElement.toDataURL('image/png').replace("image/png", "image/octet-stream");
			$('#hidden_screenshot')[0].href = image;
			$('#hidden_screenshot')[0].download = 'screenshot-'+Date.now()+'.png';
			$('#hidden_screenshot')[0].click();

            this.display.renderer.setSize( oldsize_x, oldsize_y );
			if ( this.display.camera.type === 'PerspectiveCamera' ) {
				this.display.camera.aspect = oldsize_x / oldsize_y;
			} else {
				this.display.camera.left = left;
				this.display.camera.right = right;
				this.display.camera.top = top;
				this.display.camera.bottom = bottom;
			}
			this.display.camera.updateProjectionMatrix();
			this.display.render();

		});

    }

	progressOpen() {
		$('#progress-placeholder').empty();
		$('<input>').appendTo('#progress-placeholder').attr({'name':'slider','id':'progress-slider','data-highlight':'true',
			'min': 0,'max': 100,'value': 1,'type':'range'}).slider({
			create: function( event, ui ) { // eslint-disable-line no-unused-vars
				$(this).parent().find('input').hide();
				$(this).parent().find('.ui-slider-track').css('margin','0 15px 0 15px');
				$(this).parent().find('.ui-slider-handle').hide();
			}
		}).slider();
		this.progressSetValue('', 0);
		$('#progress-popup').popup('open', { transition: 'none' });
	}

	progressSetValue( name, value ) {
		$('#progress-title').html( name );
		$('#progress-slider').val( value );
		$('#progress-slider').slider('refresh');
	}

	progressClose() {
		$('#progress-popup').popup('close');
	}

	async onResize() {
		let obj = $('.ui-content');
		let width = obj.width(), height = obj.height();
		let c = $('#webglcanvas');
		c.css({ width: width + 'px', height: height+'px' });
		c[0].width = width;
		c[0].height = height;

		if ( !this.checkGL() ) { return; }

		await this.display.init();

		this.display.start();

		if ( this.display.GDMLimporter && this.display.GDMLimporter.text !== false ) {
			// skip geometry selection dialogue if one exists already
			return;
		}

		// check initial parameters or open file selection popup
        let par = this.display.get_query_params();
        if ( par && Object.keys(par).length > 0 ) {
			if ( par.file ) {
				this.display.GDMLimporter.updateParameters( par );
				if ( par.trans ) {
					this.display.GDMLimporter.LiquidBoundary = 1E10;
				}
				await this.display.load_gdml_as_file( par.file ); // load and parse
				$('#tree-WorldRef').text( this.display.GDMLimporter.startVolumeRef );
				await this.display.add_detector();
				this.display.render();
			}

			if ( par.event ) {
				await this.display.load_event_as_file( par.event ); // load and parse
				this.display.add_event();
				await this.display.add_detector();
				this.display.render();

			} else if ( par.collection ) {
				await this.display.set_event_collection( par.collection );
				if ( this.display.event_collection ) {
					await this.display.show_event_collection();
				}
			}
			this.display.reset_camera();
			this.display.render();
        } else {
				$('#panel_2').panel('open');
			$('#geometry-popup').popup('open');
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

	checkGL() {
		if ( Detector.webgl ) { return true; }
		this.displayError( 'WebGL is not supported', 'Your browser (or your OS) does not support WebGL technology, required by the Event Display. Please try a different browser or different OS.' );
		return false;
	}

	displayError( title, body ) {
		$('#error-title').text( title );
		$('#error-message').text( body );
		$('#error-popup').popup('open', { transition: 'none' });
	}

	displayWarning( title, body ) {
		$('#warning-title').text( title );
		$('#warning-message').text( body );
		$('#warning-popup').popup('open', { transition: 'none' });
	}

}