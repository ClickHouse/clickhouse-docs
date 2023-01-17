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

## Creating a Disk

To utilize a GCS bucket as a disk, we must first declare it within the ClickHouse configuration in a file under `conf.d`. An example of a GCS disk declaration is shown below:

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
                <endpoint>https://storage.googleapis.com/BUCKET NAME/FOLDER NAME/</endpoint>
                <access_key_id>SERVICE ACCOUNT HMAC KEY</access_key_id>
                <secret_access_key>SERVICE ACCOUNT HMAC SECRET</secret_access_key>
                <metadata_path>/var/lib/clickhouse/disks/gcs/</metadata_path>
                <cache_enabled>true</cache_enabled>
                <data_cache_enabled>true</data_cache_enabled>
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

Assuming you have configured your disk to use a bucket with write access, you should be able to create a table such as in the example below. For purposes of brevity, we use a subset of the NYC taxi columns and stream data directly to the GCS-backed table:

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


## Learn More

The [Cloud Storage XML API](https://cloud.google.com/storage/docs/xml-api/overview) is interoperable with some tools and libraries that work with services such as Amazon Simple Storage Service (Amazon S3).

For further information on tuning threads, see [Optimizing for Performance](/docs/en/integrations/data-ingestion/s3/s3-optimizing-performance.md).
