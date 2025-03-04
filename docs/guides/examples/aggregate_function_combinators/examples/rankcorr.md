# rankCorr Combinator Examples

The following combinators can be applied to the `rankCorr` function:

### rankCorrIf
Calculates Spearman's rank correlation coefficient only for rows that match the given condition.

### rankCorrArray
Calculates Spearman's rank correlation coefficient from elements in the array.

### rankCorrMap
Calculates Spearman's rank correlation coefficient for each key in the map separately.

### rankCorrSimpleState
Returns the rank correlation state with SimpleAggregateFunction type.

### rankCorrState
Returns the intermediate state of rank correlation calculation.

### rankCorrMerge
Combines intermediate states to get the final rank correlation coefficient.

### rankCorrMergeState
Combines intermediate states but returns an intermediate state.

### rankCorrForEach
Calculates Spearman's rank correlation coefficient for corresponding elements in multiple arrays.

### rankCorrDistinct
Calculates Spearman's rank correlation coefficient using distinct values only.

### rankCorrOrDefault
Returns 0 if there are no rows.

### rankCorrOrNull
Returns NULL if there are no rows. 