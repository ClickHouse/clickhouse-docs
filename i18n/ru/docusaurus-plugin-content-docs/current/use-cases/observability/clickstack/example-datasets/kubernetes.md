---
slug: /use-cases/observability/clickstack/getting-started/kubernetes
title: 'Мониторинг Kubernetes'
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: 'Начало работы с ClickStack и мониторингом Kubernetes'
doc_type: 'guide'
keywords: ['clickstack', 'kubernetes', 'логи', 'наблюдаемость', 'мониторинг контейнеров']
---

import Image from '@theme/IdealImage';
import DemoArchitecture from '@site/docs/use-cases/observability/clickstack/example-datasets/_snippets/_demo.md';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_kubernetes_data from '@site/static/images/use-cases/observability/hyperdx-kubernetes-data.png';
import copy_api_key from '@site/static/images/use-cases/observability/copy_api_key.png';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';
import dashboard_kubernetes from '@site/static/images/use-cases/observability/hyperdx-dashboard-kubernetes.png';

Это руководство позволяет собирать логи и метрики из вашего кластера Kubernetes и отправлять их в **ClickStack** для визуализации и анализа. Для демонстрационных данных при желании можно использовать форк ClickStack официального демо OpenTelemetry.

<iframe width="768" height="432" src="https://www.youtube.com/embed/winI7256Ejk?si=TRThhzCJdq87xg_x" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />


## Предварительные требования {#prerequisites}

Для работы с данным руководством необходимо иметь:

