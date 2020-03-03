# Steps
 
### First try
<ol>
    <li>
        <b>Heuristic function</b>: Backtrack UCS (uniform cost-search)
        <ul>
            <li>From all finish points, map all nodes available</li>
            <li>Red edges: penalty</li>
            <li>Those nodes, which can be accessed only via other red nodes stay empty</li>
            <li>Result: Heuristic map values, optimal way with velocity 1</li>
        </ul>
    </li>
    <li>
        <b>Move function</b>: greedy search. Just go to the point, with minimal heuristic value.
        Of course, this results in a suboptimal road. Most of the turns hits the wall, because of the great velocity.
    </li>
</ol> 