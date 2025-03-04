# groupBitmapOr Combinator Examples

The following combinators can be applied to the `groupBitmapOr` function:

### groupBitmapOrIf
Performs a bitwise OR operation on bitmaps only for rows that match the given condition.

### groupBitmapOrArray
Performs a bitwise OR operation on bitmaps from elements in the array.

### groupBitmapOrMap
Performs a bitwise OR operation on bitmaps for each key in the map separately.

### groupBitmapOrSimpleState
Returns the bitmap OR state with SimpleAggregateFunction type.

### groupBitmapOrState
Returns the intermediate state of bitmap OR calculation.

### groupBitmapOrMerge
Combines intermediate states to get the final bitmap OR result.

### groupBitmapOrMergeState
Combines intermediate states but returns an intermediate state.

### groupBitmapOrForEach
Performs a bitwise OR operation on bitmaps for corresponding elements in multiple arrays.

### groupBitmapOrDistinct
Performs a bitwise OR operation on bitmaps using distinct values only.

### groupBitmapOrOrDefault
Returns an empty bitmap if there are no rows.

### groupBitmapOrOrNull
Returns NULL if there are no rows. 