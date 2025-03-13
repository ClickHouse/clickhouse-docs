---
slug: '/sql-reference/functions/machine-learning-functions'
sidebar_position: 115
sidebar_label: '机器学习'
---


# 机器学习函数

## evalMLMethod {#evalmlmethod}

使用拟合回归模型进行预测时使用 `evalMLMethod` 函数。有关详细信息，请参见 `linearRegression` 中的链接。

## stochasticLinearRegression {#stochasticlinearregression}

[stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) 聚合函数实现了使用线性模型和均方误差 (MSE) 损失函数的随机梯度下降方法。使用 `evalMLMethod` 对新数据进行预测。

## stochasticLogisticRegression {#stochasticlogisticregression}

[stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression) 聚合函数实现了用于二元分类问题的随机梯度下降方法。使用 `evalMLMethod` 对新数据进行预测。
