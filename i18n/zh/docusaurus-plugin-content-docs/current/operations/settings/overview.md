---
'description': '设置的概览页面。'
'sidebar_position': 1
'slug': '/operations/settings/overview'
'title': '设置概览'
'doc_type': 'reference'
---


# 设置概述

## 概述 {#overview}

:::note
基于 XML 的设置配置文件和 [配置文件](/operations/configuration-files) 目前不支持 ClickHouse Cloud。要为您的 ClickHouse Cloud 服务指定设置，您必须使用 [SQL 驱动的设置配置文件](/operations/access-rights#settings-profiles-management)。
:::

ClickHouse 设置主要分为两大类：

- 全局服务器设置
- 会话设置

两者的主要区别在于，全球服务器设置适用于整个 ClickHouse 服务器，而会话设置适用于用户会话，甚至单个查询。

## 查看非默认设置 {#see-non-default-settings}

要查看哪些设置已从其默认值更改，您可以查询 `system.settings` 表：

```sql
SELECT name, value FROM system.settings WHERE changed
```

如果没有设置从其默认值更改，则 ClickHouse 将不会返回任何内容。

要检查特定设置的值，您可以在查询中指定设置的 `name`：

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

## 进一步阅读 {#further-reading}

- 查看 [全局服务器设置](/operations/server-configuration-parameters/settings.md)，以了解更多关于在全局服务器级别配置您的 ClickHouse 服务器的信息。
- 查看 [会话设置](/operations/settings/settings-query-level.md)，以了解更多关于在会话级别配置您的 ClickHouse 服务器的信息。
