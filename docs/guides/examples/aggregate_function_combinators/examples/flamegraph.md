# flame_graph Combinator Examples

The following combinators can be applied to the `flame_graph` function:

### flame_graphIf
Generates a flame graph only for rows that match the given condition.

### flame_graphArray
Generates a flame graph from elements in the array.

### flame_graphMap
Generates a flame graph for each key in the map separately.

### flame_graphSimpleState
Returns the flame graph data with SimpleAggregateFunction type.

### flame_graphState
Returns the intermediate state of flame graph construction.

### flame_graphMerge
Combines intermediate states to get the final flame graph.

### flame_graphMergeState
Combines intermediate states but returns an intermediate state.

### flame_graphForEach
Generates flame graphs from corresponding elements in multiple arrays.

### flame_graphDistinct
Generates a flame graph using distinct values only.

### flame_graphOrDefault
Returns an empty flame graph if there are no rows.

### flame_graphOrNull
Returns NULL if there are no rows. 