---
description: 'Расширенная панель мониторинга в ClickHouse Cloud'
keywords: ['мониторинг', 'Обзервабилити', 'расширенная панель мониторинга', 'панель мониторинга', 'панель мониторинга наблюдаемости']
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

Мониторинг вашей системы баз данных в рабочей (продакшен) среде имеет ключевое значение
для понимания состояния развертывания, чтобы вы могли предотвращать или оперативно устранять простои.

Расширенная панель мониторинга — это легковесный инструмент, предназначенный для того, чтобы обеспечить вам детальное представление
о системе ClickHouse и её окружении, помогая заблаговременно выявлять узкие места производительности,
сбои системы и неэффективное использование ресурсов.

Расширенная панель мониторинга доступна как в ClickHouse OSS (Open Source Software),
так и в ClickHouse Cloud. В этой статье мы покажем, как использовать расширенную панель мониторинга в
ClickHouse Cloud.


## Доступ к расширенной панели мониторинга {#accessing-the-advanced-dashboard}

Перейдите к расширенной панели мониторинга:

* Левая боковая панель
  * `Monitoring` → `Advanced dashboard`

<Image img={AdvancedDashboard} size="lg" alt="Advanced dashboard"/>



## Доступ к встроенной расширенной панели мониторинга {#accessing-the-native-advanced-dashboard}

К встроенной расширенной панели мониторинга можно получить доступ, перейдя в:

* Левая боковая панель
  * `Monitoring` → `Advanced dashboard`
  * Нажав `You can still access the native advanced dashboard.`

Откроется встроенная расширенная панель мониторинга в новой вкладке. Для доступа
к панели мониторинга потребуется аутентификация.

<Image img={NativeAdvancedDashboard} size="lg" alt="Расширенная панель мониторинга"/>

Каждая визуализация имеет связанный с ней SQL-запрос, который формирует её содержимое. Вы можете
отредактировать этот запрос, нажав на значок карандаша.

<Image img={EditVisualization} size="lg" alt="Расширенная панель мониторинга"/>



## Готовые визуализации {#out-of-box-visualizations}

Базовые графики в Advanced Dashboard предназначены для обеспечения 
наблюдаемости вашей системы ClickHouse в режиме реального времени. Ниже приведён список 
этих графиков с описанием каждого. Они сгруппированы в три категории, чтобы упростить навигацию.

### Специфичные для ClickHouse {#clickhouse-specific}

Эти метрики предназначены для мониторинга состояния и производительности 
экземпляра ClickHouse.

| Metric                    | Description                                                                                           |
|---------------------------|-------------------------------------------------------------------------------------------------------|
| Queries Per Second        | Отслеживает скорость обработки запросов                                                              |
| Selected Rows/Sec         | Показывает количество строк, считываемых запросами                                                   |
| Inserted Rows/Sec         | Измеряет скорость ингестии данных                                                                    |
| Total MergeTree Parts     | Показывает количество активных частей в таблицах MergeTree, помогая выявлять непакетные вставки     |
| Max Parts for Partition   | Показывает максимальное количество частей в любом разделе                                            |
| Queries Running           | Отображает количество запросов, которые выполняются в данный момент                                  |
| Selected Bytes Per Second | Показывает объём данных, считываемых запросами                                                       |

### Специфичные для состояния системы {#system-health-specific}

Мониторинг базовой системы столь же важен, как и наблюдение за самим ClickHouse.

| Metric                    | Description                                                                    |
|---------------------------|--------------------------------------------------------------------------------|
| IO Wait                   | Отслеживает время ожидания операций ввода-вывода                              |
| CPU Wait                  | Измеряет задержки, вызванные конкуренцией за ресурсы CPU                      |
| Read From Disk            | Отслеживает количество байт, прочитанных с дисков или блочных устройств       |
| Read From Filesystem      | Отслеживает количество байт, прочитанных из файловой системы, включая страничный кэш (page cache) |
| Memory (tracked, bytes)   | Показывает использование памяти процессами, отслеживаемыми ClickHouse         |
| Load Average (15 minutes) | Сообщает текущее среднее значение нагрузки за последние 15 минут              |
| OS CPU Usage (Userspace)  | Использование CPU для выполнения кода в пространстве пользователя             |
| OS CPU Usage (Kernel)     | Использование CPU для выполнения кода ядра                                    |



## Особенности ClickHouse Cloud {#clickhouse-cloud-specific}

ClickHouse Cloud хранит данные в объектном хранилище типа S3. Мониторинг этого уровня может помочь вовремя обнаруживать проблемы.

