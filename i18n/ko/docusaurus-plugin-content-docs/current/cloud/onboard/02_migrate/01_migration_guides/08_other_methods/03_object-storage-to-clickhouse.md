---
title: '객체 스토리지 사용하기'
description: '객체 스토리지에서 ClickHouse Cloud로 데이터 이동하기'
keywords: ['객체 스토리지', 'S3', 'azure blob', 'gcs', '마이그레이션']
slug: /integrations/migration/object-storage-to-clickhouse
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import object_storage_01 from '@site/static/images/integrations/migration/object-storage-01.png';

# 클라우드 객체 스토리지에서 ClickHouse Cloud로 데이터 이동 \{#move-data-from-cloud-object-storage-to-clickhouse-cloud\}

<Image img={object_storage_01} size="md" alt="자가 관리형 ClickHouse 마이그레이션" />

클라우드 객체 스토리지를 데이터 레이크(data lake)로 사용 중이며 이 데이터를 ClickHouse Cloud로 가져오려는 경우,
또는 현재 사용 중인 데이터베이스 시스템이 데이터를 클라우드 객체 스토리지로 직접 오프로딩(offload)할 수 있다면,
클라우드 객체 스토리지에 저장된 데이터를 ClickHouse Cloud 테이블로 마이그레이션하기 위해 다음 테이블 함수 중 하나를 사용할 수 있습니다:

* [s3](/sql-reference/table-functions/s3.md) 또는 [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
* [gcs](/sql-reference/table-functions/gcs)
* [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

현재 사용 중인 데이터베이스 시스템이 클라우드 객체 스토리지로 데이터를 직접 오프로딩할 수 없다면,
[타사 ETL/ELT 도구](/cloud/migration/etl-tool-to-clickhouse)나 [clickhouse-local](/cloud/migration/clickhouse-local)을 사용하여
현재 데이터베이스 시스템의 데이터를 먼저 클라우드 객체 스토리지로 이동한 뒤,
두 번째 단계에서 이 데이터를 ClickHouse Cloud 테이블로 마이그레이션할 수 있습니다.

이 방식은 (데이터를 클라우드 객체 스토리지로 오프로딩한 뒤 ClickHouse로 적재하는) 2단계 과정이지만,
[강력한 ClickHouse Cloud](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)의 클라우드 객체 스토리지에 대한 고도로 병렬화된 읽기 지원 덕분에
페타바이트 규모까지 확장할 수 있다는 장점이 있습니다.
또한 [Parquet](/interfaces/formats/Parquet)과 같이 정교하고 압축된 포맷을 활용할 수 있습니다.

S3를 사용하여 데이터를 ClickHouse Cloud로 가져오는 방법을 구체적인 코드 예제와 함께 보여주는
[블로그 글](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)이 있습니다.