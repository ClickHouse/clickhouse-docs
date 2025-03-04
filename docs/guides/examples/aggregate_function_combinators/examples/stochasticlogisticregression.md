# stochasticLogisticRegression Combinator Examples

The following combinators can be applied to the `stochasticLogisticRegression` function:

### stochasticLogisticRegressionIf
Performs stochastic logistic regression only for rows that match the given condition.

### stochasticLogisticRegressionArray
Performs stochastic logistic regression on elements in the array.

### stochasticLogisticRegressionMap
Performs stochastic logistic regression for each key in the map separately.

### stochasticLogisticRegressionSimpleState
Returns the regression state with SimpleAggregateFunction type.

### stochasticLogisticRegressionState
Returns the intermediate state of regression calculation.

### stochasticLogisticRegressionMerge
Combines intermediate states to get the final regression model.

### stochasticLogisticRegressionMergeState
Combines intermediate states but returns an intermediate state.

### stochasticLogisticRegressionForEach
Performs stochastic logistic regression on corresponding elements in multiple arrays.

### stochasticLogisticRegressionDistinct
Performs stochastic logistic regression using distinct values only.

### stochasticLogisticRegressionOrDefault
Returns default model parameters if there are no rows.

### stochasticLogisticRegressionOrNull
Returns NULL if there are no rows. 