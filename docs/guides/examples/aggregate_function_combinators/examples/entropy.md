# entropy Combinator Examples

The following combinators can be applied to the `entropy` function:

### entropyIf
Calculates information entropy only for rows that match the given condition.

### entropyArray
Calculates information entropy from elements in the array.

### entropyMap
Calculates information entropy for each key in the map separately.

### entropySimpleState
Returns the entropy state with SimpleAggregateFunction type.

### entropyState
Returns the intermediate state of entropy calculation.

### entropyMerge
Combines intermediate states to get the final entropy value.

### entropyMergeState
Combines intermediate states but returns an intermediate state.

### entropyForEach
Calculates information entropy for corresponding elements in multiple arrays.

### entropyDistinct
Calculates information entropy using distinct values only.

### entropyOrDefault
Returns 0 if there are no rows.

### entropyOrNull
Returns NULL if there are no rows. 