---
'description': '一种旨在允许为查询设置更灵活内存限制的实验技术。'
'slug': '/operations/settings/memory-overcommit'
'title': '内存过量'
---




# 内存超额承诺

内存超额承诺是一种实验性技术，旨在允许为查询设置更灵活的内存限制。

该技术的想法是引入可以表示查询所能使用的保证内存量的设置。当启用内存超额承诺并且达到内存限制时，ClickHouse 将选择超额承诺最多的查询，并尝试通过终止该查询来释放内存。

当达到内存限制时，任何查询在尝试分配新内存期间都会等待一些时间。如果超时后内存被释放，查询将继续执行。否则，将抛出异常，查询将被终止。

查询的选择是通过全局或用户超额承诺跟踪器来执行，具体取决于达到哪个内存限制。如果超额承诺跟踪器无法选择要停止的查询，将抛出 MEMORY_LIMIT_EXCEEDED 异常。

## 用户超额承诺跟踪器 {#user-overcommit-tracker}

用户超额承诺跟踪器在用户的查询列表中找到超额承诺比例最大的查询。查询的超额承诺比例按分配的字节数除以 `memory_overcommit_ratio_denominator_for_user` 设置的值来计算。

如果查询的 `memory_overcommit_ratio_denominator_for_user` 等于零，超额承诺跟踪器将不会选择该查询。

等待超时由 `memory_usage_overcommit_max_wait_microseconds` 设置来定义。

**示例**

```sql
SELECT number FROM numbers(1000) GROUP BY number SETTINGS memory_overcommit_ratio_denominator_for_user=4000, memory_usage_overcommit_max_wait_microseconds=500
```

## 全局超额承诺跟踪器 {#global-overcommit-tracker}

全局超额承诺跟踪器在所有查询的列表中找到超额承诺比例最大的查询。在这种情况下，超额承诺比例按分配的字节数除以 `memory_overcommit_ratio_denominator` 设置的值来计算。

如果查询的 `memory_overcommit_ratio_denominator` 等于零，超额承诺跟踪器将不会选择该查询。

等待超时由配置文件中的 `memory_usage_overcommit_max_wait_microseconds` 参数设置。
