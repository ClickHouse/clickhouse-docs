---
title: 'Java'
sidebar_position: 1
keywords: ['clickhouse', 'java', 'jdbc', 'client', 'integrate', 'r2dbc']
description: 'Варианты подключения к ClickHouse из Java-приложений'
slug: /integrations/java
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# Обзор Java-клиентов {#java-clients-overview}

- [Клиент 0.8+](./client/client.mdx)
- [JDBC 0.8+](./jdbc/jdbc.mdx)
- [Драйвер R2DBC](./r2dbc.md)

## ClickHouse client {#clickhouse-client}

Java client — это библиотека, реализующая собственный API, который абстрагирует детали сетевого взаимодействия с сервером ClickHouse. В настоящее время поддерживается только HTTP‑интерфейс. Библиотека предоставляет утилиты для работы с различными форматами ClickHouse и другими связанными функциями.

Java Client был разработан ещё в 2015 году. Его кодовая база со временем стала очень сложной для сопровождения, API — запутанным, а дальнейшая оптимизация — затруднительной. Поэтому в 2024 году мы переработали его в новый компонент `client-v2`. У него понятный API, более лёгкая кодовая база, дополнительные улучшения производительности и лучшая поддержка форматов ClickHouse (в основном RowBinary и Native). В ближайшем будущем JDBC будет использовать этот клиент.

### Поддерживаемые типы данных {#supported-data-types}

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
- Decimal — используйте `SET output_format_decimal_trailing_zeros=1` в версии 21.9+ для единообразия вывода
- Enum — может трактоваться и как строка, и как целое число
- UInt64 — соответствует типу `long` в client-v1
:::

### Возможности {#features}

Таблица возможностей клиентов:

| Name                                         | Client V2 | Client V1 | Comments
|----------------------------------------------|:---------:|:---------:|:---------:|
| Http Connection                              |✔       |✔      | |
| Http Compression (LZ4)                       |✔       |✔      | |
| Application Controlled Compression           |✔       |✗      | |
| Server Response Compression - LZ4            |✔       |✔      | |
| Client Request Compression - LZ4             |✔       |✔      | |
| HTTPS                                        |✔       |✔      | |
| Client SSL Cert (mTLS)                       |✔       |✔      | |
| Http Proxy                                   |✔       |✔      | |
| POJO SerDe                                   |✔       |✗      | |
| Connection Pool                              |✔       |✔      | При использовании Apache HTTP Client |
| Named Parameters                             |✔       |✔      | |
| Retry on failure                             |✔       |✔      | |
| Failover                                     |✗       |✔      | |
| Load-balancing                               |✗       |✔      | |
| Server auto-discovery                        |✗       |✔      | |
| Log Comment                                  |✔       |✔      | |
| Session Roles                                |✔       |✔      | |
| SSL Client Authentication                    |✔       |✔      | |
| SNI Configuration                            |✔       |✗      | |
| Session timezone                             |✔       |✔      | |

JDBC-драйвер наследует те же возможности, что и базовая реализация клиента. Другие возможности JDBC перечислены на этой [странице](/integrations/language-clients/java/jdbc).

### Совместимость {#compatibility}

- Все проекты в этом репозитории тестируются со всеми [активными LTS-версиями](https://github.com/ClickHouse/ClickHouse/pulls?q=is%3Aopen+is%3Apr+label%3Arelease) ClickHouse.
- [Политика поддержки](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)
- Мы рекомендуем регулярно обновлять клиент, чтобы не пропускать исправления уязвимостей и новые улучшения.
- Если у вас возникла проблема с миграцией на API v2 — [создайте issue](https://github.com/ClickHouse/clickhouse-java/issues/new?assignees=&labels=v2-feedback&projects=&template=v2-feedback.md&title=), и мы вам ответим!

### Логирование {#logging}

Наш Java‑клиент использует [SLF4J](https://www.slf4j.org/) для логирования. Вы можете использовать любой совместимый с SLF4J фреймворк для логирования, например `Logback` или `Log4j`.
Если вы используете Maven, добавьте следующую зависимость в файл `pom.xml`:

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


#### Настройка логирования {#configuring-logging}

Настройка будет зависеть от того, какой фреймворк для логирования вы используете. Например, если вы используете `Logback`, вы можете настроить логирование в файле `logback.xml`:

```xml title="logback.xml"
<configuration>
    <!-- Аппендер для консоли -->
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>[%d{yyyy-MM-dd HH:mm:ss}] [%level] [%thread] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- Аппендер для файла -->
    <appender name="FILE" class="ch.qos.logback.core.FileAppender">
        <file>logs/app.log</file>
        <append>true</append>
        <encoder>
            <pattern>[%d{yyyy-MM-dd HH:mm:ss}] [%level] [%thread] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- Корневой логгер -->
    <root level="info">
        <appender-ref ref="STDOUT" />
        <appender-ref ref="FILE" />
    </root>

    <!-- Настраиваемые уровни логирования для отдельных пакетов -->
    <logger name="com.clickhouse" level="info" />
</configuration>
```

[Журнал изменений](https://github.com/ClickHouse/clickhouse-java/blob/main/CHANGELOG.md)
