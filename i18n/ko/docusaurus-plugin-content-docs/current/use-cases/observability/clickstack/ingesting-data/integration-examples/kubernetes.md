---
slug: /use-cases/observability/clickstack/integrations/kubernetes
pagination_prev: null
pagination_next: null
description: 'ClickStack용 Kubernetes 통합 - ClickHouse 관측성 스택'
title: 'Kubernetes'
doc_type: 'guide'
keywords: ['clickstack', 'kubernetes', '로그', '관측성', '컨테이너 모니터링']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack은 OpenTelemetry (OTel) collector를 사용하여 Kubernetes 클러스터에서 로그, 메트릭, Kubernetes 이벤트를 수집한 뒤 ClickStack으로 전달합니다. 표준 OTel 로그 형식을 지원하며, 추가적인 벤더 전용 구성은 필요하지 않습니다.

이 가이드에서는 다음을 다룹니다:

* **로그(Logs)**
* **인프라 메트릭(Infra Metrics)**

:::note
애플리케이션 수준의 메트릭 또는 APM/트레이스를 전송하려면, 애플리케이션에 해당 언어별 통합을 추가해야 합니다.
:::

이후 가이드는 [게이트웨이로 배포된 ClickStack OTel collector](/use-cases/observability/clickstack/ingesting-data/otel-collector)가 이미 존재하며, 수집 API key로 보호되어 있다고 가정합니다.


## OTel Helm 차트 설정 파일 생성하기 \{#creating-the-otel-helm-chart-config-files\}

각 노드와 클러스터 전체에서 로그와 메트릭을 수집하려면 서로 다른 OpenTelemetry collector 두 개를 배포해야 합니다. 하나는 각 노드의 로그와 메트릭을 수집하기 위해 데몬셋으로 배포하고, 다른 하나는 클러스터 전체의 로그와 메트릭을 수집하기 위해 배포로 구성합니다.

### API key 시크릿 생성 \{#create-api-key-secret\}

HyperDX에서 발급한 [수집 API key](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data)로 새로운 Kubernetes 시크릿을 생성합니다. 이 시크릿은 아래에서 설치하는 컴포넌트가 ClickStack OTel collector로 데이터를 안전하게 수집하는 데 사용됩니다:

```shell
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
```

또한 ClickStack OTel collector의 위치를 지정하는 ConfigMap을 생성합니다.

```shell
kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=<OTEL_COLLECTOR_ENDPOINT>
# e.g. kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318
```


### 데몬셋 구성 생성 \{#creating-the-daemonset-configuration\}

데몬셋은 클러스터의 각 노드에서 로그와 메트릭을 수집하지만, Kubernetes 이벤트나 클러스터 단위 메트릭은 수집하지 않습니다.

데몬셋 매니페스트를 다운로드합니다:

```shell
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_daemonset.yaml
```


<Tabs groupId="daemonset-configs">
  <TabItem value="clickstack-managed" label="관리형 ClickStack" default>
    <details>
      <summary>`k8s_daemonset.yaml`</summary>

      ```yaml
      # daemonset.yaml
      mode: daemonset

      # kubeletstats CPU/메모리 사용률 메트릭을 사용하기 위해 필요합니다.
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
        # Kubernetes 프로세서를 구성하여 Kubernetes 메타데이터를 추가합니다.
        # 모든 파이프라인에 k8sattributes 프로세서를 추가하고 클러스터 역할(ClusterRole)에 필요한 규칙을 추가합니다.
        # 자세한 내용: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor
        kubernetesAttributes:
          enabled: true
          # 활성화하면 프로세서가 관련 파드의 모든 라벨을 추출하여 리소스 속성으로 추가합니다.
          # 라벨의 정확한 이름이 키가 됩니다.
          extractAllPodLabels: true
          # 활성화하면 프로세서가 관련 파드의 모든 어노테이션을 추출하여 리소스 속성으로 추가합니다.
          # 어노테이션의 정확한 이름이 키가 됩니다.
          extractAllPodAnnotations: true
        # 수집기를 구성하여 큐블릿의 API 서버에서 노드, 파드 및 컨테이너 메트릭을 수집합니다.
        # metrics 파이프라인에 kubeletstats receiver를 추가하고 클러스터 역할(ClusterRole)에 필요한 규칙을 추가합니다.
        # 자세한 내용: https://opentelemetry.io/docs/kubernetes/collector/components/#kubeletstats-receiver
        kubeletMetrics:
          enabled: true

      extraEnvs:
        - name: YOUR_OTEL_COLLECTOR_ENDPOINT
          valueFrom:
            configMapKeyRef:
              name: otel-config-vars
              key: YOUR_OTEL_COLLECTOR_ENDPOINT

      config:
        receivers:
          # 추가 큐블릿 메트릭을 구성합니다.
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
  </TabItem>

  <TabItem value="clickstack-oss" label="ClickStack 오픈 소스">
    <details>
      <summary>`k8s_daemonset.yaml`</summary>

      ```yaml
      # daemonset.yaml
      mode: daemonset

      # kubeletstats CPU/메모리 사용률 메트릭을 사용하려면 필요합니다.
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
        # Kubernetes Processor를 구성하여 Kubernetes 메타데이터를 추가합니다.
        # 모든 파이프라인에 k8sattributes 프로세서를 추가하고 클러스터 역할(ClusterRole)에 필요한 규칙을 추가합니다.
        # 자세한 내용: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor
        kubernetesAttributes:
          enabled: true
          # 활성화되면 프로세서는 관련 파드의 모든 레이블을 추출하여 리소스 속성으로 추가합니다.
          # 레이블의 정확한 이름이 키가 됩니다.
          extractAllPodLabels: true
          # 활성화되면 프로세서는 관련 파드의 모든 어노테이션을 추출하여 리소스 속성으로 추가합니다.
          # 어노테이션의 정확한 이름이 키가 됩니다.
          extractAllPodAnnotations: true
        # 수집기(collector)를 구성하여 API 서버의 큐블릿에서 노드, 파드, 컨테이너 메트릭을 수집합니다.
        # metrics 파이프라인에 kubeletstats receiver를 추가하고 클러스터 역할에 필요한 규칙을 추가합니다.
        # 자세한 내용: https://opentelemetry.io/docs/kubernetes/collector/components/#kubeletstats-receiver
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
          # 추가 kubelet 메트릭을 구성합니다.
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
  </TabItem>
