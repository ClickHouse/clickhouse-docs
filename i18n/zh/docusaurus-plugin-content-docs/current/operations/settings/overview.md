---
description: '设置概览页面。'
sidebar_position: 1
slug: /operations/settings/overview
title: '设置概览'
doc_type: 'reference'
---



# 设置概述



## 概述 {#overview}

:::note
ClickHouse Cloud 目前不支持基于 XML 的设置配置文件和[配置文件](/operations/configuration-files)。要为您的 ClickHouse Cloud 服务指定设置,必须使用 [SQL 驱动的设置配置文件](/operations/access-rights#settings-profiles-management)。
:::

ClickHouse 设置主要分为两大类:

- 全局服务器设置
- 会话设置

两者的主要区别在于:全局服务器设置对整个 ClickHouse 服务器全局生效,而会话设置则应用于用户会话或单个查询。


## 查看非默认设置 {#see-non-default-settings}

要查看哪些设置已从默认值更改,可以查询 `system.settings` 表:

```sql
SELECT name, value FROM system.settings WHERE changed
```

如果没有设置被更改过,ClickHouse 将不返回任何结果。

要检查特定设置的值,可以在查询中指定该设置的 `name`:

```sql
SELECT name, value FROM system.settings WHERE name = 'max_threads'
```

将返回类似以下的结果:

```response
┌─name────────┬─value─────┐
│ max_threads │ 'auto(8)' │
└─────────────┴───────────┘

1 row in set. Elapsed: 0.002 sec.
```


## 延伸阅读 {#further-reading}

- 参阅[全局服务器设置](/operations/server-configuration-parameters/settings.md)了解如何在全局服务器级别配置 ClickHouse 服务器。
- 参阅[会话设置](/operations/settings/settings-query-level.md)了解如何在会话级别配置 ClickHouse 服务器。
