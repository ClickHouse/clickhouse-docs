description: 'Dictionaryを操作するための関数のドキュメント'
sidebar_label: 'Dictionaries'
sidebar_position: 50
slug: /sql-reference/functions/ext-dict-functions
title: 'Dictionaryを操作するための関数'
```


# Dictionaryを操作するための関数

:::note
[DDLクエリ](../../sql-reference/statements/create/dictionary.md)で作成されたディクショナリの場合、`dict_name`パラメータは`<database>.<dict_name>`のように完全に指定する必要があります。そうでない場合は、現在のデータベースが使用されます。
:::

ディクショナリの接続と構成に関する情報は、[Dictionaries](../../sql-reference/dictionaries/index.md)を参照してください。

## dictGet, dictGetOrDefault, dictGetOrNull {#dictget-dictgetordefault-dictgetornull}

ディクショナリから値を取得します。

```sql
dictGet('dict_name', attr_names, id_expr)
dictGetOrDefault('dict_name', attr_names, id_expr, default_value_expr)
dictGetOrNull('dict_name', attr_name, id_expr)
```

**引数**

- `dict_name` — ディクショナリの名前。 [文字列リテラル](/sql-reference/syntax#string)。
- `attr_names` — ディクショナリのカラムの名前、 [文字列リテラル](/sql-reference/syntax#string)またはカラム名のタプル、 [タプル](/sql-reference/data-types/tuple)([文字列リテラル](/sql-reference/syntax#string)。
- `id_expr` — キー値。 [式](/sql-reference/syntax#expressions) でディクショナリのキータイプ値を返すか、デディクショナリの設定に応じて [タプル](../data-types/tuple.md)タイプの値を返します。
- `default_value_expr` — ディクショナリに`id_expr`キーの行が存在しない場合に返される値。 [式](/sql-reference/syntax#expressions)または [タプル](../data-types/tuple.md)([式](/sql-reference/syntax#expressions))で、`attr_names`属性のために設定されているデータ型の値（または値）を返します。

**返される値**

- ClickHouseが[属性のデータ型](/sql-reference/dictionaries#dictionary-key-and-fields)で属性を正常に解析した場合、関数は`id_expr`に対応するディクショナリアトリビュートの値を返します。

- ディクショナリに`id_expr`に対応するキーがない場合は、次のようになります：

        - `dictGet`は、ディクショナリ設定で指定された属性の`<null_value>`要素の内容を返します。
        - `dictGetOrDefault`は、`default_value_expr`パラメータとして渡された値を返します。
        - `dictGetOrNull`は、キーがディクショナリで見つからなかった場合に`NULL`を返します。

ClickHouseは属性の値を解析できなかった場合や値が属性データ型と一致しない場合、例外を投げます。

**シンプルキー用の例**

次の内容を持つテキストファイル`ext-dict-test.csv`を作成します：

```text
1,1
2,2
```

最初のカラムは`id`、2番目のカラムは`c1`です。

ディクショナリを構成します：

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

クエリを実行します：

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

**複雑なキー用の例**

次の内容を持つテキストファイル`ext-dict-mult.csv`を作成します：

```text
1,1,'1'
2,2,'2'
3,3,'3'
```

最初のカラムは`id`、2番目は`c1`、3番目は`c2`です。

ディクショナリを構成します：

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

クエリを実行します：

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

**範囲キー用の例**

入力テーブル：

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

INSERT INTO range_key_dictionary_source_table VALUES(1, toDate('2019-05-20'), toDate('2019-05-20'), 'First', 'First');
INSERT INTO range_key_dictionary_source_table VALUES(2, toDate('2019-05-20'), toDate('2019-05-20'), 'Second', NULL);
INSERT INTO range_key_dictionary_source_table VALUES(3, toDate('2019-05-20'), toDate('2019-05-20'), 'Third', 'Third');
```

ディクショナリを作成します：

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

クエリを実行します：

```sql
SELECT
    (number, toDate('2019-05-20')),
    dictHas('range_key_dictionary', number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', 'value', number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', 'value_nullable', number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', ('value', 'value_nullable'), number, toDate('2019-05-20'))
FROM system.numbers LIMIT 5 FORMAT TabSeparated;
```
結果：

```text
(0,'2019-05-20')        0       \N      \N      (NULL,NULL)
(1,'2019-05-20')        1       First   First   ('First','First')
(2,'2019-05-20')        1       Second  \N      ('Second',NULL)
(3,'2019-05-20')        1       Third   Third   ('Third','Third')
(4,'2019-05-20')        0       \N      \N      (NULL,NULL)
```

