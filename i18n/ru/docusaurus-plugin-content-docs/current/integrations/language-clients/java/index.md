---
title: 'Java'
keywords: ['clickhouse', 'java', 'jdbc', 'client', 'integrate', 'r2dbc']
description: 'Опции для подключения к ClickHouse из Java'
slug: /integrations/java
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# Обзор клиентов Java

- [Клиент 0.8+](./client.md)
- [JDBC 0.8+](./jdbc.md)
- [Драйвер R2DBC](./r2dbc.md)

## Клиент ClickHouse {#clickhouse-client}

Клиент Java — это библиотека, реализующая собственный API, который абстрагирует детали сетевых коммуникаций с сервером ClickHouse. В настоящее время поддерживается только HTTP интерфейс. Библиотека предоставляет утилиты для работы с различными форматами ClickHouse и другими связанными функциями.

Клиент Java был разработан еще в 2015 году. Его кодовая база стала очень трудно поддерживаемой, API запутанным, и дальнейшая оптимизация сложна. Поэтому в 2024 году мы его переработали в новый компонент `client-v2`. У него ясный API, легковесная кодовая база и улучшения производительности, лучшее поддержание форматов ClickHouse (в основном RowBinary и Native). JDBC будет использовать этот клиент в ближайшем будущем.  

### Поддерживаемые типы данных {#supported-data-types}

|**Тип данных**       |**Поддержка клиента V2**|**Поддержка клиента V1**|
|----------------------|----------------------|----------------------|
|Int8                  |✔                    |✔                    |
|Int16                 |✔                    |✔                    |
|Int32                 |✔                    |✔                    |
|Int64                 |✔                    |✔                    |
|Int128                |✔                    |✔                    |
|Int256                |✔                    |✔                    |
|UInt8                 |✔                    |✔                    |
|UInt16                |✔                    |✔                    |
|UInt32                |✔                    |✔                    |
|UInt64                |✔                    |✔                    |
|UInt128               |✔                    |✔                    |
|UInt256               |✔                    |✔                    |
|Float32               |✔                    |✔                    |
|Float64               |✔                    |✔                    |
|Decimal               |✔                    |✔                    |
|Decimal32             |✔                    |✔                    |
|Decimal64             |✔                    |✔                    |
|Decimal128            |✔                    |✔                    |
|Decimal256            |✔                    |✔                    |
|Bool                  |✔                    |✔                    |
|String                |✔                    |✔                    |
|FixedString           |✔                    |✔                    |
|Nullable              |✔                    |✔                    |
|Date                  |✔                    |✔                    |
|Date32                |✔                    |✔                    |
|DateTime              |✔                    |✔                    |
|DateTime32            |✔                    |✔                    |
|DateTime64            |✔                    |✔                    |
|Interval              |✗                    |✗                    |
|Enum                  |✔                    |✔                    |
|Enum8                 |✔                    |✔                    |
|Enum16                |✔                    |✔                    |
|Array                 |✔                    |✔                    |
|Map                   |✔                    |✔                    |
|Nested                |✔                    |✔                    |
|Tuple                 |✔                    |✔                    |
|UUID                  |✔                    |✔                    |
|IPv4                  |✔                    |✔                    |
|IPv6                  |✔                    |✔                    |
|Object                |✗                    |✔                    |
|Point                 |✔                    |✔                    |
|Nothing               |✔                    |✔                    |
|MultiPolygon          |✔                    |✔                    |
|Ring                  |✔                    |✔                    |
|Polygon               |✔                    |✔                    |
|SimpleAggregateFunction|✔                   |✔                    |
|AggregateFunction     |✗                    |✔                    |

[Типы данных ClickHouse](/sql-reference/data-types)

:::note
- AggregatedFunction - :warning: не поддерживает `SELECT * FROM table ...`
- Decimal - `SET output_format_decimal_trailing_zeros=1` в версии 21.9+ для консистентности
- Enum - может рассматриваться как строка и целое число
- UInt64 - сопоставляется с `long` в клиенте V1 
:::

### Функции {#features}

Таблица функций клиентов:

| Название                                   | Client V2 | Client V1 | Комментарии
|--------------------------------------------|:---------:|:---------:|:---------:|
| Http Connection                            |✔         |✔         | |
| Http Compression (LZ4)                     |✔         |✔         | |
| Сжатие ответа сервера - LZ4                |✔         |✔         | | 
| Сжатие запроса клиента - LZ4                |✔         |✔         | |
| HTTPS                                      |✔         |✔         | |
| Сертификат SSL клиента (mTLS)              |✔         |✔         | |
| Http Proxy                                 |✔         |✔         | |
| POJO SerDe                                 |✔         |✗         | |
| Connection Pool                            |✔         |✔         | Когда используется Apache HTTP Client |
| Именованные параметры                       |✔         |✔         | |
| Повторная попытка при сбое                 |✔         |✔         | |
| Failover                                   |✗         |✔         | |
| Балансировка нагрузки                      |✗         |✔         | |
| Автообнаружение сервера                    |✗         |✔         | |
| Лог комментарий                            |✔         |✔         | |
| Роли сессии                                |✔         |✔         | |
| Аутентификация клиента SSL                  |✔         |✔         | |
| Часовой пояс сессии                       |✔         |✔         | |

Драйвер JDBC наследует те же функции, что и реализация клиентской библиотеки. Другие функции JDBC перечислены на его [странице](/integrations/language-clients/java/jdbc).

### Совместимость {#compatibility}

- Все проекты в этом репозитории тестируются с всеми [активными версиями LTS](https://github.com/ClickHouse/ClickHouse/pulls?q=is%3Aopen+is%3Apr+label%3Arelease) ClickHouse.
- [Политика поддержки](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)
- Мы рекомендуем постоянно обновлять клиент, чтобы не пропустить исправления безопасности и новые улучшения.
- Если у вас возникла проблема с миграцией на API версии 2 - [создайте проблему](https://github.com/ClickHouse/clickhouse-java/issues/new?assignees=&labels=v2-feedback&projects=&template=v2-feedback.md&title=) и мы ответим!

### Логирование {#logging}

Наш клиент на языке Java использует [SLF4J](https://www.slf4j.org/) для логирования. Вы можете использовать любую совместимую с SLF4J фреймворк для логирования, такую как `Logback` или `Log4j`. 
Например, если вы используете Maven, вы можете добавить следующую зависимость в ваш файл `pom.xml`:

```xml title="pom.xml"
<dependencies>
    <!-- SLF4J API -->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-api</artifactId>
        <version>2.0.16</version> <!-- Используйте последнюю версию -->
    </dependency>

    <!-- Logback Core -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-core</artifactId>
        <version>1.5.16</version> <!-- Используйте последнюю версию -->
    </dependency>

    <!-- Logback Classic (связывает SLF4J с Logback) -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.5.16</version> <!-- Используйте последнюю версию -->
    </dependency>
</dependencies>
```

#### Настройка логирования {#configuring-logging}

Это будет зависеть от фреймворка логирования, который вы используете. Например, если вы используете `Logback`, вы можете настроить логирование в файле под названием `logback.xml`:

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

    <!-- Пользовательские уровни журналирования для определенных пакетов -->
    <logger name="com.clickhouse" level="info" />
</configuration>
```

[Изменения](https://github.com/ClickHouse/clickhouse-java/blob/main/CHANGELOG.md)
