---
slug: /use-cases/observability/clickstack/dashboards
title: 'Визуализации и панели мониторинга с ClickStack'
sidebar_label: 'Панели мониторинга'
pagination_prev: null
pagination_next: null
description: 'Визуализации и панели мониторинга с ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'панели мониторинга', 'визуализация', 'мониторинг', 'обсервабилити']
---

import Image from '@theme/IdealImage';
import visualization_1 from '@site/static/images/use-cases/observability/hyperdx-visualization-1.png';
import visualization_2 from '@site/static/images/use-cases/observability/hyperdx-visualization-2.png';
import visualization_3 from '@site/static/images/use-cases/observability/hyperdx-visualization-3.png';
import dashboard_1 from '@site/static/images/use-cases/observability/hyperdx-dashboard-1.png';
import dashboard_2 from '@site/static/images/use-cases/observability/hyperdx-dashboard-2.png';
import dashboard_3 from '@site/static/images/use-cases/observability/hyperdx-dashboard-3.png';
import dashboard_4 from '@site/static/images/use-cases/observability/hyperdx-dashboard-4.png';
import dashboard_5 from '@site/static/images/use-cases/observability/hyperdx-dashboard-5.png';
import dashboard_filter from '@site/static/images/use-cases/observability/hyperdx-dashboard-filter.png';
import dashboard_save from '@site/static/images/use-cases/observability/hyperdx-dashboard-save.png';
import dashboard_search from '@site/static/images/use-cases/observability/hyperdx-dashboard-search.png';
import dashboard_edit from '@site/static/images/use-cases/observability/hyperdx-dashboard-edit.png';
import dashboard_clickhouse from '@site/static/images/use-cases/observability/hyperdx-dashboard-clickhouse.png';
import dashboard_services from '@site/static/images/use-cases/observability/hyperdx-dashboard-services.png';
import dashboard_kubernetes from '@site/static/images/use-cases/observability/hyperdx-dashboard-kubernetes.png';
import edit_filters from '@site/static/images/clickstack/dashboards/edit-filters.png';
import add_filter from '@site/static/images/clickstack/dashboards/add-filter.png';
import saved_filters from '@site/static/images/clickstack/dashboards/saved-filters.png';
import filtered_dashboard from '@site/static/images/clickstack/dashboards/filtered-dashboard.png';
import filter_dropdown from '@site/static/images/clickstack/dashboards/filter-dropdown.png';
import save_filter_values from '@site/static/images/clickstack/dashboards/save-filter-values.png';
import drilldown from '@site/static/images/clickstack/dashboards/drilldown.png';
import Tagging from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_clickstack_tagging.mdx';

ClickStack поддерживает визуализацию событий и имеет встроенные средства построения графиков в ClickStack UI (HyperDX). Эти графики можно добавлять на панели мониторинга для совместного использования с другими пользователями.

Визуализации могут создаваться на основе трейсов, метрик, логов или любых пользовательски определённых широких схем событий.


## Создание визуализаций \{#creating-visualizations\}

Интерфейс **Chart Explorer** в HyperDX позволяет вам визуализировать метрики, трейсы и логи во времени, что упрощает создание быстрых визуализаций для анализа данных. Этот интерфейс также используется при создании дашбордов. В следующем разделе пошагово разбирается процесс создания визуализации с помощью Chart Explorer.

Каждая визуализация начинается с выбора **источника данных**, затем **метрики** с необязательными **фильтрами** и полями **group by**. Концептуально визуализации в HyperDX соответствуют SQL-запросу с `GROUP BY` под капотом — пользователи задают метрики для агрегации по выбранным измерениям.

:::tip Генерация графиков с помощью AI
ClickStack также поддерживает создание графиков по запросам на естественном языке с помощью функции [text-to-chart](/use-cases/observability/clickstack/text-to-chart). Опишите, что вы хотите увидеть, и ClickStack автоматически сгенерирует визуализацию.
:::

Например, можно построить график количества ошибок (`count()`) с группировкой по имени сервиса.

