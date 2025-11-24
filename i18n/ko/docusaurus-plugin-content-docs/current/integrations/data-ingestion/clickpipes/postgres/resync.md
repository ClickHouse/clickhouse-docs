---
'title': '데이터베이스 ClickPipe 다시 동기화하기'
'description': '데이터베이스 ClickPipe 다시 동기화에 대한 문서'
'slug': '/integrations/clickpipes/postgres/resync'
'sidebar_label': 'ClickPipe 다시 동기화'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'postgresql'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';

### Resync이란 무엇인가요? {#what-postgres-resync-do}

Resync에는 다음과 같은 작업이 순서대로 포함됩니다:
1. 기존 ClickPipe가 제거되고 새로운 "resync" ClickPipe가 시작됩니다. 따라서 소스 테이블 구조의 변경 사항이 resync 시 반영됩니다.
2. resync ClickPipe는 원래 테이블과 동일한 이름을 가지며 `_resync` 접미사가 붙은 새로운 목적지 테이블을 생성(또는 교체)합니다.
3. `_resync` 테이블에 대한 초기 로드가 수행됩니다.
4. 그 후 `_resync` 테이블이 원래 테이블과 교체됩니다. 소프트 삭제된 행은 교체 전에 원래 테이블에서 `_resync` 테이블로 전송됩니다.

원래 ClickPipe의 모든 설정은 resync ClickPipe에 유지됩니다. 원래 ClickPipe의 통계는 UI에서 지워집니다.

### ClickPipe resync의 사용 사례 {#use-cases-postgres-resync}

다음은 몇 가지 시나리오입니다:

1. 소스 테이블에서 기존 ClickPipe를 부수고 다시 시작해야 하는 주요 스키마 변경 작업이 필요할 수 있습니다. 변경을 수행한 후 Resync를 클릭하면 됩니다.
2. 특히 Clickhouse의 경우, 대상 테이블의 ORDER BY 키를 변경해야 했을 수 있습니다. 올바른 정렬 키로 새로운 테이블에 데이터를 다시 채우기 위해 Resync를 사용할 수 있습니다.
3. ClickPipe의 복제 슬롯이 무효화됩니다: Resync는 새로운 ClickPipe와 원본 데이터베이스의 새로운 슬롯을 생성합니다.

:::note
여러 번 resync할 수 있지만, resync할 때 소스 데이터베이스의 부하를 고려해야 합니다,
초기 로드가 매번 병렬 스레드로 수행되기 때문입니다.
:::

### Resync ClickPipe 가이드 {#guide-postgres-resync}

1. 데이터 소스 탭에서 resync할 Postgres ClickPipe를 클릭합니다.
2. **Settings** 탭으로 이동합니다.
3. **Resync** 버튼을 클릭합니다.

<Image img={resync_button} border size="md"/>

4. 확인을 위한 대화 상자가 나타나야 합니다. 다시 Resync를 클릭합니다.
5. **Metrics** 탭으로 이동합니다.
6. 약 5초 후(페이지 새로 고침 시에도) 파이프의 상태가 **Setup** 또는 **Snapshot**이어야 합니다.
7. resync의 초기 로드는 **Tables** 탭의 **Initial Load Stats** 섹션에서 모니터링할 수 있습니다.
8. 초기 로드가 완료되면 파이프는 원자적으로 `_resync` 테이블을 원래 테이블과 교환합니다. 교환 동안 상태는 **Resync**가 됩니다.
9. 교환이 완료되면 파이프는 **Running** 상태로 들어가고, 활성화되어 있다면 CDC를 수행합니다.
