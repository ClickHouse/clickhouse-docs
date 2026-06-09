---
slug: /use-cases/observability/clickstack/monitoring-kubernetes
title: 'Мониторинг Kubernetes с Управляемым ClickStack'
description: 'Сбор журналов, метрик инфраструктуры и событий из кластера Kubernetes в Управляемый ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'kubernetes', 'k8s', 'управляемый', 'обсервабилити', 'журналы', 'метрики', 'события', 'демонсет', 'helm']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

import Image from '@theme/IdealImage';
import clickstack_cloud from '@site/static/images/use-cases/observability/clickstack-cloud-v2.png';
import clickstack_search_with_k8_logs from '@site/static/images/use-cases/observability/clickstack-search-with-k8-logs.png';
import clickstack_dashboard_kubernetes from '@site/static/images/use-cases/observability/clickstack-dashboard-kubernetes.png';

Это руководство поможет вам настроить сбор журналов, метрик инфраструктуры и событий Kubernetes из кластера в Управляемый ClickStack, а затем просматривать их на встроенной панели мониторинга Kubernetes.

Используется стандартная для OpenTelemetry схема: два коллектора, развернутые с помощью [Helm-чарта OpenTelemetry](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector), каждый из которых пересылает данные в ваш коллектор-шлюз ClickStack по OTLP. **ДемонСет** запускается на каждом узле для сбора журналов контейнеров и метрик Кубелета. **Развертывание** с одной репликой собирает события Kubernetes и метрики всего кластера. Подробнее о роли шлюза см. в разделе [Роли коллектора](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles).

В этом руководстве предполагается, что вы уже выполнили [Настройку OpenTelemetry Collector](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector) и у вас запущен коллектор-шлюз ClickStack.

