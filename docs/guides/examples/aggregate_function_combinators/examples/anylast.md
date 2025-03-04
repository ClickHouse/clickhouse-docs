# anyLast Combinator Examples

The following combinators can be applied to the `anyLast` function:

### anyLastIf
Returns the last encountered value only for rows that match the given condition.

### anyLastArray
Returns the last encountered value from elements in the array.

### anyLastMap
Returns the last encountered value for each key in the map separately.

### anyLastSimpleState
Returns the last value state with SimpleAggregateFunction type.

### anyLastState
Returns the intermediate state of last value calculation.

### anyLastMerge
Combines intermediate states to get the final last value.

### anyLastMergeState
Combines intermediate states but returns an intermediate state.

### anyLastForEach
Returns last encountered values for corresponding elements in multiple arrays.

### anyLastDistinct
Returns the last encountered value using distinct values only.

### anyLastOrDefault
Returns default value if there are no rows.

### anyLastOrNull
Returns NULL if there are no rows. 