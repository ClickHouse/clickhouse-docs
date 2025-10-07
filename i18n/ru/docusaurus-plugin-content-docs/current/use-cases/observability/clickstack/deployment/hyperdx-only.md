---
'slug': '/use-cases/observability/clickstack/deployment/hyperdx-only'
'title': 'HyperDX только'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 4
'description': 'Развертывание только HyperDX'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

Этот вариант предназначен для пользователей, у которых уже есть работающий экземпляр ClickHouse, заполненный данными об наблюдаемости или событиях.

HyperDX может использоваться независимо от остальной части стека и совместим с любой схемой данных — не только с OpenTelemetry (OTel). Это делает его подходящим для пользовательских конвейеров наблюдаемости, уже построенных на ClickHouse.

Чтобы обеспечить полную функциональность, вам необходимо предоставить экземпляр MongoDB для хранения состояния приложения, включая панели управления, сохраненные поисковые запросы, настройки пользователей и оповещения.

В этом режиме прием данных полностью остается на усмотрение пользователя. Вы можете загружать данные в ClickHouse, используя свой собственный размещенный сборщик OpenTelemetry, прямой ввод из клиентских библиотек, нативные движки таблиц ClickHouse (такие как Kafka или S3), ETL-пайплайны или управляемые сервисы загрузки данных, такие как ClickPipes. Этот подход предлагает максимальную гибкость и подходит для команд, которые уже работают с ClickHouse и хотят дополнить его HyperDX для визуализации, поиска и оповещения.

### Подходит для {#suitable-for}

- Существующих пользователей ClickHouse
- Пользовательских конвейеров событий

## Шаги развертывания {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Развертывание с Docker {#deploy-hyperdx-with-docker}

Запустите следующую команду, изменив `YOUR_MONGODB_URI` по мере необходимости. 

```shell
docker run -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```

### Перейдите в интерфейс HyperDX {#navigate-to-hyperdx-ui}

Посетите [http://localhost:8080](http://localhost:8080), чтобы получить доступ к интерфейсу HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующий требованиям. 

После нажатия `Создать` вам будут предложены данные для подключения.

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

### Завершите данные подключения {#complete-connection-details}

Подключитесь к вашему собственному внешнему кластеру ClickHouse, например, ClickHouse Cloud.

<Image img={hyperdx_2} alt="HyperDX Login" size="md"/>

Если вас просят создать источник, оставьте все значения по умолчанию и заполните поле `Table` значением `otel_logs`. Все остальные настройки должны быть автоматически обнаружены, что позволит вам нажать `Сохранить новый источник`.

:::note Создание источника
Создание источника требует существования таблиц в ClickHouse. Если у вас нет данных, мы рекомендуем развернуть сборщик OpenTelemetry ClickStack для создания таблиц.
:::

</VerticalStepper>

## Использование Docker Compose {#using-docker-compose}

Пользователи могут изменить [конфигурацию Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose), чтобы достичь того же эффекта, что и в этом руководстве, удалив OTel-сборщик и экземпляр ClickHouse из манифеста.

## Сборщик OpenTelemetry ClickStack {#otel-collector}

Даже если вы управляете своим собственным сборщиком OpenTelemetry, независимо от других компонентов в стеке, мы все же рекомендуем использовать дистрибутив сборщика ClickStack. Это гарантирует, что используется схема по умолчанию и применяются лучшие практики для загрузки данных.

Для получения информации о развертывании и настройке автономного сборщика смотрите ["Прием данных с помощью OpenTelemetry"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration).

<JSONSupport/>

Для изображения только с HyperDX пользователям нужно установить параметр `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`, например,

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```
