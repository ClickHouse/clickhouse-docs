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

