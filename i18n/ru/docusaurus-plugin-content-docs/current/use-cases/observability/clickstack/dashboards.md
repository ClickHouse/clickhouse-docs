---
slug: /use-cases/observability/clickstack/dashboards
title: 'Визуализации и панели мониторинга с ClickStack'
sidebar_label: 'Панели мониторинга'
pagination_prev: null
pagination_next: null
description: 'Визуализации и панели мониторинга с ClickStack'
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

ClickStack поддерживает визуализацию событий, включая встроенные средства построения графиков в HyperDX. Эти графики можно добавлять на дашборды и делиться ими с другими пользователями.

Визуализации можно создавать на основе трассировок, метрик, логов или любых широких схем событий, определённых пользователем.


## Создание визуализаций {#creating-visualizations}

Интерфейс **Chart Explorer** в HyperDX позволяет пользователям визуализировать метрики, трейсы и логи во времени, что упрощает создание быстрых визуализаций для анализа данных. Этот интерфейс также используется при создании дашбордов. В следующем разделе пошагово разобран процесс создания визуализации с помощью Chart Explorer.

Каждая визуализация начинается с выбора **источника данных**, затем **метрики**, с дополнительными **фильтрами** и полями **group by**. Концептуально визуализации в HyperDX соответствуют SQL‑запросу с `GROUP BY` — пользователи определяют метрики для агрегации по выбранным измерениям.

Например, можно построить график количества ошибок (`count()`), сгруппированных по имени сервиса.

