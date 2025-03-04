# minMap Combinator Examples

The following combinators can be applied to the `minMap` function:

### minMapIf
Returns the map containing minimum values for each key only for rows that match the given condition.

### minMapArray
Returns the map containing minimum values for each key from elements in the array.

### minMapMap
Returns the map containing minimum values for each key in the map separately.

### minMapSimpleState
Returns the map containing minimum values with SimpleAggregateFunction type.

### minMapState
Returns the intermediate state of minimum map calculation.

### minMapMerge
Combines intermediate states to get the final map of minimum values.

### minMapMergeState
Combines intermediate states but returns an intermediate state.

### minMapForEach
Returns the map containing minimum values for corresponding elements in multiple arrays.

### minMapDistinct
Returns the map containing minimum values using distinct values only.

### minMapOrDefault
Returns an empty map if there are no rows.

### minMapOrNull
Returns NULL if there are no rows. 