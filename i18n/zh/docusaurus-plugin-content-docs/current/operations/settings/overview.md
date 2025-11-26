---
description: '设置概览页面。'
sidebar_position: 1
slug: /operations/settings/overview
title: '设置概览'
doc_type: 'reference'
---



# 设置概览



## 概览 {#overview}

:::note
基于 XML 的 Settings Profiles 和[配置文件](/operations/configuration-files) 目前在 ClickHouse Cloud 中不受支持。若要为 ClickHouse Cloud 服务指定设置，必须使用[基于 SQL 的 Settings Profiles](/operations/access-rights#settings-profiles-management)。
:::

ClickHouse 的设置主要分为两大类：

- 全局服务器设置
- 会话设置

二者的主要区别在于，全局服务器设置作用于整个 ClickHouse 服务器，而会话设置则作用于用户会话，甚至可以细化到单个查询。



## 查看非默认设置

要查看哪些设置已被修改为非默认值，可以查询
`system.settings` 表：

```sql
SELECT name, value FROM system.settings WHERE changed
```

如果所有设置都保持默认值且未作修改，ClickHouse 将不会返回任何结果。

要查看某个特定设置的值，可以在查询中指定该设置的 `name`：

```sql
SELECT name, value FROM system.settings WHERE name = 'max_threads'
```

会返回类似下面的结果：

```response
┌─name────────┬─value─────┐
│ max_threads │ 'auto(8)' │
└─────────────┴───────────┘

返回 1 行。耗时：0.002 秒。
```


## 延伸阅读 {#further-reading}

- 参阅[全局服务器设置](/operations/server-configuration-parameters/settings.md)，以进一步了解如何在全局服务器层面配置 ClickHouse 服务器。
- 参阅[会话设置](/operations/settings/settings-query-level.md)，以进一步了解如何在会话层面配置 ClickHouse 服务器。
