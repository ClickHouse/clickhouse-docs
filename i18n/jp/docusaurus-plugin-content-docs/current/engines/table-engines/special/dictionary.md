---
description: '`Dictionary` エンジンは、辞書データを ClickHouse のテーブルとして扱えるようにします。'
sidebar_label: 'Dictionary'
sidebar_position: 20
slug: /engines/table-engines/special/dictionary
title: 'Dictionary テーブルエンジン'
doc_type: 'reference'
---



# Dictionary テーブルエンジン

`Dictionary` エンジンは、[辞書](../../../sql-reference/dictionaries/index.md) のデータを ClickHouse のテーブルとして扱えるようにします。



## 例 {#example}

例として、以下の設定を持つ`products`ディクショナリを考えます：

```xml
<dictionaries>
    <dictionary>
        <name>products</name>
        <source>
            <odbc>
                <table>products</table>
                <connection_string>DSN=some-db-server</connection_string>
            </odbc>
        </source>
        <lifetime>
            <min>300</min>
            <max>360</max>
        </lifetime>
        <layout>
            <flat/>
        </layout>
        <structure>
            <id>
                <name>product_id</name>
            </id>
            <attribute>
                <name>title</name>
                <type>String</type>
                <null_value></null_value>
            </attribute>
        </structure>
    </dictionary>
</dictionaries>
```

ディクショナリデータをクエリします：

```sql
SELECT
    name,
    type,
    key,
    attribute.names,
    attribute.types,
    bytes_allocated,
    element_count,
    source
FROM system.dictionaries
WHERE name = 'products'
```

```text
┌─name─────┬─type─┬─key────┬─attribute.names─┬─attribute.types─┬─bytes_allocated─┬─element_count─┬─source──────────┐
│ products │ Flat │ UInt64 │ ['title']       │ ['String']      │        23065376 │        175032 │ ODBC: .products │
└──────────┴──────┴────────┴─────────────────┴─────────────────┴─────────────────┴───────────────┴─────────────────┘
```

この形式でディクショナリデータを取得するには、[dictGet\*](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)関数を使用できます。

このビューは、生データを取得する必要がある場合や`JOIN`操作を実行する場合には適していません。このような場合には、ディクショナリデータをテーブルとして表示する`Dictionary`エンジンを使用できます。

構文：

```sql
CREATE TABLE %table_name% (%fields%) engine = Dictionary(%dictionary_name%)`
```

使用例：

```sql
CREATE TABLE products (product_id UInt64, title String) ENGINE = Dictionary(products);
```

      Ok

テーブルの内容を確認します。

```sql
SELECT * FROM products LIMIT 1;
```

```text
┌────product_id─┬─title───────────┐
│        152689 │ Some item       │
└───────────────┴─────────────────┘
```

**関連項目**

- [Dictionary関数](/sql-reference/table-functions/dictionary)
