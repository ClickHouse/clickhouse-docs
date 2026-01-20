---
description: '使表在最近一次访问后的 `expiration_time_in_seconds` 秒内仅保留在 RAM 中。只能用于 Log 类型表。'
sidebar_label: 'Lazy'
sidebar_position: 20
slug: /engines/database-engines/lazy
title: 'Lazy'
doc_type: 'reference'
---

# Lazy \{#lazy\}

只会在上次访问后的 `expiration_time_in_seconds` 秒内将表保留在 RAM 中。只能用于 *Log 表。

它针对存储大量小型 *Log 表进行了优化，这些表的访问之间存在较长的时间间隔。

## 创建数据库 \{#creating-a-database\}

```sql
CREATE DATABASE testlazy 
ENGINE = Lazy(expiration_time_in_seconds);
```
