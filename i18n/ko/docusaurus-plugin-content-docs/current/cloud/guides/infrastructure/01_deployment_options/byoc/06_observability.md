---
title: 'BYOC 관측성'
slug: /cloud/reference/byoc/observability
sidebar_label: '관측성'
keywords: ['BYOC', 'cloud', 'bring your own cloud', '관측성', '모니터링', 'Prometheus', 'Grafana']
description: '내장 대시보드와 Prometheus 메트릭을 사용하여 BYOC ClickHouse 배포를 모니터링하고 관측성을 확보합니다'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_mixin_1 from '@site/static/images/cloud/reference/byoc-mixin-1.png';
import byoc_mixin_2 from '@site/static/images/cloud/reference/byoc-mixin-2.png';
import byoc_mixin_3 from '@site/static/images/cloud/reference/byoc-mixin-3.png';
import byoc_mixin_4 from '@site/static/images/cloud/reference/byoc-mixin-4.png';
import byoc_mixin_5 from '@site/static/images/cloud/reference/byoc-mixin-5.png';

BYOC 배포에는 포괄적인 관측성 기능이 포함되어 있어, 전용 Prometheus 모니터링 스택과 ClickHouse 서버에서 직접 노출되는 metric 엔드포인트를 통해 ClickHouse 서비스를 모니터링할 수 있습니다. 모든 관측성 데이터는 Cloud 계정 내부에만 유지되며, 이를 통해 모니터링 인프라를 전적으로 제어할 수 있습니다.


## Prometheus 모니터링 방식 \{#prometheus-monitoring\}

BYOC에서는 Prometheus를 사용하여 메트릭을 수집하고 시각화하는 두 가지 주요 방법이 있습니다:

1. **내장 Prometheus 스택에 연결**: BYOC Kubernetes 클러스터 내부에서 실행 중인 중앙 집중식으로 사전 설치된 Prometheus 인스턴스에 접근합니다.
2. **ClickHouse 메트릭을 직접 스크레이프**: 사용자가 운영하는 Prometheus 배포에서 각 ClickHouse 서비스가 노출하는 `/metrics_all` 엔드포인트를 스크레이프하도록 설정합니다.

### 모니터링 방식 비교 \{#monitoring-approaches-comparison\}

| Capability              | 기본 제공 Prometheus 스택                                          | ClickHouse 서비스에서 직접 스크레이핑                   |
|-------------------------|-------------------------------------------------------------------|------------------------------------------------------------|
| **Metrics Scope**       | ClickHouse, Kubernetes 및 지원 서비스의 메트릭을 통합 수집 (클러스터 전체 가시성 제공) | 개별 ClickHouse 서버의 메트릭만 제공             |
| **Setup Process**       | 프라이빗 로드 밸런서를 통한 프라이빗 네트워크 액세스 설정 필요 | Prometheus에서 퍼블릭 또는 프라이빗 ClickHouse 엔드포인트를 스크레이핑하도록 설정하면 됨 |
| **How You Connect**     | VPC/네트워크 내 프라이빗 로드 밸런서를 통해 연결         | 데이터베이스 액세스에 사용하는 것과 동일한 엔드포인트              |
| **Authentication**      | 불필요 (프라이빗 네트워크로 제한됨)                          | ClickHouse 서비스 자격 증명 사용                        |
| **Network Prerequisites** | 프라이빗 로드 밸런서 및 적절한 네트워크 연결 필요      | ClickHouse 엔드포인트에 액세스할 수 있는 모든 네트워크에서 사용 가능 |
| **Best Suited For**     | 인프라 및 서비스 전체에 대한 총체적 모니터링                      | 개별 서비스 중심 모니터링 및 통합                |
| **How to Integrate**    | 외부 Prometheus에서 federation을 구성하여 클러스터 메트릭을 수집 | ClickHouse 메트릭 엔드포인트를 Prometheus 설정에 직접 추가 |

**권장 사항**: 대부분의 사용 사례에서는 기본 제공 Prometheus 스택과 통합하는 방식을 권장합니다. 이 방식은 개별 ClickHouse 서버 메트릭만 제공하는 것과 달리, BYOC 배포의 모든 구성 요소(ClickHouse 서비스, Kubernetes 클러스터, 지원 서비스)에 대한 포괄적인 메트릭을 제공합니다. 

