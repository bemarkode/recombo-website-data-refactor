function calculateBezierY(x, p2, p3) {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: p2.x, y: p2.y };
    const p2Point = { x: p3.x, y: p3.y };
    const p3Point = { x: 1, y: 1 };
  
    function bezierX(t) {
      return Math.pow(1 - t, 3) * p0.x +
             3 * Math.pow(1 - t, 2) * t * p1.x +
             3 * (1 - t) * Math.pow(t, 2) * p2Point.x +
             Math.pow(t, 3) * p3Point.x;
    }
  
    function bezierY(t) {
      return Math.pow(1 - t, 3) * p0.y +
             3 * Math.pow(1 - t, 2) * t * p1.y +
             3 * (1 - t) * Math.pow(t, 2) * p2Point.y +
             Math.pow(t, 3) * p3Point.y;
    }
  
    // Binary search to find t for given x
    let tMin = 0;
    let tMax = 1;
    let tMid;
    const epsilon = 1e-6; // Precision
  
    while (tMax - tMin > epsilon) {
      tMid = (tMin + tMax) / 2;
      let xMid = bezierX(tMid);
  
      if (Math.abs(xMid - x) < epsilon) {
        break;
      }
  
      if (xMid < x) {
        tMin = tMid;
      } else {
        tMax = tMid;
      }
    }
  
    return bezierY(tMid);
  }
export { calculateBezierY };
