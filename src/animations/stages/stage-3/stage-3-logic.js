
import * as SphereOps from '../../modules/sphere-operations.js';

export class Stage3Logic {
    constructor(spheres, spheresData) {
        this.spheresData = spheresData
        this.stage3SpecificState = null;
    }

        resetState() {
        // Reset any internal state if needed
        this.spheresData.forEach(sphere => {
            sphere.isPartOfLine = false;  // Add a new property to track line membership
        });
    }

    async initializeStage() {
        
        // Initialize any stage-specific logic here
        this.stage3SpecificState = 'initialized';
        // You might want to perform some asynchronous setup here
    }

    getSphereLeft(sphereIndex) {
        const sphere = this.spheresData[sphereIndex];
        const col = sphere.col;
        if (col === 0) {
            return this.spheresData[sphereIndex + 69]; // Connect to col 69 (not 70, since 70 is duplicate of 0)
        } else {
            return this.spheresData[sphereIndex - 1];
        }
    }
    
    getSphereRight(sphereIndex) {
        const sphere = this.spheresData[sphereIndex];
        const col = sphere.col;
        if (col === 69) {
            return this.spheresData[sphereIndex - 69]; // Connect to col 1 (not 0, since 0 is duplicate of 70)
        } else {
            return this.spheresData[sphereIndex + 1];
        }
    }

    resetStage() {
        
        this.stage3SpecificState = null;
        // Reset any other stage-specific state
    }

// Updated Stage3Logic class method

findBadSphereLines() {
    console.log('Starting findBadSphereLines');
    // Reset previous line states
    this.spheresData.forEach(sphere => {
        sphere.isPartOfLine = false;
    });

    const { spheres: visibleSpheres } = SphereOps.getVisibleSpheresArray(this.spheresData);
    if (visibleSpheres.length === 0) return [];
    console.log(`Got visible spheres array. Length: ${visibleSpheres.length}`);
    console.log('First few visible spheres:', visibleSpheres.slice(0, 3));


    if (visibleSpheres.length === 0) {
        console.log('No visible spheres found, returning empty array');
        return [];
    }

    // Find boundaries of the visible area
    const maxRow = Math.max(...visibleSpheres.map(s => s.row));
    const minRow = Math.min(...visibleSpheres.map(s => s.row));
    const maxCol = Math.max(...visibleSpheres.map(s => s.col));
    const minCol = Math.min(...visibleSpheres.map(s => s.col));

    console.log('Visible area boundaries:', { minRow, maxRow, minCol, maxCol });

    const sphereMap = new Map();
    visibleSpheres.forEach(sphere => {
        sphereMap.set(`${sphere.row},${sphere.col}`, sphere);
    });

    console.log(`Created sphere map with ${sphereMap.size} entries`);

    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [1, -1], [-1, 1], [1, 1]
    ];

    const isWithinBounds = (row, col) => {
        return row >= minRow && row <= maxRow && 
               col >= minCol && col <= maxCol;
    };

    const getSpheresInLine = (startRow, startCol, dirRow, dirCol) => {
        const line = [];
        let currentRow = startRow;
        let currentCol = startCol;

        console.log(`Starting line check from (${startRow},${startCol}) in direction (${dirRow},${dirCol})`);
        
        while (isWithinBounds(currentRow, currentCol)) {
            const key = `${currentRow},${currentCol}`;
            const sphere = sphereMap.get(`${currentRow},${currentCol}`);

            console.log(`Checking position ${key}, sphere found: ${!!sphere}, status: ${sphere?.status}`);
            if (!sphere || sphere.status !== 'bad') break;
            
            line.push(sphere);
            currentRow += dirRow;
            currentCol += dirCol;
        }
        console.log(`Found line of length ${line.length}`);
        return line;
    };

    const badLines = new Set();
    let totalLinesFound = 0;
    
    visibleSpheres.forEach(sphere => {
        if (sphere.status === 'bad') {
            directions.forEach(([dirRow, dirCol]) => {
                if (dirRow > 0 || (dirRow === 0 && dirCol > 0)) {
                    const line = getSpheresInLine(sphere.row, sphere.col, dirRow, dirCol);
                    if (line.length >= 3) {
                        totalLinesFound++;
                        line.forEach(sphereInLine => {
                            const originalIndex = (sphereInLine.index);
                            badLines.add(originalIndex);
                            // Mark the original sphere as part of a line
                            this.spheresData[originalIndex].isPartOfLine = true;
                        });
                    }
                }
            });
        }
    });


    
    console.log(`Found ${totalLinesFound} lines of 3+ spheres`);
    console.log(`Total highlighted spheres: ${badLines.size}`);
    return Array.from(badLines);
}

// Add this method to highlight detected lines
highlightBadLines() {
    const badLineIndices = this.findBadSphereLines();
    return badLineIndices;
}
}


