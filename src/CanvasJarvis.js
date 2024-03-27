// Canvas.js
import React, { useRef, useEffect, useState } from 'react';
import './Canvas.css';
import p_ope from './p_right_open.png';
import p_clos from './p_right_close.png';
import cyan_ from './cyan_ghost.png';
import afraid_ from './afraid_ghost.png';

var ctx;
var canvas;
var currentPoints = [];
var indexOfGhosts = [];

// output
var myConvexHull = []; // outputIndex, points, pairs, pairs, state
var outputindex = 0;
var p_close = new Image();
// p_close_first.src = "./p_right_close.png";
p_close.src = p_clos;
// // p_close.onload = () => {
// // };
var p_open = new Image();
// p_open_first.src = "./p_right_open.png";
p_open.src = p_ope;
var cyan_g = new Image();
// cyan_g_first.src = "./cyan_ghost.png";
cyan_g.src = cyan_;
var afraid_g = new Image();
// afraid_g_first.src = "./afraid_ghost.png";
afraid_g.src = afraid_;
var p_size = 25;
var ghostSize = 20;
var ghostList = [];
var ghostList_in_next = [];
var pacman;
var list1 = [];
var list2 = [];
var hull_list = [];
var f = false;
var flag2 = false;
// var list3 = [];
var flag3 = true;
var idx = 0;

let req1;
let req2;

