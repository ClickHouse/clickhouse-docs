---
slug: /use-cases/observability/clickstack/getting-started/kubernetes
title: 'Мониторинг Kubernetes'
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: 'Начало работы с ClickStack для мониторинга Kubernetes'
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

Это руководство позволяет собирать логи и метрики из вашего кластера Kubernetes и отправлять их в **ClickStack** для визуализации и анализа. В качестве демонстрационных данных при необходимости используется форк ClickStack официального демо OpenTelemetry.

<iframe width="768" height="432" src="https://www.youtube.com/embed/winI7256Ejk?si=TRThhzCJdq87xg_x" title="Проигрыватель видео YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />


## Предварительные требования {#prerequisites}

Для выполнения этого руководства вам потребуется:

- **Кластер Kubernetes** (рекомендуется v1.20+) с не менее чем 32 GiB ОЗУ и 100 ГБ доступного дискового пространства на одном узле для ClickHouse.
- **[Helm](https://helm.sh/)** v3+
- **`kubectl`**, настроенный для взаимодействия с вашим кластером



## Варианты развертывания {#deployment-options}

Вы можете следовать этому руководству, используя один из следующих вариантов развертывания:

- **Самостоятельное размещение**: Разверните ClickStack полностью в вашем кластере Kubernetes, включая:
  - ClickHouse
  - HyperDX
  - MongoDB (используется для хранения состояния и конфигурации дашбордов)

- **Облачное размещение**: Используйте **ClickHouse Cloud** с внешним управлением HyperDX. Это избавляет от необходимости запускать ClickHouse или HyperDX внутри вашего кластера.

Для имитации трафика приложений вы можете дополнительно развернуть форк ClickStack приложения [**OpenTelemetry Demo Application**](https://github.com/ClickHouse/opentelemetry-demo). Оно генерирует телеметрические данные, включая логи, метрики и трассировки. Если у вас уже есть рабочие нагрузки в кластере, вы можете пропустить этот шаг и мониторить существующие поды, узлы и контейнеры.

<VerticalStepper headerLevel="h3">

### Установка cert-manager (необязательно) {#install-cert-manager}

Если вашей конфигурации требуются TLS-сертификаты, установите [cert-manager](https://cert-manager.io/) с помощью Helm:


```shell
# Добавьте репозиторий cert-manager 

helm repo add jetstack https://charts.jetstack.io 

helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set startupapicheck.timeout=5m --set installCRDs=true --set global.leaderElection.namespace=cert-manager
```

### Развертывание OpenTelemetry Demo (необязательно)

Этот **шаг необязателен и предназначен для пользователей, у которых нет существующих подов для мониторинга**. Пользователи с уже развернутыми сервисами в своем Kubernetes‑кластере могут пропустить этот шаг, однако данный демо‑стенд включает инструментированные микросервисы, которые генерируют данные трассировок и воспроизведения сессий, что позволяет пользователям изучить все возможности ClickStack.

Следующая процедура разворачивает форк стека приложений OpenTelemetry Demo от ClickStack в кластере Kubernetes, адаптированный для тестирования наблюдаемости и демонстрации инструментирования. Он включает backend‑микросервисы, генераторы нагрузки, конвейеры телеметрии, вспомогательную инфраструктуру (например, Kafka, Redis) и интеграции SDK с ClickStack.

Все сервисы развернуты в пространстве имен `otel-demo`. Каждое развертывание включает:

* Автоматическое инструментирование с использованием OTel и ClickStack SDKS для трассировок, метрик и логов.
* Все сервисы отправляют свою инструментированную телеметрию в коллектор OpenTelemetry `my-hyperdx-hdx-oss-v2-otel-collector` (не развернут в рамках этого шага).
* [Проброс тегов ресурсов](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods) для корреляции логов, метрик и трассировок через переменную окружения `OTEL_RESOURCE_ATTRIBUTES`.


```shell
## загрузите демонстрационный файл манифеста Kubernetes
curl -O https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
# альтернатива wget
# wget https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
kubectl apply --namespace otel-demo -f opentelemetry-demo.yaml
```

После развертывания демонстрационного приложения убедитесь, что все поды успешно созданы и находятся в состоянии `Running`:

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

### Добавьте репозиторий Helm-чарта ClickStack {#add-helm-clickstack}

Для развертывания ClickStack используется [официальный Helm-чарт](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm).

Для этого необходимо добавить репозиторий Helm для HyperDX:

```shell
helm repo add hyperdx https://hyperdxio.github.io/helm-charts
helm repo update
```

### Разверните ClickStack {#deploy-clickstack}

После установки Helm-чарта можно развернуть ClickStack в вашем кластере. Вы можете запустить все компоненты, включая ClickHouse и HyperDX, в вашей среде Kubernetes или использовать ClickHouse Cloud, где HyperDX также доступен как управляемый сервис.

<br />

<details>
<summary>Самостоятельное развертывание</summary>

Следующая команда устанавливает ClickStack в пространство имен `otel-demo`. Helm-чарт развертывает:

- Экземпляр ClickHouse
- HyperDX
- Дистрибутив ClickStack для OTel collector
- MongoDB для хранения состояния приложения HyperDX

:::note
Возможно, потребуется настроить `storageClassName` в соответствии с конфигурацией вашего кластера Kubernetes.
:::

Пользователи, не развертывающие демонстрационное приложение OTel, могут изменить это, выбрав подходящее пространство имен.

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2   --set clickhouse.persistence.dataSize=100Gi --set global.storageClassName="standard-rwo" -n otel-demo
```

:::warning ClickStack в производственной среде


Этот чарт также устанавливает ClickHouse и OTel collector. Для production-окружения рекомендуется использовать операторы ClickHouse и OTel collector и/или использовать ClickHouse Cloud.

Чтобы отключить ClickHouse и OTel collector, задайте следующие значения:

```shell
helm install myrelease <chart-name-or-path> --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
```

:::

</details>

<details>
<summary>Использование ClickHouse Cloud</summary>

Если вы предпочитаете использовать ClickHouse Cloud, можно развернуть ClickStack и [отключить встроенный ClickHouse](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud).

:::note
В настоящее время чарт всегда развертывает как HyperDX, так и MongoDB. Хотя эти компоненты предоставляют альтернативный путь доступа, они не интегрированы с аутентификацией ClickHouse Cloud. Эти компоненты предназначены для администраторов в данной модели развертывания, [предоставляя доступ к защищенному ключу ингестии](#retrieve-ingestion-api-key), необходимому для приёма данных через развернутый OTel collector, но не должны быть доступны конечным пользователям.
:::


```shell
# укажите учетные данные ClickHouse Cloud
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # полный https url
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

helm install my-hyperdx hyperdx/hdx-oss-v2  --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} --set clickhouse.config.users.otelUserName=${CLICKHOUSE_USER} --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD} --set global.storageClassName="standard-rwo" -n otel-demo
```

</details>

Чтобы проверить статус развертывания, выполните следующую команду и убедитесь, что все компоненты находятся в состоянии `Running`. Обратите внимание, что для пользователей ClickHouse Cloud компонент ClickHouse будет отсутствовать в этом списке:

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
Даже при использовании ClickHouse Cloud локальный экземпляр HyperDX, развернутый в кластере Kubernetes, остается необходимым. Он предоставляет ключ приёма данных, управляемый сервером OpAMP, входящим в состав HyperDX, который обеспечивает безопасность приёма данных через развернутый OTel collector — возможность, которая в настоящее время недоступна в версии, размещенной в ClickHouse Cloud.
:::

В целях безопасности сервис использует `ClusterIP` и по умолчанию не доступен извне.

Чтобы получить доступ к интерфейсу HyperDX, выполните проброс порта с 3000 на локальный порт 8080.

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

Перейдите по адресу [http://localhost:8080](http://localhost:8080) для доступа к интерфейсу HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующие требованиям сложности.

<Image img={hyperdx_login} alt='HyperDX UI' size='lg' />

### Получение ключа API для приёма данных {#retrieve-ingestion-api-key}

Приём данных в OTel collector, развернутый с помощью ClickStack, защищен ключом приёма данных.

Перейдите в [`Team Settings`](http://localhost:8080/team) и скопируйте `Ingestion API Key` из раздела `API Keys`. Этот ключ API обеспечивает безопасность приёма данных через OpenTelemetry collector.

<Image img={copy_api_key} alt='Copy API key' size='lg' />

### Создание Kubernetes Secret для ключа API {#create-api-key-kubernetes-secret}

Создайте новый Kubernetes secret с ключом API для приёма данных и config map, содержащую расположение OTel collector, развернутого с помощью Helm-чарта ClickStack. Последующие компоненты будут использовать это для обеспечения приёма данных в collector, развернутый с помощью Helm-чарта ClickStack:


```shell
# создать секрет с ключом API для ингестии
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
-n otel-demo
```


# создайте ConfigMap, указывающий на развернутый выше OTel collector ClickStack

kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR&#95;OTEL&#95;COLLECTOR&#95;ENDPOINT=[http://my-hyperdx-hdx-oss-v2-otel-collector:4318](http://my-hyperdx-hdx-oss-v2-otel-collector:4318)

````

Перезапустите поды демонстрационного приложения OpenTelemetry, чтобы они начали использовать ключ API для приёма данных. 

```shell
kubectl rollout restart deployment -n otel-demo -l app.kubernetes.io/part-of=opentelemetry-demo
````

Данные трассировок и логов от демонстрационных сервисов теперь должны начать поступать в HyperDX.

<Image img={hyperdx_kubernetes_data} alt="HyperDX Kubernetes Data" size="lg" />

### Добавьте репозиторий Helm для OpenTelemetry

Чтобы собирать метрики Kubernetes, мы развернём стандартный OTel collector и настроим его на безопасную отправку данных в наш ClickStack collector с использованием указанного выше ключа API для приёма данных (ingestion API key).

Для этого необходимо установить репозиторий Helm для OpenTelemetry:


```shell
# Добавьте репозиторий Helm для OTel
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts 
```

### Разверните компоненты коллектора Kubernetes

Чтобы собирать логи и метрики как с самого кластера, так и с каждого узла, нужно развернуть два отдельных коллектора OpenTelemetry, каждый со своим манифестом. Два предоставленных манифеста — `k8s_deployment.yaml` и `k8s_daemonset.yaml` — совместно обеспечивают сбор полной телеметрии из вашего кластера Kubernetes.

* `k8s_deployment.yaml` разворачивает **единственный экземпляр OpenTelemetry Collector**, отвечающий за сбор **событий и метаданных на уровне кластера**. Он собирает события Kubernetes, метрики кластера и обогащает телеметрию метками и аннотациями подов. Этот коллектор запускается как отдельное Развертывание с одной репликой, чтобы избежать дублирования данных.

* `k8s_daemonset.yaml` разворачивает **коллектор на базе ДемонСета**, который работает на каждом узле вашего кластера. Он собирает **метрики на уровне узлов и подов**, а также логи контейнеров, используя такие компоненты, как `kubeletstats`, `hostmetrics` и процессоры атрибутов Kubernetes. Эти коллекторы обогащают логи метаданными и отправляют их в HyperDX с помощью экспортера OTLP.

Совместно эти манифесты обеспечивают сквозную наблюдаемость по всему кластеру — от инфраструктуры до телеметрии на уровне приложений — и отправляют обогащённые данные в ClickStack для централизованного анализа.

Сначала установите коллектор как Развертывание:


```shell
# скачать файл манифеста
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_deployment.yaml
# установить helm chart
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


# Нам нужен только один такой коллектор — большее количество приведёт к дублированию данных

replicaCount: 1

presets:
kubernetesAttributes:
enabled: true # При включении процессор извлечёт все метки связанного пода и добавит их как атрибуты ресурса. # Точное имя метки будет использовано в качестве ключа.
extractAllPodLabels: true # При включении процессор извлечёт все аннотации связанного пода и добавит их как атрибуты ресурса. # Точное имя аннотации будет использовано в качестве ключа.
extractAllPodAnnotations: true

# Настраивает коллектор для сбора событий Kubernetes.

# Добавляет k8sobject receiver в конвейер логов и по умолчанию собирает события Kubernetes.

# Подробнее: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver

kubernetesEvents:
enabled: true

# Настраивает Kubernetes Cluster Receiver для сбора метрик на уровне кластера.

# Добавляет k8s_cluster receiver в конвейер метрик и добавляет необходимые правила в ClusterRole.

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

Далее разверните коллектор как ДемонСет для сбора метрик и логов на уровне узлов и подов:

```


```shell
# скачать файл манифеста
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_daemonset.yaml
# установить helm-чарт
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


# Требуется для использования метрик использования ЦП/памяти kubeletstats

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

# Добавляет процессор k8sattributes во все конвейеры и добавляет необходимые правила в РольКластера.

# Подробнее: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor

kubernetesAttributes:
enabled: true # При включении процессор извлечет все метки связанного пода и добавит их в качестве атрибутов ресурса. # Точное имя метки будет использоваться в качестве ключа.
extractAllPodLabels: true # При включении процессор извлечет все аннотации связанного пода и добавит их в качестве атрибутов ресурса. # Точное имя аннотации будет использоваться в качестве ключа.
extractAllPodAnnotations: true

# Настраивает коллектор для сбора метрик узла, пода и контейнера с API-сервера на Кубелет.

# Добавляет приемник kubeletstats в конвейер метрик и добавляет необходимые правила в РольКластера.

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
receivers: # Настраивает дополнительные метрики Кубелет
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

### Просмотр данных Kubernetes в HyperDX {#explore-kubernetes-data-hyperdx}

Перейдите в пользовательский интерфейс HyperDX — используя экземпляр, развернутый в Kubernetes, или через ClickHouse Cloud.

<p/>
<details>
<summary>Использование ClickHouse Cloud</summary>

При использовании ClickHouse Cloud просто войдите в сервис ClickHouse Cloud и выберите «HyperDX» в левом меню. Вы будете автоматически аутентифицированы, и вам не потребуется создавать пользователя.

При запросе на создание источника данных сохраните все значения по умолчанию в модели создания источника, заполнив поле Table значением `otel_logs` — для создания источника журналов. Все остальные настройки должны быть определены автоматически, после чего вы сможете нажать `Save New Source`.

<Image force img={hyperdx_cloud_datasource} alt="Источник данных HyperDX в ClickHouse Cloud" size="lg"/>

Вам также потребуется создать источник данных для трассировок и метрик.

Например, для создания источников трассировок и метрик OTel пользователи могут выбрать `Создать Новый Источник` в верхнем меню.

<Image force img={hyperdx_create_new_source} alt="Создание нового источника в HyperDX" size="lg"/>

Затем выберите требуемый тип источника и соответствующую таблицу, например, для трассировок выберите таблицу `otel_traces`. Все настройки должны быть определены автоматически.

<Image force img={hyperdx_create_trace_datasource} alt="Создание источника трассировок в HyperDX" size="lg"/>

```


:::note Корреляция источников
Обратите внимание, что различные источники данных в ClickStack — такие как логи и трассировки — могут быть коррелированы друг с другом. Для этого требуется дополнительная конфигурация каждого источника. Например, в источнике логов можно указать соответствующий источник трассировок, и наоборот — в источнике трассировок указать источник логов. Подробнее см. раздел «Коррелированные источники».
:::

</details>

<details>

<summary>Использование самостоятельно управляемого развертывания</summary>

Для доступа к локально развернутому HyperDX можно использовать проброс порта с помощью следующей команды и получить доступ к HyperDX по адресу [http://localhost:8080](http://localhost:8080).

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

:::note ClickStack в продакшене
В продакшене рекомендуется использовать входной шлюз с TLS, если вы не используете HyperDX в ClickHouse Cloud. Например:

```shell
helm upgrade my-hyperdx hyperdx/hdx-oss-v2 \
--set hyperdx.ingress.enabled=true \
--set hyperdx.ingress.host=your-domain.com \
--set hyperdx.ingress.tls.enabled=true
```

:::

</details>

Для изучения данных Kubernetes перейдите на специальную панель мониторинга по адресу `/kubernetes`, например [http://localhost:8080/kubernetes](http://localhost:8080/kubernetes).

Каждая из вкладок — Поды, Узлы и Пространства имен — должна быть заполнена данными.

</VerticalStepper>

<Image img={dashboard_kubernetes} alt='ClickHouse kubernetes' size='lg' />
