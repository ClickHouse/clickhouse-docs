---
sidebar_label: 'MinIO'
sidebar_position: 6
slug: /integrations/minio
description: 'ClickHouse で MinIO を使用する方法について説明するページ'
title: 'MinIO の利用'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
keywords: ['s3', 'minio', 'object storage', 'data loading', 'compatible storage']
---

# MinIO の利用

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

すべての S3 関数およびテーブルは [MinIO](https://min.io/) と互換性があります。特にネットワークのローカリティが最適な場合、セルフホスト型の MinIO ストアでは、より高いスループットが得られることがあります。

また、オブジェクトストレージをバックエンドに利用する MergeTree の設定も、設定にいくつか小さな変更が必要になる点を除けば、互換性があります。

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
エンドポイントタグ内の二重スラッシュに注意してください。これはバケットのルートを示すために必要です。
:::
