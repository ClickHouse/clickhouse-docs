---
slug: /en/guides/sre/keeper/clickhouse-keeper

sidebar_label: Configuring ClickHouse Keeper
sidebar_position: 10
keywords:
  - Keeper
  - ZooKeeper
  - clickhouse-keeper
  - replication
description: ClickHouse Keeper, or clickhouse-keeper, replaces ZooKeeper and provides replication and coordination.
---

# ClickHouse Keeper (clickhouse-keeper)

import SelfManaged from '@site/docs/en/_snippets/_self_managed_only_automated.md';

<SelfManaged />

ClickHouse Keeper provides the coordination system for data [replication](/docs/en/engines/table-engines/mergetree-family/replication.md) and [distributed DDL](/docs/en/sql-reference/distributed-ddl.md) queries execution. ClickHouse Keeper is compatible with ZooKeeper.

### Implementation details {#implementation-details}

ZooKeeper is one of the first well-known open-source coordination systems. It's implemented in Java, and has quite a simple and powerful data model. ZooKeeper's coordination algorithm, ZooKeeper Atomic Broadcast (ZAB), doesn't provide linearizability guarantees for reads, because each ZooKeeper node serves reads locally. Unlike ZooKeeper, ClickHouse Keeper is written in C++ and uses the [RAFT algorithm](https://raft.github.io/) [implementation](https://github.com/eBay/NuRaft). This algorithm allows linearizability for reads and writes, and has several open-source implementations in different languages.

By default, ClickHouse Keeper provides the same guarantees as ZooKeeper: linearizable writes and non-linearizable reads. It has a compatible client-server protocol, so any standard ZooKeeper client can be used to interact with ClickHouse Keeper. Snapshots and logs have an incompatible format with ZooKeeper, but the `clickhouse-keeper-converter` tool enables the conversion of ZooKeeper data to ClickHouse Keeper snapshots. The interserver protocol in ClickHouse Keeper is also incompatible with ZooKeeper so a mixed ZooKeeper / ClickHouse Keeper cluster is impossible.

ClickHouse Keeper supports Access Control Lists (ACLs) the same way as [ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl) does. ClickHouse Keeper supports the same set of permissions and has the identical built-in schemes: `world`, `auth` and `digest`. The digest authentication scheme uses the pair `username:password`, the password is encoded in Base64.

:::note
External integrations are not supported.
:::

### Configuration {#configuration}

ClickHouse Keeper can be used as a standalone replacement for ZooKeeper or as an internal part of the ClickHouse server. In both cases the configuration is almost the same `.xml` file. 

#### Keeper configuration settings

The main ClickHouse Keeper configuration tag is `<keeper_server>` and has the following parameters:

