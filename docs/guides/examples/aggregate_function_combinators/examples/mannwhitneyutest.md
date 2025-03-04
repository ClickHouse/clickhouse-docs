# mannWhitneyUTest Combinator Examples

The following combinators can be applied to the `mannWhitneyUTest` function:

### mannWhitneyUTestIf
Performs Mann-Whitney U test only for rows that match the given condition.

### mannWhitneyUTestArray
Performs Mann-Whitney U test on elements in the array.

### mannWhitneyUTestMap
Performs Mann-Whitney U test for each key in the map separately.

### mannWhitneyUTestSimpleState
Returns the U test state with SimpleAggregateFunction type.

### mannWhitneyUTestState
Returns the intermediate state of U test calculation.

### mannWhitneyUTestMerge
Combines intermediate states to get the final U test results.

### mannWhitneyUTestMergeState
Combines intermediate states but returns an intermediate state.

### mannWhitneyUTestForEach
Performs Mann-Whitney U test for corresponding elements in multiple arrays.

### mannWhitneyUTestDistinct
Performs Mann-Whitney U test using distinct values only.

### mannWhitneyUTestOrDefault
Returns (0, 1) if there are no rows.

### mannWhitneyUTestOrNull
Returns NULL if there are no rows. 