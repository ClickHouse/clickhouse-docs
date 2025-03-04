# bitmapL2 Combinator Examples

The following combinators can be applied to the `bitmapL2` function:

### bitmapL2If
Calculates L2 distance between bitmaps only for rows that match the given condition.

### bitmapL2Array
Calculates L2 distance between bitmaps from elements in the array.

### bitmapL2Map
Calculates L2 distance between bitmaps for each key in the map separately.

### bitmapL2SimpleState
Returns the L2 distance state with SimpleAggregateFunction type.

### bitmapL2State
Returns the intermediate state of L2 distance calculation.

### bitmapL2Merge
Combines intermediate states to get the final L2 distance.

### bitmapL2MergeState
Combines intermediate states but returns an intermediate state.

### bitmapL2ForEach
Calculates L2 distance between bitmaps for corresponding elements in multiple arrays.

### bitmapL2Distinct
Calculates L2 distance between bitmaps using distinct values only.

### bitmapL2OrDefault
Returns 0 if there are no rows.

### bitmapL2OrNull
Returns NULL if there are no rows. 