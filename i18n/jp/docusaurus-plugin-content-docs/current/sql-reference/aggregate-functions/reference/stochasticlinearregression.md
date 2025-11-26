---
description: 'この関数は確率的線形回帰を実装します。学習率、L2 正則化係数、ミニバッチサイズのカスタムパラメーターをサポートし、さらに複数の重み更新手法（Adam、単純 SGD、Momentum、Nesterov）に対応しています。'
sidebar_position: 192
slug: /sql-reference/aggregate-functions/reference/stochasticlinearregression
title: 'stochasticLinearRegression'
doc_type: 'reference'
---



# stochasticLinearRegression

この関数は確率的線形回帰を実装します。学習率、L2 正則化係数、ミニバッチサイズのカスタムパラメータをサポートし、重みを更新するためのいくつかの手法（デフォルトで使用される [Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam)、[simple SGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent)、[Momentum](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum)、[Nesterov](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf)）を備えています。

### Parameters

カスタマイズ可能なパラメータは 4 つあります。これらは関数に順番に渡されますが、4 つすべてを渡す必要はありません。指定されなかったものにはデフォルト値が使用されますが、良いモデルを得るには一部のパラメータ調整が必要になる場合があります。

```text
stochasticLinearRegression(0.00001, 0.1, 15, 'Adam')
```

1. `learning rate` は、勾配降下ステップを実行する際のステップ長に掛かる係数です。学習率が大きすぎると、モデルの重みが発散して無限大になる可能性があります。デフォルトは `0.00001` です。
2. `l2 regularization coefficient` は、過学習の防止に役立つ係数です。デフォルトは `0.1` です。
3. `mini-batch size` は、1 回の勾配降下ステップを行うために勾配を計算して加算する要素数を指定します。純粋な確率的降下では 1 要素のみを使用しますが、小さなバッチ（約 10 要素）にすることで、勾配ステップがより安定します。デフォルトは `15` です。
4. `method for updating weights` には次のものがあります: `Adam`（デフォルト）、`SGD`、`Momentum`、`Nesterov`。`Momentum` と `Nesterov` は、やや多くの計算とメモリを必要としますが、収束速度および確率的勾配法の安定性の観点から有用な場合があります。

### Usage

`stochasticLinearRegression` は 2 段階で利用します。まずモデルをフィット（学習）し、その後新しいデータに対して予測を行います。モデルをフィットして、その状態を後で利用できるように保存するには、状態（例: モデルの重み）を保存する `-State` コンビネータを使用します。
予測には、状態と予測対象の特徴量を引数として受け取る関数 [evalMLMethod](/sql-reference/functions/machine-learning-functions#evalmlmethod) を使用します。

<a name="stochasticlinearregression-usage-fitting" />

**1.** Fitting

次のようなクエリを使用します。

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

ここでは、`train_data` テーブルにデータを挿入する必要もあります。パラメータの数は固定ではなく、`linearRegressionState` に渡される引数の数のみに依存します。これらはすべて数値である必要があります。
予測したいターゲット値（学習したい値）の列は、最初の引数として挿入されることに注意してください。

**2.** 予測

状態をテーブルに保存した後は、その状態を予測に複数回使用したり、他の状態とマージして、より新しく高性能なモデルを作成することもできます。

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

クエリは予測値の列を返します。`evalMLMethod` の最初の引数は `AggregateFunctionState` オブジェクトであり、その後に特徴量の列が続くことに注意してください。

`test_data` は `train_data` と同様のテーブルですが、目的変数を含まない場合があります。

### Notes

1. 2 つのモデルを統合するには、次のようなクエリを作成できます:
   `sql  SELECT state1 + state2 FROM your_models`
   ここで、`your_models` テーブルには両方のモデルが含まれています。このクエリは新しい `AggregateFunctionState` オブジェクトを返します。

2. ユーザーは、`-State` コンビネータを使用しない場合、モデルを保存しなくても、作成したモデルの重みを任意の用途で取得できます。
   `sql  SELECT stochasticLinearRegression(0.01)(target, param1, param2) FROM train_data`
   このようなクエリはモデルをフィットし、その重みを返します。先頭の値はモデルの各パラメータに対応する重みで、最後の 1 つがバイアスです。したがって上記の例では、クエリは 3 つの値を持つ列を返します。

**See Also**


- [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [線形回帰とロジスティック回帰の違い](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
