---
'slug': '/use-cases/observability/clickstack/ingesting-data/kubernetes'
'pagination_prev': null
'pagination_next': null
'description': 'Kubernetes 통합을 위한 ClickStack - ClickHouse 가시성 스택'
'title': 'Kubernetes'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'kubernetes'
- 'logs'
- 'observability'
- 'container monitoring'
---

ClickStack은 OpenTelemetry (OTel) 수집기를 사용하여 Kubernetes 클러스터에서 로그, 메트릭 및 Kubernetes 이벤트를 수집하고 이를 ClickStack으로 전달합니다. 우리는 기본 OTel 로그 형식을 지원하며 추가 벤더 특정 구성은 필요하지 않습니다.

이 가이드는 다음 내용을 통합합니다:

- **로그**
- **인프라 메트릭**

:::note
응용 프로그램 수준의 메트릭 또는 APM/트레이스를 전송하려면 해당 언어 통합을 애플리케이션에 추가해야 합니다.
:::

다음 가이드는 [ClickStack OTel 수집기를 게이트웨이로 배포](/use-cases/observability/clickstack/ingesting-data/otel-collector)하고, 이를 수집 API 키로 보안 설정했음을 전제로 합니다.

## OTel 헬름 차트 구성 파일 생성 {#creating-the-otel-helm-chart-config-files}

각 노드 및 클러스터 자체에서 로그와 메트릭을 수집하기 위해 두 개의 별도 OpenTelemetry 수집기를 배포해야 합니다. 하나는 각 노드에서 로그와 메트릭을 수집하기 위해 DaemonSet으로 배포되고, 다른 하나는 클러스터 자체에서 로그와 메트릭을 수집하기 위해 배포됩니다.

### API 키 비밀 만들기 {#create-api-key-secret}

HyperDX에서 [수집 API 키](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data)로 새로운 Kubernetes 비밀을 만듭니다. 이 비밀은 아래에 설치된 구성 요소들이 ClickStack OTel 수집기로 안전하게 수집하는 데 사용됩니다:

```shell
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
```

추가적으로, ClickStack OTel 수집기의 위치를 담고 있는 구성 맵을 만듭니다:

```shell
kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=<OTEL_COLLECTOR_ENDPOINT>

# e.g. kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318
```

### DaemonSet 구성 만들기 {#creating-the-daemonset-configuration}

DaemonSet은 클러스터의 각 노드에서 로그와 메트릭을 수집하지만, Kubernetes 이벤트나 클러스터 전체 메트릭은 수집하지 않습니다.

DaemonSet 매니페스트를 다운로드합니다:

```shell
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_daemonset.yaml
```
<details>

<summary>`k8s_daemonset.yaml`</summary>

```yaml

# daemonset.yaml
mode: daemonset


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
  # More info: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor
  kubernetesAttributes:
    enabled: true
    # When enabled the processor will extra all labels for an associated pod and add them as resource attributes.
    # The label's exact name will be the key.
    extractAllPodLabels: true
    # When enabled the processor will extra all annotations for an associated pod and add them as resource attributes.
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
      headers:
        authorization: "${env:HYPERDX_API_KEY}"
      compression: gzip

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

### 배포 구성 만들기 {#creating-the-deployment-configuration}

Kubernetes 이벤트와 클러스터 전체 메트릭을 수집하기 위해, 별도의 OpenTelemetry 수집기를 배포로 배포해야 합니다.

배포 매니페스트를 다운로드합니다:

```shell
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_deployment.yaml
```

<details>
<summary>k8s_deployment.yaml</summary>

```yaml

# deployment.yaml
mode: deployment

image:
  repository: otel/opentelemetry-collector-contrib
  tag: 0.123.0


# We only want one of these collectors - any more and we'd produce duplicate data
replicaCount: 1

presets:
  kubernetesAttributes:
    enabled: true
    # When enabled the processor will extra all labels for an associated pod and add them as resource attributes.
    # The label's exact name will be the key.
    extractAllPodLabels: true
    # When enabled the processor will extra all annotations for an associated pod and add them as resource attributes.
    # The annotation's exact name will be the key.
    extractAllPodAnnotations: true
  # Configures the collector to collect kubernetes events.
  # Adds the k8sobject receiver to the logs pipeline and collects kubernetes events by default.
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

## OpenTelemetry 수집기 배포 {#deploying-the-otel-collector}

이제 OpenTelemetry 수집기를 Kubernetes 클러스터에 배포할 수 있습니다.
[OpenTelemetry 헬름 차트](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector)를 사용합니다.

OpenTelemetry 헬름 저장소를 추가합니다:

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts # Add OTel Helm repo
```

위 구성을 사용하여 차트를 설치합니다:

```shell copy
helm install my-opentelemetry-collector-deployment open-telemetry/opentelemetry-collector -f k8s_deployment.yaml
helm install my-opentelemetry-collector-daemonset open-telemetry/opentelemetry-collector -f k8s_daemonset.yaml
```

이제 Kubernetes 클러스터의 메트릭, 로그 및 Kubernetes 이벤트가 HyperDX 내에 나타나야 합니다.

## 리소스 태그를 포드로 전달 (추천) {#forwarding-resouce-tags-to-pods}

애플리케이션 수준의 로그, 메트릭 및 트레이스를 Kubernetes 메타데이터(예: 포드 이름, 네임스페이스 등)와 연결하기 위해, `OTEL_RESOURCE_ATTRIBUTES` 환경 변수를 사용하여 Kubernetes 메타데이터를 애플리케이션으로 전달해야 합니다.

다음은 환경 변수를 사용하여 Kubernetes 메타데이터를 애플리케이션으로 전달하는 배포의 예입니다:

```yaml

# my_app_deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: app
  template:
    metadata:
      labels:
        app: app
        # Combined with the Kubernetes Attribute Processor, this will ensure
        # the pod's logs and metrics will be associated with a service name.
        service.name: <MY_APP_NAME>
    spec:
      containers:
        - name: app-container
          image: my-image
          env:
            # ... other environment variables
            # Collect K8s metadata from the downward API to forward to the app
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: POD_UID
              valueFrom:
                fieldRef:
                  fieldPath: metadata.uid
            - name: POD_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
            - name: NODE_NAME
              valueFrom:
                fieldRef:
                  fieldPath: spec.nodeName
            - name: DEPLOYMENT_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.labels['deployment']
            # Forward the K8s metadata to the app via OTEL_RESOURCE_ATTRIBUTES
            - name: OTEL_RESOURCE_ATTRIBUTES
              value: k8s.pod.name=$(POD_NAME),k8s.pod.uid=$(POD_UID),k8s.namespace.name=$(POD_NAMESPACE),k8s.node.name=$(NODE_NAME),k8s.deployment.name=$(DEPLOYMENT_NAME)
```
