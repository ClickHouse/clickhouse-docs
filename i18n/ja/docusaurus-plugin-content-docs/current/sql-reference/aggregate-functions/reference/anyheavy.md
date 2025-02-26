---
slug: /sql-reference/aggregate-functions/reference/anyheavy
sidebar_position: 104
---

# anyHeavy

[ヘビーヒッター](https://doi.org/10.1145/762471.762473)アルゴリズムを使用して、よく発生する値を選択します。クエリの実行スレッドの各スレッドで、半数以上のケースに出現する値があれば、この値が返されます。通常、結果は非決定的です。

``` sql
anyHeavy(column)
```

**引数**

- `column` – カラム名です。

**例**

[OnTime](../../../getting-started/example-datasets/ontime.md)データセットを取り、`AirlineID`カラムで任意の頻繁に発生する値を選択します。

``` sql
SELECT anyHeavy(AirlineID) AS res
FROM ontime
```

``` text
┌───res─┐
│ 19690 │
└───────┘
```
