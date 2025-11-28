---
description: '包含从 Iceberg 表中读取的元数据文件信息的系统表。每条记录表示一个根元数据文件、从 Avro 文件中提取的元数据，或某个 Avro 文件中的一条元数据记录。'
keywords: ['system table', 'iceberg_metadata_log']
slug: /operations/system-tables/iceberg_metadata_log
title: 'system.iceberg_metadata_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.iceberg_metadata_log

`system.iceberg_metadata_log` 表记录了 ClickHouse 读取 Iceberg 表时的元数据访问和解析事件。它提供了每个已处理元数据文件或条目的详细信息，有助于调试、审计，以及理解 Iceberg 表结构的演变。



## 目的 {#purpose}

此表会记录从 Iceberg 表中读取的每个元数据文件及条目，包括根元数据文件、manifest 列表以及 manifest 条目。它帮助用户跟踪 ClickHouse 如何解析 Iceberg 表元数据，并诊断与模式演进、文件解析或查询计划相关的问题。

:::note
此表主要用于调试。
:::



## 列 {#columns}

| 名称           | 类型      | 描述                                                                                   |
|----------------|-----------|----------------------------------------------------------------------------------------------|
| `event_date`   | [Date](../../sql-reference/data-types/date.md)      | 日志记录的日期。                                                                       |
| `event_time`   | [DateTime](../../sql-reference/data-types/datetime.md)  | 事件的时间戳。                                                                      |
| `query_id`     | [String](../../sql-reference/data-types/string.md)    | 触发元数据读取的查询 ID。                                                   |
| `content_type` | [Enum8](../../sql-reference/data-types/enum.md)     | 元数据内容的类型（见下文）。                                                        |
| `table_path`   | [String](../../sql-reference/data-types/string.md)    | Iceberg 表的路径。                                                                   |
| `file_path`    | [String](../../sql-reference/data-types/string.md)    | 根元数据 JSON 文件、Avro 清单列表或清单文件的路径。                   |
| `content`      | [String](../../sql-reference/data-types/string.md)    | JSON 格式的内容（来自 .json 的原始元数据、Avro 元数据或 Avro 条目）。              |
| `row_in_file`  | [Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md)) | 文件中的行号（如适用）。对于 `ManifestListEntry` 和 `ManifestFileEntry` 类型的内容，该列存在。 |



## `content_type` 值 {#content-type-values}

- `None`: 无内容。
- `Metadata`: 根元数据文件。
- `ManifestListMetadata`: Manifest 列表的元数据。
- `ManifestListEntry`: Manifest 列表条目。
- `ManifestFileMetadata`: Manifest 文件的元数据。
- `ManifestFileEntry`: Manifest 文件条目。

<SystemTableCloud/>



## 控制日志详细程度

可以通过 [`iceberg_metadata_log_level`](../../operations/settings/settings.md#iceberg_metadata_log_level) 设置来控制要记录哪些元数据事件。

要记录当前查询中使用的所有元数据：

```sql
SELECT * FROM my_iceberg_table SETTINGS iceberg_metadata_log_level = 'manifest_file_entry';

SYSTEM FLUSH LOGS iceberg_metadata_log;

SELECT content_type, file_path, row_in_file
FROM system.iceberg_metadata_log
WHERE query_id = '{previous_query_id}';
```

若要仅记录当前查询使用的根元数据 JSON 文件：

```sql
SELECT * FROM my_iceberg_table SETTINGS iceberg_metadata_log_level = 'metadata';

SYSTEM FLUSH LOGS iceberg_metadata_log;

SELECT content_type, file_path, row_in_file
FROM system.iceberg_metadata_log
WHERE query_id = '{previous_query_id}';
```

有关更多信息，请参阅 [`iceberg_metadata_log_level`](../../operations/settings/settings.md#iceberg_metadata_log_level) 设置的说明。

### 注意事项

* 仅在需要对 Iceberg 表进行深入排查时才在查询级别使用 `iceberg_metadata_log_level`。否则，可能会在日志表中填充过多元数据，从而导致性能下降。
* 该表可能包含重复条目，因为它主要用于调试，并不保证每个实体的唯一性。
* 如果使用的 `content_type` 比 `ManifestListMetadata` 更为详尽，则会对 manifest 列表禁用 Iceberg 元数据缓存。
* 同样地，如果使用的 `content_type` 比 `ManifestFileMetadata` 更为详尽，则会对 manifest 文件禁用 Iceberg 元数据缓存。


## 另请参阅 {#see-also}
- [Iceberg 表引擎](../../engines/table-engines/integrations/iceberg.md)
- [Iceberg 表函数](../../sql-reference/table-functions/iceberg.md)
- [system.iceberg_history](./iceberg_history.md)
