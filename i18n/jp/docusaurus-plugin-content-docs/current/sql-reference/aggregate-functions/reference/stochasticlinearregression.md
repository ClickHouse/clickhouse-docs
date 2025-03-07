---
slug: '/sql-reference/aggregate-functions/reference/stochasticlinearregression'
sidebar_position: 192
title: 'stochasticLinearRegression'
description: 'この関数は確率的線形回帰を実装します。学習率、L2正則化係数、ミニバッチサイズのカスタムパラメータをサポートし、重みの更新方法（Adam、シンプルSGD、Momentum、Nesterov）もいくつか用意されています。'
---


# stochasticLinearRegression {#agg_functions_stochasticlinearregression_parameters}

この関数は確率的線形回帰を実装します。学習率、L2正則化係数、ミニバッチサイズのカスタムパラメータをサポートし、重みの更新方法（[Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam)（デフォルトで使用）、[simple SGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent)、[Momentum](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum)、および [Nesterov](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf)）もいくつか用意されています。

### パラメータ {#parameters}

カスタマイズ可能なパラメータは4つあります。これらは関数に順次渡されますが、4つすべてを渡す必要はありません - デフォルト値が使用されます。ただし、良好なモデルにはパラメータの調整が必要です。

``` text
stochasticLinearRegression(0.00001, 0.1, 15, 'Adam')
```

1.  `learning rate` は勾配降下法のステップが行われる際のステップの長さの係数です。学習率が大きすぎると、モデルの重みが無限大になる可能性があります。デフォルトは `0.00001` です。
2.  `l2 regularization coefficient` は過学習を防ぐのに役立ちます。デフォルトは `0.1` です。
3.  `mini-batch size` は、勾配を計算し合計して1ステップの勾配降下を行う要素の数を設定します。純粋な確率的降下法では1つの要素を使用しますが、小さなバッチ（約10要素）を持つことで、勾配ステップがより安定します。デフォルトは `15` です。
4.  `method for updating weights` は次の通りです： `Adam` （デフォルト）、 `SGD` 、 `Momentum` 、および `Nesterov` です。 `Momentum` と `Nesterov` は、計算とメモリを少し多く必要としますが、収束の速度と確率的勾配法の安定性の観点から便利です。

### 使用法 {#usage}

`stochasticLinearRegression` は、モデルのフィッティングと新しいデータに対する予測の2ステップで使用されます。モデルをフィッティングし、後で使用するためにその状態を保存するには、`-State` 組み合わせ子を使用します。この組み合わせ子は状態（例えば、モデルの重み）を保存します。予測を行うには、状態を引数として取る関数 [evalMLMethod](/sql-reference/functions/machine-learning-functions#evalmlmethod) を使用します。

<a name="stochasticlinearregression-usage-fitting"></a>

**1.** フィッティング

このようなクエリを使用できます。

``` sql
CREATE TABLE IF NOT EXISTS train_data
(
    param1 Float64,
    param2 Float64,
    target Float64
) ENGINE = Memory;

CREATE TABLE your_model ENGINE = Memory AS SELECT
stochasticLinearRegressionState(0.1, 0.0, 5, 'SGD')(target, param1, param2)
AS state FROM train_data;
```

ここでは、`train_data` テーブルにデータを挿入する必要があります。パラメータの数は固定されておらず、`linearRegressionState` に渡された引数の数によってのみ決まります。すべての値は数値である必要があります。
ターゲット値（予測するように学習したい値）を含むカラムは最初の引数として挿入されます。

**2.** 予測

状態をテーブルに保存した後、この状態を複数回使用して予測を行ったり、別の状態とマージして新しい、より良いモデルを作成したりできます。

``` sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

このクエリは予測値のカラムを返します。`evalMLMethod` の最初の引数は `AggregateFunctionState` オブジェクトであり、次の引数は特徴のカラムです。

`test_data` は `train_data` のようなテーブルですが、ターゲット値を含まない場合があります。

### 注意事項 {#notes}

1.  2つのモデルをマージするには、ユーザーは次のようなクエリを作成できます：
    ``` sql
    SELECT state1 + state2 FROM your_models
    ```
    ここで、`your_models` テーブルには両方のモデルが含まれています。このクエリは新しい `AggregateFunctionState` オブジェクトを返します。

2.  ユーザーは、`-State` 組み合わせ子が使用されていない場合、保存せずに独自の目的のために作成されたモデルの重みを取得できます。
    ``` sql
    SELECT stochasticLinearRegression(0.01)(target, param1, param2) FROM train_data
    ```
    このようなクエリはモデルをフィットさせ、その重みを返します - 最初の数値はモデルのパラメータに対応する重みであり、最後のものはバイアスです。したがって、上記のクエリは3つの値を持つカラムを返します。

**関連情報**

- [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [線形回帰とロジスティック回帰の違い](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
