var tick_time = 1000;
function hello(person) {
    return "HELLO " + person;
}
var user = "KYLE";
document.title = hello(user);
function tick(state) {
    state.val += 1;
    console.log(state);
}
var gstate = { prev_time: 0, time: (new Date()).getTime(), val: 0 };
function update() {
    gstate.time = (new Date()).getTime();
    if (gstate.time - gstate.prev_time > tick_time) {
        tick(gstate);
        gstate.prev_time = gstate.time;
    }
    requestAnimationFrame(update);
}
update();
