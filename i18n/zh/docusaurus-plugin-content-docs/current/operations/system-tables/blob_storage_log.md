---
'description': '系统表包含记录条目，旨在提供有关各种 blob 存储操作的信息，例如上传和删除。'
'keywords':
- 'system table'
- 'blob_storage_log'
'slug': '/operations/system-tables/blob_storage_log'
'title': 'system.blob_storage_log'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含关于各种BLOB存储操作（如上传和删除）的日志条目。

列：

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器的主机名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 事件的日期。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 事件的时间。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 事件的时间，精确到微秒。
- `event_type` ([Enum8](../../sql-reference/data-types/enum.md)) — 事件的类型。可能的值：
    - `'Upload'`
    - `'Delete'`
    - `'MultiPartUploadCreate'`
    - `'MultiPartUploadWrite'`
    - `'MultiPartUploadComplete'`
    - `'MultiPartUploadAbort'`
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 与事件相关的查询标识符（如有）。
- `thread_id` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 执行操作的线程标识符。
- `thread_name` ([String](../../sql-reference/data-types/string.md)) — 执行操作的线程名称。
- `disk_name` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — 关联磁盘的名称。
- `bucket` ([String](../../sql-reference/data-types/string.md)) — 桶的名称。
- `remote_path` ([String](../../sql-reference/data-types/string.md)) — 远程资源的路径。
- `local_path` ([String](../../sql-reference/data-types/string.md)) — 本地系统上元数据文件的路径，该文件引用远程资源。
- `data_size` ([UInt32](/sql-reference/data-types/int-uint#integer-ranges)) — 与上传事件相关的数据大小。
- `error` ([String](../../sql-reference/data-types/string.md)) — 与事件相关的错误消息（如有）。

**示例**

假设一个BLOB存储操作上传了一个文件，并且记录了一条事件：

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

在这个例子中，上传操作与ID为`7afe0450-504d-4e4b-9a80-cd9826047972`的`INSERT`查询相关。 本地元数据文件 `store/654/6549e8b3-d753-4447-8047-d462df6e6dbe/tmp_insert_all_1_1_0/checksums.txt` 引用存储在 `bucket1` 的磁盘 `disk_s3` 上的远程路径 `rrr/kxo/tbnqtrghgtnxkzgtcrlutwuslgawe`，文件大小为259字节。

**另见**

- [外部磁盘存储数据](../../operations/storing-data.md)
