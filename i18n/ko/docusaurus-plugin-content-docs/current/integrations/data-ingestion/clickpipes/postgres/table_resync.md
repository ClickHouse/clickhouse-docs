---
title: '특정 테이블 재동기화'
description: 'Postgres ClickPipe에서 특정 테이블을 재동기화하기'
slug: /integrations/clickpipes/postgres/table_resync
sidebar_label: '테이블 재동기화'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# 특정 테이블 다시 동기화하기 \{#resync-tables\}

파이프에서 특정 테이블만 다시 동기화해야 하는 것이 유용한 여러 시나리오가 있습니다. 예를 들어 Postgres에서의 주요 스키마 변경이나 ClickHouse에서의 데이터 모델 재설계와 같은 경우입니다.

버튼 클릭만으로 개별 테이블을 다시 동기화하는 기능은 아직 개발 중이지만, 이 가이드에서는 현재 Postgres ClickPipe에서 이를 수행하는 방법을 단계별로 설명합니다.

### 1. 파이프에서 테이블 제거 \{#removing-table\}

이 작업은 [테이블 제거 가이드](./removing_tables)를 따르면 됩니다.

### 2. ClickHouse에서 테이블을 비우거나(truncate) 삭제(drop)하기 \{#truncate-drop-table\}

다음 단계에서 이 테이블을 다시 추가할 때 데이터가 중복되는 것을 방지하기 위한 단계입니다. ClickHouse Cloud의 **SQL Console** 탭으로 이동한 후 쿼리를 실행하면 됩니다.
또한 ClickHouse에 테이블이 이미 존재하고 비어 있지 않은 경우, 테이블 추가를 차단하는 유효성 검사가 적용되어 있음을 참고하십시오.

또는 이전 테이블을 유지해야 하는 경우, 테이블 이름만 변경해도 됩니다. 이는 테이블이 매우 크고 drop 작업에 시간이 오래 걸릴 수 있을 때에도 유용합니다.

```sql
RENAME TABLE table_A TO table_A_bak;
```


### 3. 테이블을 ClickPipe에 다시 추가합니다 \{#add-table-again\}

자세한 단계는 [테이블 추가 가이드](./add_table)를 참조하십시오.