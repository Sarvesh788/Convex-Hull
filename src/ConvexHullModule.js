// ConvexHullModule.js

// Function to swap two elements in an array
const swap = (arr, i, j) => {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
};

// Function to compute the median of medians
const medianOfMedians = (arr, l, r, k) => {
    const n = r - l + 1;
    if (k > 0 && k <= n) {
        const numGroups = Math.ceil(n / 5);
        const medians = new Array(numGroups);
        for (let i = 0; i < numGroups; i++) {
            const groupSize = Math.min(5, n - 5 * i);
            const group = new Array(groupSize);
            for (let j = 0; j < groupSize; j++) {
                group[j] = arr[l + i * 5 + j];
            }
            group.sort((a, b) => a - b);
            medians[i] = group[Math.floor(groupSize / 2)];
        }
        const medianOfMedians = medianOfMedians(medians, 0, numGroups - 1, Math.floor(numGroups / 2));
        const pivot = partition(arr, l, r, medianOfMedians);
        if (pivot - l === k) {
            return arr[pivot];
        } else if (pivot - l < k) {
            return medianOfMedians(arr, pivot + 1, r, k - (pivot - l) - 1);
        } else {
            return medianOfMedians(arr, l, pivot - 1, k);
        }
    }
    return -1;
};

// Function to partition an array around a pivot
const partition = (arr, l, r, pivot) => {
    let i = l - 1;
    for (let j = l; j <= r - 1; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr, i, j);
        }
    }
    swap(arr, i + 1, r);
    return i + 1;
};

// Function to compute the upper bridge
const upperBridge = (points, numPoints, L) => {
    if (points.length === 2) {
        return [points[0], points[1]];
    }
    const candidates = [];
    const pairs = [];
    const slopes = [];

    for (let i = 0; i < points.length; i += 2) {
        const pi = points[i];
        const pj = points[i + 1];
        if (pi.x === pj.x) {
            candidates.push(pi.y > pj.y ? pi : pj);
        } else {
            const slope = (pi.y - pj.y) / (pi.x - pj.x);
            slopes.push(slope);
            pairs.push([pi, pj]);
        }
    }

    const medianIndex = Math.floor(slopes.length / 2) - (slopes.length % 2 === 0 ? 1 : 0);
    const medianSlope = medianOfMedians(slopes, 0, slopes.length - 1, medianIndex);
    const large = [];
    const equal = [];
    const small = [];
    const maxSlope = Math.max(...points.map(point => point.y - medianSlope * point.x));
    const maxSet = points.filter(point => point.y - medianSlope * point.x === maxSlope);
    const left = maxSet.reduce((min, p) => (p.x < min.x ? p : min), maxSet[0]);
    const right = maxSet.reduce((max, p) => (p.x > max.x ? p : max), maxSet[0]);

    if (left.x <= L && right.x > L) {
        return [left, right];
    }

    pairs.forEach(([pi, pj], i) => {
        if (pi.x === pj.x) {
            candidates.push(pi.y > pj.y ? pi : pj);
        } else {
            const slope = slopes[i];
            if (slope < medianSlope) {
                small.push(pairs[i]);
            } else if (slope === medianSlope) {
                equal.push(pairs[i]);
            } else {
                large.push(pairs[i]);
            }
        }
    });

    if (right.x <= L) {
        large.forEach(pair => pair.forEach(point => candidates.push(point)));
        equal.forEach(pair => pair.forEach(point => candidates.push(point)));
        small.forEach(pair => pair.forEach(point => candidates.push(point)));
    }

    if (left.x > L) {
        small.forEach(pair => pair.forEach(point => candidates.push(point)));
        equal.forEach(pair => pair.forEach(point => candidates.push(point)));
        large.forEach(pair => pair.forEach(point => candidates.push(point)));
    }

    return upperBridge(candidates, candidates.length, L);
};

// Function to compute the upper hull
const upperHull = (points) => {
    const lower = points.reduce((min, p) => (p.x < min.x ? p : min), points[0]);
    const upper = points.reduce((max, p) => (p.x > max.x ? p : max), points[0]);
    const Tu = [lower, upper];
    const Tl = points.filter(p => p.x > lower.x && p.x < upper.x);
    return upperHullRecursive(lower, upper, Tu, Tl);
};

// Recursive function to compute the upper hull
const upperHullRecursive = (pumin, pumax, Tu, Tl) => {
    const pl = upperBridge(Tl, Tl.length, pumin);
    const pr = upperBridge(Tl, Tl.length, pumax);

    const Tleft = [pl];
    const Tright = [pr];

    Tl.forEach(p => {
        if (p.x !== pl.x || p.y !== pl.y) {
            if (directionOfPoint(pl, pumin, p) === -1) {
                Tleft.push(p);
            }
        }
    });

    Tl.forEach(p => {
        if (p.x !== pr.x || p.y !== pr.y) {
            if (directionOfPoint(pr, pumax, p) === 1) {
                Tright.push(p);
            }
        }
    });

    let Uh1 = [];
    let Uh2 = [];

    if (Tleft.length >= 2) {
        Uh1 = upperHullRecursive(pumin, pl, Tu, Tleft);
    }

    if (Tright.length >= 2) {
        Uh2 = upperHullRecursive(pl, pumax, Tu, Tright);
    }

    return [...Uh1, pl, pr, ...Uh2];
};

// Function to determine the direction of a point relative to a line
const directionOfPoint = (A, B, C) => {
    const slope = (A.y - B.y) / (A.x - B.x);
    const value = slope * C.x;
    const y0 = value + A.y - value * A.x;

    if (slope > 0) {
        return C.y - y0 > 0 ? -1 : C.y - y0 < 0 ? 1 : 0;
    } else {
        return C.y - y0 > 0 ? 1 : C.y - y0 < 0 ? -1 : 0;
    }
};

export { upperHull };
