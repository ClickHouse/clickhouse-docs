---
sidebar_label: Интеграции
slug: /manage/integrations
title: Интеграции
---

Чтобы увидеть полный список интеграций для ClickHouse, пожалуйста, посмотрите [эту страницу](/integrations).

## Проприетарные интеграции для ClickHouse Cloud {#proprietary-integrations-for-clickhouse-cloud}

Помимо десятков интеграций, доступных для ClickHouse, также существуют некоторые проприетарные интеграции, доступные только для ClickHouse Cloud:

### ClickPipes {#clickpipes}

[ClickPipes](/integrations/clickpipes) — это управляемая интеграционная платформа для загрузки данных в ClickHouse Cloud с использованием простого веб-интерфейса. В настоящее время она поддерживает Apache Kafka, S3, GCS и Amazon Kinesis, с дополнительными интеграциями, которые скоро появятся.

### Looker Studio для ClickHouse Cloud {#looker-studio-for-clickhouse-cloud}

[Looker Studio](https://lookerstudio.google.com/) — это популярный инструмент бизнес-аналитики, предоставляемый Google. Looker Studio в настоящее время не предоставляет соединителя ClickHouse, но вместо этого полагается на протокол MySQL для подключения к ClickHouse.

Looker Studio может быть подключен к ClickHouse Cloud, активировав [интерфейс MySQL](/interfaces/mysql). Пожалуйста, смотрите [эту страницу](/interfaces/mysql#enabling-the-mysql-interface-on-clickhouse-cloud) для получения подробной информации о подключении Looker Studio к ClickHouse Cloud.

### Интерфейс MySQL {#mysql-interface}

Некоторые приложения в настоящее время не поддерживают протокол ClickHouse. Чтобы использовать ClickHouse Cloud с этими приложениями, вы можете активировать протокол MySQL через Cloud Console. Пожалуйста, смотрите [эту страницу](/interfaces/mysql#enabling-the-mysql-interface-on-clickhouse-cloud) для получения подробной информации о том, как активировать протокол MySQL через Cloud Console.

## Не поддерживаемые интеграции {#unsupported-integrations}

Следующие функции для интеграций в настоящее время недоступны для ClickHouse Cloud, поскольку они являются экспериментальными функциями. Если вам необходимо поддерживать эти функции в вашем приложении, пожалуйста, свяжитесь с support@clickhouse.com.

- [MaterializedPostgreSQL](/engines/table-engines/integrations/materialized-postgresql)
