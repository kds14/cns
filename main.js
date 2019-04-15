var tick_time = 1000;
var gstate = {
    stats: {
        money_avg: 0,
        money_past: []
    },
    time_prev: 0,
    time: (new Date()).getTime(),
    ticks: 0,
    timers: {
        pack: {
            limit: 10,
            prev: 0,
            amnt: 1
        }
    },
    res: {
        money: 100000,
        rp: 0,
        rp_goal: 0,
        unsk_w: 0,
        manag: 0,
        marketer: 0,
        researcher: 0,
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
        base_sell: 10,
        eff_bonus: 0,
        base_mark_eff: 10,
        worker_max: 10,
        pack_max: 200,
        belt: 0,
        robocallers: 0
    },
    prices: {
        unsk_w: 9,
        manag: 15,
        researcher: 30,
        sci_manag: 500,
        basic1: 100,
        marketer: 20,
        marketing1: 200,
        marketing2: 8000,
        op_res: 2000,
        auto1: 500,
        auto1_rp: 100,
        belt: 5000,
        worker_cap: 200,
        storage_cap: 200,
        comp_sys_rp: 500,
        comp_sys: 10000,
        bus_anal: 1000,
        auto_ad_rp: 1000,
        auto_ad: 20000,
        robocallers: 10000
    },
    upgrades: {
        basic1: false,
        marketing1: false,
        marketing2: false,
        op_res: false,
        sci_manag: false,
        auto1: false,
        comp_sys: false,
        bus_anal: false,
        auto_ad: false
    },
    func: {
        res_finish: null
    }
};
init_upgrade_draw(gstate);
update(gstate);
/* Draw functions */
function draw_resource_bar(state) {
    var money_rate = "";
    if (state.upgrades.bus_anal)
        money_rate = " ($" + (state.stats.money_avg).toFixed(2) + "/fr)";
    document.getElementById("money-stat").innerHTML =
        "Money: $" + Math.floor(state.res.money) + money_rate;
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
    if (state.upgrades.marketing1) {
        document.getElementById("marketing").innerHTML =
            "Marketing Effeciency: " + (state.res.mark_eff * 100)
                .toFixed(2) + "%";
        document.getElementById("marketing").title = "Affects packages and orders received";
    }
    if (state.upgrades.auto1) {
        document.getElementById("belt-text").innerHTML =
            "Conveyer Belt System: Level " + state.res.belt + " [$" + state.prices.belt + "]";
    }
    if (state.upgrades.auto_ad) {
        document.getElementById("robocaller").style.display = "inline";
        document.getElementById("robocaller-text").innerHTML =
            "Robocaller System: Level " + state.res.robocallers + " [$" + state.prices.robocallers + "]";
    }
    document.getElementById("storage-cap-text").innerHTML =
        "Package Capacity: " + state.res.pack_max + " [$" + state.prices.storage_cap + "]";
    document.getElementById("worker-cap-text").innerHTML =
        "Worker Capacity: " + state.res.worker_max + " [$" + state.prices.worker_cap + "]";
}
function draw_worker_area(state) {
    document.getElementById("unskilled-text").innerHTML =
        "Unskilled Workers: " + state.res.unsk_w;
    document.getElementById("manager-text").innerHTML =
        "Managers: " + state.res.manag;
    if (state.upgrades.marketing1) {
        document.getElementById("marketer-text").innerHTML =
            "Marketers: " + state.res.marketer;
    }
    if (state.upgrades.op_res) {
        document.getElementById("researcher-text").innerHTML =
            "Researchers: " + state.res.researcher;
    }
}
function init_upgrade_draw(state) {
    document.getElementById("basic-res-1-text").innerHTML =
        "Basic Business Textbook [$" + state.prices.basic1 + "]";
    document.getElementById("mark-1-text").innerHTML =
        "Marketing I [$" + state.prices.marketing1 + "]";
    document.getElementById("mark-2-text").innerHTML =
        "Marketing II [$" + state.prices.marketing2 + "]";
    document.getElementById("sci-manag-text").innerHTML =
        "Scientific Management [$" + state.prices.sci_manag + "]";
    document.getElementById("op-res-text").innerHTML =
        "Operations Research [$" + state.prices.op_res + "]";
    document.getElementById("automation1-text").innerHTML =
        "Automation Research I [$" + state.prices.auto1 + "]";
    document.getElementById("comp-sys-text").innerHTML =
        "Computer Systems Research [$" + state.prices.comp_sys + "]";
    document.getElementById("bus-anal-text").innerHTML =
        "Business Analytics [$" + state.prices.bus_anal + "]";
    document.getElementById("auto-ad-text").innerHTML =
        "Automated Advertisement [$" + state.prices.auto_ad + "]";
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
/* Game logic */
function state_update(state) {
    calculate_effeciency(state);
    calculate_mark_eff(state);
    draw(state);
    unhide(state);
}
function calc_money_avg(state, before) {
    var delta = state.res.money - before;
    state.stats.money_past.push(delta);
    var len = state.stats.money_past.length;
    while (len > 60) {
        state.stats.money_past.shift();
        len--;
    }
    var sum = 0;
    for (var i = 0; i < len; ++i) {
        sum += state.stats.money_past[i];
    }
    state.stats.money_avg = (sum * 1.0 / len);
}
function tick(state) {
    state.ticks += 1;
    var before = state.res.money;
    handle_packages(state);
    calc_money_avg(state, before);
    //console.log((state.stats));
    calculate_research(state);
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
    var amnt = state.res.base_rec * 1.0 * state.res.mark_eff + state.res.base_rec + state.res.base_rec * Math.random() / 2.0;
    var diff = add_package(state, amnt);
    state.res.pack_rec += diff;
}
function store_packages(state) {
    var eff = state.res.labor * state.res.efficiency * 1.0 * (1 + 1.25 * state.res.belt);
    if (eff < state.res.pack_rec) {
        state.res.pack_rec -= eff;
        state.res.pack_stored += eff;
    }
    else {
        state.res.pack_stored += state.res.pack_rec;
        state.res.pack_rec = 0;
    }
}
function ship_packages(state) {
    if (state.res.pack_stored < 1)
        return;
    var eff = state.res.labor * 0.25 * (1 + state.res.belt) * state.res.efficiency;
    var min = Math.min(state.res.orders, state.res.pack_stored);
    if (eff > min)
        eff = min;
    if (eff > 0) {
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
    var eff = state.res.base_ord * state.res.mark_eff * 1.0 + state.res.base_ord + state.res.base_ord * Math.random() / 2.0;
    state.res.orders += eff;
    if (state.res.orders > state.res.pack_max)
        state.res.orders = state.res.pack_max;
}
function calculate_effeciency(state) {
    var base_eff = 10;
    var bonuses = state.res.eff_bonus;
    var static_bonus = 0.5 * state.res.belt;
    var mw_ratio = state.res.manag / state.res.unsk_w;
    if (isNaN(mw_ratio) || !isFinite(mw_ratio)) {
        mw_ratio = 0;
    }
    if (mw_ratio > 0.3)
        mw_ratio = 0.3;
    if (state.upgrades.auto1)
        static_bonus += 5;
    state.res.efficiency = (base_eff + static_bonus + (100 + bonuses) * mw_ratio) * 1.0 / 100;
}
function calculate_mark_eff(state) {
    var base_eff = state.res.base_mark_eff;
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
    state.res.mark_eff = (state.res.robocallers * 10.0 + (base_eff + marketer_bonus) * 2.0) / 100.0;
}
function buy_worker(state) {
    var w = state.res.unsk_w + state.res.manag + state.res.marketer
        + state.res.researcher + 1;
    return w <= state.res.worker_max;
}
function add_package(state, add) {
    var p = state.res.pack_rec + state.res.pack_stored + add;
    var diff = state.res.pack_max - p + 1;
    var res = add;
    if (diff < 0)
        res += diff;
    if (res < 0)
        res = 0;
    return res;
}
function start_research(state, rp, name, func) {
    if (state.func.res_finish != null)
        return false;
    document.getElementById("current-res").style.display = "flex";
    state.res.rp = 0;
    state.res.rp_goal = rp;
    state.func.res_finish = func;
    var text = document.getElementById("bar-text");
    text.innerHTML = name;
    return true;
}
function cancel_research(state) {
    if (state.func.res_finish == null)
        return;
    document.getElementById("res-bar").style.width = "0%";
    document.getElementById("current-res").style.display = "none";
    state.res.rp = 0;
    state.res.rp_goal = 0;
    state.func.res_finish = null;
}
function calc_res_mod(state) {
    var dec_mod = 0.75;
    var next_mod = 1;
    var result = 0;
    for (var i = 0; i < state.res.researcher; ++i) {
        result += next_mod;
        next_mod *= dec_mod;
        if (next_mod < 0.1)
            next_mod = 0.1;
    }
    return result;
}
function calculate_research(state) {
    if (state.func.res_finish == null)
        return;
    state.res.rp += calc_res_mod(state);
    if (state.res.rp >= state.res.rp_goal) {
        state.func.res_finish(state);
        cancel_research(state);
    }
    else {
        var bar = document.getElementById("res-bar");
        var val = 0;
        if (state.res.rp_goal != 0)
            val = Math.floor(state.res.rp * 100 / state.res.rp_goal);
        bar.style.width = val + "%";
    }
}
/* onclick functions */
/* research */
function basic_research_1() {
    if (gstate.res.money >= gstate.prices.basic1) {
        document.getElementById("basic-res-1").style.display = "none";
        gstate.upgrades.basic1 = true;
        document.getElementById("manager-tab").style.display = "inline";
        document.getElementById("scientific-manag").style.display = "inline";
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
        document.getElementById("marketing2").style.display = "inline";
        gstate.res.marketer_base_bonus = 10;
        gstate.res.money -= gstate.prices.marketing1;
        gstate.res.base_ord += 5;
        state_update(gstate);
    }
}
function marketing_2() {
    if (gstate.res.money >= gstate.prices.marketing2) {
        document.getElementById("marketing2").style.display = "none";
        gstate.upgrades.marketing2 = true;
        gstate.res.base_mark_eff += 20;
        gstate.res.money -= gstate.prices.marketing2;
        gstate.res.base_ord += 20;
        state_update(gstate);
    }
}
function automation1_res_finish(state) {
    document.getElementById("belt").style.display = "inline";
    state.res.belt = 1;
    state.upgrades.auto1 = true;
    state.res.eff_bonus += 10;
    document.getElementById("computer-systems").style.display = "inline";
    state_update(state);
}
function automation1_res() {
    if (gstate.res.money >= gstate.prices.auto1 &&
        start_research(gstate, gstate.prices.auto1_rp, "Automation Research I", automation1_res_finish)) {
        document.getElementById("automation1").style.display = "none";
        gstate.res.money -= gstate.prices.auto1;
    }
}
function comp_sys_res_finish(state) {
    state.upgrades.comp_sys = true;
    document.getElementById("auto-ad").style.display = "inline";
    state_update(state);
}
function comp_sys_res() {
    if (gstate.res.money >= gstate.prices.comp_sys &&
        start_research(gstate, gstate.prices.comp_sys_rp, "Computer Systems", comp_sys_res_finish)) {
        gstate.res.money -= gstate.prices.comp_sys;
        document.getElementById("computer-systems").style.display = "none";
    }
}
function auto_ad_res_finish(state) {
    state.upgrades.auto_ad = true;
    state_update(state);
}
function auto_ad_res() {
    if (gstate.res.money >= gstate.prices.auto_ad &&
        start_research(gstate, gstate.prices.comp_sys_rp, "Automated Advertisement", auto_ad_res_finish)) {
        gstate.res.money -= gstate.prices.auto_ad;
        document.getElementById("auto-ad").style.display = "none";
    }
}
function bus_anal_buy() {
    if (gstate.res.money >= gstate.prices.bus_anal) {
        gstate.res.money -= gstate.prices.bus_anal;
        document.getElementById("bus-anal").style.display = "none";
        gstate.upgrades.bus_anal = true;
        state_update(gstate);
    }
}
function sci_manag_buy() {
    if (gstate.res.money >= gstate.prices.sci_manag) {
        document.getElementById("scientific-manag").style.display = "none";
        document.getElementById("op-res").style.display = "inline";
        document.getElementById("bus-anal").style.display = "inline";
        gstate.upgrades.sci_manag = true;
        gstate.res.eff_bonus += 10;
        gstate.res.marketer_base_bonus += 5;
        state_update(gstate);
    }
}
/* Workers */
function unskilled_hire() {
    if (buy_worker(gstate)) {
        gstate.res.unsk_w += 1;
        gstate.res.labor += 1;
        state_update(gstate);
    }
}
function unskilled_fire() {
    if (gstate.res.unsk_w > 0) {
        gstate.res.unsk_w -= 1;
        gstate.res.labor -= 1;
        state_update(gstate);
    }
}
function manager_hire() {
    if (buy_worker(gstate)) {
        gstate.res.manag += 1;
        state_update(gstate);
    }
}
function manager_fire() {
    if (gstate.res.manag > 0) {
        gstate.res.manag -= 1;
        state_update(gstate);
    }
}
function marketer_hire() {
    if (buy_worker(gstate)) {
        gstate.res.marketer += 1;
        state_update(gstate);
    }
}
function marketer_fire() {
    if (gstate.res.marketer > 0) {
        gstate.res.marketer -= 1;
        state_update(gstate);
    }
}
function res_hire() {
    if (buy_worker(gstate)) {
        gstate.res.researcher += 1;
        state_update(gstate);
    }
}
function res_fire() {
    if (gstate.res.researcher > 0) {
        gstate.res.researcher -= 1;
        state_update(gstate);
    }
}
function op_res_buy() {
    if (gstate.res.money >= gstate.prices.op_res) {
        gstate.res.money -= gstate.prices.op_res;
        document.getElementById("automation1").style.display = "inline";
        document.getElementById("researcher-tab").style.display = "inline";
        document.getElementById("op-res").style.display = "none";
        gstate.upgrades.op_res = true;
        state_update(gstate);
    }
}
/* Upgrades */
function buy_belt() {
    if (gstate.res.money >= gstate.prices.belt) {
        gstate.res.money -= gstate.prices.belt;
        gstate.prices.belt = Math.round(gstate.prices.belt * 2);
        gstate.res.belt += 1;
        state_update(gstate);
    }
}
function buy_robocaller() {
    if (gstate.res.money >= gstate.prices.robocallers) {
        gstate.res.money -= gstate.prices.robocallers;
        gstate.prices.belt = Math.round(gstate.prices.robocallers * 3);
        gstate.res.robocallers += 1;
        state_update(gstate);
    }
}
function buy_storage_cap() {
    if (gstate.res.money >= gstate.prices.storage_cap) {
        gstate.res.money -= gstate.prices.storage_cap;
        gstate.prices.storage_cap = Math.round(gstate.prices.storage_cap * 1.5);
        gstate.res.pack_max = Math.round(gstate.res.pack_max * 1.75);
        state_update(gstate);
    }
}
function buy_worker_cap() {
    if (gstate.res.money >= gstate.prices.worker_cap) {
        gstate.res.money -= gstate.prices.worker_cap;
        var m = gstate.res.worker_max > 10 ? 3.0 : 2.0;
        gstate.prices.worker_cap = Math.round(gstate.prices.worker_cap * m);
        gstate.res.worker_max = Math.round(gstate.res.worker_max * 1.5);
        state_update(gstate);
    }
}
