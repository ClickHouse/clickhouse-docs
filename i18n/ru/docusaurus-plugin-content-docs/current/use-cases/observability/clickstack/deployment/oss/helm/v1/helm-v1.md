---
slug: /use-cases/observability/clickstack/deployment/helm-v1
title: 'Helm (v1.x)'
pagination_prev: null
pagination_next: null
sidebar_position: 10
description: 'Развертывание ClickStack с использованием Helm-чарта v1.x с inline-template'
doc_type: 'guide'
keywords: ['Helm-чарт ClickStack', 'Развертывание ClickHouse с помощью Helm', 'Установка HyperDX с помощью Helm', 'Стек обсервабилити для Kubernetes', 'Развертывание ClickStack в Kubernetes']
---

import Image from '@theme/IdealImage';
import hyperdx_24 from '@site/static/images/use-cases/observability/hyperdx-24.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import JSONSupport from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

:::warning Устарело — чарт v1.x
На этой странице описан Helm-чарт **v1.x** с inline-template, который переведён в режим сопровождения и больше не будет получать новые функции. Для новых развертываний используйте [чарт v2.x](/docs/use-cases/observability/clickstack/deployment/helm). Чтобы перенести существующее развертывание v1.x, см. [руководство по обновлению](/docs/use-cases/observability/clickstack/deployment/helm-upgrade).
:::

