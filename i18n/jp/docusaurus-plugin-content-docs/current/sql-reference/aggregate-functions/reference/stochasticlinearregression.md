---
description: 'この関数は確率的線形回帰を実装します。学習率、L2正則化係数、ミニバッチサイズのカスタムパラメータをサポートし、重みの更新用のいくつかのメソッド（Adam、シンプルSGD、モメンタム、ネステロフ）を持っています。'
sidebar_position: 192
slug: '/sql-reference/aggregate-functions/reference/stochasticlinearregression'
title: 'stochasticLinearRegression'
---


# stochasticLinearRegression {#agg_functions_stochasticlinearregression_parameters}

この関数は、確率的線形回帰を実装しています。学習率、L2正則化係数、ミニバッチサイズのカスタムパラメータをサポートしており、重みを更新するためのいくつかのメソッドを持っています（[Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam)（デフォルトで使用）、[simple SGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent)、[Momentum](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum)、および[Nesterov](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf)）。

### パラメータ {#parameters}

カスタマイズ可能なパラメータは4つあります。これらは関数に順次渡されますが、4つすべてを渡す必要はありません。デフォルト値が使用されますが、良いモデルを得るためには、いくつかのパラメータ調整が必要です。

```text
stochasticLinearRegression(0.00001, 0.1, 15, 'Adam')
```

1.  `learning rate` は、勾配降下ステップが実行されるときのステップ長の係数です。学習率が大きすぎると、モデルの重みが無限大になる可能性があります。デフォルトは `0.00001` です。
2.  過学習を防ぐために役立つ可能性のある `l2 regularization coefficient` です。デフォルトは `0.1` です。
3.  `mini-batch size` は、勾配が計算され、合計されて1ステップの勾配降下を実行するための要素の数を設定します。純粋な確率的降下は1つの要素を使用しますが、小さなバッチ（約10要素）を持つことで勾配ステップがより安定します。デフォルトは `15` です。
4.  重みを更新するための `method for updating weights` です。これらは `Adam`（デフォルト）、`SGD`、`Momentum`、および `Nesterov` です。`Momentum` と `Nesterov` は、少し多くの計算とメモリを必要としますが、収束速度や確率的勾配法の安定性の観点で役立ちます。

### 使用法 {#usage}

`stochasticLinearRegression` は、モデルのフィッティングと新しいデータに対する予測の2ステップで使用されます。モデルをフィットさせ、後で使用するためにその状態を保存するために、`-State` コンビネータを使用します。これにより、状態（例えば、モデルの重み）が保存されます。
予測を行うためには、状態を引数として受け取り、予測するための特徴を受け取る関数 [evalMLMethod](/sql-reference/functions/machine-learning-functions#evalmlmethod) を使用します。

<a name="stochasticlinearregression-usage-fitting"></a>

**1.** フィッティング

このようなクエリを使用できます。

```sql
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

ここでは、`train_data` テーブルにデータを挿入する必要があります。パラメータの数は固定されておらず、`linearRegressionState` に渡された引数の数に依存します。すべてが数値である必要があります。
ターゲット値（予測したい値）を持つカラムは最初の引数として挿入されます。

**2.** 予測

テーブルに状態を保存した後、それを複数回使用して予測したり、他の状態とマージして新しい、さらに良いモデルを作成することができます。

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

このクエリは予測された値のカラムを返します。`evalMLMethod` の最初の引数は `AggregateFunctionState` オブジェクトであり、次の引数は特徴のカラムです。

`test_data` は `train_data` と同様のテーブルですが、ターゲット値を含まない場合があります。

### 注意事項 {#notes}

1.  2つのモデルをマージするためにユーザーがこのようなクエリを作成できます：
    `sql  SELECT state1 + state2 FROM your_models`
    ここで、`your_models` テーブルは両方のモデルを含みます。このクエリは新しい `AggregateFunctionState` オブジェクトを返します。

2.  ユーザーは、モデルを保存しないで作成したモデルの重みを取り出すことができます。ただし、`-State` コンビネータが使用されていない場合に限ります。
    `sql  SELECT stochasticLinearRegression(0.01)(target, param1, param2) FROM train_data`
    このようなクエリはモデルをフィットさせ、その重みを返します。最初の値はモデルのパラメータに対応する重みであり、最後の値はバイアスです。したがって、上記のクエリは3つの値を持つカラムを返します。

**参照**

- [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [線形回帰とロジスティック回帰の違い](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
