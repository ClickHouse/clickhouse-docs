---
'title': 'AWS에서 BYOC 가시성'
'slug': '/cloud/reference/byoc/observability'
'sidebar_label': 'AWS'
'keywords':
- 'BYOC'
- 'cloud'
- 'bring your own cloud'
- 'AWS'
'description': '자체 클라우드 인프라에 ClickHouse 배포'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import byoc4 from '@site/static/images/cloud/reference/byoc-4.png';
import byoc3 from '@site/static/images/cloud/reference/byoc-3.png';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';

## 관측성 {#observability}

### 내장 모니터링 도구 {#built-in-monitoring-tools}
ClickHouse BYOC는 다양한 사용 사례를 위한 여러 접근 방식을 제공합니다.

#### 관측성 대시보드 {#observability-dashboard}

ClickHouse Cloud에는 메모리 사용량, 쿼리 비율 및 I/O와 같은 메트릭을 표시하는 고급 관측성 대시보드가 포함되어 있습니다. 이는 ClickHouse Cloud 웹 콘솔 인터페이스의 **모니터링** 섹션에서 접근할 수 있습니다.

<br />

<Image img={byoc3} size="lg" alt="관측성 대시보드" border />

<br />

#### 고급 대시보드 {#advanced-dashboard}

서버 성능과 자원 활용도를 자세히 모니터링하기 위해 `system.metrics`, `system.events` 및 `system.asynchronous_metrics`와 같은 시스템 테이블의 메트릭을 사용하여 대시보드를 사용자 정의할 수 있습니다.

<br />

<Image img={byoc4} size="lg" alt="고급 대시보드" border />

<br />

#### BYOC Prometheus 스택 접근 {#prometheus-access}
ClickHouse BYOC는 Kubernetes 클러스터에 Prometheus 스택을 배포합니다. 여기에서 메트릭에 접근하고 스크랩하여 자신의 모니터링 스택과 통합할 수 있습니다.

ClickHouse 지원팀에 문의하여 개인 로드 밸런서를 활성화하고 URL을 요청하세요. 이 URL은 개인 네트워크를 통해서만 접근 가능하며 인증을 지원하지 않습니다.

**샘플 URL**
```bash
https://prometheus-internal.<subdomain>.<region>.aws.clickhouse-byoc.com/query
```

#### Prometheus 통합 {#prometheus-integration}

<DeprecatedBadge/>

위 섹션의 Prometheus 스택 통합을 사용해 주세요. ClickHouse 서버 메트릭 외에도 K8S 메트릭 및 기타 서비스의 메트릭도 포함됩니다.

ClickHouse Cloud는 모니터링을 위해 메트릭을 스크랩할 수 있는 Prometheus 엔드포인트를 제공합니다. 이를 통해 Grafana 및 Datadog과 같은 도구와의 시각화를 위한 통합이 가능합니다.

**https 엔드포인트를 통한 샘플 요청 /metrics_all**

```bash
curl --user <username>:<password> https://i6ro4qarho.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud:8443/metrics_all
```

**샘플 응답**

```bash

# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes The amount of bytes stored on disk `s3disk` in system database

# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929

# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts The number of broken detached parts

# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0

# HELP ClickHouse_CustomMetric_LostPartCount The age of the oldest mutation (in seconds)

# TYPE ClickHouse_CustomMetric_LostPartCount gauge
ClickHouse_CustomMetric_LostPartCount{hostname="c-jet-ax-16-server-43d5baj-0"} 0

# HELP ClickHouse_CustomMetric_NumberOfWarnings The number of warnings issued by the server. It usually indicates about possible misconfiguration

# TYPE ClickHouse_CustomMetric_NumberOfWarnings gauge
ClickHouse_CustomMetric_NumberOfWarnings{hostname="c-jet-ax-16-server-43d5baj-0"} 2

# HELP ClickHouseErrorMetric_FILE_DOESNT_EXIST FILE_DOESNT_EXIST

# TYPE ClickHouseErrorMetric_FILE_DOESNT_EXIST counter
ClickHouseErrorMetric_FILE_DOESNT_EXIST{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 1

# HELP ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE UNKNOWN_ACCESS_TYPE

# TYPE ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE counter
ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 8

# HELP ClickHouse_CustomMetric_TotalNumberOfErrors The total number of errors on server since the last restart

# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```

**인증**

ClickHouse 사용자 이름과 비밀번호 쌍을 인증에 사용할 수 있습니다. 메트릭 스크랩을 위해 최소 권한을 가진 전용 사용자를 생성하는 것을 권장합니다. 최소한 `system.custom_metrics` 테이블의 복제본에서 `READ` 권한이 필요합니다. 예를 들어:

```sql
GRANT REMOTE ON *.* TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_custom_metrics_tables TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_database_replicated_recovery_time TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_failed_mutations TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_group TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_shared_catalog_recovery_time TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_table_read_only_duration_seconds TO scrapping_user;
GRANT SELECT ON system._custom_metrics_view_error_metrics TO scrapping_user;
GRANT SELECT ON system._custom_metrics_view_histograms TO scrapping_user;
GRANT SELECT ON system._custom_metrics_view_metrics_and_events TO scrapping_user;
GRANT SELECT(description, metric, value) ON system.asynchronous_metrics TO scrapping_user;
GRANT SELECT ON system.custom_metrics TO scrapping_user;
GRANT SELECT(name, value) ON system.errors TO scrapping_user;
GRANT SELECT(description, event, value) ON system.events TO scrapping_user;
GRANT SELECT(description, labels, metric, value) ON system.histogram_metrics TO scrapping_user;
GRANT SELECT(description, metric, value) ON system.metrics TO scrapping_user;
```

**Prometheus 구성**

아래에 예시 구성파일이 나와 있습니다. `targets` 엔드포인트는 ClickHouse 서비스에 접근하기 위해 사용되는 동일한 엔드포인트입니다.

```bash
global:
 scrape_interval: 15s

scrape_configs:
 - job_name: "prometheus"
   static_configs:
   - targets: ["localhost:9090"]
 - job_name: "clickhouse"
   static_configs:
     - targets: ["<subdomain1>.<subdomain2>.aws.byoc.clickhouse.cloud:8443"]
   scheme: https
   metrics_path: "/metrics_all"
   basic_auth:
     username: <KEY_ID>
     password: <KEY_SECRET>
   honor_labels: true
```

자세한 내용은 [이 블로그 포스트](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring) 및 [ClickHouse를 위한 Prometheus 설정 문서](/integrations/prometheus)를 참조하세요.
