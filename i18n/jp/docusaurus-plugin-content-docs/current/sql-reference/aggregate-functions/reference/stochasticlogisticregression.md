---
'description': 'この関数は、確率的ロジスティック回帰を実装しています。バイナリ分類問題に使用でき、stochasticLinearRegressionと同じカスタムパラメータをサポートし、同じ方法で機能します。'
'sidebar_position': 193
'slug': '/sql-reference/aggregate-functions/reference/stochasticlogisticregression'
'title': 'stochasticLogisticRegression'
'doc_type': 'reference'
---


# stochasticLogisticRegression

この関数は確率的ロジスティック回帰を実装します。バイナリ分類問題に使用でき、stochasticLinearRegression と同じカスタムパラメータをサポートし、同様の方法で動作します。

### パラメータ {#parameters}

パラメータは stochasticLinearRegression と全く同じです：
`learning rate`、`l2 regularization coefficient`、`mini-batch size`、`method for updating weights`。
詳細については [parameters](../reference/stochasticlinearregression.md/#parameters) を参照してください。

```text
stochasticLogisticRegression(1.0, 1.0, 10, 'SGD')
```

**1.** フィッティング

<!-- -->

    [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) の説明にある `Fitting` セクションを参照してください。

    予測ラベルは \[-1, 1\] の範囲内である必要があります。

**2.** 予測

<!-- -->

    保存された状態を使用して、オブジェクトがラベル `1` を持つ確率を予測することができます。

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

    クエリは確率のカラムを返します。`evalMLMethod` の最初の引数は `AggregateFunctionState` オブジェクトで、次が特徴のカラムです。

    また、確率の境界を設定することもでき、これにより異なるラベルに要素を割り当てます。

```sql
SELECT ans < 1.1 AND ans > 0.5 FROM
(WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) AS ans FROM test_data)
```

    その結果がラベルになります。

    `test_data` は `train_data` と同様のテーブルですが、ターゲット値を含まない場合があります。

**関連情報**

- [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [線形回帰とロジスティック回帰の違い。](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
