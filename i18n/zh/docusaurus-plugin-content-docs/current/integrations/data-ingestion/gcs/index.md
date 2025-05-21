---
'sidebar_label': 'Google Cloud Storage (GCS)'
'sidebar_position': 4
'slug': '/integrations/gcs'
'description': 'Google Cloud Storage (GCS) Backed MergeTree'
'title': 'Integrate Google Cloud Storage with ClickHouse'
---

import BucketDetails from '@site/docs/_snippets/_GCS_authentication_and_bucket.md';
import Image from '@theme/IdealImage';
import GCS_examine_bucket_1 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-1.png';
import GCS_examine_bucket_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-2.png';


# 将 Google Cloud Storage 与 ClickHouse 集成

:::note
如果您在 [Google Cloud](https://cloud.google.com) 上使用 ClickHouse Cloud，则此页面不适用，因为您的服务将已经使用 [Google Cloud Storage](https://cloud.google.com/storage)。如果您希望从 GCS `SELECT` 或 `INSERT` 数据，请见 [`gcs` 表函数](/sql-reference/table-functions/gcs)。
:::

ClickHouse 认识到 GCS 是一个吸引人的存储解决方案，适合于需要分离存储和计算的用户。为了实现这一点，支持将 GCS 用作 MergeTree 引擎的存储。这将使用户能够利用 GCS 的可扩展性和成本优势，以及 MergeTree 引擎的插入和查询性能。

## GCS 支持的 MergeTree {#gcs-backed-mergetree}

### 创建磁盘 {#creating-a-disk}

要将 GCS 存储桶用作磁盘，我们必须首先在 ClickHouse 配置文件的 `conf.d` 下声明它。以下是 GCS 磁盘声明的示例。该配置包含多个部分，用于配置 GCS "磁盘"、缓存以及创建表时在 DDL 查询中指定的策略。以下对这些进行描述。

#### storage_configuration > disks > gcs {#storage_configuration--disks--gcs}

该配置的这一部分在高亮显示的部分中，并指定：
- 不执行批量删除。GCS 当前不支持批量删除，因此禁用自动检测以抑制错误消息。
- 磁盘的类型是 `s3`，因为使用了 S3 API。
- GCS 提供的端点。
- 服务帐户 HMAC 密钥和秘密。
- 本地磁盘上的元数据路径。

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <gcs>
            <!--highlight-start-->
                <support_batch_delete>false</support_batch_delete>
                <type>s3</type>
                <endpoint>https://storage.googleapis.com/BUCKET NAME/FOLDER NAME/</endpoint>
                <access_key_id>SERVICE ACCOUNT HMAC KEY</access_key_id>
                <secret_access_key>SERVICE ACCOUNT HMAC SECRET</secret_access_key>
                <metadata_path>/var/lib/clickhouse/disks/gcs/</metadata_path>
            <!--highlight-end-->
            </gcs>
        </disks>
        <policies>
            <gcs_main>
                <volumes>
                    <main>
                        <disk>gcs</disk>
                    </main>
                </volumes>
            </gcs_main>
        </policies>
    </storage_configuration>
</clickhouse>
```
#### storage_configuration > disks > cache {#storage_configuration--disks--cache}

下面高亮显示的示例配置为磁盘 `gcs` 启用了 10Gi 的内存缓存。

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <gcs>
                <support_batch_delete>false</support_batch_delete>
                <type>s3</type>
                <endpoint>https://storage.googleapis.com/BUCKET NAME/FOLDER NAME/</endpoint>
                <access_key_id>SERVICE ACCOUNT HMAC KEY</access_key_id>
                <secret_access_key>SERVICE ACCOUNT HMAC SECRET</secret_access_key>
                <metadata_path>/var/lib/clickhouse/disks/gcs/</metadata_path>
            </gcs>
            <!--highlight-start-->
            <gcs_cache>
                <type>cache</type>
                <disk>gcs</disk>
                <path>/var/lib/clickhouse/disks/gcs_cache/</path>
                <max_size>10Gi</max_size>
            </gcs_cache>
            <!--highlight-end-->
        </disks>
        <policies>
            <gcs_main>
                <volumes>
                    <main>
                        <disk>gcs_cache</disk>
                    </main>
                </volumes>
            </gcs_main>
        </policies>
    </storage_configuration>
</clickhouse>
```
#### storage_configuration > policies > gcs_main {#storage_configuration--policies--gcs_main}

存储配置策略允许选择数据存储的位置。下面高亮显示的策略通过指定 `gcs_main` 策略允许将数据存储在 `gcs` 磁盘上。例如，`CREATE TABLE ... SETTINGS storage_policy='gcs_main'`。

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <gcs>
                <support_batch_delete>false</support_batch_delete>
                <type>s3</type>
                <endpoint>https://storage.googleapis.com/BUCKET NAME/FOLDER NAME/</endpoint>
                <access_key_id>SERVICE ACCOUNT HMAC KEY</access_key_id>
                <secret_access_key>SERVICE ACCOUNT HMAC SECRET</secret_access_key>
                <metadata_path>/var/lib/clickhouse/disks/gcs/</metadata_path>
            </gcs>
        </disks>
        <policies>
            <!--highlight-start-->
            <gcs_main>
                <volumes>
                    <main>
                        <disk>gcs</disk>
                    </main>
                </volumes>
            </gcs_main>
            <!--highlight-end-->
        </policies>
    </storage_configuration>
</clickhouse>
```

有关此磁盘声明的完整设置列表，请访问 [这里](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)。

### 创建表 {#creating-a-table}

假设您已配置磁盘以使用具有写访问权限的存储桶，您应该能够创建如下示例中的表。为了简洁起见，我们使用 NYC 出租车列的子集，并将数据直接流向 GCS 支持的表：

```sql
CREATE TABLE trips_gcs
(
   `trip_id` UInt32,
   `pickup_date` Date,
   `pickup_datetime` DateTime,
   `dropoff_datetime` DateTime,
   `pickup_longitude` Float64,
   `pickup_latitude` Float64,
   `dropoff_longitude` Float64,
   `dropoff_latitude` Float64,
   `passenger_count` UInt8,
   `trip_distance` Float64,
   `tip_amount` Float32,
   `total_amount` Float32,
   `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(pickup_date)
ORDER BY pickup_datetime
-- highlight-next-line
SETTINGS storage_policy='gcs_main'
```

```sql
INSERT INTO trips_gcs SELECT trip_id, pickup_date, pickup_datetime, dropoff_datetime, pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude, passenger_count, trip_distance, tip_amount, total_amount, payment_type FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames') LIMIT 1000000;
```

根据硬件，最后插入的 100 万行可能需要几分钟才能执行。您可以通过 system.processes 表确认进度。可以将行数调整到最多 1000 万，并探索一些示例查询。

```sql
SELECT passenger_count, avg(tip_amount) as avg_tip, avg(total_amount) as avg_amount FROM trips_gcs GROUP BY passenger_count;
```

### 处理复制 {#handling-replication}

使用 GCS 磁盘可以通过使用 `ReplicatedMergeTree` 表引擎来实现复制。有关详细信息，请参见 [在使用 GCS 的两个 GCP 区域之间复制单个分片](#gcs-multi-region) 指南。

### 了解更多 {#learn-more}

[Cloud Storage XML API](https://cloud.google.com/storage/docs/xml-api/overview) 可与一些处理服务（如 Amazon Simple Storage Service (Amazon S3)）的工具和库互操作。

有关调整线程的更多信息，请参阅 [针对性能进行优化](../s3/index.md#s3-optimizing-performance)。

## 使用 Google Cloud Storage (GCS) {#gcs-multi-region}

:::tip
在 ClickHouse Cloud 中默认使用对象存储，如果您在 ClickHouse Cloud 中运行，则无需按照此过程进行操作。
:::

### 规划部署 {#plan-the-deployment}

本教程旨在描述在 Google Cloud 中运行的复制 ClickHouse 部署，并使用 Google Cloud Storage (GCS) 作为 ClickHouse 存储磁盘“类型”。

在教程中，您将在 Google Cloud Engine 的虚拟机中部署 ClickHouse 服务器节点，每个节点都有一个关联的 GCS 存储桶。复制通过一组 ClickHouse Keeper 节点协调，这些节点也作为虚拟机部署。

高可用性的示例要求：
- 两个 ClickHouse 服务器节点，位于两个 GCP 区域
- 两个 GCS 存储桶，部署在与两个 ClickHouse 服务器节点相同的区域
- 三个 ClickHouse Keeper 节点，其中两个部署在与 ClickHouse 服务器节点相同的区域。第三个可以与前两个 Keeper 节点中的一个位于同一地区，但在不同的可用区。

ClickHouse Keeper 需要两个节点才能正常运行，因此高可用性需要三个节点。

### 准备虚拟机 {#prepare-vms}

在三个区域中部署五个虚拟机：

| 区域  | ClickHouse 服务器 | 存储桶              | ClickHouse Keeper   |
|-------|-------------------|---------------------|---------------------|
| 1     | `chnode1`           | `bucket_regionname` | `keepernode1`       |
| 2     | `chnode2`           | `bucket_regionname` | `keepernode2`       |
| 3 `*` |                   |                     | `keepernode3`       |

`*` 这可以是与区域 1 或 2 相同区域的不同可用区。

#### 部署 ClickHouse {#deploy-clickhouse}

在两个主机上部署 ClickHouse，在示例配置中这些被命名为 `chnode1` 和 `chnode2`。

将 `chnode1` 放在一个 GCP 区域中，`chnode2` 放在第二个区域。在本指南中，使用 `us-east1` 和 `us-east4` 作为计算引擎虚拟机和 GCS 存储桶。

:::note
在配置完成之前，不要启动 `clickhouse server`。只需安装它。
:::

在 ClickHouse 服务器节点上执行部署步骤时，请参考 [安装说明](/getting-started/install/install.mdx)。

#### 部署 ClickHouse Keeper {#deploy-clickhouse-keeper}

在三台主机上部署 ClickHouse Keeper，在示例配置中这些被命名为 `keepernode1`、`keepernode2` 和 `keepernode3`。`keepernode1` 可以部署在与 `chnode1` 相同区域，`keepernode2` 与 `chnode2`，而 `keepernode3` 可以在任一地区，但在不同的可用区与该地区的 ClickHouse 节点不同。

在 ClickHouse Keeper 节点上执行部署时，请参考 [安装说明](/getting-started/install/install.mdx)。

### 创建两个存储桶 {#create-two-buckets}

这两个 ClickHouse 服务器将在不同区域内以实现高可用性。每个服务器将在同一区域内都有一个 GCS 存储桶。

在 **Cloud Storage > Buckets** 中选择 **CREATE BUCKET**。在本教程中创建两个存储桶，一个在 `us-east1`，另一个在 `us-east4`。这些存储桶是单区域、标准存储类，并且不是公开的。提示时，启用公共访问预防。不要创建文件夹，它们会在 ClickHouse 写入存储时创建。

如果您需要逐步创建存储桶和 HMAC 密钥的说明，请展开 **创建 GCS 存储桶和 HMAC 密钥** 并按步骤进行：

<BucketDetails />

### 配置 ClickHouse Keeper {#configure-clickhouse-keeper}

所有 ClickHouse Keeper 节点都有相同的配置文件，除了 `server_id` 行（下面高亮显示的第一行）。使用 ClickHouse Keeper 服务器的主机名修改文件，并在每台服务器上设置 `server_id` 以匹配 `raft_configuration` 中的相应 `server` 条目。由于此示例中 `server_id` 设置为 `3`，所以我们在 `raft_configuration` 中高亮显示了匹配的行。

- 用您的主机名编辑文件，并确保它们可以从 ClickHouse 服务器节点和 Keeper 节点解析。
- 将文件复制到相应位置（在每个 Keeper 服务器上为 `/etc/clickhouse-keeper/keeper_config.xml`）。
- 根据其在 `raft_configuration` 中的条目编号编辑每台机器上的 `server_id`。

```xml title=/etc/clickhouse-keeper/keeper_config.xml
<clickhouse>
    <logger>
        <level>trace</level>
        <log>/var/log/clickhouse-keeper/clickhouse-keeper.log</log>
        <errorlog>/var/log/clickhouse-keeper/clickhouse-keeper.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <listen_host>0.0.0.0</listen_host>
    <keeper_server>
        <tcp_port>9181</tcp_port>
<!--highlight-next-line-->
        <server_id>3</server_id>
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
                <hostname>keepernode1.us-east1-b.c.clickhousegcs-374921.internal</hostname>
                <port>9234</port>
            </server>
            <server>
                <id>2</id>
                <hostname>keepernode2.us-east4-c.c.clickhousegcs-374921.internal</hostname>
                <port>9234</port>
            </server>
<!--highlight-start-->
            <server>
                <id>3</id>
                <hostname>keepernode3.us-east5-a.c.clickhousegcs-374921.internal</hostname>
                <port>9234</port>
            </server>
<!--highlight-end-->
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

### 配置 ClickHouse 服务器 {#configure-clickhouse-server}

:::note 最佳实践
本指南中的一些步骤会要求您将配置文件放在 `/etc/clickhouse-server/config.d/` 中。这是在 Linux 系统上用于配置覆盖文件的默认位置。当您将这些文件放入该目录时，ClickHouse 将与默认配置合并内容。通过将这些文件放在 `config.d` 目录中，您将避免在升级期间丢失配置。
:::

#### 网络配置 {#networking}
默认情况下，ClickHouse 在回环接口上进行监听，在复制设置中，需要进行机器之间的网络连接。监听所有接口：

```xml title=/etc/clickhouse-server/config.d/network.xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

#### 远程 ClickHouse Keeper 服务器 {#remote-clickhouse-keeper-servers}

复制由 ClickHouse Keeper 协调。此配置文件通过主机名和端口号标识 ClickHouse Keeper 节点。

- 编辑主机名以匹配您的 Keeper 主机。

```xml title=/etc/clickhouse-server/config.d/use-keeper.xml
<clickhouse>
    <zookeeper>
        <node index="1">
            <host>keepernode1.us-east1-b.c.clickhousegcs-374921.internal</host>
            <port>9181</port>
        </node>
        <node index="2">
            <host>keepernode2.us-east4-c.c.clickhousegcs-374921.internal</host>
            <port>9181</port>
        </node>
        <node index="3">
            <host>keepernode3.us-east5-a.c.clickhousegcs-374921.internal</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```

#### 远程 ClickHouse 服务器 {#remote-clickhouse-servers}

此文件配置集群中每个 ClickHouse 服务器的主机名和端口。默认配置文件包含示例集群定义，为了仅显示完全配置的集群，标签 `replace="true"` 被添加到 `remote_servers` 条目，这样当这个配置与默认配置合并时，它便替换了 `remote_servers` 部分，而不是添加到其中。

- 用您的主机名编辑文件，并确保它们可以从 ClickHouse 服务器节点解析。

```xml title=/etc/clickhouse-server/config.d/remote-servers.xml
<clickhouse>
    <remote_servers replace="true">
        <cluster_1S_2R>
            <shard>
                <replica>
                    <host>chnode1.us-east1-b.c.clickhousegcs-374921.internal</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>chnode2.us-east4-c.c.clickhousegcs-374921.internal</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
</clickhouse>
```

#### 副本识别 {#replica-identification}

此文件配置与 ClickHouse Keeper 路径相关的设置。具体来说，用于识别哪些副本是数据的一部分的宏。在一台服务器上，副本应指定为 `replica_1`，而在另一台服务器上为 `replica_2`。根据示例，一个副本存储在南卡罗来纳州，另一个存储在弗吉尼亚州的值可以是 `carolina` 和 `virginia`；只需确保它们在每台机器上不同即可。

```xml title=/etc/clickhouse-server/config.d/macros.xml
<clickhouse>
    <distributed_ddl>
            <path>/clickhouse/task_queue/ddl</path>
    </distributed_ddl>
    <macros>
        <cluster>cluster_1S_2R</cluster>
        <shard>1</shard>
<!--highlight-next-line-->
        <replica>replica_1</replica>
    </macros>
</clickhouse>
```

#### 在 GCS 中存储 {#storage-in-gcs}

ClickHouse 存储配置包括 `disks` 和 `policies`。下面配置的磁盘名为 `gcs`，类型为 `s3`。之所以类型为 s3，是因为 ClickHouse 以 AWS S3 存储桶的方式访问 GCS 存储桶。此配置将需要两个副本，每个 ClickHouse 服务器节点各一个。

在下面的配置中应进行以下替换。

这些替换在两个 ClickHouse 服务器节点之间不同：
- `REPLICA 1 BUCKET` 应设置为与服务器位于同一区域的存储桶名称。
- `REPLICA 1 FOLDER` 应在其中一台服务器上更改为 `replica_1`，在另一台服务器上更改为 `replica_2`。

这些替换在两个节点之间是通用的：
- `access_key_id` 应设置为之前生成的 HMAC 密钥。
- `secret_access_key` 应设置为之前生成的 HMAC 秘密。

```xml title=/etc/clickhouse-server/config.d/storage.xml
<clickhouse>
    <storage_configuration>
        <disks>
            <gcs>
                <support_batch_delete>false</support_batch_delete>
                <type>s3</type>
                <endpoint>https://storage.googleapis.com/REPLICA 1 BUCKET/REPLICA 1 FOLDER/</endpoint>
                <access_key_id>SERVICE ACCOUNT HMAC KEY</access_key_id>
                <secret_access_key>SERVICE ACCOUNT HMAC SECRET</secret_access_key>
                <metadata_path>/var/lib/clickhouse/disks/gcs/</metadata_path>
            </gcs>
            <cache>
                <type>cache</type>
                <disk>gcs</disk>
                <path>/var/lib/clickhouse/disks/gcs_cache/</path>
                <max_size>10Gi</max_size>
            </cache>
        </disks>
        <policies>
            <gcs_main>
                <volumes>
                    <main>
                        <disk>gcs</disk>
                    </main>
                </volumes>
            </gcs_main>
        </policies>
    </storage_configuration>
</clickhouse>
```

### 启动 ClickHouse Keeper {#start-clickhouse-keeper}

根据您的操作系统使用相应的命令，例如：

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

#### 检查 ClickHouse Keeper 状态 {#check-clickhouse-keeper-status}

使用 `netcat` 向 ClickHouse Keeper 发送命令。例如，`mntr` 返回 ClickHouse Keeper 集群的状态。如果在每个 Keeper 节点上运行此命令，您将看到其中一个为领导者，其他两个为跟随者：

```bash
echo mntr | nc localhost 9181
```
```response
zk_version      v22.7.2.15-stable-f843089624e8dd3ff7927b8a125cf3a7a769c069
zk_avg_latency  0
zk_max_latency  11
zk_min_latency  0
zk_packets_received     1783
zk_packets_sent 1783

# highlight-start
zk_num_alive_connections        2
zk_outstanding_requests 0
zk_server_state leader

# highlight-end
zk_znode_count  135
zk_watch_count  8
zk_ephemerals_count     3
zk_approximate_data_size        42533
zk_key_arena_size       28672
zk_latest_snapshot_size 0
zk_open_file_descriptor_count   182
zk_max_file_descriptor_count    18446744073709551615

# highlight-start
zk_followers    2
zk_synced_followers     2

# highlight-end
```

### 启动 ClickHouse 服务器 {#start-clickhouse-server}

在 `chnode1` 和 `chnode2` 上运行：

```bash
sudo service clickhouse-server start
```
```bash
sudo service clickhouse-server status
```

### 验证 {#verification}

#### 验证磁盘配置 {#verify-disk-configuration}

`system.disks` 应包含每个磁盘的记录：
- default
- gcs
- cache

```sql
SELECT *
FROM system.disks
FORMAT Vertical
```
```response
Row 1:
──────
name:             cache
path:             /var/lib/clickhouse/disks/gcs/
free_space:       18446744073709551615
total_space:      18446744073709551615
unreserved_space: 18446744073709551615
keep_free_space:  0
type:             s3
is_encrypted:     0
is_read_only:     0
is_write_once:    0
is_remote:        1
is_broken:        0
cache_path:       /var/lib/clickhouse/disks/gcs_cache/

Row 2:
──────
name:             default
path:             /var/lib/clickhouse/
free_space:       6555529216
total_space:      10331889664
unreserved_space: 6555529216
keep_free_space:  0
type:             local
is_encrypted:     0
is_read_only:     0
is_write_once:    0
is_remote:        0
is_broken:        0
cache_path:

Row 3:
──────
name:             gcs
path:             /var/lib/clickhouse/disks/gcs/
free_space:       18446744073709551615
total_space:      18446744073709551615
unreserved_space: 18446744073709551615
keep_free_space:  0
type:             s3
is_encrypted:     0
is_read_only:     0
is_write_once:    0
is_remote:        1
is_broken:        0
cache_path:

3 rows in set. Elapsed: 0.002 sec.
```
#### 验证在集群上创建的表在两个节点上均已创建 {#verify-that-tables-created-on-the-cluster-are-created-on-both-nodes}
```sql
-- highlight-next-line
create table trips on cluster 'cluster_1S_2R' (
 `trip_id` UInt32,
 `pickup_date` Date,
 `pickup_datetime` DateTime,
 `dropoff_datetime` DateTime,
 `pickup_longitude` Float64,
 `pickup_latitude` Float64,
 `dropoff_longitude` Float64,
 `dropoff_latitude` Float64,
 `passenger_count` UInt8,
 `trip_distance` Float64,
 `tip_amount` Float32,
 `total_amount` Float32,
 `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4))
ENGINE = ReplicatedMergeTree
PARTITION BY toYYYYMM(pickup_date)
ORDER BY pickup_datetime
-- highlight-next-line
SETTINGS storage_policy='gcs_main'
```
```response
┌─host───────────────────────────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.us-east4-c.c.gcsqa-375100.internal │ 9000 │      0 │       │                   1 │                1 │
└────────────────────────────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
┌─host───────────────────────────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1.us-east1-b.c.gcsqa-375100.internal │ 9000 │      0 │       │                   0 │                0 │
└────────────────────────────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

2 rows in set. Elapsed: 0.641 sec.
```

#### 验证数据可以插入 {#verify-that-data-can-be-inserted}

```sql
INSERT INTO trips SELECT
    trip_id,
    pickup_date,
    pickup_datetime,
    dropoff_datetime,
    pickup_longitude,
    pickup_latitude,
    dropoff_longitude,
    dropoff_latitude,
    passenger_count,
    trip_distance,
    tip_amount,
    total_amount,
    payment_type
FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames')
LIMIT 1000000
```

#### 验证表使用存储策略 `gcs_main`。 {#verify-that-the-storage-policy-gcs_main-is-used-for-the-table}
```sql
SELECT
    engine,
    data_paths,
    metadata_path,
    storage_policy,
    formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'trips'
FORMAT Vertical
```
```response
Row 1:
──────
engine:                          ReplicatedMergeTree
data_paths:                      ['/var/lib/clickhouse/disks/gcs/store/631/6315b109-d639-4214-a1e7-afbd98f39727/']
metadata_path:                   /var/lib/clickhouse/store/e0f/e0f3e248-7996-44d4-853e-0384e153b740/trips.sql
storage_policy:                  gcs_main
formatReadableSize(total_bytes): 36.42 MiB

1 row in set. Elapsed: 0.002 sec.
```

#### 在 Google Cloud 控制台中验证 {#verify-in-google-cloud-console}

查看存储桶，您将看到在每个存储桶中创建了一个文件夹，其名称与在 `storage.xml` 配置文件中使用的名称相同。展开文件夹，您将看到许多文件，表示数据分区。
#### 副本一的存储桶 {#bucket-for-replica-one}

<Image img={GCS_examine_bucket_1} size="lg" border alt="在 Google Cloud Storage 中显示数据分区文件结构的副本一存储桶" />

#### 副本二的存储桶 {#bucket-for-replica-two}

<Image img={GCS_examine_bucket_2} size="lg" border alt="在 Google Cloud Storage 中显示数据分区文件结构的副本二存储桶" />
