const memoryLimit = 2000;
const maxSteps = 5000;


var initialState = [3, 1, 0];
//var initialState = [1, 0, 5, 3, 2];
//var initialState = [6, 5, 1, 2, 4, 3];


function log(message) {
    if (typeof document !== "undefined")
        document.getElementById("results").value = document.getElementById("results").value + "\n" + message;
    else
        console.log(message);
}


// Nodes consist of
//   f - the order base
//   totalCost - the total cost of the path from the start to the node
//   s - the state: is initialized as a copy of the initialState array
var startState = {
    s: initialState.map(e => e),
    f: 0,
    totalCost: 0
};

var visitedList = [];


function reinit() {
    visitedList = [];
    startState = {
        s: initialState.map(e => e),
        f: 0,
        totalCost: 0
    };
}

// A heuristic counting the number of neighbor inversions
function h(state) {
    var inversions = 0;
    for (var i=1; i<state.s.length; i++) {
        if (state.s[i-1] > state.s[i]) {
            inversions++;
        }
    }
    return inversions;
}

function goal(state) {
    var inversions = 0;
    for (var i=1; i<state.s.length; i++) {
        if (state.s[i-1] > state.s[i]) {
            inversions++;
        }
    }
    return inversions === 0;
}

// store the action cost too
function stateTransition(node) {
    var newNodes = [];
    for (var i=0; i<node.s.length-1; i++) {
        for (var j=i+1; j<node.s.length; j++) {
            var newNode = {
                s: [],
                cost: 0
            };
            for (var k=0; k<node.s.length; k++) {
                newNode.s[k] = node.s[k];
            }
            newNode.s[i] = node.s[j];
            newNode.s[j] = node.s[i];
            // the cost will be the square of the distance between the array elements
            newNode.cost = Math.pow(Math.abs(j-i), 2);
            newNodes.push(newNode);
        }
    }
    return newNodes;
}

function equalStates(node1, node2) {
    for (var i=0; i<node1.s.length; i++) {
        if (node1.s[i] !== node2.s[i]) {
            return false;
        }
    }
    return true;
}

function isMember(list, node) {
    for (var i=0; i<list.length; i++) {
        if (equalStates(list[i], node)) {
            return true;
        }
    }
    return false;
}

// it returns true only if the element is in the structure and it has lower-or-equal value
function isMemberWithLEValue(list, node) {
    for (var i=0; i<list.length; i++) {
        if (equalStates(list[i], node)) {
            if (list[i].f <= node.f) {
                return true;
            }
            return false;
        }
    }
    return false;
}

// sort the structure based on the f field
function sortStruct(list) {
    return list.sort(function(a,b) {
        if (a.f < b.f) {
            return -1;
        }
        if (a.f > b.f) {
            return 1;
        }
        return 0;
    });
}

// reorganized BFS to see the total path cost
function bfs(start, goalFunction) {
    reinit(); // init values

    var queue = []; // define an empty array
    queue.push(start); // insert an element at the end of the array
    var steps = 0; // step counter
    var finalState = null; // for storing the finalState if found

    while (queue.length > 0) { // while the queue is not empty, execute the iteration
        steps++; // increase the step counter
        if (steps > maxSteps) { // prevent infinite computation
            log("maxSteps reached without result, exiting");
            break;
        }
        var act = queue.shift(); // get the FIRST value of the queue and do some log
        visitedList.push(act);

        log(steps + ".step");
        log("Processing act: " + act.s + " (" + act.f + "), number of nodes in the queue: " + queue.length);
        if (goalFunction(act)) {
            finalState = act;
            break;
        }
        var newNodes = stateTransition(act); // if the act is not a goal, get its neighbors


        for (var i=0; i<newNodes.length; i++) {
            newNodes[i].f = act.f + newNodes[i].cost;
            if (!isMember(queue, newNodes[i]) &&
                !isMember(visitedList, newNodes[i])) {  // if they are not in the queue/visitedList already
                queue.push(newNodes[i]); // add them to the queue
            }
        }
        if (queue.length > memoryLimit) { // control the size of the queue
            log("Queue too long");
            break;
        }
    }
    if (finalState) { // if we found the solution
        log("Final state found: " + finalState.s + " (" + act.f + ") in " + steps + " steps (cost" + act.f + ")");
    } else {
        log("Could not find the solution");
    }
}

// reorganized DFS to see the total path cost
function dfs(start, goalFunction) {
    reinit();

    var stack = [];
    stack.push(start);
    var steps = 0;
    var finalState = null;

    while (stack.length > 0) {
        steps++;
        if (steps > maxSteps) {
            log("MaxStep reached");
            break;
        }
        var act = stack.pop(); // get the LAST element from the stack
        visitedList.push(act);
        log("Processing act: " + act.s + " (" + act.f + "), number of nodes in the stack: " + stack.length);
        if (goalFunction(act)) {
            finalState = act;
            break;
        }
        var newNodes = stateTransition(act);
        for (var i=0; i<newNodes.length; i++) {
            newNodes[i].f = act.f + newNodes[i].cost;
            if (!isMember(stack, newNodes[i]) && !isMember(visitedList, newNodes[i])) {
                stack.push(newNodes[i]);
            }
        }
        if (stack.length > memoryLimit) {
            log("Queue too long");
            break;
        }
    }
    if (finalState) {
        log("Final state found: " + finalState.s + " (" + act.f + ") in " + steps + " steps");
    } else {
        log("Could not find the solution");
    }
}

