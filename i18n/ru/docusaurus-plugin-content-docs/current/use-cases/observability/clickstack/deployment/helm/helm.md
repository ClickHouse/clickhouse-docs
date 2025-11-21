---
slug: /use-cases/observability/clickstack/deployment/helm
title: "Helm"
pagination_prev: null
pagination_next: null
sidebar_position: 2
description: "Развертывание ClickStack с помощью Helm — стек наблюдаемости ClickHouse"
doc_type: "guide"
keywords:
  [
    "ClickStack Helm chart",
    "Helm ClickHouse deployment",
    "HyperDX Helm installation",
    "Kubernetes observability stack",
    "ClickStack Kubernetes deployment"
  ]
---

import Image from "@theme/IdealImage"
import hyperdx_24 from "@site/static/images/use-cases/observability/hyperdx-24.png"
import hyperdx_login from "@site/static/images/use-cases/observability/hyperdx-login.png"
import JSONSupport from "@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md"

:::warning Миграция чарта
Если вы используете чарт `hdx-oss-v2`, выполните миграцию на чарт `clickstack`. Чарт `hdx-oss-v2` находится в режиме поддержки и больше не будет получать новые функции. Вся новая разработка ведется в чарте `clickstack`, который предоставляет ту же функциональность с улучшенным именованием и более удобной организацией.
:::

