import Image from '@theme/IdealImage';
import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';

## 통합 예제 {#examples}

외부 통합은 조직이 기존 모니터링 작업 흐름을 유지하고, 친숙한 도구에 대한 기존 팀 전문성을 활용하며, ClickHouse 모니터링을 좀 더 광범위한 인프라 관측성과 통합할 수 있도록 하여 현재 프로세스를 중단시키지 않고도 큰 재교육 투자 없이 가능하게 합니다. 팀은 기존의 경고 규칙과 에스컬레이션 절차를 ClickHouse 메트릭에 적용할 수 있으며, 데이터베이스 성능을 응용 프로그램과 인프라 건강과 통합 관측 플랫폼 내에서 연관 지을 수 있습니다. 이 접근 방식은 현재 모니터링 설정의 ROI를 극대화하고 통합 대시보드 및 친숙한 도구 인터페이스를 통해 더 빠른 문제 해결을 가능하게 합니다.

### Grafana Cloud 모니터링 {#grafana}

Grafana는 직접 플러그인 통합 및 Prometheus 기반 접근 방식을 통해 ClickHouse 모니터링을 제공합니다. Prometheus 엔드포인트 통합은 모니터링과 프로덕션 작업 부하 간의 운영적 분리를 유지하면서 기존 Grafana Cloud 인프라 내에서 시각화를 가능하게 합니다. 구성 안내에 대해서는 [Grafana의 ClickHouse 문서](https://grafana.com/docs/grafana-cloud/monitor-infrastructure/integrations/integration-reference/integration-clickhouse/)를 참조하십시오.

### Datadog 모니터링 {#datadog}
Datadog은 서비스가 유휴 상태일 때도 존중하며 적절한 클라우드 서비스 모니터링을 제공할 전용 API 통합을 개발 중입니다. 그동안 팀은 ClickHouse Prometheus 엔드포인트를 통해 운영적 분리 및 비용 효율적인 모니터링을 위한 OpenMetrics 통합 접근 방식을 사용할 수 있습니다. 구성 안내는 [Datadog의 Prometheus 및 OpenMetrics 통합 문서](https://docs.datadoghq.com/integrations/openmetrics/)를 참조하십시오.

### ClickStack {#clickstack}

ClickStack은 ClickHouse의 심층 시스템 분석 및 디버깅을 위한 권장 관측 솔루션으로, ClickHouse를 스토리지 엔진으로 사용하는 로그, 메트릭 및 트레이스를 위한 통합 플랫폼을 제공합니다. 이 접근 방식은 HyperDX에 의존하며, ClickStack UI가 ClickHouse 인스턴스 내의 시스템 테이블에 직접 연결됩니다. 
HyperDX는 Selects, Inserts 및 Infrastructure에 대한 탭이 있는 ClickHouse 중심의 대시보드를 제공합니다. 팀은 시스템 테이블 및 로그를 검색하기 위해 Lucene 또는 SQL 구문을 사용할 수 있으며, Chart Explorer를 통해 상세한 시스템 분석을 위한 사용자 정의 시각화를 생성할 수 있습니다. 
이 접근 방식은 실시간 프로덕션 경고보다 복잡한 문제 해결, 성능 분석 및 심층 시스템 분석에 더 적합합니다.

:::note
이 접근 방식은 HyperDX가 시스템 테이블을 직접 쿼리하기 때문에 유휴 서비스를 깨울 수 있습니다.
:::
