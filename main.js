var tick_time = 1000;
/* Draw functions */
function draw_resource_bar(state) {
    var money_rate = (1.0 * state.timers.base.amnt) /
        state.timers.base.limit;
    var wages = (state.timers.wages.amnt);
    var pm = money_rate;
    var phr = 0 - wages;
    document.getElementById("money-stat").innerHTML =
        "Money: $" + Math.floor(state.res.money) + " ($" + pm + "/min)"
            + "($" + phr + "/hr)";
    document.getElementById("worker-stat").innerHTML =
        "Employees: " + state.res.workers;
    document.getElementById("worker-cap").innerHTML =
        "Maximum Worker Capacity: " + state.res.worker_cap;
    document.getElementById("worker-eff").innerHTML =
        "Worker Efficiency: " + state.res.worker_eff + "%";
    document.getElementById("max-pack-cap").innerHTML =
        "Maximum Package Capacity: " + state.res.pack_cap;
    document.getElementById("pack-rec").innerHTML =
        "Received Packages: " + Math.floor(state.res.pack_rec);
    document.getElementById("pack-stored").innerHTML =
        "Stored Packages: " + Math.floor(state.res.pack_stored);
    document.getElementById("pack-shipped").innerHTML =
        "Shipped Packages: " + Math.floor(state.res.pack_shipped);
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
    if (!state.upgrades.basic1 && state.res.money >=
        state.prices.basic1) {
        document.getElementById("basic-res-1").style.display = "inline";
    }
}
function state_update(state) {
    calculate_effeciency(state);
    draw(state);
    unhide(state);
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
    handle_packages(state);
    state_update(state);
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
        },
        pack: {
            limit: 10,
            prev: 0,
            amnt: 1
        }
    },
    res: {
        money: 0,
        unsk_w: 0,
        manag: 0,
        workers: 0,
        worker_cap: 10,
        worker_eff: 10.0,
        pack_cap: 100,
        pack_rec: 0,
        pack_stored: 0,
        pack_shipped: 0
    },
    prices: {
        unsk_w: 9,
        manag: 15,
        basic1: 10
    },
    upgrades: {
        basic1: false
    }
};
update(gstate);
function change_worker(add, state) {
    if (add) {
        if (state.res.workers < state.res.worker_cap) {
            gstate.res.workers += 1;
        }
        else {
            return false;
        }
    }
    else {
        if (state.res.workers > 0) {
            gstate.res.workers -= 1;
        }
        else {
            return false;
        }
    }
    return true;
}
function handle_packages(state) {
    if (state.ticks - state.timers.pack.prev >=
        state.timers.pack.limit) {
        var full = state.res.unsk_w * state.res.worker_eff * 1.0;
        var store_half = Math.random() * full / 20;
        var ship_half = Math.random() * full / 100;
        console.log(store_half);
        console.log(ship_half);
        if (state.res.pack_stored >= 1) {
            var mov_str2shp = ship_half;
            if (mov_str2shp > state.res.pack_stored) {
                mov_str2shp = state.res.pack_stored;
            }
            if (mov_str2shp >= 1) {
                state.res.money += (80 * Math.random() + 20) * state.res.pack_rec;
            }
            state.res.pack_stored -= mov_str2shp;
            state.res.pack_shipped += mov_str2shp;
        }
        if (state.res.pack_rec >= 1) {
            var mov_rec2str = store_half;
            if (mov_rec2str > state.res.pack_rec) {
                mov_rec2str = state.res.pack_rec;
            }
            state.res.pack_rec -= mov_rec2str;
            state.res.pack_stored += mov_rec2str;
        }
        if (state.res.pack_rec + state.res.pack_stored < state.res.pack_cap) {
            var val = (state.timers.pack.amnt * state.res.pack_cap + 1) / 100;
            state.res.pack_rec += (10.0 * Math.random() + 0.5) * val;
            state.timers.pack.prev = state.ticks;
        }
    }
}
function calculate_effeciency(state) {
    var base_eff = 10;
    var bonuses = 0;
    var mw_diff = state.res.workers - state.res.manag;
    if (mw_diff <= 0) {
        state.res.worker_eff = 0;
        return;
    }
    var mwr = 0;
    if (state.res.manag > 5) {
        mwr = (mw_diff * 1.0 / state.res.manag);
        if (mwr < 2) {
            mwr = -20;
        }
        else if (mwr < 4 || mwr > 30) {
            mwr = -10;
        }
        else if (mwr < 8 || mwr > 20) {
            mwr = 5;
        }
        else if (mwr < 10 || mwr > 15) {
            mwr = 10;
        }
        else if (mwr == 10) {
            mwr = 25;
        }
        else {
            mwr = 15;
        }
        if (state.res.manag > 10) {
            mwr *= 1.25;
        }
        else if (state.res.manag > 100) {
            mwr *= 1.5;
        }
    }
    else if (state.res.manag > 0) {
        mwr = 10;
    }
    state.res.worker_eff = base_eff + mwr + bonuses;
}
/* onclick functions */
function unskilled_hire() {
    if (change_worker(true, gstate)) {
        gstate.timers.wages.amnt += gstate.prices.unsk_w;
        gstate.res.unsk_w += 1;
        state_update(gstate);
    }
}
function unskilled_fire() {
    if (change_worker(false, gstate)) {
        gstate.timers.wages.amnt -= gstate.prices.unsk_w;
        gstate.res.unsk_w -= 1;
        state_update(gstate);
    }
}
function basic_research_1() {
    if (gstate.res.money >= gstate.prices.basic1) {
        gstate.res.money -= gstate.prices.basic1;
        document.getElementById("basic-res-1").style.display = "none";
        gstate.upgrades.basic1 = true;
        document.getElementById("manager-tab").style.display = "inline";
        state_update(gstate);
    }
}
function manager_hire() {
    if (change_worker(true, gstate)) {
        gstate.timers.wages.amnt += gstate.prices.manag;
        gstate.res.manag += 1;
        state_update(gstate);
    }
}
function manager_fire() {
    if (change_worker(false, gstate)) {
        gstate.timers.wages.amnt -= gstate.prices.unsk_w;
        gstate.res.manag -= 1;
        state_update(gstate);
    }
}
