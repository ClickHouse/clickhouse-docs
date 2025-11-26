---
description: '`Dictionary` エンジンは、辞書データを ClickHouse のテーブルとして扱えるようにします。'
sidebar_label: 'Dictionary'
sidebar_position: 20
slug: /engines/table-engines/special/dictionary
title: 'Dictionary テーブルエンジン'
doc_type: 'リファレンス'
---



# Dictionary テーブルエンジン

`Dictionary` エンジンは、[dictionary](../../../sql-reference/dictionaries/index.md) のデータを ClickHouse のテーブルとして扱います。



## 例

例として、次のように構成された `products` 辞書を考えます。

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

辞書データにクエリを実行する:

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

この形式で辞書データを取得するには、[dictGet*](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) 関数を使用できます。

生データを取得する必要がある場合や、`JOIN` 操作を実行する場合には、このビューは有用ではありません。これらの場合には、`Dictionary` エンジンを使用することで、辞書データをテーブルとして表示できます。

構文:

```sql
CREATE TABLE %table_name% (%fields%) engine = Dictionary(%dictionary_name%)`
```

使用例：

```sql
CREATE TABLE products (product_id UInt64, title String) ENGINE = Dictionary(products);
```

では

テーブルの内容を確認しましょう。

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
