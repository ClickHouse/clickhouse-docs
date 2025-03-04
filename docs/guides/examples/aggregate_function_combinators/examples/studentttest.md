# studentTTest Combinator Examples

The following combinators can be applied to the `studentTTest` function:

### studentTTestIf
Performs Student's t-test only for rows that match the given condition.

### studentTTestArray
Performs Student's t-test on elements in the array.

### studentTTestMap
Performs Student's t-test for each key in the map separately.

### studentTTestSimpleState
Returns the t-test state with SimpleAggregateFunction type.

### studentTTestState
Returns the intermediate state of t-test calculation.

### studentTTestMerge
Combines intermediate states to get the final t-test results.

### studentTTestMergeState
Combines intermediate states but returns an intermediate state.

### studentTTestForEach
Performs Student's t-test for corresponding elements in multiple arrays.

### studentTTestDistinct
Performs Student's t-test using distinct values only.

### studentTTestOrDefault
Returns (0, 0) if there are no rows.

### studentTTestOrNull
Returns NULL if there are no rows. 