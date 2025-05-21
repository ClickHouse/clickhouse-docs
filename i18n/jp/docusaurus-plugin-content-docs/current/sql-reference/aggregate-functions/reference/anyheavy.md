---
description: '重み付きヒッターアルゴリズムを使用して、頻繁に発生する値を選択します。 各クエリの実行スレッドで、半数以上のケースで発生する値がある場合、この値が返されます。 通常、結果は非決定的です。'
sidebar_position: 104
slug: /sql-reference/aggregate-functions/reference/anyheavy
title: 'anyHeavy'
---


# anyHeavy

[重み付きヒッター](https://doi.org/10.1145/762471.762473)アルゴリズムを使用して、頻繁に発生する値を選択します。各クエリの実行スレッドで半数以上のケースで発生する値がある場合、この値が返されます。通常、結果は非決定的です。

```sql
anyHeavy(column)
```

**引数**

- `column` – カラム名。

**例**

[OnTime](../../../getting-started/example-datasets/ontime.md)データセットを取得し、`AirlineID`カラムにある頻繁に発生する値を選択します。

```sql
SELECT anyHeavy(AirlineID) AS res
FROM ontime
```

```text
┌───res─┐
│ 19690 │
└───────┘
```
