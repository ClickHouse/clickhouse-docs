---
'description': '重いヒッターアルゴリズムを使用して頻繁に出現する値を選択します。各クエリ実行スレッドで半数以上のケースに出現する値がある場合、その値が返されます。通常、結果は非決定的です。'
'sidebar_position': 104
'slug': '/sql-reference/aggregate-functions/reference/anyheavy'
'title': 'anyHeavy'
'doc_type': 'reference'
---


# anyHeavy

頻繁に出現する値を[heavy hitters](https://doi.org/10.1145/762471.762473)アルゴリズムを使用して選択します。クエリの各実行スレッドで半分以上のケースで発生する値がある場合、この値が返されます。通常、結果は非決定的です。

```sql
anyHeavy(column)
```

**引数**

- `column` – カラム名。

**例**

[OnTime](../../../getting-started/example-datasets/ontime.md)データセットを取り、`AirlineID`カラムで頻繁に出現する値を選択します。

```sql
SELECT anyHeavy(AirlineID) AS res
FROM ontime
```

```text
┌───res─┐
│ 19690 │
└───────┘
```
