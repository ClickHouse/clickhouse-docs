# groupBitXor Combinator Examples

The following combinators can be applied to the `groupBitXor` function:

### groupBitXorIf
Performs bitwise XOR operation only for rows that match the given condition.

### groupBitXorArray
Performs bitwise XOR operation on elements in the array.

### groupBitXorMap
Performs bitwise XOR operation for each key in the map separately.

### groupBitXorSimpleState
Returns the bitwise XOR result with SimpleAggregateFunction type.

### groupBitXorState
Returns the intermediate state of bitwise XOR calculation.

### groupBitXorMerge
Combines intermediate states to get the final bitwise XOR result.

### groupBitXorMergeState
Combines intermediate states but returns an intermediate state.

### groupBitXorForEach
Performs bitwise XOR operation on corresponding elements in multiple arrays.

### groupBitXorDistinct
Performs bitwise XOR operation using distinct values only.

### groupBitXorOrDefault
Returns 0 if there are no rows.

### groupBitXorOrNull
Returns NULL if there are no rows. 