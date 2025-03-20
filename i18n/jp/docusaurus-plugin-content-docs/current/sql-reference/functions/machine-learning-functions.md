---
slug: '/sql-reference/functions/machine-learning-functions'
sidebar_position: 115
sidebar_label: '機械学習'
---


# 機械学習関数

## evalMLMethod {#evalmlmethod}

フィッティングされた回帰モデルを使用した予測には、`evalMLMethod` 関数を使用します。`linearRegression` のリンクを参照してください。

## stochasticLinearRegression {#stochasticlinearregression}

[stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) 集約関数は、線形モデルとMSE損失関数を使用して確率的勾配降下法を実装します。新しいデータに対して予測するために `evalMLMethod` を使用します。

## stochasticLogisticRegression {#stochasticlogisticregression}

[stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression) 集約関数は、バイナリ分類問題のための確率的勾配降下法を実装します。新しいデータに対して予測するために `evalMLMethod` を使用します。
