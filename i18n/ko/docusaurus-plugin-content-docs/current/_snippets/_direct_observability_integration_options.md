import Image from '@theme/IdealImage';
import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';

### Grafana 플러그인 직접 통합 \{#direct-grafana\}

Grafana용 ClickHouse 데이터 소스 플러그인은 system 테이블을 활용하여 ClickHouse의 데이터를 직접 시각화하고 탐색할 수 있게 해줍니다. 이 방식은 성능을 모니터링하고 상세한 시스템 분석을 위한 사용자 정의 대시보드를 만드는 데 적합합니다.
플러그인 설치 및 구성에 대한 자세한 내용은 ClickHouse [data source plugin](/integrations/grafana)을 참조하십시오. 미리 구성된 대시보드와 알림 규칙이 포함된 Prometheus-Grafana mix-in을 사용하여 완전한 모니터링 구성을 설정하는 방법은 [Monitor ClickHouse with the new Prometheus-Grafana mix-in](https://clickhouse.com/blog/monitor-with-new-prometheus-grafana-mix-in)을 참조하십시오.

### Datadog 직접 통합 \{#direct-datadog\}

Datadog은 에이전트용 ClickHouse Monitoring 플러그인을 제공하며, 이 플러그인은 시스템 테이블을 직접 조회합니다. 이 통합 방식은 clusterAllReplicas 기능을 통해 클러스터 인지 기능(cluster awareness)을 포함한 포괄적인 데이터베이스 모니터링을 제공합니다. 
:::note
이 통합 방식은 비용 최적화를 위한 유휴 상태 동작과 Cloud 프록시 계층의 운영상 제약으로 인해 호환되지 않으므로, ClickHouse Cloud 배포 환경에서는 권장되지 않습니다.
:::

### 시스템 테이블을 직접 사용하기 \{#system-tables\}

특히 `system.query_log`와 같은 ClickHouse 시스템 테이블에 연결해 직접 쿼리하면 쿼리 성능을 심층적으로 분석할 수 있습니다. SQL 콘솔이나 clickhouse client를 사용하여 느린 쿼리를 식별하고, 리소스 사용량을 분석하며, 조직 전체의 사용 패턴을 추적할 수 있습니다.

**쿼리 성능 분석(Query Performance Analysis)**

시스템 테이블의 쿼리 로그를 사용하여 쿼리 성능 분석(Query Performance Analysis)을 수행할 수 있습니다.

**예제 쿼리**: 클러스터의 모든 레플리카에서 오래 실행되는 쿼리 상위 5개를 조회:

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
