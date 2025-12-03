---
slug: /use-cases/observability/clickstack/deployment/helm
title: 'Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 2
description: 'Развертывание ClickStack с помощью Helm — стек наблюдаемости ClickHouse'
doc_type: 'guide'
keywords: ['Helm-чарт ClickStack', 'развертывание ClickHouse с помощью Helm', 'установка HyperDX с помощью Helm', 'стек наблюдаемости Kubernetes', 'развертывание ClickStack в Kubernetes']
---

import Image from '@theme/IdealImage';
import hyperdx_24 from '@site/static/images/use-cases/observability/hyperdx-24.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import JSONSupport from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

:::warning Миграция чарта
Если вы в данный момент используете чарт `hdx-oss-v2`, перейдите на чарт `clickstack`. Чарт `hdx-oss-v2` находится в режиме сопровождения и больше не будет получать новые функции. Весь новый функционал разрабатывается для чарта `clickstack`, который обеспечивает ту же функциональность с более понятными названиями и улучшённой структурой.
:::

Helm-чарт для HyperDX можно найти [здесь](https://github.com/hyperdxio/helm-charts); это **рекомендованный** способ продакшен-развертываний.

По умолчанию Helm-чарт разворачивает все основные компоненты, включая:

* **ClickHouse**
* **HyperDX**
* **Коллектор OpenTelemetry (OTel)**
* **MongoDB** (для персистентного состояния приложения)

Однако его можно легко настроить для интеграции с существующим развертыванием ClickHouse — например, размещённым в **ClickHouse Cloud**.

Чарт поддерживает стандартные передовые практики Kubernetes, включая:

* Конфигурацию для разных окружений через `values.yaml`
* Лимиты ресурсов и масштабирование подов
* Настройку TLS и Входного шлюза
* Управление секретами и настройку аутентификации

### Подходит для {#suitable-for}

* Пилотных проектов (proof of concept)
* Продакшена (production)

## Этапы развертывания {#deployment-steps}

<br/>

<VerticalStepper headerLevel="h3">
  ### Предварительные требования

  * [Helm](https://helm.sh/) v3+
  * Кластер Kubernetes (рекомендуется версия v1.20+)
  * `kubectl`, настроенный для взаимодействия с вашим кластером

  ### Добавьте Helm-репозиторий ClickStack

  Добавьте Helm-репозиторий ClickStack:

  ```shell
  helm repo add clickstack https://hyperdxio.github.io/helm-charts
  helm repo update
  ```

  ### Установка ClickStack

  Чтобы установить чарт ClickStack со значениями по умолчанию:

  ```shell
  helm install my-clickstack clickstack/clickstack
  ```

  ### Проверка установки

  Проверьте установку:

  ```shell
  kubectl get pods -l "app.kubernetes.io/name=clickstack"
  ```

  Когда все поды будут готовы, продолжайте.

  ### Проброс портов

  Проброс портов позволяет получить доступ к HyperDX и выполнить его настройку. Пользователям, развертывающим систему в производственной среде, следует вместо этого предоставить доступ к сервису через входной шлюз или балансировщик нагрузки для обеспечения надлежащего сетевого доступа, терминации TLS и масштабируемости. Проброс портов оптимален для локальной разработки или разовых административных задач, но не подходит для долгосрочного использования или сред с высокими требованиями к доступности.

  ```shell
  kubectl port-forward \
    pod/$(kubectl get pod -l app.kubernetes.io/name=clickstack -o jsonpath='{.items[0].metadata.name}') \
    8080:3000
  ```

  :::tip Настройка входного шлюза для production-окружения
  Для production-развертываний настройте входной шлюз с TLS вместо проброса портов. Подробные инструкции см. в [руководстве по настройке входного шлюза](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup).
  :::

  ### Переход к UI

  Откройте [http://localhost:8080](http://localhost:8080), чтобы получить доступ к интерфейсу HyperDX.

  Создайте пользователя, указав имя пользователя и пароль, которые соответствуют требованиям.

  <Image img={hyperdx_login} alt="Интерфейс HyperDX" size="lg" />

  После нажатия `Create` будут созданы источники данных для экземпляра ClickHouse, развернутого с помощью Helm-чарта.

  :::note Переопределение подключения по умолчанию
  Вы можете переопределить стандартное подключение к встроенному экземпляру ClickHouse. Подробнее см. в разделе [&quot;Использование ClickHouse Cloud&quot;](#using-clickhouse-cloud).
  :::

  Пример использования альтернативного экземпляра ClickHouse см. в разделе [&quot;Создание подключения к ClickHouse Cloud&quot;](/docs/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).

  ### Настройка значений (необязательно)

  Настройки можно изменить с помощью флагов `--set`. Например:

  ```shell
  helm install my-clickstack clickstack/clickstack --set key=value
  ```

  Либо отредактируйте `values.yaml`. Для получения значений по умолчанию:

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

  Для работы с конфиденциальными данными, такими как API-ключи или учётные данные базы данных, используйте секреты Kubernetes. Helm-чарты HyperDX предоставляют файлы секретов по умолчанию, которые можно изменить и применить к кластеру.

  #### Использование предварительно настроенных секретов

  Helm-чарт содержит шаблон секрета по умолчанию, который находится в [`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml). Этот файл определяет базовую структуру для управления секретами.

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

  При необходимости можно создать пользовательский секрет Kubernetes вручную:

  ```shell
  kubectl create secret generic hyperdx-secret \
    --from-literal=API_KEY=my-secret-api-key
  ```

  #### Ссылка на секрет

  Для ссылки на секрет в `values.yaml`:

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
# укажите учетные данные ClickHouse Cloud
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # полный https-адрес
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

# как переопределить подключение по умолчанию
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} \
  --set clickhouse.config.users.otelUser=${CLICKHOUSE_USER} \
  --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD}
```

Также можно использовать файл `values.yaml`:

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
        "name": "Внешний ClickHouse",
        "host": "http://ваш-clickhouse-сервер:8123",
        "port": 8123,
        "username": "ваше-имя-пользователя",
        "password": "ваш-пароль"
      }
    ]
```

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
# или, если уже установлен...
# helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

:::tip Расширенные варианты внешней конфигурации
Для продакшн-развертываний с конфигурацией на основе секретов, внешними экземплярами OTel collector или минимальными конфигурациями см. [руководство «Варианты развертывания»](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options).
:::

## Примечания для продакшена

По умолчанию этот chart также устанавливает ClickHouse и OTel collector. Однако для продакшена рекомендуется управлять ClickHouse и OTel collector отдельно.

Чтобы отключить ClickHouse и OTel collector, задайте следующие значения:

```shell
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.enabled=false
```

:::tip Рекомендации для продакшна
Для развертываний в продакшене, включая конфигурацию высокой доступности, управление ресурсами, настройку Входного шлюза/TLS и облачные конфигурации (GKE, EKS, AKS), см.:

* [Руководство по конфигурации](/docs/use-cases/observability/clickstack/deployment/helm-configuration) — Входной шлюз, TLS и управление секретами
* [Облачные развертывания](/docs/use-cases/observability/clickstack/deployment/helm-cloud) — облачные настройки и чек-лист для продакшна
  :::

## Конфигурация задач {#task-configuration}

По умолчанию в чарте настроена одна задача в виде cronjob, отвечающая за проверку необходимости срабатывания алертов. Ниже приведены её параметры конфигурации:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `tasks.enabled` | Включить/отключить cron-задачи в кластере. По умолчанию образ HyperDX запускает cron-задачи внутри процесса. Установите значение true, если вы предпочитаете использовать отдельную cron-задачу в кластере. | `false` |
| `tasks.checkAlerts.schedule` | Cron-расписание для задачи check-alerts | `*/1 * * * *` |
| `tasks.checkAlerts.resources` | Запросы и лимиты ресурсов для задачи check-alerts | См. `values.yaml` |

## Обновление чарта

Чтобы обновиться до более новой версии чарта:

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

Чтобы посмотреть доступные версии чарта:

```shell
helm search repo clickstack
```

## Удаление ClickStack

Чтобы удалить развертывание:

```shell
helm uninstall my-clickstack
```

Это удалит все ресурсы, связанные с релизом, однако постоянные данные (если они есть) могут остаться.

## Устранение неполадок {#troubleshooting}

### Проверка логов

```shell
kubectl logs -l app.kubernetes.io/name=clickstack
```

### Устранение неполадок при неудачной установке

```shell
helm install my-clickstack clickstack/clickstack --debug --dry-run
```

### Проверка развертывания

```shell
kubectl get pods -l app.kubernetes.io/name=clickstack
```

:::tip Дополнительные ресурсы по устранению неполадок
По вопросам, связанным с Входным шлюзом, TLS или диагностикой проблем облачного развертывания, см.:

* [Устранение неполадок Входного шлюза](/docs/use-cases/observability/clickstack/deployment/helm-configuration#troubleshooting-ingress) — выдача статических ресурсов, перезапись путей, проблемы с браузером
* [Облачные развертывания](/docs/use-cases/observability/clickstack/deployment/helm-cloud#loadbalancer-dns-resolution-issue) — проблемы с GKE OpAMP и другие специфичные для облака вопросы
  :::

<JSONSupport />

Пользователи могут задать эти переменные окружения либо через параметры, либо в файле `values.yaml`, например:

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

## См. также {#related-documentation}

### Руководства по развертыванию {#deployment-guides}

- [Варианты развертывания](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) — внешний ClickHouse, OTel collector и минимальные варианты развертывания
- [Руководство по конфигурации](/docs/use-cases/observability/clickstack/deployment/helm-configuration) — API-ключи, секреты и настройка входного шлюза
- [Облачные развертывания](/docs/use-cases/observability/clickstack/deployment/helm-cloud) — конфигурации GKE, EKS, AKS и лучшие практики для продакшен-среды

### Дополнительные ресурсы {#additional-resources}

- [Руководство по началу работы с ClickStack](/docs/use-cases/observability/clickstack/getting-started) — введение в ClickStack
- [Репозиторий Helm-чартов ClickStack](https://github.com/hyperdxio/helm-charts) — исходный код чарта и справочная информация по параметрам values
- [Документация по Kubernetes](https://kubernetes.io/docs/) — справочник по Kubernetes
- [Документация по Helm](https://helm.sh/docs/) — справочник по Helm