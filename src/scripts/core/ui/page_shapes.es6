
export default class UIPageShapes {

    constructor() {

    }

    async init() {
        console.log('UIPageShapes:init');
		$('body').append(`
			<div data-role="page" id="shapes">
				<div data-role="header" data-position="fixed" data-tap-toggle="false">
					<h1>GEOMETRY SOLIDS</h1>
				</div>
				<div role="main" class="ui-content">
<table data-role="table" id="shapes-table" class="ui-responsive table-stripe table-stroke">
	<thead>
		<tr> <th>Name</th> <th>Display</th> <th><nobr>Geant 3</nobr></th> <th><nobr>ROOT/TGeo</nobr></th> <th><nobr>Geant 4</nobr></th> <th>GDML</th> <th>VecGeo</th> </tr>
	</thead>
	<tbody>
	<tr> <td>Box</td>			<td>Geo.box</td>			<td>BOX </td> <td>TGeoBBox</td>		<td>G4Box</td>				<td>box</td> 		<td>Box</td>			</tr>
	<tr> <td>Trapezoid, X</td>	<td>Geo.trd1</td>			<td>TRD1</td> <td>TGeoTrd1</td>		<td>(=G4Trd)</td>			<td>(=trd)</td>		<td>(=Trd)</td>			</tr>
	<tr> <td>Trapezoid, X/Y</td><td>Geo.trd2</td>			<td>TRD2</td> <td>TGeoTrd2</td>		<td>G4Trd</td>				<td>trd</td>		<td>Trd</td>			</tr>
	<tr> <td>General Trapezoid</td><td>Geo.trap</td>		<td>TRAP</td> <td>TGeoTrap</td>		<td>G4Trap</td>				<td>trap</td>		<td>Trapezoid</td>			</tr>
	<tr> <td>Tube</td>			<td>Geo.tube</td>			<td>TUBE</td> <td>TGeoTube</td>		<td>(=G4Tubs)</td>			<td>(=tube)</td>	<td>(=Tube)</td>				</tr>
	<tr> <td>Tube Segment</td>	<td>Geo.tubs</td>			<td>TUBS</td> <td>TGeoTubeSeg</td>	<td>G4Tubs</td>				<td>tube</td>		<td>Tube</td>			</tr>
	<tr> <td>Cone</td>			<td>Geo.cone</td>			<td>CONE</td> <td>TGeoCone</td> 	<td>(=G4Cons)</td>			<td>(=cone)</td>	<td>(=Cone)</td>				</tr>
	<tr> <td>Cone Segment</td>	<td>Geo.cons</td>			<td>CONS</td> <td>TGeoConeSeg</td>	<td>G4Cons</td>				<td>cone</td>		<td>Cone</td>			</tr>
	<tr> <td>Sphere</td>		<td>Geo.sphe</td>			<td>SPHE</td> <td>TGeoSphere</td>	<td>G4Sphere</td>			<td>sphere</td>		<td>Sphere</td>			</tr>
	<tr> <td>Parallelepiped</td><td>Geo.para</td>			<td>PARA</td> <td>TGeoPara</td>		<td>G4Para</td>				<td>para</td>		<td>Parallelepiped</td>			</tr>
	<tr> <td>Polygone</td>		<td>Geo.pgon</td>			<td>PGON</td> <td>TGeoPgon</td>		<td>G4Polyhedra</td>		<td>polyhedra</td>	<td>Polyhedron</td>			</tr>
	<tr> <td>Polycone</td>		<td>Geo.pcon</td>			<td>PCON</td> <td>TGeoPcon</td>		<td>G4Polycone</td>			<td>polycone</td>	<td>Polycone</td>			</tr>
	<tr> <td>Elliptical Tube</td><td>Geo.eltu</td>		<td>ELTU</td> <td>TGeoEltu</td>		<td>G4EllipticalTube</td>	<td>eltube</td>		<td>(=scaled Tube)</td>			</tr>
	<tr> <td>Hyperboloid</td>	<td>Geo.hype</td>			<td>HYPE</td> <td>TGeoHype</td>		<td>G4Hype</td> 			<td>hype</td>		<td>Hype</td>			</tr>
	<tr> <td>Twisted Trapezoid</td><td>Geo.gtra</td>		<td>GTRA</td> <td>TGeoGtra</td>		<td>G4TwistedTrap</td>		<td>twistedtrap</td>	<td></td>		</tr>
	<tr> <td>Cut Tube</td>		<td>Geo.ctub</td>			<td>CTUB</td> <td>TGeoCtub</td>		<td>G4CutTubs</td>			<td>cutTube</td>		<td>CutTube</td>		</tr>
	<tr> <td>Torus</td>			<td>Geo.torus</td>		<td>    </td> <td>TGeoTorus</td>	<td>G4Torus</td>			<td>torus</td>			<td>Torus</td>		</tr>
	<tr> <td>Ellipsoid</td>		<td>Geo.ellipsoid</td>	<td>(scaled SPHE)</td> <td>(=scaled sphere)</td><td>G4Ellipsoid</td>		<td>ellipsoid</td>	<td>(=scaled Orb)</td>			</tr>
	<tr> <td>Elliptical Cone</td><td>Geo.elcone</td><td>(scaled CONE?)  </td> <td>(=scaled cone?)</td><td>G4EllipticalCone</td>	<td>elcone</td>	<td>(=scaled Tube)</td>			</tr>
	<tr> <td>Tetrahedra</td>	<td>Geo.tet</td>			<td>    </td> <td>(=TGeoArb8?)</td> 	<td>G4Tet</td>				<td>tet</td>	<td>(=GenTrap)</td>				</tr>
	<tr> <td>Arbitrary 8 vertices</td><td>Geo.arb8</td>	<td>    </td> <td>TGeoArb8</td>		<td>G4GenericTrap?</td>		<td>arb8</td>		<td>GenTrap</td>			</tr>
	<tr> <td>Paraboloid</td>	<td>Geo.paraboloid</td>	<td>    </td> <td>TGeoParaboloid</td><td>G4Paraboloid</td> 		<td>paraboloid</td>	<td>Paraboloid</td>			</tr>
	<tr> <td>Extrusion</td>		<td>Geo.xtru</td>		<td>    </td> <td>TGeoXtru</td>		<td>G4ExtrudedSolid</td> 	<td>xtru</td>		<td>(=GenTrap)</td>			</tr>
	<tr> <td>Simple Extrusion</td>		<td>Geo.sxtru</td>		<td>    </td> <td></td>		<td></td> 	<td></td>		<td>SExtru</td>			</tr>
	<tr> <td>Hollow Sphere</td>	<td> Geo.orb </td>		<td>(=SPHE)</td> <td>(=TGeoSphere)</td> <td>G4Orb</td>				<td>orb</td>	<td>Orb</td>				</tr>
	<tr> <td>Twisted Box</td>	<td>(=Geo.box)</td>		<td>(=GTRA?)</td> <td>(=TGeoGtra?)</td> 	<td>G4TwistedBox</td>		<td>twistedbox</td>	<td></td>		</tr>
	<tr> <td>Twisted Gen. Trapezoid</td><td>(=Geo.trd2)</td><td>(=GTRA?)</td> <td>(=TGeoGtra?)</td> 	<td>G4TwistedTrd</td>		<td>twistedtrd</td>	<td></td>			</tr>
	<tr> <td>Twisted Tube Segment</td><td>(=Geo.tubs)</td>	<td>    </td> <td></td> 			<td>G4TwistedTubs</td>		<td>twistedtubs</td>	<td></td>		</tr>
	<tr> <td>Tessellated Solid</td><td>Geo.tessellated</td>				<td>	</td> <td></td> 			<td>G4TessellatedSolid</td>					<td>tessellated</td>	<td></td>		</tr>
	<tr> <td colspan="7"><hr></hr></td> </tr>
	<tr> <td>Bolean Operations on Solids</td>	<td>ThreeCSG: union, subtract, intersect</td>	<td></td> <td>TGeoCompositeShape</td> <td>G4UnionSolid, G4IntersectionSolid, G4SubtractionSolid</td> <td>union, subtraction, intersection, MultiUnion</td> <td>BooleanVolume</td> </tr>
	</tbody>
	<tfoot>
		<tr> <th>Name</th> <th>Display</th> <th><nobr>Geant 3</nobr></th> <th><nobr>ROOT/TGeo</nobr></th> <th><nobr>Geant 4</nobr></th> <th>GDML</th> <th>VecGeo</th> </tr>
	</tfoot>
</table>

				</div>
				<div data-role="footer" data-position="fixed" data-tap-toggle="false">
					<a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow">BACK</a>
				</div>
			</div>
		`);

    }

}

