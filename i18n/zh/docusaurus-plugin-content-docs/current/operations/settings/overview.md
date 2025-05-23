---
'description': '设置的概述页面。'
'sidebar_position': 1
'slug': '/operations/settings/overview'
'title': '设置概述'
---


# 设置概述

## 概述 {#overview}

:::note
基于 XML 的设置配置文件和 [配置文件](/operations/configuration-files) 当前不 
支持 ClickHouse Cloud。要为你的 ClickHouse Cloud 
服务指定设置，你必须使用 [SQL 驱动的设置配置文件](/operations/access-rights#settings-profiles-management)。
:::

ClickHouse 的设置主要分为两个组：

- 全局服务器设置
- 会话设置

两者的主要区别在于，全局服务器设置适用于 ClickHouse 服务器的所有实例，而会话设置则适用于用户会话或甚至单个查询。

## 查看非默认设置 {#see-non-default-settings}

要查看哪些设置已从默认值更改，你可以查询 `system.settings` 表：

```sql
SELECT name, value FROM system.settings WHERE changed
```

如果没有设置从默认值更改，ClickHouse 将不返回任何内容。

要检查特定设置的值，你可以在查询中指定该设置的 `name`：

```sql
SELECT name, value FROM system.settings WHERE name = 'max_threads'
```

这将返回类似以下内容：

```response
┌─name────────┬─value─────┐
│ max_threads │ 'auto(8)' │
└─────────────┴───────────┘

1 row in set. Elapsed: 0.002 sec.
```

## 进一步阅读 {#further-reading}

- 请参阅 [全局服务器设置](/operations/server-configuration-parameters/settings.md) 以了解如何在全局服务器级别配置你的 
  ClickHouse 服务器。
- 请参阅 [会话设置](/operations/settings/settings-query-level.md) 以了解如何在会话级别配置你的 ClickHouse 
  服务器。
