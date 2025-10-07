---
'description': 'ClickHouse における Map データ型のドキュメント'
'sidebar_label': 'Map(K, V)'
'sidebar_position': 36
'slug': '/sql-reference/data-types/map'
'title': 'Map(K, V)'
'doc_type': 'reference'
---


# Map(K, V)

データ型 `Map(K, V)` はキーと値のペアを保存します。

他のデータベースとは異なり、ClickHouse のマップは一意ではなく、つまり、マップには同じキーを持つ二つの要素を含めることができます。
（その理由は、マップが内部的に `Array(Tuple(K, V))` として実装されているためです。）

`m[k]` という構文を使用して、マップ `m` 内のキー `k` に対する値を取得できます。
また、`m[k]` はマップをスキャンするため、操作の実行時間はマップのサイズに対して線形です。

**パラメータ**

- `K` — マップキーの型。 [Nullable](../../sql-reference/data-types/nullable.md) と [LowCardinality](../../sql-reference/data-types/lowcardinality.md) でネストされた [Nullable](../../sql-reference/data-types/nullable.md) 型を除く任意の型。
- `V` — マップ値の型。任意の型。

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

リクエストされたキー `k` がマップに存在しない場合、`m[k]` は値の型のデフォルト値を返します。例えば、整数型の場合は `0`、文字列型の場合は `''` です。
マップにキーが存在するかどうかを確認するには、関数 [mapContains](../../sql-reference/functions/tuple-map-functions#mapcontains) を使用できます。

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

## Tuple から Map への変換 {#converting-tuple-to-map}

`Tuple()` 型の値は、関数 [CAST](/sql-reference/functions/type-conversion-functions#cast) を使用して `Map()` 型の値にキャストできます。

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

## マップのサブカラムを読み取る {#reading-subcolumns-of-map}

マップ全体を読み込むのを避けるために、特定のケースではサブカラム `keys` および `values` を使用できます。

**例**

クエリ：

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE = Memory;
INSERT INTO tab VALUES (map('key1', 1, 'key2', 2, 'key3', 3));

SELECT m.keys FROM tab; --   same as mapKeys(m)
SELECT m.values FROM tab; -- same as mapValues(m)
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

**関連情報**

- [map()](/sql-reference/functions/tuple-map-functions#map) 関数
- [CAST()](/sql-reference/functions/type-conversion-functions#cast) 関数
- [-Map データ型の Map コンビネータ](../aggregate-functions/combinators.md#-map)

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse での可観測性ソリューションの構築 - パート 2 - トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
