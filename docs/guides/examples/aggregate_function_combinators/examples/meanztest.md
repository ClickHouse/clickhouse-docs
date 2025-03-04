# meanZTest Combinator Examples

The following combinators can be applied to the `meanZTest` function:

### meanZTestIf
Performs Z-test for mean only for rows that match the given condition.

### meanZTestArray
Performs Z-test for mean on elements in the array.

### meanZTestMap
Performs Z-test for mean for each key in the map separately.

### meanZTestSimpleState
Returns the Z-test state with SimpleAggregateFunction type.

### meanZTestState
Returns the intermediate state of Z-test calculation.

### meanZTestMerge
Combines intermediate states to get the final Z-test results.

### meanZTestMergeState
Combines intermediate states but returns an intermediate state.

### meanZTestForEach
Performs Z-test for mean for corresponding elements in multiple arrays.

### meanZTestDistinct
Performs Z-test for mean using distinct values only.

### meanZTestOrDefault
Returns (0, 1) if there are no rows.

### meanZTestOrNull
Returns NULL if there are no rows. 