**関連情報**

- [Dictionaries](../../sql-reference/dictionaries/index.md)

## dictHas {#dicthas}

ディクショナリにキーが存在するかどうかを確認します。

```sql
dictHas('dict_name', id_expr)
```

**引数**

- `dict_name` — ディクショナリの名前。 [文字列リテラル](/sql-reference/syntax#string)。
- `id_expr` — キー値。 [式](/sql-reference/syntax#expressions) でディクショナリのキータイプ値を返すか、ディクショナリの設定に応じて[タプル](../data-types/tuple.md)タイプの値を返します。

**返される値**

- キーが存在しない場合は0。 [UInt8](../data-types/int-uint.md)。
- キーが存在する場合は1。 [UInt8](../data-types/int-uint.md)。

## dictGetHierarchy {#dictgethierarchy}

[階層型ディクショナリ](../../sql-reference/dictionaries/index.md#hierarchical-dictionaries)におけるキーのすべての親を含む配列を作成します。

**構文**

```sql
dictGetHierarchy('dict_name', key)
```

**引数**

- `dict_name` — ディクショナリの名前。 [文字列リテラル](/sql-reference/syntax#string)。
- `key` — キー値。 [式](/sql-reference/syntax#expressions) で [UInt64](../data-types/int-uint.md)型の値を返します。

**返される値**

- キーの親。 [配列(UInt64)](../data-types/array.md)。

## dictIsIn {#dictisin}

ディクショナリ内の階層チェーン全体を通じて、キーの祖先を確認します。

```sql
dictIsIn('dict_name', child_id_expr, ancestor_id_expr)
```

**引数**

- `dict_name` — ディクショナリの名前。 [文字列リテラル](/sql-reference/syntax#string)。
- `child_id_expr` — 確認するキー。 [式](/sql-reference/syntax#expressions) で [UInt64](../data-types/int-uint.md)型の値を返します。
- `ancestor_id_expr` — `child_id_expr`キーの考えられる祖先。 [式](/sql-reference/syntax#expressions) で [UInt64](../data-types/int-uint.md)型の値を返します。

**返される値**

- `child_id_expr`が`ancestor_id_expr`の子でない場合は0。 [UInt8](../data-types/int-uint.md)。
- `child_id_expr`が`ancestor_id_expr`の子であるか、または`child_id_expr`が`ancestor_id_expr`である場合は1。 [UInt8](../data-types/int-uint.md)。

## dictGetChildren {#dictgetchildren}

ファーストレベルの子をインデックスの配列として返します。これは[dictGetHierarchy](#dictgethierarchy)の逆変換です。

**構文**

```sql
dictGetChildren(dict_name, key)
```

**引数**

- `dict_name` — ディクショナリの名前。 [文字列リテラル](/sql-reference/syntax#string)。
- `key` — キー値。 [式](/sql-reference/syntax#expressions) で [UInt64](../data-types/int-uint.md)型の値を返します。

**返される値**

- キーのファーストレベルの子。 [配列](../data-types/array.md)([UInt64](../data-types/int-uint.md))。

**例**

次の階層ディクショナリを考えます：

```text
┌─id─┬─parent_id─┐
│  1 │         0 │
│  2 │         1 │
│  3 │         1 │
│  4 │         2 │
└────┴───────────┘
```

ファーストレベルの子：

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

`dictGetChildren`関数が`level`回再帰的に適用されたかのように、すべての子孫を返します。

**構文**

```sql
dictGetDescendants(dict_name, key, level)
```

**引数**

- `dict_name` — ディクショナリの名前。 [文字列リテラル](/sql-reference/syntax#string)。
- `key` — キー値。 [式](/sql-reference/syntax#expressions) で [UInt64](../data-types/int-uint.md)型の値を返します。
- `level` — 階層レベル。 `level = 0` の場合、全ての子孫を返します。 [UInt8](../data-types/int-uint.md)。

**返される値**

- キーの子孫。 [配列](../data-types/array.md)([UInt64](../data-types/int-uint.md))。

**例**

次の階層ディクショナリを考えます：

```text
┌─id─┬─parent_id─┐
│  1 │         0 │
│  2 │         1 │
│  3 │         1 │
│  4 │         2 │
└────┴───────────┘
```
全ての子孫：

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

ファーストレベルの子孫：

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

[正規表現ツリーのディクショナリ](../../sql-reference/dictionaries/index.md#regexp-tree-dictionary)で一致する各キーに対してすべてのノードの属性値を取得します。

この関数は`Array(T)`型の値を返しますが、動作は[`dictGet`](#dictget-dictgetordefault-dictgetornull)と似ています。

**構文**

```sql
dictGetAll('dict_name', attr_names, id_expr[, limit])
```

**引数**

- `dict_name` — ディクショナリの名前。 [文字列リテラル](/sql-reference/syntax#string)。
- `attr_names` — ディクショナリのカラムの名前、 [文字列リテラル](/sql-reference/syntax#string)またはカラム名のタプル、 [タプル](/sql-reference/data-types/tuple)([文字列リテラル](/sql-reference/syntax#string))。
- `id_expr` — キー値。 [式](/sql-reference/syntax#expressions) がディクショナリのキータイプの値の配列またはディクショナリの設定に応じて[タプル](../data-types/tuple)を返します。
- `limit` - 各返された値配列の最大長さ。切り捨て時、子ノードは親ノードより優先され、それ以外の場合は正規表現ツリーのディクショナリの定義されたリストの順序が尊重されます。未指定の場合、配列の長さは無制限です。

**返される値**

- ClickHouseが属性のデータ型として設定されているディクショナリでの属性を正常に解析できた場合、返された`attr_names`で指定された各属性に対応するディクショナリ属性値の配列を返します。

- ディクショナリに`id_expr`に対応するキーがない場合、空の配列が返されます。

ClickHouseは属性の値を解析できなかった場合や値が属性データ型と一致しない場合、例外を投げます。

**例**

次の正規表現ツリーのディクショナリを考えます：

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

# /var/lib/clickhouse/user_files/regexp_tree.yaml
- regexp: 'foo'
  tag: 'foo_attr'
- regexp: 'bar'
  tag: 'bar_attr'
- regexp: 'baz'
  tag: 'baz_attr'
```

一致するすべての値を取得します：

```sql
SELECT dictGetAll('regexp_dict', 'tag', 'foobarbaz');
```

```text
┌─dictGetAll('regexp_dict', 'tag', 'foobarbaz')─┐
│ ['foo_attr','bar_attr','baz_attr']            │
└───────────────────────────────────────────────┘
```

最大2つの一致する値を取得します：

```sql
SELECT dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2);
```

```text
┌─dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2)─┐
│ ['foo_attr','bar_attr']                          │
└──────────────────────────────────────────────────┘
```

## その他の関数 {#other-functions}

ClickHouseは、ディクショナリの設定に関係なく、辞書属性値を特定のデータ型に変換する特別な関数をサポートしています。

関数：

- `dictGetInt8`, `dictGetInt16`, `dictGetInt32`, `dictGetInt64`
- `dictGetUInt8`, `dictGetUInt16`, `dictGetUInt32`, `dictGetUInt64`
- `dictGetFloat32`, `dictGetFloat64`
- `dictGetDate`
- `dictGetDateTime`
- `dictGetUUID`
- `dictGetString`
- `dictGetIPv4`, `dictGetIPv6`

これらの関数はすべて`OrDefault`修飾子を持っています。例えば、`dictGetDateOrDefault`。

構文：

```sql
dictGet[Type]('dict_name', 'attr_name', id_expr)
dictGet[Type]OrDefault('dict_name', 'attr_name', id_expr, default_value_expr)
```

**引数**

- `dict_name` — ディクショナリの名前。 [文字列リテラル](/sql-reference/syntax#string)。
- `attr_name` — ディクショナリのカラムの名前。 [文字列リテラル](/sql-reference/syntax#string)。
- `id_expr` — キー値。 [式](/sql-reference/syntax#expressions) が [UInt64](../data-types/int-uint.md)または[タプル](../data-types/tuple.md)タイプの値を返します。
- `default_value_expr` — ディクショナリに`id_expr`キーの行が存在しない場合に返される値。 [式](/sql-reference/syntax#expressions) が`attr_name`属性のために設定されているデータ型の値を返します。

**返される値**

- ClickHouseが[属性のデータ型](/sql-reference/dictionaries#dictionary-key-and-fields)において、属性を正常に解析できた場合、関数は`id_expr`に対応するディクショナリアトリビュートの値を返します。

- ディクショナリに要求される`id_expr`が存在しない場合：

        - `dictGet[Type]`は、ディクショナリ設定で指定された属性の`<null_value>`要素の内容を返します。
        - `dictGet[Type]OrDefault`は、`default_value_expr`パラメータとして渡された値を返します。

ClickHouseは属性の値を解析できなかった場合や値が属性データ型と一致しない場合、例外を投げます。
