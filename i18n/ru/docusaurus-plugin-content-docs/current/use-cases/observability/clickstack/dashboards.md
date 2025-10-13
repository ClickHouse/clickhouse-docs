---
'slug': '/use-cases/observability/clickstack/dashboards'
'title': 'Визуализации и панели мониторинга с ClickStack'
'sidebar_label': 'Панели мониторинга'
'pagination_prev': null
'pagination_next': null
'description': 'Визуализации и панели мониторинга с ClickStack'
'doc_type': 'guide'
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

ClickStack поддерживает визуализацию событий с встроенной поддержкой графиков в HyperDX. Эти графики могут быть добавлены на информационные панели для обмена с другими пользователями.

Визуализации могут быть созданы на основе трасс, метрик, журналов или любых пользовательских схем широких событий.

## Создание визуализаций {#creating-visualizations}

Интерфейс **Chart Explorer** в HyperDX позволяет пользователям визуализировать метрики, трассы и журналы с течением времени, что облегчает создание быстрых визуализаций для анализа данных. Этот интерфейс также используется при создании информационных панелей. В следующем разделе описан процесс создания визуализации с использованием Chart Explorer.

Каждая визуализация начинается с выбора **источника данных**, затем **метрики**, с необязательными **выражениями фильтра** и полями **группировки**. Концептуально визуализации в HyperDX соответствуют SQL-запросу `GROUP BY` под капотом — пользователи определяют метрики для агрегации по выбранным измерениям.

Например, вы можете построить график количества ошибок (`count()`), сгруппировав по имени сервиса.

