---
slug: /use-cases/observability/clickstack/deployment/helm
title: 'Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 2
description: 'Развертывание ClickStack с помощью Helm — стек обсервабилити для ClickHouse'
doc_type: 'guide'
keywords: ['Helm-чарт ClickStack', 'развертывание ClickHouse с помощью Helm', 'установка HyperDX с помощью Helm', 'Kubernetes-стек обсервабилити', 'развертывание ClickStack в Kubernetes']
---

import Image from '@theme/IdealImage';
import hyperdx_24 from '@site/static/images/use-cases/observability/hyperdx-24.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import JSONSupport from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

:::warning Миграция чарта
Если вы сейчас используете чарт `hdx-oss-v2`, перейдите на чарт `clickstack`. Чарт `hdx-oss-v2` находится в режиме сопровождения и больше не будет получать новый функционал. Вся новая разработка сосредоточена на чарте `clickstack`, который предоставляет тот же функционал с улучшёнными именами и более удобной структурой.
:::

Helm-чарт для ClickStack можно найти [здесь](https://github.com/ClickHouse/ClickStack-helm-charts); это **рекомендуемый** способ продакшн-развертываний.

По умолчанию Helm-чарт развёртывает все основные компоненты, включая:

* **ClickHouse**
* **HyperDX**
* **коллектор OpenTelemetry (OTel)**
* **MongoDB** (для хранения состояния приложения)

Однако его можно легко настроить для интеграции с уже существующим развёртыванием ClickHouse — например, размещённым в **ClickHouse Cloud**.

Чарт поддерживает стандартные лучшие практики Kubernetes, включая:

* Конфигурацию для разных окружений через `values.yaml`
* Лимиты ресурсов и масштабирование подов
* Настройку TLS и Входного шлюза
* Управление секретами и настройку аутентификации


### Подходит для \{#suitable-for\}

* пилотных проектов (Proof of Concept, PoC)
* продуктивной эксплуатации

## Шаги развертывания \{#deployment-steps\}

<br/>

<VerticalStepper headerLevel="h3">
  ### Предварительные условия

  * [Helm](https://helm.sh/) v3+
  * Кластер Kubernetes (рекомендуемая версия: v1.20+)
  * `kubectl`, настроенный для работы с вашим кластером

  ### Добавьте репозиторий Helm для ClickStack

  Добавьте Helm-репозиторий ClickStack:

  ```shell
  helm repo add clickstack https://clickhouse.github.io/ClickStack-helm-charts
  helm repo update
  ```

  ### Установка ClickStack

  Для установки чарта ClickStack со значениями по умолчанию:

  ```shell
  helm install my-clickstack clickstack/clickstack
  ```

  ### Проверьте установку

  Проверьте установку:

  ```shell
  kubectl get pods -l "app.kubernetes.io/name=clickstack"
  ```

  Когда все поды будут готовы, переходите к следующему шагу.

  ### Перенаправление портов

  Проброс портов позволяет получить доступ к HyperDX и выполнить его настройку. При развертывании в продуктивной среде необходимо вместо этого предоставить доступ к сервису через входной шлюз или балансировщик нагрузки для обеспечения корректного сетевого доступа, терминации TLS и масштабируемости. Проброс портов предназначен для локальной разработки или разовых административных задач, но не для долгосрочного использования или высокодоступных сред.

  ```shell
  kubectl port-forward \
    pod/$(kubectl get pod -l app.kubernetes.io/name=clickstack -o jsonpath='{.items[0].metadata.name}') \
    8080:3000
  ```

  :::tip Настройка входного шлюза для production-окружения
  Для production-развертываний настройте входной шлюз с TLS вместо проброса портов. Подробные инструкции по настройке см. в [руководстве по настройке входного шлюза](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup).
  :::

  ### Перейдите к пользовательскому интерфейсу

  Откройте [http://localhost:8080](http://localhost:8080) для доступа к интерфейсу HyperDX.

  Создайте пользователя, указав имя пользователя и пароль, которые соответствуют требованиям.

  <Image img={hyperdx_login} alt="Интерфейс HyperDX" size="lg" />

  После нажатия `Create` будут созданы источники данных для экземпляра ClickHouse, развернутого с помощью Helm-чарта.

  :::note Переопределение подключения по умолчанию
  Вы можете переопределить стандартное подключение к интегрированному экземпляру ClickHouse. Подробнее см. в разделе [&quot;Использование ClickHouse Cloud&quot;](#using-clickhouse-cloud).
  :::

  Пример использования альтернативного экземпляра ClickHouse см. в разделе [&quot;Создание подключения ClickHouse Cloud&quot;](/docs/use-cases/observability/clickstack/getting-started/oss#create-a-cloud-connection).

  ### Настройка параметров (необязательно)

  Настроить параметры можно с помощью флагов `--set`. Например:

  ```shell
  helm install my-clickstack clickstack/clickstack --set key=value
  ```

  Также можно отредактировать `values.yaml`. Чтобы получить значения по умолчанию:

  ```shell
  helm show values clickstack/clickstack > values.yaml
  ```

  Пример конфигурации:

  ```yaml
  replicaCount: 2
  resources:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 250m
      memory: 256Mi
  ingress:
    enabled: true
    annotations:
      kubernetes.io/ingress.class: nginx
    hosts:
      - host: hyperdx.example.com
        paths:
          - path: /
            pathType: ImplementationSpecific
  ```

  ```shell
  helm install my-clickstack clickstack/clickstack -f values.yaml
  ```

  ### Использование секретов (необязательно)

  Для обработки конфиденциальных данных, таких как API-ключи или учетные данные базы данных, используйте секреты Kubernetes. Helm-чарты HyperDX предоставляют стандартные файлы секретов, которые можно изменить и применить к кластеру.

  #### Использование предварительно сконфигурированных секретов

  Helm-чарт включает стандартный шаблон секрета, расположенный в [`charts/clickstack/templates/secrets.yaml`](https://github.com/ClickHouse/ClickStack-helm-charts/blob/main/charts/clickstack/templates/secrets.yaml). Этот файл предоставляет базовую структуру для управления секретами.

  Если требуется применить секрет вручную, отредактируйте и примените предоставленный шаблон `secrets.yaml`:

  ```yaml
  apiVersion: v1
  kind: Secret
  metadata:
    name: hyperdx-secret
    annotations:
      "helm.sh/resource-policy": keep
  type: Opaque
  data:
    API_KEY: <base64-encoded-api-key>
  ```

  Примените секрет к кластеру:

  ```shell
  kubectl apply -f secrets.yaml
  ```

  #### Создание пользовательского секрета

  Если вы предпочитаете, можно создать пользовательский секрет Kubernetes вручную:

  ```shell
  kubectl create secret generic hyperdx-secret \
    --from-literal=API_KEY=my-secret-api-key
  ```

  #### Использование секрета

  Чтобы указать ссылку на секрет в `values.yaml`:

  ```yaml
  hyperdx:
    apiKey:
      valueFrom:
        secretKeyRef:
          name: hyperdx-secret
          key: API_KEY
  ```

  :::tip Управление API-ключами
  Подробные инструкции по настройке API-ключей, включая различные методы конфигурации и процедуры перезапуска подов, см. в [руководстве по настройке API-ключей](/docs/use-cases/observability/clickstack/deployment/helm-configuration#api-key-setup).
  :::
</VerticalStepper>

## Использование ClickHouse Cloud

Если вы используете ClickHouse Cloud, отключите экземпляр ClickHouse, развернутый с помощью Helm-чарта, и укажите учетные данные ClickHouse Cloud:

```shell
# specify ClickHouse Cloud credentials
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # full https url
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

# how to overwrite default connection
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} \
  --set clickhouse.config.users.otelUser=${CLICKHOUSE_USER} \
  --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD}
```

В качестве альтернативы можно использовать файл `values.yaml`:

```yaml
clickhouse:
  enabled: false
  persistence:
    enabled: false
  config:
    users:
      otelUser: ${CLICKHOUSE_USER}
      otelUserPassword: ${CLICKHOUSE_PASSWORD}

otel:
  clickhouseEndpoint: ${CLICKHOUSE_URL}

hyperdx:
  defaultConnections: |
    [
      {
        "name": "External ClickHouse",
        "host": "http://your-clickhouse-server:8123",
        "port": 8123,
        "username": "your-username",
        "password": "your-password"
      }
    ]
```

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
# or if installed...
# helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

:::tip Расширенные варианты внешней конфигурации
Для production-развертываний с конфигурацией на основе секретов, внешними OTel collectors или минимальными конфигурациями см. [руководство по вариантам развертывания](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options).
:::


## Примечания по эксплуатации

По умолчанию этот чарт также устанавливает ClickHouse и OTel collector. Однако в продуктивной среде рекомендуется управлять ClickHouse и OTel collector отдельно.

Чтобы отключить ClickHouse и OTel collector, задайте следующие значения:

```shell
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.enabled=false
```

:::tip Рекомендации для production-среды
Для production-развертываний, включая настройку высокой доступности, управление ресурсами, конфигурацию Входного шлюза/TLS и параметры, специфичные для облачных провайдеров (GKE, EKS, AKS), см.:

* [Руководство по конфигурации](/docs/use-cases/observability/clickstack/deployment/helm-configuration) — Входной шлюз, TLS и управление секретами
* [Развертывания в Cloud](/docs/use-cases/observability/clickstack/deployment/helm-cloud) — настройки, специфичные для Cloud, и чек‑лист для production-среды
  :::


## Конфигурация задач {#task-configuration}

По умолчанию в чарте настроена одна задача в виде CronJob, которая отвечает за проверку необходимости срабатывания алертов. Ниже приведены её параметры конфигурации:

| Параметр | Описание | Значение по умолчанию |
|-----------|-------------|---------|
| `tasks.enabled` | Включить/выключить cron-задачи в кластере. По умолчанию образ HyperDX будет запускать cron-задачи в процессе. Измените на true, если вы предпочитаете использовать отдельную cron-задачу в кластере. | `false` |
| `tasks.checkAlerts.schedule` | Cron-расписание для задачи check-alerts | `*/1 * * * *` |
| `tasks.checkAlerts.resources` | Запросы и лимиты ресурсов для задачи check-alerts | См. `values.yaml` |

## Обновление чарта

Чтобы обновить чарт до более новой версии:

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

Чтобы просмотреть доступные версии Helm‑чарта:

```shell
helm search repo clickstack
```


## Удаление ClickStack

Чтобы удалить Развертывание:

```shell
helm uninstall my-clickstack
```

Это удалит все ресурсы, связанные с релизом, но постоянные данные (если таковые имеются) могут остаться.


## Устранение неполадок {#troubleshooting}

### Просмотр логов \{#customizing-values\}

```shell
kubectl logs -l app.kubernetes.io/name=clickstack
```


### Диагностика сбоя установки \{#using-secrets\}

```shell
helm install my-clickstack clickstack/clickstack --debug --dry-run
```


### Проверка развертывания

```shell
kubectl get pods -l app.kubernetes.io/name=clickstack
```

:::tip Дополнительные ресурсы по устранению неполадок
Для проблем, связанных с входным шлюзом, TLS или устранением неполадок облачных развертываний, см.:

* [Устранение неполадок входного шлюза](/docs/use-cases/observability/clickstack/deployment/helm-configuration#troubleshooting-ingress) — выдача ресурсов, перезапись путей, проблемы в браузере
* [Облачные развертывания](/docs/use-cases/observability/clickstack/deployment/helm-cloud#loadbalancer-dns-resolution-issue) — проблемы GKE OpAMP и другие специфические для облака проблемы
  :::

<JSONSupport />

Вы можете задать эти переменные окружения либо через параметры, либо в `values.yaml`, например:

*values.yaml*

```yaml
hyperdx:
  ...
  env:
    - name: BETA_CH_OTEL_JSON_SCHEMA_ENABLED
      value: "true"

otel:
  ...
  env:
    - name: OTEL_AGENT_FEATURE_GATE_ARG
      value: "--feature-gates=clickhouse.json"
```

или через `--set`:

```shell
helm install my-clickstack clickstack/clickstack \
  --set "hyperdx.env[0].name=BETA_CH_OTEL_JSON_SCHEMA_ENABLED" \
  --set "hyperdx.env[0].value=true" \
  --set "otel.env[0].name=OTEL_AGENT_FEATURE_GATE_ARG" \
  --set "otel.env[0].value=--feature-gates=clickhouse.json"
```


## Сопутствующая документация {#related-documentation}

### Руководства по развертыванию {#deployment-guides}

- [Варианты развертывания](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) — внешний ClickHouse, OTel collector и минимальные варианты развертывания
- [Руководство по конфигурации](/docs/use-cases/observability/clickstack/deployment/helm-configuration) — ключи API, секреты и настройка входного шлюза
- [Развертывания в Cloud](/docs/use-cases/observability/clickstack/deployment/helm-cloud) — конфигурации GKE, EKS, AKS и рекомендации по лучшим практикам для production

### Дополнительные ресурсы {#additional-resources}

- [Руководство по началу работы с ClickStack](/docs/use-cases/observability/clickstack/getting-started/index) — введение в ClickStack
- [Репозиторий Helm-чартов ClickStack](https://github.com/ClickHouse/ClickStack-helm-charts) — исходный код чартов и справочник по значениям
- [Документация Kubernetes](https://kubernetes.io/docs/) — справочные материалы по Kubernetes
- [Документация Helm](https://helm.sh/docs/) — справочные материалы по Helm