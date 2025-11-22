---
description: '在 ClickHouse 中配置和使用 SQL 启动脚本，以实现数据库模式自动创建和迁移的指南'
sidebar_label: '启动脚本'
slug: /operations/startup-scripts
title: '启动脚本'
doc_type: 'guide'
---

# 启动脚本

ClickHouse 可以在启动时根据服务器配置执行任意 SQL 查询。这对于迁移操作或自动创建数据库模式非常有用。

```xml
<clickhouse>
    <startup_scripts>
        <throw_on_error>false</throw_on_error>
        <scripts>
            <query>CREATE ROLE OR REPLACE test_role</query>
        </scripts>
        <scripts>
            <query>CREATE TABLE TestTable (id UInt64) ENGINE=TinyLog</query>
            <condition>SELECT 1;</condition>
        </scripts>
        <scripts>
            <query>CREATE DICTIONARY test_dict (...) SOURCE(CLICKHOUSE(...))</query>
            <user>default</user>
        </scripts>
    </startup_scripts>
</clickhouse>
```

ClickHouse 会按照指定顺序依次执行 `startup_scripts` 中的所有查询。即使某些查询执行失败，后续查询的执行也不会被中断。但是，如果将 `throw_on_error` 设置为 true，
则在脚本执行期间一旦出现错误，服务器将无法启动。

你可以在配置中指定条件查询。在这种情况下，仅当条件查询返回值为 `1` 或 `true` 时，对应的查询才会执行。

:::note
如果条件查询返回除 `1` 或 `true` 之外的任何值，其结果都会被解释为 `false`，对应的查询将不会被执行。
:::
