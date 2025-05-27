---
'description': '系统表包含有关本地服务器上资源的信息，每个资源有一行.'
'keywords':
- 'system table'
- 'resources'
'slug': '/operations/system-tables/resources'
'title': 'system.resources'
---


# system.resources

包含有关位于本地服务器上的 [resources](/operations/workload-scheduling.md#workload_entity_storage) 的信息。该表为每个资源包含一行。

示例：

```sql
SELECT *
FROM system.resources
FORMAT Vertical
```

```text
Row 1:
──────
name:         io_read
read_disks:   ['s3']
write_disks:  []
create_query: CREATE RESOURCE io_read (READ DISK s3)

Row 2:
──────
name:         io_write
read_disks:   []
write_disks:  ['s3']
create_query: CREATE RESOURCE io_write (WRITE DISK s3)
```

列：

- `name` (`String`) - 资源名称。
- `read_disks` (`Array(String)`) - 使用此资源进行读取操作的磁盘名称数组。
- `write_disks` (`Array(String)`) - 使用此资源进行写入操作的磁盘名称数组。
- `create_query` (`String`) - 资源的定义。
