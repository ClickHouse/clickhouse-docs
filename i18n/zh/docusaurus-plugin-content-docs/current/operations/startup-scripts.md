---
description: '在 ClickHouse 中配置和使用 SQL 启动脚本以自动创建 schema 并执行迁移操作的指南'
sidebar_label: '启动脚本'
slug: /operations/startup-scripts
title: '启动脚本'
doc_type: 'guide'
---

# 启动脚本

ClickHouse 可以在启动时根据服务器配置执行任意 SQL 查询。这对于迁移或自动创建模式很有用。

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

ClickHouse 会按照指定顺序依次执行 `startup_scripts` 中的所有查询。如果某个查询失败，后续查询的执行不会被中断。但是，如果将 `throw_on_error` 设为 true，一旦在脚本执行过程中发生错误，服务器将不会启动。

你可以在配置中指定条件查询。在这种情况下，仅当条件查询返回值为 `1` 或 `true` 时，才会执行相应的查询。

:::note
如果条件查询返回的值不是 `1` 或 `true`，结果会被视为 `false`，相应的查询将不会被执行。
:::
