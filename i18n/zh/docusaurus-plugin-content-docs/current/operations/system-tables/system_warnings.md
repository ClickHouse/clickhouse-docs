---
description: '此表包含有关 ClickHouse 服务器的警告信息。'
keywords: [ 'system table', 'warnings' ]
slug: /operations/system-tables/system_warnings
title: 'system.warnings'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.warnings

<SystemTableCloud />

该表显示 ClickHouse 服务器的相关警告。
同一类型的警告会合并为一条警告。
例如，如果已附加数据库的数量 N 超过可配置阈值 T，将显示一条包含当前值 N 的记录，而不是 N 条单独的记录。
如果当前值降到阈值以下，则会从表中删除该记录。

可以通过以下设置对该表进行配置：

* [max&#95;table&#95;num&#95;to&#95;warn](../server-configuration-parameters/settings.md#max_table_num_to_warn)
* [max&#95;database&#95;num&#95;to&#95;warn](../server-configuration-parameters/settings.md#max_database_num_to_warn)
* [max&#95;dictionary&#95;num&#95;to&#95;warn](../server-configuration-parameters/settings.md#max_dictionary_num_to_warn)
* [max&#95;view&#95;num&#95;to&#95;warn](../server-configuration-parameters/settings.md#max_view_num_to_warn)
* [max&#95;part&#95;num&#95;to&#95;warn](../server-configuration-parameters/settings.md#max_part_num_to_warn)
* [max&#95;pending&#95;mutations&#95;to&#95;warn](../server-configuration-parameters/settings.md#max_pending_mutations_to_warn)
* [max&#95;pending&#95;mutations&#95;execution&#95;time&#95;to&#95;warn](/operations/server-configuration-parameters/settings#max_pending_mutations_execution_time_to_warn)
* [max&#95;named&#95;collection&#95;num&#95;to&#95;warn](../server-configuration-parameters/settings.md#max_named_collection_num_to_warn)
* [resource&#95;overload&#95;warnings](/operations/settings/server-overload#resource-overload-warnings)

列：

* `message` ([String](../../sql-reference/data-types/string.md)) — 警告信息。
* `message_format_string` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 用于格式化该信息的格式字符串。

**示例**

查询：

```sql
 SELECT * FROM system.warnings LIMIT 2 \G;
```

结果：

```text
Row 1:
──────
message:               活跃数据分片数量超过 10。
message_format_string: 活跃数据分片数量超过 {}。

Row 2:
──────
message:               已挂载数据库数量超过 2。
message_format_string: 已挂载数据库数量超过 {}。
```
