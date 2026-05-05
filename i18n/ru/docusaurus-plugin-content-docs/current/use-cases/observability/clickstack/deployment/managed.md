---
slug: /use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud
title: 'Управляемый'
pagination_prev: null
pagination_next: null
sidebar_position: 1
toc_max_heading_level: 2
description: 'Развертывание управляемого ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'развертывание', 'настройка', 'конфигурация', 'обсервабилити']
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';
import clickstack_ui_setup_ingestion from '@site/static/images/clickstack/clickstack-ui-setup-ingestion.png';
import read_only from '@site/static/images/clickstack/read-only-access.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import select_service from '@site/static/images/clickstack/select_service.png';
import select_source_clickstack_ui from '@site/static/images/clickstack/select-source-clickstack-ui.png';
import advanced_otel_collector_clickstack_ui from '@site/static/images/clickstack/advanced-otel-collector-clickstack-ui.png'
import otel_collector_start_clickstack_ui from '@site/static/images/clickstack/otel-collector-start-clickstack-ui.png';
import vector_config_clickstack_ui from '@site/static/images/clickstack/vector-config-clickstack-ui.png';
import clickstack_managed_ui from '@site/static/images/clickstack/getting-started/clickstack_managed_ui.png';
import JSONSupport from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';
import ExampleOTelConfig from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_config_example_otel.md';
import create_vector_datasource from '@site/static/images/clickstack/create-vector-datasource.png';
import SetupManagedIngestion from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_setup_managed_ingestion.md';
import NavigateClickStackUI from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_navigate_managed.md';
import ProviderSelection from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_select_provider.md';
import UseCaseSelector from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_select_usecase.md';
import new_service from '@site/static/images/clickstack/getting-started/new_service.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<BetaBadge />

::::note[Бета-функция]
Эта функция находится в бета-версии ClickHouse Cloud.
::::

Это **руководство предназначено для существующих пользователей ClickHouse Cloud**. Если вы новичок в ClickHouse Cloud, мы рекомендуем наше руководство [Getting Started](/use-cases/observability/clickstack/getting-started/managed) по Managed ClickStack.

В этом варианте развертывания и ClickHouse, и UI ClickStack (HyperDX) размещены в ClickHouse Cloud, что минимизирует количество компонентов, которые пользователю необходимо разворачивать и обслуживать самостоятельно.

Помимо снижения затрат на управление инфраструктурой, такой вариант развертывания обеспечивает интеграцию аутентификации с ClickHouse Cloud SSO/SAML. В отличие от самостоятельных развертываний, здесь также нет необходимости поднимать экземпляр MongoDB для хранения состояния приложения — такого как дашборды, сохранённые поисковые запросы, пользовательские настройки и алерты. Пользователи также получают следующие преимущества:

* Автоматическое масштабирование вычислительных ресурсов независимо от хранилища
* Низкая стоимость и практически неограниченный срок хранения данных на основе объектного хранилища
* Возможность независимо изолировать нагрузки на чтение и запись с помощью Warehouses
* Интегрированная аутентификация
* Автоматизированные резервные копии
* Функции безопасности и соответствия требованиям
* Бесшовные обновления

В этом режиме ингестия данных полностью остаётся на стороне пользователя. Вы можете выполнять ингестию данных в Managed ClickStack, используя собственный развернутый OpenTelemetry collector, прямую ингестию из клиентских библиотек, нативные для ClickHouse табличные движки (такие как Kafka или S3), ETL-конвейеры или ClickPipes — управляемый сервис ингестии в ClickHouse Cloud. Такой подход обеспечивает самый простой и наиболее производительный способ эксплуатации ClickStack.


### Подходит для \{#suitable-for\}

Эта модель развертывания оптимальна в следующих сценариях:

1. У вас уже есть данные обсервабилити в ClickHouse Cloud, и вы хотите визуализировать их с помощью ClickStack.
2. У вас крупное развертывание обсервабилити, и вам необходима выделенная производительность и масштабируемость ClickStack, работающего поверх ClickHouse Cloud.
3. Вы уже используете ClickHouse Cloud для аналитики и хотите инструментировать свое приложение с помощью библиотек инструментирования ClickStack, отправляя данные в тот же кластер. В этом случае мы рекомендуем использовать [warehouses](/cloud/reference/warehouses) для изоляции вычислительных ресурсов для нагрузок обсервабилити.

## Этапы настройки \{#setup-steps\}

