---
sidebar_label: 'MinIO'
sidebar_position: 6
slug: /integrations/minio
description: '介绍如何在 ClickHouse 中使用 MinIO 的页面'
title: '使用 MinIO'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
keywords: ['s3', 'minio', '对象存储', '数据加载', '兼容存储']
---

# 使用 MinIO \{#using-minio\}

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

所有 S3 函数和表都与 [MinIO](https://min.io/) 兼容。在自托管的 MinIO 存储上，用户通常可以获得更高的吞吐量，尤其是在网络拓扑与存储部署位置高度贴近时。

基于对象存储的 MergeTree 配置同样可以兼容使用，只需在配置中进行少量修改即可：

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
请注意 `endpoint` 标签中的双斜杠，这是用于指定 bucket 根目录所必需的。
:::
