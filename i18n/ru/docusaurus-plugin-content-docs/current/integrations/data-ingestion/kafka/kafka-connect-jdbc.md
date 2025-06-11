---
sidebar_label: 'Kafka Connect JDBC Connector'
sidebar_position: 4
slug: /integrations/kafka/kafka-connect-jdbc
description: 'Использование JDBC Connector Sink с Kafka Connect и ClickHouse'
title: 'JDBC Connector'
---

import ConnectionDetails from '@site/i18n/ru/current/_snippets/_gather_your_details_http.mdx';


# JDBC Connector

:::note
Этот коннектор должен использоваться только в случае, если ваши данные простые и состоят из примитивных типов данных, например, int. Специфические типы ClickHouse, такие как maps, не поддерживаются.
:::

Для наших примеров мы используем дистрибутив Confluent для Kafka Connect.

Ниже мы описываем простую установку, извлечение сообщений из одной темы Kafka и вставку строк в таблицу ClickHouse. Мы рекомендуем Confluent Cloud, который предлагает щедрый бесплатный уровень для тех, у кого нет среды Kafka.

Обратите внимание, что для JDBC Connector требуется схема (нельзя использовать простой JSON или CSV с JDBC коннектором). Хотя схема может быть закодирована в каждом сообщении, настоятельно рекомендуется использовать [схему регистрации Confluent](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)y, чтобы избежать сопутствующих затрат. Предоставленный скрипт вставки автоматически выводит схему из сообщений и вставляет ее в реестр — этот скрипт может быть повторно использован для других наборов данных. Ключи Kafka предполагаются как строки. Дополнительные детали о схемах Kafka можно найти [здесь](https://docs.confluent.io/platform/current/schema-registry/index.html).

### License {#license}
JDBC Connector распространяется по [Лицензии сообщества Confluent](https://www.confluent.io/confluent-community-license)

### Steps {#steps}
#### Gather your connection details {#gather-your-connection-details}
<ConnectionDetails />

#### 1. Install Kafka Connect and Connector {#1-install-kafka-connect-and-connector}

Мы предполагаем, что вы скачали пакет Confluent и установили его локально. Следуйте инструкциям по установке для установки коннектора, как описано [здесь](https://docs.confluent.io/kafka-connect-jdbc/current/#install-the-jdbc-connector).

Если вы используете метод установки confluent-hub, ваши локальные файлы конфигурации будут обновлены.

Для отправки данных в ClickHouse из Kafka мы используем компонент Sink коннектора.

#### 2. Download and install the JDBC Driver {#2-download-and-install-the-jdbc-driver}

Скачайте и установите JDBC драйвер ClickHouse `clickhouse-jdbc-<version>-shaded.jar` [отсюда](https://github.com/ClickHouse/clickhouse-java/releases). Установите его в Kafka Connect, следуя инструкциям [здесь](https://docs.confluent.io/kafka-connect-jdbc/current/#installing-jdbc-drivers). Другие драйверы могут работать, но не были протестированы.

:::note

Общая проблема: документация предлагает копировать jar в `share/java/kafka-connect-jdbc/`. Если у вас возникли проблемы с тем, что Connect не может найти драйвер, скопируйте драйвер в `share/confluent-hub-components/confluentinc-kafka-connect-jdbc/lib/`. Или измените `plugin.path`, чтобы включить драйвер - см. ниже.

:::

#### 3. Prepare Configuration {#3-prepare-configuration}

Следуйте [этим инструкциям](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install) для настройки Connect в зависимости от вашего типа установки, учитывая различия междуStandalone и распределенной кластером. Если вы используете Confluent Cloud, актуальна распределенная настройка.

Следующие параметры имеют отношение к использованию JDBC коннектора с ClickHouse. Полный список параметров можно найти [здесь](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/index.html):

* `_connection.url_` - это должно иметь вид `jdbc:clickhouse://&lt;clickhouse host>:&lt;clickhouse http port>/&lt;target database>`
* `connection.user` - пользователь с правами на запись в целевую базу данных
* `table.name.format` - таблица ClickHouse для вставки данных. Она должна существовать.
* `batch.size` - Количество строк, которые нужно отправить за один раз. Убедитесь, что это установлено на достаточно большое число. Согласно [рекомендациям ClickHouse](/sql-reference/statements/insert-into#performance-considerations) минимальное значение должно составлять 1000.
* `tasks.max` - Коннектор JDBC Sink поддерживает выполнение одной или нескольких задач. Это можно использовать для увеличения производительности. Вместе с размером пакета это основной способ повышения производительности.
* `value.converter.schemas.enable` - Установите в false, если используете схему регистрации, в true, если вы встраиваете свои схемы в сообщения.
* `value.converter` - Установите в зависимости от вашего типа данных, например для JSON, `io.confluent.connect.json.JsonSchemaConverter`.
* `key.converter` - Установите на `org.apache.kafka.connect.storage.StringConverter`. Мы используем строковые ключи.
* `pk.mode` - Не актуально для ClickHouse. Установите в none.
* `auto.create` - Не поддерживается и должно быть false.
* `auto.evolve` - Мы рекомендуем установить false для этой настройки, хотя в будущем это может быть поддержано.
* `insert.mode` - Установите в "insert". Другие режимы в настоящее время не поддерживаются.
* `key.converter` - Установите в зависимости от типов ваших ключей.
* `value.converter` - Установите в зависимости от типа данных в вашей теме. Эти данные должны иметь поддерживаемую схему - форматы JSON, Avro или Protobuf.

Если вы используете наш набор данных для тестирования, убедитесь, что установлены следующие параметры:

* `value.converter.schemas.enable` - Установите в false, так как мы используем схему регистрации. Установите в true, если вы встраиваете схему в каждое сообщение.
* `key.converter` - Установите в "org.apache.kafka.connect.storage.StringConverter". Мы используем строковые ключи.
* `value.converter` - Установите "io.confluent.connect.json.JsonSchemaConverter".
* `value.converter.schema.registry.url` - Установите на URL сервера схемы вместе с учетными данными для сервера схемы через параметр `value.converter.schema.registry.basic.auth.user.info`.

Примеры файлов конфигурации для образца данных Github можно найти [здесь](https://github.com/ClickHouse/kafka-samples/tree/main/github_events/jdbc_sink), предполагая, что Connect работает в режиме standalone и Kafka размещен в Confluent Cloud.

#### 4. Create the ClickHouse table {#4-create-the-clickhouse-table}

Убедитесь, что таблица была создана, удалив ее, если она уже существует из предыдущих примеров. Пример совместимой таблицы с уменьшенным набором данных Github показан ниже. Обратите внимание на отсутствие любых типов Array или Map, которые в настоящий момент не поддерживаются:

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

#### 5. Start Kafka Connect {#5-start-kafka-connect}

Запустите Kafka Connect в [standalone](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#standalone-cluster) или [distributed](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#distributed-cluster) режиме.

```bash
./bin/connect-standalone connect.properties.ini github-jdbc-sink.properties.ini
```

#### 6. Add data to Kafka {#6-add-data-to-kafka}

Вставьте сообщения в Kafka, используя предоставленный [скрипт и конфигурацию](https://github.com/ClickHouse/kafka-samples/tree/main/producer). Вам нужно будет изменить github.config, чтобы включить ваши учетные данные Kafka. Скрипт в настоящее время настроен на использование с Confluent Cloud.

```bash
python producer.py -c github.config
```

Этот скрипт можно использовать для вставки любого ndjson файла в тему Kafka. Он попытается автоматически вывести схему для вас. Предоставленная образцовая конфигурация будет только вставлять 10k сообщений - [измените здесь](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/producer/github.config#L25), если это необходимо. Эта конфигурация также удаляет любые несовместимые поля Array из набора данных во время вставки в Kafka.

Это необходимо для того, чтобы JDBC коннектор преобразовывал сообщения в команды INSERT. Если вы используете свои данные, убедитесь, что вы либо вставляете схему с каждым сообщением (установив _value.converter.schemas.enable _в true), либо обеспечиваете, чтобы ваш клиент публиковал сообщения, ссылаясь на схему в реестре.

Kafka Connect должен начать потреблять сообщения и вставлять строки в ClickHouse. Обратите внимание, что предупреждения относительно "[JDBC Compliant Mode] Transaction is not supported." являются ожидаемыми и могут быть проигнорированы.

Простой запрос к целевой таблице "Github" должен подтвердить вставку данных.

```sql
SELECT count() FROM default.github;
```

```response
| count\(\) |
| :--- |
| 10000 |
```

### Recommended Further Reading {#recommended-further-reading}

* [Параметры конфигурации Kafka Sink](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/sink_config_options.html#sink-config-options)
* [Глубокое погружение в Kafka Connect – JDBC Source Connector](https://www.confluent.io/blog/kafka-connect-deep-dive-jdbc-source-connector)
* [Глубокое погружение в JDBC Sink Kafka Connect: Работа с первичными ключами](https://rmoff.net/2021/03/12/kafka-connect-jdbc-sink-deep-dive-working-with-primary-keys/)
* [Kafka Connect в действии: JDBC Sink](https://www.youtube.com/watch?v=b-3qN_tlYR4&t=981s) - для тех, кто предпочитает смотреть, а не читать.
* [Глубокое погружение в Kafka Connect – Конвертеры и сериализация объяснены](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)
