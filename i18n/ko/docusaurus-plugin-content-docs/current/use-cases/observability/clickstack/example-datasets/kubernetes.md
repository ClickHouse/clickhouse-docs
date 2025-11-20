---
'slug': '/use-cases/observability/clickstack/getting-started/kubernetes'
'title': 'Kubernetes 모니터링'
'sidebar_position': 1
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack과 함께 시작하고 Kubernetes 모니터링하기'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'kubernetes'
- 'logs'
- 'observability'
- 'container monitoring'
---

import Image from '@theme/IdealImage';
import DemoArchitecture from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/example-datasets/_snippets/_demo.md';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_kubernetes_data from '@site/static/images/use-cases/observability/hyperdx-kubernetes-data.png';
import copy_api_key from '@site/static/images/use-cases/observability/copy_api_key.png';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';
import dashboard_kubernetes from '@site/static/images/use-cases/observability/hyperdx-dashboard-kubernetes.png';

이 가이드는 Kubernetes 시스템에서 로그 및 메트릭을 수집하여 **ClickStack**로 시각화 및 분석을 위한 전송을 허용합니다. 데모 데이터에는 선택적으로 ClickStack의 공식 Open Telemetry 데모의 포크를 사용합니다.

<iframe width="768" height="432" src="https://www.youtube.com/embed/winI7256Ejk?si=TRThhzCJdq87xg_x" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 필수 조건 {#prerequisites}

이 가이드는 다음 요구 사항을 충족해야 합니다:

- ClickHouse를 위한 노드에 최소 32 GiB의 RAM과 100GB의 디스크 공간이 있는 **Kubernetes 클러스터**(v1.20 이상 권장).
- **[Helm](https://helm.sh/)** v3+
- 클러스터와 상호작용하도록 구성된 **`kubectl`**

## 배포 옵션 {#deployment-options}

다음 배포 옵션 중 하나를 사용하여 이 가이드를 따를 수 있습니다:

- **자체 호스팅**: ClickStack을 Kubernetes 클러스터 내에서 완전히 배포합니다. 여기에는:
  - ClickHouse
  - HyperDX
  - 대시보드 상태 및 구성을 위한 MongoDB가 포함됩니다.

- **클라우드 호스팅**: HyperDX가 외부에서 관리되는 **ClickHouse Cloud**를 사용합니다. 이를 통해 ClickHouse 또는 HyperDX를 클러스터 내에서 실행할 필요가 없습니다.

애플리케이션 트래픽을 시뮬레이션하기 위해 [**OpenTelemetry 데모 애플리케이션**](https://github.com/ClickHouse/opentelemetry-demo)의 ClickStack 포크를 선택적으로 배포할 수 있습니다. 이 애플리케이션은 로그, 메트릭 및 트레이스를 포함한 텔레메트리 데이터를 생성합니다. 이미 클러스터에서 워크로드가 실행 중인 경우 이 단계를 건너뛰고 기존 파드, 노드 및 컨테이너를 모니터링할 수 있습니다.

<VerticalStepper headerLevel="h3">

### cert-manager 설치 (선택 사항) {#install-cert-manager}

설정에 TLS 인증서가 필요한 경우 Helm을 사용하여 [cert-manager](https://cert-manager.io/)를 설치합니다:

```shell

# Add Cert manager repo 

helm repo add jetstack https://charts.jetstack.io 

helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set startupapicheck.timeout=5m --set installCRDs=true --set global.leaderElection.namespace=cert-manager
```

### OpenTelemetry 데모 배포 (선택 사항) {#deploy-otel-demo}

이 **단계는 기존 파드를 모니터링할 필요가 없는 사용자에게 선택 사항입니다**. Kubernetes 환경에 기존 서비스가 배포된 사용자는 이를 건너뛰어도 되지만, 이 데모는 트레이스 및 세션 재생 데이터를 생성하는 계측된 마이크로서비스를 포함하고 있어 ClickStack의 모든 기능을 탐색할 수 있습니다.

다음은 ClickStack 포크의 OpenTelemetry 데모 애플리케이션 스택을 Kubernetes 클러스터 내에 배포하며, 가시성 테스트 및 계측 시연에 맞춰 조정됩니다. 여기에는 백엔드 마이크로서비스, 로드 제너레이터, 텔레메트리 파이프라인, 지원 인프라(예: Kafka, Redis), ClickStack과의 SDK 통합이 포함됩니다.

모든 서비스는 `otel-demo` 네임스페이스에 배포됩니다. 각 배포에는 다음이 포함됩니다:

- 트레이스, 메트릭 및 로그를 위한 OTel 및 ClickStack SDK의 자동 계측.
- 모든 서비스는 `my-hyperdx-hdx-oss-v2-otel-collector` OpenTelemetry 수집기로 그들의 계측 정보를 보냅니다(배포되지 않음).
- 로그, 메트릭 및 트레이스를 환경 변수 `OTEL_RESOURCE_ATTRIBUTES`를 통해 상관 관계를 맺기 위한 [리소스 태그 전송](/use-cases/observability/clickstack/ingesting-data/kubernetes#forwarding-resouce-tags-to-pods).

```shell
## download demo Kubernetes manifest file
curl -O https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml

# wget alternative

# wget https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
kubectl apply --namespace otel-demo -f opentelemetry-demo.yaml
```

데모가 배포되면 모든 파드가 성공적으로 생성되고 `Running` 상태인지 확인합니다:

```shell
kubectl get pods -n=otel-demo

NAME                                 READY   STATUS    RESTARTS   AGE
accounting-fd44f4996-fcl4k           1/1     Running   0          13m
ad-769f968468-qq8mw                  1/1     Running   0          13m
artillery-loadgen-7bc4bdf47d-5sb96   1/1     Running   0          13m
cart-5b4c98bd8-xm7m2                 1/1     Running   0          13m
checkout-784f69b785-cnlpp            1/1     Running   0          13m
currency-fd7775b9c-rf6cr             1/1     Running   0          13m
email-5c54598f99-2td8s               1/1     Running   0          13m
flagd-5466775df7-zjb4x               2/2     Running   0          13m
fraud-detection-5769fdf75f-cjvgh     1/1     Running   0          13m
frontend-6dcb696646-fmcdz            1/1     Running   0          13m
frontend-proxy-7b8f6cd957-s25qj      1/1     Running   0          13m
image-provider-5fdb455756-fs4xv      1/1     Running   0          13m
kafka-7b6666866d-xfzn6               1/1     Running   0          13m
load-generator-57cbb7dfc9-ncxcf      1/1     Running   0          13m
payment-6d96f9bcbd-j8tj6             1/1     Running   0          13m
product-catalog-7fb77f9c78-49bhj     1/1     Running   0          13m
quote-576c557cdf-qn6pr               1/1     Running   0          13m
recommendation-546cc68fdf-8x5mm      1/1     Running   0          13m
shipping-7fc69f7fd7-zxrx6            1/1     Running   0          13m
valkey-cart-5f7b667bb7-gl5v4         1/1     Running   0          13m
```

<DemoArchitecture/>

### ClickStack Helm 차트 리포지토리 추가 {#add-helm-clickstack}

ClickStack을 배포하기 위해 [공식 Helm 차트](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm)를 사용합니다.

이 작업을 위해 HyperDX Helm 리포지토리를 추가해야 합니다:

```shell
helm repo add hyperdx https://hyperdxio.github.io/helm-charts
helm repo update
```

### ClickStack 배포 {#deploy-clickstack}

Helm 차트가 설치되면 ClickStack을 클러스터에 배포할 수 있습니다. ClickHouse 및 HyperDX를 포함하여 Kubernetes 환경 내에서 모든 구성 요소를 실행하거나 ClickHouse Cloud를 사용할 수 있으며, HyperDX도 관리형 서비스로 제공됩니다.
<br/>

<details>
<summary>자체 관리 배포</summary>

다음 명령은 ClickStack을 `otel-demo` 네임스페이스에 설치합니다. Helm 차트는 다음을 배포합니다:

- ClickHouse 인스턴스
- HyperDX
- OTel 수집기의 ClickStack 배포판
- HyperDX 애플리케이션 상태 저장을 위한 MongoDB

:::note
Kubernetes 클러스터 구성에 따라 `storageClassName`을 조정해야 할 수 있습니다.
:::

OTel 데모를 배포하지 않는 사용자는 이 부분을 수정하여 적절한 네임스페이스를 선택할 수 있습니다.

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2   --set clickhouse.persistence.dataSize=100Gi --set global.storageClassName="standard-rwo" -n otel-demo
```

:::warning ClickStack 프로덕션 환경

이 차트는 ClickHouse와 OTel 수집기도 설치합니다. 프로덕션에서는 ClickHouse와 OTel 수집기 운영자를 사용하거나 ClickHouse Cloud를 사용하는 것이 좋습니다.

ClickHouse 및 OTel 수집기를 비활성화하려면 다음 값을 설정하십시오:

```shell
helm install myrelease <chart-name-or-path> --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
```

:::

</details>

<details>
<summary>ClickHouse Cloud 사용하기</summary>

ClickHouse Cloud를 사용하려는 경우, ClickStack을 배포하고 [포함된 ClickHouse를 비활성화](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud)할 수 있습니다.

:::note
현재 차트는 HyperDX와 MongoDB를 항상 배포합니다. 이 구성 요소는 대체 액세스 경로를 제공하지만 ClickHouse Cloud 인증과 통합되지 않습니다. 이 배포 모델의 경우, 이 구성 요소는 관리자에게 [배포된 OTel 수집기를 통해 수집할 수 있는 보안 수집 키에 대한 접근을 제공](#retrieve-ingestion-api-key)하지만 최종 사용자에게 노출되어서는 안 됩니다.
:::

```shell

# specify ClickHouse Cloud credentials
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # full https url
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

helm install my-hyperdx hyperdx/hdx-oss-v2  --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} --set clickhouse.config.users.otelUserName=${CLICKHOUSE_USER} --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD} --set global.storageClassName="standard-rwo" -n otel-demo
```

</details>

배포 상태를 확인하려면 다음 명령을 실행하고 모든 구성 요소가 `Running` 상태인지 확인하십시오. ClickHouse Cloud를 사용하는 사용자에게는 ClickHouse가 없음에 유의하십시오:

```shell
kubectl get pods -l "app.kubernetes.io/name=hdx-oss-v2" -n otel-demo

NAME                                                    READY   STATUS    RESTARTS   AGE
my-hyperdx-hdx-oss-v2-app-78876d79bb-565tb              1/1     Running   0          14m
my-hyperdx-hdx-oss-v2-clickhouse-57975fcd6-ggnz2        1/1     Running   0          14m
my-hyperdx-hdx-oss-v2-mongodb-984845f96-czb6m           1/1     Running   0          14m
my-hyperdx-hdx-oss-v2-otel-collector-64cf698f5c-8s7qj   1/1     Running   0          14m
```

### HyperDX UI 접근 {#access-the-hyperdx-ui}

:::note
ClickHouse Cloud를 사용하는 경우에도 Kubernetes 클러스터에 배포된 로컬 HyperDX 인스턴스가 여전히 필요합니다. 이는 HyperDX와 함께 번들로 제공되는 OpAMP 서버에 의해 관리되는 수집 키를 제공하며, 배포된 OTel 수집기를 통해 보안을 제공합니다 - 현재 ClickHouse Cloud 호스팅 버전에서는 사용할 수 없는 기능입니다.
:::

보안을 위해 이 서비스는 `ClusterIP`를 사용하며 기본적으로 외부에 노출되지 않습니다.

HyperDX UI에 접근하려면 3000 포트를 로컬 포트 8080으로 포트 포워딩합니다.

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

이동하여 [http://localhost:8080](http://localhost:8080)에서 HyperDX UI에 접근합니다.

사용자를 생성하고 사용자의 복잡성 요구 사항에 맞는 사용자 이름과 비밀번호를 제공합니다.

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

### 수집 API 키 가져오기 {#retrieve-ingestion-api-key}

ClickStack 수집기에 의해 배포된 OTel 수집기로의 수집은 수집 키로 보호됩니다.

[`팀 설정`](http://localhost:8080/team)으로 이동하여 `API 키` 섹션에서 `수집 API 키`를 복사합니다. 이 API 키는 OpenTelemetry 수집기를 통한 데이터 수집이 안전하도록 보장합니다.

<Image img={copy_api_key} alt="Copy API key" size="lg"/>

### API 키 Kubernetes 비밀 생성 {#create-api-key-kubernetes-secret}

수집 API 키와 ClickStack helm 차트로 배포된 OTel 수집기의 위치를 포함하는 구성 맵으로 새 Kubernetes 비밀을 생성합니다. 이후 구성 요소는 이를 사용하여 ClickStack Helm 차트로 배포된 수집기로 수집을 허용합니다:

```shell

# create secret with the ingestion API key
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
-n otel-demo


# create a ConfigMap pointing to the ClickStack OTel collector deployed above
kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318
```

OpenTelemetry 데모 애플리케이션 파드를 재시작하여 수집 API 키를 반영합니다.

```shell
kubectl rollout restart deployment -n otel-demo -l app.kubernetes.io/part-of=opentelemetry-demo
```

이제 데모 서비스의 트레이스 및 로그 데이터가 HyperDX로 흐르기 시작해야 합니다.

<Image img={hyperdx_kubernetes_data} alt="HyperDX Kubernetes Data" size="lg"/>

### OpenTelemetry Helm 리포 추가 {#add-otel-helm-repo}

Kubernetes 메트릭을 수집하기 위해 표준 OTel 수집기를 배포하여 위의 수집 API 키를 사용하여 ClickStack 수집기로 안전하게 데이터를 전송하도록 구성합니다.

이 과정에서는 OpenTelemetry Helm 리포를 설치해야 합니다:

```shell

# Add Otel Helm repo
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts 
```

### Kubernetes 수집기 구성 요소 배포 {#deploy-kubernetes-collector-components}

클러스터 자체와 각 노드에서 로그 및 메트릭을 수집하기 위해 두 개의 개별 OpenTelemetry 수집기를 배포해야 합니다. 제공된 두 개의 매니페스트 - `k8s_deployment.yaml` 및 `k8s_daemonset.yaml` -는 Kubernetes 클러스터에서 포괄적인 텔레메트리 데이터를 수집하기 위해 함께 작동합니다.

- `k8s_deployment.yaml`은 **클러스터 전체 이벤트 및 메타데이터 수집**을 담당하는 **단일 OpenTelemetry Collector 인스턴스**를 배포합니다. Kubernetes 이벤트, 클러스터 메트릭을 수집하고 파드 라벨 및 주석으로 텔레메트리 데이터를 보강합니다. 이 수집기는 중복 데이터를 피하기 위해 단일 복제본으로 독립 실행형 배포로 실행됩니다.

- `k8s_daemonset.yaml`은 클러스터의 모든 노드에서 실행되는 **DaemonSet 기반 수집기**를 배포합니다. `kubeletstats`, `hostmetrics`, Kubernetes 속성 프로세서와 같은 구성 요소를 사용하여 **노드 수준 및 파드 수준 메트릭**과 컨테이너 로그를 수집합니다. 이 수집기들은 메타데이터로 로그를 보강하고 OTLP 내보내기를 사용하여 HyperDX로 전송합니다.

이 매니페스트들은 클러스터 전반에 걸쳐 인프라에서 애플리케이션 수준 텔레메트리에 이르기까지 전체 스택 가시성을 가능하게 하며, 보강된 데이터를 ClickStack으로 중앙 집중 분석하기 위해 전송합니다.

우선, 배포로 수집기를 설치합니다:

```shell

# download manifest file
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_deployment.yaml

# install the helm chart
helm install --namespace otel-demo k8s-otel-deployment open-telemetry/opentelemetry-collector -f k8s_deployment.yaml
```

<details>
<summary>k8s_deployment.yaml</summary>

```yaml

# k8s_deployment.yaml
mode: deployment

image:
  repository: otel/opentelemetry-collector-contrib
  tag: 0.123.0


# We only want one of these collectors - any more and we'd produce duplicate data
replicaCount: 1

presets:
  kubernetesAttributes:
    enabled: true
    # When enabled, the processor will extract all labels for an associated pod and add them as resource attributes.
    # The label's exact name will be the key.
    extractAllPodLabels: true
    # When enabled, the processor will extract all annotations for an associated pod and add them as resource attributes.
    # The annotation's exact name will be the key.
    extractAllPodAnnotations: true
  # Configures the collector to collect Kubernetes events.
  # Adds the k8sobject receiver to the logs pipeline and collects Kubernetes events by default.
  # More Info: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver
  kubernetesEvents:
    enabled: true
  # Configures the Kubernetes Cluster Receiver to collect cluster-level metrics.
  # Adds the k8s_cluster receiver to the metrics pipeline and adds the necessary rules to ClusteRole.
  # More Info: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-cluster-receiver
  clusterMetrics:
    enabled: true

extraEnvs:
  - name: HYPERDX_API_KEY
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: HYPERDX_API_KEY
        optional: true
  - name: YOUR_OTEL_COLLECTOR_ENDPOINT
    valueFrom:
      configMapKeyRef:
        name: otel-config-vars
        key: YOUR_OTEL_COLLECTOR_ENDPOINT

config:
  exporters:
    otlphttp:
      endpoint: "${env:YOUR_OTEL_COLLECTOR_ENDPOINT}"
      compression: gzip
      headers:
        authorization: "${env:HYPERDX_API_KEY}"
  service:
    pipelines:
      logs:
        exporters:
          - otlphttp
      metrics:
        exporters:
          - otlphttp
```

</details>

다음으로, 노드 및 파드 수준 메트릭과 로그를 위한 DaemonSet으로 수집기를 배포합니다:

```shell

# download manifest file
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_daemonset.yaml

# install the helm chart
helm install --namespace otel-demo k8s-otel-daemonset open-telemetry/opentelemetry-collector -f k8s_daemonset.yaml
```

<details>

<summary>
`k8s_daemonset.yaml`
</summary>

```yaml

# k8s_daemonset.yaml
mode: daemonset

image:
  repository: otel/opentelemetry-collector-contrib
  tag: 0.123.0


# Required to use the kubeletstats cpu/memory utilization metrics
clusterRole:
  create: true
  rules:
    - apiGroups:
        - ''
      resources:
        - nodes/proxy
      verbs:
        - get

presets:
  logsCollection:
    enabled: true
  hostMetrics:
    enabled: true
  # Configures the Kubernetes Processor to add Kubernetes metadata.
  # Adds the k8sattributes processor to all the pipelines and adds the necessary rules to ClusterRole.
  # More Info: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor
  kubernetesAttributes:
    enabled: true
    # When enabled, the processor will extract all labels for an associated pod and add them as resource attributes.
    # The label's exact name will be the key.
    extractAllPodLabels: true
    # When enabled, the processor will extract all annotations for an associated pod and add them as resource attributes.
    # The annotation's exact name will be the key.
    extractAllPodAnnotations: true
  # Configures the collector to collect node, pod, and container metrics from the API server on a kubelet..
  # Adds the kubeletstats receiver to the metrics pipeline and adds the necessary rules to ClusterRole.
  # More Info: https://opentelemetry.io/docs/kubernetes/collector/components/#kubeletstats-receiver
  kubeletMetrics:
    enabled: true

extraEnvs:
  - name: HYPERDX_API_KEY
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: HYPERDX_API_KEY
        optional: true
  - name: YOUR_OTEL_COLLECTOR_ENDPOINT
    valueFrom:
      configMapKeyRef:
        name: otel-config-vars
        key: YOUR_OTEL_COLLECTOR_ENDPOINT

config:
  receivers:
    # Configures additional kubelet metrics
    kubeletstats:
      collection_interval: 20s
      auth_type: 'serviceAccount'
      endpoint: '${env:K8S_NODE_NAME}:10250'
      insecure_skip_verify: true
      metrics:
        k8s.pod.cpu_limit_utilization:
          enabled: true
        k8s.pod.cpu_request_utilization:
          enabled: true
        k8s.pod.memory_limit_utilization:
          enabled: true
        k8s.pod.memory_request_utilization:
          enabled: true
        k8s.pod.uptime:
          enabled: true
        k8s.node.uptime:
          enabled: true
        k8s.container.cpu_limit_utilization:
          enabled: true
        k8s.container.cpu_request_utilization:
          enabled: true
        k8s.container.memory_limit_utilization:
          enabled: true
        k8s.container.memory_request_utilization:
          enabled: true
        container.uptime:
          enabled: true

  exporters:
    otlphttp:
      endpoint: "${env:YOUR_OTEL_COLLECTOR_ENDPOINT}"
      compression: gzip
      headers:
        authorization: "${env:HYPERDX_API_KEY}"

  service:
    pipelines:
      logs:
        exporters:
          - otlphttp
      metrics:
        exporters:
          - otlphttp
```

</details>

### HyperDX에서 Kubernetes 데이터 탐색 {#explore-kubernetes-data-hyperdx}

HyperDX UI로 이동합니다. Kubernetes에 배포된 인스턴스를 사용하거나 ClickHouse Cloud를 통해 접근할 수 있습니다.

<p/>
<details>
<summary>ClickHouse Cloud 사용하기</summary>

ClickHouse Cloud를 사용하는 경우, ClickHouse Cloud 서비스에 로그인하고 왼쪽 메뉴에서 "HyperDX"를 선택합니다. 자동으로 인증되며 사용자를 생성할 필요가 없습니다.

데이터 소스를 생성하라는 메시지가 표시되면, 데이터 소스 모델에서 모든 기본값을 유지하고 테이블 필드에 `otel_logs` 값을 입력하여 로그 소스를 생성합니다. 다른 모든 설정은 자동으로 감지되어 `새 소스 저장` 버튼을 클릭할 수 있습니다.

<Image force img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX Datasource" size="lg"/>

트레이스 및 메트릭에 대한 데이터 소스를 추가로 생성해야 합니다.

예를 들어, 트레이스 및 OTel 메트릭에 대한 소스를 생성하려면, 상단 메뉴에서 `새 소스 생성`을 선택합니다.

<Image force img={hyperdx_create_new_source} alt="HyperDX create new source" size="lg"/>

여기에서 필요한 소스 유형을 선택한 다음에 적절한 테이블, 예를 들어 트레이스의 경우 `otel_traces` 테이블을 선택합니다. 모든 설정은 자동으로 감지되어야 합니다.

<Image force img={hyperdx_create_trace_datasource} alt="HyperDX create trace source" size="lg"/>

:::note 소스 상관 관계
ClickStack의 서로 다른 데이터 소스 - 예를 들어 로그와 트레이스 - 는 서로 상관 관계를 가질 수 있습니다. 이를 가능하게 하려면 각 소스에 추가 구성 설정이 필요합니다. 예를 들어, 로그 소스에서는 해당하는 트레이스 소스를 지정할 수 있으며, 반대로 트레이스 소스에서는 로그 소스를 지정할 수 있습니다. 추가 세부정보는 "상관된 소스"를 참조하십시오.
:::

</details>

<details>

<summary>자체 관리 배포 사용하기</summary>

로컬에 배포된 HyperDX에 접근하려면 로컬 명령을 사용하여 포트 포워딩을 하고 HyperDX에 [http://localhost:8080](http://localhost:8080)로 접근합니다.

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

:::note ClickStack 프로덕션 환경
프로덕션 환경에서는 HyperDX를 ClickHouse Cloud에서 사용하지 않는 경우 TLS가 있는 인그레스를 사용하는 것을 권장합니다. 예를 들어:

```shell
helm upgrade my-hyperdx hyperdx/hdx-oss-v2 \
--set hyperdx.ingress.enabled=true \
--set hyperdx.ingress.host=your-domain.com \
--set hyperdx.ingress.tls.enabled=true
```
::::

</details>

Kubernetes 데이터를 탐색하기 위해 `/kubernetes`의 전용 대시보드로 이동합니다. 예를 들어 [http://localhost:8080/kubernetes](http://localhost:8080/kubernetes).

각 탭인 파드, 노드 및 네임스페이스는 데이터로 채워져야 합니다.

</VerticalStepper>

<Image img={dashboard_kubernetes} alt="ClickHouse kubernetes" size="lg"/>
