
let G4Materials = {

	// Pure materials

	"G4_H":		{ "D": 8.3748e-05, "I": 19.2 },
	"G4_He":	{ "D": 0.000166322, "I": 41.8 },
	"G4_Li":	{ "D": 0.534, "I": 40 },
	"G4_Be":	{ "D": 1.848, "I": 63.7 },
	"G4_B":		{ "D": 2.37, "I": 76 },
	"G4_C":		{ "D": 2, "I": 81 },
	"G4_N":		{ "D": 0.0011652, "I": 82 },
	"G4_O":		{ "D": 0.00133151, "I": 95 },
	"G4_F":		{ "D": 0.00158029, "I": 115 },
	"G4_Ne":	{ "D": 0.000838505, "I": 137 },
	"G4_Na":	{ "D": 0.971, "I": 149 },
	"G4_Mg":	{ "D": 1.74, "I": 156 },
	"G4_Al":	{ "D": 2.699, "I": 166 },
	"G4_Si":	{ "D": 2.33, "I": 173 },
	"G4_P":		{ "D": 2.2, "I": 173 },
	"G4_S":		{ "D": 2, "I": 180 },
	"G4_Cl":	{ "D": 0.00299473, "I": 174 },
	"G4_Ar":	{ "D": 0.00166201, "I": 188 },
	"G4_K":		{ "D": 0.862, "I": 190 },
	"G4_Ca":	{ "D": 1.55, "I": 191 },
	"G4_Sc":	{ "D": 2.989, "I": 216 },
	"G4_Ti":	{ "D": 4.54, "I": 233 },
	"G4_V":		{ "D": 6.11, "I": 245 },
	"G4_Cr":	{ "D": 7.18, "I": 257 },
	"G4_Mn":	{ "D": 7.44, "I": 272 },
	"G4_Fe":	{ "D": 7.874, "I": 286 },
	"G4_Co":	{ "D": 8.9, "I": 297 },
	"G4_Ni":	{ "D": 8.902, "I": 311 },
	"G4_Cu":	{ "D": 8.96, "I": 322 },
	"G4_Zn":	{ "D": 7.133, "I": 330 },
	"G4_Ga":	{ "D": 5.904, "I": 334 },
	"G4_Ge":	{ "D": 5.323, "I": 350 },
	"G4_As":	{ "D": 5.73, "I": 347 },
	"G4_Se":	{ "D": 4.5, "I": 348 },
	"G4_Br":	{ "D": 0.0070721, "I": 343 },
	"G4_Kr":	{ "D": 0.00347832, "I": 352 },
	"G4_Rb":	{ "D": 1.532, "I": 363 },
	"G4_Sr":	{ "D": 2.54, "I": 366 },
	"G4_Y":		{ "D": 4.469, "I": 379 },
	"G4_Zr":	{ "D": 6.506, "I": 393 },
	"G4_Nb":	{ "D": 8.57, "I": 417 },
	"G4_Mo":	{ "D": 10.22, "I": 424 },
	"G4_Tc":	{ "D": 11.5, "I": 428 },
	"G4_Ru":	{ "D": 12.41, "I": 441 },
	"G4_Rh":	{ "D": 12.41, "I": 449 },
	"G4_Pd":	{ "D": 12.02, "I": 470 },
	"G4_Ag":	{ "D": 10.5, "I": 470 },
	"G4_Cd":	{ "D": 8.65, "I": 469 },
	"G4_In":	{ "D": 7.31, "I": 488 },
	"G4_Sn":	{ "D": 7.31, "I": 488 },
	"G4_Sb":	{ "D": 6.691, "I": 487 },
	"G4_Te":	{ "D": 6.24, "I": 485 },
	"G4_I":		{ "D": 4.93, "I": 491 },
	"G4_Xe":	{ "D": 0.00548536, "I": 482 },
	"G4_Cs":	{ "D": 1.873, "I": 488 },
	"G4_Ba":	{ "D": 3.5, "I": 491 },
	"G4_La":	{ "D": 6.154, "I": 501 },
	"G4_Ce":	{ "D": 6.657, "I": 523 },
	"G4_Pr":	{ "D": 6.71, "I": 535 },
	"G4_Nd":	{ "D": 6.9, "I": 546 },
	"G4_Pm":	{ "D": 7.22, "I": 560 },
	"G4_Sm":	{ "D": 7.46, "I": 574 },
	"G4_Eu":	{ "D": 5.243, "I": 580 },
	"G4_Gd":	{ "D": 7.9004, "I": 591 },
	"G4_Tb":	{ "D": 8.229, "I": 614 },
	"G4_Dy":	{ "D": 8.55, "I": 628 },
	"G4_Ho":	{ "D": 8.795, "I": 650 },
	"G4_Er":	{ "D": 9.066, "I": 658 },
	"G4_Tm":	{ "D": 9.321, "I": 674 },
	"G4_Yb":	{ "D": 6.73, "I": 684 },
	"G4_Lu":	{ "D": 9.84, "I": 694 },
	"G4_Hf":	{ "D": 13.31, "I": 705 },
	"G4_Ta":	{ "D": 16.654, "I": 718 },
	"G4_W":		{ "D": 19.3, "I": 727 },
	"G4_Re":	{ "D": 21.02, "I": 736 },
	"G4_Os":	{ "D": 22.57, "I": 746 },
	"G4_Ir":	{ "D": 22.42, "I": 757 },
	"G4_Pt":	{ "D": 21.45, "I": 790 },
	"G4_Au":	{ "D": 19.32, "I": 790 },
	"G4_Hg":	{ "D": 13.546, "I": 800 },
	"G4_Tl":	{ "D": 11.72, "I": 810 },
	"G4_Pb":	{ "D": 11.35, "I": 823 },
	"G4_Bi":	{ "D": 9.747, "I": 823 },
	"G4_Po":	{ "D": 9.32, "I": 830 },
	"G4_At":	{ "D": 9.32, "I": 825 },
	"G4_Rn":	{ "D": 0.00900662, "I": 794 },
	"G4_Fr":	{ "D": 1, "I": 827 },
	"G4_Ra":	{ "D": 5, "I": 826 },
	"G4_Ac":	{ "D": 10.07, "I": 841 },
	"G4_Th":	{ "D": 11.72, "I": 847 },
	"G4_Pa":	{ "D": 15.37, "I": 878 },
	"G4_U":		{ "D": 18.95, "I": 890 },
	"G4_Np":	{ "D": 20.25, "I": 902 },
	"G4_Pu":	{ "D": 19.84, "I": 921 },
	"G4_Am":	{ "D": 13.67, "I": 934 },
	"G4_Cm":	{ "D": 13.51, "I": 939 },
	"G4_Bk":	{ "D": 14, "I": 952 },
	"G4_Cf":	{ "D": 10, "I": 966 },

	// NIST compounds

	"G4_A-150_TISSUE":		{ "D": 1.127, "I": 65.1 },
	"G4_ACETONE":			{ "D": 0.7899, "I": 64.2 },
	"G4_ACETYLENE":			{ "D": 0.0010967, "I": 58.2 },
	"G4_ADENINE":			{ "D": 1.35, "I": 71.4 },
	"G4_ADIPOSE_TISSUE_ICRP":{ "D": 0.92, "I": 63.2 },
	"G4_AIR":				{ "D": 0.00120479, "I": 85.7 },
	"G4_ALANINE":			{ "D": 1.42, "I": 71.9 },
	"G4_ALUMINUM_OXIDE":	{ "D": 3.97, "I": 145.2 },
	"G4_AMBER":				{ "D": 1.1, "I": 63.2 },
	"G4_AMMONIA":			{ "D": 0.000826019, "I": 53.7 },
	"G4_ANILINE":			{ "D": 1.0235, "I": 66.2 },
	"G4_ANTHRACENE":		{ "D": 1.283, "I": 69.5 },
	"G4_B-100_BONE":		{ "D": 1.45, "I": 85.9 },
	"G4_BAKELITE":			{ "D": 1.25, "I": 72.4 },
	"G4_BARIUM_FLUORIDE":	{ "D": 4.89, "I": 375.9 },
	"G4_BARIUM_SULFATE":	{ "D": 4.5, "I": 285.7 },
	"G4_BENZENE":			{ "D": 0.87865, "I": 63.4 },
	"G4_BERYLLIUM_OXIDE":	{ "D": 3.01, "I": 93.2 },
	"G4_BGO":				{ "D": 7.13, "I": 534.1 },
	"G4_BLOOD_ICRP":		{ "D": 1.06, "I": 75.2 },
	"G4_BONE_COMPACT_ICRU":	{ "D": 1.85, "I": 91.9 },
	"G4_BONE_CORTICAL_ICRP":{ "D": 1.85, "I": 106.4 },
	"G4_BORON_CARBIDE":		{ "D": 2.52, "I": 84.7 },
	"G4_BORON_OXIDE":		{ "D": 1.812, "I": 99.6 },
	"G4_BRAIN_ICRP":		{ "D": 1.03, "I": 73.3 },
	"G4_BUTANE":			{ "D": 0.00249343, "I": 48.3 },
	"G4_N-BUTYL_ALCOHOL":	{ "D": 0.8098, "I": 59.9 },
	"G4_C-552":				{ "D": 1.76, "I": 86.8 },
	"G4_CADMIUM_TELLURIDE":	{ "D": 6.2, "I": 539.3 },
	"G4_CADMIUM_TUNGSTATE":	{ "D": 7.9, "I": 468.3 },
	"G4_CALCIUM_CARBONATE":	{ "D": 2.8, "I": 136.4 },
	"G4_CALCIUM_FLUORIDE":	{ "D": 3.18, "I": 166 },
	"G4_CALCIUM_OXIDE":		{ "D": 3.3, "I": 176.1 },
	"G4_CALCIUM_SULFATE":	{ "D": 2.96, "I": 152.3 },
	"G4_CALCIUM_TUNGSTATE":	{ "D": 6.062, "I": 395 },
	"G4_CARBON_DIOXIDE":	{ "D": 0.00184212, "I": 85 },
	"G4_CARBON_TETRACHLORIDE":	{ "D": 1.594, "I": 166.3 },
	"G4_CELLULOSE_CELLOPHANE":	{ "D": 1.42, "I": 77.6 },
	"G4_CELLULOSE_BUTYRATE":	{ "D": 1.2, "I": 74.6 },
	"G4_CELLULOSE_NITRATE":	{ "D": 1.49, "I": 87 },
	"G4_CERIC_SULFATE":		{ "D": 1.03, "I": 76.7 },
	"G4_CESIUM_FLUORIDE":	{ "D": 4.115, "I": 440.7 },
	"G4_CESIUM_IODIDE":		{ "D": 4.51, "I": 553.1 },
	"G4_CHLOROBENZENE":		{ "D": 1.1058, "I": 89.1 },
	"G4_CHLOROFORM":		{ "D": 1.4832, "I": 156 },
	"G4_CONCRETE":			{ "D": 2.3, "I": 135.2 },
	"G4_CYCLOHEXANE":		{ "D": 0.779, "I": 56.4 },
	"G4_1,2-DICHLOROBENZENE":	{ "D": 1.3048, "I": 106.5 },
	"G4_DICHLORODIETHYL_ETHER":	{ "D": 1.2199, "I": 103.3 },
	"G4_1,2-DICHLOROETHANE":	{ "D": 1.2351, "I": 111.9 },
	"G4_DIETHYL_ETHER":			{ "D": 0.71378, "I": 60 },
	"G4_N,N-DIMETHYL_FORMAMIDE":{ "D": 0.9487, "I": 66.6 },
	"G4_DIMETHYL_SULFOXIDE":	{ "D": 1.1014, "I": 98.6 },
	"G4_ETHANE":			{ "D": 0.00125324, "I": 45.4 },
	"G4_ETHYL_ALCOHOL":		{ "D": 0.7893, "I": 62.9 },
	"G4_ETHYL_CELLULOSE":	{ "D": 1.13, "I": 69.3 },
	"G4_ETHYLENE":			{ "D": 0.00117497, "I": 50.7 },
	"G4_EYE_LENS_ICRP":		{ "D": 1.1, "I": 73.3 },
	"G4_FERRIC_OXIDE":		{ "D": 5.2, "I": 227.3 },
	"G4_FERROBORIDE":		{ "D": 7.15, "I": 261 },
	"G4_FERROUS_OXIDE":		{ "D": 5.7, "I": 248.6 },
	"G4_FERROUS_SULFATE":	{ "D": 1.024, "I": 76.4 },
	"G4_FREON-12":			{ "D": 1.12, "I": 143 },
	"G4_FREON-12B2":		{ "D": 1.8, "I": 284.9 },
	"G4_FREON-13":			{ "D": 0.95, "I": 126.6 },
	"G4_FREON-13B1":		{ "D": 1.5, "I": 210.5 },
	"G4_FREON-13I1":		{ "D": 1.8, "I": 293.5 },
	"G4_GADOLINIUM_OXYSULFIDE":	{ "D": 7.44, "I": 493.3 },
	"G4_GALLIUM_ARSENIDE":		{ "D": 5.31, "I": 384.9 },
	"G4_GEL_PHOTO_EMULSION":	{ "D": 1.2914, "I": 74.8 },
	"G4_Pyrex_Glass":		{ "D": 2.23, "I": 134 },
	"G4_GLASS_LEAD":		{ "D": 6.22, "I": 526.4 },
	"G4_GLASS_PLATE":		{ "D": 2.4, "I": 145.4 },
	"G4_GLUCOSE":			{ "D": 1.54, "I": 77.2 },
	"G4_GLUTAMINE":			{ "D": 1.46, "I": 73.3 },
	"G4_GLYCEROL":			{ "D": 1.2613, "I": 72.6 },
	"G4_GUANINE":			{ "D": 1.58, "I": 75 },
	"G4_GYPSUM":			{ "D": 2.32, "I": 129.7 },
	"G4_N-HEPTANE":			{ "D": 0.68376, "I": 54.4 },
	"G4_N-HEXANE":			{ "D": 0.6603, "I": 54 },
	"G4_KAPTON":			{ "D": 1.42, "I": 79.6 },
	"G4_LANTHANUM_OXYBROMIDE":	{ "D": 6.28, "I": 439.7 },
	"G4_LANTHANUM_OXYSULFIDE":	{ "D": 5.86, "I": 421.2 },
	"G4_LEAD_OXIDE":		{ "D": 9.53, "I": 766.7 },
	"G4_LITHIUM_AMIDE":		{ "D": 1.178, "I": 55.5 },
	"G4_LITHIUM_CARBONATE":	{ "D": 2.11, "I": 87.9 },
	"G4_LITHIUM_FLUORIDE":	{ "D": 2.635, "I": 94 },
	"G4_LITHIUM_HYDRIDE":	{ "D": 0.82, "I": 36.5 },
	"G4_LITHIUM_IODIDE":	{ "D": 3.494, "I": 485.1 },
	"G4_LITHIUM_OXIDE":		{ "D": 2.013, "I": 73.6 },
	"G4_LITHIUM_TETRABORATE":	{ "D": 2.44, "I": 94.6 },
	"G4_LUNG_ICRP":				{ "D": 1.05, "I": 75.3 },
	"G4_M3_WAX":				{ "D": 1.05, "I": 67.9 },
	"G4_MAGNESIUM_CARBONATE":	{ "D": 2.958, "I": 118 },
	"G4_MAGNESIUM_FLUORIDE":	{ "D": 3, "I": 134.3 },
	"G4_MAGNESIUM_OXIDE":		{ "D": 3.58, "I": 143.8 },
	"G4_MAGNESIUM_TETRABORATE":	{ "D": 2.53, "I": 108.3 },
	"G4_MERCURIC_IODIDE":		{ "D": 6.36, "I": 684.5 },
	"G4_METHANE":				{ "D": 0.000667151, "I": 41.7 },
	"G4_METHANOL":				{ "D": 0.7914, "I": 67.6 },
	"G4_MIX_D_WAX":				{ "D": 0.99, "I": 60.9 },
	"G4_MS20_TISSUE":			{ "D": 1, "I": 75.1 },
	"G4_MUSCLE_SKELETAL_ICRP":	{ "D": 1.04, "I": 75.3 },
	"G4_MUSCLE_STRIATED_ICRU":	{ "D": 1.04, "I": 74.7 },
	"G4_MUSCLE_WITH_SUCROSE":	{ "D": 1.11, "I": 74.3 },
	"G4_MUSCLE_WITHOUT_SUCROSE":{ "D": 1.07, "I": 74.2 },
	"G4_NAPHTHALENE":		{ "D": 1.145, "I": 68.4 },
	"G4_NITROBENZENE":		{ "D": 1.19867, "I": 75.8 },
	"G4_NITROUS_OXIDE":		{ "D": 0.00183094, "I": 84.9 },
	"G4_NYLON-8062":		{ "D": 1.08, "I": 64.3 },
	"G4_NYLON-6/6":			{ "D": 1.14, "I": 63.9 },
	"G4_NYLON-6/10":		{ "D": 1.14, "I": 63.2 },
	"G4_NYLON-11_RILSAN":	{ "D": 1.425, "I": 61.6 },
	"G4_OCTANE":			{ "D": 0.7026, "I": 54.7 },
	"G4_PARAFFIN":			{ "D": 0.93, "I": 55.9 },
	"G4_N-PENTANE":			{ "D": 0.6262, "I": 53.6 },
	"G4_PHOTO_EMULSION":	{ "D": 3.815, "I": 331 },
	"G4_PLASTIC_SC_VINYLTOLUENE":	{ "D": 1.032, "I": 64.7 },
	"G4_PLUTONIUM_DIOXIDE":			{ "D": 11.46, "I": 746.5 },
	"G4_POLYACRYLONITRILE":			{ "D": 1.17, "I": 69.6 },
	"G4_POLYCARBONATE":				{ "D": 1.2, "I": 73.1 },
	"G4_POLYCHLOROSTYRENE":			{ "D": 1.3, "I": 81.7 },
	"G4_POLYETHYLENE":		{ "D": 0.94, "I": 57.4 },
	"G4_MYLAR":				{ "D": 1.4, "I": 78.7 },
	"G4_PLEXIGLASS":		{ "D": 1.19, "I": 74 },
	"G4_POLYOXYMETHYLENE":	{ "D": 1.425, "I": 77.4 },
	"G4_POLYPROPYLENE":		{ "D": 0.9, "I": 56.5 },
	"G4_POLYSTYRENE":		{ "D": 1.06, "I": 68.7 },
	"G4_TEFLON":			{ "D": 2.2, "I": 99.1 },
	"G4_POLYTRIFLUOROCHLOROETHYLENE": { "D": 2.1, "I": 120.7 },
	"G4_POLYVINYL_ACETATE":			{ "D": 1.19, "I": 73.7 },
	"G4_POLYVINYL_ALCOHOL":			{ "D": 1.3, "I": 69.7 },
	"G4_POLYVINYL_BUTYRAL":			{ "D": 1.12, "I": 67.2 },
	"G4_POLYVINYL_CHLORIDE":		{ "D": 1.3, "I": 108.2 },
	"G4_POLYVINYLIDENE_CHLORIDE":	{ "D": 1.7, "I": 134.3 },
	"G4_POLYVINYLIDENE_FLUORIDE":	{ "D": 1.76, "I": 88.8 },
	"G4_POLYVINYL_PYRROLIDONE":		{ "D": 1.25, "I": 67.7 },
	"G4_POTASSIUM_IODIDE":			{ "D": 3.13, "I": 431.9 },
	"G4_POTASSIUM_OXIDE":			{ "D": 2.32, "I": 189.9 },
	"G4_PROPANE":			{ "D": 0.00187939, "I": 47.1 },
	"G4_lPROPANE":			{ "D": 0.43, "I": 52 },
	"G4_N-PROPYL_ALCOHOL":	{ "D": 0.8035, "I": 61.1 },
	"G4_PYRIDINE":			{ "D": 0.9819, "I": 66.2 },
	"G4_RUBBER_BUTYL":		{ "D": 0.92, "I": 56.5 },
	"G4_RUBBER_NATURAL":	{ "D": 0.92, "I": 59.8 },
	"G4_RUBBER_NEOPRENE":	{ "D": 1.23, "I": 93 },
	"G4_SILICON_DIOXIDE":	{ "D": 2.32, "I": 139.2 },
	"G4_SILVER_BROMIDE":	{ "D": 6.473, "I": 486.6 },
	"G4_SILVER_CHLORIDE":	{ "D": 5.56, "I": 398.4 },
	"G4_SILVER_HALIDES":	{ "D": 6.47, "I": 487.1 },
	"G4_SILVER_IODIDE":		{ "D": 6.01, "I": 543.5 },
	"G4_SKIN_ICRP":			{ "D": 1.1, "I": 72.7 },
	"G4_SODIUM_CARBONATE":	{ "D": 2.532, "I": 125 },
	"G4_SODIUM_IODIDE":		{ "D": 3.667, "I": 452 },
	"G4_SODIUM_MONOXIDE":	{ "D": 2.27, "I": 148.8 },
	"G4_SODIUM_NITRATE":	{ "D": 2.261, "I": 114.6 },
	"G4_STILBENE":			{ "D": 0.9707, "I": 67.7 },
	"G4_SUCROSE":			{ "D": 1.5805, "I": 77.5 },
	"G4_TERPHENYL":			{ "D": 1.234, "I": 71.7 },
	"G4_TESTES_ICRP":			{ "D": 1.04, "I": 75 },
	"G4_TETRACHLOROETHYLENE":	{ "D": 1.625, "I": 159.2 },
	"G4_THALLIUM_CHLORIDE":		{ "D": 7.004, "I": 690.3 },
	"G4_TISSUE_SOFT_ICRP":		{ "D": 1, "I": 72.3 },
	"G4_TISSUE_SOFT_ICRU-4":	{ "D": 1, "I": 74.9 },
	"G4_TISSUE-METHANE":	{ "D": 0.00106409, "I": 61.2 },
	"G4_TISSUE-PROPANE":	{ "D": 0.00182628, "I": 59.5 },
	"G4_TITANIUM_DIOXIDE":	{ "D": 4.26, "I": 179.5 },
	"G4_TOLUENE":			{ "D": 0.8669, "I": 62.5 },
	"G4_TRICHLOROETHYLENE":		{ "D": 1.46, "I": 48.1 },
	"G4_TRIETHYL_PHOSPHATE":	{ "D": 1.07, "I": 81.2 },
	"G4_TUNGSTEN_HEXAFLUORIDE":	{ "D": 2.4, "I": 354.4 },
	"G4_URANIUM_DICARBIDE":		{ "D": 11.28, "I": 752 },
	"G4_URANIUM_MONOCARBIDE":	{ "D": 13.63, "I": 862 },
	"G4_URANIUM_OXIDE":			{ "D": 10.96, "I": 720.6 },
	"G4_UREA":				{ "D": 1.323, "I": 72.8 },
	"G4_VALINE":			{ "D": 1.23, "I": 67.7 },
	"G4_VITON":				{ "D": 1.8, "I": 98.6 },
	"G4_WATER":				{ "D": 1, "I": 75 },
	"G4_WATER_VAPOR":		{ "D": 0.000756182, "I": 71.6 },
	"G4_XYLENE":			{ "D": 0.87, "I": 61.8 },
	"G4_GRAPHITE":			{ "D": 1.7, "I": 78 },

	// HEP materials

	"G4_lH2":	{ "D": 0.0708, "I": 21.8 },
	"G4_lAr":	{ "D": 1.396, "I": 188 },
	"G4_lKr":	{ "D": 2.418, "I": 352 },
	"G4_lXe":	{ "D": 2.953, "I": 482 },
	"G4_PbWO4":	{ "D": 8.28, "I": 0 },
	"G4_Galactic": { "D": 1e-25, "I": 21.8 }

};

export default G4Materials;
