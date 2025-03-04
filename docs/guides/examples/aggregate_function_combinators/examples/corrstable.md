# corrStable Combinator Examples

The following combinators can be applied to the `corrStable` function:

### corrStableIf
Calculates stable correlation coefficient only for rows that match the given condition.

### corrStableArray
Calculates stable correlation coefficient from elements in the array.

### corrStableMap
Calculates stable correlation coefficient for each key in the map separately.

### corrStableSimpleState
Returns the stable correlation state with SimpleAggregateFunction type.

### corrStableState
Returns the intermediate state of stable correlation calculation.

### corrStableMerge
Combines intermediate states to get the final stable correlation coefficient.

### corrStableMergeState
Combines intermediate states but returns an intermediate state.

### corrStableForEach
Calculates stable correlation coefficient for corresponding elements in multiple arrays.

### corrStableDistinct
Calculates stable correlation coefficient using distinct values only.

### corrStableOrDefault
Returns 0 if there are no rows.

### corrStableOrNull
Returns NULL if there are no rows. 