---
'description': '此功能实现了随机线性回归。它支持学习率、L2 正则化系数、迷你批量大小的自定义参数，并具有几种更新权重的方法（Adam、简单 SGD、动量、Nesterov）。'
'sidebar_position': 192
'slug': '/sql-reference/aggregate-functions/reference/stochasticlinearregression'
'title': 'stochasticLinearRegression'
'doc_type': 'reference'
---


# stochasticLinearRegression {#agg_functions_stochasticlinearregression_parameters}

此函数实现了随机线性回归。它支持自定义参数，包括学习率、L2正则化系数、小批量大小，并具有几种更新权重的方法（[Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam)（默认使用）、[简单SGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent)、[动量法](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum)和[Nesterov](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf)）。

### 参数 {#parameters}

共有4个可自定义参数。它们顺序传递给函数，但不必传递全部四个——将使用默认值，然而要获得良好的模型需要对某些参数进行调整。

```text
stochasticLinearRegression(0.00001, 0.1, 15, 'Adam')
```

1.  `学习率` 是梯度下降步骤执行时的步长系数。过大的学习率可能导致模型权重无限大。默认值为 `0.00001`。
2.  `L2正则化系数` 这有助于防止过拟合。默认值为 `0.1`。
3.  `小批量大小` 设置计算和累加梯度以执行一次梯度下降的元素数量。纯随机下降使用一个元素，但是，使用小批量（约10个元素）使梯度步骤更加稳定。默认值为 `15`。
4.  `更新权重的方法`，包括：`Adam`（默认）、`SGD`、`动量法` 和 `Nesterov`。`动量法` 和 `Nesterov` 需要更多的计算和内存，但在收敛速度和随机梯度方法的稳定性方面是有用的。

### 使用方法 {#usage}

`stochasticLinearRegression` 分两个步骤使用：拟合模型和在新数据上进行预测。为了拟合模型并保存其状态以供后续使用，我们使用 `-State` 组合器，它保存状态（例如模型权重）。
进行预测时，我们使用函数 [evalMLMethod](/sql-reference/functions/machine-learning-functions#evalmlmethod)，它将状态作为参数，并包含要预测的特征。

<a name="stochasticlinearregression-usage-fitting"></a>

**1.** 拟合

可以使用如下查询。

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

在这里，我们还需要将数据插入 `train_data` 表中。参数的数量不是固定的，仅取决于传递给 `linearRegressionState` 的参数数量。它们都必须是数值型。
请注意，目标值所在的列（我们希望学习预测的值）作为第一个参数插入。

**2.** 预测

在将状态保存到表中后，我们可以多次使用它进行预测，甚至可以与其他状态合并并创建新的、更好的模型。

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

该查询将返回预测值列。请注意，`evalMLMethod` 的第一个参数是 `AggregateFunctionState` 对象，后面是特征的列。

`test_data` 是一个与 `train_data` 类似的表，但可能不包含目标值。

### 备注 {#notes}

1.  要合并两个模型，用户可以创建如下查询：
    `sql  SELECT state1 + state2 FROM your_models`
    其中 `your_models` 表包含两个模型。该查询将返回新的 `AggregateFunctionState` 对象。

2.  用户可以在不使用 `-State` 组合器的情况下提取创建模型的权重，以供其自身目的。
    `sql  SELECT stochasticLinearRegression(0.01)(target, param1, param2) FROM train_data`
    这样的查询将拟合模型并返回其权重——首先是对应于模型参数的权重，最后一个是偏差。因此在上面的示例中，查询将返回一个包含3个值的列。

**另见**

- [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [线性回归与逻辑回归之间的区别](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
