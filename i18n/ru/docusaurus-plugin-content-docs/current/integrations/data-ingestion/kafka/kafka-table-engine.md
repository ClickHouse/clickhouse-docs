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
Движок таблиц Kafka не поддерживается на [ClickHouse Cloud](https://clickhouse.com/cloud). Пожалуйста, рассмотрите вариант использования [ClickPipes](../clickpipes/kafka.md) или [Kafka Connect](./kafka-clickhouse-connect-sink.md).
:::

### Kafka в ClickHouse {#kafka-to-clickhouse}

Чтобы использовать движок таблиц Kafka, вам необходимо быть в основном знакомым с [материализованными представлениями ClickHouse](../../../guides/developer/cascading-materialized-views.md).

#### Обзор {#overview}

Сначала мы сосредоточимся на самом распространенном случае: использовании движка таблиц Kafka для вставки данных в ClickHouse из Kafka.

Движок таблиц Kafka позволяет ClickHouse читать напрямую из топика Kafka. Хотя это полезно для просмотра сообщений в топике, движок по умолчанию разрешает одноразовое извлечение, т.е. когда запрос отправляется к таблице, он потребляет данные из очереди и увеличивает смещение потребителя, прежде чем вернуть результаты вызывающей стороне. Эффективно данные не могут быть прочитаны повторно без сброса этих смещений.

Чтобы сохранить эти данные из чтения движка таблиц, нам необходимо средство для захвата данных и вставки их в другую таблицу. Уровневые материализированные представления по сути предоставляют эту функциональность. Материализованное представление инициирует чтение из движка таблиц, получая партии документов. Клауза TO определяет место назначения данных - обычно это таблица из [семейства Merge Tree](../../../engines/table-engines/mergetree-family/index.md). Этот процесс визуализирован ниже:

<Image img={kafka_01} size="lg" alt="Схема архитектуры движка таблиц Kafka" style={{width: '80%'}} />

#### Шаги {#steps}

##### 1. Подготовка {#1-prepare}

Если у вас есть данные на целевом топике, вы можете адаптировать следующее для использования в вашем наборе данных. Кроме того, пример набора данных из Github предоставлен [здесь](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson). Этот набор данных используется в примерах ниже и использует уменьшенную схему и подмножество строк (в частности, мы ограничиваемся событиями GitHub, касающимися [репозитория ClickHouse](https://github.com/ClickHouse/ClickHouse)), по сравнению с полным набором данных, доступным [здесь](https://ghe.clickhouse.tech/), ради краткости. Этого все еще достаточно для большинства запросов [опубликованных с набором данных](https://ghe.clickhouse.tech/) для работы.

##### 2. Настройка ClickHouse {#2-configure-clickhouse}

Этот шаг необходим, если вы подключаетесь к защищенному Kafka. Эти настройки нельзя передать через SQL DDL команды и должны быть настроены в файле config.xml ClickHouse. Мы предполагаем, что вы подключаетесь к экземпляру с защитой SASL. Это самый простой метод взаимодействия с Confluent Cloud.

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

Либо поместите приведенный выше фрагмент в новый файл в вашей директории conf.d/, либо объедините его с существующими файлами конфигурации. Для настроек, которые можно настроить, смотрите [здесь](../../../engines/table-engines/integrations/kafka.md#configuration).

Мы также создадим базу данных под названием `KafkaEngine`, чтобы использовать ее в этом руководстве:

```sql
CREATE DATABASE KafkaEngine;
```

После того как вы создали базу данных, вам нужно переключиться на нее:

```sql
USE KafkaEngine;
```

##### 3. Создание целевой таблицы {#3-create-the-destination-table}

Подготовьте свою целевую таблицу. В примере ниже мы используем уменьшенную схему GitHub для краткости. Обратите внимание, что хотя мы используем движок таблиц MergeTree, этот пример можно легко адаптировать для любого члена [семейства MergeTree](../../../engines/table-engines/mergetree-family/index.md).

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

Далее мы собираемся создать топик. Есть несколько инструментов, которые мы можем использовать для этого. Если мы запускаем Kafka локально на нашем компьютере или внутри контейнера Docker, [RPK](https://docs.redpanda.com/current/get-started/rpk-install/) отлично подходит. Мы можем создать топик с именем `github` с 5 партициями, выполнив следующую команду:

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

Если мы запускаем Kafka в Confluent Cloud, мы могли бы предпочесть использовать [Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records):

```bash
confluent kafka topic create --if-not-exists github
```

Теперь нам нужно заполнить этот топик данными, что мы сделаем с помощью [kcat](https://github.com/edenhill/kcat). Мы можем выполнить команду, аналогичную следующей, если мы запускаем Kafka локально с отключенной аутентификацией:

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

Набор данных содержит 200,000 строк, поэтому его должно быть загружено всего за несколько секунд. Если вы хотите работать с большим набором данных, ознакомьтесь с [разделом больших наборов данных](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets) из репозитория [ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples).

##### 5. Создание движка таблиц Kafka {#5-create-the-kafka-table-engine}

Пример ниже создает движок таблиц с той же схемой, что и таблица MergeTree. Это строго не обязательно, поскольку вы можете использовать псевдонимы или временные столбцы в целевой таблице. Однако настройки важны; обратите внимание на использование `JSONEachRow` в качестве типа данных для потребления JSON из топика Kafka. Значения `github` и `clickhouse` представляют собой имена топика и группы потребителей соответственно. Топики могут на самом деле быть списком значений.

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

Мы обсуждаем настройки движка и оптимизацию производительности ниже. На этом этапе простой запрос к таблице `github_queue` должен прочитать несколько строк. Обратите внимание, что это переместит смещения потребителей вперед, предотвращая повторное чтение этих строк без [сброса](#common-operations). Обратите внимание на лимит и необходимый параметр `stream_like_engine_allow_direct_select.`

##### 6. Создание материализованного представления {#6-create-the-materialized-view}

Материализованное представление свяжет две ранее созданные таблицы, считая данные из движка таблиц Kafka и вставляя их в целевую таблицу Merge Tree. Мы можем выполнять ряд преобразований данных. Мы выполним простое чтение и вставку. Использование * предполагает, что имена столбцов идентичны (чувствительно к регистру).

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```

На момент создания материализованное представление подключается к движку Kafka и начинает чтение: вставляя строки в целевую таблицу. Этот процесс будет продолжаться бесконечно, с последующими вставками сообщений в Kafka, которые будут потребляться. Не стесняйтесь повторно запускать скрипт вставки, чтобы вставить дополнительные сообщения в Kafka.

##### 7. Подтверждение вставки строк {#7-confirm-rows-have-been-inserted}

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

#### Общие операции {#common-operations}

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

Может быть полезно отслеживать метаданные из оригинальных сообщений Kafka после их загрузки в ClickHouse. Например, мы можем желать знать, сколько конкретного топика или партиции мы потребили. Для этой цели движок таблиц Kafka предоставляет несколько [виртуальных столбцов](../../../engines/table-engines/index.md#table_engines-virtual_columns). Эти столбцы могут быть сохранены как столбцы в нашей целевой таблице путем изменения нашей схемы и оператора select нашего материализованного представления.

Сначала мы выполняем операцию остановки, описанную выше, прежде чем добавлять столбцы в нашу целевую таблицу.

```sql
DETACH TABLE github_queue;
```

Ниже мы добавляем информационные столбцы для идентификации исходного топика и партиции, из которой произошла строка.

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

Далее, нам нужно убедиться, что виртуальные столбцы сопоставлены по мере необходимости.
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

Мы рекомендуем удалить таблицу движка Kafka и заново создать ее с новыми настройками. В этом процессе материализованное представление изменять не нужно - потребление сообщений возобновится, как только таблица движка Kafka будет заново создана.

##### Устранение неисправностей {#debugging-issues}

Ошибки, такие как проблемы с аутентификацией, не отображаются в ответах на DDL движка Kafka. Для диагностики проблем мы рекомендуем использовать основной файл журнала ClickHouse clickhouse-server.err.log. Дополнительное журналирование трассировки для используемой библиотеки клиентского программного обеспечения Kafka [librdkafka](https://github.com/edenhill/librdkafka) может быть включено через конфигурацию.

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### Обработка неверно оформленных сообщений {#handling-malformed-messages}

Kafka часто используется как "свалка" для данных. Это приводит к тому, что топики содержат смешанные форматы сообщений и непоследовательные имена полей. Избегайте этого и используйте функции Kafka, такие как Kafka Streams или ksqlDB, чтобы гарантировать, что сообщения правильно оформлены и последовательны перед вставкой в Kafka. Если эти варианты невозможны, у ClickHouse есть некоторые функции, которые могут помочь.

* Рассматривайте поле сообщения как строки. Если необходимо, в операторе материализованного представления могут быть использованы функции для фильтрации и приведения типов. Это не должно представлять решение для производства, но может помочь в одноразовой загрузке.
* Если вы потребляете JSON из топика, используя формат JSONEachRow, используйте настройку [`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields). По умолчанию ClickHouse генерирует исключение, если входные данные содержат столбцы, которые не существуют в целевой таблице. Однако если этот параметр включен, эти лишние столбцы будут проигнорированы. Снова, это не решение для производства и может запутать других.
* Рассмотрите настройку `kafka_skip_broken_messages`. Это требует от пользователя указать уровень терпимости за блок для неверно оформленных сообщений - который рассматривается в контексте kafka_max_block_size. Если эта терпимость превышена (измеряется в абсолютных сообщениях), обычное поведение исключений вернется, и другие сообщения будут пропущены.

##### Семантика доставки и проблемы с дубликатами {#delivery-semantics-and-challenges-with-duplicates}

Движок таблиц Kafka имеет семантику как минимум один раз. Дубликаты возможны в нескольких известных редких обстоятельствах. Например, сообщения могут быть прочитаны из Kafka и успешно вставлены в ClickHouse. Прежде чем новое смещение может быть зафиксировано, связь с Kafka теряется. В этой ситуации требуется повторная попытка блока. Блок можно [дедуплицировать](https://engines/table-engines/mergetree-family/replication) с помощью распределенной таблицы или ReplicatedMergeTree в качестве целевой таблицы. Хотя это уменьшает вероятность дублированных строк, это зависит от идентичных блоков. События, такие как перераспределение Kafka, могут аннулировать это предположение, вызывая дубликаты в редких случаях.

##### Вставки на основе кворума {#quorum-based-inserts}

Вам могут понадобиться [вставки на основе кворума](/operations/settings/settings#insert_quorum) в случаях, когда в ClickHouse требуются более высокие гарантии доставки. Это нельзя установить для материализованного представления или целевой таблицы. Однако это может быть установлено для пользовательских профилей, например:

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouse в Kafka {#clickhouse-to-kafka}

Хотя это более редкий случай, данные ClickHouse также могут сохраняться в Kafka. Например, мы вставим строки вручную в движок таблиц Kafka. Эти данные будут прочитаны тем же движком Kafka, который поместит данные в таблицу Merge Tree. Наконец, мы продемонстрируем применение материализованных представлений при вставке в Kafka, чтобы прочитать таблицы из существующих исходных таблиц.

#### Шаги {#steps-1}

Наш начальный объект наиболее хорошо иллюстрируется:

<Image img={kafka_02} size="lg" alt="Движок таблиц Kafka с вставками" />

Мы предполагаем, что у вас есть созданные таблицы и представления в шагах для [Kafka в ClickHouse](#kafka-to-clickhouse) и что топик был полностью потреблен.

##### 1. Вставка строк напрямую {#1-inserting-rows-directly}

Сначала подтвердите количество в целевой таблице.

```sql
SELECT count() FROM github;
```

У вас должно быть 200,000 строк:
```response
┌─count()─┐
│  200000 │
└─────────┘
```

Теперь вставьте строки из целевой таблицы GitHub обратно в движок таблиц Kafka github_queue. Обратите внимание, как мы используем формат JSONEachRow и ограничиваем выборку 100 строками.

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow;
```

Пересчитайте строки в GitHub, чтобы подтвердить, что их количество увеличилось на 100. Как показано на вышеупомянутой диаграмме, строки были вставлены в Kafka через движок таблиц Kafka, прежде чем быть повторно прочитанными тем же движком и вставленными в целевую таблицу GitHub нашим материализованным представлением!

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

Мы можем использовать материализованные представления для отправки сообщений в движок Kafka (и топик) при вставке документов в таблицу. Когда строки вставляются в таблицу GitHub, срабатывает материализованное представление, которое заставляет строки вставляться обратно в движок Kafka и в новый топик. Опять же, это лучше всего иллюстрируется:

<Image img={kafka_03} size="lg" alt="Движок таблиц Kafka с материализованными представлениями"/>

Создайте новый топик Kafka `github_out` или эквивалентный. Убедитесь, что движок таблиц Kafka `github_out_queue` ссылается на этот топик.

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

Теперь создайте новое материализованное представление `github_out_mv`, чтобы указывать на таблицу GitHub, вставляя строки в вышеуказанный движок, когда оно сработает. Изменения в таблице GitHub, в результате, будут отправлены в наш новый топик Kafka.

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

Если вы вставите в оригинальный топик github, созданный в рамках [Kafka в ClickHouse](#kafka-to-clickhouse), документы волшебным образом появятся в топике "github_clickhouse". Подтвердите это с помощью нативных инструментов Kafka. Например, ниже мы вставляем 100 строк в топик github, используя [kcat](https://github.com/edenhill/kcat) для топика, размещенного в Confluent Cloud:

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

Чтение в топике `github_out` должно подтвердить доставку сообщений.

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

Хотя это сложный пример, он иллюстрирует мощь материализованных представлений, когда они используются совместно с движком Kafka.

### Кластеры и производительность {#clusters-and-performance}

#### Работа с кластерами ClickHouse {#working-with-clickhouse-clusters}

Через группы потребителей Kafka несколько экземпляров ClickHouse могут потенциально читать из одного и того же топика. Каждый потребитель будет назначен на партицию топика в соотношении 1:1. При масштабировании потребления ClickHouse с использованием движка таблиц Kafka учитывайте, что общее количество потребителей в кластере не может превышать количество партиций в топике. Поэтому убедитесь, что партиционирование должным образом сконфигурировано для топика заранее.

Несколько экземпляров ClickHouse могут быть настроены на чтение из одного топика, используя один и тот же идентификатор группы потребителей - этот идентификатор указывается при создании движка таблиц Kafka. Таким образом, каждый экземпляр будет читать из одной или нескольких партиций, вставляя сегменты в свои локальные целевые таблицы. Целевые таблицы, в свою очередь, могут быть настроены на использование ReplicatedMergeTree для обработки дублирования данных. Этот подход позволяет масштабировать чтение из Kafka вместе с кластером ClickHouse, при условии, что имеется достаточное количество партиций Kafka.

<Image img={kafka_04} size="lg" alt="Движок таблиц Kafka с кластерами ClickHouse" />

#### Настройка производительности {#tuning-performance}

Учитывайте следующее, когда хотите увеличить производительность таблицы движка Kafka:

* Производительность будет варьироваться в зависимости от размера сообщения, формата и типов целевых таблиц. 100k строк в секунду на одном движке таблиц следует считать достижимым. По умолчанию сообщения читаются блоками, контролируемыми параметром kafka_max_block_size. По умолчанию это установлено в [max_insert_block_size](/operations/settings/settings#max_insert_block_size), по умолчанию равном 1,048,576. Если сообщения не слишком большие, это значение следует почти всегда увеличивать. Значения от 500k до 1M не являются редкостью. Протестируйте и оцените влияние на производительность.
* Количество потребителей для движка таблиц можно увеличить, используя kafka_num_consumers. Однако по умолчанию вставки будут линейными в одном потоке, если kafka_thread_per_consumer не изменен из значения по умолчанию 1. Установите это значение в 1, чтобы гарантировать выполнение сбросов параллельно. Обратите внимание, что создание таблицы движка Kafka с N потребителями (и kafka_thread_per_consumer=1) логически эквивалентно созданию N движков Kafka, каждый с материализованным представлением и kafka_thread_per_consumer=0.
* Увеличение числа потребителей не является бесплатной операцией. Каждый потребитель поддерживает свои собственные буферы и потоки, увеличивая нагрузку на сервер. Обратите внимание на накладные расходы потребителей и сначала масштабируйте линейно по вашему кластеру, если это возможно.
* Если пропускная способность сообщений Kafka переменная, а задержки допустимы, подумайте о том, чтобы увеличить stream_flush_interval_ms, чтобы гарантировать, что более крупные блоки сбрасываются.
* [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size) устанавливает число потоков, выполняющих фоновую работу. Эти потоки используются для потоковой передачи Kafka. Эта настройка применяется при запуске сервера ClickHouse и не может быть изменена в сеансе пользователя, по умолчанию равная 16. Если вы видите тайм-ауты в журналах, возможно, имеет смысл увеличить это значение.
* Для коммуникации с Kafka используется библиотека librdkafka, которая сама создает потоки. Большое количество таблиц Kafka или потребителей может привести к большому количеству переключений контекста. Либо распределите эту нагрузку по кластеру, повторно создавая целевые таблицы, если это возможно, либо рассмотрите возможность использования движка таблиц для чтения из нескольких топиков - поддерживается список значений. Можно читать несколько материализованных представлений с одной таблицы, каждое из которых фильтрует данные из конкретного топика.

Любые изменения в настройках должны быть протестированы. Мы рекомендуем мониторить задержки потребителей Kafka, чтобы убедиться, что у вас правильный масштаб.

#### Дополнительные настройки {#additional-settings}

Кроме вышеупомянутых настроек, следующее может представлять интерес:

* [Kafka_max_wait_ms](/operations/settings/settings#kafka_max_wait_ms) - время ожидания в миллисекундах для чтения сообщений из Kafka перед повторной попыткой. Устанавливается на уровне пользовательского профиля и по умолчанию равен 5000.

[Все настройки](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md) из библиотеки librdkafka также могут быть помещены в файлы конфигурации ClickHouse внутри элемента _kafka_ - имена настроек должны быть XML-элементами с точками, замененными на подчеркивания, например:

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

Это экспертные настройки, и мы рекомендуем вам обратиться к документации Kafka для более подробного объяснения.
