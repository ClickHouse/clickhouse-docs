# simpleLinearRegression Combinator Examples

The following combinators can be applied to the `simpleLinearRegression` function:

### simpleLinearRegressionIf
Performs simple linear regression only for rows that match the given condition.

### simpleLinearRegressionArray
Performs simple linear regression on elements in the array.

### simpleLinearRegressionMap
Performs simple linear regression for each key in the map separately.

### simpleLinearRegressionSimpleState
Returns the regression state with SimpleAggregateFunction type.

### simpleLinearRegressionState
Returns the intermediate state of regression calculation.

### simpleLinearRegressionMerge
Combines intermediate states to get the final regression model.

### simpleLinearRegressionMergeState
Combines intermediate states but returns an intermediate state.

### simpleLinearRegressionForEach
Performs simple linear regression on corresponding elements in multiple arrays.

### simpleLinearRegressionDistinct
Performs simple linear regression using distinct values only.

### simpleLinearRegressionOrDefault
Returns default model parameters if there are no rows.

### simpleLinearRegressionOrNull
Returns NULL if there are no rows. 