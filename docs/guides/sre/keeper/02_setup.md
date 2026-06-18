---
slug: /guides/sre/keeper/setup

sidebar_label: 'Setup'
position: 2
keywords: ['Keeper', 'ZooKeeper', 'clickhouse-keeper', 'configuration', 'setup', 'migration']
description: 'How to configure, run, and migrate to ClickHouse Keeper.'
title: 'ClickHouse Keeper setup'
doc_type: 'guide'
---


import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';

<SelfManaged />

### Configuration {#configuration}

ClickHouse Keeper can be used as a standalone replacement for ZooKeeper or as an internal part of the ClickHouse server. In both cases the configuration is almost the same `.xml` file.

#### Keeper configuration settings {#keeper-configuration-settings}

The main ClickHouse Keeper configuration tag is `<keeper_server>` and has the following parameters:

| Parameter                            | Description                                                                                                                                                                                                                                         | Default                                                                                                      |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `tcp_port`                           | Port for a client to connect.                                                                                                                                                                                                                       | `2181`                                                                                                       |
| `tcp_port_secure`                    | Secure port for an SSL connection between client and keeper-server.                                                                                                                                                                                 | -                                                                                                            |
| `server_id`                          | Unique server id, each participant of the ClickHouse Keeper cluster must have a unique number (1, 2, 3...).                                                                                                                                 | -                                                                                                            |
| `log_storage_path`                   | Path to coordination logs, just like ZooKeeper it's best to store logs on non-busy nodes.                                                                                                                                                          | -                                                                                                            |
| `snapshot_storage_path`              | Path to coordination snapshots.                                                                                                                                                                                                                     | -                                                                                                            |
| `enable_reconfiguration`             | Enable dynamic cluster reconfiguration via [`reconfig`](/guides/sre/keeper/guides#reconfiguration).                                                                                                                                                          | `False`                                                                                                      |
| `max_memory_usage_soft_limit`        | Soft limit in bytes of keeper max memory usage.                                                                                                                                                                                                     | `max_memory_usage_soft_limit_ratio` * `physical_memory_amount`                                               |
| `max_memory_usage_soft_limit_ratio`  | If `max_memory_usage_soft_limit` isn't set or set to zero, we use this value to define the default soft limit.                                                                                                                                     | `0.9`                                                                                                        |
| `cgroups_memory_observer_wait_time`  | If `max_memory_usage_soft_limit` isn't set or is set to `0`, we use this interval to observe the amount of physical memory. Once the memory amount changes, we will recalculate Keeper's memory soft limit by `max_memory_usage_soft_limit_ratio`. | `15`                                                                                                         |
| `http_control`                       | Configuration of [HTTP control](/guides/sre/keeper/reference#http-control) interface.                                                                                                                                                                           | -                                                                                                            |
| `digest_enabled`                     | Enable real-time data consistency check                                                                                                                                                                                                             | `True`                                                                                                       |
| `create_snapshot_on_exit`            | Create a snapshot during shutdown                                                                                                                                                                                                                   | -                                                                                                            |
| `hostname_checks_enabled`            | Enable sanity hostname checks for cluster configuration (e.g. if localhost is used with remote endpoints)                                                                                                                                           | `True`                                                                                                       |
| `four_letter_word_white_list`        | White list of 4lw commands.                                                                                                                                                                                                                         | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |
|`enable_ipv6`| Enable IPv6 | `True`|

Other common parameters are inherited from the ClickHouse server config (`listen_host`, `logger`, and so on).

#### Internal coordination settings {#internal-coordination-settings}

Internal coordination settings are located in the `<keeper_server>.<coordination_settings>` section and have the following parameters:

| Parameter                          | Description                                                                                                                                                                                                              | Default                                                                                                      |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`             | Timeout for a single client operation (ms)                                                                                                                                                                               | `10000`                                                                                                      |
| `min_session_timeout_ms`           | Min timeout for client session (ms)                                                                                                                                                                                      | `10000`                                                                                                      |
| `session_timeout_ms`               | Max timeout for client session (ms)                                                                                                                                                                                      | `100000`                                                                                                     |
| `dead_session_check_period_ms`     | How often ClickHouse Keeper checks for dead sessions and removes them (ms)                                                                                                                                               | `500`                                                                                                        |
| `heart_beat_interval_ms`           | How often a ClickHouse Keeper leader will send heartbeats to followers (ms)                                                                                                                                              | `500`                                                                                                        |
| `election_timeout_lower_bound_ms`  | If the follower doesn't receive a heartbeat from the leader in this interval, then it can initiate leader election. Must be less than or equal to  `election_timeout_upper_bound_ms`. Ideally they shouldn't be equal.  | `1000`                                                                                                       |
| `election_timeout_upper_bound_ms`  | If the follower doesn't receive a heartbeat from the leader in this interval, then it must initiate leader election.                                                                                                    | `2000`                                                                                                       |
| `rotate_log_storage_interval`      | How many log records to store in a single file.                                                                                                                                                                          | `100000`                                                                                                     |
| `reserved_log_items`               | How many coordination log records to store before compaction.                                                                                                                                                            | `100000`                                                                                                     |
| `snapshot_distance`                | How often ClickHouse Keeper will create new snapshots (in the number of records in logs).                                                                                                                                | `100000`                                                                                                     |
| `snapshots_to_keep`                | How many snapshots to keep.                                                                                                                                                                                              | `3`                                                                                                          |
| `stale_log_gap`                    | Threshold when leader considers follower as stale and sends the snapshot to it instead of logs.                                                                                                                          | `10000`                                                                                                      |
| `fresh_log_gap`                    | When node became fresh.                                                                                                                                                                                                  | `200`                                                                                                        |
| `max_requests_batch_size`          | Max size of batch in requests count before it will be sent to RAFT.                                                                                                                                                      | `100`                                                                                                        |
| `force_sync`                       | Call `fsync` on each write to coordination log.                                                                                                                                                                          | `true`                                                                                                       |
| `quorum_reads`                     | Execute read requests as writes through whole RAFT consensus with similar speed.                                                                                                                                         | `false`                                                                                                      |
| `raft_logs_level`                  | Text logging level about coordination (trace, debug, and so on).                                                                                                                                                         | `system default`                                                                                             |
| `auto_forwarding`                  | Allow to forward write requests from followers to the leader.                                                                                                                                                            | `true`                                                                                                       |
| `shutdown_timeout`                 | Wait to finish internal connections and shutdown (ms).                                                                                                                                                                   | `5000`                                                                                                       |
| `startup_timeout`                  | If the server doesn't connect to other quorum participants in the specified timeout it will terminate (ms).                                                                                                              | `30000`                                                                                                      |
| `async_replication`                | Enable async replication. All write and read guarantees are preserved while better performance is achieved. Settings is disabled by default to not break backwards compatibility                                         | `false`                                                                                                      |
| `latest_logs_cache_size_threshold` | Maximum total size of in-memory cache of latest log entries                                                                                                                                                              | `1GiB`                                                                                                       |
| `commit_logs_cache_size_threshold` | Maximum total size of in-memory cache of log entries needed next for commit                                                                                                                                              | `500MiB`                                                                                                     |
| `disk_move_retries_wait_ms`        | How long to wait between retries after a failure which happened while a file was being moved between disks                                                                                                               | `1000`                                                                                                       |
| `disk_move_retries_during_init`    | The amount of retries after a failure which happened while a file was being moved between disks during initialization                                                                                                    | `100`                                                                                                        |
| `experimental_use_rocksdb`         | Use rocksdb as backend storage                                                                                                    | `0`                                                                                                        |

Quorum configuration is located in the `<keeper_server>.<raft_configuration>` section and contain servers description.

The only parameter for the whole quorum is `secure`, which enables encrypted connection for communication between quorum participants. The parameter can be set `true` if SSL connection is required for internal communication between nodes, or left unspecified otherwise.

The main parameters for each `<server>` are:

- `id` — Server identifier in a quorum.
- `hostname` — Hostname where this server is placed.
- `port` — Port where this server listens for connections.
- `can_become_leader` — Set to `false` to set up the server as a `learner`. If omitted, the value is `true`.

:::note
In the case of a change in the topology of your ClickHouse Keeper cluster (e.g., replacing a server), make sure to keep the mapping of `server_id` to `hostname` consistent and avoid shuffling or reusing an existing `server_id` for different servers (e.g., it can happen if your rely on automation scripts to deploy ClickHouse Keeper)

If the host of a Keeper instance can change, we recommend defining and using a hostname instead of raw IP addresses. Changing hostname is equal to removing and adding the server back which in some cases can be impossible to do (e.g. not enough Keeper instances for quorum).
:::

:::note
`async_replication` is disabled by default to avoid breaking backwards compatibility. If you have all your Keeper instances in a cluster running a version supporting `async_replication` (v23.9+), we recommend enabling it because it can improve performance without any downsides.
:::

Examples of configuration for quorum with three nodes can be found in [integration tests](https://github.com/ClickHouse/ClickHouse/tree/master/tests/integration) with `test_keeper_` prefix. Example configuration for server #1:

```xml
<keeper_server>
    <tcp_port>2181</tcp_port>
    <server_id>1</server_id>
    <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
    <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

    <coordination_settings>
        <operation_timeout_ms>10000</operation_timeout_ms>
        <session_timeout_ms>30000</session_timeout_ms>
        <raft_logs_level>trace</raft_logs_level>
    </coordination_settings>

    <raft_configuration>
        <server>
            <id>1</id>
            <hostname>zoo1</hostname>
            <port>9234</port>
        </server>
        <server>
            <id>2</id>
            <hostname>zoo2</hostname>
            <port>9234</port>
        </server>
        <server>
            <id>3</id>
            <hostname>zoo3</hostname>
            <port>9234</port>
        </server>
    </raft_configuration>
</keeper_server>
```

### How to run {#how-to-run}

ClickHouse Keeper is bundled into the ClickHouse server package, just add configuration of `<keeper_server>` to your `/etc/your_path_to_config/clickhouse-server/config.xml` and start ClickHouse server as always. If you want to run standalone ClickHouse Keeper you can start it in a similar way with:

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

If you don't have the symlink (`clickhouse-keeper`) you can create it or specify `keeper` as an argument to `clickhouse`:

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```

### Migration from ZooKeeper {#migration-from-zookeeper}

Seamless migration from ZooKeeper to ClickHouse Keeper isn't possible. You have to stop your ZooKeeper cluster, convert data, and start ClickHouse Keeper. The `clickhouse-keeper-converter` tool converts ZooKeeper logs and snapshots to a ClickHouse Keeper snapshot. It requires ZooKeeper 3.4 or later.

#### Pre-migration preparation {#pre-migration-preparation}

Migration requires stopping data ingestion. Plan a maintenance window before you begin.

Before stopping ZooKeeper, halt ClickHouse background tasks that modify coordination metadata. For example:

```sql
SYSTEM STOP MERGES;
```

Record comparison metrics before migration so you can verify consistency afterward.

#### Migration steps {#migration-steps}

1. Stop data ingestion into all ClickHouse nodes.

2. Stop all background tasks on all ClickHouse nodes (see [above](#pre-migration-preparation)).

3. Stop all ZooKeeper nodes.

4. Optional, but recommended: find the ZooKeeper leader node, start and stop it again. This forces ZooKeeper to write a consistent snapshot to disk before conversion.

5. Run `clickhouse-keeper-converter` on the leader node. If you have the full ClickHouse binary installed, use the `keeper-converter` subcommand instead (`clickhouse keeper-converter`). If neither is available, [download the binary](/getting-started/quick-start/oss#install-clickhouse).

```bash
clickhouse-keeper-converter \
  --zookeeper-logs-dir /var/lib/zookeeper/version-2 \
  --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 \
  --output-dir /path/to/clickhouse/keeper/snapshots
```

6. Copy the snapshot to all ClickHouse Keeper nodes. The snapshot must be present on every node before any node starts — if a node starts without a snapshot, it may elect itself leader with empty state.

7. Update your ClickHouse configuration to point at the new Keeper cluster.

8. Start ClickHouse Keeper on all nodes, then restart ClickHouse.

9. Compare metrics against your pre-migration baseline to verify consistency.

10. Resume background tasks and restart data ingestion.

#### Consolidating multiple ZooKeeper clusters {#consolidating-multiple-zookeeper-clusters}

If you run multiple ZooKeeper clusters — for example, one per shard group — you can consolidate them into a single ClickHouse Keeper cluster. The official `clickhouse-keeper-converter` tool only supports one-to-one conversions (one ZooKeeper cluster to one Keeper snapshot), so consolidation requires modifying the converter source code to merge multiple snapshots:

1. Run `clickhouse-keeper-converter` separately on each ZooKeeper cluster, writing each output to a distinct directory.
2. Deserialize the snapshot files sequentially. When merging, recalculate `numChildren` values to avoid node ID conflicts between namespaces from different source clusters.
3. Write the merged output to the target ClickHouse Keeper snapshot directory.

#### Handling encryption and ACLs {#handling-encryption-and-acls}

ClickHouse Keeper supports the same ACL schemes as ZooKeeper (`world`, `auth`, `digest`). How you handle ACLs during conversion depends on your ZooKeeper setup:

- **Fully encrypted or fully unencrypted**: Convert directly. The converter preserves existing ACL information.
- **Partially encrypted**: Before converting, grant a super administrator account and clear ACLs with `setAcl -R` on the affected paths. Convert, then re-enable encryption in ClickHouse Keeper if needed.

#### Verifying the migration {#verifying-the-migration}

After starting ClickHouse Keeper and restarting ClickHouse, compare your key metrics against the pre-migration baseline to confirm the migration succeeded.

When consolidating multiple ZooKeeper clusters, distinguish between:
- **Common paths**: Paths present across multiple source clusters with identical data — these should be deduplicated in the merged output.
- **Differentiated paths**: Paths that exist only under specific clusters (e.g., under `/clickhouse/tables` for each shard group) — these must be preserved from the correct source.

Avoid traversing large ZooKeeper trees directly for comparison. Print all converted paths to a file during conversion instead.

#### Post-migration tuning {#post-migration-tuning}

After migration, consider tuning these settings for larger clusters or higher throughput:

| Setting | Default | Recommended | Notes |
|---------|---------|-------------|-------|
| `max_requests_batch_size` | `100` | `10000` | Increase for clusters with high part counts or many shards |
| `force_sync` | `true` | `false` | Asynchronous log writes improve throughput |
| `compress_logs` | `false` | `true` | Compresses Raft log files to reduce disk I/O |
| `compress_snapshots_with_zstd_format` | `true` | — | Already enabled by default; compresses snapshots with zstd |

These settings are configured under `coordination_settings` in your [Keeper configuration](#internal-coordination-settings).

### Recovering after losing quorum {#recovering-after-losing-quorum}

Because ClickHouse Keeper uses Raft it can tolerate a certain amount of node crashes depending on the cluster size. \
E.g. for a 3-node cluster, it will continue working correctly if only 1 node crashes.

Cluster configuration can be dynamically configured, but there are some limitations. Reconfiguration relies on Raft also
so to add/remove a node from the cluster you need to have a quorum. If you lose too many nodes in your cluster at the same time without any chance
of starting them again, Raft will stop working and not allow you to reconfigure your cluster using the conventional way.

Nevertheless, ClickHouse Keeper has a recovery mode which allows you to forcefully reconfigure your cluster with only 1 node.
This should be done only as your last resort if you can't start your nodes again, or start a new instance on the same endpoint.

Important things to note before continuing:
- Make sure that the failed nodes can't connect to the cluster again.
- Don't start any of the new nodes until it's specified in the steps.

After making sure that the above things are true, you need to do the following:
1. Pick a single Keeper node to be your new leader. Be aware that the data of that node will be used for the entire cluster, so we recommend using a node with the most up-to-date state.
2. Before doing anything else, make a backup of the `log_storage_path` and `snapshot_storage_path` folders of the picked node.
3. Reconfigure the cluster on all of the nodes you want to use.
4. Send the four letter command `rcvr` to the node you picked which will move the node to the recovery mode OR stop Keeper instance on the picked node and start it again with the `--force-recovery` argument.
5. One by one, start Keeper instances on the new nodes making sure that `mntr` returns `follower` for the `zk_server_state` before starting the next one.
6. While in the recovery mode, the leader node will return error message for `mntr` command until it achieves quorum with the new nodes and refuse any requests from the client and the followers.
7. After quorum is achieved, the leader node will return to the normal mode of operation, accepting all the requests using Raft-verify with `mntr` which should return `leader` for the `zk_server_state`.
