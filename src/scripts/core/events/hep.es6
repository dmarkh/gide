// 
// NPP.js: set of javascript classes related to Nuclear and Particle Physics
// 

var HEP = HEP || {};

HEP.clone = function(obj) {
    if(obj == null || typeof(obj) != 'object') {
        return obj;
	}
	if (obj instanceof Object) {
		var copy = {};
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) { 
				copy[attr] = HEP.clone(obj[attr]);
			} else {
				copy[attr] = obj[attr];
			}
		}
		return copy;
	}
}

HEP.ThreeVector = function(X1,X2,X3) {
	if (typeof X1 == "undefined") X1 = 0;
	if (typeof X2 == "undefined") X2 = 0;
	if (typeof X3 == "undefined") X3 = 0;

	this.mX1 = parseFloat(X1);
	this.mX2 = parseFloat(X2);
	this.mX3 = parseFloat(X3);

};

HEP.ThreeVector.prototype = {

	// Setters
	setX : function (X) {
		this.mX1 = parseFloat(X);
	},
	setY : function (Y) {
		this.mX2 = parseFloat(Y);
	},
	setZ : function (Z) {
		this.mX3 = parseFloat(Z);
	},
	set : function(X,Y,Z) {
		if (typeof X == "undefined") X = 0;
		if (typeof Y == "undefined") Y = 0;
		if (typeof Z == "undefined") Z = 0;
		this.mX1 = parseFloat(X);
		this.mX2 = parseFloat(Y);
		this.mX3 = parseFloat(Z);
	},

	// Getters
	x : function() { 
		return this.mX1;
	},
	y : function() {
		return this.mX2;
	},
	z : function() {
		return this.mX3;
	},

	getXYZ: function() { // get all three params as array [x,y,z]
		return [this.mX1, this.mX2, this.mX3];
	},

	getXYZasObj: function() { // get all three params as simple object
		return {"x": this.mX1, "y": this.mX2, "z": this.mX3};
	},

	// Functions 
    theta : function() {
		return ( Math.acos( this.cosTheta() ) );
	},
    cosTheta : function() {
		return ( this.mX3 / ( this.mag() + 1e-20 ) );
	},
	phi : function() {
		return ( Math.atan2( this.mX2, this.mX1 ) );
	},
    perp : function() {
		return ( Math.sqrt( this.mX1 * this.mX1 + this.mX2 * this.mX2 ) );
	},
    perp2 : function() {
		return ( this.mX1 * this.mX1 + this.mX2 * this.mX2 );		
	},
    magnitude : function() {
		return ( this.mag() );
	},
    mag : function() {
		return ( Math.sqrt( this.mX1 * this.mX1 + this.mX2 * this.mX2 + this.mX3 * this.mX3 ) );
	},
    mag2 : function() {
		return ( this.mX1 * this.mX1 + this.mX2 * this.mX2 + this.mX3 * this.mX3 );
	},
    pseudoRapidity : function() {
		var tmp = Math.tan( this.theta() / 2. ); 
		if (tmp <=0.) return 1e20;
		return ( -Math.log(tmp) );
	},

	multiply : function(val) {
		this.mX1 *= val;
		this.mX2 *= val;
		this.mX3 *= val;
		return this;
	},

	divide : function(val) {
		this.mX1 /= val;
		this.mX2 /= val;
		this.mX3 /= val;
		return this;
	},

	add : function(val) {
		this.mX1 += val;
		this.mX2 += val;
		this.mX3 += val;
		return this;
	},

	sub : function(val) {
		this.mX1 -= val;
		this.mX2 -= val;
		this.mX3 -= val;
		return this;
	},

	addVector: function(v) {
		this.mX1 += v.x();
		this.mX2 += v.y();
		this.mX3 += v.z();
		return this;
	},

	subVector: function(v) {
		this.mX1 -= v.x();
		this.mX2 -= v.y();
		this.mX3 -= v.z();
		return this;
	},

	unit : function() {
		var tot = this.mag2();
		var p = new HEP.ThreeVector(this.mX1, this.mX2, this.mX3);
		if (tot > 0.0) { p.multiply(1.0/Math.sqrt(tot)); }
		return p;
	},

	dump : function() {
		return (this.mX1 + ', ' + this.mX2 + ', ' + this.mX3);
	},

	round: function(dec_places) {
		var r = new HEP.ThreeVector();
		var ind = 100;
		if (dec_places !== undefined) {
			ind = Math.pow(10, parseInt(dec_places));
		}
		r.setX(Math.round(this.x() * ind) / ind);
		r.setY(Math.round(this.y() * ind) / ind);
		r.setZ(Math.round(this.z() * ind) / ind);
		return r;
	}
};

