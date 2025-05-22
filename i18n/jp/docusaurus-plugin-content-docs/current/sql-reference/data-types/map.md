---
'description': 'Mapデータ型のClickHouseに関するドキュメント'
'sidebar_label': 'Map(K, V)'
'sidebar_position': 36
'slug': '/sql-reference/data-types/map'
'title': 'Map(K, V)'
---




# Map(K, V)

データ型 `Map(K, V)` はキーと値のペアを格納します。

他のデータベースとは異なり、ClickHouseのマップはユニークではありません。つまり、マップには同じキーを持つ2つの要素を含むことができます。
（その理由は、マップが内部的に `Array(Tuple(K, V))` として実装されているためです。）

構文 `m[k]` を使用して、マップ `m` のキー `k` に対する値を取得できます。
また、`m[k]` はマップをスキャンします。つまり、操作の実行時間はマップのサイズに対して線形になります。

**パラメータ**

- `K` — マップのキーの型。 [Nullable](../../sql-reference/data-types/nullable.md) および [LowCardinality](../../sql-reference/data-types/lowcardinality.md) で、かつ [Nullable](../../sql-reference/data-types/nullable.md) 型とネストされていない任意の型。
- `V` — マップの値の型。任意の型。

**例**

マップ型のカラムを持つテーブルを作成します：

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

要求されたキー `k` がマップに存在しない場合、`m[k]` は値の型のデフォルト値を返します。例えば、整数型の場合は `0`、文字列型の場合は `''` です。
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

`Tuple()` 型の値は、関数 [CAST](/sql-reference/functions/type-conversion-functions#cast) を使用して `Map()` 型の値にキャストできます：

**例**

クエリ：

```sql
SELECT CAST(([1, 2, 3], ['Ready', 'Steady', 'Go']), 'Map(UInt8, String)') AS map;
```

結果：

```text
┌─map───────────────────────────┐
│ {1:'Ready',2:'Steady',3:'Go'} │
└───────────────────────────────┘
```

## Mapのサブカラムを読み取る {#reading-subcolumns-of-map}

マップ全体を読み取らずに済むように、場合によってはサブカラム `keys` と `values` を使用できます。

**例**

クエリ：

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE = Memory;
INSERT INTO tab VALUES (map('key1', 1, 'key2', 2, 'key3', 3));

SELECT m.keys FROM tab; --   mapKeys(m) と同じ
SELECT m.values FROM tab; -- mapValues(m) と同じ
```

結果：

```text
┌─m.keys─────────────────┐
│ ['key1','key2','key3'] │
└────────────────────────┘

┌─m.values─┐
│ [1,2,3]  │
└──────────┘
```

**参照**

- [map()](/sql-reference/functions/tuple-map-functions#map) 関数
- [CAST()](/sql-reference/functions/type-conversion-functions#cast) 関数
- [-Map 機能はマップデータ型のために](../aggregate-functions/combinators.md#-map)

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでの可観測性ソリューションの構築 - パート2 - トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