В примерах ниже используется удалённый набор данных, доступный по адресу [sql.clickhouse.com](https://sql.clickhouse.com), описанный в руководстве [&quot;Remote Demo Dataset&quot;](/use-cases/observability/clickstack/getting-started/remote-demo-data). **Вы также можете воспроизвести эти примеры, посетив [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com).**

<VerticalStepper headerLevel="h3">
  ### Переход к Chart Explorer

  Выберите `Chart Explorer` в левом меню.

  <Image img={visualization_1} alt="Chart Explorer" size="lg" />

  ### Создание визуализации

  В примере ниже мы строим график средней длительности запроса во времени по имени сервиса. Для этого пользователю необходимо указать метрику, столбец (который может быть SQL-выражением) и поле агрегации.

  Выберите тип визуализации `Line/Bar` в верхнем меню, затем набор данных `Traces` (или `Demo Traces`, если используется [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)). Заполните следующие значения:

  * Metric: `Average`
  * Column: `Duration/1000`
  * Where: `<empty>`
  * Group By: `ServiceName`
  * Alias: `Average Time`

  <Image img={visualization_2} alt="Простая визуализация" size="lg" />

  Обратите внимание, что вы можете фильтровать события с помощью SQL-выражения `WHERE` или синтаксиса Lucene, а также задавать интервал времени, за который должны отображаться события. Также поддерживаются несколько серий данных.

  Например, отфильтруйте сервис `frontend`, добавив фильтр `ServiceName:"frontend"`. Добавьте вторую серию для подсчёта количества событий во времени с псевдонимом `Count`, нажав `Add Series`.

  <Image img={visualization_3} alt="Простая визуализация 2" size="lg" />

  :::note
  Визуализации можно создавать из любого источника данных — метрик, трейсов или логов. ClickStack рассматривает всё это как широкие события (wide events). Любой **числовой столбец** может быть отображён во времени, а столбцы типов **string**, **date** или **numeric** могут использоваться для группировок.

  Этот унифицированный подход позволяет вам строить дашборды по всем типам телеметрии с использованием согласованной и гибкой модели.
  :::
</VerticalStepper>

## Создание панелей мониторинга

Панели мониторинга позволяют группировать связанные визуализации, давая пользователям возможность сравнивать метрики и исследовать закономерности бок о бок, чтобы выявлять потенциальные первопричины проблем в системах. Эти панели мониторинга можно использовать для разовых расследований или сохранять для постоянного мониторинга.

Глобальные фильтры могут применяться на уровне панели мониторинга и автоматически распространяются на все визуализации внутри него. Это обеспечивает единообразное детализированное исследование диаграмм и упрощает корреляцию событий между сервисами и типами телеметрии.

Ниже мы создаем панель мониторинга с двумя визуализациями, используя источники данных логов и трейсинга. Эти шаги можно воспроизвести на [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) или локально, подключившись к набору данных, размещенному на [sql.clickhouse.com](https://sql.clickhouse.com), как описано в руководстве [&quot;Remote Demo Dataset&quot;](/use-cases/observability/clickstack/getting-started/remote-demo-data).

<VerticalStepper headerLevel="h3">
  ### Переход к разделу Dashboards

  Выберите `Dashboards` в левом меню. Затем нажмите `New Dashboard`, чтобы создать временную или сохраненную панель мониторинга.

  <Image img={dashboard_1} alt="Создание панели мониторинга" size="lg" />

  ### Создание визуализации – среднее время запроса по сервисам

  Выберите `Add New Tile`, чтобы открыть панель создания визуализации.

  Выберите тип визуализации `Line/Bar` в верхнем меню, а затем набор данных `Traces` (или `Demo Traces`, если используете [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)). Заполните следующие значения, чтобы создать график, показывающий среднюю длительность запросов во времени по имени сервиса:

  * Chart Name: `Average duration by service`
  * Metric: `Average`
  * Column: `Duration/1000`
  * Where: `<empty>`
  * Group By: `ServiceName`
  * Alias: `Average Time`

  Нажмите кнопку **play** перед тем, как нажать `Save`.

  <Image img={dashboard_2} alt="Создание визуализации панели мониторинга" size="lg" />

  Измените размер визуализации так, чтобы она занимала всю ширину панели мониторинга.

  <Image img={dashboard_3} alt="Панель мониторинга с визуализациями" size="lg" />

  ### Создание визуализации – события во времени по сервисам

  Выберите `Add New Tile`, чтобы открыть панель создания визуализации.

  Выберите тип визуализации `Line/Bar` в верхнем меню, а затем набор данных `Logs` (или `Demo Logs`, если используете [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)). Заполните следующие значения, чтобы создать график, показывающий количество событий во времени по имени сервиса:

  * Chart Name: `Event count by service`
  * Metric: `Count of Events`
  * Where: `<empty>`
  * Group By: `ServiceName`
  * Alias: `Count of events`

  Нажмите кнопку **play** перед тем, как нажать `Save`.

  <Image img={dashboard_4} alt="Визуализация панели мониторинга 2" size="lg" />

  Измените размер визуализации так, чтобы она занимала всю ширину панели мониторинга.

  <Image img={dashboard_5} alt="Панель мониторинга с визуализациями 2" size="lg" />

  ### Фильтрация панели мониторинга

  Фильтры Lucene или SQL, а также диапазон времени могут применяться на уровне панели мониторинга и будут автоматически распространяться на все визуализации.

  <Image img={dashboard_filter} alt="Панель мониторинга с фильтрацией" size="lg" />

  Для демонстрации примените Lucene-фильтр `ServiceName:"frontend"` к панели мониторинга и измените окно времени на период за последние 3 часа. Обратите внимание, что визуализации теперь отражают данные только сервиса `frontend`.

  Панель мониторинга будет сохранена автоматически. Чтобы задать имя панели мониторинга, выберите заголовок и измените его, после чего нажмите `Save Name`.

  <Image img={dashboard_save} alt="Сохранение панели мониторинга" size="lg" />
</VerticalStepper>

## Панели мониторинга — редактирование визуализаций {#dashboards-editing-visualizations}

Чтобы удалить, отредактировать или продублировать визуализацию, наведите на неё курсор мыши и используйте соответствующие кнопки.

<Image img={dashboard_edit} alt="Редактирование панели мониторинга" size="lg"/>

## Панели мониторинга — список и поиск \{#creating-dashboards\}

Панели мониторинга доступны на странице панелей мониторинга. Они сгруппированы по тегам; встроенные поиск и фильтрация позволяют быстро находить нужные панели мониторинга.

Панели мониторинга можно добавлять в избранное для быстрого доступа на боковой панели и в верхней части страницы со списком. Избранное индивидуально для каждого пользователя.

<Image img={dashboard_search} alt="Поиск по панелям мониторинга" size="lg" />

## Панели мониторинга — назначение тегов {#tagging}

<Tagging />

## Пользовательские фильтры

Помимо [текстовых фильтров](#filter-dashboards), доступных на всех панелях мониторинга, сохраненные панели мониторинга поддерживают пользовательские выпадающие фильтры, которые заполняются данными из ClickHouse. Это удобные, многократно используемые элементы управления фильтрацией, позволяющие пользователям панели мониторинга фильтровать данные без ручного ввода выражений.

<Image img={filter_dropdown} alt="Выпадающий фильтр Services, показывающий доступные имена сервисов" size="lg" />

Следующие шаги показывают, как добавить пользовательский фильтр на панель мониторинга, созданную в разделе [&quot;Создание панелей мониторинга&quot;](#creating-dashboards).

<VerticalStepper headerLevel="h3">
  ### Откройте диалоговое окно Edit Filters

  Откройте сохраненную панель мониторинга и выберите **Edit Filters** на панели инструментов.

  <Image img={edit_filters} alt="Кнопка Edit Filters на панели инструментов панели мониторинга" size="lg" />

  ### Добавьте новый фильтр

  Нажмите **Add new filter**. Настройте фильтр: укажите **Name**, выберите **Data source** и введите **Filter expression** — SQL-столбец или выражение, уникальные значения которого будут заполнять выпадающий список. Затем нажмите **Save filter**.

  Например, чтобы добавить фильтр сервисов для данных трейсов, используйте `ServiceName` в качестве выражения фильтра и источник данных `Traces`. Поле &quot;Dropdown values filter&quot; необязательно и позволяет ограничить, какие значения будут отображаться в выпадающем списке.

  <Image img={add_filter} alt="Диалоговое окно Add filter с полями Name, Data source и Filter expression" size="md" />

  Модальное окно Filters показывает все настроенные фильтры для панели мониторинга. Здесь можно изменить или удалить существующие фильтры, а также добавить новые.

  <Image img={saved_filters} alt="Модальное окно Filters, показывающее настроенный фильтр Services" size="md" />

  ### Используйте фильтр

  Закройте модальное окно Filters. Новый выпадающий фильтр появится под строкой поиска. Нажмите на него, чтобы увидеть доступные значения, затем выберите одно из них, чтобы применить фильтрацию ко всем визуализациям на панели мониторинга.

  <Image img={filtered_dashboard} alt="Панель мониторинга, отфильтрованная по сервису frontend" size="lg" />

  ### (Необязательно) Сохраните значения фильтра по умолчанию

  Чтобы сохранить выбранное значение фильтра как значение по умолчанию для панели мониторинга, выберите **Save Query &amp; Filters as Default** в меню панели мониторинга. После этого панель мониторинга всегда будет открываться с примененными выбранными фильтрами. Чтобы сбросить это поведение, выберите **Remove Default Query &amp; Filters** в том же меню.

  <Image img={save_filter_values} alt="Меню панели мониторинга с параметром Save Query and Filters as Default" size="lg" />
</VerticalStepper>

:::note
Пользовательские выпадающие фильтры доступны в сохраненных панелях мониторинга. Пример такого подхода см. в [панели мониторинга Kubernetes](#kubernetes-dashboard), где есть встроенные выпадающие фильтры для пода, Развертывания, имени узла, Пространства имен и кластера.
:::

## Переход к Search через детализацию

Плитки панели мониторинга поддерживают детализацию с переходом на страницу Search. Нажмите на точку данных на визуализации, чтобы открыть контекстное меню со следующими параметрами:

* **View All Events** — переход на страницу Search, где показаны все события из выбранного временного окна.
* **Filter by group** — переход на страницу Search с фильтрацией по конкретной серии.

<Image img={drilldown} alt="Контекстное меню детализации с параметрами View All Events и Filter by group" size="lg" />

Это полезно при анализе отдельных всплесков или аномалий, замеченных на панели мониторинга: вы можете быстро перейти от агрегированного представления к лежащим в его основе отдельным событиям.

## Пресеты {#presets}

HyperDX разворачивается с преднастроенными дашбордами.

### Дашборд ClickHouse {#clickhouse-dashboard}

Этот дашборд содержит визуализации для мониторинга ClickHouse. Чтобы перейти к этому дашборду, выберите его в левом меню.

<Image img={dashboard_clickhouse} alt="Дашборд ClickHouse" size="lg"/>

В этом дашборде используются вкладки для раздельного мониторинга **Selects**, **Inserts** и **ClickHouse Infrastructure**.

:::note Необходимый доступ к системным таблицам
Этот дашборд выполняет запросы к [системным таблицам](/operations/system-tables) ClickHouse для отображения ключевых метрик. Требуются следующие привилегии:

`GRANT SHOW COLUMNS, SELECT(CurrentMetric_MemoryTracking, CurrentMetric_S3Requests, ProfileEvent_OSCPUVirtualTimeMicroseconds, ProfileEvent_OSReadChars, ProfileEvent_OSWriteChars, ProfileEvent_S3GetObject, ProfileEvent_S3ListObjects, ProfileEvent_S3PutObject, ProfileEvent_S3UploadPart, event_time) ON system.metric_log`

`GRANT SHOW COLUMNS, SELECT(active, database, partition, rows, table) ON system.parts`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, memory_usage, normalized_query_hash, query, query_duration_ms, query_kind, read_rows, tables, type, written_bytes, written_rows) ON system.query_log`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, hostname, metric, value) ON system.transposed_metric_log`
:::

### Дашборд Services {#services-dashboard}

Дашборд Services отображает активные в данный момент сервисы на основе данных трейсов. Для этого пользователям необходимо собрать трейсы и настроить корректный источник данных Traces.

Имена сервисов автоматически определяются из данных трейсов, при этом используется набор преднастроенных визуализаций, сгруппированных по трём вкладкам: HTTP Services, Database и Errors.

Визуализации можно фильтровать с использованием синтаксиса Lucene или SQL, а временной интервал можно изменять для более детального анализа.

<Image img={dashboard_services} alt="Сервисы ClickHouse" size="lg"/>

### Панель Kubernetes {#kubernetes-dashboard}

Эта панель позволяет вам исследовать события Kubernetes, собранные с помощью OpenTelemetry. Она предоставляет расширенные возможности фильтрации: можно отфильтровывать события по поду Kubernetes, развертыванию, имени узла, пространству имен и кластеру, а также выполнять полнотекстовый поиск.

Данные Kubernetes сгруппированы на трех вкладках для удобной навигации: Поды, Узлы и Пространства имен.

<Image img={dashboard_kubernetes} alt="ClickHouse kubernetes" size="lg"/>