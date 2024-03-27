// Point.js
class Point {
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }

    get x() {
        return this._x;
    }

    set x(value) {
        this._x = value;
    }

    get y() {
        return this._y;
    }

    set y(value) {
        this._y = value;
    }

    const get_upper_hull = (pmin, pmax, points) => {
        console.log("get upper hull starts");
        let upper_hull = [];
        let n = points.length;
        let arr = [];
        for(let i = 0; i < n; i++)
        {
            arr[i] = points[i].x;
        }
        
        let median;
        if(n === 1)
        {
            median = arr[0];
        }
        else
        {
            median = kthSmallest(arr, 0, n-1, Math.floor((n + 1)/2)); // yes I am stupid
        }
        console.log("Test");
        // console.log("median");
        // console.log(median); // correct till here
        console.log("computation for get upper bridge starts ");
        const upper_bridge = get_upper_bridge(points, median);
        console.log("upper_bridge");
        console.log(upper_bridge);

        let pl = upper_bridge[0];
        let pr = upper_bridge[1];

        if(pl.x > pr.x)
        {
            let temp = pl;
            pl = pr;
            pr = temp;
        } // mai upper hull mai points sorted rakhna chahata hun

        upper_hull.push(pl);
        upper_hull.push(pr);

        if(pmin.x !== pl.x || pmin.y !== pl.y) // idk if pmin !== pl works
        {
            let upper_T_left = get_T(pmin, pl, points, false);
            let left = get_upper_hull(pmin, pl, upper_T_left);
            upper_hull = upper_hull.concat(left); // check don't know syntax
        }

        if(pmax.x !== pr.x || pmax.y !== pr.y)
        {
            let upper_T_right = get_T(pr, pmax, points, false);
            let right = get_upper_hull(pr, pmax, upper_T_right);
            upper_hull = upper_hull.concat(right);
        }
        console.log("upper_hull", upper_hull);
        return upper_hull;
    }

    const get_upper_bridge = (points, median) =>
        {
            console.log("get upper bridge starts");
            points.sort((a, b) => a.x < b.x ? -1 : 1);
            // let candidates = new Array(points.length);
            // let pairs = new Array(Math.floor(points.length / 2) + 1);
            let candidates = [];
            let pairs = [];
            console.log("points");
            console.log(points);
            console.log(points.length);
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
            console.log("pairs");
            console.log(pairs.length);
            console.log(pairs);
            for(let i = 0; i < pairs.length; i++){
                let p1 = pairs[i][0];
                let p2 = pairs[i][1];
                let x1 = p1.x;
                let x2 = p2.x;
                let y1 = p1.y;
                let y2 = p2.y;
                // console.log("p1", p1);
                // console.log("p2", p2);
                // console.log("x1", x1);
                // console.log("x2", x2);
                // console.log("y1", y1);
                // console.log("y2", y2);
                if(x1 === x2){
                    if(y1 > y2){
                        candidates.push(p1);
                    }
                    else{
                        candidates.push(p2);
                    }
                    slopes[i] = Infinity;
                }
                else{
                    let slope = (y2 - y1) / (x2 - x1);
                    slopes[i] = slope;
                }
            }
            let arr = [];
            let len = 0;
            for(let i = 0; i < slopes_len; i++){
                if(slopes[i] !== Infinity){
                    arr[len++] = slopes[i];
                }
            } // array ke andar slopes daal diye
            console.log("hello upper bridge");
            
        let median_slope;
        if(len === 1)
            median_slope = arr[0];
        else
            median_slope = kthSmallest(arr, 0, len - 1, Math.floor((len + 1) / 2)); // I am bad programmer :(
        
        console.log("median slope");
        console.log(median_slope);

        // let SMALL = new Array(pairs.length);
        // let EQUAL = new Array(pairs.length);
        // let LARGE = new Array(pairs.length);
        let SMALL = [];
        let EQUAL = [];
        let LARGE = [];
        for(let i = 0; i < pairs.length; i++){
            let p1 = pairs[i][0];
            let p2 = pairs[i][1]; 
            let x1 = p1.x;
            let x2 = p2.x;
            let y1 = p1.y;
            let y2 = p2.y;
            
            if(x1 !== x2){
                let slope = (y2 - y1) / (x2 - x1);
                if(slope === median_slope){
                    let curr_pair = [p1, p2];
                    EQUAL.push(curr_pair);
                }
                else if(slope < median_slope){
                    let curr_pair = [p1, p2];
                    SMALL.push(curr_pair);
                }
                else if(slope > median_slope){
                    let curr_pair = [p1, p2];
                    LARGE.push(curr_pair);
                }
            }
        }
        console.log("SMALL", SMALL);
        console.log("EQUAL", EQUAL);
        console.log("LARGE", LARGE);
        let max_c = -Infinity;
        for(let i = 0; i < points.length; i++){
            
            let x = points[i].x;
            let y = points[i].y;
            let curr_c = y - median_slope * x;
            
            if(curr_c > max_c){
                max_c = curr_c;
            }
            
        }
        
        console.log("smort pointer");
        let pmin = {x: Infinity, y: Infinity};
        let pmax = {x: -Infinity, y: -Infinity};
        for(let i = 0; i < points.length; i++){

            let x = points[i].x;
            let y = points[i].y;
        
            let curr_c = y - median_slope * x;
        
            if(curr_c === max_c){
        
                if(x < pmin.x){
                    pmin = {x: x, y: y};
                }
                if(x > pmax.x){
                    pmax = {x: x, y: y};
                }
            }
        }
        if(pmin.x <= median && pmax.x > median){
            let upper_bridge = [pmin, pmax];
            return upper_bridge;
        }
        else if(pmax.x <= median){
            for(let i = 0; i < EQUAL.length; i++){
                let pt = EQUAL[i][1];
                candidates.push(pt);
            }
            for(let i = 0; i < LARGE.length; i++){
                let pt = LARGE[i][1];
                candidates.push(pt);
            }
            for(let i = 0; i < SMALL.length; i++){
                let pt1 = SMALL[i][0];
                let pt2 = SMALL[i][1];
                candidates.push(pt1);
                candidates.push(pt2);
            }
            return get_upper_bridge(candidates, median);
        }
        else if(pmin.x > median){
            for(let i = 0; i < EQUAL.length; i++){
                let pt = EQUAL[i][0];
                candidates.push(pt);
            }
            for(let i = 0; i < LARGE.length; i++){
                let pt1 = LARGE[i][0];
                let pt2 = LARGE[i][1];
                candidates.push(pt1);
                candidates.push(pt2);
            }
            for(let i = 0; i < SMALL.length; i++){
                let pt = SMALL[i][0];
                candidates.push(pt);
            }
            console.log("candidates");
            console.log(candidates);
            return get_upper_bridge(candidates, median);
        }


}

export default Point;
