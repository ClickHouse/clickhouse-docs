---
slug: /engines/table-engines/special/dictionary
sidebar_position: 20
sidebar_label: Dictionary
title: "辞書テーブルエンジン"
description: "`Dictionary`エンジンは辞書データをClickHouseテーブルとして表示します。"
---


# 辞書テーブルエンジン

`Dictionary`エンジンは[辞書](../../../sql-reference/dictionaries/index.md)データをClickHouseテーブルとして表示します。

## 例 {#example}

例として、以下の構成を持つ`products`の辞書を考えます：

``` xml
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

``` sql
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

``` text
┌─name─────┬─type─┬─key────┬─attribute.names─┬─attribute.types─┬─bytes_allocated─┬─element_count─┬─source──────────┐
│ products │ Flat │ UInt64 │ ['title']       │ ['String']      │        23065376 │        175032 │ ODBC: .products │
└──────────┴──────┴────────┴─────────────────┴─────────────────┴─────────────────┴───────────────┴─────────────────┘
```

[dicGet\*](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)関数を使用して、この形式で辞書データを取得できます。

このビューは、生のデータを取得する必要がある場合や、`JOIN`操作を行う場合には便利ではありません。これらのケースでは、辞書データをテーブルに表示する`Dictionary`エンジンを使用できます。

構文：

``` sql
CREATE TABLE %table_name% (%fields%) engine = Dictionary(%dictionary_name%)`
```

使用例：

``` sql
create table products (product_id UInt64, title String) Engine = Dictionary(products);
```

      Ok

テーブルの内容を確認します。

``` sql
select * from products limit 1;
```

``` text
┌────product_id─┬─title───────────┐
│        152689 │ Some item       │
└───────────────┴─────────────────┘
```

**関連項目**

- [辞書関数](/sql-reference/table-functions/dictionary)