Helm-чарт для ClickStack доступен [здесь](https://github.com/ClickHouse/ClickStack-helm-charts) и является **рекомендуемым** способом для промышленных развертываний.

По умолчанию Helm-чарт разворачивает все основные компоненты, включая:

* **ClickHouse**
* **HyperDX**
* **OTel collector**
* **MongoDB** (для постоянного хранения состояния приложения)

Однако его можно легко настроить для интеграции с существующим развертыванием ClickHouse — например, размещённым в **ClickHouse Cloud**.

Чарт поддерживает стандартные лучшие практики Kubernetes, включая:

* Конфигурацию для конкретной среды через `values.yaml`
* Ограничения ресурсов и масштабирование на уровне подов
* Настройку TLS и входного шлюза
* Управление секретами и настройку аутентификации

### Подходит для \{#suitable-for\}

* пилотных проектов
* промышленной эксплуатации

## Этапы развертывания \{#deployment-steps\}

<br />

<VerticalStepper headerLevel="h3">
  ### Предварительные требования \{#prerequisites\}

  * [Helm](https://helm.sh/) v3+
  * Кластер Kubernetes (рекомендуется v1.20+)
  * `kubectl`, настроенный для работы с вашим кластером

  ### Добавьте репозиторий Helm для ClickStack \{#add-the-clickstack-helm-repository\}

  Добавьте репозиторий Helm для ClickStack:

  ```shell
  helm repo add clickstack https://clickhouse.github.io/ClickStack-helm-charts
  helm repo update
  ```

  ### Установка ClickStack \{#installing-clickstack\}

  Чтобы установить чарт ClickStack со значениями по умолчанию:

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

  Проброс портов позволяет получить доступ к HyperDX и настроить его. При развёртывании в production вместо этого следует открыть доступ к сервису через входной шлюз или балансировщик нагрузки, чтобы обеспечить корректный сетевой доступ, терминацию TLS и масштабируемость. Проброс портов лучше всего подходит для локальной разработки или разовых административных задач, а не для длительного использования или сред с высокой доступностью.

  ```shell
  kubectl port-forward \
    pod/$(kubectl get pod -l app.kubernetes.io/name=clickstack -o jsonpath='{.items[0].metadata.name}') \
    8080:3000
  ```

  :::tip Настройка входного шлюза для промышленной среды
  Для промышленных развертываний настройте входной шлюз с TLS вместо проброса портов. Подробные инструкции см. в [руководстве по настройке входного шлюза](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1#ingress-setup).
  :::

  ### Откройте интерфейс \{#navigate-to-the-ui\}

  Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы открыть интерфейс HyperDX.

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

  Либо отредактируйте `values.yaml`. Чтобы получить значения по умолчанию:

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

  ### Использование секретов (необязательно) \{#using-secrets\}

  Для работы с конфиденциальными данными, такими как API-ключи или учётные данные базы данных, используйте секреты Kubernetes. Helm-чарты HyperDX включают файлы секретов по умолчанию, которые можно изменить и применить в вашем кластере.

  #### Использование предварительно настроенных секретов \{#using-pre-configured-secrets\}

  Helm-чарт включает шаблон секрета по умолчанию, расположенный по адресу [`charts/clickstack/templates/secrets.yaml`](https://github.com/ClickHouse/ClickStack-helm-charts/blob/main/charts/clickstack/templates/secrets.yaml). Этот файл задаёт базовую структуру для управления секретами.

  Если вам нужно применить секрет вручную, измените и примените предоставленный шаблон `secrets.yaml`:

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

  #### Создание собственного секрета \{#creating-a-custom-secret\}

  При желании Вы можете вручную создать собственный секрет Kubernetes:

  ```shell
  kubectl create secret generic hyperdx-secret \
    --from-literal=API_KEY=my-secret-api-key
  ```

  #### Указание секрета \{#referencing-a-secret\}

  Чтобы указать секрет в `values.yaml`:

  ```yaml
  hyperdx:
    apiKey:
      valueFrom:
        secretKeyRef:
          name: hyperdx-secret
          key: API_KEY
  ```

  :::tip Управление API-ключами
  Подробные инструкции по настройке API-ключей, включая несколько способов конфигурации и порядок перезапуска подов, см. в [руководстве по настройке API-ключей](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1#api-key-setup).
  :::
</VerticalStepper>

## Использование ClickHouse Cloud \{#using-clickhouse-cloud\}

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

Либо используйте файл `values.yaml`:

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

:::tip Расширенные внешние конфигурации
Для развертываний в production с конфигурацией на основе секретов, с использованием внешних OTel collector или с минимальной конфигурацией см. [руководство по вариантам развертывания](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1).
:::

## Примечания для продакшена \{#production-notes\}

По умолчанию этот чарт также устанавливает ClickHouse и OTel collector. Однако для продакшена рекомендуется управлять ClickHouse и OTel collector отдельно.

Чтобы отключить ClickHouse и OTel collector, задайте следующие значения:

```shell
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.enabled=false
```

:::tip Лучшие практики для продакшена
Для развертываний в продакшене, включая настройку высокой доступности, управление ресурсами, настройку Входного шлюза/TLS и конфигурации для облачных платформ (GKE, EKS, AKS), см.:

* [Руководство по конфигурации](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - Входной шлюз, TLS и управление секретами
* [Развертывания в Cloud](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - Настройки для Cloud и чек-лист для продакшена
  :::

## Конфигурация задач \{#task-configuration\}

По умолчанию в чарте настроена одна задача в виде cronjob, которая отвечает за проверку того, должны ли сработать оповещения. Ниже приведены её настройки:

| Параметр                      | Описание                                                                                                                                                                                                          | По умолчанию      |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `tasks.enabled`               | Включить или отключить cron-задачи в кластере. По умолчанию образ HyperDX будет выполнять cron-задачи в рамках процесса приложения. Установите `true`, если хотите использовать отдельную cron-задачу в кластере. | `false`           |
| `tasks.checkAlerts.schedule`  | Расписание cron для задачи check-alerts                                                                                                                                                                           | `*/1 * * * *`     |
| `tasks.checkAlerts.resources` | Запросы и лимиты ресурсов для задачи check-alerts                                                                                                                                                                 | См. `values.yaml` |

## Обновление чарта \{#upgrading-the-chart\}

Чтобы обновить чарт до более новой версии:

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

Чтобы проверить доступные версии чарта:

```shell
helm search repo clickstack
```

:::note Обновление до v2.x
Если вы хотите перейти на chart v2.x на основе subchart, см. [руководство по обновлению](/docs/use-cases/observability/clickstack/deployment/helm-upgrade), где приведены инструкции по миграции. Это несовместимое изменение — обновление `helm upgrade` на месте не поддерживается.
:::

## Удаление ClickStack \{#uninstalling-clickstack\}

Чтобы удалить развертывание:

```shell
helm uninstall my-clickstack
```

Это удалит все ресурсы, связанные с релизом, но постоянные данные (если они есть) могут остаться.

## Устранение неполадок \{#troubleshooting\}

### Проверка логов \{#checking-logs\}

```shell
kubectl logs -l app.kubernetes.io/name=clickstack
```

### Отладка сбоя установки \{#debugging-a-failed-install\}

```shell
helm install my-clickstack clickstack/clickstack --debug --dry-run
```

### Проверка развертывания \{#verifying-deployment\}

```shell
kubectl get pods -l app.kubernetes.io/name=clickstack
```

:::tip Дополнительные ресурсы по устранению неполадок
Сведения о проблемах, связанных с Входным шлюзом, TLS или развертыванием в Cloud, см. здесь:

* [Устранение неполадок Входного шлюза](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1#troubleshooting-ingress) - выдача ресурсов, перезапись путей, проблемы в браузере
* [Развертывания в Cloud](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1#loadbalancer-dns-resolution-issue) - проблемы с GKE OpAMP и другие проблемы, характерные для Cloud
  :::

<JSONSupport />

Вы можете задать эти переменные окружения либо через параметры, либо через `values.yaml`, например:

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

или с помощью `--set`:

```shell
helm install my-clickstack clickstack/clickstack \
  --set "hyperdx.env[0].name=BETA_CH_OTEL_JSON_SCHEMA_ENABLED" \
  --set "hyperdx.env[0].value=true" \
  --set "otel.env[0].name=OTEL_AGENT_FEATURE_GATE_ARG" \
  --set "otel.env[0].value=--feature-gates=clickhouse.json"
```

## Сопутствующая документация \{#related-documentation\}

### Руководства по развертыванию v1.x \{#deployment-guides\}

* [Варианты развертывания (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1) - Внешний ClickHouse, OTel collector и минимальные варианты развертывания
* [Руководство по настройке (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - API-ключи, секреты и настройка входного шлюза
* [Развертывания в Cloud (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - Конфигурации GKE, EKS и AKS, а также лучшие практики для продакшена

### Документация v2.x \{#v2x-documentation\}

* [Helm (v2.x)](/docs/use-cases/observability/clickstack/deployment/helm) - руководство по развертыванию для v2.x
* [Руководство по обновлению](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - переход с v1.x на v2.x

### Дополнительные ресурсы \{#additional-resources\}

* [Руководство по началу работы с ClickStack](/use-cases/observability/clickstack/getting-started) - Введение в ClickStack
* [Репозиторий Helm-чартов ClickStack](https://github.com/ClickHouse/ClickStack-helm-charts) - Исходный код чартов и справочник по значениям
* [Документация Kubernetes](https://kubernetes.io/docs/) - Справочник по Kubernetes
* [Документация Helm](https://helm.sh/docs/) - Справочник по Helm