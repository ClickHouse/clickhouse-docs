# cramersV Combinator Examples

The following combinators can be applied to the `cramersV` function:

### cramersVIf
Calculates Cramer's V statistic only for rows that match the given condition.

### cramersVArray
Calculates Cramer's V statistic from elements in the array.

### cramersVMap
Calculates Cramer's V statistic for each key in the map separately.

### cramersVSimpleState
Returns the Cramer's V state with SimpleAggregateFunction type.

### cramersVState
Returns the intermediate state of Cramer's V calculation.

### cramersVMerge
Combines intermediate states to get the final Cramer's V statistic.

### cramersVMergeState
Combines intermediate states but returns an intermediate state.

### cramersVForEach
Calculates Cramer's V statistic for corresponding elements in multiple arrays.

### cramersVDistinct
Calculates Cramer's V statistic using distinct values only.

### cramersVOrDefault
Returns 0 if there are no rows.

### cramersVOrNull
Returns NULL if there are no rows. 