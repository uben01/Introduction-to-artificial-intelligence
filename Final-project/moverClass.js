var V7Z3T5 = function () {
    // HELPER CLASSES
    function HeuristicMap() {
        let finishValue = 100;
        let sizeX, sizeY, matrix = null;

        this.initialize = function(c) {
            sizeX = c.length;
            sizeY = c[0].length;
            matrix = [...Array(sizeX)].map(x => Array(sizeY)); // initialize empty arrays of arrays
            mapping(c);
        };

        let stateTransition = function (state) {
            let newStates = [];
            for (let i = state.x - 1; i <= state.x + 1; i++) {
                if (i < 0 || i >= sizeX) { // out of x bound
                    continue;
                }
                for (let j = state.y - 1; j <= state.y + 1; j++) {
                    if (j < 0 || j >= sizeY) { // out of y bound
                        continue;
                    }
                    newStates.push({x: i, y: j, cost: 0});
                }
            }
            return newStates;
        };

        let sortList = function (list) {
            return list.sort(function (a, b) {
                if (this[a.x][a.y] == undefined && this[b.x][b.y] == undefined) {
                    return 0;
                }
                if (this[a.x][a.y] == undefined) {
                    return -1;
                }
                if (this[b.x][b.y] == undefined) {
                    return 1;
                }
                if (this[a.x][a.y] < this[b.x][b.y]) {
                    return -1;
                }
                if (this[a.x][a.y] > this[b.x][b.y]) {
                    return 1;
                }
                return 0;
            }.bind(matrix));
        };

        let isMemberWithLEValue = function (list, node) {
            for (let i = 0; i < list.length; i++) {
                if (list[i].x == node.x && list[i].y == node.y) {
                    if (list[i].cost <= node.cost) {
                        return true;
                    }
                }
            }
            return false;
        };

        let isInMatrixWithLEValue = function (node) {
            if (matrix[node.x][node.y] != undefined) {
                if (matrix[node.x][node.y] < node.cost) {
                    return true;
                }
            }
            return false;
        };

        let mapping = function (c) {
            // find finish lines
            let finishLines = [];
            for (let i = 0; i < sizeX; i++) {
                for (let j = 0; j < sizeY; j++) {
                    if (c[i][j] == finishValue) {
                        finishLines.push({x: i, y: j});
                    }
                }
            }
            for (let i = 0; i < finishLines.length; i++) {
                let prQueue = [];
                prQueue.push({x: finishLines[i].x, y: finishLines[i].y, cost: 0});
                matrix[finishLines[i].x][finishLines[i].y] = 0;
                while (prQueue.length > 0) {
                    const act = prQueue.shift();
                    let newNodes = stateTransition(act);
                    for (let i = 0; i < newNodes.length; i++) {
                        if (c[newNodes[i].x][newNodes[i].y] >= 0) {
                            newNodes[i].cost = act.cost + 1;
                            if (!isMemberWithLEValue(prQueue, newNodes[i]) &&
                                !isInMatrixWithLEValue(newNodes[i])) {
                                prQueue.push(newNodes[i]);
                                matrix[newNodes[i].x][newNodes[i].y] = newNodes[i].cost;
                            }
                        } else {
                            matrix[newNodes[i].x][newNodes[i].y] = act.cost + 1 + 1000; // APPLY PENALTY
                        }
                    }

                    prQueue = sortList(prQueue);
                }
            }
        };

        this.distance = function (from, to) {
            return matrix[from.x][from.y] - matrix[to.x][to.y];
        };

        this.isFinish = function (node) {
            return matrix[node.getCenter().x][node.getCenter().y] == 0;
        };
    }

    function Node() {
        let center, distance, stepsTaken, firstNode, velocity;

        this.initialize = function(_center, _prev, _nowDistance) {
            center = _center;
            distance = _nowDistance;
            stepsTaken = 0;
            firstNode = null;
            velocity = {};

            if (_prev) {
                distance += _prev.getDistance();
                stepsTaken += _prev.getStepsTaken() +1;
                firstNode = _prev.getFirstNode();

                velocity = {
                    x: center.x - _prev.getCenter().x,
                    y: center.y - _prev.getCenter().y
                };
            }
        };

        this.h = function() {
            return distance / stepsTaken;
        };

        this.getCenter = function(){
            return center;
        };
        this.getDistance = function(){
            return distance;
        };
        this.getStepsTaken = function(){
            return stepsTaken;
        };
        this.getFirstNode = function(){
            return firstNode;
        };
        this.getVelocity = function(){
            return velocity;
        };
        this.setVelocity = function(_velocity){
            velocity = _velocity;
        };
        this.setFirstNode = function(_firstNode){
            firstNode = _firstNode;
        };
    }

    // STATE VARIABLES
    let heuristicMap;
    let bound;
    const initLimit = 10000, moveLimit = 1000;
    let timeLimit;

    // HELPER FUNCTIONS
    let inBound = function(node, bound) {
        return node.getStepsTaken() < bound;
    };

    let resetBound = function(){
        bound = 4;
    };

    let sortList = function (list) {
        return list.sort(function (a, b) {
            if (a.h() > b.h()) {
                return -1;
            }
            if (a.h() < b.h()) {
                return 1;
            }
            return 0;
        });
    };

    let timeLeft = function(){
        return timeLimit - Date.now();
    };

    // API FUNCTIONS
    this.init = function (c, playerdata, selfindex) {
        timeLimit = Date.now() + initLimit;
        heuristicMap = new HeuristicMap();
        heuristicMap.initialize(c);
        console.log("INIT TIME LIMIT: ", timeLeft());
    };

    this.movefunction = function (c, playerdata, selfindex) {
        timeLimit = Date.now() + moveLimit;
        const self = playerdata[selfindex]; // read the info for the actual player

        const velocity = {
            x: (self.pos.x - self.oldpos.x),
            y: (self.pos.y - self.oldpos.y)
        };
        const newCenter = { // that's how the center of the next movement can be computed
            x: self.pos.x,
            y: self.pos.y
        };

        let validNodes = [];

        {
            // create pseudo node
            let node = new Node();
            node.initialize(newCenter, null, 0);
            node.setVelocity(velocity);
            validNodes.push(node);
        }
        resetBound();

        let index = 0;
        let isFinishNodeFound = false;
        while (validNodes.length > 0) {
            if (index < validNodes.length) {
                if (!inBound(validNodes[index], bound) || heuristicMap.isFinish(validNodes[index])) {
                    index++;
                    continue;
                }
            } else {
                if(!isFinishNodeFound){
                    bound++;
                    index = 0;
                    console.log("BOUND INCREASED TO: " + bound);
                    continue;
                }
                break;
            }

            let startingNode = validNodes.splice(index, 1)[0];
            index = 0;
            let distance = null;
            // we try the possible movements
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const nextMove = { // that's how the center of the next movement can be computed
                        x: startingNode.getCenter().x + (startingNode.getVelocity().x + i),
                        y: startingNode.getCenter().y + (startingNode.getVelocity().y + j)
                    };
                    //let nextMove = {x: startingNode.coordinates.x + i, y: startingNode.coordinates.y + j};
                    // if the movement is valid (the whole line has to be valid)
                    if (lc.validLine(startingNode.getCenter(), nextMove) && (startingNode.getFirstNode() || (lc.playerAt(nextMove) < 0 || lc.playerAt(nextMove) == selfindex))) {
                        distance = heuristicMap.distance(startingNode.getCenter(), nextMove);

                        let node = new Node(); node.initialize(nextMove, startingNode, distance);
                        if (!node.getFirstNode()) {
                            node.setFirstNode(node);
                        }
                        if (node.getStepsTaken() != 0 || distance != 0 || (Math.abs(node.getVelocity().x) > 0 && Math.abs(node.getVelocity().y) > 0)) {
                            validNodes.push(node);
                            if (heuristicMap.isFinish(node)) {
                                isFinishNodeFound = true;
                                if (bound > node.getStepsTaken()) {
                                    bound = node.getStepsTaken();
                                }
                            }
                        }
                    }
                }
            }
            if (isFinishNodeFound) {
                validNodes = validNodes.filter(value => (value.getStepsTaken() < bound || (value.getStepsTaken() == bound && heuristicMap.isFinish(value))));
            }
            sortList(validNodes, heuristicMap);
            if(timeLeft() < 51){
                break;
            }
        }

        let move = {x: 0, y: 0};
        if (validNodes.length) {
            move = validNodes.shift().getFirstNode().getCenter();
            move.x -= newCenter.x + velocity.x;
            move.y -= newCenter.y + velocity.y;
        }
        console.log("MOVE TIME LIMIT: ", timeLeft());
        return move;
    };
};