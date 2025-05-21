---
'description': '配置和使用ClickHouse中SQL启动脚本的指南，用于自动化架构创建和迁移'
'sidebar_label': '启动脚本'
'slug': '/operations/startup-scripts'
'title': '启动脚本'
---




# 启动脚本

ClickHouse 可以在启动期间从服务器配置运行任意 SQL 查询。这对于迁移或自动模式创建非常有用。

```xml
<clickhouse>
    <startup_scripts>
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

ClickHouse 按照指定的顺序依次执行 `startup_scripts` 中的所有查询。如果任何查询失败，后续查询的执行不会中断。

您可以在配置中指定条件查询。在这种情况下，只有当条件查询返回值为 `1` 或 `true` 时，相应的查询才会被执行。

:::note
如果条件查询返回的值不是 `1` 或 `true`，结果将被解释为 `false`，相应的查询将不会被执行。
:::
