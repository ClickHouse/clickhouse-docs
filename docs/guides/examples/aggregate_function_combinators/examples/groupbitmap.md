# groupBitmap Combinator Examples

The following combinators can be applied to the `groupBitmap` function:

### groupBitmapIf
Builds a bitmap only for rows that match the given condition.

### groupBitmapArray
Builds a bitmap from elements in the array.

### groupBitmapMap
Builds a bitmap for each key in the map separately.

### groupBitmapSimpleState
Returns the bitmap state with SimpleAggregateFunction type.

### groupBitmapState
Returns the intermediate state of bitmap construction.

### groupBitmapMerge
Combines intermediate states to get the final bitmap.

### groupBitmapMergeState
Combines intermediate states but returns an intermediate state.

### groupBitmapForEach
Builds bitmaps for corresponding elements in multiple arrays.

### groupBitmapDistinct
Builds a bitmap using distinct values only.

### groupBitmapOrDefault
Returns an empty bitmap if there are no rows.

### groupBitmapOrNull
Returns NULL if there are no rows. 