# theilsU Combinator Examples

The following combinators can be applied to the `theilsU` function:

### theilsUIf
Calculates Theil's U statistic only for rows that match the given condition.

### theilsUArray
Calculates Theil's U statistic between elements in two arrays.

### theilsUMap
Calculates Theil's U statistic for each key in the map separately.

### theilsUSimpleState
Returns the Theil's U value with SimpleAggregateFunction type.

### theilsUState
Returns the intermediate state of Theil's U calculation.

### theilsUMerge
Combines intermediate states to get the final Theil's U value.

### theilsUMergeState
Combines intermediate states but returns an intermediate state.

### theilsUForEach
Calculates Theil's U statistic for corresponding elements in multiple arrays.

### theilsUDistinct
Calculates Theil's U statistic using distinct value pairs only.

### theilsUOrDefault
Returns 0 if there are not enough rows to calculate Theil's U.

### theilsUOrNull
Returns NULL if there are not enough rows to calculate Theil's U. 