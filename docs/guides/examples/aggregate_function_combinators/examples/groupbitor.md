# groupBitOr Combinator Examples

The following combinators can be applied to the `groupBitOr` function:

### groupBitOrIf
Performs bitwise OR operation only for rows that match the given condition.

### groupBitOrArray
Performs bitwise OR operation on elements in the array.

### groupBitOrMap
Performs bitwise OR operation for each key in the map separately.

### groupBitOrSimpleState
Returns the bitwise OR result with SimpleAggregateFunction type.

### groupBitOrState
Returns the intermediate state of bitwise OR calculation.

### groupBitOrMerge
Combines intermediate states to get the final bitwise OR result.

### groupBitOrMergeState
Combines intermediate states but returns an intermediate state.

### groupBitOrForEach
Performs bitwise OR operation on corresponding elements in multiple arrays.

### groupBitOrDistinct
Performs bitwise OR operation using distinct values only.

### groupBitOrOrDefault
Returns 0 if there are no rows.

### groupBitOrOrNull
Returns NULL if there are no rows. 