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
            if (this[a.x][a.y]  == undefined && this[b.x][b.y] == undefined) {
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
                        this.matrix[newNodes[i].x][newNodes[i].y] = act.cost + 1 + 5; // APPLY PENALTY
                    }
                }

                prQueue = this.sortList(prQueue);
            }
        }
    }

    // May have to redo (square, or smthing)
    distance = function(from, to){
        let fromVal = this.matrix[from.x][from.y];
        let toVal = this.matrix[to.x][to.y];
        return fromVal - toVal;
    }
}

class Leaf{
    static bound = -1;

    constructor(coordinates, prev, nowDistance) {
        this._distance = (prev ? prev.distance : 0) + nowDistance;
        this._stepsTaken = (prev ? prev.stepsTaken : 0) + 1;
        this._coordinates = coordinates;
        this._firstNode = (prev ? prev.firstNode : null);
        this._velocity = {};
        if (prev) {
            this._velocity = {
                x: coordinates.x - prev.coordinates.x,
                y: coordinates.y - prev.coordinates.y
            };
        }
    }


    get coordinates() {
        return this._coordinates;
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

    h(){
        return this._distance / this.stepsTaken;
    }

    static inBound(leaf){
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
            x: self.pos.x + velocity.x,
            y: self.pos.y + velocity.y
        };

        Leaf.bound = 4; // try it out, we can use a consistent constant here, because the image space is always around the same size
        let validLeafs = [];

        // create pseudo leaf
        let leaf = new Leaf(newCenter, null, 0);
        leaf.velocity = velocity;
        leaf.firstNode = leaf;
        validLeafs.push(leaf);

        let index = 0;
        while (validLeafs.length > 0) {
            if (!Leaf.inBound(validLeafs[index])) {
                index++;
                if(index >= validLeafs.length){
                    break;
                    //++Leaf.bound;
                }
                continue;
            }
            let startingLeaf = validLeafs.splice(index, 1)[0];

            index = 0;
            // we try the possible movements
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const nextMove = { // that's how the center of the next movement can be computed
                        x: startingLeaf.coordinates.x + startingLeaf.velocity.x + i,
                        y: startingLeaf.coordinates.y + startingLeaf.velocity.y + j
                    };
                    //let nextMove = {x: startingLeaf.coordinates.x + i, y: startingLeaf.coordinates.y + j};
                    // if the movement is valid (the whole line has to be valid)
                    if (lc.validLine(startingLeaf.coordinates, nextMove) && (lc.playerAt(nextMove) < 0 || lc.playerAt(nextMove) == selfindex)) {
                        let distance = heuristicMap.distance(startingLeaf.coordinates, nextMove) //Math.sqrt(Math.pow(nextMove.x - startingLeaf.coordinates.x, 2)+Math.pow(nextMove.y - startingLeaf.coordinates.y, 2));
                        let leaf = new Leaf(nextMove, startingLeaf, distance);
                        validLeafs.push(leaf);
                    }
                }
            }
            Leaf.sortList(validLeafs);
        }

        let move = {x: 0, y: 0};
        if (validLeafs.length) {
            move = validLeafs.shift().firstNode.coordinates;
            move.x -= newCenter.x;
            move.y -= newCenter.y;
        }
        console.log("MOVE TIME LIMIT: ", timeLimit - Date.now());
        return move;
    }
}