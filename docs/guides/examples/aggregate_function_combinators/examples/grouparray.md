# groupArray Combinator Examples

The following combinators can be applied to the `groupArray` function:

### groupArrayIf
Creates an array from values only for rows that match the given condition.

### groupArrayArray
Creates an array of arrays from array elements.

### groupArrayMap
Creates an array for each key in the map separately.

### groupArraySimpleState
Returns the array with SimpleAggregateFunction type.

### groupArrayState
Returns the intermediate state of array construction.

### groupArrayMerge
Combines intermediate states to get the final array.

### groupArrayMergeState
Combines intermediate states but returns an intermediate state.

### groupArrayForEach
Creates arrays from corresponding elements in multiple arrays.

### groupArrayDistinct
Creates an array from distinct values only.

### groupArrayOrDefault
Returns an empty array if there are no rows.

### groupArrayOrNull
Returns NULL if there are no rows. 