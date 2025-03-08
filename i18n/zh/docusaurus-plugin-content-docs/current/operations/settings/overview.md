---
title: '设置概述'
sidebar_position: 1
slug: /operations/settings/overview
description: '设置的概述页面。'
---


# 设置概述

:::note
基于XML的设置配置文件和 [配置文件](/operations/configuration-files) 目前不支持 ClickHouse Cloud。要为您的 ClickHouse Cloud 服务指定设置，您必须使用 [SQL 驱动的设置配置文件](/operations/access-rights#settings-profiles-management)。
:::

ClickHouse 设置主要分为两组：

- 全局服务器设置
- 会话设置

这两者之间的主要区别在于，全球服务器设置适用于整个 ClickHouse 服务器，而会话设置适用于用户会话或甚至单个查询。

阅读 [全局服务器设置](/operations/server-configuration-parameters/settings.md) 以了解如何在全局服务器级别配置您的 ClickHouse 服务器。

阅读 [会话设置](/operations/settings/settings-query-level.md) 以了解如何在会话级别配置您的 ClickHouse 服务器。

## 查看非默认设置 {#see-non-default-settings}

要查看哪些设置已从其默认值更改：

```sql
SELECT name, value FROM system.settings WHERE changed
```

如果您没有更改任何设置的默认值，则 ClickHouse 不会返回任何内容。

要检查特定设置的值，请在查询中指定该设置的 `name`：

```sql
SELECT name, value FROM system.settings WHERE name = 'max_threads'
```

此命令应返回类似如下内容：

```response
┌─name────────┬─value─────┐
│ max_threads │ 'auto(8)' │
└─────────────┴───────────┘

1 row in set. Elapsed: 0.002 sec.
```
