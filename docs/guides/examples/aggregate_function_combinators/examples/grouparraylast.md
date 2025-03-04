# groupArrayLast Combinator Examples

The following combinators can be applied to the `groupArrayLast` function:

### groupArrayLastIf
Returns an array of last n elements only for rows that match the given condition.

### groupArrayLastArray
Returns an array of last n elements from elements in the array.

### groupArrayLastMap
Returns an array of last n elements for each key in the map separately.

### groupArrayLastSimpleState
Returns the last elements array state with SimpleAggregateFunction type.

### groupArrayLastState
Returns the intermediate state of last elements array calculation.

### groupArrayLastMerge
Combines intermediate states to get the final array of last elements.

### groupArrayLastMergeState
Combines intermediate states but returns an intermediate state.

### groupArrayLastForEach
Returns arrays of last n elements for corresponding elements in multiple arrays.

### groupArrayLastDistinct
Returns an array of last n elements using distinct values only.

### groupArrayLastOrDefault
Returns an empty array if there are no rows.

### groupArrayLastOrNull
Returns NULL if there are no rows. 