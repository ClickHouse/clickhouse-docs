---
sidebar_label: 'Табличный движок Kafka'
sidebar_position: 5
slug: /integrations/kafka/kafka-table-engine
description: 'Использование табличного движка Kafka'
title: 'Использование табличного движка Kafka'
doc_type: 'guide'
keywords: ['kafka', 'табличный движок', 'потоковая обработка', 'реальное время', 'очередь сообщений']
---

import Image from '@theme/IdealImage';
import kafka_01 from '@site/static/images/integrations/data-ingestion/kafka/kafka_01.png';
import kafka_02 from '@site/static/images/integrations/data-ingestion/kafka/kafka_02.png';
import kafka_03 from '@site/static/images/integrations/data-ingestion/kafka/kafka_03.png';
import kafka_04 from '@site/static/images/integrations/data-ingestion/kafka/kafka_04.png';


# Использование движка таблиц Kafka

Движок таблиц Kafka можно использовать для [**чтения** данных из](#kafka-to-clickhouse) и [**записи** данных в](#clickhouse-to-kafka) Apache Kafka и другие брокеры, совместимые с Kafka API (например, Redpanda, Amazon MSK).

### Kafka → ClickHouse

:::note
Если вы используете ClickHouse Cloud, мы рекомендуем вместо этого использовать [ClickPipes](/integrations/clickpipes). ClickPipes нативно поддерживает приватные сетевые подключения, независимое масштабирование ресурсов приёма и кластера, а также всесторонний мониторинг для потоковой передачи данных Kafka в ClickHouse.
:::

Чтобы использовать движок таблиц Kafka, вам следует в общих чертах быть знакомыми с [материализованными представлениями ClickHouse](../../../guides/developer/cascading-materialized-views.md).

#### Обзор

Сначала мы сосредоточимся на самом распространённом варианте использования: применении движка таблиц Kafka для вставки данных в ClickHouse из Kafka.

Движок таблиц Kafka позволяет ClickHouse читать данные напрямую из топика Kafka. Хотя это удобно для просмотра сообщений в топике, по своему устройству движок допускает только однократное извлечение данных, то есть при выполнении запроса к таблице он потребляет данные из очереди и увеличивает смещение (offset) потребителя, прежде чем вернуть результаты вызывающей стороне. По сути, повторно прочитать данные нельзя без сброса этих смещений.

Чтобы сохранить эти данные, прочитанные через движок таблиц, нам нужен способ захвата данных и вставки их в другую таблицу. Материализованные представления на основе триггеров нативно предоставляют такую функциональность. Материализованное представление инициирует чтение из движка таблиц, получая батчи документов. Оператор TO определяет место назначения данных — обычно это таблица из [семейства MergeTree](../../../engines/table-engines/mergetree-family/index.md). Эта схема показана ниже:

<Image img={kafka_01} size="lg" alt="Схема архитектуры движка таблиц Kafka" style={{width: '80%'}} />

#### Шаги

##### 1. Подготовка

Если у вас уже есть данные в целевом топике, вы можете адаптировать приведённое ниже под свой набор данных. В качестве альтернативы доступен пример набора данных GitHub [здесь](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson). Этот набор данных используется в примерах ниже и основан на урезанной схеме и подмножестве строк (в частности, мы ограничиваемся событиями GitHub, относящимися к [репозиторию ClickHouse](https://github.com/ClickHouse/ClickHouse)), по сравнению с полным набором данных, доступным [здесь](https://ghe.clickhouse.tech/), для краткости. Этого по-прежнему достаточно, чтобы большинство запросов, [опубликованных вместе с набором данных](https://ghe.clickhouse.tech/), работали.

##### 2. Настройка ClickHouse

Этот шаг требуется, если вы подключаетесь к защищённому Kafka. Эти настройки нельзя передать через SQL DDL-команды, их необходимо задать в файле ClickHouse config.xml. Мы предполагаем, что вы подключаетесь к экземпляру, защищённому с помощью SASL. Это самый простой способ при работе с Confluent Cloud.

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

Либо поместите приведённый выше фрагмент в новый файл в каталоге conf.d/, либо объедините его с существующими файлами конфигурации. Настраиваемые параметры описаны [здесь](../../../engines/table-engines/integrations/kafka.md#configuration).

Мы также создадим базу данных под названием `KafkaEngine`, которую будем использовать в этом руководстве:

```sql
CREATE DATABASE KafkaEngine;
```

После создания базы данных переключитесь на неё:

```sql
USE KafkaEngine;
```

##### 3. Создайте целевую таблицу

Подготовьте целевую таблицу. В примере ниже для краткости используется упрощённая схема GitHub. Обратите внимание, что, хотя в примере используется движок таблицы MergeTree, его легко можно адаптировать для любого представителя [семейства MergeTree](../../../engines/table-engines/mergetree-family/index.md).


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

##### 4. Создание и наполнение топика

Теперь создадим топик. Для этого можно использовать несколько инструментов. Если Kafka запущена локально на нашей машине или внутри Docker-контейнера, [RPK](https://docs.redpanda.com/current/get-started/rpk-install/) отлично подходит. Мы можем создать топик `github` с 5 партициями, выполнив следующую команду:

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

Если мы запускаем Kafka в Confluent Cloud, мы, вероятно, предпочтём использовать [Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records):

```bash
confluent kafka topic create --if-not-exists github
```

Теперь нам нужно заполнить этот топик некоторыми данными, и для этого мы воспользуемся [kcat](https://github.com/edenhill/kcat). Если Kafka запущена локально с отключённой аутентификацией, можно выполнить следующую команду:

```bash
cat github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
```

Или следующее, если в нашем кластере Kafka используется SASL для аутентификации:

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


Набор данных содержит 200 000 строк, поэтому его приём должен занять всего несколько секунд. Если вы хотите работать с более крупным набором данных, ознакомьтесь с [разделом о больших наборах данных](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets) репозитория GitHub [ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples).

##### 5. Создание таблицы с движком Kafka

Пример ниже создаёт таблицу с движком Kafka с той же схемой, что и у таблицы на движке MergeTree. Это не является строго обязательным, так как вы можете использовать алиасы или временные столбцы в целевой таблице. Однако настройки имеют важное значение — обратите внимание на использование `JSONEachRow` как типа данных для чтения JSON из топика Kafka. Значения `github` и `clickhouse` представляют собой имя топика и имя группы потребителей соответственно. На самом деле список топиков может содержать несколько значений.

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

Ниже мы рассмотрим настройки движка и оптимизацию производительности. На этом этапе простой запрос SELECT к таблице `github_queue` должен прочитать несколько строк. Обратите внимание, что это сдвинет вперёд смещения консьюмера, не позволяя прочитать эти строки повторно без [сброса](#common-operations). Также обратите внимание на `LIMIT` и обязательный параметр `stream_like_engine_allow_direct_select`.

##### 6. Создайте материализованное представление

Материализованное представление свяжет две ранее созданные таблицы, считывая данные из таблицы с движком Kafka и вставляя их в целевую таблицу MergeTree. Мы можем выполнять различные преобразования данных. В данном случае мы выполним простое чтение и вставку. Использование `*` предполагает, что имена столбцов идентичны (с учётом регистра).

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```


В момент создания материализованное представление подключается к движку Kafka и начинает считывать данные, вставляя строки в целевую таблицу. Этот процесс будет продолжаться бесконечно, при этом все последующие сообщения, вставляемые в Kafka, будут считываться. При необходимости перезапустите скрипт вставки, чтобы добавить новые сообщения в Kafka.

##### 7. Проверьте, что строки были вставлены

Убедитесь, что данные присутствуют в целевой таблице:

```sql
SELECT count() FROM github;
```

Должно отобразиться 200 000 строк:

```response
┌─count()─┐
│  200000 │
└─────────┘
```

#### Общие операции

##### Остановка и перезапуск потребления сообщений

Чтобы остановить потребление сообщений, вы можете отсоединить таблицу с движком Kafka:

```sql
DETACH TABLE github_queue;
```

Это не повлияет на смещения группы потребителей. Чтобы возобновить чтение и продолжить с предыдущего смещения, снова подключите таблицу.

```sql
ATTACH TABLE github_queue;
```

##### Добавление метаданных Kafka

Полезно сохранять метаданные исходных сообщений Kafka после их приёма в ClickHouse. Например, может потребоваться знать, какой объём данных из конкретного топика или партиции уже был потреблён. Для этого движок таблицы Kafka предоставляет несколько [виртуальных столбцов](../../../engines/table-engines/index.md#table_engines-virtual_columns). Эти столбцы можно сделать постоянными в целевой таблице, изменив схему и оператор SELECT в нашем материализованном представлении.

Сначала мы выполняем описанную выше операцию остановки, прежде чем добавлять столбцы в целевую таблицу.

```sql
DETACH TABLE github_queue;
```

Ниже мы добавляем дополнительные столбцы, чтобы идентифицировать исходный топик и партицию, из которой была прочитана строка.

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

Далее нам нужно убедиться, что виртуальные столбцы сопоставлены требуемым образом.
Виртуальные столбцы имеют префикс `_`.
Полный список виртуальных столбцов можно найти [здесь](../../../engines/table-engines/integrations/kafka.md#virtual-columns).

Чтобы обновить нашу таблицу с виртуальными столбцами, нам нужно удалить материализованное представление, повторно прикрепить таблицу с движком Kafka и заново создать материализованное представление.

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

Новые поступившие строки должны содержать метаданные.

```sql
SELECT actor_login, event_type, created_at, topic, partition
FROM github
LIMIT 10;
```

Результат будет выглядеть так:

| actor&#95;login | event&#95;type     | created&#95;at      | topic  | partition |
| :-------------- | :----------------- | :------------------ | :----- | :-------- |
| IgorMinar       | CommitCommentEvent | 2011-02-12 02:22:00 | github | 0         |
| queeup          | CommitCommentEvent | 2011-02-12 02:23:23 | github | 0         |
| IgorMinar       | CommitCommentEvent | 2011-02-12 02:23:24 | github | 0         |
| IgorMinar       | CommitCommentEvent | 2011-02-12 02:24:50 | github | 0         |
| IgorMinar       | CommitCommentEvent | 2011-02-12 02:25:20 | github | 0         |
| dapi            | CommitCommentEvent | 2011-02-12 06:18:36 | github | 0         |
| sourcerebels    | CommitCommentEvent | 2011-02-12 06:34:10 | github | 0         |
| jamierumbelow   | CommitCommentEvent | 2011-02-12 12:21:40 | github | 0         |
| jpn             | CommitCommentEvent | 2011-02-12 12:24:31 | github | 0         |
| Oxonium         | CommitCommentEvent | 2011-02-12 12:31:28 | github | 0         |

##### Изменение настроек движка Kafka

Рекомендуем удалить таблицу с движком Kafka и создать её заново с новыми настройками. Материализованное представление изменять не требуется — потребление сообщений возобновится после повторного создания таблицы с движком Kafka.

##### Отладка неполадок


Ошибки, такие как проблемы с аутентификацией, не возвращаются в ответах на DDL‑запросы движка Kafka. Для диагностики проблем рекомендуется использовать основной лог-файл ClickHouse `clickhouse-server.err.log`. Более детализированное трассирование для используемой клиентской библиотеки Kafka [librdkafka](https://github.com/edenhill/librdkafka) можно включить в конфигурации.

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### Обработка некорректных сообщений

Kafka часто используется как «свалка» для данных. Это приводит к тому, что топики содержат смешанные форматы сообщений и несогласованные имена полей. Избегайте этого и используйте возможности Kafka, такие как Kafka Streams или ksqlDB, чтобы гарантировать, что сообщения имеют корректный формат и согласованы до вставки в Kafka. Если эти варианты недоступны, в ClickHouse есть несколько функций, которые могут помочь.

* Обрабатывайте поле сообщения как строку. В выражении материализованного представления можно использовать функции для очистки и приведения типов по мере необходимости. Это не должно рассматриваться как промышленное решение, но может помочь при разовой ингестии.
* Если вы читаете JSON из топика, используя формат JSONEachRow, используйте настройку [`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields). При записи данных по умолчанию ClickHouse генерирует исключение, если входные данные содержат столбцы, которых нет в целевой таблице. Однако если эта опция включена, эти лишние столбцы будут игнорироваться. Опять же, это не решение производственного уровня и может ввести других в заблуждение.
* Рассмотрите настройку `kafka_skip_broken_messages`. Она требует от пользователя указать допустимый порог на блок для некорректных сообщений — с учётом `kafka_max_block_size`. Если этот порог превышен (измеряется в абсолютном количестве сообщений), стандартное поведение с генерацией исключения будет восстановлено, а остальные сообщения будут пропущены.

##### Семантика доставки и проблемы с дубликатами

Движок таблиц Kafka предоставляет семантику как минимум однократной доставки (at-least-once). Дубликаты возможны в нескольких известных редких случаях. Например, сообщения могут быть прочитаны из Kafka и успешно вставлены в ClickHouse. До того как новый offset будет зафиксирован, соединение с Kafka теряется. В этой ситуации требуется повторная попытка вставки блока. Блок может быть [дедуплицирован](/engines/table-engines/mergetree-family/replication) с использованием распределённой таблицы или ReplicatedMergeTree в качестве целевой таблицы. Хотя это снижает вероятность появления строк-дубликатов, оно полагается на идентичность блоков. События, такие как ребалансировка Kafka, могут нарушить это предположение, вызывая дубликаты в редких случаях.

##### Вставки на основе кворума

Вам могут потребоваться [вставки на основе кворума](/operations/settings/settings#insert_quorum) для случаев, когда в ClickHouse требуются более строгие гарантии доставки. Это нельзя настроить на материализованном представлении или целевой таблице. Однако это можно задать для пользовательских профилей, например:

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouse в Kafka

Хотя это менее распространённый сценарий, данные ClickHouse также могут сохраняться в Kafka. Например, мы вручную вставим строки в таблицу с движком Kafka. Эти данные будут прочитаны тем же движком Kafka, материализованное представление которого поместит данные в таблицу MergeTree. Наконец, мы продемонстрируем применение материализованных представлений при вставках в Kafka для чтения данных из уже существующих исходных таблиц.

#### Шаги

Нашу изначальную задачу лучше всего иллюстрирует следующая схема:

<Image img={kafka_02} size="lg" alt="Диаграмма с вставками в таблицу с движком Kafka" />

Мы предполагаем, что вы уже создали таблицы и представления на шагах для [Kafka to ClickHouse](#kafka-to-clickhouse) и что топик был полностью обработан.

##### 1. Прямая вставка строк

Сначала проверьте количество строк в целевой таблице.

```sql
SELECT count() FROM github;
```

У вас должно быть 200 000 строк:

```response
┌─count()─┐
│  200000 │
└─────────┘
```

Теперь вставьте строки из целевой таблицы GitHub обратно в таблицу движка Kafka github&#95;queue. Обратите внимание, что мы используем формат JSONEachRow и ограничиваем запрос SELECT до 100 строк с помощью LIMIT.

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

Пересчитайте количество строк в GitHub, чтобы убедиться, что оно увеличилось на 100. Как показано на диаграмме выше, строки были записаны в Kafka с помощью движка таблицы Kafka, затем снова прочитаны этим же движком и вставлены в целевую таблицу GitHub нашим материализованным представлением!

```sql
SELECT count() FROM github;
```


Вы должны увидеть ещё 100 дополнительных строк:

```response
┌─count()─┐
│  200100 │
└─────────┘
```

##### 2. Использование материализованных представлений

Мы можем использовать материализованные представления, чтобы отправлять сообщения в движок Kafka (и в топик) при вставке документов в таблицу. Когда строки вставляются в таблицу GitHub, срабатывает материализованное представление, в результате чего эти строки снова вставляются в движок Kafka и в новый топик. Это, опять же, лучше всего иллюстрируется так:

<Image img={kafka_03} size="lg" alt="Схема движка таблицы Kafka с материализованными представлениями" />

Создайте новый топик Kafka `github_out` или аналогичный. Убедитесь, что движок таблицы Kafka `github_out_queue` указывает на этот топик.

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

Теперь создайте новое материализованное представление `github_out_mv`, ссылающееся на таблицу GitHub и при срабатывании вставляющее строки в указанный выше движок. В результате новые записи в таблице GitHub будут отправляться в наш новый топик Kafka.

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


Если вы будете вставлять данные в исходный топик github, созданный в рамках раздела [Kafka to ClickHouse](#kafka-to-clickhouse), документы «магическим образом» появятся в топике &quot;github&#95;clickhouse&quot;. Подтвердите это с помощью стандартных инструментов Kafka. Например, ниже мы вставляем 100 строк в топик github с помощью [kcat](https://github.com/edenhill/kcat) для топика, размещённого в Confluent Cloud:

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

Чтение из топика `github_out` должно подтвердить, что сообщения были доставлены.

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

Хотя это и сложный пример, он иллюстрирует мощь материализованных представлений при использовании вместе с табличным движком Kafka.

### Кластеры и производительность

#### Работа с кластерами ClickHouse

Через группы потребителей Kafka несколько экземпляров ClickHouse потенциально могут читать из одного и того же топика. Каждому потребителю будет назначен раздел топика в соответствии со схемой 1:1. При масштабировании чтения ClickHouse с использованием табличного движка Kafka учитывайте, что общее количество потребителей в кластере не может превышать количество разделов в топике. Поэтому заранее убедитесь, что разбиение на разделы корректно настроено для топика.

Несколько экземпляров ClickHouse могут быть сконфигурированы для чтения из топика, используя один и тот же идентификатор группы потребителей, задаваемый при создании таблицы с движком Kafka. Таким образом, каждый экземпляр будет читать из одного или нескольких разделов, вставляя сегменты в свою локальную целевую таблицу. Целевые таблицы, в свою очередь, могут быть сконфигурированы на использование ReplicatedMergeTree для обработки дублирования данных. Такой подход позволяет масштабировать чтение из Kafka вместе с кластером ClickHouse при условии, что в Kafka достаточно разделов.

<Image img={kafka_04} size="lg" alt="Схема табличного движка Kafka с кластерами ClickHouse" />

#### Настройка производительности

Учитывайте следующее при попытках увеличить пропускную способность таблицы с движком Kafka:

* Производительность будет варьироваться в зависимости от размера сообщений, их формата и типов целевых таблиц. Значение 100 тыс. строк/с для одного табличного движка можно считать достижимым. По умолчанию сообщения читаются блоками, что контролируется параметром kafka&#95;max&#95;block&#95;size. По умолчанию он установлен в значение [max&#95;insert&#95;block&#95;size](/operations/settings/settings#max_insert_block_size), равное 1 048 576. Если только сообщения не являются крайне крупными, этот параметр почти всегда следует увеличивать. Значения между 500 тыс. и 1 млн встречаются довольно часто. Тестируйте и оценивайте влияние на пропускную способность.
* Количество потребителей для табличного движка можно увеличить с помощью kafka&#95;num&#95;consumers. Однако по умолчанию вставки будут линеаризованы в одном потоке, если только kafka&#95;thread&#95;per&#95;consumer не изменён со значения по умолчанию 1. Установите его в значение 1, чтобы гарантировать, что сбросы выполняются параллельно. Обратите внимание, что создание таблицы с движком Kafka с N потребителями (и kafka&#95;thread&#95;per&#95;consumer=1) логически эквивалентно созданию N таблиц с движком Kafka, каждая с материализованным представлением и kafka&#95;thread&#95;per&#95;consumer=0.
* Увеличение числа потребителей не является «бесплатной» операцией. Каждый потребитель поддерживает собственные буферы и потоки, увеличивая накладные расходы на сервер. Учитывайте эти накладные расходы и по возможности сначала масштабируйтесь линейно по кластеру.
* Если пропускная способность сообщений Kafka изменчива и задержки приемлемы, подумайте о повышении значения stream&#95;flush&#95;interval&#95;ms, чтобы обеспечить сброс более крупных блоков.
* [background&#95;message&#95;broker&#95;schedule&#95;pool&#95;size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size) задаёт количество потоков, выполняющих фоновые задачи. Эти потоки используются для стриминга из Kafka. Этот параметр применяется при запуске сервера ClickHouse и не может быть изменён в пользовательской сессии; по умолчанию он равен 16. Если вы видите тайм-ауты в логах, возможно, стоит увеличить его.
* Для взаимодействия с Kafka используется библиотека librdkafka, которая сама создаёт потоки. Большое количество таблиц Kafka или потребителей может, таким образом, приводить к большому числу переключений контекста. Либо распределите эту нагрузку по кластеру, по возможности реплицируя только целевые таблицы, либо рассмотрите использование одного табличного движка для чтения из нескольких топиков — поддерживается список значений. Несколько материализованных представлений могут читать из одной таблицы, каждое фильтруя данные для конкретного топика.


Любые изменения настроек следует тестировать. Рекомендуем отслеживать задержки потребителей Kafka, чтобы убедиться, что масштабирование выполнено корректно.

#### Дополнительные настройки

Помимо настроек, обсуждённых выше, могут быть полезны следующие:

* [Kafka&#95;max&#95;wait&#95;ms](/operations/settings/settings#kafka_max_wait_ms) — время ожидания в миллисекундах при чтении сообщений из Kafka перед повторной попыткой. Задаётся на уровне профиля пользователя; по умолчанию — 5000.

[Все настройки ](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)из базовой библиотеки librdkafka также могут быть заданы в конфигурационных файлах ClickHouse внутри элемента *kafka* — имена настроек должны задаваться в виде XML-элементов, при этом точки в названиях заменяются символами подчёркивания, например:

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

Это экспертные настройки, и мы рекомендуем обратиться к документации Kafka за подробным объяснением.
