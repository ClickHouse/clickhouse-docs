---
slug: /use-cases/observability/clickstack/deployment/helm-configuration
title: 'Конфигурация Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'Настройка API-ключей, секретов и входного шлюза для Helm-развертываний ClickStack'
doc_type: 'guide'
keywords: ['конфигурация ClickStack', 'секреты Helm', 'настройка API-ключей', 'конфигурация входного шлюза', 'настройка TLS']
---

:::warning Версия чарта 2.x
На этой странице описан Helm-чарт **v2.x** с подчинёнными чартами. Если вы всё ещё используете чарт v1.x со встроенными шаблонами, см. [Конфигурация Helm (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1). Инструкции по миграции см. в [руководстве по обновлению](/docs/use-cases/observability/clickstack/deployment/helm-upgrade).
:::

Это руководство посвящено настройкам Helm-развертываний ClickStack. Сведения о базовой установке см. в [основном руководстве по развертыванию Helm](/docs/use-cases/observability/clickstack/deployment/helm).

## Организация значений \{#values-organization\}

Чарт v2.x группирует значения по типам ресурсов Kubernetes в блоке `hyperdx:`:

```yaml
hyperdx:
  ports:          # Shared port numbers (Deployment, Service, ConfigMap, Ingress)
    api: 8000
    app: 3000
    opamp: 4320

  frontendUrl: "http://localhost:3000"

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
  tasks:          # K8s CronJob specs
```

Все переменные окружения передаются через два ресурса с фиксированными именами, которые используются совместно развертыванием HyperDX **и** OTel collector через `envFrom`:

* **`clickstack-config`** ConfigMap — заполняется из `hyperdx.config`
* **`clickstack-secret`** Secret — заполняется из `hyperdx.secrets`

Отдельный ConfigMap специально для OTel больше не используется. Оба типа рабочих нагрузок читают данные из одних и тех же источников.

## Настройка API-ключа \{#api-key-setup\}

После успешного развертывания ClickStack настройте API-ключ, чтобы включить сбор телеметрических данных:

1. **Откройте экземпляр HyperDX** через настроенный входной шлюз или конечную точку сервиса
2. **Войдите в панель HyperDX** и перейдите в Team settings, чтобы сгенерировать или получить API-ключ
3. **Обновите развертывание** с помощью API-ключа, используя один из следующих методов:

### Метод 1: Обновление через Helm upgrade с использованием файла values \{#api-key-values-file\}

Добавьте API-ключ в `values.yaml`:

```yaml
hyperdx:
  secrets:
    HYPERDX_API_KEY: "your-api-key-here"
```

Затем обновите развертывание:

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

### Метод 2: Обновление с помощью helm upgrade с флагом --set \{#api-key-set-flag\}

```shell
helm upgrade my-clickstack clickstack/clickstack \
  --set hyperdx.secrets.HYPERDX_API_KEY="your-api-key-here"
```

### Перезапустите поды, чтобы применить изменения \{#restart-pods\}

После обновления API-ключа перезапустите поды, чтобы они подхватили новую конфигурацию:

```shell
kubectl rollout restart deployment my-clickstack-clickstack-app
```

:::note
Чарт автоматически создает секрет Kubernetes (`clickstack-secret`) с указанными вами значениями конфигурации. Дополнительная настройка секретов не требуется, если только вы не планируете использовать внешний секрет.
:::

## Управление секретами \{#secret-management\}

Для работы с конфиденциальными данными, такими как ключи API или учетные данные базы данных, чарт v2.x предоставляет единый ресурс `clickstack-secret`, который заполняется из `hyperdx.secrets`.

### Значения секретов по умолчанию \{#default-secret-values\}

Чарт включает значения по умолчанию для всех секретов. Переопределите их в `values.yaml`:

```yaml
hyperdx:
  secrets:
    HYPERDX_API_KEY: "your-api-key"
    CLICKHOUSE_PASSWORD: "your-clickhouse-otel-password"
    CLICKHOUSE_APP_PASSWORD: "your-clickhouse-app-password"
    MONGODB_PASSWORD: "your-mongodb-password"
```

### Использование внешнего секрета \{#using-external-secret\}

Для развертываний в production-среде, где учетные данные нужно хранить отдельно от значений helm, используйте внешний секрет Kubernetes:

```bash
# Create your secret
kubectl create secret generic my-clickstack-secrets \
  --from-literal=HYPERDX_API_KEY=my-secret-api-key \
  --from-literal=CLICKHOUSE_PASSWORD=my-ch-password \
  --from-literal=CLICKHOUSE_APP_PASSWORD=my-ch-app-password \
  --from-literal=MONGODB_PASSWORD=my-mongo-password
```

Затем укажите это в values:

```yaml
hyperdx:
  useExistingConfigSecret: true
  existingConfigSecret: "my-clickstack-secrets"
```

## Настройка входного шлюза \{#ingress-setup\}

Чтобы открыть доступ к интерфейсу HyperDX и API по доменному имени, включите входной шлюз в файле `values.yaml`.

### Общая конфигурация входного шлюза \{#general-ingress-configuration\}

```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"  # Must match ingress host

  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note Важное примечание по конфигурации
`hyperdx.frontendUrl` должен соответствовать хосту входного шлюза и включать протокол (например, `https://hyperdx.yourdomain.com`). Это гарантирует корректную работу всех сгенерированных ссылок, файлов cookie и перенаправлений.
:::

### Включение TLS (HTTPS) \{#enabling-tls\}

Чтобы защитить развертывание с помощью HTTPS:

**1. Создайте TLS-секрет с сертификатом и ключом:**

```shell
kubectl create secret tls hyperdx-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

**2. Включите TLS в конфигурации входного шлюза:**

```yaml
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
      tlsSecretName: "hyperdx-tls"
```

### Пример конфигурации входного шлюза \{#example-ingress-configuration\}

Ниже показано, как выглядит сгенерированный ресурс входного шлюза:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hyperdx-app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$1
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  ingressClassName: nginx
  rules:
    - host: hyperdx.yourdomain.com
      http:
        paths:
          - path: /(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: my-clickstack-clickstack-app
                port:
                  number: 3000
  tls:
    - hosts:
        - hyperdx.yourdomain.com
      secretName: hyperdx-tls
```

### Распространённые проблемы с Входным шлюзом \{#common-ingress-pitfalls\}

**Конфигурация пути и rewrite:**

* Для Next.js и других SPA всегда используйте Regex-путь и аннотацию rewrite, как показано выше
* Не используйте только `path: /` без rewrite, так как это нарушит раздачу статических ресурсов

**Несоответствие `frontendUrl` и `ingress.host`:**

* Если они не совпадают, возможны проблемы с cookie, перенаправлениями и загрузкой ресурсов

**Неправильная конфигурация TLS:**

* Убедитесь, что ваш TLS-секрет действителен и правильно указан во Входном шлюзе
* Браузеры могут блокировать небезопасный контент, если открывать приложение по HTTP при включённом TLS

**Версия контроллера Входного шлюза:**

* Для некоторых возможностей (например, Regex-путей и rewrite) требуются свежие версии контроллера NGINX Ingress
* Проверьте свою версию с помощью:

```shell
kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```

## Входной шлюз для OTel collector \{#otel-collector-ingress\}

Если вам нужно открыть доступ к конечным точкам OTel collector (для трейсов, метрик и логов) через входной шлюз, используйте параметр конфигурации `additionalIngresses`. Это полезно, если вы отправляете телеметрические данные из-за пределов кластера или используете для collector собственный домен.

```yaml
hyperdx:
  ingress:
    enabled: true
    additionalIngresses:
      - name: otel-collector
        annotations:
          nginx.ingress.kubernetes.io/ssl-redirect: "false"
          nginx.ingress.kubernetes.io/force-ssl-redirect: "false"
          nginx.ingress.kubernetes.io/use-regex: "true"
        ingressClassName: nginx
        hosts:
          - host: collector.yourdomain.com
            paths:
              - path: /v1/(traces|metrics|logs)
                pathType: Prefix
                port: 4318
                name: otel-collector
        tls:
          - hosts:
              - collector.yourdomain.com
            secretName: collector-tls
```

* Это создаёт отдельный ресурс входного шлюза для конечных точек OTel collector
* Вы можете использовать другой домен, настроить отдельные параметры TLS и применить пользовательские аннотации
* Правило пути Regex позволяет маршрутизировать все сигналы OTLP (трейсы, метрики, логи) через одно правило

:::note
Если вам не нужно открывать OTel collector для внешнего доступа, эту конфигурацию можно пропустить. Для большинства пользователей достаточно общей настройки входного шлюза.
:::

В качестве альтернативы вы можете использовать [`additionalManifests`](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests), чтобы определить полностью пользовательские ресурсы входного шлюза, например AWS ALB Ingress.

## Конфигурация OTel collector \{#otel-collector-configuration\}

OTel collector разворачивается с помощью официального Helm-чарта OpenTelemetry Collector как подчарт `otel-collector:`. Настройте его прямо в разделе `otel-collector:` файла values:

```yaml
otel-collector:
  enabled: true
  mode: deployment
  replicaCount: 3
  resources:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "256Mi"
      cpu: "200m"
  nodeSelector:
    node-role: monitoring
  tolerations:
    - key: monitoring
      operator: Equal
      value: otel
      effect: NoSchedule
```

Переменные окружения (конечная точка ClickHouse, URL-адрес OpAMP и т. д.) передаются через общий ConfigMap `clickstack-config` и Secret `clickstack-secret`. Параметр `extraEnvsFrom` в подчарте уже настроен на чтение из обоих.

Полный список доступных значений подчарта см. в [Helm-чарте OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector).

## Конфигурация MongoDB \{#mongodb-configuration\}

MongoDB управляется оператором MCK через пользовательский ресурс `MongoDBCommunity`. Спецификация CR берётся напрямую из `mongodb.spec`:

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

Пароль MongoDB указывается в `hyperdx.secrets.MONGODB_PASSWORD`. См. [документацию MCK](https://github.com/mongodb/mongodb-kubernetes/tree/master/docs/mongodbcommunity) с полным списком доступных полей CRD.

## Конфигурация ClickHouse \{#clickhouse-configuration\}

ClickHouse управляется оператором ClickHouse через пользовательские ресурсы `ClickHouseCluster` и `KeeperCluster`. Спецификации обоих CR напрямую формируются из values:

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
      dataVolumeClaimSpec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
```

Учетные данные пользователя ClickHouse берутся из `hyperdx.secrets` (а не из `clickhouse.config.users`, как в версии v1.x). Все доступные поля CRD см. в [руководстве по настройке ClickHouse Operator](https://clickhouse.com/docs/clickhouse-operator/guides/configuration).

## Устранение неполадок входного шлюза \{#troubleshooting-ingress\}

**Проверьте ресурс «Входной шлюз»:**

```shell
kubectl get ingress -A
kubectl describe ingress <ingress-name>
```

**Проверьте логи контроллера входного шлюза:**

```shell
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

**Проверка URL-адресов ресурсов:**

Используйте `curl`, чтобы убедиться, что статические ресурсы отдаются как JS, а не как HTML:

```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# Should return Content-Type: application/javascript
```

**Инструменты разработчика браузера:**

* Проверьте вкладку Network на наличие ошибок 404 и ресурсов, для которых вместо JS возвращается HTML
* Проверьте, нет ли в консоли ошибок вида `Unexpected token <` (это означает, что вместо JS вернулся HTML)

**Проверьте переписывание путей:**

* Убедитесь, что входной шлюз не обрезает пути к ресурсам и не переписывает их некорректно

**Очистите кэш браузера и CDN:**

* После внесения изменений очистите кэш браузера и кэш CDN/прокси, чтобы не использовать устаревшие ресурсы

## Настройка значений \{#customizing-values\}

Параметры можно настроить с помощью флагов `--set`:

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

Либо создайте собственный файл `values.yaml`. Чтобы получить значения по умолчанию:

```shell
helm show values clickstack/clickstack > values.yaml
```

Примените собственные значения:

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
```

## Следующие шаги \{#next-steps\}

* [Варианты развертывания](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - Внешние системы и минимальные варианты развертывания
* [Развертывания в Cloud](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - Конфигурации для GKE, EKS и AKS
* [Руководство по обновлению](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - Переход с v1.x на v2.x
* [Дополнительные манифесты](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) - Пользовательские объекты Kubernetes
* [Основное руководство по Helm](/docs/use-cases/observability/clickstack/deployment/helm) - Базовая установка
* [Конфигурация (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - Руководство по конфигурации для v1.x