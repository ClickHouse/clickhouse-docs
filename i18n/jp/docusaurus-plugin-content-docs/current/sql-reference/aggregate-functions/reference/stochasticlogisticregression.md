---
description: 'この関数は確率的ロジスティック回帰を実装します。二値分類問題に使用でき、stochasticLinearRegression と同様のカスタムパラメータをサポートし、同様に動作します。'
sidebar_position: 193
slug: /sql-reference/aggregate-functions/reference/stochasticlogisticregression
title: 'stochasticLogisticRegression'
doc_type: 'reference'
---



# stochasticLogisticRegression

この関数は確率的ロジスティック回帰を実装します。二値分類問題に使用でき、stochasticLinearRegressionと同じカスタムパラメータをサポートし、同様に動作します。

### パラメータ {#parameters}

パラメータはstochasticLinearRegressionと全く同じです：
`学習率`、`l2正則化係数`、`ミニバッチサイズ`、`重み更新手法`。
詳細については[パラメータ](../reference/stochasticlinearregression.md/#parameters)を参照してください。

```text
stochasticLogisticRegression(1.0, 1.0, 10, 'SGD')
```

**1.** フィッティング

<!-- -->

    [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression)の説明にある`フィッティング`セクションを参照してください。

    予測ラベルは\[-1, 1\]の範囲内である必要があります。

**2.** 予測

<!-- -->

    保存された状態を使用して、オブジェクトがラベル`1`を持つ確率を予測できます。

    ```sql
    WITH (SELECT state FROM your_model) AS model SELECT
    evalMLMethod(model, param1, param2) FROM test_data
    ```

    このクエリは確率の列を返します。`evalMLMethod`の最初の引数は`AggregateFunctionState`オブジェクトであり、次に特徴量の列が続くことに注意してください。

    また、確率の閾値を設定して、要素を異なるラベルに割り当てることもできます。

    ```sql
    SELECT ans < 1.1 AND ans > 0.5 FROM
    (WITH (SELECT state FROM your_model) AS model SELECT
    evalMLMethod(model, param1, param2) AS ans FROM test_data)
    ```

    この場合、結果はラベルになります。

    `test_data`は`train_data`と同様のテーブルですが、目的変数を含まない場合があります。

**関連項目**

- [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [線形回帰とロジスティック回帰の違い](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
