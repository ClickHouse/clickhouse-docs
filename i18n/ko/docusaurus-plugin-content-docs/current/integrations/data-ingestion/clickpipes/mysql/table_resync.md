---
title: '특정 테이블 재동기화'
description: 'MySQL ClickPipe에서 특정 테이블 재동기화'
slug: /integrations/clickpipes/mysql/table_resync
sidebar_label: '테이블 재동기화'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# 특정 테이블 재동기화 \{#resync-tables\}

특정 ClickPipe에서 일부 테이블만 다시 동기화하는 것이 유용한 경우가 있습니다. 예를 들어 MySQL에서의 주요 스키마 변경이나 ClickHouse에서의 데이터 모델 재구성이 이에 해당할 수 있습니다.

버튼 클릭만으로 개별 테이블을 재동기화하는 기능은 아직 개발 중이지만, 이 가이드는 현재 MySQL ClickPipe에서 이를 수행하는 방법을 단계별로 설명합니다.

### 1. 파이프에서 테이블 제거 \{#removing-table\}

[테이블 제거 가이드](./removing_tables)를 참고하여 수행합니다.

### 2. ClickHouse에서 테이블을 비우거나 삭제하기 \{#truncate-drop-table\}

이 단계는 다음 단계에서 이 테이블을 다시 추가할 때 데이터가 중복되지 않도록 하기 위한 것입니다. 이를 위해 ClickHouse Cloud의 **SQL Console** 탭으로 이동한 후 쿼리를 실행하면 됩니다.
테이블이 이미 ClickHouse에 존재하고 비어 있지 않은 경우, 테이블 추가를 차단하는 검증이 수행된다는 점에 유의하십시오.

### 3. 테이블을 ClickPipe에 다시 추가하기 \{#add-table-again\}

이후에는 [테이블 추가 가이드](./add_table)에 따라 다시 진행합니다.