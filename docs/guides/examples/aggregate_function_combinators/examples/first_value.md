# first_value Combinator Examples

The following combinators can be applied to the `first_value` function:

### first_valueIf
Returns the first value only for rows that match the given condition.

### first_valueArray
Returns the first value from elements in the array.

### first_valueMap
Returns the first value for each key in the map separately.

### first_valueSimpleState
Returns the first value with SimpleAggregateFunction type.

### first_valueState
Returns the intermediate state of first value calculation.

### first_valueMerge
Combines intermediate states to get the final first value.

### first_valueMergeState
Combines intermediate states but returns an intermediate state.

### first_valueForEach
Returns first values for corresponding elements in multiple arrays.

### first_valueDistinct
Returns the first value among distinct values only.

### first_valueOrDefault
Returns the default value for the input type if there are no rows.

### first_valueOrNull
Returns NULL if there are no rows. 