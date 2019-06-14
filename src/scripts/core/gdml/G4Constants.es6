
import G4Units from './G4Units';

let G4Constants = {};

G4Constants.pi = 3.14159265358979323846;
G4Constants.twopi = 2 * G4Constants.pi;
G4Constants.halfpi = G4Constants.pi / 2;
G4Constants.pi2 = G4Constants.pi * G4Constants.pi;

G4Constants.Avogadro = 6.02214179e+23 / G4Units.mole;

G4Constants.c_light   = 2.99792458e+8 * G4Units.m / G4Units.s;
G4Constants.c_squared = G4Constants.c_light * G4Constants.c_light;

G4Constants.h_Planck      = 6.62606896e-34 * G4Units.joule * G4Units.s;
G4Constants.hbar_Planck   = G4Constants.h_Planck / G4Constants.twopi;
G4Constants.hbarc         = G4Constants.hbar_Planck * G4Constants.c_light;
G4Constants.hbarc_squared = G4Constants.hbarc * G4Constants.hbarc;

G4Constants.electron_charge = -G4Units.eplus;
G4Constants.e_squared = G4Units.eplus * G4Units.eplus;

G4Constants.electron_mass_c2 = 0.510998910 * G4Units.MeV;
G4Constants.proton_mass_c2 = 938.272013 * G4Units.MeV;
G4Constants.neutron_mass_c2 = 939.56536 * G4Units.MeV;
G4Constants.amu_c2 = 931.494028 * G4Units.MeV;
G4Constants.amu = G4Constants.amu_c2 / G4Constants.c_squared;
G4Constants.mu0 = 4 * G4Constants.pi * 1.e-7 * G4Units.henry / G4Units.m;
G4Constants.epsilon0 = 1. / ( G4Constants.c_squared * G4Constants.mu0 );

G4Constants.elm_coupling = G4Constants.e_squared / ( 4 * G4Constants.pi * G4Constants.epsilon0 );
G4Constants.fine_structure_const = G4Constants.elm_coupling / G4Constants.hbarc;

G4Constants.classic_electr_radius  = G4Constants.elm_coupling / G4Constants.electron_mass_c2;
G4Constants.electron_Compton_length = G4Constants.hbarc / G4Constants.electron_mass_c2;
G4Constants.Bohr_radius = G4Constants.electron_Compton_length / G4Constants.fine_structure_const;
G4Constants.alpha_rcl2 = G4Constants.fine_structure_const;
G4Constants.twopi_mc2_rcl2 = G4Constants.twopi * G4Constants.electron_mass_c2
G4Constants.k_Boltzmann = 8.617343e-11 * G4Units.MeV / G4Units.kelvin;
G4Constants.STP_Temperature = 273.15 * G4Units.kelvin;
G4Constants.STP_Pressure    = 1. * G4Units.atmosphere;
G4Constants.kGasThreshold   = 10. * G4Units.mg / G4Units.cm3;
G4Constants.universe_mean_density = 1.e-25 * G4Units.g / G4Units.cm3;

export default G4Constants;