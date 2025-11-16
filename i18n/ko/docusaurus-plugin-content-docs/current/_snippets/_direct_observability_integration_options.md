import Image from '@theme/IdealImage';
import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';

### Direct Grafana plugin integration {#direct-grafana}

ClickHouse의 Grafana 데이터 소스 플러그인은 시스템 테이블을 사용하여 ClickHouse에서 데이터를 직접 시각화하고 탐색할 수 있게 해줍니다. 이 접근 방식은 성능 모니터링 및 세부 시스템 분석을 위한 맞춤형 대시보드 생성에 유용합니다. 플러그인 설치 및 구성 세부정보는 ClickHouse [data source plugin](/integrations/grafana)에서 확인하세요. 미리 구축된 대시보드 및 경고 규칙을 포함한 Prometheus-Grafana 믹스를 사용한 완전한 모니터링 설정에 대한 내용은 [Monitor ClickHouse with the new Prometheus-Grafana mix-in](https://clickhouse.com/blog/monitor-with-new-prometheus-grafana-mix-in)에서 확인할 수 있습니다.

### Direct Datadog Integration {#direct-datadog}

Datadog는 시스템 테이블을 직접 쿼리하는 Clickhouse Monitoring 플러그인을 제공합니다. 이 통합은 clusterAllReplicas 기능을 통해 클러스터 인식을 포함한 포괄적인 데이터베이스 모니터링을 제공합니다. 
:::note
이 통합은 비용 최적화된 유휴 동작 및 클라우드 프록시 계층의 운영 제한과의 비호환성으로 인해 ClickHouse Cloud 배포에서는 권장되지 않습니다.
:::

### Using system tables directly {#system-tables}

사용자는 ClickHouse 시스템 테이블, 특히 `system.query_log`에 연결하여 깊이 있는 쿼리 성능 분석을 수행할 수 있습니다. SQL 콘솔 또는 clickhouse 클라이언트를 사용하여 팀은 느린 쿼리를 식별하고, 리소스 사용량을 분석하며, 조직 전반의 사용 패턴을 추적할 수 있습니다.

**Query Performance Analysis**

사용자는 시스템 테이블 쿼리 로그를 사용하여 쿼리 성능 분석을 수행할 수 있습니다.

**예제 쿼리**: 모든 클러스터 복제본에서 상위 5개의 장기 실행 쿼리 찾기:

```sql
SELECT
    type,
    event_time, 
    query_duration_ms,
    query,
    read_rows,
    tables
FROM clusterAllReplicas(default, system.query_log)
WHERE event_time >= (now() - toIntervalMinute(60)) AND type='QueryFinish'
ORDER BY query_duration_ms DESC
LIMIT 5
FORMAT VERTICAL
```
