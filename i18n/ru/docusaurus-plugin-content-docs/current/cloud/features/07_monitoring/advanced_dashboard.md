---
description: 'Расширенная панель мониторинга в ClickHouse Cloud'
keywords: ['monitoring', 'observability', 'advanced dashboard', 'dashboard', 'observability
    dashboard']
sidebar_label: 'Расширенная панель мониторинга'
sidebar_position: 45
slug: /cloud/manage/monitor/advanced-dashboard
title: 'Расширенная панель мониторинга в ClickHouse Cloud'
doc_type: 'guide'
---

import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';
import EditVisualization from '@site/static/images/cloud/manage/monitoring/edit_visualization.png';
import InsertedRowsSec from '@site/static/images/cloud/manage/monitoring/inserted_rows_max_parts_for_partition.png';
import ResourceIntensiveQuery from '@site/static/images/cloud/manage/monitoring/resource_intensive_query.png';
import SelectedRowsPerSecond from '@site/static/images/cloud/manage/monitoring/selected_rows_sec.png';

import Image from '@theme/IdealImage';

Мониторинг вашей системы баз данных в продакшн-среде имеет ключевое значение
для понимания состояния развертывания, чтобы вы могли предотвращать или устранять простои.

Расширенная панель мониторинга — это легковесный инструмент, предназначенный для получения глубокого представления о
вашей системе ClickHouse и её окружении, помогая вам заблаговременно выявлять
узкие места производительности, отказы системы и неэффективность.

Расширенная панель мониторинга доступна как в ClickHouse OSS (Open Source Software),
так и в ClickHouse Cloud. В этой статье мы покажем, как использовать расширенную панель мониторинга в
ClickHouse Cloud.


## Доступ к расширенной панели мониторинга {#accessing-the-advanced-dashboard}

Для доступа к расширенной панели мониторинга перейдите в:

- Левая боковая панель
  - `Monitoring` → `Advanced dashboard`

<Image img={AdvancedDashboard} size='lg' alt='Расширенная панель мониторинга' />


## Доступ к нативной расширенной панели мониторинга {#accessing-the-native-advanced-dashboard}

Для доступа к нативной расширенной панели мониторинга перейдите по следующему пути:

- Левая боковая панель
  - `Monitoring` → `Advanced dashboard`
  - Нажмите на `You can still access the native advanced dashboard.`

Нативная расширенная панель мониторинга откроется в новой вкладке. Для доступа к панели необходимо пройти аутентификацию.

<Image img={NativeAdvancedDashboard} size='lg' alt='Расширенная панель мониторинга' />

Каждая визуализация связана с SQL-запросом, который заполняет её данными. Запрос можно отредактировать, нажав на значок карандаша.

<Image img={EditVisualization} size='lg' alt='Расширенная панель мониторинга' />


## Готовые визуализации {#out-of-box-visualizations}

Графики по умолчанию в расширенной панели управления предназначены для обеспечения видимости
вашей системы ClickHouse в режиме реального времени. Ниже приведен список с описаниями
каждого графика. Они сгруппированы в три категории для удобства навигации.

### Специфичные для ClickHouse {#clickhouse-specific}

Эти метрики предназначены для мониторинга работоспособности и производительности вашего
экземпляра ClickHouse.

| Metric                    | Description                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| Queries Per Second        | Отслеживает скорость обработки запросов                                                            |
| Selected Rows/Sec         | Показывает количество строк, считываемых запросами                                                 |
| Inserted Rows/Sec         | Измеряет скорость приема данных                                                                    |
| Total MergeTree Parts     | Показывает количество активных частей в таблицах MergeTree, помогая выявлять непакетные вставки    |
| Max Parts for Partition   | Показывает максимальное количество частей в любой партиции                                         |
| Queries Running           | Отображает количество выполняющихся в данный момент запросов                                       |
| Selected Bytes Per Second | Показывает объем данных, считываемых запросами                                                     |

### Специфичные для работоспособности системы {#system-health-specific}

Мониторинг базовой системы так же важен, как и мониторинг самого ClickHouse.

| Metric                    | Description                                                               |
| ------------------------- | ------------------------------------------------------------------------- |
| IO Wait                   | Отслеживает время ожидания операций ввода-вывода                                         |
| CPU Wait                  | Измеряет задержки, вызванные конкуренцией за ресурсы процессора                          |
| Read From Disk            | Отслеживает количество байт, прочитанных с дисков или блочных устройств                  |
| Read From Filesystem      | Отслеживает количество байт, прочитанных из файловой системы, включая кэш страниц        |
| Memory (tracked, bytes)   | Показывает использование памяти для процессов, отслеживаемых ClickHouse                  |
| Load Average (15 minutes) | Показывает текущую среднюю нагрузку за 15 минут из системы                               |
| OS CPU Usage (Userspace)  | Использование процессора при выполнении кода пользовательского пространства              |
| OS CPU Usage (Kernel)     | Использование процессора при выполнении кода ядра                                        |


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
| Page cache hit rate            | Коэффициент попаданий в кеш страниц                         |
| Filesystem cache hit rate      | Коэффициент попаданий в кеш файловой системы                |
| Filesystem cache size          | Текущий размер кеша файловой системы                        |
| Network send bytes/sec         | Отслеживает текущую скорость исходящего сетевого трафика    |
| Network receive bytes/sec      | Отслеживает текущую скорость входящего сетевого трафика     |
| Concurrent network connections | Отслеживает количество текущих одновременных сетевых соединений |


## Выявление проблем с помощью расширенной панели мониторинга {#identifying-issues-with-the-advanced-dashboard}

Наличие представления о состоянии вашего сервиса ClickHouse в режиме реального времени значительно помогает
предотвратить проблемы до того, как они повлияют на ваш бизнес, или помочь их решить. Ниже приведены
некоторые проблемы, которые можно обнаружить с помощью расширенной панели мониторинга.

### Небатчированные вставки {#unbatched-inserts}

Как описано в [документации по лучшим практикам](/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous), рекомендуется всегда
выполнять массовую вставку данных в ClickHouse, если это возможно делать синхронно.

Массовая вставка с разумным размером батча уменьшает количество частей, создаваемых
во время загрузки данных, что приводит к более эффективной записи на диски и меньшему количеству операций
слияния.

Ключевые метрики для обнаружения неоптимальных вставок — это **Inserted Rows/sec** и
**Max Parts for Partition**

<Image img={InsertedRowsSec} size='lg' alt='Небатчированные вставки' />

Приведенный выше пример показывает два всплеска в **Inserted Rows/sec** и **Max Parts for Partition**
между 13:00 и 14:00. Это указывает на то, что мы загружаем данные с разумной скоростью.

Затем мы видим еще один большой всплеск в **Max Parts for Partition** после 16:00, но
очень низкую **скорость Inserted Rows/sec**. Создается много частей при
очень малом объеме генерируемых данных, что указывает на то, что размер частей
неоптимален.

### Ресурсоемкие запросы {#resource-intensive-query}

Часто выполняются SQL-запросы, которые потребляют большое количество ресурсов, таких как
CPU или память. Однако важно отслеживать эти запросы и понимать
их влияние на общую производительность вашего развертывания.

Внезапное изменение потребления ресурсов без изменения пропускной способности запросов может
указывать на выполнение более дорогостоящих запросов. В зависимости от типа запросов,
которые вы выполняете, это может быть ожидаемым, но обнаружение их с помощью расширенной
панели мониторинга является полезным.

Ниже приведен пример пикового использования CPU без существенного изменения
количества выполняемых запросов в секунду.

<Image img={ResourceIntensiveQuery} size='lg' alt='Ресурсоемкий запрос' />

### Неправильный дизайн первичного ключа {#bad-primary-key-design}

Еще одна проблема, которую можно обнаружить с помощью расширенной панели мониторинга, — это неправильный дизайн первичного ключа.
Как описано в [«Практическое введение в первичные индексы в ClickHouse»](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key),
выбор первичного ключа, наилучшим образом соответствующего вашему сценарию использования, значительно улучшит производительность,
уменьшив количество строк, которые ClickHouse необходимо прочитать для выполнения вашего запроса.

Одна из метрик, которую можно отслеживать для обнаружения потенциальных улучшений в первичных ключах,
— это **Selected Rows per second**. Внезапный пик в количестве выбранных строк может
указывать как на общее увеличение пропускной способности запросов, так и на запросы, которые
выбирают большое количество строк для своего выполнения.

<Image img={SelectedRowsPerSecond} size='lg' alt='Ресурсоемкий запрос' />

Используя временную метку в качестве фильтра, вы можете найти запросы, выполненные во время
пика в таблице `system.query_log`.

Например, выполнение запроса, который показывает все запросы, выполненные между 11:20
и 11:30 в определенный день, чтобы понять, какие запросы читают слишком много строк:

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