//
// Helix code, works with magnetic field aligned along Z axis only
//

HEP.Helix = function() {

    this.mSingularity = true;	// true for straight line case (B=0)
    this.mOrigin = HEP.ThreeVector(0,0,0); // HEP.ThreeVector
    this.mDipAngle = 0;
    this.mCurvature = 0;
    this.mPhase = 0;
    this.mH = 0;			// -sign(q*B);

    this.mCosDipAngle = 0;
    this.mSinDipAngle = 0;
    this.mCosPhase = 0;
    this.mSinPhase = 0;

};

HEP.Helix.prototype = {

	// Setters
	setParameters : function(curvature, dipAngle, phase, origin, h) {
		h = parseFloat(h);
		this.mH = ( h >= 0 ) ? 1.0 : -1.0;
		this.mOrigin = origin;
		this.setDipAngle(dipAngle);
		this.setPhase(phase);
		this.setCurvature(curvature);
		if (this.mSingularity && this.mH == -1) {
			this.mH = +1;
			this.setPhase(this.mPhase - Math.PI);
		}
	},
	setDipAngle : function(dipAngle) {
		this.mDipAngle = parseFloat(dipAngle);
		this.mCosDipAngle = Math.cos(dipAngle);
		this.mSinDipAngle = Math.sin(dipAngle);
	},
	setPhase : function(phase) {
		this.mPhase	= parseFloat(phase);
		this.mCosPhase = Math.cos(phase);
		this.mSinPhase = Math.sin(phase);
		if (Math.abs(phase) > Math.PI) {
			this.mPhase = Math.atan2(this.mSinPhase, this.mCosPhase);  // force range [-pi,pi]
		}
	},
	setCurvature: function(curvature) {
		curvature = parseFloat(curvature);
		if (curvature < 0) {
			this.mCurvature = -curvature;
			this.mH = -this.mH;
			this.setPhase(this.mPhase + Math.PI);
		} else {
			this.mCurvature = curvature;
		}
		if (Math.abs(this.mCurvature) <= 0.000000001) {
			this.mSingularity = true; // straight line
		} else {
			this.mSingularity = false;            	// curved		
		}
	},

	// Getters
	h : function() {
		return (this.mH);
	},

	dipAngle : function() {
		return (this.mDipAngle);
	},

	curvature : function() {
		return (this.mCurvature);
	},

	phase : function() {
		return (this.mPhase);
	},

	origin : function() {
		return (this.mOrigin);
	},

	// Functions
	x : function(s) {
		s = parseFloat( s );
		if (this.mSingularity == true) {
			return ( this.mOrigin.x() - s * this.mCosDipAngle * this.mSinPhase );
		} else {
			return ( this.mOrigin.x() + (Math.cos(this.mPhase + s * this.mH * this.mCurvature * this.mCosDipAngle) - this.mCosPhase ) / this.mCurvature );
		}
	},
	y : function(s) {
		s = parseFloat( s );
		if (this.mSingularity == true) {
			return ( this.mOrigin.y() + s * this.mCosDipAngle * this.mCosPhase );
		} else {
			return ( this.mOrigin.y() + (Math.sin(this.mPhase + s * this.mH * this.mCurvature * this.mCosDipAngle) - this.mSinPhase ) / this.mCurvature );
		}
	},
	z : function(s) {
		s = parseFloat(s);
		return ( this.mOrigin.z() + s * this.mSinDipAngle );
	},

	at : function(s) {
		return new HEP.ThreeVector( this.x( s ), this.y( s ), this.z( s ) );
	},

	xcenter : function () {
		if (this.mSingularity) {
			return 0;
		} else {
			return ( this.mOrigin.x() - this.mCosPhase / this.mCurvature );
		}
	},

	ycenter : function() {
		if (this.mSingularity) {
			return 0;
		} else {
			return ( this.mOrigin.y() - this.mSinPhase / this.mCurvature );
		}
	},

	moveOrigin : function( s ) {
		if ( this.mSingularity ) {
			this.mOrigin = this.at( s );
		} else {
			let newOrigin = this.at( s ),
				newPhase = Math.atan2( newOrigin.y() - this.ycenter(), newOrigin.x() - this.xcenter() );
			this.mOrigin = newOrigin;
			this.setPhase(newPhase);
		}
	},

	// Utility
	dump : function() {
		return ( 'singularity: '+ this.mSingularity + ', ang: ' + this.mDipAngle + ', curv: ' + this.mCurvature + ', phase: ' + this.mPhase + ', h: ' + this.mH 
			+ ', cosDipA: ' + this.mCosDipAngle + ', sinDipA: ' + this.mSinDipAngle + ', cosPhase: ' + this.mCosPhase + ', sinPhase: ' + this.mSinPhase 
			+ ', o_x: ' + this.mOrigin.x() + ', o_y: ' + this.mOrigin.y() + ', o_z: ' + this.mOrigin.z() );
	}

};
// 
// Helix code, works with magnetic field aligned along Z axis only
// 

