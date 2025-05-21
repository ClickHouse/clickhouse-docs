description: 'この関数は確率的線形回帰を実装しています。学習率、L2正則化係数、ミニバッチサイズのカスタムパラメータをサポートしており、重みを更新するためのいくつかの方法（Adam、単純SGD、Momentum、Nesterov）があります。'
sidebar_position: 192
slug: /sql-reference/aggregate-functions/reference/stochasticlinearregression
title: 'stochasticLinearRegression'
```


# stochasticLinearRegression {#agg_functions_stochasticlinearregression_parameters}

この関数は確率的線形回帰を実装しています。学習率、L2正則化係数、ミニバッチサイズのカスタムパラメータをサポートしており、重みを更新するためのいくつかの方法（[Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam)（デフォルトで使用）、[単純SGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent)、[Momentum](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum)および[Nesterov](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf)）があります。

### パラメータ {#parameters}

カスタマイズ可能なパラメータは4つあります。これらは関数に順に渡されますが、すべての4つを渡す必要はなく、デフォルト値が使用されます。ただし、良いモデルを得るにはパラメータ調整が必要です。

```text
stochasticLinearRegression(0.00001, 0.1, 15, 'Adam')
```

1.  `学習率`は、勾配降下ステップが実行されるときのステップの長さに対する係数です。学習率が大きすぎると、モデルの重みが無限大になる可能性があります。デフォルトは`0.00001`です。
2.  `L2正則化係数`は、過学習を防ぐのに役立ちます。デフォルトは`0.1`です。
3.  `ミニバッチサイズ`は、勾配が計算され、1ステップの勾配降下を実行するために合計される要素の数を設定します。純粋な確率的降下は1つの要素を使用しますが、小さなバッチ（約10要素）を持つことで勾配ステップがより安定します。デフォルトは`15`です。
4.  `重みを更新する方法`は次のとおりです：`Adam`（デフォルト）、`SGD`、`Momentum`、および`Nesterov`です。`Momentum`と`Nesterov`は、計算とメモリを少し多く必要としますが、収束速度と確率的勾配法の安定性の点で有用であることがわかります。

### 使用法 {#usage}

`stochasticLinearRegression`は、モデルをフィットさせ、新しいデータに対して予測を行う2つのステップで使用されます。モデルをフィットさせ、その状態を後で使用するために保存するには、状態を保存する`-State`コンビネーターを使用します（例：モデルの重み）。
予測を行うには、状態と予測する特徴を引数として受け取る[evalMLMethod](/sql-reference/functions/machine-learning-functions#evalmlmethod)関数を使用します。

<a name="stochasticlinearregression-usage-fitting"></a>

**1.** フィッティング

以下のようなクエリを使用できます。

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

ここでは、`train_data`テーブルにデータを挿入する必要があります。パラメータの数は固定されておらず、`linearRegressionState`に渡される引数の数によってのみ決まります。すべて数値でなければなりません。
ターゲット値（予測したい値）を含むカラムは、最初の引数として挿入されることに注意してください。

**2.** 予測

テーブルに状態を保存した後、予測のためにそれを複数回使用したり、他の状態とマージして新しい、さらなる優れたモデルを作成したりできます。

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

このクエリは、予測値のカラムを返します。`evalMLMethod`の最初の引数は`AggregateFunctionState`オブジェクトであり、次は特徴のカラムです。

`test_data`は`train_data`と同様のテーブルですが、ターゲット値を含まない場合があります。

### 注意事項 {#notes}

1.  2つのモデルをマージするには、ユーザーは次のようなクエリを作成できます：
    `sql  SELECT state1 + state2 FROM your_models`
    ここで`your_models`テーブルには両方のモデルが含まれています。このクエリは新しい`AggregateFunctionState`オブジェクトを返します。

2.  ユーザーは、`-State`コンビネーターを使用しない場合、モデルを保存せずに作成されたモデルの重みを自分の目的で取得できます。
    `sql  SELECT stochasticLinearRegression(0.01)(target, param1, param2) FROM train_data`
    このクエリはモデルをフィットさせ、その重みを返します - 最初はモデルのパラメータに対応する重みで、最後の1つはバイアスです。したがって、上記の例では、クエリは3つの値のカラムを返します。

**参照**

- [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [線形回帰とロジスティック回帰の違い](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
