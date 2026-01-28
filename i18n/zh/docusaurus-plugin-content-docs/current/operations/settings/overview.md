---
description: '设置概览页面。'
sidebar_position: 1
slug: /operations/settings/overview
title: '设置概览'
doc_type: 'reference'
---

# 设置概览 \{#settings-overview\}

## 概览 \{#overview\}

:::note
基于 XML 的 Settings Profiles 和[配置文件](/operations/configuration-files) 目前在 ClickHouse Cloud 中不受支持。若要为 ClickHouse Cloud 服务指定设置，必须使用[基于 SQL 的 Settings Profiles](/operations/access-rights#settings-profiles-management)。
:::

ClickHouse 的设置主要分为以下几大类：

- 全局服务器设置
- 会话设置
- 查询设置
- 后台操作设置

全局设置在默认情况下生效，除非在后续层级被覆盖。会话设置可以通过 Settings Profiles、用户配置以及 SET 命令进行指定。查询设置可以通过 SETTINGS 子句提供，并应用于单个查询。后台操作设置应用于 Mutations、Merges 以及可能的其他操作，这些操作会在后台以异步方式执行。

## 查看非默认设置 \{#see-non-default-settings\}

要查看哪些设置已被修改为非默认值，可以查询
`system.settings` 表：

```sql
SELECT name, value FROM system.settings WHERE changed
```

如果所有设置都保持默认值且未作修改，ClickHouse 将不会
返回任何结果。

要查看某个特定设置的值，可以在查询中
指定该设置的 `name`：

```sql
SELECT name, value FROM system.settings WHERE name = 'max_threads'
```

会返回类似下面的结果：

```response
┌─name────────┬─value─────┐
│ max_threads │ 'auto(8)' │
└─────────────┴───────────┘

1 row in set. Elapsed: 0.002 sec.
```


## 延伸阅读 \{#further-reading\}

- 参阅[全局服务器设置](/operations/server-configuration-parameters/settings.md)，以进一步了解如何在全局服务器层面配置 ClickHouse 服务器。
- 参阅[会话设置](/operations/settings/settings-query-level.md)，以进一步了解如何在会话层面配置 ClickHouse 服务器。
- 参阅[上下文层次结构](/development/architecture.md#context)，以进一步了解 ClickHouse 中配置处理的方式。