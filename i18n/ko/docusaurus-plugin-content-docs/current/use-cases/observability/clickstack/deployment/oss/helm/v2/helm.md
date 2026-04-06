---
slug: /use-cases/observability/clickstack/deployment/helm
title: 'Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 2
description: 'Helm을 사용한 ClickStack 배포 - ClickHouse 관측성 스택'
doc_type: 'guide'
keywords: ['ClickStack Helm 차트', 'Helm ClickHouse 배포', 'HyperDX Helm 설치', 'Kubernetes 관측성 스택', 'ClickStack Kubernetes 배포']
---

import Image from '@theme/IdealImage';
import hyperdx_24 from '@site/static/images/use-cases/observability/hyperdx-24.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import JSONSupport from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

:::warning 차트 버전 2.x
이 페이지에서는 **v2.x** 서브차트 기반 Helm 차트를 설명합니다. 아직 v1.x 인라인 템플릿 차트를 사용 중이라면 [v1.x Helm 가이드](/docs/use-cases/observability/clickstack/deployment/helm-v1)를 참조하십시오. 마이그레이션 단계는 [업그레이드 가이드](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)를 참조하십시오.
:::

ClickStack용 Helm 차트는 [여기](https://github.com/ClickHouse/ClickStack-helm-charts)에서 확인할 수 있으며, 프로덕션 배포에 **권장되는** 방법입니다.

v2.x 차트는 **2단계 설치** 방식을 사용합니다. 먼저 `clickstack-operators` 차트를 통해 오퍼레이터와 CRD를 설치한 다음, 기본 `clickstack` 차트를 통해 ClickHouse, MongoDB, OpenTelemetry collector용 오퍼레이터 관리 커스텀 리소스를 생성합니다.

기본적으로 Helm 차트는 다음을 포함한 모든 핵심 구성 요소를 프로비저닝합니다.

* **ClickHouse** — `ClickHouseCluster` 및 `KeeperCluster` 커스텀 리소스를 통해 [ClickHouse Operator](https://clickhouse.com/docs/clickhouse-operator/overview)가 관리합니다
* **HyperDX** — 관측성 UI 및 API
* **OpenTelemetry (OTel) collector** — 서브차트로 [공식 OpenTelemetry Collector Helm 차트](https://github.com/open-telemetry/opentelemetry-helm-charts)를 통해 배포됩니다
* **MongoDB** — `MongoDBCommunity` 커스텀 리소스를 통해 [MongoDB Kubernetes Operator (MCK)](https://github.com/mongodb/mongodb-kubernetes)가 관리합니다

하지만 기존 ClickHouse 배포와 통합하도록 쉽게 사용자 지정할 수 있습니다. 예를 들어 **ClickHouse Cloud**에서 호스팅되는 배포와 통합할 수 있습니다.

이 차트는 다음을 포함한 Kubernetes 표준 모범 사례를 지원합니다.

* `values.yaml`을 통한 환경별 구성
* 리소스 제한 및 파드 수준 확장
* TLS 및 인그레스 구성
* 시크릿 관리 및 인증 설정
* 차트와 함께 임의의 Kubernetes 객체(NetworkPolicy, HPA, ALB Ingress 등)를 배포하기 위한 [추가 매니페스트](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests)

### 적합한 용도 \{#suitable-for\}

* 개념 검증
* 프로덕션 환경

## 배포 절차 \{#deployment-steps\}

<br />

<VerticalStepper headerLevel="h3">
  ### 사전 요구 사항 \{#prerequisites\}

  * [Helm](https://helm.sh/) v3+
  * Kubernetes 클러스터(v1.20+ 권장)
  * 클러스터와 통신할 수 있도록 구성된 `kubectl`

  ### ClickStack Helm 저장소 추가 \{#add-the-clickstack-helm-repository\}

  ClickStack Helm 저장소를 추가합니다:

  ```shell
  helm repo add clickstack https://clickhouse.github.io/ClickStack-helm-charts
  helm repo update
  ```

  ### 오퍼레이터 설치 \{#install-the-operators\}

  먼저 오퍼레이터 차트를 설치하십시오. 그러면 메인 차트에 필요한 CRD가 등록됩니다:

  ```shell
  helm install clickstack-operators clickstack/clickstack-operators
  ```

  계속하기 전에 오퍼레이터 파드가 준비될 때까지 기다리십시오:

  ```shell
  kubectl get pods -l app.kubernetes.io/instance=clickstack-operators
  ```

  ### ClickStack 설치 \{#installing-clickstack\}

  오퍼레이터가 실행 중이면 메인 차트를 설치합니다:

  ```shell
  helm install my-clickstack clickstack/clickstack
  ```

  ### 설치 확인 \{#verify-the-installation\}

  설치가 올바르게 되었는지 확인하십시오:

  ```shell
  kubectl get pods -l "app.kubernetes.io/name=clickstack"
  ```

  모든 파드가 준비되면 계속 진행하십시오.

  ### 포트 포워딩 \{#forward-ports\}

  포트 포워딩을 사용하면 HyperDX에 액세스하여 설정할 수 있습니다. 프로덕션에 배포하는 경우에는 적절한 네트워크 액세스, TLS 종료, 확장성을 보장할 수 있도록 대신 인그레스 또는 로드 밸런서를 통해 서비스를 외부에 노출해야 합니다. 포트 포워딩은 로컬 개발 또는 일회성 관리 작업에 가장 적합하며, 장기 운영 환경이나 고가용성 환경에는 적합하지 않습니다.

  ```shell
  kubectl port-forward \
    pod/$(kubectl get pod -l app.kubernetes.io/name=clickstack -o jsonpath='{.items[0].metadata.name}') \
    8080:3000
  ```

  :::tip 프로덕션 인그레스 설정
  프로덕션 배포에서는 포트 포워딩 대신 TLS를 사용하여 인그레스를 구성하십시오. 자세한 설정 방법은 [인그레스 구성 가이드](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup)를 참조하십시오.
  :::

  ### UI로 이동 \{#navigate-to-the-ui\}

  인터페이스 HyperDX에 액세스하려면 [http://localhost:8080](http://localhost:8080)에 접속하십시오.

  요구 사항을 충족하는 사용자 이름과 비밀번호를 입력해 사용자를 생성하십시오.

  <Image img={hyperdx_login} alt="인터페이스 HyperDX" size="lg" />

  `Create`를 클릭하면 Helm 차트로 배포한 ClickHouse 인스턴스용 데이터 소스가 생성됩니다.

  :::note 기본 연결 재정의
  통합된 ClickHouse 인스턴스에 대한 기본 연결은 재정의할 수 있습니다. 자세한 내용은 [&quot;ClickHouse Cloud 사용&quot;](#using-clickhouse-cloud)를 참조하십시오.
  :::

  ### 값 사용자 지정 (선택 사항) \{#customizing-values\}

  `--set` 플래그를 사용하여 설정을 사용자 지정할 수 있습니다. 예를 들면 다음과 같습니다.

  ```shell
  helm install my-clickstack clickstack/clickstack --set key=value
  ```

  또는 `values.yaml`을 편집하십시오. 기본값을 가져오려면 다음을 실행하십시오:

  ```shell
  helm show values clickstack/clickstack > values.yaml
  ```

  구성 예시:

  ```yaml
  hyperdx:
    frontendUrl: "https://hyperdx.example.com"

    deployment:
      replicas: 2
      resources:
        limits:
          cpu: "2"
          memory: 4Gi
        requests:
          cpu: 500m
          memory: 1Gi

    ingress:
      enabled: true
      host: hyperdx.example.com
      tls:
        enabled: true
        tlsSecretName: "hyperdx-tls"
  ```

  ```shell
  helm install my-clickstack clickstack/clickstack -f values.yaml
  ```

  ### 시크릿 사용(선택 사항) \{#using-secrets\}

  v2.x 차트는 values의 `hyperdx.secrets`로 채워지는 통합 시크릿(`clickstack-secret`)을 사용합니다. ClickHouse 비밀번호, MongoDB 비밀번호, HyperDX API 키를 포함한 모든 민감한 환경 변수는 이 단일 시크릿을 통해 관리됩니다.

  시크릿 값을 재정의하려면:

  ```yaml
  hyperdx:
    secrets:
      HYPERDX_API_KEY: "your-api-key"
      CLICKHOUSE_PASSWORD: "your-clickhouse-password"
      CLICKHOUSE_APP_PASSWORD: "your-app-password"
      MONGODB_PASSWORD: "your-mongodb-password"
  ```

  외부 시크릿 관리(예: secrets operator 사용)에서는 기존 Kubernetes 시크릿을 참조할 수 있습니다:

  ```yaml
  hyperdx:
    useExistingConfigSecret: true
    existingConfigSecret: "my-external-secret"
    existingConfigConnectionsKey: "connections.json"
    existingConfigSourcesKey: "sources.json"
  ```

  :::tip API 키 관리
  여러 구성 방법과 파드 재시작 절차를 포함한 API 키 설정에 대한 자세한 안내는 [API 키 설정 가이드](/docs/use-cases/observability/clickstack/deployment/helm-configuration#api-key-setup)를 참조하십시오.
  :::
</VerticalStepper>

## ClickHouse Cloud 사용 \{#using-clickhouse-cloud\}

ClickHouse Cloud를 사용하는 경우 내장 ClickHouse 인스턴스를 비활성화하고 Cloud 자격 증명을 설정하십시오:

```yaml
# values-clickhouse-cloud.yaml
clickhouse:
  enabled: false

hyperdx:
  secrets:
    CLICKHOUSE_PASSWORD: "your-cloud-password"
    CLICKHOUSE_APP_PASSWORD: "your-cloud-password"

  useExistingConfigSecret: true
  existingConfigSecret: "clickhouse-cloud-config"
  existingConfigConnectionsKey: "connections.json"
  existingConfigSourcesKey: "sources.json"
```

연결 시크릿을 별도로 생성하세요:

```bash
cat <<EOF > connections.json
[
  {
    "name": "ClickHouse Cloud",
    "host": "https://your-cloud-instance.clickhouse.cloud",
    "port": 8443,
    "username": "default",
    "password": "your-cloud-password"
  }
]
EOF

kubectl create secret generic clickhouse-cloud-config \
  --from-file=connections.json=connections.json

rm connections.json
```

```shell
helm install my-clickstack clickstack/clickstack -f values-clickhouse-cloud.yaml
```

:::tip 진계 외부 구성
프로덕션 배포에서 시크릿 기반 구성, 외부 OTel collector 또는 최소 구성을 사용하는 경우 [배포 옵션 가이드](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options)를 참조하세요.
:::

## 프로덕션 관련 참고 사항 \{#production-notes\}

기본적으로 이 차트는 ClickHouse, MongoDB 및 OTel collector를 설치합니다. 프로덕션 환경에서는 ClickHouse와 OTel collector를 별도로 관리하는 것이 좋습니다.

ClickHouse와 OTel collector를 비활성화하려면:

```yaml
clickhouse:
  enabled: false

otel-collector:
  enabled: false
```

:::tip 프로덕션 모범 사례
고가용성 구성, 리소스 관리, 인그레스/TLS 설정, Cloud별 구성(GKE, EKS, AKS)을 포함한 프로덕션 배포 관련 내용은 다음 문서를 참조하십시오:

* [구성 가이드](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - 인그레스, TLS 및 시크릿 관리
* [Cloud 배포](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - Cloud별 설정 및 프로덕션 체크리스트
  :::

## 작업 구성 \{#task-configuration\}

기본적으로 차트 설정에는 CronJob으로 구성된 작업이 하나 있으며, 이 작업은 알림을 트리거해야 하는지 확인합니다. v2.x에서는 작업 구성이 `hyperdx.tasks` 아래로 옮겨졌습니다:

| Parameter                             | Description                                                                                                                     | Default          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `hyperdx.tasks.enabled`               | 클러스터에서 cron 작업을 활성화 또는 비활성화합니다. 기본적으로 HyperDX 이미지는 프로세스 내에서 cron 작업을 실행합니다. 클러스터에서 별도의 cron 작업을 사용하는 것이 더 적합하다면 `true`로 변경하십시오. | `false`          |
| `hyperdx.tasks.checkAlerts.schedule`  | check-alerts 작업의 cron 스케줄                                                                                                       | `*/1 * * * *`    |
| `hyperdx.tasks.checkAlerts.resources` | check-alerts 작업의 리소스 요청량과 제한값                                                                                                   | `values.yaml` 참조 |

## 차트 업그레이드 \{#upgrading-the-chart\}

새 버전으로 업그레이드하려면:

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

사용 가능한 차트 버전을 확인하려면:

```shell
helm search repo clickstack
```

:::note v1.x에서 업그레이드
v1.x inline-template chart에서 업그레이드하는 경우, 마이그레이션 방법은 [Upgrade guide](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)를 참조하십시오. 이는 호환되지 않는 변경 사항이므로, 현재 위치에서 `helm upgrade`를 수행하는 방식은 지원되지 않습니다.
:::

## ClickStack 제거 \{#uninstalling-clickstack\}

설치의 역순으로 제거하십시오:

```shell
helm uninstall my-clickstack            # Remove app + CRs first
helm uninstall clickstack-operators     # Remove operators + CRDs
```

**주의:** MongoDB 및 ClickHouse Operator가 생성한 PersistentVolumeClaims(PVC)는 `helm uninstall`을 실행해도 **삭제되지 않습니다**. 이는 실수로 데이터가 손실되는 것을 방지하기 위한 의도된 동작입니다. PVC를 정리하려면 다음 문서를 참조하십시오.

* [MongoDB Kubernetes Operator docs](https://github.com/mongodb/mongodb-kubernetes/tree/master/docs/mongodbcommunity)
* [ClickHouse Operator cleanup docs](https://clickhouse.com/docs/clickhouse-operator/managing-clusters/cleanup)

## 문제 해결 \{#troubleshooting\}

### 로그 확인 \{#checking-logs\}

```shell
kubectl logs -l app.kubernetes.io/name=clickstack
```

### 설치 실패 디버깅 \{#debugging-a-failed-install\}

```shell
helm install my-clickstack clickstack/clickstack --debug --dry-run
```

### 배포 확인하기 \{#verifying-deployment\}

```shell
kubectl get pods -l app.kubernetes.io/name=clickstack
```

:::tip 추가 문제 해결 리소스
인그레스 관련 이슈, TLS 문제 또는 Cloud 배포 문제 해결은 다음을 참조하십시오:

* [인그레스 문제 해결](/docs/use-cases/observability/clickstack/deployment/helm-configuration#troubleshooting-ingress) - 자산 제공, 경로 재작성, 브라우저 문제
* [Cloud 배포](/docs/use-cases/observability/clickstack/deployment/helm-cloud#loadbalancer-dns-resolution-issue) - GKE OpAMP 이슈 및 Cloud 관련 문제
  :::

<JSONSupport />

다음 환경 변수는 `values.yaml`의 `hyperdx.config`를 통해 설정할 수 있습니다:

```yaml
hyperdx:
  config:
    BETA_CH_OTEL_JSON_SCHEMA_ENABLED: "true"
    OTEL_AGENT_FEATURE_GATE_ARG: "--feature-gates=clickhouse.json"
```

또는 `--set`을 사용하여:

```shell
helm install my-clickstack clickstack/clickstack \
  --set "hyperdx.config.BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true" \
  --set "hyperdx.config.OTEL_AGENT_FEATURE_GATE_ARG=--feature-gates=clickhouse.json"
```

## 관련 문서 \{#related-documentation\}

### 배포 가이드 \{#deployment-guides\}

* [배포 옵션](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 외부 ClickHouse, OTel collector 및 최소 구성 배포
* [구성 가이드](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API 키, 시크릿 및 인그레스 설정
* [Cloud 배포](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE, EKS, AKS 구성 및 프로덕션 환경 모범 사례
* [업그레이드 가이드](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - v1.x에서 v2.x로 마이그레이션
* [추가 매니페스트](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) - 차트와 함께 사용자 지정 Kubernetes 객체 배포

### v1.x 문서 \{#v1x-documentation\}

* [Helm (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-v1) - v1.x 배포 가이드
* [구성 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - v1.x 구성
* [배포 옵션 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1) - v1.x 배포 옵션
* [Cloud 배포 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - v1.x Cloud 구성

### 추가 자료 \{#additional-resources\}

* [ClickStack 시작 가이드](/use-cases/observability/clickstack/getting-started) - ClickStack 소개
* [ClickStack Helm 차트 저장소](https://github.com/ClickHouse/ClickStack-helm-charts) - 차트 소스 코드 및 values 참조
* [Kubernetes 문서](https://kubernetes.io/docs/) - Kubernetes 참조
* [Helm 문서](https://helm.sh/docs/) - Helm 참조