function Pacman(non_hull, img_open, img_close, size) {
    this.non_hull = non_hull.slice();
    // console.log("i",list1);
    list1.reverse();
    list1.pop();
    list1.reverse();
    // console.log("Hi",list1);
    // list1 = list1.slice(1);
    this.curr_x = this.non_hull[0].x;
    this.curr_y = this.non_hull[0].y;
    this.size = size;
    if (this.non_hull.length > 1) {
        this.next_x = this.non_hull[1].x;
        this.next_y = this.non_hull[1].y;
    }
    else {
        this.next_x = this.non_hull[0].x;
        this.next_y = this.non_hull[0].y;
    }
    this.eqal_x = 0;
    if (this.curr_x === this.next_x) {
        this.eqal_x = 1;
    }
    this.image_open = img_open;
    this.image_close = img_close;
    // this.rotate_image = function(degree) {
    //     degree = (degree + 360) % 360;
    //     this.image_close.style.transform = `rotate(${degree}deg)`;
    //     this.image_open.style.transform = `rotate(${degree}deg)`;
    //     // console.log("in rotate image", degree);
    //     // console.log(`rotate(${degree}deg)`);
    // }
    this.dx = Math.sign(this.next_x - this.curr_x);
    this.slope = Math.sign(this.next_y - this.curr_y);
    if (this.curr_x !== this.next_x) {
        this.slope = (this.next_y - this.curr_y) / (this.next_x - this.curr_x);
    }
    if (this.dx !== 0) {
        this.slope = this.slope * this.dx;
    }
    // this.orientation = Math.atan(this.slope);
    if (this.curr_x === this.next_x) {
        this.orientation = Math.sign(this.next_y - this.curr_y) * Math.PI / 2;
    }
    // this.rotate_image(this.orientation * 180 / Math.PI);
    this.flag = 0;
    this.count = 0;
    this.index = 1;
    this.set_non_hull = function (non_hull) {
        this.non_hull = non_hull.slice();
        this.next_x = this.non_hull[0].x;
        this.next_y = this.non_hull[0].y;
        this.dx = Math.sign(this.next_x - this.curr_x);
        this.slope = Math.sign(this.next_y - this.curr_y);
        if (this.curr_x !== this.next_x) {
            this.slope = (this.next_y - this.curr_y) / (this.next_x - this.curr_x);
        }
        if (this.dx !== 0) {
            this.slope = this.slope * this.dx;
        }
        this.original_slope = this.slope;
        this.original_dx = this.dx;
        this.orientation = Math.atan(this.slope);
        if (this.curr_x === this.next_x) {
            this.orientation = Math.sign(this.next_y - this.curr_y) * Math.PI / 2;
        }
        this.reduce_speed();
        this.flag = 0;
        this.count = 0;
        this.index = 0;
        if (this.curr_x === this.next_x) {
            this.eqal_x = 1;
        }
        else {
            this.eqal_x = 0;
        }
    }
    this.original_slope = this.slope;
    this.original_dx = this.dx;
    this.reduce_speed = function () {
        while (this.dx >= 0.0001 && (this.slope >= 2 || this.slope <= -2)) {
            this.dx = this.dx / 2;
            this.slope = this.slope / 2;
        }
    }
    this.reduce_speed();
    this.get_position = function () {
        return { x: this.curr_x, y: this.curr_y };
    }

    this.draw_open = function () {
        // console.log("in draw open: ", (this.orientation + 2 * Math.PI) , this.orientation);
        ctx.save();
        ctx.translate(this.curr_x, this.curr_y);
        var deltaX = this.next_x - this.curr_x;
        var deltaY = this.next_y - this.curr_y;
        var angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        ctx.rotate(angle * Math.PI / 180);
        ctx.drawImage(this.image_open, -this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }

    this.draw_close = function () {
        ctx.save();
        ctx.translate(this.curr_x, this.curr_y);
        var deltaX = this.next_x - this.curr_x;
        var deltaY = this.next_y - this.curr_y;
        var angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        ctx.rotate(angle * Math.PI / 180);
        ctx.drawImage(this.image_close, -this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }

    this.draw_food = function (x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.closePath();
    }

    this.draw_hull = function () {
        ctx.lineWidth = 5;
        for (var i = 0; i < hull_list.length - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(hull_list[i].x, hull_list[i].y);
            ctx.lineTo(hull_list[i + 1].x, hull_list[i + 1].y);
            ctx.strokeStyle = 'black';
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(hull_list[hull_list.length - 1].x, hull_list[hull_list.length - 1].y);
        ctx.lineTo(this.curr_x, this.curr_y);
        ctx.strokeStyle = 'black';
        ctx.stroke();
    }

    this.update = function () {
        if (f === true && hull_list.length > 1) {
            this.draw_hull();
        }
        this.count++;
        this.curr_x += this.dx;
        this.curr_y += this.slope;

        if (this.eqal_x === 0) {
            if (this.curr_x !== this.next_x) {
                for (var i = this.curr_x; i !== this.next_x; i += (10 * this.original_dx)) {
                    if (Math.abs(i) < canvas.width) {
                    } else {
                        break;
                    }
                    if (this.original_dx === 1 && i > this.next_x) {
                        break;
                    }
                    else if (this.original_dx === -1 && i < this.next_x) {
                        break;
                    }
                    // this.draw_food(i, this.curr_y + (i - this.curr_x) * this.slope * this.dx);
                    this.draw_food(i, this.curr_y + (i - this.curr_x) * this.original_slope * this.original_dx);
                }
            }
            if (this.index === this.non_hull.length - 1 && this.curr_x === this.next_x) {
                this.curr_x = this.next_x;
                this.curr_y = this.next_y;
                this.dx = 0;
                this.slope = 0;
                if (f === true) {
                    hull_list.push(list2[0]);
                }
                list1.reverse();
                list1.pop();
                list1.reverse();
                // list1 = list1.slice(1);
                this.draw_close();
                // console.log(points.length);
                // console.log(non_hull.length);
            }
            // else if(this.curr_x === this.next_x && Math.abs(this.curr_y - this.next_y) > 1) {

            // }
            else if (this.curr_x === this.next_x) {
                this.curr_x = this.next_x;
                this.curr_y = this.next_y;
                this.next_x = this.non_hull[this.index + 1].x;
                this.next_y = this.non_hull[this.index + 1].y;
                this.dx = Math.sign(this.next_x - this.curr_x);
                this.slope = Math.sign(this.next_y - this.curr_y);
                if (this.curr_x !== this.next_x) {
                    this.slope = (this.next_y - this.curr_y) / (this.next_x - this.curr_x);
                }
                if (this.dx !== 0) {
                    this.slope = this.slope * this.dx;
                }
                this.original_slope = this.slope;
                this.original_dx = this.dx;
                this.reduce_speed();
                this.flag = 0;
                if (this.curr_x === this.next_x) {
                    this.eqal_x = 1;
                }
                else {
                    this.eqal_x = 0;
                }
                this.orientation = Math.atan(this.slope);
                if (this.curr_x === this.next_x) {
                    this.orientation = Math.sign(this.next_y - this.curr_y) * Math.PI / 2;
                }
                this.count = 0;
                this.index++;
                // points = points.slice(1);
                this.draw_close();
            }
            else if (this.flag === 0) {
                this.draw_close();
                if (this.count === 15) {
                    this.flag = 1;
                    this.count = 0;
                }
            }
            else {
                this.draw_open();
                if (this.count === 15) {
                    this.flag = 0;
                    this.count = 0;
                }
            }
            if (list1.length > 1 && this.curr_x === list1[0].x) {
                if (f === true) {
                    hull_list.push(list2[0]);
                }
                list1.reverse();
                list1.pop();
                list1.reverse();
                // list1 = list1.slice(1);
                // console.log(points.length);
                // console.log(non_hull.length);
            }
        }
        else {
            if (this.curr_y !== this.next_y) {
                for (var itr = this.curr_y; itr !== this.next_y; itr += (10 * this.original_slope)) {
                    if (Math.abs(itr) > canvas.height) {
                        break;
                    }
                    if (this.original_slope === 1 && itr > this.next_y) {
                        break;
                    }
                    else if (this.original_slope === -1 && itr < this.next_y) {
                        break;
                    }
                    this.draw_food(this.curr_x, itr);
                    // console.log("slope:", this.slope);
                    // console.log("in loop draw: ",this.curr_x, i);
                }
            }
            if (this.index === this.non_hull.length - 1 && this.curr_y === this.next_y) {
                this.curr_x = this.next_x;
                this.curr_y = this.next_y;
                this.dx = 0;
                this.slope = 0;
                if (f === true) {
                    hull_list.push(list2[0]);
                }
                list1.reverse();
                list1.pop();
                list1.reverse();
                // list1 = list1.slice(1);
                this.draw_close();
                // console.log(points.length);
                // console.log(non_hull.length);
            }
            // else if(this.curr_x === this.next_x && Math.abs(this.curr_y - this.next_y) > 1) {

            // }
            else if (this.curr_y === this.next_y) {
                this.curr_x = this.next_x;
                this.curr_y = this.next_y;
                this.next_x = this.non_hull[this.index + 1].x;
                this.next_y = this.non_hull[this.index + 1].y;
                this.dx = Math.sign(this.next_x - this.curr_x);
                this.slope = Math.sign(this.next_y - this.curr_y);
                if (this.curr_x !== this.next_x) {
                    this.slope = (this.next_y - this.curr_y) / (this.next_x - this.curr_x);
                }
                if (this.dx !== 0) {
                    this.slope = this.slope * this.dx;
                }
                this.original_slope = this.slope;
                this.original_dx = this.dx;
                this.reduce_speed();
                this.flag = 0;
                if (this.curr_x === this.next_x) {
                    this.eqal_x = 1;
                }
                else {
                    this.eqal_x = 0;
                }
                this.orientation = Math.atan(this.slope);
                if (this.curr_x === this.next_x) {
                    this.orientation = Math.sign(this.next_y - this.curr_y) * Math.PI / 2;
                }
                this.count = 0;
                this.index++;
                // points = points.slice(1);
                this.draw_close();
            }
            else if (this.flag === 0) {
                this.draw_close();
                if (this.count === 15) {
                    this.flag = 1;
                    this.count = 0;
                }
            }
            else {
                this.draw_open();
                if (this.count === 15) {
                    this.flag = 0;
                    this.count = 0;
                }
            }
            if (list1.length > 1 && this.curr_y === list1[0].y) {
                if (f === true) {
                    hull_list.push(list2[0]);
                }
                list1.reverse();
                list1.pop();
                list1.reverse();
                // list1 = list1.slice(1);
                // console.log(points.length);
                // console.log(non_hull.length);
            }
        }
    }

}

function Ghost(x, y, next_x, next_y, image, size) {
    this.x = x;
    this.y = y;
    this.initial_x = x;
    this.initial_y = y;
    this.size = size;
    this.next_x = next_x;
    this.next_y = next_y;
    this.image = image;
    this.dx = Math.sign(this.next_x - this.initial_x);
    this.slope = Math.sign(this.next_y - this.initial_y);
    if (this.initial_x !== this.next_x) {
        this.slope = (this.next_y - this.initial_y) / (this.next_x - this.initial_x);
    }
    this.reduce_speed = function () {
        while (this.dx >= 0.0001 && (this.slope >= 2 || this.slope <= -2)) {
            this.dx = this.dx / 2;
            this.slope = this.slope / 2;
        }
    }
    this.reduce_speed();
    this.get_position = function () {
        return { x: this.x, y: this.y };
    }
    // console.log(this.slope);
    // this.slope = this.slope / 10;
    this.draw = function () {
        // ctx.beginPath();
        // ctx.arc(this.initial_x, this.initial_y, 5, 0, 2 * Math.PI);
        // ctx.arc(this.next_x, this.next_y, 5, 0, 2 * Math.PI);
        // ctx.fillStyle = 'violet';
        // ctx.fill();
        // ctx.closePath();
        ctx.drawImage(this.image, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }
    this.update = function () {
        if (this.initial_x !== this.next_x) {
            if (this.initial_x < this.next_x) {
                if (this.x >= this.next_x) {
                    this.dx = -this.dx;
                    this.x = this.next_x;
                    this.y = this.next_y;
                }
                else if (this.x <= this.initial_x) {
                    this.dx = -this.dx;
                    this.x = this.initial_x;
                    this.y = this.initial_y;
                }
            }
            else {
                if (this.x <= this.next_x) {
                    this.dx = -this.dx;
                    this.x = this.next_x;
                    this.y = this.next_y;
                }
                else if (this.x >= this.initial_x) {
                    this.dx = -this.dx;
                    this.x = this.initial_x;
                    this.y = this.initial_y;
                }
            }
            if (this.initial_y < this.next_y) {
                if (this.y >= this.next_y) {
                    this.slope = -this.slope;
                    this.y = this.next_y;
                }
                else if (this.y <= this.initial_y) {
                    this.slope = -this.slope;
                    this.y = this.initial_y;
                }
            }
            else {
                if (this.y < this.next_y) {
                    this.slope = -this.slope;
                    this.y = this.next_y;
                }
                else if (this.y > this.initial_y) {
                    this.slope = -this.slope;
                    this.y = this.initial_y;
                }
            }
        }
        else {
            // if points have same x coordinate
            if (this.initial_y < this.next_y) {
                if (this.y >= this.next_y) {
                    this.slope = -this.slope;
                    this.y = this.next_y;
                }
                else if (this.y <= this.initial_y) {
                    this.slope = -this.slope;
                    this.y = this.initial_y;
                }
            }
            else {
                if (this.y < this.next_y) {
                    this.slope = -this.slope;
                    this.y = this.next_y;
                }
                else if (this.y > this.initial_y) {
                    this.slope = -this.slope;
                    this.y = this.initial_y;
                }
            }
        }
        // if(this.y > this.next_y || this.y < this.initial_y) {
        //     this.slope = -this.slope;
        // }
        this.x += this.dx;
        this.y += this.slope;
        // console.log(this.slope);
        // console.log(this.x, this.y);
        this.draw();
    }

}

function draw() {
    // cc++;
    // // // console.log("in draw: ");
    // if(cc % 100 === 0) {
    //     console.log("in draw: ",cc);
    // }
    // if(flag2 === true) {
        req1 = requestAnimationFrame(draw);
    // }
    // else{
    //     return;
    // }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // for(var i = 0; i < list2.length; i++) {
    if(ghostList.length - list2.length > 1) {
        // ghostList.reverse();
        // ghostList.pop();
        // ghostList.reverse();
        ghostList.shift();
    }
    if(ghostList.length !== 0 && f === true) {
        var ghost_pos = ghostList[0].get_position();
        var pacman_pos = pacman.get_position();
        if(Math.abs(ghost_pos.x - pacman_pos.x) < 2 && Math.abs(ghost_pos.y - pacman_pos.y) < 2) {
            ghostList.reverse();
            ghostList.pop();
            ghostList.reverse();
        }
    }
    // }
    for(var itr = 0; itr < list2.length; itr++) {
        ctx.beginPath();
        ctx.arc(list2[itr].x, list2[itr].y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
    }
    // console.log("in draw", list1.length);
    for(var i = 0; i < list1.length; i++) {
        ctx.beginPath();
        ctx.arc(list1[i].x, list1[i].y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
    }
    // console.log("ghostList", ghostList);
    for(var i = 0; i < ghostList.length; i++) {
        ghostList[i].update();
        // console.log(i);
    }
    if(list1.length > 0) {
        pacman.update();
        // console.log("in draw update call", list1.length);
    }
    else if(list2.length === 0) {
        if(ghostList.length > 0) {
            ghostList.shift();
        }
        pacman.draw_hull();
        console.log("FINISH draw hull call");
        cancelAnimationFrame(req1);
        // flag2 = false;
        return;
    }
    else {
        f = true;
        list1 = list2;
        hull_list.push(list2[0]);
        pacman.image_open = p_open;
        pacman.image_close = p_close;
        for(var i = 0; i < ghostList.length; i++) {
            ghostList[i].image = afraid_g;
        }
        pacman.set_non_hull(list1);
    }
}

function draw_in_next(){
    // if(flag3 === true) {
    req2 = requestAnimationFrame(draw_in_next);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // }
    // else{
        // return;
    // }
    var index = idx;
    var pts = myConvexHull[index].points;
    const pairs = myConvexHull[index].pairs;
    const state = myConvexHull[index].state;
    const slope = myConvexHull[index].slope;
    const noncandidates = myConvexHull[index].noncandidates;
    // display pairs
    if(pairs !== null && pairs.length !== 1)
    {
        ctx.beginPath();
        ctx.moveTo(pairs[0].x, pairs[0].y);
        ctx.lineTo(pairs[1].x, pairs[1].y);
        for (let i = 1; i < pairs.length - 1; i++) {
            ctx.moveTo(pairs[i].x, pairs[i].y);
            ctx.lineTo(pairs[i+1].x, pairs[i+1].y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'red';
        ctx.stroke();
    }

    if(state === 'leftmost_point')
    {
        ctx.save();
        // ctx.beginPath();
        ctx.fillStyle = 'yellow';
        ctx.arc(noncandidates.x, noncandidates.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        // ctx.closePath();
        ctx.restore();
    }
    // else if(state !== 'upper_bridge' &&  state !== 'upper_hull' && state !== 'lower_bridge' && state !== 'lower_hull' && state !== 'hull' && pairs !== null)
    // {
    //     // draw pairs list
    //     // console.log("These are my pairs", pairs);
    //     ctx.beginPath();
    //     ctx.moveTo(pairs[0][0].x, pairs[0][0].y);
    //     ctx.lineTo(pairs[0][1].x, pairs[0][1].y);
    //     for (let i = 1; i < pairs.length; i++) {
    //         ctx.moveTo(pairs[i][0].x, pairs[i][0].y);
    //         ctx.lineTo(pairs[i][1].x, pairs[i][1].y);
    //     }
    //     ctx.closePath();
    //     ctx.strokeStyle = 'green';
    //     ctx.stroke();
    // }
    // else if(state === 'upper_bridge' || state === 'upper_hull' || state === 'lower_bridge' || state === 'lower_hull' || state === 'hull')
    // {
    //     if(pairs !== null)
    //     {
    //         ctx.beginPath();
    //         ctx.moveTo(pairs[0].x, pairs[0].y);
    //         ctx.lineTo(pairs[1].x, pairs[1].y);
    //         for (let i = 1; i < pairs.length - 1; i++) {
    //             ctx.moveTo(pairs[i].x, pairs[i].y);
    //             ctx.lineTo(pairs[i+1].x, pairs[i+1].y);
    //         }
    //         ctx.closePath();
    //         ctx.strokeStyle = 'blue';
    //         ctx.stroke();
    //     }
    // }
    
    if(state === 'hull')
    {
        // if(flag3 === true) {
            // requestAnimationFrame(draw);
        // }
        // else{
        //     return;
        // }
        if(pairs.length === 2 && flag3 === true)
        {
            // list3.push([pairs[0], pairs[1]]);
            // var dxs = [];
            // var slopes = [];
            // if(indexOfGhosts.findIndex(index) === -1) {
            //     console.log("JJJJJ");
            //     indexOfGhosts.push(index);
            // }

            // this is to avoid same index to be added again
            var found = false;
            for(var i = 0; i < indexOfGhosts.length; i++) {
                if(indexOfGhosts[i] === index) {
                    found = true;
                    break;
                }
            }
            if(found === false) {
                indexOfGhosts.push(index);
            }
            
            // this is to avoid the same ghost to be added again
            for(var i = 0; i < ghostList_in_next.length; i++) {
                if(pairs[0].x === ghostList_in_next[i].initial_x && pairs[0].y === ghostList_in_next[i].initial_y && pairs[1].x === ghostList_in_next[i].next_x && pairs[1].y === ghostList_in_next[i].next_y) {
                    ghostList_in_next.splice(i, 1);
                    break;
                }
            }
            ghostList_in_next.push(new Ghost(pairs[0].x, pairs[0].y, pairs[1].x, pairs[1].y, cyan_g, 20));
            // for(var i = 0; i < ghostList_in_next.length - 1; i++) {
            //     ghostList_in_next[i].dx = dxs[i];
            //     ghostList_in_next[i].slope = slopes[i];
            // }
            flag3 = false;
        }
        
    }

    // display points

    // if(noncandidates !== null && noncandidates.length === 3)
    // {
    //     // console.log("noncandidates", noncandidates);
    //     // console.log("pts", pts);
    //     for(let itr = 0; itr < noncandidates.length; itr++)
    //     {
    //         for(let j = 0; j < pts.length; j++)
    //         {
    //             if(noncandidates[itr].x === pts[j].x && noncandidates[itr].y === pts[j].y)
    //             {
    //                 pts.splice(j, 1);
    //                 break;
    //             }
    //         }
    //     }
    //     // console.log("pts", pts);
    // }


    if (pts !== null) {
        pts.forEach(point => {
            if(((state === 'leftmost_point' || state === 'orientation_counter_clock' || state === 'orientation_clock') && (point.x === noncandidates.x && point.y === noncandidates.y)))
            {

            }
            else
            {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'black';
                ctx.fill();
                ctx.closePath();
            }
        });
    }

    // if (noncandidates !== null && noncandidates.length === 3) {
    //     noncandidates.forEach(point => {
    //         ctx.beginPath();
    //         ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
    //         ctx.fillStyle = 'yellow';
    //         ctx.fill();
    //         ctx.closePath();
    //     });
    // }

    if (noncandidates !== null && noncandidates.length === 3) {
        // Draw points
        noncandidates.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
            ctx.fillStyle = 'yellow';
            ctx.fill();
            ctx.closePath();
        });
    
        // Draw lines
        ctx.beginPath();
        ctx.moveTo(noncandidates[0].x, noncandidates[0].y); 
        ctx.lineTo(noncandidates[2].x, noncandidates[2].y); 
        ctx.lineTo(noncandidates[1].x, noncandidates[1].y);
        ctx.strokeStyle = 'blue'; 
        ctx.stroke(); 
        ctx.closePath();
    }
    



    if (noncandidates !== null && noncandidates.length === 1) {
            ctx.beginPath();
            ctx.arc(noncandidates.x, noncandidates.y, 10, 0, 2 * Math.PI);
            ctx.fillStyle = 'yellow';
            ctx.fill();
            ctx.closePath();
    }


    if(state === 'hull')
    {
        // make lines of points
        console.log("hull ... ");

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for(var i = 0; i < pts.length - 1; i++)
        {
            ctx.lineTo(pts[i+1].x, pts[i+1].y);
        }
        ctx.lineTo(pts[0].x, pts[0].y);
        ctx.closePath();
        ctx.stroke();
        cancelAnimationFrame(req2);
        
        // done fore previous button
        hull_list = [];

        var hull = pts.slice();
        list1 = [];
        list2 = hull.slice();
        list2.push(hull[0]);
        for (var itr = 0; itr < list2.length - 1; itr++) {
            // console.log(points[i].x, points[i].y);
            ghostList.push(new Ghost(list2[itr].x, list2[itr].y, list2[itr + 1].x, list2[itr + 1].y, cyan_g, 20));
        }
        if(list1.length > 0) {
            pacman = new Pacman(list1, p_open, p_close, 25);
        }else{
            pacman = new Pacman(list2, p_open, p_close, 25);
        }
        req1 = requestAnimationFrame(draw);
    }
    if(indexOfGhosts.length > 0 && ghostList_in_next.length > 0 && indexOfGhosts[indexOfGhosts.length - 1] > index && flag2 === true) {
        console.log("index & indexOfGhosts[indexOfGhosts.length - 1]", index, indexOfGhosts[indexOfGhosts.length - 1])
        console.log(indexOfGhosts);
        indexOfGhosts.pop();
        ghostList_in_next.pop();
        flag2 = false;
    }
    // console.log("index & ghostList_in_next.length", index, ghostList_in_next.length);
    for(var i = 0; i < ghostList_in_next.length; i++) {
        ctx.beginPath();
        ctx.arc(ghostList_in_next[i].initial_x, ghostList_in_next[i].initial_y, 5, 0, 2 * Math.PI);
        ctx.arc(ghostList_in_next[i].next_x, ghostList_in_next[i].next_y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'violet';
        ctx.fill();
        ctx.closePath();
        ghostList_in_next[i].update();
    }
}



// ConvexHull.js
class ConvexHull {
    constructor(points) {
        this.points = points;
    }

    findConvexHull() {
        if (this.points.length <= 1) return this.points;

        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        const orientation = (p, q, r) => {
            let val = (q.y - p.y) * (r.x - q.x) -
            (q.x - p.x) * (r.y - q.y);
            
            if (val === 0) {
                return 0;
            }
            return (val > 0) ? 1 : 2;
        }
        
        const findHull = (points) => {

            console.log("I am in Jarvis march");
            shuffle(points);
            console.log(points);
            myConvexHull.push({state: outputindex++, points: points, pairs: null, slope: null, state: 'initial_points', noncandidates: null});
            let hull = [];
            let n = points.length;

            let left = 0;
            for (let i = 1; i < n; i++) {
                if (points[i].x < points[left].x) {
                    left = i;
                }
            }
            myConvexHull.push({state: outputindex++, points: points, pairs: null, slope: null, state: 'leftmost_point', noncandidates: points[left]});

            let p = left, q;
            do {
                hull.push(points[p]);
                q = (p + 1) % n;

                for (let i = 0; i < n; i++) {
                    // console.log("p, i, q", points[p], points[i], points[q]);
                    if (orientation(points[p], points[i], points[q]) === 2)
                    {
                        q = i;
                        myConvexHull.push({state: outputindex++, points: points, pairs: hull.slice(), slope: null, state: 'orientation_counter_clock', noncandidates: [points[p], points[i], points[q]]});
                    }
                    else
                    {
                        myConvexHull.push({state: outputindex++, points: points, pairs: hull.slice(), slope: null, state: 'orientation_clock', noncandidates: [points[p], points[i], points[q]]});
                    }
                }
                p = q;

            } while (p !== left);
            console.log(hull);
            myConvexHull.push({state: outputindex++, points: hull, pairs: hull, slope: null, state: 'hull', noncandidates: null});
            console.log("no of states : ", myConvexHull.length);
            return hull;
        }


        const hull = findHull(this.points);
        return hull;
    }
}

const Canvas = () => {
    const canvasRef = useRef(null);
    const [finished, setFinished] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    var [points, setPoints] = useState([]);
    const [val, setVal] = useState(0);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'q') {
                const newPoints = [];
                while (newPoints.length < 20) {
                    const x = Math.random() * canvasRef.current.width;
                    const y = Math.random() * canvasRef.current.height;
                    if (!newPoints.some(point => point.x === x && point.y === y)) {
                        newPoints.push({ x, y });
                    }
                }
                setPoints(prevPoints => [...prevPoints, ...newPoints]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        canvas = canvasRef.current;
        ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw convex hull
        if (finished) {
            const convexHull = new ConvexHull(points).findConvexHull();
            console.log("my convex hull ", convexHull);
            points = convexHull;
            ctx.beginPath();
            ctx.moveTo(convexHull[0].x, convexHull[0].y);
            for (let i = 1; i < convexHull.length; i++) {
                ctx.lineTo(convexHull[i].x, convexHull[i].y);
            }
            ctx.closePath();
            ctx.strokeStyle = 'red';
            ctx.stroke();
        }

        // Draw points
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'black';
            ctx.fill();
        });

    }, [points, finished]);

    useEffect(() => {
        const handleMouseMove = (event) => {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            setMousePos({ x, y });
        };

        const canvas = canvasRef.current;
        canvas.addEventListener('mousemove', handleMouseMove);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const handleCanvasClick = (event) => {
        if (!finished) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            setPoints(prevPoints => [...prevPoints, { x, y }]);
        }
    };

    const handleFinishClick = () => {
        setFinished(true);
    };

    const clearCanvas = () => {
        setPoints([]);
        setFinished(false);
    };

    const handleNext = () => {
        let index = val < myConvexHull.length - 1 ? val + 1 : val;
        setVal(index);
        console.log(index);
        console.log(myConvexHull[index]);

        ctx.clearRect(0, 0, canvas.width, canvas.height);


        // Draw convex hull
        if (finished) {
            // requestAnimationFrame(draw);
            if(req2 != null){
                cancelAnimationFrame(req2);
            }
            // flag4 = true;
            flag3 = true;
            idx = index;
            req2 = requestAnimationFrame(draw_in_next);
        }
    };

    const handlePrev = () => {
        let index = val > 0 ? val - 1 : 0;
        setVal(index); 
        console.log(index);
        console.log(myConvexHull[index]);
 
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw convex hull

        if (finished) {
            if(req2 != null){
                cancelAnimationFrame(req2);
            }
            // flag4 = true;
            flag3 = true;
            flag2 = true;
            idx = index;
            req2 = requestAnimationFrame(draw_in_next);
        }
    };

    return (
        <div>
            <h4> Jarvis March</h4>
            <canvas className='canvascss'
                ref={canvasRef}
                width={1600}
                height={600}
                onClick={handleCanvasClick}
                style={{ cursor: 'crosshair' }}
            />
            <br />
            <button className="buttons" onClick={handleFinishClick} disabled={points.length === 0 || finished}>
                Finish
            </button>
            <button className="buttons" onClick={clearCanvas} disabled={finished}>
                Clear
            </button>

            <button className='btns' onClick={handleNext}> Next </button>

            <button className='btns' onClick={handlePrev}> Prev </button>

            <h4>Mouse Position: x={mousePos.x.toFixed(2)}, y={mousePos.y.toFixed(2)}</h4>
        </div>
    );
};


export default Canvas;
