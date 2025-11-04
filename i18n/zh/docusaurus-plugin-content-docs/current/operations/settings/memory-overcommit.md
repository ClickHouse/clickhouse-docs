---
'description': '一种实验性技术，旨在允许为查询设置更灵活的内存限制。'
'slug': '/operations/settings/memory-overcommit'
'title': '内存超分配'
'doc_type': 'reference'
---


# 内存超分配

内存超分配是一种实验性技术，旨在允许为查询设置更灵活的内存限制。

这种技术的想法是引入能够表示查询可以使用的保证内存量的设置。
当启用内存超分配且达到内存限制时，ClickHouse 将选择最超分配的查询，并尝试通过终止该查询来释放内存。

当达到内存限制时，任何查询在尝试分配新内存时都会等待一段时间。
如果超时已过且内存被释放，则查询继续执行。
否则，将抛出异常并终止该查询。

停止或终止查询的选择由全局或用户超分配跟踪器执行，具体取决于达到的内存限制。
如果超分配跟踪器无法选择要停止的查询，则将抛出 MEMORY_LIMIT_EXCEEDED 异常。

## 用户超分配跟踪器 {#user-overcommit-tracker}

用户超分配跟踪器在用户的查询列表中找到超分配比率最大的查询。
查询的超分配比率是通过已分配字节数除以设置 `memory_overcommit_ratio_denominator_for_user` 的值来计算的。

如果查询的 `memory_overcommit_ratio_denominator_for_user` 等于零，则超分配跟踪器不会选择此查询。

等待超时时间由设置 `memory_usage_overcommit_max_wait_microseconds` 设定。

**示例**

```sql
SELECT number FROM numbers(1000) GROUP BY number SETTINGS memory_overcommit_ratio_denominator_for_user=4000, memory_usage_overcommit_max_wait_microseconds=500
```

## 全局超分配跟踪器 {#global-overcommit-tracker}

全局超分配跟踪器在所有查询的列表中找到超分配比率最大的查询。
在这种情况下，超分配比率是通过已分配字节数除以设置 `memory_overcommit_ratio_denominator` 的值来计算的。

如果查询的 `memory_overcommit_ratio_denominator` 等于零，则超分配跟踪器不会选择此查询。

等待超时时间由配置文件中的参数 `memory_usage_overcommit_max_wait_microseconds` 设定。
