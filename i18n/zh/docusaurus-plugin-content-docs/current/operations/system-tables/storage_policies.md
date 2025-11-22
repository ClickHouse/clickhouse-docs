---
description: '包含在服务器配置中定义的存储策略和卷相关信息的系统表'
keywords: ['system 表', 'storage_policies']
slug: /operations/system-tables/storage_policies
title: 'system.storage_policies'
doc_type: 'reference'
---

# system.storage_policies

包含在[服务器配置](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure)中定义的存储策略和卷的信息。

列：

- `policy_name` ([String](../../sql-reference/data-types/string.md)) — 存储策略名称。
- `volume_name` ([String](../../sql-reference/data-types/string.md)) — 在存储策略中定义的卷名称。
- `volume_priority` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 在配置中的卷序号，数据会按照该优先级顺序填充卷，即在插入和合并时，数据会写入优先级更低的卷（同时考虑其他规则：TTL、`max_data_part_size`、`move_factor`）。
- `disks` ([Array(String)](../../sql-reference/data-types/array.md)) — 在存储策略中定义的磁盘名称。
- `volume_type` ([Enum8](../../sql-reference/data-types/enum.md))  — 卷类型。可以具有以下值之一：
  - `JBOD` 
  - `SINGLE_DISK`
  - `UNKNOWN`
- `max_data_part_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 可以存储在卷磁盘上的数据部分的最大大小（0 表示不限制）。
- `move_factor` ([Float64](../../sql-reference/data-types/float.md)) — 磁盘空闲空间比例。当该比例超过配置参数的值时，ClickHouse 会开始按顺序将数据移动到下一个卷。
- `prefer_not_to_merge` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `prefer_not_to_merge` 设置的值。应始终为 false。如果启用了此设置，则说明配置有误。
- `perform_ttl_move_on_insert` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `perform_ttl_move_on_insert` 设置的值。其含义是：在数据部分 INSERT 时禁用 TTL 移动。默认情况下，如果插入的数据部分已经根据 TTL 移动规则过期，它会立即被写入该移动规则中声明的卷/磁盘。如果目标卷/磁盘较慢（例如 S3），这可能会显著降低插入性能。
- `load_balancing` ([Enum8](../../sql-reference/data-types/enum.md))  — 磁盘负载均衡策略。可以具有以下值之一：
  - `ROUND_ROBIN`
  - `LEAST_USED`

如果存储策略包含多个卷，则每个卷的信息都会存储在表中的单独一行中。