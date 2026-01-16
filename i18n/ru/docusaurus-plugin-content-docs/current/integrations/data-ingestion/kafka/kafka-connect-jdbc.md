---
sidebar_label: 'JDBC-коннектор Kafka Connect'
sidebar_position: 4
slug: /integrations/kafka/kafka-connect-jdbc
description: 'Использование синк-коннектора JDBC с Kafka Connect и ClickHouse'
title: 'JDBC-коннектор'
doc_type: 'guide'
keywords: ['kafka', 'kafka connect', 'jdbc', 'интеграция', 'конвейер данных']
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# JDBC connector \\{#jdbc-connector\\}

:::note
Этот коннектор следует использовать только в том случае, если ваши данные простые и состоят из примитивных типов данных, например `int`. Специфичные для ClickHouse типы, такие как `map`, не поддерживаются.
:::

В наших примерах мы используем дистрибутив Kafka Connect от Confluent.

Ниже мы описываем простую установку, при которой сообщения считываются из одного Kafka-топика и вставляются в таблицу ClickHouse. Мы рекомендуем Confluent Cloud, который предоставляет щедрый бесплатный тариф для тех, у кого нет собственного Kafka-окружения.

Обратите внимание, что для коннектора JDBC требуется схема (нельзя использовать обычный JSON или CSV с JDBC-коннектором). Хотя схема может быть закодирована в каждом сообщении, [настойчиво рекомендуется использовать Confluent Schema Registry](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas), чтобы избежать связанных накладных расходов. Предоставленный скрипт вставки автоматически выводит схему из сообщений и добавляет её в реестр — таким образом, этот скрипт может быть повторно использован для других наборов данных. Предполагается, что ключи Kafka имеют тип `String`. Дополнительные сведения о схемах Kafka можно найти [здесь](https://docs.confluent.io/platform/current/schema-registry/index.html).

### Лицензия \\{#license\\}
JDBC Connector распространяется под [Confluent Community License](https://www.confluent.io/confluent-community-license)

### Шаги \\{#steps\\}
#### Соберите данные для подключения \\{#gather-your-connection-details\\}
<ConnectionDetails />

#### 1. Установите Kafka Connect и коннектор \\{#1-install-kafka-connect-and-connector\\}

Предполагается, что вы скачали пакет Confluent и установили его локально. Следуйте инструкциям по установке коннектора, описанным [здесь](https://docs.confluent.io/kafka-connect-jdbc/current/#install-the-jdbc-connector).

Если вы используете метод установки через confluent-hub, ваши локальные конфигурационные файлы будут обновлены.

Для отправки данных из Kafka в ClickHouse мы используем sink-компонент коннектора.

#### 2. Скачайте и установите JDBC-драйвер \\{#2-download-and-install-the-jdbc-driver\\}

Скачайте и установите JDBC-драйвер ClickHouse `clickhouse-jdbc-<version>-shaded.jar` [отсюда](https://github.com/ClickHouse/clickhouse-java/releases). Установите его в Kafka Connect, следуя инструкциям [здесь](https://docs.confluent.io/kafka-connect-jdbc/current/#installing-jdbc-drivers). Другие драйверы могут работать, но не были протестированы.

:::note

Типичная проблема: в документации предлагается скопировать JAR в `share/java/kafka-connect-jdbc/`. Если вы сталкиваетесь с проблемами при обнаружении драйвера Connect, скопируйте драйвер в `share/confluent-hub-components/confluentinc-kafka-connect-jdbc/lib/`. Либо измените `plugin.path`, чтобы включить драйвер — см. ниже.

:::

#### 3. Подготовьте конфигурацию \\{#3-prepare-configuration\\}

Следуйте [этим инструкциям](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install) для настройки Connect, соответствующей вашему типу установки, учитывая различия между автономным и распределённым кластером. При использовании Confluent Cloud актуальна распределённая конфигурация.

Следующие параметры важны для использования JDBC-коннектора с ClickHouse. Полный список параметров можно найти [здесь](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/index.html):

* `_connection.url_` - должен иметь формат `jdbc:clickhouse://&lt;clickhouse host>:&lt;clickhouse http port>/&lt;target database>`
* `connection.user` - пользователь с правами записи в целевую базу данных
* `table.name.format` - таблица ClickHouse, в которую выполняется вставка данных. Таблица должна уже существовать.
* `batch.size` - количество строк, отправляемых в одном пакете. Убедитесь, что задано достаточно большое значение. Согласно [рекомендациям](/sql-reference/statements/insert-into#performance-considerations) ClickHouse минимальным следует считать значение 1000.
* `tasks.max` - коннектор JDBC Sink поддерживает запуск одной или нескольких задач. Это можно использовать для увеличения производительности. Вместе с размером пакета это ваши основные средства повышения производительности.
* `value.converter.schemas.enable` - установите в false при использовании реестра схем, в true — если вы встраиваете схемы в сообщения.
* `value.converter` - установите в соответствии с вашим типом данных, например, для JSON — `io.confluent.connect.json.JsonSchemaConverter`.
* `key.converter` - установите `org.apache.kafka.connect.storage.StringConverter`. Мы используем строковые ключи.
* `pk.mode` - не актуален для ClickHouse. Установите none.
* `auto.create` - не поддерживается и должен иметь значение false.
* `auto.evolve` - мы рекомендуем значение false для этого параметра, хотя поддержка может появиться в будущем.
* `insert.mode` - установите "insert". Другие режимы в настоящее время не поддерживаются.
* `key.converter` - укажите в соответствии с типами ваших ключей.
* `value.converter` - укажите на основе типа данных в вашем топике. Эти данные должны иметь поддерживаемую схему — форматы JSON, Avro или Protobuf.

Если вы используете наш пример набора данных для тестирования, убедитесь, что заданы следующие параметры:

* `value.converter.schemas.enable` - установите в false, так как мы используем реестр схем. Установите в true, если вы встраиваете схему в каждое сообщение.
* `key.converter` - установите "org.apache.kafka.connect.storage.StringConverter". Мы используем строковые ключи.
* `value.converter` - установите "io.confluent.connect.json.JsonSchemaConverter".
* `value.converter.schema.registry.url` - укажите URL сервера реестра схем, а также учетные данные для этого сервера через параметр `value.converter.schema.registry.basic.auth.user.info`.

Примеры файлов конфигурации для тестового набора данных GitHub можно найти [здесь](https://github.com/ClickHouse/kafka-samples/tree/main/github_events/jdbc_sink), при условии, что Connect запускается в режиме standalone, а Kafka размещена в Confluent Cloud.

#### 4. Создание таблицы ClickHouse \\{#4-create-the-clickhouse-table\\}

Убедитесь, что таблица создана, удалив её, если она уже существует из предыдущих примеров. Ниже приведён пример, совместимый с уменьшенным набором данных GitHub. Обратите внимание на отсутствие каких-либо типов Array или Map, которые в настоящее время не поддерживаются:

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

#### 5. Запустите Kafka Connect \\{#5-start-kafka-connect\\}

Запустите Kafka Connect в [автономном](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#standalone-cluster) или [распределённом](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#distributed-cluster) режиме.

```bash
./bin/connect-standalone connect.properties.ini github-jdbc-sink.properties.ini
```

#### 6. Добавьте данные в Kafka \\{#6-add-data-to-kafka\\}

Отправьте сообщения в Kafka, используя предоставленные [скрипт и конфигурацию](https://github.com/ClickHouse/kafka-samples/tree/main/producer). Вам нужно будет изменить файл конфигурации github.config, чтобы указать свои учетные данные Kafka. По умолчанию скрипт настроен для работы с Confluent Cloud.

```bash
python producer.py -c github.config
```

Этот скрипт можно использовать для записи любого файла ndjson в топик Kafka. Он попытается автоматически вывести схему. Приведённая примерная конфигурация запишет только 10 000 сообщений — при необходимости [измените здесь](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/producer/github.config#L25). Эта конфигурация также удаляет все несовместимые поля типа Array из набора данных при отправке в Kafka.

Это необходимо для того, чтобы коннектор JDBC мог преобразовывать сообщения в операторы INSERT. Если вы используете собственные данные, убедитесь, что вы либо добавляете схему к каждому сообщению (установив &#95;value.converter.schemas.enable &#95;в true), либо что ваш клиент публикует сообщения, ссылающиеся на схему в реестре.

Kafka Connect должен начать считывать сообщения и вставлять строки в ClickHouse. Обратите внимание, что предупреждения вида &quot;[JDBC Compliant Mode] Transaction is not supported.&quot; являются ожидаемыми и их можно игнорировать.

Простой запрос к целевой таблице &quot;Github&quot; должен подтвердить, что данные были вставлены.

```sql
SELECT count() FROM default.github;
```

```response
| count\(\) |
| :--- |
| 10000 |
```

### Рекомендуемые дополнительные материалы \\{#recommended-further-reading\\}

* [Параметры конфигурации приёмника Kafka (Kafka Sink Configuration Parameters)](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/sink_config_options.html#sink-config-options)
* [Подробный разбор Kafka Connect – JDBC Source Connector (Kafka Connect Deep Dive – JDBC Source Connector)](https://www.confluent.io/blog/kafka-connect-deep-dive-jdbc-source-connector)
* [Подробный разбор Kafka Connect JDBC Sink: работа с первичными ключами (Kafka Connect JDBC Sink deep-dive: Working with Primary Keys)](https://rmoff.net/2021/03/12/kafka-connect-jdbc-sink-deep-dive-working-with-primary-keys/)
* [Kafka Connect в действии: JDBC Sink (Kafka Connect in Action: JDBC Sink)](https://www.youtube.com/watch?v=b-3qN_tlYR4&t=981s) — для тех, кто предпочитает видео чтению.
* [Подробный разбор Kafka Connect – конвертеры и сериализация (Kafka Connect Deep Dive – Converters and Serialization Explained)](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)
