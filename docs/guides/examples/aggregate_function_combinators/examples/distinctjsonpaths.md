# distinctJsonPaths Combinator Examples

The following combinators can be applied to the `distinctJsonPaths` function:

### distinctJsonPathsIf
Returns distinct JSON paths only for rows that match the given condition.

### distinctJsonPathsArray
Returns distinct JSON paths from elements in the array.

### distinctJsonPathsMap
Returns distinct JSON paths for each key in the map separately.

### distinctJsonPathsSimpleState
Returns the distinct paths state with SimpleAggregateFunction type.

### distinctJsonPathsState
Returns the intermediate state of distinct paths calculation.

### distinctJsonPathsMerge
Combines intermediate states to get the final distinct JSON paths.

### distinctJsonPathsMergeState
Combines intermediate states but returns an intermediate state.

### distinctJsonPathsForEach
Returns distinct JSON paths for corresponding elements in multiple arrays.

### distinctJsonPathsDistinct
Returns distinct JSON paths using distinct values only.

### distinctJsonPathsOrDefault
Returns an empty array if there are no rows.

### distinctJsonPathsOrNull
Returns NULL if there are no rows. 