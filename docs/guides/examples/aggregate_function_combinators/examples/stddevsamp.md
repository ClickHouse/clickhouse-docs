# stddevSamp Combinator Examples

The following combinators can be applied to the `stddevSamp` function:

### stddevSampIf
Calculates sample standard deviation only for rows that match the given condition.

### stddevSampArray
Calculates sample standard deviation of elements in the array.

### stddevSampMap
Calculates sample standard deviation for each key in the map separately.

### stddevSampSimpleState
Returns the standard deviation value with SimpleAggregateFunction type.

### stddevSampState
Returns the intermediate state of standard deviation calculation.

### stddevSampMerge
Combines intermediate states to get the final standard deviation.

### stddevSampMergeState
Combines intermediate states but returns an intermediate state.

### stddevSampForEach
Calculates sample standard deviation for corresponding elements in multiple arrays.

### stddevSampDistinct
Calculates sample standard deviation using distinct values only.

### stddevSampOrDefault
Returns 0 if there are not enough rows to calculate standard deviation.

### stddevSampOrNull
Returns NULL if there are not enough rows to calculate standard deviation. 