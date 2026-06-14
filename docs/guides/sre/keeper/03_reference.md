---
slug: /guides/sre/keeper/reference

sidebar_label: 'Reference'
position: 3
keywords: ['Keeper', 'ZooKeeper', 'clickhouse-keeper', 'four letter word', 'prometheus', 'feature flags', 'disks']
description: 'Reference documentation for ClickHouse Keeper including four letter word commands, feature flags, disk configuration, and Prometheus metrics.'
title: 'ClickHouse Keeper Reference'
doc_type: 'reference'
---


import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';

<SelfManaged />

### Four letter word commands {#four-letter-word-commands}

ClickHouse Keeper also provides 4lw commands which are almost the same with Zookeeper. Each command is composed of four letters such as `mntr`, `stat` etc. There are some more interesting commands: `stat` gives general information about the server and connected clients, `srvr` gives extended details on the server, and `cons` gives extended details on connections.

The 4lw commands have a white list configuration `four_letter_word_white_list` which has default value `conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld`.

You can issue the commands to ClickHouse Keeper via telnet or nc, at the client port.

```bash
echo mntr | nc localhost 9181
```

Below are the detailed 4lw commands:

- `ruok`: Tests if server is running in a non-error state. The server will respond with `imok` if it's running. Otherwise, it won't respond at all. A response of `imok` doesn't necessarily indicate that the server has joined the quorum, just that the server process is active and bound to the specified client port. Use "stat" for details on state with respect to quorum and client connection information.

```response
imok
```

- `mntr`: Outputs a list of variables that could be used for monitoring the health of the cluster.

```response
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

```response
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

```response
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

```response
Server stats reset.
```

- `conf`: Print details about serving configuration.

```response
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

```response
 192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
 192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

- `crst`: Reset connection/session statistics for all connections.

```response
Connection stats reset.
```

- `envi`: Print details about serving environment

```response
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

```response
snapshot_dir_size: 0
log_dir_size: 3875
```

- `isro`: Tests if server is running in read-only mode. The server will respond with `ro` if in read-only mode or `rw` if not in read-only mode.

```response
rw
```

- `wchs`: Lists brief information on watches for the server.

```response
1 connections watching 1 paths
Total watches:1
```

- `wchc`: Lists detailed information on watches for the server, by session. This outputs a list of sessions (connections) with associated watches (paths). Note, depending on the number of watches this operation may be expensive (impact server performance), use it carefully.

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

- `wchp`: Lists detailed information on watches for the server, by path. This outputs a list of paths (znodes) with associated sessions. Note, depending on the number of watches this operation may be expensive (i.e., impact server performance), use it carefully.

```response
/clickhouse/task_queue/ddl
    0x0000000000000001
```

- `dump`: Lists the outstanding sessions and ephemeral nodes. This only works on the leader.