В примерах ниже используется удалённый набор данных, доступный на [sql.clickhouse.com](https://sql.clickhouse.com) и описанный в руководстве ["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data). **Пользователи также могут воспроизвести эти примеры, перейдя на [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com).**

<VerticalStepper headerLevel="h3">

### Переход к Chart Explorer {#navigate-chart-explorer}

Выберите `Chart Explorer` в левом меню.

<Image img={visualization_1} alt='Chart Explorer' size='lg' />

### Создание визуализации {#create-visualization}

В примере ниже строится график среднего времени обработки запроса во времени для каждого сервиса. Для этого пользователю нужно указать метрику, столбец (который может быть SQL‑выражением) и поле агрегации.

Выберите тип визуализации `Line/Bar` в верхнем меню, затем набор данных `Traces` (или `Demo Traces`, если используется [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)). Укажите следующие значения:

- Metric: `Average`
- Column: `Duration/1000`
- Where: `<empty>`
- Group By: `ServiceName`
- Alias: `Average Time`

<Image img={visualization_2} alt='Простая визуализация' size='lg' />

Обратите внимание, что пользователи могут фильтровать события с помощью SQL‑условия `WHERE` или синтаксиса Lucene, а также задавать интервал времени, за который должны отображаться события. Поддерживается несколько рядов данных.

Например, отфильтруйте сервис `frontend`, добавив фильтр `ServiceName:"frontend"`. Добавьте второй ряд с количеством событий во времени с псевдонимом `Count`, нажав `Add Series`.

<Image img={visualization_3} alt='Простая визуализация 2' size='lg' />

:::note
Визуализации можно строить из любого источника данных — метрик, трейсов или логов. ClickStack рассматривает все эти данные как широкие события. Любой **числовой столбец** можно отображать во времени, а **строковые**, **дата‑** или **числовые** столбцы можно использовать для группировок.

Такой единый подход позволяет пользователям создавать дашборды по разным типам телеметрии, используя единую гибкую модель.
:::

</VerticalStepper>


## Создание дашбордов {#creating-dashboards}

Дашборды позволяют группировать связанные визуализации, чтобы пользователи могли сравнивать метрики и анализировать закономерности бок о бок для выявления возможных корневых причин в своих системах. Такие дашборды можно использовать для разовых расследований или сохранять для постоянного мониторинга.

Глобальные фильтры применяются на уровне дашборда и автоматически распространяются на все визуализации в нем. Это обеспечивает последовательный drill-down по диаграммам и упрощает корреляцию событий между сервисами и типами телеметрии.

Ниже мы создаем дашборд с двумя визуализациями на основе источников данных логов и трассировок. Эти шаги можно повторить на [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) или локально, подключившись к набору данных на [sql.clickhouse.com](https://sql.clickhouse.com), как описано в руководстве ["Удаленный демонстрационный набор данных"](/use-cases/observability/clickstack/getting-started/remote-demo-data).

<VerticalStepper headerLevel="h3">

### Перейти к дашбордам {#navigate-dashboards}

Выберите `Дашборды` в левом меню.

<Image img={dashboard_1} alt='Создание дашборда' size='lg' />

По умолчанию дашборды временные, чтобы поддерживать разовые расследования.

Если вы используете собственный экземпляр HyperDX, то для сохранения дашборда позже нажмите `Create New Saved Dashboard`. Эта опция недоступна в режиме только для чтения на [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com).

### Создание визуализации — среднее время запроса по сервису {#create-a-tile}

Выберите `Add New Tile`, чтобы открыть панель создания визуализации.

В верхнем меню выберите тип визуализации `Line/Bar`, затем набор данных `Traces` (или `Demo Traces` на [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)). Укажите следующие значения, чтобы создать график со средней продолжительностью запросов во времени по имени сервиса:

- Chart Name: `Средняя продолжительность по сервису`
- Metric: `Average`
- Column: `Duration/1000`
- Where: `<empty>`
- Group By: `ServiceName`
- Alias: `Среднее время`

Нажмите кнопку **▶** перед нажатием `Save`.

<Image img={dashboard_2} alt='Создание визуализации дашборда' size='lg' />

Измените размер визуализации, чтобы она занимала всю ширину дашборда.

<Image img={dashboard_3} alt='Дашборд с визуализациями' size='lg' />

### Создание визуализации — события во времени по сервису {#create-a-tile-2}

Выберите `Add New Tile`, чтобы открыть панель создания визуализации.

В верхнем меню выберите тип визуализации `Line/Bar`, затем набор данных `Logs` (или `Demo Logs` на [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)). Укажите следующие значения, чтобы создать график с количеством событий во времени по имени сервиса:

- Chart Name: `Количество событий по сервису`
- Metric: `Count of Events`
- Where: `<empty>`
- Group By: `ServiceName`
- Alias: `Количество событий`

Нажмите кнопку **▶** перед нажатием `Save`.

<Image img={dashboard_4} alt='Визуализация дашборда 2' size='lg' />

Измените размер визуализации, чтобы она занимала всю ширину дашборда.

<Image img={dashboard_5} alt='Дашборд с визуализациями 2' size='lg' />

### Фильтрация дашборда {#filter-dashboards}

Фильтры Lucene или SQL вместе с диапазоном времени применяются на уровне дашборда и автоматически распространяются на все визуализации.

<Image img={dashboard_filter} alt='Дашборд с фильтрацией' size='lg' />

Для демонстрации примените к дашборду фильтр Lucene `ServiceName:"frontend"` и измените временное окно на последние 3 часа. Обратите внимание, что визуализации теперь показывают данные только сервиса `frontend`.

Дашборд сохраняется автоматически. Чтобы задать имя дашборда, выберите заголовок, отредактируйте его и нажмите `Save Name`.

<Image img={dashboard_save} alt='Сохранение дашборда' size='lg' />

</VerticalStepper>


## Дашборды - Редактирование визуализаций {#dashboards-editing-visualizations}

Чтобы удалить, отредактировать или дублировать визуализацию, наведите на неё курсор и воспользуйтесь соответствующими кнопками действий.

<Image img={dashboard_edit} alt='Редактирование дашборда' size='lg' />


## Dashboard - Список и поиск {#dashboard-listing-search}

Дашборды доступны в меню слева, со встроенным поиском для быстрого поиска нужных дашбордов.

<Image img={dashboard_search} alt='Поиск дашбордов' size='sm' />


## Дашборды — Теги {#tagging}

<Tagging />


## Предустановки {#presets}

HyperDX поставляется с готовыми дашбордами.

### Дашборд ClickHouse {#clickhouse-dashboard}

Этот дашборд предоставляет визуализации для мониторинга ClickHouse. Чтобы перейти к нему, выберите его в меню слева.

<Image img={dashboard_clickhouse} alt='Дашборд ClickHouse' size='lg' />

Дашборд использует вкладки для разделения мониторинга **запросов SELECT**, **операций INSERT** и **инфраструктуры ClickHouse**.

:::note Требуемый доступ к системным таблицам
Этот дашборд выполняет запросы к [системным таблицам](/operations/system-tables) ClickHouse для получения ключевых метрик. Необходимы следующие привилегии:

`GRANT SHOW COLUMNS, SELECT(CurrentMetric_MemoryTracking, CurrentMetric_S3Requests, ProfileEvent_OSCPUVirtualTimeMicroseconds, ProfileEvent_OSReadChars, ProfileEvent_OSWriteChars, ProfileEvent_S3GetObject, ProfileEvent_S3ListObjects, ProfileEvent_S3PutObject, ProfileEvent_S3UploadPart, event_time) ON system.metric_log`

`GRANT SHOW COLUMNS, SELECT(active, database, partition, rows, table) ON system.parts`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, memory_usage, normalized_query_hash, query, query_duration_ms, query_kind, read_rows, tables, type, written_bytes, written_rows) ON system.query_log`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, hostname, metric, value) ON system.transposed_metric_log`
:::

### Дашборд сервисов {#services-dashboard}

Дашборд сервисов отображает активные в данный момент сервисы на основе данных трассировки. Для этого необходимо, чтобы пользователи собирали трассировки и настроили корректный источник данных трассировки.

Имена сервисов автоматически определяются из данных трассировки. Набор готовых визуализаций организован по трем вкладкам: HTTP-сервисы, База данных и Ошибки.

Визуализации можно фильтровать с использованием синтаксиса Lucene или SQL, а временной интервал можно настроить для целенаправленного анализа.

<Image img={dashboard_services} alt='Сервисы ClickHouse' size='lg' />

### Дашборд Kubernetes {#kubernetes-dashboard}

Этот дашборд позволяет исследовать события Kubernetes, собранные через OpenTelemetry. Он включает расширенные возможности фильтрации, позволяя фильтровать по Pod, Deployment, имени узла, пространству имен и кластеру Kubernetes, а также выполнять текстовый поиск.

Данные Kubernetes организованы по трем вкладкам для удобной навигации: Поды, Узлы и Пространства имен.

<Image img={dashboard_kubernetes} alt='Kubernetes в ClickHouse' size='lg' />