HEP.PhysicalHelix = function( p, o, B, q ) { // momentum, origin => ThreeVector
    // momentum = always GeV
	// origin = always meters
	// B = always tesla, no conversions..
	HEP.Helix.call( this );
	this.setPhysParameters( p, o, B, q );
};

HEP.PhysicalHelix.prototype = new HEP.Helix();
HEP.PhysicalHelix.prototype.constructor = HEP.Helix;

HEP.PhysicalHelix.prototype.setPhysParameters = function ( p, o, B, q ) {

	q = parseFloat(q);
	B = parseFloat(B);

    this.mH = ( q * B <= 0 ) ? 1 : -1;
    this.mOrigin = o;

	this.setDipAngle( Math.atan2( p.z(), p.perp() ) );

    if ( p.y() == 0 && p.x() == 0 ) {
		this.setPhase( ( Math.PI / 4 ) * ( 1 - 2. * this.mH ) );
    } else {
		this.setPhase( Math.atan2( p.y(), p.x() ) - this.mH * Math.PI / 2.0 );
	}

	this.c_light = 2.99792e10;
	this.nanosecond = 1e-09;
	this.tesla = 1e-13;
	this.meter = 100;
    this.GeV = 1;

	B = B * this.tesla;

	var top = ( this.c_light * this.nanosecond / this.meter * q * B / this.tesla );
	var bot = ( p.mag() / this.GeV * this.mCosDipAngle ) ;
	var ext = this.meter;
	var sum = top / bot / ext;

	this.setCurvature( Math.abs( sum ) );
}

HEP.PhysicalHelix.prototype.momentum = function ( B ) {
	this.c_light = 2.99792e10;
	this.nanosecond = 1e-09;
	this.tesla = 1e-13;
	this.meter = 100;
    this.GeV = 1;
	B = B * this.tesla;

    if (this.mSingularity) {
		return( new HEP.ThreeVector(0,0,0) );
	} else {
		var pt = this.GeV * Math.abs(this.c_light * this.nanosecond / this.meter * B / this.tesla ) / ( Math.abs(this.mCurvature) * this.meter);
		return ( new HEP.ThreeVector(pt * Math.cos(this.mPhase + this.mH * Math.PI / 2),
				pt * Math.sin(this.mPhase+this.mH * Math.PI / 2),
				pt * Math.tan(this.mDipAngle) ) );
	}
}

HEP.PhysicalHelix.prototype.momentumAt = function(S, B) {
    var tmp = HEP.clone(this);
    tmp.moveOrigin(S);
    return tmp.momentum(B);
}

HEP.MagField = function() {
	this.mType = 0; // 0 = const, 1 = map, 2 = user defined;
};

