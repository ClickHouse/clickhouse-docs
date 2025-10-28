---
sidebar_label: 'Using BACKUP and RESTORE'
slug: /cloud/migration/oss-to-cloud-backup-restore
title: 'Migrating between self-managed ClickHouse and ClickHouse Cloud with BACKUP/RESTORE'
description: 'Page describing how to migrate between self-managed ClickHouse and ClickHouse Cloud using BACKUP and RESTORE commands'
doc_type: 'guide'
keywords: ['migration', 'ClickHouse Cloud', 'OSS', 'Migrate self-managed to Cloud', 'BACKUP', 'RESTORE']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Image from '@theme/IdealImage';
import create_service from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/create_service.png';
import service_details from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/service_details.png';
import open_console from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/open_console.png';
import service_role_id from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/service_role_id.png';
import create_new_role from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/create_new_role.png';
import backup_s3_bucket from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/backup_in_s3_bucket.png';

# Migrating from Self-Managed ClickHouse to ClickHouse Cloud Using Backup Commands

## Overview {#overview-migration-approaches}

There are two primary methods to migrate from self-managed ClickHouse (OSS) to ClickHouse Cloud:

- Using the [`remoteSecure()`](/cloud/migration/clickhouse-to-cloud) function in which data is directly pulled/pushed.
- Using `BACKUP`/`RESTORE` commands via cloud object storage

>This migration guide focuses on the `BACKUP`/`RESTORE` approach and offers a practical example
of migrating a database or full service in opensource ClickHouse to Cloud via an S3 bucket.

**Prerequisites**
- You have Docker installed
- You have an [S3 bucket and IAM user](/integrations/s3/creating-iam-user-and-s3-bucket)
- You are able to create a new service ClickHouse Cloud service

To make the steps in this guide easy to follow along with and reproducible, we'll use one of the docker compose recipes
for a 2 shards 2 replicas ClickHouse cluster.

:::note
It is necessary to be using a ClickHouse cluster rather than a single instance as you will need to convert
tables of `MergeTree` engine type to `ReplicatedMergeTree`.
If you are wanting to back up tables from a single instance, consider following the steps
in ["Migrating between self-managed ClickHouse and ClickHouse Cloud using remoteSecure"](/cloud/migration/clickhouse-to-cloud)
:::

## OSS preparation {#setup}

