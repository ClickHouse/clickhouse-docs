# argMax Combinator Examples

The following combinators can be applied to the `argMax` function:

### argMaxIf
Returns the value of arg for the maximum val only for rows that match the given condition.

### argMaxArray
Returns the value of arg corresponding to the maximum val in the array.

### argMaxMap
Returns the value of arg for the maximum val for each key in the map separately.

### argMaxSimpleState
Returns the result with SimpleAggregateFunction type.

### argMaxState
Returns the intermediate state of argMax calculation.

### argMaxMerge
Combines intermediate states to get the final argMax value.

### argMaxMergeState
Combines intermediate states but returns an intermediate state.

### argMaxForEach
Returns arg values for maximum val in corresponding elements of multiple arrays.

### argMaxDistinct
Returns the value of arg for the maximum val among distinct val values.

### argMaxOrDefault
Returns default values for arg and val types if there are no rows.

### argMaxOrNull
Returns NULL if there are no rows. 