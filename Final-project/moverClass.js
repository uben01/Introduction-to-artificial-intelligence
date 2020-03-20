var V7Z3T5 = function () {
    // HELPER CLASSES
    function HeuristicMap() {
        let _finishValue = 100;
        let _sizeX, _sizeY, _matrix;

        this.initialize = function (c) {
            _sizeX = c.length;
            _sizeY = c[0].length;
            _matrix = [...Array(_sizeX)].map(x => Array(_sizeY)); // initialize empty arrays of arrays
            mapping(c);
            console.log(_matrix);
        };

        let stateTransition = function (state) {
            let newStates = [];
            for (let i = state.x - 1; i <= state.x + 1; i++) {
                if (i < 0 || i >= _sizeX) { // out of x bound
                    continue;
                }
                for (let j = state.y - 1; j <= state.y + 1; j++) {
                    if (j < 0 || j >= _sizeY) { // out of y bound
                        continue;
                    }
                    newStates.push({x: i, y: j, cost: 0});
                }
            }
            return newStates;
        };

        let sortList = function (list) {
            return list.sort(function (a, b) {
                if (!this[a.x][a.y] || !this[b.x][b.y]) {
                    if (!this[a.x][a.y]) {
                        return -1;
                    }
                    if (!this[b.x][b.y]) {
                        return 1;
                    }

                    return 0;
                }
                if (this[a.x][a.y] < this[b.x][b.y]) {
                    return -1;
                }
                if (this[a.x][a.y] > this[b.x][b.y]) {
                    return 1;
                }
                return 0;
            }.bind(_matrix));
        };

        let isMemberWithLEValue = function (list, node) {
            for (let i = 0; i < list.length; i++) {
                if (lc.equalPoints(list[i], node)) {
                    if (list[i].cost <= node.cost) {
                        return true;
                    }
                }
            }
            return false;
        };

        let isInMatrixWithLEValue = function (node) {
            if (_matrix[node.x][node.y] != undefined) {
                if (_matrix[node.x][node.y] < node.cost) {
                    return true;
                }
            }
            return false;
        };

        let mapping = function (c) {
            // find finish lines
            let finishLines = [];
            for (let i = 0; i < _sizeX; i++) {
                for (let j = 0; j < _sizeY; j++) {
                    if (c[i][j] == _finishValue) {
                        finishLines.push({x: i, y: j});
                    }
                }
            }
            for (let i = 0; i < finishLines.length; i++) {
                let prQueue = [];
                prQueue.push({x: finishLines[i].x, y: finishLines[i].y, cost: 0});
                _matrix[finishLines[i].x][finishLines[i].y] = 0;
                while (prQueue.length > 0) {
                    const act = prQueue.shift();
                    let newNodes = stateTransition(act);
                    for (let i = 0; i < newNodes.length; i++) {
                        if (c[newNodes[i].x][newNodes[i].y] >= 0) {
                            newNodes[i].cost = act.cost + 1;
                            if (!isMemberWithLEValue(prQueue, newNodes[i]) &&
                                !isInMatrixWithLEValue(newNodes[i])) {
                                prQueue.push(newNodes[i]);
                                _matrix[newNodes[i].x][newNodes[i].y] = newNodes[i].cost;
                            }
                        } else {
                            _matrix[newNodes[i].x][newNodes[i].y] = act.cost + 1 + 1000; // APPLY PENALTY
                        }
                    }

                    prQueue = sortList(prQueue);
                }
            }
        };

        this.distance = function (from, to) {
            return _matrix[from.x][from.y] - _matrix[to.x][to.y];
        };

        this.isFinish = function (node) {
            return _matrix[node.getCenter().x][node.getCenter().y] == 0;
        };
    }

    function Node() {
        let _center, _distance, _stepsTaken, _firstNode, _velocity;

        this.initialize = function (center, prev, nowDistance) {
            _center = center;
            _distance = nowDistance;
            _stepsTaken = 0;
            _firstNode = null;
            _velocity = {};

            if (prev) {
                _distance += prev.getDistance();
                _stepsTaken += prev.getStepsTaken() + 1;
                _firstNode = prev.getFirstNode();

                _velocity = {
                    x: center.x - prev.getCenter().x,
                    y: center.y - prev.getCenter().y
                };
            }
        };

        this.h = function () {
            return _distance / _stepsTaken;
        };

        this.getCenter = function () {
            return _center;
        };
        this.getDistance = function () {
            return _distance;
        };
        this.getStepsTaken = function () {
            return _stepsTaken;
        };
        this.getFirstNode = function () {
            return _firstNode;
        };
        this.getVelocity = function () {
            return _velocity;
        };
        this.setVelocity = function (velocity) {
            _velocity = velocity;
        };
        this.setFirstNode = function (firstNode) {
            _firstNode = firstNode;
        };
    }

    // STATE VARIABLES
    let heuristicMap;
    let bound;
    let timeLimit;
    const initLimit = 10000, moveLimit = 1000;

    // HELPER FUNCTIONS
    let inBound = function (node, bound) {
        return node.getStepsTaken() < bound;
    };

    let resetBound = function () {
        bound = 4;
    };

    let sortList = function (list) {
        return list.sort(function (a, b) {
            if(heuristicMap.isFinish(a) || heuristicMap.isFinish(b)){
                if(heuristicMap.isFinish(a)){
                    return -1;
                }
                if(heuristicMap.isFinish(b)){
                    return 1;
                }
                return 0;
            }

            if (a.h() > b.h()) {
                return -1;
            }
            if (a.h() < b.h()) {
                return 1;
            }
            return 0;
        });
    };

    let timeLeft = function () {
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
        const self = playerdata[selfindex];

        const nowVelocity = {
            x: (self.pos.x - self.oldpos.x),
            y: (self.pos.y - self.oldpos.y)
        };
        const nowCenter = {
            x: self.pos.x,
            y: self.pos.y
        };

        let validNodes = [];
        {
            // create pseudo node
            let node = new Node();
            node.initialize(nowCenter, null, 0);
            node.setVelocity(nowVelocity);
            validNodes.push(node);
        }
        resetBound();

        let index = 0;
        let isFinishNodeFound = false;
        while (validNodes.length) {
            if (index < validNodes.length) {
                if (!inBound(validNodes[index], bound) || heuristicMap.isFinish(validNodes[index])) {
                    index++;
                    continue;
                }
            } else {
                if (!isFinishNodeFound) {
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

            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const nextMove = {
                        x: startingNode.getCenter().x + (startingNode.getVelocity().x + i),
                        y: startingNode.getCenter().y + (startingNode.getVelocity().y + j)
                    };

                    if(lc.equalPoints(self.oldpos, self.pos) && lc.equalPoints(self.pos, nextMove))
                        continue;

                    if (lc.validLine(startingNode.getCenter(), nextMove) && (startingNode.getFirstNode() || (lc.playerAt(nextMove) < 0 || lc.playerAt(nextMove) === selfindex))) {
                        distance = heuristicMap.distance(startingNode.getCenter(), nextMove);

                        let node = new Node();
                        node.initialize(nextMove, startingNode, distance);
                        if (!node.getFirstNode()) {
                            node.setFirstNode(node);
                        }
                        validNodes.push(node);
                        if (heuristicMap.isFinish(node)) {
                            isFinishNodeFound = true;
                            bound = node.getStepsTaken();
                            validNodes = validNodes.filter(
                                value => (
                                    value.getStepsTaken() < bound ||
                                    (value.getStepsTaken() === bound && heuristicMap.isFinish(value))
                                ));
                        }
                    }
                }
            }
            sortList(validNodes);

            if (timeLeft() < 51 || validNodes.length === 1) {
                break;
            }
            if(validNodes.length > 700){
                validNodes = validNodes.splice(0, 700);
            }
        }

        let move;
        if (validNodes.length) {
            move = validNodes.shift().getFirstNode().getCenter();
            move.x -= nowCenter.x + nowVelocity.x;
            move.y -= nowCenter.y + nowVelocity.y;
        } else{
            move = {x: 0, y: 0};
        }
        console.log("MOVE TIME LIMIT: ", timeLeft());
        return move;
    };
};