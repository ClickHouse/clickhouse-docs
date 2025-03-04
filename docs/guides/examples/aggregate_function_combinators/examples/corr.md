# corr Combinator Examples

The following combinators can be applied to the `corr` function:

### corrIf
Calculates Pearson correlation coefficient only for rows that match the given condition.

### corrArray
Calculates Pearson correlation coefficient from elements in the array.

### corrMap
Calculates Pearson correlation coefficient for each key in the map separately.

### corrSimpleState
Returns the correlation state with SimpleAggregateFunction type.

### corrState
Returns the intermediate state of correlation calculation.

### corrMerge
Combines intermediate states to get the final correlation coefficient.

### corrMergeState
Combines intermediate states but returns an intermediate state.

### corrForEach
Calculates Pearson correlation coefficient for corresponding elements in multiple arrays.

### corrDistinct
Calculates Pearson correlation coefficient using distinct values only.

### corrOrDefault
Returns 0 if there are no rows.

### corrOrNull
Returns NULL if there are no rows.

Note: These combinators can also be applied to the corrStable function with the same behavior but using the numerically stable algorithm. 