# stddevpop Combinator Examples

The following combinators can be applied to the `stddevpop` function:

### stddevpopIf
Calculates population standard deviation only for rows that match the given condition.

### stddevpopArray
Calculates population standard deviation of elements in the array.

### stddevpopMap
Calculates population standard deviation for each key in the map separately.

### stddevpopSimpleState
Returns the standard deviation value with SimpleAggregateFunction type.

### stddevpopState
Returns the intermediate state of standard deviation calculation.

### stddevpopMerge
Combines intermediate states to get the final standard deviation.

### stddevpopMergeState
Combines intermediate states but returns an intermediate state.

### stddevpopForEach
Calculates population standard deviation for corresponding elements in multiple arrays.

### stddevpopDistinct
Calculates population standard deviation of distinct values only.

### stddevpopOrDefault
Returns 0 if there are not enough rows to calculate standard deviation.

### stddevpopOrNull
Returns NULL if there are not enough rows to calculate standard deviation. 