| Parameter                            | Description                                                                                                                                                                                                                                         | Default                                                        |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------|
| `tcp_port`                           | Port for a client to connect.                                                                                                                                                                                                                       | `2181`                                                         |
| `tcp_port_secure`                    | Secure port for an SSL connection between client and keeper-server.                                                                                                                                                                                 | -                                                              |
| `server_id`                          | Unique server id, each participant of the ClickHouse Keeper cluster must have a unique number (1, 2, 3, and so on).                                                                                                                                 | -                                                              |
| `log_storage_path`                   | Path to coordination logs, just like ZooKeeper it is best to store logs on non-busy nodes.                                                                                                                                                          | -                                                              |
| `snapshot_storage_path`              | Path to coordination snapshots.                                                                                                                                                                                                                     | -                                                              |
| `enable_reconfiguration`             | Enable dynamic cluster reconfiguration via [`reconfig`](#reconfiguration).                                                                                                                                                                          | `False`                                                        |
| `max_memory_usage_soft_limit`        | Soft limit in bytes of keeper max memory usage.                                                                                                                                                                                                     | `max_memory_usage_soft_limit_ratio` * `physical_memory_amount` |
| `max_memory_usage_soft_limit_ratio`  | If `max_memory_usage_soft_limit` is not set or set to zero, we use this value to define the default soft limit.                                                                                                                                     | `0.9`                                                          |
| `cgroups_memory_observer_wait_time`  | If `max_memory_usage_soft_limit` is not set or is set to `0`, we use this interval to observe the amount of physical memory. Once the memory amount changes, we will recalculate Keeper's memory soft limit by `max_memory_usage_soft_limit_ratio`. | `15`                                                           |
| `http_control`                       | Configuration of [HTTP control](#http-control) interface.                                                                                                                                                                                           | -                                                              |
| `digest_enabled`                     | Enable real-time data consistency check                                                                                                                                                                                                             | `True`                                                         |
| `create_snapshot_on_exit`            | Create a snapshot during shutdown                                                                                                                                                                                                                   | -                                                              |
| `hostname_checks_enabled`            | Enable sanity hostname checks for cluster configuration (e.g. if localhost is used with remote endpoints)                                                                                                                                           | `True`                                                         |

Other common parameters are inherited from the ClickHouse server config (`listen_host`, `logger`, and so on).

#### Internal coordination settings

Internal coordination settings are located in the `<keeper_server>.<coordination_settings>` section and have the following parameters:

| Parameter                          | Description                                                                                                                                                                                                              | Default                                                                                                      |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`             | Timeout for a single client operation (ms)                                                                                                                                                                               | `10000`                                                                                                      |
| `min_session_timeout_ms`           | Min timeout for client session (ms)                                                                                                                                                                                      | `10000`                                                                                                      |
| `session_timeout_ms`               | Max timeout for client session (ms)                                                                                                                                                                                      | `100000`                                                                                                     |
| `dead_session_check_period_ms`     | How often ClickHouse Keeper checks for dead sessions and removes them (ms)                                                                                                                                               | `500`                                                                                                        |
| `heart_beat_interval_ms`           | How often a ClickHouse Keeper leader will send heartbeats to followers (ms)                                                                                                                                              | `500`                                                                                                        |
| `election_timeout_lower_bound_ms`  | If the follower does not receive a heartbeat from the leader in this interval, then it can initiate leader election. Must be less than or equal to  `election_timeout_upper_bound_ms`. Ideally they shouldn't be equal.  | `1000`                                                                                                       |
| `election_timeout_upper_bound_ms`  | If the follower does not receive a heartbeat from the leader in this interval, then it must initiate leader election.                                                                                                    | `2000`                                                                                                       |
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
| `four_letter_word_white_list`      | White list of 4lw commands.                                                                                                                                                                                              | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |
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
In the case of a change in the topology of your ClickHouse Keeper cluster (e.g., replacing a server), please make sure to keep the mapping of `server_id` to `hostname` consistent and avoid shuffling or reusing an existing `server_id` for different servers (e.g., it can happen if your rely on automation scripts to deploy ClickHouse Keeper)

If the host of a Keeper instance can change, we recommend to define and use a hostname instead of raw IP addresses. Changing hostname is equal to removing and adding the server back which in some cases can be impossible to do (e.g. not enough Keeper instances for quorum).
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

### Four Letter Word Commands {#four-letter-word-commands}

ClickHouse Keeper also provides 4lw commands which are almost the same with Zookeeper. Each command is composed of four letters such as `mntr`, `stat` etc. There are some more interesting commands: `stat` gives some general information about the server and connected clients, while `srvr` and `cons` give extended details on server and connections respectively.

The 4lw commands has a white list configuration `four_letter_word_white_list` which has default value `conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld`.

You can issue the commands to ClickHouse Keeper via telnet or nc, at the client port.

```
echo mntr | nc localhost 9181
```

Bellow is the detailed 4lw commands:

- `ruok`: Tests if server is running in a non-error state. The server will respond with `imok` if it is running. Otherwise, it will not respond at all. A response of `imok` does not necessarily indicate that the server has joined the quorum, just that the server process is active and bound to the specified client port. Use "stat" for details on state with respect to quorum and client connection information.

```
imok
```

- `mntr`: Outputs a list of variables that could be used for monitoring the health of the cluster.

```
zk_version      v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
zk_avg_latency  0
zk_max_latency  0
zk_min_latency  0
zk_packets_received     68
zk_packets_sent 68
zk_num_alive_connections        1
zk_outstanding_requests 0
zk_server_state leader
zk_znode_count  4
zk_watch_count  1
zk_ephemerals_count     0
zk_approximate_data_size        723
zk_open_file_descriptor_count   310
zk_max_file_descriptor_count    10240
zk_followers    0
zk_synced_followers     0
```

- `srvr`: Lists full details for the server.

```
ClickHouse Keeper version: v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
Latency min/avg/max: 0/0/0
Received: 2
Sent : 2
Connections: 1
Outstanding: 0
Zxid: 34
Mode: leader
Node count: 4
```

- `stat`: Lists brief details for the server and connected clients.

```
ClickHouse Keeper version: v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
Clients:
 192.168.1.1:52852(recved=0,sent=0)
 192.168.1.1:52042(recved=24,sent=48)
Latency min/avg/max: 0/0/0
Received: 4
Sent : 4
Connections: 1
Outstanding: 0
Zxid: 36
Mode: leader
Node count: 4
```

- `srst`: Reset server statistics. The command will affect the result of `srvr`, `mntr` and `stat`.

```
Server stats reset.
```

- `conf`: Print details about serving configuration.

```
server_id=1
tcp_port=2181
four_letter_word_white_list=*
log_storage_path=./coordination/logs
snapshot_storage_path=./coordination/snapshots
max_requests_batch_size=100
session_timeout_ms=30000
operation_timeout_ms=10000
dead_session_check_period_ms=500
heart_beat_interval_ms=500
election_timeout_lower_bound_ms=1000
election_timeout_upper_bound_ms=2000
reserved_log_items=1000000000000000
snapshot_distance=10000
auto_forwarding=true
shutdown_timeout=5000
startup_timeout=240000
raft_logs_level=information
snapshots_to_keep=3
rotate_log_storage_interval=100000
stale_log_gap=10000
fresh_log_gap=200
max_requests_batch_size=100
quorum_reads=false
force_sync=false
compress_logs=true
compress_snapshots_with_zstd_format=true
configuration_change_tries_count=20
```

- `cons`: List full connection/session details for all clients connected to this server. Includes information on numbers of packets received/sent, session id, operation latencies, last operation performed, etc...

```
 192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
 192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

- `crst`: Reset connection/session statistics for all connections.

```
Connection stats reset.
```

- `envi`: Print details about serving environment

```
Environment:
clickhouse.keeper.version=v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
host.name=ZBMAC-C02D4054M.local
os.name=Darwin
os.arch=x86_64
os.version=19.6.0
cpu.count=12
user.name=root
user.home=/Users/JackyWoo/
user.dir=/Users/JackyWoo/project/jd/clickhouse/cmake-build-debug/programs/
user.tmp=/var/folders/b4/smbq5mfj7578f2jzwn602tt40000gn/T/
```


- `dirs`: Shows the total size of snapshot and log files in bytes

```
snapshot_dir_size: 0
log_dir_size: 3875
```

- `isro`: Tests if server is running in read-only mode. The server will respond with `ro` if in read-only mode or `rw` if not in read-only mode.

```
rw
```

- `wchs`: Lists brief information on watches for the server.

```
1 connections watching 1 paths
Total watches:1
```

- `wchc`: Lists detailed information on watches for the server, by session. This outputs a list of sessions (connections) with associated watches (paths). Note, depending on the number of watches this operation may be expensive (impact server performance), use it carefully.

```
0x0000000000000001
    /clickhouse/task_queue/ddl
```

- `wchp`: Lists detailed information on watches for the server, by path. This outputs a list of paths (znodes) with associated sessions. Note, depending on the number of watches this operation may be expensive (i.e., impact server performance), use it carefully.

```
/clickhouse/task_queue/ddl
    0x0000000000000001
```

- `dump`: Lists the outstanding sessions and ephemeral nodes. This only works on the leader.

```
Sessions dump (2):
0x0000000000000001
0x0000000000000002
Sessions with Ephemerals (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

- `csnp`: Schedule a snapshot creation task. Return the last committed log index of the scheduled snapshot if success or `Failed to schedule snapshot creation task.` if failed. Note that `lgif` command can help you determine whether the snapshot is done.

```
100
```

- `lgif`: Keeper log information. `first_log_idx` : my first log index in log store; `first_log_term` : my first log term; `last_log_idx` : my last log index in log store; `last_log_term` : my last log term; `last_committed_log_idx` : my last committed log index in state machine; `leader_committed_log_idx` : leader's committed log index from my perspective; `target_committed_log_idx` : target log index should be committed to; `last_snapshot_idx` : the largest committed log index in last snapshot.

```
first_log_idx   1
first_log_term  1
last_log_idx    101
last_log_term   1
last_committed_log_idx  100
leader_committed_log_idx    101
target_committed_log_idx    101
last_snapshot_idx   50
```

- `rqld`: Request to become new leader. Return `Sent leadership request to leader.` if request sent or `Failed to send leadership request to leader.` if request not sent. Note that if node is already leader the outcome is same as the request is sent.

```
Sent leadership request to leader.
```

- `ftfl`: Lists all feature flags and whether they are enabled for the Keeper instance.

```
filtered_list   1
multi_read  1
check_not_exists    0
```

- `ydld`: Request to yield leadership and become follower. If the server receiving the request is leader, it will pause write operations first, wait until the successor (current leader can never be successor) finishes the catch-up of the latest log, and then resign. The successor will be chosen automatically. Return `Sent yield leadership request to leader.` if request sent or `Failed to send yield leadership request to leader.` if request not sent. Note that if node is already follower the outcome is same as the request is sent.

```
Sent yield leadership request to leader.
```

- `pfev`: Returns the values for all collected events. For each event it returns event name, event value, and event's description.

```
FileOpen	62	Number of files opened.
Seek	4	Number of times the 'lseek' function was called.
ReadBufferFromFileDescriptorRead	126	Number of reads (read/pread) from a file descriptor. Does not include sockets.
ReadBufferFromFileDescriptorReadFailed	0	Number of times the read (read/pread) from a file descriptor have failed.
ReadBufferFromFileDescriptorReadBytes	178846	Number of bytes read from file descriptors. If the file is compressed, this will show the compressed data size.
WriteBufferFromFileDescriptorWrite	7	Number of writes (write/pwrite) to a file descriptor. Does not include sockets.
WriteBufferFromFileDescriptorWriteFailed	0	Number of times the write (write/pwrite) to a file descriptor have failed.
WriteBufferFromFileDescriptorWriteBytes	153	Number of bytes written to file descriptors. If the file is compressed, this will show compressed data size.
FileSync	2	Number of times the F_FULLFSYNC/fsync/fdatasync function was called for files.
DirectorySync	0	Number of times the F_FULLFSYNC/fsync/fdatasync function was called for directories.
FileSyncElapsedMicroseconds	12756	Total time spent waiting for F_FULLFSYNC/fsync/fdatasync syscall for files.
DirectorySyncElapsedMicroseconds	0	Total time spent waiting for F_FULLFSYNC/fsync/fdatasync syscall for directories.
ReadCompressedBytes	0	Number of bytes (the number of bytes before decompression) read from compressed sources (files, network).
CompressedReadBufferBlocks	0	Number of compressed blocks (the blocks of data that are compressed independent of each other) read from compressed sources (files, network).
CompressedReadBufferBytes	0	Number of uncompressed bytes (the number of bytes after decompression) read from compressed sources (files, network).
AIOWrite	0	Number of writes with Linux or FreeBSD AIO interface
AIOWriteBytes	0	Number of bytes written with Linux or FreeBSD AIO interface
...
```

### HTTP Control {#http-control}

ClickHouse Keeper provides an HTTP interface to check if a replica is ready to receive traffic. It may be used in cloud environments, such as [Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes).

Example of configuration that enables `/ready` endpoint:

```xml
<clickhouse>
    <keeper_server>
        <http_control>
            <port>9182</port>
            <readiness>
                <endpoint>/ready</endpoint>
            </readiness>
        </http_control>
    </keeper_server>
</clickhouse>
```

### Feature flags

Keeper is fully compatible with ZooKeeper and its clients, but it also introduces some unique features and request types that can be used by ClickHouse client. 
Because those features can introduce backward incompatible change, most of them are disabled by default and can be enabled using `keeper_server.feature_flags` config.  
All features can be disabled explicitly.  
If you want to enable a new feature for your Keeper cluster, we recommend you to first update all the Keeper instances in the cluster to a version that supports the feature and then enable the feature itself.

Example of feature flag config that disables `multi_read` and enables `check_not_exists`:

```xml
<clickhouse>
    <keeper_server>
        <feature_flags>
            <multi_read>0</multi_read>
            <check_not_exists>1</check_not_exists>
        </feature_flags>
    </keeper_server>
</clickhouse>
```

The following features are available:

`multi_read` - support for read multi request. Default: `1`  
`filtered_list` - support for list request which filters results by the type of node (ephemeral or persistent). Default: `1`  
`check_not_exists` - support for `CheckNotExists` request which asserts that node doesn't exists. Default: `0`  
`create_if_not_exists` - support for `CreateIfNotExists` requests which will try to create a node if it doesn't exist. If it exists, no changes are applied and `ZOK` is returned. Default: `0`

### Migration from ZooKeeper {#migration-from-zookeeper}

Seamless migration from ZooKeeper to ClickHouse Keeper is not possible. You have to stop your ZooKeeper cluster, convert data, and start ClickHouse Keeper. `clickhouse-keeper-converter` tool allows converting ZooKeeper logs and snapshots to ClickHouse Keeper snapshot. It works only with ZooKeeper > 3.4. Steps for migration:

1. Stop all ZooKeeper nodes.

2. Optional, but recommended: find ZooKeeper leader node, start and stop it again. It will force ZooKeeper to create a consistent snapshot.

3. Run `clickhouse-keeper-converter` on a leader, for example:

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. Copy snapshot to ClickHouse server nodes with a configured `keeper` or start ClickHouse Keeper instead of ZooKeeper. The snapshot must persist on all nodes, otherwise, empty nodes can be faster and one of them can become a leader.  

:::note
`keeper-converter` tool is not available from the Keeper standalone binary.  
If you have ClickHouse installed, you can use the binary directly:

```bash
clickhouse keeper-converter ...
```

Otherwise, you can [download the binary](/docs/en/getting-started/quick-start#1-download-the-binary) and run the tool as described above without installing ClickHouse.
:::


### Recovering after losing quorum

Because ClickHouse Keeper uses Raft it can tolerate certain amount of node crashes depending on the cluster size. \
E.g. for a 3-node cluster, it will continue working correctly if only 1 node crashes.

Cluster configuration can be dynamically configured, but there are some limitations. Reconfiguration relies on Raft also
so to add/remove a node from the cluster you need to have a quorum. If you lose too many nodes in your cluster at the same time without any chance
of starting them again, Raft will stop working and not allow you to reconfigure your cluster using the conventional way.

Nevertheless, ClickHouse Keeper has a recovery mode which allows you to forcefully reconfigure your cluster with only 1 node.
This should be done only as your last resort if you cannot start your nodes again, or start a new instance on the same endpoint.

Important things to note before continuing:
- Make sure that the failed nodes cannot connect to the cluster again.
- Do not start any of the new nodes until it's specified in the steps.

After making sure that the above things are true, you need to do following:
1. Pick a single Keeper node to be your new leader. Be aware that the data of that node will be used for the entire cluster, so we recommend using a node with the most up-to-date state.
2. Before doing anything else, make a backup of the `log_storage_path` and `snapshot_storage_path` folders of the picked node.
3. Reconfigure the cluster on all of the nodes you want to use.
4. Send the four letter command `rcvr` to the node you picked which will move the node to the recovery mode OR stop Keeper instance on the picked node and start it again with the `--force-recovery` argument.
5. One by one, start Keeper instances on the new nodes making sure that `mntr` returns `follower` for the `zk_server_state` before starting the next one.
6. While in the recovery mode, the leader node will return error message for `mntr` command until it achieves quorum with the new nodes and refuse any requests from the client and the followers.
7. After quorum is achieved, the leader node will return to the normal mode of operation, accepting all the requests using Raft-verify with `mntr` which should return `leader` for the `zk_server_state`.

## Using disks with Keeper

Keeper supports a subset of [external disks](/docs/en/operations/storing-data.md) for storing snapshots, log files, and the state file.

Supported types of disks are:
- s3_plain
- s3
- local

Following is an example of disk definitions contained inside a config.

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <log_local>
                <type>local</type>
                <path>/var/lib/clickhouse/coordination/logs/</path>
            </log_local>
            <log_s3_plain>
                <type>s3_plain</type>
                <endpoint>https://some_s3_endpoint/logs/</endpoint>
                <access_key_id>ACCESS_KEY</access_key_id>
                <secret_access_key>SECRET_KEY</secret_access_key>
            </log_s3_plain>
            <snapshot_local>
                <type>local</type>
                <path>/var/lib/clickhouse/coordination/snapshots/</path>
            </snapshot_local>
            <snapshot_s3_plain>
                <type>s3_plain</type>
                <endpoint>https://some_s3_endpoint/snapshots/</endpoint>
                <access_key_id>ACCESS_KEY</access_key_id>
                <secret_access_key>SECRET_KEY</secret_access_key>
            </snapshot_s3_plain>
            <state_s3_plain>
                <type>s3_plain</type>
                <endpoint>https://some_s3_endpoint/state/</endpoint>
                <access_key_id>ACCESS_KEY</access_key_id>
                <secret_access_key>SECRET_KEY</secret_access_key>
            </state_s3_plain>
        </disks>
    </storage_configuration>
</clickhouse>
```

To use a disk for logs `keeper_server.log_storage_disk` config should be set to the name of disk.  
To use a disk for snapshots `keeper_server.snapshot_storage_disk` config should be set to the name of disk.  
Additionally, different disks can be used for the latest logs or snapshots by using `keeper_server.latest_log_storage_disk` and `keeper_server.latest_snapshot_storage_disk` respectively.  
In that case, Keeper will automatically move files to correct disks when new logs or snapshots are created.
To use a disk for state file, `keeper_server.state_storage_disk` config should be set to the name of disk.  

Moving files between disks is safe and there is no risk of losing data if Keeper stops in the middle of transfer.
Until the file is completely moved to the new disk, it's not deleted from the old one.

Keeper with `keeper_server.coordination_settings.force_sync` set to `true` (`true` by default) cannot satisfy some guarantees for all types of disks.  
Right now, only disks of type `local` support persistent sync.   
If `force_sync` is used, `log_storage_disk` should be a `local` disk if `latest_log_storage_disk` is not used.  
If `latest_log_storage_disk` is used, it should always be a `local` disk.   
If `force_sync` is disabled, disks of all types can be used in any setup.

A possible storage setup for a Keeper instance could look like following:

```xml
<clickhouse>
    <keeper_server>
        <log_storage_disk>log_s3_plain</log_storage_disk>
        <latest_log_storage_disk>log_local</latest_log_storage_disk>

        <snapshot_storage_disk>snapshot_s3_plain</snapshot_storage_disk>
        <latest_snapshot_storage_disk>snapshot_local</latest_snapshot_storage_disk>
    </keeper_server>
</clickhouse>
```

This instance will store all but the latest logs on disk `log_s3_plain`, while the latest log will be on the `log_local` disk.  
Same logic applies for snapshots, all but the latest snapshots will be stored on `snapshot_s3_plain`, while the latest snapshot will be on the `snapshot_local` disk.

### Changing disk setup

:::important
Before applying a new disk setup, manually back up all Keeper logs and snapshots.
:::

If a tiered disk setup is defined (using separate disks for the latest files), Keeper will try to automatically move files to the correct disks on startup.  
The same guarantee is applied as before; until the file is completely moved to the new disk, it's not deleted from the old one, so multiple restarts
can be safely done.  

If it's necessary to move files to a completely new disk (or move from a 2-disk setup to a single disk setup), it's possible to use multiple definitions of `keeper_server.old_snapshot_storage_disk` and `keeper_server.old_log_storage_disk`.

The following config shows how we can move from the previous 2-disk setup to a completely new single-disk setup:

```xml
<clickhouse>
    <keeper_server>
        <old_log_storage_disk>log_local</old_log_storage_disk>
        <old_log_storage_disk>log_s3_plain</old_log_storage_disk>
        <log_storage_disk>log_local2</log_storage_disk>

        <old_snapshot_storage_disk>snapshot_s3_plain</old_snapshot_storage_disk>
        <old_snapshot_storage_disk>snapshot_local</old_snapshot_storage_disk>
        <snapshot_storage_disk>snapshot_local2</snapshot_storage_disk>
    </keeper_server>
</clickhouse>
```

On startup, all the log files will be moved from `log_local` and `log_s3_plain` to the `log_local2` disk.  
Also, all the snapshot files will be moved from `snapshot_local` and `snapshot_s3_plain` to the `snapshot_local2` disk.

## Configuring logs cache

To minimize the amount of data read from disk, Keeper caches log entries in memory.  
If requests are large, log entries will take too much memory so the amount of cached logs is capped.  
The limit is controlled with these two configs:
- `latest_logs_cache_size_threshold` - total size of latest logs stored in cache
- `commit_logs_cache_size_threshold` - total size of subsequent logs that need to be committed next

If the default values are too big, you can reduce the memory usage by reducing these two configs.

:::note
You can use `pfev` command to check amount of logs read from each cache and from a file.  
You can also use metrics from Prometheus endpoint to track the current size of both caches.  
:::


## Prometheus

Keeper can expose metrics data for scraping from Prometheus.  
Configuration is done in the [same way as for ClickHouse.](/docs/en/operations/server-configuration-parameters/settings#prometheus)

## ClickHouse Keeper User Guide

This guide provides simple and minimal settings to configure ClickHouse Keeper with an example on how to test distributed operations. This example is performed using 3 nodes on Linux.

### 1. Configure Nodes with Keeper settings

1. Install 3 ClickHouse instances on 3 hosts (chnode1, chnode2, chnode3). (View the [Quick Start](/docs/en/getting-started/install.md) for details on installing ClickHouse.)

2. On each node, add the following entry to allow external communication through the network interface.
    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3. Add the following ClickHouse Keeper configuration to all three servers updating the `<server_id>` setting for each server; for `chnode1` would be `1`, `chnode2` would be `2`, etc.
    ```xml
    <keeper_server>
        <tcp_port>9181</tcp_port>
        <server_id>1</server_id>
        <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
        <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

        <coordination_settings>
            <operation_timeout_ms>10000</operation_timeout_ms>
            <session_timeout_ms>30000</session_timeout_ms>
            <raft_logs_level>warning</raft_logs_level>
        </coordination_settings>

        <raft_configuration>
            <server>
                <id>1</id>
                <hostname>chnode1.domain.com</hostname>
                <port>9234</port>
            </server>
            <server>
                <id>2</id>
                <hostname>chnode2.domain.com</hostname>
                <port>9234</port>
            </server>
            <server>
                <id>3</id>
                <hostname>chnode3.domain.com</hostname>
                <port>9234</port>
            </server>
        </raft_configuration>
    </keeper_server>
    ```

    These are the basic settings used above:

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |tcp_port   |port to be used by clients of keeper|9181 default equivalent of 2181 as in zookeeper|
    |server_id| identifier for each CLickHouse Keeper server used in raft configuration| 1|
    |coordination_settings| section to parameters such as timeouts| timeouts: 10000, log level: trace|
    |server    |definition of server participating|list of each server definition|
    |raft_configuration| settings for each server in the keeper cluster| server and settings for each|
    |id      |numeric id of the server for keeper services|1|
    |hostname   |hostname, IP or FQDN of each server in the keeper cluster|chnode1.domain.com|
    |port|port to listen on for interserver keeper connections|9234|


4.  Enable the Zookeeper component. It will use the ClickHouse Keeper engine:
    ```xml
        <zookeeper>
            <node>
                <host>chnode1.domain.com</host>
                <port>9181</port>
            </node>
            <node>
                <host>chnode2.domain.com</host>
                <port>9181</port>
            </node>
            <node>
                <host>chnode3.domain.com</host>
                <port>9181</port>
            </node>
        </zookeeper>
    ```

    These are the basic settings used above:

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |node   |list of nodes for ClickHouse Keeper connections|settings entry for each server|
    |host|hostname, IP or FQDN of each ClickHouse keepr node| chnode1.domain.com|
    |port|ClickHouse Keeper client port| 9181|

5. Restart ClickHouse and verify that each Keeper instance is running. Execute the following command on each server. The `ruok` command returns `imok` if Keeper is running and healthy:
    ```bash
    # echo ruok | nc localhost 9181; echo
    imok
    ```

6. The `system` database has a table named `zookeeper` that contains the details of your ClickHouse Keeper instances. Let's view the table:
    ```sql
    SELECT *
    FROM system.zookeeper
    WHERE path IN ('/', '/clickhouse')
    ```

    The table looks like:
    ```response
    ┌─name───────┬─value─┬─czxid─┬─mzxid─┬───────────────ctime─┬───────────────mtime─┬─version─┬─cversion─┬─aversion─┬─ephemeralOwner─┬─dataLength─┬─numChildren─┬─pzxid─┬─path────────┐
    │ clickhouse │       │   124 │   124 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        2 │        0 │              0 │          0 │           2 │  5693 │ /           │
    │ task_queue │       │   125 │   125 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        1 │        0 │              0 │          0 │           1 │   126 │ /clickhouse │
    │ tables     │       │  5693 │  5693 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        3 │        0 │              0 │          0 │           3 │  6461 │ /clickhouse │
    └────────────┴───────┴───────┴───────┴─────────────────────┴─────────────────────┴─────────┴──────────┴──────────┴────────────────┴────────────┴─────────────┴───────┴─────────────┘
    ```


### 2.  Configure a cluster in ClickHouse

1. Let's configure a simple cluster with 2 shards and only one replica on 2 of the nodes. The third node will be used to achieve a quorum for the requirement in ClickHouse Keeper. Update the configuration on `chnode1` and `chnode2`. The following cluster defines 1 shard on each node for a total of 2 shards with no replication. In this example, some of the data will be on node and some will be on the other node:
    ```xml
        <remote_servers>
            <cluster_2S_1R>
                <shard>
                    <replica>
                        <host>chnode1.domain.com</host>
                        <port>9000</port>
                        <user>default</user>
                        <password>ClickHouse123!</password>
                    </replica>
                </shard>
                <shard>
                    <replica>
                        <host>chnode2.domain.com</host>
                        <port>9000</port>
                        <user>default</user>
                        <password>ClickHouse123!</password>
                    </replica>
                </shard>
            </cluster_2S_1R>
        </remote_servers>
    ```

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |shard   |list of replicas on the cluster definition|list of replicas for each shard|
    |replica|list of settings for each replica|settings entries for each replica|
    |host|hostname, IP or FQDN of server that will host a replica shard|chnode1.domain.com|
    |port|port used to communicate using the native tcp protocol|9000|
    |user|username that will be used to authenticate to the cluster instances|default|
    |password|password for the user define to allow connections to cluster instances|ClickHouse123!|


2. Restart ClickHouse and verify the cluster was created:
    ```bash
    SHOW clusters;
    ```

    You should see your cluster:
    ```response
    ┌─cluster───────┐
    │ cluster_2S_1R │
    └───────────────┘
    ```

### 3. Create and test distributed table

1.  Create a new database on the new cluster using ClickHouse client on `chnode1`. The `ON CLUSTER` clause automatically creates the database on both nodes.
    ```sql
    CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
    ```

2. Create a new table on the `db1` database. Once again, `ON CLUSTER` creates the table on both nodes.
    ```sql
    CREATE TABLE db1.table1 on cluster 'cluster_2S_1R'
    (
        `id` UInt64,
        `column1` String
    )
    ENGINE = MergeTree
    ORDER BY column1
    ```

3. On the `chnode1` node, add a couple of rows:
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (1, 'abc'),
        (2, 'def')
    ```

4. Add a couple of rows on the `chnode2` node:
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (3, 'ghi'),
        (4, 'jkl')
    ```

5. Notice that running a `SELECT` statement on each node only shows the data on that node. For example, on `chnode1`:
    ```sql
    SELECT *
    FROM db1.table1
    ```

    ```response
    Query id: 7ef1edbc-df25-462b-a9d4-3fe6f9cb0b6d

    ┌─id─┬─column1─┐
    │  1 │ abc     │
    │  2 │ def     │
    └────┴─────────┘

    2 rows in set. Elapsed: 0.006 sec.
    ```

    On `chnode2`:
    ```
    SELECT *
    FROM db1.table1
    ```

    ```response
    Query id: c43763cc-c69c-4bcc-afbe-50e764adfcbf

    ┌─id─┬─column1─┐
    │  3 │ ghi     │
    │  4 │ jkl     │
    └────┴─────────┘
    ```

6. You can create a `Distributed` table to represent the data on the two shards. Tables with the `Distributed` table engine do not store any data of their own, but allow distributed query processing on multiple servers. Reads hit all the shards, and writes can be distributed across the shards. Run the following query on `chnode1`:
    ```sql
    CREATE TABLE db1.dist_table (
        id UInt64,
        column1 String
    )
    ENGINE = Distributed(cluster_2S_1R,db1,table1)
    ```

7. Notice querying `dist_table` returns all four rows of data from the two shards:
    ```sql
    SELECT *
    FROM db1.dist_table
    ```

    ```response
    Query id: 495bffa0-f849-4a0c-aeea-d7115a54747a

    ┌─id─┬─column1─┐
    │  1 │ abc     │
    │  2 │ def     │
    └────┴─────────┘
    ┌─id─┬─column1─┐
    │  3 │ ghi     │
    │  4 │ jkl     │
    └────┴─────────┘

    4 rows in set. Elapsed: 0.018 sec.
    ```

### Summary

This guide demonstrated how to set up a cluster using ClickHouse Keeper. With ClickHouse Keeper, you can configure clusters and define distributed tables that can be replicated across shards.


## Configuring ClickHouse Keeper with unique paths

<SelfManaged />

### Description

This article describes how to use the built-in `{uuid}` macro setting
to create unique entries in ClickHouse Keeper or ZooKeeper. Unique
paths help when creating and dropping tables frequently because
this avoids having to wait several minutes for Keeper garbage collection
to remove path entries as each time a path is created a new `uuid` is used
in that path; paths are never reused.

### Example Environment
A three node cluster that will be configured to have ClickHouse Keeper
on all three nodes, and ClickHouse on two of the nodes. This provides
ClickHouse Keeper with three nodes (including a tiebreaker node), and
a single ClickHouse shard made up of two replicas.

|node|description|
|-----|-----|
|chnode1.marsnet.local|data node - cluster cluster_1S_2R|
|chnode2.marsnet.local|data node - cluster cluster_1S_2R|
|chnode3.marsnet.local| ClickHouse Keeper tie breaker node|

Example config for cluster:
```xml
    <remote_servers>
        <cluster_1S_2R>
            <shard>
                <replica>
                    <host>chnode1.marsnet.local</host>
                    <port>9440</port>
                    <user>default</user>
                    <password>ClickHouse123!</password>
                    <secure>1</secure>
                </replica>
                <replica>
                    <host>chnode2.marsnet.local</host>
                    <port>9440</port>
                    <user>default</user>
                    <password>ClickHouse123!</password>
                    <secure>1</secure>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
```

### Procedures to set up tables to use {uuid}
1. Configure Macros on each server
example for server 1:
```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
```
:::note
Notice that we define macros for `shard` and `replica`, but that `{uuid}` is not defined here, it is built-in and there is no need to define.
:::

2. Create a Database

```sql
CREATE DATABASE db_uuid
      ON CLUSTER 'cluster_1S_2R'
      ENGINE Atomic;
```

```response
CREATE DATABASE db_uuid ON CLUSTER cluster_1S_2R
ENGINE = Atomic

Query id: 07fb7e65-beb4-4c30-b3ef-bd303e5c42b5

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

3. Create a table on the cluster using the macros and `{uuid}`
```sql
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}' )
   ORDER BY (id);
```

```response
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}')
ORDER BY id

Query id: 8f542664-4548-4a02-bd2a-6f2c973d0dc4

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode2.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

4.  Create a distributed table
```sql
create table db_uuid.dist_uuid_table1 on cluster 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = Distributed('cluster_1S_2R', 'db_uuid', 'uuid_table1' );
```

```response
CREATE TABLE db_uuid.dist_uuid_table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = Distributed('cluster_1S_2R', 'db_uuid', 'uuid_table1')

Query id: 3bc7f339-ab74-4c7d-a752-1ffe54219c0e

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

### Testing
1.  Insert data into first node (e.g `chnode1`)
```sql
INSERT INTO db_uuid.uuid_table1
   ( id, column1)
   VALUES
   ( 1, 'abc');
```

```response
INSERT INTO db_uuid.uuid_table1 (id, column1) FORMAT Values

Query id: 0f178db7-50a6-48e2-9a1b-52ed14e6e0f9

Ok.

1 row in set. Elapsed: 0.033 sec.
```

2. Insert data into second node (e.g., `chnode2`)
```sql
INSERT INTO db_uuid.uuid_table1
   ( id, column1)
   VALUES
   ( 2, 'def');
```

```response
INSERT INTO db_uuid.uuid_table1 (id, column1) FORMAT Values

Query id: edc6f999-3e7d-40a0-8a29-3137e97e3607

Ok.

1 row in set. Elapsed: 0.529 sec.
```

3. View records using distributed table
```sql
SELECT * FROM db_uuid.dist_uuid_table1;
```

```response
SELECT *
FROM db_uuid.dist_uuid_table1

Query id: 6cbab449-9e7f-40fe-b8c2-62d46ba9f5c8

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘

2 rows in set. Elapsed: 0.007 sec.
```

### Alternatives
The default replication path can be defined beforehand by macros and using also `{uuid}`

1. Set default for tables on each node
```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```
:::tip
You can also define a macro `{database}` on each node if nodes are used for certain databases.
:::

2. Create table without explicit parameters:
```sql
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = ReplicatedMergeTree
   ORDER BY (id);
```

```response
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree
ORDER BY id

Query id: ab68cda9-ae41-4d6d-8d3b-20d8255774ee

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

2 rows in set. Elapsed: 1.175 sec.
```

3. Verify it used the settings used in default config
```sql
SHOW CREATE TABLE db_uuid.uuid_table1;
```

```response
SHOW CREATE TABLE db_uuid.uuid_table1

Query id: 5925ecce-a54f-47d8-9c3a-ad3257840c9e

┌─statement────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE db_uuid.uuid_table1
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}')
ORDER BY id
SETTINGS index_granularity = 8192 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

