import Image from '@theme/IdealImage';
import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';

## 통합 예시 \{#examples\}

외부 통합을 사용하면 조직은 기존에 구축한 모니터링 워크플로를 유지하면서 익숙한 도구에 대한 팀의 전문성을 그대로 활용하고, 현재 프로세스를 방해하거나 과도한 재교육 비용을 들이지 않고도 ClickHouse 모니터링을 더 넓은 인프라 관측성과 통합할 수 있습니다.
팀은 기존의 알림 규칙과 에스컬레이션 절차를 ClickHouse 메트릭에 적용하는 한편, 통합된 관측성 플랫폼 내에서 데이터베이스 성능을 애플리케이션 및 인프라 상태와 연관 지을 수 있습니다. 이러한 접근 방식은 현재 모니터링 구성에 대한 투자 수익률(ROI)을 극대화하고, 통합 대시보드와 익숙한 도구 인터페이스를 통해 문제 해결 속도를 높이는 데 도움이 됩니다.

### Grafana Cloud 모니터링 \{#grafana\}

Grafana는 직접 플러그인 통합과 Prometheus 기반 방식을 통해 ClickHouse 모니터링을 제공합니다. Prometheus 엔드포인트 통합은 모니터링 워크로드와 프로덕션 워크로드 간의 운영 상의 분리를 유지하면서, 기존 Grafana Cloud 인프라 내에서 시각화를 가능하게 합니다. 구성 방법은 [Grafana의 ClickHouse 문서](https://grafana.com/docs/grafana-cloud/monitor-infrastructure/integrations/integration-reference/integration-clickhouse/)를 참고하십시오.

### Datadog 모니터링 \{#datadog\}

Datadog은 서비스의 유휴(idle) 상태 동작을 고려하면서 적절한 Cloud 서비스 모니터링을 제공하는 전용 API 통합을 개발 중입니다. 그동안에는 운영 분리와 비용 효율적인 모니터링을 위해 ClickHouse Prometheus 엔드포인트를 활용한 OpenMetrics 통합 방식을 사용할 수 있습니다. 구성에 대한 안내는 [Datadog의 Prometheus 및 OpenMetrics 통합 문서](https://docs.datadoghq.com/integrations/openmetrics/)를 참고하십시오.

### ClickStack \{#clickstack\}

ClickStack는 시스템 심층 분석과 디버깅을 위한 ClickHouse 권장 관측성 솔루션으로, ClickHouse를 스토리지 엔진으로 사용하는 로그, 메트릭, 트레이스를 위한 통합 플랫폼을 제공합니다. 이 방식은 ClickStack UI인 HyperDX가 ClickHouse 인스턴스 내부의 시스템 테이블에 직접 연결하는 것에 기반합니다.
HyperDX는 Selects, Inserts, Infrastructure 탭을 포함하는 ClickHouse 중심 대시보드를 기본으로 제공합니다. 팀은 Lucene 또는 SQL 구문을 사용하여 시스템 테이블과 로그를 검색할 수 있으며, Chart Explorer를 통해 맞춤형 시각화를 생성하여 상세한 시스템 분석을 수행할 수 있습니다.
이 방식은 실시간 운영 환경 알림보다는 복잡한 문제 디버깅, 성능 분석, 심층적인 시스템 내부 분석에 적합합니다.

:::note
HyperDX가 시스템 테이블을 직접 쿼리하므로 이 방식은 유휴 상태의 서비스도 활성화될 수 있습니다.
:::