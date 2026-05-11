---
description: '항상 RAM에 상주하는 데이터 집합입니다. `IN` 연산자의 오른쪽 피연산자로 사용하도록 설계되었습니다.'
sidebar_label: 'Set'
sidebar_position: 60
slug: /engines/table-engines/special/set
title: 'Set 테이블 엔진'
doc_type: 'reference'
---



# Set 테이블 엔진 \{#set-table-engine\}

:::note
ClickHouse Cloud에서 서비스가 25.4 이전 버전으로 생성된 경우, `SET compatibility=25.4`를 사용하여 호환성을 최소 25.4로 설정해야 합니다.
:::

항상 RAM에 상주하는 데이터 세트입니다. `IN` 연산자의 오른쪽에서 사용하도록 설계되었습니다(「IN operators」 섹션을 참조하십시오).

`INSERT`를 사용하여 테이블에 데이터를 삽입할 수 있습니다. 새 요소는 데이터 세트에 추가되며, 중복된 요소는 무시됩니다.
하지만 테이블에 대해 `SELECT`를 수행할 수는 없습니다. 데이터를 조회하는 유일한 방법은 `IN` 연산자의 오른쪽 부분에서 사용하는 것입니다.

데이터는 항상 RAM에 있습니다. `INSERT` 시, 삽입된 데이터 블록은 디스크의 테이블 디렉터리에도 기록됩니다. 서버를 시작할 때 이 데이터가 RAM으로 로드됩니다. 즉, 재시작 후에도 데이터는 유지됩니다.

서버가 비정상적으로 종료되거나 재시작되면 디스크 상의 데이터 블록이 손실되거나 손상될 수 있습니다. 후자의 경우, 손상된 데이터가 있는 파일을 수동으로 삭제해야 할 수 있습니다.

### 제한 사항과 설정 \{#join-limitations-and-settings\}

테이블을 생성할 때 다음 설정이 적용됩니다:

#### Persistent \{#persistent\}

Set 및 [Join](/engines/table-engines/special/join) 테이블 엔진에 대해 영속성을 비활성화합니다.

I/O 오버헤드를 줄입니다. 성능을 중시하고 영속성이 필요하지 않은 시나리오에 적합합니다.

가능한 값:

- 1 — 활성화.
- 0 — 비활성화.

기본값: `1`.
