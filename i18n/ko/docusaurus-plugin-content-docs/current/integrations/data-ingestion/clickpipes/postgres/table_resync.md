---
'title': '특정 테이블 다시 동기화하기'
'description': 'Postgres ClickPipe에서 특정 테이블을 다시 동기화합니다.'
'slug': '/integrations/clickpipes/postgres/table_resync'
'sidebar_label': '테이블 다시 동기화'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'postgresql'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---


# 특정 테이블 재동기화 {#resync-tables}

파이프의 특정 테이블을 재동기화하는 것이 유용할 수 있는 시나리오가 있습니다. 몇 가지 샘플 사용 사례로는 Postgres의 주요 스키마 변경이나 ClickHouse의 데이터 리모델링이 있을 수 있습니다.

개별 테이블을 버튼 클릭으로 재동기화하는 작업은 진행 중이지만, 이 가이드는 Postgres ClickPipe에서 이를 오늘날 어떻게 달성할 수 있는지에 대한 단계를 공유합니다.

### 1. 파이프에서 테이블 제거 {#removing-table}

이 단계는 [테이블 제거 가이드](./removing_tables)를 따라 진행할 수 있습니다.

### 2. ClickHouse에서 테이블 잘라내기 또는 삭제 {#truncate-drop-table}

이 단계는 다음 단계에서 테이블을 다시 추가할 때 데이터 중복을 피하기 위한 것입니다. ClickHouse Cloud의 **SQL 콘솔** 탭으로 이동하여 쿼리를 실행함으로써 이를 수행할 수 있습니다. 테이블이 ClickHouse에 이미 존재하고 비어 있지 않은 경우, 테이블 추가를 차단하는 검증이 있다는 점에 유의하세요.

### 3. ClickPipe에 테이블을 다시 추가 {#add-table-again}

이 단계는 [테이블 추가 가이드](./add_table)를 따라 진행할 수 있습니다.
