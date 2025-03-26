---
sidebar_label: 'Kafka Connect JDBC Connector'
sidebar_position: 4
slug: /integrations/kafka/kafka-connect-jdbc
description: 'Использование JDBC Connector Sink с Kafka Connect и ClickHouse'
title: 'JDBC Connector'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# JDBC Connector

:::note
Этот коннектор следует использовать только в том случае, если ваши данные простые и состоят из примитивных типов данных, например, int. Специфичные для ClickHouse типы, такие как карты, не поддерживаются.
:::

Для наших примеров мы используем дистрибутив Kafka Connect от Confluent.

Ниже мы описываем простую установку, извлечение сообщений из одной темы Kafka и вставку строк в таблицу ClickHouse. Мы рекомендуем Confluent Cloud, который предлагает щедрый бесплатный уровень для тех, у кого нет среды Kafka.

Обратите внимание, что для JDBC Connector требуется схема (вы не можете использовать простой JSON или CSV с JDBC коннектором). Хотя схема может быть закодирована в каждом сообщении; [категорически рекомендуется использовать реестр схем Confluent](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)y, чтобы избежать связанных накладных расходов. Предоставленный скрипт вставки автоматически выводит схему из сообщений и вставляет её в реестр - этот скрипт можно повторно использовать для других наборов данных. Ключи Kafka предполагаются как строки. Дополнительные сведения о схемах Kafka можно найти [здесь](https://docs.confluent.io/platform/current/schema-registry/index.html).

### Лицензия {#license}
JDBC Connector распространяется по [Лицензии Сообщества Confluent](https://www.confluent.io/confluent-community-license)

### Шаги {#steps}
#### Соберите данные для подключения {#gather-your-connection-details}
<ConnectionDetails />

#### 1. Установите Kafka Connect и Connector {#1-install-kafka-connect-and-connector}

Мы предполагаем, что вы скачали пакет Confluent и установили его локально. Следуйте инструкциям по установке коннектора, как описано [здесь](https://docs.confluent.io/kafka-connect-jdbc/current/#install-the-jdbc-connector).

Если вы используете метод установки confluent-hub, ваши локальные файлы конфигурации будут обновлены.

Чтобы отправлять данные в ClickHouse из Kafka, мы используем компонент Sink коннектора.

#### 2. Скачайте и установите JDBC Driver {#2-download-and-install-the-jdbc-driver}

Скачайте и установите драйвер JDBC ClickHouse `clickhouse-jdbc-<version>-shaded.jar` [здесь](https://github.com/ClickHouse/clickhouse-java/releases). Установите его в Kafka Connect, следуя инструкциям [здесь](https://docs.confluent.io/kafka-connect-jdbc/current/#installing-jdbc-drivers). Другие драйвера могут работать, но проверены не были.

:::note

Общая проблема: документация предлагает скопировать jar в `share/java/kafka-connect-jdbc/`. Если у вас возникают проблемы с тем, чтобы Connect нашел драйвер, скопируйте драйвер в `share/confluent-hub-components/confluentinc-kafka-connect-jdbc/lib/`. Либо измените `plugin.path`, чтобы включить драйвер - см. ниже.

:::

#### 3. Подготовьте конфигурацию {#3-prepare-configuration}

Следуйте [этим инструкциям](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install) для настройки Connect, применимого к вашему типу установки, учитывая различия между независимым и распределенным кластером. Если вы используете Confluent Cloud, имеет значение распределенная настройка.

Следующие параметры имеют значение для использования JDBC коннектора с ClickHouse. Полный список параметров можно найти [здесь](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/index.html):

* `_connection.url_` - у этого параметра должна быть форма `jdbc:clickhouse://&lt;clickhouse host>:&lt;clickhouse http port>/&lt;target database>`
* `connection.user` - пользователь с правами на запись в целевую базу данных
* `table.name.format` - таблица ClickHouse для вставки данных. Она должна существовать.
* `batch.size` - количество строк, отправляемых в одном пакете. Убедитесь, что это значение установлено на достаточно большое число. В соответствии с [рекомендациями ClickHouse](/sql-reference/statements/insert-into#performance-considerations) значение 1000 следует считать минимумом.
* `tasks.max` - JDBC Sink коннектор поддерживает выполнение одной или нескольких задач. Это может быть использовано для увеличения производительности. Вместе с размером пакета это является вашим основным способом улучшения производительности.
* `value.converter.schemas.enable` - Установите в false, если используете реестр схем; true, если вы встроили ваши схемы в сообщения.
* `value.converter` - Установите в зависимости от вашего типа данных, например, для JSON, `io.confluent.connect.json.JsonSchemaConverter`.
* `key.converter` - Установите в `org.apache.kafka.connect.storage.StringConverter`. Мы используем строковые ключи.
* `pk.mode` - Не относится к ClickHouse. Установите в none.
* `auto.create` - Не поддерживается и должно быть false.
* `auto.evolve` - Мы рекомендуем false для этой настройки, хотя она может быть поддержана в будущем.
* `insert.mode` - Установите на "insert". Другие режимы в настоящее время не поддерживаются.
* `key.converter` - Установите в зависимости от типов ваших ключей.
* `value.converter` - Установите на основе типа данных в вашей теме. Эти данные должны иметь поддерживаемую схему - форматы JSON, Avro или Protobuf.

Если вы используете наш образец данных для тестирования, убедитесь, что установлены следующие параметры:

* `value.converter.schemas.enable` - Установите в false, так как мы используем реестр схем. Установите в true, если вы встраиваете схему в каждое сообщение.
* `key.converter` - Установите на "org.apache.kafka.connect.storage.StringConverter". Мы используем строковые ключи.
* `value.converter` - Установите "io.confluent.connect.json.JsonSchemaConverter".
* `value.converter.schema.registry.url` - Установите на URL сервера схем вместе с учетными данными для сервера схем с использованием параметра `value.converter.schema.registry.basic.auth.user.info`.

Примеры конфигурационных файлов для данных образца Github можно найти [здесь](https://github.com/ClickHouse/kafka-samples/tree/main/github_events/jdbc_sink), при условии, что Connect работает в независимом режиме, а Kafka размещен в Confluent Cloud.

#### 4. Создайте таблицу ClickHouse {#4-create-the-clickhouse-table}

Убедитесь, что таблица была создана, удалите её, если она уже существует из предыдущих примеров. Пример, совместимый с сокращенным набором данных Github, показан ниже. Обратите внимание на отсутствие любых типов Array или Map, которые в настоящее время не поддерживаются:

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
    state Enum('none' = 0, 'open' = 1, 'closed' = 2),
    assignee LowCardinality(String),
    closed_at DateTime,
    merged_at DateTime,
    merge_commit_sha String,
    merged_by LowCardinality(String),
    review_comments UInt32,
    member_login LowCardinality(String)
) ENGINE = MergeTree ORDER BY (event_type, repo_name, created_at)
```

#### 5. Запустите Kafka Connect {#5-start-kafka-connect}

Запустите Kafka Connect в режиме [независимом](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#standalone-cluster) или [распределенном](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#distributed-cluster).

```bash
./bin/connect-standalone connect.properties.ini github-jdbc-sink.properties.ini
```

#### 6. Добавьте данные в Kafka {#6-add-data-to-kafka}

Вставьте сообщения в Kafka, используя [скрипт и конфигурацию](https://github.com/ClickHouse/kafka-samples/tree/main/producer), предоставленные ранее. Вам нужно будет изменить github.config, чтобы включить ваши учетные данные Kafka. Скрипт в настоящее время настроен для использования с Confluent Cloud.

```bash
python producer.py -c github.config
```

Этот скрипт можно использовать для вставки любого ndjson файла в тему Kafka. Он попытается автоматически вывести схему для вас. Образец предоставленной конфигурации вставит только 10 тысяч сообщений - [измените здесь](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/producer/github.config#L25), если это необходимо. Эта конфигурация также удаляет любые несовместимые поля Array из набора данных во время вставки в Kafka.

Это необходимо для того, чтобы JDBC коннектор мог преобразовать сообщения в операторы INSERT. Если вы используете свои собственные данные, убедитесь, что вы либо вставляете схему с каждым сообщением (установив _value.converter.schemas.enable _в true), либо ваши клиенты публикуют сообщения с ссылкой на схему в реестре.

Kafka Connect должен начать потребление сообщений и вставку строк в ClickHouse. Обратите внимание, что предупреждения о "[Режим, соответствующий JDBC] Транзакция не поддерживается." ожидаемы и могут быть игнорированы.

Простое чтение из целевой таблицы "Github" должно подтвердить вставку данных.

```sql
SELECT count() FROM default.github;
```

```response
| count\(\) |
| :--- |
| 10000 |
```

### Рекомендуемое дальнейшее чтение {#recommended-further-reading}

* [Параметры конфигурации Kafka Sink](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/sink_config_options.html#sink-config-options)
* [Глубокое погружение в Kafka Connect – JDBC Source Connector](https://www.confluent.io/blog/kafka-connect-deep-dive-jdbc-source-connector)
* [Глубокое погружение в Kafka Connect JDBC Sink: Работа с первичными ключами](https://rmoff.net/2021/03/12/kafka-connect-jdbc-sink-deep-dive-working-with-primary-keys/)
* [Kafka Connect в действии: JDBC Sink](https://www.youtube.com/watch?v=b-3qN_tlYR4&t=981s) - для тех, кто предпочитает смотреть, а не читать.
* [Глубокое погружение в Kafka Connect – Конвертеры и объяснение сериализации](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)
