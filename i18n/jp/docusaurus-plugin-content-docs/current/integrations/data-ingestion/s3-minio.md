---
sidebar_label: 'MinIO'
sidebar_position: 6
slug: /integrations/minio
description: 'ClickHouse と組み合わせて MinIO を使用する方法を説明するページ'
title: 'MinIO の使用'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
keywords: ['s3', 'minio', 'object storage', 'data loading', 'compatible storage']
---

# MinIO の使用 \{#using-minio\}

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

すべての S3 関数およびテーブルは [MinIO](https://min.io/) と互換性があります。特にネットワークのローカリティが最適な場合、セルフホストした MinIO ストアでは、より高いスループットが得られる可能性があります。

また、S3 をバックエンドとする MergeTree の構成も、いくつかの小さな設定変更を行うだけで同様に利用できます。

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
`&lt;endpoint&gt;` タグ内の「//」に注意してください。バケットのルートを指すために必要です。
:::