</Tabs>

### 배포 구성 생성 \{#creating-the-deployment-configuration\}

Kubernetes 이벤트와 클러스터 전체 메트릭을 수집하려면, 별도의 OpenTelemetry collector를 배포 리소스로 생성해야 합니다.

배포 매니페스트를 다운로드합니다:

```shell
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_deployment.yaml
```


<Tabs groupId="deployment-configs">
<TabItem value="clickstack-managed" label="관리형 ClickStack" default>

<details>
<summary>k8s_deployment.yaml</summary>

```yaml
# deployment.yaml
mode: deployment

image:
  repository: otel/opentelemetry-collector-contrib
  tag: 0.123.0
 
# 이 콜렉터는 인스턴스를 1개만 사용합니다. 더 생성하면 중복 데이터가 발생합니다.
replicaCount: 1
 
presets:
  kubernetesAttributes:
    enabled: true
    # 활성화하면 프로세서가 연결된 파드의 모든 라벨을 추출하여 리소스 속성으로 추가합니다.
    # 라벨의 정확한 이름이 키가 됩니다.
    extractAllPodLabels: true
    # 활성화하면 프로세서가 연결된 파드의 모든 어노테이션을 추출하여 리소스 속성으로 추가합니다.
    # 어노테이션의 정확한 이름이 키가 됩니다.
    extractAllPodAnnotations: true
  # 콜렉터가 Kubernetes 이벤트를 수집하도록 구성합니다.
  # 로그 파이프라인에 k8sobject receiver를 추가하고 기본적으로 Kubernetes 이벤트를 수집합니다.
  # 자세한 내용: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver
  kubernetesEvents:
    enabled: true
  # Kubernetes Cluster Receiver가 클러스터 수준 메트릭을 수집하도록 구성합니다.
  # 메트릭 파이프라인에 k8s_cluster receiver를 추가하고 ClusterRole에 필요한 규칙을 추가합니다.
  # 자세한 내용: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-cluster-receiver
  clusterMetrics:
    enabled: true

extraEnvs:
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

</TabItem>

<TabItem value="clickstack-oss" label="ClickStack 오픈 소스">

<details>
<summary>k8s_deployment.yaml</summary>

```yaml
# deployment.yaml
mode: deployment

image:
  repository: otel/opentelemetry-collector-contrib
  tag: 0.123.0
 
# 이 콜렉터는 인스턴스를 1개만 사용합니다. 더 생성하면 중복 데이터가 발생합니다.
replicaCount: 1
 
presets:
  kubernetesAttributes:
    enabled: true
    # 활성화하면 프로세서가 연결된 파드의 모든 라벨을 추출하여 리소스 속성으로 추가합니다.
    # 라벨의 정확한 이름이 키가 됩니다.
    extractAllPodLabels: true
    # 활성화하면 프로세서가 연결된 파드의 모든 어노테이션을 추출하여 리소스 속성으로 추가합니다.
    # 어노테이션의 정확한 이름이 키가 됩니다.
    extractAllPodAnnotations: true
  # 콜렉터가 Kubernetes 이벤트를 수집하도록 구성합니다.
  # 로그 파이프라인에 k8sobject receiver를 추가하고 기본적으로 Kubernetes 이벤트를 수집합니다.
  # 자세한 내용: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver
  kubernetesEvents:
    enabled: true
  # Kubernetes Cluster Receiver가 클러스터 수준 메트릭을 수집하도록 구성합니다.
  # 메트릭 파이프라인에 k8s_cluster receiver를 추가하고 ClusterRole에 필요한 규칙을 추가합니다.
  # 자세한 내용: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-cluster-receiver
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

</TabItem>
</Tabs>

## OpenTelemetry Collector 배포 \{#deploying-the-otel-collector\}

이제 Kubernetes 클러스터에 [OpenTelemetry Helm 차트](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector)를 사용하여 OpenTelemetry Collector를 배포할 수 있습니다.

OpenTelemetry Helm 저장소를 추가합니다:

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts # Add OTel Helm repo
```

위 설정으로 차트를 설치하십시오:

```shell copy
helm install my-opentelemetry-collector-deployment open-telemetry/opentelemetry-collector -f k8s_deployment.yaml
helm install my-opentelemetry-collector-daemonset open-telemetry/opentelemetry-collector -f k8s_daemonset.yaml
```

이제 Kubernetes 클러스터의 메트릭, 로그, Kubernetes 이벤트가 HyperDX에 나타나야 합니다.


## 리소스 태그를 파드로 전달하기 (권장) \{#forwarding-resouce-tags-to-pods\}

애플리케이션 수준의 로그, 메트릭, 트레이스를 Kubernetes 메타데이터
(예: 파드 이름, 네임스페이스 등)와 연관시키려면 `OTEL_RESOURCE_ATTRIBUTES` 환경 변수를 사용하여
Kubernetes 메타데이터를 애플리케이션으로 전달해야 합니다.

다음은 환경 변수를 사용하여 Kubernetes 메타데이터를
애플리케이션으로 전달하는 배포 예제입니다:

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
