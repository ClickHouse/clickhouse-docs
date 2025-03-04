# kolmogorovSmirnovTest Combinator Examples

The following combinators can be applied to the `kolmogorovSmirnovTest` function:

### kolmogorovSmirnovTestIf
Performs Kolmogorov-Smirnov test only for rows that match the given condition.

### kolmogorovSmirnovTestArray
Performs Kolmogorov-Smirnov test on elements in the array.

### kolmogorovSmirnovTestMap
Performs Kolmogorov-Smirnov test for each key in the map separately.

### kolmogorovSmirnovTestSimpleState
Returns the K-S test state with SimpleAggregateFunction type.

### kolmogorovSmirnovTestState
Returns the intermediate state of K-S test calculation.

### kolmogorovSmirnovTestMerge
Combines intermediate states to get the final K-S test results.

### kolmogorovSmirnovTestMergeState
Combines intermediate states but returns an intermediate state.

### kolmogorovSmirnovTestForEach
Performs Kolmogorov-Smirnov test for corresponding elements in multiple arrays.

### kolmogorovSmirnovTestDistinct
Performs Kolmogorov-Smirnov test using distinct values only.

### kolmogorovSmirnovTestOrDefault
Returns (0, 1) if there are no rows.

### kolmogorovSmirnovTestOrNull
Returns NULL if there are no rows. 