### Troubleshooting

Example command to get table information and UUID:
```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

Example command to get information about the table in zookeeper with UUID for the table above
```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
Database must be `Atomic`, if upgrading from a previous version, the
`default` database is likely of `Ordinary` type.
:::

To check:
For example,
```
SELECT name, engine FROM system.databases WHERE name = 'db_uuid';
```

```response
SELECT
    name,
    engine
FROM system.databases
WHERE name = 'db_uuid'

Query id: b047d459-a1d2-4016-bcf9-3e97e30e49c2

┌─name────┬─engine─┐
│ db_uuid │ Atomic │
└─────────┴────────┘

1 row in set. Elapsed: 0.004 sec.
```

## ClickHouse Keeper dynamic reconfiguration {#reconfiguration}

<SelfManaged />

### Description

ClickHouse Keeper partially supports ZooKeeper [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying)
command for dynamic cluster reconfiguration if `keeper_server.enable_reconfiguration` is turned on.

:::note
If this setting is turned off, you may reconfigure the cluster by altering the replica's `raft_configuration`
section manually. Make sure you the edit files on all replicas as only the leader will apply changes.
Alternatively, you can send a `reconfig` query through any ZooKeeper-compatible client.
:::

A virtual node `/keeper/config` contains last committed cluster configuration in the following format:

```
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

- Each server entry is delimited by a newline.
- `server_type` is either `participant` or `learner` ([learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md) does not participate in leader elections).
- `server_priority` is a non-negative integer telling [which nodes should be prioritised on leader elections](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md).
  Priority of 0 means server will never be a leader.

Example:

```
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

You can use `reconfig` command to add new servers, remove existing ones, and change existing servers'
priorities, here are examples (using `clickhouse-keeper-client`):

```bash
# Add two new servers
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"
# Remove two other servers
reconfig remove "3,4"
# Change existing server priority to 8
reconfig add "server.5=localhost:5123;participant;8"
```

And here are examples for `kazoo`:

```python
# Add two new servers, remove two other servers
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")

# Change existing server priority to 8
reconfig(joining="server.5=localhost:5123;participant;8", leaving=None)
```

Servers in `joining` should be in server format described above. Server entries should be delimited by commas.
While adding new servers, you can omit `server_priority` (default value is 1) and `server_type` (default value
is `participant`).

If you want to change existing server priority, add it to `joining` with target priority.
Server host, port, and type must be equal to existing server configuration.

Servers are added and removed in order of appearance in `joining` and `leaving`.
All updates from `joining` are processed before updates from `leaving`.

There are some caveats in Keeper reconfiguration implementation:

