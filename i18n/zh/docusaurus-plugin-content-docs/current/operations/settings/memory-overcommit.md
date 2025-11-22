---
description: '一种实验性技术，旨在为查询设置更加灵活的内存限制。'
slug: /operations/settings/memory-overcommit
title: '内存过量分配'
doc_type: 'reference'
---



# 内存超量使用（memory overcommit）

内存超量使用是一项实验性特性，旨在为查询设置更灵活的内存限制。

该特性的思路是引入一组配置，用于表示查询可以使用的“保证内存”数量。
当启用内存超量使用并且达到内存限制时，ClickHouse 会选择超量使用程度最高的查询，并尝试通过终止该查询来释放内存。

当达到内存限制时，任何查询在尝试分配新内存时都会等待一段时间。
如果在超时时间内内存被释放，则查询继续执行。
否则将抛出异常并终止该查询。

要停止或终止哪个查询，由全局或用户级的 overcommit 跟踪器根据触发的内存限制类型来选择。
如果 overcommit 跟踪器无法选择要停止的查询，则会抛出 `MEMORY_LIMIT_EXCEEDED` 异常。



## 用户内存超配跟踪器 {#user-overcommit-tracker}

用户内存超配跟踪器用于在用户的查询列表中找出内存超配比率最大的查询。
查询的内存超配比率计算方式为:已分配字节数除以 `memory_overcommit_ratio_denominator_for_user` 设置的值。

如果查询的 `memory_overcommit_ratio_denominator_for_user` 等于零,则内存超配跟踪器不会选择该查询。

等待超时时间通过 `memory_usage_overcommit_max_wait_microseconds` 设置指定。

**示例**

```sql
SELECT number FROM numbers(1000) GROUP BY number SETTINGS memory_overcommit_ratio_denominator_for_user=4000, memory_usage_overcommit_max_wait_microseconds=500
```


## 全局超额分配跟踪器 {#global-overcommit-tracker}

全局超额分配跟踪器会从所有查询列表中找出超额分配比率最大的查询。
此处的超额分配比率计算方式为:已分配字节数除以 `memory_overcommit_ratio_denominator` 设置值。

如果查询的 `memory_overcommit_ratio_denominator` 等于零,则超额分配跟踪器不会选择该查询。

等待超时时间通过配置文件中的 `memory_usage_overcommit_max_wait_microseconds` 参数设置。
