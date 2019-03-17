var tick_time = 1000;
/* Draw functions */
function draw_resource_bar(state) {
    var money_rate = (1.0 * state.timers.base.amnt) /
        state.timers.base.limit;
    var wages = (state.timers.wages.amnt);
    var pm = money_rate;
    var phr = 0 - wages;
    document.getElementById("resource-bar").innerHTML =
        "Money: $" + state.res.money + " ($" + pm + "/min)"
            + "($" + phr + "/hr)<br>Workers: " + state.res.workers;
}
function draw_worker_area(state) {
    document.getElementById("unskilled-text").innerHTML =
        "Unskilled Workers: " + state.res.unsk_w + " ($"
            + state.prices.unsk_w + "/hr)";
    document.getElementById("manager-text").innerHTML =
        "Managers: " + state.res.manag + " ($"
            + state.prices.manag + "/hr)";
}
function draw(state) {
    draw_resource_bar(state);
    draw_worker_area(state);
}
function unhide(state) {
    if (!state.upgrades.basic1 && state.res.money >= 10) {
        document.getElementById("basic-res-1").style.display = "inline";
    }
}
function tick(state) {
    state.ticks += 1;
    if (state.ticks - state.timers.base.prev >=
        state.timers.base.limit) {
        state.res.money += state.timers.base.amnt;
        state.timers.base.prev = state.ticks;
    }
    if (state.ticks - state.timers.wages.prev >=
        state.timers.wages.limit) {
        state.res.money -= state.timers.wages.amnt;
        state.timers.wages.prev = state.ticks;
    }
    draw(state);
    unhide(state);
}
function update(state) {
    state.time = (new Date()).getTime();
    if (state.time - state.time_prev > tick_time) {
        tick(state);
        state.time_prev = state.time;
    }
    requestAnimationFrame((function () { return update(state); }));
}
var gstate = {
    time_prev: 0,
    time: (new Date()).getTime(),
    ticks: 0,
    timers: {
        base: {
            limit: 1,
            prev: 0,
            amnt: 1
        },
        wages: {
            limit: 60,
            prev: 0,
            amnt: 0
        }
    },
    res: {
        money: 0,
        unsk_w: 0,
        manag: 0,
        workers: 0
    },
    prices: {
        unsk_w: 9,
        manag: 15
    },
    upgrades: {
        basic1: false
    }
};
update(gstate);
/* onclick functions */
function unskilled_hire() {
    gstate.timers.wages.amnt += gstate.prices.unsk_w;
    gstate.res.unsk_w += 1;
    gstate.res.workers += 1;
    draw(gstate);
}
function unskilled_fire() {
    gstate.timers.wages.amnt -= gstate.prices.unsk_w;
    gstate.res.unsk_w -= 1;
    gstate.res.workers -= 1;
    draw(gstate);
}
function basic_research_1() {
    document.getElementById("basic-res-1").style.display = "none";
    gstate.upgrades.basic1 = true;
    document.getElementById("manager-tab").style.display = "inline";
    draw(gstate);
}
function manager_hire() {
    gstate.timers.wages.amnt += gstate.prices.manag;
    gstate.res.manag += 1;
    gstate.res.workers += 1;
    draw(gstate);
}
function manager_fire() {
    gstate.timers.wages.amnt -= gstate.prices.unsk_w;
    gstate.res.manag -= 1;
    gstate.res.workers -= 1;
    draw(gstate);
}
