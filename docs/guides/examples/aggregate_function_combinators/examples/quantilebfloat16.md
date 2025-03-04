# quantileBFloat16 Combinator Examples

The following combinators can be applied to the `quantileBFloat16` function:

### quantileBFloat16If
Calculates quantile using BFloat16 precision only for rows that match the given condition.

### quantileBFloat16Array
Calculates quantile using BFloat16 precision from elements in the array.

### quantileBFloat16Map
Calculates quantile using BFloat16 precision for each key in the map separately.

### quantileBFloat16SimpleState
Returns the BFloat16 quantile state with SimpleAggregateFunction type.

### quantileBFloat16State
Returns the intermediate state of BFloat16 quantile calculation.

### quantileBFloat16Merge
Combines intermediate states to get the final quantile value.

### quantileBFloat16MergeState
Combines intermediate states but returns an intermediate state.

### quantileBFloat16ForEach
Calculates quantiles using BFloat16 precision for corresponding elements in multiple arrays.

### quantileBFloat16Distinct
Calculates quantile using BFloat16 precision using distinct values only.

### quantileBFloat16OrDefault
Returns 0 if there are no rows.

### quantileBFloat16OrNull
Returns NULL if there are no rows. 