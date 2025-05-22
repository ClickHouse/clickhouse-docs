---
'description': '系统表，包含有关服务器配置中定义的存储策略和卷的信息。'
'keywords':
- 'system table'
- 'storage_policies'
'slug': '/operations/system-tables/storage_policies'
'title': 'system.storage_policies'
---


# system.storage_policies

包含在 [服务器配置](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure) 中定义的存储策略和卷的信息。

列：

- `policy_name` ([String](../../sql-reference/data-types/string.md)) — 存储策略的名称。
- `volume_name` ([String](../../sql-reference/data-types/string.md)) — 在存储策略中定义的卷名称。
- `volume_priority` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 配置中的卷顺序编号，数据根据该优先级填充卷，即插入和合并时数据写入优先级较低的卷（考虑其他规则：TTL， `max_data_part_size`， `move_factor`）。
- `disks` ([Array(String)](../../sql-reference/data-types/array.md)) — 在存储策略中定义的磁盘名称。
- `volume_type` ([Enum8](../../sql-reference/data-types/enum.md))  — 卷的类型。可以具有以下值之一：
    - `JBOD` 
    - `SINGLE_DISK`
    - `UNKNOWN`
- `max_data_part_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 可以存储在卷磁盘上的数据部分的最大大小（0 — 无限制）。
- `move_factor` ([Float64](../../sql-reference/data-types/float.md)) — 可用磁盘空间的比例。当比例超过配置参数的值时，ClickHouse开始将数据移动到下一个卷中。
- `prefer_not_to_merge` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `prefer_not_to_merge` 设置的值。应始终为 false。当此设置启用时，表示您犯了错误。
- `perform_ttl_move_on_insert` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `perform_ttl_move_on_insert` 设置的值。— 在数据部分插入时禁用 TTL 移动。默认情况下，如果我们插入的部分数据已经过了 TTL 移动规则的有效期，它会立即进入在移动规则中声明的卷/磁盘。如果目标卷/磁盘较慢（例如 S3），这可能会显著减慢插入速度。
- `load_balancing` ([Enum8](../../sql-reference/data-types/enum.md))  — 磁盘均衡的策略。可以具有以下值之一：
    - `ROUND_ROBIN`
    - `LEAST_USED`

如果存储策略包含多个卷，则每个卷的信息将存储在表的单独行中。
