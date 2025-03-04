# groupArrayMovingSum Combinator Examples

The following combinators can be applied to the `groupArrayMovingSum` function:

### groupArrayMovingSumIf
Calculates moving sums only for rows that match the given condition.

### groupArrayMovingSumArray
Calculates moving sums of elements in the array.

### groupArrayMovingSumMap
Calculates moving sums for each key in the map separately.

### groupArrayMovingSumSimpleState
Returns the moving sums with SimpleAggregateFunction type.

### groupArrayMovingSumState
Returns the intermediate state of moving sum calculation.

### groupArrayMovingSumMerge
Combines intermediate states to get the final moving sums.

### groupArrayMovingSumMergeState
Combines intermediate states but returns an intermediate state.

### groupArrayMovingSumForEach
Calculates moving sums for corresponding elements in multiple arrays.

### groupArrayMovingSumDistinct
Calculates moving sums using distinct values only.

### groupArrayMovingSumOrDefault
Returns an array of zeros if there are not enough rows.

### groupArrayMovingSumOrNull
Returns NULL if there are not enough rows. 