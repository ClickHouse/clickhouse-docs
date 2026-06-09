import Image from '@theme/IdealImage';
import clickhouse_cloud_connection from '@site/static/images/use-cases/observability/clickstack-cloud-connect.png';

다음이 필요합니다:

* 프로토콜과 포트를 포함한 ClickHouse Cloud 서비스의 HTTPS 엔드포인트. 예: `https://abc123xyz.us-central1.gcp.clickhouse.cloud:8443`
* 수집용 ClickHouse 사용자 이름과 비밀번호.

이 정보를 따로 적어 두지 않았다면 [ClickHouse Cloud 콘솔](https://console.clickhouse.cloud)에서 서비스를 열고 **Connect**를 선택하세요. 이어서 표시되는 대화 상자에서 URL을 기록하세요. 아래에서 수집 전용 사용자를 생성합니다.

<Image img={clickhouse_cloud_connection} size="lg" alt="HTTPS 엔드포인트와 비밀번호를 보여주는 서비스 연결 패널" border />