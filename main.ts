interface Resources {
	money: number;
	researcher: number;
	unsk_w: number;
	manag: number;
	marketer: number;
	marketer_base_bonus: number;
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
	eff_bonus: number;
	rp: number;
	base_mark_eff: number;
}

interface Prices {
	unsk_w: number;
	manag: number;
	marketer: number;
	researcher: number;
	basic1: number;
	marketing1: number;
	marketing2: number;
	op_res: number;
	sci_manag: number;
	auto1: number;
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
	marketing2: Boolean,
	sci_manag: Boolean,
	op_res: Boolean,
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
		rp: 0,
		money: 0,
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
	},
	prices: {
		unsk_w: 9,
		manag: 15,
		researcher: 30,
		sci_manag: 1000,
		basic1: 100,
		marketer: 20,
		marketing1: 200,
		marketing2: 10000,
		op_res: 3000,
		auto1: 1000,
	},
	upgrades: {
		basic1: false,
		marketing1: false,
		marketing2: false,
		op_res: false,
		sci_manag: false,
	}
}

init_upgrade_draw(gstate);
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
	if (state.upgrades.marketing1) {
		document.getElementById("marketing").innerHTML =
		"Marketing Effeciency: " + (state.res.mark_eff * 100)
		.toFixed(2) + "%";
		document.getElementById("marketing").title = "Affects packages and orders received";
	}
	if (state.upgrades.op_res) {
		document.getElementById("research-points").innerHTML =
		"Research Points (RP): " + state.res.rp;
		document.getElementById("research-points").title = "Used for research";
	}
}

function draw_worker_area(state: GameState) {
	document.getElementById("unskilled-text").innerHTML =
		"Unskilled Workers: " + state.res.unsk_w + " [$"
		+ state.prices.unsk_w + "/hr]";
	document.getElementById("manager-text").innerHTML =
		"Managers: " + state.res.manag + " [$"
		+ state.prices.manag + "/hr]";
	if (state.upgrades.marketing1) {
		document.getElementById("marketer-text").innerHTML =
			"Marketers: " + state.res.marketer + " [$"
			+ state.prices.marketer + "/hr]";
	}
	if (state.upgrades.op_res) {
		document.getElementById("researcher-text").innerHTML =
			"Researchers: " + state.res.researcher + " [$"
			+ state.prices.researcher + "/hr]";
	}
}

function init_upgrade_draw(state: GameState) {
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
	"Automation Research [" + state.prices.auto1 + "RP]";
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
	calculate_mark_eff(state);
	calculate_research(state);
	draw(state);
	unhide(state);
}

function tick(state: GameState) {
	state.ticks += 1;
	state.res.money -= (state.timers.wages.amnt * 1.0) / 60;
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
	if (state.res.pack_stored < 1)
		return;
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
	let bonuses = state.res.eff_bonus;
	let mw_ratio = state.res.manag / state.res.unsk_w;
	if (isNaN(mw_ratio) || !isFinite(mw_ratio)) {
		mw_ratio = 0;
	}
	if (mw_ratio > 0.3)
		mw_ratio = 0.3;

	state.res.efficiency = (base_eff + (100 + bonuses) * mw_ratio) * 1.0 /100;
}

function calculate_mark_eff(state: GameState): void {
	const base_eff = state.res.base_mark_eff;
	let bonuses = 0;
	let marketer_bonus = 0;
	for (let i = 0; i < state.res.marketer; ++i) {
		let val = state.res.marketer_base_bonus - i;
		if (val <= 1)
			val = 1;
		marketer_bonus += val;
	}
	if (isNaN(marketer_bonus) || !isFinite(marketer_bonus)) {
		marketer_bonus = 0;
	}

	state.res.mark_eff = (base_eff + marketer_bonus) * 1.0 /100;
}

function calculate_research(state: GameState) {
	if (state.upgrades.op_res)
		state.res.rp += state.res.researcher;
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
		gstate.res.base_mark_eff += 10;
		gstate.res.money -= gstate.prices.marketing2;
		gstate.res.base_ord += 10;
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

function res_hire() {
	gstate.timers.wages.amnt += gstate.prices.researcher;
	gstate.res.researcher += 1;
	state_update(gstate);
}

function res_fire() {
	if (gstate.res.researcher > 0) {
		gstate.timers.wages.amnt -= gstate.prices.researcher;
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

function sci_manag_buy() {
	if (gstate.res.money >= gstate.prices.sci_manag) {
		document.getElementById("scientific-manag").style.display = "none";
		document.getElementById("op-res").style.display = "inline";
		gstate.upgrades.sci_manag = true;
		gstate.res.eff_bonus += 10;
		gstate.res.marketer_base_bonus += 5;
		state_update(gstate);
	}
}