## 기본 제공 BYOC Prometheus 스택 \{#builtin-prometheus-stack\}

ClickHouse BYOC는 Prometheus, Grafana, AlertManager, 그리고 선택적으로 장기 메트릭 저장을 위한 Thanos를 포함한 완전한 Prometheus 모니터링 스택을 Kubernetes 클러스터 안에 배포합니다. 이 스택은 다음과 같은 대상에서 메트릭을 수집합니다.

- ClickHouse 서버와 ClickHouse Keeper
- Kubernetes 클러스터 및 시스템 구성 요소
- 하부 인프라 노드

### Prometheus 스택에 연결하기 \{#accessing-prometheus-stack\}

내장된 Prometheus 스택에 연결하려면 다음 단계를 수행합니다.

1. BYOC 환경에 대해 프라이빗 로드 밸런서를 활성화해 달라고 **ClickHouse Support에 문의하십시오.**
2. **Prometheus 엔드포인트 URL을 요청하십시오.** (ClickHouse Support에 요청)
3. 일반적으로 VPC 피어링 또는 기타 프라이빗 네트워크 구성을 통해 **Prometheus 엔드포인트로의 프라이빗 네트워크 연결을 확인하십시오.**

Prometheus 엔드포인트는 다음과 같은 형식을 가집니다.

```bash
https://prometheus-internal.<subdomain>.<region>.<cloud>.clickhouse-byoc.com
```

:::note
Prometheus 스택 URL은 프라이빗 네트워크 연결을 통해서만 접근할 수 있으며, 인증이 필요하지 않습니다. 해당 URL에 대한 접근은 VPC 피어링 또는 기타 프라이빗 연결 옵션을 통해 BYOC VPC에 도달할 수 있는 네트워크로만 제한됩니다.
:::


### 모니터링 도구와 통합하기 \{#prometheus-stack-integration\}

BYOC Prometheus 스택은 모니터링 환경에서 여러 가지 방식으로 활용할 수 있습니다:

**옵션 1: Prometheus API에 쿼리 실행**

* 사용 중인 모니터링 플랫폼이나 커스텀 대시보드에서 Prometheus API 엔드포인트를 직접 호출합니다.
* PromQL 쿼리를 사용하여 필요한 메트릭을 추출, 집계 및 시각화합니다.
* 맞춤형 대시보드나 알림 파이프라인을 구축할 때 적합합니다.

Prometheus 쿼리 엔드포인트:

```text
https://prometheus-internal.<subdomain>.<region>.<cloud>.clickhouse-byoc.com/query
```

**옵션 2: 자체 Prometheus로 메트릭 페더레이션**

* 외부 Prometheus 인스턴스를 구성하여 ClickHouse BYOC Prometheus 스택에서 메트릭을 페더레이션(Pull 방식으로 수집)합니다.
* 이를 통해 여러 환경 또는 클러스터에서 수집되는 메트릭을 통합하여 중앙에서 관리할 수 있습니다.
* Prometheus 페더레이션 구성 예:

```yaml
scrape_configs:
  - job_name: 'federate-clickhouse-byoc'
    scrape_interval: 15s
    honor_labels: true
    metrics_path: '/federate'
    params:
      'match[]':
        - '{job="clickhouse"}'
        - '{job="kubernetes"}'
    static_configs:
      - targets:
        - 'prometheus-internal.<subdomain>.<region>.<cloud>.clickhouse-byoc.com'
```


## ClickHouse 서비스 Prometheus 통합 \{#direct-prometheus-integration\}

ClickHouse 서비스는 사용자가 운영하는 Prometheus 인스턴스에서 직접 스크랩할 수 있는 Prometheus 호환 메트릭 엔드포인트를 노출합니다. 이 방식은 ClickHouse에 특화된 메트릭을 제공하지만, Kubernetes나 기타 지원 서비스의 메트릭은 포함하지 않습니다.

### Metrics 엔드포인트에 액세스하기 \{#metrics-endpoint\}

