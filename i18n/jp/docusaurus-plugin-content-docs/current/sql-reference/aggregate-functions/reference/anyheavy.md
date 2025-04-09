---
slug: /sql-reference/aggregate-functions/reference/anyheavy
sidebar_position: 104
title: "anyHeavy"
description: "重みのあるヒッターアルゴリズムを使用して頻繁に発生する値を選択します。クエリの各実行スレッドで半数以上のケースで発生する値がある場合、この値が返されます。通常、結果は非決定論的です。"
---


# anyHeavy

[重みのあるヒッター](https://doi.org/10.1145/762471.762473)アルゴリズムを使用して頻繁に発生する値を選択します。クエリの各実行スレッドで半数以上のケースで発生する値がある場合、この値が返されます。通常、結果は非決定論的です。

``` sql
anyHeavy(column)
```

**引数**

- `column` – カラム名。

**例**

[OnTime](../../../getting-started/example-datasets/ontime.md)データセットを取り、`AirlineID`カラムの中で頻繁に発生する値を選択します。

``` sql
SELECT anyHeavy(AirlineID) AS res
FROM ontime
```

``` text
┌───res─┐
│ 19690 │
└───────┘
```
