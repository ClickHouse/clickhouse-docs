---
'description': '一种实验性技术，旨在允许为查询设置更灵活的内存限制。'
'slug': '/operations/settings/memory-overcommit'
'title': '内存过量承诺'
---


# 内存过度分配

内存过度分配是一种实验性技术，旨在允许为查询设置更灵活的内存限制。

该技术的想法是引入一些设置，表示查询可以使用的保证内存量。当启用内存过度分配并达到内存限制时，ClickHouse 将选择最过度分配的查询并尝试通过终止该查询释放内存。

当达到内存限制时，任何查询在尝试分配新内存时都会等待一段时间。如果超时过去并且内存被释放，查询将继续执行。否则，将抛出异常并终止查询。

停止或杀死查询的选择由全局或用户过度分配跟踪器执行，具体取决于达到的内存限制。如果过度分配跟踪器无法选择要停止的查询，则会抛出 MEMORY_LIMIT_EXCEEDED 异常。

## 用户过度分配跟踪器 {#user-overcommit-tracker}

用户过度分配跟踪器会在用户的查询列表中找到过度分配比例最大的查询。查询的过度分配比例计算为已分配字节数除以 `memory_overcommit_ratio_denominator_for_user` 设置的值。

如果查询的 `memory_overcommit_ratio_denominator_for_user` 等于零，过度分配跟踪器不会选择此查询。

等待超时由 `memory_usage_overcommit_max_wait_microseconds` 设置。

**示例**

```sql
SELECT number FROM numbers(1000) GROUP BY number SETTINGS memory_overcommit_ratio_denominator_for_user=4000, memory_usage_overcommit_max_wait_microseconds=500
```

## 全局过度分配跟踪器 {#global-overcommit-tracker}

全局过度分配跟踪器会在所有查询的列表中找到过度分配比例最大的查询。在这种情况下，过度分配比例计算为已分配字节数除以 `memory_overcommit_ratio_denominator` 设置的值。

如果查询的 `memory_overcommit_ratio_denominator` 等于零，过度分配跟踪器不会选择此查询。

等待超时由配置文件中的 `memory_usage_overcommit_max_wait_microseconds` 参数设置。