```response
Sessions dump (2):
0x0000000000000001
0x0000000000000002
Sessions with Ephemerals (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

- `csnp`: Schedule a snapshot creation task. Return the last committed log index of the scheduled snapshot if success or `Failed to schedule snapshot creation task.` if failed. The `lgif` command can help you determine whether the snapshot is done.

```response
100
```

- `lgif`: Keeper log information. `first_log_idx` : my first log index in log store; `first_log_term` : my first log term; `last_log_idx` : my last log index in log store; `last_log_term` : my last log term; `last_committed_log_idx` : my last committed log index in state machine; `leader_committed_log_idx` : leader's committed log index from my perspective; `target_committed_log_idx` : target log index should be committed to; `last_snapshot_idx` : the largest committed log index in last snapshot.

```response
first_log_idx   1
first_log_term  1
last_log_idx    101
last_log_term   1
last_committed_log_idx  100
leader_committed_log_idx    101
target_committed_log_idx    101
last_snapshot_idx   50
```

- `rqld`: Request to become new leader. Return `Sent leadership request to leader.` if request sent or `Failed to send leadership request to leader.` if request not sent. If the node is already leader the outcome is the same as when the request is sent.

```response
Sent leadership request to leader.
```

- `ftfl`: Lists all feature flags and whether they're enabled for the Keeper instance.

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

- `ydld`: Request to yield leadership and become follower. If the server receiving the request is leader, it will pause write operations first, wait until the successor (current leader can never be successor) finishes the catch-up of the latest log, and then resign. The successor will be chosen automatically. Return `Sent yield leadership request to leader.` if request sent or `Failed to send yield leadership request to leader.` if request not sent. If the node is already a follower the outcome is the same as when the request is sent.

```response
Sent yield leadership request to leader.
```

- `pfev`: Returns the values for all collected events. For each event it returns event name, event value, and event's description.

```response
FileOpen        62      Number of files opened.
Seek    4       Number of times the 'lseek' function was called.
ReadBufferFromFileDescriptorRead        126     Number of reads (read/pread) from a file descriptor. Does not include sockets.
ReadBufferFromFileDescriptorReadFailed  0       Number of times the read (read/pread) from a file descriptor have failed.
ReadBufferFromFileDescriptorReadBytes   178846  Number of bytes read from file descriptors. If the file is compressed, this will show the compressed data size.
WriteBufferFromFileDescriptorWrite      7       Number of writes (write/pwrite) to a file descriptor. Does not include sockets.
WriteBufferFromFileDescriptorWriteFailed        0       Number of times the write (write/pwrite) to a file descriptor have failed.
WriteBufferFromFileDescriptorWriteBytes 153     Number of bytes written to file descriptors. If the file is compressed, this will show compressed data size.
FileSync        2       Number of times the F_FULLFSYNC/fsync/fdatasync function was called for files.
DirectorySync   0       Number of times the F_FULLFSYNC/fsync/fdatasync function was called for directories.
FileSyncElapsedMicroseconds     12756   Total time spent waiting for F_FULLFSYNC/fsync/fdatasync syscall for files.
DirectorySyncElapsedMicroseconds        0       Total time spent waiting for F_FULLFSYNC/fsync/fdatasync syscall for directories.
ReadCompressedBytes     0       Number of bytes (the number of bytes before decompression) read from compressed sources (files, network).
CompressedReadBufferBlocks      0       Number of compressed blocks (the blocks of data that are compressed independent of each other) read from compressed sources (files, network).
CompressedReadBufferBytes       0       Number of uncompressed bytes (the number of bytes after decompression) read from compressed sources (files, network).
AIOWrite        0       Number of writes with Linux or FreeBSD AIO interface
AIOWriteBytes   0       Number of bytes written with Linux or FreeBSD AIO interface
...
```

### HTTP control {#http-control}

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

### Feature flags {#feature-flags}

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

| Feature                | Description                                                                                                                                              | Default |
|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `multi_read`           | Support for read multi request                                                                                                                           | `1`     |
| `filtered_list`        | Support for list request which filters results by the type of node (ephemeral or persistent)                                                             | `1`     |
| `check_not_exists`     | Support for `CheckNotExists` request, which asserts that node doesn't exist                                                                              | `1`     |
| `create_if_not_exists` | Support for `CreateIfNotExists` request, which will try to create a node if it doesn't exist. If it exists, no changes are applied and `ZOK` is returned | `1`     |
| `remove_recursive`     | Support for `RemoveRecursive` request, which removes the node along with its subtree                                                                     | `1`     |

:::note
Some of the feature flags are enabled by default from version 25.7.
The recommended way of upgrading Keeper to 25.7+ is to first upgrade to version 24.9+.
:::

## Using disks with Keeper {#using-disks-with-keeper}

Keeper supports a subset of [external disks](/operations/storing-data.md) for storing snapshots, log files, and the state file.

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
Additionally, `keeper_server.latest_log_storage_disk` can be used for the latest logs and `keeper_server.latest_snapshot_storage_disk` for the latest snapshots.
In that case, Keeper will automatically move files to correct disks when new logs or snapshots are created.
To use a disk for state file, `keeper_server.state_storage_disk` config should be set to the name of disk.

Moving files between disks is safe and there is no risk of losing data if Keeper stops in the middle of transfer.
Until the file is completely moved to the new disk, it's not deleted from the old one.

Keeper with `keeper_server.coordination_settings.force_sync` set to `true` (`true` by default) can't satisfy some guarantees for all types of disks.
Right now, only disks of type `local` support persistent sync.
If `force_sync` is used, `log_storage_disk` should be a `local` disk if `latest_log_storage_disk` isn't used.
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

### Changing disk setup {#changing-disk-setup}

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

## Configuring logs cache {#configuring-logs-cache}

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

## Prometheus {#prometheus}

Keeper can expose metrics data for scraping from [Prometheus](https://prometheus.io).

Settings:

- `endpoint` – HTTP endpoint for scraping metrics by the Prometheus server. Start from '/'.
- `port` – Port for `endpoint`.
- `metrics` – Flag that sets to expose metrics from the [system.metrics](/operations/system-tables/metrics) table.
- `events` – Flag that sets to expose metrics from the [system.events](/operations/system-tables/events) table.
- `asynchronous_metrics` – Flag that sets to expose current metrics values from the [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) table.

**Example**

``` xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <!-- highlight-start -->
    <prometheus>
        <endpoint>/metrics</endpoint>
        <port>9363</port>
        <metrics>true</metrics>
        <events>true</events>
        <asynchronous_metrics>true</asynchronous_metrics>
    </prometheus>
    <!-- highlight-end -->
</clickhouse>
```

Check (replace `127.0.0.1` with the IP addr or hostname of your ClickHouse server):
```bash
curl 127.0.0.1:9363/metrics
```

See also the ClickHouse Cloud [Prometheus integration](/integrations/prometheus).

## Unsupported features {#unsupported-features}

While ClickHouse Keeper aims to be fully compatible with ZooKeeper, there are some features that aren't yet implemented (although development is ongoing):

- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) doesn't support returning `Stat` object
- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat))  doesn't support [TTL](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL)
- [`addWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode)) doesn't work with [`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT) watches
- [`removeWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean)) and [`removeAllWatches`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher.WatcherType,boolean)) aren't supported
- `setWatches` isn't supported
- Creating [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html) type znodes isn't supported
- [`SASL authentication`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL) isn't supported
