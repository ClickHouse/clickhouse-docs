---
description: '包含关于驻留在本地服务器的资源信息的系统表，每个资源对应一行。'
slug: /operations/system-tables/resources
title: 'system.system.resources'
keywords: ['系统表', '资源']
---

包含关于[资源](/operations/workload-scheduling.md#workload_entity_storage)的信息，这些资源驻留在本地服务器上。该表为每个资源包含一行。

示例：

``` sql
SELECT *
FROM system.resources
FORMAT Vertical
```

``` text
行 1:
──────
name:         io_read
read_disks:   ['s3']
write_disks:  []
create_query: CREATE RESOURCE io_read (READ DISK s3)

行 2:
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
