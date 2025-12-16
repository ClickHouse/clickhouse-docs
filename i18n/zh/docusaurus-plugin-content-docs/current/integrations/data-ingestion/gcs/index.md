---
sidebar_label: 'Google Cloud Storage (GCS)'
sidebar_position: 4
slug: /integrations/gcs
description: '以 Google Cloud Storage (GCS) 为后端的 MergeTree'
title: '将 Google Cloud Storage 与 ClickHouse 集成'
doc_type: 'guide'
keywords: ['Google Cloud Storage ClickHouse', 'GCS ClickHouse 集成', 'GCS 后端 MergeTree', 'ClickHouse GCS 存储', 'Google Cloud ClickHouse']
---

import BucketDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_GCS_authentication_and_bucket.md';
import Image from '@theme/IdealImage';
import GCS_examine_bucket_1 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-1.png';
import GCS_examine_bucket_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-2.png';


# 将 Google Cloud Storage 与 ClickHouse 集成 {#integrate-google-cloud-storage-with-clickhouse}

:::note
如果您在 [Google Cloud](https://cloud.google.com) 上使用 ClickHouse Cloud，则本页内容不适用，因为您的服务已经在使用 [Google Cloud Storage](https://cloud.google.com/storage)。如果您希望从 GCS 中执行 `SELECT` 或向 GCS 中执行 `INSERT` 操作，请参阅 [`gcs` 表函数](/sql-reference/table-functions/gcs)。
:::

我们认识到，如果您希望实现存储与计算分离，GCS 是一个颇具吸引力的存储解决方案。为此，ClickHouse 支持在 MergeTree 引擎中使用 GCS 作为底层存储。这使您能够同时利用 GCS 的可扩展性和成本优势，以及 MergeTree 引擎的写入和查询性能。

## 基于 GCS 的 MergeTree {#gcs-backed-mergetree}

### 创建磁盘 {#creating-a-disk}

要将 GCS 存储桶用作磁盘，首先必须在 `conf.d`  目录下的文件中，在 ClickHouse 配置中声明它。下面展示了一个 GCS 磁盘声明示例。该配置包含多个部分，用于配置 GCS “磁盘”、缓存，以及在需要在 GCS 磁盘上创建表时在 DDL 查询中指定的策略。下面分别对这些部分进行说明。

#### Storage configuration &gt; disks &gt; gcs {#storage_configuration--disks--gcs}

配置中高亮显示的这部分内容表示：

* 不执行批量删除。GCS 当前不支持批量删除，因此禁用自动检测以避免错误消息。
* 磁盘类型为 `s3`，因为使用的是 S3 API。
* GCS 提供的 endpoint（端点）
* 服务账号的 HMAC key 和 secret
* 本地磁盘上的元数据路径

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


#### Storage configuration &gt; disks &gt; cache {#storage_configuration--disks--cache}

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


#### Storage configuration &gt; policies &gt; gcs&#95;main {#storage_configuration--policies--gcs_main}

存储配置中的策略用于选择数据存储的位置。下面高亮的策略通过指定 `gcs_main` 存储策略，允许将数据存储在名为 `gcs` 的磁盘上。例如：`CREATE TABLE ... SETTINGS storage_policy='gcs_main'`。

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

与此磁盘声明相关的设置完整列表可在[此处](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)中找到。


### 创建表 {#creating-a-table}

假设你已经将磁盘配置为使用具有写权限的存储桶，现在应该可以创建如下示例中的表。为简洁起见，我们只使用 NYC taxi 数据集中的部分列，并将数据直接流式写入以 GCS 为后端的表中：

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

根据硬件情况，这第二次插入的 100 万行数据可能需要几分钟才能执行完成。您可以通过 `system.processes` 表来查看进度。也可以根据需要将行数上调至最多 1000 万行，并尝试运行一些示例查询。

```sql
SELECT passenger_count, avg(tip_amount) AS avg_tip, avg(total_amount) AS avg_amount FROM trips_gcs GROUP BY passenger_count;
```


### 处理复制 {#handling-replication}

使用 GCS 磁盘时，可以通过 `ReplicatedMergeTree` 表引擎来实现复制。有关详细信息，请参阅[使用 GCS 在两个 GCP 区域之间复制单个分片](#gcs-multi-region)指南。

### 了解更多 {#learn-more}

[Cloud Storage XML API](https://cloud.google.com/storage/docs/xml-api/overview) 可与某些适用于 Amazon Simple Storage Service（Amazon S3）等服务的工具和库互操作。

有关线程调优的更多信息，请参阅[性能优化](../s3/index.md#s3-optimizing-performance)。

## 使用 Google Cloud Storage (GCS) {#gcs-multi-region}

:::tip
ClickHouse Cloud 默认使用对象存储，如果你运行在 ClickHouse Cloud 中，则无需执行本步骤。
:::

### 规划部署 {#plan-the-deployment}

本教程介绍一个运行在 Google Cloud 上的 ClickHouse 副本部署方案，并使用 Google Cloud Storage (GCS) 作为 ClickHouse 存储磁盘的 “type”。

在本教程中，你将在 Google Compute Engine 虚拟机上部署 ClickHouse 服务器节点，每个节点都关联一个用于存储的 GCS bucket。复制由一组同样以虚拟机形式部署的 ClickHouse Keeper 节点进行协调。

高可用示例要求：

- 两个 ClickHouse 服务器节点，位于两个不同的 GCP 区域
- 两个 GCS bucket，分别部署在与这两个 ClickHouse 服务器节点相同的区域
- 三个 ClickHouse Keeper 节点，其中两个分别部署在与两个 ClickHouse 服务器节点相同的区域。第三个可以部署在前两个 Keeper 节点之一所在的相同区域，但需位于不同的可用区。

ClickHouse Keeper 至少需要两个节点才能工作，因此为了实现高可用，需要三个节点。

### 准备虚拟机 {#prepare-vms}

在三个区域中部署五台虚拟机：

| 区域 | ClickHouse Server | Bucket            | ClickHouse Keeper |
|------|-------------------|-------------------|-------------------|
| 1    | `chnode1`           | `bucket_regionname` | `keepernode1`       |
| 2    | `chnode2`           | `bucket_regionname` | `keepernode2`       |
| 3 `*`|                   |                   | `keepernode3`       |

`*` 该节点可以位于区域 1 或 2 的同一地区内，但处于不同的可用区。

#### 部署 ClickHouse {#deploy-clickhouse}

在两台主机上部署 ClickHouse，在示例配置中它们命名为 `chnode1` 和 `chnode2`。

将 `chnode1` 放置在一个 GCP 区域，将 `chnode2` 放置在另一个区域。本指南中，Compute Engine 虚拟机和 GCS bucket 都使用 `us-east1` 和 `us-east4` 区域。

:::note
在完成配置之前不要启动 `clickhouse server`，仅安装即可。
:::

在 ClickHouse 服务器节点上执行部署步骤时，请参考[安装说明](/getting-started/install/install.mdx)。

#### 部署 ClickHouse Keeper {#deploy-clickhouse-keeper}

在三台主机上部署 ClickHouse Keeper，在示例配置中它们命名为 `keepernode1`、`keepernode2` 和 `keepernode3`。`keepernode1` 可以部署在与 `chnode1` 相同的区域，`keepernode2` 与 `chnode2` 同一区域，而 `keepernode3` 可以部署在上述任一区域中，但需与该区域内的 ClickHouse 节点处于不同的可用区。

在 ClickHouse Keeper 节点上执行部署步骤时，请参考[安装说明](/getting-started/install/install.mdx)。

### 创建两个 bucket {#create-two-buckets}

为了实现高可用，这两个 ClickHouse 服务器将位于不同的区域。每个服务器都会在与自身相同的区域中拥有一个 GCS bucket。

在 **Cloud Storage > Buckets** 中选择 **CREATE BUCKET**。在本教程中将创建两个 bucket，分别位于 `us-east1` 和 `us-east4`。bucket 使用单一区域、标准存储类，并且不可公开访问。在提示时启用公共访问阻止（public access prevention）。不要创建文件夹，ClickHouse 在写入存储时会自动创建。

如果你需要创建 bucket 和 HMAC key 的分步说明，请展开 **Create GCS buckets and an HMAC key** 并按步骤执行：

<BucketDetails />

### 配置 ClickHouse Keeper {#configure-clickhouse-keeper}

所有 ClickHouse Keeper 节点使用相同的配置文件，除了 `server_id` 行（下面高亮的第一行）之外。使用你自己的 ClickHouse Keeper 服务器的主机名修改该文件，并在每台服务器上将 `server_id` 设置为与 `raft_configuration` 中相应的 `server` 条目相匹配。由于本示例中 `server_id` 被设置为 `3`，因此我们在 `raft_configuration` 中高亮了与之匹配的行。

* 使用你的主机名编辑该文件，并确保这些主机名可以从 ClickHouse 服务器节点和 Keeper 节点正确解析
* 将文件复制到对应位置（每台 Keeper 服务器上的 `/etc/clickhouse-keeper/keeper_config.xml`）
* 根据其在 `raft_configuration` 中的条目编号编辑每台机器上的 `server_id`

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

:::note best practice
本指南中的某些步骤会要求你将配置文件放置在 `/etc/clickhouse-server/config.d/` 中。这是 Linux 系统上用于放置覆盖默认配置文件的默认位置。当你将这些文件放入该目录时，ClickHouse 会将其内容与默认配置进行合并。通过将这些文件放在 `config.d` 目录中，你可以在升级过程中避免丢失自己的配置。
:::

#### 网络 {#networking}

默认情况下，ClickHouse 监听回环接口。在副本部署环境中，各节点之间必须具备网络连通性。要监听所有接口：

```xml title=/etc/clickhouse-server/config.d/network.xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```


#### 远程 ClickHouse Keeper 服务器 {#remote-clickhouse-keeper-servers}

副本复制由 ClickHouse Keeper 协调完成。此配置文件通过主机名和端口号来标识 ClickHouse Keeper 节点。

* 编辑主机名，使其与实际的 Keeper 主机相匹配

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

此文件用于配置集群中每个 ClickHouse 服务器的主机名和端口。默认配置文件包含示例集群定义。为了只显示已完全配置的集群，会在 `remote_servers` 条目中添加标签 `replace="true"`，这样当此配置与默认配置合并时，会替换 `remote_servers` 部分，而不是在其基础上追加内容。

* 使用你的主机名编辑该文件，并确保这些主机名可以从 ClickHouse 服务器节点正确解析

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


#### 副本标识 {#replica-identification}

此文件用于配置与 ClickHouse Keeper 路径相关的设置，尤其是用于标识数据属于哪个副本的宏。在一台服务器上，应将副本指定为 `replica_1`，在另一台服务器上指定为 `replica_2`。这些名称可以修改，例如在我们的示例中，一个副本存储在南卡罗来纳州，另一个存储在北弗吉尼亚州，则可以分别命名为 `carolina` 和 `virginia`；只需确保每台机器上的名称彼此不同即可。

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


#### 在 GCS 中配置存储 {#storage-in-gcs}

ClickHouse 的存储配置包括 `disks` 和 `policies`。下面配置的磁盘名为 `gcs`，其 `type` 为 `s3`。之所以使用 s3 类型，是因为 ClickHouse 访问 GCS bucket 的方式与访问 AWS S3 bucket 相同。此配置需要准备两份，分别应用于两个 ClickHouse 服务器节点。

需要在下方配置中进行以下替换。

以下替换项在两个 ClickHouse 服务器节点之间是不同的：

* `REPLICA 1 BUCKET` 应设置为与该服务器处于同一区域的 bucket 名称
* `REPLICA 1 FOLDER` 应在其中一台服务器上改为 `replica_1`，在另一台服务器上改为 `replica_2`

以下替换项在两个节点之间是通用的：

* `access_key_id` 应设置为之前生成的 HMAC Key
* `secret_access_key` 应设置为之前生成的 HMAC Secret

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

根据所使用的操作系统运行相应的命令，例如：

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```


#### 检查 ClickHouse Keeper 状态 {#check-clickhouse-keeper-status}

使用 `netcat` 向 ClickHouse Keeper 发送命令。例如，`mntr` 用于返回 ClickHouse Keeper 集群的状态。如果在每个 Keeper 节点上运行该命令，可以看到其中一个为 leader，另外两个为 follower：

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

在 `chnode1` 和 `chnode` 上运行：

```bash
sudo service clickhouse-server start
```

```bash
sudo service clickhouse-server status
```


### 验证 {#verification}

#### 验证磁盘配置 {#verify-disk-configuration}

`system.disks` 中应包含每个磁盘对应的一条记录：

* default
* gcs
* cache

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


#### 验证在集群中创建的表是否在两个节点上都已创建 {#verify-that-tables-created-on-the-cluster-are-created-on-both-nodes}

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


#### 验证是否可以插入数据 {#verify-that-data-can-be-inserted}

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


#### 验证该表是否使用了存储策略 `gcs_main`。 {#verify-that-the-storage-policy-gcs_main-is-used-for-the-table}

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

查看这些 bucket，你会发现每个 bucket 中都创建了一个文件夹，文件夹名称与 `storage.xml` 配置文件中使用的名称相同。展开这些文件夹，你会看到许多文件，对应各个数据分区。

#### 副本一的 Bucket {#bucket-for-replica-one}

<Image img={GCS_examine_bucket_1} size="lg" border alt="Google Cloud Storage 中用于副本一的 bucket，显示包含数据分区的文件夹结构" />

#### 副本二的 Bucket {#bucket-for-replica-two}

<Image img={GCS_examine_bucket_2} size="lg" border alt="Google Cloud Storage 中用于副本二的 bucket，显示包含数据分区的文件夹结构" />