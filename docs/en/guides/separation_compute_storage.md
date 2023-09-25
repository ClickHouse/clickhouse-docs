---
sidebar_position: 1
sidebar_label: Separation of Compute and Storage
---
import BucketDetails from '@site/docs/en/_snippets/_S3_authentication_and_bucket.md';

# Separation of Compute and Storage

In this guide we are going to see how compute and storage can be separated using ClickHouse and S3.

## S3 Backed MergeTree

The `s3` functions and associated table engine allow us to query data in S3 using familiar ClickHouse syntax. However, concerning data management features and performance, they are limited. There is no support for primary indexes, no-cache support, and files inserts need to be managed by the user.

ClickHouse recognizes that S3 represents an attractive storage solution, especially where query performance on “colder” data is less critical, and users seek to separate storage and compute. To help achieve this, support is provided for using S3 as the storage for a MergeTree engine. This will enable users to exploit the scalability and cost benefits of S3, and the insert and query performance of the MergeTree engine.

### Creating a Disk

To utilize an S3 bucket as a disk, we must first declare it within the ClickHouse configuration file. Either extend config.xml or preferably provide a new file under conf.d. An example of an S3 disk declaration is shown below:

```xml
<clickhouse>
    <storage_configuration>
        ...
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>https://sample-bucket.s3.us-east-2.amazonaws.com/tables/</endpoint>
                <access_key_id>your_access_key_id</access_key_id>
                <secret_access_key>your_secret_access_key</secret_access_key>
                <region></region>
                <metadata_path>/var/lib/clickhouse/disks/s3/</metadata_path>
            </s3>
            <s3_cache>
                <type>cache</type>
                <disk>s3</disk>
                <path>/var/lib/clickhouse/disks/s3_cache/</path>
                <max_size>10Gi</max_size>
            </s3_cache>
        </disks>
        ...
    </storage_configuration>
</clickhouse>

```

