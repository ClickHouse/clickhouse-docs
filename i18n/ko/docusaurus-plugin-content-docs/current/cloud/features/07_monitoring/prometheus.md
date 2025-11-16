---
'slug': '/integrations/prometheus'
'sidebar_label': '프라메테우스'
'title': '프라메테우스'
'description': 'ClickHouse 메트릭을 Prometheus로 내보내기'
'keywords':
- 'prometheus'
- 'grafana'
- 'monitoring'
- 'metrics'
- 'exporter'
'doc_type': 'reference'
---

import prometheus_grafana_metrics_endpoint from '@site/static/images/integrations/prometheus-grafana-metrics-endpoint.png';
import prometheus_grafana_dropdown from '@site/static/images/integrations/prometheus-grafana-dropdown.png';
import prometheus_grafana_chart from '@site/static/images/integrations/prometheus-grafana-chart.png';
import prometheus_grafana_alloy from '@site/static/images/integrations/prometheus-grafana-alloy.png';
import prometheus_grafana_metrics_explorer from '@site/static/images/integrations/prometheus-grafana-metrics-explorer.png';
import prometheus_datadog from '@site/static/images/integrations/prometheus-datadog.png';
import Image from '@theme/IdealImage';


# Prometheus 통합

이 기능은 ClickHouse Cloud 서비스 모니터링을 위해 [Prometheus](https://prometheus.io/)와 통합하는 것을 지원합니다. Prometheus 메트릭에 대한 액세스는 사용자가 안전하게 연결하고 메트릭을 Prometheus 메트릭 수집기로 내보낼 수 있는 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 엔드포인트를 통해 제공됩니다. 이러한 메트릭은 Grafana, Datadog과 같은 대시보드와 통합되어 시각화할 수 있습니다.

시작하려면, [API 키 생성](/cloud/manage/openapi)를 하십시오.

## ClickHouse Cloud 메트릭을 검색하기 위한 Prometheus 엔드포인트 API {#prometheus-endpoint-api-to-retrieve-clickhouse-cloud-metrics}

### API 참조 {#api-reference}

| 메소드 | 경로                                                                                                 | 설명                                              |
| ------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus?filtered_metrics=[true \| false]` | 특정 서비스의 메트릭을 반환합니다.                 |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=[true \| false]` | 조직의 모든 서비스에 대한 메트릭을 반환합니다.  |

**요청 매개변수**

| 이름             | 위치                | 유형                  |
| ---------------- | ------------------ | --------------------- |
| 조직 ID         | 엔드포인트 주소    | uuid                  |
| 서비스 ID       | 엔드포인트 주소    | uuid (선택 사항)      |
| filtered_metrics | 쿼리 매개변수      | boolean (선택 사항)   |

### 인증 {#authentication}

기본 인증을 위해 ClickHouse Cloud API 키를 사용하십시오:

```bash
Username: <KEY_ID>
Password: <KEY_SECRET>
Example request
export KEY_SECRET=<key_secret>
export KEY_ID=<key_id>
export ORG_ID=<org_id>


# For all services in $ORG_ID
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/prometheus?filtered_metrics=true


# For a single service only
export SERVICE_ID=<service_id>
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/prometheus?filtered_metrics=true
```

### 샘플 응답 {#sample-response}

```response

# HELP ClickHouse_ServiceInfo Information about service, including cluster status and ClickHouse version

# TYPE ClickHouse_ServiceInfo untyped
ClickHouse_ServiceInfo{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",clickhouse_cluster_status="running",clickhouse_version="24.5",scrape="full"} 1


# HELP ClickHouseProfileEvents_Query Number of queries to be interpreted and potentially executed. Does not include queries that failed to parse or were rejected due to AST size limits, quota limits or limits on the number of simultaneously running queries. May include internal queries initiated by ClickHouse itself. Does not count subqueries.

# TYPE ClickHouseProfileEvents_Query counter
ClickHouseProfileEvents_Query{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 6


# HELP ClickHouseProfileEvents_QueriesWithSubqueries Count queries with all subqueries

# TYPE ClickHouseProfileEvents_QueriesWithSubqueries counter
ClickHouseProfileEvents_QueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 230


# HELP ClickHouseProfileEvents_SelectQueriesWithSubqueries Count SELECT queries with all subqueries

# TYPE ClickHouseProfileEvents_SelectQueriesWithSubqueries counter
ClickHouseProfileEvents_SelectQueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 224


# HELP ClickHouseProfileEvents_FileOpen Number of files opened.

# TYPE ClickHouseProfileEvents_FileOpen counter
ClickHouseProfileEvents_FileOpen{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 4157


# HELP ClickHouseProfileEvents_Seek Number of times the 'lseek' function was called.

# TYPE ClickHouseProfileEvents_Seek counter
ClickHouseProfileEvents_Seek{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 1840


# HELP ClickPipes_Info Always equal to 1. Label "clickpipe_state" contains the current state of the pipe: Stopped/Provisioning/Running/Paused/Failed

# TYPE ClickPipes_Info gauge
ClickPipes_Info{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent",clickpipe_status="Running"} 1


# HELP ClickPipes_SentEvents_Total Total number of records sent to ClickHouse

# TYPE ClickPipes_SentEvents_Total counter
ClickPipes_SentEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 5534250


# HELP ClickPipes_SentBytesCompressed_Total Total compressed bytes sent to ClickHouse.

# TYPE ClickPipes_SentBytesCompressed_Total counter
ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name
="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 380837520
ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name


# HELP ClickPipes_FetchedBytes_Total Total uncompressed bytes fetched from the source.

# TYPE ClickPipes_FetchedBytes_Total counter
ClickPipes_FetchedBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202


# HELP ClickPipes_Errors_Total Total errors ingesting data.

# TYPE ClickPipes_Errors_Total counter
ClickPipes_Errors_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 0


# HELP ClickPipes_SentBytes_Total Total uncompressed bytes sent to ClickHouse.

# TYPE ClickPipes_SentBytes_Total counter
ClickPipes_SentBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 477187967


# HELP ClickPipes_FetchedBytesCompressed_Total Total compressed bytes fetched from the source. If data is uncompressed at the source, this will equal ClickPipes_FetchedBytes_Total

# TYPE ClickPipes_FetchedBytesCompressed_Total counter
ClickPipes_FetchedBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202


# HELP ClickPipes_FetchedEvents_Total Total number of records fetched from the source.

# TYPE ClickPipes_FetchedEvents_Total counter
ClickPipes_FetchedEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 5535376
```

### 메트릭 레이블 {#metric-labels}

모든 메트릭은 다음 레이블을 가집니다:

| 레이블                  | 설명                       |
|---------------------|--------------------------|
| clickhouse_org      | 조직 ID                  |
| clickhouse_service   | 서비스 ID                |
| clickhouse_service_name | 서비스 이름             |

ClickPipes의 경우, 메트릭은 다음 레이블도 포함합니다:

| 레이블               | 설명                     |
|------------------|-------------------------|
| clickpipe_id     | ClickPipe ID            |
| clickpipe_name   | ClickPipe 이름          |
| clickpipe_source  | ClickPipe 소스 유형     |

### 정보 메트릭 {#information-metrics}

ClickHouse Cloud는 값이 항상 `1`인 `gauge` 타입의 특별한 메트릭 `ClickHouse_ServiceInfo`를 제공합니다. 이 메트릭은 모든 **메트릭 레이블**과 다음 레이블을 포함합니다:

| 레이블                      | 설명                                      |
|-------------------------|-----------------------------------------|
| clickhouse_cluster_status | 서비스의 상태입니다. 다음 중 하나일 수 있습니다: [`awaking` \| `running` \| `degraded` \| `idle` \| `stopped`] |
| clickhouse_version        | 서비스가 실행 중인 ClickHouse 서버의 버전 |
| scrape                    | 마지막 스크랩의 상태를 나타냅니다. `full` 또는 `partial`이 될 수 있습니다. |
| full                      | 마지막 메트릭 스크랩에서 오류가 없었음을 나타냅니다. |
| partial                   | 마지막 메트릭 스크랩에서 일부 오류가 있었고 `ClickHouse_ServiceInfo` 메트릭만 반환되었음을 나타냅니다. |

메트릭을 검색하는 요청은 유휴 상태의 서비스를 재개하지 않습니다. 서비스가 `idle` 상태에 있을 경우, `ClickHouse_ServiceInfo` 메트릭만 반환됩니다.

ClickPipes의 경우, **메트릭 레이블**에 추가되어 `clickpipe_state`라는 레이블이 있는 유사한 `ClickPipes_Info` 메트릭 `gauge`가 있습니다:

| 레이블                | 설명                      |
|------------------|-------------------------|
| clickpipe_state   | 파이프의 현재 상태         |

### Prometheus 구성 {#configuring-prometheus}

Prometheus 서버는 지정된 간격으로 구성된 대상을 대상으로 메트릭을 수집합니다. 아래는 ClickHouse Cloud Prometheus 엔드포인트를 사용하기 위한 Prometheus 서버의 예제 구성입니다:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "prometheus"
    static_configs:
    - targets: ["localhost:9090"]
  - job_name: "clickhouse"
    static_configs:
      - targets: ["api.clickhouse.cloud"]
    scheme: https
    params:
      filtered_metrics: ["true"]
    metrics_path: "/v1/organizations/<ORG_ID>/prometheus"
    basic_auth:
      username: <KEY_ID>
      password: <KEY_SECRET>
    honor_labels: true
```

`honor_labels` 구성 매개변수는 인스턴스 레이블이 올바르게 채워지도록 `true`로 설정해야 합니다. 또한, 위 예제에서는 `filtered_metrics`가 `true`로 설정되어 있지만, 사용자의 선호에 따라 구성되어야 합니다.

## Grafana와 통합 {#integrating-with-grafana}

사용자는 Grafana와 통합하는 두 가지 주요 방법이 있습니다:

- **메트릭 엔드포인트** – 이 접근법은 추가 구성 요소나 인프라가 필요하지 않는 장점이 있습니다. 이 옵션은 Grafana Cloud에 한정되며, ClickHouse Cloud Prometheus 엔드포인트 URL과 자격 증명만 필요합니다.
- **Grafana Alloy** - Grafana Alloy는 Grafana 에이전트를 대체하는 공급업체 중립의 OpenTelemetry (OTel) Collector 배포입니다. 이는 스크래퍼로 사용될 수 있으며, 귀하의 인프라에 배포 가능하고 모든 Prometheus 엔드포인트와 호환됩니다.

아래에서 이러한 옵션을 사용하는 방법에 대한 지침을 제공하며, ClickHouse Cloud Prometheus 엔드포인트에 특화된 세부 사항에 중점을 둡니다.

### 메트릭 엔드포인트가 있는 Grafana Cloud {#grafana-cloud-with-metrics-endpoint}

- Grafana Cloud 계정에 로그인합니다.
- **메트릭 엔드포인트**를 선택하여 새 연결을 추가합니다.
- 스크랩 URL을 Prometheus 엔드포인트를 가리키도록 구성하고 기본 인증을 사용하여 API 키/비밀로 연결을 구성합니다.
- 연결 테스트를 통해 연결할 수 있는지 확인합니다.

<Image img={prometheus_grafana_metrics_endpoint} size="md" alt="Grafana 메트릭 엔드포인트 구성" border/>

<br />

구성이 완료되면 대시보드 구성을 위해 선택할 수 있는 메트릭이 드롭다운에 표시되어야 합니다:

<Image img={prometheus_grafana_dropdown} size="md" alt="Grafana Metrics Explorer 드롭다운" border/>

<br />

<Image img={prometheus_grafana_chart} size="md" alt="Grafana Metrics Explorer 차트" border/>

### Alloy가 있는 Grafana Cloud {#grafana-cloud-with-alloy}

Grafana Cloud를 사용하는 경우, Grafana의 Alloy 메뉴로 이동하여 화면의 지침에 따라 Alloy를 설치할 수 있습니다:

<Image img={prometheus_grafana_alloy} size="md" alt="Grafana Alloy" border/>

<br />

이렇게 하면 인증 토큰과 함께 Grafana Cloud 엔드포인트로 데이터를 전송하기 위해 `prometheus.remote_write` 구성요소가 있는 Alloy가 구성됩니다. 사용자는 ClickHouse Cloud Prometheus 엔드포인트에 대한 스크래퍼를 포함하도록 Alloy 구성(리눅스의 경우 `/etc/alloy/config.alloy`에 위치)을 수정하기만 하면 됩니다.

다음은 ClickHouse Cloud 엔드포인트에서 메트릭을 스크랩하기 위한 `prometheus.scrape` 구성요소가 있는 Alloy의 구성 예시와 자동으로 구성된 `prometheus.remote_write` 구성요소를 나타냅니다. `basic_auth` 구성요소에는 각각 사용자 이름과 비밀번호로 클라우드 API 키 ID와 비밀번호가 포함되어 있습니다.

```yaml
prometheus.scrape "clickhouse_cloud" {
  // Collect metrics from the default listen address.
  targets = [{
        __address__ = "https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=true",
// e.g. https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true
  }]

  honor_labels = true

  basic_auth {
        username = "KEY_ID"
        password = "KEY_SECRET"
  }

  forward_to = [prometheus.remote_write.metrics_service.receiver]
  // forward to metrics_service below
}

prometheus.remote_write "metrics_service" {
  endpoint {
        url = "https://prometheus-prod-10-prod-us-central-0.grafana.net/api/prom/push"
        basic_auth {
          username = "<Grafana API username>"
          password = "<grafana API token>"
    }
  }
}
```

`honor_labels` 구성 매개변수는 인스턴스 레이블이 올바르게 채워지도록 `true`로 설정해야 합니다.

### Alloy가 있는 Grafana 자기 관리 {#grafana-self-managed-with-alloy}

Grafana의 자체 관리 사용자는 Alloy 에이전트 설치에 대한 지침을 [여기](https://grafana.com/docs/alloy/latest/get-started/install/)에서 찾을 수 있습니다. 사용자가 Alloy를 구성하여 Prometheus 메트릭을 원하는 대상으로 전송한 것으로 가정합니다. 아래의 `prometheus.scrape` 구성요소는 Alloy가 ClickHouse Cloud 엔드포인트를 스크랩하게 합니다. 스크랩된 메트릭을 받는 `prometheus.remote_write`가 있다고 가정하고, 존재하지 않는 경우 `forward_to 키`를 대상 위치로 조정합니다.

```yaml
prometheus.scrape "clickhouse_cloud" {
  // Collect metrics from the default listen address.
  targets = [{
        __address__ = "https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=true",
// e.g. https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true
  }]

  honor_labels = true

  basic_auth {
        username = "KEY_ID"
        password = "KEY_SECRET"
  }

  forward_to = [prometheus.remote_write.metrics_service.receiver]
  // forward to metrics_service. Modify to your preferred receiver
}
```

구성이 완료되면 메트릭 탐색기에서 ClickHouse 관련 메트릭을 볼 수 있어야 합니다:

<Image img={prometheus_grafana_metrics_explorer} size="md" alt="Grafana 메트릭 탐색기" border/>

<br />

`honor_labels` 구성 매개변수는 인스턴스 레이블이 올바르게 채워지도록 `true`로 설정해야 합니다.

## Datadog와 통합 {#integrating-with-datadog}

Datadog [에이전트](https://docs.datadoghq.com/agent/?tab=Linux)와 [OpenMetrics 통합](https://docs.datadoghq.com/integrations/openmetrics/)을 사용하여 ClickHouse Cloud 엔드포인트에서 메트릭을 수집할 수 있습니다. 아래는 이 에이전트 및 통합을 위한 간단한 구성 예입니다. 단, 가장 관심 있는 메트릭만 선택하는 것이 좋습니다. 아래의 포괄적인 예시는 Datadog이 사용자 지정 메트릭으로 처리할 수 있는 수천 개의 메트릭-인스턴스 조합을 내보낼 것입니다.

```yaml
init_config:

instances:
   - openmetrics_endpoint: 'https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true'
     namespace: 'clickhouse'
     metrics:
         - '^ClickHouse.*'
     username: username
     password: password
```

<br />

<Image img={prometheus_datadog} size="md" alt="Prometheus Datadog 통합" />
