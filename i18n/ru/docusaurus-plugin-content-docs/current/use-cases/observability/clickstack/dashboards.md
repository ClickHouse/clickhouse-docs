---
slug: /use-cases/observability/clickstack/dashboards
title: "Визуализация и панели мониторинга с ClickStack"
sidebar_label: "Панели мониторинга"
pagination_prev: null
pagination_next: null
description: "Визуализация и панели мониторинга с ClickStack"
doc_type: "guide"
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

ClickStack поддерживает визуализацию событий с встроенной поддержкой построения графиков в HyperDX. Эти графики можно добавлять на дашборды и делиться ими с другими пользователями.

Визуализации можно создавать на основе трассировок, метрик, логов или любых широких схем событий, определённых пользователем.


## Создание визуализаций {#creating-visualizations}

Интерфейс **Chart Explorer** в HyperDX позволяет пользователям визуализировать метрики, трассировки и логи с течением времени, упрощая создание быстрых визуализаций для анализа данных. Этот же интерфейс используется при создании дашбордов. В следующем разделе описывается процесс создания визуализации с помощью Chart Explorer.

Каждая визуализация начинается с выбора **источника данных**, затем **метрики**, с необязательными **выражениями фильтрации** и полями **группировки**. Концептуально визуализации в HyperDX соответствуют SQL-запросу `GROUP BY` — пользователи определяют метрики для агрегации по выбранным измерениям.

Например, можно построить график количества ошибок (`count()`), сгруппированных по имени сервиса.

