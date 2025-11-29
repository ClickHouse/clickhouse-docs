---
description: '包含日志记录的系统表，记录各种 Blob 存储操作（如上传和删除）的相关信息。'
keywords: ['系统表', 'blob_storage_log']
slug: /operations/system-tables/blob_storage_log
title: 'system.blob_storage_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud />

包含记录各种 blob 存储操作（如上传和删除）的日志记录。

列：

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器主机名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 事件日期。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 事件时间。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 具有微秒级精度的事件时间。
* `event_type` ([Enum8](../../sql-reference/data-types/enum.md)) — 事件类型。可能的取值：
  * `'Upload'`
  * `'Delete'`
  * `'MultiPartUploadCreate'`
  * `'MultiPartUploadWrite'`
  * `'MultiPartUploadComplete'`
  * `'MultiPartUploadAbort'`
* `query_id` ([String](../../sql-reference/data-types/string.md)) — 与该事件关联的查询标识符（如果有）。
* `thread_id` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 执行该操作的线程标识符。
* `thread_name` ([String](../../sql-reference/data-types/string.md)) — 执行该操作的线程名称。
* `disk_name` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — 关联磁盘的名称。
* `bucket` ([String](../../sql-reference/data-types/string.md)) — bucket 的名称。
* `remote_path` ([String](../../sql-reference/data-types/string.md)) — 远程资源的路径。
* `local_path` ([String](../../sql-reference/data-types/string.md)) — 本地系统上引用远程资源的元数据文件路径。
* `data_size` ([UInt32](/sql-reference/data-types/int-uint#integer-ranges)) — 上传事件中涉及的数据大小。
* `error` ([String](../../sql-reference/data-types/string.md)) — 与该事件关联的错误消息（如果有）。

**示例**

假设某个 blob 存储操作上传了一个文件，并记录了一个事件：

```sql
SELECT * FROM system.blob_storage_log WHERE query_id = '7afe0450-504d-4e4b-9a80-cd9826047972' ORDER BY event_date, event_time_microseconds \G
```

```text
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2023-10-31
event_time:              2023-10-31 16:03:40
event_time_microseconds: 2023-10-31 16:03:40.481437
event_type:              Upload
query_id:                7afe0450-504d-4e4b-9a80-cd9826047972
thread_id:               2381740
disk_name:               disk_s3
bucket:                  bucket1
remote_path:             rrr/kxo/tbnqtrghgtnxkzgtcrlutwuslgawe
local_path:              store/654/6549e8b3-d753-4447-8047-d462df6e6dbe/tmp_insert_all_1_1_0/checksums.txt
data_size:               259
error:
```

在此示例中，上传操作与 ID 为 `7afe0450-504d-4e4b-9a80-cd9826047972` 的 `INSERT` 查询相关联。本地元数据文件 `store/654/6549e8b3-d753-4447-8047-d462df6e6dbe/tmp_insert_all_1_1_0/checksums.txt` 对应于磁盘 `disk_s3` 上存储桶 `bucket1` 中的远程路径 `rrr/kxo/tbnqtrghgtnxkzgtcrlutwuslgawe`，文件大小为 259 字节。

**另请参阅**

* [用于存储数据的外部磁盘](../../operations/storing-data.md)
