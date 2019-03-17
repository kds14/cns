var tick_time = 1000;
function draw_resource_bar(state) {
    var money_rate = state.timers.base.amnt /
        state.timers.base.limit;
    state.ui.res_bar.innerHTML =
        "Money: $" + state.res.money + " ($" + money_rate + "/s)";
}
function tick(state) {
    state.ticks += 1;
    if (state.ticks - state.timers.base.prev >
        state.timers.base.limit) {
        state.res.money += state.timers.base.amnt;
    }
    draw_resource_bar(state);
}
var gstate = {
    time_prev: 0,
    time: (new Date()).getTime(),
    ticks: 0,
    ui: {
        res_bar: document.getElementById("resource-bar")
    },
    timers: {
        base: {
            limit: 1,
            prev: 0,
            amnt: 1
        }
    },
    res: {
        money: 0
    }
};
function update() {
    gstate.time = (new Date()).getTime();
    if (gstate.time - gstate.time_prev > tick_time) {
        tick(gstate);
        gstate.time_prev = gstate.time;
    }
    requestAnimationFrame(update);
}
update();
