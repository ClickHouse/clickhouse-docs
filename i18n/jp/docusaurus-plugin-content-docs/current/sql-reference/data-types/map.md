---
description: 'ClickHouse の Map データ型に関するドキュメント'
sidebar_label: 'Map(K, V)'
sidebar_position: 36
slug: /sql-reference/data-types/map
title: 'Map(K, V)'
doc_type: 'reference'
---



# Map(K, V) {#mapk-v}

データ型 `Map(K, V)` はキーと値のペアを格納します。

他のデータベースと異なり、ClickHouse における map ではキーは一意である必要はありません。つまり、同じキーを持つ要素を 2 つ含むことができます。
（これは、map が内部的には `Array(Tuple(K, V))` として実装されているためです。）

map `m` からキー `k` に対応する値を取得するには、構文 `m[k]` を使用できます。
また、`m[k]` は map を走査するため、この操作の実行時間は map のサイズに比例します。

**パラメータ**

* `K` — Map のキーの型。[Nullable](../../sql-reference/data-types/nullable.md) および [Nullable](../../sql-reference/data-types/nullable.md) 型をネストした [LowCardinality](../../sql-reference/data-types/lowcardinality.md) を除く任意の型。
* `V` — Map の値の型。任意の型。

**例**

map 型のカラムを持つテーブルを作成します。

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE=Memory;
INSERT INTO tab VALUES ({'key1':1, 'key2':10}), ({'key1':2,'key2':20}), ({'key1':3,'key2':30});
```

`key2` の値を選択するには:

```sql
SELECT m['key2'] FROM tab;
```

結果：

```text
┌─arrayElement(m, 'key2')─┐
│                      10 │
│                      20 │
│                      30 │
└─────────────────────────┘
```

指定したキー `k` がマップ内に含まれていない場合、`m[k]` は値型のデフォルト値を返します。例えば、整数型なら `0`、文字列型なら `''` です。
マップ内にキーが存在するかどうかを確認するには、[mapContains](../../sql-reference/functions/tuple-map-functions#mapcontains) 関数を使用します。

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE=Memory;
INSERT INTO tab VALUES ({'key1':100}), ({});
SELECT m['key1'] FROM tab;
```

結果:

```text
┌─arrayElement(m, 'key1')─┐
│                     100 │
│                       0 │
└─────────────────────────┘
```


## Tuple から Map への変換 {#converting-tuple-to-map}

`Tuple()` 型の値は、[CAST](/sql-reference/functions/type-conversion-functions#cast) 関数を使用して `Map()` 型にキャストできます。

**例**

クエリ:

```sql
SELECT CAST(([1, 2, 3], ['Ready', 'Steady', 'Go']), 'Map(UInt8, String)') AS map;
```

結果：

```text
┌─map───────────────────────────┐
│ {1:'Ready',2:'Steady',3:'Go'} │
└───────────────────────────────┘
```


## Map のサブカラムの読み取り {#reading-subcolumns-of-map}

Map 全体を読み出さずに済むように、場合によってはサブカラム `keys` と `values` を使用できます。

**例**

クエリ:

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE = Memory;
INSERT INTO tab VALUES (map('key1', 1, 'key2', 2, 'key3', 3));

SELECT m.keys FROM tab; --   mapKeys(m)と同じ
SELECT m.values FROM tab; -- mapValues(m)と同じ
```

結果:

```text
┌─m.keys─────────────────┐
│ ['key1','key2','key3'] │
└────────────────────────┘

┌─m.values─┐
│ [1,2,3]  │
└──────────┘
```

**関連項目**

* [map()](/sql-reference/functions/tuple-map-functions#map) 関数
* [CAST()](/sql-reference/functions/type-conversion-functions#cast) 関数
* [Map データ型用 -Map コンビネータ](../aggregate-functions/combinators.md#-map)


## 関連コンテンツ {#related-content}

- ブログ記事: [Building an Observability Solution with ClickHouse - Part 2 - Traces](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
