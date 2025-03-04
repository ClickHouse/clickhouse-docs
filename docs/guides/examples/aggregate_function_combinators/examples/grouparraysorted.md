# groupArraySorted Combinator Examples

The following combinators can be applied to the `groupArraySorted` function:

### groupArraySortedIf
Returns a sorted array only for rows that match the given condition.

### groupArraySortedArray
Returns a sorted array from elements in the array.

### groupArraySortedMap
Returns a sorted array for each key in the map separately.

### groupArraySortedSimpleState
Returns the sorted array state with SimpleAggregateFunction type.

### groupArraySortedState
Returns the intermediate state of sorted array calculation.

### groupArraySortedMerge
Combines intermediate states to get the final sorted array.

### groupArraySortedMergeState
Combines intermediate states but returns an intermediate state.

### groupArraySortedForEach
Returns sorted arrays for corresponding elements in multiple arrays.

### groupArraySortedDistinct
Returns a sorted array using distinct values only.

### groupArraySortedOrDefault
Returns an empty array if there are no rows.

### groupArraySortedOrNull
Returns NULL if there are no rows. 