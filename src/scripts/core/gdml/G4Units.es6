
let G4Units = { };

G4Units.millimeter  = 1.;
G4Units.millimeter2 = G4Units.millimeter * G4Units.millimeter;
G4Units.millimeter3 = G4Units.millimeter * G4Units.millimeter * G4Units.millimeter;

G4Units.centimeter  = 10. * G4Units.millimeter;
G4Units.centimeter2 = G4Units.centimeter * G4Units.centimeter;
G4Units.centimeter3 = G4Units.centimeter * G4Units.centimeter * G4Units.centimeter;

G4Units.meter  = 1000. * G4Units.millimeter;
G4Units.meter2 = G4Units.meter * G4Units.meter;
G4Units.meter3 = G4Units.meter * G4Units.meter * G4Units.meter;

G4Units.kilometer  = 1000. * G4Units.meter;
G4Units.kilometer2 = G4Units.kilometer * G4Units.kilometer;
G4Units.kilometer3 = G4Units.kilometer * G4Units.kilometer * G4Units.kilometer;

G4Units.parsec = 3.0856775807e+16 * G4Units.meter;

G4Units.micrometer= 1.e-6  * G4Units.meter;
G4Units.nanometer = 1.e-9  * G4Units.meter;
G4Units.angstrom  = 1.e-10 * G4Units.meter;
G4Units.fermi     = 1.e-15 * G4Units.meter;

G4Units.millibarn = 1.e-3 * G4Units.barn;
G4Units.microbarn = 1.e-6 * G4Units.barn;
G4Units.nanobarn = 1.e-9 * G4Units.barn;
G4Units.picobarn = 1.e-12 * G4Units.barn;

G4Units.nm  = G4Units.nanometer;
G4Units.um  = G4Units.micrometer;

G4Units.mm  = G4Units.millimeter;
G4Units.mm2 = G4Units.millimeter2;
G4Units.mm3 = G4Units.millimeter3;

G4Units.cm  = G4Units.centimeter;
G4Units.cm2 = G4Units.centimeter2;
G4Units.cm3 = G4Units.centimeter3;

G4Units.m  = G4Units.meter;
G4Units.m2 = G4Units.meter2;
G4Units.m3 = G4Units.meter3;

G4Units.km  = G4Units.kilometer;
G4Units.km2 = G4Units.kilometer2;
G4Units.km3 = G4Units.kilometer3;
G4Units.pc  = G4Units.parsec;

G4Units.radian      = 1.;
G4Units.milliradian = 1.e-3 * G4Units.radian;
G4Units.degree = ( 3.14159265358979323846 / 180.0 ) * G4Units.radian;
G4Units.steradian = 1.;

G4Units.rad  = G4Units.radian;
G4Units.mrad = G4Units.milliradian;
G4Units.sr   = G4Units.steradian;
G4Units.deg  = G4Units.degree;

G4Units.nanosecond  = 1.;
G4Units.second      = 1.e+9 * G4Units.nanosecond;
G4Units.millisecond = 1.e-3 * G4Units.second;
G4Units.microsecond = 1.e-6 * G4Units.second;
G4Units.picosecond  = 1.e-12 * G4Units.second;

G4Units.hertz = 1. / G4Units.second;
G4Units.kilohertz = 1.e+3 * G4Units.hertz;
G4Units.megahertz = 1.e+6 * G4Units.hertz;

G4Units.ns = G4Units.nanosecond;
G4Units.s  = G4Units.second;
G4Units.ms = G4Units.millisecond;

G4Units.eplus = 1. ;
G4Units.e_SI  = 1.602176487e-19;
G4Units.coulomb = G4Units.eplus / G4Units.e_SI;

G4Units.megaelectronvolt = 1. ;
G4Units.electronvolt = 1.e-6 * G4Units.megaelectronvolt;
G4Units.kiloelectronvolt = 1.e-3 * G4Units.megaelectronvolt;
G4Units.gigaelectronvolt = 1.e+3 * G4Units.megaelectronvolt;
G4Units.teraelectronvolt = 1.e+6 * G4Units.megaelectronvolt;
G4Units.petaelectronvolt = 1.e+9 * G4Units.megaelectronvolt;
G4Units.joule = G4Units.electronvolt / G4Units.e_SI;

