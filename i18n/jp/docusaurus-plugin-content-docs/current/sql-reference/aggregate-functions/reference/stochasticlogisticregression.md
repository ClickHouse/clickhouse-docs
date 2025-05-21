---
description: 'この関数は確率的ロジスティック回帰を実装します。バイナリ分類問題に使用でき、確率的線形回帰（stochasticLinearRegression）と同じカスタムパラメータをサポートし、同様に機能します。'
sidebar_position: 193
slug: /sql-reference/aggregate-functions/reference/stochasticlogisticregression
title: 'stochasticLogisticRegression'
---


# stochasticLogisticRegression

この関数は確率的ロジスティック回帰を実装します。バイナリ分類問題に使用でき、確率的線形回帰（stochasticLinearRegression）と同じカスタムパラメータをサポートし、同様に機能します。

### パラメータ {#parameters}

パラメータは確率的線形回帰（stochasticLinearRegression）とまったく同じです：
`learning rate`、`l2 regularization coefficient`、`mini-batch size`、`method for updating weights`。
詳細については、[parameters](../reference/stochasticlinearregression.md/#parameters)を参照してください。

```text
stochasticLogisticRegression(1.0, 1.0, 10, 'SGD')
```

**1.** フィッティング

<!-- -->

    [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) の説明の `Fitting` セクションを参照してください。

    予測されるラベルは \[-1, 1\] の範囲でなければなりません。

**2.** 予測

<!-- -->

    保存された状態を使用して、ラベル `1` を持つオブジェクトの確率を予測できます。

    ```sql
    WITH (SELECT state FROM your_model) AS model SELECT
    evalMLMethod(model, param1, param2) FROM test_data
    ```

    このクエリは確率のカラムを返します。`evalMLMethod` の最初の引数は `AggregateFunctionState` オブジェクトで、次に特徴のカラムが続きます。

    確率の境界を設定することもでき、これにより要素に異なるラベルが割り当てられます。

    ```sql
    SELECT ans < 1.1 AND ans > 0.5 FROM
    (WITH (SELECT state FROM your_model) AS model SELECT
    evalMLMethod(model, param1, param2) AS ans FROM test_data)
    ```

    これにより結果がラベルになります。

    `test_data` は `train_data` に似たテーブルですが、ターゲット値を含まない場合があります。

**関連情報**

- [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [線形回帰とロジスティック回帰の違い](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
