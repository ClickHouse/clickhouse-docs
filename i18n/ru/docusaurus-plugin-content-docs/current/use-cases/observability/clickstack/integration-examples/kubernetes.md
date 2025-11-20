---
slug: /use-cases/observability/clickstack/integrations/kubernetes
pagination_prev: null
pagination_next: null
description: 'Интеграция Kubernetes для ClickStack — стека наблюдаемости ClickHouse'
title: 'Kubernetes'
doc_type: 'guide'
keywords: ['clickstack', 'kubernetes', 'logs', 'observability', 'container monitoring']
---

ClickStack использует коллектор OpenTelemetry (OTel) для сбора логов, метрик и событий Kubernetes из кластеров Kubernetes и их пересылки в ClickStack. Мы поддерживаем нативный формат логов OTel и не требуем дополнительной вендор-специфичной конфигурации.

В этом руководстве рассматривается интеграция следующих компонентов:

- **Логи**
- **Инфраструктурные метрики**

:::note
Чтобы отправлять метрики на уровне приложения или APM/трейсы, вам также нужно добавить соответствующую языковую интеграцию в ваше приложение.
:::

В данном руководстве предполагается, что вы развернули [ClickStack OTel collector в режиме шлюза](/use-cases/observability/clickstack/ingesting-data/otel-collector), защищённый ключом API для приёма данных.



## Создание конфигурационных файлов Helm-чарта OTel {#creating-the-otel-helm-chart-config-files}

Для сбора логов и метрик как с каждого узла, так и с самого кластера, потребуется развернуть два отдельных коллектора OpenTelemetry. Один будет развернут как DaemonSet для сбора логов и метрик с каждого узла, а другой — как Deployment для сбора логов и метрик с самого кластера.

### Создание секрета с API-ключом {#create-api-key-secret}

Создайте новый секрет Kubernetes с [API-ключом для приема данных](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data) из HyperDX. Он будет использоваться установленными ниже компонентами для безопасной передачи данных в ваш коллектор OTel ClickStack:

```shell
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
```

Дополнительно создайте ConfigMap с расположением вашего коллектора OTel ClickStack:


```shell
kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=<OTEL_COLLECTOR_ENDPOINT>
# e.g. kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318
```

### Создание конфигурации DaemonSet {#creating-the-daemonset-configuration}

DaemonSet будет собирать логи и метрики с каждого узла кластера, но не будет собирать события Kubernetes или метрики на уровне кластера.

Скачайте манифест DaemonSet:

```shell
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_daemonset.yaml
```

<details>

<summary>`k8s_daemonset.yaml`</summary>


```yaml
# daemonset.yaml
mode: daemonset
```


# Требуется для использования метрик утилизации CPU/памяти kubeletstats

clusterRole:
create: true
rules: - apiGroups: - ''
resources: - nodes/proxy
verbs: - get

presets:
logsCollection:
enabled: true
hostMetrics:
enabled: true

# Настраивает процессор Kubernetes для добавления метаданных Kubernetes.

# Добавляет процессор k8sattributes во все конвейеры и добавляет необходимые правила в ClusterRole.

# Подробнее: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor

kubernetesAttributes:
enabled: true # При включении процессор извлечёт все метки связанного пода и добавит их как атрибуты ресурса. # Точное имя метки будет использоваться в качестве ключа.
extractAllPodLabels: true # При включении процессор извлечёт все аннотации связанного пода и добавит их как атрибуты ресурса. # Точное имя аннотации будет использоваться в качестве ключа.
extractAllPodAnnotations: true

# Настраивает коллектор для сбора метрик узлов, подов и контейнеров с API-сервера на kubelet.

# Добавляет приёмник kubeletstats в конвейер метрик и добавляет необходимые правила в ClusterRole.

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
receivers: # Настраивает дополнительные метрики kubelet
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
exporters: - otlphttp
metrics:
exporters: - otlphttp

````

</details>

### Создание конфигурации развёртывания {#creating-the-deployment-configuration}

Для сбора событий Kubernetes и метрик на уровне кластера необходимо развернуть отдельный коллектор OpenTelemetry в виде развёртывания.

Загрузите манифест развёртывания:

```shell
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_deployment.yaml
````

<details>
<summary>k8s_deployment.yaml</summary>


```yaml
# deployment.yaml
mode: deployment

image:
  repository: otel/opentelemetry-collector-contrib
  tag: 0.123.0
```


# Нам нужен только один такой коллектор — при большем количестве будут создаваться дублирующиеся данные

replicaCount: 1

presets:
kubernetesAttributes:
enabled: true # При включении процессор извлечёт все метки связанного пода и добавит их в качестве атрибутов ресурса. # Точное имя метки будет использоваться как ключ.
extractAllPodLabels: true # При включении процессор извлечёт все аннотации связанного пода и добавит их в качестве атрибутов ресурса. # Точное имя аннотации будет использоваться как ключ.
extractAllPodAnnotations: true

# Настраивает коллектор для сбора событий Kubernetes.

# Добавляет приёмник k8sobject в конвейер логов и по умолчанию собирает события Kubernetes.

# Подробнее: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver

kubernetesEvents:
enabled: true

# Настраивает приёмник Kubernetes Cluster для сбора метрик на уровне кластера.

# Добавляет приёмник k8s_cluster в конвейер метрик и добавляет необходимые правила в ClusterRole.

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
exporters: - otlphttp
metrics:
exporters: - otlphttp

```

</details>

```


## Развертывание сборщика OpenTelemetry {#deploying-the-otel-collector}

Сборщик OpenTelemetry можно развернуть в кластере Kubernetes с помощью
[OpenTelemetry Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector).

Добавьте репозиторий Helm для OpenTelemetry:

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts # Добавить репозиторий Helm для OTel
```

Установите чарт с приведенной выше конфигурацией:

```shell copy
helm install my-opentelemetry-collector-deployment open-telemetry/opentelemetry-collector -f k8s_deployment.yaml
helm install my-opentelemetry-collector-daemonset open-telemetry/opentelemetry-collector -f k8s_daemonset.yaml
```

После этого метрики, логи и события Kubernetes из вашего кластера Kubernetes должны
появиться в HyperDX.


## Передача тегов ресурсов в поды (рекомендуется) {#forwarding-resouce-tags-to-pods}

Для корреляции логов, метрик и трассировок уровня приложения с метаданными Kubernetes
(например, имя пода, пространство имён и т. д.) необходимо передать метаданные Kubernetes
в приложение с помощью переменной окружения `OTEL_RESOURCE_ATTRIBUTES`.

Ниже приведён пример развёртывания, которое передаёт метаданные Kubernetes
в приложение с использованием переменных окружения:


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
        # В сочетании с Kubernetes Attribute Processor это обеспечит
        # привязку логов и метрик пода к имени сервиса.
        service.name: <MY_APP_NAME>
    spec:
      containers:
        - name: app-container
          image: my-image
          env:
            # ... другие переменные окружения
            # Сбор метаданных K8s из downward API для передачи приложению
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
            # Передача метаданных K8s приложению через OTEL_RESOURCE_ATTRIBUTES
            - name: OTEL_RESOURCE_ATTRIBUTES
              value: k8s.pod.name=$(POD_NAME),k8s.pod.uid=$(POD_UID),k8s.namespace.name=$(POD_NAMESPACE),k8s.node.name=$(NODE_NAME),k8s.deployment.name=$(DEPLOYMENT_NAME)
```
