---
title: '특정 테이블 재동기화'
description: 'MongoDB ClickPipe에서 특정 테이블을 재동기화하기'
slug: /integrations/clickpipes/mongodb/table_resync
sidebar_label: '테이블 재동기화'
doc_type: '가이드'
keywords: ['clickpipes', 'mongodb', 'cdc', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# 특정 테이블 다시 동기화하기 \{#resync-tables\}

특정 파이프에 포함된 일부 테이블을 다시 동기화해야 하는 상황이 있을 수 있습니다. 예를 들어 MongoDB에서의 대규모 스키마 변경이나 ClickHouse에서의 데이터 모델링 변경과 같은 경우입니다.

버튼 한 번 클릭만으로 개별 테이블을 다시 동기화하는 기능은 현재 개발 중이지만, 이 가이드에서는 MongoDB ClickPipe에서 지금 바로 이러한 작업을 수행하는 방법을 설명합니다.

### 1. 파이프에서 테이블 제거하기 \{#removing-table\}

자세한 단계는 [테이블 제거 가이드](./removing_tables)를 따르면 됩니다.

### 2. ClickHouse에서 테이블을 truncate 또는 drop하기 \{#truncate-drop-table\}

이 단계는 다음 단계에서 이 테이블을 다시 추가할 때 데이터가 중복되는 것을 방지하기 위한 것입니다. 이를 위해 ClickHouse Cloud의 **SQL Console** 탭으로 이동한 다음 쿼리를 실행하면 됩니다.
이미 ClickHouse에 해당 테이블이 존재하고 비어 있지 않은 경우, 테이블 추가를 차단하는 유효성 검사가 적용되어 있다는 점에 유의하십시오.

### 3. 테이블을 ClickPipe에 다시 추가합니다 \{#add-table-again\}

[테이블 추가 가이드](./add_table)를 참조하여 다시 진행하십시오.