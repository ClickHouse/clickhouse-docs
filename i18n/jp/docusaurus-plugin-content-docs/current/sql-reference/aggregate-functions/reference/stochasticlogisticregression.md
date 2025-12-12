---
description: 'この関数は確率的ロジスティック回帰を実装します。二値分類タスクに使用でき、stochasticLinearRegression と同じカスタムパラメータをサポートし、同様に動作します。'
sidebar_position: 193
slug: /sql-reference/aggregate-functions/reference/stochasticlogisticregression
title: 'stochasticLogisticRegression'
doc_type: 'reference'
---

# stochasticLogisticRegression {#stochasticlogisticregression}

この関数は確率的ロジスティック回帰を実装します。二値分類問題に使用でき、stochasticLinearRegression と同じカスタムパラメータをサポートし、動作も同様です。

### Parameters {#parameters}

パラメータは stochasticLinearRegression とまったく同じです:
`learning rate`、`l2 regularization coefficient`、`mini-batch size`、`method for updating weights`。
詳細については [parameters](../reference/stochasticlinearregression.md/#parameters) を参照してください。

```text
stochasticLogisticRegression(1.0, 1.0, 10, 'SGD')
```

**1.** 適合

{/* */ }

[stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) の説明にある `Fitting` セクションを参照してください。

予測ラベルの値は [-1, 1] の範囲内である必要があります。

**2.** 予測

{/* */ }

保存済みの状態を使って、対象オブジェクトにラベル `1` が付与される確率を予測できます。

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

クエリは確率の列を返します。`evalMLMethod` の最初の引数は `AggregateFunctionState` オブジェクトであり、それ以降の引数には特徴量のカラムを指定します。

また、確率の閾値を設定して、要素を異なるラベルに割り当てることもできます。

```sql
SELECT ans < 1.1 AND ans > 0.5 FROM
(WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) AS ans FROM test_data)
```

その結果はラベルとして出力されます。

`test_data` は `train_data` と同様のテーブルですが、目的変数の値を含まない場合があります。

**関連項目**

* [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
* [線形回帰とロジスティック回帰の違い](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
