---
description: 'Расширенный дашборд в ClickHouse Cloud'
keywords: ['monitoring', 'observability', 'advanced dashboard', 'dashboard', 'observability
    dashboard']
sidebar_label: 'Расширенный дашборд'
sidebar_position: 45
slug: /cloud/manage/monitor/advanced-dashboard
title: 'Расширенный дашборд в ClickHouse Cloud'
doc_type: 'guide'
---

import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';
import EditVisualization from '@site/static/images/cloud/manage/monitoring/edit_visualization.png';
import InsertedRowsSec from '@site/static/images/cloud/manage/monitoring/inserted_rows_max_parts_for_partition.png';
import ResourceIntensiveQuery from '@site/static/images/cloud/manage/monitoring/resource_intensive_query.png';
import SelectedRowsPerSecond from '@site/static/images/cloud/manage/monitoring/selected_rows_sec.png';

import Image from '@theme/IdealImage';

Мониторинг системы баз данных в продуктивной среде имеет ключевое значение для
понимания состояния развертывания, чтобы вы могли предотвращать или оперативно устранять сбои.

Расширенная панель мониторинга — это лёгкий инструмент, предназначенный для глубокого анализа
вашей системы ClickHouse и её окружения, который помогает заблаговременно выявлять
узкие места в производительности, отказы системы и неэффективности.

Расширенная панель мониторинга доступна как в ClickHouse OSS (open source-версия),
так и в Cloud. В этой статье мы покажем, как использовать расширенную панель мониторинга в
Cloud.


## Доступ к расширенной панели мониторинга {#accessing-the-advanced-dashboard}

Чтобы открыть расширенную панель мониторинга, перейдите в:

- Левая боковая панель
  - `Monitoring` → `Advanced dashboard`

<Image img={AdvancedDashboard} size='lg' alt='Расширенная панель мониторинга' />


## Доступ к встроенной расширенной панели расширенного мониторинга {#accessing-the-native-advanced-dashboard}

Доступ к встроенной панели расширенного мониторинга можно получить следующим образом:

- Левая боковая панель
  - `Monitoring` → `Advanced dashboard`
  - Нажав на ссылку `You can still access the native advanced dashboard.`

После этого встроенная панель расширенного мониторинга откроется в новой вкладке. Для доступа к панели потребуется аутентификация.

<Image img={NativeAdvancedDashboard} size='lg' alt='Панель расширенного мониторинга' />

Каждая визуализация заполняется с помощью связанного с ней SQL-запроса. Вы можете изменить этот запрос, нажав на значок карандаша.

<Image img={EditVisualization} size='lg' alt='Панель расширенного мониторинга' />


## Готовые визуализации {#out-of-box-visualizations}

Стандартные графики в расширенной панели управления предназначены для обеспечения
видимости состояния вашей системы ClickHouse в режиме реального времени. Ниже приведен список с описаниями
каждого графика. Они сгруппированы в три категории для удобства навигации.

### Специфичные для ClickHouse {#clickhouse-specific}

Эти метрики предназначены для мониторинга работоспособности и производительности вашего
экземпляра ClickHouse.

| Metric                    | Description                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| Queries Per Second        | Отслеживает скорость обработки запросов                                                  |
| Selected Rows/Sec         | Показывает количество строк, считываемых запросами                                       |
| Inserted Rows/Sec         | Измеряет скорость приема данных                                                          |
| Total MergeTree Parts     | Показывает количество активных кусков в таблицах MergeTree, помогая выявлять небатчированные вставки |
| Max Parts for Partition   | Показывает максимальное количество кусков в любой партиции                               |
| Queries Running           | Отображает количество выполняющихся в данный момент запросов                             |
| Selected Bytes Per Second | Показывает объем данных, считываемых запросами                                           |

### Специфичные для работоспособности системы {#system-health-specific}

Мониторинг базовой системы так же важен, как и мониторинг самого ClickHouse.

| Metric                    | Description                                                               |
| ------------------------- | ------------------------------------------------------------------------- |
| IO Wait                   | Отслеживает время ожидания операций ввода-вывода                          |
| CPU Wait                  | Измеряет задержки, вызванные конкуренцией за ресурсы процессора          |
| Read From Disk            | Отслеживает количество байтов, прочитанных с дисков или блочных устройств |
| Read From Filesystem      | Отслеживает количество байтов, прочитанных из файловой системы, включая кэш страниц |
| Memory (tracked, bytes)   | Показывает использование памяти для процессов, отслеживаемых ClickHouse  |
| Load Average (15 minutes) | Сообщает текущую среднюю нагрузку системы за 15 минут                    |
| OS CPU Usage (Userspace)  | Использование процессора при выполнении кода в пространстве пользователя |
| OS CPU Usage (Kernel)     | Использование процессора при выполнении кода ядра                         |


## Специфика ClickHouse Cloud {#clickhouse-cloud-specific}

ClickHouse Cloud хранит данные в объектном хранилище (типа S3). Мониторинг этого
интерфейса помогает выявлять проблемы.

| Метрика                        | Описание                                                    |
| ------------------------------ | ----------------------------------------------------------- |
| S3 Read wait                   | Измеряет задержку запросов на чтение из S3                  |
| S3 read errors per second      | Отслеживает частоту ошибок чтения                           |
| Read From S3 (bytes/sec)       | Отслеживает скорость чтения данных из хранилища S3          |
| Disk S3 write req/sec          | Отслеживает частоту операций записи в хранилище S3          |
| Disk S3 read req/sec           | Отслеживает частоту операций чтения из хранилища S3         |
| Page cache hit rate            | Процент попаданий в кеш страниц                             |
| Filesystem cache hit rate      | Процент попаданий в кеш файловой системы                    |
| Filesystem cache size          | Текущий размер кеша файловой системы                        |
| Network send bytes/sec         | Отслеживает текущую скорость исходящего сетевого трафика    |
| Network receive bytes/sec      | Отслеживает текущую скорость входящего сетевого трафика     |
| Concurrent network connections | Отслеживает количество текущих одновременных сетевых соединений |


## Выявление проблем с помощью расширенной панели мониторинга {#identifying-issues-with-the-advanced-dashboard}

Наличие такого представления в реальном времени о состоянии сервиса ClickHouse значительно помогает
предотвращать проблемы до того, как они повлияют на бизнес, или быстрее их решать. Ниже приведено
несколько типов проблем, которые можно обнаружить с помощью расширенной панели мониторинга.

### Непакетные вставки {#unbatched-inserts}

Как описано в [руководстве по лучшим практикам](/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous), рекомендуется всегда
вставлять данные в ClickHouse пакетно, если есть возможность делать это синхронно.

Пакетная вставка с разумным размером партии уменьшает количество кусков (parts), создаваемых
при загрузке данных, что приводит к более эффективной записи на диск и меньшему числу операций слияния.

Ключевые метрики, по которым можно выявить неоптимальные вставки, — это **Inserted Rows/sec** и
**Max Parts for Partition**.

<Image img={InsertedRowsSec} size='lg' alt='Непакетные вставки' />

На примере выше видно два всплеска метрик **Inserted Rows/sec** и **Max Parts for Partition**
между 13:00 и 14:00. Это указывает на то, что данные загружаются с приемлемой скоростью.

Затем после 16:00 наблюдается ещё один крупный всплеск **Max Parts for Partition**, но при этом
очень низкое значение **Inserted Rows/sec**. Создаётся много кусков с
очень небольшим количеством данных в каждом, что указывает на неоптимальный размер кусков.

### Ресурсоёмкий запрос {#resource-intensive-query}

Довольно часто выполняются SQL-запросы, которые потребляют значительный объём ресурсов, например
CPU или памяти. Однако важно отслеживать такие запросы и понимать,
как они влияют на общую производительность развертывания.

Резкое изменение потребления ресурсов без изменения пропускной способности по числу запросов
может указывать на выполнение более «дорогих» запросов. В зависимости от типа выполняемых
запросов это может быть ожидаемо, но полезно уметь обнаруживать такие случаи по данным
расширенной панели мониторинга.

Ниже приведён пример, когда использование CPU достигает пика без существенного изменения
количества выполняемых запросов в секунду.

<Image img={ResourceIntensiveQuery} size='lg' alt='Ресурсоёмкий запрос' />

### Неудачный дизайн первичного ключа {#bad-primary-key-design}

Ещё одна проблема, которую можно выявить с помощью расширенной панели мониторинга, — неудачный дизайн первичного ключа.
Как описано в разделе ["Практическое введение в первичные индексы в ClickHouse"](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key),
подбор первичного ключа, наилучшим образом соответствующего вашему сценарию использования, значительно повышает производительность,
уменьшая количество строк, которые ClickHouse нужно прочитать для выполнения запроса.

Одна из метрик, по которой можно отслеживать потенциальные улучшения первичных ключей, —
**Selected Rows per second**. Внезапный скачок числа выбранных строк может
указывать как на общий рост нагрузки по запросам, так и на появление запросов,
которые выбирают очень большое количество строк для своего выполнения.

<Image img={SelectedRowsPerSecond} size='lg' alt='Ресурсоёмкий запрос' />

Используя метку времени в качестве фильтра, вы можете найти запросы, выполнявшиеся в момент
пика, в таблице `system.query_log`.

Например, можно выполнить запрос, который покажет все запросы, выполнявшиеся между 11:20
и 11:30 в определённый день, чтобы понять, какие запросы читают слишком много строк:

```sql title="Запрос"
SELECT
    type,
    event_time,
    query_duration_ms,
    query,
    read_rows,
    tables
FROM system.query_log
WHERE has(databases, 'default') AND (event_time >= '2024-12-23 11:20:00') AND (event_time <= '2024-12-23 11:30:00') AND (type = 'QueryFinish')
ORDER BY query_duration_ms DESC
LIMIT 5
FORMAT VERTICAL
```

```response title="Ответ"
Row 1:
──────
type:              QueryFinish
event_time:        2024-12-23 11:22:55
query_duration_ms: 37407
query:             SELECT
    toStartOfMonth(review_date) AS month,
    any(product_title),
    avg(star_rating) AS avg_stars
FROM amazon_reviews_no_pk
WHERE
    product_category = 'Home'
GROUP BY
    month,
    product_id
ORDER BY
    month DESC,
    product_id ASC
LIMIT 20
read_rows:         150957260
tables:            ['default.amazon_reviews_no_pk']

```


Строка 2:
──────
type:              QueryFinish
event&#95;time:        2024-12-23 11:26:50
query&#95;duration&#95;ms: 7325
query:             SELECT
toStartOfMonth(review&#95;date) AS month,
any(product&#95;title),
avg(star&#95;rating) AS avg&#95;stars
FROM amazon&#95;reviews&#95;no&#95;pk
WHERE
product&#95;category = &#39;Home&#39;
GROUP BY
month,
product&#95;id
ORDER BY
month DESC,
product&#95;id ASC
LIMIT 20
read&#95;rows:         150957260
tables:            [&#39;default.amazon&#95;reviews&#95;no&#95;pk&#39;]

Строка 3:
──────
type:              QueryFinish
event&#95;time:        2024-12-23 11:24:10
query&#95;duration&#95;ms: 3270
query:             SELECT
toStartOfMonth(review&#95;date) AS month,
any(product&#95;title),
avg(star&#95;rating) AS avg&#95;stars
FROM amazon&#95;reviews&#95;pk
WHERE
product&#95;category = &#39;Home&#39;
GROUP BY
month,
product&#95;id
ORDER BY
month DESC,
product&#95;id ASC
LIMIT 20
read&#95;rows:         6242304
tables:            [&#39;default.amazon&#95;reviews&#95;pk&#39;]

Строка 4:
──────
type:              QueryFinish
event&#95;time:        2024-12-23 11:28:10
query&#95;duration&#95;ms: 2786
query:             SELECT
toStartOfMonth(review&#95;date) AS month,
any(product&#95;title),
avg(star&#95;rating) AS avg&#95;stars
FROM amazon&#95;reviews&#95;pk
WHERE
product&#95;category = &#39;Home&#39;
GROUP BY
month,
product&#95;id
ORDER BY
month DESC,
product&#95;id ASC
LIMIT 20
read&#95;rows:         6242304
tables:            [&#39;default.amazon&#95;reviews&#95;pk&#39;]

```

В этом примере видно, что один и тот же запрос выполняется для двух 
таблиц `amazon_reviews_no_pk` и `amazon_reviews_pk`. Можно сделать вывод, что 
выполнялось тестирование варианта первичного ключа для таблицы `amazon_reviews`.
```
