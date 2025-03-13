---
sidebar_label: 'Kafka Table Engine'
sidebar_position: 5
slug: '/integrations/kafka/kafka-table-engine'
description: 'Использование движка таблицы Kafka'
---
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import kafka_01 from '@site/static/images/integrations/data-ingestion/kafka/kafka_01.png';
import kafka_02 from '@site/static/images/integrations/data-ingestion/kafka/kafka_02.png';
import kafka_03 from '@site/static/images/integrations/data-ingestion/kafka/kafka_03.png';
import kafka_04 from '@site/static/images/integrations/data-ingestion/kafka/kafka_04.png';


# Использование движка таблицы Kafka

<CloudNotSupportedBadge/>

:::note
Движок таблицы Kafka не поддерживается на [ClickHouse Cloud](https://clickhouse.com/cloud). Пожалуйста, рассмотрите [ClickPipes](../clickpipes/kafka.md) или [Kafka Connect](./kafka-clickhouse-connect-sink.md)
:::

### Kafka в ClickHouse {#kafka-to-clickhouse}

Чтобы использовать движок таблицы Kafka, вам следует иметь общее представление о [материализованных представлениях ClickHouse](../../../guides/developer/cascading-materialized-views.md).

#### Обзор {#overview}

Изначально мы сосредотачиваемся на самом распространенном случае: использованию движка таблицы Kafka для вставки данных в ClickHouse из Kafka.

Движок таблицы Kafka позволяет ClickHouse читать непосредственно из темы Kafka. Хотя это полезно для просмотра сообщений в теме, движок по своей природе разрешает одноразовое извлечение, т.е. когда запрос выдается к таблице, он потребляет данные из очереди и увеличивает смещение потребителя перед возвратом результатов вызывающему. Данные не могут быть повторно прочитаны без сброса этих смещений.

Чтобы сохранить данные из чтения движка таблицы, нам нужно средство захвата данных и вставки их в другую таблицу. Материализованные представления, работающие на основе триггеров, нативно предоставляют эту функциональность. Материализованное представление инициирует чтение из движка таблицы, получая партии документов. Условие TO определяет пункт назначения данных - обычно это таблица из семейства [Merge Tree](../../../engines/table-engines/mergetree-family/index.md). Этот процесс визуализирован ниже:

<img src={kafka_01} class="image" alt="Движок таблицы Kafka" style={{width: '80%'}} />

#### Шаги {#steps}

##### 1. Подготовка {#1-prepare}

Если у вас есть данные, помещенные в целевую тему, вы можете адаптировать следующее для использования в вашем наборе данных. В качестве альтернативы, образец набора данных Github представлен [здесь](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson). Этот набор данных используется в примерах ниже и имеет уменьшенную схему и подмножество строк (в частности, мы ограничиваемся событиями GitHub, касающимися [репозитория ClickHouse](https://github.com/ClickHouse/ClickHouse)), по сравнению с полным набором данных, доступным [здесь](https://ghe.clickhouse.tech/), для краткости. Это по-прежнему достаточно для выполнения большинства запросов, [опубликованных с набором данных](https://ghe.clickhouse.tech/).

##### 2. Настройка ClickHouse {#2-configure-clickhouse}

Этот шаг необходим, если вы подключаетесь к защищенному Kafka. Эти настройки не могут быть переданы через SQL DDL команды и должны быть настроены в config.xml ClickHouse. Мы предполагаем, что вы подключаетесь к экземпляру, защищенному SASL. Это самый простой способ взаимодействия с Confluent Cloud.

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

Поместите приведенный выше фрагмент в новый файл в директории conf.d/ или объедините его с существующими конфигурационными файлами. Для настроек, которые можно конфигурировать, смотрите [здесь](../../../engines/table-engines/integrations/kafka.md#configuration).

Мы также создадим базу данных с именем `KafkaEngine`, которую будем использовать в этом учебнике:

```sql
CREATE DATABASE KafkaEngine;
```

После создания базы данных вам нужно будет переключиться на нее:

```sql
USE KafkaEngine;
```

##### 3. Создание целевой таблицы {#3-create-the-destination-table}

Подготовьте вашу целевую таблицу. В приведенном ниже примере мы используем уменьшенную схему GitHub для краткости. Обратите внимание, что хотя мы используем движок таблицы MergeTree, этот пример можно легко адаптировать для любого из членов [семейства MergeTree](../../../engines/table-engines/mergetree-family/index.md).

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

Следующим шагом мы создадим тему. Существует несколько инструментов, которые мы можем использовать для этого. Если мы запускаем Kafka локально на своем компьютере или внутри контейнера Docker, [RPK](https://docs.redpanda.com/current/get-started/rpk-install/) отлично подойдет. Мы можем создать тему под названием `github` с 5 партициями, выполнив следующую команду:

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

Если мы запускаем Kafka в Confluent Cloud, нам может быть удобнее использовать [Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records):

```bash
confluent kafka topic create --if-not-exists github
```

Теперь нам нужно заполнить эту тему некоторыми данными, для чего мы будем использовать [kcat](https://github.com/edenhill/kcat). Мы можем выполнить команду, похожую на следующую, если запускаем Kafka локально с отключенной аутентификацией:

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

Набор данных содержит 200,000 строк, поэтому он должен быть загружен всего за несколько секунд. Если вы хотите работать с большим набором данных, ознакомьтесь с [разделом больших наборов данных](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets) репозитория [ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples).

##### 5. Создание движка таблицы Kafka {#5-create-the-kafka-table-engine}

Ниже приведенный пример создает движок таблицы с той же схемой, что и таблица merge tree. Это не строго обязательно, так как у вас могут быть алиасы или эпhemerные колонки в целевой таблице. Однако настройки важны; обратите внимание на использование `JSONEachRow` в качестве типа данных для потребления JSON из темы Kafka. Значения `github` и `clickhouse` представляют собой имя темы и имена групп потребителей соответственно. Темы могут фактически представлять собой список значений.

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

Мы обсудим настройки движка и оптимизацию производительности ниже. На этом этапе простой выбор из таблицы `github_queue` должен прочитать несколько строк. Обратите внимание, что это переместит смещения потребителя вперед, предотвращая повторное чтение этих строк без [сброса](#common-operations). Обратите внимание на лимит и обязательный параметр `stream_like_engine_allow_direct_select.`

##### 6. Создание материализованного представления {#6-create-the-materialized-view}

Материализованное представление соединит две ранее созданные таблицы, читая данные из движка таблицы Kafka и вставляя их в целевую таблицу merge tree. Мы можем сделать несколько преобразований данных. Мы сделаем простое чтение и вставку. Использование * предполагает, что имена колонок идентичны (регистр имеет значение).

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```

На момент создания материализованное представление подключается к движку Kafka и начинает читать, вставляя строки в целевую таблицу. Этот процесс будет продолжаться бесконечно, с последующими вставками сообщений в Kafka, которые будут потребляться. Не стесняйтесь повторно запускать сценарий вставки, чтобы вставить дополнительные сообщения в Kafka.

##### 7. Подтверждение вставки строк {#7-confirm-rows-have-been-inserted}

Подтвердите, что данные существуют в целевой таблице:

```sql
SELECT count() FROM github;
```

Вы должны увидеть 200,000 строк:
```response
┌─count()─┐
│  200000 │
└─────────┘
```

#### Распространенные операции {#common-operations}

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

Полезно отслеживать метаданные из оригинальных сообщений Kafka после его загрузки в ClickHouse. Например, нам может понадобиться знать, сколько определенной темы или партиции мы потребили. Для этой цели движок таблицы Kafka предоставляет несколько [виртуальных колонок](../../../engines/table-engines/index.md#table_engines-virtual_columns). Эти колонки могут быть сохранены как колонки в нашей целевой таблице путем изменения нашей схемы и выражения выбора материализованного представления.

Сначала мы выполняем операцию остановки, описанную выше, перед добавлением колонок в нашу целевую таблицу.

```sql
DETACH TABLE github_queue;
```

Ниже мы добавляем информационные колонки, чтобы указать исходную тему и партицию, из которой произошла строка.

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

Далее мы должны убедиться, что виртуальные колонки сопоставлены по мере необходимости. Виртуальные колонки имеют префикс `_`. Полный список виртуальных колонок можно найти [здесь](../../../engines/table-engines/integrations/kafka.md#virtual-columns).

Чтобы обновить нашу таблицу с виртуальными колонками, нам нужно будет удалить материализованное представление, повторно присоединить таблицу движка Kafka и снова создать материализованное представление.

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

Новые потребленные строки должны иметь метаданные.

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

Мы рекомендуем удалить таблицу движка Kafka и воссоздать ее с новыми настройками. Материализованное представление не нужно изменять в ходе этого процесса - потребление сообщений возобновится после воссоздания таблицы движка Kafka.

##### Отладка проблем {#debugging-issues}

Ошибки, такие как проблемы с аутентификацией, не сообщаются в ответах на DDL движка Kafka. Для диагностики проблем мы рекомендуем использовать основной файл журнала ClickHouse clickhouse-server.err.log. Дополнительное журнальное отслеживание для библиотек клиента Kafka [librdkafka](https://github.com/edenhill/librdkafka) можно включить через конфигурацию.

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### Обработка неправильно сформированных сообщений {#handling-malformed-messages}

Kafka часто используется как "свалка" для данных. Это приводит к темам с смешанными форматами сообщений и неконсистентными именами полей. Избегайте этого и используйте функции Kafka, такие как Kafka Streams или ksqlDB, чтобы убедиться, что сообщения хорошо сформированы и согласованы перед вставкой в Kafka. Если эти варианты невозможны, ClickHouse имеет некоторые функции, которые могут помочь.

* Рассматривайте поле сообщения как строки. В выражении материализованного представления могут быть использованы функции для очистки и преобразования, если это потребуется. Это не должно представлять собой производственное решение, но может помочь при разовой загрузке.
* Если вы потребляете JSON из темы, используя формат JSONEachRow, используйте настройку [`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields). При записи данных, по умолчанию, ClickHouse выдает исключение, если входные данные содержат колонки, которые не существуют в целевой таблице. Однако, если этот параметр включен, эти лишние колонки будут игнорироваться. Опять же, это не решение для производственного уровня и может запутать других.
* Рассмотрите настройку `kafka_skip_broken_messages`. Это требует от пользователя указать уровень терпимости на блок для неправильно сформированных сообщений - учитываемых в контексте kafka_max_block_size. Если это терпимость превышена (измеренная в абсолютных сообщениях), обычное поведение исключений вернется, и другие сообщения будут пропущены.

##### Семантика доставки и проблемы с дубликатами {#delivery-semantics-and-challenges-with-duplicates}

Движок таблицы Kafka имеет семантику хотя бы раз. Дубликаты возможны в нескольких известных редких обстоятельствах. Например, сообщения могут быть прочитаны из Kafka и успешно вставлены в ClickHouse. Прежде чем новое смещение может быть зафиксировано, соединение с Kafka потеряно. В этой ситуации требуется повторная попытка блока. Блок можно [де-дубликатировать](/engines/table-engines/mergetree-family/replication), используя распределенную таблицу или ReplicatedMergeTree в качестве целевой таблицы. Хотя это снижает вероятность дублирования строк, это зависит от одинаковых блоков. События, такие как перераспределение Kafka, могут аннулировать это предположение, вызывая дубликаты в редких обстоятельствах.

##### Вставки на основе кворума {#quorum-based-inserts}

Вам могут понадобиться [вставки на основе кворума](/operations/settings/settings#insert_quorum) в случаях, когда требуются более высокие гарантии доставки в ClickHouse. Это не может быть установлено для материализованного представления или целевой таблицы. Однако это может быть установлено для пользовательских профилей, например:

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouse в Kafka {#clickhouse-to-kafka}

Хотя это и редкий случай, данные ClickHouse также могут быть сохранены в Kafka. Например, мы вставим строки вручную в движок таблицы Kafka. Эти данные будут прочитаны тем же движком Kafka, чье материализованное представление разместит данные в таблице Merge Tree. Наконец, мы продемонстрируем применение материализованных представлений для вставок в Kafka для считывания таблиц из существующих исходных таблиц.

#### Шаги {#steps-1}

Наша первоначальная цель лучше всего проиллюстрирована:

<img src={kafka_02} class="image" alt="Движок таблицы Kafka с вставками" style={{width: '80%'}} />

Мы предполагаем, что у вас созданы таблицы и представления в соответствии с шагами для [Kafka в ClickHouse](#kafka-to-clickhouse) и что тема была полностью потреблена.

##### 1. Прямое вставление строк {#1-inserting-rows-directly}

Сначала подтвердите количество строк в целевой таблице.

```sql
SELECT count() FROM github;
```

У вас должно быть 200,000 строк:
```response
┌─count()─┐
│  200000 │
└─────────┘
```

Теперь вставляем строки из целевой таблицы GitHub обратно в движок таблицы Kafka github_queue. Обратите внимание, как мы используем формат JSONEachRow и ограничиваем выборку до 100.

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

Пересчитайте строки в GitHub, чтобы подтвердить, что их количество увеличилось на 100. Как показано на приведенной выше схеме, строки были вставлены в Kafka через движок таблицы Kafka, прежде чем быть повторно прочитанными тем же движком и вставленными в целевую таблицу GitHub нашим материализованным представлением!

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

Мы можем использовать материализованные представления для отправки сообщений в движок Kafka (и в тему), когда документы вставляются в таблицу. Когда строки вставляются в таблицу GitHub, материализованное представление срабатывает, что приводит к вставке строк обратно в движок Kafka и в новую тему. Опять же, это лучше всего проиллюстрировано:

<img src={kafka_03} class="image" alt="Движок таблицы Kafka с вставками" style={{width: '80%'}} />

Создайте новую тему Kafka `github_out` или аналогичную. Убедитесь, что движок таблицы Kafka `github_out_queue` указывает на эту тему.

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

Теперь создайте новое материализованное представление `github_out_mv`, чтобы указать на таблицу GitHub, вставляя строки в вышеуказанный движок, когда оно срабатывает. Добавление новых строк в таблицу GitHub приведет к тому, что они будут отправлены в нашу новую тему Kafka.

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

Если вы вставите в оригинальную тему github, созданную в рамках [Kafka в ClickHouse](#kafka-to-clickhouse), документы волшебным образом появятся в теме "github_clickhouse". Подтвердите это с помощью встроенных инструментов Kafka. Например, ниже мы вставляем 100 строк в тему github, используя [kcat](https://github.com/edenhill/kcat) для темы, размещенной в Confluent Cloud:

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

Чтение по теме `github_out` должно подтвердить доставку сообщений.

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

Хотя это и сложный пример, он иллюстрирует мощь материализованных представлений при использовании в сочетании с движком Kafka.

### Кластеры и производительность {#clusters-and-performance}

#### Работа с кластерами ClickHouse {#working-with-clickhouse-clusters}

Через группы потребителей Kafka несколько экземпляров ClickHouse могут потенциально читать из одной и той же темы. Каждый потребитель будет назначен партиции темы в соотношении 1:1. При масштабировании потребления ClickHouse с помощью движка таблицы Kafka необходимо учитывать, что общее количество потребителей внутри кластера не может превышать количество партиций в теме. Поэтому убедитесь, что партиционирование заранее правильно настроено для темы.

Несколько экземпляров ClickHouse могут быть настроены для чтения из темы, используя один и тот же идентификатор группы потребителей - указанный во время создания движка таблицы Kafka. Таким образом, каждый экземпляр будет читать из одной или нескольких партиций, вставляя сегменты в свою локальную целевую таблицу. Эти целевые таблицы, в свою очередь, могут быть настроены на использование ReplicatedMergeTree для обработки дублирования данных. Этот подход позволяет масштабировать чтение из Kafka с кластером ClickHouse, при условии, что имеется достаточное количество партиций Kafka.

<img src={kafka_04} class="image" alt="Движок таблицы Kafka с вставками" style={{width: '80%'}} />

#### Настройка производительности {#tuning-performance}

Обратите внимание на следующее, когда вы хотите увеличить производительность пропускной способности таблицы движка Kafka:


* Производительность будет варьироваться в зависимости от размера сообщения, формата и типов целевых таблиц. 100k строк/сек на одном движке таблицы следует считать достижимым. По умолчанию сообщения читаются партиями, контролируемыми параметром kafka_max_block_size. По умолчанию этот параметр установлен на [max_insert_block_size](/operations/settings/settings#max_insert_block_size), по умолчанию равен 1,048,576. Если сообщения не чрезвычайно большие, этот параметр почти всегда следует увеличивать. Значения от 500k до 1M не являются редкостью. Проведите тестирование и оцените влияние на производительность пропускной способности.
* Число потребителей для таблицы движка можно увеличить с помощью kafka_num_consumers. Однако, по умолчанию, вставки будут линейно выполняться в одном потоке, если kafka_thread_per_consumer не изменен с значения по умолчанию 1. Установите это значение в 1, чтобы гарантировать, что сбросы выполняются параллельно. Обратите внимание, что создание таблицы движка Kafka с N потребителями (и kafka_thread_per_consumer=1) логически эквивалентно созданию N движков Kafka, каждый из которых имеет материализованное представление и kafka_thread_per_consumer=0.
* Увеличение числа потребителей не является бесплатной операцией. Каждый потребитель поддерживает свои собственные буферы и потоки, увеличивая накладные расходы на сервер. Обращайте внимание на накладные расходы потребителей и масштабируйте линейно сначала по вашему кластеру, если это возможно.
* Если пропускная способность сообщений Kafka варьируется, а задержки допустимы, рассмотрите возможность увеличения stream_flush_interval_ms, чтобы гарантировать, что большие блоки сбрасываются.
* [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size) устанавливает количество потоков, выполняющих фоновые задачи. Эти потоки используются для потоковой передачи Kafka. Этот параметр применяется при старте сервера ClickHouse и не может быть изменен в пользовательской сессии, по умолчанию равен 16. Если в журналах наблюдаются таймауты, может быть целесообразно увеличить это значение.
* Для общения с Kafka используется библиотека librdkafka, которая сама создает потоки. Большое количество таблиц Kafka или потребителей может привести к большому количеству переключений контекста. Либо распределите эту нагрузку по кластеру, только реплицируя целевые таблицы, если возможно, либо рассмотрите использование движка таблицы для чтения из нескольких тем - поддерживается список значений. Несколько материализованных представлений могут быть прочитаны из одной таблицы, каждое фильтруя данные от конкретной темы.

Любые изменения настроек должны быть протестированы. Мы рекомендуем отслеживать задержки потребителей Kafka, чтобы убедиться, что вы должным образом масштабированы.

#### Дополнительные настройки {#additional-settings}

Помимо обсужденных выше настроек, следующие могут представлять интерес:

* [Kafka_max_wait_ms](/operations/settings/settings#kafka_max_wait_ms) - Время ожидания в миллисекундах для чтения сообщений из Kafka перед повторной попыткой. Устанавливается на уровне пользовательского профиля и по умолчанию составляет 5000.

[Все настройки](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md) из основной библиотеки librdkafka также могут быть размещены в конфигурационных файлах ClickHouse внутри элемента _kafka_ - имена настроек должны быть XML-элементами, с заменой точек на подчеркивания например.

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

Это экспертные настройки, и мы рекомендуем вам обратиться к документации Kafka для более глубокого объяснения.
