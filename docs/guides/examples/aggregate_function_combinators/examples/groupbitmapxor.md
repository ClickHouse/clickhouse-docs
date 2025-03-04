# groupBitmapXor Combinator Examples

The following combinators can be applied to the `groupBitmapXor` function:

### groupBitmapXorIf
Performs a bitwise XOR operation on bitmaps only for rows that match the given condition.

### groupBitmapXorArray
Performs a bitwise XOR operation on bitmaps from elements in the array.

### groupBitmapXorMap
Performs a bitwise XOR operation on bitmaps for each key in the map separately.

### groupBitmapXorSimpleState
Returns the bitmap XOR state with SimpleAggregateFunction type.

### groupBitmapXorState
Returns the intermediate state of bitmap XOR calculation.

### groupBitmapXorMerge
Combines intermediate states to get the final bitmap XOR result.

### groupBitmapXorMergeState
Combines intermediate states but returns an intermediate state.

### groupBitmapXorForEach
Performs a bitwise XOR operation on bitmaps for corresponding elements in multiple arrays.

### groupBitmapXorDistinct
Performs a bitwise XOR operation on bitmaps using distinct values only.

### groupBitmapXorOrDefault
Returns an empty bitmap if there are no rows.

### groupBitmapXorOrNull
Returns NULL if there are no rows. 