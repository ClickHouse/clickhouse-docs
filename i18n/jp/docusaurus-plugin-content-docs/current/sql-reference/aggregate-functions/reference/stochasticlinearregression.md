---
description: 'この関数は確率的線形回帰を実装します。学習率、L2 正則化係数、ミニバッチサイズなどのパラメーターを任意に指定でき、重み更新のための複数の手法（Adam、単純な SGD、Momentum、Nesterov）をサポートします。'
sidebar_position: 192
slug: /sql-reference/aggregate-functions/reference/stochasticlinearregression
title: 'stochasticLinearRegression'
doc_type: 'reference'
---



# stochasticLinearRegression {#agg_functions_stochasticlinearregression_parameters}

この関数は確率的線形回帰を実装します。学習率、L2正則化係数、ミニバッチサイズのカスタムパラメータをサポートし、重みを更新するためのいくつかの手法（[Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam)（デフォルトで使用）、[simple SGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent)、[Momentum](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum)、[Nesterov](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf)）を備えています。

### パラメータ {#parameters}

カスタマイズ可能なパラメータは4つあります。これらは関数に順次渡されますが、4つすべてを渡す必要はありません。デフォルト値が使用されますが、良好なモデルを得るにはパラメータの調整が必要です。

```text
stochasticLinearRegression(0.00001, 0.1, 15, 'Adam')
```

1.  `learning rate`は、勾配降下ステップが実行される際のステップ長の係数です。学習率が大きすぎると、モデルの重みが無限大になる可能性があります。デフォルトは`0.00001`です。
2.  `l2 regularization coefficient`は、過学習を防ぐのに役立ちます。デフォルトは`0.1`です。
3.  `mini-batch size`は、勾配降下の1ステップを実行するために勾配が計算され合計される要素の数を設定します。純粋な確率的降下法では1つの要素を使用しますが、小さなバッチ（約10要素）を使用すると勾配ステップがより安定します。デフォルトは`15`です。
4.  `method for updating weights`には、`Adam`（デフォルト）、`SGD`、`Momentum`、`Nesterov`があります。`Momentum`と`Nesterov`は、やや多くの計算とメモリを必要としますが、確率的勾配法の収束速度と安定性の面で有用です。

### 使用方法 {#usage}

`stochasticLinearRegression`は2つのステップで使用されます：モデルの学習と新しいデータに対する予測です。モデルを学習し、後で使用するためにその状態を保存するには、状態（例：モデルの重み）を保存する`-State`コンビネータを使用します。
予測を行うには、状態と予測対象の特徴量を引数として受け取る関数[evalMLMethod](/sql-reference/functions/machine-learning-functions#evalmlmethod)を使用します。

<a name='stochasticlinearregression-usage-fitting'></a>

**1.** 学習

次のようなクエリを使用できます。

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

ここでは、`train_data`テーブルにデータを挿入する必要もあります。パラメータの数は固定されておらず、`linearRegressionState`に渡される引数の数にのみ依存します。すべて数値である必要があります。
目的変数（予測を学習したい値）を含む列が最初の引数として挿入されることに注意してください。

**2.** 予測

状態をテーブルに保存した後、予測のために複数回使用したり、他の状態とマージしてさらに優れた新しいモデルを作成したりできます。

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

このクエリは予測値の列を返します。`evalMLMethod`の最初の引数は`AggregateFunctionState`オブジェクトであり、次に特徴量の列が続くことに注意してください。

`test_data`は`train_data`と同様のテーブルですが、目的変数を含まない場合があります。

### 注意事項 {#notes}

1.  2つのモデルをマージするには、次のようなクエリを作成できます：
    `sql  SELECT state1 + state2 FROM your_models`
    ここで、`your_models`テーブルには両方のモデルが含まれています。このクエリは新しい`AggregateFunctionState`オブジェクトを返します。

2.  `-State`コンビネータを使用しない場合、モデルを保存せずに独自の目的で作成されたモデルの重みを取得できます。
    `sql  SELECT stochasticLinearRegression(0.01)(target, param1, param2) FROM train_data`
    このようなクエリはモデルを学習し、その重みを返します。最初はモデルのパラメータに対応する重みで、最後はバイアスです。したがって、上記の例では、クエリは3つの値を持つ列を返します。

**関連項目**


- [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [線形回帰とロジスティック回帰の違い](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
