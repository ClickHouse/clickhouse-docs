---
slug: /use-cases/observability/clickstack/integration-partners/odigos
title: 'Odigos를 사용해 OpenTelemetry를 ClickStack으로 전송하기'
sidebar_label: 'Odigos'
pagination_prev: null
pagination_next: null
description: 'Odigos로 Kubernetes 워크로드를 자동 계측하고 OTLP를 통해 텔레메트리를 ClickStack으로 내보내기'
doc_type: 'guide'
keywords: ['Odigos', 'ClickStack', 'ClickHouse', 'OpenTelemetry', 'eBPF', '자동 계측']
---

import PartnerBadge from '@theme/badges/PartnerBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<PartnerBadge />

:::note[요약]
이 가이드에서는 Odigos 텔레메트리를 ClickStack으로 내보내는 방법을 설명합니다. 다음 내용을 알아봅니다.

* Helm으로 Kubernetes에 Odigos 배포
* Odigos UI에서 소스 추가
* ClickStack을 대상으로 하는 OTLP HTTP 대상 추가
* ClickStack에서 로그, 메트릭, 트레이스 확인

Odigos는 코드 변경이나 재시작 없이 애플리케이션을 자동 계측하며, ClickStack은 데이터를 ClickHouse에 저장하고 쿼리합니다.

소요 시간: 10~20분
:::

{/* vale off */ }

## Odigos란? \{#what-is-odigos\}

{/* vale on */ }

