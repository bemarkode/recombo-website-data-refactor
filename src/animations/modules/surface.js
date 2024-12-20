import * as THREE from "three";
import { NURBSSurface } from "three/examples/jsm/curves/NURBSSurface.js";


const controlPoints = [
    [
        new THREE.Vector4(3000.00, -3000.00, 0.00, 1.0),
        new THREE.Vector4(1000.00, -3000.00, 0.00, 1.0),
        new THREE.Vector4(-1000.00, -3000.00, 0.00, 1.0),
        new THREE.Vector4(-3000.00, -3000.00, 0.00, 1.0)
    ],
    [
        new THREE.Vector4(3000.00, 0.00, 0.00, 1.0),
        new THREE.Vector4(1000.00, 0.00, 0.00, 1.0),
        new THREE.Vector4(-1000.00, 0.00, 0.00, 1.0),
        new THREE.Vector4(-3000.00, 0.00, 0.00, 1.0)
    ],
    [
        new THREE.Vector4(3000.00, 3000.00, 0.00, 1.0),
        new THREE.Vector4(1000.00, 3000.00, 0.00, 1.0),
        new THREE.Vector4(-1000.00, 3000.00, 0.00, 1.0),
        new THREE.Vector4(-3000.00, 3000.00, 0.00, 1.0)
    ]
];


function createNURBSSurface(controlPoints, degreeU, degreeV) {

    const knotsU = generateKnotVector(degreeU, controlPoints.length);
    const knotsV = generateKnotVector(degreeV, controlPoints[0].length);

    return new NURBSSurface(degreeU, degreeV, knotsU, knotsV, controlPoints);
}


function generateKnotVector(degree, controlPointsCount) {

    
    const knots = [];

    for (let i = 0; i <= degree; i++) {
        knots.push(0);
    }

    for (let i = 1; i < controlPointsCount - degree; i++) {
        knots.push(i / (controlPointsCount - degree));
    }

    for (let i = 0; i <= degree; i++) {
        knots.push(1);
    }

    return knots;
}


export const surface = createNURBSSurface(controlPoints, 2, 3);