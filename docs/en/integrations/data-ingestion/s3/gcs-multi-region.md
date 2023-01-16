---
slug: /en/guides/sre/gcs-storage
sidebar_label: Using Google Cloud Storage (GCS)
---

# Using Google Cloud Storage (GCS)

import SelfManaged from '@site/docs/en/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

## Plan the deployment
This tutorial is based on deploying one ClickHouse server node in Google Cloud, and one GCS bucket.  Both of these are in the same region.

## Create two buckets

The two ClickHouse servers will be located in different regions for high availability.  Each will have a GCS bucket in the same region.

In **Cloud Storage > Buckets** choose **CREATE BUCKET**.
![Add a bucket](@site/docs/en/integrations/data-ingestion/s3/images/GCS-bucket-folder.png)

## Generate an Access key 

### Create a service account HMAC key and secret

Open **Cloud Storage > Settings > Interoperability** and either choose an existing **Access key**, or **CREATE A KEY**
![Add a service account HMAC secret](@site/docs/en/integrations/data-ingestion/s3/images/GCS-HMAC-service-account.png)

If you create a new key, save the Access key and Secret, they will be used in the ClickHouse configuration.

![Add a service account HMAC secret](@site/docs/en/integrations/data-ingestion/s3/images/GCS-new-key.png)

### Assign the necessary IAM role

In the Interoperability settings dialog the IAM role **Storage Object Admin** role is recommended.

![Add a service account HMAC secret](@site/docs/en/integrations/data-ingestion/s3/images/GCS-service-account-storage-admin.png)

## Install software

Refer to the [installation instructions](/docs/en/getting-started/install/) when performing the deployment steps.

### Configure ClickHouse

Add a storage configuration in `/etc/clickhouse-server/config.d`
```xml title=/etc/clickhouse-server/config.d/gcs_storage.xml
<clickhouse>
    <storage_configuration>
        <disks>
            <gcs>
                <support_batch_delete>false</support_batch_delete>
                <type>s3</type>
                <endpoint>https://storage.googleapis.com/YOUR BUCKET/YOUR FOLDER/</endpoint>
                <access_key_id>YOUR HMAC KEY ID</access_key_id>
                <secret_access_key>YOUR HMAC SECRET</secret_access_key>
                <metadata_path>/var/lib/clickhouse/disks/gcs/</metadata_path>
                <cache_enabled>true</cache_enabled>
                <data_cache_enabled>true</data_cache_enabled>
                <cache_path>/var/lib/clickhouse/disks/gcs/cache/</cache_path>
            </gcs>
        </disks>
        <policies>
            <gcs_storage>
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

:::note
Some of the steps in this guide will ask you to place a configuration file in `/etc/clickhouse-server/config.d/`.  This is the default location on Linux systems for configuration override files.  When you put these files into that directory ClickHouse will merge the content with the default configuration.  By placing these files in the `config.d` directory you will avoid losing your configuration during an upgrade.
:::

## Start ClickHouse

## Verification

### Verify ClickHouse Server

### Verify in Google Cloud Console

