---
description: '辞書操作用の関数に関するドキュメント'
sidebar_label: '辞書'
slug: /sql-reference/functions/ext-dict-functions
title: '辞書操作用の関数'
doc_type: 'reference'
---

# 辞書を扱う関数 {#functions-for-working-with-dictionaries}

:::note
[DDL クエリ](../../sql-reference/statements/create/dictionary.md)で作成された辞書の場合、`dict_name` パラメーターは `<database>.<dict_name>` のように完全修飾名で指定する必要があります。省略した場合は、現在のデータベースが使用されます。
:::

辞書の接続と設定の方法については、[辞書](../../sql-reference/dictionaries/index.md)を参照してください。

## dictGet、dictGetOrDefault、dictGetOrNull {#dictget-dictgetordefault-dictgetornull}

ディクショナリから値を取得します。

```sql
dictGet('dict_name', attr_names, id_expr)
dictGetOrDefault('dict_name', attr_names, id_expr, default_value_expr)
dictGetOrNull('dict_name', attr_name, id_expr)
```

**引数**

* `dict_name` — 辞書の名前。[文字列リテラル](/sql-reference/syntax#string)。
* `attr_names` — 辞書の列名を指定する [String literal](/sql-reference/syntax#string)、または列名のタプルを指定する [Tuple](/sql-reference/data-types/tuple)([String literal](/sql-reference/syntax#string))。
* `id_expr` — キーの値。ディクショナリの設定に応じて、ディクショナリのキー型の値または [Tuple](../data-types/tuple.md) 型の値を返す [Expression](/sql-reference/syntax#expressions) です。
* `default_value_expr` — 辞書に `id_expr` キーを持つ行が存在しない場合に返される値。[Expression](/sql-reference/syntax#expressions) または [Tuple](../data-types/tuple.md)([Expression](/sql-reference/syntax#expressions)) であり、`attr_names` 属性に対して設定されたデータ型で値（または複数の値）を返します。

**返り値**

* ClickHouse が [属性のデータ型](/sql-reference/dictionaries#dictionary-key-and-fields) に従って属性を正常にパースできた場合、関数は `id_expr` に対応する辞書の属性の値を返します。

* 辞書に `id_expr` に対応するキーが存在しない場合は、次のようになります。

  * `dictGet` は、辞書の設定で対象の属性に対して指定された `<null_value>` 要素の内容を返します。
  * `dictGetOrDefault` は、`default_value_expr` パラメータとして渡された値を返します。
  * `dictGetOrNull` は、キーが辞書内で見つからなかった場合に `NULL` を返します。

ClickHouseは、属性値を解析できない場合、または属性値がデータ型と一致しない場合に例外をスローします。

**シンプルキーディクショナリの例**

以下の内容を含むテキストファイル `ext-dict-test.csv` を作成します：

```text
1,1
2,2
```

最初の列は `id`、2番目の列は `c1` です。

ディクショナリを設定する:

```xml
<clickhouse>
    <dictionary>
        <name>ext-dict-test</name>
        <source>
            <file>
                <path>/path-to/ext-dict-test.csv</path>
                <format>CSV</format>
            </file>
        </source>
        <layout>
            <flat />
        </layout>
        <structure>
            <id>
                <name>id</name>
            </id>
            <attribute>
                <name>c1</name>
                <type>UInt32</type>
                <null_value></null_value>
            </attribute>
        </structure>
        <lifetime>0</lifetime>
    </dictionary>
</clickhouse>
```

クエリを実行してください:

```sql
SELECT
    dictGetOrDefault('ext-dict-test', 'c1', number + 1, toUInt32(number * 10)) AS val,
    toTypeName(val) AS type
FROM system.numbers
LIMIT 3;
```

```text
┌─val─┬─type───┐
│   1 │ UInt32 │
│   2 │ UInt32 │
│  20 │ UInt32 │
└─────┴────────┘
```

**複合キーディクショナリの例**

以下の内容を含むテキストファイル `ext-dict-mult.csv` を作成します：

```text
1,1,'1'
2,2,'2'
3,3,'3'
```

最初の列は `id`、2番目は `c1`、3番目は `c2` です。

ディクショナリを設定する:

```xml
<clickhouse>
    <dictionary>
        <name>ext-dict-mult</name>
        <source>
            <file>
                <path>/path-to/ext-dict-mult.csv</path>
                <format>CSV</format>
            </file>
        </source>
        <layout>
            <flat />
        </layout>
        <structure>
            <id>
                <name>id</name>
            </id>
            <attribute>
                <name>c1</name>
                <type>UInt32</type>
                <null_value></null_value>
            </attribute>
            <attribute>
                <name>c2</name>
                <type>String</type>
                <null_value></null_value>
            </attribute>
        </structure>
        <lifetime>0</lifetime>
    </dictionary>
</clickhouse>
```

クエリを実行してください:

```sql
SELECT
    dictGet('ext-dict-mult', ('c1','c2'), number + 1) AS val,
    toTypeName(val) AS type
FROM system.numbers
LIMIT 3;
```

```text
┌─val─────┬─type──────────────────┐
│ (1,'1') │ Tuple(UInt8, String)  │
│ (2,'2') │ Tuple(UInt8, String)  │
│ (3,'3') │ Tuple(UInt8, String)  │
└─────────┴───────────────────────┘
```

**範囲キー辞書の例**

入力テーブル：

````sql
範囲キーディクショナリのソーステーブルを作成します:

```sql
CREATE TABLE range_key_dictionary_source_table
(
    key UInt64,
    start_date Date,
    end_date Date,
    value String,
    value_nullable Nullable(String)
)
ENGINE = TinyLog();
```

データを挿入します:

```sql
INSERT INTO range_key_dictionary_source_table VALUES(1, toDate('2019-05-20'), toDate('2019-05-20'), 'First', 'First');
INSERT INTO range_key_dictionary_source_table VALUES(2, toDate('2019-05-20'), toDate('2019-05-20'), 'Second', NULL);
INSERT INTO range_key_dictionary_source_table VALUES(3, toDate('2019-05-20'), toDate('2019-05-20'), 'Third', 'Third');
```
````

辞書を作成します。

```sql
CREATE DICTIONARY range_key_dictionary
(
    key UInt64,
    start_date Date,
    end_date Date,
    value String,
    value_nullable Nullable(String)
)
PRIMARY KEY key
SOURCE(CLICKHOUSE(HOST 'localhost' PORT tcpPort() TABLE 'range_key_dictionary_source_table'))
LIFETIME(MIN 1 MAX 1000)
LAYOUT(RANGE_HASHED())
RANGE(MIN start_date MAX end_date);
```

次のクエリを実行します:

```sql
SELECT
    (number, toDate('2019-05-20')),
    dictHas('range_key_dictionary', number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', 'value', number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', 'value_nullable', number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', ('value', 'value_nullable'), number, toDate('2019-05-20'))
FROM system.numbers LIMIT 5 FORMAT TabSeparated;
```

結果:

```text
(0,'2019-05-20')        0       \N      \N      (NULL,NULL)
(1,'2019-05-20')        1       First   First   ('First','First')
(2,'2019-05-20')        1       Second  \N      ('Second',NULL)
(3,'2019-05-20')        1       Third   Third   ('Third','Third')
(4,'2019-05-20')        0       \N      \N      (NULL,NULL)
```

**関連項目**

* [ディクショナリ](../../sql-reference/dictionaries/index.md)


## dictHas {#dicthas}

辞書内に指定したキーが存在するかどうかを確認します。

```sql
dictHas('dict_name', id_expr)
```

**引数**

* `dict_name` — 辞書の名前。[文字列リテラル](/sql-reference/syntax#string)。
* `id_expr` — キーの値。辞書の設定に応じて、辞書のキー型の値または [Tuple](../data-types/tuple.md) 型の値を返す [式](/sql-reference/syntax#expressions)。

**戻り値**

* キーが存在しない場合は 0。[UInt8](../data-types/int-uint.md)。
* キーが存在する場合は 1。[UInt8](../data-types/int-uint.md)。


## dictGetHierarchy {#dictgethierarchy}

[階層型ディクショナリ](../../sql-reference/dictionaries/index.md#hierarchical-dictionaries)内のキーについて、そのすべての親要素を含む配列を作成します。

**構文**

```sql
dictGetHierarchy('dict_name', key)
```

**引数**

* `dict_name` — 辞書名。[String literal](/sql-reference/syntax#string)。
* `key` — キー値。[Expression](/sql-reference/syntax#expressions) で、[UInt64](../data-types/int-uint.md) 型の値を返します。

**戻り値**

* キーに対応する親の配列。[Array(UInt64)](../data-types/array.md)。


## dictIsIn {#dictisin}

辞書内の階層構造全体をたどって、キーの先祖を確認します。

```sql
dictIsIn('dict_name', child_id_expr, ancestor_id_expr)
```

**引数**

* `dict_name` — 辞書の名前。[String literal](/sql-reference/syntax#string)。
* `child_id_expr` — チェック対象となるキー。[Expression](/sql-reference/syntax#expressions) で、[UInt64](../data-types/int-uint.md) 型の値を返します。
* `ancestor_id_expr` — `child_id_expr` キーの想定される祖先キー。[Expression](/sql-reference/syntax#expressions) で、[UInt64](../data-types/int-uint.md) 型の値を返します。

**戻り値**

* `child_id_expr` が `ancestor_id_expr` の子でない場合は 0。[UInt8](../data-types/int-uint.md)。
* `child_id_expr` が `ancestor_id_expr` の子である場合、または `child_id_expr` が `ancestor_id_expr` 自身である場合は 1。[UInt8](../data-types/int-uint.md)。


## dictGetChildren {#dictgetchildren}

直下の子要素をインデックスの配列として返します。これは [dictGetHierarchy](#dictgethierarchy) の逆変換です。

**構文**

```sql
dictGetChildren(dict_name, key)
```

**引数**

* `dict_name` — 辞書の名前。[文字列リテラル](/sql-reference/syntax#string)。
* `key` — キーの値。[式](/sql-reference/syntax#expressions)で、[UInt64](../data-types/int-uint.md) 型の値を返します。

**戻り値**

* 指定したキーの第1階層の子孫。[Array](../data-types/array.md)([UInt64](../data-types/int-uint.md))。

**例**

次の階層型辞書を考えます。

```text
┌─id─┬─parent_id─┐
│  1 │         0 │
│  2 │         1 │
│  3 │         1 │
│  4 │         2 │
└────┴───────────┘
```

第1レベルの子要素:

```sql
SELECT dictGetChildren('hierarchy_flat_dictionary', number) FROM system.numbers LIMIT 4;
```

```text
┌─dictGetChildren('hierarchy_flat_dictionary', number)─┐
│ [1]                                                  │
│ [2,3]                                                │
│ [4]                                                  │
│ []                                                   │
└──────────────────────────────────────────────────────┘
```


## dictGetDescendant {#dictgetdescendant}

[dictGetChildren](#dictgetchildren) 関数を `level` 回にわたって再帰的に適用した場合と同様に、すべての子孫を返します。

**構文**

```sql
dictGetDescendants(dict_name, key, level)
```

**引数**

* `dict_name` — 辞書名。[文字列リテラル](/sql-reference/syntax#string)。
* `key` — キーの値。[式](/sql-reference/syntax#expressions)で、[UInt64](../data-types/int-uint.md) 型の値を返します。
* `level` — 階層レベル。`level = 0` の場合は、末端までのすべての子孫を返します。[UInt8](../data-types/int-uint.md)。

**戻り値**

* 指定したキーの子孫。[Array](../data-types/array.md)([UInt64](../data-types/int-uint.md))。

**例**

次のような階層型辞書を考えます:

```text
┌─id─┬─parent_id─┐
│  1 │         0 │
│  2 │         1 │
│  3 │         1 │
│  4 │         2 │
└────┴───────────┘
```

すべての子孫:

```sql
SELECT dictGetDescendants('hierarchy_flat_dictionary', number) FROM system.numbers LIMIT 4;
```

```text
┌─dictGetDescendants('hierarchy_flat_dictionary', number)─┐
│ [1,2,3,4]                                               │
│ [2,3,4]                                                 │
│ [4]                                                     │
│ []                                                      │
└─────────────────────────────────────────────────────────┘
```

第1階層の子要素：

```sql
SELECT dictGetDescendants('hierarchy_flat_dictionary', number, 1) FROM system.numbers LIMIT 4;
```

```text
┌─dictGetDescendants('hierarchy_flat_dictionary', number, 1)─┐
│ [1]                                                        │
│ [2,3]                                                      │
│ [4]                                                        │
│ []                                                         │
└────────────────────────────────────────────────────────────┘
```


## dictGetAll {#dictgetall}

[正規表現ツリーディクショナリ](../../sql-reference/dictionaries/index.md#regexp-tree-dictionary)の各キーにマッチしたすべてのノードの属性値を取得します。

`T` ではなく `Array(T)` 型の値を返すことを除けば、この関数の動作は [`dictGet`](#dictget-dictgetordefault-dictgetornull) と同様です。

**構文**

```sql
dictGetAll('dict_name', attr_names, id_expr[, limit])
```

**引数**

* `dict_name` — 辞書の名前。[String literal](/sql-reference/syntax#string)。
* `attr_names` — 辞書のカラム名を表す [String literal](/sql-reference/syntax#string)、またはカラム名のタプルを表す [Tuple](/sql-reference/data-types/tuple)([String literal](/sql-reference/syntax#string))。
* `id_expr` — キー値。[Expression](/sql-reference/syntax#expressions) で、辞書の設定に応じて、辞書のキー型の値の配列、または [Tuple](/sql-reference/data-types/tuple) 型の値を返します。
* `limit` - 返される各値配列の最大長。切り詰める際は、親ノードより子ノードが優先され、それ以外の場合は regexp tree dictionary に定義されたリスト順が尊重されます。指定されていない場合、配列長は無制限です。

**戻り値**

* ClickHouse が、辞書で定義された属性のデータ型として属性を正常にパースできた場合、`attr_names` で指定された各属性について、`id_expr` に対応する辞書属性値の配列を返します。

* `id_expr` に対応するキーが辞書内に存在しない場合、空の配列が返されます。

ClickHouse は、属性の値をパースできない場合、または値が属性のデータ型と一致しない場合に例外をスローします。

**例**

次の regexp tree dictionary を想定します：

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    tag String
)
PRIMARY KEY(regexp)
SOURCE(YAMLRegExpTree(PATH '/var/lib/clickhouse/user_files/regexp_tree.yaml'))
LAYOUT(regexp_tree)
...
```

```yaml
# /var/lib/clickhouse/user_files/regexp_tree.yaml {#varlibclickhouseuser_filesregexp_treeyaml}
- regexp: 'foo'
  tag: 'foo_attr'
- regexp: 'bar'
  tag: 'bar_attr'
- regexp: 'baz'
  tag: 'baz_attr'
```

一致するすべての値を取得：

```sql
SELECT dictGetAll('regexp_dict', 'tag', 'foobarbaz');
```

```text
┌─dictGetAll('regexp_dict', 'tag', 'foobarbaz')─┐
│ ['foo_attr','bar_attr','baz_attr']            │
└───────────────────────────────────────────────┘
```

一致する値を最大 2 件取得：

```sql
SELECT dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2);
```

```text
┌─dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2)─┐
│ ['foo_attr','bar_attr']                          │
└──────────────────────────────────────────────────┘
```


## dictGetKeys {#dictgetkeys}

指定した値に等しい属性値を持つ辞書キーを返します。これは、単一の属性に対する [`dictGet`](#dictget-dictgetordefault-dictgetornull) の逆操作です。

**構文**

```sql
dictGetKeys('dict_name', 'attr_name', value_expr);
```

**引数**

* `dict_name` — 辞書の名前。[String literal](/sql-reference/syntax#string)。
* `attr_name` — 辞書の属性列の名前。[String literal](/sql-reference/syntax#string)。
* `value_expr` — 属性と照合する値。属性のデータ型に変換可能な [Expression](/sql-reference/syntax#expressions) です。

**返り値**

* 単一キー辞書の場合: 属性が `value_expr` と等しいキーの配列。[Array(T)](../data-types/array.md)。ここで `T` は辞書キーのデータ型です。

* 複合キー辞書の場合: 属性が `value_expr` と等しいキーのタプルの配列。[Array](../data-types/array.md)([Tuple(T1, T2, ...)](../data-types/tuple.md)) であり、各 `Tuple` には辞書キーの列が順番に含まれます。

* `value_expr` に対応する属性が辞書内に存在しない場合は、空の配列が返されます。

ClickHouse は、属性の値を解釈できない場合、またはその値を属性のデータ型に変換できない場合に例外をスローします。

**例**

次の辞書を例にします:

```txt
 ┌─id─┬─level──┐
 │  1 │ low    │
 │  2 │ high   │
 │  3 │ medium │
 │  4 │ high   │
 └────┴────────┘
```

次に、レベルが `high` のすべての ID を取得してみましょう：

```sql
SELECT dictGetKeys('levels', 'level', 'high') AS ids;
```

```text
 ┌─ids───┐
 │ [4,2] │
 └───────┘
```

:::note
`max_reverse_dictionary_lookup_cache_size_bytes` 設定を使用して、`dictGetKeys` が使用するクエリごとの逆引きキャッシュの最大サイズを制限します。キャッシュには、同じクエリ内で辞書を再スキャンしないように、各属性値に対応するシリアライズ済みキーのタプルが保存されます。キャッシュはクエリ間では永続化されません。上限に達すると、エントリは LRU 方式で削除されます。これは、入力のカーディナリティが低く、ワーキングセットがキャッシュに収まる大規模な辞書で最も効果的です。キャッシュを無効にするには `0` を設定します。

さらに、`attr_name` 列のユニーク値がキャッシュに収まる場合、多くのケースで、関数の実行コストは入力行数に対して線形となり、そこに少数回分の辞書スキャンが加わる程度になります。
:::


## その他の関数 {#other-functions}

ClickHouse は、辞書の設定に依存せず、辞書属性の値を特定のデータ型に変換するための特殊な関数をサポートしています。

関数:

* `dictGetInt8`, `dictGetInt16`, `dictGetInt32`, `dictGetInt64`
* `dictGetUInt8`, `dictGetUInt16`, `dictGetUInt32`, `dictGetUInt64`
* `dictGetFloat32`, `dictGetFloat64`
* `dictGetDate`
* `dictGetDateTime`
* `dictGetUUID`
* `dictGetString`
* `dictGetIPv4`, `dictGetIPv6`

これらすべての関数には、`OrDefault` という修飾子付きのバリアントがあります。例えば、`dictGetDateOrDefault` です。

構文:

```sql
dictGet[Type]('dict_name', 'attr_name', id_expr)
dictGet[Type]OrDefault('dict_name', 'attr_name', id_expr, default_value_expr)
```

**引数**

* `dict_name` — 辞書の名前。[String literal](/sql-reference/syntax#string)。
* `attr_name` — 辞書の列名。[String literal](/sql-reference/syntax#string)。
* `id_expr` — キーの値。辞書の設定に応じて、[UInt64](../data-types/int-uint.md) または [Tuple](../data-types/tuple.md) 型の値を返す [Expression](/sql-reference/syntax#expressions)。
* `default_value_expr` — 辞書に `id_expr` キーを持つ行が存在しない場合に返される値。`attr_name` 属性に設定されているデータ型の値を返す [Expression](/sql-reference/syntax#expressions)。

**戻り値**

* ClickHouse が [属性のデータ型](/sql-reference/dictionaries#dictionary-key-and-fields) で属性を正常に解析できた場合、関数は `id_expr` に対応する辞書属性の値を返します。

* 辞書に要求された `id_expr` が存在しない場合は、次のとおりです。

  * `dictGet[Type]` は、辞書の設定でその属性に対して指定された `<null_value>` 要素の内容を返します。
  * `dictGet[Type]OrDefault` は、`default_value_expr` パラメータとして渡された値を返します。

ClickHouse は、属性の値を解析できない場合、または値が属性のデータ型と一致しない場合に例外を送出します。


## 例となる辞書 {#example-dictionary}

このセクションの例では、次の辞書を使用します。以下で説明する関数の例を実行するには、これらを ClickHouse で作成してください。

<details>
<summary>dictGet&lt;T&gt; および dictGet&lt;T&gt;OrDefault 関数用の例となる辞書</summary>

```sql
-- 必要なすべてのデータ型を含むテーブルを作成
CREATE TABLE all_types_test (
    `id` UInt32,
    
    -- String 型
    `String_value` String,
    
    -- 符号なし整数型
    `UInt8_value` UInt8,
    `UInt16_value` UInt16,
    `UInt32_value` UInt32,
    `UInt64_value` UInt64,
    
    -- 符号付き整数型
    `Int8_value` Int8,
    `Int16_value` Int16,
    `Int32_value` Int32,
    `Int64_value` Int64,
    
    -- 浮動小数点型
    `Float32_value` Float32,
    `Float64_value` Float64,
    
    -- 日付/時刻型
    `Date_value` Date,
    `DateTime_value` DateTime,
    
    -- ネットワーク型
    `IPv4_value` IPv4,
    `IPv6_value` IPv6,
    
    -- UUID 型
    `UUID_value` UUID
) ENGINE = MergeTree() 
ORDER BY id;
```
```sql
-- テストデータを挿入
INSERT INTO all_types_test VALUES
(
    1,                              -- id
    'ClickHouse',                   -- String
    100,                            -- UInt8
    5000,                           -- UInt16
    1000000,                        -- UInt32
    9223372036854775807,            -- UInt64
    -100,                           -- Int8
    -5000,                          -- Int16
    -1000000,                       -- Int32
    -9223372036854775808,           -- Int64
    123.45,                         -- Float32
    987654.123456,                  -- Float64
    '2024-01-15',                   -- Date
    '2024-01-15 10:30:00',          -- DateTime
    '192.168.1.1',                  -- IPv4
    '2001:db8::1',                  -- IPv6
    '550e8400-e29b-41d4-a716-446655440000' -- UUID
)
```

```sql
-- 辞書を作成
CREATE DICTIONARY all_types_dict
(
    id UInt32,
    String_value String,
    UInt8_value UInt8,
    UInt16_value UInt16,
    UInt32_value UInt32,
    UInt64_value UInt64,
    Int8_value Int8,
    Int16_value Int16,
    Int32_value Int32,
    Int64_value Int64,
    Float32_value Float32,
    Float64_value Float64,
    Date_value Date,
    DateTime_value DateTime,
    IPv4_value IPv4,
    IPv6_value IPv6,
    UUID_value UUID
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(HOST 'localhost' PORT 9000 USER 'default' TABLE 'all_types_test' DB 'default'))
LAYOUT(HASHED())
LIFETIME(MIN 300 MAX 600);
```
</details>

<details>
<summary>dictGetAll 用の例となる辞書</summary>

regexp ツリー辞書用のデータを保存するテーブルを作成します：

```sql
CREATE TABLE regexp_os(
    id UInt64,
    parent_id UInt64,
    regexp String,
    keys Array(String),
    values Array(String)
)
ENGINE = Memory;
```

テーブルにデータを挿入します：

```sql
INSERT INTO regexp_os 
SELECT *
FROM s3(
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/' ||
    'user_agent_regex/regexp_os.csv'
);
```

regexp ツリー辞書を作成します：

```sql
CREATE DICTIONARY regexp_tree
(
    regexp String,
    os_replacement String DEFAULT 'Other',
    os_v1_replacement String DEFAULT '0',
    os_v2_replacement String DEFAULT '0',
    os_v3_replacement String DEFAULT '0',
    os_v4_replacement String DEFAULT '0'
)
PRIMARY KEY regexp
SOURCE(CLICKHOUSE(TABLE 'regexp_os'))
LIFETIME(MIN 0 MAX 0)
LAYOUT(REGEXP_TREE);
```
</details>

<details>
  <summary>範囲キー Dictionary の例</summary>

  入力テーブルを作成します：

  ```sql
  CREATE TABLE range_key_dictionary_source_table
  (
      key UInt64,
      start_date Date,
      end_date Date,
      value String,
      value_nullable Nullable(String)
  )
  ENGINE = TinyLog();
  ```

  データを入力テーブルに挿入します：

  ```sql
  INSERT INTO range_key_dictionary_source_table VALUES(1, toDate('2019-05-20'), toDate('2019-05-20'), 'First', 'First');
  INSERT INTO range_key_dictionary_source_table VALUES(2, toDate('2019-05-20'), toDate('2019-05-20'), 'Second', NULL);
  INSERT INTO range_key_dictionary_source_table VALUES(3, toDate('2019-05-20'), toDate('2019-05-20'), 'Third', 'Third');
  ```

  Dictionary を作成します：

  ```sql
  CREATE DICTIONARY range_key_dictionary
  (
      key UInt64,
      start_date Date,
      end_date Date,
      value String,
      value_nullable Nullable(String)
  )
  PRIMARY KEY key
  SOURCE(CLICKHOUSE(HOST 'localhost' PORT tcpPort() TABLE 'range_key_dictionary_source_table'))
  LIFETIME(MIN 1 MAX 1000)
  LAYOUT(RANGE_HASHED())
  RANGE(MIN start_date MAX end_date);
  ```
</details>

<details>
  <summary>複合キー Dictionary の例</summary>

  ソーステーブルを作成します：

  ```sql
  CREATE TABLE dict_mult_source
  (
  id UInt32,
  c1 UInt32,
  c2 String
  ) ENGINE = Memory;
  ```

  データをソーステーブルに挿入します：

  ```sql
  INSERT INTO dict_mult_source VALUES
  (1, 1, '1'),
  (2, 2, '2'),
  (3, 3, '3');
  ```

  Dictionary を作成します：

  ```sql
  CREATE DICTIONARY ext_dict_mult
  (
      id UInt32,
      c1 UInt32,
      c2 String
  )
  PRIMARY KEY id
  SOURCE(CLICKHOUSE(HOST 'localhost' PORT 9000 USER 'default' TABLE 'dict_mult_source' DB 'default'))
  LAYOUT(FLAT())
  LIFETIME(MIN 0 MAX 0);
  ```
</details>

<details>
  <summary>階層型 Dictionary の例</summary>

  ソーステーブルを作成します：

  ```sql
  CREATE TABLE hierarchy_source
  (
    id UInt64,
    parent_id UInt64,
    name String
  ) ENGINE = Memory;
  ```

  データをソーステーブルに挿入します：

  ```sql
  INSERT INTO hierarchy_source VALUES
  (0, 0, 'Root'),
  (1, 0, 'Level 1 - Node 1'),
  (2, 1, 'Level 2 - Node 2'),
  (3, 1, 'Level 2 - Node 3'),
  (4, 2, 'Level 3 - Node 4'),
  (5, 2, 'Level 3 - Node 5'),
  (6, 3, 'Level 3 - Node 6');

  -- 0 (Root)
  -- └── 1 (レベル 1 - ノード 1)
  --     ├── 2 (レベル 2 - ノード 2)
  --     │   ├── 4 (レベル 3 - ノード 4)
  --     │   └── 5 (レベル 3 - ノード 5)
  --     └── 3 (レベル 2 - ノード 3)
  --         └── 6 (レベル 3 - ノード 6)
  ```

  Dictionary を作成します：

  ```sql
  CREATE DICTIONARY hierarchical_dictionary
  (
      id UInt64,
      parent_id UInt64 HIERARCHICAL,
      name String
  )
  PRIMARY KEY id
  SOURCE(CLICKHOUSE(HOST 'localhost' PORT 9000 USER 'default' TABLE 'hierarchy_source' DB 'default'))
  LAYOUT(HASHED())
  LIFETIME(MIN 300 MAX 600);
  ```
</details>

{/* 
  以下のタグ内の内容は、ドキュメントフレームワークのビルド時に
  system.functions から生成されたドキュメントで置き換えられます。タグを変更したり削除したりしないでください。
  詳細は次を参照してください: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }


## dictGet {#dictGet}

導入バージョン: v18.16

Dictionary から値を取得します。

**構文**

```sql
dictGet('dict_name', attr_names, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_names` — Dictionary のカラム名、またはカラム名のタプル。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。`UInt64` または `Tuple(T)` を返す式。[`UInt64`](/sql-reference/data-types/int-uint) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

キーが見つかった場合、`id_expr` に対応する Dictionary の属性値を返します。
キーが見つからない場合、その属性に対して Dictionary の設定で指定された `<null_value>` 要素の内容を返します。

**例**

**単一の属性を取得する**

```sql title=Query
SELECT dictGet('ext_dict_test', 'c1', toUInt64(1)) AS val
```

```response title=Response
1
```

**複数の属性**

```sql title=Query
SELECT
    dictGet('ext_dict_mult', ('c1','c2'), number + 1) AS val,
    toTypeName(val) AS type
FROM system.numbers
LIMIT 3;
```

```response title=Response
┌─val─────┬─type───────────┐
│ (1,'1') │ Tuple(        ↴│
│         │↳    c1 UInt32,↴│
│         │↳    c2 String) │
│ (2,'2') │ Tuple(        ↴│
│         │↳    c1 UInt32,↴│
│         │↳    c2 String) │
│ (3,'3') │ Tuple(        ↴│
│         │↳    c1 UInt32,↴│
│         │↳    c2 String) │
└─────────┴────────────────┘
```


## dictGetAll {#dictGetAll}

導入バージョン: v23.5

Dictionary の設定に関わらず、属性値を `All` データ型に変換します。

**構文**

```sql
dictGetAll(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返します。
対応するものが存在しない場合は、Dictionary 設定でその属性に対して指定されている `<null_value>` 要素の内容を返します。

:::note
ClickHouse は、属性の値を解析できない場合、または値が属性のデータ型と一致しない場合に例外をスローします。
:::

**例**

**使用例**

```sql title=Query
SELECT
    'Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36' AS user_agent,

    -- 該当するすべてのパターンにマッチします
    dictGetAll('regexp_tree', 'os_replacement', 'Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36') AS all_matches,

    -- 最初にマッチしたもののみを返します
    dictGet('regexp_tree', 'os_replacement', 'Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36') AS first_match;
```

```response title=Response
┌─user_agent─────────────────────────────────────────────────────┬─all_matches─────────────────────────────┬─first_match─┐
│ Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36 │ ['Android','Android','Android','Linux'] │ Android     │
└────────────────────────────────────────────────────────────────┴─────────────────────────────────────────┴─────────────┘
```


## dictGetChildren {#dictGetChildren}

導入バージョン: v21.4

第1階層の子をインデックスの配列として返します。これは [dictGetHierarchy](#dictgethierarchy) の逆変換です。

**構文**

```sql
dictGetChildren(dict_name, key)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `key` — 確認対象のキー。[`const String`](/sql-reference/data-types/string)

**戻り値**

指定したキーに対する第 1 階層（直下）の子要素を返します。[`Array(UInt64)`](/sql-reference/data-types/array)

**例**

**Dictionary の第 1 階層（直下）の子要素を取得する**

```sql title=Query
SELECT dictGetChildren('hierarchical_dictionary', 2);
```

```response title=Response
┌─dictGetChild⋯ionary', 2)─┐
│ [4,5]                    │
└──────────────────────────┘
```


## dictGetDate {#dictGetDate}

導入バージョン: v1.1

Dictionary の属性値を、Dictionary の設定に関係なく `Date` データ型に変換します。

**構文**

```sql
dictGetDate(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値（Dictionary の設定に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
それ以外の場合は、その属性について Dictionary 設定で指定された `<null_value>` 要素の内容を返します。

:::note
ClickHouse は、属性の値を解析できない場合、または値が属性のデータ型と一致しない場合に例外をスローします。
:::

**例**

**使用例**

```sql title=Query
SELECT dictGetDate('all_types_dict', 'Date_value', 1)
```

```response title=Response
┌─dictGetDate(⋯_value', 1)─┐
│               2020-01-01 │
└──────────────────────────┘
```


## dictGetDateOrDefault {#dictGetDateOrDefault}

導入バージョン: v1.1

Dictionary の設定に関係なく、属性値を `Date` データ型に変換するか、キーが見つからない場合は指定されたデフォルト値を返します。

**構文**

```sql
dictGetDateOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary の属性（カラム）の名前。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存します）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーの行が存在しない場合に返される値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
存在しない場合は `default_value_expr` パラメータで渡された値を返します。

:::note
ClickHouse は、属性の値をパースできない場合、または値が属性のデータ型と一致しない場合に例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- 存在するキーの場合
SELECT dictGetDate('all_types_dict', 'Date_value', 1);

-- 存在しないキーの場合、指定されたデフォルト値を返す
SELECT dictGetDateOrDefault('all_types_dict', 'Date_value', 999, toDate('1970-01-01'));
```

```response title=Response
┌─dictGetDate(⋯_value', 1)─┐
│               2024-01-15 │
└──────────────────────────┘
┌─dictGetDateO⋯70-01-01'))─┐
│               1970-01-01 │
└──────────────────────────┘
```


## dictGetDateTime {#dictGetDateTime}

導入バージョン: v1.1

Dictionary の設定に依存せず、Dictionary 属性の値を `DateTime` データ型に変換します。

**構文**

```sql
dictGetDateTime(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の構成に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返します。
それ以外の場合は、Dictionary の構成でその属性に対して指定されている `<null_value>` 要素の内容を返します。

:::note
属性の値を解析できない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外を送出します。
:::

**例**

**使用例**

```sql title=Query
SELECT dictGetDateTime('all_types_dict', 'DateTime_value', 1)
```

```response title=Response
┌─dictGetDateT⋯_value', 1)─┐
│      2024-01-15 10:30:00 │
└──────────────────────────┘
```


## dictGetDateTimeOrDefault {#dictGetDateTimeOrDefault}

導入: v1.1

Dictionary の属性値を、Dictionary の設定に関係なく `DateTime` データ型に変換します。キーが見つからない場合は、指定されたデフォルト値を返します。

**構文**

```sql
dictGetDateTimeOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存します）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーの行が存在しない場合に返される値（複数可）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
存在しない場合は `default_value_expr` パラメータとして渡された値を返します。

:::note
属性の値をパースできない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外を送出します。
:::

**例**

**使用例**

```sql title=Query
-- 存在するキーの場合
SELECT dictGetDateTime('all_types_dict', 'DateTime_value', 1);

-- 存在しないキーの場合、指定されたデフォルト値を返す
SELECT dictGetDateTimeOrDefault('all_types_dict', 'DateTime_value', 999, toDateTime('1970-01-01 00:00:00'));
```

```response title=Response
┌─dictGetDateT⋯_value', 1)─┐
│      2024-01-15 10:30:00 │
└──────────────────────────┘
┌─dictGetDateT⋯0:00:00'))──┐
│      1970-01-01 00:00:00 │
└──────────────────────────┘
```


## dictGetDescendants {#dictGetDescendants}

導入バージョン: v21.4

[`dictGetChildren`](#dictGetChildren) 関数を `level` 回再帰的に適用した場合と同様に、すべての子孫を返します。

**構文**

```sql
dictGetDescendants(dict_name, key, level)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `key` — チェック対象のキー。[`const String`](/sql-reference/data-types/string)
* `level` — 階層レベル。`level = 0` の場合、末端までのすべての子孫を返します。[`UInt8`](/sql-reference/data-types/int-uint)

**返り値**

指定されたキーに対する子孫を返します。[`Array(UInt64)`](/sql-reference/data-types/array)

**例**

**Dictionary の第 1 階層の子要素を取得する**

```sql title=Query
-- 以下の階層型Dictionaryを考えます:
-- 0 (ルート)
-- └── 1 (レベル1 - ノード1)
--     ├── 2 (レベル2 - ノード2)
--     │   ├── 4 (レベル3 - ノード4)
--     │   └── 5 (レベル3 - ノード5)
--     └── 3 (レベル2 - ノード3)
--         └── 6 (レベル3 - ノード6)

SELECT dictGetDescendants('hierarchical_dictionary', 0, 2)
```

```response title=Response
┌─dictGetDesce⋯ary', 0, 2)─┐
│ [3,2]                    │
└──────────────────────────┘
```


## dictGetFloat32 {#dictGetFloat32}

導入バージョン: v1.1

Dictionary の属性値を、Dictionary 設定に関係なく `Float32` 型に変換します。

**構文**

```sql
dictGetFloat32(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary の設定に応じて、Dictionary のキー型の値またはタプル値を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返します。
対応する値が存在しない場合は、Dictionary 設定でその属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
属性の値を解析できない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
:::

**例**

**使用例**

```sql title=Query
SELECT dictGetFloat32('all_types_dict', 'Float32_value', 1)
```

```response title=Response
┌─dictGetFloat⋯_value', 1)─┐
│               -123.123   │
└──────────────────────────┘
```


## dictGetFloat32OrDefault {#dictGetFloat32OrDefault}

導入バージョン: v1.1

Dictionary の属性値を、Dictionary の設定に関係なく `Float32` データ型に変換するか、キーが見つからない場合は指定されたデフォルト値を返します。

**構文**

```sql
dictGetFloat32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary で定義されたキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーの行が存在しない場合に返される値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返します。
存在しない場合は、`default_value_expr` パラメータで渡された値を返します。

:::note
ClickHouse は、属性の値を解析できない場合、または値が属性のデータ型と一致しない場合に例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- 存在するキーの場合
SELECT dictGetFloat32('all_types_dict', 'Float32_value', 1);

-- 存在しないキーの場合、指定されたデフォルト値（-1.0）を返す
SELECT dictGetFloat32OrDefault('all_types_dict', 'Float32_value', 999, -1.0);
```

```response title=Response
┌─dictGetFloat⋯_value', 1)─┐
│                   123.45 │
└──────────────────────────┘
┌─dictGetFloat⋯e', 999, -1)─┐
│                       -1  │
└───────────────────────────┘
```


## dictGetFloat64 {#dictGetFloat64}

導入されたバージョン: v1.1

Dictionary の設定に関係なく、Dictionary の属性値を `Float64` データ型に変換します。

**構文**

```sql
dictGetFloat64(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**返り値**

`id_expr` に対応する Dictionary 属性の値を返し、
それ以外の場合は、Dictionary 設定でその属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
属性の値をパースできない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
:::

**例**

**使用例**

```sql title=Query
SELECT dictGetFloat64('all_types_dict', 'Float64_value', 1)
```

```response title=Response
┌─dictGetFloat⋯_value', 1)─┐
│                 -123.123 │
└──────────────────────────┘
```


## dictGetFloat64OrDefault {#dictGetFloat64OrDefault}

導入バージョン: v1.1

Dictionary の属性値を、Dictionary の設定に関係なく `Float64` データ型に変換します。キーが見つからない場合は、指定したデフォルト値を返します。

**構文**

```sql
dictGetFloat64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値（または複数の値）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
存在しない場合は `default_value_expr` パラメータで渡された値を返します。

:::note
ClickHouse は、属性の値をパースできない場合、または値が属性のデータ型と一致しない場合に例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- キーが存在する場合
SELECT dictGetFloat64('all_types_dict', 'Float64_value', 1);

-- キーが存在しない場合、指定されたデフォルト値（nan）を返す
SELECT dictGetFloat64OrDefault('all_types_dict', 'Float64_value', 999, nan);
```

```response title=Response
┌─dictGetFloat⋯_value', 1)─┐
│            987654.123456 │
└──────────────────────────┘
┌─dictGetFloat⋯, 999, nan)─┐
│                      nan │
└──────────────────────────┘
```


## dictGetHierarchy {#dictGetHierarchy}

導入されたバージョン: v1.1

[階層型 Dictionary](../../sql-reference/dictionaries/index.md#hierarchical-dictionaries) 内のキーについて、そのすべての親を含む配列を生成します。

**構文**

```sql
dictGetHierarchy(dict_name, key)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `key` — キー値。[`const String`](/sql-reference/data-types/string)

**戻り値**

指定したキーに対応する親を返します。[`Array(UInt64)`](/sql-reference/data-types/array)

**例**

**キーに対する階層を取得する**

```sql title=Query
SELECT dictGetHierarchy('hierarchical_dictionary', 5)
```

```response title=Response
┌─dictGetHiera⋯ionary', 5)─┐
│ [5,2,1]                  │
└──────────────────────────┘
```


## dictGetIPv4 {#dictGetIPv4}

導入バージョン: v1.1

Dictionary の設定に関係なく、その属性値を `IPv4` データ型に変換します。

**構文**

```sql
dictGetIPv4(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返します。
対応する値がない場合は、Dictionary の設定でその属性に指定された `<null_value>` 要素の内容を返します。

:::note
ClickHouse は、属性の値を解析できない場合、または値が属性のデータ型と一致しない場合に例外をスローします。
:::

**例**

**使用例**

```sql title=Query
SELECT dictGetIPv4('all_types_dict', 'IPv4_value', 1)
```

```response title=Response
┌─dictGetIPv4('all_⋯ 'IPv4_value', 1)─┐
│ 192.168.0.1                         │
└─────────────────────────────────────┘
```


## dictGetIPv4OrDefault {#dictGetIPv4OrDefault}

導入バージョン: v23.1

Dictionary の設定に関係なく、Dictionary の属性の値を `IPv4` データ型に変換し、キーが見つからない場合は指定されたデフォルト値を返します。

**構文**

```sql
dictGetIPv4OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値（複数可）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
存在しない場合は `default_value_expr` パラメータとして渡された値を返します。

:::note
属性の値をパースできない場合、またはその値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- 存在するキーの場合
SELECT dictGetIPv4('all_types_dict', 'IPv4_value', 1);

-- 存在しないキーの場合、指定されたデフォルト値を返す
SELECT dictGetIPv4OrDefault('all_types_dict', 'IPv4_value', 999, toIPv4('0.0.0.0'));
```

```response title=Response
┌─dictGetIPv4('all_⋯ 'IPv4_value', 1)─┐
│ 192.168.0.1                         │
└─────────────────────────────────────┘
┌─dictGetIPv4OrDefa⋯0.0.0.0'))─┐
│ 0.0.0.0                      │
└──────────────────────────────┘
```


## dictGetIPv6 {#dictGetIPv6}

導入: v23.1

Dictionary の設定にかかわらず、属性値を `IPv6` データ型として取得します。

**構文**

```sql
dictGetIPv6(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値（Dictionary の設定に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary の属性値を返します。
対応する値がない場合は、Dictionary 設定でその属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
属性の値を解析できない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
:::

**例**

**使用例**

```sql title=Query
SELECT dictGetIPv6('all_types_dict', 'IPv6_value', 1)
```

```response title=Response
┌─dictGetIPv6('all_⋯ 'IPv6_value', 1)─┐
│ 2001:db8:85a3::8a2e:370:7334        │
└─────────────────────────────────────┘
```


## dictGetIPv6OrDefault {#dictGetIPv6OrDefault}

導入バージョン: v23.1

Dictionary の属性値を、Dictionary の設定に関係なく `IPv6` データ型に変換するか、キーが見つからない場合には指定されたデフォルト値を返します。

**構文**

```sql
dictGetIPv6OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の構成に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値（複数可）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
それ以外の場合は `default_value_expr` パラメータとして渡された値を返します。

:::note
属性の値をパースできない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- 存在するキーの場合
SELECT dictGetIPv6('all_types_dict', 'IPv6_value', 1);

-- 存在しないキーの場合、指定されたデフォルト値を返す
SELECT dictGetIPv6OrDefault('all_types_dict', 'IPv6_value', 999, '::1'::IPv6);
```

```response title=Response
┌─dictGetIPv6('all_⋯ 'IPv6_value', 1)─┐
│ 2001:db8:85a3::8a2e:370:7334        │
└─────────────────────────────────────┘
┌─dictGetIPv6OrDefa⋯:1'::IPv6)─┐
│ ::1                          │
└──────────────────────────────┘
```


## dictGetInt16 {#dictGetInt16}

導入バージョン: v1.1

Dictionary の属性値を、Dictionary の設定に関係なく `Int16` データ型に変換します。

**構文**

```sql
dictGetInt16(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値（Dictionary の設定内容に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返します。
それ以外の場合は、Dictionary の設定でその属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
属性の値をパースできない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外を発生させます。
:::

**例**

**使用例**

```sql title=Query
SELECT dictGetInt16('all_types_dict', 'Int16_value', 1)
```

```response title=Response
┌─dictGetInt16⋯_value', 1)─┐
│                    -5000 │
└──────────────────────────┘
```


## dictGetInt16OrDefault {#dictGetInt16OrDefault}

導入バージョン: v1.1

Dictionary の設定にかかわらず属性値を `Int16` 型として取得し、キーが見つからない場合は指定したデフォルト値を返します。

**構文**

```sql
dictGetInt16OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary で定義されたキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値（複数の場合あり）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary の属性値を返し、
存在しない場合は `default_value_expr` パラメータで渡された値を返します。

:::note
ClickHouse は、属性値を解析できない場合、またはその値が属性のデータ型と一致しない場合に例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- キーが存在する場合
SELECT dictGetInt16('all_types_dict', 'Int16_value', 1);

-- キーが存在しない場合、指定したデフォルト値（-1）を返す
SELECT dictGetInt16OrDefault('all_types_dict', 'Int16_value', 999, -1);
```

```response title=Response
┌─dictGetInt16⋯_value', 1)─┐
│                    -5000 │
└──────────────────────────┘
┌─dictGetInt16⋯', 999, -1)─┐
│                       -1 │
└──────────────────────────┘
```


## dictGetInt32 {#dictGetInt32}

導入バージョン：v1.1

Dictionary の設定に関係なく、その属性値を `Int32` データ型に変換します。

**構文**

```sql
dictGetInt32(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値、またはタプル値（Dictionary の設定に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**返り値**

`id_expr` に対応する Dictionary の属性値を返します。
対応する値がない場合は、その属性について Dictionary の設定で指定された `<null_value>` 要素の内容を返します。

:::note
属性値を解析できない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
:::

**例**

**使用例**

```sql title=Query
SELECT dictGetInt32('all_types_dict', 'Int32_value', 1)
```

```response title=Response
┌─dictGetInt32⋯_value', 1)─┐
│                -1000000  │
└──────────────────────────┘
```


## dictGetInt32OrDefault {#dictGetInt32OrDefault}

導入バージョン: v1.1

Dictionary の属性値を、Dictionary の設定に関係なく `Int32` データ型に変換します。キーが見つからない場合は、指定されたデフォルト値を返します。

**構文**

```sql
dictGetInt32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が含まれていない場合に返される値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary の属性の値を返します。
対応する値が存在しない場合は、`default_value_expr` パラメーターとして渡された値を返します。

:::note
属性の値を解析できない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- キーが存在する場合
SELECT dictGetInt32('all_types_dict', 'Int32_value', 1);

-- キーが存在しない場合、指定したデフォルト値（-1）を返す
SELECT dictGetInt32OrDefault('all_types_dict', 'Int32_value', 999, -1);
```

```response title=Response
┌─dictGetInt32⋯_value', 1)─┐
│                -1000000  │
└──────────────────────────┘
┌─dictGetInt32⋯', 999, -1)─┐
│                       -1 │
└──────────────────────────┘
```


## dictGetInt64 {#dictGetInt64}

導入: v1.1

Dictionary の設定に関係なく、Dictionary の属性の値を `Int64` データ型に変換します。

**構文**

```sql
dictGetInt64(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、または（Dictionary の設定に依存して）値のタプルを返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返します。
対応する値が存在しない場合は、Dictionary 設定でその属性に指定された `<null_value>` 要素の内容を返します。

:::note
ClickHouse は、属性の値を解釈できない場合、または値が属性のデータ型と一致しない場合に例外をスローします。
:::

**例**

**使用例**

```sql title=Query
SELECT dictGetInt64('all_types_dict', 'Int64_value', 1)
```

```response title=Response
┌─dictGetInt64⋯_value', 1)───┐
│       -9223372036854775807 │
└────────────────────────────┘
```


## dictGetInt64OrDefault {#dictGetInt64OrDefault}

導入バージョン: v1.1

Dictionary の属性値を、Dictionary の設定に関係なく `Int64` データ型に変換するか、キーが見つからない場合は指定されたデフォルト値を返します。

**構文**

```sql
dictGetInt64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定による）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary の属性値を返し、
該当しない場合は `default_value_expr` パラメータで渡された値を返します。

:::note
ClickHouse は、属性値を解析できない場合、または値が属性のデータ型と一致しない場合に例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- キーが存在する場合
SELECT dictGetInt64('all_types_dict', 'Int64_value', 1);

-- キーが存在しない場合、指定したデフォルト値（-1）を返す
SELECT dictGetInt64OrDefault('all_types_dict', 'Int64_value', 999, -1);
```

```response title=Response
┌─dictGetInt64⋯_value', 1)─┐
│     -9223372036854775808 │
└──────────────────────────┘
┌─dictGetInt64⋯', 999, -1)─┐
│                       -1 │
└──────────────────────────┘
```


## dictGetInt8 {#dictGetInt8}

導入バージョン: v1.1

Dictionary の設定に関係なく、Dictionary の属性値を `Int8` データ型に変換して返します。

**構文**

```sql
dictGetInt8(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値、または値のタプルを返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返します。
対応する値が存在しない場合は、Dictionary の設定でその属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
ClickHouse は、属性の値をパースできない場合、または値が属性のデータ型と一致しない場合に例外をスローします。
:::

**例**

**使用例**

```sql title=Query
SELECT dictGetInt8('all_types_dict', 'Int8_value', 1)
```

```response title=Response
┌─dictGetInt8(⋯_value', 1)─┐
│                     -100 │
└──────────────────────────┘
```


## dictGetInt8OrDefault {#dictGetInt8OrDefault}

v1.1 で導入

Dictionary の設定に関係なく、Dictionary の属性値を `Int8` データ型に変換し、キーが見つからない場合は指定したデフォルト値を返します。

**構文**

```sql
dictGetInt8OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**返される値**

`id_expr` に対応する Dictionary 属性の値を返し、
それ以外の場合には `default_value_expr` パラメータとして渡された値を返します。

:::note
属性の値をパースできない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- キーが存在する場合
SELECT dictGetInt8('all_types_dict', 'Int8_value', 1);

-- キーが存在しない場合、指定したデフォルト値（-1）を返す
SELECT dictGetInt8OrDefault('all_types_dict', 'Int8_value', 999, -1);
```

```response title=Response
┌─dictGetInt8(⋯_value', 1)─┐
│                     -100 │
└──────────────────────────┘
┌─dictGetInt8O⋯', 999, -1)─┐
│                       -1 │
└──────────────────────────┘
```


## dictGetKeys {#dictGetKeys}

導入バージョン: v25.12

指定された値と等しい属性を持つ Dictionary のキーを返します。これは、単一の属性に対する `dictGet` 関数の逆の動作です。

`dictGetKeys` が使用するクエリごとの逆引きキャッシュのサイズ上限を設定するには、`max_reverse_dictionary_lookup_cache_size_bytes` を使用します。
このキャッシュは、同じクエリ内で Dictionary を再スキャンする必要がないように、各属性値に対応するシリアライズ済みのキーのタプルを保存します。
このキャッシュはクエリ間で永続化されません。上限に達すると、LRU によってエントリが削除されます。
入力のカーディナリティが低く、ワーキングセットがキャッシュに収まるような大きな Dictionary に対して最も効果的です。キャッシュを無効にするには `0` を設定します。

**構文**

```sql
dictGetKeys('dict_name', 'attr_name', value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — 照合する属性名。[`String`](/sql-reference/data-types/string)
* `value_expr` — 属性と照合する値。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**戻り値**

単一キーの Dictionary の場合: 属性が `value_expr` と等しいキーの配列。複合キーの Dictionary の場合: 属性が `value_expr` と等しいキーのタプルの配列。Dictionary 内に `value_expr` に対応する属性が存在しない場合は、空の配列が返されます。属性の値を解析できない場合、または値を属性のデータ型に変換できない場合、ClickHouse は例外をスローします。

**例**

**使用例**

```sql title=Query
SELECT dictGetKeys('task_id_to_priority_dictionary', 'priority_level', 'high') AS ids;
```

```response title=Response
┌─-ids──┐
│ [4,2] │
└───────┘
```


## dictGetOrDefault {#dictGetOrDefault}

導入バージョン: v18.16

Dictionary から値を取得し、キーが見つからない場合はデフォルト値を返します。

**構文**

```sql
dictGetOrDefault('dict_name', attr_names, id_expr, default_value)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_names` — Dictionary のカラム名、またはカラム名のタプル。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。UInt64 または Tuple(T) を返す式です。[`UInt64`](/sql-reference/data-types/int-uint) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value` — キーが見つからない場合に返すデフォルト値。型は属性のデータ型と一致している必要があります。

**戻り値**

キーが見つかった場合、`id_expr` に対応する Dictionary 属性の値を返します。
キーが見つからない場合は、指定された `default_value` を返します。

**例**

**デフォルト値付きで値を取得**

```sql title=Query
SELECT dictGetOrDefault('ext_dict_mult', 'c1', toUInt64(999), 0) AS val
```

```response title=Response
0
```


## dictGetOrNull {#dictGetOrNull}

導入バージョン: v21.4

Dictionary から値を取得し、キーが見つからない場合は NULL を返します。

**構文**

```sql
dictGetOrNull('dict_name', 'attr_name', id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。文字列リテラル。 - `attr_name` — 取得するカラム名。文字列リテラル。 - `id_expr` — キー値。Dictionary のキー型の値を返す式。

**戻り値**

キーが見つかった場合は、`id_expr` に対応する Dictionary 属性値を返します。
キーが見つからない場合は、`NULL` を返します。

**例**

**レンジキーを使用する Dictionary の例**

```sql title=Query
SELECT
    (number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', 'value', number, toDate('2019-05-20')),
FROM system.numbers LIMIT 5 FORMAT TabSeparated;
```

```response title=Response
(0,'2019-05-20')  \N
(1,'2019-05-20')  最初
(2,'2019-05-20')  2番目
(3,'2019-05-20')  3番目
(4,'2019-05-20')  \N
```


## dictGetString {#dictGetString}

導入バージョン: v1.1

Dictionary の属性値を、Dictionary の設定にかかわらず `String` データ型に変換します。

**構文**

```sql
dictGetString(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値またはタプル値（Dictionary の設定に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返します。
対応する値が存在しない場合は、Dictionary の設定でその属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
属性の値をパースできない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外を発生させます。
:::

**例**

**使用例**

```sql title=Query
SELECT dictGetString('all_types_dict', 'String_value', 1)
```

```response title=Response
┌─dictGetString(⋯_value', 1)─┐
│ test string                │
└────────────────────────────┘
```


## dictGetStringOrDefault {#dictGetStringOrDefault}

導入: v1.1

Dictionary の属性値を、Dictionary の設定に関係なく `String` 型に変換します。キーが見つからない場合は、指定されたデフォルト値を返します。

**構文**

```sql
dictGetStringOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
それ以外の場合は `default_value_expr` パラメータとして渡された値を返します。

:::note
属性の値を解析できない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- キーが存在する場合
SELECT dictGetString('all_types_dict', 'String_value', 1);

-- キーが存在しない場合、指定したデフォルト値を返す
SELECT dictGetStringOrDefault('all_types_dict', 'String_value', 999, 'default');
```

```response title=Response
┌─dictGetString(⋯_value', 1)─┐
│ test string                │
└────────────────────────────┘
┌─dictGetStringO⋯ 999, 'default')─┐
│ default                         │
└─────────────────────────────────┘
```


## dictGetUInt16 {#dictGetUInt16}

導入バージョン: v1.1

Dictionary の属性値を、Dictionary の設定内容に関係なく `UInt16` 型に変換します。

**構文**

```sql
dictGetUInt16(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値（Dictionary の設定に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返します。
対応する値が存在しない場合は、Dictionary 設定でその属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
属性の値を解析できない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
:::

**例**

**使用例**

```sql title=Query
SELECT dictGetUInt16('all_types_dict', 'UInt16_value', 1)
```

```response title=Response
┌─dictGetUInt1⋯_value', 1)─┐
│                     5000 │
└──────────────────────────┘
```


## dictGetUInt16OrDefault {#dictGetUInt16OrDefault}

導入バージョン: v1.1

Dictionary の設定に関係なく、Dictionary の属性値を `UInt16` データ型に変換し、キーが見つからない場合は指定されたデフォルト値を返します。

**構文**

```sql
dictGetUInt16OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値、またはタプル値（Dictionary の設定に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値（複数可）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
存在しない場合は `default_value_expr` パラメータで渡された値を返します。

:::note
属性の値を解析できない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外を送出します。
:::

**例**

**使用例**

```sql title=Query
-- 存在するキーの場合
SELECT dictGetUInt16('all_types_dict', 'UInt16_value', 1);

-- 存在しないキーの場合、指定したデフォルト値(0)を返す
SELECT dictGetUInt16OrDefault('all_types_dict', 'UInt16_value', 999, 0);
```

```response title=Response
┌─dictGetUInt1⋯_value', 1)─┐
│                     5000 │
└──────────────────────────┘
┌─dictGetUInt1⋯e', 999, 0)─┐
│                        0 │
└──────────────────────────┘
```


## dictGetUInt32 {#dictGetUInt32}

導入バージョン: v1.1

Dictionary の属性値を、Dictionary の設定に関係なく `UInt32` データ型に変換します。

**構文**

```sql
dictGetUInt32(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値（Dictionary の設定に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
それ以外の場合には、Dictionary の設定でその属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
属性の値をパースできない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外を送出します。
:::

**例**

**使用例**

```sql title=Query
SELECT dictGetUInt32('all_types_dict', 'UInt32_value', 1)
```

```response title=Response
┌─dictGetUInt3⋯_value', 1)─┐
│                  1000000 │
└──────────────────────────┘
```


## dictGetUInt32OrDefault {#dictGetUInt32OrDefault}

導入バージョン: v1.1

Dictionary の属性値を、Dictionary の設定内容に関係なく `UInt32` 型に変換し、キーが見つからない場合には指定されたデフォルト値を返します。

**構文**

```sql
dictGetUInt32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定による）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary の属性値を返し、
存在しない場合は `default_value_expr` パラメータで渡された値を返します。

:::note
属性値を解釈できない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- 存在するキーの場合
SELECT dictGetUInt32('all_types_dict', 'UInt32_value', 1);

-- 存在しないキーの場合、指定したデフォルト値(0)を返す
SELECT dictGetUInt32OrDefault('all_types_dict', 'UInt32_value', 999, 0);
```

```response title=Response
┌─dictGetUInt3⋯_value', 1)─┐
│                  1000000 │
└──────────────────────────┘
┌─dictGetUInt3⋯e', 999, 0)─┐
│                        0 │
└──────────────────────────┘
```


## dictGetUInt64 {#dictGetUInt64}

導入: v1.1

Dictionary の属性の値を、Dictionary の設定に関係なく `UInt64` データ型に変換します。

**構文**

```sql
dictGetUInt64(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値、またはタプル値（Dictionary の構成に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返します。
対応する値が存在しない場合は、Dictionary の構成でその属性に対して指定されている `<null_value>` 要素の内容を返します。

:::note
ClickHouse は、属性の値を解析できない場合、または値が属性のデータ型と一致しない場合に例外をスローします。
:::

**例**

**使用例**

```sql title=Query
SELECT dictGetUInt64('all_types_dict', 'UInt64_value', 1)
```

```response title=Response
┌─dictGetUInt6⋯_value', 1)─┐
│      9223372036854775807 │
└──────────────────────────┘
```


## dictGetUInt64OrDefault {#dictGetUInt64OrDefault}

導入バージョン: v1.1

Dictionary の設定に関係なく Dictionary の属性値を `UInt64` 型に変換し、キーが見つからない場合は指定されたデフォルト値を返します。

**構文**

```sql
dictGetUInt64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
それ以外の場合は `default_value_expr` パラメータで渡された値を返します。

:::note
ClickHouse は、属性の値を解析できない場合、または値が属性のデータ型と一致しない場合に例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- キーが存在する場合
SELECT dictGetUInt64('all_types_dict', 'UInt64_value', 1);

-- キーが存在しない場合、指定されたデフォルト値 (0) を返す
SELECT dictGetUInt64OrDefault('all_types_dict', 'UInt64_value', 999, 0);
```

```response title=Response
┌─dictGetUInt6⋯_value', 1)─┐
│      9223372036854775807 │
└──────────────────────────┘
┌─dictGetUInt6⋯e', 999, 0)─┐
│                        0 │
└──────────────────────────┘
```


## dictGetUInt8 {#dictGetUInt8}

導入バージョン: v1.1

Dictionary の属性値を、Dictionary の設定内容に関係なく `UInt8` データ型に変換します。

**構文**

```sql
dictGetUInt8(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値（Dictionary の設定に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
それ以外の場合には、Dictionary の設定で当該属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
ClickHouse は、属性の値を解析できない場合、または値が属性のデータ型と一致しない場合には例外を送出します。
:::

**例**

**使用例**

```sql title=Query
SELECT dictGetUInt8('all_types_dict', 'UInt8_value', 1)
```

```response title=Response
┌─dictGetUInt8⋯_value', 1)─┐
│                      100 │
└──────────────────────────┘
```


## dictGetUInt8OrDefault {#dictGetUInt8OrDefault}

導入バージョン: v1.1

Dictionary の属性値を、Dictionary の設定に関係なく `UInt8` データ型に変換するか、キーが見つからない場合は指定したデフォルト値を返します。

**構文**

```sql
dictGetUInt8OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーとなる値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
それ以外の場合には `default_value_expr` パラメータとして渡された値を返します。

:::note
ClickHouse は、属性の値をパースできない場合、または値が属性のデータ型と一致しない場合に例外を送出します。
:::

**例**

**使用例**

```sql title=Query
-- 存在するキーの場合
SELECT dictGetUInt8('all_types_dict', 'UInt8_value', 1);

-- 存在しないキーの場合は、指定したデフォルト値(0)を返す
SELECT dictGetUInt8OrDefault('all_types_dict', 'UInt8_value', 999, 0);
```

```response title=Response
┌─dictGetUInt8⋯_value', 1)─┐
│                      100 │
└──────────────────────────┘
┌─dictGetUInt8⋯e', 999, 0)─┐
│                        0 │
└──────────────────────────┘
```


## dictGetUUID {#dictGetUUID}

v1.1 で導入

Dictionary の設定に関係なく、Dictionary の属性値を `UUID` データ型に変換します。

**構文**

```sql
dictGetUUID(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値、またはタプル値（Dictionary の設定に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返します。
対応する値が存在しない場合は、Dictionary の設定でその属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
ClickHouse は、属性の値をパースできない場合、または値が属性のデータ型と一致しない場合に例外をスローします。
:::

**例**

**使用例**

```sql title=Query
SELECT dictGetUUID('all_types_dict', 'UUID_value', 1)
```

```response title=Response
┌─dictGetUUID(⋯_value', 1)─────────────┐
│ 123e4567-e89b-12d3-a456-426614174000 │
└──────────────────────────────────────┘
```


## dictGetUUIDOrDefault {#dictGetUUIDOrDefault}

導入バージョン: v1.1

Dictionary の設定に関係なく、Dictionary の属性の値を `UUID` データ型に変換します。キーが見つからない場合は、指定されたデフォルト値を返します。

**構文**

```sql
dictGetUUIDOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存します）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
対応する値が存在しない場合は `default_value_expr` パラメータで指定された値を返します。

:::note
属性の値を解釈できない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- キーが存在する場合
SELECT dictGetUUID('all_types_dict', 'UUID_value', 1);

-- キーが存在しない場合、指定したデフォルト値を返す
SELECT dictGetUUIDOrDefault('all_types_dict', 'UUID_value', 999, '00000000-0000-0000-0000-000000000000'::UUID);
```

```response title=Response
┌─dictGetUUID('all_t⋯ 'UUID_value', 1)─┐
│ 550e8400-e29b-41d4-a716-446655440000 │
└──────────────────────────────────────┘
┌─dictGetUUIDOrDefa⋯000000000000'::UUID)─┐
│ 00000000-0000-0000-0000-000000000000   │
└────────────────────────────────────────┘
```


## dictHas {#dictHas}

導入バージョン: v1.1

Dictionary にキーが存在するかどうかを確認します。

**構文**

```sql
dictHas('dict_name', id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `id_expr` — キー値。[`const String`](/sql-reference/data-types/string)

**戻り値**

キーが存在する場合は `1`、存在しない場合は `0` を返します。[`UInt8`](/sql-reference/data-types/int-uint)

**例**

**Dictionary 内でキーの存在を確認する**

```sql title=Query
-- 以下の階層型Dictionaryを考えます:
-- 0 (ルート)
-- └── 1 (レベル1 - ノード1)
--     ├── 2 (レベル2 - ノード2)
--     │   ├── 4 (レベル3 - ノード4)
--     │   └── 5 (レベル3 - ノード5)
--     └── 3 (レベル2 - ノード3)
--         └── 6 (レベル3 - ノード6)

SELECT dictHas('hierarchical_dictionary', 2);
SELECT dictHas('hierarchical_dictionary', 7);
```

```response title=Response
┌─dictHas('hie⋯ionary', 2)─┐
│                        1 │
└──────────────────────────┘
┌─dictHas('hie⋯ionary', 7)─┐
│                        0 │
└──────────────────────────┘
```


## dictIsIn {#dictIsIn}

導入バージョン: v1.1

Dictionary 内の階層チェーン全体を対象に、キーの先祖をチェックします。

**構文**

```sql
dictIsIn(dict_name, child_id_expr, ancestor_id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `child_id_expr` — チェック対象のキー。[`String`](/sql-reference/data-types/string)
* `ancestor_id_expr` — キー `child_id_expr` の想定される祖先キー。[`const String`](/sql-reference/data-types/string)

**返り値**

`child_id_expr` が `ancestor_id_expr` の子でない場合は `0` を返し、`child_id_expr` が `ancestor_id_expr` の子である場合、または `child_id_expr` が `ancestor_id_expr` と等しい場合は `1` を返します。[`UInt8`](/sql-reference/data-types/int-uint)

**例**

**階層関係の確認**

```sql title=Query
-- 有効な階層
SELECT dictIsIn('hierarchical_dictionary', 6, 3)

-- 無効な階層
SELECT dictIsIn('hierarchical_dictionary', 3, 5)
```

```response title=Response
┌─dictIsIn('hi⋯ary', 6, 3)─┐
│                        1 │
└──────────────────────────┘
┌─dictIsIn('hi⋯ary', 3, 5)─┐
│                        0 │
└──────────────────────────┘
```

{/*AUTOGENERATED_END*/ }
