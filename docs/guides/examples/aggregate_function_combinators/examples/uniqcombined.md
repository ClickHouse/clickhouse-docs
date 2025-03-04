# uniqCombined Combinator Examples

The following combinators can be applied to the `uniqCombined` function:

### uniqCombinedIf
Calculates approximate number of different values using a combination of algorithms only for rows that match the given condition.

### uniqCombinedArray
Calculates approximate number of different values using a combination of algorithms from elements in the array.

### uniqCombinedMap
Calculates approximate number of different values using a combination of algorithms for each key in the map separately.

### uniqCombinedSimpleState
Returns the combined state with SimpleAggregateFunction type.

### uniqCombinedState
Returns the intermediate state of combined calculation.

### uniqCombinedMerge
Combines intermediate states to get the final approximate count.

### uniqCombinedMergeState
Combines intermediate states but returns an intermediate state.

### uniqCombinedForEach
Calculates approximate number of different values using a combination of algorithms for corresponding elements in multiple arrays.

### uniqCombinedDistinct
Calculates approximate number of different values using a combination of algorithms using distinct values only.

### uniqCombinedOrDefault
Returns 0 if there are no rows.

### uniqCombinedOrNull
Returns NULL if there are no rows. 