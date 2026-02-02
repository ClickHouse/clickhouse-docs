---
slug: /use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud
title: 'Управляемый'
pagination_prev: null
pagination_next: null
sidebar_position: 1
description: 'Развертывание управляемого ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'развертывание', 'настройка', 'конфигурация', 'обсервабилити']
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';
import read_only from '@site/static/images/clickstack/read-only-access.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import select_service from '@site/static/images/clickstack/select_service.png';
import JSONSupport from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';
import SetupManagedIngestion from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_setup_managed_ingestion.md';
import StartManagedIngestion from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_start_managed_ingestion.md';
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
<TabItem value="select" label="Использовать существующий сервис" default>

<VerticalStepper headerLevel="h3">

### Выберите сервис \{#select-service\}

На главной странице ClickHouse Cloud выберите сервис, для которого вы хотите включить Managed ClickStack.

:::important Оценка ресурсов
В этом руководстве предполагается, что вы зарезервировали достаточные ресурсы для обработки объёма данных обсервабилити, которые вы планируете принимать и запрашивать с помощью ClickStack. Чтобы оценить необходимые ресурсы, обратитесь к [руководству по продакшн-эксплуатации](/use-cases/observability/clickstack/production#estimating-resources). 

Если ваш сервис ClickHouse уже обслуживает существующие нагрузки, такие как аналитика приложений в реальном времени, мы рекомендуем создать дочерний сервис с помощью [функции ClickHouse Cloud warehouses](/cloud/reference/warehouses), чтобы изолировать нагрузку обсервабилити. Это гарантирует, что ваши существующие приложения не будут затронуты, при этом наборы данных останутся доступными из обоих сервисов.
:::

<Image img={select_service} alt="Выбор сервиса" size="md"/>

Выберите «ClickStack» в левой панели навигации.

### Настройка ингестии \{#setup-ingestion\}

<SetupManagedIngestion/>

### Запуск ингестии \{#start-ingestion\}

<StartManagedIngestion/>

### Переход в ClickStack UI \{#navigate-to-clickstack-ui-cloud\}

<NavigateClickStackUI/>

</VerticalStepper>

</TabItem>
<TabItem value="create" label="Создать новый сервис" default>

<VerticalStepper headerLevel="h3">

### Создайте новый сервис \{#create-a-service\}

На главной странице ClickHouse Cloud выберите `New service`, чтобы создать новый сервис.

<Image img={new_service} size="md" alt="Новый сервис" border/>

### Выберите ваш сценарий использования \{#select-your-use-case\}

<UseCaseSelector/>

### Укажите провайдера, регион и объём данных \{#specify-your-data-size\}

<ProviderSelection/>

### Настройка ингестии \{#setup-ingestion-create-new\}

<SetupManagedIngestion/>

### Запуск ингестии \{#start-ingestion-create-new\}

<StartManagedIngestion/>

### Переход в ClickStack UI \{#navigate-to-clickstack-ui-cloud-create-new\}

<NavigateClickStackUI/>

</VerticalStepper>

</TabItem>
</Tabs>

## Дополнительные задачи \{#additional-tasks\}

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

### Добавление дополнительных источников данных \{#adding-data-sources\}

ClickStack нативно интегрирован с OpenTelemetry, но не ограничивается только им — при необходимости вы можете использовать собственные схемы таблиц.

Ниже описано, как можно добавить дополнительные источники данных помимо тех, которые настраиваются автоматически.

#### Использование схем OpenTelemetry  \{#using-otel-schemas\}

Если вы используете OTel collector для создания базы данных и таблиц в ClickHouse, сохраните все значения по умолчанию в форме создания источника, заполнив поле `Table` значением `otel_logs` — для создания источника логов. Все остальные настройки должны определяться автоматически, после чего вы сможете нажать `Save New Source`.

<Image img={hyperdx_cloud_datasource} alt="Источник данных ClickHouse Cloud HyperDX" size="lg"/>

Чтобы создать источники для трейсов и метрик OTel, выберите `Создать Новый Источник` в верхнем меню.

<Image img={hyperdx_create_new_source} alt="ClickStack: создание нового источника" size="lg"/>

Здесь выберите требуемый тип источника, а затем соответствующую таблицу, например, для трейсов выберите таблицу `otel_traces`. Все настройки должны определяться автоматически.

<Image img={hyperdx_create_trace_datasource} alt="ClickStack: создание источника трейсов" size="lg"/>

:::note Корреляция источников
Обратите внимание, что разные источники данных в ClickStack — такие как логи и трейсы — можно коррелировать друг с другом. Чтобы это включить, необходима дополнительная конфигурация для каждого источника. Например, в источнике логов вы можете указать соответствующий источник трейсов и наоборот — в источнике трейсов. Подробнее см. раздел ["Коррелированные источники"](/use-cases/observability/clickstack/config#correlated-sources).
:::

#### Использование пользовательских схем \{#using-custom-schemas\}

Пользователи, которые хотят подключить HyperDX к существующему сервису с данными, могут настроить базу данных и таблицы соответствующим образом. Настройки будут автоматически определены, если таблицы соответствуют схемам OpenTelemetry для ClickHouse. 

При использовании собственной схемы рекомендуется создать источник Logs и убедиться, что указаны все необходимые поля — подробности см. в разделе ["Log source settings"](/use-cases/observability/clickstack/config#logs).

<JSONSupport/>

Кроме того, вам следует связаться с support@clickhouse.com, чтобы убедиться, что поддержка JSON включена в вашем сервисе ClickHouse Cloud.