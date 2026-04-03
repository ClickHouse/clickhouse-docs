---
slug: /use-cases/observability/clickstack/deployment/helm-upgrade
title: 'Руководство по обновлению Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 6
description: 'Переход с Helm-чарта ClickStack v1.x с inline-template на архитектуру v2.x на основе субчартов'
doc_type: 'guide'
keywords: ['обновление ClickStack', 'миграция Helm', 'с v1.x на v2.x', 'архитектура субчартов', 'миграция ClickStack']
---

В этом руководстве описан переход с Helm-чарта ClickStack с inline-template (v1.x) на архитектуру на основе субчартов (v2.x). Это **критическое изменение**: самописные ресурсы Kubernetes заменяются пользовательскими ресурсами под управлением операторов для MongoDB и ClickHouse, а также используется официальный Helm-чарт OpenTelemetry Collector.

:::warning Критическое изменение
Чарт v2.x **не** обратно совместим с v1.x. Обновление на месте с помощью `helm upgrade` не поддерживается. Рекомендуем выполнить чистую установку параллельно с существующим развертыванием и перенести данные, а не пытаться обновить текущую установку на месте.
:::

## Предварительные требования \{#prerequisites\}

* Перед обновлением создайте резервную копию данных (MongoDB, ClickHouse PVC)
* Проверьте текущие переопределения в `values.yaml` — большинство ключей было перемещено или переименовано

## Двухэтапная установка \{#two-phase-installation\}

В чарте v2.x используется двухэтапная установка. Операторы (которые регистрируют CRD) необходимо установить до основного чарта (который создает CR):

```bash
# Phase 1: Install operators and CRDs
helm install clickstack-operators clickstack/clickstack-operators

# Phase 2: Install ClickStack
helm install my-clickstack clickstack/clickstack
```

Удаляйте в обратном порядке:

```bash
helm uninstall my-clickstack
helm uninstall clickstack-operators
```

### Сохранение данных \{#data-persistence\}

Объекты PersistentVolumeClaim, созданные операторами MongoDB и ClickHouse, **не** удаляются командой `helm uninstall`. Это сделано намеренно, чтобы предотвратить случайную потерю данных. Чтобы удалить PVC после деинсталляции, см.:

