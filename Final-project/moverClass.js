class HeuristicMap {
    static finishValue = 100;

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
                if (c[i][j] == HeuristicMap.finishValue) {
                    finishLines.push({x: i, y: j});
                }
            }
        }
        for (let i = 0; i < finishLines.length; i++) {
            let prQueue = [];
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

    isFinish = function (node) {
        return this.matrix[node.center.x][node.center.y] == 0;
    }
}

class Node {
    static bound = 5;

    constructor(center, prev, nowDistance) {
        this.center = center;
        this.distance = (prev ? prev.distance : 0) + nowDistance;
        this.stepsTaken = (prev ? prev.stepsTaken : -1) + 1;
        this.firstNode = (prev ? prev.firstNode : null);
        this.velocity = {};
        if (prev) {
            this.velocity = {
                x: center.x - prev.center.x,
                y: center.y - prev.center.y
            };
        }
    }

    h() {
        return this.distance / this.stepsTaken;
    }

    static inBound(leaf) {
        return leaf.stepsTaken < this.bound;
    }

    static sortList = function (list, heuristicMap) {
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

        let validNodes = [];

        {
            // create pseudo node
            let node = new Node(newCenter, null, 0);
            node.velocity = velocity;
            validNodes.push(node);
        }

        let index = 0;
        let isFinishNodeFound = false;
        while (validNodes.length > 0) {
            if (index < validNodes.length) {
                if (!Node.inBound(validNodes[index]) || heuristicMap.isFinish(validNodes[index])) {
                    index++;
                    continue;
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
                    if (lc.validLine(startingNode.center, nextMove) && (startingNode.firstNode || (lc.playerAt(nextMove) < 0 || lc.playerAt(nextMove) == selfindex))) {
                        distance = heuristicMap.distance(startingNode.center, nextMove);

                        let node = new Node(nextMove, startingNode, distance);
                        if (!node.firstNode) {
                            node.firstNode = node;
                        }
                        if (node.stepsTaken != 0 || distance != 0 || (Math.abs(node.velocity.x) > 0 && Math.abs(node.velocity.y) > 0)) {
                            validNodes.push(node);
                            if (heuristicMap.isFinish(node)) {
                                isFinishNodeFound = true;
                                if (Node.bound > node.stepsTaken) {
                                    Node.bound = node.stepsTaken;
                                }
                            }
                        }
                    }
                }
            }
            if (isFinishNodeFound) {
                validNodes = validNodes.filter(value => (value.stepsTaken < Node.bound || (value.stepsTaken == Node.bound && heuristicMap.isFinish(value))));
            }
            Node.sortList(validNodes, heuristicMap);
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