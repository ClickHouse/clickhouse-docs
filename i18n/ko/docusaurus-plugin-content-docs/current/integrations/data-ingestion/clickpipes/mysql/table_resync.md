---
'title': '특정 테이블 다시 동기화'
'description': 'MySQL ClickPipe에서 특정 테이블을 다시 동기화'
'slug': '/integrations/clickpipes/mysql/table_resync'
'sidebar_label': '테이블 다시 동기화'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'mysql'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---


# 특정 테이블 재동기화 {#resync-tables}

파이프의 특정 테이블을 재동기화하는 것이 유용한 시나리오가 있습니다. 몇 가지 예시 사용 사례로는 MySQL의 주요 스키마 변경이나 ClickHouse에서의 데이터 재모델링이 있을 수 있습니다.

개별 테이블을 버튼 클릭으로 재동기화하는 것은 진행 중인 작업이지만, 이 가이드는 MySQL ClickPipe에서 이를 달성하는 방법에 대한 단계별 안내를 제공합니다.

### 1. 파이프에서 테이블 제거 {#removing-table}

[테이블 제거 가이드](./removing_tables)를 참조하여 이를 수행할 수 있습니다.

### 2. ClickHouse에서 테이블을 잘라내거나 삭제 {#truncate-drop-table}

이 단계는 다음 단계에서 이 테이블을 다시 추가할 때 데이터 중복을 방지하기 위한 것입니다. ClickHouse Cloud의 **SQL Console** 탭으로 이동하여 쿼리를 실행하면 됩니다.
테이블이 ClickHouse에 이미 존재하며 비어 있지 않은 경우 테이블 추가를 차단하는 유효성 검사가 있습니다.

### 3. 테이블을 ClickPipe에 다시 추가 {#add-table-again}

[테이블 추가 가이드](./add_table)를 참조하여 이를 수행할 수 있습니다.
