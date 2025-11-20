---
sidebar_label: 'Коннектор JDBC для Kafka Connect'
sidebar_position: 4
slug: /integrations/kafka/kafka-connect-jdbc
description: 'Использование приемника JDBC Connector Sink с Kafka Connect и ClickHouse'
title: 'Коннектор JDBC'
doc_type: 'guide'
keywords: ['kafka', 'kafka connect', 'jdbc', 'integration', 'data pipeline']
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# JDBC-коннектор

:::note
Этот коннектор следует использовать только в том случае, если ваши данные простые и состоят из примитивных типов данных, например int. Специфичные для ClickHouse типы, такие как maps, не поддерживаются.
:::

В наших примерах мы используем дистрибутив Kafka Connect от Confluent.

Ниже описывается простая установка, при которой сообщения извлекаются из одного топика Kafka и вставляются строками в таблицу ClickHouse. Мы рекомендуем Confluent Cloud, который предлагает щедрый бесплатный тариф для тех, у кого нет среды Kafka.

Обратите внимание, что для JDBC-коннектора требуется схема (вы не можете использовать простой JSON или CSV с JDBC-коннектором). Хотя схема может быть закодирована в каждом сообщении, [настоятельно рекомендуется использовать реестр схем Confluent](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas), чтобы избежать связанных с этим накладных расходов. Предоставленный скрипт вставки автоматически выводит схему из сообщений и добавляет её в реестр — таким образом, этот скрипт может быть повторно использован для других наборов данных. Предполагается, что ключи Kafka являются строками. Дополнительные сведения о схемах Kafka можно найти [здесь](https://docs.confluent.io/platform/current/schema-registry/index.html).

### Лицензия {#license}

JDBC-коннектор распространяется под [лицензией Confluent Community License](https://www.confluent.io/confluent-community-license)

### Шаги {#steps}

#### Соберите данные для подключения {#gather-your-connection-details}

<ConnectionDetails />

#### 1. Установите Kafka Connect и коннектор {#1-install-kafka-connect-and-connector}

Мы предполагаем, что вы загрузили пакет Confluent и установили его локально. Следуйте инструкциям по установке коннектора, как описано [здесь](https://docs.confluent.io/kafka-connect-jdbc/current/#install-the-jdbc-connector).

Если вы используете метод установки confluent-hub, ваши локальные файлы конфигурации будут обновлены.

Для отправки данных в ClickHouse из Kafka мы используем компонент Sink коннектора.

#### 2. Загрузите и установите JDBC-драйвер {#2-download-and-install-the-jdbc-driver}

Загрузите и установите JDBC-драйвер ClickHouse `clickhouse-jdbc-<version>-shaded.jar` [отсюда](https://github.com/ClickHouse/clickhouse-java/releases). Установите его в Kafka Connect, следуя инструкциям [здесь](https://docs.confluent.io/kafka-connect-jdbc/current/#installing-jdbc-drivers). Другие драйверы могут работать, но не были протестированы.

:::note

Распространённая проблема: в документации предлагается скопировать jar в `share/java/kafka-connect-jdbc/`. Если у вас возникают проблемы с обнаружением драйвера Connect, скопируйте драйвер в `share/confluent-hub-components/confluentinc-kafka-connect-jdbc/lib/`. Или измените `plugin.path`, чтобы включить драйвер — см. ниже.

:::

#### 3. Подготовьте конфигурацию {#3-prepare-configuration}

Следуйте [этим инструкциям](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install) для настройки Connect в соответствии с вашим типом установки, обращая внимание на различия между автономным и распределённым кластером. При использовании Confluent Cloud применима распределённая настройка.

Следующие параметры относятся к использованию JDBC-коннектора с ClickHouse. Полный список параметров можно найти [здесь](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/index.html):


- `_connection.url_` - должен иметь вид `jdbc:clickhouse://&lt;clickhouse host>:&lt;clickhouse http port>/&lt;target database>`
- `connection.user` - пользователь с правами на запись в целевую базу данных
- `table.name.format` - таблица ClickHouse для вставки данных. Должна существовать.
- `batch.size` - количество строк для отправки в одном пакете. Убедитесь, что установлено достаточно большое значение. Согласно [рекомендациям](/sql-reference/statements/insert-into#performance-considerations) ClickHouse, минимальным следует считать значение 1000.
- `tasks.max` - коннектор JDBC Sink поддерживает выполнение одной или нескольких задач. Это можно использовать для повышения производительности. Вместе с размером пакета это основной способ улучшения производительности.
- `value.converter.schemas.enable` - установите false при использовании реестра схем, true если схемы встроены в сообщения.
- `value.converter` - установите в соответствии с типом данных, например, для JSON используйте `io.confluent.connect.json.JsonSchemaConverter`.
- `key.converter` - установите `org.apache.kafka.connect.storage.StringConverter`. Мы используем строковые ключи.
- `pk.mode` - не применимо к ClickHouse. Установите none.
- `auto.create` - не поддерживается и должно быть false.
- `auto.evolve` - рекомендуем установить false для этого параметра, хотя в будущем он может поддерживаться.
- `insert.mode` - установите "insert". Другие режимы в настоящее время не поддерживаются.
- `key.converter` - установите в соответствии с типами ваших ключей.
- `value.converter` - установите в зависимости от типа данных в вашем топике. Эти данные должны иметь поддерживаемую схему - форматы JSON, Avro или Protobuf.

При использовании нашего примера набора данных для тестирования убедитесь, что установлены следующие параметры:

- `value.converter.schemas.enable` - установите false, так как мы используем реестр схем. Установите true, если схема встроена в каждое сообщение.
- `key.converter` - установите "org.apache.kafka.connect.storage.StringConverter". Мы используем строковые ключи.
- `value.converter` - установите "io.confluent.connect.json.JsonSchemaConverter".
- `value.converter.schema.registry.url` - установите URL сервера схем вместе с учетными данными для сервера схем через параметр `value.converter.schema.registry.basic.auth.user.info`.

Примеры конфигурационных файлов для демонстрационных данных Github можно найти [здесь](https://github.com/ClickHouse/kafka-samples/tree/main/github_events/jdbc_sink), при условии, что Connect запущен в автономном режиме, а Kafka размещена в Confluent Cloud.

#### 4. Создание таблицы ClickHouse {#4-create-the-clickhouse-table}

Убедитесь, что таблица создана, удалив её, если она уже существует из предыдущих примеров. Ниже показан пример, совместимый с сокращенным набором данных Github. Обратите внимание на отсутствие типов Array или Map, которые в настоящее время не поддерживаются:


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

#### 5. Запуск Kafka Connect {#5-start-kafka-connect}

Запустите Kafka Connect в режиме [standalone](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#standalone-cluster) или [distributed](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#distributed-cluster).

```bash
./bin/connect-standalone connect.properties.ini github-jdbc-sink.properties.ini
```

#### 6. Добавление данных в Kafka {#6-add-data-to-kafka}

Вставьте сообщения в Kafka, используя предоставленные [скрипт и конфигурацию](https://github.com/ClickHouse/kafka-samples/tree/main/producer). Вам потребуется изменить файл github.config, добавив учётные данные Kafka. В настоящее время скрипт настроен для работы с Confluent Cloud.

```bash
python producer.py -c github.config
```

Этот скрипт можно использовать для вставки любого ndjson-файла в топик Kafka. Он автоматически попытается определить схему. Предоставленная конфигурация вставит только 10 тысяч сообщений — при необходимости [измените это значение здесь](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/producer/github.config#L25). Эта конфигурация также удаляет все несовместимые поля типа Array из набора данных при вставке в Kafka.

Это необходимо для того, чтобы коннектор JDBC мог преобразовывать сообщения в операторы INSERT. Если вы используете собственные данные, убедитесь, что либо вставляете схему с каждым сообщением (установив \_value.converter.schemas.enable \_в true), либо что ваш клиент публикует сообщения со ссылкой на схему в реестре.

Kafka Connect должен начать потреблять сообщения и вставлять строки в ClickHouse. Обратите внимание, что предупреждения вида "[JDBC Compliant Mode] Transaction is not supported." являются ожидаемыми и могут быть проигнорированы.

Простой запрос к целевой таблице "Github" должен подтвердить вставку данных.

```sql
SELECT count() FROM default.github;
```

```response
| count\(\) |
| :--- |
| 10000 |
```

### Рекомендуемые материалы для дальнейшего изучения {#recommended-further-reading}


* [Параметры конфигурации Kafka Sink](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/sink_config_options.html#sink-config-options)
* [Подробный разбор Kafka Connect – JDBC Source Connector](https://www.confluent.io/blog/kafka-connect-deep-dive-jdbc-source-connector)
* [Подробный разбор Kafka Connect JDBC Sink: работа с Primary Keys](https://rmoff.net/2021/03/12/kafka-connect-jdbc-sink-deep-dive-working-with-primary-keys/)
* [Kafka Connect в действии: JDBC Sink](https://www.youtube.com/watch?v=b-3qN_tlYR4&t=981s) — для тех, кто предпочитает смотреть, а не читать.
* [Подробный разбор Kafka Connect – конвертеры и сериализация](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)
