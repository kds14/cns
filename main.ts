interface GameState {
	prev_time: number;
	time: number;
	val: number;
}

const tick_time = 1000;

function hello(person: string) {
	return "HELLO " + person;
}

const user = "KYLE";

document.title = hello(user);

function tick(state: GameState) {
	state.val += 1;
	console.log(state);
}

let gstate = {prev_time: 0, time:(new Date()).getTime(), val:0}

function update() {
	gstate.time = (new Date()).getTime();
	if (gstate.time - gstate.prev_time > tick_time) {
		tick(gstate);
		gstate.prev_time = gstate.time;
	}
	requestAnimationFrame(update);
}

update();
