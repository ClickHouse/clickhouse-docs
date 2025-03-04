# corrMatrix Combinator Examples

The following combinators can be applied to the `corrMatrix` function:

### corrMatrixIf
Calculates correlation matrix only for rows that match the given condition.

### corrMatrixArray
Calculates correlation matrix from elements in the array.

### corrMatrixMap
Calculates correlation matrix for each key in the map separately.

### corrMatrixSimpleState
Returns the correlation matrix state with SimpleAggregateFunction type.

### corrMatrixState
Returns the intermediate state of correlation matrix calculation.

### corrMatrixMerge
Combines intermediate states to get the final correlation matrix.

### corrMatrixMergeState
Combines intermediate states but returns an intermediate state.

### corrMatrixForEach
Calculates correlation matrix for corresponding elements in multiple arrays.

### corrMatrixDistinct
Calculates correlation matrix using distinct values only.

### corrMatrixOrDefault
Returns an identity matrix if there are no rows.

### corrMatrixOrNull
Returns NULL if there are no rows. 