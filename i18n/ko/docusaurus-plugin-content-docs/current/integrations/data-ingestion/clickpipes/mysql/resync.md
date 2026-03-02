---
title: '데이터베이스 ClickPipe 재동기화'
description: '데이터베이스 ClickPipe를 재동기화하는 방법에 대한 문서'
slug: /integrations/clickpipes/mysql/resync
sidebar_label: 'ClickPipe 재동기화'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';


### Resync는 무엇을 수행합니까? \{#what-mysql-resync-do\}

Resync는 다음 작업을 순서대로 수행합니다:

1. 기존 ClickPipe를 삭제하고, 새로운 "resync" ClickPipe를 시작합니다. 따라서 Resync를 실행하면 소스 테이블 구조 변경 사항도 반영됩니다.
2. Resync ClickPipe는 원래 테이블과 이름은 동일하지만 끝에 `_resync` 접미사가 추가된 새로운 대상 테이블 세트를 생성(또는 대체)합니다.
3. `_resync` 테이블에 대해 초기 로드를 수행합니다.
4. 그런 다음 `_resync` 테이블을 원래 테이블과 스왑합니다. 스왑 전에 원래 테이블에 존재하는 소프트 삭제된 행은 `_resync` 테이블로 이전됩니다.

원래 ClickPipe의 모든 설정은 Resync ClickPipe에 그대로 유지됩니다. 원래 ClickPipe의 통계 정보는 UI에서 초기화됩니다.

### ClickPipe를 다시 동기화(resync)해야 하는 사용 사례 \{#use-cases-mysql-resync\}

다음과 같은 시나리오에서 사용할 수 있습니다.

1. 소스 테이블에 대해 기존 ClickPipe를 중단시킬 수 있는 대규모 스키마 변경 작업을 수행해야 하여, ClickPipe를 다시 시작해야 하는 경우가 있습니다. 이때 변경 작업을 완료한 후 「Resync」를 클릭하기만 하면 됩니다.
2. 특히 ClickHouse의 경우, 대상 테이블의 ORDER BY 키를 변경해야 할 수 있습니다. 이때 Resync를 사용하면 올바른 정렬 키를 사용하는 새 테이블에 데이터를 다시 채울 수 있습니다.

:::note
여러 번 다시 동기화(resync)할 수 있지만, 다시 동기화할 때 소스 데이터베이스에 가해지는 부하를 반드시 고려해야 합니다.
:::

### ClickPipe 재동기화 가이드 \{#guide-mysql-resync\}

1. 「Data Sources」 탭에서 재동기화하려는 MySQL ClickPipe를 클릭합니다.
2. **Settings** 탭으로 이동합니다.
3. **Resync** 버튼을 클릭합니다.

<Image img={resync_button} border size="md"/>

4. 확인을 위한 대화 상자가 표시되면 **Resync**를 다시 클릭합니다.
5. **Metrics** 탭으로 이동합니다.
6. 약 5초 후(또는 페이지를 새로 고침했을 때) 파이프의 상태가 **Setup** 또는 **Snapshot**으로 표시됩니다.
7. 재동기화 초기 로드는 **Tables** 탭의 **Initial Load Stats** 섹션에서 모니터링할 수 있습니다.
8. 초기 로드가 완료되면 파이프는 `_resync` 테이블을 원래 테이블과 원자적으로 교체합니다. 교체 중에는 상태가 **Resync**가 됩니다.
9. 교체가 완료되면 파이프는 **Running** 상태로 전환되며, 활성화되어 있는 경우 CDC를 수행합니다.