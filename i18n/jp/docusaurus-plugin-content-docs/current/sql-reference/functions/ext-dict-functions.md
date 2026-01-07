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
  system.functions から自動生成されたドキュメントに置き換えられます。タグは変更・削除しないでください。
  詳細は次を参照してください: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }


## dictGet {#dictGet}

初出バージョン: v18.16

Dictionary から値を取得します。

**構文**

```sql
dictGet('dict_name', attr_names, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_names` — Dictionary のカラム名、またはカラム名のタプル。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。UInt64/Tuple(T) を返す式。[`UInt64`](/sql-reference/data-types/int-uint) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**返り値**

キーが見つかった場合、id&#95;expr に対応する Dictionary の属性値を返します。
キーが見つからない場合は、Dictionary の設定でその属性に対して指定された `<null_value>` 要素の内容を返します。

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

Dictionary 属性値を、Dictionary の設定に関係なく `All` データ型に変換します。

**構文**

```sql
dictGetAll(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary で定義されたキー型の値、またはタプル値（Dictionary の設定に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**返される値**

`id_expr` に対応する Dictionary 属性の値を返し、
対応する値が存在しない場合は、Dictionary の設定でその属性に対して指定された `<null_value>` 要素の値を返します。

:::note
属性の値をパースできない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
:::

**例**

**使用例**

```sql title=Query
SELECT
    'Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36' AS user_agent,

    -- This will match ALL applicable patterns
    dictGetAll('regexp_tree', 'os_replacement', 'Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36') AS all_matches,

    -- This returns only the first match
    dictGet('regexp_tree', 'os_replacement', 'Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36') AS first_match;
```

```response title=Response
┌─user_agent─────────────────────────────────────────────────────┬─all_matches─────────────────────────────┬─first_match─┐
│ Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36 │ ['Android','Android','Android','Linux'] │ Android     │
└────────────────────────────────────────────────────────────────┴─────────────────────────────────────────┴─────────────┘
```


## dictGetChildren {#dictGetChildren}

導入バージョン: v21.4

第 1 階層の子要素を索引の配列として返します。これは [dictGetHierarchy](#dictGetHierarchy) の逆変換です。

**構文**

```sql
dictGetChildren(dict_name, key)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `key` — 対象となるキー。[`const String`](/sql-reference/data-types/string)

**返される値**

指定したキーに対する第一階層の子要素を返します。[`Array(UInt64)`](/sql-reference/data-types/array)

**例**

**Dictionary の第一階層の子要素を取得する**

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

Dictionary の属性値を、Dictionary の設定に関係なく `Date` 型に変換します。

**構文**

```sql
dictGetDate(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
それ以外の場合は、Dictionary 設定でその属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
属性の値を解析できない場合、またはその値が属性のデータ型と一致しない場合、ClickHouse は例外を送出します。
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

Dictionary の設定に関係なく、Dictionary の属性値を `Date` データ型に変換し、キーが見つからない場合は指定されたデフォルト値を返します。

**構文**

```sql
dictGetDateOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
存在しない場合は `default_value_expr` パラメータとして渡された値を返します。

:::note
ClickHouse は、属性の値を解析できない場合、または値が属性のデータ型と一致しない場合に例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- for key which exists
SELECT dictGetDate('all_types_dict', 'Date_value', 1);

-- for key which does not exist, returns the provided default value
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

Dictionary の属性値を、Dictionary の設定に関係なく `DateTime` 型に変換します。

**構文**

```sql
dictGetDateTime(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値、またはタプル値（Dictionary の構成に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返します。
対応する値が存在しない場合は、Dictionary 構成でその属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
属性の値をパースできない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
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

導入バージョン: v1.1

Dictionary の設定に関係なく、Dictionary の属性値を `DateTime` データ型に変換します。キーが見つからない場合は、指定したデフォルト値を返します。

**構文**

```sql
dictGetDateTimeOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返す値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary の属性値を返し、
存在しない場合は `default_value_expr` パラメータとして渡された値を返します。

:::note
属性値をパースできない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- for key which exists
SELECT dictGetDateTime('all_types_dict', 'DateTime_value', 1);

-- for key which does not exist, returns the provided default value
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

