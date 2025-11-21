---
slug: /use-cases/observability/clickstack/dashboards
title: 'Визуализации и дашборды в ClickStack'
sidebar_label: 'Дашборды'
pagination_prev: null
pagination_next: null
description: 'Визуализации и дашборды в ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'dashboards', 'visualization', 'monitoring', 'observability']
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
import Tagging from '@site/docs/_snippets/_clickstack_tagging.mdx';

ClickStack поддерживает визуализацию событий и включает встроенные средства построения графиков в HyperDX. Эти графики можно добавлять на дашборды и делиться ими с другими пользователями.

Визуализации могут строиться по трейсам, метрикам, логам или любым пользовательским широким схемам событий.


## Создание визуализаций {#creating-visualizations}

Интерфейс **Chart Explorer** в HyperDX позволяет пользователям визуализировать метрики, трассировки и логи с течением времени, упрощая создание быстрых визуализаций для анализа данных. Этот же интерфейс используется при создании дашбордов. В следующем разделе описывается процесс создания визуализации с помощью Chart Explorer.

Каждая визуализация начинается с выбора **источника данных**, затем **метрики**, с необязательными **выражениями фильтрации** и полями **группировки**. Концептуально визуализации в HyperDX соответствуют SQL-запросу `GROUP BY` — пользователи определяют метрики для агрегирования по выбранным измерениям.

Например, можно построить график количества ошибок (`count()`), сгруппированных по имени сервиса.

