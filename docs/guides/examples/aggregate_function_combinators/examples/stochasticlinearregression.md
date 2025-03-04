# stochasticLinearRegression Combinator Examples

The following combinators can be applied to the `stochasticLinearRegression` function:

### stochasticLinearRegressionIf
Performs stochastic linear regression only for rows that match the given condition.

### stochasticLinearRegressionArray
Performs stochastic linear regression on elements in the array.

### stochasticLinearRegressionMap
Performs stochastic linear regression for each key in the map separately.

### stochasticLinearRegressionSimpleState
Returns the regression state with SimpleAggregateFunction type.

### stochasticLinearRegressionState
Returns the intermediate state of regression calculation.

### stochasticLinearRegressionMerge
Combines intermediate states to get the final regression model.

### stochasticLinearRegressionMergeState
Combines intermediate states but returns an intermediate state.

### stochasticLinearRegressionForEach
Performs stochastic linear regression on corresponding elements in multiple arrays.

### stochasticLinearRegressionDistinct
Performs stochastic linear regression using distinct values only.

### stochasticLinearRegressionOrDefault
Returns default model parameters if there are no rows.

### stochasticLinearRegressionOrNull
Returns NULL if there are no rows.