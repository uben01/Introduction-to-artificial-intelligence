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
            if (this.matrix[a.x][a.y] == undefined && this.matrix[b.x][b.y] == undefined) {
                return 0;
            }
            if (this.matrix[a.x][a.y] == undefined) {
                return -1;
            }
            if (this.matrix[b.x][b.y] == undefined) {
                return 1;
            }
            if (this.matrix[a.x][a.y] < this.matrix[b.x][b.y]) {
                return -1;
            }
            if (this.matrix[a.x][a.y] > this.matrix[b.x][b.y]) {
                return 1;
            }
            return 0;
        }.bind(this));
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
        for(let i = 0; i < this.sizeX; i++){
            for(let j = 0; j < this.sizeY; j++){
                if(c[i][j] == 100){
                    finishLines.push({x:i, y:j});
                }
            }
        }
        for(let i = 0; i < finishLines.length; i++){
            var prQueue = [];
            prQueue.push({x: finishLines[i].x, y: finishLines[i].y, cost: 0});
            this.matrix[finishLines[i].x][finishLines[i].y] = 0;
            while (prQueue.length > 0) {
                const act = prQueue.shift();
                let newNodes = this.stateTransition(act);
                for (let i = 0; i < newNodes.length; i++) {
                    if(c[newNodes[i].x][newNodes[i].y] >= 0){
                        newNodes[i].cost = act.cost + 1;
                        if (!this.isMemberWithLEValue(prQueue, newNodes[i]) &&
                            !this.isInMatrixWithLEValue(newNodes[i])) {
                            prQueue.push(newNodes[i]);
                            this.matrix[newNodes[i].x][newNodes[i].y] = newNodes[i].cost;
                        }
                    } else{
                        this.matrix[newNodes[i].x][newNodes[i].y] = act.cost + 1 + 5; // OR INF
                    }
                }

                prQueue = this.sortList(prQueue);
            }
        }
    }
}

var moverClass = function () {
    let heuristicMap;

    this.init = function (c, playerdata, selfindex) {
        var timeLimit = Date.now() + 10000;
        console.log("INIT TIME LIMIT: ", timeLimit - Date.now());
        heuristicMap = new HeuristicMap(c, playerdata[selfindex].oldpos);
        console.log("INIT TIME LIMIT: ", timeLimit - Date.now());
    }

    this.movefunction = function (c, playerdata, selfindex) {
        // TODO: plan ahead, don't use greedy algorithm
        var timeLimit = Date.now() + 1000;
        console.log("MOVE TIME LIMIT: ", timeLimit - Date.now());
        var self = playerdata[selfindex]; // read the info for the actual player
        var newcenter = { // thats how the center of the next movement can be computed
            x: self.pos.x + (self.pos.x - self.oldpos.x),
            y: self.pos.y + (self.pos.y - self.oldpos.y)
        };
        var nextmove = newcenter;

        var validmoves = [];
        // we try the possible movements
        for (var i = -1; i <= 1; i++)
            for (var j = -1; j <= 1; j++) {
                nextmove = {x: newcenter.x + i, y: newcenter.y + j};
                // if the movement is valid (the whole line has to be valid)
                if (lc.validLine(self.pos, nextmove) && (lc.playerAt(nextmove) < 0 || lc.playerAt(nextmove) == selfindex))
                    validmoves.push(nextmove);
            }
        if(validmoves.length) {
            heuristicMap.sortList(validmoves);
            var move = validmoves[0];
            move.x -= newcenter.x;
            move.y -= newcenter.y;
            return move;
        }
        console.log("MOVE TIME LIMIT: ", timeLimit - Date.now());
        return {x: 0, y: 0}; // if there is no valid movement, then close our eyes....

    }
}