1. Clone the [examples repository](https://github.com/ClickHouse/examples) to your local machine
2. From your terminal cd into `examples/docker-compose-recipes/recipes/cluster_2S_2R`
3. From the root of the `cluster_2S_2R` folder:

Make sure Docker is running. You can now start the ClickHouse cluster:

```bash
docker compose up
```

You should see:

```bash
[+] Running 7/7
 ✔ Container clickhouse-keeper-01  Created  0.1s
 ✔ Container clickhouse-keeper-02  Created  0.1s
 ✔ Container clickhouse-keeper-03  Created  0.1s
 ✔ Container clickhouse-01         Created  0.1s
 ✔ Container clickhouse-02         Created  0.1s
 ✔ Container clickhouse-04         Created  0.1s
 ✔ Container clickhouse-03         Created  0.1s
```

From a new terminal window at the root of the folder run the following command to connect to the first node of the cluster:

```bash
docker exec -it clickhouse-01 clickhouse-client
```

For the purposes of this guide, we'll create one of the tables from our sample datasets.
Follow the first two steps of the [New York taxi data guide](/getting-started/example-datasets/nyc-taxi)

Run the following commands to create a new database and insert data from an S3 bucket into a new table:

```sql
CREATE DATABASE nyc_taxi;

CREATE TABLE nyc_taxi.trips_small (
    trip_id             UInt32,
    pickup_datetime     DateTime,
    dropoff_datetime    DateTime,
    pickup_longitude    Nullable(Float64),
    pickup_latitude     Nullable(Float64),
    dropoff_longitude   Nullable(Float64),
    dropoff_latitude    Nullable(Float64),
    passenger_count     UInt8,
    trip_distance       Float32,
    fare_amount         Float32,
    extra               Float32,
    tip_amount          Float32,
    tolls_amount        Float32,
    total_amount        Float32,
    payment_type        Enum('CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4, 'UNK' = 5),
    pickup_ntaname      LowCardinality(String),
    dropoff_ntaname     LowCardinality(String)
)
ENGINE = MergeTree
PRIMARY KEY (pickup_datetime, dropoff_datetime);
```

```sql
INSERT INTO nyc_taxi.trips_small
SELECT
    trip_id,
    pickup_datetime,
    dropoff_datetime,
    pickup_longitude,
    pickup_latitude,
    dropoff_longitude,
    dropoff_latitude,
    passenger_count,
    trip_distance,
    fare_amount,
    extra,
    tip_amount,
    tolls_amount,
    total_amount,
    payment_type,
    pickup_ntaname,
    dropoff_ntaname
FROM s3(
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_{0..2}.gz',
    'TabSeparatedWithNames'
);
```

In the `CREATE TABLE` DDL statement we specified the table engine type as `MergeTree`, however
ClickHouse Cloud works with [`SharedMergeTree`](/cloud/reference/shared-merge-tree).
When restoring a backup, ClickHouse automatically converts ReplicatedMergeTree to SharedMergeTree, but it is necessary
for us to first convert any `MergeTree` tables to `ReplicatedMergeTree` foe this to work.

Run the following command to `DETACH` the table.

```sql
DETACH TABLE nyc_taxi.trips_small;
```

Then attach it as replicated:

```sql
ATTACH TABLE nyc_taxi.trips_small AS REPLICATED;
```

Finally, restore the replica metadata:

```sql
SYSTEM RESTORE REPLICA nyc_taxi.trips_small;
```

Check that it was converted to `ReplicatedMergeTree`:

```sql
SELECT engine
FROM system.tables
WHERE name = 'trips_small' AND database = 'nyc_taxi';

┌─engine──────────────┐
│ ReplicatedMergeTree │
└─────────────────────┘
```

You are now ready to proceed with setting up your Cloud service in preparation for later
restoring a backup from your S3 bucket.

## Cloud preparation

You will be restoring your data into a new Cloud service.
Follow the steps below to create a new Cloud service.

1. Go to [https://console.clickhouse.cloud/](https://console.clickhouse.cloud/)

2. Create a new service

<Image img={create_service} size="md" alt="create a new service"/> 

3. Choose your desired region and configuration, then click `Create service`

<Image img={service_details} size="md" alt="setup service preferences"/> 

4. Open SQL console

<Image img={open_console} size="md" alt="setup service preferences"/>

Next you will need to create an access role. These steps are detailed in the guide ["Accessing S3 data securely"](/cloud/data-sources/secure-s3).
Follow the steps in that guide to obtain an access role ARN.

In ["How to create an S3 bucket and IAM role"](/integrations/s3/creating-iam-user-and-s3-bucket) you created
a policy for your S3 bucket. You'll now need to add the ARN you obtained in in ["Accessing S3 data securely"](/cloud/data-sources/secure-s3) from the output of the created stack to your bucket policy.

Your updated policy for the S3 bucket will look something like this:

```json
{
    "Version": "2012-10-17",
    "Id": "Policy123456",
    "Statement": [
        {
            "Sid": "abc123",
            "Effect": "Allow",
            "Principal": {
                "AWS": [
#highlight-start                  
                    "arn:aws:iam::123456789123:role/ClickHouseAccess-001",
                    "arn:aws:iam::123456789123:user/docs-s3-user"
#highlight-end                            
                ]
            },
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::ch-docs-s3-bucket",
                "arn:aws:s3:::ch-docs-s3-bucket/*"
            ]
        }
    ]
}
```

Specifying both the user ARN and the ClickHouse Cloud access user role ensures
that you will be able to both backup to the S3 bucket and later restore from it
using the Cloud access role.

## Taking the backup (On OSS)

To make a backup of a single database, run the following command from clickhouse-client
connected to your OSS deployment:

```sql
BACKUP DATABASE nyc_taxi
TO S3(
  'BUCKET_URL',
  'KEY_ID',
  'SECRET_KEY'
)
```

Replace `BUCKET_URL`, `KEY_ID` and `SECRET_KEY` with your own AWS credentials.
The guide ["How to create an S3 bucket and IAM role"](/integrations/s3/creating-iam-user-and-s3-bucket)
shows you how to obtain these if you do not yet have them.

If everything is correctly configured you will see a response similar to the one below
containing a unique id assigned to the backup and the status of the backup.

```response
Query id: efcaf053-75ed-4924-aeb1-525547ea8d45

┌─id───────────────────────────────────┬─status─────────┐
│ e73b99ab-f2a9-443a-80b4-533efe2d40b3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

If you check your previously empty S3 bucket you will now see some folders have appeared:

<Image img={backup_s3_bucket} size="md" alt="backup, data and metadata"/>

If you are performing a full migration then you can run the following command to backup the entire server:

```sql
BACKUP
TABLE system.users,
TABLE system.roles,
TABLE system.settings_profiles,
TABLE system.row_policies,
TABLE system.quotas,
TABLE system.functions,
ALL EXCEPT DATABASES INFORMATION_SCHEMA, information_schema, system
TO S3(
  'BUCKET_ID',
  'KEY_ID',
  'SECRET_ID'
)
SETTINGS
  compression_method='lzma',
  compression_level=3;
```

The command above backups up:
- All user databases and tables
- User accounts and passwords
- Roles and permissions
- Settings profiles
- Row policies
- Quotas
- User-defined functions

If you are using a different CSP, you can use the `TO S3()` (for both AWS and GCP) and `TO AzureBlobStorage()` syntax.

For very large databases, consider using `ASYNC` to run the backup in the background:

```sql
BACKUP DATABASE my_database 
TO S3('https://your-bucket.s3.amazonaws.com/backup.zip', 'key', 'secret')
ASYNC;
       
-- Returns immediately with backup ID
-- Example result:
-- ┌─id──────────────────────────────────┬─status────────────┐
-- │ abc123-def456-789                   │ CREATING_BACKUP   │
-- └─────────────────────────────────────┴───────────────────┘
```

The backup id can then be used to monitor the progress of the backup:

```sql
SELECT * 
FROM system.backups 
WHERE id = 'abc123-def456-789'
```

It is also possible to take incremental backups.
For more detail on backups in general, the reader is referred to the documentation for [backup and restore](/operations/backup).

## Restore to ClickHouse Cloud

To restore a single database run the following query from your Cloud service, substituting your AWS credentials below,
setting `ROLE_ARN` equal to the value which you obtained as output of the steps detailed
in ["Accessing S3 data securely"](/cloud/data-sources/secure-s3)

```sql
RESTORE DATABASE nyc_taxi
FROM S3(
    'BUCKET_URL',
    extra_credentials(role_arn = 'ROLE_ARN')
)
```

You can do a full service restore in a similar manner:

```sql
RESTORE
    TABLE system.users,
    TABLE system.roles,
    TABLE system.settings_profiles,
    TABLE system.row_policies,
    TABLE system.quotas,
    ALL EXCEPT DATABASES INFORMATION_SCHEMA, information_schema, system
FROM S3(
    'BUCKET_URL',
    extra_credentials(role_arn = 'ROLE_ARN')
)
```

If you now run the following query in Cloud you can see that the database and table have been
successfully restored on Cloud:

```sql
SELECT count(*) FROM nyc_taxi.trips_small;
3000317
```
