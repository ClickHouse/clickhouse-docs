---


sidebar_label: 'Интеграция Kafka с ClickHouse'
sidebar_position: 1
slug: /integrations/kafka
description: 'Введение в использование Kafka с ClickHouse'
title: 'Интеграция Kafka с ClickHouse'
keywords: ['Apache Kafka', 'потоковая обработка событий', 'конвейер данных', 'брокер сообщений', 'данные в реальном времени']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---



# Интеграция Kafka с ClickHouse

[Apache Kafka](https://kafka.apache.org/) — это распределённая платформа потоковой передачи событий с открытым исходным кодом, используемая тысячами компаний для высокопроизводительных конвейеров данных, потоковой аналитики, интеграции данных и критически важных для бизнеса приложений. ClickHouse предоставляет несколько способов **чтения из** и **записи в** Kafka и другие брокеры, совместимые с Kafka API (например, Redpanda, Amazon MSK).



## Доступные варианты {#available-options}

Выбор подходящего варианта для вашего сценария использования зависит от нескольких факторов, включая тип развертывания ClickHouse, направление потока данных и эксплуатационные требования.

| Вариант                                                | Тип развертывания | Полностью управляемый | Kafka → ClickHouse | ClickHouse → Kafka |
|---------------------------------------------------------|------------|:-------------------:|:-------------------:|:------------------:|
| [ClickPipes for Kafka](/integrations/clickpipes/kafka)                                | [Cloud], [BYOC] (скоро!)   | ✅ | ✅ |   |
| [Kafka Connect Sink](./kafka-clickhouse-connect-sink.md) | [Cloud], [BYOC], [Self-hosted] | | ✅ |   |
| [Движок таблиц Kafka](./kafka-table-engine.md)           | [Cloud], [BYOC], [Self-hosted] | | ✅ | ✅ |

Более детальное сравнение этих вариантов см. в разделе [Выбор варианта](#choosing-an-option).

### ClickPipes for Kafka {#clickpipes-for-kafka}

[ClickPipes](../clickpipes/index.md) — это управляемая платформа интеграции, которая делает приём данных из широкого набора источников таким же простым, как пара кликов. Поскольку это полностью управляемое решение, специализированное для промышленных нагрузок, ClickPipes значительно снижает инфраструктурные и эксплуатационные затраты, устраняя необходимость во внешних средствах потоковой передачи данных и инструментах ETL.

:::tip
Это рекомендуемый вариант, если вы используете ClickHouse Cloud. ClickPipes — **полностью управляемое** решение, специально разработанное для обеспечения **максимальной производительности** в облачных средах.
:::

#### Основные возможности {#clickpipes-for-kafka-main-features}

[//]: # "TODO It isn't optimal to link to a static alpha-release of the Terraform provider. Link to a Terraform guide once that's available."

* Оптимизирован для ClickHouse Cloud и обеспечивает сверхвысокую производительность
* Горизонтальная и вертикальная масштабируемость для высоконагруженных сценариев
* Встроенная отказоустойчивость с настраиваемыми репликами и автоматическими повторами
* Развертывание и управление через ClickHouse Cloud UI, [Open API](/cloud/manage/api/api-overview) или [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.3.3-alpha2/docs/resources/clickpipe)
* Защита уровня Enterprise с поддержкой облачно-нативной авторизации (IAM) и частных сетевых подключений (PrivateLink)
* Поддержка широкого спектра [источников данных](/integrations/clickpipes/kafka/reference/), включая Confluent Cloud, Amazon MSK, Redpanda Cloud и Azure Event Hubs
* Поддержка наиболее распространённых форматов сериализации (JSON, Avro, Protobuf — скоро!)

#### Начало работы {#clickpipes-for-kafka-getting-started}

Чтобы начать работу с ClickPipes for Kafka, обратитесь к [справочной документации](/integrations/clickpipes/kafka/reference) или перейдите на вкладку `Data Sources` в интерфейсе ClickHouse Cloud.

### Kafka Connect Sink {#kafka-connect-sink}

Kafka Connect — это open source-фреймворк, который работает как централизованный хаб данных для простой интеграции данных между Kafka и другими системами. Коннектор [ClickHouse Kafka Connect Sink](https://github.com/ClickHouse/clickhouse-kafka-connect) предоставляет масштабируемый и гибко настраиваемый вариант чтения данных из Apache Kafka и других брокеров, совместимых с Kafka API.

:::tip
Это рекомендуемый вариант, если для вас важна **высокая настраиваемость** или вы уже используете Kafka Connect.
:::

#### Основные возможности {#kafka-connect-sink-main-features}

* Может быть настроен для поддержки семантики exactly-once
* Поддерживает наиболее распространённые форматы сериализации (JSON, Avro, Protobuf)
* Непрерывно тестируется с ClickHouse Cloud

#### Начало работы {#kafka-connect-sink-getting-started}

Чтобы начать работу с ClickHouse Kafka Connect Sink, обратитесь к [справочной документации](./kafka-clickhouse-connect-sink.md).

### Движок таблиц Kafka {#kafka-table-engine}

[Движок таблиц Kafka](./kafka-table-engine.md) может использоваться для чтения и записи данных в Apache Kafka и другие брокеры, совместимые с Kafka API. Этот вариант поставляется в составе ClickHouse с открытым исходным кодом и доступен для всех типов развертывания.

:::tip
Это рекомендуемый вариант, если вы самостоятельно развертываете ClickHouse и вам нужен вариант с **низким порогом входа**, или если вам нужно **записывать** данные в Kafka.
:::

#### Основные возможности {#kafka-table-engine-main-features}

* Может использоваться для [чтения](./kafka-table-engine.md/#kafka-to-clickhouse) и [записи](./kafka-table-engine.md/#clickhouse-to-kafka) данных
* Поставляется в составе ClickHouse с открытым исходным кодом
* Поддерживает наиболее распространённые форматы сериализации (JSON, Avro, Protobuf)

#### Начало работы {#kafka-table-engine-getting-started}



Чтобы начать работу с движком таблиц Kafka, см. [справочную документацию](./kafka-table-engine.md).

### Выбор варианта {#choosing-an-option}

| Продукт | Преимущества | Недостатки |
|---------|--------------|-----------|
| **ClickPipes for Kafka** | • Масштабируемая архитектура для высокой пропускной способности и низкой задержки<br/>• Встроенный мониторинг и управление схемой<br/>• Приватные сетевые подключения (через PrivateLink)<br/>• Поддержка аутентификации SSL/TLS и авторизации IAM<br/>• Поддержка программной конфигурации (Terraform, API-эндпоинты) | • Не поддерживает отправку данных в Kafka<br/>• Семантика at-least-once |
| **Kafka Connect Sink** | • Семантика exactly-once<br/>• Позволяет тонко управлять преобразованием данных, пакетированием и обработкой ошибок<br/>• Может быть развернут в приватных сетях<br/>• Позволяет выполнять репликацию в реальном времени из баз данных, которые ещё не поддерживаются в ClickPipes, с помощью Debezium | • Не поддерживает отправку данных в Kafka<br/>• Операционно сложен в развертывании и сопровождении<br/>• Требует экспертизы по Kafka и Kafka Connect |
| **Kafka table engine** | • Поддерживает [отправку данных в Kafka](./kafka-table-engine.md/#clickhouse-to-kafka)<br/>• Прост в развертывании и настройке | • Семантика at-least-once<br/>• Ограниченное горизонтальное масштабирование потребителей. Нельзя масштабировать независимо от сервера ClickHouse<br/>• Ограниченные возможности обработки ошибок и отладки<br/>• Требуется экспертиза по Kafka |

### Другие варианты {#other-options}

* [**Confluent Cloud**](./confluent/index.md) - Confluent Platform предоставляет возможность загрузить и [запустить ClickHouse Connector Sink в Confluent Cloud](./confluent/custom-connector.md) или использовать [HTTP Sink Connector для Confluent Platform](./confluent/kafka-connect-http.md), который интегрирует Apache Kafka с API через HTTP или HTTPS.

* [**Vector**](./kafka-vector.md) - Vector — это независимый от поставщика конвейер данных. Благодаря возможности читать данные из Kafka и отправлять события в ClickHouse это является надёжным вариантом интеграции.

* [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - Коннектор Kafka Connect JDBC Sink позволяет экспортировать данные из топиков Kafka в любую реляционную базу данных с JDBC-драйвером.

* **Пользовательский код** - Пользовательский код, использующий Kafka и ClickHouse [клиентские библиотеки](../../language-clients/index.md), может быть подходящим в случаях, когда требуется кастомная обработка событий.

[BYOC]: /cloud/reference/byoc/overview
[Cloud]: /cloud/get-started
[Self-hosted]: ../../../intro.md
