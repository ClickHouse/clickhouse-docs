
# stochasticLinearRegression {#agg_functions_stochasticlinearregression_parameters}

此函数实现了随机线性回归。它支持自定义参数，包括学习率、L2正则化系数、小批量大小，并且有几种更新权重的方法（[Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam)（默认使用）、[simple SGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent)、[Momentum](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum)和[Nesterov](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf)）。

### 参数 {#parameters}

有4个可自定义的参数。它们按顺序传递给函数，但不需要传递所有四个 - 默认值将被使用，然而好的模型需要一些参数调优。

```text
stochasticLinearRegression(0.00001, 0.1, 15, 'Adam')
```

1.  `learning rate` 是进行梯度下降步骤时的步长系数。学习率过大会导致模型权重无限增长。默认值为 `0.00001`。
2.  `l2 regularization coefficient` 可帮助防止过拟合。默认值为 `0.1`。
3.  `mini-batch size` 设置用于计算梯度并叠加以执行一次梯度下降步骤的元素数量。纯随机下降使用一个元素，然而，拥有较小的批次（大约10个元素）使得梯度步骤更加稳定。默认值为 `15`。
4.  `method for updating weights`，可选为：`Adam`（默认），`SGD`，`Momentum`和`Nesterov`。`Momentum`和`Nesterov`需要更多的计算和内存，但在收敛速度和随机梯度方法的稳定性方面非常有用。

### 用法 {#usage}

`stochasticLinearRegression` 分为两个步骤使用：拟合模型和在新数据上进行预测。为了拟合模型并保存其状态以备后用，我们使用 `-State` 组合器，该组合器保存状态（例如，模型权重）。
要进行预测，我们使用函数 [evalMLMethod](/sql-reference/functions/machine-learning-functions#evalmlmethod)，它以状态作为参数，以及用于预测的特征。

<a name="stochasticlinearregression-usage-fitting"></a>

**1.** 拟合

可以使用这样一个查询。

```sql
CREATE TABLE IF NOT EXISTS train_data
(
    param1 Float64,
    param2 Float64,
    target Float64
) ENGINE = Memory;

CREATE TABLE your_model ENGINE = Memory AS SELECT
stochasticLinearRegressionState(0.1, 0.0, 5, 'SGD')(target, param1, param2)
AS state FROM train_data;
```

在这里，我们还需要向 `train_data` 表中插入数据。参数的数量不是固定的，只取决于传递给 `linearRegressionState` 的参数数量。它们必须都是数值。
请注意，目标值所在的列（我们希望学习预测的值）作为第一个参数插入。

**2.** 预测

在将状态保存到表中之后，我们可以多次使用该状态进行预测，甚至可以与其他状态合并，创建出新的、更好的模型。

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

该查询将返回一列预测值。请注意，`evalMLMethod` 的第一个参数是 `AggregateFunctionState` 对象，后面是特征列。

`test_data` 是一个与 `train_data` 类似的表，但可能不包含目标值。

### 注意事项 {#notes}

1.  要合并两个模型，用户可以创建这样的查询：
    `sql  SELECT state1 + state2 FROM your_models`
    其中 `your_models` 表包含两个模型。这个查询将返回新的 `AggregateFunctionState` 对象。

2.  用户可以在不使用 `-State` 组合器的情况下，获取创建模型的权重以供自己使用。
    `sql  SELECT stochasticLinearRegression(0.01)(target, param1, param2) FROM train_data`
    这样的查询将拟合模型并返回其权重 - 第一个是与模型参数对应的权重，最后一个是偏置。因此在上述示例中，查询将返回一列包含3个值。

**另请参见**

- [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [线性回归与逻辑回归之间的区别](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
