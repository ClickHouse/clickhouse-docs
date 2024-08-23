---
sidebar_label: Using MinIO
sidebar_position: 6
slug: /en/integrations/minio
description: Using MinIO
---

# Using MinIO

import SelfManaged from '@site/docs/en/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />


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

:::tip
Note the double slash in the endpoint tag, this is needed to designate the bucket root.
:::
