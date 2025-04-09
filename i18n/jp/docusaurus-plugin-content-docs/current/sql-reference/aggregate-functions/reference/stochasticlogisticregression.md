---
slug: '/sql-reference/aggregate-functions/reference/stochasticlogisticregression'
sidebar_position: 193
title: 'stochasticLogisticRegression'
description: 'この関数は確率的ロジスティック回帰を実装しています。二項分類問題に使用でき、stochasticLinearRegressionと同じカスタムパラメーターをサポートし、同様に機能します。'
---


# stochasticLogisticRegression

この関数は確率的ロジスティック回帰を実装しています。二項分類問題に使用でき、stochasticLinearRegressionと同じカスタムパラメーターをサポートし、同様に機能します。

### Parameters {#parameters}

パラメーターはstochasticLinearRegressionと全く同じです:
`learning rate`、`l2 regularization coefficient`、`mini-batch size`、`method for updating weights`。
詳細については[parameters](../reference/stochasticlinearregression.md/#parameters)を参照してください。

``` text
stochasticLogisticRegression(1.0, 1.0, 10, 'SGD')
```

**1.** Fitting

<!-- -->

    [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression)の説明にある`Fitting`セクションを参照してください。

    予測されたラベルは\[-1, 1\]の範囲でなければなりません。

**2.** Predicting

<!-- -->

    保存された状態を使用して、オブジェクトがラベル`1`を持つ確率を予測できます。

    ``` sql
    WITH (SELECT state FROM your_model) AS model SELECT
    evalMLMethod(model, param1, param2) FROM test_data
    ```

    このクエリは確率のカラムを返します。`evalMLMethod`の最初の引数は`AggregateFunctionState`オブジェクトであり、次は特徴量のカラムです。

    また、確率の境界を設定することもでき、要素を異なるラベルに割り当てます。

    ``` sql
    SELECT ans < 1.1 AND ans > 0.5 FROM
    (WITH (SELECT state FROM your_model) AS model SELECT
    evalMLMethod(model, param1, param2) AS ans FROM test_data)
    ```

    その結果がラベルになります。

    `test_data`は`train_data`に似たテーブルですが、ターゲット値を含まない場合があります。

**See Also**

- [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [線形回帰とロジスティック回帰の違いについて](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
