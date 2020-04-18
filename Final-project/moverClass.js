/**
 * @typedef Coordinate
 * @type Object
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {?number} cost - Cost of getting there
 */
/**
 * @typedef PlayerData
 * @type Object
 * @property oldpos {Coordinate} - Last position of the player
 * @property pos {Coordinate} - Current position of the player
 * @property penalty {number} - Turns left from penalty
 */
var V7Z3T5 = function () {
    // HELPER CLASSES

    /**
     * These nodes contains the information of various steps.
     * @class
     */
    function Node() {

        let _center, _distance, _stepsTaken, _firstNode, _velocity;

        /**
         * Initializes the node
         * @param center {Coordinate} - It would be center if we took this one step
         * @param prev {Node} - Reference to the previous node
         * @param nowDistance {number} - The calculated distance to reach the node
         */
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

        /**
         * Calculates the heuristic value of a node
         * @returns {number}
         */
        this.getH = function () {
            return _distance / _stepsTaken;
        };

        /**
         * Returns with the center of the node
         * @returns {Coordinate}
         */
        this.getCenter = function () {
            return _center;
        };
        /**
         * Returns with the distance of the node
         * @returns {number}
         */
        this.getDistance = function () {
            return _distance;
        };
        /**
         * Returns with the steps taken to get to this node
         * @returns {number}
         */
        this.getStepsTaken = function () {
            return _stepsTaken;
        };
        /**
         * Returns with the first node led to this place
         * @returns {Node}
         */
        this.getFirstNode = function () {
            return _firstNode;
        };
        /**
         * Returns with the velocity of the object which gets here
         * @returns {{x: number, y: number}}
         */
        this.getVelocity = function () {
            return _velocity;
        };
        /**
         * Sets the velocity of the node
         * @param velocity {number}
         */
        this.setVelocity = function (velocity) {
            _velocity = velocity;
        };
        /**
         * Sets the first node of the chain containing this node
         * @param firstNode {Node}
         */
        this.setFirstNode = function (firstNode) {
            _firstNode = firstNode;
        };
    }

    /**
     * The Map contains the explored parts of the "world"
     * @class
     */
    function Map() {
        /**
         * A spot is one point in the map. It consists of a V and a T. V is for value, T is for type.
         * @class
         * @constructor
         * @param t {number} - The initial (and constant) T value of the spot
         */
        function Spot(t) {
            this._v = undefined;
            this._t = t;

            /**
             * Returns with the type of the spot
             * @returns {number}
             */
            this.getT = function () {
                return this._t;
            }
            /**
             * Returns with the heuristic value of the spot
             * @returns {number}
             */
            this.getV = function () {
                return this._v;
            }
            /**
             * Sets the type of the spot (use in case the initialization couldn't set it)
             * @param t {number}
             */
            this.setT = function (t) {
                this._t = t;
            }
            /**
             * Sets the heuristic value of the
             * @param v {number}
             */
            this.setV = function (v) {
                this._v = v;
            }
        }

        const _finishPositionValue = 100;
        const _blockerPenalty = 1000;

        let _sizeX, _sizeY, _matrix;
        let _r;
        let _aMargins = [];
        let _aFinishes = [];

        /**
         *
         * @param c{number[][]} - Contains the initially visible parts of the map
         * @param self {{x: number, y: number}} - The player's coordinates
         */
        this.initialize = function (c, self) {
            _sizeX = c.length;
            _sizeY = c[0].length;

            let dXn, dXp, dYn, dYp;
            for (dXn = 0; self.x + dXn >= 0 && !isUndefined(c[self.x + dXn][self.y]); dXn--) ;
            for (dXp = 0; self.x + dXp < _sizeX && !isUndefined(c[self.x + dXp][self.y]); dXp++) ;
            for (dYn = 0; self.y + dYn >= 0 && !isUndefined(c[self.x][self.y + dYn]); dYn--) ;
            for (dYp = 0; self.y + dYp < _sizeY && !isUndefined(c[self.x][self.y + dYp]); dYp++) ;
            _r = Math.max(-dXn, dXp, -dYn, dYp) - 1;

            initialCalculateVs(c, self);
        };

        /**
         * Reinitialize the map. Searches for the closest margin or finish line
         * @param pos {Coordinate} - The coordinates of the player
         */
        this.reInitialize = function (pos) {
            let startingPoint;
            let array;

            if (_aFinishes.length > 0) {
                array = _aFinishes;
            } else {
                array = _aMargins;
            }
            startingPoint = array[0];
            array.forEach(function (item) {
                if (this.distance(pos, item) < this.distance(pos, startingPoint))
                    startingPoint = item;
            }.bind(this));

            let startingState = {
                x: startingPoint.x,
                y: startingPoint.y,
                cost: 0
            }
            for (let i = 0; i < _sizeX; i++) {
                for (let j = 0; j < _sizeY; j++)
                    if (_matrix[i][j].getT() >= 0)
                        _matrix[i][j].setV(Number.POSITIVE_INFINITY);
            }

            _matrix[startingState.x][startingState.y].setV(0);

            let prQueue = [];
            prQueue.push(startingState);
            while (prQueue.length > 0) {
                const act = prQueue.shift();
                let newNodes = stateTransition(act);
                for (let i = 0; i < newNodes.length; i++) {
                    let mElement = _matrix[newNodes[i].x][newNodes[i].y];

                    if (isUndefined(mElement.getT()) && _matrix[act.x][act.y].getT() >= 0 && !_aMargins.includes(act)) {
                        _aMargins.push(act);
                    } else if (mElement.getT() >= 0) {
                        newNodes[i].cost = act.cost + 1;
                        if (!isMemberWithLEValue(prQueue, newNodes[i]) &&
                            !isInMatrixWithLEValue(newNodes[i])) {
                            if (mElement.getT() === _finishPositionValue) {
                                newNodes[i].cost = 0;
                            }

                            mElement.setV(newNodes[i].cost);
                            prQueue.push(newNodes[i]);
                        }
                    } else if (mElement.getT() < 0) {
                        _matrix[newNodes[i].x][newNodes[i].y].setV(_blockerPenalty);
                    }
                }
            }
        };

        /**
         *
         * @param c{number[][]} - Contains the initially visible parts of the map
         * @param self {{x: number, y: number}} - The player's coordinates
         */
        let initialCalculateVs = function (c, self) {
            _matrix = [...Array(_sizeX)].map(() => Array(_sizeY));

            for (let x = 0; x < _sizeX; x++)
                for (let y = 0; y < _sizeY; y++) {
                    _matrix[x][y] = new Spot(c[x][y]);
                }

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
                    let mElement = _matrix[newNodes[i].x][newNodes[i].y];

                    if (isUndefined(mElement.getT()) && _matrix[act.x][act.y].getT() >= 0 && !_aMargins.includes(act)) {
                        _aMargins.push(act);
                    } else if (mElement.getT() >= 0) {
                        if (mElement.getT() === _finishPositionValue) {
                            newNodes[i].cost = Number.POSITIVE_INFINITY;
                        } else {
                            newNodes[i].cost = act.cost + 1;
                        }
                        if (!isMemberWithLEValue(prQueue, newNodes[i]) &&
                            !isInMatrixWithLEValue(newNodes[i])) {
                            prQueue.push(newNodes[i]);

                            mElement.setV(newNodes[i].cost);
                            if (mElement.getT() === _finishPositionValue && !_aFinishes.includes(_aMargins[i])) {
                                _aFinishes.push(newNodes[i]);
                            }
                        }
                    } else {
                        _matrix[newNodes[i].x][newNodes[i].y].setV(_blockerPenalty);
                    }
                }
            }
            //TOREMOVE
            _tdraw.clearWeights();
            for (let i = 0; i < _sizeX; i++) {
                for (let j = 0; j < _sizeY; j++) {
                    if (!isUndefined(_matrix[i][j].getV())) {
                        _tdraw.drawWeights({x: i, y: j}, _matrix[i][j].getV());
                    }
                }
            }
            //TOREMOVE
        };

        /**
         * Function to calculate if the edges can expand. Updates the V properties of the map
         */
        let calculateVs = function (pos) {
            let aNewMargins = [];
            for (let i = 0; i < _aMargins.length; i++) {
                let newNodes = stateTransition(_aMargins[i]);
                for (let j = 0; j < newNodes.length; j++) {
                    let mElement = _matrix[newNodes[j].x][newNodes[j].y];

                    if (isUndefined(mElement.getT()) && !aNewMargins.includes(_aMargins[i])) {
                        aNewMargins.push(_aMargins[i]);
                        continue;
                    }

                    if (mElement.getT() >= 0) {
                        newNodes[j].cost = _aMargins[i].cost + 1;

                        if (isUndefined(mElement.getV()) || mElement.getV() > newNodes[j].cost) {
                            if (!isMemberWithLEValue(_aMargins, newNodes[j]) &&
                                !isInMatrixWithLEValue(newNodes[j])) {
                                if (mElement.getT() === _finishPositionValue) {
                                    newNodes[j].cost = (reinitialized ? 0 : Number.POSITIVE_INFINITY);
                                    if (!_aFinishes.includes(newNodes[j])) {
                                        _aFinishes.push(newNodes[j]);
                                    }
                                }

                                _aMargins.push(newNodes[j]);
                                mElement.setV(newNodes[j].cost);
                            }
                        }
                    } else if (mElement.getT() < 0) {
                        mElement.setV(_blockerPenalty);
                    }
                }
            }
            if (_aMargins !== aNewMargins) {
                _aMargins = aNewMargins;
                if (reinitialized)
                    map.reInitialize(pos);
            }


            //TOREMOVE
            _tdraw.clearWeights();
            for (let i = 0; i < _sizeX; i++) {
                for (let j = 0; j < _sizeY; j++) {
                    if (!isUndefined(_matrix[i][j].getV())) {
                        _tdraw.drawWeights({x: i, y: j}, _matrix[i][j].getV());
                    }
                }
            }
            //TOREMOVE
        }
        /**
         * Checks if the node can be found in the list with less or equal value
         * @param list {Coordinate[]} -
         * @param node {Coordinate}
         * @returns {boolean}
         */
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

        /**
         * Checks if the given node's V value is smaller then the recalculated cost
         * @param node {Coordinate}
         * @returns {boolean}
         */
        let isInMatrixWithLEValue = function (node) {
            return _matrix[node.x][node.y].getV() < node.cost;
        };

        /**
         * Results in the elements of the 3x3 square around the given node
         * @param state {Coordinate}
         * @returns {Coordinate[]}
         */
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

        /**
         * Checks if the given node is a finish node
         * @param node {Node}
         * @returns {boolean}
         */
        this.isFinish = function (node) {
            return _matrix[node.getCenter().x][node.getCenter().y].getT() === _finishPositionValue;
        };

        /**
         * Calculates the heuristic value difference between two sports
         * @param from {Coordinate}
         * @param to {Coordinate}
         * @returns {number} - The value difference between the coordinates
         */
        this.distance = function (from, to) {
            return _matrix[to.x][to.y].getV() - _matrix[from.x][from.y].getV();
        };

        /**
         * Updates the map around the player
         * @param c{number[][]} - The map given
         * @param pos {Coordinate} - The player's position
         */
        this.updateMap = function (c, pos) {
            let p = {};
            for (let x = -_r; x <= _r; x++) {
                p.x = pos.x + x;
                if (p.x < 0) continue;
                if (p.x >= _sizeX) break;

                let dY = Math.ceil(Math.sqrt(_r * _r - x * x));
                for (let y = -dY; y <= dY; y++) {
                    p.y = pos.y + y;
                    if (p.y < 0) continue;
                    if (p.y >= _sizeY) break;
                    if (!isUndefined(c[p.x][p.y])) {
                        _matrix[p.x][p.y].setT(c[p.x][p.y]);
                    }
                }
            }

            calculateVs(pos);
        };

        /**
         * Gets the map's T values, for API purposes
         * @returns {number[][]}
         */
        this.getTMap = function () {
            let tMap = [...Array(_sizeX)].map(() => Array(_sizeY));
            for (let i = 0; i < _sizeX; i++) {
                for (let j = 0; j < _sizeY; j++) {
                    tMap[i][j] = _matrix[i][j].getT();
                }
            }
            return tMap;
        };
    }

    // STATE VARIABLES
    let map;
    let bound;
    let timeLimit;
    const initLimit = 10000, moveLimit = 1000;
    let reinitialized = false;

    // HELPER FUNCTIONS
    /**
     * Return how much time is left from the limit
     * @returns {number}
     */
    let timeLeft = function () {
        return timeLimit - Date.now();
    };

    /**
     * Checks if the given node is in the given bound
     * @param node {Node}
     * @param bound {number}
     * @returns {boolean}
     */
    let inBound = function (node, bound) {
        return node.getStepsTaken() < bound;
    };

    /**
     * Resets the bound to a constant. It's 4 at the moment, but can be changed.
     */
    let resetBound = function () {
        bound = 4;
    };

    /**
     * Checks if given p is undefined
     * @param p {*}
     * @returns {boolean}
     */
    let isUndefined = function (p) {
        return typeof p === "undefined";
    };

    /**
     * Sorts the list depend on it was reinitialized or not
     * @param list {Node[]}
     * @returns {Node[]}
     */
    let sortList = function (list) {
        return list.sort(function (a, b) {
            if (map.isFinish(a) || map.isFinish(b)) {
                if (!map.isFinish(a)) {
                    return 1;
                }
                if (!map.isFinish(b)) {
                    return -1;
                }
                return 0;
            }

            if (a.getH() > b.getH()) {
                return (reinitialized ? 1 : -1);
            }
            if (a.getH() < b.getH()) {
                return (reinitialized ? -1 : 1);
            }
            return 0;
        }.bind(this))
    };

    /**
     * Initializes the starting point for later calculation
     * @param {Coordinate} nowCenter
     * @param {Coordinate} nowVelocity
     * @param {Node[]} validNodes
     */
    let initializeStartingPoint = function(nowCenter, nowVelocity, validNodes){
        let node = new Node();
        node.initialize(nowCenter, null, 0);
        node.setVelocity(nowVelocity);
        validNodes.push(node);
    };

    //TOREMOVE
    let _tdraw;

    // API FUNCTIONS
    /**
     * API function to initialize the environment
     * @param c {number[][]}
     * @param playerdata {PlayerData}
     * @param selfindex {number}
     */
    this.init = function (c, playerdata, selfindex, tdraw /*//TOREMOVE*/) {

        timeLimit = Date.now() + initLimit;
        _tdraw = tdraw; //TOREMOVE

        map = new Map();
        map.initialize(c, playerdata[selfindex].pos);

        console.log("INIT TIME LIMIT: ", timeLeft());
    };

    /**
     * API function to calculate each movement
     * @param c {number[][]}
     * @param playerdata {PlayerData[]}
     * @param selfindex {number}
     * @returns {{x: number, y: number}}
     */
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
        let tMap = map.getTMap();

        let validNodes = [];
        initializeStartingPoint(nowCenter, nowVelocity, validNodes);
        resetBound();

        let index = 0;
        let isFinishNodeFound = false;
        let reinitializedNow = false;
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

                    if (lc.equalPoints(self.oldpos, self.pos) && lc.equalPoints(self.pos, nextMove))
                        continue;

                    if (lc.validVisibleLine(tMap, startingNode.getCenter(), nextMove) && (startingNode.getFirstNode() ||
                        (lc.playerAt(nextMove) < 0 || lc.playerAt(nextMove) === selfindex))) {
                        distance = map.distance(startingNode.getCenter(), nextMove);

                        let node = new Node();
                        node.initialize(nextMove, startingNode, distance);
                        if (!node.getFirstNode()) {
                            node.setFirstNode(node);
                        }
                        validNodes.push(node);

                        if (map.isFinish(node)) {
                            isFinishNodeFound = true;
                            bound = node.getStepsTaken();
                            validNodes = validNodes.filter(
                                value => (
                                    value.getStepsTaken() < bound ||
                                    (value.getStepsTaken() === bound && map.isFinish(value))
                                ));
                        }
                    }
                }
            }
            sortList(validNodes, !isFinishNodeFound);
            if (!reinitializedNow && (!reinitialized ? (validNodes[0].getH() < 1) : validNodes[0].getH() > -1)) {
                map.reInitialize(self.pos);
                reinitialized = true;
                reinitializedNow = true;

                validNodes = [];
                initializeStartingPoint(nowCenter, nowVelocity, validNodes);
                resetBound();

                index = 0;
                isFinishNodeFound = false;
                continue;
            }

            if (timeLeft() < 51 || validNodes.length === 1) {
                break;
            }
            if (validNodes.length > 1500) {
                validNodes = validNodes.splice(0, 1250);
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