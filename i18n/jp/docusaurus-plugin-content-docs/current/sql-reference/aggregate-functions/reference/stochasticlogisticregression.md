---
'description': 'This function implements stochastic logistic regression. It can be
  used for binary classification problem, supports the same custom parameters as stochasticLinearRegression
  and works the same way.'
'sidebar_position': 193
'slug': '/sql-reference/aggregate-functions/reference/stochasticlogisticregression'
'title': 'stochasticLogisticRegression'
---




# stochasticLogisticRegression

この関数は確率的ロジスティック回帰を実装しています。バイナリ分類問題に使用することができ、確率的線形回帰と同じカスタムパラメータをサポートし、同様の方法で機能します。

### Parameters {#parameters}

パラメータは確率的線形回帰と全く同じです：
`learning rate`、`l2 regularization coefficient`、`mini-batch size`、`method for updating weights`。
詳細については、[parameters](../reference/stochasticlinearregression.md/#parameters)を参照してください。

```text
stochasticLogisticRegression(1.0, 1.0, 10, 'SGD')
```

**1.** フィッティング

<!-- -->

    [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) の「Fitting」セクションを参照してください。

    予測ラベルは \[-1, 1\] にある必要があります。

**2.** 予測

<!-- -->

    保存された状態を使用して、ラベルが `1` であるオブジェクトの確率を予測できます。

    ```sql
    WITH (SELECT state FROM your_model) AS model SELECT
    evalMLMethod(model, param1, param2) FROM test_data
    ```

    このクエリは確率のカラムを返します。`evalMLMethod` の最初の引数は `AggregateFunctionState` オブジェクトであり、次の引数は特徴のカラムです。

    確率の境界を設定することもでき、それにより要素を異なるラベルに割り当てます。

    ```sql
    SELECT ans < 1.1 AND ans > 0.5 FROM
    (WITH (SELECT state FROM your_model) AS model SELECT
    evalMLMethod(model, param1, param2) AS ans FROM test_data)
    ```

    すると結果はラベルになります。

    `test_data` は `train_data` に似たテーブルですが、ターゲット値を含まない場合があります。

**See Also**

- [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [線形回帰とロジスティック回帰の違い](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