В приведенных ниже примерах используется удаленный набор данных, доступный по адресу [sql.clickhouse.com](https://sql.clickhouse.com), описанный в руководстве ["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data). **Пользователи также могут воспроизвести эти примеры, посетив [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com).**

<VerticalStepper headerLevel="h3">

### Переход к Chart Explorer {#navigate-chart-explorer}

Выберите `Chart Explorer` в левом меню.

<Image img={visualization_1} alt='Chart Explorer' size='lg' />

### Создание визуализации {#create-visualization}

В приведенном ниже примере строится график средней продолжительности запросов с течением времени для каждого имени сервиса. Для этого необходимо указать метрику, столбец (который может быть SQL-выражением) и поле агрегации.

Выберите тип визуализации `Line/Bar` в верхнем меню, затем набор данных `Traces` (или `Demo Traces`, если используется [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)). Укажите следующие значения:

- Метрика: `Average`
- Столбец: `Duration/1000`
- Условие: `<пусто>`
- Группировка: `ServiceName`
- Псевдоним: `Среднее время`

<Image img={visualization_2} alt='Simple visualization' size='lg' />

Обратите внимание, что пользователи могут фильтровать события с помощью SQL-условия `WHERE` или синтаксиса Lucene и задавать временной интервал, в котором должны визуализироваться события. Также поддерживается отображение нескольких серий данных.

Например, можно отфильтровать по сервису `frontend`, добавив фильтр `ServiceName:"frontend"`. Добавьте вторую серию для подсчета событий с течением времени с псевдонимом `Count`, нажав `Add Series`.

<Image img={visualization_3} alt='Simple visualization 2' size='lg' />

:::note
Визуализации могут быть созданы из любого источника данных — метрик, трассировок или логов. ClickStack обрабатывает все это как широкие события. Любой **числовой столбец** может быть отображен с течением времени, а **строковые**, **временные** или **числовые** столбцы могут использоваться для группировки.

Этот унифицированный подход позволяет пользователям создавать дашборды для различных типов телеметрии, используя единообразную и гибкую модель.
:::

</VerticalStepper>


## Создание дашбордов {#creating-dashboards}

Дашборды позволяют группировать связанные визуализации, давая пользователям возможность сравнивать метрики и анализировать закономерности параллельно для выявления потенциальных первопричин проблем в их системах. Дашборды могут использоваться для разовых исследований или сохраняться для постоянного мониторинга.

Глобальные фильтры можно применять на уровне дашборда, и они автоматически распространяются на все визуализации внутри него. Это обеспечивает согласованную детализацию по графикам и упрощает корреляцию событий между сервисами и типами телеметрии.

Ниже мы создадим дашборд с двумя визуализациями, используя источники данных логов и трассировок. Эти шаги можно воспроизвести на [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) или локально, подключившись к набору данных, размещённому на [sql.clickhouse.com](https://sql.clickhouse.com), как описано в руководстве ["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data).

<VerticalStepper headerLevel="h3">

### Переход к дашбордам {#navigate-dashboards}

Выберите `Dashboards` в левом меню.

<Image img={dashboard_1} alt='Создание дашборда' size='lg' />

По умолчанию дашборды являются временными для поддержки разовых исследований.

Если вы используете собственный экземпляр HyperDX, можно обеспечить возможность последующего сохранения этого дашборда, нажав `Create New Saved Dashboard`. Эта опция недоступна при использовании окружения только для чтения [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com).

### Создание визуализации – среднее время запроса по сервисам {#create-a-tile}

Выберите `Add New Tile`, чтобы открыть панель создания визуализации.

Выберите тип визуализации `Line/Bar` в верхнем меню, затем набор данных `Traces` (или `Demo Traces`, если используется [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)). Заполните следующие значения для создания графика, показывающего среднюю длительность запроса во времени по именам сервисов:

- Chart Name: `Average duration by service`
- Metric: `Average`
- Column: `Duration/1000`
- Where: `<empty>`
- Group By: `ServiceName`
- Alias: `Average Time`

Нажмите кнопку **play** перед нажатием `Save`.

<Image img={dashboard_2} alt='Создание визуализации дашборда' size='lg' />

Измените размер визуализации так, чтобы она занимала всю ширину дашборда.

<Image img={dashboard_3} alt='Дашборд с визуализациями' size='lg' />

### Создание визуализации – события во времени по сервисам {#create-a-tile-2}

Выберите `Add New Tile`, чтобы открыть панель создания визуализации.

Выберите тип визуализации `Line/Bar` в верхнем меню, затем набор данных `Logs` (или `Demo Logs`, если используется [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)). Заполните следующие значения для создания графика, показывающего количество событий во времени по именам сервисов:

- Chart Name: `Event count by service`
- Metric: `Count of Events`
- Where: `<empty>`
- Group By: `ServiceName`
- Alias: `Count of events`

Нажмите кнопку **play** перед нажатием `Save`.

<Image img={dashboard_4} alt='Визуализация дашборда 2' size='lg' />

Измените размер визуализации так, чтобы она занимала всю ширину дашборда.

<Image img={dashboard_5} alt='Дашборд с визуализациями 2' size='lg' />

### Фильтрация дашборда {#filter-dashboards}

Фильтры Lucene или SQL вместе с временным диапазоном можно применять на уровне дашборда, и они будут автоматически распространяться на все визуализации.

<Image img={dashboard_filter} alt='Дашборд с фильтрацией' size='lg' />

Для демонстрации примените фильтр Lucene `ServiceName:"frontend"` к дашборду и измените временное окно на последние 3 часа. Обратите внимание, что визуализации теперь отражают данные только от сервиса `frontend`.

Дашборд будет автоматически сохранён. Чтобы задать имя дашборда, выберите заголовок и измените его перед нажатием `Save Name`.

<Image img={dashboard_save} alt='Сохранение дашборда' size='lg' />

</VerticalStepper>


## Панели мониторинга - Редактирование визуализаций {#dashboards-editing-visualizations}

Чтобы удалить, отредактировать или дублировать визуализацию, наведите на неё курсор и используйте соответствующие кнопки.

<Image img={dashboard_edit} alt='Редактирование панели мониторинга' size='lg' />


## Дашборд — список и поиск {#dashboard-listing-search}

Дашборды доступны в меню слева. Встроенный поиск позволяет быстро найти нужный дашборд.

<Image img={dashboard_search} alt='Поиск дашборда' size='sm' />


## Дашборды — Теги {#tagging}

<Tagging />


## Предустановленные панели {#presets}

HyperDX поставляется с готовыми панелями мониторинга.

### Панель ClickHouse {#clickhouse-dashboard}

Эта панель предоставляет визуализации для мониторинга ClickHouse. Чтобы перейти к этой панели, выберите её в меню слева.

<Image img={dashboard_clickhouse} alt='Панель ClickHouse' size='lg' />

Панель использует вкладки для разделения мониторинга операций **SELECT**, **INSERT** и **инфраструктуры ClickHouse**.

:::note Требуемый доступ к системным таблицам
Эта панель выполняет запросы к [системным таблицам](/operations/system-tables) ClickHouse для получения ключевых метрик. Необходимы следующие права доступа:

`GRANT SHOW COLUMNS, SELECT(CurrentMetric_MemoryTracking, CurrentMetric_S3Requests, ProfileEvent_OSCPUVirtualTimeMicroseconds, ProfileEvent_OSReadChars, ProfileEvent_OSWriteChars, ProfileEvent_S3GetObject, ProfileEvent_S3ListObjects, ProfileEvent_S3PutObject, ProfileEvent_S3UploadPart, event_time) ON system.metric_log`

`GRANT SHOW COLUMNS, SELECT(active, database, partition, rows, table) ON system.parts`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, memory_usage, normalized_query_hash, query, query_duration_ms, query_kind, read_rows, tables, type, written_bytes, written_rows) ON system.query_log`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, hostname, metric, value) ON system.transposed_metric_log`
:::

### Панель сервисов {#services-dashboard}

Панель сервисов отображает активные в данный момент сервисы на основе данных трассировки. Для этого необходимо собрать трассировки и настроить корректный источник данных трассировки.

Имена сервисов автоматически определяются из данных трассировки. Предустановленные визуализации организованы по трём вкладкам: HTTP-сервисы, База данных и Ошибки.

Визуализации можно фильтровать с использованием синтаксиса Lucene или SQL, а временной интервал можно настроить для более детального анализа.

<Image img={dashboard_services} alt='Сервисы ClickHouse' size='lg' />

### Панель Kubernetes {#kubernetes-dashboard}

Эта панель позволяет исследовать события Kubernetes, собранные через OpenTelemetry. Она включает расширенные возможности фильтрации, позволяя фильтровать по подам (Pod), развёртываниям (Deployment), именам узлов (Node), пространствам имён (Namespace) и кластерам Kubernetes, а также выполнять текстовый поиск.

Данные Kubernetes организованы по трём вкладкам для удобной навигации: Поды, Узлы и Пространства имён.

<Image img={dashboard_kubernetes} alt='Kubernetes в ClickHouse' size='lg' />
