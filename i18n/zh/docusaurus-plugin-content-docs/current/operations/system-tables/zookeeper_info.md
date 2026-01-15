---
description: '用于查看所有可用 Keeper 节点内部状态的系统表。'
keywords: ['系统表', 'zookeeper_info']
slug: /operations/system-tables/zookeeper_info
title: 'system.zookeeper_info'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.zookeeper_info {#systemzookeeper_info}

<SystemTableCloud />

此表输出关于 ZooKeeper 的综合内部信息，节点列表取自配置。

列:

* `zookeeper_cluster_name` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper 集群的名称。
* `host` ([String](../../sql-reference/data-types/string.md)) — ClickHouse 所连接的 ZooKeeper 节点的主机名或 IP 地址。
* `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — ClickHouse 连接到的 ZooKeeper 节点的端口号。
* `index` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) — ClickHouse 所连接的 ZooKeeper 节点的索引。该索引来自 ZooKeeper 配置。如果未连接，此列为 NULL。
* `is_connected` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) — 指示是否已连接到 ZooKeeper。
* `is_readonly` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 是否只读。
* `version` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper 的版本。
* `avg_latency` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 平均延迟时间。
* `max_latency` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 最大延迟值。
* `min_latency` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 最小延迟值。
* `packets_received` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 接收的数据包数量。
* `packets_sent` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 已发送的数据包数量。
* `outstanding_requests` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 未处理请求的数量。
* `server_state` ([String](../../sql-reference/data-types/string.md)) — 服务器状态。
* `is_leader` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 是否为该 ZooKeeper 节点的 leader。
* `znode_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — znode 数量。
* `watch_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — watch 数量。
* `ephemerals_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 临时节点数量。
* `approximate_data_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 数据的大致大小。
* `followers` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 领导者的从属节点（followers）数量。此字段仅由领导节点公开。
* `synced_followers` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 已与主节点完成同步的 follower 数量。此字段仅在主节点上可见。
* `pending_syncs` ([UInt64](../../sql-reference/data-types/int-uint.md)) — leader 节点的待同步数量。该字段仅在 leader 节点上暴露。
* `open_file_descriptor_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 当前已打开的文件描述符数量。仅在 Unix 平台上可用。
* `max_file_descriptor_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 最大文件描述符数量。仅在 Unix 平台上可用。
* `connections` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 连接数。
* `outstanding` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 未完成请求数。
* `zxid` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 的 zxid。`
* `node_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 节点数量。
* `snapshot_dir_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 快照目录的大小。
* `log_dir_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 日志目录大小。
* `first_log_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 中的首个日志索引。
* `first_log_term` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 中的第一个日志任期。
* `last_log_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 的最新日志索引。
* `last_log_term` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 中最后日志的任期。
* `last_committed_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 中最后一次提交的索引。
* `leader_committed_log_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper leader 节点已提交日志的索引。
* `target_committed_log_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 目标端已提交日志的索引。
* `last_snapshot_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 的最新快照索引。
  g