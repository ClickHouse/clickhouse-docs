---
description: 'ClickHouse の Map データ型に関するドキュメント'
sidebar_label: 'Map(K, V)'
sidebar_position: 36
slug: /sql-reference/data-types/map
title: 'Map(K, V)'
doc_type: 'reference'
---



# Map(K, V)

データ型 `Map(K, V)` はキーと値のペアを格納します。

他のデータベースとは異なり、ClickHouse の map は一意ではありません。つまり、map には同じキーを持つ 2 つの要素を含めることができます。
（これは、map が内部的には `Array(Tuple(K, V))` として実装されているためです。）

構文 `m[k]` を使用して、map `m` 内のキー `k` に対応する値を取得できます。
また、`m[k]` は map 全体を走査するため、この操作の実行時間は map のサイズに対して線形時間になります。

**パラメータ**

* `K` — Map のキーの型。[Nullable](../../sql-reference/data-types/nullable.md) 型および [Nullable](../../sql-reference/data-types/nullable.md) 型をネストした [LowCardinality](../../sql-reference/data-types/lowcardinality.md) 型を除く任意の型。
* `V` — Map の値の型。任意の型。

**例**

map 型のカラムを持つテーブルを作成します：

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE=Memory;
INSERT INTO tab VALUES ({'key1':1, 'key2':10}), ({'key1':2,'key2':20}), ({'key1':3,'key2':30});
```

`key2` の値を選択するには：

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

要求されたキー `k` がマップに含まれていない場合、`m[k]` は値の型のデフォルト値を返します。例えば、整数型では `0`、文字列型では `''` となります。
マップ内にキーが存在するかどうかを確認するには、関数 [mapContains](../../sql-reference/functions/tuple-map-functions#mapcontains) を使用できます。

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE=Memory;
INSERT INTO tab VALUES ({'key1':100}), ({});
SELECT m['key1'] FROM tab;
```

結果：

```text
┌─arrayElement(m, 'key1')─┐
│                     100 │
│                       0 │
└─────────────────────────┘
```


## TupleからMapへの変換 {#converting-tuple-to-map}

`Tuple()`型の値は、[CAST](/sql-reference/functions/type-conversion-functions#cast)関数を使用して`Map()`型の値にキャストできます:

**例**

クエリ:

```sql
SELECT CAST(([1, 2, 3], ['Ready', 'Steady', 'Go']), 'Map(UInt8, String)') AS map;
```

結果:

```text
┌─map───────────────────────────┐
│ {1:'Ready',2:'Steady',3:'Go'} │
└───────────────────────────────┘
```


## Mapのサブカラムの読み取り {#reading-subcolumns-of-map}

マップ全体を読み取らずに済ませるため、場合によってはサブカラム`keys`と`values`を使用できます。

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

- [map()](/sql-reference/functions/tuple-map-functions#map)関数
- [CAST()](/sql-reference/functions/type-conversion-functions#cast)関数
- [Mapデータ型用の-Mapコンビネータ](../aggregate-functions/combinators.md#-map)


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseを使用したオブザーバビリティソリューションの構築 - Part 2 - トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