В данном руководстве предполагается, что вы уже создали сервис ClickHouse Cloud. Если вы ещё не создали сервис, следуйте руководству [Getting Started](/use-cases/observability/clickstack/getting-started/managed) для Managed ClickStack. В результате у вас будет сервис в том же состоянии, что и в этом руководстве, то есть готовый к приёму данных обсервабилити с включённым ClickStack.

<Tabs groupId="service-create-select">
  <TabItem value="создать" label="Создайте новый сервис" default>
    <br />

    <VerticalStepper headerLevel="h3">
      ### Создайте новый сервис

      На главной странице ClickHouse Cloud выберите `New service`, чтобы создать новый сервис.

      <Image img={new_service} size="lg" alt="Новый сервис" border />

      ### Укажите провайдера, регион и ресурсы

      <ProviderSelection />

      ### Настройте ингестию

      После создания сервиса убедитесь, что он выбран, и нажмите &quot;ClickStack&quot; в левом меню.

      <SetupManagedIngestion />

      ### Перейдите в пользовательский интерфейс ClickStack

      <NavigateClickStackUI />

      <br />
    </VerticalStepper>
  </TabItem>

  <TabItem value="выберите" label="Использовать существующий сервис">
    <br />

    <VerticalStepper headerLevel="h3">
      ### Выберите сервис

      На главной странице ClickHouse Cloud выберите сервис, для которого требуется включить управляемый ClickStack.

      :::important Оценка ресурсов
      Данное руководство предполагает, что вы выделили достаточные ресурсы для обработки объёма данных обсервабилити, которые планируете принимать и запрашивать с помощью ClickStack. Для оценки необходимых ресурсов обратитесь к руководству [Оценка ресурсов](/use-cases/observability/clickstack/estimating-resources).

      Если ваш сервис ClickHouse уже обслуживает существующие рабочие нагрузки, например, аналитику приложений в реальном времени, рекомендуется создать дочерний сервис с помощью [функции warehouses в ClickHouse Cloud](/cloud/reference/warehouses) для изоляции нагрузки обсервабилити. Это обеспечит бесперебойную работу существующих приложений, сохраняя при этом доступность датасетов из обоих сервисов.
      :::

      <Image img={select_service} alt="Выберите сервис" size="lg" />

      ### Перейдите в пользовательский интерфейс ClickStack

      Выберите &#39;ClickStack&#39; в меню навигации слева. Вы будете перенаправлены в интерфейс ClickStack и автоматически авторизованы на основе ваших прав доступа ClickHouse Cloud.

      Если в вашем сервисе уже существуют таблицы OpenTelemetry, они будут обнаружены автоматически, и для них будут созданы соответствующие источники данных.

      :::note Автообнаружение источников данных
      Автообнаружение использует стандартную схему таблиц OpenTelemetry, предоставляемую дистрибутивом ClickStack коллектора OpenTelemetry. Источники создаются для базы данных с наиболее полным набором таблиц. При необходимости дополнительные таблицы можно добавить как [отдельные источники данных](/use-cases/observability/clickstack/config#datasource-settings).
      :::

      При успешном автоматическом обнаружении вы будете перенаправлены в представление поиска, где сможете сразу приступить к исследованию данных.

      <Image img={clickstack_managed_ui} size="lg" alt="Интерфейс ClickStack" />

      Если этот шаг выполнен успешно, то на этом всё — всё готово 🎉, в противном случае переходите к настройке ингестии.

      ### Настройте ингестию

      Если автоматическое обнаружение завершится неудачей или у вас нет существующих таблиц, вам будет предложено настроить ингестию.

      <Image img={clickstack_ui_setup_ingestion} alt="Настройка ингестии в интерфейсе ClickStack" size="lg" />

      Выберите &quot;Start Ingestion&quot;, и вам будет предложено выбрать источник для ингестии. Управляемый ClickStack поддерживает OpenTelemetry и [Vector](https://vector.dev/) в качестве основных источников ингестии. Однако пользователи также могут отправлять данные напрямую в ClickHouse по собственной схеме, используя любую из [интеграций, поддерживаемых ClickHouse Cloud](/integrations).

      <Image img={select_source_clickstack_ui} size="lg" alt="Выбор источника — интерфейс ClickStack" border />

      :::note[Рекомендуется OpenTelemetry]
      Настоятельно рекомендуется использовать OpenTelemetry в качестве формата ингестии.
      Это обеспечивает наиболее простой и оптимизированный опыт работы с готовыми схемами, специально разработанными для эффективной работы с ClickStack.
      :::

      <Tabs groupId="ingestion-sources-existing">
        <TabItem value="open-telemetry" label="OpenTelemetry" default>
          Чтобы отправлять данные OpenTelemetry в Managed ClickStack, рекомендуется использовать OpenTelemetry Collector. Collector выступает в роли шлюза, который получает данные OpenTelemetry от ваших приложений (и других коллекторов) и пересылает их в ClickHouse Cloud.

          Если у вас ещё не запущен collector, запустите его, выполнив шаги ниже. Если у вас уже есть существующие коллекторы, также приведён пример конфигурации.

          ### Запустить collector

          Далее предполагается рекомендуемый путь использования **дистрибутива ClickStack OpenTelemetry Collector**, который включает дополнительную обработку и оптимизирован специально для ClickHouse Cloud. Если вы планируете использовать собственный OpenTelemetry Collector, см. раздел [&quot;Configure existing collectors.&quot;](#configure-existing-collectors)

          Чтобы быстро начать, скопируйте и выполните показанную команду Docker.

          <Image img={otel_collector_start_clickstack_ui} size="md" alt="OTel collector source" />

          **Измените эту команду, подставив учётные данные сервиса, которые вы сохранили при его создании.**

          :::note[Развёртывание в production]
          Хотя в этой команде используется пользователь `default` для подключения к Managed ClickStack, при [переходе в production](/use-cases/observability/clickstack/production#create-a-database-ingestion-user-managed) следует создать выделенного пользователя и изменить конфигурацию.
          :::

          Выполнение этой единственной команды запускает ClickStack collector с OTLP-эндпоинтами, доступными на портах 4317 (gRPC) и 4318 (HTTP). Если у вас уже есть инструментация и агенты OpenTelemetry, вы можете сразу начинать отправлять телеметрию на эти эндпоинты.

          ### Настроить существующие коллекторы

          Также можно настроить ваши уже существующие OpenTelemetry Collectors или использовать собственный дистрибутив collector.

          :::note[Требуется ClickHouse exporter]
          Если вы используете собственный дистрибутив, например [contrib image](https://github.com/open-telemetry/opentelemetry-collector-contrib), убедитесь, что он включает [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter).
          :::

          Для этой цели приведён пример конфигурации OpenTelemetry Collector, который использует ClickHouse exporter с соответствующими настройками и предоставляет OTLP-приёмники. Эта конфигурация соответствует интерфейсам и поведению, ожидаемым дистрибутивом ClickStack.

          <ExampleOTelConfig />

          <Image img={advanced_otel_collector_clickstack_ui} size="lg" alt="Advanced OTel collector source" />

          Для получения дополнительной информации по настройке OpenTelemetry collectors см. раздел [&quot;Ingesting with OpenTelemetry.&quot;](/use-cases/observability/clickstack/ingesting-data/opentelemetry)

          ### Запуск ингестии (необязательно)

          Если у вас уже есть приложения или инфраструктура, которые нужно инструментировать с помощью OpenTelemetry, перейдите к соответствующим руководствам по ссылкам из раздела &quot;Connect an application&quot;.

          Чтобы инструментировать приложения для сбора трассировок и логов, используйте [поддерживаемые языковые SDKs](/use-cases/observability/clickstack/sdks), которые отправляют данные в ваш OpenTelemetry Collector, выступающий шлюзом для приёма данных в Managed ClickStack.

          Логи можно [собирать с помощью OpenTelemetry Collectors](/use-cases/observability/clickstack/integrations/host-logs), работающих в режиме агента и пересылающих данные в тот же collector. Для мониторинга Kubernetes следуйте [специальному руководству](/use-cases/observability/clickstack/integrations/kubernetes). Для других интеграций см. наши [руководства по быстрому старту](/use-cases/observability/clickstack/integration-guides).

          <br />
        </TabItem>

        <TabItem value="Vector" label="Vector" default>
          [Vector](https://vector.dev) — это высокопроизводительный, независимый от поставщика конвейер данных обсервабилити, особенно популярный для приёма логов благодаря своей гибкости и низкому потреблению ресурсов.

          При использовании Vector с ClickStack пользователи сами отвечают за определение собственных схем. Эти схемы могут следовать соглашениям OpenTelemetry, но также могут быть полностью пользовательскими, представляя пользовательские структуры событий.

          :::note Требуется метка времени
          Единственное строгое требование для Managed ClickStack состоит в том, что данные должны содержать **столбец с меткой времени** (или эквивалентное поле времени), который можно задать при настройке источника данных в интерфейсе ClickStack.
          :::

          Далее предполагается, что у вас уже запущен экземпляр Vector, предварительно сконфигурированный с конвейерами приёма и доставляющий данные.

          ### Создать базу данных и таблицу

          Vector требует, чтобы таблица и схема были определены до начала ингестии данных.

          Сначала создайте базу данных. Это можно сделать через [консоль ClickHouse Cloud](/cloud/get-started/sql-console).

          Например, создайте базу данных для логов:

          ```sql
          CREATE DATABASE IF NOT EXISTS logs
          ```

          Затем создайте таблицу со схемой, соответствующей структуре ваших логов. В примере ниже предполагается классический формат access-логов Nginx:

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

          Ваша таблица должна соответствовать схеме выходных данных, формируемой Vector. При необходимости скорректируйте схему под ваши данные, следуя рекомендуемым [передовым практикам проектирования схемы](/docs/best-practices/select-data-types).

          Настоятельно рекомендуем разобраться, как работают [Primary keys](/docs/primary-indexes) в ClickHouse, и выбрать ключ упорядочивания в соответствии с вашими сценариями доступа. См. рекомендации [специфичные для ClickStack](/use-cases/observability/clickstack/performance_tuning#choosing-a-primary-key) по выбору первичного ключа.

          После создания таблицы скопируйте показанный фрагмент конфигурации. Настройте input для чтения из ваших существующих конвейеров, а также целевую таблицу и базу данных, если это требуется. Учётные данные должны быть подставлены автоматически.

          <Image img={vector_config_clickstack_ui} size="lg" alt="Конфигурация Vector" />

          Для дополнительных примеров приёма данных с помощью Vector см. [&quot;Ingesting with Vector&quot;](/use-cases/observability/clickstack/ingesting-data/vector) или [документацию по Vector ClickHouse sink](https://vector.dev/docs/reference/configuration/sinks/clickhouse/) для расширенных возможностей.

          <br />
        </TabItem>
      </Tabs>

      ### Перейдите в пользовательский интерфейс ClickStack

      После завершения настройки ингестии и начала отправки данных выберите &quot;Next&quot;.

      <Tabs groupId="datsources-sources-existing">
        <TabItem value="open-telemetry" label="OpenTelemetry" default>
          Если вы осуществили приём данных OpenTelemetry, следуя этому руководству, источники данных будут созданы автоматически, и дополнительная настройка не потребуется. Вы можете сразу начинать работу с ClickStack. Вы будете перенаправлены в интерфейс поиска с автоматически выбранным источником, чтобы вы могли немедленно начать выполнять запросы.

          <Image img={clickstack_managed_ui} size="lg" alt="Интерфейс ClickStack" />

          На этом всё — вы полностью готовы 🎉.

          <br />
        </TabItem>

        <TabItem value="vector" label="Vector" default>
          Если вы выполняли приём данных с помощью Vector или из другого источника, вам будет предложено настроить источник данных.

          <Image img={create_vector_datasource} alt="Создание источника данных — Vector" size="lg" />

          Конфигурация выше предполагает схему в стиле Nginx с использованием столбца `time_local` в качестве метки времени. По возможности это должен быть столбец метки времени, объявленный в первичном ключе. **Этот столбец является обязательным**.

          Мы также рекомендуем обновить `Default SELECT`, чтобы явно определить, какие столбцы возвращаются в представлении логов. Если доступны дополнительные поля, такие как имя сервиса, уровень логирования или столбец с телом сообщения, их также можно сконфигурировать. Отображаемый столбец метки времени также можно переопределить, если он отличается от столбца, используемого в первичном ключе таблицы и указанного выше.

          В приведённом выше примере столбец `Body` в данных отсутствует. Вместо этого он определяется с использованием SQL-выражения, которое восстанавливает строку журнала Nginx из доступных полей.

          Другие возможные варианты см. в [справочнике по конфигурации](/use-cases/observability/clickstack/config#hyperdx).

          После настройки источника нажмите &quot;Save&quot; и начните исследовать свои данные.

          <Image img={clickstack_managed_ui} size="lg" alt="Интерфейс ClickStack" />

          <br />
        </TabItem>
      </Tabs>
    </VerticalStepper>
  </TabItem>
</Tabs>

## Дополнительные задачи {#additional-tasks}

### Предоставление доступа к Managed ClickStack \{#configure-access\}

1. Перейдите к своему сервису в консоли ClickHouse Cloud
2. Откройте раздел **Settings** → **SQL Console Access**
3. Установите соответствующий уровень прав доступа для каждого пользователя:
   - **Service Admin → Full Access** — требуется для включения оповещений
   - **Service Read Only → Read Only** — может просматривать данные обсервабилити и создавать дашборды
   - **No access** — не имеет доступа к HyperDX

<Image img={read_only} alt="Права Read Only в ClickHouse Cloud" size="md"/>

:::important Для оповещений требуется доступ администратора
Чтобы включить оповещения, как минимум один пользователь с правами **Service Admin** (соответствует **Full Access** в выпадающем списке SQL Console Access) должен хотя бы один раз войти в HyperDX. При этом в базе данных создаётся выделенный пользователь, выполняющий запросы для оповещений.
:::

### Использование ClickStack с вычислительными ресурсами только для чтения \{#clickstack-read-only-compute\}

Веб-интерфейс ClickStack может полностью работать на сервисе ClickHouse Cloud только для чтения. Это рекомендуемая конфигурация, если вы хотите изолировать нагрузки на ингестию и выполнение запросов.

#### Как ClickStack выбирает вычислительные ресурсы {#how-clickstack-selects-compute}

Интерфейс ClickStack всегда подключается к сервису ClickHouse, из которого он был запущен в консоли ClickHouse Cloud.

Это означает:

* Если вы открываете ClickStack из сервиса только для чтения (read-only), все запросы, выполняемые интерфейсом ClickStack, будут выполняться на соответствующих вычислительных ресурсах только для чтения.
* Если вы открываете ClickStack из сервиса с поддержкой чтения и записи (read-write), ClickStack будет использовать связанные с ним вычислительные ресурсы.

Для обеспечения режима только для чтения (read-only) не требуется дополнительная конфигурация внутри ClickStack.

#### Рекомендуемая конфигурация {#recommended-setup}

Чтобы запустить ClickStack на вычислительных ресурсах в режиме только для чтения:

1. Создайте или выберите сервис ClickHouse Cloud в warehouse, настроенный в режиме только для чтения.
2. В консоли ClickHouse Cloud выберите этот read-only сервис.
3. Запустите ClickStack из левого навигационного меню.

После запуска пользовательский интерфейс ClickStack автоматически подключится к этому сервису только для чтения.

### Добавление дополнительных источников данных \{#adding-data-sources\}

ClickStack нативно интегрирован с OpenTelemetry, но не ограничивается только им — при необходимости вы можете использовать собственные схемы таблиц.

Ниже описано, как можно добавить дополнительные источники данных помимо тех, которые настраиваются автоматически.

#### Использование схем OpenTelemetry  {#using-otel-schemas}

Если вы используете OTel collector для создания базы данных и таблиц в ClickHouse, сохраните все значения по умолчанию в форме создания источника, заполнив поле `Table` значением `otel_logs` — для создания источника логов. Все остальные настройки должны определяться автоматически, после чего вы сможете нажать `Save New Source`.

<Image img={hyperdx_cloud_datasource} alt="Источник данных ClickHouse Cloud HyperDX" size="lg"/>

Чтобы создать источники для трейсов и метрик OTel, выберите `Создать Новый Источник` в верхнем меню.

<Image img={hyperdx_create_new_source} alt="ClickStack: создание нового источника" size="lg"/>

Здесь выберите требуемый тип источника, а затем соответствующую таблицу, например, для трейсов выберите таблицу `otel_traces`. Все настройки должны определяться автоматически.

<Image img={hyperdx_create_trace_datasource} alt="ClickStack: создание источника трейсов" size="lg"/>

:::note Корреляция источников
Обратите внимание, что разные источники данных в ClickStack — такие как логи и трейсы — можно коррелировать друг с другом. Чтобы это включить, необходима дополнительная конфигурация для каждого источника. Например, в источнике логов вы можете указать соответствующий источник трейсов и наоборот — в источнике трейсов. Подробнее см. раздел ["Коррелированные источники"](/use-cases/observability/clickstack/config#correlated-sources).
:::

#### Использование пользовательских схем {#using-custom-schemas}

Пользователи, которые хотят подключить ClickStack к существующему сервису с данными, могут настроить базу данных и таблицы соответствующим образом. Настройки будут автоматически определены, если таблицы соответствуют схемам OpenTelemetry для ClickHouse. 

При использовании собственной схемы рекомендуется создать источник Logs и убедиться, что указаны все необходимые поля — подробности см. в разделе ["Log source settings"](/use-cases/observability/clickstack/config#logs).

<JSONSupport/>

Кроме того, вам следует связаться с support@clickhouse.com, чтобы убедиться, что поддержка JSON включена в вашем сервисе ClickHouse Cloud.