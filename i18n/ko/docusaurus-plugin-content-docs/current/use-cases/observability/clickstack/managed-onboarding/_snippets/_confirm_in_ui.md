import Image from '@theme/IdealImage';
import clickstack_cloud from '@site/static/images/use-cases/observability/clickstack-cloud-first-time.png';
import clickstack_start_ingestion from '@site/static/images/use-cases/observability/clickstack-start-ingestion.png';
import clickstack_start_exploring from '@site/static/images/use-cases/observability/clickstack-start-exploring.png';
import clickstack_search from '@site/static/images/use-cases/observability/clickstack-search.png';

[ClickHouse Cloud 콘솔](https://console.clickhouse.cloud)에서 서비스를 열고, 왼쪽 메뉴에서 **ClickStack**을 선택한 다음 **Start Ingestion**을 선택합니다.

<Image img={clickstack_cloud} size="lg" alt="ClickStack 실행" border />

다음 단계는 이미 collector를 구성했으므로 건너뛰어도 됩니다. 계속하려면 **Launch ClickStack**을 클릭하세요.

ClickStack이 새 탭에서 열리며, 자동으로 **시작하기** 페이지로 이동합니다. 자동으로 이동하지 않으면 왼쪽 메뉴에서 **시작하기**를 선택한 다음 **Start Ingestion**을 클릭하고 이어서 **다음**을 클릭하세요.

<Image img={clickstack_start_ingestion} size="lg" alt="ClickStack Start Ingestion" border />

ClickStack이 테이블(table)과 텔레메트리 데이터를 자동으로 감지하므로 계속 진행할 수 있습니다. 트레이스 데이터 탐색을 시작하려면 **Start Exploring**을 선택하세요.

<Image img={clickstack_start_exploring} size="lg" alt="ClickStack Start Exploring" border />

source를 `Logs`로 전환하고 시간 범위를 **지난 15분**으로 설정합니다. `otelgen`에서 생성한 synthetic logs가 몇 초 내에 표시됩니다.

<Image img={clickstack_search} size="lg" alt="로그가 표시되는 ClickStack Search view" />

아무것도 표시되지 않으면:

* `otelgen`에 전달한 auth header 값이 collector에서 예상하는 값과 일치하는지 확인합니다.
* collector의 logs를 tail하여 export 오류가 있는지 확인합니다.
* collector에 구성된 ClickHouse endpoint에 프로토콜과 포트가 모두 포함되어 있는지 확인합니다 (`https://...:8443`).