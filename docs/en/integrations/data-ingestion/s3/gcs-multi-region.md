---
slug: /en/guides/sre/gcs-storage
sidebar_label: Using Google Cloud Storage (GCS)
---

# Using Google Cloud Storage (GCS)

import SelfManaged from '@site/docs/en/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

## Plan the deployment
This tutorial is based on deploying one ClickHouse server node in Google Cloud, and one GCS bucket.  Both of these are in the same region.

## Install software

### ClickHouse server nodes
Refer to the [installation instructions](/docs/en/getting-started/install.md/#available-installation-options) when performing the deployment steps on the ClickHouse server nodes and ClickHouse Keeper nodes.

### Deploy ClickHouse

Deploy ClickHouse on two hosts, in the sample configurations these are named `chnode1`, `chnode2`.

Place `chnode1` in one GCP region, and `chnode2` in a second.  In this guide `us-east1` and `us-east4` are used for the compute engine VMs, and also for GCS buckets.

### Deploy ClickHouse Keeper

Deploy ClickHouse Keeper on three hosts, in the sample configurations these are named `keepernode1`, `keepernode2`, and `keepernode3`.  `keepernode1` can be deployed in the same region as `chnode1`, `keepernode2` with `chnode2`, and `keepernode3` in either region, but in a different availability zone from the ClickHouse node in that region.

:::note
ClickHouse Keeper is installed in the same way as ClickHouse, as it can be run with ClickHouse server, or standalone.  Running Keeper standalone gives more flexibility when scaling out or upgrading.
:::

Once you deploy ClickHouse on the three Keeper nodes run these commands to prep the directories for configuration and operation in standalone mode:

```bash
sudo mkdir /etc/clickhouse-keeper
sudo chown clickhouse:clickhouse /etc/clickhouse-keeper
sudo chmod 700 /etc/clickhouse-keeper
sudo mkdir -p /var/lib/clickhouse/coordination
sudo chown -R clickhouse:clickhouse /var/lib/clickhouse
```

## Create two buckets

The two ClickHouse servers will be located in different regions for high availability.  Each will have a GCS bucket in the same region.

In **Cloud Storage > Buckets** choose **CREATE BUCKET**. For this tutorial two buckets are created, one in each of `us-east1` and `us-east4`.  The buckets are single region, standard storage class, and not public.  Each bucket has a folder named for the region and a ClickHouse replica.

### ch_bucket_us_east1 with folder south_carolina_replica

![Add a bucket](@site/docs/en/integrations/data-ingestion/s3/images/GCS-bucket-and-folder-1.png)

### ch_bucket_us_east4 with folder northern_virginia_replica

![Add a bucket](@site/docs/en/integrations/data-ingestion/s3/images/GCS-bucket-and-folder-2.png)

## Generate an Access key 

### Create a service account HMAC key and secret

Open **Cloud Storage > Settings > Interoperability** and either choose an existing **Access key**, or **CREATE A KEY FOR A SERVICE ACCOUNT**.  This guide covers the path for creating a new key for a new service account.

![Add a bucket](@site/docs/en/integrations/data-ingestion/s3/images/GCS-create-a-service-account-key.png)

### Add a new service account

If this is a project with no existing service account, **CREATE NEW ACCOUNT**.

![Add a bucket](@site/docs/en/integrations/data-ingestion/s3/images/GCS-create-service-account-0.png)

There are three steps to creating the service account, in the first step give the account a meaningful name, ID, and description.

![Add a bucket](@site/docs/en/integrations/data-ingestion/s3/images/GCS-create-service-account-a.png)

In the Interoperability settings dialog the IAM role **Storage Object Admin** role is recommended; select that role in step two.

![Add a bucket](@site/docs/en/integrations/data-ingestion/s3/images/GCS-create-service-account-2.png)

Step three is optional and not used in this guide.  You may allow users to have these privileges based on your policies.

![Add a bucket](@site/docs/en/integrations/data-ingestion/s3/images/GCS-create-service-account-3.png)

The service account HMAC key will be displayed.  Save this information, as it will be used in the ClickHouse configuration.

![Add a bucket](@site/docs/en/integrations/data-ingestion/s3/images/GCS-guide-key.png)


## Configure ClickHouse

:::note best practice
Some of the steps in this guide will ask you to place a configuration file in `/etc/clickhouse-server/config.d/`.  This is the default location on Linux systems for configuration override files.  When you put these files into that directory ClickHouse will merge the content with the default configuration.  By placing these files in the `config.d` directory you will avoid losing your configuration during an upgrade.
:::

### Networking
By default, ClickHouse listens on the loopback interface, in a replicated setup networking between machines is necessary.  Listen on all interfaces:

```xml title=/etc/clickhouse-server/config.d/network.xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

### Remote ClickHouse Keeper servers

Replication is coordinated by ClickHouse Keeper.  This configuration file identifies the ClickHouse Keeper nodes by hostname and port number.

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


### Remote ClickHouse servers

This file configures the hostname and port of each ClickHouse server in the cluster.  The default configuration file contains sample cluster definitions, in order to show only the clusters that are completely configured the tag `replace="true"` is added to the `remote_servers` entry so that when this configuration is merged with the default it replaces the `remote_servers` section instead of adding to it.

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

### Replica identification

This file configures settings related to the ClickHouse Keeper path.  Specifically the macros used to identify which replica the data is part of.  On one server the replica should be specified as `replica_1`, and on the other server `replica_2`.  The names can be changed, based on our example of one replica being stored in South Carolina and the other in Northern Virginia the values could be `carolina` and `virginia`; just make sure that they are different on each machine.

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

### Storage in GCS
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
                <cache_enabled>true</cache_enabled>
                <data_cache_enabled>true</data_cache_enabled>
                <cache_path>/var/lib/clickhouse/disks/gcs/cache/</cache_path>
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

## Start ClickHouse Keeper

```bash
--daemon
```
### Check ClickHouse Keeper status

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


## Start ClickHouse server

## Verification

### Verify ClickHouse Server

### Verify in Google Cloud Console

