---
slug: /use-cases/observability/clickstack/getting-started/kubernetes
title: 'Мониторинг Kubernetes'
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: 'Введение в ClickStack и мониторинг Kubernetes'
doc_type: 'guide'
keywords: ['clickstack', 'kubernetes', 'логи', 'наблюдаемость', 'мониторинг контейнеров']
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

Это руководство поможет вам собирать логи и метрики из вашего кластера Kubernetes и отправлять их в **ClickStack** для визуализации и анализа. Для демонстрационных данных при необходимости используется форк официального демо OpenTelemetry от ClickStack.

<iframe width="768" height="432" src="https://www.youtube.com/embed/winI7256Ejk?si=TRThhzCJdq87xg_x" title="Проигрыватель видео YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

## Предварительные требования \{#prerequisites\}

Для выполнения этого руководства вам потребуется:

- **Кластер Kubernetes** (рекомендуется v1.20+) как минимум с 32 GiB оперативной памяти и 100 GB дискового пространства, доступного на одном узле для ClickHouse.
- **[Helm](https://helm.sh/)** v3+
- **`kubectl`**, настроенный для взаимодействия с кластером

## Варианты развертывания \{#deployment-options\}

Вы можете следовать этому руководству, используя один из следующих вариантов развертывания:

- **Самостоятельное развертывание (self-hosted)**: Разверните ClickStack полностью внутри вашего кластера Kubernetes, включая:
  - ClickHouse
  - HyperDX
  - MongoDB (используется для хранения состояния и конфигурации дашбордов)

- **Облачное развертывание (cloud-hosted)**: Используйте **ClickHouse Cloud**, при этом HyperDX управляется вне вашего кластера. Это устраняет необходимость запускать ClickHouse или HyperDX внутри вашего кластера.

Чтобы имитировать трафик приложения, вы можете дополнительно развернуть форк ClickStack для [**OpenTelemetry Demo Application**](https://github.com/ClickHouse/opentelemetry-demo). Он генерирует телеметрию, включая логи, метрики и трейсы. Если у вас уже есть рабочие нагрузки в кластере, вы можете пропустить этот шаг и отслеживать существующие поды, узлы и контейнеры.

<VerticalStepper headerLevel="h3">
  ### Установка cert-manager (опционально)

  Если вашей конфигурации требуются TLS-сертификаты, установите [cert-manager](https://cert-manager.io/) с помощью Helm:

  ```shell
  # Add Cert manager repo 

  helm repo add jetstack https://charts.jetstack.io 

  helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set startupapicheck.timeout=5m --set installCRDs=true --set global.leaderElection.namespace=cert-manager
  ```

  ### Развертывание демо-приложения OpenTelemetry (необязательно)

  Этот **шаг необязателен и предназначен для пользователей, у которых нет подов для мониторинга**. Пользователи с уже развёрнутыми сервисами в своей среде Kubernetes могут его пропустить, однако данная демонстрация включает инструментированные микросервисы, которые генерируют данные трассировки и воспроизведения сеансов, позволяя пользователям изучить все возможности ClickStack.

  Далее описывается развертывание форка OpenTelemetry Demo Application от ClickStack в кластере Kubernetes, предназначенного для тестирования обсервабилити и демонстрации инструментирования. В состав входят микросервисы бэкенда, генераторы нагрузки, конвейеры телеметрии, поддерживающая инфраструктура (например, Kafka, Redis) и интеграции SDK с ClickStack.

  Все сервисы развёртываются в пространстве имён `otel-demo`. Каждое развёртывание включает:

  * Автоматическое инструментирование с использованием OTel и SDKS ClickStack для трейсов, метрик и логов.
  * Все сервисы отправляют свою телеметрию в сборщик OpenTelemetry `my-hyperdx-hdx-oss-v2-otel-collector` (не развернут)
  * [Проброс тегов ресурсов](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods) для корреляции логов, метрик и трассировок с помощью переменной окружения `OTEL_RESOURCE_ATTRIBUTES`.

  ```shell
  ## download demo Kubernetes manifest file
  curl -O https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
  # wget alternative
  # wget https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
  kubectl apply --namespace otel-demo -f opentelemetry-demo.yaml
  ```

  После развертывания демонстрационного примера убедитесь, что все поды успешно созданы и находятся в состоянии `Running`:

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

  ### Добавьте репозиторий Helm-чартов ClickStack

  Для развертывания ClickStack используется [официальный Helm-чарт](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm).

  Для этого необходимо добавить Helm-репозиторий HyperDX:

  ```shell
  helm repo add hyperdx https://hyperdxio.github.io/helm-charts
  helm repo update
  ```

  ### Развертывание ClickStack

  После установки Helm-чарта можно развернуть ClickStack в кластере. Можно либо запустить все компоненты, включая ClickHouse и HyperDX, в среде Kubernetes, либо использовать ClickHouse Cloud, где HyperDX также доступен в виде управляемого сервиса.

  <br />

  <details>
    <summary>Самостоятельное развертывание</summary>

    Следующая команда устанавливает ClickStack в пространство имён `otel-demo`. Helm-чарт разворачивает:

    * Экземпляр ClickHouse
    * HyperDX
    * Дистрибутив OTel collector от ClickStack
    * MongoDB для хранения состояния приложения HyperDX

    :::note
    Вам может потребоваться настроить параметр `storageClassName` в соответствии с конфигурацией кластера Kubernetes.
    :::

    Пользователи, которые не развертывают демонстрацию OTel, могут изменить пространство имён, выбрав подходящее.

    ```shell
    helm install my-hyperdx hyperdx/hdx-oss-v2   --set clickhouse.persistence.dataSize=100Gi --set global.storageClassName="standard-rwo" -n otel-demo
    ```

    :::warning ClickStack в продакшене

    Этот Helm-чарт также устанавливает ClickHouse и OTel collector. Для продуктивной среды рекомендуется использовать операторы ClickHouse и OTel collector и/или ClickHouse Cloud.

    Чтобы отключить ClickHouse и OTel collector, задайте следующие значения:

    :::

    ```shell
    helm install myrelease <chart-name-or-path> --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
    ```

    :::
  </details>

  <details>
    <summary>Использование ClickHouse Cloud</summary>

    Если вы предпочитаете использовать ClickHouse Cloud, вы можете развернуть ClickStack и [отключить включённый в него ClickHouse](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud).

    :::note
    На данный момент чарт всегда разворачивает и HyperDX, и MongoDB. Хотя эти компоненты предоставляют альтернативный способ доступа, они не интегрированы с аутентификацией ClickHouse Cloud. В этой модели развертывания они предназначены для администраторов, так как [предоставляют доступ к защищённому ключу ингестии](#retrieve-ingestion-api-key), необходимому для приёма данных через развернутый OTel collector, и не должны быть доступны конечным пользователям.
    :::

    ```shell
    # specify ClickHouse Cloud credentials
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

  ### Доступ к интерфейсу HyperDX

  :::note
  Даже при использовании ClickHouse Cloud локальный экземпляр HyperDX, развёрнутый в кластере Kubernetes, всё равно необходим. Он предоставляет ключ ингестии, управляемый сервером OpAMP, входящим в состав HyperDX, который обеспечивает безопасный приём данных через развёрнутый OTel collector — возможность, которая в настоящее время недоступна в версии, размещённой в ClickHouse Cloud.
  :::

  В целях безопасности сервис использует `ClusterIP` и по умолчанию не доступен извне.

  Чтобы получить доступ к интерфейсу HyperDX, настройте переадресацию с порта 3000 на локальный порт 8080.

  ```shell
  kubectl port-forward \
   pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
    8080:3000 \
   -n otel-demo
  ```

  Перейдите по адресу [http://localhost:8080](http://localhost:8080) для доступа к интерфейсу HyperDX.

  Создайте пользователя, указав имя пользователя и пароль, соответствующие требованиям сложности.

  <Image img={hyperdx_login} alt="Интерфейс HyperDX" size="lg" />

  ### Получение ключа API для приёма данных

  Ингестия данных в OTel collector, развёрнутый с помощью ClickStack, защищена ключом ингестии.

  Перейдите в [`Team Settings`](http://localhost:8080/team) и скопируйте `Ingestion API Key` из раздела `API Keys`. Этот ключ API обеспечивает безопасный приём данных через коллектор OpenTelemetry.

  <Image img={copy_api_key} alt="Скопировать API-ключ" size="lg" />

  ### Создание секрета Kubernetes для API-ключа

  Создайте новый Kubernetes secret с ключом API для приёма данных и config map, содержащую расположение OTel collector, развёрнутого с помощью Helm-чарта ClickStack. Последующие компоненты будут использовать их для приёма данных в collector, развёрнутый с помощью Helm-чарта ClickStack:

  ```shell
  # create secret with the ingestion API key
  kubectl create secret generic hyperdx-secret \
  --from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
  -n otel-demo

  # create a ConfigMap pointing to the ClickStack OTel collector deployed above
  kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318
  ```

  Перезапустите поды демонстрационного приложения OpenTelemetry, чтобы учесть ключ API для приёма данных.

  ```shell
  kubectl rollout restart deployment -n otel-demo -l app.kubernetes.io/part-of=opentelemetry-demo
  ```

  Данные трассировки и журналов из демонстрационных сервисов теперь должны начать поступать в HyperDX.

  <Image img={hyperdx_kubernetes_data} alt="Данные Kubernetes в HyperDX" size="lg" />

  ### Добавьте репозиторий Helm для OpenTelemetry

  Для сбора метрик Kubernetes мы развернём стандартный OTel collector, настроив его на безопасную отправку данных в наш ClickStack collector с использованием указанного выше ключа API для ингестии.

  Для этого необходимо установить Helm-репозиторий OpenTelemetry:

  ```shell
  # Add Otel Helm repo
  helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts 
  ```

  ### Развертывание компонентов коллектора Kubernetes

  Для сбора логов и метрик как с самого кластера, так и с каждого узла, необходимо развернуть два отдельных коллектора OpenTelemetry, каждый со своим манифестом. Два предоставленных манифеста — `k8s_deployment.yaml` и `k8s_daemonset.yaml` — работают совместно для сбора исчерпывающих телеметрических данных из вашего кластера Kubernetes.

  * `k8s_deployment.yaml` разворачивает **единственный экземпляр коллектора OpenTelemetry**, отвечающий за сбор **событий и метаданных во всём кластере**. Он собирает события Kubernetes, метрики кластера и обогащает телеметрические данные метками и аннотациями подов. Этот коллектор работает как отдельное развертывание с одной репликой, чтобы избежать дублирования данных.

  * `k8s_daemonset.yaml` разворачивает **коллектор на основе ДемонСета**, который запускается на каждом узле вашего кластера. Он собирает **метрики на уровне узлов и подов**, а также логи контейнеров, используя компоненты `kubeletstats`, `hostmetrics` и процессоры Kubernetes Attribute Processor. Эти коллекторы обогащают логи метаданными и отправляют их в HyperDX с помощью экспортера OTLP.

  Вместе эти манифесты обеспечивают полную обсервабилити всего стека в кластере — от инфраструктуры до телеметрии на уровне приложений — и отправляют обогащённые данные в ClickStack для централизованного анализа.

  Сначала установите коллектор в виде Deployment:

  ```shell
  # download manifest file
  curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_deployment.yaml
  # install the helm chart
  helm install --namespace otel-demo k8s-otel-deployment open-telemetry/opentelemetry-collector -f k8s_deployment.yaml
  ```

  <details>
    <summary>k8s&#95;deployment.yaml</summary>

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

  Далее разверните коллектор в виде ДемонСета для сбора метрик и логов на уровне узлов и подов:

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

  ### Исследование данных Kubernetes в HyperDX

  Перейдите в интерфейс HyperDX — используя экземпляр, развёрнутый в Kubernetes, или через ClickHouse Cloud.

  <p />

  <details>
    <summary>Использование ClickHouse Cloud</summary>

    Если вы используете ClickHouse Cloud, просто войдите в свой сервис ClickHouse Cloud и выберите «HyperDX» в левом меню. Аутентификация произойдёт автоматически, и вам не потребуется создавать пользователя.

    Когда будет предложено создать источник данных, сохраните все значения по умолчанию в модальном окне создания источника, заполнив поле Table значением `otel_logs`, чтобы создать источник логов. Все остальные настройки должны быть автоматически определены, после чего вы сможете нажать `Save New Source`.

    <Image force img={hyperdx_cloud_datasource} alt="Источник данных ClickHouse Cloud HyperDX" size="lg" />

    Вам также потребуется создать источник данных для трассировок и метрик.

    Например, чтобы создать источники для трассировок и метрик OTel, вы можете выбрать `Create New Source` в верхнем меню.

    <Image force img={hyperdx_create_new_source} alt="HyperDX создание нового источника" size="lg" />

    Отсюда выберите требуемый тип источника, а затем соответствующую таблицу, например для трассировок выберите таблицу `otel_traces`. Все настройки должны быть автоматически определены.

    <Image force img={hyperdx_create_trace_datasource} alt="HyperDX создание источника трассировок" size="lg" />

    :::note Корреляция источников
    Обратите внимание, что различные источники данных в ClickStack — такие как логи и трассировки — могут быть скоррелированы между собой. Для этого требуется дополнительная настройка для каждого источника. Например, в источнике логов вы можете указать соответствующий источник трассировок, и наоборот — в источнике трассировок. Дополнительную информацию см. в разделе «Коррелированные источники».
    :::
  </details>

  <details>
    <summary>Использование самостоятельного развертывания</summary>

    Чтобы получить доступ к локально развернутому экземпляру HyperDX, выполните локальную команду `port-forward`, а затем откройте HyperDX по адресу [http://localhost:8080](http://localhost:8080).

    ```shell
    kubectl port-forward \
     pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
      8080:3000 \
     -n otel-demo
    ```

    :::note ClickStack в продуктивной среде
    В продуктивной среде мы рекомендуем использовать входной шлюз с TLS, если вы не используете HyperDX в ClickHouse Cloud. Например:

    ```shell
    helm upgrade my-hyperdx hyperdx/hdx-oss-v2 \
    --set hyperdx.ingress.enabled=true \
    --set hyperdx.ingress.host=your-domain.com \
    --set hyperdx.ingress.tls.enabled=true
    ```

    ::::
  </details>

  Для просмотра данных Kubernetes перейдите на специальную панель мониторинга по адресу `/kubernetes`, например [http://localhost:8080/kubernetes](http://localhost:8080/kubernetes).

  Каждая из вкладок — Поды, Узлы и Пространства имен — должна содержать данные.
</VerticalStepper>

<Image img={dashboard_kubernetes} alt="ClickHouse в Kubernetes" size="lg"/>