function ucs(start, goalFunction) {
    reinit(); // init values

    var prQueue = []; // define an empty array
    prQueue.push(start); // start node is inserted in the prQueue
    var steps = 0; // step counter
    var finalState = null; // for storing the finalState if found

    while (prQueue.length > 0) { // while the prQueue is not empty, execute the iteration
        steps++; // increase the step counter
        if (steps > maxSteps) { // prevent infinite computation
            log("maxSteps reached without result, exiting");
            break;
        }

        var act = prQueue.shift(); // get the FIRST value of the prQueue and do some log
        visitedList.push(act);
        log("Processing act: " + act.s + " (" + act.f + "), number of nodes in the priority queue: " + prQueue.length);
        if (goalFunction(act)) {
            finalState = act;
            break;
        }
        var newNodes = stateTransition(act); // if the act is not a goal, get its neighbors
        for (var i=0; i<newNodes.length; i++) {
            newNodes[i].f = act.f + newNodes[i].cost; // f = g
            // check if they are present in the structures BUT also check of the value is lower (or equal) - otherwise push
            if (!isMemberWithLEValue(prQueue, newNodes[i]) &&
                !isMemberWithLEValue(visitedList, newNodes[i])) {  // if they are not in the prQueue/visitedList already
                prQueue.push(newNodes[i]); // add them to the prQueue
            }
        }

        prQueue = sortStruct(prQueue);

        if (prQueue.length > memoryLimit) { // control the size of the prQueue
            log("prQueue too long");
            break;
        }
    }
    if (finalState) { // if we found the solution
        log("Final state found: " + finalState.s + " (" + act.f + ") in " + steps + " steps");
    } else {
        log("Could not find the solution");
    }
}

function greedy(start, goalFunction) {
    reinit(); // init values

    var prQueue = []; // define an empty array
    prQueue.push(start); // start is inserted in the prQueue
    var steps = 0; // we count the steps, here we init the counter
    var finalState = null; // for storing the finalState if found
    let visited = [];

    while (prQueue.length > 0) {
        steps++;
        if (steps > maxSteps) {
            log("MaxStep reached");
            break;
        }
        var act = prQueue.shift(); // get the FIRST element from the stack
        visited.push(act);
        log("Processing act: " + act.s + " (" + act.f + "), number of nodes in the stack: " + prQueue.length);
        if (goalFunction(act)) {
            finalState = act;
            break;
        }
        var newNodes = stateTransition(act);
        for (var i=0; i<newNodes.length; i++) {
            newNodes[i].f = h(newNodes[i]);
            newNodes[i].totalCost = act.totalCost + newNodes[i].cost;

            if(!isMemberWithLEValue(prQueue, newNodes[i]) && !isMemberWithLEValue(visited, newNodes[i])){
                prQueue.push(newNodes[i]);
            }
        }
        prQueue = sortStruct(prQueue);

        if (prQueue.length > memoryLimit) {
            log("Queue too long");
            break;
        }
    }
    if (finalState) { // if we found the solution
        log("Final state found: " + finalState.s + " (" + act.totalCost + ") in " + steps + " steps");
    } else {
        log("Could not find the solution");
    }
}

function astar(start, goalFunction) {
    reinit(); // init values

    start.f = h(start); // needs to precompute the heuristics for the start
    var prQueue = []; // define an empty array
    prQueue.push(start); // start is inserted in the prQueue
    var steps = 0; // we count the steps, here we init the counter
    var finalState = null; // for storing the finalState if found
    let visited = [];

    while (prQueue.length > 0) {
        steps++;
        if (steps > maxSteps) {
            log("MaxStep reached");
            break;
        }
        var act = prQueue.shift(); // get the FIRST element from the stack
        visited.push(act);
        log("Processing act: " + act.s + " (" + act.f + "), number of nodes in the stack: " + prQueue.length);
        if (goalFunction(act)) {
            finalState = act;
            break;
        }
        var newNodes = stateTransition(act);
        for (var i=0; i<newNodes.length; i++) {
            newNodes[i].totalCost = act.totalCost + newNodes[i].cost;
            newNodes[i].f = h(newNodes[i]) + newNodes[i].totalCost;

            if(!isMemberWithLEValue(prQueue, newNodes[i]) && !isMemberWithLEValue(visited, newNodes[i])){
                prQueue.push(newNodes[i]);
            }
        }
        prQueue = sortStruct(prQueue);

        if (prQueue.length > memoryLimit) {
            log("Queue too long");
            break;
        }
    }

    if (finalState) { // if we found the solution
        log("Final state found: " + finalState.s + " (" + act.totalCost + ") in " + steps + " steps");
    } else {
        log("Could not find the solution");
    }
}