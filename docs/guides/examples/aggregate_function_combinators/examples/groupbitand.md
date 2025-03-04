# groupBitAnd Combinator Examples

The following combinators can be applied to the `groupBitAnd` function:

### groupBitAndIf
Performs bitwise AND operation only for rows that match the given condition.

### groupBitAndArray
Performs bitwise AND operation on elements in the array.

### groupBitAndMap
Performs bitwise AND operation for each key in the map separately.

### groupBitAndSimpleState
Returns the bitwise AND result with SimpleAggregateFunction type.

### groupBitAndState
Returns the intermediate state of bitwise AND calculation.

### groupBitAndMerge
Combines intermediate states to get the final bitwise AND result.

### groupBitAndMergeState
Combines intermediate states but returns an intermediate state.

### groupBitAndForEach
Performs bitwise AND operation on corresponding elements in multiple arrays.

### groupBitAndDistinct
Performs bitwise AND operation using distinct values only.

### groupBitAndOrDefault
Returns 0 if there are no rows.

### groupBitAndOrNull
Returns NULL if there are no rows. 