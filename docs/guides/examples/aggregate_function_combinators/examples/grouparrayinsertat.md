# groupArrayInsertAt Combinator Examples

The following combinators can be applied to the `groupArrayInsertAt` function:

### groupArrayInsertAtIf
Inserts elements at specified positions only for rows that match the given condition.

### groupArrayInsertAtArray
Inserts array elements at specified positions in the target array.

### groupArrayInsertAtMap
Performs array insertions for each key in the map separately.

### groupArrayInsertAtSimpleState
Returns the array with insertions with SimpleAggregateFunction type.

### groupArrayInsertAtState
Returns the intermediate state of array insertion calculation.

### groupArrayInsertAtMerge
Combines intermediate states to get the final array with insertions.

### groupArrayInsertAtMergeState
Combines intermediate states but returns an intermediate state.

### groupArrayInsertAtForEach
Performs insertions for corresponding elements in multiple arrays.

### groupArrayInsertAtDistinct
Performs insertions using distinct values only.

### groupArrayInsertAtOrDefault
Returns an empty array if there are no rows.

### groupArrayInsertAtOrNull
Returns NULL if there are no rows. 