[Odigos](https://odigos.io/)는 **eBPF**를 사용해 커널에서 애플리케이션을 계측하는 Kubernetes 및 VM용 계측 컨트롤 플레인입니다. 수집 작업이 커널에서 실행되므로 애플리케이션 오버헤드는 낮게 유지되면서도 높은 가시성을 확보할 수 있습니다. 애플리케이션 코드에 새 에이전트를 배포하거나 모든 서비스의 라이브러리 업그레이드를 기다리지 않아도 프로덕션급 OpenTelemetry 트레이스, 메트릭, 로그, 프로파일을 확보할 수 있습니다.

이 eBPF 계층이 대규모 환경에서도 심층적이고 일관된 텔레메트리를 가능하게 합니다. Odigos는 문제를 디버깅하거나 해결하는 데 도움이 되도록 필요할 때 더 심화된 계측을 자동으로 켜고 끌 수 있습니다.

* **코드 수준 Context** — 함수와 런타임 동작에 연결된 속성
* **HTTP 트래픽** — 서비스 전반의 요청과 응답
* **메시징 시스템** — Kafka 및 유사한 브로커의 payload와 메시지
* **상세한 오류 정보** — 장애 발생 시 스택 트레이스
* **사용자 정의 계측** — 코드 변경이나 재시작 없이 자동 계측이 닿지 않는 영역까지 적용 범위 확장

내부적으로 Odigos는 클러스터를 위한 전체 OpenTelemetry 파이프라인을 생성하고 관리합니다. 여기에는 부하에 따라 확장되는 collector, 선택한 백엔드로의 라우팅, 그리고 UI에서 제어하는 파이프라인 로직이 포함됩니다. **샘플링**을 정의해 데이터량을 관리하고, **PII masking**으로 민감한 데이터가 내보내기에 포함되지 않도록 하며, **OTTL rules**로 텔레메트리가 클러스터를 벗어나기 전에 필터링, 변환 또는 보강할 수 있습니다.

{/* vale off */ }

## Odigos + ClickStack를 선택해야 하는 이유 \{#why-odigos-clickstack\}

{/* vale on */ }

여러 서비스에 OpenTelemetry를 전반적으로 도입하는 작업은 대개 시간이 많이 들고, 애플리케이션 내부에 대해서도 제한적인 수준의 가시성만 제공합니다. Odigos는 Kubernetes에서 더 깊이 있는 텔레메트리를 위한 eBPF 기반 계측과 collector 운영을 처리하며, ClickStack은 ClickHouse 기반 스토리지와 대규모 텔레메트리를 쿼리할 수 있는 HyperDX UI를 제공합니다.

:::tip[핵심 요약]

* **Odigos**는 재시작 없이 모든 Kubernetes 워크로드를 자동 계측하고 OpenTelemetry 파이프라인을 자동으로 관리합니다.
* **ClickStack**은 로그, 메트릭, 트레이스를 ClickHouse에 저장하고 HyperDX에서 이를 확인할 수 있게 합니다.
  :::

## 필수 조건 \{#prerequisites\}

* Kubernetes 클러스터에서 접근할 수 있도록 **ClickStack**이 설치되어 있어야 합니다. [오픈 소스 ClickStack 시작하기](/use-cases/observability/clickstack/getting-started/oss) 또는 [Managed ClickStack 시작하기](/use-cases/observability/clickstack/getting-started/managed)를 참조하십시오.
* ClickStack의 **OTLP HTTP endpoint**(포트 `4318`)와 Odigos가 `Authorization` header로 전달할 인증 값이 필요합니다. 오픈 소스 ClickStack에서는 HyperDX UI의 **Team Settings → API Keys**에 있는 **API 수집 키**입니다. Managed ClickStack에서는 자체 standalone ClickStack collector를 시작할 때 설정한 **`OTLP_AUTH_TOKEN`**입니다.
* **Kubernetes 클러스터**가 필요합니다(eBPF 계측을 위해 커널 4.18 이상을 사용하는 Linux 노드).
* `odigos-system` 네임스페이스에 설치할 수 있도록 **Helm**, **kubectl**, 그리고 클러스터 자격 증명이 필요합니다.
* **Odigos Enterprise 온프레미스 토큰** — 액세스하려면 [Odigos 팀](https://odigos.io/)에 문의하십시오.

{/* vale off */ }

## ClickStack과 Odigos 통합 \{#integrate-odigos-clickstack\}

{/* vale on */ }

<VerticalStepper headerLevel="h4">
  #### Helm으로 Odigos 배포 \{#deploy-odigos\}

  Odigos Enterprise는 온프레미스 라이선스 토큰이 필요합니다. 셸에서 다음을 실행하여 내보내십시오:

  ```bash
  export ODIGOS_ONPREM_TOKEN="<your-enterprise-token>"
  ```

  또는 설치 전에 `odigos-pro`라는 이름의 Kubernetes Secret에 토큰을 저장할 수도 있습니다. [Odigos Enterprise 설치](https://docs.odigos.io/enterprise/setup/installation)를 참조하십시오.

  Odigos Helm 리포지토리를 추가하고 `odigos-system`에 차트를 설치하십시오:

  ```bash
  helm repo add odigos https://odigos-io.github.io/odigos/
  helm repo update

  helm upgrade --install odigos odigos/odigos \
    --namespace odigos-system \
    --create-namespace \
    --set onPremToken=$ODIGOS_ONPREM_TOKEN
  ```

  `--set` 플래그 또는 사용자 정의 values 파일(`-f`)을 사용하여 추가 구성 재정의를 전달할 수 있습니다. chart의 기본값은 GitHub의 [helm/odigos/values.yaml](https://github.com/odigos-io/odigos/blob/main/helm/odigos/values.yaml)에서 확인할 수 있습니다.

  Odigos 파드가 실행 중인지 확인합니다:

  ```bash
  kubectl get pods -n odigos-system
  ```

  #### Odigos UI에서 소스 추가 \{#add-sources\}

  1. Odigos UI 서비스로 포트 포워딩하세요:

  ```bash
  kubectl port-forward svc/ui -n odigos-system 3000:3000
  ```

  2. 브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.
  3. **SOURCES**로 이동하여 계측할 네임스페이스 또는 워크로드를 선택하세요.
  4. 계측할 모든 워크로드를 표시한 후 하단의 Done을 클릭하세요.
  5. Sources 컬럼에서 워크로드에 계측이 성공적으로 적용되었는지 확인하십시오.

  #### Odigos UI에서 ClickStack을 대상으로 추가하기 \{#add-destination-ui\}

  ClickStack으로 텔레메트리를 전송하려면 Odigos에서 **OTLP HTTP** 대상을 추가하십시오. 정확한 구성은 ClickStack의 배포 방식에 따라 달라집니다. Open Source ClickStack은 OpenTelemetry Collector가 번들로 포함되어 있으며, 수집 키는 HyperDX UI에서 자동으로 생성됩니다. Managed ClickStack은 독립형(standalone) ClickStack collector를 직접 실행하고, 컨테이너 시작 시 인증 토큰을 직접 지정합니다.

  :::tip[대안: ClickHouse에 직접 쓰기]
  Kubernetes 클러스터에서 ClickHouse에 접근할 수 있다면, OTLP collector를 생략하고 Odigos의 [네이티브 **ClickHouse** 대상](#native-clickhouse-destination)을 직접 사용할 수 있습니다. 이 방법은 오픈 소스 및 Managed ClickStack 모두에서 지원됩니다.
  :::

  <Tabs groupId="clickstack-deployment">
    <TabItem value="oss-clickstack" label="Open Source ClickStack" default>
      오픈 소스 ClickStack에서는 예를 들어 올인원 이미지에 gateway OpenTelemetry collector가 포함되어 있으며, 수집 API key는 HyperDX에서 자동으로 생성됩니다.

      1. Odigos UI에서 **Add Destination**을 클릭하고 **OTLP HTTP**를 선택합니다.
      2. **OTLP HTTP Endpoint**를 ClickStack collector로 설정합니다(예: `http://clickstack.example.com:4318`). endpoint에 대한 자세한 내용은 [OpenTelemetry로 수집하기](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-data-to-collector-oss)를 참조하십시오.
      3. ClickStack UI의 **Team Settings → API Keys**에서 수집 API key를 복사합니다.
      4. **Headers**에 다음을 추가합니다.
         * **Key**: `Authorization`
         * **Value**: 수집 API key
      5. **Logs**, **Metrics**, **Traces**를 활성화합니다.
      6. 대상을 저장합니다.
    </TabItem>

    <TabItem value="managed-clickstack" label="Managed ClickStack">
      Managed ClickStack는 호스팅되는 OpenTelemetry collector를 제공하지 않으며 UI에 수집 key도 표시하지 않습니다. 대신 [standalone 모드로 ClickStack 배포판 collector를 실행](/use-cases/observability/clickstack/ingesting-data/otel-collector#configuring-the-collector)해야 하며, 컨테이너 시작 시 `OTLP_AUTH_TOKEN` 환경 변수를 통해 인증 토큰을 설정해야 합니다. 그러면 Odigos는 동일한 토큰을 `Authorization` header에 담아 해당 collector로 OTLP HTTP 트래픽을 전송합니다.

      1. standalone 모드로 ClickStack collector를 시작하고 ClickHouse Cloud 서비스를 가리키도록 설정한 다음, 원하는 `OTLP_AUTH_TOKEN`으로 보호합니다.

         ```shell
         export CLICKHOUSE_ENDPOINT=<HTTPS_ENDPOINT>
         export CLICKHOUSE_USER=<CLICKHOUSE_USER>
         export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
         export OTLP_AUTH_TOKEN="a_very_secure_string"

         docker run \
           -e OTLP_AUTH_TOKEN=${OTLP_AUTH_TOKEN} \
           -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
           -e CLICKHOUSE_USER=${CLICKHOUSE_USER} \
           -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
           -p 4317:4317 \
           -p 4318:4318 \
           clickhouse/clickstack-otel-collector:latest
         ```

         TLS, 전용 수집 사용자, 기타 프로덕션 권장 사항은 [collector 보안 설정](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector)을 참조하십시오.
      2. Odigos UI에서 **Add Destination**을 클릭하고 **OTLP HTTP**를 선택합니다.
      3. **OTLP HTTP Endpoint**를 방금 시작한 standalone collector로 설정합니다(예: `http://my-collector.example.com:4318`).
      4. **Headers**에 다음을 추가합니다.
         * **Key**: `Authorization`
         * **Value**: collector에 설정한 `OTLP_AUTH_TOKEN` 값
      5. **Logs**, **Metrics**, **Traces**를 활성화합니다.
      6. 대상을 저장합니다.

      :::note[선택 사항: Kubernetes manifest]
      UI 대신 `Destination` manifest를 사용해 동일한 대상을 구성할 수 있습니다. 고급 구성의 [Kubernetes manifest로 대상 구성하기](#destination-manifest)를 참조하십시오.
      :::
    </TabItem>
  </Tabs>

  #### ClickStack에서 텔레메트리 확인 \{#verify-telemetry\}

  1. ClickStack UI(HyperDX)를 여십시오:
     * **오픈 소스 ClickStack**: 예를 들어 all-in-one 이미지에서는 `http://<host>:8080`으로 접속합니다.
     * **Managed ClickStack**: [ClickHouse Cloud 콘솔](https://console.clickhouse.cloud)에서 서비스를 연 후 **Launch ClickStack**을 클릭하세요. 자세한 내용은 [ClickStack UI로 이동](/use-cases/observability/clickstack/getting-started/managed#navigate-to-clickstack-ui-cloud)을 참조하십시오.
  2. 계측이 적용된 서비스의 데이터는 **Logs**, **Metrics**, **Traces**에서 확인하세요.
  3. `odigos.version`으로 트레이스를 필터링하여 종단 간 내보내기가 정상적으로 이루어지는지 확인하십시오.

  데이터가 누락된 경우 collector 로그를 확인하세요: `kubectl logs deploy/odigos-gateway -n odigos-system`
</VerticalStepper>

## 고급 구성 \{#advanced-configuration\}

### HyperDX 로그 정규화기 \{#hyperdx-log-normalizer\}

Odigos의 네이티브 **ClickHouse** 대상을 사용해 ClickHouse로 직접 내보내는 경우(ClickStack으로 OTLP HTTP를 사용하는 대신), **HyperDX 로그 정규화기**(`HYPERDX_LOG_NORMALIZER: true`)를 활성화하세요. 이 기능은 JSON 형식의 로그 본문을 파싱하고 속성을 정규화하여 ClickStack UI에서 더 쉽게 쿼리할 수 있도록 합니다.

### 네이티브 ClickHouse 대상 \{#native-clickhouse-destination\}

클러스터에서 ClickHouse에 직접 접근할 수 있다면, OTLP HTTP 대신 Odigos의 네이티브 **ClickHouse** 대상을 사용할 수 있습니다. UI 또는 매니페스트에서 ClickHouse 엔드포인트, 데이터베이스 이름, 스키마 옵션을 구성하십시오. 자세한 내용은 [Odigos ClickHouse destination](https://docs.odigos.io/backends/clickhouse)을 참조하십시오.

* **프로덕션 스키마**: `CLICKHOUSE_CREATE_SCHEME`를 `false`로 설정하고 자체 DDL을 적용하십시오.
* **TLS / 인증**: `CLICKHOUSE_TLS_ENABLED`, `CLICKHOUSE_USERNAME`, 그리고 비밀번호를 위한 Kubernetes Secret을 사용하십시오.

### Kubernetes 매니페스트를 사용해 대상 구성 \{#destination-manifest\}

**OTLP HTTP (ClickStack)**

```yaml
apiVersion: odigos.io/v1alpha1
kind: Destination
metadata:
  name: clickstack
  namespace: odigos-system
spec:
  type: otlphttp
  destinationName: otlphttp
  signals:
    - TRACES
    - METRICS
    - LOGS
  data:
    OTLP_HTTP_ENDPOINT: 'http://clickstack.example.com:4318'
    # API ingestion key for open source ClickStack, or OTLP_AUTH_TOKEN for Managed ClickStack
    OTLP_HTTP_HEADERS: 'Authorization:<YOUR_AUTHORIZATION_VALUE>'
```

**ClickHouse (직접)**

```yaml
apiVersion: odigos.io/v1alpha1
kind: Destination
metadata:
  name: clickhouse
  namespace: odigos-system
spec:
  type: clickhouse
  destinationName: clickhouse
  signals:
    - TRACES
    - METRICS
    - LOGS
  data:
    CLICKHOUSE_ENDPOINT: 'http://clickstack.example.com:8123'
    CLICKHOUSE_DATABASE_NAME: 'otel'
    CLICKHOUSE_CREATE_SCHEME: 'true'
```

매니페스트를 적용하세요:

```bash
kubectl apply -f destination.yaml
```

{/* vale off */ }

### Odigos VM 에이전트 \{#odigos-vm-agent\}

{/* vale on */ }

[Odigos VM Agent](https://docs.odigos.io/vmagent/overview)는 eBPF를 사용해 Linux 프로세스, systemd 서비스, 그리고/또는 Docker 컨테이너를 계측합니다. 텔레메트리는 클러스터 기반 Odigos와 동일한 대상으로 전송되며, 여기에는 OTLP HTTP를 통한 ClickStack도 포함됩니다.

VM Agent는 Odigos Pro의 일부입니다. 설정, 소스, 대상 구성에 대해서는 [VM Agent 개요](https://docs.odigos.io/vmagent/overview)를 참조하십시오.

{/* vale off */ }

### Odigos Central \{#odigos-central\}

{/* vale on */ }

[Odigos Central](https://docs.odigos.io/central/overview)은 각 클러스터를 개별적으로 구성하는 대신, 하나의 UI에서 여러 Kubernetes 클러스터 전반에 걸친 계측, 대상, 파이프라인 구성을 관리할 수 있는 중앙 집중식 컨트롤 플레인입니다.

Odigos Central은 Odigos Enterprise에서 사용할 수 있습니다. 다중 클러스터 관리, SSO 및 통합 샘플링 규칙에 관한 내용은 [Central 개요](https://docs.odigos.io/central/overview)를 참조하십시오.

## 다음 단계 \{#next-steps\}

* ClickStack에서 계측된 서비스 전반의 **트레이스 탐색**
* Odigos가 내보내는 메트릭용 **대시보드 구축**
* 보존 기간과 쿼리 패턴에 맞게 **ClickHouse 스키마(schema)와 TTL 조정**

## 더 알아보기 \{#read-more\}

* [Odigos Enterprise 설치](https://docs.odigos.io/enterprise/setup/installation)
* [Odigos ClickHouse 대상](https://docs.odigos.io/backends/clickhouse)
* [Odigos VM Agent 개요](https://docs.odigos.io/vmagent/overview)
* [Odigos Central 개요](https://docs.odigos.io/central/overview)
* [프로덕션에서 추측은 그만: ClickHouse와 Odigos로 대규모 full-fidelity tracing 구현](https://clickhouse.com/blog/odigos-full-fidelity-tracing)
* [오픈 소스 ClickStack 시작하기](/use-cases/observability/clickstack/getting-started/oss)