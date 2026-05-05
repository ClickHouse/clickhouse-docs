---
description: '用于自动刷新字典数据的 LIFETIME 配置'
sidebar_label: 'LIFETIME'
sidebar_position: 5
slug: /sql-reference/statements/create/dictionary/lifetime
title: '使用 LIFETIME 刷新字典数据'
doc_type: 'reference'
---

import CloudDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/sql-reference/statements/create/dictionary/_snippet_dictionary_in_cloud.md';

ClickHouse 会根据以秒为单位定义的 `LIFETIME` 参数定期更新字典。
`LIFETIME` 是对完整加载字典的更新间隔，也是对缓存字典的失效间隔。

在更新期间，仍然可以查询字典的旧版本。
字典更新不会阻塞查询，首次加载时除外。
如果在更新期间发生错误，错误会被写入服务器日志，查询可以继续使用字典的旧版本。
如果字典更新成功，字典的旧版本会被[以原子方式](/concepts/glossary#atomicity)替换。

设置示例：

<CloudDetails />

```xml
<dictionary>
    ...
    <lifetime>300</lifetime>
    ...
</dictionary>
```

或

```sql
CREATE DICTIONARY (...)
...
LIFETIME(300)
...
```

设置 `<lifetime>0</lifetime>`（`LIFETIME(0)`）会阻止字典进行更新。

你可以为更新设置一个时间区间，ClickHouse 会在该区间内均匀随机选择一个时间。这样可以在大量服务器上执行更新时分散字典源的负载。

设置示例：

```xml
<dictionary>
    ...
    <lifetime>
        <min>300</min>
        <max>360</max>
    </lifetime>
    ...
</dictionary>
```

或

```sql
LIFETIME(MIN 300 MAX 360)
```

如果 `<min>0</min>` 和 `<max>0</max>`，则 ClickHouse 不会按超时时间重新加载字典。
在这种情况下，如果字典配置文件被更改，或者执行了 `SYSTEM RELOAD DICTIONARY` 命令，ClickHouse 也可以提前重新加载字典。

在更新字典时，ClickHouse 服务器会根据 [数据源](./sources/) 的类型采用不同的逻辑：

* 对于文本文件，它会检查修改时间。如果该时间与先前记录的时间不同，则更新字典。
* 来自其他数据源的字典默认每次都会更新。

对于其他数据源（ODBC、PostgreSQL、ClickHouse 等），可以设置一个查询，使字典仅在确实发生变化时才更新，而不是每次都更新。为此，请执行以下步骤：

* 字典表必须有一个字段，在源数据更新时该字段总是会改变。
* 在数据源的设置中必须指定一个查询，用于获取该变化字段。ClickHouse 服务器将查询结果解释为一行，如果这行数据相较于之前的状态发生了变化，则更新字典。请在该 [数据源](./sources/) 的设置中，将该查询指定到 `<invalidate_query>` 字段中。

设置示例：

```xml
<dictionary>
    ...
    <odbc>
      ...
      <invalidate_query>SELECT update_time FROM dictionary_source where id = 1</invalidate_query>
    </odbc>
    ...
</dictionary>
```

或

```sql
...
SOURCE(ODBC(... invalidate_query 'SELECT update_time FROM dictionary_source where id = 1'))
...
```

对于 `Cache`、`ComplexKeyCache`、`SSDCache` 和 `SSDComplexKeyCache` 字典，同时支持同步和异步更新。

对于 `Flat`、`Hashed`、`HashedArray`、`ComplexKeyHashed` 字典，也可以仅请求自上次更新之后发生变更的数据。如果在字典源配置中指定了 `update_field`，则会在数据请求中附加上一次更新时间（以秒为单位）的值。根据源类型（Executable、HTTP、MySQL、PostgreSQL、ClickHouse 或 ODBC）的不同，在向外部源请求数据之前，会对 `update_field` 应用不同的处理逻辑。


* 如果来源是 HTTP，则会将 `update_field` 作为查询参数添加，参数值为上次更新时间。
* 如果来源是 Executable，则会将 `update_field` 作为可执行脚本参数添加，参数值为上次更新时间。
* 如果来源是 ClickHouse、MySQL、PostgreSQL、ODBC，则会在 `WHERE` 子句中增加一个条件，其中 `update_field` 与上次更新时间进行大于或等于的比较。
  * 默认情况下，这个 `WHERE` 条件会在 SQL 查询的最外层进行检查。或者，也可以在查询中的任意其他 `WHERE` 子句中通过 `{condition}` 关键字进行检查。示例：
    ```sql
    ...
    SOURCE(CLICKHOUSE(...
        update_field 'added_time'
        QUERY '
            SELECT my_arr.1 AS x, my_arr.2 AS y, creation_time
            FROM (
                SELECT arrayZip(x_arr, y_arr) AS my_arr, creation_time
                FROM dictionary_source
                WHERE {condition}
            )'
    ))
    ...
    ```

如果设置了 `update_field` 选项，则可以同时设置额外的 `update_lag` 选项。`update_lag` 选项的值会在请求更新数据之前，先从上一次更新时间中减去。

设置示例：

```xml
<dictionary>
    ...
        <clickhouse>
            ...
            <update_field>added_time</update_field>
            <update_lag>15</update_lag>
        </clickhouse>
    ...
</dictionary>
```

或

```sql
...
SOURCE(CLICKHOUSE(... update_field 'added_time' update_lag 15))
...
```