HEP.MagField.prototype = {

	// field type
	getType: function() { return this.mType; },
	setType: function(val) { this.mType = val; },

	// point = { "x": 0, "y": 0, "z": 0 }
	getFieldValue: function( point ) { // eslint-disable-line no-unused-vars
		return {"x": 0, "y": 0, "z": 0}; // must be implemented in inheriting classes
	},
	// point = { "x": 0, "y": 0, "z": 0 }
	getFieldValueObj: function( point ) { // eslint-disable-line no-unused-vars
		return new HEP.ThreeVector(0,0,0); // must be implemented in inheriting classes
	},
	getBx: function( point ) { // eslint-disable-line no-unused-vars
		return 0;
	},
	getBy: function( point ) { // eslint-disable-line no-unused-vars
		return 0;
	},
	getBz: function( point ) { // eslint-disable-line no-unused-vars
		return 0;
	}

};
//
// Combined magnetic field object
// returns sum of the known magnetic fields 
//

HEP.MultiMagField = function() {
	this.mType = 0; // 0 = const, 1 = map, 2 = user defined, 3 = multifield;
	this.mFields = [];
};

HEP.MultiMagField.prototype = {

	// field type
	getType: function() { return this.mType; },
	setType: function(val) { this.mType = val; },	

	addMagField: function(field) { this.mFields.push(field); },

	getFieldValue: function(point) { // point = { "x": 0, "y": 0, "z": 0 }
		var result = {"x": 0, "y": 0, "z": 0};
		this.mFields.forEach(function(e) {
			result["x"] += e.getBx(point);
			result["y"] += e.getBy(point);
			result["z"] += e.getBz(point);
		});
		return result;
	},

	getFieldValueObj: function(point) {
		var tmp = this.getFieldValue(point);
		var result = new HEP.ThreeVector(tmp["x"], tmp["y"], tmp["z"]);
		return result;
	},

	getBx: function(point) {
		var result = 0;
		this.mFields.forEach(function(e) {
			result += e.getBx(point);
		});
		return result;
	},

	getBy: function(point) {
		var result = 0;
		this.mFields.forEach(function(e) {
			result += e.getBy(point);
		});
		return result;
	},

	getBz: function(point) {
		var result = 0;
		this.mFields.forEach(function(e) {
			result += e.getBz(point);
		});
		return result;
	}
};
//
// Constant magnetic field
//

HEP.ConstMagField = function(Bx, By, Bz) {
	HEP.MagField.call( this );
	this.mField = { "x": Bx, "y": By, "z": Bz };
	this.setType(0);
};

HEP.ConstMagField.prototype = new HEP.MagField();
HEP.ConstMagField.prototype.constructor = HEP.MagField;

HEP.ConstMagField.prototype.getFieldValue = function ( point ) { // eslint-disable-line no-unused-vars
	return this.mField;
};
HEP.ConstMagField.prototype.getFieldValueObj = function ( point ) { // eslint-disable-line no-unused-vars
	return new HEP.ThreeVector(this.mField.x, this.mField.y, this.mField.z);
};

HEP.ConstMagField.prototype.getBx = function ( point ) { // eslint-disable-line no-unused-vars
	return this.mField.x;
};

HEP.ConstMagField.prototype.getBy = function ( point ) { // eslint-disable-line no-unused-vars
	return this.mField.y;
};

HEP.ConstMagField.prototype.getBz = function ( point ) { // eslint-disable-line no-unused-vars
	return this.mField.z;
};

// 
// Magnetic field / Bz. 
// positive when Z is > 0, negative when Z < 0
// 


HEP.ConstMagField2 = function(Bz) {
	HEP.MagField.call( this );
	this.mField = { "x": 0, "y": 0, "z": Bz };
	this.setType(2);
};

HEP.ConstMagField2.prototype = new HEP.MagField();
HEP.ConstMagField2.prototype.constructor = HEP.MagField;

HEP.ConstMagField2.prototype.getFieldValue = function ( point ) {
	if (point.z > 0) {
		return {"x": this.mField.x, "y": this.mField.y, "z": this.mField.z };
	}
		return {"x": this.mField.x, "y": this.mField.y, "z": -this.mField.z };
};
HEP.ConstMagField2.prototype.getFieldValueObj = function ( point ) {
	if (point.z > 0) {
		return new HEP.ThreeVector(this.mField.x, this.mField.y, this.mField.z);
	}
		return new HEP.ThreeVector(this.mField.x, this.mField.y, -this.mField.z);
};

