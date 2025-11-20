---
'sidebar_label': 'MinIO'
'sidebar_position': 6
'slug': '/integrations/minio'
'description': 'ClickHouse와 함께 MinIO를 사용하는 방법을 설명하는 페이지'
'title': 'MinIO 사용하기'
'doc_type': 'guide'
'integration':
- 'support_level': 'core'
- 'category': 'data_ingestion'
'keywords':
- 's3'
- 'minio'
- 'object storage'
- 'data loading'
- 'compatible storage'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# MinIO 사용하기

<SelfManaged />

모든 S3 기능 및 테이블은 [MinIO](https://min.io/)와 호환됩니다. 사용자는 최적의 네트워크 로컬리티가 있을 경우, 자체 호스팅된 MinIO 스토어에서 더 뛰어난 처리량을 경험할 수 있습니다.

백업된 merge tree 구성도 호환되며, 구성에 몇 가지 사소한 변경이 필요합니다:

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
엔드포인트 태그에 있는 이중 슬래시를 주목하십시오. 이는 버킷 루트를 지정하는 데 필요합니다.
:::
