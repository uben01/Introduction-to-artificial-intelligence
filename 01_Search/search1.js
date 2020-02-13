class State{
	constructor(value, depth) {
		this.value = value;
		this.depth = depth;
		this.length = this.value.length;

		for(let i = 0; i < this.length; i++){
			this[i] = value[i];
		}
	}

	static newStates(arrValues, depth){
		let arr = [];
		arrValues.forEach(function(value){
			arr.push(new State(value, depth+1));
		});
		return arr;
	}
}

const memoryLimit = 2000;
const maxSteps = 5000;

//const initialState = [3, 1, 0];
//const initialState = [1, 0, 3, 2];
const initialState = [1, 4, 0, 3, 2];
//const initialState = [1, 1, 0, 3, 2];


function log(message) {
	if (typeof document !== "undefined")
		document.getElementById("results").value = document.getElementById("results").value + "\n" + message;
	else 
		console.log(message);
}

function goal(state) {
	var inversions = 0;
	for (var i=1; i<state.length; i++) {
		if (!(state[i-1] < state[i])) {
			inversions++;
		}
	}
	return inversions === 0;
}

function stateTransition(state) {
	var newStates = [];
	for (var i=0; i<state.length-1; i++) {
		for (var j=i+1; j<state.length; j++) {
			var newState = [];
			for (var k=0; k<state.length; k++) {
				newState[k] = state[k];
			}
			newState[i] = state[j];
			newState[j] = state[i];
			newStates.push(newState);
		}
	}
	return newStates;
}

function equalStates(state1, state2) {
	for (var i=0; i<state1.length; i++) {
		if (state1[i] !== state2[i]) {
			return false;
		}
	}
	return true;
}

function isMember(state, list) {
	for (var i=0; i<list.length; i++) {
		if (equalStates(list[i], state)) {
			return true;
		}
	}
	return false;
}

function shuffle(list) {
	for (var i = list.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = list[i];
		list[i] = list[j];
		list[j] = temp;
	}
	return list;
}

function printState(state, openList) {
	log("Processing state: [" + state + "]; length of fringe: " + openList.length);
}

function printResult(method, finalState, steps) {
	if (finalState) {
		log(method + ": Final state [" + finalState + "] found in " + steps + " steps.");
	} else {
		log(method + ": Could not find a solution.");
	}
}


function bfs(start, goalFunction) {
	let queue = []; // define an empty array
	queue.push(start); // insert an element at the end of the array
	let steps = 0; // step counter
	let finalState = null; // for storing the finalState if found
//	queue.length // length of the queue
//	var curState = queue.shift(); // take the FIRST element out of the array
//	goalFunction(curState) // only returns true if curState satisfies the goal function
	let visited = [];
	while(queue.length > 0){
		steps++;
		if(steps > maxSteps){
			log("Maximal steps reached!");
			break;
		}
		let curState = queue.shift();
		visited.push(curState);
		log(steps + ". step");
		log("Current state processed: [" + curState + "]");

		if(goalFunction(curState)){
			finalState = curState;
			break;
		}

		let newStates = stateTransition(curState);
		for(let i = 0; i < newStates.length; i++){
			if(!isMember(newStates[i], visited) && ! isMember(newStates[i], queue)){
				queue.push(newStates[i]);
			}
		}

		if(queue.length > memoryLimit){
			log("Queue too long");
				break;
		}
	}


	printResult("BFS", finalState, steps);

	return finalState;
}

function dfs(start, goalFunction) {
	let stack = []; // define an empty array
	stack.push(start);
	let steps = 0; // step counter
	let finalState = null; // to store the finalState if found
//	stack.length // depth of the stack
//	var curState = stack.pop(); // get the LAST element out of the array
//	printState(curState, stack);
	let visited = [];

	while(stack.length > 0){
		steps++;
		if(steps > maxSteps){
			log("Maximal steps reached!");
			break;
		}

		let curState = stack.pop();
		visited.push(curState);
		log(steps + ". step");
		log("Current state processed: [" + curState + "]");

		if(goalFunction(curState)){
			finalState = curState;
			break;
		}
		let newStates = stateTransition(curState);
		for(let i = 0; i < newStates.length; i++){
			if(!isMember(newStates[i], visited) && ! isMember(newStates[i], stack)){
				stack.push(newStates[i]);
			}
		}

		if(stack.length > memoryLimit){
			log("Queue too long");
			break;
		}

	}

	printResult("DFS", finalState, steps);

	return finalState;
}

function iter_dfs(start, goalFunction) {
	let maxDepth = 0;
	let depthDelta = 3;

	let stack = []; // define an empty array
	stack.push(new State(start, 0));
	let steps = 0; // step counter
	let finalState = null; // to store the finalState if found
//	stack.length // depth of the stack
//	var curState = stack.pop(); // get the LAST element out of the array
//	printState(curState, stack);
	let visited = [];

	log("Current maxdepth " + maxDepth);
	outer: while(stack.length > 0) {
		let offset = 0;
		let isModified = false;
		for (let i = stack.length -1; i >= 0; i--) {
			if (stack[i].depth <= maxDepth) {
				isModified = true;

				steps++;
				if (steps > maxSteps) {
					log("Maximal steps reached!");
					break outer;
				}

				let curState = stack.splice(i, 1)[0];

				visited.push(curState.value);
				log(steps + ". step");
				log("Current state processed: [" + curState.value + "] - depth: " + curState.depth);

				if (goalFunction(curState.value)) {
					finalState = curState.value;
					break outer;
				}
				let newStates = State.newStates(stateTransition(curState.value), curState.depth);
				for (let j = 0; j < newStates.length; j++) {
					if (!isMember(newStates[j].value, visited) && !isMember(newStates[j].value, stack)) {
						stack.splice(stack.length-offset, 0, newStates[j]);
						offset++;
					}
				}

				if (stack.length > memoryLimit) {
					log("Queue too long");
					break outer;
				}
			continue outer;
 			}
		}
		if (!isModified) {
			maxDepth += depthDelta;
			log("Current maxdepth " + maxDepth);
		}
	}

	printResult("DFS", finalState, steps);

	return finalState;
}