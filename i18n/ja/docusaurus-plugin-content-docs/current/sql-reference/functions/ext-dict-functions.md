---
slug: /sql-reference/functions/ext-dict-functions
sidebar_position: 50
sidebar_label: 辞書
---

# 辞書操作のための関数

:::note
[DDLクエリ](../../sql-reference/statements/create/dictionary.md)で作成された辞書の場合、`dict_name` パラメータは完全に指定する必要があります。形式は `<database>.<dict_name>` です。そうでない場合、現在のデータベースが使用されます。
:::

辞書の接続および設定に関する情報は、[辞書](../../sql-reference/dictionaries/index.md)をご覧ください。

## dictGet、dictGetOrDefault、dictGetOrNull {#dictget-dictgetordefault-dictgetornull}

辞書から値を取得します。

``` sql
dictGet('dict_name', attr_names, id_expr)
dictGetOrDefault('dict_name', attr_names, id_expr, default_value_expr)
dictGetOrNull('dict_name', attr_name, id_expr)
```

**引数**

- `dict_name` — 辞書の名前。 [文字列リテラル](../../sql-reference/syntax.md#syntax-string-literal)。
- `attr_names` — 辞書のカラム名、[文字列リテラル](../../sql-reference/syntax.md#syntax-string-literal)またはカラム名のタプル、[タプル](../data-types/tuple.md)([文字列リテラル](../../sql-reference/syntax.md#syntax-string-literal))。
- `id_expr` — キー値。辞書設定に応じて辞書キー型値または[タプル](../data-types/tuple.md)型値を返す[式](../../sql-reference/syntax.md#syntax-expressions)。
- `default_value_expr` — 辞書に `id_expr` キーを持つ行が存在しない場合に返される値。[式](../../sql-reference/syntax.md#syntax-expressions)または[タプル](../data-types/tuple.md)([式](../../sql-reference/syntax.md#syntax-expressions))で、`attr_names` 属性に設定されたデータ型で値（または値群）を返します。

**返される値**

- ClickHouseが[属性のデータ型](../../sql-reference/dictionaries/index.md#dictionary-key-and-fields#ext_dict_structure-attributes)で属性を正常に解析できた場合、関数は `id_expr` に対応する辞書属性の値を返します。

- 辞書に `id_expr` に対応するキーがない場合は、次のようになります：

        - `dictGet` は、辞書設定で属性に指定された `<null_value>` 要素の内容を返します。
        - `dictGetOrDefault` は `default_value_expr` パラメータとして渡された値を返します。
        - `dictGetOrNull` はキーが辞書で見つからなかった場合に `NULL` を返します。

ClickHouseは、属性の値を解析できない場合や、値が属性データ型と一致しない場合に例外をスローします。

**単純キー辞書の例**

テキストファイル `ext-dict-test.csv` を作成し、次の内容を含めます：

``` text
1,1
2,2
```

最初のカラムは `id`、2 番目のカラムは `c1` です。

辞書を設定します：

``` xml
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

``` sql
SELECT
    dictGetOrDefault('ext-dict-test', 'c1', number + 1, toUInt32(number * 10)) AS val,
    toTypeName(val) AS type
FROM system.numbers
LIMIT 3;
```

``` text
┌─val─┬─type───┐
│   1 │ UInt32 │
│   2 │ UInt32 │
│  20 │ UInt32 │
└─────┴────────┘
```

**複合キー辞書の例**

テキストファイル `ext-dict-mult.csv` を作成し、次の内容を含めます：

``` text
1,1,'1'
2,2,'2'
3,3,'3'
```

最初のカラムは `id`、2 番目は `c1`、3 番目は `c2` です。

辞書を設定します：

``` xml
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

``` sql
SELECT
    dictGet('ext-dict-mult', ('c1','c2'), number + 1) AS val,
    toTypeName(val) AS type
FROM system.numbers
LIMIT 3;
```

``` text
┌─val─────┬─type──────────────────┐
│ (1,'1') │ Tuple(UInt8, String)  │
│ (2,'2') │ Tuple(UInt8, String)  │
│ (3,'3') │ Tuple(UInt8, String)  │
└─────────┴───────────────────────┘
```

**範囲キー辞書の例**

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

辞書を作成します：

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

``` sql
SELECT
    (number, toDate('2019-05-20')),
    dictHas('range_key_dictionary', number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', 'value', number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', 'value_nullable', number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', ('value', 'value_nullable'), number, toDate('2019-05-20'))
FROM system.numbers LIMIT 5 FORMAT TabSeparated;
```
結果：

``` text
(0,'2019-05-20')        0       \N      \N      (NULL,NULL)
(1,'2019-05-20')        1       First   First   ('First','First')
(2,'2019-05-20')        1       Second  \N      ('Second',NULL)
(3,'2019-05-20')        1       Third   Third   ('Third','Third')
(4,'2019-05-20')        0       \N      \N      (NULL,NULL)
```

**関連情報**

- [辞書](../../sql-reference/dictionaries/index.md)

## dictHas {#dicthas}

辞書にキーが存在するかどうかを確認します。

``` sql
dictHas('dict_name', id_expr)
```

**引数**

- `dict_name` — 辞書の名前。 [文字列リテラル](../../sql-reference/syntax.md#syntax-string-literal)。
- `id_expr` — キー値。[式](../../sql-reference/syntax.md#syntax-expressions)で辞書キー型値または[タプル](../data-types/tuple.md)型値を返します。

**返される値**

- キーがない場合は 0。 [UInt8](../data-types/int-uint.md)。
- キーがある場合は 1。 [UInt8](../data-types/int-uint.md)。

## dictGetHierarchy {#dictgethierarchy}

[階層辞書](../../sql-reference/dictionaries/index.md#hierarchical-dictionaries)のキーのすべての親を含む配列を作成します。

**構文**

``` sql
dictGetHierarchy('dict_name', key)
```

**引数**

- `dict_name` — 辞書の名前。 [文字列リテラル](../../sql-reference/syntax.md#syntax-string-literal)。
- `key` — キー値。[式](../../sql-reference/syntax.md#syntax-expressions)で[UInt64](../data-types/int-uint.md)型値を返します。

**返される値**

- キーの親。[Array(UInt64)](../data-types/array.md)。

## dictIsIn {#dictisin}

辞書内の階層チェーン全体を通じてキーの祖先をチェックします。

``` sql
dictIsIn('dict_name', child_id_expr, ancestor_id_expr)
```

**引数**

- `dict_name` — 辞書の名前。 [文字列リテラル](../../sql-reference/syntax.md#syntax-string-literal)。
- `child_id_expr` — チェックされるキー。[式](../../sql-reference/syntax.md#syntax-expressions)で[UInt64](../data-types/int-uint.md)型値を返します。
- `ancestor_id_expr` — `child_id_expr` キーの想定される祖先。[式](../../sql-reference/syntax.md#syntax-expressions)で[UInt64](../data-types/int-uint.md)型値を返します。

**返される値**

- `child_id_expr` が `ancestor_id_expr` の子でない場合は 0。 [UInt8](../data-types/int-uint.md)。
- `child_id_expr` が `ancestor_id_expr` の子であるか、または `child_id_expr` が `ancestor_id_expr` である場合は 1。 [UInt8](../data-types/int-uint.md)。

## dictGetChildren {#dictgetchildren}

最初の階層の子をインデックスの配列として返します。これは [dictGetHierarchy](#dictgethierarchy) の逆変換です。

**構文**

``` sql
dictGetChildren(dict_name, key)
```

**引数**

- `dict_name` — 辞書の名前。 [文字列リテラル](../../sql-reference/syntax.md#syntax-string-literal)。
- `key` — キー値。[式](../../sql-reference/syntax.md#syntax-expressions)で[UInt64](../data-types/int-uint.md)型値を返します。

**返される値**

- キーの最初の階層の子。[Array](../data-types/array.md)([UInt64](../data-types/int-uint.md))。

**例**

階層辞書を考えてみましょう：

``` text
┌─id─┬─parent_id─┐
│  1 │         0 │
│  2 │         1 │
│  3 │         1 │
│  4 │         2 │
└────┴───────────┘
```

最初の階層の子：

``` sql
SELECT dictGetChildren('hierarchy_flat_dictionary', number) FROM system.numbers LIMIT 4;
```

``` text
┌─dictGetChildren('hierarchy_flat_dictionary', number)─┐
│ [1]                                                  │
│ [2,3]                                                │
│ [4]                                                  │
│ []                                                   │
└──────────────────────────────────────────────────────┘
```

## dictGetDescendant {#dictgetdescendant}

[dictGetChildren](#dictgetchildren) 関数が `level` 回再帰的に適用されたかのように、すべての子孫を返します。

**構文**

``` sql
dictGetDescendants(dict_name, key, level)
```

**引数**

- `dict_name` — 辞書の名前。 [文字列リテラル](../../sql-reference/syntax.md#syntax-string-literal)。
- `key` — キー値。[式](../../sql-reference/syntax.md#syntax-expressions)で[UInt64](../data-types/int-uint.md)型値を返します。
- `level` — 階層レベル。`level = 0` の場合は全ての子孫を返します。 [UInt8](../data-types/int-uint.md)。

**返される値**

- キーの子孫。[Array](../data-types/array.md)([UInt64](../data-types/int-uint.md))。

**例**

階層辞書を考えてみましょう：

``` text
┌─id─┬─parent_id─┐
│  1 │         0 │
│  2 │         1 │
│  3 │         1 │
│  4 │         2 │
└────┴───────────┘
```
全ての子孫：

``` sql
SELECT dictGetDescendants('hierarchy_flat_dictionary', number) FROM system.numbers LIMIT 4;
```

``` text
┌─dictGetDescendants('hierarchy_flat_dictionary', number)─┐
│ [1,2,3,4]                                               │
│ [2,3,4]                                                 │
│ [4]                                                     │
│ []                                                      │
└─────────────────────────────────────────────────────────┘
```

最初の階層の子孫：

``` sql
SELECT dictGetDescendants('hierarchy_flat_dictionary', number, 1) FROM system.numbers LIMIT 4;
```

``` text
┌─dictGetDescendants('hierarchy_flat_dictionary', number, 1)─┐
│ [1]                                                        │
│ [2,3]                                                      │
│ [4]                                                        │
│ []                                                         │
└────────────────────────────────────────────────────────────┘
```


## dictGetAll {#dictgetall}

[正規表現木辞書](../../sql-reference/dictionaries/index.md#regexp-tree-dictionary)で各キーに一致したノードの属性値を取得します。

この関数は、`T` の代わりに `Array(T)` 型の値を返す以外は、[`dictGet`](#dictget-dictgetordefault-dictgetornull) と同様に動作します。

**構文**

``` sql
dictGetAll('dict_name', attr_names, id_expr[, limit])
```

**引数**

- `dict_name` — 辞書の名前。 [文字列リテラル](../../sql-reference/syntax.md#syntax-string-literal)。
- `attr_names` — 辞書のカラム名、[文字列リテラル](../../sql-reference/syntax.md#syntax-string-literal)またはカラム名のタプル、[タプル](../data-types/tuple.md)([文字列リテラル](../../sql-reference/syntax.md#syntax-string-literal))。
- `id_expr` — キー値。[式](../../sql-reference/syntax.md#syntax-expressions)で辞書キー型値の配列や[タプル](../data-types/tuple.md)型値を返します。
- `limit` - 各値配列の最大長。切り詰める場合、子ノードが親ノードより優先され、他には正規表現木辞書に対して定義されたリスト順序が尊重されます。未指定の場合、配列の長さは制限されません。

**返される値**

- ClickHouseが辞書で定義された属性のデータ型で属性を正常に解析できた場合、`attr_names` に指定された各属性に対応する辞書属性値の配列が返されます。

- 辞書に `id_expr` に対応するキーが存在しない場合、空の配列が返されます。

ClickHouseは、属性の値を解析できない場合や、値が属性データ型と一致しない場合に例外をスローします。

**例**

次の正規表現木辞書を考えてみましょう：

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

すべての一致する値を取得します：

```sql
SELECT dictGetAll('regexp_dict', 'tag', 'foobarbaz');
```

```text
┌─dictGetAll('regexp_dict', 'tag', 'foobarbaz')─┐
│ ['foo_attr','bar_attr','baz_attr']            │
└───────────────────────────────────────────────┘
```

一致する値を最大 2 件取得します：

```sql
SELECT dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2);
```

```text
┌─dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2)─┐
│ ['foo_attr','bar_attr']                          │
└──────────────────────────────────────────────────┘
```

## その他の関数 {#other-functions}

ClickHouse は、辞書設定に関係なく、辞書属性値を特定のデータ型に変換する特殊な関数をサポートしています。

関数：

- `dictGetInt8`, `dictGetInt16`, `dictGetInt32`, `dictGetInt64`
- `dictGetUInt8`, `dictGetUInt16`, `dictGetUInt32`, `dictGetUInt64`
- `dictGetFloat32`, `dictGetFloat64`
- `dictGetDate`
- `dictGetDateTime`
- `dictGetUUID`
- `dictGetString`
- `dictGetIPv4`, `dictGetIPv6`

これらすべての関数には `OrDefault` 修飾子があります。たとえば、`dictGetDateOrDefault` のように。

構文：

``` sql
dictGet[Type]('dict_name', 'attr_name', id_expr)
dictGet[Type]OrDefault('dict_name', 'attr_name', id_expr, default_value_expr)
```

**引数**

- `dict_name` — 辞書の名前。 [文字列リテラル](../../sql-reference/syntax.md#syntax-string-literal)。
- `attr_name` — 辞書のカラム名。 [文字列リテラル](../../sql-reference/syntax.md#syntax-string-literal)。
- `id_expr` — キー値。[式](../../sql-reference/syntax.md#syntax-expressions)で[UInt64](../data-types/int-uint.md)または[タプル](../data-types/tuple.md)型値を返します。
- `default_value_expr` — 辞書に `id_expr` キーを持つ行が存在しない場合に返される値。[式](../../sql-reference/syntax.md#syntax-expressions)で、`attr_name` 属性に設定されたデータ型で値を返します。

**返される値**

- ClickHouseが[属性のデータ型](../../sql-reference/dictionaries/index.md#dictionary-key-and-fields#ext_dict_structure-attributes)で属性を正常に解析できた場合、関数は `id_expr` に対応する辞書属性の値を返します。

- 辞書に要求された `id_expr` が存在しない場合は：

        - `dictGet[Type]` は、辞書設定で属性に指定された `<null_value>` 要素の内容を返します。
        - `dictGet[Type]OrDefault` は `default_value_expr` パラメータとして渡された値を返します。

ClickHouseは、属性の値を解析できない場合や、値が属性データ型と一致しない場合に例外をスローします。
