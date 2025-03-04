# analysisOfVariance Combinator Examples

The following combinators can be applied to the `analysisOfVariance` function:

### analysisOfVarianceIf
Performs analysis of variance only for rows that match the given condition.

### analysisOfVarianceArray
Performs analysis of variance on elements in the array.

### analysisOfVarianceMap
Performs analysis of variance for each key in the map separately.

### analysisOfVarianceSimpleState
Returns the ANOVA state with SimpleAggregateFunction type.

### analysisOfVarianceState
Returns the intermediate state of ANOVA calculation.

### analysisOfVarianceMerge
Combines intermediate states to get the final ANOVA results.

### analysisOfVarianceMergeState
Combines intermediate states but returns an intermediate state.

### analysisOfVarianceForEach
Performs analysis of variance on corresponding elements in multiple arrays.

### analysisOfVarianceDistinct
Performs analysis of variance using distinct values only.

### analysisOfVarianceOrDefault
Returns default ANOVA results if there are not enough rows.

### analysisOfVarianceOrNull
Returns NULL if there are not enough rows. 