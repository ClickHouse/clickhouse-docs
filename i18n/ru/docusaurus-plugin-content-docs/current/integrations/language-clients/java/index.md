---
title: 'Java'
sidebar_position: 1
keywords: ['clickhouse', 'java', 'jdbc', 'client', 'integrate', 'r2dbc']
description: 'Варианты подключения к ClickHouse из Java'
slug: /integrations/java
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# Обзор Java‑клиентов \{#java-clients-overview\}

- [Клиент 0.8+](./client/client.mdx)
- [JDBC 0.8+](./jdbc/jdbc.mdx)
- [Драйвер R2DBC](./r2dbc.md)

## ClickHouse client \{#clickhouse-client\}

Java client — это библиотека, реализующая собственный API, который инкапсулирует детали сетевого взаимодействия с сервером ClickHouse. В настоящее время поддерживается только HTTP-интерфейс. Библиотека предоставляет утилиты для работы с различными форматами ClickHouse и другими связанными функциями.

Java client был разработан ещё в 2015 году. Его кодовая база стала очень сложной в сопровождении, API запутан, его дальнейшая оптимизация затруднена. Поэтому в 2024 году мы переработали его в новый компонент `client-v2`. У него понятный API, более лёгкая кодовая база, дополнительные улучшения производительности и более качественная поддержка форматов ClickHouse (в основном RowBinary и Native). В ближайшем будущем JDBC будет использовать этот клиент.

### Поддерживаемые типы данных \{#supported-data-types\}

|**Тип данных**         |**Поддержка в Client V2**|**Поддержка в Client V1**|
|-----------------------|-------------------------|-------------------------|
|Int8                   |✔                        |✔                        |
|Int16                  |✔                        |✔                        |
|Int32                  |✔                        |✔                        |
|Int64                  |✔                        |✔                        |
|Int128                 |✔                        |✔                        |
|Int256                 |✔                        |✔                        |
|UInt8                  |✔                        |✔                        |
|UInt16                 |✔                        |✔                        |
|UInt32                 |✔                        |✔                        |
|UInt64                 |✔                        |✔                        |
|UInt128                |✔                        |✔                        |
|UInt256                |✔                        |✔                        |
|Float32                |✔                        |✔                        |
|Float64                |✔                        |✔                        |
|Decimal                |✔                        |✔                        |
|Decimal32              |✔                        |✔                        |
|Decimal64              |✔                        |✔                        |
|Decimal128             |✔                        |✔                        |
|Decimal256             |✔                        |✔                        |
|Bool                   |✔                        |✔                        |
|String                 |✔                        |✔                        |
|FixedString            |✔                        |✔                        |
|Nullable               |✔                        |✔                        |
|Date                   |✔                        |✔                        |
|Date32                 |✔                        |✔                        |
|DateTime               |✔                        |✔                        |
|DateTime32             |✔                        |✔                        |
|DateTime64             |✔                        |✔                        |
|Interval               |✗                        |✗                        |
|Enum                   |✔                        |✔                        |
|Enum8                  |✔                        |✔                        |
|Enum16                 |✔                        |✔                        |
|Array                  |✔                        |✔                        |
|Map                    |✔                        |✔                        |
|Nested                 |✔                        |✔                        |
|Tuple                  |✔                        |✔                        |
|UUID                   |✔                        |✔                        |
|IPv4                   |✔                        |✔                        |
|IPv6                   |✔                        |✔                        |
|Object                 |✗                        |✔                        |
|Point                  |✔                        |✔                        |
|Nothing                |✔                        |✔                        |
|MultiPolygon           |✔                        |✔                        |
|Ring                   |✔                        |✔                        |
|Polygon                |✔                        |✔                        |
|SimpleAggregateFunction|✔                        |✔                        |
|AggregateFunction      |✗                        |✔                        |
|Variant                |✔                        |✗                        |
|Dynamic                |✔                        |✗                        |
|JSON                   |✔                        |✗                        |

[Типы данных ClickHouse](/sql-reference/data-types)

:::note

- AggregatedFunction — :warning: не поддерживает `SELECT * FROM table ...`
- Decimal — `SET output_format_decimal_trailing_zeros=1` в версии 21.9+ для согласованности
- Enum — может рассматриваться и как строка, и как целое число
- UInt64 — отображается в тип `long` в client-v1
:::