- Only incremental reconfiguration is supported. Requests with non-empty `new_members` are declined.

  ClickHouse Keeper implementation relies on NuRaft API to change membership dynamically. NuRaft has a way to
  add a single server or remove a single server, one at a time. This means each change to configuration
  (each part of `joining`, each part of `leaving`) must be decided on separately. Thus there is no bulk
  reconfiguration available as it would be misleading for end users.

  Changing server type (participant/learner) isn't possible either as it's not supported by NuRaft, and
  the only way would be to remove and add server, which again would be misleading.

- You cannot use the returned `znodestat` value.
- The `from_version` field is not used. All requests with set `from_version` are declined.
  This is due to the fact `/keeper/config` is a virtual node, which means it is not stored in
  persistent storage, but rather generated on-the-fly with the specified node config for every request.
  This decision was made as to not duplicate data as NuRaft already stores this config.
- Unlike ZooKeeper, there is no way to wait on cluster reconfiguration by submitting a `sync` command.
  New config will be _eventually_ applied but with no time guarantees.
- `reconfig` command may fail for various reasons. You can check cluster's state and see whether the update
  was applied.

## Converting a single-node keeper into a cluster

Sometimes it's necessary to extend experimental keeper node into a cluster. Here's a scheme of how to do it step-by-step for 3 nodes cluster:

- **IMPORTANT**: new nodes must be added in batches less than the current quorum, otherwise they will elect a leader among them. In this example one by one.
- The existing keeper node must have `keeper_server.enable_reconfiguration` configuration parameter turned on.
- Start a second node with the full new configuration of keeper cluster.
- After it's started, add it to the node 1 using [reconfig](#reconfiguration).
- Now, start a third node and add it using [reconfig](#reconfiguration).
- Update the `clickhouse-server` configuration by adding new keeper node there and restart it to apply the changes.
- Update the raft configuration of the node 1 and, optionally, restart it.

To get confident with the process, here's a [sandbox repository](https://github.com/ClickHouse/keeper-extend-cluster).

## Unsupported Features

While ClickHouse Keeper aims to be fully compatible with ZooKeeper, there are some features that are currently not implemented (although development is ongoing):

- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) does not support returning `Stat` object
- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat))  does not support [TTL](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL)
- [`addWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode)) does not work with [`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT) watches
- [`removeWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean)) and [`removeAllWatches`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher.WatcherType,boolean)) are not supported
- `setWatches` is not supported
- Creating [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html) type znodes is not supported
- [`SASL authentication`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL) is not supported
