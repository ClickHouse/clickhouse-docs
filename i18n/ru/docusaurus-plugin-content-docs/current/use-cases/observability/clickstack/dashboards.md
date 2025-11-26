---
slug: /use-cases/observability/clickstack/dashboards
title: 'Визуализации и панели мониторинга в ClickStack'
sidebar_label: 'Панели мониторинга'
pagination_prev: null
pagination_next: null
description: 'Визуализации и панели мониторинга в ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'дашборды', 'панели мониторинга', 'визуализация', 'мониторинг', 'наблюдаемость']
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

Визуализации можно создавать на основе трассировок, метрик, логов или любых пользовательских схем «широких» событий.


## Создание визуализаций {#creating-visualizations}

Интерфейс **Chart Explorer** в HyperDX позволяет визуализировать метрики, трейсы и логи во времени, упрощая создание быстрых визуализаций для анализа данных. Этот интерфейс также используется при создании дашбордов. В следующем разделе пошагово рассматривается процесс создания визуализации с помощью Chart Explorer.

Каждая визуализация начинается с выбора **источника данных**, затем **метрики**, с необязательными **фильтрами** и полями **group by**. Концептуально визуализации в HyperDX соответствуют SQL-запросу с `GROUP BY` — пользователи определяют метрики для агрегации по выбранным измерениям.

Например, вы можете построить график количества ошибок (`count()`), сгруппированного по имени сервиса.