### Возможности \{#features\}

Таблица возможностей клиентов:

| Название                                     | Client V2 | Client V1 | Комментарии
|----------------------------------------------|:---------:|:---------:|:---------:|
| HTTP-подключение                             |✔       |✔      | |
| HTTP-сжатие (LZ4)                            |✔       |✔      | |
| Сжатие, управляемое приложением              |✔       |✗      | |
| Сжатие ответов сервера — LZ4                 |✔       |✔      | |
| Сжатие запросов клиента — LZ4                |✔       |✔      | |
| HTTPS                                        |✔       |✔      | |
| Клиентский SSL-сертификат (mTLS)             |✔       |✔      | |
| HTTP-прокси                                  |✔       |✔      | |
| POJO SerDe                                   |✔       |✗      | |
| Пул соединений                               |✔       |✔      | При использовании Apache HTTP Client |
| Именованные параметры                        |✔       |✔      | |
| Повтор при сбое                              |✔       |✔      | |
| Переключение при сбое (failover)             |✗       |✔      | |
| Балансировка нагрузки                        |✗       |✔      | |
| Автообнаружение серверов                     |✗       |✔      | |
| Комментарий в логе                           |✔       |✔      | |
| Роли сессии                                  |✔       |✔      | |
| Аутентификация клиента по SSL                |✔       |✔      | |
| Настройка SNI                                |✔       |✗      | |
| Часовой пояс сессии                          |✔       |✔      | |

JDBC-драйвер наследует те же возможности, что и базовая реализация клиента. Другие возможности JDBC перечислены на его [странице](/integrations/language-clients/java/jdbc).

### Совместимость \{#compatibility\}

- Все проекты в этом репозитории проходят тестирование со всеми [активными LTS-версиями](https://github.com/ClickHouse/ClickHouse/pulls?q=is%3Aopen+is%3Apr+label%3Arelease) ClickHouse.
- [Политика поддержки](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)
- Мы рекомендуем постоянно обновлять клиент, чтобы не пропускать исправления безопасности и новые улучшения.
- Если у вас возникают проблемы с миграцией на API v2 — [создайте issue](https://github.com/ClickHouse/clickhouse-java/issues/new?assignees=&labels=v2-feedback&projects=&template=v2-feedback.md&title=), и мы ответим!

### Логирование \{#logging\}

Наш Java‑клиент использует [SLF4J](https://www.slf4j.org/) для логирования. Вы можете использовать любой совместимый с SLF4J фреймворк для логирования, например `Logback` или `Log4j`.
Например, если вы используете Maven, вы можете добавить следующую зависимость в файл `pom.xml`:

```xml title="pom.xml"
<dependencies>
    <!-- SLF4J API -->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-api</artifactId>
        <version>2.0.16</version> <!-- Use the latest version -->
    </dependency>

    <!-- Logback Core -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-core</artifactId>
        <version>1.5.16</version> <!-- Use the latest version -->
    </dependency>

    <!-- Logback Classic (bridges SLF4J to Logback) -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.5.16</version> <!-- Use the latest version -->
    </dependency>
</dependencies>
```


#### Настройка логирования \{#configuring-logging\}

Это зависит от используемого вами фреймворка логирования. Например, если вы используете `Logback`, вы можете настроить логирование в файле `logback.xml`:

```xml title="logback.xml"
<configuration>
    <!-- Console Appender -->
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>[%d{yyyy-MM-dd HH:mm:ss}] [%level] [%thread] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- File Appender -->
    <appender name="FILE" class="ch.qos.logback.core.FileAppender">
        <file>logs/app.log</file>
        <append>true</append>
        <encoder>
            <pattern>[%d{yyyy-MM-dd HH:mm:ss}] [%level] [%thread] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- Root Logger -->
    <root level="info">
        <appender-ref ref="STDOUT" />
        <appender-ref ref="FILE" />
    </root>

    <!-- Custom Log Levels for Specific Packages -->
    <logger name="com.clickhouse" level="info" />
</configuration>
```

[Журнал изменений](https://github.com/ClickHouse/clickhouse-java/blob/main/CHANGELOG.md)