Metrics 엔드포인트는 ClickHouse 서비스 엔드포인트의 `/metrics_all` 경로에서 제공됩니다:

```bash
curl --user <username>:<password> https://<service-subdomain>.<byoc-subdomain>.<region>.<provider>.byoc.clickhouse-byoc.com:8443/metrics_all
```

**예시 응답:**

```bash
# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes The amount of bytes stored on disk `s3disk` in system database
# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929
# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts The number of broken detached parts
# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0
# HELP ClickHouse_CustomMetric_TotalNumberOfErrors The total number of errors on server since the last restart
# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```


### 인증 \{#authentication\}

메트릭 엔드포인트는 ClickHouse 자격 증명을 사용한 인증이 필요합니다. `default` 사용자를 사용하거나, 메트릭 스크레이핑만을 위해 최소 권한을 가진 전용 사용자를 생성하는 것을 권장합니다.

**필요한 권한:**

* 서비스에 접속하기 위한 `REMOTE` 권한
* 관련 시스템 테이블에 대한 `SELECT` 권한

**예시 사용자 설정:**

```sql
CREATE USER scrapping_user IDENTIFIED BY 'secure_password';
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


### Prometheus 구성 \{#configuring-prometheus\}

Prometheus 인스턴스에서 ClickHouse 메트릭 엔드포인트를 스크레이핑하도록 구성합니다.

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "clickhouse"
    static_configs:
      - targets: ["<service-subdomain>.<byoc-subdomain>.<region>.<provider>.byoc.clickhouse-byoc.com:8443"]
    scheme: https
    metrics_path: "/metrics_all"
    basic_auth:
      username: <username>
      password: <password>
    honor_labels: true
```

다음을 바꾸십시오:

* `<service-subdomain>.<byoc-subdomain>.<region>.<provider>.byoc.clickhouse-byoc.com:8443`를 실제 서비스 엔드포인트로 바꾸십시오.
* `<username>` 및 `<password>`를 스크래핑용 사용자 자격 증명으로 바꾸십시오.


## ClickHouse Mixin \{#clickhouse-mixin\}

대시보드를 바로 활용하려는 팀을 위해 ClickHouse는 Prometheus용 **ClickHouse Mixin**을 제공합니다. 이는 ClickHouse 클러스터 모니터링을 위해 특별히 설계된 미리 구성된 Grafana 대시보드입니다.

### Grafana 설정 및 ClickHouse Mix-in 가져오기 \{#setup-grafana-mixin\}

Prometheus 인스턴스가 ClickHouse 모니터링 스택과 통합되면, 다음 단계를 따라 Grafana에서 메트릭을 시각화할 수 있습니다.

1. **Grafana에서 Prometheus를 데이터 소스로 추가**  
   Grafana 사이드바에서 「Data sources」로 이동한 뒤 「Add data source」를 클릭하고 「Prometheus」를 선택합니다. Prometheus 인스턴스 URL과 필요한 자격 증명을 입력해 연결합니다.

<Image img={byoc_mixin_1} size="lg" alt="BYOC Mixin 1" background='black'/>

<Image img={byoc_mixin_2} size="lg" alt="BYOC Mixin 2" background='black'/>

<Image img={byoc_mixin_3} size="lg" alt="BYOC Mixin 3" background='black'/>

2. **ClickHouse 대시보드 가져오기**  
   Grafana에서 대시보드 영역으로 이동해 「Import」를 선택합니다. 대시보드 JSON 파일을 업로드하거나, 그 내용을 직접 붙여넣을 수 있습니다. JSON 파일은 ClickHouse mixin 리포지토리에서 다운로드합니다:  
   [ClickHouse Mix-in Dashboard JSON](https://github.com/ClickHouse/clickhouse-mixin/blob/main/dashboard_byoc.json)

<Image img={byoc_mixin_4} size="lg" alt="BYOC Mixin 4" background='black'/>

3. **메트릭 탐색**  
   대시보드를 가져오고 Prometheus 데이터 소스로 구성하면 ClickHouse Cloud 서비스에서 수집된 실시간 메트릭이 표시됩니다.

<Image img={byoc_mixin_5} size="lg" alt="BYOC Mixin 5" background='black'/>