G4Units.MeV = G4Units.megaelectronvolt;
G4Units.eV  = G4Units.electronvolt;
G4Units.keV = G4Units.kiloelectronvolt;
G4Units.GeV = G4Units.gigaelectronvolt;
G4Units.TeV = G4Units.teraelectronvolt;
G4Units.PeV = G4Units.petaelectronvolt;

G4Units.kilogram = G4Units.joule * G4Units.second * G4Units.second / ( G4Units.meter * G4Units.meter);
G4Units.gram = 1.e-3 * G4Units.kilogram;
G4Units.milligram = 1.e-3 * G4Units.gram;

G4Units.kg = G4Units.kilogram;
G4Units.g  = G4Units.gram;
G4Units.mg = G4Units.milligram;

G4Units.watt = G4Units.joule / G4Units.second;
G4Units.newton = G4Units.joule / G4Units.meter;
G4Units.hep_pascal = G4Units.newton / G4Units.m2;
G4Units.bar        = 100000 * G4Units.pascal;
G4Units.atmosphere = 101325 * G4Units.pascal;

G4Units.ampere = G4Units.coulomb / G4Units.second;
G4Units.milliampere = 1.e-3 * G4Units.ampere;
G4Units.microampere = 1.e-6 * G4Units.ampere;
G4Units.nanoampere = 1.e-9 * G4Units.ampere;

G4Units.megavolt = G4Units.megaelectronvolt / G4Units.eplus;
G4Units.kilovolt = 1.e-3 * G4Units.megavolt;
G4Units.volt = 1.e-6 * G4Units.megavolt;

G4Units.ohm = G4Units.volt / G4Units.ampere;

G4Units.farad = G4Units.coulomb / G4Units.volt;
G4Units.millifarad = 1.e-3 * G4Units.farad;
G4Units.microfarad = 1.e-6 * G4Units.farad;
G4Units.nanofarad = 1.e-9 * G4Units.farad;
G4Units.picofarad = 1.e-12 * G4Units.farad;

G4Units.weber = G4Units.volt * G4Units.second;
G4Units.tesla     = G4Units.volt * G4Units.second / G4Units.meter2;
G4Units.gauss     = 1.e-4 * G4Units.tesla;
G4Units.kilogauss = 1.e-1 * G4Units.tesla;

G4Units.henry = G4Units.weber / G4Units.ampere;
G4Units.kelvin = 1.;
G4Units.mole = 1.;

G4Units.becquerel = 1. / G4Units.second;
G4Units.curie = 3.7e+10 * G4Units.becquerel;
G4Units.kilobecquerel = 1.e+3 * G4Units.becquerel;
G4Units.megabecquerel = 1.e+6 * G4Units.becquerel;
G4Units.gigabecquerel = 1.e+9 * G4Units.becquerel;
G4Units.millicurie = 1.e-3 * G4Units.curie;

G4Units.microcurie = 1.e-6 * G4Units.curie;
G4Units.Bq  = G4Units.becquerel;
G4Units.kBq = G4Units.kilobecquerel;
G4Units.MBq = G4Units.megabecquerel;
G4Units.GBq = G4Units.gigabecquerel;
G4Units.Ci  = G4Units.curie;
G4Units.mCi = G4Units.millicurie;
G4Units.uCi = G4Units.microcurie;

G4Units.gray = G4Units.joule / G4Units.kilogram ;
G4Units.kilogray = 1.e+3 * G4Units.gray;
G4Units.milligray = 1.e-3 * G4Units.gray;
G4Units.microgray = 1.e-6 * G4Units.gray;

G4Units.candela = 1.;
G4Units.lumen = G4Units.candela * G4Units.steradian;
G4Units.lux = G4Units.lumen / G4Units.meter2;
G4Units.perCent     = 0.01 ;
G4Units.perThousand = 0.001;
G4Units.perMillion  = 0.000001;

export default G4Units;

