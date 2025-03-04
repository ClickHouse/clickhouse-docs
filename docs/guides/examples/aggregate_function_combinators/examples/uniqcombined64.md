# uniqCombined64 Combinator Examples

The following combinators can be applied to the `uniqCombined64` function:

### uniqCombined64If
Calculates approximate number of different values using a combination of algorithms with 64-bit precision only for rows that match the given condition.

### uniqCombined64Array
Calculates approximate number of different values using a combination of algorithms with 64-bit precision from elements in the array.

### uniqCombined64Map
Calculates approximate number of different values using a combination of algorithms with 64-bit precision for each key in the map separately.

### uniqCombined64SimpleState
Returns the combined state with SimpleAggregateFunction type.

### uniqCombined64State
Returns the intermediate state of combined calculation.

### uniqCombined64Merge
Combines intermediate states to get the final approximate count.

### uniqCombined64MergeState
Combines intermediate states but returns an intermediate state.

### uniqCombined64ForEach
Calculates approximate number of different values using a combination of algorithms with 64-bit precision for corresponding elements in multiple arrays.

### uniqCombined64Distinct
Calculates approximate number of different values using a combination of algorithms with 64-bit precision using distinct values only.

### uniqCombined64OrDefault
Returns 0 if there are no rows.

### uniqCombined64OrNull
Returns NULL if there are no rows. 