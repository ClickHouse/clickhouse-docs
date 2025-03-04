# covarSamp Combinator Examples

The following combinators can be applied to the `covarSamp` function:

### covarSampIf
Calculates sample covariance only for rows that match the given condition.

### covarSampArray
Calculates sample covariance between elements in two arrays.

### covarSampMap
Calculates sample covariance for each key in the map separately.

### covarSampSimpleState
Returns the covariance value with SimpleAggregateFunction type.

### covarSampState
Returns the intermediate state of covariance calculation.

### covarSampMerge
Combines intermediate states to get the final covariance.

### covarSampMergeState
Combines intermediate states but returns an intermediate state.

### covarSampForEach
Calculates sample covariance for corresponding elements in multiple arrays.

### covarSampDistinct
Calculates sample covariance using distinct value pairs only.

### covarSampOrDefault
Returns 0 if there are not enough rows to calculate covariance.

### covarSampOrNull
Returns NULL if there are not enough rows to calculate covariance. 