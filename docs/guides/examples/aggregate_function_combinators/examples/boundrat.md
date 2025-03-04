# boundRat Combinator Examples

The following combinators can be applied to the `boundRat` function:

### boundRatIf
Calculates bounded rational approximation only for rows that match the given condition.

### boundRatArray
Calculates bounded rational approximation from elements in the array.

### boundRatMap
Calculates bounded rational approximation for each key in the map separately.

### boundRatSimpleState
Returns the bounded rational state with SimpleAggregateFunction type.

### boundRatState
Returns the intermediate state of bounded rational calculation.

### boundRatMerge
Combines intermediate states to get the final bounded rational approximation.

### boundRatMergeState
Combines intermediate states but returns an intermediate state.

### boundRatForEach
Calculates bounded rational approximation for corresponding elements in multiple arrays.

### boundRatDistinct
Calculates bounded rational approximation using distinct values only.

### boundRatOrDefault
Returns (0, 1) if there are no rows.

### boundRatOrNull
Returns NULL if there are no rows. 