| Metric                         | Description                                                     |
|--------------------------------|-----------------------------------------------------------------|
| S3 Read wait                   | Измеряет задержку запросов чтения к S3                         |
| S3 read errors per second      | Отслеживает частоту ошибок чтения из S3                        |
| Read From S3 (bytes/sec)       | Отслеживает скорость чтения данных из хранилища S3             |
| Disk S3 write req/sec          | Контролирует частоту операций записи в хранилище S3            |
| Disk S3 read req/sec           | Контролирует частоту операций чтения из хранилища S3           |
| Page cache hit rate            | Доля попаданий в кэш страниц                                   |
| Filesystem cache hit rate      | Доля попаданий в кэш файловой системы                         |
| Filesystem cache size          | Текущий размер кэша файловой системы                           |
| Network send bytes/sec         | Отслеживает текущую скорость исходящего сетевого трафика       |
| Network receive bytes/sec      | Отслеживает текущую скорость входящего сетевого трафика        |
| Concurrent network connections | Отслеживает количество текущих одновременных сетевых соединений |



## Определение проблем с помощью расширенной панели мониторинга

Наличие такого представления в реальном времени о состоянии вашего сервиса ClickHouse значительно помогает
снизить вероятность возникновения проблем до того, как они повлияют на бизнес, а также упростить их решение. Ниже приведены
несколько типов проблем, которые можно обнаружить с помощью расширенной панели мониторинга.

### Непакетные вставки

Как описано в [документации по лучшим практикам](/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous), рекомендуется всегда
выполнять пакетные вставки данных в ClickHouse, если есть возможность делать это синхронно.

Пакетная вставка с разумным размером батча уменьшает количество частей, создаваемых
во время ингестии, что приводит к более эффективной записи на диск и меньшему числу операций слияния.

Ключевые метрики для выявления неоптимальных вставок — **Inserted Rows/sec** и
**Max Parts for Partition**.

<Image img={InsertedRowsSec} size="lg" alt="Непакетные вставки" />

В приведённом выше примере видно два пика в **Inserted Rows/sec** и **Max Parts for Partition**
между 13:00 и 14:00. Это указывает на то, что мы выполняем приём данных с разумной скоростью.

Затем мы видим ещё один большой пик **Max Parts for Partition** после 16:00, но при этом
очень низкое значение **Inserted Rows/sec**. Создаётся много частей при
очень небольшом объёме данных, что указывает на неоптимальный размер частей.

### Ресурсоёмкий запрос

Нередко выполняются SQL-запросы, потребляющие большое количество ресурсов, таких как
CPU или память. Однако важно отслеживать эти запросы и понимать
их влияние на общую производительность вашего развертывания.

Внезапное изменение потребления ресурсов без изменения пропускной способности запросов может
указывать на выполнение более «дорогих» запросов. В зависимости от типа запросов,
которые вы запускаете, это может быть ожидаемо, но иметь возможность обнаруживать их по данным
расширенной панели мониторинга полезно.

Ниже приведён пример, когда использование CPU достигает пика, при этом
количество выполняемых запросов в секунду существенно не меняется.

<Image img={ResourceIntensiveQuery} size="lg" alt="Ресурсоёмкий запрос" />

### Некорректный дизайн первичного ключа

Ещё одну проблему, которую можно обнаружить с помощью расширенной панели мониторинга, — некорректный дизайн первичного ключа.
Как описано в статье [&quot;Практическое введение в первичные индексы в ClickHouse&quot;](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key),
выбор первичного ключа, наилучшим образом соответствующего вашему сценарию использования, значительно улучшит производительность
за счёт сокращения числа строк, которые ClickHouse должен прочитать для выполнения запроса.

Одна из метрик, с помощью которых можно выявить потенциальные улучшения в первичных ключах, —
**Selected Rows per second**. Внезапный пик в количестве выбираемых строк может
указывать как на общее увеличение пропускной способности запросов, так и на запросы,
которые для своего выполнения выбирают слишком большое количество строк.

<Image img={SelectedRowsPerSecond} size="lg" alt="Ресурсоёмкий запрос" />

Используя метку времени в качестве фильтра, вы можете найти запросы, выполненные в момент
пика, в таблице `system.query_log`.

Например, можно выполнить запрос, который покажет все запросы, выполненные между 11:00
и 11:10 в определённый день, чтобы понять, какие запросы читают слишком много строк:

```sql title="Query"
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

```response title="Response"
Строка 1:
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

В данном примере видно, что один и тот же запрос выполняется для двух 
таблиц `amazon_reviews_no_pk` и `amazon_reviews_pk`. Можно сделать вывод, что 
выполнялось тестирование варианта первичного ключа для таблицы `amazon_reviews`.
```
