---
slug: /engines/database-engines/lazy
sidebar_label: 'Lazy'
sidebar_position: 20
title: 'Lazy'
description: '在最近一次访问后，只在 RAM 中保留表 `expiration_time_in_seconds` 秒。仅适用于 Log 类型的表。'
---


# Lazy

在最近一次访问后，只在 RAM 中保留表 `expiration_time_in_seconds` 秒。仅适用于 *Log 表。

它针对存储许多小型 *Log 表进行了优化，这些表之间的访问时间间隔很长。

## 创建数据库 {#creating-a-database}

```sql
CREATE DATABASE testlazy 
ENGINE = Lazy(expiration_time_in_seconds);
```