Для рабочей нагрузки, работающей в Kubernetes, сам коллектор-шлюз должен быть развернут **внутри того же кластера с использованием официального Helm-чарта OpenTelemetry и образа коллектора ClickStack**. Для установки следуйте инструкциям для Helm в разделе [Развертывание коллектора](/use-cases/observability/clickstack/ingesting-data/otel-collector#configuring-the-collector). **Обязательно сохраните эту конечную точку OTLP**.

<VerticalStepper headerLevel="h2">
  ## Подготовьте необходимые компоненты \{#gather-prerequisites\}

  Вам потребуется:

  * **Кластер Kubernetes** (рекомендуется версия v1.20+) с настроенным `kubectl`.
  * **[Helm](https://helm.sh/) v3+**.
  * **Конечная точка OTLP** вашего коллектора-шлюза ClickStack, доступная изнутри кластера, например `http://clickstack-otel-collector.observability.svc.cluster.local:4318`. Коллектор должен быть развернут в месте, доступном для ваших ДемонСетов и Развертывания, обычно в том же кластере или через сервис типа `LoadBalancer`.
  * Значение `OTLP_AUTH_TOKEN`, которое вы указали при развертывании шлюза-коллектора. Если вы не защитили коллектор, можете пропустить шаг с секретом ниже и удалить заголовок `authorization` из манифестов.

  :::note Где запускается шлюз
  Для развертывания внутри кластера запустите коллектор-шлюз как Kubernetes `Deployment` или `StatefulSet` в том же кластере и обращайтесь к нему через внутрикластерный DNS сервиса. Если шлюз работает за пределами кластера, используйте его внешний URL.
  :::

  ## Создание секрета аутентификации и ConfigMap \{#create-secret-and-configmap\}

  Выберите пространство имен для размещения коллекторов, затем создайте секрет с `OTLP_AUTH_TOKEN` и ConfigMap, указывающий на ваш шлюз:

  ```shell
  export OTLP_AUTH_TOKEN="a-strong-shared-secret"
  export OTEL_COLLECTOR_ENDPOINT="http://clickstack-otel-collector.observability.svc.cluster.local:4318"
  export NAMESPACE=observability

  kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

  kubectl create secret generic clickstack-otlp-secret \
    --from-literal=OTLP_AUTH_TOKEN=${OTLP_AUTH_TOKEN} \
    -n ${NAMESPACE}

  kubectl create configmap otel-config-vars \
    --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=${OTEL_COLLECTOR_ENDPOINT} \
    -n ${NAMESPACE}
  ```

  Оба коллектора, описанные ниже, считывают эти значения через `extraEnvs`, поэтому один и тот же секрет и ConfigMap используются в обоих случаях.

  ## Добавление репозитория Helm для OpenTelemetry \{#add-otel-helm-repo\}

  ```shell
  helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
  helm repo update
  ```

  ## Развёртывание коллектора кластера \{#deploy-cluster-collector\}

  Это развертывание с одной репликой, которое собирает **события Kubernetes** и **метрики уровня кластера** (количество узлов, фазы подов, статус развертываний и т. д.). Запуск более одной реплики приведёт к дублированию данных.

  Сохраните следующее содержимое в файл `k8s_deployment.yaml`:

  <details>
    <summary>`k8s_deployment.yaml`</summary>

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
        extractAllPodLabels: true
        extractAllPodAnnotations: true
      # Collects Kubernetes events via the k8sobject receiver.
      kubernetesEvents:
        enabled: true
      # Collects cluster-level metrics via the k8s_cluster receiver.
      clusterMetrics:
        enabled: true

    extraEnvs:
      - name: OTLP_AUTH_TOKEN
        valueFrom:
          secretKeyRef:
            name: clickstack-otlp-secret
            key: OTLP_AUTH_TOKEN
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
            authorization: "${env:OTLP_AUTH_TOKEN}"
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

  Установите его:

  ```shell
  helm install k8s-otel-deployment open-telemetry/opentelemetry-collector \
    -f k8s_deployment.yaml \
    -n ${NAMESPACE}
  ```

  ## Развёртывание коллектора узла \{#deploy-node-collector\}

  Это ДемонСет, который запускается на каждом узле для сбора **журналов контейнеров**, **метрик хоста** и **метрик Кубелета** (потребление CPU и памяти на уровне пода и контейнера относительно запросов и лимитов).

  Сохраните следующее содержимое как `k8s_daemonset.yaml`:

  <details>
    <summary>`k8s_daemonset.yaml`</summary>

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
      kubernetesAttributes:
        enabled: true
        extractAllPodLabels: true
        extractAllPodAnnotations: true
      kubeletMetrics:
        enabled: true

    extraEnvs:
      - name: OTLP_AUTH_TOKEN
        valueFrom:
          secretKeyRef:
            name: clickstack-otlp-secret
            key: OTLP_AUTH_TOKEN
            optional: true
      - name: YOUR_OTEL_COLLECTOR_ENDPOINT
        valueFrom:
          configMapKeyRef:
            name: otel-config-vars
            key: YOUR_OTEL_COLLECTOR_ENDPOINT

    config:
      receivers:
        # Additional kubelet metrics expressed as utilisation against requests and limits.
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
            authorization: "${env:OTLP_AUTH_TOKEN}"

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

  Установите его:

  ```shell
  helm install k8s-otel-daemonset open-telemetry/opentelemetry-collector \
    -f k8s_daemonset.yaml \
    -n ${NAMESPACE}
  ```

  Убедитесь, что оба релиза работают корректно:

  ```shell
  kubectl get pods -n ${NAMESPACE} -l app.kubernetes.io/name=opentelemetry-collector
  ```

  Вы должны увидеть один под Развертывания и один под ДемонСета на каждом узле, все в состоянии `Running`.

  ## Передача атрибутов Kubernetes в приложения (рекомендуется) \{#forward-k8s-attributes\}

  Чтобы коррелировать журналы, метрики и трассировки вашего приложения с метаданными Kubernetes (имя пода, пространство имен, узел, развертывание), передайте метаданные в приложение через `OTEL_RESOURCE_ATTRIBUTES`. Процессор `k8sattributes` ДемонСета затем дополнит входящую телеметрию соответствующими атрибутами пода и узла.

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
          service.name: <MY_APP_NAME>
      spec:
        containers:
          - name: app-container
            image: my-image
            env:
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
              - name: OTEL_RESOURCE_ATTRIBUTES
                value: k8s.pod.name=$(POD_NAME),k8s.pod.uid=$(POD_UID),k8s.namespace.name=$(POD_NAMESPACE),k8s.node.name=$(NODE_NAME),k8s.deployment.name=$(DEPLOYMENT_NAME)
  ```

  ## Подтверждение в интерфейсе ClickStack \{#confirm-in-ui\}

  Откройте свой сервис в [консоли ClickHouse Cloud](https://console.clickhouse.cloud) и выберите **ClickStack** в левом меню.

  <Image img={clickstack_cloud} size="lg" alt="Запустите ClickStack" border />

  В представлении **Search** переключите источник на `Logs` и задайте временной диапазон **Last 15 minutes**. Журналы контейнеров со всего кластера должны появиться в течение нескольких секунд — с такими атрибутами, как `k8s.namespace.name`, `k8s.pod.name` и `k8s.node.name`.

  <Image img={clickstack_search_with_k8_logs} size="lg" alt="Представление Search в ClickStack с журналами Kubernetes" />

  Чтобы просмотреть метрики инфраструктуры и события в контексте, откройте встроенную панель мониторинга **Kubernetes**, перейдя в **Dashboards** -&gt; **Kubernetes**. Вкладки `Pods`, `Nodes` и `Namespaces` должны содержать данные.

  <Image img={clickstack_dashboard_kubernetes} size="lg" alt="Панель мониторинга ClickStack для Kubernetes" border />

  Если ничего не отображается:

  * Убедитесь, что поды ДемонСета и Развертывания находятся в состоянии `Running`, и просматривайте вывод их журналов командой `kubectl logs -n ${NAMESPACE} <pod>`.
  * Убедитесь, что `YOUR_OTEL_COLLECTOR_ENDPOINT` достижима изнутри кластера (подключитесь к одному из подов коллектора с помощью `kubectl exec` и выполните `curl` к этой конечной точке).
  * Проверьте, что `OTLP_AUTH_TOKEN` в секрете совпадает со значением, заданным для коллектора-шлюза.

  ## Дополнительные материалы \{#further-reading\}

  * [Справочник по интеграции с Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) с полным набором приёмников, процессоров и параметров тонкой настройки.
  * [Передача тегов ресурсов в поды](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods) — подробнее об обогащении на стороне приложения.
  * [Защита коллектора](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector) с использованием TLS на конечной точке OTLP и пользователей ингестии с минимально необходимыми привилегиями.
  * [Оценка ресурсов](/use-cases/observability/clickstack/ingesting-data/otel-collector#estimating-resources) для развертываний шлюза и агента с учётом ожидаемой пропускной способности.
  * [Переход в промышленную эксплуатацию](/use-cases/observability/clickstack/production) с рекомендациями по подготовке к промышленной эксплуатации.
</VerticalStepper>