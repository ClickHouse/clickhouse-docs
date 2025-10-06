---
'sidebar_label': 'MinIO'
'sidebar_position': 6
'slug': '/integrations/minio'
'description': 'ClickHouseとMinIOの使い方を説明するページ'
'title': 'MinIOの使用'
'doc_type': 'guide'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# MinIOの使用

<SelfManaged />

すべてのS3機能およびテーブルは[MinIO](https://min.io/)と互換性があります。特にネットワークの最適化が行われた場合、ユーザーはセルフホストされたMinIOストアで優れたスループットを体験するかもしれません。

また、バックアップされたMergeTreeの設定も、設定の若干の変更により互換性があります。

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
エンドポイントタグ内の二重スラッシュに注意してください。これはバケットのルートを指定するために必要です。
:::
