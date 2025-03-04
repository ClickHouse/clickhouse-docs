# flame_graph Combinator Examples

The following combinators can be applied to the `flame_graph` function:

### flame_graphIf
Builds a flame graph visualization only for rows that match the given condition.

### flame_graphArray
Builds a flame graph visualization from elements in the array.

### flame_graphMap
Builds a flame graph visualization for each key in the map separately.

### flame_graphSimpleState
Returns the flame graph state with SimpleAggregateFunction type.

### flame_graphState
Returns the intermediate state of flame graph calculation.

### flame_graphMerge
Combines intermediate states to get the final flame graph visualization.

### flame_graphMergeState
Combines intermediate states but returns an intermediate state.

### flame_graphForEach
Builds flame graph visualizations for corresponding elements in multiple arrays.

### flame_graphDistinct
Builds a flame graph visualization using distinct values only.

### flame_graphOrDefault
Returns an empty visualization if there are no rows.

### flame_graphOrNull
Returns NULL if there are no rows. 