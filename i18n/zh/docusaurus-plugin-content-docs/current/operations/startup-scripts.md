---
'description': '在 ClickHouse 中配置和使用 SQL 启动脚本以实现自动模式创建和迁移的指南'
'sidebar_label': '启动脚本'
'slug': '/operations/startup-scripts'
'title': '启动脚本'
---


# 启动脚本

ClickHouse 可以在启动时从服务器配置运行任意 SQL 查询。这对于迁移或自动模式创建非常有用。

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

ClickHouse 按照指定的顺序顺序执行 `startup_scripts` 中的所有查询。如果任何查询失败，后续查询的执行将不会被中断。

您可以在配置中指定条件查询。在这种情况下，只有当条件查询返回值 `1` 或 `true` 时，才会执行相应的查询。

:::note
如果条件查询返回任何其他值而不是 `1` 或 `true`，结果将被解释为 `false`，相应的查询将不会被执行。
:::