HEP.ConstMagField2.prototype.getBx = function ( point ) { // eslint-disable-line no-unused-vars
	return this.mField.x;
};

HEP.ConstMagField2.prototype.getBy = function ( point ) { // eslint-disable-line no-unused-vars
	return this.mField.y;
};

HEP.ConstMagField2.prototype.getBz = function ( point ) { // eslint-disable-line no-unused-vars
	if (point.z > 0) {
		return this.mField.z;
	}
	return -this.mField.z;
};

// 
// Implementation of the Runge-Kutta method for the particle in magnetic field
// Ported to js from ROOT codes (C++)
//

HEP.RungeKutta = function() {

	this.mField = new HEP.ConstMagField(0,0,0.5);

	this.mCharge = 0; // particle charge -1, 0, +1
	this.mStep = 1.0; // track step, cm
	this.mOrigin = new HEP.ThreeVector(0,0,0); 
	this.mDirection = new HEP.ThreeVector(0,0,0);
	this.mMomentum = 0; // GeV, scalar

	this.vout = []; // output array of size 7

	// CONSTANTS: units cm, gev/c and tesla
	this.MAXIT  = 10;
	this.MAXCUT = 11;

	this.HMIN   = 1e-4;
	this.KDLT   = 1e-3;
	this.KDLT32 = this.KDLT/32.;
	this.KTHIRD = 1./3.;
	this.KHALF  = 0.5;
	this.KEC    = 2.9979251e-3;

	this.KPISQUA = 9.86960440109;
	this.KIX  = 0;
	this.KIY  = 1;
	this.KIZ  = 2;
	this.KIPX = 3;
	this.KIPY = 4;
	this.KIPZ = 5;

}

