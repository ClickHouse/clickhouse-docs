# groupBitmapAnd Combinator Examples

The following combinators can be applied to the `groupBitmapAnd` function:

### groupBitmapAndIf
Performs a bitwise AND operation on bitmaps only for rows that match the given condition.

### groupBitmapAndArray
Performs a bitwise AND operation on bitmaps from elements in the array.

### groupBitmapAndMap
Performs a bitwise AND operation on bitmaps for each key in the map separately.

### groupBitmapAndSimpleState
Returns the bitmap AND state with SimpleAggregateFunction type.

### groupBitmapAndState
Returns the intermediate state of bitmap AND calculation.

### groupBitmapAndMerge
Combines intermediate states to get the final bitmap AND result.

### groupBitmapAndMergeState
Combines intermediate states but returns an intermediate state.

### groupBitmapAndForEach
Performs a bitwise AND operation on bitmaps for corresponding elements in multiple arrays.

### groupBitmapAndDistinct
Performs a bitwise AND operation on bitmaps using distinct values only.

### groupBitmapAndOrDefault
Returns an empty bitmap if there are no rows.

### groupBitmapAndOrNull
Returns NULL if there are no rows. 