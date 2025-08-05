---
description: 'The `Dictionary` engine displays the dictionary data as a ClickHouse
  table.'
sidebar_label: 'Dictionary'
sidebar_position: 20
slug: '/engines/table-engines/special/dictionary'
title: 'Dictionary Table Engine'
---




# Dictionary Table Engine

`Dictionary` エンジンは、[dictionary](../../../sql-reference/dictionaries/index.md) データを ClickHouse テーブルとして表示します。

## 例 {#example}

例として、次の構成を持つ `products` の辞書を考えてみます。

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

辞書データをクエリします：

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

[dictGet\*](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) 関数を使用して、この形式で辞書データを取得できます。

このビューは、生データを取得したり、`JOIN` 操作を行ったりする必要があるときには役立ちません。そのような場合には、辞書データをテーブル形式で表示する `Dictionary` エンジンを使用できます。

構文：

```sql
CREATE TABLE %table_name% (%fields%) engine = Dictionary(%dictionary_name%)`
```

使用例：

```sql
create table products (product_id UInt64, title String) Engine = Dictionary(products);
```

      Ok

テーブルの内容を確認します。

```sql
select * from products limit 1;
```

```text
┌────product_id─┬─title───────────┐
│        152689 │ Some item       │
└───────────────┴─────────────────┘
```

**関連情報**

- [Dictionary function](/sql-reference/table-functions/dictionary)