HEP.RungeKutta.prototype = {

	setMagField: function(field) {
		delete this.mField;
		this.mField = field;
	},

	getMagField: function(x, y, z) {
		return this.mField.getFieldValue({"x": x, "y": y, "z": z}); // returns field vector 
	},

	getOrigin: function() {
		return HEP.clone(this.mOrigin);
	},

	getMomentum: function() {
		var ret = HEP.clone(this.mDirection);
			ret.multiply(this.mMomentum);
		return ret;
	},

	init : function(charge, origin, direction, momentum, step) {
		if (charge !== undefined) { this.mCharge = charge; }
		if (origin !== undefined) { this.mOrigin = origin; }
		if (direction !== undefined) { this.mDirection = direction; }
		if (momentum !== undefined) { this.mMomentum = momentum; }
		if (step !== undefined) { this.mStep = step; }
	},

	update : function() {
		delete this.mOrigin;
		this.mOrigin = new HEP.ThreeVector(this.vout[0], this.vout[1], this.vout[2]);
		delete this.mDirection;
		this.mDirection = new HEP.ThreeVector(this.vout[3], this.vout[4], this.vout[5]);
		delete this.mMomentum;
		this.mMomentum = this.vout[6];
	},

	step : function() { 

		var h2, h4;
		var f = []; // array of size 4
		var a, b, c, ph,ph2;
		var secxs = []; // array of size 4
		var secys = []; // array of size 4
		var seczs = []; // array of size 4
		var hxp = []; // array of size 4
		var g1, g2, g3, g4, g5, g6, ang2, dxt, dyt, dzt;
		var est, at, bt, ct, cba;
		var f1, f2, f3, f4, rho, tet, hnorm, hp, rho1, sint, cost;
		var x, y, z;
		var xt, yt, zt;

		var vect = []; // array of size 7

		var tmp_field; // tmp field var

		vect[0] = this.mOrigin.x();
		vect[1] = this.mOrigin.y();
		vect[2] = this.mOrigin.z();
		vect[3] = this.mDirection.x();
		vect[4] = this.mDirection.y();
		vect[5] = this.mDirection.z();
		vect[6] = this.mMomentum;

		var iter = 0;
		var ncut = 0;

		for(var j = 0; j < 7; j++) {
			this.vout[j] = vect[j];
		}

		var pinv   = this.KEC * this.mCharge / vect[6];
		var tl     = 0.;
		var h      = this.mStep;
		var rest;

		do {
			rest  = this.mStep - tl;
			if (Math.abs(h) > Math.abs(rest)) { h = rest; }

			tmp_field = this.getMagField(this.mOrigin.x(), this.mOrigin.y(), this.mOrigin.z());
			f[0] = tmp_field.x;
			f[1] = tmp_field.y;
			f[2] = tmp_field.z;

			// start of integration
			x = this.vout[0];
			y = this.vout[1];
			z = this.vout[2];
			a = this.vout[3];
			b = this.vout[4];
			c = this.vout[5];

			h2 = this.KHALF * h;
			h4 = this.KHALF * h2;
			ph = pinv * h;
			ph2 = this.KHALF * ph;

			secxs[0] = (b * f[2] - c * f[1]) * ph2;
			secys[0] = (c * f[0] - a * f[2]) * ph2;
			seczs[0] = (a * f[1] - b * f[0]) * ph2;
			ang2 = (secxs[0]*secxs[0] + secys[0]*secys[0] + seczs[0]*seczs[0]);

			if (ang2 > this.KPISQUA) {
				console.log("ang2 > KPISQUA");
				break;
			}

			dxt = h2 * a + h4 * secxs[0];
			dyt = h2 * b + h4 * secys[0];
			dzt = h2 * c + h4 * seczs[0];
			xt = x + dxt;
			yt = y + dyt;
			zt = z + dzt;

			// * second intermediate point
			est = Math.abs(dxt) + Math.abs(dyt) + Math.abs(dzt);
			if (est > h) {
				if (ncut++ > this.MAXCUT) {
					console.log("ncut++ > MAXCUT");
					break;
				}
				h *= this.KHALF;
				continue;
			}

			tmp_field = this.getMagField(xt, yt, zt);
			f[0] = tmp_field.x;
			f[1] = tmp_field.y;
			f[2] = tmp_field.z;			

			at = a + secxs[0];
			bt = b + secys[0];
			ct = c + seczs[0];

			secxs[1] = (bt * f[2] - ct * f[1]) * ph2;
			secys[1] = (ct * f[0] - at * f[2]) * ph2;
			seczs[1] = (at * f[1] - bt * f[0]) * ph2;
			at = a + secxs[1];
			bt = b + secys[1];
			ct = c + seczs[1];
			secxs[2] = (bt * f[2] - ct * f[1]) * ph2;
			secys[2] = (ct * f[0] - at * f[2]) * ph2;
			seczs[2] = (at * f[1] - bt * f[0]) * ph2;
			dxt = h * (a + secxs[2]);
			dyt = h * (b + secys[2]);
			dzt = h * (c + seczs[2]);
			xt = x + dxt;
			yt = y + dyt;
			zt = z + dzt;
			at = a + 2.*secxs[2];
			bt = b + 2.*secys[2];
			ct = c + 2.*seczs[2];

			est = Math.abs(dxt)+Math.abs(dyt)+Math.abs(dzt);
			if (est > 2.*Math.abs(h)) {
				if (ncut++ > this.MAXCUT) {
					console.log("ncut++ > MAXCUT");
					break;
				}
				h *= this.KHALF;
				continue;
			}

			tmp_field = this.getMagField(xt, yt, zt);
			f[0] = tmp_field.x;
			f[1] = tmp_field.y;
			f[2] = tmp_field.z;			

			z = z + (c + (seczs[0] + seczs[1] + seczs[2]) * this.KTHIRD) * h;
			y = y + (b + (secys[0] + secys[1] + secys[2]) * this.KTHIRD) * h;
			x = x + (a + (secxs[0] + secxs[1] + secxs[2]) * this.KTHIRD) * h;

			secxs[3] = (bt*f[2] - ct*f[1])* ph2;
			secys[3] = (ct*f[0] - at*f[2])* ph2;
			seczs[3] = (at*f[1] - bt*f[0])* ph2;
			a = a+(secxs[0]+secxs[3]+2. * (secxs[1]+secxs[2])) * this.KTHIRD;
			b = b+(secys[0]+secys[3]+2. * (secys[1]+secys[2])) * this.KTHIRD;
			c = c+(seczs[0]+seczs[3]+2. * (seczs[1]+seczs[2])) * this.KTHIRD;

			est = Math.abs(secxs[0]+secxs[3] - (secxs[1]+secxs[2]))
					+ Math.abs(secys[0]+secys[3] - (secys[1]+secys[2]))
					+ Math.abs(seczs[0]+seczs[3] - (seczs[1]+seczs[2]));

			if (est > this.KDLT && Math.abs(h) > this.HMIN) {
				if (ncut++ > this.MAXCUT) {
					console.log("ncut++ > MAXCUT");
					break;
				}
				h *= this.KHALF;
				continue;
			}

			ncut = 0;

			// * if too many iterations, go to helix
			if (iter++ > this.MAXIT) { 
				console.log("iter++ > MAXIT - too many iterations, use helix");
				break;
			}

			tl += h;
			if (est < this.KDLT32) { h *= 2.; }
			cba = 1./ Math.sqrt(a*a + b*b + c*c);
			this.vout[0] = x;
			this.vout[1] = y;
			this.vout[2] = z;
			this.vout[3] = cba*a;
			this.vout[4] = cba*b;
			this.vout[5] = cba*c;
			rest = this.mStep - tl;
			if (this.mStep < 0.) rest = -rest;
			if (rest < 1.e-5 * Math.abs(this.mStep)) {
				return;
			}
		} while (1); // eslint-disable-line no-constant-condition

		f1  = f[0];
		f2  = f[1];
		f3  = f[2];
		f4  = Math.sqrt(f1*f1+f2*f2+f3*f3);
		rho = -f4*pinv;
		tet = rho * this.mStep;

		hnorm = 1./f4;
		f1 = f1*hnorm;
		f2 = f2*hnorm;
		f3 = f3*hnorm;

		hxp[0] = f2*vect[this.KIPZ] - f3*vect[this.KIPY];
		hxp[1] = f3*vect[this.KIPX] - f1*vect[this.KIPZ];
		hxp[2] = f1*vect[this.KIPY] - f2*vect[this.KIPX];

		hp = f1*vect[this.KIPX] + f2*vect[this.KIPY] + f3*vect[this.KIPZ];

		rho1 = 1./rho;
		sint = Math.sin(tet);
		cost = 2.*Math.sin(this.KHALF*tet)*Math.sin(this.KHALF*tet);

		g1 = sint*rho1;
		g2 = cost*rho1;
		g3 = (tet-sint) * hp * rho1;
		g4 = -cost;
		g5 = sint;
		g6 = cost * hp;

		this.vout[this.KIX] = vect[this.KIX] + g1*vect[this.KIPX] + g2*hxp[0] + g3*f1;
		this.vout[this.KIY] = vect[this.KIY] + g1*vect[this.KIPY] + g2*hxp[1] + g3*f2;
		this.vout[this.KIZ] = vect[this.KIZ] + g1*vect[this.KIPZ] + g2*hxp[2] + g3*f3;

		this.vout[this.KIPX] = vect[this.KIPX] + g4*vect[this.KIPX] + g5*hxp[0] + g6*f1;
		this.vout[this.KIPY] = vect[this.KIPY] + g4*vect[this.KIPY] + g5*hxp[1] + g6*f2;
		this.vout[this.KIPZ] = vect[this.KIPZ] + g4*vect[this.KIPZ] + g5*hxp[2] + g6*f3;

	}

}
//
// Helix code, works with any magnetic field orientation. 
// Extracted from RungeKutta.js
//

