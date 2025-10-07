---
'slug': '/use-cases/observability/clickstack/deployment/local-mode-only'
'title': 'Только локальный режим'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 5
'description': 'Развертывание ClickStack только в локальном режиме - Стек мониторинга
  ClickHouse'
'doc_type': 'guide'
---
import Image from '@theme/IdealImage';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

Аналогично [единым изображениям](/use-cases/observability/clickstack/deployment/docker-compose), этот комплексный образ Docker объединяет все компоненты ClickStack:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector** (экспортирующий OTLP на портах `4317` и `4318`)
* **MongoDB** (для постоянного состояния приложения)

**Однако аутентификация пользователей отключена для этой версии HyperDX**

### Подходит для {#suitable-for}

* Демо
* Отладка
* Разработка, где используется HyperDX

## Этапы развертывания {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Развертывание с Docker {#deploy-with-docker}

Локальный режим развертывает интерфейс HyperDX на порту 8080.

```shell
docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

### Перейдите к интерфейсу HyperDX {#navigate-to-hyperdx-ui}

Посетите [http://localhost:8080](http://localhost:8080), чтобы получить доступ к интерфейсу HyperDX.

**Вас не попросят создать пользователя, так как аутентификация не включена в этом режиме развертывания.**

Подключитесь к своему собственному внешнему кластеру ClickHouse, например, ClickHouse Cloud.

<Image img={hyperdx_2} alt="Создание входа" size="md"/>

Создайте источник, сохраните все значения по умолчанию и заполните поле `Table` значением `otel_logs`. Все остальные настройки должны быть автоматически определены, позволяя вам нажать `Сохранить новый источник`.

<Image img={hyperdx_logs} alt="Создание источника логов" size="md"/>

</VerticalStepper>

<JSONSupport/>

Для образа только для локального режима пользователю необходимо установить параметр `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`, например:

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```