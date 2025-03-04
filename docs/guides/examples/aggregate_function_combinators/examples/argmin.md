# argMin Combinator Examples

The following combinators can be applied to the `argMin` function:

### argMinIf
Returns the value of arg for the minimum val only for rows that match the given condition.

### argMinArray
Returns the value of arg corresponding to the minimum val in the array.

### argMinMap
Returns the value of arg for the minimum val for each key in the map separately.

### argMinSimpleState
Returns the result with SimpleAggregateFunction type.

### argMinState
Returns the intermediate state of argMin calculation.

### argMinMerge
Combines intermediate states to get the final argMin value.

### argMinMergeState
Combines intermediate states but returns an intermediate state.

### argMinForEach
Returns arg values for minimum val in corresponding elements of multiple arrays.

### argMinDistinct
Returns the value of arg for the minimum val among distinct val values.

### argMinOrDefault
Returns default values for arg and val types if there are no rows.

### argMinOrNull
Returns NULL if there are no rows. 