В приведенных ниже примерах используется удаленный набор данных, доступный по адресу [sql.clickhouse.com](https://sql.clickhouse.com), описанный в руководстве ["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data). **Пользователи также могут воспроизвести эти примеры, посетив [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com).**

<VerticalStepper headerLevel="h3">

### Переход к Chart Explorer {#navigate-chart-explorer}

Выберите `Chart Explorer` в левом меню.

<Image img={visualization_1} alt='Chart Explorer' size='lg' />

### Создание визуализации {#create-visualization}

В приведенном ниже примере строится график средней продолжительности запросов с течением времени для каждого имени сервиса. Для этого необходимо указать метрику, столбец (который может быть SQL-выражением) и поле агрегирования.

Выберите тип визуализации `Line/Bar` в верхнем меню, затем набор данных `Traces` (или `Demo Traces`, если используется [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)). Укажите следующие значения:

- Metric: `Average`
- Column: `Duration/1000`
- Where: `<empty>`
- Group By: `ServiceName`
- Alias: `Average Time`

<Image img={visualization_2} alt='Простая визуализация' size='lg' />

Обратите внимание, что пользователи могут фильтровать события с помощью SQL-выражения `WHERE` или синтаксиса Lucene и задавать временной интервал, в котором должны визуализироваться события. Также поддерживается отображение нескольких серий данных.

Например, чтобы отфильтровать по сервису `frontend`, добавьте фильтр `ServiceName:"frontend"`. Добавьте вторую серию для подсчета событий с течением времени с псевдонимом `Count`, нажав `Add Series`.

<Image img={visualization_3} alt='Простая визуализация 2' size='lg' />

:::note
Визуализации могут быть созданы из любого источника данных — метрик, трассировок или логов. ClickStack обрабатывает все это как широкие события. Любой **числовой столбец** может быть отображен на графике с течением времени, а столбцы типа **string**, **date** или **numeric** могут использоваться для группировки.

Этот унифицированный подход позволяет пользователям создавать дашборды для различных типов телеметрии, используя единообразную и гибкую модель.
:::

</VerticalStepper>


## Создание дашбордов {#creating-dashboards}

Дашборды позволяют группировать связанные визуализации, давая пользователям возможность сравнивать метрики и анализировать закономерности параллельно для выявления потенциальных первопричин проблем в их системах. Эти дашборды могут использоваться для разовых исследований или сохраняться для постоянного мониторинга.

Глобальные фильтры можно применять на уровне дашборда, и они автоматически распространяются на все визуализации внутри этого дашборда. Это обеспечивает согласованную детализацию по графикам и упрощает корреляцию событий между сервисами и типами телеметрии.

Ниже мы создадим дашборд с двумя визуализациями, используя источники данных логов и трассировок. Эти шаги можно воспроизвести на [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) или локально, подключившись к набору данных, размещённому на [sql.clickhouse.com](https://sql.clickhouse.com), как описано в руководстве ["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data).

<VerticalStepper headerLevel="h3">

### Переход к дашбордам {#navigate-dashboards}

Выберите `Dashboards` в левом меню.

<Image img={dashboard_1} alt='Create Dashboard' size='lg' />

По умолчанию дашборды являются временными для поддержки разовых исследований.

Если вы используете собственный экземпляр HyperDX, вы можете обеспечить возможность последующего сохранения этого дашборда, нажав `Create New Saved Dashboard`. Эта опция будет недоступна при использовании среды только для чтения [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com).

### Создание визуализации – среднее время запроса по сервисам {#create-a-tile}

Выберите `Add New Tile`, чтобы открыть панель создания визуализации.

Выберите тип визуализации `Line/Bar` в верхнем меню, затем набор данных `Traces` (или `Demo Traces` при использовании [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)). Заполните следующие значения для создания графика, показывающего среднюю длительность запроса во времени по имени сервиса:

- Chart Name: `Average duration by service`
- Metric: `Average`
- Column: `Duration/1000`
- Where: `<empty>`
- Group By: `ServiceName`
- Alias: `Average Time`

Нажмите кнопку **play** перед нажатием `Save`.

<Image img={dashboard_2} alt='Create Dashboard Visualization' size='lg' />

Измените размер визуализации так, чтобы она занимала всю ширину дашборда.

<Image img={dashboard_3} alt='Dashboard with visuals' size='lg' />

### Создание визуализации – события во времени по сервисам {#create-a-tile-2}

Выберите `Add New Tile`, чтобы открыть панель создания визуализации.

Выберите тип визуализации `Line/Bar` в верхнем меню, затем набор данных `Logs` (или `Demo Logs` при использовании [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)). Заполните следующие значения для создания графика, показывающего количество событий во времени по имени сервиса:

- Chart Name: `Event count by service`
- Metric: `Count of Events`
- Where: `<empty>`
- Group By: `ServiceName`
- Alias: `Count of events`

Нажмите кнопку **play** перед нажатием `Save`.

<Image img={dashboard_4} alt='Dashboard Visualization 2' size='lg' />

Измените размер визуализации так, чтобы она занимала всю ширину дашборда.

<Image img={dashboard_5} alt='Dashboard with visuals 2' size='lg' />

### Фильтрация дашборда {#filter-dashboards}

Фильтры Lucene или SQL вместе с временным диапазоном можно применять на уровне дашборда, и они будут автоматически распространяться на все визуализации.

<Image img={dashboard_filter} alt='Dashboard with filtering' size='lg' />

Для демонстрации примените фильтр Lucene `ServiceName:"frontend"` к дашборду и измените временное окно на последние 3 часа. Обратите внимание, как визуализации теперь отражают данные только от сервиса `frontend`.

Дашборд будет автоматически сохранён. Чтобы задать имя дашборда, выберите заголовок и измените его перед нажатием `Save Name`.

<Image img={dashboard_save} alt='Dashboard save' size='lg' />

</VerticalStepper>


## Панели мониторинга - Редактирование визуализаций {#dashboards-editing-visualizations}

Чтобы удалить, отредактировать или дублировать визуализацию, наведите на неё курсор и используйте соответствующие кнопки.

<Image img={dashboard_edit} alt='Редактирование панели мониторинга' size='lg' />


## Панель управления - Список и поиск {#dashboard-listing-search}

Панели управления доступны в меню слева, встроенный поиск позволяет быстро найти нужную панель.

<Image img={dashboard_search} alt='Поиск панели управления' size='sm' />


## Панели мониторинга — Теги {#tagging}

<Tagging />


## Предустановки {#presets}

HyperDX развертывается с готовыми панелями мониторинга.

### Панель мониторинга ClickHouse {#clickhouse-dashboard}

Эта панель предоставляет визуализации для мониторинга ClickHouse. Чтобы перейти к этой панели, выберите её в меню слева.

<Image img={dashboard_clickhouse} alt='Панель мониторинга ClickHouse' size='lg' />

Эта панель использует вкладки для разделения мониторинга **выборок (Selects)**, **вставок (Inserts)** и **инфраструктуры ClickHouse (ClickHouse Infrastructure)**.

:::note Требуемый доступ к системным таблицам
Эта панель запрашивает [системные таблицы](/operations/system-tables) ClickHouse для получения ключевых метрик. Требуются следующие права доступа:

`GRANT SHOW COLUMNS, SELECT(CurrentMetric_MemoryTracking, CurrentMetric_S3Requests, ProfileEvent_OSCPUVirtualTimeMicroseconds, ProfileEvent_OSReadChars, ProfileEvent_OSWriteChars, ProfileEvent_S3GetObject, ProfileEvent_S3ListObjects, ProfileEvent_S3PutObject, ProfileEvent_S3UploadPart, event_time) ON system.metric_log`

`GRANT SHOW COLUMNS, SELECT(active, database, partition, rows, table) ON system.parts`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, memory_usage, normalized_query_hash, query, query_duration_ms, query_kind, read_rows, tables, type, written_bytes, written_rows) ON system.query_log`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, hostname, metric, value) ON system.transposed_metric_log`
:::

### Панель мониторинга сервисов {#services-dashboard}

Панель мониторинга сервисов отображает активные в данный момент сервисы на основе данных трассировки. Для этого необходимо, чтобы пользователи собрали трассировки и настроили корректный источник данных трассировки.

Имена сервисов автоматически определяются из данных трассировки. Предустановленные визуализации организованы на трёх вкладках: HTTP-сервисы (HTTP Services), База данных (Database) и Ошибки (Errors).

Визуализации можно фильтровать с использованием синтаксиса Lucene или SQL, а временное окно можно настроить для целенаправленного анализа.

<Image img={dashboard_services} alt='Сервисы ClickHouse' size='lg' />

### Панель мониторинга Kubernetes {#kubernetes-dashboard}

Эта панель позволяет пользователям исследовать события Kubernetes, собранные через OpenTelemetry. Она включает расширенные параметры фильтрации, позволяя пользователям фильтровать по поду Kubernetes (Pod), развертыванию (Deployment), имени узла (Node), пространству имён (Namespace) и кластеру (Cluster), а также выполнять текстовый поиск.

Данные Kubernetes организованы на трёх вкладках для удобной навигации: Поды (Pods), Узлы (Nodes) и Пространства имён (Namespaces).

<Image img={dashboard_kubernetes} alt='Kubernetes ClickHouse' size='lg' />