[`dictGetChildren`](#dictGetChildren) 関数を再帰的に `level` 回適用した場合と同様に、すべての子孫を返します。

**構文**

```sql
dictGetDescendants(dict_name, key, level)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `key` — チェックするキー。[`const String`](/sql-reference/data-types/string)
* `level` — 階層レベル。`level = 0` の場合、末端までのすべての子孫を返します。[`UInt8`](/sql-reference/data-types/int-uint)

**戻り値**

指定したキーに対する子孫を返します。[`Array(UInt64)`](/sql-reference/data-types/array)

**使用例**

**Dictionary の第 1 階層の子要素を取得する**

```sql title=Query
-- consider the following hierarchical dictionary:
-- 0 (Root)
-- └── 1 (Level 1 - Node 1)
--     ├── 2 (Level 2 - Node 2)
--     │   ├── 4 (Level 3 - Node 4)
--     │   └── 5 (Level 3 - Node 5)
--     └── 3 (Level 2 - Node 3)
--         └── 6 (Level 3 - Node 6)

SELECT dictGetDescendants('hierarchical_dictionary', 0, 2)
```

```response title=Response
┌─dictGetDesce⋯ary', 0, 2)─┐
│ [3,2]                    │
└──────────────────────────┘
```


## dictGetFloat32 {#dictGetFloat32}

v1.1 で導入。

Dictionary の属性の値を、Dictionary の設定に関係なく `Float32` データ型に変換します。

**構文**

```sql
dictGetFloat32(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**返される値**

`id_expr` に対応する Dictionary 属性の値を返します。
それ以外の場合は、Dictionary の設定で当該属性に指定されている `<null_value>` 要素の内容を返します。

:::note
ClickHouse は、属性の値をパースできない場合、または値が属性のデータ型と一致しない場合に例外をスローします。
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

Dictionary の設定に関係なく、Dictionary 属性の値を `Float32` データ型に変換します。キーが見つからない場合は、指定したデフォルト値を返します。

**構文**

```sql
dictGetFloat32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定によって異なる）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、それ以外の場合は `default_value_expr` パラメータで渡された値を返します。

:::note
属性の値を解析できない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- for key which exists
SELECT dictGetFloat32('all_types_dict', 'Float32_value', 1);

-- for key which does not exist, returns the provided default value (-1.0)
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

導入バージョン: v1.1

Dictionary の設定に関係なく、Dictionary 属性の値を `Float64` 型に変換します。

**構文**

```sql
dictGetFloat64(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary の属性（カラム）名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値、またはタプル値（Dictionary の設定に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**返される値**

`id_expr` に対応する Dictionary の属性の値を返し、
それ以外の場合には、Dictionary の設定でその属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
ClickHouse は、属性の値をパースできない場合、またはその値が属性のデータ型と一致しない場合には、例外をスローします。
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

Dictionary の属性値を、Dictionary の設定に関係なく `Float64` データ型に変換するか、キーが見つからない場合は指定されたデフォルト値を返します。

**構文**

```sql
dictGetFloat64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary で定義されたキー型の値、またはタプル値（Dictionary の設定に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値（群）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
対応する値が存在しない場合は `default_value_expr` パラメータとして渡された値を返します。

:::note
ClickHouse は、属性の値をパースできない場合、または値が属性のデータ型と一致しない場合に例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- for key which exists
SELECT dictGetFloat64('all_types_dict', 'Float64_value', 1);

-- for key which does not exist, returns the provided default value (nan)
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

導入バージョン: v1.1

[階層型 Dictionary](../../sql-reference/dictionaries/index.md#hierarchical-dictionaries) 内のキーについて、そのすべての親を含む配列を返します。

**構文**

```sql
dictGetHierarchy(dict_name, key)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `key` — キーの値。[`const String`](/sql-reference/data-types/string)

**戻り値**

キーに対応する親要素を返します。[`Array(UInt64)`](/sql-reference/data-types/array)

**例**

**キーの階層を取得する**

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

Dictionary の属性値を、Dictionary の設定内容に関係なく `IPv4` データ型に変換します。

**構文**

```sql
dictGetIPv4(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary の属性値を返し、
それ以外の場合は、Dictionary 設定でその属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
属性の値を解析できない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外を送出します。
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

Dictionary の設定に関係なく、Dictionary の属性値を `IPv4` データ型に変換するか、キーが見つからない場合には指定されたデフォルト値を返します。

**構文**

```sql
dictGetIPv4OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値またはタプル値を返す式（具体的な型は Dictionary の設定に依存します）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
該当する行が存在しない場合は、`default_value_expr` パラメータとして渡された値を返します。

:::note
ClickHouse は、属性の値をパースできない場合、または値が属性のデータ型と一致しない場合に例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- for key which exists
SELECT dictGetIPv4('all_types_dict', 'IPv4_value', 1);

-- for key which does not exist, returns the provided default value
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

導入バージョン: v23.1

`Dictionary` の属性値を、Dictionary の設定に関係なく `IPv6` データ型に変換します。

**構文**

```sql
dictGetIPv6(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値（Dictionary の設定に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返します。
対応する値が存在しない場合は、Dictionary の設定でその属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
ClickHouse は、属性の値を解析できない場合、またはその値が属性のデータ型と一致しない場合、例外をスローします。
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

Dictionary の設定に関係なく、Dictionary の属性値を `IPv6` データ型として変換します。キーが見つからない場合は、指定されたデフォルト値を返します。

**構文**

```sql
dictGetIPv6OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存します）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
それ以外の場合には `default_value_expr` パラメータとして渡された値を返します。

:::note
属性の値をパースできない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- for key which exists
SELECT dictGetIPv6('all_types_dict', 'IPv6_value', 1);

-- for key which does not exist, returns the provided default value
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

Dictionary の設定に関わらず、属性値を `Int16` データ型に変換します。

**構文**

```sql
dictGetInt16(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値（Dictionary の設定に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**返される値**

`id_expr` に対応する Dictionary 属性の値を返します。対応する値が存在しない場合は、Dictionary 設定でその属性に対して指定されている `<null_value>` 要素の内容を返します。

:::note
属性の値をパースできない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
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

Dictionary の属性値を、Dictionary の設定に関係なく `Int16` データ型に変換します。キーが見つからない場合は、指定したデフォルト値を返します。

**構文**

```sql
dictGetInt16OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値、またはタプル値を返す式 (Dictionary の設定に依存)。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary の属性の値を返し、存在しない場合は `default_value_expr` パラメータとして渡された値を返します。

:::note
ClickHouse は、属性の値をパースできない場合、または値が属性のデータ型と一致しない場合に例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- for key which exists
SELECT dictGetInt16('all_types_dict', 'Int16_value', 1);

-- for key which does not exist, returns the provided default value (-1)
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

導入バージョン: v1.1

Dictionary の属性値を、Dictionary の設定に関係なく `Int32` データ型に変換します。

**構文**

```sql
dictGetInt32(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値またはタプル値（Dictionary の設定に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**返される値**

`id_expr` に対応する Dictionary 属性の値を返します。
対応する値が存在しない場合は、Dictionary の設定でその属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
属性値を解釈できない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
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

Dictionary の設定に関係なく、Dictionary 属性の値を `Int32` データ型に変換し、キーが見つからない場合は指定されたデフォルト値を返します。

**構文**

```sql
dictGetInt32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーに対応する行が存在しない場合に返される値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
存在しない場合は `default_value_expr` パラメータで渡された値を返します。

:::note
属性の値を解析できない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- for key which exists
SELECT dictGetInt32('all_types_dict', 'Int32_value', 1);

-- for key which does not exist, returns the provided default value (-1)
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

導入バージョン: v1.1

Dictionary の属性値を、Dictionary の設定内容に関係なく `Int64` データ型に変換します。

**構文**

```sql
dictGetInt64(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値（Dictionary の設定に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
それ以外の場合には、Dictionary 設定でその属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
属性の値を解析できない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
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

Dictionary の設定に関係なく、Dictionary の属性値を `Int64` 型に変換するか、キーが見つからない場合は指定されたデフォルト値を返します。

**構文**

```sql
dictGetInt64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存します）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**返される値**

`id_expr` に対応する Dictionary の属性の値を返し、
存在しない場合は `default_value_expr` パラメータとして渡された値を返します。

:::note
属性の値をパースできない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- for key which exists
SELECT dictGetInt64('all_types_dict', 'Int64_value', 1);

-- for key which does not exist, returns the provided default value (-1)
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

Dictionary の属性値を、Dictionary の設定内容に関係なくデータ型 `Int8` に変換します。

**構文**

```sql
dictGetInt8(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値、またはタプル値（Dictionary の設定に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary の属性値を返します。
対応する値が存在しない場合は、Dictionary の設定でその属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
属性値をパースできない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
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

導入バージョン: v1.1

Dictionary の設定に関わらず、Dictionary 属性の値を `Int8` データ型に変換するか、キーが見つからない場合は指定したデフォルト値を返します。

**構文**

```sql
dictGetInt8OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値、またはタプル値（Dictionary の設定に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary の属性値を返し、
対応するものがない場合は `default_value_expr` パラメータとして渡された値を返します。

:::note
属性値をパースできない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外を送出します。
:::

**例**

**使用例**

```sql title=Query
-- for key which exists
SELECT dictGetInt8('all_types_dict', 'Int8_value', 1);

-- for key which does not exist, returns the provided default value (-1)
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

指定された値と等しい属性を持つ Dictionary のキーを返します。この関数は、単一属性に対する `dictGet` の逆操作です。

`dictGetKeys` が利用する、クエリごとの逆引きキャッシュのサイズ上限を制御するには、`max_reverse_dictionary_lookup_cache_size_bytes` を設定します。
このキャッシュは、同一クエリ内で Dictionary を再スキャンすることを避けるために、各属性値ごとにシリアライズされたキーのタプルを保存します。
キャッシュはクエリ間で永続化されません。上限に達すると、LRU に基づいてエントリが破棄されます。
これは、入力のカーディナリティが低く、ワーキングセットがキャッシュに収まるような大きな Dictionary に対して最も効果的です。キャッシュを無効にするには `0` を設定します。

**構文**

```sql
dictGetKeys('dict_name', 'attr_name', value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — 照合対象の属性名。[`String`](/sql-reference/data-types/string)
* `value_expr` — 属性と照合する値。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返される値**

単一キーの Dictionary の場合: 属性の値が `value_expr` と等しいキーの配列。複数キーの Dictionary の場合: 属性の値が `value_expr` と等しいキーのタプルの配列。Dictionary 内に `value_expr` に対応する属性が存在しない場合は、空配列が返されます。ClickHouse は、属性の値をパースできない場合、またはその値を属性のデータ型に変換できない場合に例外をスローします。

**例**

**使用例**

```sql title=Query
SELECT dictGetKeys('task_id_to_priority_dictionary', 'priority_level', 'high') AS ids;
```

```response title=Response
┌─ids───┐
│ [4,2] │
└───────┘
```


## dictGetOrDefault {#dictGetOrDefault}

導入バージョン: v18.16

Dictionary から値を取得します。キーが見つからない場合は、指定したデフォルト値を返します。

**構文**

```sql
dictGetOrDefault('dict_name', attr_names, id_expr, default_value)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_names` — Dictionary のカラム名、またはカラム名のタプル。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。UInt64/Tuple(T) を返す式です。[`UInt64`](/sql-reference/data-types/int-uint) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value` — キーが見つからない場合に返すデフォルト値。型は属性のデータ型と一致している必要があります。

**戻り値**

キーが見つかった場合、`id_expr` で指定されたキーに対応する Dictionary 属性の値を返します。
キーが見つからない場合は、指定された `default_value` を返します。

**使用例**

**デフォルト値付きで値を取得**

```sql title=Query
SELECT dictGetOrDefault('ext_dict_mult', 'c1', toUInt64(999), 0) AS val
```

```response title=Response
0
```


## dictGetOrNull {#dictGetOrNull}

導入バージョン: v21.4

Dictionary から値を取得し、キーが存在しない場合は NULL を返します。

**構文**

```sql
dictGetOrNull('dict_name', 'attr_name', id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。文字列リテラル。 - `attr_name` — 取得するカラムの名前。文字列リテラル。 - `id_expr` — キー値。Dictionary のキー型の値を返す式。

**戻り値**

キーが見つかった場合は、`id_expr` に対応する Dictionary の属性値を返します。
キーが見つからない場合は、`NULL` を返します。

**例**

**範囲キーを持つ Dictionary を使用した例**

```sql title=Query
SELECT
    (number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', 'value', number, toDate('2019-05-20')),
FROM system.numbers LIMIT 5 FORMAT TabSeparated;
```

```response title=Response
(0,'2019-05-20')  \N
(1,'2019-05-20')  First
(2,'2019-05-20')  Second
(3,'2019-05-20')  Third
(4,'2019-05-20')  \N
```


## dictGetString {#dictGetString}

v1.1 で導入。

Dictionary の設定に関係なく、Dictionary の属性値を `String` データ型に変換します。

**構文**

```sql
dictGetString(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値（Dictionary の設定に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、該当するものがない場合は、Dictionary 設定でその属性に対して指定されている `<null_value>` 要素の内容を返します。

:::note
属性の値を解析できない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
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

導入バージョン: v1.1

Dictionary の設定に関係なく、Dictionary の属性値を `String` 型に変換するか、キーが見つからない場合は指定したデフォルト値を返します。

**構文**

```sql
dictGetStringOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーの行が存在しない場合に返される値（複数可）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary の属性値を返し、
存在しない場合は `default_value_expr` パラメータとして渡された値を返します。

:::note
ClickHouse は、属性の値をパースできない場合、またはその値が属性のデータ型と一致しない場合に例外を送出します。
:::

**例**

**使用例**

```sql title=Query
-- for key which exists
SELECT dictGetString('all_types_dict', 'String_value', 1);

-- for key which does not exist, returns the provided default value
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

v1.1 で導入。

Dictionary の属性値を、Dictionary の設定に依存せず `UInt16` データ型に変換します。

**構文**

```sql
dictGetUInt16(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**返される値**

`id_expr` に対応する Dictionary の属性の値を返します。
それ以外の場合は、Dictionary の設定でその属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
ClickHouse は、属性の値をパースできない場合、または値が属性のデータ型と一致しない場合に例外をスローします。
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

Dictionary の設定に関係なく、Dictionary の属性値を `UInt16` データ型に変換するか、キーが見つからない場合は指定されたデフォルト値を返します。

**構文**

```sql
dictGetUInt16OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
存在しない場合には `default_value_expr` パラメータとして渡された値を返します。

:::note
ClickHouse は、属性の値をパースできない場合、または値が属性のデータ型と一致しない場合に例外を送出します。
:::

**例**

**使用例**

```sql title=Query
-- for key which exists
SELECT dictGetUInt16('all_types_dict', 'UInt16_value', 1);

-- for key which does not exist, returns the provided default value (0)
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

この関数は、Dictionary の属性値を Dictionary の設定に関係なく `UInt32` データ型に変換します。

**構文**

```sql
dictGetUInt32(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
対応する値がない場合は、Dictionary の設定でその属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
ClickHouse は、属性の値をパースできない場合、または値が属性のデータ型と一致しない場合に例外を発生させます。
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

Dictionary の属性値を、Dictionary の設定に関係なく `UInt32` データ型に変換します。キーが見つからない場合は、指定されたデフォルト値を返します。

**構文**

```sql
dictGetUInt32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値（複数の場合もあり）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
存在しない場合は `default_value_expr` パラメータで渡された値を返します。

:::note
属性の値を解析できない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外を送出します。
:::

**例**

**使用例**

```sql title=Query
-- for key which exists
SELECT dictGetUInt32('all_types_dict', 'UInt32_value', 1);

-- for key which does not exist, returns the provided default value (0)
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

導入バージョン: v1.1

Dictionary の属性値を、Dictionary の設定内容にかかわらず `UInt64` データ型に変換します。

**構文**

```sql
dictGetUInt64(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型、またはタプル型（Dictionary の設定に依存）の値を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返します。
対応する値がない場合は、Dictionary の設定でその属性に対して指定されている `<null_value>` 要素の内容を返します。

:::note
属性の値をパースできない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
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

追加されたバージョン: v1.1

Dictionary の属性値を、Dictionary の設定内容に関係なく `UInt64` データ型に変換します。キーが見つからない場合は、指定したデフォルト値を返します。

**構文**

```sql
dictGetUInt64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーとなる値。Dictionary のキー型の値、またはタプル値（Dictionary の設定に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値（群）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**返される値**

`id_expr` に対応する Dictionary 属性の値を返し、
それ以外の場合には `default_value_expr` パラメータとして渡された値を返します。

:::note
属性の値を解析できない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- for key which exists
SELECT dictGetUInt64('all_types_dict', 'UInt64_value', 1);

-- for key which does not exist, returns the provideddefault value (0)
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

Dictionary の属性値を、Dictionary の設定に関係なく `UInt8` 型に変換します。

**構文**

```sql
dictGetUInt8(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、該当するキーが存在しない場合は、Dictionary 設定でその属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
属性の値を解釈できないか、値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
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

Dictionary の設定にかかわらず、Dictionary の属性値を `UInt8` データ型に変換します。キーが見つからない場合は、指定されたデフォルト値を返します。

**構文**

```sql
dictGetUInt8OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キー値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存します）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

`id_expr` に対応する Dictionary 属性の値を返し、
存在しない場合は `default_value_expr` パラメータで渡された値を返します。

:::note
属性の値をパースできない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外を発生させます。
:::

**例**

**使用例**

```sql title=Query
-- for key which exists
SELECT dictGetUInt8('all_types_dict', 'UInt8_value', 1);

-- for key which does not exist, returns the provided default value (0)
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

導入バージョン: v1.1

Dictionary の属性値を、Dictionary の設定に関係なく `UUID` データ型に変換します。

**構文**

```sql
dictGetUUID(dict_name, attr_name, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値、またはタプル値（Dictionary の設定に依存）を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**返される値**

`id_expr` に対応する Dictionary 属性の値を返し、
それ以外の場合には、Dictionary 設定においてその属性に対して指定された `<null_value>` 要素の内容を返します。

:::note
ClickHouse は、属性の値を解析できない場合、または値が属性のデータ型と一致しない場合に例外を発生させます。
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

Dictionary の設定に関係なく、Dictionary の属性値を `UUID` データ型に変換し、キーが見つからない場合は指定されたデフォルト値を返します。

**構文**

```sql
dictGetUUIDOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_name` — Dictionary のカラム名。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。Dictionary のキー型の値、またはタプル値を返す式（Dictionary の設定に依存）。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Dictionary に `id_expr` キーを持つ行が存在しない場合に返される値。[`Expression`](/sql-reference/data-types/special-data-types/expression) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**返される値**

`id_expr` に対応する Dictionary 属性の値を返し、
それ以外の場合には、`default_value_expr` パラメータとして渡された値を返します。

:::note
属性の値を解釈できない場合、または値が属性のデータ型と一致しない場合、ClickHouse は例外をスローします。
:::

**例**

**使用例**

```sql title=Query
-- for key which exists
SELECT dictGetUUID('all_types_dict', 'UUID_value', 1);

-- for key which does not exist, returns the provided default value
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

導入: v1.1

Dictionary にキーが存在するかどうかを判定します。

**構文**

```sql
dictHas('dict_name', id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `id_expr` — キー値。[`const String`](/sql-reference/data-types/string)

**返される値**

キーが存在する場合は `1`、存在しない場合は `0` を返します。[`UInt8`](/sql-reference/data-types/int-uint)

**例**

**Dictionary 内にキーが存在するか確認する**

```sql title=Query
-- consider the following hierarchical dictionary:
-- 0 (Root)
-- └── 1 (Level 1 - Node 1)
--     ├── 2 (Level 2 - Node 2)
--     │   ├── 4 (Level 3 - Node 4)
--     │   └── 5 (Level 3 - Node 5)
--     └── 3 (Level 2 - Node 3)
--         └── 6 (Level 3 - Node 6)

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

Dictionary 内で階層構造全体をたどって、キーの祖先を判定します。

**構文**

```sql
dictIsIn(dict_name, child_id_expr, ancestor_id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `child_id_expr` — チェックするキー。[`String`](/sql-reference/data-types/string)
* `ancestor_id_expr` — `child_id_expr` キーの想定される祖先キー。[`const String`](/sql-reference/data-types/string)

**返される値**

`child_id_expr` が `ancestor_id_expr` の子でない場合は `0`、`child_id_expr` が `ancestor_id_expr` の子である場合、または `child_id_expr` 自体が `ancestor_id_expr` である場合は `1` を返します。[`UInt8`](/sql-reference/data-types/int-uint)

**使用例**

**階層関係のチェック**

```sql title=Query
-- valid hierarchy
SELECT dictIsIn('hierarchical_dictionary', 6, 3)

-- invalid hierarchy
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
