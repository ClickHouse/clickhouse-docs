---
description: '包含在服务器配置中定义的存储策略和卷信息的系统表。'
keywords: ['系统表', 'storage_policies']
slug: /operations/system-tables/storage_policies
title: 'system.storage_policies'
doc_type: 'reference'
---

# system.storage&#95;policies {#systemstorage&#95;policies}

包含在[服务器配置](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure)中定义的存储策略和卷的信息。

列：

* `policy_name` ([String](../../sql-reference/data-types/string.md)) — 存储策略名称。
* `volume_name` ([String](../../sql-reference/data-types/string.md)) — 在存储策略中定义的卷名称。
* `volume_priority` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 卷在配置中的顺序号，数据会根据此优先级依次填充各卷，即在插入和合并过程中，数据会写入优先级较低的卷（同时会考虑其他规则：TTL、`max_data_part_size`、`move_factor`）。
* `disks` ([Array(String)](../../sql-reference/data-types/array.md)) — 在存储策略中定义的磁盘名称。
* `volume_type` ([Enum8](../../sql-reference/data-types/enum.md))  — 卷类型。可以是以下值之一：
  * `JBOD`
  * `SINGLE_DISK`
  * `UNKNOWN`
* `max_data_part_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 可以存储在该卷磁盘上的数据分片的最大大小（0 — 无限制）。
* `move_factor` ([Float64](../../sql-reference/data-types/float.md)) — 空闲磁盘空间的占比。当该占比超过配置参数的值时，ClickHouse 会按顺序开始将数据移动到下一个卷。
* `prefer_not_to_merge` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `prefer_not_to_merge` 设置的值。应始终为 false。启用该设置说明这是一个错误配置。
* `perform_ttl_move_on_insert` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `perform_ttl_move_on_insert` 设置的值。用于在数据分片 INSERT 时禁用 TTL 移动。默认情况下，如果我们插入的某个数据分片已经符合 TTL 移动规则（已过期），它会立即被写入在移动规则中声明的卷/磁盘。如果目标卷/磁盘较慢（例如 S3），这可能会显著降低插入速度。
* `load_balancing` ([Enum8](../../sql-reference/data-types/enum.md))  — 磁盘负载均衡策略。可以是以下值之一：
  * `ROUND_ROBIN`
  * `LEAST_USED`

如果存储策略包含多个卷，则关于每个卷的信息会存储在表中的单独一行。