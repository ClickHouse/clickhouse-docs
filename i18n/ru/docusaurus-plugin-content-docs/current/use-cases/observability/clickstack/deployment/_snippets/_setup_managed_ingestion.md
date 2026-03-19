import Image from '@theme/IdealImage';
import select_source from '@site/static/images/clickstack/getting-started/select_source.png';
import start_ingestion from '@site/static/images/clickstack/getting-started/start_ingestion.png';
import otel_collector_start from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import advanced_otel_collector from '@site/static/images/clickstack/getting-started/advanced_otel_collector.png';
import vector_config from '@site/static/images/clickstack/getting-started/vector_config.png';
import ExampleOTelConfig from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_config_example_otel.md';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Image img={start_ingestion} size="lg" alt="Начать ингестию" border />

Выберите &quot;Начать ингестию&quot;, после чего вам будет предложено выбрать источник ингестии. Управляемый ClickStack поддерживает OpenTelemetry и [Vector](https://vector.dev/) как основные источники ингестии. Однако пользователи также могут отправлять данные напрямую в ClickHouse в собственной схеме, используя любую из [интеграций, поддерживаемых ClickHouse Cloud](/integrations).

<Image img={select_source} size="lg" alt="Выбор источника" border />

:::note[Рекомендуется OpenTelemetry]
Использование формата OpenTelemetry настоятельно рекомендуется для ингестии.
Он обеспечивает самый простой и оптимизированный рабочий процесс с готовыми схемами, которые специально спроектированы для эффективной работы с ClickStack.
:::

<Tabs groupId="ingestion-sources">
  <TabItem value="open-telemetry" label="OpenTelemetry" default>
    Для отправки данных OpenTelemetry в управляемый ClickStack рекомендуется использовать OpenTelemetry Collector. Коллектор действует как шлюз, принимающий данные OpenTelemetry от ваших приложений (и других коллекторов) и передающий их в ClickHouse Cloud.

    Если у вас еще не запущен коллектор, запустите его, выполнив приведенные ниже шаги. Если у вас уже есть работающие коллекторы, также предоставлен пример конфигурации.

    ### Запустите коллектор \{#start-a-collector\}

    Далее предполагается рекомендуемый подход с использованием **дистрибутива OpenTelemetry Collector от ClickStack**, который включает дополнительную обработку и оптимизирован специально для ClickHouse Cloud. Если вы планируете использовать собственный OpenTelemetry Collector, см. раздел [&quot;Настройка существующих коллекторов.&quot;](#configure-existing-collectors)

    Чтобы быстро начать работу, скопируйте и выполните показанную команду Docker.

    <Image img={otel_collector_start} size="md" alt="Источник данных OTel collector" />

    Эта команда будет содержать предварительно заполненные учетные данные для подключения.

    :::note[Развертывание в production]
    Хотя эта команда использует пользователя `default` для подключения к Managed ClickStack, при [переходе в production](/use-cases/observability/clickstack/production#create-a-database-ingestion-user-managed) следует создать отдельного пользователя и изменить конфигурацию.
    :::

    Выполнение этой команды запускает коллектор ClickStack с конечными точками OTLP, доступными на портах 4317 (gRPC) и 4318 (HTTP). Если у вас уже настроены инструментация и агенты OpenTelemetry, вы можете сразу начать отправку телеметрических данных на эти конечные точки.

    ### Настройте существующие коллекторы \{#configure-existing-collectors\}

    Также можно настроить собственные существующие коллекторы OpenTelemetry или использовать собственный дистрибутив коллектора.

    :::note[Требуется экспортер ClickHouse]
    Если вы используете собственный дистрибутив, например [contrib-образ](https://github.com/open-telemetry/opentelemetry-collector-contrib), убедитесь, что он включает [экспортер ClickHouse](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter).
    :::

    Для этого предоставлен пример конфигурации OpenTelemetry Collector, использующий экспортер ClickHouse с соответствующими настройками и предоставляющий OTLP-приемники. Данная конфигурация соответствует интерфейсам и поведению, ожидаемым дистрибутивом ClickStack.

    <ExampleOTelConfig />

    <Image img={advanced_otel_collector} size="lg" alt="Расширенный источник данных для OTel collector" border />

    Для получения дополнительной информации по настройке коллекторов OpenTelemetry см. раздел [&quot;Ingesting with OpenTelemetry.&quot;](/use-cases/observability/clickstack/ingesting-data/opentelemetry)

    ### Запустите процесс ингестии (необязательно) \{#start-ingestion-create-new\}

    Если у вас есть существующие приложения или инфраструктура, которые нужно инструментировать с помощью OpenTelemetry, перейдите к соответствующим руководствам, на которые есть ссылки в UI.

    Чтобы инструментировать приложения для сбора трассировок и логов, используйте [поддерживаемые языковые SDKs](/use-cases/observability/clickstack/sdks), которые отправляют данные в ваш OpenTelemetry Collector, выступающий шлюзом для приёма данных в Managed ClickStack.

    Логи можно [собирать с помощью OpenTelemetry Collectors](/use-cases/observability/clickstack/integrations/host-logs), запущенных в режиме агента и перенаправляющих данные в тот же коллектор. Для мониторинга Kubernetes используйте [специальное руководство](/use-cases/observability/clickstack/integrations/kubernetes). Для других интеграций см. наши [руководства по быстрому старту](/use-cases/observability/clickstack/integration-guides).

    ### Демонстрационные данные \{#demo-data\}

    В качестве альтернативы, если у вас нет существующих данных, попробуйте один из наших тестовых наборов данных.

    * [Пример набора данных](/use-cases/observability/clickstack/getting-started/sample-data) — загрузите пример набора данных из нашего публичного демо и продиагностируйте простую проблему.
    * [Локальные файлы и метрики](/use-cases/observability/clickstack/getting-started/local-data) — загрузите локальные файлы и отслеживайте состояние системы под управлением OSX или Linux, используя локальный OTel collector.

    <br />
  </TabItem>

  <TabItem value="Vector" label="Vector" default>
    [Vector](https://vector.dev) — это высокопроизводительный, независимый от вендора конвейер данных для обсервабилити, особенно популярный для ингестии логов благодаря своей гибкости и низким требованиям к ресурсам.

    При использовании Vector с ClickStack пользователи сами отвечают за определение собственных схем. Эти схемы могут соответствовать соглашениям OpenTelemetry, но также могут быть полностью настраиваемыми, представляя пользовательские структуры событий.

    :::note Требуется временная метка
    Единственное строгое требование для Managed ClickStack заключается в том, что данные должны содержать **столбец временной метки** (или эквивалентное поле времени), который можно задать при настройке источника данных в ClickStack UI.
    :::

    Далее предполагается, что у вас уже запущен экземпляр Vector, предварительно настроенный с конвейерами ингестии, которые доставляют данные.

    ### Создайте базу данных и таблицу \{#create-database-and-tables\}

    Vector требует, чтобы таблица и схема были определены до начала ингестии данных.

    Сначала создайте базу данных. Это можно сделать через [консоль ClickHouse Cloud](/cloud/get-started/sql-console).

    Например, создайте базу данных для логов:

    ```sql
    CREATE DATABASE IF NOT EXISTS logs
    ```

    Затем создайте таблицу со схемой, соответствующей структуре ваших логов. В приведённом ниже примере используется классический формат access-логов Nginx:

    ```sql
    CREATE TABLE logs.nginx_logs
    (
        `time_local` DateTime,
        `remote_addr` IPv4,
        `remote_user` LowCardinality(String),
        `request` String,
        `status` UInt16,
        `body_bytes_sent` UInt64,
        `http_referer` String,
        `http_user_agent` String,
        `http_x_forwarded_for` LowCardinality(String),
        `request_time` Float32,
        `upstream_response_time` Float32,
        `http_host` String
    )
    ENGINE = MergeTree
    ORDER BY (toStartOfMinute(time_local), status, remote_addr);
    ```

    Ваша таблица должна соответствовать результирующей схеме, создаваемой Vector. При необходимости скорректируйте схему под ваши данные, следуя [рекомендуемым практикам по выбору схемы](/docs/best-practices/select-data-types).

    Настоятельно рекомендуется разобраться, как работают [Primary keys](/docs/primary-indexes) в ClickHouse, и выбрать ключ сортировки на основе ваших сценариев доступа. См. также рекомендации [специфичные для ClickStack](/use-cases/observability/clickstack/performance_tuning#choosing-a-primary-key) по выбору первичного ключа.

    После создания таблицы скопируйте показанный фрагмент конфигурации. Скорректируйте `input`, чтобы он использовал ваши существующие пайплайны, а также целевую таблицу и базу данных при необходимости. Учетные данные будут предзаполнены.

    <Image img={vector_config} size="lg" alt="Конфигурация Vector" />

    Для получения дополнительных примеров приёма данных с помощью Vector см. [&quot;Ingesting with Vector&quot;](/use-cases/observability/clickstack/ingesting-data/vector) или [документацию по приёмнику ClickHouse для Vector](https://vector.dev/docs/reference/configuration/sinks/clickhouse/) для расширенных возможностей настройки.

    <br />
  </TabItem>
</Tabs>