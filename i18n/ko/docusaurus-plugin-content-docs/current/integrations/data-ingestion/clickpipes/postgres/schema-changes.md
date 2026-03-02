---
title: '스키마 변경 전파 지원'
slug: /integrations/clickpipes/postgres/schema-changes
description: 'ClickPipes가 소스 테이블에서 감지할 수 있는 스키마 변경 유형을 설명하는 페이지'
doc_type: 'reference'
keywords: ['clickpipes', 'postgresql', 'cdc', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

Postgres용 ClickPipes는 소스 테이블에서 스키마 변경을 감지하고, 일부 경우에는 대상 테이블로 변경 내용을 자동으로 전파합니다. 각 DDL 연산이 처리되는 방식은 아래에 설명되어 있습니다.

[//]: # "TODO 이 페이지를 이름 변경, 데이터 타입 변경, TRUNCATE 시 동작 및 호환되지 않는 스키마 변경을 처리하는 방법에 대한 가이드로 확장합니다."

| Schema Change Type                                                                  | Behaviour                                  |
| ----------------------------------------------------------------------------------- | ------------------------------------------ |
| Adding a new column (`ALTER TABLE ADD COLUMN ...`)                                  | 테이블에 insert/update/delete가 발생하면 자동으로 전파됩니다. 새 컬럼은 스키마 변경 이후에 복제되는 모든 행에 대해 채워집니다 |
| Adding a new column with a default value (`ALTER TABLE ADD COLUMN ... DEFAULT ...`) | 테이블에 insert/update/delete가 발생하면 자동으로 전파됩니다. 새 컬럼은 스키마 변경 이후에 복제되는 모든 행에 대해 채워지지만, 전체 테이블 새로 고침(full table refresh)을 수행하지 않으면 기존 행에는 기본값이 표시되지 않습니다 |
| Dropping an existing column (`ALTER TABLE DROP COLUMN ...`)                         | 감지되지만 전파되지는 **않습니다**. 삭제된 컬럼은 스키마 변경 이후에 복제되는 모든 행에서 `NULL` 값으로 채워집니다 |

컬럼 추가는 배치 동기화가 끝날 때 전파되며, 이는 동기화 간격에 도달하거나 pull 배치 크기에 도달한 이후에 발생할 수 있습니다. 동기화 제어에 대한 자세한 정보는 [여기](./controlling_sync.md)를 참고하십시오.