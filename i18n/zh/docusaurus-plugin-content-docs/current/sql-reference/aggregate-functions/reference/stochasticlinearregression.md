---
'description': '该函数实现了随机线性回归。它支持学习速率、L2正则化系数、小批量大小的自定义参数，并具有几种用于更新权重的方法（Adam、简单SGD、动量、Nesterov等）。'
'sidebar_position': 192
'slug': '/sql-reference/aggregate-functions/reference/stochasticlinearregression'
'title': '随机线性回归'
---




# stochasticLinearRegression {#agg_functions_stochasticlinearregression_parameters}

这个函数实现了随机线性回归。它支持自定义参数，包括学习率、L2 正则化系数、迷你批处理大小，并且有几种用于更新权重的方法（[Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam)（默认使用）、[简单 SGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent)、[动量法](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum)和[Nesterov](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf)）。

### 参数 {#parameters}

有 4 个可自定义的参数。它们按顺序传递给函数，但不需要传递全部四个 - 将使用默认值，不过好的模型需要一些参数调整。

```text
stochasticLinearRegression(0.00001, 0.1, 15, 'Adam')
```

1.  `learning rate` 是执行梯度下降步骤时的步长系数。学习率过大可能导致模型的权重无限。默认值为 `0.00001`。
2.  `l2 regularization coefficient` 可以帮助防止过拟合。默认值为 `0.1`。
3.  `mini-batch size` 设置计算和汇总梯度以执行一次梯度下降步骤的元素数量。纯粹的随机下降使用一个元素，然而，使用较小的批量（大约 10 个元素）可以使梯度步骤更加稳定。默认值为 `15`。
4.  `method for updating weights`，它们是：`Adam`（默认）、`SGD`、`Momentum` 和 `Nesterov`。`Momentum` 和 `Nesterov`需要更多的计算和内存，但在收敛速度和随机梯度方法的稳定性方面它们确实有用。

### 用法 {#usage}

`stochasticLinearRegression` 分为两个步骤使用：拟合模型和对新数据进行预测。为了拟合模型并为后续使用保存其状态，我们使用 `-State` 组合器，这会保存模型的状态（例如，模型权重）。
进行预测时，我们使用函数 [evalMLMethod](/sql-reference/functions/machine-learning-functions#evalmlmethod)，它接受一个状态作为参数以及用于预测的特征。

<a name="stochasticlinearregression-usage-fitting"></a>

**1.** 拟合

可以使用这样的查询。

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

在这里，我们还需要将数据插入到 `train_data` 表中。参数的数量不是固定的，它仅取决于传递给 `linearRegressionState` 的参数数量。所有参数都必须是数值类型。
请注意，目标值的列（我们希望学习预测的值）作为第一个参数插入。

**2.** 预测

在将状态保存到表中后，我们可以多次使用它进行预测，甚至与其他状态合并并创建新的、更好的模型。

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

该查询将返回一个预测值的列。请注意，`evalMLMethod` 的第一个参数是 `AggregateFunctionState` 对象，接下来的参数是特征的列。

`test_data` 是一个类似于 `train_data` 的表，但可能不包含目标值。

### 备注 {#notes}

1.  要合并两个模型，用户可以创建这样的查询：
    `sql  SELECT state1 + state2 FROM your_models`
    其中 `your_models` 表包含两个模型。该查询将返回新的 `AggregateFunctionState` 对象。

2.  用户可以在不使用 `-State` 组合器的情况下获取所创建模型的权重，以供其自身目的使用。
    `sql  SELECT stochasticLinearRegression(0.01)(target, param1, param2) FROM train_data`
    这样的查询将拟合模型并返回其权重 - 首先是与模型参数对应的权重，最后一个是偏差。因此，在上述示例中，查询将返回一列 3 个值。

**另请参阅**

- [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [线性回归与逻辑回归之间的区别](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
