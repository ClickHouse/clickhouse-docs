# welchTTest Combinator Examples

The following combinators can be applied to the `welchTTest` function:

### welchTTestIf
Applies Welch's t-test only to rows that match the given condition.

### welchTTestArray
Applies Welch's t-test to elements in arrays.

### welchTTestMap
Applies Welch's t-test for each key in the map separately.

### welchTTestSimpleState
Returns the test results with SimpleAggregateFunction type.

### welchTTestState
Returns the intermediate state of the test calculation.

### welchTTestMerge
Combines intermediate states to get the final test results.

### welchTTestMergeState
Combines intermediate states but returns an intermediate state.

### welchTTestForEach
Applies Welch's t-test to corresponding elements in multiple arrays.

### welchTTestDistinct
Applies Welch's t-test using distinct values only.

### welchTTestOrDefault
Returns (0, 1) if there are not enough samples for the test.

### welchTTestOrNull
Returns NULL if there are not enough samples for the test. 