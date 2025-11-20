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

Helm-чарт для HyperDX можно найти [здесь](https://github.com/hyperdxio/helm-charts), и это **рекомендуемый** метод для production-развертываний.

По умолчанию Helm-чарт разворачивает все основные компоненты, включая:

- **ClickHouse**
- **HyperDX**
- **OpenTelemetry (OTel) collector**
- **MongoDB** (для хранения состояния приложения)

Однако его можно легко настроить для интеграции с существующим развертыванием ClickHouse — например, размещенным в **ClickHouse Cloud**.

Чарт поддерживает стандартные практики Kubernetes, включая:

- Конфигурацию для конкретных окружений через `values.yaml`
- Ограничения ресурсов и масштабирование на уровне подов
- Настройку TLS и ingress
- Управление секретами и настройку аутентификации

### Подходит для {#suitable-for}

- Proof of concept (подтверждения концепции)
- Production-использования


## Шаги развертывания {#deployment-steps}

<br />

<VerticalStepper headerLevel="h3">

### Предварительные требования {#prerequisites}

- [Helm](https://helm.sh/) v3+
- Кластер Kubernetes (рекомендуется v1.20+)
- `kubectl`, настроенный для взаимодействия с вашим кластером

### Добавление репозитория Helm для HyperDX {#add-the-hyperdx-helm-repository}

Добавьте репозиторий Helm для HyperDX:

```shell
helm repo add hyperdx https://hyperdxio.github.io/helm-charts
helm repo update
```

### Установка HyperDX {#installing-hyperdx}

Чтобы установить чарт HyperDX со значениями по умолчанию:

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2
```

### Проверка установки {#verify-the-installation}

Проверьте установку:

```shell
kubectl get pods -l "app.kubernetes.io/name=hdx-oss-v2"
```

Когда все поды будут готовы, переходите к следующему шагу.

### Перенаправление портов {#forward-ports}

Перенаправление портов позволяет получить доступ к HyperDX и настроить его. При развертывании в продакшене следует предоставлять доступ к сервису через ingress или балансировщик нагрузки для обеспечения корректного сетевого доступа, терминации TLS и масштабируемости. Перенаправление портов лучше всего подходит для локальной разработки или разовых административных задач, а не для долгосрочных или высокодоступных окружений.

```shell
kubectl port-forward \
  pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}') \
  8080:3000
```

### Переход к пользовательскому интерфейсу {#navigate-to-the-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080) для доступа к пользовательскому интерфейсу HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующие требованиям.

<Image img={hyperdx_login} alt='Пользовательский интерфейс HyperDX' size='lg' />

При нажатии `Create` будут созданы источники данных для экземпляра ClickHouse, развернутого с помощью Helm-чарта.

:::note Переопределение соединения по умолчанию
Вы можете переопределить соединение по умолчанию с интегрированным экземпляром ClickHouse. Подробности см. в разделе [«Использование ClickHouse Cloud»](#using-clickhouse-cloud).
:::

Пример использования альтернативного экземпляра ClickHouse см. в разделе [«Создание подключения к ClickHouse Cloud»](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).

### Настройка значений (опционально) {#customizing-values}

Вы можете настроить параметры с помощью флагов `--set`. Например:

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2 --set key=value
```

Альтернативно можно отредактировать файл `values.yaml`. Чтобы получить значения по умолчанию:

```shell
helm show values hyperdx/hdx-oss-v2 > values.yaml
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
helm install my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
```

### Использование секретов (опционально) {#using-secrets}

Для работы с конфиденциальными данными, такими как ключи API или учетные данные базы данных, используйте секреты Kubernetes. Helm-чарты HyperDX предоставляют файлы секретов по умолчанию, которые можно изменить и применить к вашему кластеру.

#### Использование предварительно настроенных секретов {#using-pre-configured-secrets}

Helm-чарт включает шаблон секрета по умолчанию, расположенный в [`charts/hdx-oss-v2/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/hdx-oss-v2/templates/secrets.yaml). Этот файл предоставляет базовую структуру для управления секретами.

Если необходимо вручную применить секрет, измените и примените предоставленный шаблон `secrets.yaml`:

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

При желании можно создать пользовательский секрет Kubernetes вручную:

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```


#### Ссылка на секрет {#referencing-a-secret}

Чтобы сослаться на секрет в `values.yaml`:

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```

</VerticalStepper>


## Использование ClickHouse Cloud {#using-clickhouse-cloud}

При использовании ClickHouse Cloud необходимо отключить экземпляр ClickHouse, развёрнутый через Helm-чарт, и указать учётные данные Cloud:


```shell
# укажите учетные данные ClickHouse Cloud
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # полный URL с https
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
```


# как переопределить стандартное подключение

helm install myrelease hyperdx-helm --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} --set clickhouse.config.users.otelUser=${CLICKHOUSE_USER} --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD}

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

hyperdx:
  defaultConnections: |
    [
      {
        "name": "Внешний ClickHouse",
        "host": "http://your-clickhouse-server:8123",
        "port": 8123,
        "username": "your-username",
        "password": "your-password"
      }
    ]
````


```shell
helm install my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
# или если установлено...
# helm upgrade my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
```


## Примечания для production-окружения {#production-notes}

По умолчанию этот chart также устанавливает ClickHouse и коллектор OTel. Однако для production-окружения рекомендуется управлять ClickHouse и коллектором OTel отдельно.

Чтобы отключить ClickHouse и коллектор OTel, установите следующие значения:

```shell
helm install myrelease hyperdx-helm --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
```


## Конфигурация задач {#task-configuration}

По умолчанию в настройках чарта присутствует одна задача, настроенная как cronjob и отвечающая за проверку условий срабатывания оповещений. Ниже приведены параметры её конфигурации:

| Параметр                      | Описание                                                                                                                                                                            | Значение по умолчанию |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `tasks.enabled`               | Включение/отключение cron-задач в кластере. По умолчанию образ HyperDX запускает cron-задачи внутри процесса. Установите значение true, если требуется использовать отдельную cron-задачу в кластере. | `false`               |
| `tasks.checkAlerts.schedule`  | Расписание cron для задачи проверки оповещений                                                                                                                                      | `*/1 * * * *`         |
| `tasks.checkAlerts.resources` | Запросы и лимиты ресурсов для задачи проверки оповещений                                                                                                                            | См. `values.yaml`     |


## Обновление чарта {#upgrading-the-chart}

Для обновления до более новой версии:

```shell
helm upgrade my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
```

Для проверки доступных версий чарта:

```shell
helm search repo hyperdx
```


## Удаление HyperDX {#uninstalling-hyperdx}

Для удаления развертывания выполните:

```shell
helm uninstall my-hyperdx
```

Эта команда удалит все ресурсы, связанные с релизом, однако постоянные данные (если они есть) могут сохраниться.


## Устранение неполадок {#troubleshooting}

### Проверка журналов {#checking-logs}

```shell
kubectl logs -l app.kubernetes.io/name=hdx-oss-v2
```

### Отладка неудачной установки {#debugging-a-failed-instance}

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2 --debug --dry-run
```

### Проверка развертывания {#verifying-deployment}

```shell
kubectl get pods -l app.kubernetes.io/name=hdx-oss-v2
```

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
helm install myrelease hyperdx-helm --set "hyperdx.env[0].name=BETA_CH_OTEL_JSON_SCHEMA_ENABLED" \
  --set "hyperdx.env[0].value=true" \
  --set "otel.env[0].name=OTEL_AGENT_FEATURE_GATE_ARG" \
  --set "otel.env[0].value=--feature-gates=clickhouse.json"
```
