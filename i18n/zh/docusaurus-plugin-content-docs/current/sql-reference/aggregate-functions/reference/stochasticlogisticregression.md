---
'description': '这个函数实现了随机逻辑回归。它可以用于二元分类问题，支持与 stochasticLinearRegression 相同的自定义参数，并以相同的方式工作。'
'sidebar_position': 193
'slug': '/sql-reference/aggregate-functions/reference/stochasticlogisticregression'
'title': 'stochasticLogisticRegression'
'doc_type': 'reference'
---


# stochasticLogisticRegression

此函数实现了随机逻辑回归。它可用于二分类问题，支持与stochasticLinearRegression相同的自定义参数，并以相同的方式工作。

### 参数 {#parameters}

参数与stochasticLinearRegression中的完全相同：
`学习率`，`l2正则化系数`，`小批量大小`，`更新权重的方法`。
有关更多信息，请参见 [参数](../reference/stochasticlinearregression.md/#parameters)。

```text
stochasticLogisticRegression(1.0, 1.0, 10, 'SGD')
```

**1.** 拟合

<!-- -->

    请参见 [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) 描述中的 `Fitting` 部分。

    预测标签必须在 \[-1, 1\] 之间。

**2.** 预测

<!-- -->

    使用保存的状态，我们可以预测对象具有标签 `1` 的概率。

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

    查询将返回一个概率列。注意，`evalMLMethod` 的第一个参数是 `AggregateFunctionState` 对象，下一个是特征的列。

    我们还可以设置概率界限，这将把元素分配给不同的标签。

```sql
SELECT ans < 1.1 AND ans > 0.5 FROM
(WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) AS ans FROM test_data)
```

    然后结果将是标签。

    `test_data` 是一个类似于 `train_data` 的表，但可能不包含目标值。

**另见**

- [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [线性回归与逻辑回归之间的区别。](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
