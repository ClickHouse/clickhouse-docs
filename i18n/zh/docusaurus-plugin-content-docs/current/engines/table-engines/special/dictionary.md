---
description: '`Dictionary` 引擎将字典数据展示为 ClickHouse
  表。'
sidebar_label: 'Dictionary'
sidebar_position: 20
slug: /engines/table-engines/special/dictionary
title: 'Dictionary 表引擎'
doc_type: 'reference'
---



# Dictionary 表引擎

`Dictionary` 引擎将 [dictionary](../../../sql-reference/dictionaries/index.md) 数据显示为 ClickHouse 表。



## 示例

例如，假设有一个名为 `products` 的字典，其配置如下：

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

查询字典中的数据：

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

你可以使用 [dictGet*](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) 函数以这种格式获取字典数据。

当你需要获取原始数据或执行 `JOIN` 操作时，此视图并不太有用。对于这些场景，你可以使用 `Dictionary` 引擎，它会以表格形式展示字典数据。

语法：

```sql
CREATE TABLE %table_name% (%fields%) engine = Dictionary(%dictionary_name%)`
```

用法示例：

```sql
CREATE TABLE products (product_id UInt64, title String) ENGINE = Dictionary(products);
```

好的

来看一下表里的内容。

```sql
SELECT * FROM products LIMIT 1;
```

```text
┌────product_id─┬─title───────────┐
│        152689 │ 某个商品        │
└───────────────┴─────────────────┘
```

**另请参阅**

* [Dictionary 函数](/sql-reference/table-functions/dictionary)
