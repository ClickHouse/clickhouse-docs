---
'slug': '/faq/operations/deploy-separate-storage-and-compute'
'title': 'ClickHouse를 스토리지와 컴퓨트를 분리하여 배포할 수 있습니까?'
'sidebar_label': 'ClickHouse를 스토리지와 컴퓨트를 분리하여 배포할 수 있습니까?'
'toc_hidden': true
'toc_priority': 20
'description': '이 페이지는 ClickHouse를 스토리지와 컴퓨트를 분리하여 배포할 수 있는지에 대한 답변을 제공합니다.'
'doc_type': 'guide'
'keywords':
- 'storage'
- 'disk configuration'
- 'data organization'
- 'volume management'
- 'storage tiers'
---

짧은 대답은 "예"입니다.

객체 저장소(S3, GCS)는 ClickHouse 테이블의 데이터에 대한 탄력적인 기본 저장소 백엔드로 사용할 수 있습니다. [S3 기반 MergeTree](/integrations/data-ingestion/s3/index.md) 및 [GCS 기반 MergeTree](/integrations/data-ingestion/gcs/index.md) 가이드가 게시되었습니다. 이 구성에서는 메타데이터만 컴퓨트 노드에 로컬로 저장됩니다. 추가 노드는 메타데이터를 복제하기만 하면 되므로 이 설정에서 컴퓨트 리소스를 쉽게 확장 및 축소할 수 있습니다.
