---
description: '该函数实现了随机逻辑回归。它可用于二元分类问题，支持与 stochasticLinearRegression 相同的自定义参数，其工作方式也相同。'
sidebar_position: 193
slug: /sql-reference/aggregate-functions/reference/stochasticlogisticregression
title: 'stochasticLogisticRegression'
doc_type: 'reference'
---



# stochasticLogisticRegression

此函数实现随机逻辑回归。可用于二元分类问题,支持与 stochasticLinearRegression 相同的自定义参数,工作方式也相同。

### 参数 {#parameters}

参数与 stochasticLinearRegression 完全相同:
`learning rate`(学习率)、`l2 regularization coefficient`(L2 正则化系数)、`mini-batch size`(小批量大小)、`method for updating weights`(权重更新方法)。
更多信息请参阅 [parameters](../reference/stochasticlinearregression.md/#parameters)。

```text
stochasticLogisticRegression(1.0, 1.0, 10, 'SGD')
```

**1.** 拟合

<!-- -->

    请参阅 [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) 说明中的 `Fitting` 部分。

    预测标签必须在 \[-1, 1\] 范围内。

**2.** 预测

<!-- -->

    使用保存的状态,可以预测对象标签为 `1` 的概率。

    ```sql
    WITH (SELECT state FROM your_model) AS model SELECT
    evalMLMethod(model, param1, param2) FROM test_data
    ```

    该查询将返回一列概率值。注意 `evalMLMethod` 的第一个参数是 `AggregateFunctionState` 对象,后续参数为特征列。

    还可以设置概率阈值,将元素分配到不同的标签。

    ```sql
    SELECT ans < 1.1 AND ans > 0.5 FROM
    (WITH (SELECT state FROM your_model) AS model SELECT
    evalMLMethod(model, param1, param2) AS ans FROM test_data)
    ```

    这样结果将是标签。

    `test_data` 是一个类似 `train_data` 的表,但可能不包含目标值。

**另请参阅**

- [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [线性回归和逻辑回归的区别。](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
