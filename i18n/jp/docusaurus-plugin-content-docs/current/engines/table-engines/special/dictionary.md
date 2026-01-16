---
description: '`Dictionary` エンジンは、Dictionary のデータを ClickHouse のテーブルとして表示します。'
sidebar_label: 'Dictionary'
sidebar_position: 20
slug: /engines/table-engines/special/dictionary
title: 'Dictionary テーブルエンジン'
doc_type: 'reference'
---

# Dictionary テーブルエンジン \{#dictionary-table-engine\}

`Dictionary` エンジンは、[Dictionary](../../../sql-reference/dictionaries/index.md) のデータを ClickHouse のテーブルとして利用できるようにします。

## 例 \{#example\}

例として、次のように構成された `products` の Dictionary を考えます。

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

Dictionary データをクエリします:

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

[dictGet*](/sql-reference/functions/ext-dict-functions) 関数を使用して、この形式で Dictionary データを取得できます。

このビューは、生データを取得したい場合や `JOIN` 演算を行う場合にはあまり役に立ちません。こうしたケースでは、Dictionary データをテーブルとして表示する `Dictionary` エンジンを使用できます。

構文：

```sql
CREATE TABLE %table_name% (%fields%) engine = Dictionary(%dictionary_name%)`
```

使用例：

```sql
CREATE TABLE products (product_id UInt64, title String) ENGINE = Dictionary(products);
```

では

テーブルの中身を確認してみましょう。

```sql
SELECT * FROM products LIMIT 1;
```

```text
┌────product_id─┬─title───────────┐
│        152689 │ Some item       │
└───────────────┴─────────────────┘
```

**関連項目**

* [Dictionary 関数](/sql-reference/table-functions/dictionary)
