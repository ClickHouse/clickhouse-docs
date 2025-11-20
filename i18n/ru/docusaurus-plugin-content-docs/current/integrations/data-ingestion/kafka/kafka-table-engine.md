---
sidebar_label: 'Движок таблиц Kafka'
sidebar_position: 5
slug: /integrations/kafka/kafka-table-engine
description: 'Использование движка таблиц Kafka'
title: 'Использование движка таблиц Kafka'
doc_type: 'guide'
keywords: ['kafka', 'table engine', 'streaming', 'real-time', 'message queue']
---

import Image from '@theme/IdealImage';
import kafka_01 from '@site/static/images/integrations/data-ingestion/kafka/kafka_01.png';
import kafka_02 from '@site/static/images/integrations/data-ingestion/kafka/kafka_02.png';
import kafka_03 from '@site/static/images/integrations/data-ingestion/kafka/kafka_03.png';
import kafka_04 from '@site/static/images/integrations/data-ingestion/kafka/kafka_04.png';


# Использование движка таблиц Kafka

Движок таблиц Kafka можно использовать для [**чтения** данных из](#kafka-to-clickhouse) и [**записи** данных в](#clickhouse-to-kafka) Apache Kafka и другие брокеры, совместимые с Kafka API (например, Redpanda, Amazon MSK).

### Из Kafka в ClickHouse {#kafka-to-clickhouse}

:::note
Если вы используете ClickHouse Cloud, мы рекомендуем использовать [ClickPipes](/integrations/clickpipes). ClickPipes изначально поддерживает подключения к частным сетям, независимое масштабирование ресурсов приёма данных и кластера, а также комплексный мониторинг потоковой передачи данных из Kafka в ClickHouse.
:::

Для использования движка таблиц Kafka необходимо иметь общее представление о [материализованных представлениях ClickHouse](../../../guides/developer/cascading-materialized-views.md).

#### Обзор {#overview}

Сначала рассмотрим наиболее распространённый сценарий использования: применение движка таблиц Kafka для вставки данных в ClickHouse из Kafka.

Движок таблиц Kafka позволяет ClickHouse читать данные непосредственно из топика Kafka. Хотя это полезно для просмотра сообщений в топике, движок по своей архитектуре допускает только однократное извлечение данных, то есть при выполнении запроса к таблице он потребляет данные из очереди и увеличивает смещение потребителя перед возвратом результатов. Фактически данные невозможно прочитать повторно без сброса этих смещений.

Чтобы сохранить данные, прочитанные из движка таблиц, необходим способ захвата данных и вставки их в другую таблицу. Материализованные представления на основе триггеров изначально предоставляют эту функциональность. Материализованное представление инициирует чтение из движка таблиц, получая пакеты документов. Предложение TO определяет назначение данных — обычно это таблица [семейства MergeTree](../../../engines/table-engines/mergetree-family/index.md). Этот процесс визуализирован ниже:

<Image
  img={kafka_01}
  size='lg'
  alt='Диаграмма архитектуры движка таблиц Kafka'
  style={{ width: "80%" }}
/>

#### Шаги {#steps}

##### 1. Подготовка {#1-prepare}

Если у вас есть данные в целевом топике, вы можете адаптировать следующие инструкции для использования с вашим набором данных. В качестве альтернативы предоставлен образец набора данных GitHub [здесь](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson). Этот набор данных используется в примерах ниже и содержит сокращённую схему и подмножество строк (в частности, ограничиваемся событиями GitHub, касающимися [репозитория ClickHouse](https://github.com/ClickHouse/ClickHouse)), по сравнению с полным набором данных, доступным [здесь](https://ghe.clickhouse.tech/), для краткости. Этого достаточно для работы большинства запросов, [опубликованных с набором данных](https://ghe.clickhouse.tech/).

##### 2. Настройка ClickHouse {#2-configure-clickhouse}

Этот шаг необходим при подключении к защищённому Kafka. Эти настройки нельзя передать через SQL DDL команды, они должны быть настроены в файле config.xml ClickHouse. Предполагается, что вы подключаетесь к экземпляру, защищённому SASL. Это самый простой метод при взаимодействии с Confluent Cloud.

```xml
<clickhouse>
   <kafka>
       <sasl_username>username</sasl_username>
       <sasl_password>password</sasl_password>
       <security_protocol>sasl_ssl</security_protocol>
       <sasl_mechanisms>PLAIN</sasl_mechanisms>
   </kafka>
</clickhouse>
```

Поместите приведённый выше фрагмент в новый файл в каталоге conf.d/ или объедините его с существующими файлами конфигурации. Список настроек, которые можно настроить, см. [здесь](../../../engines/table-engines/integrations/kafka.md#configuration).

Также создадим базу данных с именем `KafkaEngine` для использования в этом руководстве:

```sql
CREATE DATABASE KafkaEngine;
```

После создания базы данных необходимо переключиться на неё:

```sql
USE KafkaEngine;
```

##### 3. Создание целевой таблицы {#3-create-the-destination-table}

Подготовьте целевую таблицу. В примере ниже используется сокращённая схема GitHub для краткости. Обратите внимание, что хотя используется движок таблиц MergeTree, этот пример можно легко адаптировать для любого члена [семейства MergeTree](../../../engines/table-engines/mergetree-family/index.md).


```sql
CREATE TABLE github
(
    file_time DateTime,
    event_type Enum('CommitCommentEvent' = 1, 'CreateEvent' = 2, 'DeleteEvent' = 3, 'ForkEvent' = 4, 'GollumEvent' = 5, 'IssueCommentEvent' = 6, 'IssuesEvent' = 7, 'MemberEvent' = 8, 'PublicEvent' = 9, 'PullRequestEvent' = 10, 'PullRequestReviewCommentEvent' = 11, 'PushEvent' = 12, 'ReleaseEvent' = 13, 'SponsorshipEvent' = 14, 'WatchEvent' = 15, 'GistEvent' = 16, 'FollowEvent' = 17, 'DownloadEvent' = 18, 'PullRequestReviewEvent' = 19, 'ForkApplyEvent' = 20, 'Event' = 21, 'TeamAddEvent' = 22),
    actor_login LowCardinality(String),
    repo_name LowCardinality(String),
    created_at DateTime,
    updated_at DateTime,
    action Enum('none' = 0, 'created' = 1, 'added' = 2, 'edited' = 3, 'deleted' = 4, 'opened' = 5, 'closed' = 6, 'reopened' = 7, 'assigned' = 8, 'unassigned' = 9, 'labeled' = 10, 'unlabeled' = 11, 'review_requested' = 12, 'review_request_removed' = 13, 'synchronize' = 14, 'started' = 15, 'published' = 16, 'update' = 17, 'create' = 18, 'fork' = 19, 'merged' = 20),
    comment_id UInt64,
    path String,
    ref LowCardinality(String),
    ref_type Enum('none' = 0, 'branch' = 1, 'tag' = 2, 'repository' = 3, 'unknown' = 4),
    creator_user_login LowCardinality(String),
    number UInt32,
    title String,
    labels Array(LowCardinality(String)),
    state Enum('none' = 0, 'open' = 1, 'closed' = 2),
    assignee LowCardinality(String),
    assignees Array(LowCardinality(String)),
    closed_at DateTime,
    merged_at DateTime,
    merge_commit_sha String,
    requested_reviewers Array(LowCardinality(String)),
    merged_by LowCardinality(String),
    review_comments UInt32,
    member_login LowCardinality(String)
) ENGINE = MergeTree ORDER BY (event_type, repo_name, created_at)
```

##### 4. Создание и заполнение топика {#4-create-and-populate-the-topic}

Далее создадим топик. Для этого можно использовать несколько инструментов. Если Kafka запущена локально на машине или внутри Docker-контейнера, хорошо подходит [RPK](https://docs.redpanda.com/current/get-started/rpk-install/). Создать топик с именем `github` и 5 партициями можно, выполнив следующую команду:

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

Если Kafka запущена в Confluent Cloud, удобнее использовать [Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records):

```bash
confluent kafka topic create --if-not-exists github
```

Теперь необходимо заполнить топик данными, что можно сделать с помощью [kcat](https://github.com/edenhill/kcat). Если Kafka запущена локально с отключенной аутентификацией, выполните команду, аналогичную следующей:

```bash
cat github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
```

Если кластер Kafka использует SASL для аутентификации, выполните следующую команду:

```bash
cat github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
  -X security.protocol=sasl_ssl \
  -X sasl.mechanisms=PLAIN \
  -X sasl.username=<username>  \
  -X sasl.password=<password> \
```


Набор данных содержит 200 000 строк, поэтому его загрузка должна занять всего несколько секунд. Если вы хотите работать с более крупным набором данных, обратитесь к [разделу о больших наборах данных](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets) в репозитории GitHub [ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples).

##### 5. Создание движка таблицы Kafka {#5-create-the-kafka-table-engine}

Приведенный ниже пример создает движок таблицы с той же схемой, что и таблица MergeTree. Это не является строго обязательным, поскольку в целевой таблице могут присутствовать столбцы-псевдонимы или эфемерные столбцы. Однако настройки важны — обратите внимание на использование `JSONEachRow` в качестве формата данных для чтения JSON из топика Kafka. Значения `github` и `clickhouse` представляют собой имя топика и имя группы потребителей соответственно. Топики могут быть списком значений.

```sql
CREATE TABLE github_queue
(
    file_time DateTime,
    event_type Enum('CommitCommentEvent' = 1, 'CreateEvent' = 2, 'DeleteEvent' = 3, 'ForkEvent' = 4, 'GollumEvent' = 5, 'IssueCommentEvent' = 6, 'IssuesEvent' = 7, 'MemberEvent' = 8, 'PublicEvent' = 9, 'PullRequestEvent' = 10, 'PullRequestReviewCommentEvent' = 11, 'PushEvent' = 12, 'ReleaseEvent' = 13, 'SponsorshipEvent' = 14, 'WatchEvent' = 15, 'GistEvent' = 16, 'FollowEvent' = 17, 'DownloadEvent' = 18, 'PullRequestReviewEvent' = 19, 'ForkApplyEvent' = 20, 'Event' = 21, 'TeamAddEvent' = 22),
    actor_login LowCardinality(String),
    repo_name LowCardinality(String),
    created_at DateTime,
    updated_at DateTime,
    action Enum('none' = 0, 'created' = 1, 'added' = 2, 'edited' = 3, 'deleted' = 4, 'opened' = 5, 'closed' = 6, 'reopened' = 7, 'assigned' = 8, 'unassigned' = 9, 'labeled' = 10, 'unlabeled' = 11, 'review_requested' = 12, 'review_request_removed' = 13, 'synchronize' = 14, 'started' = 15, 'published' = 16, 'update' = 17, 'create' = 18, 'fork' = 19, 'merged' = 20),
    comment_id UInt64,
    path String,
    ref LowCardinality(String),
    ref_type Enum('none' = 0, 'branch' = 1, 'tag' = 2, 'repository' = 3, 'unknown' = 4),
    creator_user_login LowCardinality(String),
    number UInt32,
    title String,
    labels Array(LowCardinality(String)),
    state Enum('none' = 0, 'open' = 1, 'closed' = 2),
    assignee LowCardinality(String),
    assignees Array(LowCardinality(String)),
    closed_at DateTime,
    merged_at DateTime,
    merge_commit_sha String,
    requested_reviewers Array(LowCardinality(String)),
    merged_by LowCardinality(String),
    review_comments UInt32,
    member_login LowCardinality(String)
)
   ENGINE = Kafka('kafka_host:9092', 'github', 'clickhouse',
            'JSONEachRow') SETTINGS kafka_thread_per_consumer = 0, kafka_num_consumers = 1;
```

Настройки движка и оптимизация производительности рассматриваются ниже. На данном этапе простой запрос SELECT к таблице `github_queue` должен прочитать несколько строк. Обратите внимание, что это переместит смещения потребителя вперед, что не позволит повторно прочитать эти строки без [сброса](#common-operations). Обратите внимание на ограничение и обязательный параметр `stream_like_engine_allow_direct_select`.

##### 6. Создание материализованного представления {#6-create-the-materialized-view}

Материализованное представление соединит две ранее созданные таблицы, читая данные из движка таблицы Kafka и вставляя их в целевую таблицу MergeTree. Можно выполнять различные преобразования данных. Мы выполним простое чтение и вставку. Использование \* предполагает, что имена столбцов идентичны (с учетом регистра).

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```


В момент создания материализованное представление подключается к движку Kafka и начинает чтение, вставляя строки в целевую таблицу. Этот процесс будет продолжаться бесконечно, при этом последующие сообщения, вставляемые в Kafka, будут потребляться. Вы можете повторно запустить скрипт вставки, чтобы добавить дополнительные сообщения в Kafka.

##### 7. Подтвердите вставку строк {#7-confirm-rows-have-been-inserted}

Убедитесь, что данные присутствуют в целевой таблице:

```sql
SELECT count() FROM github;
```

Вы должны увидеть 200 000 строк:

```response
┌─count()─┐
│  200000 │
└─────────┘
```

#### Общие операции {#common-operations}

##### Остановка и перезапуск потребления сообщений {#stopping--restarting-message-consumption}

Чтобы остановить потребление сообщений, можно отсоединить таблицу движка Kafka:

```sql
DETACH TABLE github_queue;
```

Это не повлияет на смещения группы потребителей. Чтобы возобновить потребление и продолжить с предыдущего смещения, повторно присоедините таблицу.

```sql
ATTACH TABLE github_queue;
```

##### Добавление метаданных Kafka {#adding-kafka-metadata}

Может быть полезно отслеживать метаданные из исходных сообщений Kafka после их загрузки в ClickHouse. Например, может потребоваться узнать, какая часть конкретного топика или партиции была потреблена. Для этой цели движок таблиц Kafka предоставляет несколько [виртуальных столбцов](../../../engines/table-engines/index.md#table_engines-virtual_columns). Они могут быть сохранены как столбцы в целевой таблице путем изменения схемы и оператора SELECT материализованного представления.

Сначала выполним операцию остановки, описанную выше, перед добавлением столбцов в целевую таблицу.

```sql
DETACH TABLE github_queue;
```

Ниже добавляются информационные столбцы для идентификации исходного топика и партиции, из которой произошла строка.

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

Далее необходимо убедиться, что виртуальные столбцы сопоставлены должным образом.
Виртуальные столбцы имеют префикс `_`.
Полный список виртуальных столбцов можно найти [здесь](../../../engines/table-engines/integrations/kafka.md#virtual-columns).

Чтобы обновить таблицу виртуальными столбцами, необходимо удалить материализованное представление, повторно присоединить таблицу движка Kafka и заново создать материализованное представление.

```sql
DROP VIEW github_mv;
```

```sql
ATTACH TABLE github_queue;
```

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *, _topic AS topic, _partition as partition
FROM github_queue;
```

Вновь потребленные строки должны содержать метаданные.

```sql
SELECT actor_login, event_type, created_at, topic, partition
FROM github
LIMIT 10;
```

Результат выглядит следующим образом:

| actor_login   | event_type         | created_at          | topic  | partition |
| :------------ | :----------------- | :------------------ | :----- | :-------- |
| IgorMinar     | CommitCommentEvent | 2011-02-12 02:22:00 | github | 0         |
| queeup        | CommitCommentEvent | 2011-02-12 02:23:23 | github | 0         |
| IgorMinar     | CommitCommentEvent | 2011-02-12 02:23:24 | github | 0         |
| IgorMinar     | CommitCommentEvent | 2011-02-12 02:24:50 | github | 0         |
| IgorMinar     | CommitCommentEvent | 2011-02-12 02:25:20 | github | 0         |
| dapi          | CommitCommentEvent | 2011-02-12 06:18:36 | github | 0         |
| sourcerebels  | CommitCommentEvent | 2011-02-12 06:34:10 | github | 0         |
| jamierumbelow | CommitCommentEvent | 2011-02-12 12:21:40 | github | 0         |
| jpn           | CommitCommentEvent | 2011-02-12 12:24:31 | github | 0         |
| Oxonium       | CommitCommentEvent | 2011-02-12 12:31:28 | github | 0         |

##### Изменение настроек движка Kafka {#modify-kafka-engine-settings}

Рекомендуется удалить таблицу движка Kafka и заново создать её с новыми настройками. Материализованное представление не требует изменений в процессе этой операции — потребление сообщений возобновится после пересоздания таблицы движка Kafka.

##### Отладка проблем {#debugging-issues}


Ошибки, такие как проблемы аутентификации, не отображаются в ответах на DDL движка Kafka. Для диагностики проблем рекомендуется использовать основной файл журнала ClickHouse clickhouse-server.err.log. Дополнительное трассировочное логирование для базовой клиентской библиотеки Kafka [librdkafka](https://github.com/edenhill/librdkafka) можно включить через конфигурацию.

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### Обработка некорректных сообщений {#handling-malformed-messages}

Kafka часто используется как «свалка» для данных. Это приводит к топикам, содержащим смешанные форматы сообщений и несогласованные имена полей. Избегайте этого и используйте возможности Kafka, такие как Kafka Streams или ksqlDB, чтобы обеспечить правильную структуру и согласованность сообщений перед вставкой в Kafka. Если эти варианты недоступны, ClickHouse предоставляет некоторые функции, которые могут помочь.

- Обрабатывайте поля сообщений как строки. Функции можно использовать в операторе материализованного представления для выполнения очистки и приведения типов при необходимости. Это не должно быть производственным решением, но может помочь при разовой загрузке данных.
- Если вы потребляете JSON из топика, используя формат JSONEachRow, используйте настройку [`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields). При записи данных по умолчанию ClickHouse выбрасывает исключение, если входные данные содержат столбцы, отсутствующие в целевой таблице. Однако если эта опция включена, эти лишние столбцы будут проигнорированы. Опять же, это не производственное решение и может вызвать путаницу у других пользователей.
- Рассмотрите настройку `kafka_skip_broken_messages`. Она требует от пользователя указать уровень допустимости некорректных сообщений на блок — в контексте kafka_max_block_size. Если этот порог превышен (измеряется в абсолютном количестве сообщений), будет восстановлено обычное поведение с исключениями, а остальные сообщения будут пропущены.

##### Семантика доставки и проблемы с дубликатами {#delivery-semantics-and-challenges-with-duplicates}

Движок таблиц Kafka имеет семантику «как минимум один раз» (at-least-once). Дубликаты возможны в нескольких известных редких обстоятельствах. Например, сообщения могут быть прочитаны из Kafka и успешно вставлены в ClickHouse. До того как новое смещение будет зафиксировано, соединение с Kafka теряется. В этой ситуации требуется повторная попытка обработки блока. Блок может быть [дедуплицирован](/engines/table-engines/mergetree-family/replication) с использованием распределённой таблицы или ReplicatedMergeTree в качестве целевой таблицы. Хотя это снижает вероятность дублирования строк, это зависит от идентичности блоков. События, такие как ребалансировка Kafka, могут нарушить это предположение, вызывая дубликаты в редких случаях.

##### Вставки на основе кворума {#quorum-based-inserts}

Вам могут потребоваться [вставки на основе кворума](/operations/settings/settings#insert_quorum) в случаях, когда требуются более высокие гарантии доставки в ClickHouse. Это нельзя установить для материализованного представления или целевой таблицы. Однако это можно установить для профилей пользователей, например:

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouse в Kafka {#clickhouse-to-kafka}

Хотя это более редкий случай использования, данные ClickHouse также могут быть сохранены в Kafka. Например, мы вручную вставим строки в движок таблиц Kafka. Эти данные будут прочитаны тем же движком Kafka, чьё материализованное представление поместит данные в таблицу MergeTree. Наконец, мы продемонстрируем применение материализованных представлений при вставках в Kafka для чтения таблиц из существующих исходных таблиц.

#### Шаги {#steps-1}

Наша начальная цель лучше всего проиллюстрирована:

<Image img={kafka_02} size='lg' alt='Kafka table engine with inserts diagram' />

Мы предполагаем, что у вас созданы таблицы и представления в соответствии с шагами для [Kafka в ClickHouse](#kafka-to-clickhouse) и что топик полностью обработан.

##### 1. Прямая вставка строк {#1-inserting-rows-directly}

Сначала проверьте количество строк в целевой таблице.

```sql
SELECT count() FROM github;
```

У вас должно быть 200 000 строк:

```response
┌─count()─┐
│  200000 │
└─────────┘
```

Теперь вставьте строки из целевой таблицы GitHub обратно в движок таблиц Kafka github_queue. Обратите внимание, как мы используем формат JSONEachRow и ограничиваем выборку до 100 строк с помощью LIMIT.

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

Пересчитайте строки в GitHub, чтобы подтвердить, что их количество увеличилось на 100. Как показано на диаграмме выше, строки были вставлены в Kafka через движок таблиц Kafka, затем повторно прочитаны тем же движком и вставлены в целевую таблицу GitHub нашим материализованным представлением!

```sql
SELECT count() FROM github;
```


Вы должны увидеть 100 дополнительных строк:

```response
┌─count()─┐
│  200100 │
└─────────┘
```

##### 2. Использование материализованных представлений {#2-using-materialized-views}

Материализованные представления можно использовать для отправки сообщений в движок Kafka (и топик) при вставке данных в таблицу. При вставке строк в таблицу GitHub срабатывает материализованное представление, которое вставляет строки обратно в движок Kafka и в новый топик. Это лучше всего показано на схеме:

<Image
  img={kafka_03}
  size='lg'
  alt='Схема табличного движка Kafka с материализованными представлениями'
/>

Создайте новый топик Kafka `github_out` или аналогичный. Убедитесь, что табличный движок Kafka `github_out_queue` указывает на этот топик.

```sql
CREATE TABLE github_out_queue
(
    file_time DateTime,
    event_type Enum('CommitCommentEvent' = 1, 'CreateEvent' = 2, 'DeleteEvent' = 3, 'ForkEvent' = 4, 'GollumEvent' = 5, 'IssueCommentEvent' = 6, 'IssuesEvent' = 7, 'MemberEvent' = 8, 'PublicEvent' = 9, 'PullRequestEvent' = 10, 'PullRequestReviewCommentEvent' = 11, 'PushEvent' = 12, 'ReleaseEvent' = 13, 'SponsorshipEvent' = 14, 'WatchEvent' = 15, 'GistEvent' = 16, 'FollowEvent' = 17, 'DownloadEvent' = 18, 'PullRequestReviewEvent' = 19, 'ForkApplyEvent' = 20, 'Event' = 21, 'TeamAddEvent' = 22),
    actor_login LowCardinality(String),
    repo_name LowCardinality(String),
    created_at DateTime,
    updated_at DateTime,
    action Enum('none' = 0, 'created' = 1, 'added' = 2, 'edited' = 3, 'deleted' = 4, 'opened' = 5, 'closed' = 6, 'reopened' = 7, 'assigned' = 8, 'unassigned' = 9, 'labeled' = 10, 'unlabeled' = 11, 'review_requested' = 12, 'review_request_removed' = 13, 'synchronize' = 14, 'started' = 15, 'published' = 16, 'update' = 17, 'create' = 18, 'fork' = 19, 'merged' = 20),
    comment_id UInt64,
    path String,
    ref LowCardinality(String),
    ref_type Enum('none' = 0, 'branch' = 1, 'tag' = 2, 'repository' = 3, 'unknown' = 4),
    creator_user_login LowCardinality(String),
    number UInt32,
    title String,
    labels Array(LowCardinality(String)),
    state Enum('none' = 0, 'open' = 1, 'closed' = 2),
    assignee LowCardinality(String),
    assignees Array(LowCardinality(String)),
    closed_at DateTime,
    merged_at DateTime,
    merge_commit_sha String,
    requested_reviewers Array(LowCardinality(String)),
    merged_by LowCardinality(String),
    review_comments UInt32,
    member_login LowCardinality(String)
)
   ENGINE = Kafka('host:port', 'github_out', 'clickhouse_out',
            'JSONEachRow') SETTINGS kafka_thread_per_consumer = 0, kafka_num_consumers = 1;
```

Теперь создайте новое материализованное представление `github_out_mv`, указывающее на таблицу GitHub, которое будет вставлять строки в указанный выше движок при срабатывании. В результате добавления в таблицу GitHub будут отправляться в наш новый топик Kafka.

```sql
CREATE MATERIALIZED VIEW github_out_mv TO github_out_queue AS
SELECT file_time, event_type, actor_login, repo_name,
       created_at, updated_at, action, comment_id, path,
       ref, ref_type, creator_user_login, number, title,
       labels, state, assignee, assignees, closed_at, merged_at,
       merge_commit_sha, requested_reviewers, merged_by,
       review_comments, member_login
FROM github
FORMAT JsonEachRow;
```


Если вы вставите данные в исходный топик github, созданный в рамках раздела [Kafka в ClickHouse](#kafka-to-clickhouse), документы автоматически появятся в топике "github_clickhouse". Подтвердите это с помощью стандартных инструментов Kafka. Например, ниже мы вставляем 100 строк в топик github, используя [kcat](https://github.com/edenhill/kcat) для топика, размещенного в Confluent Cloud:

```sql
head -n 10 github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
  -X security.protocol=sasl_ssl \
  -X sasl.mechanisms=PLAIN \
  -X sasl.username=<username> \
  -X sasl.password=<password>
```

Чтение из топика `github_out` должно подтвердить доставку сообщений.

```sql
kcat -C \
  -b <host>:<port> \
  -t github_out \
  -X security.protocol=sasl_ssl \
  -X sasl.mechanisms=PLAIN \
  -X sasl.username=<username> \
  -X sasl.password=<password> \
  -e -q |
wc -l
```

Хотя это развернутый пример, он демонстрирует возможности материализованных представлений при использовании совместно с движком Kafka.

### Кластеры и производительность {#clusters-and-performance}

#### Работа с кластерами ClickHouse {#working-with-clickhouse-clusters}

С помощью групп потребителей Kafka несколько экземпляров ClickHouse могут читать из одного и того же топика. Каждый потребитель будет назначен на раздел топика в соотношении 1:1. При масштабировании потребления ClickHouse с использованием движка таблиц Kafka учитывайте, что общее количество потребителей в кластере не может превышать количество разделов в топике. Поэтому заранее убедитесь, что разбиение топика на разделы настроено соответствующим образом.

Несколько экземпляров ClickHouse могут быть настроены на чтение из топика с использованием одного и того же идентификатора группы потребителей, указанного при создании движка таблиц Kafka. Таким образом, каждый экземпляр будет читать из одного или нескольких разделов, вставляя сегменты в свою локальную целевую таблицу. Целевые таблицы, в свою очередь, могут быть настроены на использование ReplicatedMergeTree для обработки репликации данных. Этот подход позволяет масштабировать чтение из Kafka вместе с кластером ClickHouse при условии наличия достаточного количества разделов Kafka.

<Image
  img={kafka_04}
  size='lg'
  alt='Диаграмма движка таблиц Kafka с кластерами ClickHouse'
/>

#### Настройка производительности {#tuning-performance}

При повышении производительности пропускной способности таблиц движка Kafka учитывайте следующее:

- Производительность будет варьироваться в зависимости от размера сообщений, формата и типов целевых таблиц. Скорость 100 тыс. строк/сек на одном движке таблиц следует считать достижимой. По умолчанию сообщения читаются блоками, управляемыми параметром kafka_max_block_size. По умолчанию он установлен в значение [max_insert_block_size](/operations/settings/settings#max_insert_block_size), равное 1 048 576. Если сообщения не являются чрезвычайно большими, это значение почти всегда следует увеличивать. Значения от 500 тыс. до 1 млн встречаются довольно часто. Протестируйте и оцените влияние на производительность пропускной способности.
- Количество потребителей для движка таблиц можно увеличить с помощью kafka_num_consumers. Однако по умолчанию вставки будут линеаризованы в одном потоке, если только kafka_thread_per_consumer не изменен со значения по умолчанию 0. Установите это значение в 1, чтобы обеспечить параллельное выполнение сбросов. Обратите внимание, что создание таблицы движка Kafka с N потребителями (и kafka_thread_per_consumer=1) логически эквивалентно созданию N движков Kafka, каждый с материализованным представлением и kafka_thread_per_consumer=0.
- Увеличение количества потребителей не является бесплатной операцией. Каждый потребитель поддерживает свои собственные буферы и потоки, увеличивая нагрузку на сервер. Учитывайте накладные расходы потребителей и по возможности сначала масштабируйте линейно по всему кластеру.
- Если пропускная способность сообщений Kafka переменная и задержки допустимы, рассмотрите возможность увеличения stream_flush_interval_ms для обеспечения сброса более крупных блоков.
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size) устанавливает количество потоков, выполняющих фоновые задачи. Эти потоки используются для потоковой передачи Kafka. Эта настройка применяется при запуске сервера ClickHouse и не может быть изменена в пользовательском сеансе, по умолчанию равна 16. Если вы видите таймауты в логах, может быть целесообразно увеличить это значение.
- Для связи с Kafka используется библиотека librdkafka, которая сама создает потоки. Большое количество таблиц Kafka или потребителей может привести к большому количеству переключений контекста. Либо распределите эту нагрузку по кластеру, реплицируя только целевые таблицы, если это возможно, либо рассмотрите возможность использования движка таблиц для чтения из нескольких топиков — поддерживается список значений. Несколько материализованных представлений могут читать из одной таблицы, каждое фильтрует данные из конкретного топика.


Любые изменения настроек должны быть протестированы. Рекомендуется отслеживать задержки потребителей Kafka, чтобы убедиться в правильном масштабировании.

#### Дополнительные настройки {#additional-settings}

Помимо рассмотренных выше настроек, могут представлять интерес следующие:

- [Kafka_max_wait_ms](/operations/settings/settings#kafka_max_wait_ms) — время ожидания в миллисекундах перед повторной попыткой чтения сообщений из Kafka. Устанавливается на уровне профиля пользователя, значение по умолчанию — 5000.

[Все настройки](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md) из базовой библиотеки librdkafka также могут быть размещены в конфигурационных файлах ClickHouse внутри элемента _kafka_ — имена настроек должны быть XML-элементами, в которых точки заменены на подчеркивания, например:

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

Это экспертные настройки, поэтому рекомендуется обратиться к документации Kafka для получения подробных объяснений.
