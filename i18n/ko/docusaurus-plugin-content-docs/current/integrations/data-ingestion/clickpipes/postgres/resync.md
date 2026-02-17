---
title: '데이터베이스 ClickPipe 재동기화'
description: '데이터베이스 ClickPipe를 재동기화하는 방법을 설명하는 문서'
slug: /integrations/clickpipes/postgres/resync
sidebar_label: 'ClickPipe 재동기화'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';


### Resync은 무엇을 하나요? \{#what-postgres-resync-do\}

Resync은 다음 작업을 순서대로 수행합니다:

1. 기존 ClickPipe가 삭제된 후, 새로운 "resync" ClickPipe가 시작됩니다. 따라서 Resync를 수행하면 소스 테이블 구조 변경 사항이 반영됩니다.
2. Resync ClickPipe는 원래 테이블들과 이름은 같지만 `_resync` 접미사가 붙은 새로운 대상 테이블 집합을 생성(또는 교체)합니다.
3. `_resync` 테이블에 대해 초기 로드가 수행됩니다.
4. `_resync` 테이블이 원래 테이블과 교체됩니다. 교체 전에 원래 테이블에서 소프트 삭제된 행이 `_resync` 테이블로 옮겨집니다.

원래 ClickPipe의 모든 설정은 Resync ClickPipe에 그대로 유지됩니다. 원래 ClickPipe의 통계는 UI에서 초기화됩니다.

### ClickPipe 재동기화 사용 사례 \{#use-cases-postgres-resync\}

다음과 같은 시나리오에서 재동기화가 필요할 수 있습니다.

1. 소스 테이블에 대해 기존 ClickPipe가 더 이상 동작하지 않을 정도의 큰 스키마 변경이 필요하여 다시 시작해야 하는 경우가 있습니다. 변경을 완료한 후 Resync를 클릭하기만 하면 됩니다.
2. 특히 ClickHouse의 경우, 대상 테이블의 ORDER BY 키를 변경해야 할 수 있습니다. Resync를 실행하여 올바른 정렬 키를 사용하는 새 테이블에 데이터를 다시 채울 수 있습니다.
3. ClickPipe의 replication 슬롯이 무효화된 경우, Resync는 새 ClickPipe와 소스 데이터베이스의 새 슬롯을 생성합니다.

:::note
여러 번 재동기화할 수 있지만, 매번 병렬 스레드를 사용하는 초기 로드가 수행되므로 재동기화 시 소스 데이터베이스에 가해지는 부하를 반드시 고려해야 합니다.
:::

### ClickPipe 재동기화 가이드 \{#guide-postgres-resync\}

1. Data Sources 탭에서 재동기화하려는 Postgres ClickPipe를 클릭합니다.
2. **Settings** 탭으로 이동합니다.
3. **Resync** 버튼을 클릭합니다.

<Image img={resync_button} border size="md"/>

4. 확인을 위한 대화 상자가 표시됩니다. **Resync**를 다시 클릭합니다.
5. **Metrics** 탭으로 이동합니다.
6. 약 5초 후, 또는 페이지를 새로고침하면 파이프 상태가 **Setup** 또는 **Snapshot**으로 표시됩니다.
7. 재동기화의 초기 적재는 **Tables** 탭의 **Initial Load Stats** 섹션에서 모니터링할 수 있습니다.
8. 초기 적재가 완료되면 파이프는 `_resync` 테이블을 원래 테이블과 원자적으로 교체합니다. 교체 중에는 상태가 **Resync**로 표시됩니다.
9. 교체가 완료되면 파이프는 **Running** 상태로 전환되며, 활성화된 경우 CDC를 수행합니다.