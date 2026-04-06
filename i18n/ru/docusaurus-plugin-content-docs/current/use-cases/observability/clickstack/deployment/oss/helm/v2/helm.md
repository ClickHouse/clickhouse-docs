---
slug: /use-cases/observability/clickstack/deployment/helm
title: 'Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 2
description: 'Развертывание ClickStack с помощью Helm — стек обсервабилити ClickHouse'
doc_type: 'guide'
keywords: ['Helm-чарт ClickStack', 'Развертывание ClickHouse с помощью Helm', 'Установка HyperDX с помощью Helm', 'Стек обсервабилити Kubernetes', 'Развертывание ClickStack в Kubernetes']
---

import Image from '@theme/IdealImage';
import hyperdx_24 from '@site/static/images/use-cases/observability/hyperdx-24.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import JSONSupport from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

:::warning Версия чарта 2.x
На этой странице описан Helm-чарт **v2.x** на основе подчартов. Если вы все еще используете чарт v1.x с inline-template, см. [руководство по Helm для v1.x](/docs/use-cases/observability/clickstack/deployment/helm-v1). Инструкции по миграции см. в [руководстве по обновлению](/docs/use-cases/observability/clickstack/deployment/helm-upgrade).
:::

Helm-чарт для ClickStack доступен [здесь](https://github.com/ClickHouse/ClickStack-helm-charts) и является **рекомендуемым** способом для промышленных развертываний.

Чарт v2.x использует **двухэтапную установку**. Сначала через чарт `clickstack-operators` устанавливаются операторы и CRD, затем — основной чарт `clickstack`, который создает пользовательские ресурсы под управлением операторов для ClickHouse, MongoDB и OpenTelemetry Collector.

По умолчанию Helm-чарт разворачивает все основные компоненты, включая:

* **ClickHouse** — управляется [ClickHouse Operator](https://clickhouse.com/docs/clickhouse-operator/overview) через пользовательские ресурсы `ClickHouseCluster` и `KeeperCluster`
* **HyperDX** — UI и API для обсервабилити
* **OpenTelemetry (OTel) collector** — развертывается через [официальный Helm-чарт OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-helm-charts) как подчарт
* **MongoDB** — управляется [MongoDB Kubernetes Operator (MCK)](https://github.com/mongodb/mongodb-kubernetes) через пользовательский ресурс `MongoDBCommunity`

Однако его можно легко настроить для интеграции с существующим развертыванием ClickHouse — например, размещенным в **ClickHouse Cloud**.

Чарт поддерживает стандартные лучшие практики Kubernetes, включая:

* Конфигурацию для разных сред через `values.yaml`
* Ограничения ресурсов и масштабирование на уровне подов
* Настройку TLS и входного шлюза
* Управление секретами и настройку аутентификации
* [Дополнительные манифесты](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) для развертывания произвольных объектов Kubernetes (NetworkPolicy, HPA, ALB Входной шлюз и т. д.) вместе с чартом

### Подходит для \{#suitable-for\}

* Пилотных проектов
* Продуктивной среды

## Этапы развертывания \{#deployment-steps\}

<br />

<VerticalStepper headerLevel="h3">
  ### Предварительные требования \{#prerequisites\}

  * [Helm](https://helm.sh/) v3+
  * Кластер Kubernetes (рекомендуется v1.20+)
  * `kubectl`, настроенный для работы с вашим кластером

  ### Добавьте репозиторий Helm ClickStack \{#add-the-clickstack-helm-repository\}

  Добавьте репозиторий Helm ClickStack:

  ```shell
  helm repo add clickstack https://clickhouse.github.io/ClickStack-helm-charts
  helm repo update
  ```

  ### Установите операторы \{#install-the-operators\}

  Сначала установите чарт оператора. Это зарегистрирует CRD, необходимые для основного чарта:

  ```shell
  helm install clickstack-operators clickstack/clickstack-operators
  ```

  Подождите, пока поды оператора будут готовы, прежде чем продолжить:

  ```shell
  kubectl get pods -l app.kubernetes.io/instance=clickstack-operators
  ```

  ### Установка ClickStack \{#installing-clickstack\}

  После запуска операторов установите основной чарт:

  ```shell
  helm install my-clickstack clickstack/clickstack
  ```

  ### Проверьте установку \{#verify-the-installation\}

  Проверьте установку:

  ```shell
  kubectl get pods -l "app.kubernetes.io/name=clickstack"
  ```

  Когда все поды будут готовы, переходите дальше.

  ### Проброс портов \{#forward-ports\}

  Проброс портов позволяет получить доступ к HyperDX и настроить его. Если вы развёртываете систему в production, вместо этого следует открыть доступ к сервису через входной шлюз или балансировщик нагрузки, чтобы обеспечить корректный сетевой доступ, терминацию TLS и масштабируемость. Проброс портов лучше всего подходит для локальной разработки или разовых административных задач, но не для долгосрочной эксплуатации и не для сред с высокой доступностью.

  ```shell
  kubectl port-forward \
    pod/$(kubectl get pod -l app.kubernetes.io/name=clickstack -o jsonpath='{.items[0].metadata.name}') \
    8080:3000
  ```

  :::tip Настройка входного шлюза для рабочей среды
  Для рабочих развертываний настройте Входной шлюз с TLS вместо проброса портов. Подробные инструкции см. в [руководстве по настройке входного шлюза](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup).
  :::

  ### Перейдите в интерфейс \{#navigate-to-the-ui\}

  Откройте [http://localhost:8080](http://localhost:8080), чтобы перейти в интерфейс HyperDX.

  Создайте пользователя, указав имя пользователя и пароль, соответствующие требованиям.

  <Image img={hyperdx_login} alt="Интерфейс HyperDX" size="lg" />

  После нажатия `Create` будут созданы источники данных для экземпляра ClickHouse, развернутого с помощью Helm-чарта.

  :::note Переопределение подключения по умолчанию
  Вы можете переопределить подключение по умолчанию к встроенному экземпляру ClickHouse. Подробнее см. в разделе [&quot;Использование ClickHouse Cloud&quot;](#using-clickhouse-cloud).
  :::

  ### Настройка значений (необязательно) \{#customizing-values\}

  Вы можете изменить настройки с помощью флагов `--set`. Например:

  ```shell
  helm install my-clickstack clickstack/clickstack --set key=value
  ```

  Или отредактируйте `values.yaml`. Чтобы получить значения по умолчанию:

  ```shell
  helm show values clickstack/clickstack > values.yaml
  ```

  Пример конфигурации:

  ```yaml
  hyperdx:
    frontendUrl: "https://hyperdx.example.com"

    deployment:
      replicas: 2
      resources:
        limits:
          cpu: "2"
          memory: 4Gi
        requests:
          cpu: 500m
          memory: 1Gi

    ingress:
      enabled: true
      host: hyperdx.example.com
      tls:
        enabled: true
        tlsSecretName: "hyperdx-tls"
  ```

  ```shell
  helm install my-clickstack clickstack/clickstack -f values.yaml
  ```

  ### Использование секретов (необязательно) \{#using-secrets\}

  Чарт v2.x использует единый секрет (`clickstack-secret`), который заполняется из `hyperdx.secrets` в файле values. Все конфиденциальные переменные окружения — включая пароли ClickHouse, пароли MongoDB и API-ключ HyperDX — передаются через этот секрет.

  Чтобы переопределить значения секрета:

  ```yaml
  hyperdx:
    secrets:
      HYPERDX_API_KEY: "your-api-key"
      CLICKHOUSE_PASSWORD: "your-clickhouse-password"
      CLICKHOUSE_APP_PASSWORD: "your-app-password"
      MONGODB_PASSWORD: "your-mongodb-password"
  ```

  Для внешнего управления секретами (например, с помощью оператора для секретов) можно сослаться на уже существующий секрет Kubernetes:

  ```yaml
  hyperdx:
    useExistingConfigSecret: true
    existingConfigSecret: "my-external-secret"
    existingConfigConnectionsKey: "connections.json"
    existingConfigSourcesKey: "sources.json"
  ```

  :::tip Управление API-ключами
  Подробные инструкции по настройке API-ключей, включая несколько способов конфигурации и процедуры перезапуска подов, см. в [руководстве по настройке API-ключей](/docs/use-cases/observability/clickstack/deployment/helm-configuration#api-key-setup).
  :::
</VerticalStepper>

## Использование ClickHouse Cloud \{#using-clickhouse-cloud\}

При использовании ClickHouse Cloud отключите встроенный экземпляр ClickHouse и укажите учетные данные Cloud:

```yaml
# values-clickhouse-cloud.yaml
clickhouse:
  enabled: false

hyperdx:
  secrets:
    CLICKHOUSE_PASSWORD: "your-cloud-password"
    CLICKHOUSE_APP_PASSWORD: "your-cloud-password"

  useExistingConfigSecret: true
  existingConfigSecret: "clickhouse-cloud-config"
  existingConfigConnectionsKey: "connections.json"
  existingConfigSourcesKey: "sources.json"
```

Отдельно создайте секрет подключения:

```bash
cat <<EOF > connections.json
[
  {
    "name": "ClickHouse Cloud",
    "host": "https://your-cloud-instance.clickhouse.cloud",
    "port": 8443,
    "username": "default",
    "password": "your-cloud-password"
  }
]
EOF

kubectl create secret generic clickhouse-cloud-config \
  --from-file=connections.json=connections.json

rm connections.json
```

```shell
helm install my-clickstack clickstack/clickstack -f values-clickhouse-cloud.yaml
```

:::tip Расширенные внешние конфигурации
Для продакшен-развертываний с конфигурацией через секреты, внешними OTel collector или минимальной установкой см. [руководство по вариантам развертывания](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options).
:::

## Примечания для продакшена \{#production-notes\}

По умолчанию этот чарт устанавливает ClickHouse, MongoDB и OTel collector. Для продакшена рекомендуется управлять ClickHouse и OTel collector отдельно.

Чтобы отключить ClickHouse и OTel collector:

```yaml
clickhouse:
  enabled: false

otel-collector:
  enabled: false
```

:::tip Лучшие практики для production-среды
Для production-развертываний, включая настройку высокой доступности, управление ресурсами, настройку Входного шлюза/TLS и конфигурации для облачных платформ (GKE, EKS, AKS), см.:

* [Руководство по конфигурации](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - Входной шлюз, TLS и управление секретами
* [Развертывания в облаке](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - Настройки для облачных платформ и контрольный список для production
  :::

## Конфигурация задач \{#task-configuration\}

По умолчанию в конфигурации чарта определена одна задача в виде CronJob, которая отвечает за проверку того, должны ли сработать оповещения. В v2.x конфигурация задач перенесена в `hyperdx.tasks`:

| Параметр                              | Описание                                                                                                                                                                                         | По умолчанию      |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| `hyperdx.tasks.enabled`               | Включает или отключает cron-задачи в кластере. По умолчанию образ HyperDX выполняет cron-задачи в рамках процесса. Установите `true`, если хотите использовать отдельную cron-задачу в кластере. | `false`           |
| `hyperdx.tasks.checkAlerts.schedule`  | Cron-расписание для задачи check-alerts                                                                                                                                                          | `*/1 * * * *`     |
| `hyperdx.tasks.checkAlerts.resources` | Запросы и лимиты ресурсов для задачи check-alerts                                                                                                                                                | См. `values.yaml` |

## Обновление чарта \{#upgrading-the-chart\}

Чтобы перейти на более новую версию:

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

Чтобы проверить доступные версии чарта:

```shell
helm search repo clickstack
```

:::note Обновление с v1.x
Если вы переходите с chart inline-template версии v1.x, инструкции по миграции см. в [руководстве по обновлению](/docs/use-cases/observability/clickstack/deployment/helm-upgrade). Это несовместимое изменение — обновление с помощью `helm upgrade` на месте не поддерживается.
:::

## Удаление ClickStack \{#uninstalling-clickstack\}

Выполните удаление в обратном порядке:

```shell
helm uninstall my-clickstack            # Remove app + CRs first
helm uninstall clickstack-operators     # Remove operators + CRDs
```

**Примечание:** Объекты PersistentVolumeClaim, созданные операторами MongoDB и ClickHouse, **не** удаляются командой `helm uninstall`. Это сделано намеренно, чтобы предотвратить случайную потерю данных. Чтобы удалить PVC, см.:

* [документацию MongoDB Kubernetes Operator](https://github.com/mongodb/mongodb-kubernetes/tree/master/docs/mongodbcommunity)
* [документацию по очистке ClickHouse Operator](https://clickhouse.com/docs/clickhouse-operator/managing-clusters/cleanup)

## Устранение неполадок \{#troubleshooting\}

### Проверка логов \{#checking-logs\}

```shell
kubectl logs -l app.kubernetes.io/name=clickstack
```

### Отладка установки, завершившейся с ошибкой \{#debugging-a-failed-install\}

```shell
helm install my-clickstack clickstack/clickstack --debug --dry-run
```

### Проверка развертывания \{#verifying-deployment\}

```shell
kubectl get pods -l app.kubernetes.io/name=clickstack
```

:::tip Дополнительные ресурсы по устранению неполадок
По вопросам, связанным с Входным шлюзом, TLS или устранением неполадок при развертывании в Cloud, см.:

* [Устранение неполадок Входного шлюза](/docs/use-cases/observability/clickstack/deployment/helm-configuration#troubleshooting-ingress) - Отдача ресурсов, переписывание путей, проблемы в браузере
* [Развертывания в Cloud](/docs/use-cases/observability/clickstack/deployment/helm-cloud#loadbalancer-dns-resolution-issue) - Проблемы с GKE OpAMP и специфические проблемы Cloud
  :::

<JSONSupport />

Эти переменные среды можно задать через `hyperdx.config` в файле `values.yaml`:

```yaml
hyperdx:
  config:
    BETA_CH_OTEL_JSON_SCHEMA_ENABLED: "true"
    OTEL_AGENT_FEATURE_GATE_ARG: "--feature-gates=clickhouse.json"
```

или с помощью `--set`:

```shell
helm install my-clickstack clickstack/clickstack \
  --set "hyperdx.config.BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true" \
  --set "hyperdx.config.OTEL_AGENT_FEATURE_GATE_ARG=--feature-gates=clickhouse.json"
```

## Сопутствующая документация \{#related-documentation\}

### Руководства по развертыванию \{#deployment-guides\}

* [Варианты развертывания](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - Внешний ClickHouse, OTel collector и минимальное развертывание
* [руководство по конфигурации](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API-ключи, секреты и настройка входного шлюза
* [Развертывания в Cloud](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - Конфигурации GKE, EKS и AKS, а также лучшие практики для промышленной эксплуатации
* [Руководство по обновлению](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - Миграция с v1.x на v2.x
* [Дополнительные манифесты](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) - Развертывание пользовательских объектов Kubernetes вместе с чартом

### Документация v1.x \{#v1x-documentation\}

* [Helm (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-v1) - руководство по развертыванию для v1.x
* [Конфигурация (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - конфигурация для v1.x
* [Варианты развертывания (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1) - варианты развертывания для v1.x
* [Развертывания в Cloud (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - конфигурации Cloud для v1.x

### Дополнительные ресурсы \{#additional-resources\}

* [Руководство по началу работы с ClickStack](/use-cases/observability/clickstack/getting-started) - Введение в ClickStack
* [Репозиторий Helm-чартов ClickStack](https://github.com/ClickHouse/ClickStack-helm-charts) - Исходный код чартов и справочник по параметрам values
* [Документация Kubernetes](https://kubernetes.io/docs/) - Справочник по Kubernetes
* [Документация Helm](https://helm.sh/docs/) - Справочник по Helm