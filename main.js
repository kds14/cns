var tick_time = 1000;
var gstate = {
    time_prev: 0,
    time: (new Date()).getTime(),
    ticks: 0,
    timers: {
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
        marketer: 0,
        labor: 1,
        efficiency: 10.0,
        pack_rec: 0,
        pack_stored: 0,
        pack_shipped: 0,
        pack_shipped_full: 0,
        marketer_base_bonus: 0,
        orders: 0,
        base_rec: 10,
        mark_eff: 0,
        base_ord: 1,
        base_sell: 10
    },
    prices: {
        unsk_w: 9,
        manag: 15,
        basic1: 100,
        marketer: 20,
        marketing1: 200
    },
    upgrades: {
        basic1: false,
        marketing1: false
    }
};
update(gstate);
/* Draw functions */
function draw_resource_bar(state) {
    document.getElementById("money-stat").innerHTML =
        "Money: $" + Math.floor(state.res.money);
    document.getElementById("worker-stat").innerHTML =
        "Labor: " + state.res.labor;
    document.getElementById("worker-eff").innerHTML =
        "Efficiency: " + (state.res.efficiency * 100).toFixed(2) + "%";
    document.getElementById("orders-stat").innerHTML =
        "Pending Orders: " + Math.floor(state.res.orders);
    document.getElementById("pack-rec").innerHTML =
        "Received Packages: " + Math.floor(state.res.pack_rec);
    document.getElementById("pack-stored").innerHTML =
        "Stored Packages: " + Math.floor(state.res.pack_stored);
    document.getElementById("pack-shipped").innerHTML =
        "Shipped Packages: " + Math.floor(state.res.pack_shipped_full);
    if (state.upgrades.marketing1)
        document.getElementById("marketing").innerHTML =
            "Marketing Effeciency: " + (state.res.mark_eff * 100)
                .toFixed(2) + "%";
}
function draw_worker_area(state) {
    document.getElementById("unskilled-text").innerHTML =
        "Unskilled Workers: " + state.res.unsk_w + " [$"
            + state.prices.unsk_w + "/hr]";
    document.getElementById("manager-text").innerHTML =
        "Managers: " + state.res.manag + " [$"
            + state.prices.manag + "/hr]";
    if (state.upgrades.marketing1) {
        document.getElementById("marketer-text").innerHTML =
            "Marketer: " + state.res.marketer + " [$"
                + state.prices.marketer + "/hr]";
    }
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
    calculate_mark_eff(state);
    draw(state);
    unhide(state);
}
function tick(state) {
    state.ticks += 1;
    state.res.money -= (state.timers.wages.amnt * 1.0) / 60;
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
function handle_packages(state) {
    ship_packages(state);
    calculate_orders(state);
    store_packages(state);
    receive_packages(state);
}
function receive_packages(state) {
    var amnt = state.res.base_rec * 1.0 * state.res.mark_eff + state.res.base_rec * Math.random();
    state.res.pack_rec += amnt;
}
function store_packages(state) {
    var eff = state.res.labor * state.res.efficiency * 1.0;
    if (eff <= state.res.pack_rec) {
        state.res.pack_rec -= eff;
        state.res.pack_stored += eff;
    }
}
function ship_packages(state) {
    if (state.res.pack_stored < 1)
        return;
    var eff = state.res.labor * 1.0 * state.res.efficiency;
    if (eff <= state.res.orders && eff <= state.res.pack_stored) {
        state.res.orders -= eff;
        state.res.pack_stored -= eff;
        state.res.pack_shipped += eff;
        if (state.res.pack_shipped >= 1) {
            var f = Math.floor(state.res.pack_shipped);
            state.res.pack_shipped -= f;
            state.res.pack_shipped_full += f;
            var gain = state.res.mark_eff * state.res.base_sell + state.res.base_sell + 10.0 * Math.random();
            state.res.money += f * gain;
        }
    }
}
function calculate_orders(state) {
    var eff = state.res.base_ord * state.res.mark_eff * 1.0 + state.res.base_ord * Math.random();
    state.res.orders += eff;
}
function calculate_effeciency(state) {
    var base_eff = 10;
    var bonuses = 0;
    var mw_ratio = state.res.manag / state.res.unsk_w;
    if (isNaN(mw_ratio) || !isFinite(mw_ratio)) {
        mw_ratio = 0;
    }
    if (mw_ratio > 0.3)
        mw_ratio = 0.3;
    state.res.efficiency = (base_eff + (100 + bonuses) * mw_ratio) * 1.0 / 100;
}
function calculate_mark_eff(state) {
    var base_eff = 10;
    var bonuses = 0;
    var marketer_bonus = 0;
    for (var i = 0; i < state.res.marketer; ++i) {
        var val = state.res.marketer_base_bonus - i;
        if (val <= 1)
            val = 1;
        marketer_bonus += val;
    }
    if (isNaN(marketer_bonus) || !isFinite(marketer_bonus)) {
        marketer_bonus = 0;
    }
    state.res.mark_eff = (base_eff + marketer_bonus) * 1.0 / 100;
}
/* onclick functions */
function unskilled_hire() {
    gstate.timers.wages.amnt += gstate.prices.unsk_w;
    gstate.res.unsk_w += 1;
    gstate.res.labor += 1;
    state_update(gstate);
}
function unskilled_fire() {
    if (gstate.res.unsk_w > 0) {
        gstate.timers.wages.amnt -= gstate.prices.unsk_w;
        gstate.res.unsk_w -= 1;
        gstate.res.labor -= 1;
        state_update(gstate);
    }
}
function basic_research_1() {
    if (gstate.res.money >= gstate.prices.basic1) {
        document.getElementById("basic-res-1").style.display = "none";
        gstate.upgrades.basic1 = true;
        document.getElementById("manager-tab").style.display = "inline";
        document.getElementById("marketing1").style.display = "inline";
        gstate.res.money -= gstate.prices.basic1;
        state_update(gstate);
    }
}
function marketing_1() {
    if (gstate.res.money >= gstate.prices.marketing1) {
        document.getElementById("marketing").style.display = "inline";
        document.getElementById("marketing1").style.display = "none";
        gstate.upgrades.marketing1 = true;
        document.getElementById("marketer-tab").style.display = "inline";
        gstate.res.marketer_base_bonus = 10;
        gstate.res.money -= gstate.prices.marketing1;
        gstate.res.base_ord += 2;
        state_update(gstate);
    }
}
function manager_hire() {
    gstate.timers.wages.amnt += gstate.prices.manag;
    gstate.res.manag += 1;
    state_update(gstate);
}
function manager_fire() {
    if (gstate.res.manag > 0) {
        gstate.timers.wages.amnt -= gstate.prices.manag;
        gstate.res.manag -= 1;
        state_update(gstate);
    }
}
function marketer_hire() {
    gstate.timers.wages.amnt += gstate.prices.marketer;
    gstate.res.marketer += 1;
    state_update(gstate);
}
function marketer_fire() {
    if (gstate.res.marketer > 0) {
        gstate.timers.wages.amnt -= gstate.prices.marketer;
        gstate.res.marketer -= 1;
        state_update(gstate);
    }
}
