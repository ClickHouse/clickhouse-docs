---
slug: /use-cases/observability/clickstack/deployment/helm-v1
title: 'Helm (v1.x)'
pagination_prev: null
pagination_next: null
sidebar_position: 10
description: 'v1.x 인라인 템플릿 Helm 차트를 사용한 ClickStack 배포'
doc_type: 'guide'
keywords: ['ClickStack Helm 차트', 'Helm ClickHouse 배포', 'HyperDX Helm 설치', 'Kubernetes 관측성 스택', 'ClickStack Kubernetes 배포']
---

import Image from '@theme/IdealImage';
import hyperdx_24 from '@site/static/images/use-cases/observability/hyperdx-24.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import JSONSupport from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

:::warning Deprecated — v1.x 차트
이 페이지는 메인터넌스 모드인 **v1.x** 인라인 템플릿 Helm 차트를 설명합니다. 이 차트에는 더 이상 새로운 기능이 추가되지 않습니다. 새로 배포하는 경우 [v2.x 차트](/docs/use-cases/observability/clickstack/deployment/helm)를 사용하십시오. 기존 v1.x 배포를 마이그레이션하려면 [업그레이드 가이드](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)를 참조하십시오.
:::

ClickStack용 helm 차트는 [여기](https://github.com/ClickHouse/ClickStack-helm-charts)에서 확인할 수 있으며, 프로덕션 배포에 **권장되는** 방법입니다.

기본적으로 Helm 차트는 다음을 포함한 모든 핵심 구성 요소를 프로비저닝합니다:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB** (영구적인 애플리케이션 상태 저장용)

하지만 기존 ClickHouse 배포와 통합하도록 쉽게 사용자 지정할 수 있습니다. 예를 들어 **ClickHouse Cloud**에서 호스팅되는 배포와 통합할 수 있습니다.

이 차트는 다음을 포함한 Kubernetes 모범 사례를 지원합니다:

* `values.yaml`을 통한 환경별 구성
* 리소스 제한 및 파드 수준 확장
* TLS 및 인그레스 구성
* 시크릿 관리 및 인증 설정

### 적합한 사용 사례 \{#suitable-for\}

* 개념 검증
* 프로덕션 환경

## 배포 단계 \{#deployment-steps\}

<br />

<VerticalStepper headerLevel="h3">
  ### 사전 요구 사항 \{#prerequisites\}

  * [Helm](https://helm.sh/) v3+
  * Kubernetes 클러스터(v1.20+ 권장)
  * 클러스터와 상호 작용하도록 `kubectl`이 구성되어 있어야 합니다

  ### ClickStack Helm 저장소 추가 \{#add-the-clickstack-helm-repository\}

  ClickStack Helm 저장소를 추가합니다:

  ```shell
  helm repo add clickstack https://clickhouse.github.io/ClickStack-helm-charts
  helm repo update
  ```

  ### ClickStack 설치 \{#installing-clickstack\}

  기본 설정값으로 ClickStack 차트를 설치하려면:

  ```shell
  helm install my-clickstack clickstack/clickstack
  ```

  ### 설치 확인 \{#verify-the-installation\}

  설치 여부를 확인합니다:

  ```shell
  kubectl get pods -l "app.kubernetes.io/name=clickstack"
  ```

  모든 파드가 준비되면 다음 단계로 진행하십시오.

  ### 포트 포워딩 \{#forward-ports\}

  포트 포워딩을 사용하면 HyperDX에 접속하여 설정할 수 있습니다. 프로덕션 환경에 배포하는 경우에는 적절한 네트워크 액세스, TLS 종료, 확장성을 보장할 수 있도록 인그레스 또는 로드 밸런서를 통해 서비스를 외부에 노출해야 합니다. 포트 포워딩은 장기 운영이나 고가용성 환경보다는 로컬 개발 또는 일회성 관리 작업에 더 적합합니다.

  ```shell
  kubectl port-forward \
    pod/$(kubectl get pod -l app.kubernetes.io/name=clickstack -o jsonpath='{.items[0].metadata.name}') \
    8080:3000
  ```

  :::tip 프로덕션 인그레스 설정
  프로덕션 배포에서는 포트 포워딩 대신 TLS를 사용하여 인그레스를 구성하십시오. 자세한 설정 방법은 [인그레스 구성 가이드](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1#ingress-setup)를 참조하십시오.
  :::

  ### UI로 이동 \{#navigate-to-the-ui\}

  HyperDX UI에 액세스하려면 [http://localhost:8080](http://localhost:8080)으로 접속하십시오.

  요구 사항을 충족하는 사용자 이름과 비밀번호를 입력해 사용자를 생성하십시오.

  <Image img={hyperdx_login} alt="HyperDX UI" size="lg" />

  `Create`를 클릭하면 Helm 차트로 배포한 ClickHouse 인스턴스의 데이터 소스가 생성됩니다.

  :::note 기본 연결 재정의
  통합된 ClickHouse 인스턴스에 대한 기본 연결은 재정의할 수 있습니다. 자세한 내용은 [&quot;ClickHouse Cloud 사용&quot;](#using-clickhouse-cloud)을 참조하십시오.
  :::

  ### 값 사용자 지정(선택 사항) \{#customizing-values\}

  `--set` 플래그를 사용하여 설정을 사용자 지정할 수 있습니다. 예:

  ```shell
  helm install my-clickstack clickstack/clickstack --set key=value
  ```

  또는 `values.yaml`을 편집하십시오. 기본값을 가져오려면 다음 명령을 실행하십시오:

  ```shell
  helm show values clickstack/clickstack > values.yaml
  ```

  예시 설정:

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

  ### 시크릿 사용(선택 사항) \{#using-secrets\}

  API 키나 데이터베이스 자격 증명과 같은 민감한 데이터를 다루려면 Kubernetes 시크릿을 사용하십시오. HyperDX Helm 차트는 수정한 후 클러스터에 적용할 수 있는 기본 시크릿 파일을 제공합니다.

  #### 미리 구성된 시크릿 사용 \{#using-pre-configured-secrets\}

  Helm 차트에는 [`charts/clickstack/templates/secrets.yaml`](https://github.com/ClickHouse/ClickStack-helm-charts/blob/main/charts/clickstack/templates/secrets.yaml)에 있는 기본 시크릿 템플릿이 포함되어 있습니다. 이 파일은 시크릿 관리를 위한 기본 구조를 제공합니다.

  시크릿을 수동으로 적용해야 하는 경우, 제공된 `secrets.yaml` 템플릿을 수정한 후 적용하십시오:

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

  클러스터에 시크릿을 적용하십시오:

  ```shell
  kubectl apply -f secrets.yaml
  ```

  #### 사용자 지정 시크릿 생성하기 \{#creating-a-custom-secret\}

  필요한 경우 사용자 지정 Kubernetes 시크릿을 수동으로 생성할 수 있습니다:

  ```shell
  kubectl create secret generic hyperdx-secret \
    --from-literal=API_KEY=my-secret-api-key
  ```

  #### 시크릿 참조하기 \{#referencing-a-secret\}

  `values.yaml`에서 시크릿을 참조하려면 다음과 같이 하십시오:

  ```yaml
  hyperdx:
    apiKey:
      valueFrom:
        secretKeyRef:
          name: hyperdx-secret
          key: API_KEY
  ```

  :::tip API 키 관리
  여러 구성 방법과 파드 재시작 절차를 포함한 API 키 설정에 대한 자세한 내용은 [API 키 설정 가이드](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1#api-key-setup)를 참조하십시오.
  :::
</VerticalStepper>

## ClickHouse Cloud 사용 \{#using-clickhouse-cloud\}

ClickHouse Cloud를 사용하는 경우 Helm 차트로 배포된 ClickHouse 인스턴스를 비활성화하고 ClickHouse Cloud 자격 증명을 지정하십시오:

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

또는 `values.yaml` 파일을 사용하세요:

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

:::tip 진계 외부 구성
시크릿 기반 구성, 외부 OTel collector 사용 또는 최소 구성으로 프로덕션 환경에 배포하는 경우 [배포 옵션 가이드](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1)를 참조하십시오.
:::

## 프로덕션 참고 사항 \{#production-notes\}

기본적으로 이 차트는 ClickHouse와 OTel collector도 함께 설치합니다. 하지만 프로덕션에서는 ClickHouse와 OTel collector를 각각 별도로 관리하는 것이 좋습니다.

ClickHouse와 OTel collector를 비활성화하려면 다음 값을 설정하십시오.

```shell
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.enabled=false
```

:::tip 프로덕션 모범 사례
고가용성 구성, 리소스 관리, 인그레스/TLS 설정, Cloud별 구성(GKE, EKS, AKS)을 포함한 프로덕션 배포에 대해서는 다음 문서를 참조하십시오:

* [구성 가이드](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - 인그레스, TLS 및 시크릿 관리
* [Cloud 배포](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - Cloud 관련 설정 및 프로덕션 체크리스트
  :::

## 작업 구성 \{#task-configuration\}

기본적으로 차트 설정에는 cronjob으로 구성된 작업이 1개 있으며, 이 작업은 알림을 발생시켜야 하는지 확인합니다. 구성 옵션은 다음과 같습니다.

| 매개변수                          | 설명                                                                                                                    | 기본값              |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `tasks.enabled`               | 클러스터에서 cron 작업을 활성화하거나 비활성화합니다. 기본적으로 HyperDX 이미지는 프로세스 내에서 cron 작업을 실행합니다. 클러스터에서 별도의 cron 작업을 사용하려면 `true`로 변경하십시오. | `false`          |
| `tasks.checkAlerts.schedule`  | check-alerts 작업의 cron 스케줄                                                                                             | `*/1 * * * *`    |
| `tasks.checkAlerts.resources` | check-alerts 작업의 리소스 요청량 및 한도                                                                                         | `values.yaml` 참조 |

## 차트 업그레이드 \{#upgrading-the-chart\}

새 버전으로 업그레이드하려면:

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

사용 가능한 차트 버전을 확인하려면:

```shell
helm search repo clickstack
```

:::note v2.x로 업그레이드
v2.x 서브차트 기반 차트로 마이그레이션하려면 [업그레이드 가이드](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)에서 마이그레이션 지침을 확인하십시오. 이는 호환되지 않는 변경 사항이므로, 현재 상태에서 `helm upgrade`를 수행하는 방식은 지원되지 않습니다.
:::

## ClickStack 제거 \{#uninstalling-clickstack\}

배포를 제거하려면:

```shell
helm uninstall my-clickstack
```

이렇게 하면 릴리스와 관련된 모든 리소스가 제거되지만, 영구 데이터가 있는 경우 해당 데이터는 남아 있을 수 있습니다.

## 문제 해결 \{#troubleshooting\}

### 로그 확인하기 \{#checking-logs\}

```shell
kubectl logs -l app.kubernetes.io/name=clickstack
```

### 설치 실패 디버깅 \{#debugging-a-failed-install\}

```shell
helm install my-clickstack clickstack/clickstack --debug --dry-run
```

### 배포 확인 \{#verifying-deployment\}

```shell
kubectl get pods -l app.kubernetes.io/name=clickstack
```

:::tip 추가 문제 해결 리소스
인그레스 관련 문제, TLS 문제 또는 Cloud 배포 문제 해결에 대해서는 다음을 참조하십시오:

* [인그레스 문제 해결](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1#troubleshooting-ingress) - 에셋 제공, 경로 재작성, 브라우저 문제
* [Cloud 배포](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1#loadbalancer-dns-resolution-issue) - GKE OpAMP 문제 및 Cloud 관련 문제
  :::

<JSONSupport />

이러한 환경 변수는 매개변수 또는 `values.yaml`을 통해 설정할 수 있습니다. 예:

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

또는 `--set`을 사용하여:

```shell
helm install my-clickstack clickstack/clickstack \
  --set "hyperdx.env[0].name=BETA_CH_OTEL_JSON_SCHEMA_ENABLED" \
  --set "hyperdx.env[0].value=true" \
  --set "otel.env[0].name=OTEL_AGENT_FEATURE_GATE_ARG" \
  --set "otel.env[0].value=--feature-gates=clickhouse.json"
```

## 관련 문서 \{#related-documentation\}

### v1.x 배포 가이드 \{#deployment-guides\}

* [배포 옵션 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1) - 외부 ClickHouse, OTel collector 및 최소 구성 배포
* [구성 가이드 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - API 키, 시크릿 및 인그레스 설정
* [Cloud 배포 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - GKE, EKS, AKS 구성 및 프로덕션 모범 사례

### v2.x 문서 \{#v2x-documentation\}

* [Helm (v2.x)](/docs/use-cases/observability/clickstack/deployment/helm) - v2.x 배포 안내서
* [업그레이드 가이드](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - v1.x에서 v2.x로 이전하는 방법

### 추가 자료 \{#additional-resources\}

* [ClickStack 시작 가이드](/use-cases/observability/clickstack/getting-started) - ClickStack 소개
* [ClickStack Helm 차트 저장소](https://github.com/ClickHouse/ClickStack-helm-charts) - 차트 소스 코드 및 values 참조
* [Kubernetes 문서](https://kubernetes.io/docs/) - Kubernetes 참조
* [Helm 문서](https://helm.sh/docs/) - Helm 참조