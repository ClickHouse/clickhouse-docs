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
# например: kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318 {#eg-kubectl-create-configmap-notel-demo-otel-config-vars-from-literalyour_otel_collector_endpointhttpmy-hyperdx-hdx-oss-v2-otel-collector4318}
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

  # Требуется для использования метрик использования CPU/памяти из kubeletstats
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
    # Настраивает процессор Kubernetes для добавления Kubernetes-метаданных.
    # Добавляет процессор k8sattributes во все конвейеры и добавляет необходимые правила в ClusterRole.
    # Подробнее: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor
    kubernetesAttributes:
      enabled: true
      # При включении процессор будет извлекать все метки для связанного пода и добавлять их как атрибуты ресурса.
      # Точное имя метки будет ключом.
      extractAllPodLabels: true
      # При включении процессор будет извлекать все аннотации для связанного пода и добавлять их как атрибуты ресурса.
      # Точное имя аннотации будет ключом.
      extractAllPodAnnotations: true
    # Настраивает коллектор на сбор метрик узлов, подов и контейнеров с API-сервера на Кубелете.
    # Добавляет приемник kubeletstats в конвейер метрик и добавляет необходимые правила в ClusterRole.
    # Подробнее: https://opentelemetry.io/docs/kubernetes/collector/components/#kubeletstats-receiver
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
      # Настраивает дополнительные метрики Кубелета
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
   
  # Нам нужен только один такой коллектор — большее количество приведёт к дублированию данных
  replicaCount: 1
   
  presets:
    kubernetesAttributes:
      enabled: true
      # При включении этот процессор будет извлекать все метки (labels) связанного пода и добавлять их в виде атрибутов ресурса.
      # Точное имя метки будет ключом.
      extractAllPodLabels: true
      # При включении этот процессор будет извлекать все аннотации связанного пода и добавлять их в виде атрибутов ресурса.
      # Точное имя аннотации будет ключом.
      extractAllPodAnnotations: true
    # Настраивает коллектор на сбор событий Kubernetes.
    # Добавляет k8sobject receiver в конвейер логов и по умолчанию собирает события Kubernetes.
    # Подробнее: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver
    kubernetesEvents:
      enabled: true
    # Настраивает Kubernetes Cluster Receiver для сбора метрик на уровне кластера.
    # Добавляет k8s_cluster receiver в конвейер метрик и добавляет необходимые правила в ClusteRole.
    # Подробнее: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-cluster-receiver
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
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts # Добавление репозитория Helm для OTel
```

Установите Helm-чарт с приведённой выше конфигурацией:

```shell copy
helm install my-opentelemetry-collector-deployment open-telemetry/opentelemetry-collector -f k8s_deployment.yaml
helm install my-opentelemetry-collector-daemonset open-telemetry/opentelemetry-collector -f k8s_daemonset.yaml
```

Теперь метрики, логи и события Kubernetes из вашего кластера должны появиться в HyperDX.

## Пересылка тегов ресурсов в поды (рекомендуется) {#forwarding-resouce-tags-to-pods}

Чтобы коррелировать логи, метрики и трассировки на уровне приложения с метаданными Kubernetes
(например, именем пода, пространством имен и т.п.), необходимо передавать метаданные Kubernetes
в приложение с помощью переменной окружения `OTEL_RESOURCE_ATTRIBUTES`.

Ниже приведен пример развертывания, которое передает метаданные Kubernetes в
приложение с использованием переменных окружения:

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
