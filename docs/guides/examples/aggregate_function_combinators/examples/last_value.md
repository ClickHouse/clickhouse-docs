# last_value Combinator Examples

The following combinators can be applied to the `last_value` function:

### last_valueIf
Returns the last value only for rows that match the given condition.

### last_valueArray
Returns the last value from elements in the array.

### last_valueMap
Returns the last value for each key in the map separately.

### last_valueSimpleState
Returns the last value with SimpleAggregateFunction type.

### last_valueState
Returns the intermediate state of last value calculation.

### last_valueMerge
Combines intermediate states to get the final last value.

### last_valueMergeState
Combines intermediate states but returns an intermediate state.

### last_valueForEach
Returns last values for corresponding elements in multiple arrays.

### last_valueDistinct
Returns the last value among distinct values only.

### last_valueOrDefault
Returns the default value for the input type if there are no rows.

### last_valueOrNull
Returns NULL if there are no rows. 