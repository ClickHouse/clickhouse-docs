# covarPop Combinator Examples

The following combinators can be applied to the `covarPop` function:

### covarPopIf
Calculates population covariance only for rows that match the given condition.

### covarPopArray
Calculates population covariance between elements in two arrays.

### covarPopMap
Calculates population covariance for each key in the map separately.

### covarPopSimpleState
Returns the covariance value with SimpleAggregateFunction type.

### covarPopState
Returns the intermediate state of covariance calculation.

### covarPopMerge
Combines intermediate states to get the final covariance.

### covarPopMergeState
Combines intermediate states but returns an intermediate state.

### covarPopForEach
Calculates population covariance for corresponding elements in multiple arrays.

### covarPopDistinct
Calculates population covariance using distinct value pairs only.

### covarPopOrDefault
Returns 0 if there are not enough rows to calculate covariance.

### covarPopOrNull
Returns NULL if there are not enough rows to calculate covariance. 