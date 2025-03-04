# uniqHLL12 Combinator Examples

The following combinators can be applied to the `uniqHLL12` function:

### uniqHLL12If
Calculates approximate number of different values using HyperLogLog algorithm only for rows that match the given condition.

### uniqHLL12Array
Calculates approximate number of different values using HyperLogLog algorithm from elements in the array.

### uniqHLL12Map
Calculates approximate number of different values using HyperLogLog algorithm for each key in the map separately.

### uniqHLL12SimpleState
Returns the HyperLogLog state with SimpleAggregateFunction type.

### uniqHLL12State
Returns the intermediate state of HyperLogLog calculation.

### uniqHLL12Merge
Combines intermediate states to get the final approximate count.

### uniqHLL12MergeState
Combines intermediate states but returns an intermediate state.

### uniqHLL12ForEach
Calculates approximate number of different values using HyperLogLog algorithm for corresponding elements in multiple arrays.

### uniqHLL12Distinct
Calculates approximate number of different values using HyperLogLog algorithm using distinct values only.

### uniqHLL12OrDefault
Returns 0 if there are no rows.

### uniqHLL12OrNull
Returns NULL if there are no rows. 