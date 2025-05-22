---
'description': 'Documentation for Functions for Working with Dictionaries'
'sidebar_label': 'Dictionaries'
'sidebar_position': 50
'slug': '/sql-reference/functions/ext-dict-functions'
'title': 'Functions for Working with Dictionaries'
---





# 辞書操作用の関数

:::note
[DDLクエリ](../../sql-reference/statements/create/dictionary.md)で作成された辞書の場合、`dict_name`パラメータは完全に指定する必要があります。例えば、`<database>.<dict_name>`の形式です。そうでない場合、現在のデータベースが使用されます。
:::

辞書の接続と設定に関する情報は、[辞書](../../sql-reference/dictionaries/index.md)を参照してください。

## dictGet, dictGetOrDefault, dictGetOrNull {#dictget-dictgetordefault-dictgetornull}

辞書から値を取得します。

```sql
dictGet('dict_name', attr_names, id_expr)
dictGetOrDefault('dict_name', attr_names, id_expr, default_value_expr)
dictGetOrNull('dict_name', attr_name, id_expr)
```

**引数**

- `dict_name` — 辞書の名前。[文字列リテラル](/sql-reference/syntax#string)。
- `attr_names` — 辞書のカラム名、[文字列リテラル](/sql-reference/syntax#string)またはカラム名のタプル、[タプル](/sql-reference/data-types/tuple)([文字列リテラル](/sql-reference/syntax#string)。
- `id_expr` — キーの値。[式](/sql-reference/syntax#expressions)として辞書のキータイプ値または辞書の設定に応じた[タプル](../data-types/tuple.md)タイプの値を返す。
- `default_value_expr` — 辞書に`id_expr`キーを持つ行がない場合に返される値。[式](/sql-reference/syntax#expressions)または[タプル](../data-types/tuple.md)([式](/sql-reference/syntax#expressions))で、`attr_names`属性に設定されたデータタイプで値を返す。

**返される値**

- ClickHouseが属性を[属性のデータタイプ](/sql-reference/dictionaries#dictionary-key-and-fields)として正常に解析できた場合、関数は`id_expr`に対応する辞書属性の値を返します。

- 辞書に`id_expr`に対応するキーがない場合は次の通りです。

        - `dictGet`は、辞書設定で属性に指定された`<null_value>`要素の内容を返します。
        - `dictGetOrDefault`は、`default_value_expr`パラメータとして渡された値を返します。
        - `dictGetOrNull`は、辞書でキーが見つからなかった場合には`NULL`を返します。

ClickHouseは属性の値を解析できない場合や、値が属性のデータタイプと一致しない場合には例外をスローします。

**単純キー辞書の例**

次の内容を持つテキストファイル `ext-dict-test.csv` を作成します。

```text
1,1
2,2
```

最初のカラムが `id` 、2番目のカラムが `c1` です。

辞書を設定します。

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

クエリを実行します。

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

**複雑キー辞書の例**

次の内容を持つテキストファイル `ext-dict-mult.csv` を作成します。

```text
1,1,'1'
2,2,'2'
3,3,'3'
```

最初のカラムが `id` 、2番目が `c1` 、3番目が `c2` です。

辞書を設定します。

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

クエリを実行します。

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

クエリを実行します。

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

**関連項目**

- [辞書](../../sql-reference/dictionaries/index.md)

## dictHas {#dicthas}

キーが辞書に存在するかどうかを確認します。

```sql
dictHas('dict_name', id_expr)
```

**引数**

- `dict_name` — 辞書の名前。[文字列リテラル](/sql-reference/syntax#string)。
- `id_expr` — キーの値。[式](/sql-reference/syntax#expressions)として辞書のキータイプ値または辞書の設定に応じた[タプル](../data-types/tuple.md)タイプの値を返します。

**返される値**

- キーがない場合は0。[UInt8](../data-types/int-uint.md)。
- キーがある場合は1。[UInt8](../data-types/int-uint.md)。

## dictGetHierarchy {#dictgethierarchy}

キーのすべての親を含む配列を作成します。[階層辞書](../../sql-reference/dictionaries/index.md#hierarchical-dictionaries)。

**構文**

```sql
dictGetHierarchy('dict_name', key)
```

**引数**

- `dict_name` — 辞書の名前。[文字列リテラル](/sql-reference/syntax#string)。
- `key` — キーの値。[式](/sql-reference/syntax#expressions)として[UInt64](../data-types/int-uint.md)型の値を返します。

**返される値**

- キーの親。[Array(UInt64)](../data-types/array.md)。

## dictIsIn {#dictisin}

辞書の階層チェーン全体を通じてキーの先祖を確認します。

```sql
dictIsIn('dict_name', child_id_expr, ancestor_id_expr)
```

**引数**

- `dict_name` — 辞書の名前。[文字列リテラル](/sql-reference/syntax#string)。
- `child_id_expr` — チェックするキー。[式](/sql-reference/syntax#expressions)として[UInt64](../data-types/int-uint.md)型の値を返します。
- `ancestor_id_expr` — `child_id_expr`キーの仮想的な先祖。[式](/sql-reference/syntax#expressions)として[UInt64](../data-types/int-uint.md)型の値を返します。

**返される値**

- `child_id_expr`が`ancestor_id_expr`の子でない場合は0。[UInt8](../data-types/int-uint.md)。
- `child_id_expr`が`ancestor_id_expr`の子であるか、`child_id_expr`が`ancestor_id_expr`である場合は1。[UInt8](../data-types/int-uint.md)。

## dictGetChildren {#dictgetchildren}

最初のレベルの子供をインデックスの配列として返します。それは[dictGetHierarchy](#dictgethierarchy)関数の逆変換です。

**構文**

```sql
dictGetChildren(dict_name, key)
```

**引数**

- `dict_name` — 辞書の名前。[文字列リテラル](/sql-reference/syntax#string)。
- `key` — キーの値。[式](/sql-reference/syntax#expressions)として[UInt64](../data-types/int-uint.md)型の値を返します。

**返される値**

- キーの最初のレベルの子孫。[Array](../data-types/array.md)([UInt64](../data-types/int-uint.md))。

**例**

階層辞書を考えてみましょう。

```text
┌─id─┬─parent_id─┐
│  1 │         0 │
│  2 │         1 │
│  3 │         1 │
│  4 │         2 │
└────┴───────────┘
```

最初のレベルの子供：

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

[dictGetChildren](#dictgetchildren)関数が`level`回再帰的に適用されたかのようにすべての子孫を返します。

**構文**

```sql
dictGetDescendants(dict_name, key, level)
```

**引数**

- `dict_name` — 辞書の名前。[文字列リテラル](/sql-reference/syntax#string)。
- `key` — キーの値。[式](/sql-reference/syntax#expressions)として[UInt64](../data-types/int-uint.md)型の値を返します。
- `level` — 階層レベル。`level = 0`の場合、すべての子孫を最後まで返します。[UInt8](../data-types/int-uint.md)。

**返される値**

- キーの子孫。[Array](../data-types/array.md)([UInt64](../data-types/int-uint.md))。

**例**

階層辞書を考えてみましょう。

```text
┌─id─┬─parent_id─┐
│  1 │         0 │
│  2 │         1 │
│  3 │         1 │
│  4 │         2 │
└────┴───────────┘
```
すべての子孫：

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

最初のレベルの子孫：

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

[正規表現木辞書](../../sql-reference/dictionaries/index.md#regexp-tree-dictionary)に一致する各キーのノードのすべての属性値を取得します。

各値を`Array(T)`として返すことを除いて、この関数は[`dictGet`](#dictget-dictgetordefault-dictgetornull)と同様に動作します。

**構文**

```sql
dictGetAll('dict_name', attr_names, id_expr[, limit])
```

**引数**

- `dict_name` — 辞書の名前。[文字列リテラル](/sql-reference/syntax#string)。
- `attr_names` — 辞書のカラム名、[文字列リテラル](/sql-reference/syntax#string)またはカラム名のタプル、[タプル](/sql-reference/data-types/tuple)([文字列リテラル](/sql-reference/syntax#string))。
- `id_expr` — キーの値。[式](/sql-reference/syntax#expressions)として辞書のキータイプ値の配列または辞書の設定に応じた[タプル](../data-types/tuple)-タイプの値を返す。
- `limit` - 返される各値配列の最大長さ。切り捨てる際には、子ノードが親ノードより優先され、それ以外の場合は正規表現木辞書の定義されたリスト順序が尊重されます。指定されていない場合、配列の長さは無制限です。

**返される値**

- ClickHouseが辞書内で属性を正常に解析した場合、`id_expr`に対応する各属性による辞書の属性値の配列を返します。

- 辞書に`id_expr`に対応するキーがない場合、空の配列が返されます。

ClickHouseは属性の値を解析できない場合や、値が属性のデータタイプと一致しない場合には例外をスローします。

**例**

次の正規表現木辞書を考えます。

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

一致するすべての値を取得します。

```sql
SELECT dictGetAll('regexp_dict', 'tag', 'foobarbaz');
```

```text
┌─dictGetAll('regexp_dict', 'tag', 'foobarbaz')─┐
│ ['foo_attr','bar_attr','baz_attr']            │
└───────────────────────────────────────────────┘
```

一致する値を最大2つ取得します。

```sql
SELECT dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2);
```

```text
┌─dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2)─┐
│ ['foo_attr','bar_attr']                          │
└──────────────────────────────────────────────────┘
```

## その他の関数 {#other-functions}

ClickHouseは、辞書の設定に関係なく、特定のデータタイプに辞書属性値を変換する専門関数をサポートします。

関数：

- `dictGetInt8`, `dictGetInt16`, `dictGetInt32`, `dictGetInt64`
- `dictGetUInt8`, `dictGetUInt16`, `dictGetUInt32`, `dictGetUInt64`
- `dictGetFloat32`, `dictGetFloat64`
- `dictGetDate`
- `dictGetDateTime`
- `dictGetUUID`
- `dictGetString`
- `dictGetIPv4`, `dictGetIPv6`

これらすべての関数には`OrDefault`修飾子があります。例えば、`dictGetDateOrDefault`。

構文：

```sql
dictGet[Type]('dict_name', 'attr_name', id_expr)
dictGet[Type]OrDefault('dict_name', 'attr_name', id_expr, default_value_expr)
```

**引数**

- `dict_name` — 辞書の名前。[文字列リテラル](/sql-reference/syntax#string)。
- `attr_name` — 辞書のカラム名。[文字列リテラル](/sql-reference/syntax#string)。
- `id_expr` — キーの値。[式](/sql-reference/syntax#expressions)として[UInt64](../data-types/int-uint.md)または[タプル](../data-types/tuple.md)タイプの値を返します。
- `default_value_expr` — 辞書に`id_expr`キーを持つ行がない場合に返される値。[式](/sql-reference/syntax#expressions)で、`attr_name`属性に設定されたデータタイプで値を返します。

**返される値**

- ClickHouseが[属性のデータタイプ](/sql-reference/dictionaries#dictionary-key-and-fields)として属性を正常に解析できた場合、関数は`id_expr`に対応する辞書属性の値を返します。

- 辞書に要求された`id_expr`がない場合は：

        - `dictGet[Type]`は、辞書設定で属性に指定された`<null_value>`要素の内容を返します。
        - `dictGet[Type]OrDefault`は、`default_value_expr`パラメータとして渡された値を返します。

ClickHouseは属性の値を解析できない場合や、値が属性のデータタイプと一致しない場合には例外をスローします。
