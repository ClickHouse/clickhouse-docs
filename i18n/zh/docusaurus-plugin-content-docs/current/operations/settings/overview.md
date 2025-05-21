---
'description': '设置页面的概览。'
'sidebar_position': 1
'slug': '/operations/settings/overview'
'title': '设置概述'
---




# 设置概述

## 概述 {#overview}

:::note
基于 XML 的设置配置文件和 [配置文件](/operations/configuration-files) 目前不支持 ClickHouse Cloud。要为您的 ClickHouse Cloud 服务指定设置，您必须使用 [SQL 驱动的设置配置文件](/operations/access-rights#settings-profiles-management)。
:::

ClickHouse 设置主要分为两个组：

- 全局服务器设置
- 会话设置

两者之间的主要区别在于，全局服务器设置适用于 ClickHouse 服务器的所有实例，而会话设置适用于用户会话或甚至单个查询。

## 查看非默认设置 {#see-non-default-settings}

要查看哪些设置已从其默认值进行更改，您可以查询 `system.settings` 表：

```sql
SELECT name, value FROM system.settings WHERE changed
```

如果没有设置从其默认值进行更改，则 ClickHouse 将不返回任何结果。

要检查特定设置的值，您可以在查询中指定该设置的 `name`：

```sql
SELECT name, value FROM system.settings WHERE name = 'max_threads'
```

这将返回类似于以下内容：

```response
┌─name────────┬─value─────┐
│ max_threads │ 'auto(8)' │
└─────────────┴───────────┘

1 row in set. Elapsed: 0.002 sec.
```

## 深入阅读 {#further-reading}

- 查看 [全局服务器设置](/operations/server-configuration-parameters/settings.md) 了解如何在全局服务器级别配置您的 ClickHouse 服务器。
- 查看 [会话设置](/operations/settings/settings-query-level.md) 了解如何在会话级别配置您的 ClickHouse 服务器。
