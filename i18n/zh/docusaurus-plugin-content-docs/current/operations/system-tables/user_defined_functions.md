---
description: '包含用户自定义函数（UDF）加载状态和配置元数据的系统表。'
keywords: ['系统表', 'user_defined_functions', 'udf', '可执行体']
slug: /operations/system-tables/user_defined_functions
title: 'system.user_defined_functions'
doc_type: 'reference'
---

# system.user_defined_functions \{#systemuser_defined_functions\}

包含 [User-Defined Functions (UDFs)](/sql-reference/functions/udf.md) 的加载状态、错误信息和配置元数据。

Columns:

**加载状态**

* `name` ([String](/sql-reference/data-types/string.md)) — UDF 名称。
* `load_status` ([Enum8](/sql-reference/data-types/enum.md)) — 加载状态：`Success`（UDF 已加载并就绪）、`Failed`（UDF 加载失败）。
* `loading_error_message` ([String](/sql-reference/data-types/string.md)) — 加载失败时的详细错误信息。加载成功时为空。
* `last_successful_update_time` ([Nullable(DateTime)](/sql-reference/data-types/datetime.md)) — 最近一次成功加载的时间戳。若从未成功则为 `NULL`。
* `loading_duration_ms` ([UInt64](/sql-reference/data-types/int-uint.md)) — 加载 UDF 所花费的时间，以毫秒为单位。

**UDF 配置**

* `type` ([Enum8](/sql-reference/data-types/enum.md)) — UDF 类型：`executable`（每个数据块单独进程）或 `executable_pool`（持久化进程池）。
* `command` ([String](/sql-reference/data-types/string.md)) — 要执行的脚本或命令，包括参数。
* `format` ([String](/sql-reference/data-types/string.md)) — I/O 的数据格式（例如 `TabSeparated`、`JSONEachRow`）。
* `return_type` ([String](/sql-reference/data-types/string.md)) — 函数返回类型（例如 `String`、`UInt64`）。
* `return_name` ([String](/sql-reference/data-types/string.md)) — 可选的返回值标识符。未配置时为空。
* `argument_types` ([Array(String)](/sql-reference/data-types/array.md)) — 参数类型数组。
* `argument_names` ([Array(String)](/sql-reference/data-types/array.md)) — 参数名称数组。未命名参数使用空字符串。

**执行参数**

* `max_command_execution_time` ([UInt64](/sql-reference/data-types/int-uint.md)) — 处理一个数据块的最长时间（秒）。仅适用于 `executable_pool` 类型。
* `command_termination_timeout` ([UInt64](/sql-reference/data-types/int-uint.md)) — 在向命令进程发送 SIGTERM 之前等待的秒数。
* `command_read_timeout` ([UInt64](/sql-reference/data-types/int-uint.md)) — 从命令 stdout 读取的超时时间（毫秒）。
* `command_write_timeout` ([UInt64](/sql-reference/data-types/int-uint.md)) — 向命令 stdin 写入的超时时间（毫秒）。
* `pool_size` ([UInt64](/sql-reference/data-types/int-uint.md)) — 进程池中的进程实例数量。仅适用于 `executable_pool` 类型。
* `send_chunk_header` ([UInt8](/sql-reference/data-types/int-uint.md)) — 是否在每个数据块前发送行数（1 = true，0 = false）。
* `execute_direct` ([UInt8](/sql-reference/data-types/int-uint.md)) — 是否直接执行命令（1）或通过 `/bin/bash` 执行（0）。
* `lifetime` ([UInt64](/sql-reference/data-types/int-uint.md)) — 重新加载间隔（秒）。0 表示禁用重新加载。
* `deterministic` ([UInt8](/sql-reference/data-types/int-uint.md)) — 函数在相同参数下是否总是返回相同结果（1 = true，0 = false）。

**示例**

查看所有 UDF 及其加载状态：

```sql
SELECT
    name,
    load_status,
    type,
    command,
    return_type,
    argument_types
FROM system.user_defined_functions
FORMAT Vertical;
```

```response
Row 1:
──────
name:           my_sum_udf
load_status:    Success
type:           executable
command:        /var/lib/clickhouse/user_scripts/sum.py
return_type:    UInt64
argument_types: ['UInt64','UInt64']
```

定位失败的 UDF：

```sql
SELECT
    name,
    loading_error_message
FROM system.user_defined_functions
WHERE load_status = 'Failed';
```

**另请参阅**

* [User-Defined Functions](/sql-reference/functions/udf.md) — 如何创建和配置 UDF（用户定义函数）。
