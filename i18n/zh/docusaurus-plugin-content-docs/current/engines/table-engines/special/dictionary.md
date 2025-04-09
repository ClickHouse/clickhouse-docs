---
slug: /engines/table-engines/special/dictionary
sidebar_position: 20
sidebar_label: 字典
title: "字典表引擎"
description: "The `Dictionary` engine displays the dictionary data as a ClickHouse table."
---


# 字典表引擎

The `Dictionary` engine displays the [dictionary](../../../sql-reference/dictionaries/index.md) data as a ClickHouse table.

## 示例 {#example}

作为示例，考虑一个名为 `products` 的字典，其配置如下：

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

查询字典数据：

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

您可以使用 [dictGet\*](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) 函数以这种格式获取字典数据。

当您需要获取原始数据或执行 `JOIN` 操作时，这种视图并不实用。在这些情况下，您可以使用 `Dictionary` 引擎，它以表格形式显示字典数据。

语法：

``` sql
CREATE TABLE %table_name% (%fields%) engine = Dictionary(%dictionary_name%)`
```

使用示例：

``` sql
create table products (product_id UInt64, title String) Engine = Dictionary(products);
```

      Ok

查看表中的内容。

``` sql
select * from products limit 1;
```

``` text
┌────product_id─┬─title───────────┐
│        152689 │ Some item       │
└───────────────┴─────────────────┘
```

**另请参见**

- [字典函数](/sql-reference/table-functions/dictionary)
