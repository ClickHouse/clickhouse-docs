---
slug: /sql-reference/aggregate-functions/reference/stochasticlinearregression
sidebar_position: 192
---

# stochasticLinearRegression {#agg_functions_stochasticlinearregression_parameters}

この関数は確率的線形回帰を実装しています。学習率、L2正則化係数、ミニバッチサイズのカスタムパラメータをサポートしており、重みを更新するためのいくつかのメソッド（デフォルトで使用される[Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam)、[単純SGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent)、[Momentum](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum)、および[Nesterov](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf)）があります。

### パラメータ {#parameters}

カスタマイズ可能なパラメータは4つあります。これらは関数に順次渡されますが、すべての4つを渡す必要はありません - デフォルト値が使用されますが、良いモデルを得るためにはいくつかのパラメータチューニングが必要です。

``` text
stochasticLinearRegression(0.00001, 0.1, 15, 'Adam')
```

1.  `学習率`は、勾配降下ステップが実行されるときのステップ長の係数です。学習率が大きすぎるとモデルの重みが無限大になる可能性があります。デフォルトは`0.00001`です。
2.  `L2正則化係数`は過学習を防ぐのに役立つ場合があります。デフォルトは`0.1`です。
3.  `ミニバッチサイズ`は、勾配を計算して合計する要素の数を設定し、1ステップの勾配降下を実行します。純粋な確率的降下は1つの要素を使用しますが、小さなバッチ（約10要素）の方が勾配ステップがより安定します。デフォルトは`15`です。
4.  `重みの更新方法`は、`Adam`（デフォルト）、`SGD`、`Momentum`、および`Nesterov`です。`Momentum`と`Nesterov`は、計算とメモリを少し多く消費しますが、収束の速度と確率的勾配法の安定性において有用です。

### 使用法 {#usage}

`stochasticLinearRegression`は2つのステップで使用されます：モデルを適合させ、新しいデータに対して予測します。モデルを適合させてその状態を後で使用するために保存するために、`-State`コンビネータを使用します。これは状態（例：モデルの重み）を保存します。
予測を行うためには、状態を引数として受け取り、予測する特徴を使用する関数[evalMLMethod](../../../sql-reference/functions/machine-learning-functions.md#machine_learning_methods-evalmlmethod)を使用します。

<a name="stochasticlinearregression-usage-fitting"></a>

**1.** 適合

以下のクエリが使用できます。

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

ここでは、`train_data`テーブルにデータを挿入する必要があります。パラメータの数は固定されておらず、`linearRegressionState`に渡された引数の数だけに依存します。それらはすべて数値でなければなりません。
予測したいターゲット値のカラムは、最初の引数として挿入されることに注意してください。

**2.** 予測

状態をテーブルに保存した後、予測のために何度でも使用したり、他の状態と統合して新しい、より優れたモデルを作成することができます。

``` sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

このクエリは予測値のカラムを返します。`evalMLMethod`の最初の引数は`AggregateFunctionState`オブジェクトであり、次の引数は特徴のカラムです。

`test_data`は`train_data`のようなテーブルですが、ターゲット値を含まない場合があります。

### 注意事項 {#notes}

1.  ユーザーは2つのモデルをマージするために、次のようなクエリを作成できます：
    `sql  SELECT state1 + state2 FROM your_models`
    ここで`your_models`テーブルには両方のモデルが含まれています。このクエリは新しい`AggregateFunctionState`オブジェクトを返します。

2.  ユーザーは、`-State`コンビネータを使用しなくても、作成したモデルの重みを自身の目的のために取得できます。
    `sql  SELECT stochasticLinearRegression(0.01)(target, param1, param2) FROM train_data`
    このクエリはモデルを適合させ、重みを返します - 最初はモデルのパラメータに対応する重み、最後はバイアスです。したがって、上記の例ではこのクエリは3つの値を持つカラムを返します。

**参照**

- [stochasticLogisticRegression](../../../sql-reference/aggregate-functions/reference/stochasticlogisticregression.md#stochasticlogisticregression)
- [線形回帰とロジスティック回帰の違い](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
