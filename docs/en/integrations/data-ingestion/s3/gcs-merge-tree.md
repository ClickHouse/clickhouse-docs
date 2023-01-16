---
sidebar_label: GCS Backed MergeTree
sidebar_position: 4
slug: /en/integrations/s3/gcs-merge-tree
description: "Google Cloud Storage (GCS) Backed MergeTree"
---

# GCS Backed MergeTree

import SelfManaged from '@site/docs/en/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouse recognizes that GCS represents an attractive storage solution for users seeking to separate storage and compute. To help achieve this, support is provided for using GCS as the storage for a MergeTree engine. This will enable users to exploit the scalability and cost benefits of GCS, and the insert and query performance of the MergeTree engine.

## Storage Tiers

ClickHouse storage volumes allow physical disks to be abstracted from the MergeTree table engine. Any single volume can be composed of an ordered set of disks. Whilst principally allowing multiple block devices to be potentially used for data storage, this abstraction also allows other storage types, including GCS. ClickHouse data parts can be moved between volumes and fill rates according to storage policies, thus creating the concept of storage tiers.

Storage tiers unlock hot-cold architectures where the most recent data, which is typically also the most queried, requires only a small amount of space on high-performing storage, e.g., NVMe SSDs. As the data ages, SLAs for query times increase, as does query frequency. This fat tail of data can be stored on slower, less performant storage such as HDD or object storage such as GCS.

## Creating a Disk

To utilize a GCS bucket as a disk, we must first declare it within the ClickHouse configuration in a file under conf.d. An example of a GCS disk declaration is shown below:

:::note
GCS buckets are accessed through Google's Cloud Storage XML API, which is compatible with Amazon S3. In ClickHouse storage configurations GCS buckets are of type `s3`.
:::

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <gcs>
                <support_batch_delete>false</support_batch_delete>
                <type>s3</type>
                <endpoint>https://storage.googleapis.com/ch_bucket_us_sc/clickhouse-us-east/</endpoint>
                <access_key_id>GOOGKTIYQSXUKPE4GYXOIJ4M</access_key_id>
                <secret_access_key>iObDSXnXcLsBLSlizohM+YM/sjKQbUHHEViUcrlo</secret_access_key>
                <metadata_path>/var/lib/clickhouse/disks/gcs/</metadata_path>
                <cache_enabled>true</cache_enabled>
                <data_cache_enabled>true</data_cache_enabled>
                <enable_filesystem_cache>true</enable_filesystem_cache>
                <enable_filesystem_cache_on_write_operations>true</enable_filesystem_cache_on_write_operations>
                <cache_path>/var/lib/clickhouse/disks/gcs/cache/</cache_path>
            </gcs>
        </disks>
    </storage_configuration>
</clickhouse>
```

A complete list of settings relevant to this disk declaration can be found [here](/docs/en/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3).

## Creating a Storage Policy

Once configured, this "disk" can be used by a storage volume declared within a policy. For the example below, we assume disk `gcs` is our only storage other than the default disk configured in `/etc/clickhouse-server/config.xml` which, by default, is a local disk. This ignores more complex hot-cold architectures where data can be relocated based on TTLs and fill rates.

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <gcs>
            ...
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

## Creating a table

Assuming you have configured your disk to use a bucket with write access, you should be able to create a table such as in the example below. For purposes of brevity, we use a subset of the NYC taxi columns and stream data directly to the GCS backed table:

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
SETTINGS storage_policy='gcs_main'
```

```sql
INSERT INTO trips_gcs SELECT trip_id, pickup_date, pickup_datetime, dropoff_datetime, pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude, passenger_count, trip_distance, tip_amount, total_amount, payment_type FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames') LIMIT 1000000;
```

Depending on the hardware, this latter insert of 1m rows may take a few minutes to execute. You can confirm the progress via the system.processes table. Feel free to adjust the row count up to the limit of 10m and explore some sample queries.

```sql
SELECT passenger_count, avg(tip_amount) as avg_tip, avg(total_amount) as avg_amount FROM trips_gcs GROUP BY passenger_count;
```

