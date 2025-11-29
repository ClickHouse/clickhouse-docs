---
description: '此函数实现随机线性回归。它支持自定义学习率、L2 正则化系数和小批量大小等参数，并提供多种用于更新权重的方法（Adam、简单 SGD、Momentum、Nesterov）。'
sidebar_position: 192
slug: /sql-reference/aggregate-functions/reference/stochasticlinearregression
title: 'stochasticLinearRegression'
doc_type: 'reference'
---

# stochasticLinearRegression {#agg&#95;functions&#95;stochasticlinearregression&#95;parameters}

此函数实现随机线性回归。它支持自定义学习率、L2 正则化系数、mini-batch 大小等参数，并提供多种权重更新方法（[Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam)（默认）、[simple SGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent)、[Momentum](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum) 和 [Nesterov](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf)）。

### Parameters {#parameters}

有 4 个可自定义参数。它们按顺序传递给函数，但不必传入全部四个参数；未显式传入的将使用默认值。不过，要获得较好的模型效果，通常需要对这些参数进行调优。

```text
stochasticLinearRegression(0.00001, 0.1, 15, 'Adam')
```

1. `learning rate` 是在执行梯度下降步骤时的步长系数。过大的 learning rate 可能导致模型权重发散为无穷大。默认值为 `0.00001`。
2. `l2 regularization coefficient`（L2 正则化系数），可以帮助防止过拟合。默认值为 `0.1`。
3. `mini-batch size` 用于设置在执行一次梯度下降步骤时，要对多少个元素计算梯度并求和。纯随机梯度下降只使用一个元素，但使用较小的 batch（约 10 个元素）可以使梯度更新更加稳定。默认值为 `15`。
4. `method for updating weights`（用于更新权重的方法），包括：`Adam`（默认）、`SGD`、`Momentum` 和 `Nesterov`。`Momentum` 和 `Nesterov` 需要稍多的计算和内存，但在随机梯度方法的收敛速度和稳定性方面通常更有优势。

### 用法 {#usage}

`stochasticLinearRegression` 的使用包含两个步骤：拟合模型以及在新数据上进行预测。为了拟合模型并保存其状态以供后续使用，我们使用 `-State` 组合器，它会保存状态（例如模型权重）。
为了进行预测，我们使用函数 [evalMLMethod](/sql-reference/functions/machine-learning-functions#evalmlmethod)，该函数以状态作为参数，并接收用于预测的特征。

<a name="stochasticlinearregression-usage-fitting" />

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

在这里，我们还需要向 `train_data` 表中插入数据。参数的数量不是固定的，只取决于传入 `linearRegressionState` 的参数个数。所有参数的值都必须是数值类型。
请注意，包含目标值（即我们希望学习预测的值）的列应作为第一个参数传入。

**2.** 预测

在将状态保存到表中之后，我们可以多次使用该状态进行预测，甚至可以将其与其他状态合并，以创建新的、更优的模型。

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

该查询将返回一列预测值。请注意，`evalMLMethod` 的第一个参数是 `AggregateFunctionState` 对象，后面的参数是特征列。

`test_data` 是一个与 `train_data` 类似的表，但可能不包含目标值。

### 注意事项 {#notes}

1. 为了合并两个模型，用户可以创建如下查询：
   `sql  SELECT state1 + state2 FROM your_models`
   其中 `your_models` 表同时包含这两个模型。该查询将返回一个新的 `AggregateFunctionState` 对象。

2. 如果未使用 `-State` 组合器，用户可以在不保存模型的情况下，根据需要获取已创建模型的权重。
   `sql  SELECT stochasticLinearRegression(0.01)(target, param1, param2) FROM train_data`
   此类查询会拟合模型并返回其权重——前几个值是对应模型参数的权重，最后一个是偏置项。因此，在上面的示例中，该查询将返回一列包含 3 个值。

**另请参阅**

* [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
* [线性回归与逻辑回归的区别](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
