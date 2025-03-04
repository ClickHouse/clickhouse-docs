# any Combinator Examples

The following combinators can be applied to the `any` function:

### anyIf
Returns any value from the rows that match the given condition.

### anyArray
Returns any value from the array elements.

### anyMap
Returns any value for each key in the map separately.

### anySimpleState
Returns the result with SimpleAggregateFunction type.

### anyState
Returns the intermediate state of any calculation.

### anyMerge
Combines intermediate states to get the final any value.

### anyMergeState
Combines intermediate states but returns an intermediate state.

### anyForEach
Returns any value from corresponding elements in multiple arrays.

### anyDistinct
Returns any value from the set of distinct values.

### anyOrDefault
Returns the default value for the input type if there are no rows.

### anyOrNull
Returns NULL if there are no rows. 