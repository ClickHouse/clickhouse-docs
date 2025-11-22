---
description: '`Dictionary` 引擎将字典数据以 ClickHouse 表的形式展示。'
sidebar_label: 'Dictionary'
sidebar_position: 20
slug: /engines/table-engines/special/dictionary
title: 'Dictionary 表引擎'
doc_type: 'reference'
---



# Dictionary 表引擎

`Dictionary` 引擎将[字典](../../../sql-reference/dictionaries/index.md)数据呈现为 ClickHouse 表。



## 示例 {#example}

以下示例展示了一个名为 `products` 的字典配置:

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

查询字典数据:

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

您可以使用 [dictGet\*](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) 函数以此格式获取字典数据。

当需要获取原始数据或执行 `JOIN` 操作时,此视图并不适用。对于这些场景,您可以使用 `Dictionary` 引擎,它以表的形式展示字典数据。

语法:

```sql
CREATE TABLE %table_name% (%fields%) engine = Dictionary(%dictionary_name%)`
```

使用示例:

```sql
CREATE TABLE products (product_id UInt64, title String) ENGINE = Dictionary(products);
```

      Ok

查看表中的内容。

```sql
SELECT * FROM products LIMIT 1;
```

```text
┌────product_id─┬─title───────────┐
│        152689 │ Some item       │
└───────────────┴─────────────────┘
```

**另请参阅**

- [Dictionary 函数](/sql-reference/table-functions/dictionary)