* [документацию MongoDB Kubernetes Operator](https://github.com/mongodb/mongodb-kubernetes/tree/master/docs/mongodbcommunity)
* [документацию по очистке ClickHouse Operator](https://clickhouse.com/docs/clickhouse-operator/managing-clusters/cleanup)

### Класс хранилища \{#storage-class\}

`global.storageClassName` и `global.keepPVC` были удалены. Теперь класс хранилища настраивается напрямую в спецификации CR каждого оператора:

```yaml
mongodb:
  spec:
    statefulSet:
      spec:
        volumeClaimTemplates:
          - spec:
              storageClassName: "fast-ssd"

clickhouse:
  keeper:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "fast-ssd"
  cluster:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "fast-ssd"
```

## Что изменилось \{#what-changed\}

| Компонент         | До (v1.x)                                                              | После (v2.x)                                                                                                                             |
| ----------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| MongoDB           | Встроенное развертывание + Service + PVC                               | [MongoDB Kubernetes Operator (MCK)](https://github.com/mongodb/mongodb-kubernetes), управляющий CR `MongoDBCommunity`                    |
| ClickHouse        | Встроенное развертывание + Service + ConfigMaps + PVC                  | [ClickHouse Operator](https://clickhouse.com/docs/clickhouse-operator/overview), управляющий CR `ClickHouseCluster` + `KeeperCluster`    |
| OTel collector    | Встроенное развертывание + Service (блок `otel.*`)                     | [Официальный Helm-чарт OpenTelemetry collector](https://github.com/open-telemetry/opentelemetry-helm-charts) (субчарт `otel-collector:`) |
| Параметры HyperDX | Плоские ключи в `hyperdx.*` плюс `tasks:` и `appUrl` на верхнем уровне | Перегруппированы по типам ресурсов K8s в `hyperdx.*` (см. ниже)                                                                          |
| hdx-oss-v2        | Устаревший legacy-чарт                                                 | Полностью удалён                                                                                                                         |

## Реорганизация значений HyperDX \{#hyperdx-values-reorganization\}

Блок `hyperdx:` теперь структурирован по типам ресурсов Kubernetes:

```yaml
hyperdx:
  ports:          # Shared port numbers (Deployment, Service, ConfigMap, Ingress)
    api: 8000
    app: 3000
    opamp: 4320

  frontendUrl: "http://localhost:3000"   # Replaces the removed appUrl

  config:         # → clickstack-config ConfigMap (non-sensitive env vars)
    APP_PORT: "3000"
    HYPERDX_LOG_LEVEL: "info"

  secrets:        # → clickstack-secret Secret (sensitive env vars)
    HYPERDX_API_KEY: "..."
    CLICKHOUSE_PASSWORD: "otelcollectorpass"
    CLICKHOUSE_APP_PASSWORD: "hyperdx"
    MONGODB_PASSWORD: "hyperdx"

  deployment:     # K8s Deployment spec (image, replicas, probes, etc.)
  service:        # K8s Service spec (type, annotations)
  ingress:        # K8s Ingress spec (host, tls, annotations)
  podDisruptionBudget:  # K8s PDB spec
  tasks:          # K8s CronJob specs (previously top-level tasks:)
```

### Ключевые изменения \{#key-moves\}

| До (v1.x)                                     | После (v2.x)                                                                       |
| --------------------------------------------- | ---------------------------------------------------------------------------------- |
| `appUrl`                                      | Удалено. Используйте `hyperdx.frontendUrl` (по умолчанию: `http://localhost:3000`) |
| `tasks.*` (верхний уровень)                   | `hyperdx.tasks.*`                                                                  |
| `mongodb.password`                            | `hyperdx.secrets.MONGODB_PASSWORD`                                                 |
| `clickhouse.config.users.appUserPassword`     | `hyperdx.secrets.CLICKHOUSE_APP_PASSWORD`                                          |
| `clickhouse.config.users.otelUserPassword`    | `hyperdx.secrets.CLICKHOUSE_PASSWORD`                                              |
| `otel.*` переопределения переменных окружения | `hyperdx.config.*` (несекретные) и `hyperdx.secrets.*` (секретные)                 |

### Единые ConfigMap и Secret \{#unified-configmap-and-secret\}

Теперь все переменные окружения передаются через два ресурса со статическими именами, общие для Развертывания HyperDX **и** OTel collector, с помощью `envFrom`:

* **`clickstack-config`** ConfigMap — заполняется из `hyperdx.config`
* **`clickstack-secret`** Secret — заполняется из `hyperdx.secrets`

Отдельного ConfigMap специально для OTel collector больше нет. Обе рабочие нагрузки используют одни и те же источники.

## Миграция MongoDB \{#mongodb-migration\}

### Удалённые значения \{#mongodb-removed-values\}

Следующих значений `mongodb.*` больше нет:

```yaml
# REMOVED — do not use
mongodb:
  image: "..."
  port: 27017
  strategy: ...
  nodeSelector: {}
  tolerations: []
  livenessProbe: ...
  readinessProbe: ...
  persistence:
    enabled: true
    dataSize: 10Gi
```

### Новые значения \{#mongodb-new-values\}

Теперь MongoDB управляется оператором MCK через пользовательский ресурс `MongoDBCommunity`. Спецификация CR формируется напрямую из `mongodb.spec`:

```yaml
mongodb:
  enabled: true
  spec:
    members: 1
    type: ReplicaSet
    version: "5.0.32"
    security:
      authentication:
        modes: ["SCRAM"]
    users:
      - name: hyperdx
        db: hyperdx
        passwordSecretRef:
          name: '{{ include "clickstack.mongodb.fullname" . }}-password'
        roles:
          - name: dbOwner
            db: hyperdx
          - name: clusterMonitor
            db: admin
        scramCredentialsSecretName: '{{ include "clickstack.mongodb.fullname" . }}-scram'
    additionalMongodConfig:
      storage.wiredTiger.engineConfig.journalCompressor: zlib
```

Пароль MongoDB задаётся в `hyperdx.secrets.MONGODB_PASSWORD` (а не в `mongodb.password`). Это значение автоматически используется в Secret с паролем и в шаблоне `mongoUri`.

Чтобы добавить постоянное хранилище, добавьте блок `statefulSet` в `mongodb.spec`:

```yaml
mongodb:
  spec:
    statefulSet:
      spec:
        volumeClaimTemplates:
          - metadata:
              name: data-volume
            spec:
              accessModes: ["ReadWriteOnce"]
              storageClassName: "your-storage-class"
              resources:
                requests:
                  storage: 10Gi
```

Субчарт оператора MCK настраивается в разделе `mongodb-operator:` (а не `mongodb-kubernetes:`). Полный список доступных полей CRD см. в [документации MCK](https://github.com/mongodb/mongodb-kubernetes/tree/master/docs/mongodbcommunity).

## Миграция ClickHouse \{#clickhouse-migration\}

### Удалённые значения \{#clickhouse-removed-values\}

Следующие значения `clickhouse.*` были удалены:

```yaml
# REMOVED — do not use
clickhouse:
  image: "..."
  terminationGracePeriodSeconds: 90
  resources: {}
  livenessProbe: ...
  readinessProbe: ...
  startupProbe: ...
  nodeSelector: {}
  tolerations: []
  service:
    type: ClusterIP
    annotations: {}
  persistence:
    enabled: true
    dataSize: 10Gi
    logSize: 5Gi
  config:
    clusterCidrs: [...]
    users:
      appUserPassword: "..."
      otelUserPassword: "..."
      otelUserName: "..."
```

### Новые значения \{#clickhouse-new-values\}

Теперь ClickHouse управляется оператором ClickHouse через пользовательские ресурсы `ClickHouseCluster` и `KeeperCluster`. Спецификации обоих CR формируются напрямую из значений:

```yaml
clickhouse:
  enabled: true
  port: 8123
  nativePort: 9000
  prometheus:
    enabled: true
    port: 9363
  keeper:
    spec:
      replicas: 1
      dataVolumeClaimSpec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 5Gi
  cluster:
    spec:
      replicas: 1
      shards: 1
      keeperClusterRef:
        name: '{{ include "clickstack.clickhouse.keeper" . }}'
      dataVolumeClaimSpec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
      settings:
        extraUsersConfig:
          users:
            app:
              password: '{{ .Values.hyperdx.secrets.CLICKHOUSE_APP_PASSWORD }}'
            otelcollector:
              password: '{{ .Values.hyperdx.secrets.CLICKHOUSE_PASSWORD }}'
        extraConfig:
          max_connections: 4096
          keep_alive_timeout: 64
          max_concurrent_queries: 100
```

Учетные данные пользователя ClickHouse теперь берутся из `hyperdx.secrets` (а не из `clickhouse.config.users`). Спецификация кластера ссылается на них с помощью шаблонных выражений.

Субчарт ClickHouse Operator настраивается в разделе `clickhouse-operator:`. Вебхуки и cert-manager по умолчанию отключены. Все доступные поля CRD см. в [руководстве по настройке оператора](https://clickhouse.com/docs/clickhouse-operator/guides/configuration).

## Миграция OTel collector \{#otel-collector-migration\}

### Удалённые значения \{#otel-removed-values\}

Блок `otel:` полностью удалён:

```yaml
# REMOVED — do not use
otel:
  enabled: true
  image: ...
  replicas: 1
  resources: {}
  clickhouseEndpoint: ...
  clickhouseUser: ...
  clickhousePassword: ...
  clickhouseDatabase: "default"
  opampServerUrl: ...
  port: 13133
  nativePort: 24225
  grpcPort: 4317
  httpPort: 4318
  healthPort: 8888
  env: []
  customConfig: ...
```

### Новые значения \{#otel-new-values\}

OTel collector теперь развёртывается через официальный Helm-чарт OpenTelemetry Collector как субчарт `otel-collector:`. Обёртки родительского чарта `otel:` нет — настраивайте субчарт напрямую.

Переменные окружения (конечная точка ClickHouse, URL-адрес OpAMP и т. д.) используются совместно через унифицированные ConfigMap `clickstack-config` и Secret `clickstack-secret`. Параметр субчарта `extraEnvsFrom` уже преднастроен:

```yaml
otel-collector:
  enabled: true
  mode: deployment
  image:
    repository: docker.clickhouse.com/clickhouse/clickstack-otel-collector
    tag: ""
  extraEnvsFrom:
    - configMapRef:
        name: clickstack-config
    - secretRef:
        name: clickstack-secret
  ports:
    otlp:
      enabled: true
      containerPort: 4317
      servicePort: 4317
    otlp-http:
      enabled: true
      containerPort: 4318
      servicePort: 4318
```

Чтобы настроить ресурсы (ранее `otel.resources`):

```yaml
otel-collector:
  resources:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "256Mi"
      cpu: "200m"
```

Чтобы настроить реплики (ранее `otel.replicas`):

```yaml
otel-collector:
  replicaCount: 3
```

Чтобы задать nodeSelector/tolerations (ранее `otel.nodeSelector`/`otel.tolerations`):

```yaml
otel-collector:
  nodeSelector:
    node-role: monitoring
  tolerations:
    - key: monitoring
      operator: Equal
      value: otel
      effect: NoSchedule
```

См. [Helm-чарт OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector), чтобы ознакомиться со всеми доступными значениями субчарта.

## Неизменённые значения \{#unchanged-values\}

Следующие разделы **не затрагиваются** этой миграцией:

* `global.*` (imageRegistry, imagePullSecrets)

## Чистая установка или обновление на месте \{#fresh-install-vs-in-place-upgrade\}

Для **чистой установки** никаких специальных действий не требуется. Параметры по умолчанию работают сразу.

При **обновлении на месте** существующего релиза обратите внимание на следующее:

1. Операторы (MCK, ClickHouse Operator) будут установлены как новые развертывания в вашем пространстве имен
2. Helm удалит существующие развертывания MongoDB и ClickHouse (они больше не входят в шаблоны чарта)
3. Операторы создадут новые StatefulSet для управления MongoDB и ClickHouse
4. **PVC из старого чарта не переиспользуются автоматически** в StatefulSet, управляемых операторами

Мы рекомендуем выполнить чистую установку параллельно с существующим развертыванием и перенести данные вместо обновления на месте.

## Следующие шаги \{#next-steps\}

* [Основное руководство по Helm](/docs/use-cases/observability/clickstack/deployment/helm) - Базовая установка для v2.x
* [Руководство по настройке](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API-ключи, секреты и входной шлюз
* [Дополнительные манифесты](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) - Пользовательские объекты Kubernetes
* [Репозиторий Helm-чартов ClickStack](https://github.com/ClickHouse/ClickStack-helm-charts) - Исходный код чартов и справочник по values