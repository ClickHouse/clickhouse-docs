---
'description': 'この関数は確率的線形回帰を実装します。学習率、L2正則化係数、ミニバッチサイズのカスタムパラメータをサポートしており、重みを更新するためのいくつかのメソッド（Adam、シンプルなSGD、Momentum、Nesterov）があります。'
'sidebar_position': 192
'slug': '/sql-reference/aggregate-functions/reference/stochasticlinearregression'
'title': 'stochasticLinearRegression'
'doc_type': 'reference'
---


# stochasticLinearRegression {#agg_functions_stochasticlinearregression_parameters}

この関数は、確率的線形回帰を実装しています。学習率、L2正則化係数、ミニバッチサイズのカスタムパラメータをサポートし、重みを更新するためのいくつかの方法（[Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam)（デフォルトで使用）、[シンプルSGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent)、[Momentum](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum)、および[Nesterov](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf)）があります。

### パラメータ {#parameters}

カスタマイズ可能なパラメータは4つあります。これらは関数に順次渡されますが、4つ全てを渡す必要はなく、デフォルト値が使用されます。ただし、良いモデルには一部のパラメータの調整が必要です。

```text
stochasticLinearRegression(0.00001, 0.1, 15, 'Adam')
```

1.  `learning rate` は、勾配降下ステップが実行されるときのステップ長の係数です。学習率が大きすぎると、モデルの重みが無限大になる可能性があります。デフォルトは `0.00001` です。
2.  `l2 regularization coefficient` は過学習を防ぐのに役立つ場合があります。デフォルトは `0.1` です。
3.  `mini-batch size` は、勾配が計算され、1ステップの勾配降下を実行するために合計される要素の数を設定します。純粋な確率的降下は1つの要素を使用しますが、小さなバッチ（約10要素）を持つことで勾配ステップがより安定します。デフォルトは `15` です。
4.  `method for updating weights` には、`Adam`（デフォルト）、`SGD`、`Momentum`、および `Nesterov` があります。`Momentum` と `Nesterov` は、少し多くの計算とメモリを必要としますが、収束速度と確率的勾配法の安定性の点で有用です。

### 使用方法 {#usage}

`stochasticLinearRegression` は、モデルのフィッティングと新しいデータに対する予測の2ステップで使用されます。モデルをフィッティングし、その状態を後で使用するために保存するには、状態（例えば、モデルの重み）を保存する `-State` コンビネータを使用します。
予測するには、状態を引数として受け取り、予測に使用する特徴量を指定する関数 [evalMLMethod](/sql-reference/functions/machine-learning-functions#evalmlmethod) を使用します。

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

ここでは、`train_data` テーブルにデータを挿入する必要があります。パラメータの数は固定されておらず、`linearRegressionState` に渡される引数の数によってのみ決まります。すべての値は数値でなければなりません。
ターゲット値（予測するために学習したい値）のカラムは最初の引数として挿入されることに注意してください。

**2.** 予測

テーブルに状態を保存した後、それを複数回予測に使用したり、他の状態と統合して新しく、さらに良いモデルを作成したりできます。

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

このクエリは、予測された値のカラムを返します。`evalMLMethod` の最初の引数は `AggregateFunctionState` オブジェクトであり、次は特徴量のカラムです。

`test_data` は `train_data` と同様のテーブルですが、ターゲット値を含まない場合があります。

### 注意事項 {#notes}

1.  2つのモデルを統合するために、ユーザーは以下のようなクエリを作成できます：
    `sql  SELECT state1 + state2 FROM your_models`
    ここで、`your_models` テーブルには両方のモデルが含まれています。このクエリは新しい `AggregateFunctionState` オブジェクトを返します。

2.  ユーザーは、`-State` コンビネータが使用されていない場合、モデルを保存せずにその作成されたモデルの重みを取得できます。
    `sql  SELECT stochasticLinearRegression(0.01)(target, param1, param2) FROM train_data`
    このクエリはモデルをフィッティングし、その重みを返します - 最初はモデルのパラメータに対応する重みであり、最後のものはバイアスです。したがって、上記の例では、クエリは3つの値のカラムを返します。

**参照**

- [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [線形回帰とロジスティック回帰の違い](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
