---
description: '一种实验性技术，旨在为查询设置更灵活的内存限制。'
slug: /operations/settings/memory-overcommit
title: '内存超量分配'
doc_type: 'reference'
---

# 内存超额分配（memory overcommit） \\{#memory-overcommit\\}

内存超额分配是一种实验性机制，旨在为查询设置更灵活的内存限制。

该机制的核心思想是通过一组设置来表示查询可以使用的“保证内存”数量。
当启用了内存超额分配且达到内存限制时，ClickHouse 会选择超额分配程度最高的查询，并尝试通过终止该查询来释放内存。

当达到内存限制时，任何查询在尝试分配新内存时都会先等待一段时间。
如果在超时时间内有内存被释放，查询将继续执行。
否则将抛出异常并终止该查询。

要停止或终止的查询由全局或用户级 overcommit 跟踪器选择，具体取决于触发的是哪种内存限制。
如果 overcommit 跟踪器无法选择要停止的查询，将抛出 MEMORY_LIMIT_EXCEEDED 异常。

## 用户超量使用跟踪器 \\{#user-overcommit-tracker\\}

用户超量使用跟踪器会在用户的查询列表中找到超量使用比例最大的查询。
查询的超量使用比例是通过已分配字节数除以 `memory_overcommit_ratio_denominator_for_user` 设置的值来计算的。

如果该查询的 `memory_overcommit_ratio_denominator_for_user` 等于零，超量使用跟踪器不会选择此查询。

等待超时时间由 `memory_usage_overcommit_max_wait_microseconds` 设置进行配置。

**示例**

```sql
SELECT number FROM numbers(1000) GROUP BY number SETTINGS memory_overcommit_ratio_denominator_for_user=4000, memory_usage_overcommit_max_wait_microseconds=500
```

## 全局 overcommit 跟踪器 \\{#global-overcommit-tracker\\}

全局 overcommit 跟踪器会在所有查询中找到 overcommit 比率最高的查询。
这里的 overcommit 比率计算方式为：已分配的字节数除以 `memory_overcommit_ratio_denominator` 设置的值。

如果某个查询的 `memory_overcommit_ratio_denominator` 等于零，overcommit 跟踪器不会选择该查询。

等待超时时间由配置文件中的 `memory_usage_overcommit_max_wait_microseconds` 参数指定。
