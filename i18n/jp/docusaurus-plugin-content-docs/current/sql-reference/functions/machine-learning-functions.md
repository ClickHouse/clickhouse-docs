---
'description': '機械学習関数のドキュメント'
'sidebar_label': '機械学習'
'sidebar_position': 115
'slug': '/sql-reference/functions/machine-learning-functions'
'title': 'Machine Learning Functions'
---




# 機械学習関数

## evalMLMethod {#evalmlmethod}

適合した回帰モデルを使用した予測には `evalMLMethod` 関数を使用します。`linearRegression` のリンクを参照してください。

## stochasticLinearRegression {#stochasticlinearregression}

[stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) 集約関数は、線形モデルと MSE 損失関数を使用して確率的勾配降下法を実装します。新しいデータに対して予測を行うために `evalMLMethod` を使用します。

## stochasticLogisticRegression {#stochasticlogisticregression}

[stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression) 集約関数は、バイナリ分類問題に対して確率的勾配降下法を実装します。新しいデータに対して予測を行うために `evalMLMethod` を使用します。