## Handling Replication

Replication with GCS disks can be accomplished by using the `ReplicatedMergeTree` table engine.  See the [replicating a single shard across two GCP regions using GCS](/docs/en/integrations/data-ingestion/s3/gcs-multi-region.md) guide for details.

## Internals

## Read & Writes

The following notes cover the implementation of GCS interactions with ClickHouse. Whilst generally only informative, it may help the readers when [Optimizing for Performance](./s3-optimizing-performance):

* By default, the maximum number of query processing threads used by any stage of the query processing pipeline is equal to the number of cores. Some stages are more parallelizable than others, so this value provides an upper bound.  Multiple query stages may execute at once since data is streamed from the disk. The exact number of threads used for a query may thus exceed this. Modify through the setting [max_threads](/docs/en/operations/settings/settings.md/#settings-max_threads).
* Reads on GCS are asynchronous by default. This behavior is determined by setting `remote_filesystem_read_method`, set to the value `threadpool` by default. When serving a request, ClickHouse reads granules in stripes. Each of these stripes potentially contains many columns. A thread will read the columns for their granules one by one. Rather than doing this synchronously, a prefetch is made for all columns before waiting for the data. This offers significant performance improvements over synchronous waits on each column. Users will not need to change this setting in most cases - see [Optimizing for Performance](./s3-optimizing-performance).
* For the s3 function and table, parallel downloading is determined by the values `max_download_threads` and `max_download_buffer_size`. Files will only be downloaded in parallel if their size is greater than the total buffer size combined across all threads. This is only available on versions > 22.3.1.
* Writes are performed in parallel, with a maximum of 100 concurrent file-writing threads. `max_insert_delayed_streams_for_parallel_write`, which has a default value of 1000, controls the number of GCS blobs written in parallel. Since a buffer is required for each file being written (~1MB), this effectively limits the memory consumption of an INSERT. It may be appropriate to lower this value in low server memory scenarios.


For further information on tuning threads, see [Optimizing for Performance](./s3-optimizing-performance).

Important: as of 22.3.1, there are two settings to enable the cache `data_cache_enabled` and `enable_filesystem_cache`. We recommend setting both of these 1 to enable the new cache behavior described, which supports the eviction of index files. To disable the eviction of index and mark files from the cache, we also recommend setting `cache_enabled` to `true`.

To accelerate reads, GCS files are cached on the local filesystem by breaking files into segments. Any contiguous read segments are saved in the cache, with overlapping segments reused. Later versions will optionally allow writes resulting from INSERTs or merges to be stored in the cache via the option `enable_filesystem_cache_on_write_operations`. Where possible, the cache is reused for file reads. ClickHouse’s linear reads lend themselves to this caching strategy. Should a contiguous read result in a cache miss, the segment is downloaded and cached. Eviction occurs on an LRU basis per segment. The removal of a file also causes its removal from the cache. The setting `read_from_cache_if_exists_otherwise_bypass_cache` can be set to 1 for specific queries which you know are not cache efficient. These queries might be known to be unfriendly to the cache and result in heavy evictions.

The metadata for the cache (entries and last used time) is held in memory for fast access. On restarts of ClickHouse, this metadata is reconstructed from the files on disk with the loss of the last used time. In this case, the value is set to 0, causing random eviction until the values are fully populated.

The max cache size can be specified in bytes through the setting `data_cache_max_size`. This defaults to 1GB (subject to change). Index and mark files can be evicted from the cache. The FS page cache can efficiently cache all files.

Enabling the cache can speed up first-time queries for which the data is not resident in the cache. If a query needs to re-access data that has been cached as part of its execution, the fs page cache can be utilized - thus avoiding re-reads from GCS.

Finally, merges on data residing in GCS are potentially a performant bottleneck if not performed intelligently. Cached versions of files minimize merges performed directly on the remote storage.

## Learn More

### Google's Interoperability API
The [Cloud Storage XML API](https://cloud.google.com/storage/docs/xml-api/overview) is interoperable with some tools and libraries that work with services such as Amazon Simple Storage Service (Amazon S3).
