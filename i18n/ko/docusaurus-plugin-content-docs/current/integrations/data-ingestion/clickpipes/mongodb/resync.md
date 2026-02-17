---
title: '데이터베이스 ClickPipe 재동기화'
description: '데이터베이스 ClickPipe를 재동기화하는 방법에 대한 문서'
slug: /integrations/clickpipes/mongodb/resync
sidebar_label: 'ClickPipe 재동기화'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';


### Resync은 무엇을 하나요? \{#what-mongodb-resync-do\}

Resync은 다음 작업을 순서대로 수행합니다:

1. 기존 ClickPipe가 삭제되고 새 "resync" ClickPipe가 시작됩니다. 따라서 Resync를 수행하면 소스 테이블 구조 변경 사항이 반영됩니다.
2. resync ClickPipe는 원래 테이블과 이름이 동일하지만 `_resync` 접미사가 붙은 새 대상 테이블 집합을 생성(또는 교체)합니다.
3. `_resync` 테이블에 대해 초기 적재가 수행됩니다.
4. 그런 다음 `_resync` 테이블이 원래 테이블과 교체됩니다. 교체 전에 원래 테이블에서 소프트 삭제된 행이 `_resync` 테이블로 이전됩니다.

원래 ClickPipe의 모든 설정은 resync ClickPipe에 그대로 유지됩니다. 원래 ClickPipe의 통계 정보는 UI에서 초기화됩니다.

### ClickPipe를 재동기화해야 하는 사용 사례 \{#use-cases-mongodb-resync\}

다음과 같은 몇 가지 시나리오가 있습니다.

1. 소스 테이블에 대해 기존 ClickPipe가 동작하지 않게 될 정도의 대규모 스키마 변경을 수행해야 하여 재시작이 필요한 경우가 있습니다. 변경 작업을 완료한 후 Resync를 클릭하기만 하면 됩니다.
2. 특히 ClickHouse의 경우, 대상 테이블의 ORDER BY 키를 변경해야 할 수 있습니다. Resync를 수행하여 올바른 정렬 키를 사용하는 새 테이블로 데이터를 다시 적재할 수 있습니다.

### ClickPipe 재동기화 가이드 \{#guide-mongodb-resync\}

1. Data Sources 탭에서 재동기화하려는 MongoDB ClickPipe를 클릭합니다.
2. **Settings** 탭으로 이동합니다.
3. **Resync** 버튼을 클릭합니다.

<Image img={resync_button} border size="md"/>

4. 확인용 대화 상자가 표시되면 **Resync**를 다시 클릭합니다.
5. **Metrics** 탭으로 이동합니다.
6. 파이프의 상태가 **Setup** 또는 **Snapshot**으로 변경될 때까지 기다립니다.
7. 재동기화의 초기 로드는 **Tables** 탭의 **Initial Load Stats** 섹션에서 모니터링할 수 있습니다.
8. 초기 로드가 완료되면 파이프는 `_resync` 테이블을 원래 테이블과 원자적으로 교체합니다. 교체가 진행되는 동안 상태는 **Resync**가 됩니다.
9. 교체가 완료되면 파이프는 **Running** 상태로 전환되며, 활성화되어 있는 경우 CDC를 수행합니다.