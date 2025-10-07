---
'sidebar_label': 'Kafka Table Engine'
'sidebar_position': 5
'slug': '/integrations/kafka/kafka-table-engine'
'description': 'Использование движка таблиц Kafka'
'title': 'Использование движка таблиц Kafka'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import kafka_01 from '@site/static/images/integrations/data-ingestion/kafka/kafka_01.png';
import kafka_02 from '@site/static/images/integrations/data-ingestion/kafka/kafka_02.png';
import kafka_03 from '@site/static/images/integrations/data-ingestion/kafka/kafka_03.png';
import kafka_04 from '@site/static/images/integrations/data-ingestion/kafka/kafka_04.png';


# Использование движка таблиц Kafka

Движок таблиц Kafka может быть использован для [**чтения** данных из](#kafka-to-clickhouse) и [**записи** данных в](#clickhouse-to-kafka) Apache Kafka и других брокеров, совместимых с Kafka API (например, Redpanda, Amazon MSK).

### Kafka в ClickHouse {#kafka-to-clickhouse}

:::note
Если вы используете ClickHouse Cloud, мы рекомендуем вместо этого использовать [ClickPipes](/integrations/clickpipes). ClickPipes изначально поддерживает частные сетевые соединения, масштабирование приема данных и ресурсов кластера независимо, а также комплексный мониторинг для потоковых данных Kafka в ClickHouse.
:::

Чтобы использовать движок таблиц Kafka, вам следует быть знакомым с [материализованными представлениями ClickHouse](../../../guides/developer/cascading-materialized-views.md).

#### Обзор {#overview}

Сначала мы сосредоточимся на наиболее распространенном сценарии: использование движка таблиц Kafka для вставки данных в ClickHouse из Kafka.

Движок таблиц Kafka позволяет ClickHouse считывать данные напрямую из темы Kafka. Хотя это полезно для просмотра сообщений в теме, движок по своей природе допускает только одноразовое извлечение, т.е. когда запрос выдается на таблицу, он потребляет данные из очереди и увеличивает смещение потребителя, прежде чем вернуть результаты вызывающему. Данные не могут быть повторно прочитаны без сброса этих смещений.

Чтобы сохранить эти данные из считывания движка таблиц, нам нужно средство захвата данных и вставки их в другую таблицу. Основанные на триггерах материализованные представления изначально предоставляют такую функциональность. Материализованное представление инициирует чтение из движка таблиц, получая партии документов. Клауза TO определяет место назначения данных - обычно это таблица из [семейства Merge Tree](../../../engines/table-engines/mergetree-family/index.md). Этот процесс визуализирован ниже:

<Image img={kafka_01} size="lg" alt="Диаграмма архитектуры движка таблиц Kafka" style={{width: '80%'}} />

#### Шаги {#steps}

##### 1. Подготовка {#1-prepare}

Если у вас есть данные в целевой теме, вы можете адаптировать следующее для использования в вашем наборе данных. В качестве альтернативы, образец данных на GitHub предоставлен [здесь](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson). Этот набор данных используется в примерах ниже и имеет уменьшенную схему и подмножество строк (в частности, мы ограничиваем события GitHub, касающиеся [репозитория ClickHouse](https://github.com/ClickHouse/ClickHouse)), по сравнению с полным набором данных, доступным [здесь](https://ghe.clickhouse.tech/), для краткости. Этого все еще достаточно для работы большинства запросов [опубликованных с набором данных](https://ghe.clickhouse.tech/).

##### 2. Настройка ClickHouse {#2-configure-clickhouse}

Этот шаг необходим, если вы подключаетесь к безопасному Kafka. Эти настройки нельзя передать через SQL DDL команды и их нужно настроить в файле config.xml ClickHouse. Мы предполагаем, что вы подключаетесь к экземпляру с защитой SASL. Это самый простой способ взаимодействия с Confluent Cloud.

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

Либо поместите приведенный выше фрагмент в новый файл в вашем каталоге conf.d/, либо объедините его с существующими файлами конфигурации. Для настройки, которые можно задать, смотрите [здесь](../../../engines/table-engines/integrations/kafka.md#configuration).

Мы также создадим базу данных под названием `KafkaEngine` для использования в этом учебнике:

```sql
CREATE DATABASE KafkaEngine;
```

После создания базы данных вам нужно переключиться на нее:

```sql
USE KafkaEngine;
```

##### 3. Создание целевой таблицы {#3-create-the-destination-table}

Подготовьте вашу целевую таблицу. В примере ниже мы используем уменьшенную схему GitHub для краткости. Обратите внимание, что хотя мы используем движок таблиц MergeTree, этот пример можно легко адаптировать для любого члена [семейства MergeTree](../../../engines/table-engines/mergetree-family/index.md).

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

Далее мы создадим тему. Существует несколько инструментов, которые мы можем использовать для этого. Если мы запускаем Kafka локально на нашем компьютере или внутри контейнера Docker, [RPK](https://docs.redpanda.com/current/get-started/rpk-install/) хорошо работает. Мы можем создать тему под названием `github` с 5 партициями, выполнив следующую команду:

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

Если мы запускаем Kafka в Confluent Cloud, возможно, нам будет удобнее использовать [Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records):

```bash
confluent kafka topic create --if-not-exists github
```

Теперь нам нужно заполнить эту тему некоторыми данными, что мы сделаем с помощью [kcat](https://github.com/edenhill/kcat). Мы можем выполнить команду, аналогичную следующей, если запустим Kafka локально с отключенной аутентификацией:

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

Набор данных содержит 200,000 строк, поэтому его следует загрузить всего за несколько секунд. Если вы хотите работать с большим набором данных, посмотрите на [раздел больших наборов данных](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets) репозитория [ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples).

##### 5. Создание движка таблиц Kafka {#5-create-the-kafka-table-engine}

Ниже приведенный пример создает движок таблиц с той же схемой, что и таблица merge tree. Это не строго необходимо, поскольку вы можете использовать псевдонимы или эпемерные колонки в целевой таблице. Однако настройки важны; обратите внимание на использование `JSONEachRow` как типа данных для потребления JSON из темы Kafka. Значения `github` и `clickhouse` представляют собой название темы и имена групп потребителей соответственно. Темы могут на самом деле быть списком значений.

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

Мы обсуждаем настройки движка и оптимизацию производительности ниже. На этом этапе простой запрос к таблице `github_queue` должен считать некоторые строки. Обратите внимание, что это сдвинет смещения потребителя вперед, что предотвратит повторное чтение этих строк без [сброса](#common-operations). Обратите внимание на ограничение и обязательный параметр `stream_like_engine_allow_direct_select.`

##### 6. Создание материализованного представления {#6-create-the-materialized-view}

Материализованное представление свяжет две ранее созданные таблицы, считывая данные из движка таблиц Kafka и вставляя их в целевую таблицу merge tree. Мы можем выполнить ряд преобразований данных. Мы сделаем простое чтение и вставку. Использование * предполагает, что имена колонок идентичны (чувствительно к регистру).

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```

В момент создания материализованное представление подключается к движку Kafka и начинает чтение: вставляя строки в целевую таблицу. Этот процесс будет продолжаться бесконечно, поскольку последующая вставка сообщений в Kafka будет потребляться. Не стесняйтесь повторно запускать скрипт вставки для вставки дополнительных сообщений в Kafka.

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

#### Общие операции {#common-operations}

##### Остановка и перезапуск потребления сообщений {#stopping--restarting-message-consumption}

Чтобы остановить потребление сообщений, вы можете отвязать таблицу движка Kafka:

```sql
DETACH TABLE github_queue;
```

Это не повлияет на смещения группы потребителей. Чтобы перезапустить потребление и продолжить с предыдущего смещения, привяжите таблицу снова.

```sql
ATTACH TABLE github_queue;
```

##### Добавление метаданных Kafka {#adding-kafka-metadata}

Полезно отслеживать метаданные из оригинальных сообщений Kafka после их загрузки в ClickHouse. Например, мы можем захотеть знать, сколько конкретной темы или партиции мы потребили. Для этой цели движок таблиц Kafka предоставляет несколько [виртуальных колонок](../../../engines/table-engines/index.md#table_engines-virtual_columns). Эти колонки могут быть сохранены как колонки в нашей целевой таблице, изменив нашу схему и предложение select материализованного представления.

Сначала мы выполним операцию остановки, описанную выше, перед добавлением колонок в нашу целевую таблицу.

```sql
DETACH TABLE github_queue;
```

Ниже мы добавляем информационные колонки для идентификации исходной темы и партиции, из которой произошла строка.

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

Далее нам нужно убедиться, что виртуальные колонки сопоставлены, как требуется.
Виртуальные колонки префиксируются символом `_`.
Полный список виртуальных колонок можно найти [здесь](../../../engines/table-engines/integrations/kafka.md#virtual-columns).

Чтобы обновить нашу таблицу с виртуальными колонками, нам нужно будет удалить материализованное представление, снова привязать таблицу движка Kafka и создать заново материализованное представление.

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

Недавно потребленные строки должны иметь метаданные.

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

Мы рекомендуем удалить таблицу движка Kafka и воссоздать ее с новыми настройками. Материализованное представление не нужно изменять в этом процессе - потребление сообщений возобновится после воссоздания таблицы движка Kafka.

##### Отладка проблем {#debugging-issues}

Ошибки, такие как проблемы аутентификации, не сообщаются в ответах на DDL движка Kafka. Для диагностики проблем мы рекомендуем использовать основной файл журнала ClickHouse clickhouse-server.err.log. Дополнительное трассировочное логирование для библиотеки клиентского интерфейса Kafka [librdkafka](https://github.com/edenhill/librdkafka) может быть включено через конфигурацию.

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### Обработка неправильно сформированных сообщений {#handling-malformed-messages}

Kafka часто используется в качестве "свалки" для данных. Это приводит к тому, что темы содержат смешанные форматы сообщений и несоответствующие имена полей. Избегайте этого и используйте функции Kafka, такие как Kafka Streams или ksqlDB, чтобы гарантировать, что сообщения имеют правильную форму и согласованы перед вставкой в Kafka. Если эти варианты невозможны, у ClickHouse есть некоторые функции, которые могут помочь.

* Рассматривайте поле сообщения как строки. Функции могут быть использованы в предложении материализованного представления для выполнения очистки и преобразования при необходимости. Это не должно являться производственным решением, но может помочь в одноразовом приеме данных.
* Если вы потребляете JSON из темы, используя формат JSONEachRow, используйте настройку [`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields). При записи данных ClickHouse по умолчанию выбрасывает исключение, если входные данные содержат колонки, которые не существуют в целевой таблице. Однако, если эта опция включена, эти дополнительные колонки будут игнорироваться. Вновь, это не является производственным решением и может сбить с толку других.
* Рассмотрите настройку `kafka_skip_broken_messages`. Это требует от пользователя указать уровень допустимости по блоку для неправильно сформированных сообщений - рассматривается в контексте kafka_max_block_size. Если эта допускаемая величина превышена (измеряется в абсолютных сообщениях), обычное поведение исключений будет восстановлено, и другие сообщения будут пропущены.

##### Семантика доставки и проблемы с дубликатами {#delivery-semantics-and-challenges-with-duplicates}

Движок таблиц Kafka имеет семантику как минимум один раз. Дубликаты возможны в нескольких известных редких обстоятельствах. Например, сообщения могут быть считаны из Kafka и успешно вставлены в ClickHouse. Прежде чем новое смещение может быть зафиксировано, соединение с Kafka теряется. В этой ситуации требуется повторная попытка блока. Блок можно [дедуплицировать](/engines/table-engines/mergetree-family/replication) с помощью распределенной таблицы или ReplicatedMergeTree в качестве целевой таблицы. Хотя это снижает вероятность дублирующихся строк, это зависит от идентичных блоков. События, такие как ребалансировка Kafka, могут сделать это предположение недействительным, что приводит к дубликатам в редких обстоятельствах.

##### Вставки на основе кворума {#quorum-based-inserts}

Вам могут потребоваться [вставки на основе кворума](/operations/settings/settings#insert_quorum) в случаях, когда требуются более высокие гарантии доставки в ClickHouse. Это нельзя задать для материализованного представления или целевой таблицы. Однако это можно установить для пользовательских профилей, например:

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouse в Kafka {#clickhouse-to-kafka}

Хотя это реже встречающийся случай, данные ClickHouse также могут быть сохранены в Kafka. Например, мы вставим строки вручную в движок таблиц Kafka. Эти данные будут считаны тем же движком Kafka, чье материализованное представление поместит данные в таблицу Merge Tree. Наконец, мы демонстрируем применение материализованных представлений при вставках в Kafka для считывания таблиц из существующих исходных таблиц.

#### Шаги {#steps-1}

Нашей первоначальной целью лучше всего иллюстрировать:

<Image img={kafka_02} size="lg" alt="Диаграмма движка таблиц Kafka с вставками" />

Мы предполагаем, что у вас созданы таблицы и представления в рамках шагов для [Kafka в ClickHouse](#kafka-to-clickhouse) и что тема была полностью потреблена.

##### 1. Прямые вставки строк {#1-inserting-rows-directly}

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

Теперь вставьте строки из целевой таблицы GitHub обратно в движок таблиц Kafka github_queue. Обратите внимание, как мы используем формат JSONEachRow и ограничиваем выборку до 100.

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

Пересчитайте строки в GitHub, чтобы подтвердить, что их количество увеличилось на 100. Как показано на вышеуказанной диаграмме, строки были вставлены в Kafka через движок таблиц Kafka, прежде чем быть повторно считанными тем же движком и вставленными в целевую таблицу GitHub с помощью нашего материализованного представления!

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

Мы можем использовать материализованные представления, чтобы отправлять сообщения в движок Kafka (и тему), когда документы вставляются в таблицу. Когда строки вставляются в таблицу GitHub, срабатывает материализованное представление, которое вызывает вставку строк обратно в движок Kafka и в новую тему. Снова это лучше всего иллюстрировать:

<Image img={kafka_03} size="lg" alt="Диаграмма движка таблиц Kafka с материализованными представлениями"/>

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
            'JSONEachRow') SETTINGS kafka_thread_per_consumer = 0, kafka_num_consumers = 1;
```

Теперь создайте новое материализованное представление `github_out_mv`, чтобы оно указывало на таблицу GitHub, вставляя строки в вышеупомянутый движок, когда оно срабатывает. Добавление в таблицу GitHub приведет к тому, что данные будут отправлены в нашу новую тему Kafka.

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

Если вы вставите в оригинальную тему github, созданную в рамках [Kafka в ClickHouse](#kafka-to-clickhouse), документы волшебным образом появятся в теме "github_clickhouse". Подтвердите это с помощью инструментов Kafka. Например, ниже мы вставляем 100 строк в тему github, используя [kcat](https://github.com/edenhill/kcat) для темы, размещенной в Confluent Cloud:

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

Хотя это сложный пример, он иллюстрирует силу материализованных представлений при использовании в сочетании с движком Kafka.

### Кластеры и производительность {#clusters-and-performance}

#### Работа с кластерами ClickHouse {#working-with-clickhouse-clusters}

Через группы потребителей Kafka несколько экземпляров ClickHouse потенциально могут считывать из одной и той же темы. Каждый потребитель будет назначен для партиции темы в соотношении 1:1. При масштабировании потребления ClickHouse с использованием движка таблиц Kafka учтите, что общее количество потребителей в кластере не может превышать количество партиций в теме. Поэтому убедитесь, что партиционирование настроено соответствующим образом для темы заранее.

Несколько экземпляров ClickHouse могут быть настроены для чтения из темы с использованием одного и того же идентификатора группы потребителей - указанного во время создания движка таблиц Kafka. Таким образом, каждый экземпляр будет считывать из одной или нескольких партиций, вставляя сегменты в свою локальную целевую таблицу. Целевые таблицы могут, в свою очередь, быть настроены на использование ReplicatedMergeTree для обработки дублирования данных. Такой подход позволяет масштабировать чтение Kafka с кластером ClickHouse, при условии, что существует достаточное количество партиций Kafka.

<Image img={kafka_04} size="lg" alt="Диаграмма движка таблиц Kafka с кластерами ClickHouse"/>

#### Настройка производительности {#tuning-performance}

Рассмотрите следующие моменты, когда хотите увеличить производительность таблицы движка Kafka:

* Производительность будет варьироваться в зависимости от размера сообщения, формата и типов целевых таблиц. 100k строк в секунду на одном движке таблиц следует считать достижимыми. По умолчанию сообщения считываются пакетами, контролируемыми параметром kafka_max_block_size. По умолчанию это значение установлено на [max_insert_block_size](/operations/settings/settings#max_insert_block_size), по умолчанию равное 1,048,576. Если сообщения не очень большие, это значение почти всегда следует увеличить. Значения от 500k до 1M не являются редкостью. Проведите тестирование и оцените влияние на производительность.
* Количество потребителей для движка таблиц можно увеличить с помощью kafka_num_consumers. Однако по умолчанию вставки будут линейно упаковываться в одном потоке, если kafka_thread_per_consumer не изменен с значения по умолчанию, равного 1. Установите это значение на 1, чтобы гарантировать выполнение сбросов параллельно. Обратите внимание, что создание таблицы движка Kafka с N потребителями (и kafka_thread_per_consumer=1) логически эквивалентно созданию N движков Kafka, каждый из которых имеет материализованное представление и kafka_thread_per_consumer=0.
* Увеличение количества потребителей не является бесплатной операцией. Каждый потребитель поддерживает свои собственные буферы и потоки, увеличивая нагрузку на сервер. Будьте внимательны к накладным расходам потребителей и масштабироваьте линейно по вашему кластеру в первую очередь, если возможно.
* Если пропускная способность сообщений Kafka переменная, и задержки допустимы, рассмотрите возможность увеличения stream_flush_interval_ms, чтобы гарантировать сброс больших блоков.
* [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size) задает количество потоков, выполняющих фоновые задачи. Эти потоки используются для стриминга Kafka. Эта настройка применяется при запуске сервера ClickHouse и не может быть изменена в пользовательской сессии, по умолчанию равной 16. Если вы видите тайм-ауты в журналах, возможно, будет уместно увеличить это значение.
* Для общения с Kafka используется библиотека librdkafka, которая сама создает потоки. Большое количество таблиц Kafka или потребителей может привести к значительному количеству переключений контекста. Либо распределите эту нагрузку по кластеру, реплицируя целевые таблицы только если возможно, либо рассмотрите возможность использования движка таблиц для чтения из нескольких тем - поддерживается список значений. Множество материализованных представлений могут считываться из одной таблицы, фильтруя данные с конкретной темы.

Любые изменения настроек следует тестировать. Мы рекомендуем мониторить задержки потребителей Kafka, чтобы убедиться, что вы правильно масштабированы.

#### Дополнительные настройки {#additional-settings}

Помимо обсужденных выше настроек, следующим может быть ваш интерес:

* [Kafka_max_wait_ms](/operations/settings/settings#kafka_max_wait_ms) - Время ожидания в миллисекундах для чтения сообщений из Kafka перед повторной попыткой. Устанавливается на уровне пользовательского профиля и по умолчанию равняется 5000.

[Все настройки](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md) из библиотеки librdkafka также могут быть размещены в конфигурационных файлах ClickHouse внутри элемента _kafka_ - имена настроек должны быть элементами XML с точками, замененными на нижние подчеркивания, например:

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

Эти настройки предназначены для экспертов, и мы рекомендуем вам обратиться к документации Kafka для получения подробного объяснения.