В примерах ниже мы используем удалённый набор данных, доступный на [sql.clickhouse.com](https://sql.clickhouse.com), описанный в руководстве «[Remote Demo Dataset](/use-cases/observability/clickstack/getting-started/remote-demo-data)». **Пользователи также могут воспроизвести эти примеры, посетив [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com).**

<VerticalStepper headerLevel="h3">

### Переход к Chart Explorer {#navigate-chart-explorer}

Выберите `Chart Explorer` в левом меню.

<Image img={visualization_1} alt="Chart Explorer" size="lg"/>

### Создание визуализации {#create-visualization}

В примере ниже мы строим график средней длительности запроса во времени по имени сервиса. Для этого необходимо указать метрику, столбец (который может быть SQL-выражением) и поле агрегации.

Выберите тип визуализации `Line/Bar` в верхнем меню, затем набор данных `Traces` (или `Demo Traces`, если вы используете [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)). Задайте следующие значения:

- Metric: `Average`  
- Column: `Duration/1000`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Average Time`

<Image img={visualization_2} alt="Простая визуализация" size="lg"/>

Обратите внимание, что пользователи могут фильтровать события, используя либо SQL-условие `WHERE`, либо синтаксис Lucene, а также задавать временной диапазон, за который должны отображаться события. Поддерживается также несколько рядов данных (series).

Например, отфильтруйте сервис `frontend`, добавив фильтр `ServiceName:"frontend"`. Добавьте второй ряд для количества событий во времени с псевдонимом `Count`, нажав `Add Series`.

<Image img={visualization_3} alt="Простая визуализация 2" size="lg"/>

:::note
Визуализации могут быть созданы из любого источника данных — метрик, трейсов или логов. ClickStack рассматривает всё это как широкие события (wide events). Любой **числовой столбец** может быть отображён во времени, а **строковые**, **датовые** или **числовые** столбцы можно использовать для группировок.

Такой унифицированный подход позволяет пользователям строить дашборды по разным видам телеметрии, используя единую гибкую модель.
:::

</VerticalStepper>



## Создание дашбордов {#creating-dashboards}

Дашборды позволяют группировать связанные визуализации, давая пользователям возможность сравнивать метрики и исследовать шаблоны бок о бок, чтобы выявлять потенциальные первопричины проблем в их системах. Эти дашборды можно использовать для разовых расследований или сохранять для постоянного мониторинга.

Глобальные фильтры могут применяться на уровне дашборда и автоматически распространяются на все визуализации внутри него. Это обеспечивает единообразный детальный анализ (drill-down) по графикам и упрощает корреляцию событий между сервисами и типами телеметрии.

Ниже мы создадим дашборд с двумя визуализациями, используя источники данных логов и трейсов. Эти шаги можно воспроизвести на [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) или локально, подключившись к набору данных, размещённому на [sql.clickhouse.com](https://sql.clickhouse.com), как описано в руководстве ["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data).

<VerticalStepper headerLevel="h3">

### Переход к дашбордам {#navigate-dashboards}

Выберите `Dashboards` в левом меню.

<Image img={dashboard_1} alt="Создание дашборда" size="lg"/>

По умолчанию дашборды являются временными, чтобы поддерживать разовые расследования. 

Если вы используете собственный экземпляр HyperDX, вы можете сделать так, чтобы этот дашборд позже можно было сохранить, нажав `Create New Saved Dashboard`. Эта опция будет недоступна при использовании режима только для чтения [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com).

### Создание визуализации – среднее время запроса по сервису {#create-a-tile}

Выберите `Add New Tile`, чтобы открыть панель создания визуализации.

Выберите тип визуализации `Line/Bar` в верхнем меню, затем набор данных `Traces` (или `Demo Traces` при использовании [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)). Заполните следующие значения, чтобы создать график, показывающий среднюю продолжительность запроса во времени для каждого сервиса:

- Chart Name: `Average duration by service`  
- Metric: `Average`  
- Column: `Duration/1000`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Average Time`

Нажмите кнопку **play** перед нажатием `Save`.

<Image img={dashboard_2} alt="Создание визуализации дашборда" size="lg"/>

Измените размер визуализации так, чтобы она занимала всю ширину дашборда.

<Image img={dashboard_3} alt="Дашборд с визуализациями" size="lg"/>

### Создание визуализации – события во времени по сервису {#create-a-tile-2}

Выберите `Add New Tile`, чтобы открыть панель создания визуализации.

Выберите тип визуализации `Line/Bar` в верхнем меню, затем набор данных `Logs` (или `Demo Logs` при использовании [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)). Заполните следующие значения, чтобы создать график, показывающий количество событий во времени для каждого сервиса:

- Chart Name: `Event count by service`  
- Metric: `Count of Events`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Count of events`

Нажмите кнопку **play** перед нажатием `Save`.

<Image img={dashboard_4} alt="Визуализация дашборда 2" size="lg"/>

Измените размер визуализации так, чтобы она занимала всю ширину дашборда.

<Image img={dashboard_5} alt="Дашборд с визуализациями 2" size="lg"/>

### Фильтрация дашборда {#filter-dashboards}

Фильтры Lucene или SQL вместе с интервалом времени могут применяться на уровне дашборда и будут автоматически распространяться на все визуализации.

<Image img={dashboard_filter} alt="Дашборд с фильтрацией" size="lg"/>

Для демонстрации примените Lucene-фильтр `ServiceName:"frontend"` к дашборду и измените временное окно на последние 3 часа. Обратите внимание, что визуализации теперь отражают данные только по сервису `frontend`.

Дашборд будет автоматически сохранён. Чтобы задать имя дашборда, выберите заголовок и измените его перед нажатием `Save Name`. 

<Image img={dashboard_save} alt="Сохранение дашборда" size="lg"/>

</VerticalStepper>



## Дашборды — редактирование визуализаций {#dashboards-editing-visualizations}

Чтобы удалить, отредактировать или дублировать визуализацию, наведите на неё курсор и используйте соответствующие кнопки.

<Image img={dashboard_edit} alt="Редактирование дашборда" size="lg"/>



## Дашборды — список и поиск {#dashboard-listing-search}

К дашбордам можно перейти из левого меню; встроенный поиск позволяет быстро находить нужные дашборды.
<Image img={dashboard_search} alt="Поиск по дашбордам" size="sm"/>



## Дашборды — теги {#tagging}
<Tagging />



## Пресеты {#presets}

HyperDX развёртывается с готовыми дашбордами.

### Дашборд ClickHouse {#clickhouse-dashboard}

Этот дашборд содержит визуализации для мониторинга ClickHouse. Чтобы перейти к этому дашборду, выберите его в левом меню.

<Image img={dashboard_clickhouse} alt="Дашборд ClickHouse" size="lg"/>

В этом дашборде используются вкладки для раздельного мониторинга **Selects**, **Inserts** и **ClickHouse Infrastructure**.

:::note Требуемый доступ к системным таблицам
Этот дашборд выполняет запросы к [системным таблицам](/operations/system-tables) ClickHouse для отображения ключевых метрик. Требуются следующие права:

`GRANT SHOW COLUMNS, SELECT(CurrentMetric_MemoryTracking, CurrentMetric_S3Requests, ProfileEvent_OSCPUVirtualTimeMicroseconds, ProfileEvent_OSReadChars, ProfileEvent_OSWriteChars, ProfileEvent_S3GetObject, ProfileEvent_S3ListObjects, ProfileEvent_S3PutObject, ProfileEvent_S3UploadPart, event_time) ON system.metric_log`

`GRANT SHOW COLUMNS, SELECT(active, database, partition, rows, table) ON system.parts`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, memory_usage, normalized_query_hash, query, query_duration_ms, query_kind, read_rows, tables, type, written_bytes, written_rows) ON system.query_log`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, hostname, metric, value) ON system.transposed_metric_log`
:::

### Дашборд Services {#services-dashboard}

Дашборд Services отображает текущие активные сервисы на основе данных трассировок. Для этого пользователям необходимо собрать трассы и настроить корректный источник данных Traces.

Имена сервисов автоматически определяются из данных трассировок; при этом используется серия преднастроенных визуализаций, организованных по трём вкладкам: HTTP Services, Database и Errors.

Визуализации можно фильтровать с использованием синтаксиса Lucene или SQL, а временное окно можно настраивать для более детального анализа.

<Image img={dashboard_services} alt="Сервисы ClickHouse" size="lg"/>

### Дашборд Kubernetes {#kubernetes-dashboard}

Этот дашборд позволяет пользователям исследовать события Kubernetes, собранные через OpenTelemetry. Он включает расширенные параметры фильтрации, позволяющие фильтровать по поду Kubernetes, развертыванию, имени узла (Node name), пространству имён и кластеру, а также выполнять поиск по произвольному тексту.

Данные Kubernetes организованы по трём вкладкам для удобной навигации: Pods, Nodes и Namespaces.

<Image img={dashboard_kubernetes} alt="Kubernetes в ClickHouse" size="lg"/>
