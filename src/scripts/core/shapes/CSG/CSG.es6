'use strict';

import { CSGCore } from './CSGCore';
import { CSGBox } from './CSGBox';
import { CSGCone } from './CSGCone';
import { CSGCut } from './CSGCut';
import { CSGPlaneXY, CSGPlaneXZ, CSGPlaneYZ } from './CSGPlane';

let CSG = CSGCore;

CSG.box = CSGBox;
CSG.cone = CSGCone;
CSG.cut = CSGCut;
CSG.planeXY = CSGPlaneXY;
CSG.planeXZ = CSGPlaneXZ;
CSG.planeYZ = CSGPlaneYZ;

export { CSG };
