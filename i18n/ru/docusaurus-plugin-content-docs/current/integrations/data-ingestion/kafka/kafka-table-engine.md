---
sidebar_label: 'Движок таблиц Kafka'
sidebar_position: 5
slug: /integrations/kafka/kafka-table-engine
description: 'Использование движка таблиц Kafka'
title: 'Использование движка таблиц Kafka'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Image from '@theme/IdealImage';
import kafka_01 from '@site/static/images/integrations/data-ingestion/kafka/kafka_01.png';
import kafka_02 from '@site/static/images/integrations/data-ingestion/kafka/kafka_02.png';
import kafka_03 from '@site/static/images/integrations/data-ingestion/kafka/kafka_03.png';
import kafka_04 from '@site/static/images/integrations/data-ingestion/kafka/kafka_04.png';


# Использование движка таблиц Kafka

<CloudNotSupportedBadge/>

:::note
Движок таблиц Kafka не поддерживается в [ClickHouse Cloud](https://clickhouse.com/cloud). Пожалуйста, рассмотрите [ClickPipes](../clickpipes/kafka.md) или [Kafka Connect](./kafka-clickhouse-connect-sink.md)
:::

### Kafka в ClickHouse {#kafka-to-clickhouse}

Чтобы использовать движок таблиц Kafka, вы должны быть в целом знакомы с [материализованными представлениями ClickHouse](../../../guides/developer/cascading-materialized-views.md).

#### Обзор {#overview}

Сначала мы сосредоточимся на самом распространенном варианте использования: использовании движка таблиц Kafka для вставки данных в ClickHouse из Kafka.

Движок таблиц Kafka позволяет ClickHouse читать напрямую из темы Kafka. Хотя это полезно для просмотра сообщений в теме, движок по своей сути допускает только одноразовое извлечение, т.е. когда запрос выдается к таблице, он потребляет данные из очереди и увеличивает смещение потребителя перед тем, как вернуть результаты вызывающему. Данные не могут быть повторно прочитаны без сброса этих смещений.

Чтобы сохранить эти данные из чтения движка таблиц, нам нужен способ захвата данных и вставки их в другую таблицу. Материализованные представления на основе триггеров обеспечивают эту функциональность. Материализованное представление инициирует чтение на движке таблиц, получая партии документов. Условие TO определяет назначение данных - обычно это таблица семейства [Merge Tree](../../../engines/table-engines/mergetree-family/index.md). Этот процесс визуализирован ниже:

<Image img={kafka_01} size="lg" alt="Схема архитектуры движка таблиц Kafka" style={{width: '80%'}} />

#### Шаги {#steps}

##### 1. Подготовка {#1-prepare}

Если у вас есть данные, заполненные в целевой теме, вы можете адаптировать следующее для использования в вашем наборе данных. В качестве альтернативы, образец набора данных Github предоставлен [здесь](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson). Этот набор данных используется в приведенных ниже примерах и использует сокращенную схему и подмножество строк (в частности, мы ограничиваемся событиями Github, касающимися [репозитория ClickHouse](https://github.com/ClickHouse/ClickHouse)), по сравнению с полным набором данных, доступным [здесь](https://ghe.clickhouse.tech/), для краткости. Это все еще достаточно для большинства запросов [опубликованных с набором данных](https://ghe.clickhouse.tech/).

##### 2. Настройка ClickHouse {#2-configure-clickhouse}

Этот шаг необходим, если вы подключаетесь к защищенному Kafka. Эти настройки не могут быть переданы через команды SQL DDL и должны быть настроены в конфигурационном файле ClickHouse config.xml. Мы предполагаем, что вы подключаетесь к экземпляру, защищенному SASL. Это самый простой способ взаимодействия с Confluent Cloud.

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

Разместите приведенный выше фрагмент внутри нового файла в каталоге conf.d/ или объедините его с существующими конфигурационными файлами. Для настроек, которые можно настроить, смотрите [здесь](../../../engines/table-engines/integrations/kafka.md#configuration).

Мы также создадим базу данных с именем `KafkaEngine`, чтобы использовать ее в этом учебнике:

```sql
CREATE DATABASE KafkaEngine;
```

После создания базы данных вам нужно будет переключиться на нее:

```sql
USE KafkaEngine;
```

##### 3. Создание целевой таблицы {#3-create-the-destination-table}

Подготовьте вашу целевую таблицу. В приведенном ниже примере мы используем сокращенную схему GitHub для краткости. Обратите внимание, что хотя мы используем движок таблиц MergeTree, этот пример легко можно адаптировать для любого члена [семьи MergeTree](../../../engines/table-engines/mergetree-family/index.md).

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

##### 4. Создание и заполнение темы {#4-create-and-populate-the-topic}

Далее мы создадим тему. Для этого мы можем использовать несколько инструментов. Если мы запускаем Kafka локально на нашем компьютере или внутри контейнера Docker, [RPK](https://docs.redpanda.com/current/get-started/rpk-install/) отлично подойдет. Мы можем создать тему с именем `github` с 5 партициями, выполнив следующую команду:

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

Если мы запускаем Kafka в Confluent Cloud, нам может потребоваться использовать [Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records):

```bash
confluent kafka topic create --if-not-exists github
```

Теперь нам нужно заполнить эту тему данными, что мы сделаем, используя [kcat](https://github.com/edenhill/kcat). Мы можем выполнить команду, подобную следующей, если мы запускаем Kafka локально с отключенной аутентификацией:

```bash
cat github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
```

Или следующую, если наш кластер Kafka использует SASL для аутентификации:

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

Набор данных содержит 200,000 строк, поэтому он должен быть загружен всего за несколько секунд. Если вы хотите работать с более крупным набором данных, обратите внимание на [раздел больших наборов данных](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets) репозитория [ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples).

##### 5. Создание движка таблиц Kafka {#5-create-the-kafka-table-engine}

Приведенный ниже пример создает движок таблиц с той же схемой, что и таблица слияния. Это не обязательно, так как вы можете иметь псевдонимы или эфемерные колонки в целевой таблице. Тем не менее, настройки важны; обратите внимание на использование `JSONEachRow` в качестве типа данных для потребления JSON из темы Kafka. Значения `github` и `clickhouse` представляют собой имя темы и имена групп потребителей соответственно. Темы могут на самом деле быть списком значений.

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
            'JSONEachRow') settings kafka_thread_per_consumer = 0, kafka_num_consumers = 1;
```

Мы обсудим настройки движка и настройку производительности ниже. На этом этапе простой выбор из таблицы `github_queue` должен читать несколько строк. Обратите внимание, что это переместит смещения потребителей вперед, предотвращая повторное чтение этих строк без [сброса](#common-operations). Обратите внимание на ограничение и необходимый параметр `stream_like_engine_allow_direct_select.`

##### 6. Создание материализованного представления {#6-create-the-materialized-view}

Материализованное представление свяжет две ранее созданные таблицы, читая данные из движка таблиц Kafka и вставляя их в целевую таблицу слияния. Мы можем выполнить несколько преобразований данных. Мы выполним простое чтение и вставку. Использование * предполагает, что имена колонок идентичны (чувствительны к регистру).

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```

На момент создания материализованное представление подключается к движку Kafka и начинает чтение: вставляя строки в целевую таблицу. Этот процесс будет продолжаться бесконечно, с последующими вставками сообщений в Kafka, которые будут потребляться. Не стесняйтесь повторно выполнять скрипт вставки, чтобы вставить дополнительные сообщения в Kafka.

##### 7. Подтверждение вставки строк {#7-confirm-rows-have-been-inserted}

Подтвердите существование данных в целевой таблице:

```sql
SELECT count() FROM github;
```

Вы должны увидеть 200,000 строк:
```response
┌─count()─┐
│  200000 │
└─────────┘
```

#### Общие операции {#common-operations}

##### Остановка и перезапуск потребления сообщений {#stopping--restarting-message-consumption}

Чтобы остановить потребление сообщений, вы можете отсоединить таблицу движка Kafka:

```sql
DETACH TABLE github_queue;
```

Это не повлияет на смещения группы потребителей. Чтобы перезапустить потребление и продолжить с предыдущего смещения, повторно присоедините таблицу.

```sql
ATTACH TABLE github_queue;
```

##### Добавление метаданных Kafka {#adding-kafka-metadata}

Полезно отслеживать метаданные из оригинальных сообщений Kafka после их ingested в ClickHouse. Например, мы можем захотеть знать, сколько определенного топика или партиции мы потребили. Для этой цели движок таблиц Kafka предоставляет несколько [виртуальных колонок](../../../engines/table-engines/index.md#table_engines-virtual_columns). Эти колонки могут быть сохранены как колонки в нашей целевой таблице, изменив нашу схему и оператор выбора материализованного представления.

Сначала мы выполняем операцию остановки, описанную выше, перед добавлением колонок в нашу целевую таблицу.

```sql
DETACH TABLE github_queue;
```

Ниже мы добавляем информационные колонки, чтобы идентифицировать исходный топик и партицию, из которой произошла строка.

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

Затем нам нужно убедиться, что виртуальные колонки отображаются так, как требуется.
Виртуальные колонки имеют префикс `_`.
Полный список виртуальных колонок можно найти [здесь](../../../engines/table-engines/integrations/kafka.md#virtual-columns).

Чтобы обновить нашу таблицу с виртуальными колонками, нам нужно будет удалить материализованное представление, повторно присоединить таблицу движка Kafka и заново создать материализованное представление.

```sql
DROP VIEW github_mv;
```

```sql
ATTACH TABLE github_queue;
```

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *, _topic as topic, _partition as partition
FROM github_queue;
```

Новые потребляемые строки должны содержать метаданные.

```sql
SELECT actor_login, event_type, created_at, topic, partition
FROM github
LIMIT 10;
```

Результат выглядит следующим образом:

| actor_login | event_type | created_at | topic | partition |
| :--- | :--- | :--- | :--- | :--- |
| IgorMinar | CommitCommentEvent | 2011-02-12 02:22:00 | github | 0 |
| queeup | CommitCommentEvent | 2011-02-12 02:23:23 | github | 0 |
| IgorMinar | CommitCommentEvent | 2011-02-12 02:23:24 | github | 0 |
| IgorMinar | CommitCommentEvent | 2011-02-12 02:24:50 | github | 0 |
| IgorMinar | CommitCommentEvent | 2011-02-12 02:25:20 | github | 0 |
| dapi | CommitCommentEvent | 2011-02-12 06:18:36 | github | 0 |
| sourcerebels | CommitCommentEvent | 2011-02-12 06:34:10 | github | 0 |
| jamierumbelow | CommitCommentEvent | 2011-02-12 12:21:40 | github | 0 |
| jpn | CommitCommentEvent | 2011-02-12 12:24:31 | github | 0 |
| Oxonium | CommitCommentEvent | 2011-02-12 12:31:28 | github | 0 |

##### Изменение настроек движка Kafka {#modify-kafka-engine-settings}

Рекомендуем удалить таблицу движка Kafka и заново создать ее с новыми настройками. Материализованное представление не нужно изменять в процессе - потребление сообщений возобновится после того, как таблица движка Kafka будет воссоздана.

##### Устранение проблем {#debugging-issues}

Ошибки, такие как проблемы с аутентификацией, не сообщаются в ответах DDL движка Kafka. Для диагностики проблем мы рекомендуем использовать основной журнал ClickHouse clickhouse-server.err.log. Дополнительный трассировочный журнал для базовой библиотеки клиента Kafka [librdkafka](https://github.com/edenhill/librdkafka) может быть включен через конфигурацию.

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### Работа с неправильно сформированными сообщениями {#handling-malformed-messages}

Kafka часто используется как "помойка" для данных. Это приводит к тому, что темы содержат смешанные форматы сообщений и несоответствующие имена полей. Избегайте этого и используйте возможности Kafka, такие как Kafka Streams или ksqlDB, чтобы убедиться, что сообщения хорошо сформированы и согласованны перед вставкой в Kafka. Если эти варианты невозможны, ClickHouse имеет некоторые функции, которые могут помочь.

* Рассматривайте поле сообщения как строки. Функции могут использоваться в операторе материализованного представления для выполнения очистки и преобразования формата при необходимости. Это не должно представлять собой решение для производства, но может помочь при одноразовом приеме.
* Если вы потребляете JSON из темы, используя формат JSONEachRow, используйте настройку [`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields). При записи данных по умолчанию ClickHouse выбрасывает исключение, если входные данные содержат колонки, которые не существуют в целевой таблице. Тем не менее, если этот параметр включен, эти лишние колонки будут игнорироваться. Опять же, это не решение уровня производства и может ввести в заблуждение других.
* Обратите внимание на настройку `kafka_skip_broken_messages`. Это требует от пользователя указать уровень терпимости на блок за неправильно сформированные сообщения - учитывается в контексте kafka_max_block_size. Если это терпение превышено (измеряется в абсолютных сообщениях), обычное поведение исключения изменится, и другие сообщения будут пропущены.

##### Семантика доставки и проблемы с дубликатами {#delivery-semantics-and-challenges-with-duplicates}

Движок таблиц Kafka имеет семантику «по крайней мере раз». В редких известных обстоятельствах возможны дубликаты. Например, сообщения могут быть прочитаны из Kafka и успешно вставлены в ClickHouse. Прежде чем новое смещение может быть зафиксировано, соединение с Kafka теряется. В таком случае требуется повторная попытка блока. Блок может быть [дедуплицирован](/engines/table-engines/mergetree-family/replication) с использованием распределенной таблицы или ReplicatedMergeTree как целевой таблицы. Хотя это снижает вероятность дублирования строк, это зависит от идентичных блоков. События, такие как перераспределение Kafka, могут аннулировать это предположение, вызывая дубликаты в редких обстоятельствах.

##### Вставки на основе кворума {#quorum-based-inserts}

Вам могут понадобиться [вставки на основе кворума](/operations/settings/settings#insert_quorum) в случаях, когда требуются более высокие гарантии доставки в ClickHouse. Это не может быть установлено на материализованное представление или целевую таблицу. Тем не менее, это можно установить для пользовательских профилей, например:

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouse в Kafka {#clickhouse-to-kafka}

Хотя это редкий случай использования, данные ClickHouse также могут быть сохранены в Kafka. Например, мы вручную вставим строки в движок таблиц Kafka. Эти данные будут прочитаны тем же движком Kafka, материализованное представление которого поместит данные в таблицу Merge Tree. Наконец, мы продемонстрируем применение материализованных представлений при вставке в Kafka для чтения таблиц из существующих исходных таблиц.

#### Шаги {#steps-1}

Наша первоначальная цель лучше всего иллюстрируется:

<Image img={kafka_02} size="lg" alt="Движок таблиц Kafka с диаграммой вставок" />

Мы предполагаем, что у вас есть таблицы и представления, созданные на первых этапах для [Kafka в ClickHouse](#kafka-to-clickhouse), и что тема была полностью потреблена.

##### 1. Вставка строк напрямую {#1-inserting-rows-directly}

Сначала подтвердите количество в целевой таблице.

```sql
SELECT count() FROM github;
```

Вы должны иметь 200,000 строк:
```response
┌─count()─┐
│  200000 │
└─────────┘
```

Теперь вставим строки из целевой таблицы GitHub обратно в движок таблиц Kafka github_queue. Обратите внимание, как мы используем формат JSONEachRow и ограничиваем выборку до 100 строк.

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

Подсчитайте снова строки в GitHub, чтобы подтвердить, что их количество увеличилось на 100. Как показано на приведенной выше диаграмме, строки были вставлены в Kafka через движок таблиц Kafka, прежде чем быть повторно прочитанными тем же движком и вставленными в целевую таблицу GitHub материализованным представлением!

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

Мы можем использовать материализованные представления для отправки сообщений в движок Kafka (и тему), когда документы вставляются в таблицу. Когда строки вставляются в таблицу GitHub, срабатывает материализованное представление, что вызывает вставку строк обратно в движок Kafka и в новую тему. Как мы уже сказали, это лучше всего иллюстрируется:

<Image img={kafka_03} size="lg" alt="Движок таблиц Kafka с диаграммой материализованных представлений" />

Создайте новую тему Kafka `github_out` или эквивалент. Убедитесь, что движок таблиц Kafka `github_out_queue` указывает на эту тему.

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
            'JSONEachRow') settings kafka_thread_per_consumer = 0, kafka_num_consumers = 1;
```

Теперь создайте новое материализованное представление `github_out_mv`, чтобы оно указывало на таблицу GitHub, вставляя строки в вышеописанный движок, когда оно срабатывает. Добавления в таблицу GitHub, как результат, будут отправлены в нашу новую тему Kafka.

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

Если вы вставите в исходную тему github, созданную в рамках [Kafka в ClickHouse](#kafka-to-clickhouse), документы магически появятся в теме "github_clickhouse". Подтвердите это с помощью встроенных средств Kafka. Например, ниже мы вставляем 100 строк в тему github, используя [kcat](https://github.com/edenhill/kcat) для темы, размещенной в Confluent Cloud:

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

Чтение из темы `github_out` должно подтвердить доставку сообщений.

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

Хотя это сложный пример, он иллюстрирует силу материализованных представлений, когда они используются вместе с движком Kafka.

### Кластеры и производительность {#clusters-and-performance}

#### Работа с кластерами ClickHouse {#working-with-clickhouse-clusters}

Через группы потребителей Kafka несколько экземпляров ClickHouse могут потенциально читать из одной и той же темы. Каждый потребитель будет назначен партиции темы в 1:1 отображении. При масштабировании потребления ClickHouse с использованием движка таблиц Kafka имейте в виду, что общее количество потребителей в кластере не может превышать количество партиций в теме. Поэтому убедитесь, что партиционирование настроено соответствующим образом для темы заранее.

Несколько экземпляров ClickHouse могут быть настроены для чтения из темы, используя один и тот же идентификатор группы потребителей - указанного во время создания движка таблиц Kafka. Таким образом, каждый экземпляр будет читать из одной или нескольких партиций, вставляя сегменты в свою локальную целевую таблицу. Целевые таблицы могут, в свою очередь, быть настроены на использование ReplicatedMergeTree для обработки дублирования данных. Этот подход позволяет масштабировать чтение из Kafka вместе с кластером ClickHouse, при условии, что партиций Kafka достаточно.

<Image img={kafka_04} size="lg" alt="Движок таблиц Kafka с диаграммой кластеров ClickHouse" />

#### Настройка производительности {#tuning-performance}

Рассмотрите следующее, когда вы хотите увеличить производительность пропускной способности движка таблиц Kafka:

* Производительность будет варьироваться в зависимости от размера сообщения, формата и типов целевых таблиц. 100,000 строк/с на одном движке таблиц следует считать достижимым. По умолчанию сообщения читаются блоками, контролируемыми параметром kafka_max_block_size. По умолчанию он установлен на [max_insert_block_size](/operations/settings/settings#max_insert_block_size), по умолчанию равным 1,048,576. Если только сообщения не очень большие, это следует почти всегда увеличивать. Значения от 500к до 1М не редкость. Тестируйте и оценивайте влияние на производительность.
* Число потребителей для движка таблиц можно увеличить, используя kafka_num_consumers. Однако по умолчанию вставки будут линейные в одном потоке, если kafka_thread_per_consumer не изменен с значения по умолчанию 1. Установите это значение на 1, чтобы обеспечить выполнение сбросов параллельно. Обратите внимание, что создание таблицы движка Kafka с N потребителями (и kafka_thread_per_consumer=1) логически эквивалентно созданию N движков Kafka, каждый с материализованным представлением и kafka_thread_per_consumer=0.
* Увеличение количества потребителей не является бесплатной операцией. Каждый потребитель поддерживает свои собственные буферы и потоки, увеличивая нагрузку на сервер. Будьте осторожны с нагрузкой от потребителей и сначала масштабируйте линейно по вашему кластеру, если это возможно.
* Если пропускная способность сообщений Kafka переменная и задержки допустимы, рассмотрите возможность увеличения stream_flush_interval_ms, чтобы обеспечить сброс больших блоков.
* [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size) устанавливает количество потоков, выполняющих фоновые задачи. Эти потоки используются для потоковой передачи Kafka. Эта настройка применяется при запуске сервера ClickHouse и не может быть изменена в пользовательской сессии, по умолчанию равной 16. Если вы видите тайм-ауты в журналах, возможно, имеет смысл увеличить это значение.
* Для связи с Kafka используется библиотека librdkafka, которая сама создает потоки. Большое количество таблиц Kafka или потребителей может привести к большому количеству переключений контекста. Либо распределите эту нагрузку по кластеру, повторно реплицируя целевые таблицы, если это возможно, либо рассмотрите возможность использования движка таблиц для чтения из нескольких тем - поддерживается список значений. Несколько материализованных представлений могут читаться из одной таблицы, каждое фильтруя данные из конкретной темы.

Любые изменения настроек должны быть протестированы. Мы рекомендуем контролировать задержки потребителей Kafka, чтобы убедиться, что вы правильно масштабированы.

#### Дополнительные настройки {#additional-settings}

Помимо настройки, обсужденной выше, могут быть интересны следующие:

* [Kafka_max_wait_ms](/operations/settings/settings#kafka_max_wait_ms) - Время ожидания в миллисекундах для чтения сообщений из Kafka перед повторной попыткой. Устанавливается на уровне пользовательского профиля и по умолчанию составляет 5000.

[Все настройки](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md) из базовой librdkafka также могут быть помещены в конфигурационные файлы ClickHouse внутри элемента _kafka_ - имена настроек должны быть XML элементами с точками, замененными на символы подчеркивания, например:

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

Это специальные настройки, и мы рекомендуем вам обратиться к документации Kafka для более детального объяснения.
