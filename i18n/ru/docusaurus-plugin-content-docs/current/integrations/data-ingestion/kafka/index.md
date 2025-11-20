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

[Apache Kafka](https://kafka.apache.org/) — это открытая распределённая платформа потоковой передачи событий, используемая тысячами компаний для высокопроизводительных конвейеров обработки данных, потоковой аналитики, интеграции данных и бизнес-критичных приложений. ClickHouse предоставляет несколько вариантов для **чтения из** и **записи в** Kafka и другие брокеры, совместимые с Kafka API (например, Redpanda, Amazon MSK).



## Доступные варианты {#available-options}

Выбор подходящего варианта для вашего сценария использования зависит от множества факторов, включая тип развертывания ClickHouse, направление потока данных и операционные требования.

| Вариант                                                  | Тип развертывания              | Полностью управляемый | Kafka в ClickHouse | ClickHouse в Kafka |
| -------------------------------------------------------- | ------------------------------ | :-------------------: | :----------------: | :----------------: |
| [ClickPipes for Kafka](/integrations/clickpipes/kafka)   | [Cloud], [BYOC] (скоро!)       |          ✅           |         ✅         |                    |
| [Kafka Connect Sink](./kafka-clickhouse-connect-sink.md) | [Cloud], [BYOC], [Self-hosted] |                       |         ✅         |                    |
| [Kafka table engine](./kafka-table-engine.md)            | [Cloud], [BYOC], [Self-hosted] |                       |         ✅         |         ✅         |

Для более подробного сравнения этих вариантов см. раздел [Выбор варианта](#choosing-an-option).

### ClickPipes for Kafka {#clickpipes-for-kafka}

[ClickPipes](../clickpipes/index.md) — это управляемая платформа интеграции, которая делает загрузку данных из различных источников такой же простой, как нажатие нескольких кнопок. Поскольку платформа полностью управляемая и специально разработана для производственных нагрузок, ClickPipes значительно снижает инфраструктурные и операционные затраты, устраняя необходимость во внешних инструментах потоковой передачи данных и ETL.

:::tip
Это рекомендуемый вариант, если вы используете ClickHouse Cloud. ClickPipes **полностью управляемый** и специально разработан для обеспечения **наилучшей производительности** в облачных средах.
:::

#### Основные возможности {#clickpipes-for-kafka-main-features}

[//]: # "TODO It isn't optimal to link to a static alpha-release of the Terraform provider. Link to a Terraform guide once that's available."

- Оптимизирован для ClickHouse Cloud, обеспечивая молниеносную производительность
- Горизонтальная и вертикальная масштабируемость для высоконагруженных рабочих нагрузок
- Встроенная отказоустойчивость с настраиваемыми репликами и автоматическими повторными попытками
- Развертывание и управление через пользовательский интерфейс ClickHouse Cloud, [Open API](/cloud/manage/api/api-overview) или [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.3.3-alpha2/docs/resources/clickpipe)
- Безопасность корпоративного уровня с поддержкой облачной авторизации (IAM) и частного подключения (PrivateLink)
- Поддержка широкого спектра [источников данных](/integrations/clickpipes/kafka/reference/), включая Confluent Cloud, Amazon MSK, Redpanda Cloud и Azure Event Hubs
- Поддержка наиболее распространенных форматов сериализации (JSON, Avro, Protobuf скоро!)

#### Начало работы {#clickpipes-for-kafka-getting-started}

Чтобы начать использовать ClickPipes for Kafka, см. [справочную документацию](/integrations/clickpipes/kafka/reference) или перейдите на вкладку `Data Sources` в пользовательском интерфейсе ClickHouse Cloud.

### Kafka Connect Sink {#kafka-connect-sink}

Kafka Connect — это фреймворк с открытым исходным кодом, который работает как централизованный узел данных для простой интеграции данных между Kafka и другими системами данных. Коннектор [ClickHouse Kafka Connect Sink](https://github.com/ClickHouse/clickhouse-kafka-connect) предоставляет масштабируемый и гибко настраиваемый вариант для чтения данных из Apache Kafka и других брокеров, совместимых с Kafka API.

:::tip
Это рекомендуемый вариант, если вы предпочитаете **высокую настраиваемость** или уже используете Kafka Connect.
:::

#### Основные возможности {#kafka-connect-sink-main-features}

- Может быть настроен для поддержки семантики exactly-once
- Поддержка наиболее распространенных форматов сериализации (JSON, Avro, Protobuf)
- Непрерывно тестируется с ClickHouse Cloud

#### Начало работы {#kafka-connect-sink-getting-started}

Чтобы начать использовать ClickHouse Kafka Connect Sink, см. [справочную документацию](./kafka-clickhouse-connect-sink.md).

### Движок таблиц Kafka {#kafka-table-engine}

[Движок таблиц Kafka](./kafka-table-engine.md) может использоваться для чтения данных из Apache Kafka и других брокеров, совместимых с Kafka API, а также для записи данных в них. Этот вариант входит в состав ClickHouse с открытым исходным кодом и доступен для всех типов развертывания.

:::tip
Это рекомендуемый вариант, если вы самостоятельно размещаете ClickHouse и вам нужен вариант с **низким порогом входа**, или если вам необходимо **записывать** данные в Kafka.
:::

#### Основные возможности {#kafka-table-engine-main-features}

- Может использоваться для [чтения](./kafka-table-engine.md/#kafka-to-clickhouse) и [записи](./kafka-table-engine.md/#clickhouse-to-kafka) данных
- Входит в состав ClickHouse с открытым исходным кодом
- Поддержка наиболее распространенных форматов сериализации (JSON, Avro, Protobuf)

#### Начало работы {#kafka-table-engine-getting-started}


Чтобы начать работу с движком таблиц Kafka, см. [справочную документацию](./kafka-table-engine.md).

### Выбор варианта {#choosing-an-option}

| Продукт                  | Преимущества                                                                                                                                                                                                                                                                                           | Недостатки                                                                                                                                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ClickPipes for Kafka** | • Масштабируемая архитектура для высокой пропускной способности и низкой задержки<br/>• Встроенный мониторинг и управление схемами<br/>• Частные сетевые подключения (через PrivateLink)<br/>• Поддержка аутентификации SSL/TLS и авторизации IAM<br/>• Поддержка программной конфигурации (Terraform, конечные точки API) | • Не поддерживает отправку данных в Kafka<br/>• Семантика at-least-once                                                                                                                                                |
| **Kafka Connect Sink**   | • Семантика exactly-once<br/>• Позволяет детально контролировать преобразование данных, пакетную обработку и обработку ошибок<br/>• Может быть развернут в частных сетях<br/>• Позволяет выполнять репликацию в реальном времени из баз данных, пока не поддерживаемых в ClickPipes, через Debezium                                               | • Не поддерживает отправку данных в Kafka<br/>• Сложен в настройке и обслуживании<br/>• Требует экспертизы в Kafka и Kafka Connect                                                                          |
| **Kafka table engine**   | • Поддерживает [отправку данных в Kafka](./kafka-table-engine.md/#clickhouse-to-kafka)<br/>• Прост в настройке                                                                                                                                                                               | • Семантика at-least-once<br/>• Ограниченное горизонтальное масштабирование для потребителей. Не может масштабироваться независимо от сервера ClickHouse<br/>• Ограниченные возможности обработки ошибок и отладки<br/>• Требует экспертизы в Kafka |

### Другие варианты {#other-options}

- [**Confluent Cloud**](./confluent/index.md) - Confluent Platform предоставляет возможность загрузить и [запустить ClickHouse Connector Sink на Confluent Cloud](./confluent/custom-connector.md) или использовать [HTTP Sink Connector for Confluent Platform](./confluent/kafka-connect-http.md), который интегрирует Apache Kafka с API через HTTP или HTTPS.

- [**Vector**](./kafka-vector.md) - Vector — это независимый от поставщика конвейер данных. Благодаря возможности чтения из Kafka и отправки событий в ClickHouse, это надежный вариант интеграции.

- [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - Коннектор Kafka Connect JDBC Sink позволяет экспортировать данные из топиков Kafka в любую реляционную базу данных с драйвером JDBC.

- **Пользовательский код** - Пользовательский код с использованием [клиентских библиотек](../../language-clients/index.md) Kafka и ClickHouse может быть уместен в случаях, когда требуется специальная обработка событий.

[BYOC]: /cloud/reference/byoc/overview
[Cloud]: /cloud/get-started
[Self-hosted]: ../../../intro.md
