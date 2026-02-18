---
title: '스키마 변경 전파 지원'
slug: /integrations/clickpipes/mysql/schema-changes
description: '소스 테이블에서 ClickPipes가 감지할 수 있는 스키마 변경 유형을 설명하는 페이지'
doc_type: 'reference'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

MySQL용 ClickPipes는 소스 테이블의 스키마 변경을 감지하고, 일부 경우에는 변경 사항을 대상 테이블에 자동으로 전파합니다. 각 DDL 연산이 어떻게 처리되는지는 아래에 설명되어 있습니다:

[//]: # "TODO 테이블/컬럼 이름 변경, 데이터 타입 변경, TRUNCATE 시 동작과 호환되지 않는 스키마 변경 처리 방법에 대한 가이드를 포함해 이 페이지를 확장합니다."

| 스키마 변경 유형                                                                     | 동작                                      |
| ----------------------------------------------------------------------------------- | ----------------------------------------- |
| 새 컬럼 추가 (`ALTER TABLE ADD COLUMN ...`)                                         | 자동으로 전파됩니다. 새 컬럼은 스키마 변경 이후에 복제되는 모든 행에 대해 값이 채워집니다                                                                 |
| 기본값이 있는 새 컬럼 추가 (`ALTER TABLE ADD COLUMN ... DEFAULT ...`)              | 자동으로 전파됩니다. 새 컬럼은 스키마 변경 이후에 복제되는 모든 행에 대해 값이 채워지지만, 전체 테이블을 다시 적재(full refresh)하지 않는 한 기존 행에는 기본값이 나타나지 않습니다 |
| 기존 컬럼 삭제 (`ALTER TABLE DROP COLUMN ...`)                                      | 감지되지만 전파되지는 **않습니다**. 삭제된 컬럼은 스키마 변경 이후에 복제되는 모든 행에 대해 `NULL`로 채워집니다                                                          |

### MySQL 5.x 제한 사항 \{#mysql-5-limitations\}

[8.0.1](https://dev.mysql.com/blog-archive/more-metadata-is-written-into-binary-log/) 이전 MySQL 버전은 binlog에 전체 컬럼 메타데이터(`binlog_row_metadata=FULL`)를 포함하지 않으므로, ClickPipes는 컬럼을 순서(ordinal position) 기준으로 추적합니다. 이는 다음을 의미합니다.

- **마지막에 컬럼을 추가**하는 작업(`ALTER TABLE ADD COLUMN ...`)은 지원됩니다.
- **컬럼 위치를 변경하는 모든 DDL**은 순서 정보를 더 이상 신뢰성 있게 매핑할 수 없기 때문에 파이프에서 오류를 발생시킵니다. 여기에 포함되는 예시는 다음과 같습니다.
  - `ALTER TABLE DROP COLUMN ...`
  - `ALTER TABLE ADD COLUMN ... AFTER ...` / `FIRST`
  - `ALTER TABLE MODIFY COLUMN ... AFTER ...` / `FIRST`
  - `ALTER TABLE CHANGE COLUMN ... AFTER ...` / `FIRST`

이 오류가 발생하면 파이프를 재동기화해야 합니다.