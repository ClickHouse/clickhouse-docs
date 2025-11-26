---
description: '此函数实现了随机逻辑回归。可用于二分类问题，支持与 stochasticLinearRegression 相同的自定义参数，且工作方式相同。'
sidebar_position: 193
slug: /sql-reference/aggregate-functions/reference/stochasticlogisticregression
title: 'stochasticLogisticRegression'
doc_type: 'reference'
---



# stochasticLogisticRegression

该函数实现了随机逻辑回归，可用于二分类问题，支持与 stochasticLinearRegression 相同的自定义参数，工作方式也相同。

### 参数

参数与 stochasticLinearRegression 中的完全相同：
`learning rate`、`l2 regularization coefficient`、`mini-batch size`、`method for updating weights`。
有关更多信息，请参见 [参数](../reference/stochasticlinearregression.md/#parameters)。

```text
stochasticLogisticRegression(1.0, 1.0, 10, 'SGD')
```

**1.** 拟合

{/* */ }

请参阅 [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) 描述中的 `Fitting` 部分。

预测标签必须在区间 [-1, 1] 内。

**2.** 预测

{/* */ }

利用已保存的状态，我们可以预测某个对象被标记为 `1` 的概率。

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

该查询将返回一个概率列。注意，`evalMLMethod` 的第一个参数是 `AggregateFunctionState` 对象，后续参数为特征列。

我们还可以设置一个概率阈值，将元素分配到不同的标签中。

```sql
SELECT ans < 1.1 AND ans > 0.5 FROM
(WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) AS ans FROM test_data)
```

则输出为标签。

`test_data` 是一个与 `train_data` 类似的表，但可能不包含目标变量的取值。

**另请参阅**

* [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
* [线性回归和逻辑回归之间的区别](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
