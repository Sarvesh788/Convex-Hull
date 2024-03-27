// ConvexHull.js
class ConvexHull {
    constructor(points) {
        this.points = points;
        
        // points that give infinite loop
        // this.points = [
        //     {
        //         "x": 8,
        //         "y": 99.833
        //     },
        //     {
        //         "x": 17,
        //         "y": 48.833
        //     },
        //     {
        //         "x": 38,
        //         "y": 28.833
        //     },
        //     {
        //         "x": 42,
        //         "y": 61.833
        //     },
        //     {
        //         "x": 70,
        //         "y": 28.833
        //     },
        //     {
        //         "x": 80,
        //         "y": 60.833
        //     },
        //     {
        //         "x": 95,
        //         "y": 46.833
        //     }
        // ];
    }

    findConvexHull() {
        if (this.points.length <= 1) return this.points;

        // Sort points by x-coordinate
        this.points.sort((a, b) => a.x - b.x);
        // this.points = this.points.map(point => {
        //     return { x: Math.round(point.x * 1000) / 1000, y: Math.round(point.y * 1000) / 1000 };
        // });
        console.log("points", this.points);
        const removeDuplicates = (arr) => {
            for(var i = 0; i < arr.length; i++) {
                for(var j = i + 1; j < arr.length; j++) {
                    if(arr[i].x === arr[j].x && arr[i].y === arr[j].y) {
                        arr.splice(j, 1);
                        j--;
                    }
                }
            }   
        }

        // Helper function to find the convex hull of a set of points
        const findHull = (points) => {


            let pmin_u, pmin_l, pmax_u, pmax_l;

            pmin_l = pmin_u = pmax_l = pmax_u = points[0];
            for (let i = 1; i < points.length; i++) {
                let curr_point = points[i];
                if (points[i].x < pmin_l.x) {
                    pmin_l = points[i];
                    pmin_u = points[i];
                }
                else if (points[i].x > pmax_l.x) {
                    pmax_l = points[i];
                    pmax_u = points[i];
                }
                else if (points[i].x === pmin_l.x) {
                    if (points[i].y > pmin_u.y)
                        pmin_u = points[i];
                    else if (points[i].y < pmin_l.y)
                        pmin_l = points[i];
                }
                else if (points[i].x === pmax_l.x) {
                    if (points[i].y > pmax_u.y)
                        pmax_u = points[i];
                    else if (points[i].y < pmax_l.y)
                        pmax_l = points[i];
                }
            } // point initialization

            let upper_T = get_T(pmin_u, pmax_u, points, false);
            let upper_hull = get_upper_hull(pmin_u, pmax_u, upper_T);
            // console.log("final upper_hull", upper_hull);
            removeDuplicates(upper_hull);
            ////// Sort in increasing order of x

            upper_hull.sort((a, b) => {
                if (a.x < b.x) return -1;
                else if (a.x > b.x) return 1;
            });


            // console.log("final upper_hull", upper_hull);

            let lower_T = get_T(pmin_l, pmax_l, points, true);
            let lower_hull = get_lower_hull(pmin_l, pmax_l, lower_T);
            // console.log("final lower_hull", lower_hull);
            removeDuplicates(lower_hull);

            lower_hull.sort((a, b) => {
                if (a.x > b.x) return -1;
                else if (a.x < b.x) return 1;
            });
            ////// Sort in decreasing order of x
            // console.log("final lower_hull", lower_hull);
            
            let hull_edges = [];
            hull_edges = hull_edges.concat(upper_hull);
            hull_edges = hull_edges.concat(lower_hull);
            
            // console.log("hull_edges", hull_edges);
            removeDuplicates(hull_edges);
            // console.log("hull_edges", hull_edges);
            
            if (pmin_u.x !== pmin_l.x || pmin_u.y !== pmin_l.y) {
                hull_edges.push(pmin_l);
                hull_edges.push(pmin_u);
            }
            if (pmax_l.x !== pmax_u.x || pmax_l.y !== pmax_u.y) {
                hull_edges.push(pmax_l);
                hull_edges.push(pmax_u);
            }
            // hull_edges.sort((a, b) => {
                //     if (a.x < b.x) return -1;
                //     else if (a.x > b.x) return 1;
                //     else return a.y < b.y ? -1 : 1;
                // });
                let hull = [];
                // console.log("hull_edges", hull_edges);
            hull.push(hull_edges[0]);
            let i = 1;
            while (i < hull_edges.length) {
                // while (i < hull_edges.length && (hull_edges[i].x === hull_edges[i - 1].x && hull_edges[i].y === hull_edges[i - 1].y))
                //     i++;

                if (i < hull_edges.length)
                    hull.push(hull_edges[i]);

                i++;
            }
            return hull;
        };

        const findMedian = (arr) => {
            arr.sort((a, b) => a - b);
            return arr[Math.floor(arr.length / 2)];
        }

        const partition = (arr, l, r, x) => {
            let i;
            for (i = l; i < r; i++)
                if (arr[i] === x)
                    break;
            [arr[i], arr[r]] = [arr[r], arr[i]];

            i = l;
            for (let j = l; j <= r - 1; j++) {
                if (arr[j] <= x) {
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    i++;
                }
            }
            [arr[i], arr[r]] = [arr[r], arr[i]];
            return i;
        }

        const kthSmallest = (arr, l, r, k) => {
            if (k > 0 && k <= r - l + 1) {
                let n = r - l + 1;
                let median = Array(Math.floor((n + 4) / 5)).fill(0); // this is a doubtable line
                let i;
                for (i = 0; i < Math.floor(n / 5); i++)
                    median[i] = findMedian(arr.slice(l + i * 5, l + i * 5 + 5));
                if (i * 5 < n) {
                    median[i] = findMedian(arr.slice(l + i * 5, l + i * 5 + n % 5));
                    i++;
                }

                let medOfMed = (i === 1) ? median[i - 1] : kthSmallest(median, 0, i - 1, Math.floor(i / 2));

                let pos = partition(arr, l, r, medOfMed);

                if (pos - l === k - 1)
                    return arr[pos];
                if (pos - l > k - 1)
                    return kthSmallest(arr, l, pos - 1, k);

                return kthSmallest(arr, pos + 1, r, k - pos + l - 1);
            }

            return Number.MAX_SAFE_INTEGER; // don't be afraid, this is INT_MAX 
        }

        const get_T = (p1, p2, points, flag) => {
            let upper_T = [];
            let slope = (p1.y - p2.y) / (p1.x - p2.x);

            for (let i = 0; i < points.length; i++) {
                let curr_point = points[i];

                if (curr_point.x > p1.x && curr_point.x < p2.x) {
                    let curr_slope = (p1.y - curr_point.y) / (p1.x - curr_point.x);

                    if (!flag) {
                        if (curr_slope > slope) upper_T.push(curr_point);
                    } else {
                        if (curr_slope < slope) upper_T.push(curr_point);
                    }
                }
            }

            upper_T.push(p1);
            upper_T.push(p2);
            // // // console.log("upper_T");
            // // // console.log(upper_T);
            return upper_T;
        } // ye mara recursive calls mai points chatne ke liye kamm atta hai.

        const get_upper_bridge = (points, median) => {
            // // console.log("get upper bridge starts");
            points.sort((a, b) => a.x < b.x ? -1 : 1);
            
            console.log("points upper bridge", points);
            if(points.length === 1)
            {
                return [points[0], points[0]];
            }
            // let candidates = new Array(points.length);
            // let pairs = new Array(Math.floor(points.length / 2) + 1);
            let candidates = [];
            let pairs = [];
            // // // console.log("points");
            // // // console.log(points);
            // // // console.log(points.length);
            if (points.length % 2 === 0) {
                for (let i = 0; i < points.length; i += 2) {
                    let first_pt = points[i];
                    let second_pt = points[i];
                    if (i + 1 !== points.length) {
                        second_pt = points[i + 1];
                    }
                    let curr_pair = [first_pt, second_pt];
                    pairs.push(curr_pair);
                }
            }
            else {
                candidates.push(points[0]);
                for (let i = 1; i < points.length; i += 2) {
                    let first_pt = points[i];
                    let second_pt = points[i];
                    if (i + 1 !== points.length) {
                        second_pt = points[i + 1];
                    }

                    let curr_pair = [first_pt, second_pt];
                    pairs.push(curr_pair);
                }
            }
            let slopes_len = pairs.length;
            let slopes = [];
            // // // console.log("pairs");
            // // // console.log(pairs.length);
            // // // console.log(pairs);
            for (let i = 0; i < pairs.length; i++) {
                let p1 = pairs[i][0];
                let p2 = pairs[i][1];
                let x1 = p1.x;
                let x2 = p2.x;
                let y1 = p1.y;
                let y2 = p2.y;
                // // // console.log("p1", p1);
                // // // console.log("p2", p2);
                // // // console.log("x1", x1);
                // // // console.log("x2", x2);
                // // // console.log("y1", y1);
                // // // console.log("y2", y2);
                if (x1 === x2) {
                    if (y1 > y2) {
                        candidates.push(p1);
                    }
                    else {
                        candidates.push(p2);
                    }
                    slopes[i] = Infinity;
                }
                else {
                    let slope = (y2 - y1) / (x2 - x1);
                    slopes[i] = slope;
                }
            } 
            let arr = [];
            let len = 0;
            for (let i = 0; i < slopes_len; i++) {
                if (slopes[i] !== Infinity) {
                    arr[len++] = slopes[i];
                }
            } // array ke andar slopes daal diye
            // // console.log("hello upper bridge");
            // if(len === 0)
            // {
            //     return Infinity, Infinity;
            // } // check....

            let median_slope;
            if (len === 1)
                median_slope = arr[0];
            else
                median_slope = kthSmallest(arr, 0, len - 1, Math.floor((len + 1) / 2)); // I am bad programmer :(

            // console.log("median slope");
            // console.log(median_slope);

            // let SMALL = new Array(pairs.length);
            // let EQUAL = new Array(pairs.length);
            // let LARGE = new Array(pairs.length);
            let SMALL = [];
            let EQUAL = [];
            let LARGE = [];
            for (let i = 0; i < pairs.length; i++) {
                let p1 = pairs[i][0];
                let p2 = pairs[i][1];
                let x1 = p1.x;
                let x2 = p2.x;
                let y1 = p1.y;
                let y2 = p2.y;

                if (x1 !== x2) {
                    let slope = (y2 - y1) / (x2 - x1);
                    if (slope === median_slope) {
                        let curr_pair = [p1, p2];
                        EQUAL.push(curr_pair);
                    }
                    else if (slope < median_slope) {
                        let curr_pair = [p1, p2];
                        SMALL.push(curr_pair);
                    }
                    else if (slope > median_slope) {
                        let curr_pair = [p1, p2];
                        LARGE.push(curr_pair);
                    }
                }
            }
            // // // console.log("SMALL", SMALL);
            // // // console.log("EQUAL", EQUAL);
            // // // console.log("LARGE", LARGE);
            // console.log("my tester");
            let max_c = -Infinity;
            for (let i = 0; i < points.length; i++) {

                let x = points[i].x;
                let y = points[i].y;
                let curr_c = y - median_slope * x;

                if (curr_c > max_c) {
                    max_c = curr_c;
                }

            }

            // // // console.log("smort pointer");
            let pmin = { x: Infinity, y: Infinity };
            let pmax = { x: -Infinity, y: -Infinity };
            for (let i = 0; i < points.length; i++) {

                let x = points[i].x;
                let y = points[i].y;

                let curr_c = y - median_slope * x;

                if (Math.abs(curr_c - max_c) < 0.001) {

                    if (x < pmin.x) {
                        pmin = { x: x, y: y };
                    }
                    if (x > pmax.x) {
                        pmax = { x: x, y: y };
                    }
                }
            }
            if (pmin.x <= median && pmax.x > median) {
                let upper_bridge = [pmin, pmax];
                return upper_bridge;
            }
            else if (pmax.x <= median) {
                for (let i = 0; i < EQUAL.length; i++) {
                    let pt = EQUAL[i][1];
                    candidates.push(pt);
                }
                for (let i = 0; i < LARGE.length; i++) {
                    let pt = LARGE[i][1];
                    candidates.push(pt);
                }
                for (let i = 0; i < SMALL.length; i++) {
                    let pt1 = SMALL[i][0];
                    let pt2 = SMALL[i][1];
                    candidates.push(pt1);
                    candidates.push(pt2);
                }
                // changed
                return get_upper_bridge(candidates, median);
            }
            else if (pmin.x > median) {
                for (let i = 0; i < EQUAL.length; i++) {
                    let pt = EQUAL[i][0];
                    candidates.push(pt);
                }
                for (let i = 0; i < LARGE.length; i++) {
                    let pt1 = LARGE[i][0];
                    let pt2 = LARGE[i][1];
                    candidates.push(pt1);
                    candidates.push(pt2);
                }
                for (let i = 0; i < SMALL.length; i++) {    
                    let pt = SMALL[i][0];
                    candidates.push(pt);
                }
                // console.log("candidates");
                // console.log(candidates);
                // changed
                return get_upper_bridge(candidates, median);
            }
        }
        const get_lower_bridge = (points, median) => {
            points.sort((a, b) => a.x < b.x ? -1 : 1);
            console.log("Points lower bridge", points);
            if(points.length === 1)
            {
                return [points[0], points[0]];
            }
            let candidates = [];
            let pairs = [];

            if(points.length % 2 === 0){
                for(let i = 0; i < points.length; i += 2){
                    let first_pt = points[i];
                    let second_pt = points[i];
                    if(i + 1 !== points.length)
                    {
                        second_pt = points[i + 1];
                    }                    
                    let curr_pair = [first_pt, second_pt];
                    pairs.push(curr_pair);
                }
            }
            else{
                candidates.push(points[0]);
                for(let i = 1; i < points.length; i += 2){
                    let first_pt = points[i];
                    let second_pt = points[i];
                    if(i + 1 !== points.length)
                    {
                        second_pt = points[i + 1];
                    }
                    
                    let curr_pair = [first_pt, second_pt];
                    pairs.push(curr_pair);
                }
            }
            let slopes_len = pairs.length;
            let slopes = [];
            // console.log("lower pairs", pairs);
            for (let i = 0; i < pairs.length; i++) {
                let p1 = pairs[i][0];
                let p2 = pairs[i][1];
                let x1 = p1.x;
                let x2 = p2.x;
                let y1 = p1.y;
                let y2 = p2.y;

                if (x1 === x2) {
                    if (y1 > y2) {
                        candidates.push(p2);
                    } else {
                        candidates.push(p1);
                    }
                    slopes[i] = Infinity;
                }
                else {
                    let slope = (y2 - y1) / (x2 - x1);
                    slopes[i] = slope;
                }
            }
                // console.log("lower slopes : ", slopes);
                let arr = [];
                let len = 0;
                for (let i = 0; i < slopes_len; i++) {
                    if (slopes[i] !== Infinity) {
                        arr[len++] = slopes[i];
                    }
                }

                // if(len === 0)
                // {
                //     return Infinity, Infinity;
                // } // check....

                let median_slope;
                // console.log("len : ", len);
                // console.log("arr : ", arr);
                if (len === 1)
                    median_slope = arr[0];
                else
                    median_slope = kthSmallest(arr, 0, len - 1, Math.floor((len + 1) / 2));

                let SMALL = [];
                let EQUAL = [];
                let LARGE = [];
                for (let i = 0; i < pairs.length; i++) {
                    let p1 = pairs[i][0];
                    let p2 = pairs[i][1];
                    let x1 = p1.x;
                    let x2 = p2.x;
                    let y1 = p1.y;
                    let y2 = p2.y;
                    if (x1 !== x2) {
                        let slope = (y2 - y1) / (x2 - x1);
                        // console.log("slope : ", slope);
                        // console.log("median slope : ", median_slope);
                        if (slope === median_slope) {
                            let curr_pair = [p1, p2];
                            EQUAL.push(curr_pair);
                        }
                        else if (slope < median_slope) {
                            let curr_pair = [p1, p2];
                            SMALL.push(curr_pair);
                        }
                        else if (slope > median_slope) {
                            let curr_pair = [p1, p2];
                            LARGE.push(curr_pair);
                        }
                    }
                }
                let min_c = Infinity;

                for (let i = 0; i < points.length; i++) {
                    let x = points[i].x;
                    let y = points[i].y;
                    let curr_c = y - median_slope * x;
                    if (curr_c < min_c) {
                        min_c = curr_c;
                    }
                }
                // console.log("**** get lower bridge *****");
                let pmin = { x: Infinity, y: Infinity };
                let pmax = { x: -Infinity, y: -Infinity };
                for (let i = 0; i < points.length; i++) {
                    let x = points[i].x;
                    let y = points[i].y;
                    let curr_c = y - median_slope * x;
                    if (Math.abs(curr_c - min_c) < 0.001) {
                        if (x < pmin.x) {
                            pmin = { x: x, y: y };
                        }
                        if (x > pmax.x) {
                            pmax = { x: x, y: y };
                        }
                    }
                }
                // console.log("current equal", EQUAL);
                // console.log("current small", SMALL);
                // console.log("current large", LARGE);
                console.log("pmin : ", pmin);
                console.log("pmax : ", pmax);
                console.log("median : ", median);
                if (pmin.x <= median && pmax.x > median) {
                    let lower_bridge = [pmin, pmax];
                    // console.log("lower bridge : ", lower_bridge );
                    return lower_bridge;
                }
                else if (pmax.x <= median) {
                    for (let i = 0; i < EQUAL.length; i++) {
                        let pt = EQUAL[i][1];
                        candidates.push(pt);
                    }
                    for (let i = 0; i < LARGE.length; i++) {
                        let pt1 = LARGE[i][0];
                        let pt2 = LARGE[i][1];
                        candidates.push(pt1);
                        candidates.push(pt2);
                    }
                    for (let i = 0; i < SMALL.length; i++) {
                        let pt = SMALL[i][1];
                        candidates.push(pt);
                    }
                    // console.log("candidates left here : ", candidates);
                    // changed
                    return get_lower_bridge(candidates, median);
                }
                else if (pmin.x > median) {
                    for (let i = 0; i < EQUAL.length; i++) {
                        let pt = EQUAL[i][0];
                        candidates.push(pt);
                    }
                    for (let i = 0; i < LARGE.length; i++) {
                        let pt = LARGE[i][0];
                        candidates.push(pt);
                    }
                    for (let i = 0; i < SMALL.length; i++) {
                        let pt1 = SMALL[i][0];
                        let pt2 = SMALL[i][1];
                        candidates.push(pt1);
                        candidates.push(pt2);
                    }
                    // console.log("candidates left here : ", candidates);
                    // changed
                    return get_lower_bridge(candidates, median);
            }
        }
        const get_upper_hull = (pmin, pmax, points) => {
            // // console.log("get upper hull starts");
            let upper_hull = [];
            let n = points.length;
            let arr = [];
            for (let i = 0; i < n; i++) {
                arr[i] = points[i].x;
            }

            let median;
            if (n === 1) {
                median = arr[0];
            }
            else {
                median = kthSmallest(arr, 0, n - 1, Math.floor((n + 1) / 2)); // yes I am stupid
            }
            // // console.log("Test");
            // // // console.log("median");
            // // // console.log(median); // correct till here
            // // console.log("computation for get upper bridge starts ");
            const upper_bridge = get_upper_bridge(points, median);
            // console.log("upper_bridge");
            // console.log(upper_bridge);

            let pl = upper_bridge[0];
            let pr = upper_bridge[1];

            if (pl.x > pr.x) {
                let temp = pl;
                pl = pr;
                pr = temp;
            } // mai upper hull mai points sorted rakhna chahata hun
            upper_hull.push(pl);
            upper_hull.push(pr);

            if (pmin.x !== pl.x || pmin.y !== pl.y) // idk if pmin !== pl works
            {
                let upper_T_left = get_T(pmin, pl, points, false);
                let left = get_upper_hull(pmin, pl, upper_T_left);
                upper_hull = upper_hull.concat(left); // check don't know syntax
            }

            if (pmax.x !== pr.x || pmax.y !== pr.y) {
                let upper_T_right = get_T(pr, pmax, points, false);
                let right = get_upper_hull(pr, pmax, upper_T_right);
                upper_hull = upper_hull.concat(right);
            }
            // // console.log("upper_hull", upper_hull);
            return upper_hull;
        }

        const get_lower_hull = (pmin, pmax, points) => {
            let lower_hull = [];
            let n = points.length;
            let arr = [];
            for (let i = 0; i < n; i++) {
                arr[i] = points[i].x;
            }
            let median = n === 1 ? arr[0] : kthSmallest(arr, 0, n - 1, Math.floor((n + 1) / 2));
            // console.log("Hello");
            let lower_bridge = get_lower_bridge(points, median);
            // console.log("test1");
            let pl = lower_bridge[0];
            let pr = lower_bridge[1];
            // console.log("test2");
            
            if (pl.x > pr.x) {
                let temp = pl;
                pl = pr;
                pr = temp;
            }
            
            lower_hull.push(pl);
            lower_hull.push(pr);
            
            if (pmin.x !== pl.x || pmin.y !== pl.y) {
                let lower_T_left = get_T(pmin, pl, points, true);
                let left = get_lower_hull(pmin, pl, lower_T_left);
                lower_hull = lower_hull.concat(left);
            }
            if (pmax.x !== pr.x || pmax.y !== pr.y) {
                let lower_T_right = get_T(pr, pmax, points, true);
                let right = get_lower_hull(pr, pmax, lower_T_right);
                lower_hull = lower_hull.concat(right);
            }
            // console.log("lower_hull", lower_hull);
            return lower_hull;
        }


        // Helper function to determine orientatio

        // Divide points into upper and lower halves
        // const upperHull = findHull(this.points);
        // const lowerHull = findHull(this.points.slice().reverse());
        const hull = findHull(this.points);

        // Merge upper and lower hulls
        // return upperHull.concat(lowerHull.slice(1, -1));
        return hull;
    }

    orientation(p1, p2, p3) {
        return (p2.y - p1.y) * (p3.x - p2.x) - (p2.x - p1.x) * (p3.y - p2.y);
    }
}

export default ConvexHull;
