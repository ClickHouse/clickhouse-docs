---
sidebar_label: 'MinIO'
sidebar_position: 6
slug: /integrations/minio
description: 'ClickHouse와 함께 MinIO를 사용하는 방법을 설명하는 페이지'
title: 'MinIO 사용 방법'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
keywords: ['s3', 'minio', '객체 스토리지', '데이터 적재', '호환 스토리지']
---

# MinIO 사용 \{#using-minio\}

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

모든 S3 함수와 테이블은 [MinIO](https://min.io/)와 호환됩니다. 특히 네트워크 위치가 최적화된 자체 호스팅 MinIO 스토어에서는 더 높은 처리량을 기대할 수 있습니다.

또한 S3를 백엔드로 사용하는 MergeTree 구성 역시, 일부 설정만 약간 변경하면 호환됩니다:

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
endpoint 태그의 이중 슬래시에 유의하십시오. 버킷 루트를 지정하는 데 필요합니다.
:::