HEP.AnyHelix = function() {

    this.mField = new HEP.ConstMagField(0,0,0.5);
    this.mCharge = 0; // particle charge -1, 0, +1
    this.mOrigin = new HEP.ThreeVector(0,0,0);
    this.mDirection = new HEP.ThreeVector(0,0,0);
    this.mMomentum = 0; // GeV, scalar

    this.mStep = 1.0; // track step, cm

    this.vout = []; // output array of size 7

    // CONSTANTS: units cm, gev/c and tesla
    this.MAXIT  = 10;
    this.MAXCUT = 11;

    this.HMIN   = 1e-4;
    this.KDLT   = 1e-3;
    this.KDLT32 = this.KDLT/32.;
    this.KTHIRD = 1./3.;
    this.KHALF  = 0.5;
    this.KEC    = 2.9979251e-3;

    this.KPISQUA = 9.86960440109;
    this.KIX  = 0;
    this.KIY  = 1;
    this.KIZ  = 2;
    this.KIPX = 3;
    this.KIPY = 4;
    this.KIPZ = 5;

};

HEP.AnyHelix.prototype = {

    init : function(charge, origin, direction, momentum, step ) {
        if (charge !== undefined) { this.mCharge = charge; }
        if (origin !== undefined) { this.mOrigin = origin; }
        if (direction !== undefined) { this.mDirection = direction; }
        if (momentum !== undefined) { this.mMomentum = momentum; }
        if (step !== undefined) { this.mStep = step; } else { step = 1.0; }
    },

    setMagField: function(field) {
        delete this.mField;
        this.mField = field;
    },

    getMagField: function(x, y, z) {
        return this.mField.getFieldValue({"x": x, "y": y, "z": z}); // returns field vector 
    },

    getOrigin: function() {
        return HEP.clone(this.mOrigin);
    },

    getMomentum: function() {
        var ret = HEP.clone(this.mDirection);
            ret.multiply(this.mMomentum);
        return ret;
    },

	step : function(step) {
		if (step !== undefined) {
			this.mStep = step;
		}

		var f = []; // array of size 4
        var hxp = []; // array of size 4
        var g1, g2, g3, g4, g5, g6;
        var f1, f2, f3, f4, rho, tet, hnorm, hp, rho1, sint, cost;
        var vect = []; // array of size 7
        var tmp_field; // tmp field var

        vect[0] = this.mOrigin.x();
        vect[1] = this.mOrigin.y();
        vect[2] = this.mOrigin.z();
        vect[3] = this.mDirection.x();
        vect[4] = this.mDirection.y();
        vect[5] = this.mDirection.z();
        vect[6] = this.mMomentum;

        for(var j = 0; j < 7; j++) {
            this.vout[j] = vect[j];
        }

        tmp_field = this.getMagField(this.mOrigin.x(), this.mOrigin.y(), this.mOrigin.z());
        f[0] = tmp_field.x;
        f[1] = tmp_field.y;
        f[2] = tmp_field.z;

		var pinv   = this.KEC * this.mCharge / vect[6];

        f1  = f[0];
        f2  = f[1];
        f3  = f[2];

        f4  = Math.sqrt(f1*f1+f2*f2+f3*f3);
        rho = -f4*pinv;
        tet = rho * this.mStep;

        hnorm = 1./f4;
        f1 = f1*hnorm;
        f2 = f2*hnorm;
        f3 = f3*hnorm;

        hxp[0] = f2*vect[this.KIPZ] - f3*vect[this.KIPY];
        hxp[1] = f3*vect[this.KIPX] - f1*vect[this.KIPZ];
        hxp[2] = f1*vect[this.KIPY] - f2*vect[this.KIPX];

        hp = f1*vect[this.KIPX] + f2*vect[this.KIPY] + f3*vect[this.KIPZ];

        rho1 = 1./rho;
        sint = Math.sin(tet);
        cost = 2.*Math.sin(this.KHALF*tet)*Math.sin(this.KHALF*tet);

        g1 = sint*rho1;
        g2 = cost*rho1;
        g3 = (tet-sint) * hp * rho1;
        g4 = -cost;
        g5 = sint;
        g6 = cost * hp;

        this.vout[this.KIX] = vect[this.KIX] + g1*vect[this.KIPX] + g2*hxp[0] + g3*f1;
        this.vout[this.KIY] = vect[this.KIY] + g1*vect[this.KIPY] + g2*hxp[1] + g3*f2;
        this.vout[this.KIZ] = vect[this.KIZ] + g1*vect[this.KIPZ] + g2*hxp[2] + g3*f3;

        this.vout[this.KIPX] = vect[this.KIPX] + g4*vect[this.KIPX] + g5*hxp[0] + g6*f1;
        this.vout[this.KIPY] = vect[this.KIPY] + g4*vect[this.KIPY] + g5*hxp[1] + g6*f2;
        this.vout[this.KIPZ] = vect[this.KIPZ] + g4*vect[this.KIPZ] + g5*hxp[2] + g6*f3;

		return ( { "pos": [this.vout[0],this.vout[1],this.vout[2]], "dir": [this.vout[3],this.vout[4],this.vout[5]], "mom": this.vout[6] } );
	}
};

export default HEP;