A complete list of settings relevant to this disk declaration can be found [here](/docs/en/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3). Note that credentials can be managed here using the same approaches described in [Managing credentials](#managing-credentials), i.e., the use_environment_credentials can be set to true in the above settings block to use IAM roles.

### Creating a Storage Policy

Once configured, this “disk” can be used by a storage volume declared within a policy. For the example below, we assume s3 is our only storage. This ignores more complex hot-cold architectures where data can be relocated based on TTLs and fill rates.

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
            ...
            </s3>
            <s3_cache>
            ...
            </s3_cache>
        </disks>
        <policies>
            <s3_main>
                <volumes>
                    <main>
                        <disk>s3</disk>
                    </main>
                </volumes>
            </s3_main>
        </policies>
    </storage_configuration>
</clickhouse>
```

### Creating a table

Assuming you have configured your disk to use a bucket with write access, you should be able to create a table such as in the example below. For purposes of brevity, we use a subset of the NYC taxi columns and stream data directly to the s3 backed table:

```sql
CREATE TABLE trips_s3
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
SETTINGS index_granularity = 8192, storage_policy='s3_main'
```

```sql
INSERT INTO trips_s3 SELECT trip_id, pickup_date, pickup_datetime, dropoff_datetime, pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude, passenger_count, trip_distance, tip_amount, total_amount, payment_type FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames') LIMIT 1000000;
```

Depending on the hardware, this latter insert of 1m rows may take a few minutes to execute. You can confirm the progress via the system.processes table. Feel free to adjust the row count up to the limit of 10m and explore some sample queries.

```sql
SELECT passenger_count, avg(tip_amount) as avg_tip, avg(total_amount) as avg_amount FROM trips_s3 GROUP BY passenger_count;
```

### Handling Replication

Replication with S3 disks can be accomplished by using the `ReplicatedMergeTree` table engine.  See the [replicating a single shard across two AWS regions using S3 Object Storage](#s3-multi-region) guide for details.

### Read & Writes

The following notes cover the implementation of S3 interactions with ClickHouse. Whilst generally only informative, it may help the readers when [Optimizing for Performance](#s3-optimizing-performance):

* By default, the maximum number of query processing threads used by any stage of the query processing pipeline is equal to the number of cores. Some stages are more parallelizable than others, so this value provides an upper bound.  Multiple query stages may execute at once since data is streamed from the disk. The exact number of threads used for a query may thus exceed this. Modify through the setting [max_threads](/docs/en/operations/settings/settings.md/#settings-max_threads).
* Reads on S3 are asynchronous by default. This behavior is determined by setting `remote_filesystem_read_method`, set to the value `threadpool` by default. When serving a request, ClickHouse reads granules in stripes. Each of these stripes potentially contain many columns. A thread will read the columns for their granules one by one. Rather than doing this synchronously, a prefetch is made for all columns before waiting for the data. This offers significant performance improvements over synchronous waits on each column. Users will not need to change this setting in most cases - see [Optimizing for Performance](#s3-optimizing-performance).
* For the s3 function and table, parallel downloading is determined by the values `max_download_threads` and `max_download_buffer_size`. Files will only be downloaded in parallel if their size is greater than the total buffer size combined across all threads. This is only available on versions > 22.3.1.
* Writes are performed in parallel, with a maximum of 100 concurrent file writing threads. `max_insert_delayed_streams_for_parallel_write`, which has a default value of 1000,  controls the number of S3 blobs written in parallel. Since a buffer is required for each file being written (~1MB), this effectively limits the memory consumption of an INSERT. It may be appropriate to lower this value in low server memory scenarios.


## Use S3 Object Storage as a ClickHouse disk {#configuring-s3-for-clickhouse-use}

If you need step-by-step instructions to create buckets and an IAM role, then expand **Create GCS buckets and an IAM role** and follow along:

<BucketDetails />

### Configure ClickHouse to use the S3 bucket as a disk
The following example is based on a Linux Deb package installed as a service with default ClickHouse directories.

1.  Create a new file in the ClickHouse `config.d` directory to store the storage configuration.
```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```
2. Add the following for storage configuration; substituting the bucket path, access key and secret keys from earlier steps
```xml
<clickhouse>
  <storage_configuration>
    <disks>
      <s3_disk>
        <type>s3</type>
        <endpoint>https://mars-doc-test.s3.amazonaws.com/clickhouse3/</endpoint>
        <access_key_id>ABC123</access_key_id>
        <secret_access_key>Abc+123</secret_access_key>
        <metadata_path>/var/lib/clickhouse/disks/s3_disk/</metadata_path>
      </s3_disk>
      <s3_cache>
        <type>cache</type>
        <disk>s3_disk</disk>
        <path>/var/lib/clickhouse/disks/s3_cache/</path>
        <max_size>10Gi</max_size>
      </s3_cache>
    </disks>
    <policies>
      <s3_main>
        <volumes>
          <main>
            <disk>s3_disk</disk>
          </main>
        </volumes>
      </s3_main>
    </policies>
  </storage_configuration>
</clickhouse>
```

:::note
The tags `s3_disk` and `s3_cache` within the `<disks>` tag are arbitrary labels. These can be set to something else but the same label must be used in the `<disk>` tab under the `<policies>` tab to reference the disk.
The `<S3_main>` tag is also arbitrary and is the name of the policy which will be used as the identifier storage target when creating resources in ClickHouse.

The configuration shown above is for ClickHouse version 22.8 or higher, if you are using an older version please see the [storing data](/docs/en/operations/storing-data.md/#using-local-cache) docs.

For more information about using S3:
Integrations Guide: [S3 Backed MergeTree](#s3-backed-mergetree)
:::

3. Update the owner of the file to the `clickhouse` user and group
```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```
4. Restart the ClickHouse instance to have the changes take effect.
```bash
service clickhouse-server restart
```

### Testing
1. Log in with the ClickHouse client, something like the following
```bash
clickhouse-client --user default --password ClickHouse123!
```
2. Create a table specifying the new S3 storage policy
```sql
CREATE TABLE s3_table1
           (
               `id` UInt64,
               `column1` String
           )
           ENGINE = MergeTree
           ORDER BY id
           SETTINGS storage_policy = 's3_main';
```

3. Show that the table was created with the correct policy
```sql
SHOW CREATE TABLE s3_table1;
```
```response
┌─statement────────────────────────────────────────────────────
│ CREATE TABLE default.s3_table1
(
    `id` UInt64,
    `column1` String
)
ENGINE = MergeTree
ORDER BY id
SETTINGS storage_policy = 's3_main', index_granularity = 8192
└──────────────────────────────────────────────────────────────
```

4. Insert test rows into the table
```sql
INSERT INTO s3_table1
           (id, column1)
           VALUES
           (1, 'abc'),
           (2, 'xyz');
```
```response
INSERT INTO s3_table1 (id, column1) FORMAT Values

Query id: 0265dd92-3890-4d56-9d12-71d4038b85d5

Ok.

2 rows in set. Elapsed: 0.337 sec.
```
5. View the rows
```sql
SELECT * FROM s3_table1;
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ xyz     │
└────┴─────────┘

2 rows in set. Elapsed: 0.284 sec.
```
6.  In the AWS console, navigate to the buckets, and select the new one and the folder.
You should see something like the following:

  ![create_s3_bucket_10](./images/s3-j.png)

## Replicating a single shard across two AWS regions using S3 Object Storage {#s3-multi-region}

:::tip
Object storage is used by default in ClickHouse Cloud, you do not need to follow this procedure if you are running in ClickHouse Cloud.
:::

### Plan the deployment
This tutorial is based on deploying two ClickHouse Server nodes and three ClickHouse Keeper nodes in AWS EC2.  The data store for the ClickHouse servers is S3. Two AWS regions, with a ClickHouse Server and an S3 Bucket in each region, are used in order to support disaster recovery.

ClickHouse tables are replicated across the two servers, and therefore across the two regions.

### Install software

#### ClickHouse server nodes
Refer to the [installation instructions](/docs/en/getting-started/install.md/#available-installation-options) when performing the deployment steps on the ClickHouse server nodes.

#### Deploy ClickHouse

Deploy ClickHouse on two hosts, in the sample configurations these are named `chnode1`, `chnode2`.

Place `chnode1` in one AWS region, and `chnode2` in a second.

#### Deploy ClickHouse Keeper

Deploy ClickHouse Keeper on three hosts, in the sample configurations these are named `keepernode1`, `keepernode2`, and `keepernode3`.  `keepernode1` can be deployed in the same region as `chnode1`, `keepernode2` with `chnode2`, and `keepernode3` in either region but a different availability zone from the ClickHouse node in that region.

Refer to the [installation instructions](/docs/en/getting-started/install.md/#install-standalone-clickhouse-keeper) when performing the deployment steps on the ClickHouse Keeper nodes.

### Create S3 Buckets

Create two S3 buckets, one in each of the regions that you have placed `chnode1` and `chnode2`.

If you need step-by-step instructions to create buckets and an IAM role, then expand **Create GCS buckets and an IAM role** and follow along:

<BucketDetails />

The configuration files will then be placed in `/etc/clickhouse-server/config.d/`.  Here is a sample configuration file for one bucket, the other is similar with the three highlighted lines differing:

```xml title="/etc/clickhouse-server/config.d/storage_config.xml"
<clickhouse>
  <storage_configuration>
     <disks>
        <s3_disk>
           <type>s3</type>
	<!--highlight-start-->
           <endpoint>https://docs-clickhouse-s3.s3.us-east-2.amazonaws.com/clickhouses3/</endpoint>
           <access_key_id>ABCDEFGHIJKLMNOPQRST</access_key_id>
           <secret_access_key>Tjdm4kf5snfkj303nfljnev79wkjn2l3knr81007</secret_access_key>
	<!--highlight-end-->
           <metadata_path>/var/lib/clickhouse/disks/s3_disk/</metadata_path>
        </s3_disk>

        <s3_cache>
           <type>cache</type>
           <disk>s3</disk>
           <path>/var/lib/clickhouse/disks/s3_cache/</path>
           <max_size>10Gi</max_size>
        </s3_cache>
     </disks>
        <policies>
            <s3_main>
                <volumes>
                    <main>
                        <disk>s3_disk</disk>
                    </main>
                </volumes>
            </s3_main>
    </policies>
   </storage_configuration>
</clickhouse>
```
:::note
Many of the steps in this guide will ask you to place a configuration file in `/etc/clickhouse-server/config.d/`.  This is the default location on Linux systems for configuration override files.  When you put these files into that directory ClickHouse will use the content to override the default configuration.  By placing these files in the override directory you will avoid losing your configuration during an upgrade.
:::

### Configure ClickHouse Keeper

When running ClickHouse Keeper standalone (separate from ClickHouse server) the configuration is a single XML file.  In this tutorial, the file is `/etc/clickhouse-keeper/keeper_config.xml`.  All three Keeper servers use the same configuration with one setting different; `<server_id>`.

`server_id` indicates the ID to be assigned to the host where the configuration files is used.  In the example below, the `server_id` is `3`, and if you look further down in the file in the `<raft_configuration>` section, you will see that server 3 has the hostname `keepernode3`.  This is how the ClickHouse Keeper process knows which other servers to connect to when choosing a leader and all other activities.

```xml title="/etc/clickhouse-keeper/keeper_config.xml"
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
                <hostname>keepernode1</hostname>
                <port>9234</port>
            </server>
            <server>
                <id>2</id>
                <hostname>keepernode2</hostname>
                <port>9234</port>
            </server>
<!--highlight-start-->
            <server>
                <id>3</id>
                <hostname>keepernode3</hostname>
                <port>9234</port>
            </server>
<!--highlight-end-->
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

Copy the configuration file for ClickHouse Keeper in place (remembering to set the `<server_id>`):
```bash
sudo -u clickhouse \
  cp keeper.xml /etc/clickhouse-keeper/keeper.xml
```

### Configure ClickHouse Server

#### Define a cluster

ClickHouse cluster(s) are defined in the `<remote_servers>` section of the configuration.  In this sample one cluster, `cluster_1S_2R`, is defined and it consists of a single shard with two replicas.  The replicas are located on the hosts `chnode1` and `chnode2`.

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
    <remote_servers replace="true">
        <cluster_1S_2R>
            <shard>
                <replica>
                    <host>chnode1</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>chnode2</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
</clickhouse>
```

When working with clusters it is handy to define macros that populate DDL queries with the cluster, shard, and replica settings.  This sample allows you to specify the use of a replicated table engine without providing `shard` and `replica` details.  When you create a table you can see how the `shard` and `replica` macros are used by querying `system.tables`.

```xml title="/etc/clickhouse-server/config.d/macros.xml"
<clickhouse>
    <distributed_ddl>
            <path>/clickhouse/task_queue/ddl</path>
    </distributed_ddl>
    <macros>
        <cluster>cluster_1S_2R</cluster>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
</clickhouse>
```
:::note
The above macros are for `chnode1`, on `chnode2` set `replica` to `replica_2`.
:::

#### Disable zero-copy replication

In ClickHouse versions 22.7 and lower the setting `allow_remote_fs_zero_copy_replication` is set to `true` by default for S3 and HDFS disks. This setting should be set to `false` for this disaster recovery scenario, and in version 22.8 and higher it is set to `false` by default.

This setting should be false for two reasons: 1) this feature is not production ready; 2) in a disaster recovery scenario both the data and metadata need to be stored in multiple regions. Set `allow_remote_fs_zero_copy_replication` to `false`.

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
   <merge_tree>
        <allow_remote_fs_zero_copy_replication>false</allow_remote_fs_zero_copy_replication>
   </merge_tree>
</clickhouse>
```


ClickHouse Keeper is responsible for coordinating the replication of data across the ClickHouse nodes.  To inform ClickHouse about the ClickHouse Keeper nodes add a configuration file to each of the ClickHouse nodes.

```xml title="/etc/clickhouse-server/config.d/use_keeper.xml"
<clickhouse>
    <zookeeper>
        <node index="1">
            <host>keepernode1</host>
            <port>9181</port>
        </node>
        <node index="2">
            <host>keepernode2</host>
            <port>9181</port>
        </node>
        <node index="3">
            <host>keepernode3</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```

### Configure networking

See the [network ports](../../../guides/sre/network-ports.md) list when you configure the security settings in AWS so that your servers can communicate with each other, and you can communicate with them.

All three servers must listen for network connections so that they can communicate between the servers and with S3.  By default, ClickHouse listens ony on the loopback address, so this must be changed.  This is configured in `/etc/clickhouse-server/config.d/`.  Here is a sample that configures ClickHouse and ClickHouse Keeper to listen on all IP v4 interfaces.  see the documentation or the default configuration file `/etc/clickhouse/config.xml` for more information.

```xml title="/etc/clickhouse-server/config.d/networking.xml"
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

### Start the servers

#### Run ClickHouse Keeper

On each Keeper server run the commands for your operating system, for example:

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

#### Check ClickHouse Keeper status

Send commands to the ClickHouse Keeper with `netcat`.  For example, `mntr` returns the state of the ClickHouse Keeper cluster.  If you run the command on each of the Keeper nodes you will see that one is a leader, and the other two are followers:

```bash
echo mntr | nc localhost 9181
```
```response
zk_version	v22.7.2.15-stable-f843089624e8dd3ff7927b8a125cf3a7a769c069
zk_avg_latency	0
zk_max_latency	11
zk_min_latency	0
zk_packets_received	1783
zk_packets_sent	1783
# highlight-start
zk_num_alive_connections	2
zk_outstanding_requests	0
zk_server_state	leader
# highlight-end
zk_znode_count	135
zk_watch_count	8
zk_ephemerals_count	3
zk_approximate_data_size	42533
zk_key_arena_size	28672
zk_latest_snapshot_size	0
zk_open_file_descriptor_count	182
zk_max_file_descriptor_count	18446744073709551615
# highlight-start
zk_followers	2
zk_synced_followers	2
# highlight-end
```

#### Run ClickHouse Server

On each ClickHouse server run
```
sudo service clickhouse-server start
```

#### Verify ClickHouse Server

When you added the [cluster configuration](#define-a-cluster) a single shard replicated across the two ClickHouse nodes was defined.  In this verification step you will check that the cluster was built when ClickHouse was started, and you will create a replicated table using that cluster.
- Verify that the cluster exists:
  ```sql
  show clusters
  ```
  ```response
  ┌─cluster───────┐
  │ cluster_1S_2R │
  └───────────────┘

  1 row in set. Elapsed: 0.009 sec. `
  ```

- Create a table in the cluster using the `ReplicatedMergeTree` table engine:
  ```sql
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
  SETTINGS index_granularity = 8192, storage_policy='s3_main'
  ```
  ```response
  ┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
  │ chnode1 │ 9000 │      0 │       │                   1 │                0 │
  │ chnode2 │ 9000 │      0 │       │                   0 │                0 │
  └─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
  ```
- Understand the use of the macros defined earlier

  The macros `shard`, and `replica` were [defined earlier](#define-a-cluster), and in the highlighted line below you can see where the values are substituted on each ClickHouse node.  Additionally, the value `uuid` is used; `uuid` is not defined in the macros as it is generated by the system.
  ```sql
  SELECT create_table_query
  FROM system.tables
  WHERE name = 'trips'
  FORMAT Vertical
  ```
  ```response
  Query id: 4d326b66-0402-4c14-9c2f-212bedd282c0

  Row 1:
  ──────
  create_table_query: CREATE TABLE default.trips (`trip_id` UInt32, `pickup_date` Date, `pickup_datetime` DateTime, `dropoff_datetime` DateTime, `pickup_longitude` Float64, `pickup_latitude` Float64, `dropoff_longitude` Float64, `dropoff_latitude` Float64, `passenger_count` UInt8, `trip_distance` Float64, `tip_amount` Float32, `total_amount` Float32, `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4))
  # highlight-next-line
  ENGINE = ReplicatedMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
  PARTITION BY toYYYYMM(pickup_date) ORDER BY pickup_datetime SETTINGS index_granularity = 8192, storage_policy = 's3_main'

  1 row in set. Elapsed: 0.012 sec.
  ```
  :::note
  You can customize the zookeeper path `'clickhouse/tables/{uuid}/{shard}` shown above by setting `default_replica_path` and `default_replica_name`.  The docs are [here](/docs/en/operations/server-configuration-parameters/settings.md/#default_replica_path).
  :::

