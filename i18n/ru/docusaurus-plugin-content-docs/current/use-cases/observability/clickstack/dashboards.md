---
slug: /use-cases/observability/clickstack/dashboards
title: 'Визуализации и дашборды с ClickStack'
sidebar_label: 'Дашборды'
pagination_prev: null
pagination_next: null
description: 'Визуализации и дашборды с ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'дашборды', 'визуализация', 'мониторинг', 'наблюдаемость']
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
import Tagging from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_clickstack_tagging.mdx';

ClickStack поддерживает визуализацию событий и имеет встроенные средства построения графиков в HyperDX. Эти графики можно добавлять на дашборды для совместного использования с другими пользователями.

Визуализации могут создаваться на основе трассировок, метрик, логов или любых пользовательски определённых широких схем событий.


## Создание визуализаций {#creating-visualizations}

Интерфейс **Chart Explorer** в HyperDX позволяет визуализировать метрики, трейсы и логи во времени, что упрощает создание быстрых визуализаций для анализа данных. Этот интерфейс также используется при создании дашбордов. В следующем разделе пошагово разбирается процесс создания визуализации с помощью Chart Explorer.

Каждая визуализация начинается с выбора **источника данных**, затем **метрики** с необязательными **фильтрами** и полями **group by**. Концептуально визуализации в HyperDX соответствуют SQL-запросу с `GROUP BY` под капотом — пользователи задают метрики для агрегации по выбранным измерениям.

Например, можно построить график количества ошибок (`count()`) с группировкой по имени сервиса.

