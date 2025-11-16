---
'title': '데이터베이스 ClickPipe 재동기화'
'description': '데이터베이스 ClickPipe 재동기화에 대한 문서'
'slug': '/integrations/clickpipes/mongodb/resync'
'sidebar_label': '재동기화 ClickPipe'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'mongodb'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';

### Resync은 무엇을 합니까? {#what-mongodb-resync-do}

Resync는 다음 작업을 순서대로 포함합니다:

1. 기존 ClickPipe가 삭제되고 새로운 "resync" ClickPipe가 시작됩니다. 따라서 소스 테이블 구조에 대한 변경 사항은 resync을 수행할 때 반영됩니다.
2. resync ClickPipe는 원래 테이블과 동일한 이름을 가진 새로운 목적지 테이블 세트를 생성(또는 교체)하며, 단 `_resync` 접미사가 추가됩니다.
3. `_resync` 테이블에서 초기 로드가 수행됩니다.
4. 그런 다음 `_resync` 테이블이 원래 테이블과 교환됩니다. 소프트 삭제된 행은 교환 전에 원래 테이블에서 `_resync` 테이블로 전송됩니다.

기존 ClickPipe의 모든 설정은 resync ClickPipe에서 유지됩니다. UI에서 기존 ClickPipe의 통계는 지워집니다.

### ClickPipe의 Resync 사용 사례 {#use-cases-mongodb-resync}

다음은 몇 가지 시나리오입니다:

1. 소스 테이블에 대해 주요 스키마 변경을 수행해야 할 수 있으며, 이는 기존 ClickPipe를 끊어 놓고 재시작해야 할 수도 있습니다. 변경을 수행한 후 Resync를 클릭하면 됩니다.
2. Clickhouse의 경우, 대상 테이블에서 ORDER BY 키를 변경해야 할 수도 있습니다. 올바른 정렬 키로 새로운 테이블에 데이터를 재구성하기 위해 Resync를 할 수 있습니다.

### Resync ClickPipe 가이드 {#guide-mongodb-resync}

1. 데이터 소스 탭에서 resync할 MongoDB ClickPipe를 클릭합니다.
2. **Settings** 탭으로 이동합니다.
3. **Resync** 버튼을 클릭합니다.

<Image img={resync_button} border size="md"/>

4. 확인을 위한 대화 상자가 나타나야 합니다. 다시 Resync를 클릭합니다.
5. **Metrics** 탭으로 이동합니다.
6. 파이프의 상태가 **Setup** 또는 **Snapshot**이 될 때까지 기다립니다.
7. **Tables** 탭의 **Initial Load Stats** 섹션에서 resync의 초기 로드를 모니터링할 수 있습니다.
8. 초기 로드가 완료되면 파이프는 원자적으로 `_resync` 테이블과 원래 테이블을 교환합니다. 교환하는 동안 상태는 **Resync**입니다.
9. 교환이 완료되면 파이프는 **Running** 상태로 전환되고, CDC가 활성화된 경우 수행됩니다.
