---
sidebar_label: 'MinIO'
sidebar_position: 6
slug: /integrations/minio
description: '介绍如何将 MinIO 与 ClickHouse 搭配使用的页面'
title: '使用 MinIO'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
keywords: ['s3', 'minio', '对象存储', '数据加载', '兼容存储']
---

# 使用 MinIO

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

所有 `S3` 函数和表都与 [MinIO](https://min.io/) 兼容。在自托管的 MinIO 存储上，用户可能会获得更高的吞吐量，尤其是在网络拓扑位置更优的情况下。

基于 `S3` 的 `MergeTree` 配置同样适用，只需对配置做少量调整即可：

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
请注意 endpoint 标签中的双斜杠，它用于指示 bucket 的根目录。
:::