В примерах ниже мы используем удаленный набор данных, доступный на [sql.clickhouse.com](https://sql.clickhouse.com), описанный в руководстве ["Удаленный демонстрационный набор данных"](/use-cases/observability/clickstack/getting-started/remote-demo-data). **Пользователи также могут воспроизвести эти примеры, посетив [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com).**

<VerticalStepper headerLevel="h3">

### Переход к Chart Explorer {#navigate-chart-explorer}

Выберите `Chart Explorer` в левом меню.

<Image img={visualization_1} alt="Chart Explorer" size="lg"/>

### Создать визуализацию {#create-visualization}

В приведенном ниже примере мы строим график средней продолжительности запроса с течением времени по имени сервиса. Это требует от пользователя указать метрику, колонку (которая может быть SQL-выражением) и поле агрегации.

Выберите тип визуализации `Line/Bar` в верхнем меню, затем набор данных `Traces` (или `Demo Traces`, если используете [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)). Заполните следующие значения:

- Metric: `Average`  
- Column: `Duration/1000`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Average Time`

<Image img={visualization_2} alt="Simple visualization" size="lg"/>

Обратите внимание, что пользователи могут фильтровать события, используя либо SQL `WHERE` клаузу, либо синтаксис Lucene, и устанавливать временной интервал, в течение которого события должны быть визуализированы. Также поддерживаются множественные серии.

Например, отфильтруйте по сервису `frontend`, добавив фильтр `ServiceName:"frontend"`. Добавьте вторую серию для количества событий с течением времени с псевдонимом `Count`, нажав `Add Series`.

<Image img={visualization_3} alt="Simple visualization 2" size="lg"/>

:::note
Визуализации могут быть созданы из любого источника данных — метрик, трасс или журналов. ClickStack рассматривает все эти данные как широкие события. Любая **числовая колонка** может быть визуализирована с течением времени, а **строковые**, **дата** или **числовые** колонки могут использоваться для группировки.

Этот унифицированный подход позволяет пользователям строить информационные панели для всех типов телеметрии, используя последовательную и гибкую модель.
:::

</VerticalStepper>

## Создание информационных панелей {#creating-dashboards}

Информационные панели предоставляют способ группировки связанных визуализаций, позволяя пользователям сравнивать метрики и исследовать шаблоны бок о бок, чтобы выявить потенциальные коренные причины в их системах. Эти панели можно использовать для текущих расследований или сохранять для последующего мониторинга.

Глобальные фильтры могут быть применены на уровне информационной панели, автоматически распространяясь на все визуализации в этой панели. Это позволяет осуществлять согласованное углубление по графикам и упрощает корреляцию событий между сервисами и типами телеметрии.

Ниже мы создаем информационную панель с двумя визуализациями, используя источники данных журналов и трасс. Эти шаги можно воспроизвести на [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) или локально, подключившись к набору данных, размещенному на [sql.clickhouse.com](https://sql.clickhouse.com), как описано в руководстве ["Удаленный демонстрационный набор данных"](/use-cases/observability/clickstack/getting-started/remote-demo-data).

<VerticalStepper headerLevel="h3">

### Переход к информационным панелям {#navigate-dashboards}

Выберите `Dashboards` в левом меню.

<Image img={dashboard_1} alt="Create Dashboard" size="lg"/>

По умолчанию информационные панели являются временными и предназначены для поддержки текущих расследований.

Если вы используете свой собственный экземпляр HyperDX, вы можете убедиться, что эту панель можно позже сохранить, нажав `Create New Saved Dashboard`. Эта опция не будет доступна, если вы используете среду только для чтения [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com).

### Создание визуализации – среднее время запроса по сервису {#create-a-tile}

Выберите `Add New Tile`, чтобы открыть панель создания визуализации.

Выберите тип визуализации `Line/Bar` в верхнем меню, затем набор данных `Traces` (или `Demo Traces`, если используете [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)). Заполните следующие значения, чтобы создать график, показывающий среднюю продолжительность запроса с течением времени по имени сервиса:

- Chart Name: `Average duration by service`  
- Metric: `Average`  
- Column: `Duration/1000`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Average Time`

Нажмите кнопку **play** перед тем, как нажать `Save`.

<Image img={dashboard_2} alt="Create Dashboard Visualization" size="lg"/>

Измените размер визуализации, чтобы она занимала полную ширину информационной панели.

<Image img={dashboard_3} alt="Dashboard with visuals" size="lg"/>

### Создание визуализации – события с течением времени по сервису {#create-a-tile-2}

Выберите `Add New Tile`, чтобы открыть панель создания визуализации.

Выберите тип визуализации `Line/Bar` в верхнем меню, затем набор данных `Logs` (или `Demo Logs`, если используете [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)). Заполните следующие значения, чтобы создать график, показывающий количество событий с течением времени по имени сервиса:

- Chart Name: `Event count by service`  
- Metric: `Count of Events`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Count of events`

Нажмите кнопку **play** перед тем, как нажать `Save`.

<Image img={dashboard_4} alt="Dashboard Visualization 2" size="lg"/>

Измените размер визуализации, чтобы она занимала полную ширину информационной панели.

<Image img={dashboard_5} alt="Dashboard with visuals 2" size="lg"/>

### Фильтр информационной панели {#filter-dashboards}

Фильтры Lucene или SQL, а также временной диапазон могут быть применены на уровне информационной панели и автоматически распространятся на все визуализации.

<Image img={dashboard_filter} alt="Dashboard with filtering" size="lg"/>

Чтобы продемонстрировать, примените фильтр Lucene `ServiceName:"frontend"` к информационной панели и измените временное окно, чтобы охватить последние 3 часа. Обратите внимание, что визуализации теперь отображают данные только от сервиса `frontend`.

Информационная панель будет автоматически сохранена. Чтобы установить имя информационной панели, выберите заголовок и измените его перед нажатием `Save Name`. 

<Image img={dashboard_save} alt="Dashboard save" size="lg"/>

</VerticalStepper>

## Информационные панели - редактирование визуализаций {#dashboards-editing-visualizations}

Чтобы удалить, отредактировать или сделать дубликат визуализации, наведите курсор на нее и используйте соответствующие кнопки действий.

<Image img={dashboard_edit} alt="Dashboard edit" size="lg"/>

## Список и поиск информационных панелей {#dashboard-listing-search}

Информационные панели доступны из левого меню, с встроенным поиском для быстрого нахождения конкретных информационных панелей.

<Image img={dashboard_search} alt="Dashboard search" size="sm"/>

## Предустановки {#presets}

HyperDX поставляется с готовыми информационными панелями.

### Информационная панель ClickHouse {#clickhouse-dashboard}

Эта панель предоставляет визуализации для мониторинга ClickHouse. Чтобы перейти к этой панели, выберите ее в левом меню.

<Image img={dashboard_clickhouse} alt="ClickHouse dashboard" size="lg"/>

Эта панель использует вкладки для разделения мониторинга **Selects**, **Inserts** и **ClickHouse Infrastructure**.

:::note Требуется доступ к системным таблицам
Эта панель запрашивает [системные таблицы](/operations/system-tables) ClickHouse для отображения ключевых метрик. Для этого требуются следующие права:

`GRANT SHOW COLUMNS, SELECT(CurrentMetric_MemoryTracking, CurrentMetric_S3Requests, ProfileEvent_OSCPUVirtualTimeMicroseconds, ProfileEvent_OSReadChars, ProfileEvent_OSWriteChars, ProfileEvent_S3GetObject, ProfileEvent_S3ListObjects, ProfileEvent_S3PutObject, ProfileEvent_S3UploadPart, event_time) ON system.metric_log`

`GRANT SHOW COLUMNS, SELECT(active, database, partition, rows, table) ON system.parts`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, memory_usage, normalized_query_hash, query, query_duration_ms, query_kind, read_rows, tables, type, written_bytes, written_rows) ON system.query_log`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, hostname, metric, value) ON system.transposed_metric_log`
:::

### Информационная панель Services {#services-dashboard}

Информационная панель Services отображает все активные в данный момент сервисы на основе данных трасс. Это требует, чтобы пользователи собрали трассы и настроили действующий источник данных Traces.

Имена сервисов автоматически определяются из данных трасс, с рядом заранее подготовленных визуализаций, организованных по трем вкладкам: HTTP Services, Database и Errors.

Визуализации могут фильтроваться с использованием синтаксиса Lucene или SQL, а временное окно можно настраивать для более точного анализа.

<Image img={dashboard_services} alt="ClickHouse services" size="lg"/>

### Информационная панель Kubernetes {#kubernetes-dashboard}

Эта панель позволяет пользователям исследовать события Kubernetes, собранные через OpenTelemetry. Она включает в себя расширенные опции фильтрации, позволяя пользователям фильтровать по Pod Kubernetes, Deployment, имени узла, Namespace и кластеру, а также выполнять поиски по свободному тексту.

Данные Kubernetes организованы по трем вкладкам для удобства навигации: Pods, Nodes и Namespaces.

<Image img={dashboard_kubernetes} alt="ClickHouse kubernetes" size="lg"/>