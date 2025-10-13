---
slug: '/integrations/kafka'
sidebar_label: 'Интеграция Kafka с ClickHouse'
sidebar_position: 1
description: 'Введение в Kafka с ClickHouse'
title: 'Интеграция Kafka с ClickHouse'
doc_type: guide
---
# Интеграция Kafka с ClickHouse

[Apache Kafka](https://kafka.apache.org/) — это платформа потоковой передачи событий с распределенной архитектурой с открытым исходным кодом, используемая тысячами компаний для высокопроизводительных конвейеров данных, аналитики в реальном времени, интеграции данных и критически важных приложений. ClickHouse предоставляет несколько вариантов для **чтения из** и **записи в** Kafka и другие брокеры, совместимые с API Kafka (например, Redpanda, Amazon MSK).

## Доступные варианты {#available-options}

Выбор правильного варианта для вашего случая использования зависит от множества факторов, включая тип развертывания ClickHouse, направление потока данных и операционные требования.

| Вариант                                                 | Тип развертывания | Полностью управляемый | Kafka в ClickHouse | ClickHouse в Kafka |
|---------------------------------------------------------|-------------------|:---------------------:|:------------------:|:------------------:|
| [ClickPipes для Kafka](/integrations/clickpipes/kafka) | [Cloud], [BYOC] (скоро!) | ✅ | ✅ |   |
| [Kafka Connect Sink](./kafka-clickhouse-connect-sink.md) | [Cloud], [BYOC], [Self-hosted] | | ✅ |   |
| [Kafka table engine](./kafka-table-engine.md)           | [Cloud], [BYOC], [Self-hosted] | | ✅ | ✅ |

Для более детального сравнения этих вариантов см. [Выбор варианта](#choosing-an-option).

### ClickPipes для Kafka {#clickpipes-for-kafka}

[ClickPipes](../clickpipes/index.md) — это управляемая интеграционная платформа, которая упрощает прием данных из различных источников, требуя лишь нажатия на несколько кнопок. Поскольку она полностью управляется и создана специально для производственных нагрузок, ClickPipes значительно снижает инфраструктурные и операционные затраты, устраняя необходимость во внешних инструментах потоковой передачи данных и ETL.

:::tip
Это рекомендуемый вариант, если вы являетесь пользователем ClickHouse Cloud. ClickPipes является **полностью управляемым** и созданным для обеспечения **лучшей производительности** в облачных средах.
:::

#### Основные функции {#clickpipes-for-kafka-main-features}

* Оптимизирован для ClickHouse Cloud, обеспечивая молниеносную скорость
* Горизонтальная и вертикальная масштабируемость для нагрузок с высокой пропускной способностью
* Встроенная отказоустойчивость с настраиваемыми репликами и автоматическими повторами
* Развертывание и управление через UI ClickHouse Cloud, [Open API](/cloud/manage/api/api-overview) или [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.3.3-alpha2/docs/resources/clickpipe)
* Безопасность уровня предприятия с поддержкой облачной авторизации (IAM) и частного подключения (PrivateLink)
* Поддерживает широкий спектр [источников данных](/integrations/clickpipes/kafka/reference/), включая Confluent Cloud, Amazon MSK, Redpanda Cloud и Azure Event Hubs
* Поддерживает наиболее распространенные форматы сериализации (JSON, Avro, Protobuf скоро!)

#### Начало работы {#clickpipes-for-kafka-getting-started}

Чтобы начать использовать ClickPipes для Kafka, см. [документацию](/integrations/clickpipes/kafka/reference) или перейдите на вкладку `Data Sources` в UI ClickHouse Cloud.

### Kafka Connect Sink {#kafka-connect-sink}

Kafka Connect — это фреймворк с открытым исходным кодом, который работает как централизованный хаб данных для простой интеграции данных между Kafka и другими системами данных. Коннектор [ClickHouse Kafka Connect Sink](https://github.com/ClickHouse/clickhouse-kafka-connect) предоставляет масштабируемый и высоконастраиваемый вариант для чтения данных из Apache Kafka и других брокеров, совместимых с API Kafka.

:::tip
Это рекомендуемый вариант, если вы предпочитаете **высокую настраиваемость** или уже являетесь пользователем Kafka Connect.
:::

#### Основные функции {#kafka-connect-sink-main-features}

* Может быть настроен для поддержки семантики exactly-once
* Поддерживает наиболее распространенные форматы сериализации (JSON, Avro, Protobuf)
* Непрерывно тестируется с ClickHouse Cloud

#### Начало работы {#kafka-connect-sink-getting-started}

Чтобы начать использовать ClickHouse Kafka Connect Sink, см. [документацию](./kafka-clickhouse-connect-sink.md).

### Kafka table engine {#kafka-table-engine}

[Kafka table engine](./kafka-table-engine.md) может использоваться для чтения данных из и записи данных в Apache Kafka и другие брокеры, совместимые с API Kafka. Этот вариант входит в состав открытого ClickHouse и доступен для всех типов развертывания.

:::tip
Это рекомендуемый вариант, если вы самостоятельно размещаете ClickHouse и нуждаетесь в варианте с **низким порогом входа**, или если вам нужно **записывать** данные в Kafka.
:::

#### Основные функции {#kafka-table-engine-main-features}

* Может использоваться для [чтения](./kafka-table-engine.md/#kafka-to-clickhouse) и [записи](./kafka-table-engine.md/#clickhouse-to-kafka) данных
* Входит в состав открытого ClickHouse
* Поддерживает наиболее распространенные форматы сериализации (JSON, Avro, Protobuf)

#### Начало работы {#kafka-table-engine-getting-started}

Чтобы начать использовать Kafka table engine, см. [документацию](./kafka-table-engine.md).

### Выбор варианта {#choosing-an-option}

| Продукт | Достоинства | Недостатки |
|---------|-------------|------------|
| **ClickPipes для Kafka** | • Масштабируемая архитектура для высокой пропускной способности и низкой задержки<br/>• Встроенный мониторинг и управление схемами<br/>• Частные сетевые подключения (через PrivateLink)<br/>• Поддерживает аутентификацию SSL/TLS и авторизацию IAM<br/>• Поддерживает программную конфигурацию (Terraform, API endpoints) | • Не поддерживает отправку данных в Kafka<br/>• Семантика at-least-once |
| **Kafka Connect Sink** | • Exactly-once семантика<br/>• Позволяет детальный контроль над преобразованием данных, пакетированием и обработкой ошибок<br/>• Может быть развернут в частных сетях<br/>• Позволяет репликацию в реальном времени из баз данных, которые еще не поддерживаются в ClickPipes через Debezium | • Не поддерживает отправку данных в Kafka<br/>• Операционно сложно настраивать и поддерживать<br/>• Требует знаний Kafka и Kafka Connect |
| **Kafka table engine** | • Поддерживает [отправку данных в Kafka](./kafka-table-engine.md/#clickhouse-to-kafka)<br/>• Простота операционного развертывания | • Семантика at-least-once<br/>• Ограниченная горизонтальная масштабируемость для потребителей. Не может масштабироваться независимо от сервера ClickHouse<br/>• Ограниченные возможности обработки ошибок и отладки<br/>• Требует знаний Kafka |

### Другие варианты {#other-options}

* [**Confluent Cloud**](./confluent/index.md) - Платформа Confluent предлагает возможность загрузки и [работы с ClickHouse Connector Sink на Confluent Cloud](./confluent/custom-connector.md) или использования [HTTP Sink Connector для платформы Confluent](./confluent/kafka-connect-http.md), который интегрирует Apache Kafka с API через HTTP или HTTPS.

* [**Vector**](./kafka-vector.md) - Vector представляет собой независимый от поставщика конвейер данных. С возможностью чтения из Kafka и отправки событий в ClickHouse это представляет собой надежный вариант интеграции.

* [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - Коннектор Kafka Connect JDBC Sink позволяет экспортировать данные из тем Kafka в любую реляционную базу данных с драйвером JDBC.

* **Пользовательский код** - Пользовательский код с использованием Kafka и ClickHouse [клиентских библиотек](../../language-clients/index.md) может быть уместен в случаях, когда требуется специальная обработка событий.

[BYOC]: /cloud/reference/byoc
[Cloud]: /cloud/get-started
[Self-hosted]: ../../../intro.md