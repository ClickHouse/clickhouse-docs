# groupConcat Combinator Examples

The following combinators can be applied to the `groupConcat` function:

### groupConcatIf
Concatenates string values only for rows that match the given condition.

### groupConcatArray
Concatenates string values from elements in the array.

### groupConcatMap
Concatenates string values for each key in the map separately.

### groupConcatSimpleState
Returns the concatenation state with SimpleAggregateFunction type.

### groupConcatState
Returns the intermediate state of string concatenation.

### groupConcatMerge
Combines intermediate states to get the final concatenated string.

### groupConcatMergeState
Combines intermediate states but returns an intermediate state.

### groupConcatForEach
Concatenates string values for corresponding elements in multiple arrays.

### groupConcatDistinct
Concatenates string values using distinct values only.

### groupConcatOrDefault
Returns an empty string if there are no rows.

### groupConcatOrNull
Returns NULL if there are no rows. 