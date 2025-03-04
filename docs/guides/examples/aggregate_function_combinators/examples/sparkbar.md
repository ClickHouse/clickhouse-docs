# sparkBar Combinator Examples

The following combinators can be applied to the `sparkBar` function:

### sparkBarIf
Generates spark bar visualization only for rows that match the given condition.

### sparkBarArray
Generates spark bar visualization from elements in the array.

### sparkBarMap
Generates spark bar visualization for each key in the map separately.

### sparkBarSimpleState
Returns the spark bar visualization with SimpleAggregateFunction type.

### sparkBarState
Returns the intermediate state of spark bar visualization calculation.

### sparkBarMerge
Combines intermediate states to get the final spark bar visualization.

### sparkBarMergeState
Combines intermediate states but returns an intermediate state.

### sparkBarForEach
Generates spark bar visualizations for corresponding elements in multiple arrays.

### sparkBarDistinct
Generates spark bar visualization using distinct values only.

### sparkBarOrDefault
Returns an empty visualization if there are no rows.

### sparkBarOrNull
Returns NULL if there are no rows. 