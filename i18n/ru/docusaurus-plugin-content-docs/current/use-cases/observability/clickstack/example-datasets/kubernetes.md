---
'slug': '/use-cases/observability/clickstack/getting-started/kubernetes'
'title': 'Мониторинг Kubernetes'
'sidebar_position': 1
'pagination_prev': null
'pagination_next': null
'description': 'Начало работы с ClickStack и мониторинг Kubernetes'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import DemoArchitecture from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/example-datasets/_snippets/_demo.md';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_kubernetes_data from '@site/static/images/use-cases/observability/hyperdx-kubernetes-data.png';
import copy_api_key from '@site/static/images/use-cases/observability/copy_api_key.png';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';
import dashboard_kubernetes from '@site/static/images/use-cases/observability/hyperdx-dashboard-kubernetes.png';

Этот гид позволяет вам собирать логи и метрики из вашей системы Kubernetes и отправлять их в **ClickStack** для визуализации и анализа. Для демо-данных мы используем, при желании, форк ClickStack официального демо Open Telemetry.

<iframe width="768" height="432" src="https://www.youtube.com/embed/winI7256Ejk?si=TRThhzCJdq87xg_x" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Предварительные требования {#prerequisites}

Этот гид требует наличия:

- **Kubernetes кластера** (рекомендуемая версия v1.20+) с минимум 32 ГиБ ОЗУ и 100 ГБ дискового пространства, доступного на одном узле для ClickHouse.
- **[Helm](https://helm.sh/)** версии v3+
- **`kubectl`**, настроенного для взаимодействия с вашим кластером

## Варианты развертывания {#deployment-options}

Вы можете следовать этому гиду, используя один из следующих вариантов развертывания:

- **Саморазмещение**: Разверните ClickStack полностью внутри вашего кластера Kubernetes, включая:
  - ClickHouse
  - HyperDX
  - MongoDB (используется для состояния и конфигурации панели)

- **Облачное размещение**: Используйте **ClickHouse Cloud**, при этом HyperDX управляется внешне. Это устраняет необходимость запускать ClickHouse или HyperDX внутри вашего кластера.

Чтобы смоделировать трафик приложения, вы можете по желанию развернуть форк ClickStack [**OpenTelemetry Demo Application**](https://github.com/ClickHouse/opentelemetry-demo). Это генерирует телеметрические данные, включая логи, метрики и трассировки. Если у вас уже есть рабочие нагрузки в вашем кластере, вы можете пропустить этот шаг и мониторить существующие поды, узлы и контейнеры.

<VerticalStepper headerLevel="h3">

### Установить cert-manager (Опционально) {#install-cert-manager}

Если в вашей настройке требуются TLS-сертификаты, установите [cert-manager](https://cert-manager.io/) с помощью Helm:

```shell

# Add Cert manager repo 

helm repo add jetstack https://charts.jetstack.io 

helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set startupapicheck.timeout=5m --set installCRDs=true --set global.leaderElection.namespace=cert-manager
```

### Развернуть OpenTelemetry Demo (Опционально) {#deploy-otel-demo}

Этот **шаг является опциональным и предназначен для пользователей, у которых нет существующих подов для мониторинга**. Хотя пользователи с уже развернутыми службами в их среде Kubernetes могут пропустить этот шаг, это демо включает в себя инструментированные микросервисы, которые генерируют данные трассировки и воспроизведения сессий - позволяя пользователям исследовать все функции ClickStack.

Следующее развертывает форк ClickStack OpenTelemetry Demo приложения в рамках кластера Kubernetes, адаптированного для тестирования наблюдаемости и демонстрации инструментирования. В него входят микросервисы бэкенда, генераторы нагрузки, телеметрические каналы, поддерживающая инфраструктура (например, Kafka, Redis) и интеграции SDK с ClickStack.

Все сервисы развернуты в пространстве имен `otel-demo`. Каждое развертывание включает:

- Автоматическое инструментирование с помощью OTel и ClickStack SDKS для трассировок, метрик и логов.
- Все сервисы отправляют свое инструментирование в OpenTelemetry коллектор `my-hyperdx-hdx-oss-v2-otel-collector` (не развернут).
- [Пересылка тегов ресурсов](/use-cases/observability/clickstack/ingesting-data/kubernetes#forwarding-resouce-tags-to-pods) для сопоставления логов, метрик и трассировок через переменную окружения `OTEL_RESOURCE_ATTRIBUTES`.

```shell
## download demo Kubernetes manifest file
curl -O https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml

# wget alternative

# wget https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
kubectl apply --namespace otel-demo -f opentelemetry-demo.yaml
```

После развертывания демо подтвердите, что все поды были успешно созданы и находятся в состоянии `Running`:

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

### Добавить репозиторий Helm для ClickStack {#add-helm-clickstack}

Для развертывания ClickStack мы используем [официальную Helm диаграмму](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm).

Это требует от нас добавления репозитория Helm HyperDX:

```shell
helm repo add hyperdx https://hyperdxio.github.io/helm-charts
helm repo update
```

### Развернуть ClickStack {#deploy-clickstack}

После установки Helm диаграммы вы можете развернуть ClickStack в вашем кластере. Вы можете либо запустить все компоненты, включая ClickHouse и HyperDX, в вашей среде Kubernetes, либо использовать ClickHouse Cloud, где HyperDX также доступен как управляемая служба.
<br/>

<details>
<summary>Самоуправляемое развертывание</summary>

Следующая команда устанавливает ClickStack в пространство имен `otel-demo`. Helm диаграмма разворачивает:

- Экземпляр ClickHouse
- HyperDX
- ClickStack дистрибуцию OTel collector
- MongoDB для хранения состояния приложения HyperDX

:::note
Вам может потребоваться настроить `storageClassName` в соответствии с конфигурацией вашего кластера Kubernetes. 
:::

Пользователи, не развертывающие OTel демо, могут изменить это, выбрав соответствующее пространство имен.

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2   --set clickhouse.persistence.dataSize=100Gi --set global.storageClassName="standard-rwo" -n otel-demo
```

:::warning ClickStack в производстве

Эта диаграмма также устанавливает ClickHouse и OTel collector. Для производства рекомендуется использовать операторов ClickHouse и OTel collector и/или использовать ClickHouse Cloud.

Чтобы отключить ClickHouse и OTel collector, установите следующие значения:

```shell
helm install myrelease <chart-name-or-path> --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
```

:::

</details>

<details>
<summary>Используя ClickHouse Cloud</summary>

Если вы предпочитаете использовать ClickHouse Cloud, вы можете развернуть ClickStack и [отключить включенный ClickHouse](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud). 

:::note
Данная диаграмма в настоящее время всегда разворачивает как HyperDX, так и MongoDB. Хотя эти компоненты предлагают альтернативный путь доступа, они не интегрированы с аутентификацией ClickHouse Cloud. Эти компоненты предназначены для администраторов в этой модели развертывания, [обеспечивая доступ к безопасному ключу приема данных](#retrieve-ingestion-api-key), необходимому для приема через развернутый OTel collector, но не должны быть доступны конечным пользователям.
:::

```shell

# specify ClickHouse Cloud credentials
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # full https url
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

helm install my-hyperdx hyperdx/hdx-oss-v2  --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} --set clickhouse.config.users.otelUser=${CLICKHOUSE_USER} --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD} --set global.storageClassName="standard-rwo" -n otel-demo
```

</details>

Чтобы проверить статус развертывания, выполните следующую команду и подтвердите, что все компоненты находятся в состоянии `Running`. Обратите внимание, что ClickHouse будет отсутствовать для пользователей, использующих ClickHouse Cloud:

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
Даже при использовании ClickHouse Cloud, локальный экземпляр HyperDX, развернутый в кластере Kubernetes, все еще требуется. Он предоставляет ключ для приема данных, управляемый сервером OpAMP, встроенным в HyperDX, что обеспечивает безопасный прием через развернутый OTel collector - возможность, которая в настоящее время недоступна в версии ClickHouse, размещенной в облаке.
:::

Для обеспечения безопасности служба использует `ClusterIP` и по умолчанию не доступна извне.

Чтобы получить доступ к интерфейсу HyperDX, пересылайте порты с 3000 на локальный порт 8080.

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

Перейдите на [http://localhost:8080](http://localhost:8080) для доступа к интерфейсу HyperDX.

Создайте пользователя, предоставив имя пользователя и пароль, которые соответствуют требованиям к сложности.

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

### Получить ключ API приема данных {#retrieve-ingestion-api-key}

Прием данных в OTel collector, развернутый Collector'ом ClickStack, защищен ключом приема данных.

Перейдите в [`Настройки команды`](http://localhost:8080/team) и скопируйте `Ingestion API Key` из раздела `API Keys`. Этот ключ API обеспечивает безопасность приема данных через OpenTelemetry collector.

<Image img={copy_api_key} alt="Копирование ключа API" size="lg"/>

### Создать секрет Kubernetes с ключом API {#create-api-key-kubernetes-secret}

Создайте новый секрет Kubernetes с ключом API приема данных и конфигурационной картой, содержащей местоположение OTel collector, развернутого с помощью диаграммы ClickStack. Позже компоненты будут использовать это для приема данных в collector, развернутый с помощью Helm диаграммы ClickStack:

```shell

# create secret with the ingestion API key
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
-n otel-demo


# create a ConfigMap pointing to the ClickStack OTel collector deployed above
kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318
```

Перезагрузите поды приложения OpenTelemetry демо, чтобы учесть ключ API приема данных. 

```shell
kubectl rollout restart deployment -n otel-demo -l app.kubernetes.io/part-of=opentelemetry-demo
```

Данные трассировки и логи от демо-сервисов теперь должны начать поступать в HyperDX.

<Image img={hyperdx_kubernetes_data} alt="Данные Kubernetes HyperDX" size="lg"/>

### Добавить репозиторий Helm OpenTelemetry {#add-otel-helm-repo}

Чтобы собирать метрики Kubernetes, мы развернем стандартный OTel collector, настроив его для безопасной отправки данных в наш ClickStack collector с использованием вышеуказанного ключа API приема данных.

Для этого нам нужно установить репозиторий Helm OpenTelemetry:

```shell

# Add Otel Helm repo
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts 
```

### Развернуть компоненты коллектора Kubernetes {#deploy-kubernetes-collector-components}

Чтобы собирать логи и метрики как с самого кластера, так и с каждого узла, нам нужно развернуть два отдельных OpenTelemetry коллектора, каждый со своим манифестом. Два предоставленных манифеста - `k8s_deployment.yaml` и `k8s_daemonset.yaml` - работают вместе для сбора всесторонних телеметрических данных из вашего кластера Kubernetes.

- `k8s_deployment.yaml` развертывает **один экземпляр OpenTelemetry Collector**, ответственный за сбор **глобальных событий и метаданных кластера**. Он собирает события Kubernetes, метрики кластера и обогащает телеметрические данные метками и аннотациями подов. Этот коллектор работает как самостоятельное развертывание с одной репликой, чтобы избежать дублирования данных.

- `k8s_daemonset.yaml` развертывает **коллектор на основе DaemonSet**, который работает на каждом узле вашего кластера. Он собирает **метрики на уровне узлов и подов**, а также логи контейнеров, используя такие компоненты, как `kubeletstats`, `hostmetrics` и процессоры атрибутов Kubernetes. Эти коллекторы обогащают логи метаданными и отправляют их в HyperDX с помощью экспортера OTLP.

Вместе эти манифесты обеспечивают полную наблюдаемость стеки от инфраструктуры до телеметрии уровня приложения и отправляют обогащенные данные в ClickStack для централизованного анализа.

Сначала установите коллектор как развертывание:

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

Затем разверните коллектор как DaemonSet для метрик и логов на уровне узлов и подов:

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

### Изучите данные Kubernetes в HyperDX {#explore-kubernetes-data-hyperdx}

Перейдите в интерфейс HyperDX - либо используя вашу локально развернутую версию, либо через ClickHouse Cloud.

<p/>
<details>
<summary>Используя ClickHouse Cloud</summary>

Если вы используете ClickHouse Cloud, просто войдите в свою облачную службу ClickHouse и выберите "HyperDX" в левом меню. Вы будете автоматически аутентифицированы и не нужно будет создавать пользователя.

Когда вас попросят создать источник данных, оставьте все значения по умолчанию в модели создания источника, заполнив поле таблицы значением `otel_logs` - чтобы создать источник логов. Все остальные настройки должны быть автоматически определены, позволяя вам нажать `Save New Source`.

<Image force img={hyperdx_cloud_datasource} alt="Источник данных HyperDX ClickHouse Cloud" size="lg"/>

Вам также нужно будет создать источник данных для трассировок и метрик.

Например, чтобы создать источники для трассировок и метрик OTel, пользователи могут выбрать `Create New Source` в верхнем меню.

<Image force img={hyperdx_create_new_source} alt="HyperDX создать новый источник" size="lg"/>

Отсюда выберите необходимый тип источника, а затем соответствующую таблицу, например для трассировок выберите таблицу `otel_traces`. Все настройки должны быть автоматически определены.

<Image force img={hyperdx_create_trace_datasource} alt="HyperDX создать источник трассировок" size="lg"/>

:::note Сопоставление источников
Обратите внимание, что различные источники данных в ClickStack - такие как логи и трассировки - могут быть сопоставлены друг с другом. Чтобы включить это, требуется дополнительная конфигурация для каждого источника. Например, в источнике логов вы можете указать соответствующий источник трассировок и наоборот в источнике трассировок. Смотрите "Сопоставленные источники" для получения дополнительных деталей.
:::

</details>

<details>

<summary>Используя саморазворачиваемое развертывание</summary>

Чтобы получить доступ к локально развернутому HyperDX, вы можете использовать пересылку порта с помощью локальной команды и получить доступ к HyperDX по адресу [http://localhost:8080](http://localhost:8080).

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

:::note ClickStack в производстве
В производственных условиях мы рекомендуем использовать ingress с TLS, если вы не используете HyperDX в ClickHouse Cloud. Например:

```shell
helm upgrade my-hyperdx hyperdx/hdx-oss-v2 \
--set hyperdx.ingress.enabled=true \
--set hyperdx.ingress.host=your-domain.com \
--set hyperdx.ingress.tls.enabled=true
```
::::

</details>

Чтобы исследовать данные Kubernetes, перейдите на специальную панель мониторинга по адресу `/kubernetes`, например, [http://localhost:8080/kubernetes](http://localhost:8080/kubernetes).

Каждая из вкладок, Под, Узлы и Пространства имен, должна быть заполнена данными.

</VerticalStepper>

<Image img={dashboard_kubernetes} alt="Kubernetes ClickHouse" size="lg"/>
