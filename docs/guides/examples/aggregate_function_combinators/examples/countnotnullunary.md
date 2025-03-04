# countNotNullUnary Combinator Examples

The following combinators can be applied to the `countNotNullUnary` function:

### countNotNullUnaryIf
Counts non-null values only for rows that match the given condition.

### countNotNullUnaryArray
Counts non-null values from elements in the array.

### countNotNullUnaryMap
Counts non-null values for each key in the map separately.

### countNotNullUnarySimpleState
Returns the non-null count state with SimpleAggregateFunction type.

### countNotNullUnaryState
Returns the intermediate state of non-null count calculation.

### countNotNullUnaryMerge
Combines intermediate states to get the final non-null count.

### countNotNullUnaryMergeState
Combines intermediate states but returns an intermediate state.

### countNotNullUnaryForEach
Counts non-null values for corresponding elements in multiple arrays.

### countNotNullUnaryDistinct
Counts non-null values using distinct values only.

### countNotNullUnaryOrDefault
Returns 0 if there are no rows.

### countNotNullUnaryOrNull
Returns NULL if there are no rows. 