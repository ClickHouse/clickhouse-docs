---
slug: /use-cases/observability/clickstack/deployment/helm-configuration
title: 'Helm 구성'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'ClickStack Helm 배포를 위한 API 키, 시크릿, 인그레스 구성'
doc_type: 'guide'
keywords: ['ClickStack 구성', 'Helm 시크릿', 'API 키 설정', '인그레스 구성', 'TLS 설정']
---

:::warning Chart version 2.x
이 페이지는 **v2.x** 서브차트 기반 Helm 차트를 설명합니다. 아직 v1.x 인라인 템플릿 차트를 사용 중이면 [Helm configuration (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1)를 참조하십시오. 마이그레이션 단계는 [업그레이드 가이드](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)를 참조하십시오.
:::

이 가이드는 ClickStack Helm 배포의 구성 옵션을 다룹니다. 기본 설치 방법은 [main Helm deployment guide](/docs/use-cases/observability/clickstack/deployment/helm)를 참조하십시오.

## 값 구성 \{#values-organization\}

v2.x 차트에서는 `hyperdx:` 블록 아래에 Kubernetes 리소스 유형별로 값을 구성합니다:

```yaml
hyperdx:
  ports:          # Shared port numbers (Deployment, Service, ConfigMap, Ingress)
    api: 8000
    app: 3000
    opamp: 4320

  frontendUrl: "http://localhost:3000"

  config:         # → clickstack-config ConfigMap (non-sensitive env vars)
    APP_PORT: "3000"
    HYPERDX_LOG_LEVEL: "info"

  secrets:        # → clickstack-secret Secret (sensitive env vars)
    HYPERDX_API_KEY: "..."
    CLICKHOUSE_PASSWORD: "otelcollectorpass"
    CLICKHOUSE_APP_PASSWORD: "hyperdx"
    MONGODB_PASSWORD: "hyperdx"

  deployment:     # K8s Deployment spec (image, replicas, probes, etc.)
  service:        # K8s Service spec (type, annotations)
  ingress:        # K8s Ingress spec (host, tls, annotations)
  podDisruptionBudget:  # K8s PDB spec
  tasks:          # K8s CronJob specs
```

모든 환경 변수는 `envFrom`을 통해 HyperDX 배포 **및** OTel collector가 공유하는, 이름이 고정된 2개의 리소스를 통해 전달됩니다:

* **`clickstack-config`** ConfigMap — `hyperdx.config`에서 채워집니다
* **`clickstack-secret`** Secret — `hyperdx.secrets`에서 채워집니다

이제 OTel 전용 ConfigMap은 별도로 존재하지 않습니다. 두 워크로드는 모두 동일한 소스를 읽습니다.

## API 키 설정 \{#api-key-setup\}

ClickStack를 성공적으로 배포한 후 텔레메트리 데이터 수집을 활성화하려면 API 키를 구성하십시오.

1. **구성된 인그레스 또는 서비스 엔드포인트를 통해 HyperDX 인스턴스에 접속합니다**
2. **HyperDX 대시보드에 로그인한 후** Team settings로 이동하여 API 키를 생성하거나 가져옵니다
3. **다음 방법 중 하나를 사용하여 API 키로 배포를 업데이트합니다:**

### 방법 1: values 파일을 사용해 Helm upgrade로 업데이트 \{#api-key-values-file\}

`values.yaml`에 API 키를 추가하십시오:

```yaml
hyperdx:
  secrets:
    HYPERDX_API_KEY: "your-api-key-here"
```

그런 다음 배포를 업그레이드하세요:

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

### 방법 2: Helm upgrade와 --set 플래그를 사용해 업데이트 \{#api-key-set-flag\}

```shell
helm upgrade my-clickstack clickstack/clickstack \
  --set hyperdx.secrets.HYPERDX_API_KEY="your-api-key-here"
```

### 변경 사항 적용을 위해 파드를 다시 시작하십시오 \{#restart-pods\}

API 키를 업데이트한 후 새 구성이 적용되도록 파드를 다시 시작하십시오:

```shell
kubectl rollout restart deployment my-clickstack-clickstack-app
```

:::note
이 차트는 구성 값을 사용해 Kubernetes 시크릿(`clickstack-secret`)을 자동으로 생성합니다. 외부 시크릿을 사용하려는 경우가 아니라면 시크릿을 추가로 구성할 필요는 없습니다.
:::

## 시크릿 관리 \{#secret-management\}

API 키나 데이터베이스 자격 증명과 같은 민감한 데이터를 처리할 때 v2.x 차트는 `hyperdx.secrets`를 기반으로 채워지는 통합 `clickstack-secret` 리소스를 제공합니다.

### 기본 시크릿 값 \{#default-secret-values\}

이 차트는 모든 시크릿에 대해 기본값을 제공합니다. `values.yaml`에서 이를 재정의하십시오:

```yaml
hyperdx:
  secrets:
    HYPERDX_API_KEY: "your-api-key"
    CLICKHOUSE_PASSWORD: "your-clickhouse-otel-password"
    CLICKHOUSE_APP_PASSWORD: "your-clickhouse-app-password"
    MONGODB_PASSWORD: "your-mongodb-password"
```

### 외부 시크릿 사용 \{#using-external-secret\}

프로덕션 배포에서 자격 증명을 Helm 값과 분리해 관리하려면 외부 Kubernetes 시크릿을 사용하십시오:

```bash
# Create your secret
kubectl create secret generic my-clickstack-secrets \
  --from-literal=HYPERDX_API_KEY=my-secret-api-key \
  --from-literal=CLICKHOUSE_PASSWORD=my-ch-password \
  --from-literal=CLICKHOUSE_APP_PASSWORD=my-ch-app-password \
  --from-literal=MONGODB_PASSWORD=my-mongo-password
```

그런 다음 values 파일에서 이를 참조하세요:

```yaml
hyperdx:
  useExistingConfigSecret: true
  existingConfigSecret: "my-clickstack-secrets"
```

## 인그레스 설정 \{#ingress-setup\}

도메인 이름을 통해 HyperDX UI와 API에 접근할 수 있도록 하려면 `values.yaml`에서 인그레스를 활성화하십시오.

### 일반적인 인그레스 구성 \{#general-ingress-configuration\}

```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"  # Must match ingress host

  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note 중요 구성 관련 참고 사항
`hyperdx.frontendUrl`은 인그레스 호스트와 일치해야 하며 프로토콜(예: `https://hyperdx.yourdomain.com`)을 포함해야 합니다. 그래야 생성되는 모든 링크, 쿠키, 리디렉션이 올바르게 작동합니다.
:::

### TLS (HTTPS) 활성화 \{#enabling-tls\}

배포를 HTTPS로 보호하려면 다음과 같이 하세요:

**1. 인증서와 키를 사용해 TLS 시크릿을 생성하세요:**

```shell
kubectl create secret tls hyperdx-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

**2. 인그레스 구성에서 TLS를 활성화하세요:**

```yaml
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
      tlsSecretName: "hyperdx-tls"
```

### 인그레스 구성 예시 \{#example-ingress-configuration\}

참고용으로, 생성된 인그레스 리소스는 다음과 같습니다:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hyperdx-app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$1
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  ingressClassName: nginx
  rules:
    - host: hyperdx.yourdomain.com
      http:
        paths:
          - path: /(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: my-clickstack-clickstack-app
                port:
                  number: 3000
  tls:
    - hosts:
        - hyperdx.yourdomain.com
      secretName: hyperdx-tls
```

### 일반적인 인그레스 관련 문제 \{#common-ingress-pitfalls\}

**경로 및 rewrite 구성:**

* Next.js 및 기타 SPA에서는 위에 나온 것처럼 항상 Regex 경로와 rewrite annotation을 사용하십시오
* rewrite 없이 `path: /`만 사용하지 마십시오. 정적 에셋 제공이 중단될 수 있습니다

**`frontendUrl`과 `ingress.host`가 일치하지 않는 경우:**

* 이 값이 일치하지 않으면 쿠키, 리디렉션, 에셋 로딩에 문제가 발생할 수 있습니다

**TLS 구성 오류:**

* TLS 시크릿이 유효한지, 그리고 인그레스에서 올바르게 참조되고 있는지 확인하십시오
* TLS가 활성화된 상태에서 HTTP로 앱에 접근하면 브라우저가 안전하지 않은 콘텐츠를 차단할 수 있습니다

**인그레스 컨트롤러 버전:**

* 일부 기능(예: Regex 경로 및 rewrite)은 비교적 최신 버전의 nginx 인그레스 컨트롤러가 필요합니다
* 다음 명령으로 버전을 확인하십시오:

```shell
kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```

## OTel collector 인그레스 \{#otel-collector-ingress\}

인그레스를 통해 OTel collector 엔드포인트(트레이스, 메트릭, 로그)를 노출해야 하는 경우 `additionalIngresses` 구성을 사용하십시오. 이 구성은 클러스터 외부에서 텔레메트리 데이터를 전송하거나 OTel collector에 사용자 지정 도메인을 연결할 때 유용합니다.

```yaml
hyperdx:
  ingress:
    enabled: true
    additionalIngresses:
      - name: otel-collector
        annotations:
          nginx.ingress.kubernetes.io/ssl-redirect: "false"
          nginx.ingress.kubernetes.io/force-ssl-redirect: "false"
          nginx.ingress.kubernetes.io/use-regex: "true"
        ingressClassName: nginx
        hosts:
          - host: collector.yourdomain.com
            paths:
              - path: /v1/(traces|metrics|logs)
                pathType: Prefix
                port: 4318
                name: otel-collector
        tls:
          - hosts:
              - collector.yourdomain.com
            secretName: collector-tls
```

* 이렇게 하면 OTel collector 엔드포인트용 별도의 인그레스 리소스가 생성됩니다
* 다른 도메인을 사용하고, 특정 TLS 설정을 구성하고, 사용자 지정 애너테이션을 적용할 수 있습니다
* Regex 경로 규칙을 사용하면 모든 OTLP 신호(트레이스, 메트릭, 로그)를 단일 규칙으로 라우팅할 수 있습니다

:::note
OTel collector를 외부에 노출할 필요가 없다면 이 구성은 건너뛰어도 됩니다. 대부분의 사용자에게는 일반 인그레스 설정으로 충분합니다.
:::

또는 [`additionalManifests`](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests)를 사용하여 AWS ALB 인그레스와 같이 완전히 사용자 지정된 인그레스 리소스를 정의할 수 있습니다.

## OTel collector 구성 \{#otel-collector-configuration\}

OTel collector는 공식 OpenTelemetry Collector Helm 차트의 `otel-collector:` 서브차트로 배포됩니다. 값에서 `otel-collector:` 아래에 직접 구성하세요:

```yaml
otel-collector:
  enabled: true
  mode: deployment
  replicaCount: 3
  resources:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "256Mi"
      cpu: "200m"
  nodeSelector:
    node-role: monitoring
  tolerations:
    - key: monitoring
      operator: Equal
      value: otel
      effect: NoSchedule
```

환경 변수(ClickHouse 엔드포인트, OpAMP URL 등)는 통합 `clickstack-config` ConfigMap과 `clickstack-secret` Secret을 통해 공유됩니다. 서브차트의 `extraEnvsFrom`은 기본적으로 이 두 항목 모두를 읽도록 연결되어 있습니다.

사용 가능한 모든 서브차트 값은 [OpenTelemetry Collector Helm 차트](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector)에서 확인하십시오.

## MongoDB 구성 \{#mongodb-configuration\}

MongoDB는 `MongoDBCommunity` 사용자 지정 리소스를 통해 MCK 오퍼레이터가 관리합니다. CR 사양은 `mongodb.spec`의 내용을 그대로 사용해 렌더링됩니다:

```yaml
mongodb:
  enabled: true
  spec:
    members: 1
    type: ReplicaSet
    version: "5.0.32"
    security:
      authentication:
        modes: ["SCRAM"]
    statefulSet:
      spec:
        volumeClaimTemplates:
          - metadata:
              name: data-volume
            spec:
              accessModes: ["ReadWriteOnce"]
              storageClassName: "your-storage-class"
              resources:
                requests:
                  storage: 10Gi
```

MongoDB 비밀번호는 `hyperdx.secrets.MONGODB_PASSWORD`에 설정합니다. 사용 가능한 모든 CRD 필드는 [MCK documentation](https://github.com/mongodb/mongodb-kubernetes/tree/master/docs/mongodbcommunity)을 참조하십시오.

## ClickHouse 구성 \{#clickhouse-configuration\}

ClickHouse는 `ClickHouseCluster` 및 `KeeperCluster` 사용자 지정 리소스를 통해 ClickHouse Operator가 관리됩니다. 두 CR 사양은 모두 값에서 그대로 렌더링됩니다:

```yaml
clickhouse:
  enabled: true
  port: 8123
  nativePort: 9000
  prometheus:
    enabled: true
    port: 9363
  keeper:
    spec:
      replicas: 1
      dataVolumeClaimSpec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 5Gi
  cluster:
    spec:
      replicas: 1
      shards: 1
      dataVolumeClaimSpec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
```

ClickHouse 사용자 자격 증명은 `hyperdx.secrets`에서 가져옵니다(`v1.x`의 `clickhouse.config.users`가 아님). 사용 가능한 모든 CRD 필드는 [ClickHouse Operator configuration guide](https://clickhouse.com/docs/clickhouse-operator/guides/configuration)를 참조하십시오.

## 인그레스 문제 해결 \{#troubleshooting-ingress\}

**인그레스 리소스를 확인하세요:**

```shell
kubectl get ingress -A
kubectl describe ingress <ingress-name>
```

**인그레스 컨트롤러 로그를 확인합니다:**

```shell
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

**테스트용 에셋 URL:**

`curl`을 사용하여 정적 에셋이 HTML이 아니라 JS로 반환되는지 확인하세요:

```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# Should return Content-Type: application/javascript
```

**브라우저 DevTools:**

* Network 탭에서 404 오류가 발생하거나 JS 대신 HTML을 반환하는 에셋이 있는지 확인하세요
* 콘솔에서 `Unexpected token <`와 같은 오류를 확인하세요 (JS 대신 HTML이 반환되었음을 의미합니다)

**경로 재작성 확인:**

* 인그레스가 에셋 경로를 제거하거나 잘못 재작성하고 있지 않은지 확인하세요

**브라우저 및 CDN 캐시 지우기:**

* 변경 후에는 오래된 에셋이 남지 않도록 브라우저 캐시와 CDN/프록시 캐시를 모두 지우세요

## 값 맞춤 설정 \{#customizing-values\}

`--set` 플래그를 사용해 값을 맞춤 설정할 수 있습니다:

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

또는 사용자 지정 `values.yaml`을 생성하세요. 기본값을 가져오려면 다음을 실행하십시오:

```shell
helm show values clickstack/clickstack > values.yaml
```

사용자 지정 값을 적용하세요:

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
```

## 다음 단계 \{#next-steps\}

* [배포 옵션](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 외부 시스템 및 최소 배포
* [Cloud 배포](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE, EKS 및 AKS 구성
* [업그레이드 가이드](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - v1.x에서 v2.x로 마이그레이션
* [추가 매니페스트](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) - 사용자 지정 Kubernetes 객체
* [Helm 기본 가이드](/docs/use-cases/observability/clickstack/deployment/helm) - 기본 설치
* [구성 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - v1.x 구성 가이드