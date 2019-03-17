var tick_time = 1000;
function draw_resource_bar(state) {
    var money_rate = (1.0 * state.timers.base.amnt) /
        state.timers.base.limit;
    var wages = (state.timers.wages.amnt);
    var pm = money_rate;
    var phr = 0 - wages;
    document.getElementById("resource-bar").innerHTML =
        "Money: $" + state.res.money + " ($" + pm + "/min)"
            + "($" + phr + "/hr)";
}
function draw_worker_area(state) {
    document.getElementById("unskilled-text").innerHTML =
        "Unskilled Workers: " + state.res.unsk_w + " ($"
            + state.prices.unsk_w + "/hr)";
}
function draw(state) {
    draw_resource_bar(state);
    draw_worker_area(state);
}
function tick(state) {
    state.ticks += 1;
    if (state.ticks - state.timers.base.prev >
        state.timers.base.limit) {
        state.res.money += state.timers.base.amnt;
        state.timers.base.prev = state.ticks;
    }
    if (state.ticks - state.timers.wages.prev >
        state.timers.wages.limit) {
        state.res.money -= state.timers.wages.amnt;
        state.timers.wages.prev = state.ticks;
    }
    draw(state);
}
// frame update
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
        unsk_w: 0
    },
    prices: {
        unsk_w: 8
    }
};
update(gstate);
function unskilled_hire() {
    gstate.timers.wages.amnt += 8;
    gstate.res.unsk_w += 1;
    draw(gstate);
}
function unskilled_fire() {
    gstate.timers.wages.amnt -= 8;
    gstate.res.unsk_w -= 1;
    draw(gstate);
}
