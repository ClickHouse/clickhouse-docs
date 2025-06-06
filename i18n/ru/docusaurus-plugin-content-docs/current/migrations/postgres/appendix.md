---
slug: /migrations/postgresql/appendix
title: 'Приложение'
keywords: ['postgres', 'postgresql', 'тип данных', 'типы']
description: 'Дополнительная информация относительно миграции с PostgreSQL'
---


import postgresReplicas from '@site/static/images/integrations/data-ingestion/dbms/postgres-replicas.png';
import Image from '@theme/IdealImage';

## Postgres vs ClickHouse: Эквивалентные и разные концепции {#postgres-vs-clickhouse-equivalent-and-different-concepts}

Пользователи, приходящие из OLTP систем и привыкшие к транзакциям ACID, должны понимать, что ClickHouse делает сознательные компромиссы в плане неполного предоставления этих свойств в обмен на производительность. Семантика ClickHouse может обеспечить высокие гарантии устойчивости и высокую пропускную способность записи, если она правильно понята. Мы выделили некоторые ключевые концепции ниже, с которыми пользователи должны быть знакомы перед работой с ClickHouse из Postgres.

### Шарды vs Реплики {#shards-vs-replicas}

Шардирование и репликация — это две стратегии, использованные для масштабирования за пределы одной инстанции Postgres, когда хранилище и/или вычисления становятся узким местом в производительности. Шардирование в Postgres подразумевает разделение большой базы данных на более мелкие, более управляемые части, распределенные по нескольким узлам. Однако Postgres не поддерживает шардирование нативно. Вместо этого шардирование можно реализовать с использованием расширений, таких как [Citus](https://www.citusdata.com/), в котором Postgres становится распределенной базой данных, способной к горизонтальному масштабированию. Этот подход позволяет Postgres обрабатывать более высокие скорости транзакций и большие объемы данных, распределяя нагрузку по нескольким машинам. Шарды могут быть основаны на строках или схемах, чтобы обеспечить гибкость для различных типов нагрузки, таких как транзакционная или аналитическая. Шардирование может привести к значительной сложности в управлении данными и выполнении запросов, так как требует координации между несколькими машинами и гарантии согласованности.

В отличие от шардов, реплики — это дополнительные инстанции Postgres, которые содержат все или часть данных с главного узла. Реплики используются по различным причинам, включая улучшенную производительность чтения и сценарии высокой доступности (HA). Физическая репликация является нативной функцией Postgres, которая включает в себя копирование всей базы данных или значительных ее частей на другой сервер, включая все базы данных, таблицы и индексы. Это включает в себя потоковую передачу сегментов WAL с главного узла к репликам через TCP/IP. В отличие от этого, логическая репликация — это более высокий уровень абстракции, который передает изменения на основе операций `INSERT`, `UPDATE` и `DELETE`. Хотя те же результаты могут применяться к физической репликации, обеспечивается большая гибкость для нацеливания на определенные таблицы и операции, а также преобразования данных и поддержки различных версий Postgres.

**В отличие от этого, шардын и реплики ClickHouse — это две ключевые концепции, связанные с распределением данных и избыточностью**. Реплики ClickHouse можно считать аналогичными репликам Postgres, хотя репликация является асинхронной без понятия главного узла. Шардирование, в отличие от Postgres, поддерживается нативно.

Шард — это часть данных вашей таблицы. У вас всегда должно быть как минимум одно шард. Шардирование данных по нескольким серверам можно использовать для распределения нагрузки, если вы превышаете мощность одного сервера с использованием всех шардов для выполнения запроса параллельно. Пользователи могут вручную создавать шарды для таблицы на разных серверах и вставлять данные непосредственно в них. В качестве альтернативы можно использовать распределенную таблицу с ключом шардирования, который определяет, в какой шард направляются данные. Ключ шардирования может быть случайным или результатом функции хеширования. Важно отметить, что шард может состоять из нескольких реплик.

Реплика — это копия ваших данных. ClickHouse всегда имеет как минимум одну копию ваших данных, поэтому минимальное количество реплик — одно. Добавление второй реплики ваших данных обеспечивает отказоустойчивость и потенциально дополнительную вычислительную мощность для обработки большего количества запросов ([Параллельные Реплики](https://clickhouse.com/blog/clickhouse-release-23-03#parallel-replicas-for-utilizing-the-full-power-of-your-replicas-nikita-mikhailov) также могут быть использованы для распределения вычислений для одного запроса, что снижает задержку). Реплики достигаются с использованием [табличного движка ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication), который позволяет ClickHouse поддерживать несколько копий данных в синхронизации между различными серверами. Репликация является физической: передаются только сжатые части между узлами, но не запросы.

В итоге, реплика — это копия данных, обеспечивающая избыточность и надежность (и потенциально распределенную обработку), в то время как шард — это подмножество данных, которое позволяет распределенную обработку и балансировку нагрузки.

> ClickHouse Cloud использует единую копию данных, хранящуюся в S3 с несколькими вычислительными репликами. Данные доступны каждому узлу реплики, у каждого из которых есть локальный SSD кэш. Это основывается на репликации метаданных только через ClickHouse Keeper.

## Конечная согласованность {#eventual-consistency}

ClickHouse использует ClickHouse Keeper (реализация ZooKeeper на C++, также можно использовать ZooKeeper) для управления своим внутренним механизмом репликации, сосредоточив внимание в первую очередь на хранении метаданных и обеспечении конечной согласованности. Keeper используется для назначения уникальных последовательных номеров для каждой вставки в распределенной среде. Это критически важно для поддержания порядка и согласованности операций. Эта структура также обрабатывает фоновые операции, такие как объединения и мутации, гарантируя, что работа по этим операциям распределена, при этом гарантируя, что они выполняются в одном и том же порядке на всех репликах. В дополнение к метаданным, Keeper функционирует как комплексный центр управления для репликации, включая отслеживание контрольных сумм для хранимых частей данных, и служит распределенной системой уведомлений между репликами.

Процесс репликации в ClickHouse (1) начинается, когда данные вставляются в любую реплику. Эти данные в сыром виде вставки (2) записываются на диск вместе с их контрольными суммами. После записи, реплика (3) пытается зарегистрировать эту новую часть данных в Keeper, выделяя уникальный номер блока и регистрируя детали новой части. Другие реплики, при (4) обнаружении новых записей в журнале репликации, (5) загружают соответствующую часть данных через внутренний HTTP-протокол, проверяя ее по контрольным суммам, указанным в ZooKeeper. Этот метод гарантирует, что все реплики в конце концов содержат согласованные и актуальные данные, несмотря на различные скорости обработки или потенциальные задержки. Более того, система способна обрабатывать несколько операций одновременно, оптимизируя процессы управления данными и позволяя масштабируемость системы и устойчивость к аппаратным несоответствиям.

<Image img={postgresReplicas} size="md" alt="Конечная согласованность"/>

Обратите внимание, что ClickHouse Cloud использует [оптимизированный для облака механизм репликации](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates), адаптированный к своей архитектуре раздельного хранения и вычислений. Путем хранения данных в общем объектном хранилище данные автоматически доступны для всех вычислительных узлов без необходимости физической репликации данных между узлами. Вместо этого Keeper используется только для обмена метаданными (где находятся данные в объектном хранилище) между вычислительными узлами.

PostgreSQL использует другую стратегию репликации по сравнению с ClickHouse, в основном используя потоковую репликацию, которая включает в себя модель главной реплики, где данные постоянно передаются от главного узла к одному или нескольким узлам реплики. Эта форма репликации обеспечивает почти реальную согласованность и является синхронной или асинхронной, что дает администраторам контроль над балансом между доступностью и согласованностью. В отличие от ClickHouse, PostgreSQL полагается на WAL (журнал записи впереди) с логической репликацией и декодированием для передачи объектов данных и изменений между узлами. Этот подход в PostgreSQL более прост, но может не обеспечивать тот же уровень масштабируемости и отказоустойчивости в высоко распределенных средах, который ClickHouse достигает благодаря своему сложному использованию Keeper для координации распределенных операций и конечной согласованности.

## Влияние на пользователей {#user-implications}

В ClickHouse возможность «грязных чтений» — когда пользователи могут записывать данные в одну реплику и затем читать потенциально недореплицированные данные из другой — возникает из его модели репликации с конечной согласованностью, управляемой через Keeper. Эта модель акцентирует внимание на производительности и масштабируемости в распределенных системах, позволяя репликам работать независимо и синхронизироваться асинхронно. В результате новые вставленные данные могут сразу не быть видны на всех репликах, в зависимости от задержки репликации и времени, необходимого для распространения изменений через систему.

С другой стороны, модель потоковой репликации PostgreSQL обычно может предотвратить «грязные чтения», используя опции синхронной репликации, при которых главный узел ожидает, пока хотя бы одна реплика подтвердит получение данных перед фиксацией транзакций. Это гарантирует, что после фиксации транзакции существует подтверждение того, что данные доступны в другой реплике. В случае сбоя главного узла реплика обеспечит, чтобы запросы увидели зафиксированные данные, тем самым поддерживая более строгий уровень согласованности.

## Рекомендации {#recommendations}

Пользователи, которые впервые работают с ClickHouse, должны быть осведомлены об этих различиях, которые проявятся в реплицированных средах. Обычно конечная согласованность является достаточной в аналитике над миллиардами, если не триллионами, данных — где метрики либо более стабильны, либо оценка достаточна, так как новые данные постоянно вставляются с высокой скоростью.

Существуют несколько вариантов увеличения согласованности чтений, если это будет необходимо. Оба примера требуют либо увеличенной сложности, либо накладных расходов — что снижает производительность запросов и делает более сложным масштабирование ClickHouse. **Мы рекомендуем эти подходы только в случае абсолютной необходимости.**

## Согласованная маршрутизация {#consistent-routing}

Чтобы преодолеть некоторые ограничения конечной согласованности, пользователи могут обеспечить маршрутизацию клиентов к одним и тем же репликам. Это полезно в случаях, когда несколько пользователей запрашивают ClickHouse, и результаты должны быть детерминированными между запросами. Хотя результаты могут отличаться, когда новые данные вставляются, следует запрашивать одни и те же реплики, чтобы обеспечить согласованный вид.

Это можно достичь несколькими способами в зависимости от вашей архитектуры и используете ли вы ClickHouse OSS или ClickHouse Cloud.

## ClickHouse Cloud {#clickhouse-cloud}

ClickHouse Cloud использует единую копию данных, хранящуюся в S3 с несколькими вычислительными репликами. Данные доступны каждому узлу реплики, который имеет локальный SSD кэш. Чтобы гарантировать согласованные результаты, пользователи должны лишь обеспечить согласованную маршрутизацию к одному и тому же узлу.

Связь с узлами сервиса ClickHouse Cloud осуществляется через прокси. Соединения протоколов HTTP и Native будут направлены к одному и тому же узлу на период, в течение которого они остаются открытыми. В случае соединений HTTP 1.1 от большинства клиентов это зависит от окна Keep-Alive. Это может быть настроено на большинстве клиентов, например, Node Js. Это также требует конфигурации на стороне сервера, которая будет больше, чем настройки клиента, и установлена на 10 секунд в ClickHouse Cloud.

Чтобы обеспечить согласованную маршрутизацию между соединениями, например, если используется пул соединений или если соединения истекают, пользователи могут либо обеспечить использование одного и того же соединения (что проще для native), либо запросить открытие «липких» конечных точек. Это предоставит набор конечных точек для каждого узла в кластере, позволяя клиентам гарантировать, что запросы будут детерминированно маршрутизироваться.

> Свяжитесь с поддержкой для получения доступа к липким конечным точкам.

## ClickHouse OSS {#clickhouse-oss}

Чтобы достичь такого поведения в OSS, зависит от вашей топологии шардов и реплик и используете ли вы [распределенную таблицу](/engines/table-engines/special/distributed) для выполнения запросов.

Когда у вас только один шард и реплики (часто, так как ClickHouse вертикально масштабируется), пользователи выбирают узел на уровне клиента и запрашивают реплику напрямую, что обеспечивает детерминированный выбор.

Хотя топологии с несколькими шардом и репликами возможны без распределенной таблицы, такие сложные развертывания, как правило, имеют свою собственную инфраструктуру маршрутизации. Поэтому мы предполагаем, что развертывания с более чем одним шардом используют распределенную таблицу (распределенные таблицы могут использоваться с развертываниями с одним шардом, но обычно не нужны).

В этом случае пользователи должны обеспечить выполнение согласованной маршрутизации по узлам на основе свойства, например, `session_id` или `user_id`. Настройки [`prefer_localhost_replica=0`](/operations/settings/settings#prefer_localhost_replica), [`load_balancing=in_order`](/operations/settings/settings#load_balancing) должны быть [установлены в запросе](/operations/settings/query-level). Это гарантирует, что любые локальные реплики шардов имеют приоритет, при этом другие реплики предпочтительнее, как указано в конфигурации — при равном числе ошибок произойдет переход на случайный выбор, если ошибок больше. Альтернативно, можно также использовать [`load_balancing=nearest_hostname`](/operations/settings/settings#load_balancing) для детерминированного выбора шардов.

> При создании распределенной таблицы пользователи указывают кластер. Это определение кластера, указанное в config.xml, перечисляет шары (и их реплики) — что позволяет пользователям контролировать порядок, в котором они используются с каждого узла. Используя это, пользователи могут обеспечить детерминированный выбор.

## Последовательная согласованность {#sequential-consistency}

В исключительных случаях пользователям может понадобиться последовательная согласованность.

Последовательная согласованность в базах данных — это когда операции над базой данных выглядят так, словно они выполняются в некотором последовательном порядке, и этот порядок согласован среди всех процессов, взаимодействующих с базой данных. Это означает, что каждое действие по своему эффекту выглядит мгновенно между его вызовом и завершением, и существует единый, согласованный порядок, в котором все операции наблюдаются любым процессом.

С точки зрения пользователя это обычно проявляется в необходимости записывать данные в ClickHouse и, когда данные читаются, гарантировать, что возвращаются последние вставленные строки. Это можно достичь несколькими способами (в порядке предпочтений):

1. **Чтение/Запись к одному и тому же узлу** - Если вы используете нативный протокол или [сессию для записи/чтения через HTTP](/interfaces/http#default-database), вы должны быть подключены к одной и той же реплике: в этом сценарии вы читаете непосредственно с узла, куда записываете, и тогда ваше чтение всегда будет согласованным.
2. **Синхронизация реплик вручную** - Если вы пишете в одну реплику и читаете из другой, вы можете использовать команду `SYSTEM SYNC REPLICA LIGHTWEIGHT` перед чтением.
3. **Включение последовательной согласованности** - через настройку запроса [`select_sequential_consistency = 1`](/operations/settings/settings#select_sequential_consistency). В OSS также необходимо указать настройку `insert_quorum = 'auto'`.

<br />

Смотрите [здесь](/cloud/reference/shared-merge-tree#consistency) для получения дополнительных деталей по включению этих настроек.

> Использование последовательной согласованности создаст большую нагрузку на ClickHouse Keeper. Результатом может стать
замедление вставок и чтений. SharedMergeTree, используемый в ClickHouse Cloud в качестве основного движка таблиц, последовательная согласованность [производит меньшие накладные расходы и лучше масштабируется](/cloud/reference/shared-merge-tree#consistency). Пользователи OSS должны использовать этот подход с осторожностью и измерять нагрузку на Keeper.

## Поддержка транзакций (ACID) {#transactional-acid-support}

Пользователи, мигрирующие с PostgreSQL, могут быть знакомы с его надежной поддержкой свойств ACID (Атомарность, Согласованность, Изоляция, Долговечность), что делает его надежным выбором для транзакционных баз данных. Атомарность в PostgreSQL гарантирует, что каждая транзакция рассматривается как единое целое, которое либо полностью выполняется, либо полностью откатывается, предотвращая частичные обновления. Согласованность поддерживается путем соблюдения ограничений, триггеров и правил, которые гарантируют, что все транзакции базы данных приводят к допустимому состоянию. Уровни изоляции, от Read Committed до Serializable, поддерживаются в PostgreSQL, что позволяет точно контролировать видимость изменений, сделанных параллельными транзакциями. Наконец, Долговечность обеспечивается с помощью журналов записи впереди (WAL), гарантируя, что после фиксации транзакции она остается таковой, даже в случае сбоя системы.

Эти свойства характерны для OLTP баз данных, которые действуют как источник истины.

Хотя они мощные, это связано с внутренними ограничениями и делает сложными масштабирование PB. ClickHouse идет на компромиссы в этих свойствах, чтобы обеспечить быстрые аналитические запросы в масштабе, поддерживая при этом высокую пропускную способность записи.

ClickHouse предоставляет свойства ACID при [ограниченных конфигурациях](/guides/developer/transactional) — чаще всего, когда используется нереплицированная инстанция движка таблиц MergeTree с одной партицией. Пользователи не должны ожидать этих свойств вне этих случаев и убедиться, что они не являются требованием.

## Сжатие {#compression}

Столбцовая структура хранения ClickHouse означает, что сжатие, как правило, будет значительно лучше по сравнению с Postgres. Следующий график иллюстрирует требования к хранилищу для всех таблиц Stack Overflow в обеих базах данных:

```sql title="Запрос (Postgres)"
SELECT
    schemaname,
    tablename,
    pg_total_relation_size(schemaname || '.' || tablename) AS total_size_bytes,
    pg_total_relation_size(schemaname || '.' || tablename) / (1024 * 1024 * 1024) AS total_size_gb
FROM
    pg_tables s
WHERE
    schemaname = 'public';
```

```sql title="Запрос (ClickHouse)"
SELECT
        `table`,
        formatReadableSize(sum(data_compressed_bytes)) AS compressed_size
FROM system.parts
WHERE (database = 'stackoverflow') AND active
GROUP BY `table`
```

```response title="Ответ"
┌─table───────┬─compressed_size─┐
│ posts       │ 25.17 GiB       │
│ users       │ 846.57 MiB      │
│ badges      │ 513.13 MiB      │
│ comments    │ 7.11 GiB        │
│ votes       │ 1.28 GiB        │
│ posthistory │ 40.44 GiB       │
│ postlinks   │ 79.22 MiB       │
└─────────────┴─────────────────┘
```

Дальнейшие подробности о оптимизации и измерении сжатия можно найти [здесь](/data-compression/compression-in-clickhouse).

## Сопоставление типов данных {#data-type-mappings}

Следующая таблица показывает эквивалентные типы данных ClickHouse для Postgres.

| Тип данных Postgres | Тип ClickHouse |
| --- | --- |
| `DATE` | [Date](/sql-reference/data-types/date) |
| `TIMESTAMP` | [DateTime](/sql-reference/data-types/datetime) |
| `REAL` | [Float32](/sql-reference/data-types/float) |
| `DOUBLE` | [Float64](/sql-reference/data-types/float) |
| `DECIMAL, NUMERIC` | [Decimal](/sql-reference/data-types/decimal) |
| `SMALLINT` | [Int16](/sql-reference/data-types/int-uint) |
| `INTEGER` | [Int32](/sql-reference/data-types/int-uint) |
| `BIGINT` | [Int64](/sql-reference/data-types/int-uint) |
| `SERIAL` | [UInt32](/sql-reference/data-types/int-uint) |
| `BIGSERIAL` | [UInt64](/sql-reference/data-types/int-uint) |
| `TEXT, CHAR, BPCHAR` | [String](/sql-reference/data-types/string) |
| `INTEGER` | Nullable([Int32](/sql-reference/data-types/int-uint)) |
| `ARRAY` | [Array](/sql-reference/data-types/array) |
| `FLOAT4` | [Float32](/sql-reference/data-types/float) |
| `BOOLEAN` | [Bool](/sql-reference/data-types/boolean) |
| `VARCHAR` | [String](/sql-reference/data-types/string) |
| `BIT` | [String](/sql-reference/data-types/string) |
| `BIT VARYING` | [String](/sql-reference/data-types/string) |
| `BYTEA` | [String](/sql-reference/data-types/string) |
| `NUMERIC` | [Decimal](/sql-reference/data-types/decimal) |
| `GEOGRAPHY` | [Point](/sql-reference/data-types/geo#point), [Ring](/sql-reference/data-types/geo#ring), [Polygon](/sql-reference/data-types/geo#polygon), [MultiPolygon](/sql-reference/data-types/geo#multipolygon) |
| `GEOMETRY` | [Point](/sql-reference/data-types/geo#point), [Ring](/sql-reference/data-types/geo#ring), [Polygon](/sql-reference/data-types/geo#polygon), [MultiPolygon](/sql-reference/data-types/geo#multipolygon) |
| `INET` | [IPv4](/sql-reference/data-types/ipv4), [IPv6](/sql-reference/data-types/ipv6) |
| `MACADDR` | [String](/sql-reference/data-types/string) |
| `CIDR` | [String](/sql-reference/data-types/string) |
| `HSTORE` | [Map(K, V)](/sql-reference/data-types/map), [Map](/sql-reference/data-types/map)(K,[Variant](/sql-reference/data-types/variant)) |
| `UUID` | [UUID](/sql-reference/data-types/uuid) |
| `ARRAY<T>` | [ARRAY(T)](/sql-reference/data-types/array) |
| `JSON*` | [String](/sql-reference/data-types/string), [Variant](/sql-reference/data-types/variant), [Nested](/sql-reference/data-types/nested-data-structures/nested#nestedname1-type1-name2-type2-), [Tuple](/sql-reference/data-types/tuple) |
| `JSONB` | [String](/sql-reference/data-types/string) |

*\* Продуктовая поддержка JSON в ClickHouse находится в разработке. В настоящее время пользователи могут либо отображать JSON как String и использовать [JSON функции](/sql-reference/functions/json-functions), либо напрямую отображать JSON на [Tuples](/sql-reference/data-types/tuple) и [Nested](/sql-reference/data-types/nested-data-structures/nested), если структура предсказу可емая. Читать больше о JSON [здесь](/integrations/data-formats/json/overview).*
