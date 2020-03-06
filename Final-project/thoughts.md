# Artificial intelligence - Competition project
> made by: `Bence Ütő, V7Z3T5` 

## Required answers

### Problem to be solved

### Chosen representation

### Uncertainties

### Input and Output expectation

### Real world applications

### Considered algorithms, way of choosing, performance consideration

### Implementing algorithms myself

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
- [x] Use heuristic: e.g. **`distance ÷ steps taken`** 
- [ ] Try to eliminate as much nodes as we can.
    - [x] Zero distance first nodes
- [ ] After deepening, calculate if we can take another depth. If time runs out, choose the first step of the deepest, best solution.

### Multiplayer optimization