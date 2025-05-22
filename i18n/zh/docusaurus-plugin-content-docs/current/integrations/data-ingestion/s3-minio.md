---
'sidebar_label': 'MinIO'
'sidebar_position': 6
'slug': '/integrations/minio'
'description': '页面说明如何将 MinIO 与 ClickHouse 一起使用'
'title': '使用 MinIO'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# 使用 MinIO

<SelfManaged />

所有 S3 函数和表都与 [MinIO](https://min.io/) 兼容。用户在自托管的 MinIO 存储上可能会体验到更高的吞吐量，尤其是在最佳网络位置的情况下。

带备份的 merge tree 配置也兼容，只需对配置进行一些小的更改：

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
请注意端点标签中的双斜杠，这用于指定存储桶根目录。
:::
