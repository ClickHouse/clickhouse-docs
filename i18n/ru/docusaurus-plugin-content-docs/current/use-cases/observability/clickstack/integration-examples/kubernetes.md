---
slug: /use-cases/observability/clickstack/integrations/kubernetes
pagination_prev: null
pagination_next: null
description: 'Интеграция Kubernetes с ClickStack — ClickHouse Observability Stack'
title: 'Kubernetes'
doc_type: 'guide'
keywords: ['clickstack', 'kubernetes', 'логи', 'наблюдаемость', 'мониторинг контейнеров']
---

ClickStack использует OTel collector для сбора логов, метрик и событий Kubernetes из кластеров Kubernetes и их передачи в ClickStack. Мы поддерживаем нативный формат логов OTel и не требуем дополнительной конфигурации, зависящей от конкретного вендора.

В этом руководстве рассматривается интеграция следующих типов данных:

- **Логи**
- **Инфраструктурные метрики**

:::note
Чтобы отправлять метрики уровня приложения или APM/трейсы, вам также потребуется добавить соответствующую языковую интеграцию в ваше приложение.
:::

Предполагается, что вы уже развернули [ClickStack OTel collector в режиме шлюза](/use-cases/observability/clickstack/ingesting-data/otel-collector), защищённый ключом API для приёма данных (ingestion API key).

## Создание конфигурационных файлов Helm-чарта OTel {#creating-the-otel-helm-chart-config-files}

Чтобы собирать логи и метрики как с каждого узла, так и с кластера в целом, нам нужно развернуть два отдельных коллектора OpenTelemetry. Один будет развернут в виде ДемонСета для сбора логов и метрик с каждого узла, а другой — в виде Развертывания для сбора логов и метрик с самого кластера.

### Создание секрета с ключом API {#create-api-key-secret}

Создайте новый секрет Kubernetes с [ключом API для приёма данных](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data) из HyperDX. Он будет использоваться указанными ниже компонентами для безопасной ингестии данных в ваш ClickStack OTel collector:

```shell
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
```

Кроме того, создайте ConfigMap, в котором будет указан адрес вашего OTel collector в ClickStack:

```shell
kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=<OTEL_COLLECTOR_ENDPOINT>
# e.g. kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318
```

### Создание конфигурации ДемонСета {#creating-the-daemonset-configuration}

ДемонСет будет собирать логи и метрики с каждого узла в кластере, но не будет собирать события Kubernetes или метрики на уровне всего кластера.

Скачайте манифест ДемонСета:

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

### Создание конфигурации развертывания {#creating-the-deployment-configuration}

Чтобы собирать события Kubernetes и метрики всего кластера, нам нужно развернуть отдельный коллектор OpenTelemetry в виде развертывания.

Скачайте манифест развертывания:

```shell
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_deployment.yaml
```

<details>
  <summary>k8s&#95;deployment.yaml</summary>

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

## Развертывание коллектора OpenTelemetry {#deploying-the-otel-collector}

Теперь коллектор OpenTelemetry можно развернуть в вашем Kubernetes-кластере с помощью
[Helm-чарта OpenTelemetry](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector).

Добавьте Helm-репозиторий OpenTelemetry:

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts # Add OTel Helm repo
```

Установите Helm-чарт с приведённой выше конфигурацией:

```shell copy
helm install my-opentelemetry-collector-deployment open-telemetry/opentelemetry-collector -f k8s_deployment.yaml
helm install my-opentelemetry-collector-daemonset open-telemetry/opentelemetry-collector -f k8s_daemonset.yaml
```

Now the metrics, logs and Kubernetes events from your Kubernetes cluster should
now appear inside HyperDX.

## Forwarding resource tags to pods (Recommended) {#forwarding-resouce-tags-to-pods}

To correlate application-level logs, metrics, and traces with Kubernetes metadata
(ex. pod name, namespace, etc.), you'll want to forward the Kubernetes metadata
to your application using the `OTEL_RESOURCE_ATTRIBUTES` environment variable.

Here's an example deployment that forwards the Kubernetes metadata to the
application using environment variables:

```yaml
# my_app_deployment.yaml {#deploymentyaml}

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
        # В сочетании с Kubernetes Attribute Processor это обеспечит
        # связывание логов и метрик пода с именем сервиса.
        service.name: <MY_APP_NAME>
    spec:
      containers:
        - name: app-container
          image: my-image
          env:
            # ... другие переменные окружения
            # Сбор метаданных K8s из downward API для передачи в приложение
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
            # Передача метаданных K8s в приложение через OTEL_RESOURCE_ATTRIBUTES
            - name: OTEL_RESOURCE_ATTRIBUTES
              value: k8s.pod.name=$(POD_NAME),k8s.pod.uid=$(POD_UID),k8s.namespace.name=$(POD_NAMESPACE),k8s.node.name=$(NODE_NAME),k8s.deployment.name=$(DEPLOYMENT_NAME)
```
