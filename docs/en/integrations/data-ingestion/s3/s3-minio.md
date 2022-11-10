---
sidebar_label: Using MinIO
sidebar_position: 6
slug: /en/integrations/s3/s3-minio
description: Using MinIO
---

# Using MinIO

All S3 functions and tables and compatible with [MinIO](https://min.io/). Users may experience superior throughput on self-hosted MinIO stores, especially in the event of optimal network locality.

Also backed merge tree configuration is compatible too, with some minor changes in configuration:

```xml
<clickhouse>
    <storage_configuration>
        ...
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>https://min.io/tables//</endpoint>
                <access_key_id>your_access_key_id</access_key_id>
                <secret_access_key>your_secret_access_key</secret_access_key>
                <region></region>
                <metadata_path>/var/lib/clickhouse/disks/s3/</metadata_path>
                <cache_enabled>true</cache_enabled>
            <data_cache_enabled>true</data_cache_enabled>   
                <cache_path>/var/lib/clickhouse/disks/s3/cache/</cache_path>
            </s3>
        </disks>
        ...
    </storage_configuration>
</clickhouse>
```

:::warning 

Note the double slash in the endpoint tag, needed to designate the bucket root.

:::