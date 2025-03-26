---
sidebar_label: 'Интеграции'
slug: /manage/integrations
title: 'Интеграции'
description: 'Интеграции для ClickHouse'
---

To see a full list of integrations for ClickHouse, please see [this page](/integrations).

## Proprietary Integrations for ClickHouse Cloud {#proprietary-integrations-for-clickhouse-cloud}

Кроме десятков интеграций, доступных для ClickHouse, также есть некоторые проприетарные интеграции, доступные только для ClickHouse Cloud:

### ClickPipes {#clickpipes}

[ClickPipes](/integrations/clickpipes) — это управляемая интеграционная платформа для загрузки данных в ClickHouse Cloud с помощью простого веб-интерфейса. В настоящее время она поддерживает Apache Kafka, S3, GCS и Amazon Kinesis, и в ближайшее время будут добавлены новые интеграции.

### Looker Studio for ClickHouse Cloud {#looker-studio-for-clickhouse-cloud}

[Looker Studio](https://lookerstudio.google.com/) — это популярный инструмент бизнес-аналитики от Google. Looker Studio в настоящее время не предоставляет коннектор для ClickHouse, а в качестве альтернативы использует протокол передачи данных MySQL для подключения к ClickHouse.

Looker Studio можно подключить к ClickHouse Cloud, включив [MySQL interface](/interfaces/mysql). Пожалуйста, смотрите [this page](/interfaces/mysql#enabling-the-mysql-interface-on-clickhouse-cloud) для получения подробностей о подключении Looker Studio к ClickHouse Cloud.

### MySQL Interface {#mysql-interface}

Некоторые приложения в настоящее время не поддерживают протокол передачи данных ClickHouse. Чтобы использовать ClickHouse Cloud с этими приложениями, вы можете включить протокол передачи данных MySQL через Cloud Console. Пожалуйста, смотрите [this page](/interfaces/mysql#enabling-the-mysql-interface-on-clickhouse-cloud) для получения деталй о том, как включить протокол передачи данных MySQL через Cloud Console.

## Unsupported Integrations {#unsupported-integrations}

Следующие функции для интеграций в настоящее время недоступны для ClickHouse Cloud, так как они являются экспериментальными функциями. Если вам необходимо поддерживать эти функции в вашем приложении, пожалуйста, свяжитесь с support@clickhouse.com.

- [MaterializedPostgreSQL](/engines/table-engines/integrations/materialized-postgresql)
