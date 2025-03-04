# maxMap Combinator Examples

The following combinators can be applied to the `maxMap` function:

### maxMapIf
Returns the map containing maximum values for each key only for rows that match the given condition.

### maxMapArray
Returns the map containing maximum values for each key from elements in the array.

### maxMapMap
Returns the map containing maximum values for each key in the map separately.

### maxMapSimpleState
Returns the map containing maximum values with SimpleAggregateFunction type.

### maxMapState
Returns the intermediate state of maximum map calculation.

### maxMapMerge
Combines intermediate states to get the final map of maximum values.

### maxMapMergeState
Combines intermediate states but returns an intermediate state.

### maxMapForEach
Returns the map containing maximum values for corresponding elements in multiple arrays.

### maxMapDistinct
Returns the map containing maximum values using distinct values only.

### maxMapOrDefault
Returns an empty map if there are no rows.

### maxMapOrNull
Returns NULL if there are no rows. 