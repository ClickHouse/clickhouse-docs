---
'description': '这个函数实现了随机线性回归。它支持学习率、L2 正则化系数、迷你批量大小的自定义参数，并具有几种更新权重的方法（Adam、简单 SGD、动量、Nesterov）。'
'sidebar_position': 192
'slug': '/sql-reference/aggregate-functions/reference/stochasticlinearregression'
'title': '随机线性回归'
---


# stochasticLinearRegression {#agg_functions_stochasticlinearregression_parameters}

此函数实现了随机线性回归。它支持自定义参数，包括学习率、L2 正则化系数、迷你批量大小，并且具有几种更新权重的方法（[Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam)（默认使用）、[简单 SGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent)、[动量法](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum)和[Nesterov](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf)）。

### 参数 {#parameters}

有 4 个可自定义的参数。它们是按顺序传递给函数的，但并不需要传递所有四个 - 默认值将被使用，然而良好的模型需要一些参数调整。

```text
stochasticLinearRegression(0.00001, 0.1, 15, 'Adam')
```

1.  `学习率` 是梯度下降步骤执行时步长的系数。过大的学习率可能导致模型的权重无限大。默认值是 `0.00001`。
2.  `l2 正则化系数` 可以帮助防止过拟合。默认值是 `0.1`。
3.  `迷你批量大小` 设置计算和汇总梯度以执行一步梯度下降的元素数量。纯随机下降使用一个元素，然而，使用小批量（大约 10 个元素）可以使梯度步骤更稳定。默认值是 `15`。
4.  `更新权重的方法`，有：`Adam`（默认）、`SGD`、`Momentum` 和 `Nesterov`。`Momentum` 和 `Nesterov` 需要更多的计算和内存，但在收敛速度和随机梯度方法的稳定性方面非常有用。

### 使用 {#usage}

`stochasticLinearRegression` 分为两个步骤使用：拟合模型和预测新数据。为了拟合模型并保存其状态以供后续使用，我们使用 `-State` 组合器，它保存状态（例如模型权重）。
要进行预测，我们使用函数 [evalMLMethod](/sql-reference/functions/machine-learning-functions#evalmlmethod)，它将状态作为参数以及要进行预测的特征。

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

在这里，我们还需要将数据插入 `train_data` 表中。参数的数量不是固定的，仅取决于传递给 `linearRegressionState` 的参数数量。它们必须都是数字值。
请注意，目标值的列（我们希望学习预测的值）作为第一个参数插入。

**2.** 预测

在将状态保存到表中之后，我们可以多次使用它进行预测，甚至与其他状态合并并创建新模型，甚至更好的模型。

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

该查询将返回一个预测值的列。请注意，`evalMLMethod` 的第一个参数是 `AggregateFunctionState` 对象，接下来的参数是特征列。

`test_data` 是像 `train_data` 的表，但可能不包含目标值。

### 注意 {#notes}

1.  用户可以创建这样的查询来合并两个模型：
    `sql  SELECT state1 + state2 FROM your_models`
    其中 `your_models` 表包含两个模型。该查询将返回新的 `AggregateFunctionState` 对象。

2.  如果未使用 `-State` 组合器，用户可以在不保存模型的情况下获取创建模型的权重以供自身使用。
    `sql  SELECT stochasticLinearRegression(0.01)(target, param1, param2) FROM train_data`
    这样的查询将拟合模型并返回其权重 - 第一组是与模型参数对应的权重，最后一个是偏置。因此，上面的查询将返回一个包含 3 个值的列。

**另见**

- [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [线性回归与逻辑回归之间的区别](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
