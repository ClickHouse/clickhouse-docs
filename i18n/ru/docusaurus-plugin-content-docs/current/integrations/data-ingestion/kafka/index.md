---


sidebar_label: 'Интеграция Kafka с ClickHouse'
sidebar_position: 1
slug: /integrations/kafka
description: 'Введение в интеграцию Kafka с ClickHouse'
title: 'Интеграция Kafka с ClickHouse'
keywords: ['Apache Kafka', 'event streaming', 'data pipeline', 'message broker', 'real-time data']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---



# Интеграция Kafka с ClickHouse

[Apache Kafka](https://kafka.apache.org/) — это распределённая платформа потоковой обработки событий с открытым исходным кодом, которую используют тысячи компаний для высокопроизводительных конвейеров данных, потоковой аналитики, интеграции данных и критически важных приложений. ClickHouse предоставляет несколько вариантов **чтения из** и **записи в** Kafka и другие брокеры, совместимые с Kafka API (например, Redpanda, Amazon MSK).



## Доступные варианты {#available-options}

Выбор подходящего варианта для вашего сценария использования зависит от нескольких факторов, включая тип развертывания ClickHouse, направление потока данных и эксплуатационные требования.

| Вариант                                                  | Тип развертывания                      | Полностью управляемый | Из Kafka в ClickHouse | Из ClickHouse в Kafka |
| -------------------------------------------------------- | -------------------------------------- | :-----------: | :-----------------: | :-----------------: |
| [ClickPipes для Kafka](/integrations/clickpipes/kafka)   | [Облако], [BYOC] (скоро!)              |      ✅       |         ✅          |                     |
| [Sink для Kafka Connect](./kafka-clickhouse-connect-sink.md) | [Облако], [BYOC], [Самостоятельное размещение] |               |         ✅          |                     |
| [Движок таблицы Kafka](./kafka-table-engine.md)            | [Облако], [BYOC], [Самостоятельное размещение] |               |         ✅          |         ✅          |

Для более подробного сравнения этих вариантов см. [Выбор варианта](#choosing-an-option).

### ClickPipes для Kafka {#clickpipes-for-kafka}

[ClickPipes](../clickpipes/index.md) — это управляемая платформа интеграции, которая делает загрузку данных из разнообразных источников такой же простой, как нажатие нескольких кнопок. Поскольку она полностью управляемая и специально предназначена для производственных нагрузок, ClickPipes значительно снижает затраты на инфраструктуру и эксплуатацию, устраняя необходимость в внешних инструментах потоковой передачи данных и ETL.

:::tip
Это рекомендуемый вариант, если вы пользователь ClickHouse Cloud. ClickPipes **полностью управляемый** и специально предназначен для обеспечения **наилучшей производительности** в облачных средах.
:::

#### Основные возможности {#clickpipes-for-kafka-main-features}

[//]: # "TODO It isn't optimal to link to a static alpha-release of the Terraform provider. Link to a Terraform guide once that's available."

- Оптимизирован для ClickHouse Cloud, обеспечивает молниеносную производительность
- Горизонтальная и вертикальная масштабируемость для нагрузок с высокой пропускной способностью
- Встроенная отказоустойчивость с настраиваемыми репликами и автоматическими повторными попытками
- Развертывание и управление через UI ClickHouse Cloud, [Open API](/cloud/manage/api/api-overview) или [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.3.3-alpha2/docs/resources/clickpipe)
- Безопасность уровня предприятия с поддержкой авторизации, нативной для облака (IAM), и частных подключений (PrivateLink)
- Поддерживает широкий спектр [источников данных](/integrations/clickpipes/kafka/reference/), включая Confluent Cloud, Amazon MSK, Redpanda Cloud и Azure Event Hubs
- Поддерживает большинство распространенных форматов сериализации (JSON, Avro, Protobuf — скоро!)

#### Начало работы {#clickpipes-for-kafka-getting-started}

Чтобы начать использовать ClickPipes для Kafka, ознакомьтесь с [справочной документацией](/integrations/clickpipes/kafka/reference) или перейдите на вкладку `Data Sources` в UI ClickHouse Cloud.

### Kafka Connect Sink {#kafka-connect-sink}

Kafka Connect — это фреймворк с открытым исходным кодом, который служит централизованным хабом данных для простой интеграции между Kafka и другими системами данных. Коннектор [ClickHouse Kafka Connect Sink](https://github.com/ClickHouse/clickhouse-kafka-connect) предоставляет масштабируемый и высоко настраиваемый вариант для чтения данных из Apache Kafka и других брокеров, совместимых с API Kafka.

:::tip
Это рекомендуемый вариант, если вы предпочитаете **высокую настраиваемость** или уже являетесь пользователем Kafka Connect.
:::

#### Основные возможности {#kafka-connect-sink-main-features}

- Можно настроить для поддержки семантики exactly-once
- Поддерживает большинство распространенных форматов сериализации (JSON, Avro, Protobuf)
- Непрерывно тестируется на ClickHouse Cloud

#### Начало работы {#kafka-connect-sink-getting-started}

Чтобы начать использовать ClickHouse Kafka Connect Sink, ознакомьтесь со [справочной документацией](./kafka-clickhouse-connect-sink.md).

### Движок таблицы Kafka {#kafka-table-engine}

[Движок таблицы Kafka](./kafka-table-engine.md) можно использовать для чтения данных из Apache Kafka и других брокеров, совместимых с API Kafka, а также для записи данных в них. Этот вариант включен в open-source ClickHouse и доступен для всех типов развертывания.

:::tip
Это рекомендуемый вариант, если вы самостоятельно размещаете ClickHouse и нуждаетесь в варианте с **низким порогом входа**, или если вам нужно **записывать** данные в Kafka.
:::

#### Основные возможности {#kafka-table-engine-main-features}

- Можно использовать для [чтения](./kafka-table-engine.md/#kafka-to-clickhouse) и [записи](./kafka-table-engine.md/#clickhouse-to-kafka) данных
- Включен в open-source ClickHouse
- Поддерживает большинство распространенных форматов сериализации (JSON, Avro, Protobuf)

#### Начало работы {#kafka-table-engine-getting-started}


Чтобы начать работу с движком таблиц Kafka, см. [справочную документацию](./kafka-table-engine.md).

### Выбор варианта {#choosing-an-option}

| Продукт                  | Преимущества                                                                                                                                                                                                                                                                                           | Недостатки                                                                                                                                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ClickPipes for Kafka** | • Масштабируемая архитектура для высокой пропускной способности и низкой задержки<br/>• Встроенный мониторинг и управление схемами<br/>• Частные сетевые подключения (через PrivateLink)<br/>• Поддержка аутентификации SSL/TLS и авторизации IAM<br/>• Поддержка программной конфигурации (Terraform, конечные точки API) | • Не поддерживает отправку данных в Kafka<br/>• Семантика at-least-once                                                                                                                                                |
| **Kafka Connect Sink**   | • Семантика exactly-once<br/>• Позволяет детально управлять преобразованием данных, пакетной обработкой и обработкой ошибок<br/>• Может быть развернут в частных сетях<br/>• Позволяет выполнять репликацию в реальном времени из баз данных, пока не поддерживаемых в ClickPipes, через Debezium                                               | • Не поддерживает отправку данных в Kafka<br/>• Сложен в настройке и обслуживании<br/>• Требует экспертизы в Kafka и Kafka Connect                                                                          |
| **Kafka table engine**   | • Поддерживает [отправку данных в Kafka](./kafka-table-engine.md/#clickhouse-to-kafka)<br/>• Прост в настройке                                                                                                                                                                               | • Семантика at-least-once<br/>• Ограниченное горизонтальное масштабирование для потребителей. Не может масштабироваться независимо от сервера ClickHouse<br/>• Ограниченные возможности обработки ошибок и отладки<br/>• Требует экспертизы в Kafka |

### Другие варианты {#other-options}

- [**Confluent Cloud**](./confluent/index.md) - Confluent Platform предоставляет возможность загрузить и [запустить ClickHouse Connector Sink на Confluent Cloud](./confluent/custom-connector.md) или использовать [HTTP Sink Connector для Confluent Platform](./confluent/kafka-connect-http.md), который интегрирует Apache Kafka с API через HTTP или HTTPS.

- [**Vector**](./kafka-vector.md) - Vector — это независимый от поставщика конвейер данных. Благодаря возможности чтения из Kafka и отправки событий в ClickHouse, это надежный вариант интеграции.

- [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - Коннектор Kafka Connect JDBC Sink позволяет экспортировать данные из топиков Kafka в любую реляционную базу данных с драйвером JDBC.

- **Пользовательский код** - Пользовательский код с использованием [клиентских библиотек](../../language-clients/index.md) Kafka и ClickHouse может быть уместен в случаях, когда требуется специальная обработка событий.

[BYOC]: /cloud/reference/byoc/overview
[Cloud]: /cloud/get-started
[Self-hosted]: ../../../intro.md
