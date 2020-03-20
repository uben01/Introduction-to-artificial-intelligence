# Artificial intelligence - Competition project
> made by: `Bence Ütő, V7Z3T5` 

## Required answers

### Problem to be solved
We are looking for an optimal (or at least good) path for a moving object, which can accelerate. 
In this case, you have to look to the possible futures, and choose the best speed and path. 
The state space is quite big because there are ~9 states from every starting state to expand.
Because of the exponential blowup, you cannot calculate the whole road, just the first `n` transitions.

### Chosen representation
I've chosen a representation, consisting of a map and nodes. The map (let's call it `Heuristic Map`)
is an `n x m` array of arrays (matrix). In that map, I store the "velocity 1; distance" from every finishing node.
The map is generated in the `init` function by an UCS search. The starting position of the **UCS** is
every finishing node, one after another. If a node can be accessed "faster" then from a previous starting
position it is overridden, and the search expands from there. 

The other main point of the representation is the `Node` class. It stores the accessed points of the map,
and those which we may want to expand to. A `Node` contains:
 - Center (the center position, `x = 0; y = 0`)
 - Distance (if we would have done the previous steps, we would have been this "closer" to the finish)
 - Steps taken (in chained actions, this shows us how "deep" we are, in the search)
 - First node (when the path has been chosen, we have to know the first step, where to expand next)
 - Velocity (it's pretty self explanatory)
 
The search is something like an **IDA&ast;**. The heuristic function is non-admissible. The measure given
takes the calculated distance (with velocity 1) and divides with the "depth of thinking".

*For example: The first iteration is always depth: 1, so we will choose the option, with the maximal distance,
to expand. The next iteration's depth will be 2, and the distance will be the distance covered in the two steps.
If the velocity built up, it will go as a DFS, but it wont be a problem, since the search is limited (initially depth 5).*


### Uncertainties
Because of the acceleration, we have to look forward, usually a lot. We have to know when to start breaking
or when we have to start the cornering.

### Input and Output expectation
In the initializer and mover function we expect the map (`c`), `playerdata`, and the `selfindex`. 
 - The map should be an array of arrays, containing information about the level, we have chosen.
 - Playerdata contains of the players old and new position (thus the velocity, and center)
 - And selfindex is a number. `playerdata[selfindex]` is our representation

For the initializer we have to return within 10 seconds, or we are eliminated. For the mover function
we've got 1 second to do so, or the caller function will assume the answer as `(0 ; 0)`

The initializer don't have an output, it just have to return in time, however the mover have to return
with `x` and `y` coordinates. Both coordinates codomain consist of whole numbers in range `[-1 ; 1]`.

### Real world applications
It's pretty simple. From a self driving car. The only constraint is, the the world have to be known.
E.g. the car have to have the map from A to B.

### Considered algorithms, way of choosing, performance consideration
In the first try I realised, the 10 seconds of initialize, is more then enough, to heuristically map
the whole level. So the only consideration was the mapping search function. I've chosen **UCS**, because
I have to map the whole stuff and have to know how far away I could be from the closest finish.

The problem was rather the mover function, which only had 1 second. Of course, in that time I can not possible
calculate all the paths I could take. That's why **IDA&ast;** was chosen. By default I expand 4 node further,
but if the time is running out, we can shut it down earlier, or if we have got plenty of time, we can expand further.

### Implementing algorithms myself
Both **UCS** an **IDA&ast;** was implemented by me. I've used the code from the class to start
the implementation, but it was a bit different in a lot of aspects, so I've edited the most part.
 - My **UCS** have the advantage, that the found costs, can be overridden. It is needed to 
take in account all the finish nodes.
 - The **IDA&ast;** had a lot more work in the gears. The bound expansion considered the time limit,
or the bound lowering, in case of a finish node is found.
    - Moreover I've tried to eliminate as much nodes as possible. About that I write more in the
    *working process documentation* part of the document.
    
    
## Working process documentation
 
### First try

1. **Heuristic function**: Backtrack UCS (uniform cost-search)
    * From all finish points, map all nodes available
    * Red edges: penalty
    * Those nodes, which can be accessed only via other red nodes stay empty
    * Result: Heuristic map values, optimal way with velocity 1
1. **Move function**: greedy search. Just go to the point, with minimal heuristic value.
        Of course, this results in a suboptimal road. Most of the turns hits the wall, because of the great velocity.
    
### Improvements
- [x] Change greedy search to **IDA&ast;**
- [x] Use heuristic: e.g. **`distance ÷ steps_taken`** 
- [ ] Try to eliminate as much nodes as we can.
    - [x] Lower bound if a finish node is found
    - [x] Every time after a sort, if the `validNodes.length` is greater then 500, cut the elements after the 500th index
- [x] After every try, check the remaining time. If the time runs out, choose the best option

### Multiplayer optimization
- [ ] If a player stand on a finish node, make it like wall from now on