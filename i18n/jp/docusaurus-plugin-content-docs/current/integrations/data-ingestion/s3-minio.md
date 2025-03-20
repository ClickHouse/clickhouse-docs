---
sidebar_label: MinIO
sidebar_position: 6
slug: /integrations/minio
description: MinIOの使用
---


# MinIOの使用

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

すべてのS3機能とテーブルは[MinIO](https://min.io/)と互換性があります。ユーザーは、最適なネットワークローカリティがある場合、セルフホストされたMinIOストアで優れたスループットを体験するかもしれません。

また、マージツリーの設定も、一部の構成変更を行うことで互換性があります：

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
エンドポイントタグの二重スラッシュに注意してください。これはバケットのルートを指定するために必要です。
:::
