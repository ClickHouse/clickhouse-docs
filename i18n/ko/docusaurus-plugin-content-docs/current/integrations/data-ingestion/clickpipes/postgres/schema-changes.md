---
'title': '스키마 변경 전파 지원'
'slug': '/integrations/clickpipes/postgres/schema-changes'
'description': '페이지는 소스 테이블에서 ClickPipes에 의해 감지 가능한 스키마 변경 유형에 대해 설명합니다.'
'doc_type': 'reference'
'keywords':
- 'clickpipes'
- 'postgresql'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

ClickPipes for Postgres는 소스 테이블의 스키마 변경 사항을 감지할 수 있으며, 경우에 따라 이러한 변경 사항이 대상 테이블로 자동 전파됩니다. 각 DDL 작업이 처리되는 방식은 아래에 문서화되어 있습니다:

[//]: # "TODO Extend this page with behavior on rename, data type changes, and truncate + guidance on how to handle incompatible schema changes."

| 스키마 변경 유형                                                                          | 동작                                   |
| --------------------------------------------------------------------------------------- | ------------------------------------- |
| 새 컬럼 추가 (`ALTER TABLE ADD COLUMN ...`)                                             | 테이블이 삽입/업데이트/삭제를 받을 때 자동으로 전파됩니다. 새로운 컬럼은 스키마 변경 후 복제된 모든 행에 대해 채워집니다.                                                       |
| 기본값을 가진 새 컬럼 추가 (`ALTER TABLE ADD COLUMN ... DEFAULT ...`)                 | 테이블이 삽입/업데이트/삭제를 받을 때 자동으로 전파됩니다. 새로운 컬럼은 스키마 변경 후 복제된 모든 행에 대해 채워지지만, 기존 행은 전체 테이블 새로 고침 없이는 기본값을 보이지 않습니다. |
| 기존 컬럼 삭제 (`ALTER TABLE DROP COLUMN ...`)                                          | 감지되지만 **전파되지 않습니다**. 삭제된 컬럼은 스키마 변경 후 복제된 모든 행에 대해 `NULL`로 채워집니다.                                                              |

컬럼 추가는 배치의 동기화 종료 시점에 전파되며, 이는 동기화 간격이 지나거나 풀 배치 크기에 도달한 후 발생할 수 있습니다. 동기화를 제어하는 방법에 대한 더 많은 정보는 [여기](./controlling_sync.md)에서 확인할 수 있습니다.
