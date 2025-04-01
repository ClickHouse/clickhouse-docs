---
sidebar_label: 'Интеграции'
slug: /manage/integrations
title: 'Интеграции'
description: 'Интеграции для ClickHouse'
---

Чтобы увидеть полный список интеграций для ClickHouse, пожалуйста, перейдите на [эту страницу](/integrations).

## Собственные интеграции для ClickHouse Cloud {#proprietary-integrations-for-clickhouse-cloud}

Помимо десятков интеграций, доступных для ClickHouse, есть также несколько собственных интеграций, доступных только для ClickHouse Cloud:

### ClickPipes {#clickpipes}

[ClickPipes](/integrations/clickpipes) — это управляемая интеграционная платформа для приема данных в ClickHouse Cloud с помощью простого веб-интерфейса. В настоящее время она поддерживает Apache Kafka, S3, GCS и Amazon Kinesis, и в ближайшее время появятся новые интеграции.

### Looker Studio для ClickHouse Cloud {#looker-studio-for-clickhouse-cloud}

[Looker Studio](https://lookerstudio.google.com/) — это популярный инструмент бизнес-аналитики, предоставляемый Google. Looker Studio в настоящее время не предлагает коннектор для ClickHouse, а вместо этого полагается на протокол wire MySQL для подключения к ClickHouse.

Looker Studio можно подключить к ClickHouse Cloud, активировав [интерфейс MySQL](/interfaces/mysql). Пожалуйста, смотрите [эту страницу](/interfaces/mysql#enabling-the-mysql-interface-on-clickhouse-cloud) для получения подробной информации о подключении Looker Studio к ClickHouse Cloud.

### Интерфейс MySQL {#mysql-interface}

Некоторые приложения в настоящее время не поддерживают протокол wire ClickHouse. Чтобы использовать ClickHouse Cloud с этими приложениями, вы можете активировать протокол wire MySQL через Cloud Console. Пожалуйста, смотрите [эту страницу](/interfaces/mysql#enabling-the-mysql-interface-on-clickhouse-cloud) для получения деталей о том, как включить протокол wire MySQL через Cloud Console.

## Неподдерживаемые интеграции {#unsupported-integrations}

Следующие функции для интеграций в настоящее время не доступны для ClickHouse Cloud, так как они являются экспериментальными функциями. Если вам необходимо поддерживать эти функции в вашем приложении, пожалуйста, свяжитесь с support@clickhouse.com.

- [MaterializedPostgreSQL](/engines/table-engines/integrations/materialized-postgresql)
