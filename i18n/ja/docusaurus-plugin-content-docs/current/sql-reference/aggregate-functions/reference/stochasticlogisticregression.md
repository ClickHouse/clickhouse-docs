---
slug: /sql-reference/aggregate-functions/reference/stochasticlogisticregression
sidebar_position: 193
---

# stochasticLogisticRegression

この関数は確率的ロジスティック回帰を実装しています。バイナリ分類問題に使用でき、確率的線形回帰と同じカスタムパラメータをサポートし、同様の方法で動作します。

### パラメータ {#parameters}

パラメータは確率的線形回帰とまったく同じです：
`学習率`、`L2正則化係数`、`ミニバッチサイズ`、`重みの更新方法`。
詳細については、[パラメータ](../reference/stochasticlinearregression.md/#parameters)を参照してください。

``` text
stochasticLogisticRegression(1.0, 1.0, 10, 'SGD')
```

**1.** フィッティング

<!-- -->

    [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) 説明の `Fitting` セクションを参照してください。

    予測されたラベルは \[-1, 1\] にある必要があります。

**2.** 予測

<!-- -->

    保存された状態を使用して、オブジェクトがラベル `1` を持つ確率を予測できます。

    ``` sql
    WITH (SELECT state FROM your_model) AS model SELECT
    evalMLMethod(model, param1, param2) FROM test_data
    ```

    このクエリは、確率のカラムを返します。`evalMLMethod` の最初の引数は `AggregateFunctionState` オブジェクトであり、次の引数は特徴のカラムです。

    確率の下限を設定することもでき、これにより要素が異なるラベルに割り当てられます。

    ``` sql
    SELECT ans < 1.1 AND ans > 0.5 FROM
    (WITH (SELECT state FROM your_model) AS model SELECT
    evalMLMethod(model, param1, param2) AS ans FROM test_data)
    ```

    すると、結果はラベルになります。

    `test_data` は `train_data` と同様のテーブルですが、ターゲット値を含まない場合があります。

**参照**

- [stochasticLinearRegression](../../../sql-reference/aggregate-functions/reference/stochasticlinearregression.md#agg_functions-stochasticlinearregression)
- [線形回帰とロジスティック回帰の違い](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
