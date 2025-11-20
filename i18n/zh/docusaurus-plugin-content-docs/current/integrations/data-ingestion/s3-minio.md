---
sidebar_label: 'MinIO'
sidebar_position: 6
slug: /integrations/minio
description: '说明如何将 MinIO 与 ClickHouse 搭配使用的页面'
title: '使用 MinIO'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
keywords: ['s3', 'minio', 'object storage', 'data loading', 'compatible storage']
---

# 使用 MinIO

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

所有 `S3` 函数和表都与 [MinIO](https://min.io/) 兼容。用户在自托管的 MinIO 存储上可能会获得更高的吞吐量，尤其是在网络局部性良好的情况下。

基于 `MergeTree` 的后端存储配置同样兼容，但在配置上需要进行一些小的调整：

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
请注意 endpoint 标记中的双斜杠，它是用于指示 bucket 根目录所必需的。
:::
