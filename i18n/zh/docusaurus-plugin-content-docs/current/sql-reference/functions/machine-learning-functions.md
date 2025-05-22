---
'description': '机器学习函数文档'
'sidebar_label': '机器学习'
'sidebar_position': 115
'slug': '/sql-reference/functions/machine-learning-functions'
'title': '机器学习函数'
---


# 机器学习函数

## evalMLMethod {#evalmlmethod}

使用拟合回归模型进行预测使用 `evalMLMethod` 函数。请参阅 `linearRegression` 中的链接。

## stochasticLinearRegression {#stochasticlinearregression}

[stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) 聚合函数实现了使用线性模型和均方误差（MSE）损失函数的随机梯度下降法。使用 `evalMLMethod` 对新数据进行预测。

## stochasticLogisticRegression {#stochasticlogisticregression}

[stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression) 聚合函数实现了用于二元分类问题的随机梯度下降法。使用 `evalMLMethod` 对新数据进行预测。
