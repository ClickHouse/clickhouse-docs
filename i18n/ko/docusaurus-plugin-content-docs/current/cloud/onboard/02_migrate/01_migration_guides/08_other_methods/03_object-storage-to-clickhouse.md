---
'title': '객체 스토리지 사용하기'
'description': '객체 스토리지에서 ClickHouse Cloud로 데이터 이동하기'
'keywords':
- 'object storage'
- 's3'
- 'azure blob'
- 'gcs'
- 'migration'
'slug': '/integrations/migration/object-storage-to-clickhouse'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import object_storage_01 from '@site/static/images/integrations/migration/object-storage-01.png';


# 클라우드 오브젝트 스토리지에서 ClickHouse Cloud로 데이터 이동

<Image img={object_storage_01} size='md' alt='셀프 관리 ClickHouse 마이그레이션' background='white' />

클라우드 오브젝트 스토리지를 데이터 레이크로 사용하고 있으며 이 데이터를 ClickHouse Cloud로 가져오려는 경우, 또는 현재 사용 중인 데이터베이스 시스템이 클라우드 오브젝트 스토리지에 직접 데이터를 오프로드할 수 있는 경우, 다음 중 하나의 테이블 함수를 사용하여 클라우드 오브젝트 스토리지에 저장된 데이터를 ClickHouse Cloud 테이블로 마이그레이션할 수 있습니다:

- [s3](/sql-reference/table-functions/s3.md) 또는 [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
- [gcs](/sql-reference/table-functions/gcs)
- [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

현재 사용 중인 데이터베이스 시스템이 클라우드 오브젝트 스토리지에 직접 데이터를 오프로드할 수 없는 경우, [타사 ETL/ELT 도구](/cloud/migration/etl-tool-to-clickhouse) 또는 [clickhouse-local](/cloud/migration/clickhouse-local)을 사용하여 현재 데이터베이스 시스템에서 클라우드 오브젝트 스토리지로 데이터를 이동하고, 그 데이터를 두 번째 단계로 ClickHouse Cloud 테이블로 마이그레이션할 수 있습니다.

이 과정은 두 단계(클라우드 오브젝트 스토리지에 데이터 오프로드, 그 다음 ClickHouse로 로드)지만, 장점은 [강력한 ClickHouse Cloud](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)가 클라우드 오브젝트 스토리지에서의 고도로 병렬화된 읽기를 지원하기 때문에 페타바이트 규모로 확장 가능하다는 것입니다. 또한 [Parquet](/interfaces/formats/Parquet)와 같은 정교하고 압축된 형식을 활용할 수 있습니다.

데이터를 S3를 사용하여 ClickHouse Cloud로 가져오는 방법에 대한 구체적인 코드 예제가 포함된 [블로그 기사](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)가 있습니다.
