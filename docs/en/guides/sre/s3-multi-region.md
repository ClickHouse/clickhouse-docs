---
sidebar_label: Replicating a single shard across two AWS regions using S3 Object Storage
---

# Replicating a single shard across two AWS regions using S3 Object Storage

- [Deploy ClickHouse](#deploy-clickhouse)
- [Configure ClickHouse Keeper](#configure-clickhouse-keeper)
- [Create S3 Buckets](#create-s3-buckets)
- [Define a cluster](#define-a-cluster)
- [Configure networking](#configure-networking)
- [Testing](#testing)

## Deploy ClickHouse

Deploy ClickHouse on three hosts, in the sample configurations these are named `chnode1`, `chnode2`, and `keepernode1`.  `chnode1` and `chnode2` run ClickHouse and ClickHouse Keeper.  `keepernode1` is only running ClickHouse Keeper.

Place `chnode1` in one AWS region, and `chnode2` in a second.  `keepernode1` can be placed in either of the two regions, maybe in a different availability zone within the region?

## Configure ClickHouse Keeper

ClickHouse Keeper is configured by adding a file to `/etc/clickhouse-server/config.d/` to override the default ClickHouse configuration.  All three servers use the same configuration with one setting different; `<server_id>` in the `<keeper_server>` section must match the `<server>` in the `<raft_configuration>`.  See the highlighted lines below.

```xml title="/etc/clickhouse-server/config.d/enable-keeper.xml"
<clickhouse>
    <keeper_server>
        <tcp_port>9181</tcp_port>
	<!--highlight-next-line-->
        <server_id>1</server_id>
        <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
        <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

        <coordination_settings>
            <operation_timeout_ms>10000</operation_timeout_ms>
            <session_timeout_ms>30000</session_timeout_ms>
            <raft_logs_level>warning</raft_logs_level>
        </coordination_settings>

        <raft_configuration>
	<!--highlight-start-->
            <server>
                <id>1</id>
	<!--highlight-end-->
                <hostname>chnode1</hostname>
                <port>9444</port>
            </server>
            <server>
                <id>2</id>
                <hostname>chnode2</hostname>
                <port>9444</port>
            </server>
            <server>
                <id>3</id>
                <hostname>keepernode1</hostname>
                <port>9444</port>
            </server>
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

## Create S3 Buckets

Creating S3 buckets is covered in the guide [use S3 Object Storage as a ClickHouse disk](./configuring-s3-for-clickhouse-use.md). Create two S3 buckets, one in each of the regions that you have placed `chnode1` and `chnode2`.  The configuration files will then be placed in `/etc/clickhouse-server/config.d/`.  Here is a sample configuration file for one bucket, the other is similar with the three highlighted lines differing:

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
           <cache_enabled>true</cache_enabled>
           <data_cache_enabled>true</data_cache_enabled>
           <cache_path>/var/lib/clickhouse/disks/s3_disk/cache/</cache_path>
         </s3_disk>
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

I have not implemented this yet on my test system, this is related to the replication of metadata.

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
   <merge_tree>
        <allow_remote_fs_zero_copy_replication>false</allow_remote_fs_zero_copy_replication>
   </merge_tree>
</clickhouse>
```

## Define a cluster

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

When working with clusters it is handy to define macros that populate DDL queries with the cluster, shard, ??? settings.  This sample allows you to write ..... (give example DDL using `{cluster}` etc.)

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

ClickHouse Keeper is responsible for coordinating the replication of data across the ClickHouse nodes.  To inform ClickHouse about the ClickHouse Keeper nodes add a configuration file to each of the ClickHouse nodes.

```xml title="/etc/clickhouse-server/config.d/use_keeper.xml"
<clickhouse>
    <zookeeper>
        <node index="1">
            <host>chnode1</host>
            <port>9181</port>
        </node>
        <node index="2">
            <host>chnode2</host>
            <port>9181</port>
        </node>
        <node index="3">
            <host>keepernode1</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```

## Configure networking

All three servers must listen for network connections so that they can communicate between the servers and with S3.  This is configured in `/etc/clickhouse-server/config.d/`.  Here is a sample that configures ClickHouse and ClickHouse Keeper to listen on all IP v4 interfaces.  see the documentation or the default configuration file `/etc/clickhouse/config.xml` for more information.

```xml title="/etc/clickhouse-server/config.d/networking.xml"
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

## Testing

To do

- Create a table that is replicated and uses the S3 storage
- Add data
- Verify that data is stored in S3
- Shutdown one S3 bucket?
- verify data avaialability
