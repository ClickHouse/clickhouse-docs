---
sidebar_label: 'Kafka Table Engine'
sidebar_position: 5
slug: /integrations/kafka/kafka-table-engine
description: 'Использование движка таблицы Kafka'
title: 'Использование движка таблицы Kafka'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Image from '@theme/IdealImage';
import kafka_01 from '@site/static/images/integrations/data-ingestion/kafka/kafka_01.png';
import kafka_02 from '@site/static/images/integrations/data-ingestion/kafka/kafka_02.png';
import kafka_03 from '@site/static/images/integrations/data-ingestion/kafka/kafka_03.png';
import kafka_04 from '@site/static/images/integrations/data-ingestion/kafka/kafka_04.png';


# Использование движка таблицы Kafka

<CloudNotSupportedBadge/>

:::note
Движок таблицы Kafka не поддерживается в [ClickHouse Cloud](https://clickhouse.com/cloud). Пожалуйста, рассмотрите [ClickPipes](../clickpipes/kafka.md) или [Kafka Connect](./kafka-clickhouse-connect-sink.md)
:::

### Kafka в ClickHouse {#kafka-to-clickhouse}

Для использования движка таблицы Kafka вам следует быть в основном знакомым с [материализованными представлениями ClickHouse](../../../guides/developer/cascading-materialized-views.md).

#### Обзор {#overview}

Сначала мы сосредоточимся на самом распространенном сценарии: использовании движка таблицы Kafka для вставки данных в ClickHouse из Kafka.

Движок таблицы Kafka позволяет ClickHouse читать данные напрямую из темы Kafka. Хотя это полезно для просмотра сообщений в теме, движок по своему дизайну допускает только одноразовое извлечение, т.е. когда запрос отправляется к таблице, он потребляет данные из очереди и увеличивает смещение потребителя, прежде чем вернуть результаты вызывающему. Данные не могут быть повторно прочитаны без сброса этих смещений.

Для постоянного хранения этих данных из чтения движка таблицы нам необходимо средство для захвата данных и вставки их в другую таблицу. Материализованные представления, основанные на триггерах, предоставляют эту функциональность. Материализованное представление инициирует чтение из движка таблицы, получая пакеты документов. В конструкции TO указывается цель данных - обычно это таблица из семейства [Merge Tree](../../../engines/table-engines/mergetree-family/index.md). Этот процесс визуализируется ниже:

<Image img={kafka_01} size="lg" alt="Схема архитектуры движка таблицы Kafka" style={{width: '80%'}} />

#### Шаги {#steps}

##### 1. Подготовка {#1-prepare}

Если вы уже имеете данные на целевой теме, вы можете адаптировать следующее для использования в вашем наборе данных. В качестве альтернативы, образец набора данных GitHub предоставлен [здесь](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson). Этот набор данных используется в примерах ниже и использует сокращенную схему и подмножество строк (в частности, мы ограничиваемся событиями GitHub, касающимися [репозитория ClickHouse](https://github.com/ClickHouse/ClickHouse)), по сравнению с полным набором данных, доступным [здесь](https://ghe.clickhouse.tech/), ради краткости. Это все еще достаточно для работы большинства запросов [опубликованных с набором данных](https://ghe.clickhouse.tech/).

##### 2. Настройка ClickHouse {#2-configure-clickhouse}

Этот шаг требуется, если вы подключаетесь к защищенному Kafka. Эти настройки не могут быть переданы через команды SQL DDL и должны быть настроены в config.xml ClickHouse. Мы предполагаем, что вы подключаетесь к экземпляру с защищенным SASL. Это самый простой метод при работе с Confluent Cloud.

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

Поместите приведенный выше фрагмент в новый файл в каталоге conf.d/ или объедините его с существующими конфигурационными файлами. Для настроек, которые можно настроить, смотрите [здесь](../../../engines/table-engines/integrations/kafka.md#configuration).

Мы также создадим базу данных с именем `KafkaEngine`, которую будем использовать в этом учебнике:

```sql
CREATE DATABASE KafkaEngine;
```

После создания базы данных вам нужно переключиться на нее:

```sql
USE KafkaEngine;
```

##### 3. Создайте целевую таблицу {#3-create-the-destination-table}

Подготовьте свою целевую таблицу. В примере ниже мы используем сокращенную схему GitHub для краткости. Обратите внимание, что хотя мы используем движок таблицы MergeTree, этот пример можно легко адаптировать для любого члена [семейства MergeTree](../../../engines/table-engines/mergetree-family/index.md).

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

##### 4. Создайте и заполните тему {#4-create-and-populate-the-topic}

Далее мы создадим тему. Существует несколько инструментов, которые мы можем использовать для этого. Если мы запускаем Kafka локально на нашем компьютере или в контейнере Docker, [RPK](https://docs.redpanda.com/current/get-started/rpk-install/) работает хорошо. Мы можем создать тему с именем `github` с 5 партициями, запустив следующую команду:

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

Если мы запускаем Kafka в Confluent Cloud, мы можем предпочесть использовать [Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records):

```bash
confluent kafka topic create --if-not-exists github
```

Теперь нам нужно заполнить эту тему некоторыми данными, что мы и сделаем с помощью [kcat](https://github.com/edenhill/kcat). Мы можем выполнить команду, аналогичную следующей, если мы запускаем Kafka локально с отключенной аутентификацией:

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

##### 5. Создайте движок таблицы Kafka {#5-create-the-kafka-table-engine}

Приведенный ниже пример создает движок таблицы с той же схемой, что и таблица MergeTree. Это не является строгим требованием, поскольку вы можете иметь псевдонимы или эфемерные столбцы в целевой таблице. Тем не менее, настройки важны; обратите внимание на использование `JSONEachRow` в качестве типа данных для потребления JSON из темы Kafka. Значения `github` и `clickhouse` представляют собой имя темы и имена групп потребителей соответственно. Темы могут на самом деле быть списком значений.

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

Ниже мы обсуждаем настройки движка и оптимизацию производительности. На этом этапе простое выполнение запроса select на таблице `github_queue` должно прочитать некоторые строки. Обратите внимание, что это переместит смещения потребителей вперед, что предотвратит повторное чтение этих строк без [сброса](#common-operations). Обратите внимание на лимит и обязательный параметр `stream_like_engine_allow_direct_select.`

##### 6. Создайте материализованное представление {#6-create-the-materialized-view}

Материализованное представление соединит две ранее созданные таблицы, считывая данные из движка таблицы Kafka и вставляя их в целевую таблицу MergeTree. Мы можем выполнить ряд преобразований данных. Мы сделаем простое чтение и вставку. Использование * предполагает, что имена столбцов идентичны (чувствительно к регистру).

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```

В момент создания материализованное представление подключается к движку Kafka и начинает чтение: вставляя строки в целевую таблицу. Этот процесс будет продолжаться бесконечно, при этом последующие вставки сообщений в Kafka будут потребляться. Не стесняйтесь повторно выполнять сценарий вставки, чтобы вставить дополнительные сообщения в Kafka.

##### 7. Подтвердите, что строки были вставлены {#7-confirm-rows-have-been-inserted}

Подтвердите наличие данных в целевой таблице:

```sql
SELECT count() FROM github;
```

Вы должны увидеть 200,000 строк:
```response
┌─count()─┐
│  200000 │
└─────────┘
```

#### Основные операции {#common-operations}

##### Остановка и перезапуск потребления сообщений {#stopping--restarting-message-consumption}

Чтобы остановить потребление сообщений, вы можете отсоединить таблицу движка Kafka:

```sql
DETACH TABLE github_queue;
```

Это не повлияет на смещения группы потребителей. Чтобы перезапустить потребление и продолжить с предыдущего смещения, повторно подключите таблицу.

```sql
ATTACH TABLE github_queue;
```

##### Добавление метаданных Kafka {#adding-kafka-metadata}

Полезно отслеживать метаданные из оригинальных сообщений Kafka после их загрузки в ClickHouse. Например, мы можем захотеть знать, сколько определенной темы или партиции мы потребили. Для этой цели движок таблицы Kafka предоставляет несколько [виртуальных столбцов](../../../engines/table-engines/index.md#table_engines-virtual_columns). Эти столбцы могут быть сохранены в нашей целевой таблице, изменив нашу схему и оператор select материализованного представления.

Сначала выполняем операцию остановки, описанную выше, перед добавлением столбцов в нашу целевую таблицу.

```sql
DETACH TABLE github_queue;
```

Ниже мы добавляем информационные столбцы, чтобы определить исходную тему и партицию, откуда появилась строка.

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

Затем мы должны убедиться, что виртуальные столбцы сопоставлены как необходимо.
Виртуальные столбцы начинаются с символа `_`.
Полный список виртуальных столбцов можно найти [здесь](../../../engines/table-engines/integrations/kafka.md#virtual-columns).

Чтобы обновить нашу таблицу с виртуальными столбцами, нам нужно удалить материализованное представление, повторно подключить таблицу движка Kafka и заново создать материализованное представление.

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

Сначала потребленные строки должны содержать метаданные.

```sql
SELECT actor_login, event_type, created_at, topic, partition
FROM github
LIMIT 10;
```

Результат выглядит так:

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

Мы рекомендуем удалить таблицу движка Kafka и заново создать ее с новыми настройками. Материализованное представление не нужно изменять в этот процесс - потребление сообщений возобновится, как только таблица движка Kafka будет воссоздана.

##### Отладка проблем {#debugging-issues}

Ошибки, такие как проблемы аутентификации, не сообщаются в ответах на DDL движка Kafka. Для диагностики проблем мы рекомендуем использовать основной файл журнала ClickHouse clickhouse-server.err.log. Дополнительное трассировочное логирование для библиотеки клиентского интерфейса Kafka [librdkafka](https://github.com/edenhill/librdkafka) можно включить через конфигурацию.

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### Обработка неправильно сформированных сообщений {#handling-malformed-messages}

Kafka часто используется как "свалка" для данных. Это приводит к тому, что темы содержат смешанные форматы сообщений и несогласованные имена полей. Избегайте этого и воспользуйтесь функциями Kafka, такими как Kafka Streams или ksqlDB, чтобы гарантировать, что сообщения хорошо сформированы и согласованны перед их вставкой в Kafka. Если эти варианты невозможны, ClickHouse имеет некоторые функции, которые могут помочь.

* Рассматривайте поле сообщения как строки. Можно использовать функции в операторе материализованного представления для очистки и приведения типов, если это необходимо. Это не должно представлять собой решение для производства, но может помочь в единовременной загрузке.
* Если вы потребляете JSON из темы, используя формат JSONEachRow, используйте настройку [`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields). При записи данных, по умолчанию ClickHouse выбрасывает исключение, если входные данные содержат столбцы, которые не существуют в целевой таблице. Однако, если эта опция включена, эти избыточные столбцы будут игнорироваться. Опять же, это не решение для производственного уровня и может ввести других в заблуждение.
* Рассмотрите настройку `kafka_skip_broken_messages`. Это требует от пользователя указания уровня допустимости для каждого блока на случай неправильно сформированных сообщений - рассматриваемый в контексте kafka_max_block_size. Если это допустимое значение превышено (измеряется в абсолютных сообщениях), поведение исключений вернется к обычному, и другие сообщения будут пропущены.

##### Семантика доставки и проблемы с дубликатами {#delivery-semantics-and-challenges-with-duplicates}

Движок таблицы Kafka имеет семантику как минимум один раз. Дубликаты возможны в нескольких известных редких обстоятельствах. Например, сообщения могут быть прочитаны из Kafka и успешно вставлены в ClickHouse. Прежде чем новое смещение может быть зафиксировано, соединение с Kafka теряется. В этой ситуации требуется повторная попытка блока. Блок может быть [дедуплицирован](/engines/table-engines/mergetree-family/replication), используя распределенную таблицу или ReplicatedMergeTree в качестве целевой таблицы. Хотя это уменьшает вероятность появления дублирующих строк, это зависит от идентичных блоков. События, такие как перераспределение Kafka, могут аннулировать это предположение, вызывая дубликаты в редких случаях.

##### Вставки на основе кворума {#quorum-based-inserts}

Вам могут понадобиться [вставки на основе кворума](/operations/settings/settings#insert_quorum) в случаях, когда в ClickHouse требуются более высокие гарантии доставки. Это не может быть установлено на материализованное представление или целевую таблицу. Однако это можно установить для профилей пользователей, например.

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouse в Kafka {#clickhouse-to-kafka}

Хотя это реже встречающийся сценарий, данные ClickHouse также могут быть сохранены в Kafka. Например, мы будем вручную вставлять строки в движок таблицы Kafka. Эти данные будут считываться тем же движком Kafka, чье материализованное представление поместит данные в таблицу Merge Tree. В конце концов, мы продемонстрируем применение материализованных представлений в вставках в Kafka, чтобы читать таблицы из существующих исходных таблиц.

#### Шаги {#steps-1}

Наша первоначальная цель иллюстрируется следующим образом:

<Image img={kafka_02} size="lg" alt="Движок таблицы Kafka с вставками" />

Мы предполагаем, что вы создали таблицы и представления в шагах для [Kafka в ClickHouse](#kafka-to-clickhouse) и что тема была полностью потреблена.

##### 1. Прямые вставки строк {#1-inserting-rows-directly}

Во-первых, подтвердите количество строк в целевой таблице.

```sql
SELECT count() FROM github;
```

У вас должно быть 200,000 строк:
```response
┌─count()─┐
│  200000 │
└─────────┘
```

Теперь вставим строки из целевой таблицы GitHub обратно в движок таблицы Kafka github_queue. Обратите внимание, как мы используем формат JSONEachRow и ограничиваем выборку до 100.

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

Пересчитайте строки в GitHub, чтобы подтвердить, что их количество увеличилось на 100. Как показано на вышеупомянутой диаграмме, строки были вставлены в Kafka через движок таблицы Kafka, прежде чем быть прочитанными тем же движком и вставленными в целевую таблицу GitHub через наше материализованное представление!

```sql
SELECT count() FROM github;
```

Вы должны увидеть еще 100 строк:
```response
┌─count()─┐
│  200100 │
└─────────┘
```

##### 2. Использование материализованных представлений {#2-using-materialized-views}

Мы можем использовать материализованные представления, чтобы отправлять сообщения в движок Kafka (и тему), когда документы вставляются в таблицу. Когда строки вставляются в таблицу GitHub, срабатывает материализованное представление, благодаря которому строки вставляются обратно в движок Kafka и в новую тему. Опять же, это лучше всего иллюстрируется:

<Image img={kafka_03} size="lg" alt="Движок таблицы Kafka с материализованными представлениями" />

Создайте новую тему Kafka `github_out` или эквивалентную. Убедитесь, что движок таблицы Kafka `github_out_queue` указывает на эту тему.

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

Теперь создайте новое материализованное представление `github_out_mv`, чтобы оно указывало на таблицу GitHub и вставляло строки в вышеуказанный движок, когда оно срабатывает. Добавления в таблицу GitHub, таким образом, будут отправляться в нашу новую тему Kafka.

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

Если вы вставите в оригинальную тему github, созданную в рамках [Kafka в ClickHouse](#kafka-to-clickhouse), документы волшебным образом появятся в теме "github_clickhouse". Подтвердите это с помощью родных инструментов Kafka. Например, ниже мы вставляем 100 строк в тему github, используя [kcat](https://github.com/edenhill/kcat) для темы, размещенной в Confluent Cloud:

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

Хотя это сложный пример, он иллюстрирует мощность материализованных представлений при использовании в сочетании с движком Kafka.

### Кластеры и производительность {#clusters-and-performance}

#### Работа с кластерами ClickHouse {#working-with-clickhouse-clusters}

Через группы потребителей Kafka несколько экземпляров ClickHouse могут потенциально читать из одной и той же темы. Каждому потребителю будет назначена партиция темы в 1:1. При расширении потребления ClickHouse с использованием движка таблицы Kafka учитывайте, что общее количество потребителей в кластере не может превышать количество партиций в теме. Поэтому заранее убедитесь, что партиционирование настроено правильно для темы.

Несколько экземпляров ClickHouse могут быть настроены для чтения из темы, используя один и тот же идентификатор группы потребителей, который указывается при создании движка таблицы Kafka. Таким образом, каждый экземпляр будет читать из одной или нескольких партиций, вставляя сегменты в свои локальные целевые таблицы. Целевые таблицы можно, в свою очередь, настроить для использования ReplicatedMergeTree, чтобы управлять дублированием данных. Этот подход позволяет масштабировать чтения Kafka с кластером ClickHouse, при условии наличия достаточного количества партиций Kafka.

<Image img={kafka_04} size="lg" alt="Движок таблицы Kafka с кластерами ClickHouse" />

#### Оптимизация производительности {#tuning-performance}

Учитывайте следующее, когда хотите увеличить производительность обработки таблицы движка Kafka:


* Производительность будет варьироваться в зависимости от размера сообщений, формата и типов целевых таблиц. 100k строк/с на одном движке таблицы следует считать достижимым. По умолчанию сообщения читаются блоками, контролируемыми параметром kafka_max_block_size. По умолчанию он установлен на [max_insert_block_size](/operations/settings/settings#max_insert_block_size), по умолчанию равный 1,048,576. Если сообщения не очень большие, его почти всегда следует увеличить. Значения между 500k и 1M не являются редкостью. Проверьте и оцените влияние на производительность.
* Количество потребителей для двигателя таблицы можно увеличить с помощью kafka_num_consumers. Тем не менее, по умолчанию вставки будут линейно упорядочены в одном потоке, если kafka_thread_per_consumer не будет изменен от значения по умолчанию, равного 1. Установите это значение на 1, чтобы гарантировать, что сбросы выполняются параллельно. Обратите внимание, что создание таблицы движка Kafka с N потребителями (и kafka_thread_per_consumer=1) логически эквивалентно созданию N движков Kafka, каждый с материализованным представлением и kafka_thread_per_consumer=0.
* Увеличение числа потребителей не является бесплатной операцией. Каждый потребитель поддерживает свои собственные буферы и потоки, увеличивая нагрузку на сервер. Будьте внимательны к накладным расходам потребителей и сначала масштабируйте линейно по вашему кластеру, если это возможно.
* Если пропускная способность сообщений Kafka переменна и задержки допустимы, рассмотрите возможность увеличения stream_flush_interval_ms для обеспеченияFlush больших блоков.
* [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size) устанавливает количество потоков, выполняющих фоновые задачи. Эти потоки используются для стриминга Kafka. Эта настройка применяется при запуске сервера ClickHouse и не может быть изменена в пользовательской сессии, по умолчанию равной 16. Если вы видите тайм-ауты в журналах, возможно, стоит увеличить это число.
* Для связи с Kafka используется библиотека librdkafka, которая сама создает потоки. Большое количество таблиц Kafka или потребителей может привести к большому количеству переключений контекста. Либо распределите эту нагрузку по кластеру, дублируя целевые таблицы, если возможно, либо рассмотрите возможность использования движка таблицы для чтения из нескольких тем - поддерживается список значений. В нескольких материализованных представлениях можно читать из одной таблицы, каждый из которых фильтрует данные из конкретной темы.

Любые изменения настроек должны быть протестированы. Мы рекомендуем отслеживать отставание потребителей Kafka, чтобы убедиться, что вы правильно масштабированы.

#### Дополнительные настройки {#additional-settings}

Помимо обсужденных выше настроек, следующие могут быть интересны:

* [Kafka_max_wait_ms](/operations/settings/settings#kafka_max_wait_ms) - Время ожидания в миллисекундах для чтения сообщений из Kafka перед повторной попыткой. Устанавливается на уровне профиля пользователя и по умолчанию составляет 5000.

[Все настройки ](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md) из подлежащей библиотеки librdkafka также могут быть размещены в конфигурационных файлах ClickHouse внутри элемента _kafka_ - имена настроек должны быть XML-элементами с точками, замененными на подчеркивания, например:

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

Это настройки для специалистов, и мы бы предложили вам обратиться к документации Kafka для более подробного объяснения.