Helm-чарт для HyperDX можно найти [здесь](https://github.com/hyperdxio/helm-charts). Это **рекомендуемый** метод для развертывания в production-среде.

По умолчанию Helm-чарт разворачивает все основные компоненты, включая:

- **ClickHouse**
- **HyperDX**
- **OpenTelemetry (OTel) collector**
- **MongoDB** (для хранения состояния приложения)

При этом его можно легко настроить для интеграции с существующим развертыванием ClickHouse, например, размещенным в **ClickHouse Cloud**.

Чарт поддерживает стандартные практики Kubernetes, включая:

- Конфигурацию для конкретных сред через `values.yaml`
- Ограничения ресурсов и масштабирование на уровне подов
- Настройку TLS и ingress
- Управление секретами и настройку аутентификации

### Подходит для {#suitable-for}

- Proof of concept
- Production-развертываний


## Шаги развертывания {#deployment-steps}

<br />

<VerticalStepper headerLevel="h3">

### Предварительные требования {#prerequisites}

- [Helm](https://helm.sh/) v3+
- Кластер Kubernetes (рекомендуется v1.20+)
- `kubectl`, настроенный для взаимодействия с вашим кластером

### Добавление репозитория Helm для ClickStack {#add-the-clickstack-helm-repository}

Добавьте репозиторий Helm для ClickStack:

```shell
helm repo add clickstack https://hyperdxio.github.io/helm-charts
helm repo update
```

### Установка ClickStack {#installing-clickstack}

Чтобы установить чарт ClickStack со значениями по умолчанию:

```shell
helm install my-clickstack clickstack/clickstack
```

### Проверка установки {#verify-the-installation}

Проверьте установку:

```shell
kubectl get pods -l "app.kubernetes.io/name=clickstack"
```

Когда все поды будут готовы, продолжайте.

### Перенаправление портов {#forward-ports}

Перенаправление портов позволяет получить доступ к HyperDX и настроить его. Пользователям, развертывающим в продакшене, следует вместо этого предоставить доступ к сервису через ingress или балансировщик нагрузки для обеспечения правильного сетевого доступа, терминации TLS и масштабируемости. Перенаправление портов лучше всего подходит для локальной разработки или разовых административных задач, а не для долгосрочных сред или сред с высокой доступностью.

```shell
kubectl port-forward \
  pod/$(kubectl get pod -l app.kubernetes.io/name=clickstack -o jsonpath='{.items[0].metadata.name}') \
  8080:3000
```

:::tip Настройка Ingress для продакшена
Для продакшен-развертываний настройте ingress с TLS вместо перенаправления портов. См. [руководство по настройке Ingress](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup) для получения подробных инструкций по настройке.
:::

### Переход к пользовательскому интерфейсу {#navigate-to-the-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080) для доступа к пользовательскому интерфейсу HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующие требованиям.

<Image img={hyperdx_login} alt='HyperDX UI' size='lg' />

При нажатии `Create` будут созданы источники данных для экземпляра ClickHouse, развернутого с помощью Helm-чарта.

:::note Переопределение соединения по умолчанию
Вы можете переопределить соединение по умолчанию с интегрированным экземпляром ClickHouse. Подробности см. в разделе [«Использование ClickHouse Cloud»](#using-clickhouse-cloud).
:::

Пример использования альтернативного экземпляра ClickHouse см. в разделе [«Создание подключения к ClickHouse Cloud»](/docs/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).

### Настройка значений (необязательно) {#customizing-values}

Вы можете настроить параметры с помощью флагов `--set`. Например:

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

Альтернативно, отредактируйте файл `values.yaml`. Чтобы получить значения по умолчанию:

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

### Использование секретов (необязательно) {#using-secrets}

Для работы с конфиденциальными данными, такими как ключи API или учетные данные базы данных, используйте секреты Kubernetes. Helm-чарты HyperDX предоставляют файлы секретов по умолчанию, которые вы можете изменить и применить к вашему кластеру.

#### Использование предварительно настроенных секретов {#using-pre-configured-secrets}

Helm-чарт включает шаблон секрета по умолчанию, расположенный в [`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml). Этот файл предоставляет базовую структуру для управления секретами.

Если вам нужно вручную применить секрет, измените и примените предоставленный шаблон `secrets.yaml`:

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

Примените секрет к вашему кластеру:

```shell
kubectl apply -f secrets.yaml
```

#### Создание пользовательского секрета {#creating-a-custom-secret}


При необходимости вы можете создать пользовательский секрет Kubernetes вручную:

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```

#### Ссылка на секрет {#referencing-a-secret}

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
Подробные инструкции по настройке API-ключа, включая различные методы конфигурации и процедуры перезапуска подов, см. в [руководстве по настройке API-ключа](/docs/use-cases/observability/clickstack/deployment/helm-configuration#api-key-setup).
:::

</VerticalStepper>


## Использование ClickHouse Cloud {#using-clickhouse-cloud}


Если вы используете ClickHouse Cloud, отключите экземпляр ClickHouse, развернутый с помощью Helm-чарта, и укажите учетные данные ClickHouse Cloud:

```shell
# укажите учетные данные ClickHouse Cloud
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # полный URL-адрес https
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
```


# Как переопределить подключение по умолчанию

helm install my-clickstack clickstack/clickstack \
--set clickhouse.enabled=false \
--set clickhouse.persistence.enabled=false \
--set otel.clickhouseEndpoint=${CLICKHOUSE_URL} \
--set clickhouse.config.users.otelUser=${CLICKHOUSE_USER} \
--set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD}

````

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
````


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

````
```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
# or if installed...
# helm upgrade my-clickstack clickstack/clickstack -f values.yaml
````

:::tip Расширенные настройки внешних подключений
Для производственных развертываний с конфигурацией на основе секретов, внешними коллекторами OTEL или минимальными установками см. [руководство по вариантам развертывания](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options).
:::


## Примечания для production {#production-notes}

По умолчанию этот chart также устанавливает ClickHouse и OTel collector. Однако для production рекомендуется управлять ClickHouse и OTel collector отдельно.

Чтобы отключить ClickHouse и OTel collector, установите следующие значения:

```shell
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.enabled=false
```

:::tip Рекомендации для production
Для production-развертываний, включая конфигурацию высокой доступности, управление ресурсами, настройку ingress/TLS и облачные конфигурации (GKE, EKS, AKS), см.:

- [Руководство по конфигурации](/docs/use-cases/observability/clickstack/deployment/helm-configuration) — Ingress, TLS и управление секретами
- [Облачные развертывания](/docs/use-cases/observability/clickstack/deployment/helm-cloud) — Облачные настройки и чек-лист для production
  :::


## Конфигурация задач {#task-configuration}

По умолчанию в настройках чарта присутствует одна задача, настроенная как cronjob, которая отвечает за проверку необходимости срабатывания оповещений. Ниже приведены параметры её конфигурации:

| Параметр                      | Описание                                                                                                                                                                            | Значение по умолчанию |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `tasks.enabled`               | Включение/отключение cron-задач в кластере. По умолчанию образ HyperDX выполняет cron-задачи в процессе. Установите значение true, если хотите использовать отдельную cron-задачу в кластере. | `false`               |
| `tasks.checkAlerts.schedule`  | Расписание cron для задачи проверки оповещений                                                                                                                                      | `*/1 * * * *`         |
| `tasks.checkAlerts.resources` | Запросы и лимиты ресурсов для задачи проверки оповещений                                                                                                                            | См. `values.yaml`     |


## Обновление чарта {#upgrading-the-chart}

Для обновления до более новой версии:

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

Для проверки доступных версий чарта:

```shell
helm search repo clickstack
```


## Удаление ClickStack {#uninstalling-clickstack}

Чтобы удалить развертывание:

```shell
helm uninstall my-clickstack
```

Эта команда удалит все ресурсы, связанные с релизом, но постоянные данные (если они есть) могут сохраниться.


## Устранение неполадок {#troubleshooting}

### Проверка журналов {#checking-logs}

```shell
kubectl logs -l app.kubernetes.io/name=clickstack
```

### Отладка неудачной установки {#debugging-a-failed-install}

```shell
helm install my-clickstack clickstack/clickstack --debug --dry-run
```

### Проверка развертывания {#verifying-deployment}

```shell
kubectl get pods -l app.kubernetes.io/name=clickstack
```

:::tip Дополнительные ресурсы по устранению неполадок
Для решения проблем, связанных с ingress, TLS или развертыванием в облаке, см.:

- [Устранение неполадок Ingress](/docs/use-cases/observability/clickstack/deployment/helm-configuration#troubleshooting-ingress) — обслуживание ресурсов, перезапись путей, проблемы браузера
- [Облачные развертывания](/docs/use-cases/observability/clickstack/deployment/helm-cloud#loadbalancer-dns-resolution-issue) — проблемы GKE OpAMP и специфичные для облака проблемы
  :::

<JSONSupport />

Пользователи могут задать эти переменные окружения через параметры или файл `values.yaml`, например:

_values.yaml_

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


## Связанная документация {#related-documentation}

### Руководства по развертыванию {#deployment-guides}

- [Варианты развертывания](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) — внешний ClickHouse, сборщик OTEL и минимальные развертывания
- [Руководство по конфигурации](/docs/use-cases/observability/clickstack/deployment/helm-configuration) — API-ключи, секреты и настройка ingress
- [Облачные развертывания](/docs/use-cases/observability/clickstack/deployment/helm-cloud) — конфигурации GKE, EKS, AKS и рекомендации для production-окружения

### Дополнительные ресурсы {#additional-resources}

- [Руководство по началу работы с ClickStack](/docs/use-cases/observability/clickstack/getting-started) — введение в ClickStack
- [Репозиторий Helm-чартов ClickStack](https://github.com/hyperdxio/helm-charts) — исходный код чартов и справочник по параметрам
- [Документация Kubernetes](https://kubernetes.io/docs/) — справочник по Kubernetes
- [Документация Helm](https://helm.sh/docs/) — справочник по Helm