- **Кластер Kubernetes** (рекомендуется версия 1.20 или выше) с не менее чем 32 ГиБ оперативной памяти и 100 ГБ дискового пространства на одном узле для ClickHouse.
- **[Helm](https://helm.sh/)** версии 3 или выше
- **`kubectl`**, настроенный для взаимодействия с вашим кластером


## Варианты развертывания {#deployment-options}

Вы можете следовать этому руководству, используя один из следующих вариантов развертывания:

- **Самостоятельное размещение**: Разверните ClickStack полностью в вашем кластере Kubernetes, включая:
  - ClickHouse
  - HyperDX
  - MongoDB (используется для хранения состояния и конфигурации дашборда)

- **Облачное размещение**: Используйте **ClickHouse Cloud** с внешним управлением HyperDX. Это избавляет от необходимости запускать ClickHouse или HyperDX внутри вашего кластера.

Для имитации трафика приложения вы можете дополнительно развернуть форк ClickStack приложения [**OpenTelemetry Demo Application**](https://github.com/ClickHouse/opentelemetry-demo). Оно генерирует телеметрические данные, включая логи, метрики и трассировки. Если у вас уже есть рабочие нагрузки в кластере, вы можете пропустить этот шаг и мониторить существующие поды, узлы и контейнеры.

<VerticalStepper headerLevel="h3">

### Установка cert-manager (необязательно) {#install-cert-manager}

Если вашей конфигурации требуются TLS-сертификаты, установите [cert-manager](https://cert-manager.io/) с помощью Helm:


```shell
# Добавление репозитория Cert manager

helm repo add jetstack https://charts.jetstack.io

helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set startupapicheck.timeout=5m --set installCRDs=true --set global.leaderElection.namespace=cert-manager
```

### Развертывание демонстрационного приложения OpenTelemetry (необязательно) {#deploy-otel-demo}

Этот **шаг необязателен и предназначен для пользователей, у которых нет подов для мониторинга**. Хотя пользователи с уже развернутыми сервисами в среде Kubernetes могут его пропустить, эта демонстрация включает инструментированные микросервисы, которые генерируют данные трассировки и воспроизведения сеансов, позволяя пользователям изучить все возможности ClickStack.

Следующая команда развертывает форк ClickStack демонстрационного стека приложений OpenTelemetry в кластере Kubernetes, адаптированный для тестирования наблюдаемости и демонстрации инструментирования. Он включает бэкенд-микросервисы, генераторы нагрузки, конвейеры телеметрии, поддерживающую инфраструктуру (например, Kafka, Redis) и интеграции SDK с ClickStack.

Все сервисы развертываются в пространстве имен `otel-demo`. Каждое развертывание включает:

- Автоматическое инструментирование с помощью OTel и ClickStack SDK для трассировок, метрик и логов.
- Все сервисы отправляют данные инструментирования в коллектор OpenTelemetry `my-hyperdx-hdx-oss-v2-otel-collector` (не развернут).
- [Пересылку тегов ресурсов](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods) для корреляции логов, метрик и трассировок через переменную окружения `OTEL_RESOURCE_ATTRIBUTES`.


```shell
## download demo Kubernetes manifest file
curl -O https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
# wget alternative
# wget https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
kubectl apply --namespace otel-demo -f opentelemetry-demo.yaml
```

После развертывания демонстрации убедитесь, что все поды успешно созданы и находятся в состоянии `Running`:

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

<DemoArchitecture />

### Добавление репозитория Helm-чартов ClickStack {#add-helm-clickstack}

Для развертывания ClickStack используется [официальный Helm-чарт](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm).

Для этого необходимо добавить репозиторий Helm от HyperDX:

```shell
helm repo add hyperdx https://hyperdxio.github.io/helm-charts
helm repo update
```

### Развертывание ClickStack {#deploy-clickstack}

После установки Helm-чарта можно развернуть ClickStack в кластере. Вы можете запустить все компоненты, включая ClickHouse и HyperDX, в среде Kubernetes или использовать ClickHouse Cloud, где HyperDX также доступен в качестве управляемого сервиса.

<br />

<details>
<summary>Самостоятельное развертывание</summary>

Следующая команда устанавливает ClickStack в пространство имен `otel-demo`. Helm-чарт развертывает:

- Экземпляр ClickHouse
- HyperDX
- Дистрибутив ClickStack коллектора OTel
- MongoDB для хранения состояния приложения HyperDX

:::note
Возможно, потребуется настроить параметр `storageClassName` в соответствии с конфигурацией кластера Kubernetes.
:::

Пользователи, не развертывающие демонстрацию OTel, могут изменить команду, выбрав соответствующее пространство имен.

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2   --set clickhouse.persistence.dataSize=100Gi --set global.storageClassName="standard-rwo" -n otel-demo
```

:::warning ClickStack в продакшене


Этот чарт также устанавливает ClickHouse и коллектор OTel. Для production-среды рекомендуется использовать операторы ClickHouse и коллектора OTel и/или использовать ClickHouse Cloud.

Чтобы отключить ClickHouse и коллектор OTel, задайте следующие значения:

```shell
helm install myrelease <chart-name-or-path> --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
```

:::

</details>

<details>
<summary>Использование ClickHouse Cloud</summary>

Если вы предпочитаете использовать ClickHouse Cloud, можно развернуть ClickStack и [отключить встроенный ClickHouse](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud).

:::note
В настоящее время чарт всегда развертывает как HyperDX, так и MongoDB. Хотя эти компоненты предоставляют альтернативный путь доступа, они не интегрированы с аутентификацией ClickHouse Cloud. Эти компоненты предназначены для администраторов в данной модели развертывания, [предоставляя доступ к защищенному ключу приема данных](#retrieve-ingestion-api-key), необходимому для приема данных через развернутый коллектор OTel, но не должны быть доступны конечным пользователям.
:::


```shell
# укажите учетные данные ClickHouse Cloud
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # full https url
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

helm install my-hyperdx hyperdx/hdx-oss-v2  --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} --set clickhouse.config.users.otelUserName=${CLICKHOUSE_USER} --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD} --set global.storageClassName="standard-rwo" -n otel-demo
```

</details>

Чтобы проверить статус развертывания, выполните следующую команду и убедитесь, что все компоненты находятся в состоянии `Running`. Обратите внимание, что при использовании ClickHouse Cloud компонент ClickHouse будет отсутствовать в этом списке:

```shell
kubectl get pods -l "app.kubernetes.io/name=hdx-oss-v2" -n otel-demo

NAME                                                    READY   STATUS    RESTARTS   AGE
my-hyperdx-hdx-oss-v2-app-78876d79bb-565tb              1/1     Running   0          14m
my-hyperdx-hdx-oss-v2-clickhouse-57975fcd6-ggnz2        1/1     Running   0          14m
my-hyperdx-hdx-oss-v2-mongodb-984845f96-czb6m           1/1     Running   0          14m
my-hyperdx-hdx-oss-v2-otel-collector-64cf698f5c-8s7qj   1/1     Running   0          14m
```

### Доступ к интерфейсу HyperDX {#access-the-hyperdx-ui}

:::note
Даже при использовании ClickHouse Cloud локальный экземпляр HyperDX, развернутый в кластере Kubernetes, по-прежнему необходим. Он предоставляет ключ приема данных, управляемый сервером OpAMP, входящим в состав HyperDX, который обеспечивает безопасный прием данных через развернутый коллектор OTel — функциональность, которая в настоящее время недоступна в версии, размещенной в ClickHouse Cloud.
:::

В целях безопасности сервис использует `ClusterIP` и по умолчанию не доступен извне.

Чтобы получить доступ к интерфейсу HyperDX, настройте перенаправление с порта 3000 на локальный порт 8080.

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

Перейдите по адресу [http://localhost:8080](http://localhost:8080) для доступа к интерфейсу HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующие требованиям сложности.

<Image img={hyperdx_login} alt='HyperDX UI' size='lg' />

### Получение ключа API для приема данных {#retrieve-ingestion-api-key}

Прием данных в коллектор OTel, развернутый с помощью ClickStack, защищен ключом приема данных.

Перейдите в раздел [`Team Settings`](http://localhost:8080/team) и скопируйте `Ingestion API Key` из раздела `API Keys`. Этот ключ API обеспечивает безопасный прием данных через коллектор OpenTelemetry.

<Image img={copy_api_key} alt='Copy API key' size='lg' />

### Создание секрета Kubernetes для ключа API {#create-api-key-kubernetes-secret}

Создайте новый секрет Kubernetes с ключом API для приема данных и конфигурационную карту, содержащую расположение коллектора OTel, развернутого с помощью Helm-чарта ClickStack. Последующие компоненты будут использовать их для приема данных в коллектор, развернутый с помощью Helm-чарта ClickStack:


```shell
# создать секрет с ключом API для приема данных
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
-n otel-demo
```


# создайте ConfigMap, указывающую на развёрнутый выше коллектор ClickStack OTel

kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318

````

Перезапустите поды демонстрационного приложения OpenTelemetry, чтобы применить ключ API приёма данных.

```shell
kubectl rollout restart deployment -n otel-demo -l app.kubernetes.io/part-of=opentelemetry-demo
````

Данные трассировки и журналов из демонстрационных сервисов теперь должны начать поступать в HyperDX.

<Image img={hyperdx_kubernetes_data} alt='Данные Kubernetes в HyperDX' size='lg' />

### Добавление репозитория Helm для OpenTelemetry {#add-otel-helm-repo}

Для сбора метрик Kubernetes мы развернём стандартный коллектор OTel, настроив его на безопасную отправку данных в наш коллектор ClickStack с использованием указанного выше ключа API приёма данных.

Для этого необходимо установить репозиторий Helm для OpenTelemetry:


```shell
# Добавить репозиторий Helm для Otel
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

### Развертывание компонентов сборщика Kubernetes {#deploy-kubernetes-collector-components}

Для сбора логов и метрик как из самого кластера, так и с каждого узла необходимо развернуть два отдельных сборщика OpenTelemetry, каждый со своим манифестом. Два предоставленных манифеста — `k8s_deployment.yaml` и `k8s_daemonset.yaml` — работают совместно для сбора полных телеметрических данных из вашего кластера Kubernetes.

- `k8s_deployment.yaml` развертывает **единственный экземпляр OpenTelemetry Collector**, отвечающий за сбор **событий и метаданных на уровне кластера**. Он собирает события Kubernetes, метрики кластера и обогащает телеметрические данные метками и аннотациями подов. Этот сборщик работает как автономное развертывание с одной репликой, чтобы избежать дублирования данных.

- `k8s_daemonset.yaml` развертывает **сборщик на основе DaemonSet**, который запускается на каждом узле кластера. Он собирает **метрики на уровне узлов и подов**, а также логи контейнеров, используя такие компоненты, как `kubeletstats`, `hostmetrics` и процессоры атрибутов Kubernetes. Эти сборщики обогащают логи метаданными и отправляют их в HyperDX с помощью экспортера OTLP.

Вместе эти манифесты обеспечивают полную наблюдаемость всего стека в кластере — от инфраструктуры до телеметрии на уровне приложений — и отправляют обогащенные данные в ClickStack для централизованного анализа.

Сначала установите сборщик в виде развертывания:


```shell
# скачать файл манифеста
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_deployment.yaml
# установить Helm-чарт
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
```


# Нам нужен только один такой сборщик — при большем количестве будут создаваться дублирующиеся данные

replicaCount: 1

presets:
kubernetesAttributes:
enabled: true # При включении процессор извлечёт все метки связанного пода и добавит их в качестве атрибутов ресурса. # Точное имя метки будет использоваться в качестве ключа.
extractAllPodLabels: true # При включении процессор извлечёт все аннотации связанного пода и добавит их в качестве атрибутов ресурса. # Точное имя аннотации будет использоваться в качестве ключа.
extractAllPodAnnotations: true

# Настраивает сборщик для сбора событий Kubernetes.

# Добавляет приёмник k8sobject в конвейер журналов и по умолчанию собирает события Kubernetes.

# Подробнее: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver

kubernetesEvents:
enabled: true

# Настраивает приёмник кластера Kubernetes для сбора метрик на уровне кластера.

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

Далее разверните сборщик в виде DaemonSet для сбора метрик и журналов на уровне узлов и подов:

```


```shell
# загрузить файл манифеста
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_daemonset.yaml
# установить Helm-чарт
helm install --namespace otel-demo k8s-otel-daemonset open-telemetry/opentelemetry-collector -f k8s_daemonset.yaml
```

<details>

<summary>`k8s_daemonset.yaml`</summary>


```yaml
# k8s_daemonset.yaml
mode: daemonset

image:
  repository: otel/opentelemetry-collector-contrib
  tag: 0.123.0
```


# Необходимо для использования метрик утилизации CPU/памяти kubeletstats

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
enabled: true # При включении процессор извлекает все метки связанного пода и добавляет их в качестве атрибутов ресурса. # Точное имя метки используется в качестве ключа.
extractAllPodLabels: true # При включении процессор извлекает все аннотации связанного пода и добавляет их в качестве атрибутов ресурса. # Точное имя аннотации используется в качестве ключа.
extractAllPodAnnotations: true

# Настраивает сборщик для получения метрик узлов, подов и контейнеров с API-сервера на kubelet.

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

### Изучение данных Kubernetes в HyperDX {#explore-kubernetes-data-hyperdx}

Перейдите в пользовательский интерфейс HyperDX — используя экземпляр, развернутый в Kubernetes, или через ClickHouse Cloud.

<p/>
<details>
<summary>Использование ClickHouse Cloud</summary>

При использовании ClickHouse Cloud просто войдите в сервис ClickHouse Cloud и выберите «HyperDX» в левом меню. Вы будете автоматически аутентифицированы, и вам не потребуется создавать пользователя.

При появлении запроса на создание источника данных сохраните все значения по умолчанию в форме создания источника, заполнив поле Table значением `otel_logs` — для создания источника логов. Все остальные настройки должны определиться автоматически, после чего можно нажать `Save New Source`.

<Image force img={hyperdx_cloud_datasource} alt="Источник данных HyperDX в ClickHouse Cloud" size="lg"/>

Также потребуется создать источник данных для трассировок и метрик.

Например, для создания источников трассировок и метрик OTel можно выбрать `Create New Source` в верхнем меню.

<Image force img={hyperdx_create_new_source} alt="Создание нового источника в HyperDX" size="lg"/>

Здесь выберите требуемый тип источника, а затем соответствующую таблицу, например, для трассировок выберите таблицу `otel_traces`. Все настройки должны определиться автоматически.

<Image force img={hyperdx_create_trace_datasource} alt="Создание источника трассировок в HyperDX" size="lg"/>

```


:::note Корреляция источников
Обратите внимание, что различные источники данных в ClickStack — такие как логи и трассировки — могут коррелироваться друг с другом. Для этого требуется дополнительная настройка каждого источника. Например, в источнике логов можно указать соответствующий источник трассировок, и наоборот — в источнике трассировок. Подробнее см. раздел «Коррелируемые источники».
:::

</details>

<details>

<summary>Использование самостоятельно управляемого развёртывания</summary>

Для доступа к локально развёрнутому HyperDX можно использовать проброс портов с помощью локальной команды и получить доступ к HyperDX по адресу [http://localhost:8080](http://localhost:8080).

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

:::note ClickStack в продакшене
В продакшене мы рекомендуем использовать ingress с TLS, если вы не используете HyperDX в ClickHouse Cloud. Например:

```shell
helm upgrade my-hyperdx hyperdx/hdx-oss-v2 \
--set hyperdx.ingress.enabled=true \
--set hyperdx.ingress.host=your-domain.com \
--set hyperdx.ingress.tls.enabled=true
```

:::

</details>

Для изучения данных Kubernetes перейдите на специальный дашборд по адресу `/kubernetes`, например [http://localhost:8080/kubernetes](http://localhost:8080/kubernetes).

Каждая из вкладок — Pods, Nodes и Namespaces — должна быть заполнена данными.

</VerticalStepper>

<Image img={dashboard_kubernetes} alt='ClickHouse kubernetes' size='lg' />
