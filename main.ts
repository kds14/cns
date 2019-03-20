interface Resources {
	money: number;
	unsk_w: number;
	manag: number;
	labor: number;
	efficiency: number;
	pack_rec: number;
	pack_stored: number;
	pack_shipped: number;
	pack_shipped_full: number;
	orders: number;
	base_rec: number;
	base_ord: number;
	mark_eff: number;
	base_sell: number;
}

interface Prices {
	unsk_w: number;
	manag: number;
	basic1: number;
}

interface Timer {
	limit: number;
	prev: number;
	amnt: number;
}

interface Timers {
	wages: Timer;
	pack: Timer;
}

interface Upgrades {
	basic1: Boolean,
	marketing1: Boolean,
}

interface GameState {
	time_prev: number;
	time: number;
	ticks: number;
	timers: Timers;
	res: Resources;
	prices: Prices;
	upgrades: Upgrades
}

const tick_time = 1000;

let gstate = {
	time_prev: 0,
	time:(new Date()).getTime(),
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
		labor: 1,
		efficiency: 10.0,
		pack_rec: 0,
		pack_stored: 0,
		pack_shipped: 0,
		pack_shipped_full: 0,
		orders: 0,
		base_rec: 10,
		mark_eff: 0,
		base_ord: 1,
		base_sell: 10
	},
	prices: {
		unsk_w: 9,
		manag: 15,
		basic1: 10
	},
	upgrades: {
		basic1: false,
		marketing1: false
	}
}
update(gstate);



/* Draw functions */

function draw_resource_bar(state: GameState) {
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
	document.getElementById("marketing").innerHTML =
		"Marketing Effeciency: " + (state.res.mark_eff * 100).toFixed(2) + "%";
}

function draw_worker_area(state: GameState) {
	document.getElementById("unskilled-text").innerHTML =
		"Unskilled Workers: " + state.res.unsk_w + " [$"
		+ state.prices.unsk_w + "/hr]";
	document.getElementById("manager-text").innerHTML =
		"Managers: " + state.res.manag + " ($"
		+ state.prices.manag + "/hr)";
}

function draw(state: GameState) {
	draw_resource_bar(state);
	draw_worker_area(state);
}

function unhide(state: GameState) {
	if (!state.upgrades.basic1 && state.res.money >=
		state.prices.basic1) {
		document.getElementById("basic-res-1").style.display = "inline";
	}
}

function state_update(state: GameState) {
	calculate_effeciency(state);
	draw(state);
	unhide(state);
}

function tick(state: GameState) {
	state.ticks += 1;
	state.res.money -= (state.timers.wages.amnt * 1.0) / 10;
	handle_packages(state);
	state_update(state);
}

function update(state: GameState) {
	state.time = (new Date()).getTime();
	if (state.time - state.time_prev > tick_time) {
		tick(state);
		state.time_prev = state.time;
	}
	requestAnimationFrame((()=>update(state)));
}

function handle_packages(state: GameState) {
	ship_packages(state);
	calculate_orders(state);
	store_packages(state);
	receive_packages(state);
}

function receive_packages(state: GameState) {
	const amnt = state.res.base_rec * 1.0 * state.res.mark_eff + state.res.base_rec * Math.random();
	state.res.pack_rec += amnt;
}

function store_packages(state: GameState) {
	const eff = state.res.labor * state.res.efficiency * 1.0;
	if (eff <= state.res.pack_rec) {
		state.res.pack_rec -= eff;
		state.res.pack_stored += eff;
	}
}

function ship_packages(state: GameState) {
	const eff = state.res.labor * 1.0 * state.res.efficiency;
	if (eff <= state.res.orders && eff <= state.res.pack_stored) {
		state.res.orders -= eff;
		state.res.pack_stored -= eff;
		state.res.pack_shipped += eff;
		if (state.res.pack_shipped >= 1) {
			const f = Math.floor(state.res.pack_shipped);
			state.res.pack_shipped -= f;
			state.res.pack_shipped_full += f;
			const gain = state.res.mark_eff * state.res.base_sell + state.res.base_sell + 10.0 * Math.random();
			state.res.money += f * gain;
		}
	}
}

function calculate_orders(state: GameState) {
	const eff = state.res.base_ord * state.res.mark_eff * 1.0 + state.res.base_ord * Math.random();
	state.res.orders += eff;
}

function calculate_effeciency(state: GameState): void {
	const base_eff = 10;
	let bonuses = 0;
	let mw_ratio = state.res.manag / state.res.unsk_w;
	if (isNaN(mw_ratio) || !isFinite(mw_ratio)) {
		mw_ratio = 0;
	}
	if (mw_ratio > 0.3)
		mw_ratio = 0.3;

	state.res.efficiency = (base_eff + (100 + bonuses) * mw_ratio) * 1.0 /100;
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
		gstate.res.money -= gstate.prices.basic1;
		document.getElementById("basic-res-1").style.display = "none";
		gstate.upgrades.basic1 = true;
		document.getElementById("manager-tab").style.display = "inline";
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
		gstate.timers.wages.amnt -= gstate.prices.unsk_w;
		gstate.res.manag -= 1;
		state_update(gstate);
	}
}
