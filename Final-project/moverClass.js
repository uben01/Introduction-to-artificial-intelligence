class HeuristicMap {
    constructor(c, startPos) {
        this.sizeX = c.length;
        this.sizeY = c[0].length;
        this.matrix = [...Array(this.sizeX)].map(x => Array(this.sizeY)); // initialize empty arrays of arrays
        this.mapping(c, startPos);
    }

    stateTransition = function (state) {
        let newStates = [];
        for (let i = state.x - 1; i <= state.x + 1; i++) {
            if (i < 0 || i >= this.sizeX) { // out of x bound
                continue;
            }
            for (let j = state.y - 1; j <= state.y + 1; j++) {
                if (j < 0 || j >= this.sizeY) { // out of y bound
                    continue;
                }
                newStates.push({x: i, y: j, cost: 0});
            }
        }
        return newStates;
    }

    sortList = function (list) {
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
        }.bind(this.matrix));
    }

    isMemberWithLEValue = function (list, node) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].x == node.x && list[i].y == node.y) {
                if (list[i].cost <= node.cost) {
                    return true;
                }
                return false;
            }
        }
        return false;
    }

    isInMatrixWithLEValue = function (node) {
        if (this.matrix[node.x][node.y] != undefined) {
            if (this.matrix[node.x][node.y] < node.cost) {
                return true;
            }
        }
        return false;
    }

    mapping = function (c) {
        // find finish lines
        let finishLines = [];
        for (let i = 0; i < this.sizeX; i++) {
            for (let j = 0; j < this.sizeY; j++) {
                if (c[i][j] == 100) {
                    finishLines.push({x: i, y: j});
                }
            }
        }
        for (let i = 0; i < finishLines.length; i++) {
            var prQueue = [];
            prQueue.push({x: finishLines[i].x, y: finishLines[i].y, cost: 0});
            this.matrix[finishLines[i].x][finishLines[i].y] = 0;
            while (prQueue.length > 0) {
                const act = prQueue.shift();
                let newNodes = this.stateTransition(act);
                for (let i = 0; i < newNodes.length; i++) {
                    if (c[newNodes[i].x][newNodes[i].y] >= 0) {
                        newNodes[i].cost = act.cost + 1;
                        if (!this.isMemberWithLEValue(prQueue, newNodes[i]) &&
                            !this.isInMatrixWithLEValue(newNodes[i])) {
                            prQueue.push(newNodes[i]);
                            this.matrix[newNodes[i].x][newNodes[i].y] = newNodes[i].cost;
                        }
                    } else {
                        this.matrix[newNodes[i].x][newNodes[i].y] = act.cost + 1 + 1000; // APPLY PENALTY
                    }
                }

                prQueue = this.sortList(prQueue);
            }
        }
    }

    // May have to redo (square, or smthing)
    distance = function (from, to) {
        return this.matrix[from.x][from.y] - this.matrix[to.x][to.y];
    }
}

class Node {
    static bound;

    constructor(center, prev, nowDistance) {
        this._distance = (prev ? prev.distance : 0) + nowDistance;
        this._stepsTaken = (prev ? prev.stepsTaken : -1) + 1;
        this._center = center;
        this._firstNode = (prev ? prev.firstNode : null);
        this._velocity = {};
        if (prev) {
            this._velocity = {
                x: center.x - prev.center.x,
                y: center.y - prev.center.y
            };
        }
    }

    get center() {
        return this._center;
    }

    get velocity() {
        return this._velocity;
    }

    get firstNode() {
        return this._firstNode;
    }

    get stepsTaken() {
        return this._stepsTaken;
    }

    get distance() {
        return this._distance;
    }

    set firstNode(value) {
        this._firstNode = value;
    }

    set velocity(value) {
        this._velocity = value;
    }

    h() {
        return this._distance / this._stepsTaken;
    }

    static inBound(leaf) {
        return leaf.stepsTaken <= this.bound;
    }

    static sortList = function (list) {
        return list.sort(function (a, b) {
            if (a.h() > b.h()) {
                return -1;
            }
            if (a.h() < b.h()) {
                return 1;
            }
            return 0;
        });
    }
}

var moverClass = function () {
    let heuristicMap;

    this.init = function (c, playerdata, selfindex) {
        const timeLimit = Date.now() + 10000;
        heuristicMap = new HeuristicMap(c, playerdata[selfindex].oldpos);
        console.log("INIT TIME LIMIT: ", timeLimit - Date.now());
    }

    this.movefunction = function (c, playerdata, selfindex) {
        const timeLimit = Date.now() + 1000;
        const self = playerdata[selfindex]; // read the info for the actual player

        const velocity = {
            x: (self.pos.x - self.oldpos.x),
            y: (self.pos.y - self.oldpos.y)
        };
        const newCenter = { // that's how the center of the next movement can be computed
            x: self.pos.x,
            y: self.pos.y
        };

        Node.bound = 4; // try it out, we can use a consistent constant here, because the image space is always around the same size
        let validNodes = [];

        {
            // create pseudo node
            let node = new Node(newCenter, null, 0);
            node.velocity = velocity;
            //node.firstNode = node;
            validNodes.push(node);
        }

        let index = 0;
        while (validNodes.length > 0) {
            if (index < validNodes.length) {
                if (!Node.inBound(validNodes[index])) {
                    index++;
                    continue;
                    //++Leaf.bound;
                }
            } else {
                break;
            }

            let startingNode = validNodes.splice(index, 1)[0];
            index = 0;
            let distance = null;
            // we try the possible movements
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const nextMove = { // that's how the center of the next movement can be computed
                        x: startingNode.center.x + (startingNode.velocity.x + i),
                        y: startingNode.center.y + (startingNode.velocity.y + j)
                    };
                    //let nextMove = {x: startingNode.coordinates.x + i, y: startingNode.coordinates.y + j};
                    // if the movement is valid (the whole line has to be valid)
                    if (lc.validLine(startingNode.center, nextMove) && (lc.playerAt(nextMove) < 0 || lc.playerAt(nextMove) == selfindex)) {
                        distance = heuristicMap.distance(startingNode.center, nextMove);

                        let node = new Node(nextMove, startingNode, distance);
                        if(!node.firstNode){
                            node.firstNode = node;
                        }
                        validNodes.push(node);
                    }
                }
            }
            Node.sortList(validNodes);
        }

        let move = {x: 0, y: 0};
        if (validNodes.length) {
            move = validNodes.shift().firstNode.center;
            move.x -= newCenter.x + velocity.x;
            move.y -= newCenter.y + velocity.y;
        }
        console.log("MOVE TIME LIMIT: ", timeLimit - Date.now());
        return move;
    }
}