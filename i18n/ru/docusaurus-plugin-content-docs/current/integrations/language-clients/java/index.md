---
slug: '/integrations/java'
description: 'Варианты подключения к ClickHouse из Java'
title: Java
keywords: ['clickhouse', 'java', 'jdbc', 'client', 'integrate', 'r2dbc']
doc_type: reference
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# Обзор Java-клиентов

- [Клиент 0.8+](./client/client.mdx)
- [JDBC 0.8+](./jdbc/jdbc.mdx)
- [Драйвер R2DBC](./r2dbc.md)

## Клиент ClickHouse {#clickhouse-client}

Java клиент — это библиотека, реализующая собственный API, который абстрагирует детали сетевых коммуникаций с сервером ClickHouse. В настоящее время поддерживается только HTTP интерфейс. Библиотека предоставляет утилиты для работы с различными форматами ClickHouse и другими связанными функциями.

Java клиент был разработан еще в 2015 году. Его кодовая база стала очень сложной для поддержки, API запутанным, а оптимизировать его стало сложно. Поэтому в 2024 году мы его рефакторили в новый компонент `client-v2`. Он имеет четкий API, облегченную кодовую базу и ряд улучшений производительности, лучше поддерживает форматы ClickHouse (в основном RowBinary и Native). JDBC будет использовать этот клиент в ближайшем будущем.

### Поддерживаемые типы данных {#supported-data-types}

|**Тип данных**          |**Поддержка Клиента V2**|**Поддержка Клиента V1**|
|-----------------------|------------------------|------------------------|
|Int8                   |✔                      |✔                      |
|Int16                  |✔                      |✔                      |
|Int32                  |✔                      |✔                      |
|Int64                  |✔                      |✔                      |
|Int128                 |✔                      |✔                      |
|Int256                 |✔                      |✔                      |
|UInt8                  |✔                      |✔                      |
|UInt16                 |✔                      |✔                      |
|UInt32                 |✔                      |✔                      |
|UInt64                 |✔                      |✔                      |
|UInt128                |✔                      |✔                      |
|UInt256                |✔                      |✔                      |
|Float32                |✔                      |✔                      |
|Float64                |✔                      |✔                      |
|Decimal                |✔                      |✔                      |
|Decimal32              |✔                      |✔                      |
|Decimal64              |✔                      |✔                      |
|Decimal128             |✔                      |✔                      |
|Decimal256             |✔                      |✔                      |
|Bool                   |✔                      |✔                      |
|String                 |✔                      |✔                      |
|FixedString            |✔                      |✔                      |
|Nullable               |✔                      |✔                      |
|Date                   |✔                      |✔                      |
|Date32                 |✔                      |✔                      |
|DateTime               |✔                      |✔                      |
|DateTime32             |✔                      |✔                      |
|DateTime64             |✔                      |✔                      |
|Interval               |✗                      |✗                      |
|Enum                   |✔                      |✔                      |
|Enum8                  |✔                      |✔                      |
|Enum16                 |✔                      |✔                      |
|Array                  |✔                      |✔                      |
|Map                    |✔                      |✔                      |
|Nested                 |✔                      |✔                      |
|Tuple                  |✔                      |✔                      |
|UUID                   |✔                      |✔                      |
|IPv4                   |✔                      |✔                      |
|IPv6                   |✔                      |✔                      |
|Object                 |✗                      |✔                      |
|Point                  |✔                      |✔                      |
|Nothing                |✔                      |✔                      |
|MultiPolygon           |✔                      |✔                      |
|Ring                   |✔                      |✔                      |
|Polygon                |✔                      |✔                      |
|SimpleAggregateFunction|✔                      |✔                      |
|AggregateFunction      |✗                      |✔                      |
|Variant                |✔                      |✗                      |
|Dynamic                |✔                      |✗                      |
|JSON                   |✔                      |✗                      |

[Типы данных ClickHouse](/sql-reference/data-types)

:::note
- AggregatedFunction - :warning: не поддерживает `SELECT * FROM table ...`
- Decimal - `SET output_format_decimal_trailing_zeros=1` в версии 21.9+ для согласованности
- Enum - может рассматриваться как строка и целое число
- UInt64 - отображается как `long` в клиенте v1 
:::

### Возможности {#features}

Таблица возможностей клиентов:

| Название                                       | Клиент V2 | Клиент V1 | Комментарии
|------------------------------------------------|:---------:|:---------:|:---------:|
| HTTP соединение                                |✔       |✔      | |
| HTTP сжатие (LZ4)                             |✔       |✔      | |
| Сжатие ответов сервера - LZ4                  |✔       |✔      | | 
| Сжатие запросов клиента - LZ4                  |✔       |✔      | |
| HTTPS                                          |✔       |✔      | |
| Сертификат SSL клиента (mTLS)                  |✔       |✔      | |
| HTTP прокси                                    |✔       |✔      | |
| POJO SerDe                                     |✔       |✗      | |
| Пул соединений                                 |✔       |✔      | При использовании Apache HTTP Client |
| Именованные параметры                          |✔       |✔      | |
| Повтор при сбое                               |✔       |✔      | |
| Переключение при сбое                         |✗       |✔      | |
| Балансировка нагрузки                         |✗       |✔      | |
| Автоопределение сервера                       |✗       |✔      | |
| Журнал комментариев                           |✔       |✔      | |
| Роли сессии                                   |✔       |✔      | |
| SSL аутентификация клиента                    |✔       |✔      | |
| Часовой пояс сессии                          |✔       |✔      | |

Драйвер JDBC наследует те же возможности, что и основная клиентская реализация. Другие функции JDBC перечислены на его [странице](/integrations/language-clients/java/jdbc).

### Совместимость {#compatibility}

- Все проекты в этом репозитории тестируются с всеми [активными LTS версиями](https://github.com/ClickHouse/ClickHouse/pulls?q=is%3Aopen+is%3Apr+label%3Arelease) ClickHouse.
- [Политика поддержки](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)
- Мы рекомендуем постоянно обновлять клиент, чтобы не пропустить исправления безопасности и новые улучшения
- Если у вас есть проблема с миграцией на API версии 2 - [создайте задачу](https://github.com/ClickHouse/clickhouse-java/issues/new?assignees=&labels=v2-feedback&projects=&template=v2-feedback.md&title=) и мы ответим!

### Логирование {#logging}

Наш Java клиент использует [SLF4J](https://www.slf4j.org/) для логирования. Вы можете использовать любую совместимую с SLF4J библиотеку логирования, такую как `Logback` или `Log4j`. 
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

#### Настройка логирования {#configuring-logging}

Это будет зависеть от используемой вами библиотеки логирования. Например, если вы используете `Logback`, вы можете настроить логирование в файле с именем `logback.xml`:

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

[ Changelog ](https://github.com/ClickHouse/clickhouse-java/blob/main/CHANGELOG.md)