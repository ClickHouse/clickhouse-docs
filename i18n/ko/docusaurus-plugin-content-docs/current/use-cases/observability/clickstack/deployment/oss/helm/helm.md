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

:::warning 차트 마이그레이션
현재 `hdx-oss-v2` 차트를 사용 중인 경우 `clickstack` 차트로 마이그레이션하십시오. `hdx-oss-v2` 차트는 현재 유지 보수 모드이며 더 이상 새로운 기능이 추가되지 않습니다. 모든 신규 개발은 `clickstack` 차트에 집중되고 있으며, 이 차트는 동일한 기능을 제공하면서 더 나은 네이밍과 구성 방식을 제공합니다.
:::

ClickStack용 Helm 차트는 [여기](https://github.com/ClickHouse/ClickStack-helm-charts)에서 확인할 수 있으며, 프로덕션 환경 배포에 **권장되는** 방법입니다.

기본적으로 Helm 차트는 다음을 포함한 모든 핵심 컴포넌트를 자동으로 생성합니다:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB** (지속적인 애플리케이션 상태용)

또한, 기존 ClickHouse 배포와 통합하도록 쉽게 커스터마이징할 수 있습니다. 예를 들어 **ClickHouse Cloud**에 호스팅된 배포와 연동할 수 있습니다.

이 차트는 다음을 포함한 표준 Kubernetes 모범 사례를 지원합니다:

* `values.yaml`을 통한 환경별 설정
* 리소스 제한 및 파드 수준 스케일링
* TLS 및 인그레스 설정
* 시크릿 관리와 인증 설정


### 적용 대상 \{#suitable-for\}

* 개념 검증(PoC)
* 프로덕션 환경

## 배포 절차 \{#deployment-steps\}

<br/>

<VerticalStepper headerLevel="h3">
  ### 사전 요구 사항

  * [Helm](https://helm.sh/) v3+
  * Kubernetes 클러스터 (v1.20+ 버전 권장)
  * 클러스터와 상호 작용하도록 설정된 `kubectl`

  ### ClickStack Helm 리포지토리 추가하기

  ClickStack Helm 리포지토리를 추가하세요:

  ```shell
  helm repo add clickstack https://clickhouse.github.io/ClickStack-helm-charts
  helm repo update
  ```

  ### ClickStack 설치하기

  기본값으로 ClickStack 차트를 설치하세요:

  ```shell
  helm install my-clickstack clickstack/clickstack
  ```

  ### 설치 확인하기

  설치를 확인하세요:

  ```shell
  kubectl get pods -l "app.kubernetes.io/name=clickstack"
  ```

  모든 파드가 준비되면 다음 단계로 진행하세요.

  ### 포트 포워드

  포트 포워딩을 사용하면 HyperDX에 접근하고 설정할 수 있습니다. 프로덕션 환경에 배포하는 사용자는 인그레스 또는 로드 밸런서를 통해 서비스를 노출하여 적절한 네트워크 접근, TLS 종료 및 확장성을 보장하십시오. 포트 포워딩은 로컬 개발 또는 일회성 관리 작업에 적합하며, 장기 운영이나 고가용성 환경에는 적합하지 않습니다.

  ```shell
  kubectl port-forward \
    pod/$(kubectl get pod -l app.kubernetes.io/name=clickstack -o jsonpath='{.items[0].metadata.name}') \
    8080:3000
  ```

  :::tip 프로덕션 인그레스 설정
  프로덕션 배포에서는 포트 포워딩 대신 TLS가 적용된 인그레스를 구성하세요. 자세한 설정 방법은 [인그레스 구성 가이드](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup)를 참조하세요.
  :::

  ### UI로 이동

  [http://localhost:8080](http://localhost:8080)에 접속하여 HyperDX UI에 액세스하세요.

  요구 사항을 충족하는 사용자 이름과 비밀번호를 제공하여 사용자를 생성하세요.

  <Image img={hyperdx_login} alt="HyperDX UI" size="lg" />

  `Create`를 클릭하면 Helm 차트로 배포된 ClickHouse 인스턴스에 대한 데이터 소스가 생성됩니다.

  :::note 기본 연결 재정의
  통합된 ClickHouse 인스턴스에 대한 기본 연결을 재정의할 수 있습니다. 자세한 내용은 [&quot;ClickHouse Cloud 사용&quot;](#using-clickhouse-cloud)을 참조하세요.
  :::

  대체 ClickHouse 인스턴스를 사용하는 예시는 [&quot;ClickHouse Cloud 연결 생성&quot;](/docs/use-cases/observability/clickstack/getting-started/oss#create-a-cloud-connection)을 참조하세요.

  ### 값 사용자 지정 (선택 사항)

  `--set` 플래그를 사용하여 설정을 사용자 지정할 수 있습니다. 예를 들면 다음과 같습니다:

  ```shell
  helm install my-clickstack clickstack/clickstack --set key=value
  ```

  또는 `values.yaml` 파일을 편집하십시오. 기본값을 확인하려면:

  ```shell
  helm show values clickstack/clickstack > values.yaml
  ```

  설정 예시:

  ```yaml
  replicaCount: 2
  resources:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 250m
      memory: 256Mi
  ingress:
    enabled: true
    annotations:
      kubernetes.io/ingress.class: nginx
    hosts:
      - host: hyperdx.example.com
        paths:
          - path: /
            pathType: ImplementationSpecific
  ```

  ```shell
  helm install my-clickstack clickstack/clickstack -f values.yaml
  ```

  ### 시크릿 사용(선택 사항)

  API 키 또는 데이터베이스 자격 증명과 같은 민감한 데이터를 처리하려면 Kubernetes 시크릿을 사용하세요. HyperDX Helm 차트는 수정하여 클러스터에 적용할 수 있는 기본 시크릿 파일을 제공합니다.

  #### 사전 구성된 시크릿 사용하기

  Helm 차트에는 [`charts/clickstack/templates/secrets.yaml`](https://github.com/ClickHouse/ClickStack-helm-charts/blob/main/charts/clickstack/templates/secrets.yaml)에 위치한 기본 시크릿 템플릿이 포함되어 있습니다. 해당 파일은 시크릿 관리를 위한 기본 구조를 제공합니다.

  시크릿을 수동으로 적용해야 하는 경우, 제공된 `secrets.yaml` 템플릿을 수정한 후 적용하세요:

  ```yaml
  apiVersion: v1
  kind: Secret
  metadata:
    name: hyperdx-secret
    annotations:
      "helm.sh/resource-policy": keep
  type: Opaque
  data:
    API_KEY: <base64-encoded-api-key>
  ```

  클러스터에 시크릿을 적용하세요:

  ```shell
  kubectl apply -f secrets.yaml
  ```

  #### 사용자 지정 시크릿 생성

  필요한 경우, 사용자 정의 Kubernetes 시크릿을 수동으로 생성하세요:

  ```shell
  kubectl create secret generic hyperdx-secret \
    --from-literal=API_KEY=my-secret-api-key
  ```

  #### 시크릿 참조

  `values.yaml`에서 시크릿을 참조하려면:

  ```yaml
  hyperdx:
    apiKey:
      valueFrom:
        secretKeyRef:
          name: hyperdx-secret
          key: API_KEY
  ```

  :::tip API 키 관리
  여러 구성 방법 및 파드 재시작 절차를 포함한 자세한 API 키 설정 지침은 [API 키 설정 가이드](/docs/use-cases/observability/clickstack/deployment/helm-configuration#api-key-setup)를 참조하세요.
  :::
</VerticalStepper>

## ClickHouse Cloud 사용

ClickHouse Cloud를 사용하는 경우, Helm 차트로 배포된 ClickHouse 인스턴스를 비활성화하고 Cloud 자격 증명을 지정합니다:

```shell
# specify ClickHouse Cloud credentials
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # full https url
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

# how to overwrite default connection
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} \
  --set clickhouse.config.users.otelUser=${CLICKHOUSE_USER} \
  --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD}
```

또는 `values.yaml` 파일을 사용할 수 있습니다:

```yaml
clickhouse:
  enabled: false
  persistence:
    enabled: false
  config:
    users:
      otelUser: ${CLICKHOUSE_USER}
      otelUserPassword: ${CLICKHOUSE_PASSWORD}

otel:
  clickhouseEndpoint: ${CLICKHOUSE_URL}

hyperdx:
  defaultConnections: |
    [
      {
        "name": "External ClickHouse",
        "host": "http://your-clickhouse-server:8123",
        "port": 8123,
        "username": "your-username",
        "password": "your-password"
      }
    ]
```

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
# or if installed...
# helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

:::tip 고급 외부 구성
시크릿 기반 구성, 외부 OTel collector 사용, 최소 구성 등 프로덕션 환경 배포에는 [배포 옵션 가이드](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options)를 참조하십시오.
:::


## 운영 환경 관련 참고 사항

기본적으로 이 차트는 ClickHouse와 OTel collector도 함께 설치합니다. 그러나 운영 환경에서는 ClickHouse와 OTel collector를 별도로 관리하는 것을 권장합니다.

ClickHouse와 OTel collector를 비활성화하려면 다음 값을 설정하십시오.

```shell
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.enabled=false
```

:::tip 프로덕션 모범 사례
고가용성 구성, 리소스 관리, 인그레스/TLS 설정, Cloud별 구성(GKE, EKS, AKS)을 포함한 프로덕션 환경 배포에 대해서는 다음을 참고하십시오:

* [구성 가이드](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - 인그레스, TLS 및 시크릿 관리
* [Cloud 배포](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - Cloud별 설정 및 프로덕션 체크리스트
  :::


## 태스크 구성 {#task-configuration}

기본적으로 차트 설정에는 알림을 트리거해야 하는지 확인하는 역할을 하는 cronjob 태스크가 하나 포함되어 있습니다. 해당 태스크의 구성 옵션은 다음과 같습니다:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `tasks.enabled` | 클러스터에서 cron 태스크를 활성화하거나 비활성화합니다. 기본적으로 HyperDX 이미지는 프로세스 내에서 cron 태스크를 실행합니다. 클러스터에서 별도의 cron 태스크를 사용하려면 true로 설정하십시오. | `false` |
| `tasks.checkAlerts.schedule` | check-alerts 태스크의 Cron 스케줄 | `*/1 * * * *` |
| `tasks.checkAlerts.resources` | check-alerts 태스크의 리소스 요청 및 제한 | `values.yaml` 참조 |

## 차트 업그레이드

새로운 버전으로 업그레이드하려면:

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

사용 가능한 차트 버전을 확인하려면 다음을 실행하십시오:

```shell
helm search repo clickstack
```


## ClickStack 제거

배포를 제거하려면 다음을 실행하십시오:

```shell
helm uninstall my-clickstack
```

이렇게 하면 해당 릴리스와 관련된 모든 리소스가 제거되지만, 영구 데이터(있는 경우)는 그대로 남을 수 있습니다.


## 문제 해결 {#troubleshooting}

### 로그 확인 \{#customizing-values\}

```shell
kubectl logs -l app.kubernetes.io/name=clickstack
```


### 설치 실패 디버깅 \{#using-secrets\}

```shell
helm install my-clickstack clickstack/clickstack --debug --dry-run
```


### 배포 상태 확인

```shell
kubectl get pods -l app.kubernetes.io/name=clickstack
```

:::tip 추가 문제 해결 리소스
인그레스 관련 문제, TLS 문제 또는 Cloud 배포 문제를 해결하려면 다음을 참고하십시오.

* [인그레스 문제 해결](/docs/use-cases/observability/clickstack/deployment/helm-configuration#troubleshooting-ingress) - 애셋 제공, 경로 재작성, 브라우저 관련 문제
* [Cloud 배포](/docs/use-cases/observability/clickstack/deployment/helm-cloud#loadbalancer-dns-resolution-issue) - GKE OpAMP 이슈 및 Cloud 환경 특유의 문제
  :::

<JSONSupport />

이 환경 변수는 파라미터 또는 `values.yaml`을 통해 설정할 수 있습니다. 예:

*values.yaml*

```yaml
hyperdx:
  ...
  env:
    - name: BETA_CH_OTEL_JSON_SCHEMA_ENABLED
      value: "true"

otel:
  ...
  env:
    - name: OTEL_AGENT_FEATURE_GATE_ARG
      value: "--feature-gates=clickhouse.json"
```

또는 `--set` 옵션을 사용하여:

```shell
helm install my-clickstack clickstack/clickstack \
  --set "hyperdx.env[0].name=BETA_CH_OTEL_JSON_SCHEMA_ENABLED" \
  --set "hyperdx.env[0].value=true" \
  --set "otel.env[0].name=OTEL_AGENT_FEATURE_GATE_ARG" \
  --set "otel.env[0].value=--feature-gates=clickhouse.json"
```


## 관련 문서 {#related-documentation}

### 배포 가이드 {#deployment-guides}

- [배포 옵션](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 외부 ClickHouse, OTel collector, 최소 구성 배포
- [구성 가이드](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API 키, 시크릿, 인그레스 설정
- [Cloud 배포](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE, EKS, AKS 구성 및 운영 환경 베스트 프랙티스

### 추가 리소스 {#additional-resources}

- [ClickStack 시작 가이드](/docs/use-cases/observability/clickstack/getting-started/index) - ClickStack 소개
- [ClickStack Helm 차트 리포지토리](https://github.com/ClickHouse/ClickStack-helm-charts) - 차트 소스 코드 및 values 참조
- [Kubernetes 문서](https://kubernetes.io/docs/) - Kubernetes 참조 문서
- [Helm 문서](https://helm.sh/docs/) - Helm 참조 문서