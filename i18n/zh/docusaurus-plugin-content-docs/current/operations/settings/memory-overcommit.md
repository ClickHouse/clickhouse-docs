---
'description': '一种实验性技术，旨在允许为查询设置更灵活的内存限制。'
'slug': '/operations/settings/memory-overcommit'
'title': '内存过度分配'
---


# 内存超额分配

内存超额分配是一种实验性技术，旨在允许为查询设置更灵活的内存限制。

该技术的思想是引入可以代表查询可用内存保证数量的设置。
当启用内存超额分配并达到内存限制时，ClickHouse 会选择超额分配最严重的查询，并尝试通过终止该查询来释放内存。

当达到内存限制时，任何查询在尝试分配新内存的过程中都会等待一段时间。
如果超时已过且内存已被释放，则查询将继续执行。
否则，将抛出异常并终止该查询。

根据达到的内存限制，选择要停止或终止的查询是由全局或用户超额分配跟踪器执行的。
如果超额分配跟踪器无法选择要停止的查询，将抛出 MEMORY_LIMIT_EXCEEDED 异常。

## 用户超额分配跟踪器 {#user-overcommit-tracker}

用户超额分配跟踪器在用户的查询列表中找到超额分配比例最大的查询。
查询的超额分配比例计算为已分配字节数除以 `memory_overcommit_ratio_denominator_for_user` 设置的值。

如果该查询的 `memory_overcommit_ratio_denominator_for_user` 等于零，则超额分配跟踪器将不会选择该查询。

等待超时由 `memory_usage_overcommit_max_wait_microseconds` 设置。

**示例**

```sql
SELECT number FROM numbers(1000) GROUP BY number SETTINGS memory_overcommit_ratio_denominator_for_user=4000, memory_usage_overcommit_max_wait_microseconds=500
```

## 全局超额分配跟踪器 {#global-overcommit-tracker}

全局超额分配跟踪器在所有查询的列表中找到超额分配比例最大的查询。
在这种情况下，超额分配比例计算为已分配字节数除以 `memory_overcommit_ratio_denominator` 设置的值。

如果该查询的 `memory_overcommit_ratio_denominator` 等于零，则超额分配跟踪器将不会选择该查询。

等待超时由配置文件中的 `memory_usage_overcommit_max_wait_microseconds` 参数设置。
