---
'slug': '/use-cases/observability/clickstack/deployment/helm'
'title': 'Helm'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 2
'description': 'Развертывание ClickStack с помощью Helm - Стек наблюдаемости ClickHouse'
'doc_type': 'guide'
---
import Image from '@theme/IdealImage';
import hyperdx_24 from '@site/static/images/use-cases/observability/hyperdx-24.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import JSONSupport from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

Документация Helm Chart для HyperDX доступна [здесь](https://github.com/hyperdxio/helm-charts) и является **рекомендуемым** методом для развертывания в продуктивной среде.

По умолчанию Helm Chart развертывает все основные компоненты, включая:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB** (для постоянного состояния приложения)

Однако его легко настроить для интеграции с существующим развертыванием ClickHouse - например, одним, размещенным в **ClickHouse Cloud**.

Chart поддерживает стандартные лучшие практики Kubernetes, включая:

- Конфигурацию, специфичную для окружения, через `values.yaml`
- Ограничения ресурсов и масштабирование на уровне подов
- Настройку TLS и ingress
- Управление секретами и настройку аутентификации

### Подходит для {#suitable-for}

* Прототипов
* Продукции

## Шаги развертывания {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Предварительные требования {#prerequisites}

- [Helm](https://helm.sh/) v3+
- Кластер Kubernetes (рекомендуется v1.20+)
- `kubectl`, настроенный для взаимодействия с вашим кластером

### Добавить репозиторий Helm HyperDX {#add-the-hyperdx-helm-repository}

Добавьте репозиторий Helm HyperDX:

```shell
helm repo add hyperdx https://hyperdxio.github.io/helm-charts
helm repo update
```

### Установка HyperDX {#installing-hyperdx}

Чтобы установить Chart HyperDX с настройками по умолчанию:

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2
```

### Проверка установки {#verify-the-installation}

Проверьте установку:

```shell
kubectl get pods -l "app.kubernetes.io/name=hdx-oss-v2"
```

Когда все поды будут готовы, продолжайте.

### Перенаправление портов {#forward-ports}

Перенаправление портов позволяет нам получить доступ и настроить HyperDX. Пользователи, разворачивающие в продуктивной среде, должны вместо этого открыть сервис через ingress или балансировщик нагрузки, чтобы обеспечить правильный сетевой доступ, завершение TLS и масштабируемость. Перенаправление портов лучше всего подходит для локальной разработки или одноразовых административных задач, а не для долгосрочных или сред высокодоступности.

```shell
kubectl port-forward \
  pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}') \
  8080:3000
```

### Переход к интерфейсу {#navigate-to-the-ui}

Посетите [http://localhost:8080](http://localhost:8080), чтобы получить доступ к интерфейсу HyperDX.

Создайте пользователя, предоставив имя пользователя и пароль, соответствующие требованиям.

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

При нажатии `Create` будут созданы источники данных для экземпляра ClickHouse, развернутого с помощью Helm chart.

:::note Переопределение соединения по умолчанию
Вы можете переопределить соединение с интегрированным экземпляром ClickHouse. Для получения дополнительных сведений смотрите [“Использование ClickHouse Cloud”](#using-clickhouse-cloud).
:::

Для примера использования альтернативного экземпляра ClickHouse смотрите [“Создать соединение с ClickHouse Cloud”](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).

### Настройка значений (необязательно) {#customizing-values}

Вы можете настроить параметры, используя флаги `--set`. Например:

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2 --set key=value

Alternatively, edit the `values.yaml`. To retrieve the default values:

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

### Использование секретов (необязательно) {#using-secrets}

Для обработки конфиденциальных данных, таких как ключи API или учетные данные базы данных, используйте секреты Kubernetes. Helm Charts HyperDX предоставляют шаблоны секретов по умолчанию, которые вы можете изменить и применить к вашему кластеру.

#### Использование преднастроенных секретов {#using-pre-configured-secrets}

Helm chart включает шаблон секрета по умолчанию, расположенный в [`charts/hdx-oss-v2/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/hdx-oss-v2/templates/secrets.yaml). Этот файл предоставляет базовую структуру для управления секретами.

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

При желании вы можете создать пользовательский секрет Kubernetes вручную:

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

Если вы используете ClickHouse Cloud, пользователи отключают экземпляр ClickHouse, развернутый с помощью Helm chart, и указывают учетные данные Cloud:

```shell

# specify ClickHouse Cloud credentials
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # full https url
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>


# how to overwrite default connection
helm install myrelease hyperdx-helm --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} --set clickhouse.config.users.otelUser=${CLICKHOUSE_USER} --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD}
```

В качестве альтернативы используйте файл `values.yaml`:

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
helm install my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml

# or if installed...

# helm upgrade my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
```

## Заметки по продуктивному развертыванию {#production-notes}

По умолчанию этот chart также устанавливает ClickHouse и OTel collector. Однако для продуктивного развертывания рекомендуется управлять ClickHouse и OTel collector отдельно.

Чтобы отключить ClickHouse и OTel collector, установите следующие значения:

```shell
helm install myrelease hyperdx-helm --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
```

## Конфигурация задач {#task-configuration}

По умолчанию в настройках chart есть одна задача, настроенная как cronjob, отвечающая за проверку необходимости срабатывания оповещений. Вот ее параметры конфигурации:

| Параметр | Описание | Значение по умолчанию |
|-----------|-------------|---------|
| `tasks.enabled` | Включить/выключить cron задачи в кластере. По умолчанию изображение HyperDX будет запускать cron задачи в процессе. Измените на true, если хотите использовать отдельную cron задачу в кластере. | `false` |
| `tasks.checkAlerts.schedule` | Расписание cron для задачи проверки оповещений | `*/1 * * * *` |
| `tasks.checkAlerts.resources` | Запросы и ограничения ресурсов для задачи проверки оповещений | Смотрите `values.yaml` |

## Обновление chart {#upgrading-the-chart}

Чтобы обновить до новой версии:

```shell
helm upgrade my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
```

Чтобы проверить доступные версии chart:

```shell
helm search repo hyperdx
```

## Удаление HyperDX {#uninstalling-hyperdx}

Чтобы удалить развертывание:

```shell
helm uninstall my-hyperdx
```

Это удалит все ресурсы, связанные с релизом, но постоянные данные (если таковые имеются) могут остаться.

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

<JSONSupport/>

Пользователи могут устанавливать эти переменные окружения как через параметры, так и в `values.yaml`, например.

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
helm install myrelease hyperdx-helm --set "hyperdx.env[0].name=BETA_CH_OTEL_JSON_SCHEMA_ENABLED" \
  --set "hyperdx.env[0].value=true" \
  --set "otel.env[0].name=OTEL_AGENT_FEATURE_GATE_ARG" \
  --set "otel.env[0].value=--feature-gates=clickhouse.json"
```