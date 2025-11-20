---
'title': '데이터베이스 ClickPipe 재동기화'
'description': '데이터베이스 ClickPipe를 재동기화하기 위한 문서'
'slug': '/integrations/clickpipes/mysql/resync'
'sidebar_label': 'ClickPipe 재동기화'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'mysql'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';

### Resync이 하는 일은 무엇인가요? {#what-mysql-resync-do}

Resync은 다음과 같은 작업을 순서대로 수행합니다:

1. 기존 ClickPipe가 삭제되고 새로운 "resync" ClickPipe가 시작됩니다. 따라서 소스 테이블 구조의 변경 사항은 resync 시 반영됩니다.
2. resync ClickPipe는 원래 테이블과 동일한 이름을 가지되 `_resync` 접미사가 추가된 새로운 목적지 테이블 세트를 생성(또는 교체)합니다.
3. `_resync` 테이블에서 초기 로드가 수행됩니다.
4. 그런 다음 `_resync` 테이블이 원래 테이블과 교환됩니다. 소프트 삭제된 행은 교환 전에 원래 테이블에서 `_resync` 테이블로 전송됩니다.

원래 ClickPipe의 모든 설정은 resync ClickPipe에 유지됩니다. 원래 ClickPipe의 통계는 UI에서 지워집니다.

### ClickPipe를 resync하는 사용 사례 {#use-cases-mysql-resync}

다음은 몇 가지 시나리오입니다:

1. 소스 테이블에서 기존 ClickPipe를 깨뜨릴 수 있는 주요 스키마 변경을 수행해야 할 수 있으며, 이 경우 다시 시작해야 합니다. 변경을 수행한 후 Resync를 클릭하기만 하면 됩니다.
2. Clickhouse의 경우, 목표 테이블에서 ORDER BY 키를 변경해야 할 수도 있습니다. 올바른 정렬 키를 가진 새로운 테이블로 데이터를 다시 채우기 위해 Resync를 사용할 수 있습니다.

:::note
여러 번 resync 할 수 있지만, resync 시 소스 데이터베이스의 부하를 고려하시기 바랍니다.
:::

### Resync ClickPipe 가이드 {#guide-mysql-resync}

1. 데이터 소스 탭에서 resync하려는 MySQL ClickPipe를 클릭합니다.
2. **설정** 탭으로 이동합니다.
3. **Resync** 버튼을 클릭합니다.

<Image img={resync_button} border size="md"/>

4. 확인을 위한 대화상자가 나타납니다. 다시 Resync를 클릭합니다.
5. **메트릭** 탭으로 이동합니다.
6. 약 5초 후(또는 페이지 새로 고침 시), 파이프의 상태가 **Setup** 또는 **Snapshot**이 되어야 합니다.
7. resync의 초기 로드는 **Tables** 탭의 **Initial Load Stats** 섹션에서 모니터링할 수 있습니다.
8. 초기 로드가 완료되면 파이프는 원자적으로 `_resync` 테이블과 원래 테이블을 교환합니다. 교환 중 상태는 **Resync**가 됩니다.
9. 교환이 완료되면 파이프는 **운영 중** 상태로 전환되며, CDC가 활성화되어 있는 경우 수행됩니다.
