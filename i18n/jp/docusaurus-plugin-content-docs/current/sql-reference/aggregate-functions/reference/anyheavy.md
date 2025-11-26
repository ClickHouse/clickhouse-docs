---
description: 'heavy hitters アルゴリズムを使用して、頻繁に出現する値を選択します。
  各クエリ実行スレッドで、ケースの半数を超える頻度で出現する値がある場合は、その値が返されます。
  通常、この結果は非決定的です。'
sidebar_position: 104
slug: /sql-reference/aggregate-functions/reference/anyheavy
title: 'anyHeavy'
doc_type: 'reference'
---

# anyHeavy

[heavy hitters](https://doi.org/10.1145/762471.762473) アルゴリズムを使用して、頻繁に出現する値を 1 つ選択します。クエリの各実行スレッドにおいて、全ケースの半数を超える頻度で出現する値がある場合、その値が返されます。通常、この結果は非決定的です。

```sql
anyHeavy(column)
```

**引数**

* `column` – 列名です。

**例**

[OnTime](../../../getting-started/example-datasets/ontime.md) データセットを使用し、`AirlineID` 列で頻繁に現れる値のいずれかを選択します。

```sql
SELECT anyHeavy(AirlineID) AS res
FROM ontime
```

```text
┌───res─┐
│ 19690 │
└───────┘
```
