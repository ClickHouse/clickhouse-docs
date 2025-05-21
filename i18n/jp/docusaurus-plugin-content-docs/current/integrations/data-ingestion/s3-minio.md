---
sidebar_label: 'MinIO'
sidebar_position: 6
slug: /integrations/minio
description: 'Page describing how to use MinIO with ClickHouse'
title: 'MinIOの使用'
---


# MinIOの使用

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

すべての S3 関数とテーブルは [MinIO](https://min.io/) と互換性があります。ユーザーは、特に最適なネットワークローカリティがある場合、セルフホスティングされた MinIO ストアで優れたスループットを体験するかもしれません。

また、バックアップされた MergeTree 構成も互換性がありますが、いくつかの設定での軽微な変更が必要です：

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
エンドポイントタグの二重スラッシュに注意してください。これはバケットルートを指定するために必要です。
:::
