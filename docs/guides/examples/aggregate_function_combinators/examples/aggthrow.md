# aggThrow Combinator Examples

The following combinators can be applied to the `aggThrow` function:

### aggThrowIf
Throws an exception with the specified probability only for rows that match the given condition.

### aggThrowArray
Throws an exception with the specified probability for elements in the array.

### aggThrowMap
Throws an exception with the specified probability for each key in the map separately.

### aggThrowSimpleState
Returns the throw state with SimpleAggregateFunction type.

### aggThrowState
Returns the intermediate state of throw probability calculation.

### aggThrowMerge
Combines intermediate states to determine if an exception should be thrown.

### aggThrowMergeState
Combines intermediate states but returns an intermediate state.

### aggThrowForEach
Throws an exception with the specified probability for corresponding elements in multiple arrays.

### aggThrowDistinct
Throws an exception with the specified probability using distinct values only.

### aggThrowOrDefault
Returns 0 if there are no rows.

### aggThrowOrNull
Returns NULL if there are no rows. 