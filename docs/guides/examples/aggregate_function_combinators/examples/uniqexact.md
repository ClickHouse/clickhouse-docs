# uniqExact Combinator Examples

The following combinators can be applied to the `uniqExact` function:

### uniqExactIf
Calculates exact number of distinct values only for rows that match the given condition.

### uniqExactArray
Calculates exact number of distinct values from elements in the array.

### uniqExactMap
Calculates exact number of distinct values for each key in the map separately.

### uniqExactSimpleState
Returns the distinct values state with SimpleAggregateFunction type.

### uniqExactState
Returns the intermediate state of distinct values calculation.

### uniqExactMerge
Combines intermediate states to get the final count of distinct values.

### uniqExactMergeState
Combines intermediate states but returns an intermediate state.

### uniqExactForEach
Calculates exact number of distinct values for corresponding elements in multiple arrays.

### uniqExactDistinct
Calculates exact number of distinct values (same as regular function).

### uniqExactOrDefault
Returns 0 if there are no rows.

### uniqExactOrNull
Returns NULL if there are no rows. 