В примерах ниже используется удалённый набор данных, доступный по адресу [sql.clickhouse.com](https://sql.clickhouse.com), описанный в руководстве ["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data). **Пользователи также могут воспроизвести эти примеры, посетив [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com).**

<VerticalStepper headerLevel="h3">

### Переход к Chart Explorer {#navigate-chart-explorer}

Выберите `Chart Explorer` в левом меню.

<Image img={visualization_1} alt="Chart Explorer" size="lg"/>

### Создание визуализации {#create-visualization}

В примере ниже мы строим график средней длительности запроса во времени по имени сервиса. Для этого пользователю необходимо указать метрику, столбец (который может быть SQL-выражением) и поле агрегации.

Выберите тип визуализации `Line/Bar` в верхнем меню, затем набор данных `Traces` (или `Demo Traces`, если используется [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)). Заполните следующие значения:

- Metric: `Average`  
- Column: `Duration/1000`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Average Time`

<Image img={visualization_2} alt="Простая визуализация" size="lg"/>

Обратите внимание, что пользователи могут фильтровать события с помощью SQL-выражения `WHERE` или синтаксиса Lucene, а также задавать интервал времени, за который должны отображаться события. Также поддерживаются несколько серий данных.

Например, отфильтруйте сервис `frontend`, добавив фильтр `ServiceName:"frontend"`. Добавьте вторую серию для подсчёта количества событий во времени с псевдонимом `Count`, нажав `Add Series`.

<Image img={visualization_3} alt="Простая визуализация 2" size="lg"/>

:::note
Визуализации можно создавать из любого источника данных — метрик, трейсов или логов. ClickStack рассматривает всё это как широкие события (wide events). Любой **числовой столбец** может быть отображён во времени, а столбцы типов **string**, **date** или **numeric** могут использоваться для группировок.

Этот унифицированный подход позволяет пользователям строить дашборды по всем типам телеметрии с использованием согласованной и гибкой модели.
:::

</VerticalStepper>

## Создание дашбордов {#creating-dashboards}

Дашборды позволяют группировать связанные визуализации, давая пользователям возможность сравнивать метрики и исследовать закономерности бок о бок, чтобы выявлять потенциальные первопричины проблем в системах. Эти дашборды можно использовать для разовых расследований или сохранять для постоянного мониторинга.

Глобальные фильтры могут применяться на уровне дашборда и автоматически распространяются на все визуализации внутри него. Это обеспечивает единообразное детализированное исследование диаграмм и упрощает корреляцию событий между сервисами и типами телеметрии.

Ниже мы создаем дашборд с двумя визуализациями, используя источники данных логов и трейсинга. Эти шаги можно воспроизвести на [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) или локально, подключившись к набору данных, размещенному на [sql.clickhouse.com](https://sql.clickhouse.com), как описано в руководстве ["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data).

<VerticalStepper headerLevel="h3">

### Переход к разделу Dashboards {#navigate-dashboards}

Выберите `Dashboards` в левом меню.

<Image img={dashboard_1} alt="Создание дашборда" size="lg"/>

По умолчанию дашборды являются временными и предназначены для разовых расследований. 

Если вы используете собственный инстанс HyperDX, вы можете сделать так, чтобы этот дашборд можно было сохранить, нажав `Create New Saved Dashboard`. Эта опция будет недоступна при использовании режима только для чтения [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com).

### Создание визуализации – среднее время запроса по сервисам {#create-a-tile}

Выберите `Add New Tile`, чтобы открыть панель создания визуализации.

Выберите тип визуализации `Line/Bar` в верхнем меню, а затем набор данных `Traces` (или `Demo Traces`, если используете [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)). Заполните следующие значения, чтобы создать график, показывающий среднюю длительность запросов во времени по имени сервиса:

- Chart Name: `Average duration by service`  
- Metric: `Average`  
- Column: `Duration/1000`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Average Time`

Нажмите кнопку **play** перед тем, как нажать `Save`.

<Image img={dashboard_2} alt="Создание визуализации дашборда" size="lg"/>

Измените размер визуализации так, чтобы она занимала всю ширину дашборда.

<Image img={dashboard_3} alt="Дашборд с визуализациями" size="lg"/>

### Создание визуализации – события во времени по сервисам {#create-a-tile-2}

Выберите `Add New Tile`, чтобы открыть панель создания визуализации.

Выберите тип визуализации `Line/Bar` в верхнем меню, а затем набор данных `Logs` (или `Demo Logs`, если используете [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)). Заполните следующие значения, чтобы создать график, показывающий количество событий во времени по имени сервиса:

- Chart Name: `Event count by service`  
- Metric: `Count of Events`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Count of events`

Нажмите кнопку **play** перед тем, как нажать `Save`.

<Image img={dashboard_4} alt="Визуализация дашборда 2" size="lg"/>

Измените размер визуализации так, чтобы она занимала всю ширину дашборда.

<Image img={dashboard_5} alt="Дашборд с визуализациями 2" size="lg"/>

### Фильтрация дашборда {#filter-dashboards}

Фильтры Lucene или SQL, а также диапазон времени могут применяться на уровне дашборда и будут автоматически распространяться на все визуализации.

<Image img={dashboard_filter} alt="Дашборд с фильтрацией" size="lg"/>

Для демонстрации примените Lucene-фильтр `ServiceName:"frontend"` к дашборду и измените окно времени на период за последние 3 часа. Обратите внимание, что визуализации теперь отражают данные только сервиса `frontend`.

Дашборд будет сохранен автоматически. Чтобы задать имя дашборда, выберите заголовок и измените его, после чего нажмите `Save Name`. 

<Image img={dashboard_save} alt="Сохранение дашборда" size="lg"/>

</VerticalStepper>

## Панели мониторинга — редактирование визуализаций {#dashboards-editing-visualizations}

Чтобы удалить, отредактировать или продублировать визуализацию, наведите на неё курсор мыши и используйте соответствующие кнопки.

<Image img={dashboard_edit} alt="Редактирование панели мониторинга" size="lg"/>

## Дашборды — список и поиск {#dashboard-listing-search}

Дашборды доступны из меню слева; встроенный поиск позволяет быстро находить нужные дашборды.

<Image img={dashboard_search} alt="Поиск по дашбордам" size="sm"/>

## Панели мониторинга — назначение тегов {#tagging}

<Tagging />

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

Эта панель позволяет пользователям исследовать события Kubernetes, собранные с помощью OpenTelemetry. Она предоставляет расширенные возможности фильтрации: можно отфильтровывать события по поду Kubernetes, развертыванию, имени узла, пространству имен и кластеру, а также выполнять полнотекстовый поиск.

Данные Kubernetes сгруппированы на трех вкладках для удобной навигации: Поды, Узлы и Пространства имен.

<Image img={dashboard_kubernetes} alt="ClickHouse kubernetes" size="lg"/>