### Testing

These tests will verify that data is being replicated across the two servers, and that it is stored in the S3 Buckets and not on local disk.

- Add data from the New York City taxi dataset:
  ```sql
  INSERT INTO trips
  SELECT trip_id,
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
     FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames') LIMIT 1000000;
  ```
- Verify that data is stored in S3.

  This query shows the size of the data on disk, and the policy used to determine which disk is used.
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
  Query id: af7a3d1b-7730-49e0-9314-cc51c4cf053c

  Row 1:
  ──────
  engine:                          ReplicatedMergeTree
  data_paths:                      ['/var/lib/clickhouse/disks/s3_disk/store/551/551a859d-ec2d-4512-9554-3a4e60782853/']
  metadata_path:                   /var/lib/clickhouse/store/e18/e18d3538-4c43-43d9-b083-4d8e0f390cf7/trips.sql
  storage_policy:                  s3_main
  formatReadableSize(total_bytes): 36.42 MiB

  1 row in set. Elapsed: 0.009 sec.
  ```

  Check the size of data on the local disk.  From above, the size on disk for the millions of rows stored is 36.42 MiB.  This should be on S3, and not the local disk.  The query above also tells us where on local disk data and metadata is stored.  Check the local data:
  ```response
  root@chnode1:~# du -sh /var/lib/clickhouse/disks/s3_disk/store/551
  536K	/var/lib/clickhouse/disks/s3_disk/store/551
  ```

  Check the S3 data in each S3 Bucket (the totals are not shown, but both buckets have approximately 36 MiB stored after the inserts):

  ![size in first S3 bucket](./images/bucket1.png)

  ![size in second S3 bucket](./images/bucket2.png)

