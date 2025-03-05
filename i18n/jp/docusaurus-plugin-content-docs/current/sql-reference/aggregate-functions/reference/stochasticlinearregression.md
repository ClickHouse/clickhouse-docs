---
slug: /sql-reference/aggregate-functions/reference/stochasticlinearregression
sidebar_position: 192
title: "stochasticLinearRegression"
description: "この関数は確率的線形回帰を実装しています。学習率、L2正則化係数、ミニバッチサイズのカスタムパラメータをサポートし、重みを更新するためのいくつかの方法（Adam、シンプルSGD、Momentum、Nesterov）があります。"
---


# stochasticLinearRegression {#agg_functions_stochasticlinearregression_parameters}

この関数は確率的線形回帰を実装しています。学習率、L2正則化係数、ミニバッチサイズのカスタムパラメータをサポートし、重みを更新するためのいくつかの方法（[Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam)（デフォルトで使用）、[シンプルSGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent)、[Momentum](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum)、および[Nesterov](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf)）があります。

### パラメータ {#parameters}

カスタマイズ可能なパラメータは4つあります。それらは関数に順番に渡されますが、4つすべてを渡す必要はありません - デフォルト値が使用されます。ただし、良いモデルにはいくつかのパラメータ調整が必要です。

``` text
stochasticLinearRegression(0.00001, 0.1, 15, 'Adam')
```

1.  `learning rate` は、勾配降下ステップが実行されるときのステップ長の係数です。学習率が大きすぎると、モデルの重みが無限大になる可能性があります。デフォルトは `0.00001` です。
2.  `l2 regularization coefficient` は、過学習を防ぐのに役立つ可能性があります。デフォルトは `0.1` です。
3.  `mini-batch size` は、勾配を計算して1ステップの勾配降下を実行するために合計する要素の数を設定します。純粋な確率的降下は1つの要素を使用しますが、少数のバッチ（約10要素）を持つことで勾配ステップがより安定します。デフォルトは `15` です。
4.  `method for updating weights` は、`Adam`（デフォルト）、`SGD`、`Momentum`、および `Nesterov` の4つです。`Momentum` および `Nesterov` は、少し多くの計算とメモリを必要としますが、収束のスピードと確率的勾配法の安定性の点で役立ちます。

### 使用法 {#usage}

`stochasticLinearRegression` は、モデルのフィッティングと新しいデータの予測の2ステップで使用されます。モデルをフィットさせてその状態を後で使用するために保存するには、状態を保存する `-State` コンビネータを使用します（例：モデルの重みを保存）。
予測を行うには、状態を引数として取り、予測を行う特徴を指定する関数 [evalMLMethod](../../../sql-reference/functions/machine-learning-functions.md#machine_learning_methods-evalmlmethod) を使用します。

<a name="stochasticlinearregression-usage-fitting"></a>

**1.** フィッティング

次のクエリが使用できます。

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

ここで、`train_data` テーブルにデータを挿入する必要があります。パラメータの数は固定されておらず、`linearRegressionState` に渡される引数の数によってのみ決まります。すべて数値でなければなりません。
予測したいターゲット値を持つカラムは最初の引数として挿入されることに注意してください。

**2.** 予測

状態がテーブルに保存された後、それを複数回予測に使用することができ、他の状態と統合して新しい、さらに良いモデルを作成することも可能です。

``` sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

このクエリは予測値のカラムを返します。`evalMLMethod` の最初の引数は `AggregateFunctionState` オブジェクトであり、次に特徴のカラムが続きます。

`test_data` は `train_data` のようなテーブルですが、ターゲット値を含まない場合があります。

### 注記 {#notes}

1.  2つのモデルをマージするには、ユーザーは次のようなクエリを作成することができます：
    `sql  SELECT state1 + state2 FROM your_models`
    ここで `your_models` テーブルには両方のモデルが含まれています。このクエリは新しい `AggregateFunctionState` オブジェクトを返します。

2.  モデルの作成された重みを、`-State` コンビネータを使用せずに保存せずに取得することができます。
    `sql  SELECT stochasticLinearRegression(0.01)(target, param1, param2) FROM train_data`
    このクエリはモデルをフィットさせ、その重みを返します - 最初はモデルのパラメータに対応する重みで、最後のものはバイアスです。したがって、上記の例では、このクエリは3つの値を持つカラムを返します。

**関連項目**

- [stochasticLogisticRegression](../../../sql-reference/aggregate-functions/reference/stochasticlogisticregression.md#stochasticlogisticregression)
- [線形回帰とロジスティック回帰の違い](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
