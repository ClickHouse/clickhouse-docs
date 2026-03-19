---
description: 'Dictionary のキーおよび属性の構成'
sidebar_label: '属性'
sidebar_position: 2
slug: /sql-reference/statements/create/dictionary/attributes
title: 'Dictionary の属性'
doc_type: 'reference'
---

import CloudDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/sql-reference/statements/create/dictionary/_snippet_dictionary_in_cloud.md';

<CloudDetails />

`structure` 句は、クエリで利用できる Dictionary のキーとフィールドを定義します。

XML による定義:

```xml
<dictionary>
    <structure>
        <id>
            <name>Id</name>
        </id>

        <attribute>
            <!-- Attribute parameters -->
        </attribute>

        ...

    </structure>
</dictionary>
```

属性は、次の要素で定義されます:

* `<id>` — キーカラム
* `<attribute>` — データカラム: 属性を複数定義できます。

DDLクエリ:

```sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- attributes
)
PRIMARY KEY Id
...
```

Attributes are described in the クエリ本体で定義します:

* `PRIMARY KEY` — キーとなるカラム
* `AttrName AttrType` — データ カラム。属性は複数指定できます。


## キー \{#key\}

ClickHouse は次の種類のキーをサポートします：

- 数値キー。型は `UInt64`。`<id>` タグ内、または `PRIMARY KEY` キーワードを使って定義します。
- 複合キー。異なる型の値の Set。`<key>` タグ内、または `PRIMARY KEY` キーワードを使って定義します。

XML 構造では `<id>` か `<key>` のいずれか一方のみを含めることができます。DDL クエリでは `PRIMARY KEY` を 1 つだけ指定しなければなりません。

:::note
キーを属性として定義してはいけません。
:::

### 数値キー \{#numeric-key\}

型: `UInt64`。

設定例：

```xml
<id>
    <name>Id</name>
</id>
```

構成フィールド:

* `name` – キーを持つカラムの名前。

DDL クエリの場合:

```sql
CREATE DICTIONARY (
    Id UInt64,
    ...
)
PRIMARY KEY Id
...
```

* `PRIMARY KEY` – キーを格納するカラム名。


### 複合キー \{#composite-key\}

キーには、任意の型のフィールドからなる `tuple` を使用できます。この場合の[レイアウト](./layouts/)は `complex_key_hashed` または `complex_key_cache` でなければなりません。

:::tip
複合キーは 1 要素のみから構成することもできます。その場合、例えば文字列をキーとして使用できます。
:::

キー構造は `<key>` 要素内で設定します。キー フィールドは、Dictionary の[属性](#attributes)と同じ形式で指定します。例:

```xml
<structure>
    <key>
        <attribute>
            <name>field1</name>
            <type>String</type>
        </attribute>
        <attribute>
            <name>field2</name>
            <type>UInt32</type>
        </attribute>
        ...
    </key>
...
```

または

```sql
CREATE DICTIONARY (
    field1 String,
    field2 UInt32
    ...
)
PRIMARY KEY field1, field2
...
```

`dictGet*` 関数に対するクエリでは、タプルがキーとして渡されます。例: `dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`。


## 属性 \{#attributes\}

設定例：

```xml
<structure>
    ...
    <attribute>
        <name>Name</name>
        <type>ClickHouseDataType</type>
        <null_value></null_value>
        <expression>rand64()</expression>
        <hierarchical>true</hierarchical>
        <injective>true</injective>
        <is_object_id>true</is_object_id>
    </attribute>
</structure>
```

または

```sql
CREATE DICTIONARY somename (
    Name ClickHouseDataType DEFAULT '' EXPRESSION rand64() HIERARCHICAL INJECTIVE IS_OBJECT_ID
)
```

設定項目:


| Tag                                                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Required |
|------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `name`                                               | カラム名。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Yes      |
| `type`                                               | ClickHouse のデータ型: [UInt8](../../../data-types/int-uint.md)、[UInt16](../../../data-types/int-uint.md)、[UInt32](../../../data-types/int-uint.md)、[UInt64](../../../data-types/int-uint.md)、[Int8](../../../data-types/int-uint.md)、[Int16](../../../data-types/int-uint.md)、[Int32](../../../data-types/int-uint.md)、[Int64](../../../data-types/int-uint.md)、[Float32](../../../data-types/float.md)、[Float64](../../../data-types/float.md)、[UUID](../../../data-types/uuid.md)、[Decimal32](../../../data-types/decimal.md)、[Decimal64](../../../data-types/decimal.md)、[Decimal128](../../../data-types/decimal.md)、[Decimal256](../../../data-types/decimal.md)、[Date](../../../data-types/date.md)、[Date32](../../../data-types/date32.md)、[DateTime](../../../data-types/datetime.md)、[DateTime64](../../../data-types/datetime64.md)、[String](../../../data-types/string.md)、[Array](../../../data-types/array.md)。<br/>ClickHouse は Dictionary に格納された値を、指定されたデータ型にキャストしようとします。たとえば、MySQL では MySQL のソーステーブルにおいてフィールドが `TEXT`、`VARCHAR`、`BLOB` のいずれかであっても、ClickHouse には `String` として取り込めます。<br/>[Nullable](../../../data-types/nullable.md) は現在、[Flat](./layouts/flat)、[Hashed](./layouts/hashed)、[ComplexKeyHashed](./layouts/hashed#complex_key_hashed)、[Direct](./layouts/direct)、[ComplexKeyDirect](./layouts/direct#complex_key_direct)、[RangeHashed](./layouts/range-hashed)、Polygon、[Cache](./layouts/cache)、[ComplexKeyCache](./layouts/cache)、[SSDCache](./layouts/ssd-cache)、[SSDComplexKeyCache](./layouts/ssd-cache#complex_key_ssd_cache) Dictionary でサポートされています。[IPTrie](./layouts/ip-trie) Dictionary では `Nullable` 型はサポートされていません。 | Yes      |
| `null_value`                                         | 存在しない要素に対するデフォルト値。<br/>この例では空文字列です。[NULL](../../../syntax.md#null) 値は `Nullable` 型に対してのみ使用できます（前の行の型の説明を参照してください）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Yes      |
| `expression`                                         | ClickHouse が値に対して実行する[式](../../../syntax.md#expressions)。<br/>この式は、リモート SQL データベース内のカラム名である場合があります。そのため、リモートのカラムに対するエイリアスを作成するために使用できます。<br/><br/>デフォルト値: 式なし。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | No       |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | `true` の場合、その属性には現在のキーに対する親キーの値が含まれます。[Hierarchical Dictionaries](./layouts/hierarchical) を参照してください。<br/><br/>デフォルト値: `false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | No       |
| `injective`                                          | `id -> attribute` の写像が[単射](https://en.wikipedia.org/wiki/Injective_function)であるかどうかを示すフラグ。<br/>`true` の場合、ClickHouse は単射である Dictionary へのリクエストを `GROUP BY` 句の後ろに自動的に挿入できます。通常、これによりそのようなリクエストの数を大幅に削減できます。<br/><br/>デフォルト値: `false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | No       |
| `is_object_id`                                       | クエリが `ObjectID` による MongoDB ドキュメントに対して実行されるかどうかを示すフラグ。<br/><br/>デフォルト値: `false`。 |