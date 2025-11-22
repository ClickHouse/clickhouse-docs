---
description: '此函数实现了随机线性回归。它支持自定义学习率、L2 正则化系数、小批量规模等参数，并提供多种用于更新权重的方法（Adam、简单 SGD、Momentum、Nesterov）。'
sidebar_position: 192
slug: /sql-reference/aggregate-functions/reference/stochasticlinearregression
title: 'stochasticLinearRegression'
doc_type: 'reference'
---



# stochasticLinearRegression {#agg_functions_stochasticlinearregression_parameters}

此函数实现随机线性回归。它支持学习率、L2 正则化系数、小批量大小的自定义参数,并提供几种权重更新方法([Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam)(默认使用)、[简单 SGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent)、[Momentum](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum) 和 [Nesterov](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf))。

### 参数 {#parameters}

共有 4 个可自定义的参数。它们按顺序传递给函数,但不需要传递全部四个参数 - 将使用默认值,但良好的模型需要进行一些参数调优。

```text
stochasticLinearRegression(0.00001, 0.1, 15, 'Adam')
```

1.  `learning rate` 是执行梯度下降步骤时的步长系数。学习率过大可能导致模型权重无限增长。默认值为 `0.00001`。
2.  `l2 regularization coefficient` 可以帮助防止过拟合。默认值为 `0.1`。
3.  `mini-batch size` 设置元素数量,将计算这些元素的梯度并求和以执行一步梯度下降。纯随机下降使用单个元素,但使用小批量(约 10 个元素)可以使梯度步骤更加稳定。默认值为 `15`。
4.  `method for updating weights` 权重更新方法,包括:`Adam`(默认)、`SGD`、`Momentum` 和 `Nesterov`。`Momentum` 和 `Nesterov` 需要更多的计算和内存,但在随机梯度方法的收敛速度和稳定性方面表现出色。

### 用法 {#usage}

`stochasticLinearRegression` 分两步使用:拟合模型和对新数据进行预测。为了拟合模型并保存其状态以供后续使用,我们使用 `-State` 组合器来保存状态(例如模型权重)。
为了进行预测,我们使用函数 [evalMLMethod](/sql-reference/functions/machine-learning-functions#evalmlmethod),它将状态作为参数以及用于预测的特征。

<a name='stochasticlinearregression-usage-fitting'></a>

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

在这里,我们还需要将数据插入到 `train_data` 表中。参数数量不是固定的,它仅取决于传递给 `linearRegressionState` 的参数数量。它们都必须是数值。
请注意,包含目标值(我们想要学习预测的值)的列作为第一个参数插入。

**2.** 预测

将状态保存到表中后,我们可以多次使用它进行预测,甚至可以与其他状态合并并创建新的、更优的模型。

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

该查询将返回一列预测值。请注意,`evalMLMethod` 的第一个参数是 `AggregateFunctionState` 对象,接下来是特征列。

`test_data` 是一个类似于 `train_data` 的表,但可能不包含目标值。

### 注意事项 {#notes}

1.  要合并两个模型,用户可以创建如下查询:
    `sql  SELECT state1 + state2 FROM your_models`
    其中 `your_models` 表包含两个模型。此查询将返回新的 `AggregateFunctionState` 对象。

2.  如果不使用 `-State` 组合器,用户可以获取已创建模型的权重以供自己使用,而无需保存模型。
    `sql  SELECT stochasticLinearRegression(0.01)(target, param1, param2) FROM train_data`
    此类查询将拟合模型并返回其权重 - 首先是对应于模型参数的权重,最后一个是偏置。因此在上面的示例中,查询将返回包含 3 个值的列。

**另请参阅**


- [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [线性回归与逻辑回归之间的区别](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
