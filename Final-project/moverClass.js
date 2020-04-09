var V7Z3T5 = function () {
    // HELPER CLASSES

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

    function Map() {
        function Spot(t) {
            this._v = undefined;
            this._t = t;

            this.getT = function () {
                return this._t;
            }
            this.getV = function () {
                return this._v;
            }
            this.setT = function (t) {
                this._t = t;
            }
            this.setV = function (v) {
                this._v = v;
            }
        }

        const _startPositionValue = 1;
        const _finishPositionValue = 100;
        const _blockerValue = -1;
        const _blockerPenalty = 1000;

        let _sizeX, _sizeY, _matrix;
        let _r;
        let _aCalculateV = [];

        this.initialize = function (c, self) {
            _sizeX = c.length;
            _sizeY = c[0].length;

            let dXn, dXp, dYn, dYp;
            for (dXn = 0; self.x + dXn >= 0 && !isUndefined(c[self.x + dXn][self.y]); dXn--) ;
            for (dXp = 0; self.x + dXp < _sizeX && !isUndefined(c[self.x + dXp][self.y]); dXp++) ;
            for (dYn = 0; self.y + dYn >= 0 && !isUndefined(c[self.x][self.y + dYn]); dYn--) ;
            for (dYp = 0; self.y + dYp < _sizeY && !isUndefined(c[self.x][self.y + dYp]); dYp++) ;
            _r = Math.max(-dXn, dXp, -dYn, dYp) - 1;

            _matrix = [...Array(_sizeX)].map(x => Array(_sizeY));
            for (let x = 0; x < _sizeX; x++)
                for (let y = 0; y < _sizeY; y++) {
                    _matrix[x][y] = new Spot(c[x][y]);
                    if (_matrix[x][y].getT() === _blockerValue) {
                        _matrix[x][y].setV(_blockerPenalty);
                    }
                }
            calculateVs(self);
        };

        let calculateVs = function (self) {
            if (!isUndefined(self)) {
                _matrix[self.x][self.y].setV(0);
                let startingState = {
                    x: self.x,
                    y: self.y,
                    cost: 0
                }

                let prQueue = [];
                prQueue.push(startingState);
                while (prQueue.length > 0) {
                    const act = prQueue.shift();
                    let newNodes = stateTransition(act);
                    for (let i = 0; i < newNodes.length; i++) {
                        if (_matrix[newNodes[i].x][newNodes[i].y].getT() >= 0) {
                            newNodes[i].cost = act.cost + 1;
                            if (!isMemberWithLEValue(prQueue, newNodes[i]) &&
                                !isInMatrixWithLEValue(newNodes[i])) {
                                prQueue.push(newNodes[i]);
                                _matrix[newNodes[i].x][newNodes[i].y].setV(newNodes[i].cost);
                            }
                        } else {
                            _matrix[newNodes[i].x][newNodes[i].y].setV(_blockerPenalty);
                        }

                    }
                }
            } else {
                _aCalculateV.forEach(function (item, index) {
                    let minV = Number.POSITIVE_INFINITY;
                    if (_matrix[item.x][item.y].getV()) {
                        minV = _matrix[item.x][item.y].getV();
                    }
                    let newNodes = stateTransition(item);
                    for (let i = 0; i < newNodes.length; i++) {
                        let iV = _matrix[newNodes[i].x][newNodes[i].y].getV();
                        if (!isUndefined(iV)) {
                            if (iV + 1 < minV) {
                                minV = iV + 1;
                            }
                        }
                    }
                    if (minV == Number.POSITIVE_INFINITY) {
                        _aCalculateV.push(item);
                    } else {
                        _matrix[item.x][item.y].setV(minV);
                        _aCalculateV.splice(index, 1);
                    }

                }.bind(this));
            }

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
            return _matrix[node.x][node.y].getV() < node.cost;
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
                    newStates.push({x: i, y: j});
                }
            }
            return newStates;
        };

        this.isFinish = function (node) {
            return _matrix[node.getCenter().x][node.getCenter().y].getT() === _finishPositionValue;
        };

        this.distance = function (from, to) {
            return _matrix[to.x][to.y].getV() - _matrix[from.x][from.y].getV();
        };

        this.updateMap = function (c, pos) {
            let p = {};
            for (let x = -_r; x <= _r; x++) {
                p.x = pos.x + x;
                if (p.x < 0) continue;
                if (p.x >= _sizeX) break;

                let dY = Math.floor(Math.sqrt(_r * _r - x * x));
                for (let y = -dY; y <= dY; y++) {
                    p.y = pos.y + y;
                    if (p.y < 0) continue;
                    if (p.y >= _sizeY) break;
                    if (!isUndefined(c[p.x][p.y])) {
                        if (isUndefined(_matrix[p.x][p.y].getT())){
                            _matrix[p.x][p.y].setT(c[p.x][p.y]);
                        }
                        if (c[p.x][p.y] === _blockerValue) {
                            _matrix[p.x][p.y].setV(_blockerPenalty);
                        } else {
                            _aCalculateV.push({x: p.x, y: p.y});
                        }
                    }
                }
            }
            calculateVs();
        };
    }

    // STATE VARIABLES
    let map;
    let bound;
    let timeLimit;
    const initLimit = 10000, moveLimit = 1000;

    // HELPER FUNCTIONS
    let inBound = function (node, bound) {
        return node.getStepsTaken() < bound;
    };

    let isUndefined = function (p) {
        return typeof p === "undefined";
    };

    let resetBound = function () {
        bound = 4;
    };

    let sortList = function (list) {
        return list.sort(function (a, b) {
            if (map.isFinish(a) || map.isFinish(b)) {
                if (map.isFinish(a)) {
                    return -1;
                }
                if (map.isFinish(b)) {
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

        map = new Map();
        map.initialize(c, playerdata[selfindex].pos);

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

        map.updateMap(c, nowCenter);

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
                if (!inBound(validNodes[index], bound) || map.isFinish(validNodes[index])) {
                    index++;
                    continue;
                }
            } else {
                if (!isFinishNodeFound) {
                    bound++;
                    index = 0;
                    //console.log("BOUND INCREASED TO: " + bound);
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

                    if (lc.equalPoints(self.oldpos, self.pos) && lc.equalPoints(self.pos, nextMove))
                        continue;

                    if (lc.validVisibleLine(c, startingNode.getCenter(), nextMove) && (startingNode.getFirstNode() || (lc.playerAt(nextMove) < 0 || lc.playerAt(nextMove) === selfindex))) {
                        distance = map.distance(startingNode.getCenter(), nextMove);

                        let node = new Node();
                        node.initialize(nextMove, startingNode, distance);
                        if (!node.getFirstNode()) {
                            node.setFirstNode(node);
                        }
                        validNodes.push(node);
                        if (map.isFinish(node)) {
                            isFinishNodeFound = true;
                            //bound = node.getStepsTaken();
                            validNodes = validNodes.filter(
                                value => (
                                    value.getStepsTaken() < bound ||
                                    (value.getStepsTaken() === bound && map.isFinish(value))
                                ));

                        }
                    }
                }
            }
            sortList(validNodes);

            if (timeLeft() < 51 || validNodes.length === 1) {
                break;
            }
            if (validNodes.length > 1000) {
                validNodes = validNodes.splice(0, 750);
            }
        }

        let move;
        if (validNodes.length) {
            move = validNodes.shift().getFirstNode().getCenter();
            move.x -= nowCenter.x + nowVelocity.x;
            move.y -= nowCenter.y + nowVelocity.y;
        } else {
            move = {x: 0, y: 0};
        }
        console.log("MOVE TIME LIMIT: ", timeLeft());
        return move;


    };
};