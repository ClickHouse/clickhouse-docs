# singleValueOrNull Combinator Examples

The following combinators can be applied to the `singleValueOrNull` function:

### singleValueOrNullIf
Returns a single value or NULL only for rows that match the given condition.

### singleValueOrNullArray
Returns a single value or NULL from elements in the array.

### singleValueOrNullMap
Returns a single value or NULL for each key in the map separately.

### singleValueOrNullSimpleState
Returns the single value state with SimpleAggregateFunction type.

### singleValueOrNullState
Returns the intermediate state of single value calculation.

### singleValueOrNullMerge
Combines intermediate states to get the final single value or NULL.

### singleValueOrNullMergeState
Combines intermediate states but returns an intermediate state.

### singleValueOrNullForEach
Returns single values or NULL for corresponding elements in multiple arrays.

### singleValueOrNullDistinct
Returns a single value or NULL using distinct values only.

### singleValueOrNullOrDefault
Returns NULL if there are no rows.

### singleValueOrNullOrNull
Returns NULL if there are no rows. 