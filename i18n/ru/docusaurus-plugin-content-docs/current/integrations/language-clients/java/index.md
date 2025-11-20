---
title: 'Java'
keywords: ['clickhouse', 'java', 'jdbc', 'client', 'integrate', 'r2dbc']
description: 'Варианты подключения к ClickHouse из Java'
slug: /integrations/java
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# Обзор Java‑клиентов

- [Клиент 0.8+](./client/client.mdx)
- [JDBC 0.8+](./jdbc/jdbc.mdx)
- [Драйвер R2DBC](./r2dbc.md)



## Клиент ClickHouse {#clickhouse-client}

Java-клиент — это библиотека, реализующая собственный API, который абстрагирует детали сетевого взаимодействия с сервером ClickHouse. В настоящее время поддерживается только HTTP-интерфейс. Библиотека предоставляет утилиты для работы с различными форматами ClickHouse и другими связанными функциями.

Java-клиент был разработан еще в 2015 году. Его кодовая база стала очень сложной в поддержке, API — запутанным, а дальнейшая оптимизация была затруднена. Поэтому в 2024 году мы провели рефакторинг и создали новый компонент `client-v2`. Он имеет понятный API, более легкую кодовую базу, улучшенную производительность и лучшую поддержку форматов ClickHouse (в основном RowBinary и Native). JDBC будет использовать этот клиент в ближайшем будущем.

### Поддерживаемые типы данных {#supported-data-types}

| **Тип данных**          | **Поддержка Client V2** | **Поддержка Client V1** |
| ----------------------- | --------------------- | --------------------- |
| Int8                    | ✔                    | ✔                    |
| Int16                   | ✔                    | ✔                    |
| Int32                   | ✔                    | ✔                    |
| Int64                   | ✔                    | ✔                    |
| Int128                  | ✔                    | ✔                    |
| Int256                  | ✔                    | ✔                    |
| UInt8                   | ✔                    | ✔                    |
| UInt16                  | ✔                    | ✔                    |
| UInt32                  | ✔                    | ✔                    |
| UInt64                  | ✔                    | ✔                    |
| UInt128                 | ✔                    | ✔                    |
| UInt256                 | ✔                    | ✔                    |
| Float32                 | ✔                    | ✔                    |
| Float64                 | ✔                    | ✔                    |
| Decimal                 | ✔                    | ✔                    |
| Decimal32               | ✔                    | ✔                    |
| Decimal64               | ✔                    | ✔                    |
| Decimal128              | ✔                    | ✔                    |
| Decimal256              | ✔                    | ✔                    |
| Bool                    | ✔                    | ✔                    |
| String                  | ✔                    | ✔                    |
| FixedString             | ✔                    | ✔                    |
| Nullable                | ✔                    | ✔                    |
| Date                    | ✔                    | ✔                    |
| Date32                  | ✔                    | ✔                    |
| DateTime                | ✔                    | ✔                    |
| DateTime32              | ✔                    | ✔                    |
| DateTime64              | ✔                    | ✔                    |
| Interval                | ✗                     | ✗                     |
| Enum                    | ✔                    | ✔                    |
| Enum8                   | ✔                    | ✔                    |
| Enum16                  | ✔                    | ✔                    |
| Array                   | ✔                    | ✔                    |
| Map                     | ✔                    | ✔                    |
| Nested                  | ✔                    | ✔                    |
| Tuple                   | ✔                    | ✔                    |
| UUID                    | ✔                    | ✔                    |
| IPv4                    | ✔                    | ✔                    |
| IPv6                    | ✔                    | ✔                    |
| Object                  | ✗                     | ✔                    |
| Point                   | ✔                    | ✔                    |
| Nothing                 | ✔                    | ✔                    |
| MultiPolygon            | ✔                    | ✔                    |
| Ring                    | ✔                    | ✔                    |
| Polygon                 | ✔                    | ✔                    |
| SimpleAggregateFunction | ✔                    | ✔                    |
| AggregateFunction       | ✗                     | ✔                    |
| Variant                 | ✔                    | ✗                     |
| Dynamic                 | ✔                    | ✗                     |
| JSON                    | ✔                    | ✗                     |

[Типы данных ClickHouse](/sql-reference/data-types)

:::note

- AggregatedFunction — :warning: не поддерживает `SELECT * FROM table ...`
- Decimal — `SET output_format_decimal_trailing_zeros=1` в версии 21.9+ для обеспечения согласованности
- Enum — может обрабатываться как строка или целое число
- UInt64 — сопоставляется с `long` в client-v1
  :::

### Возможности {#features}

Таблица возможностей клиентов:


| Название                          | Client V2 | Client V1 |           Комментарии        |
| --------------------------------- | :-------: | :-------: | :--------------------------: |
| HTTP-соединение                   |    ✔     |    ✔     |                              |
| HTTP-сжатие (LZ4)                 |    ✔     |    ✔     |                              |
| Сжатие ответа сервера — LZ4       |    ✔     |    ✔     |                              |
| Сжатие запроса клиента — LZ4      |    ✔     |    ✔     |                              |
| HTTPS                             |    ✔     |    ✔     |                              |
| Сертификат SSL клиента (mTLS)     |    ✔     |    ✔     |                              |
| HTTP-прокси                       |    ✔     |    ✔     |                              |
| POJO SerDe                        |    ✔     |     ✗     |                              |
| Пул соединений                    |    ✔     |    ✔     | При использовании Apache HTTP Client |
| Именованные параметры             |    ✔     |    ✔     |                              |
| Повторные попытки при сбое        |    ✔     |    ✔     |                              |
| Резервное переключение            |     ✗     |    ✔     |                              |
| Балансировка нагрузки             |     ✗     |    ✔     |                              |
| Автообнаружение сервера           |     ✗     |    ✔     |                              |
| Комментарий лога                  |    ✔     |    ✔     |                              |
| Роли сессии                       |    ✔     |    ✔     |                              |
| Аутентификация SSL клиента        |    ✔     |    ✔     |                              |
| Часовой пояс сессии               |    ✔     |    ✔     |                              |

Драйвер JDBC наследует те же возможности, что и базовая реализация клиента. Другие возможности JDBC перечислены на его [странице](/integrations/language-clients/java/jdbc).

### Совместимость {#compatibility}

- Все проекты в этом репозитории тестируются со всеми [активными LTS-версиями](https://github.com/ClickHouse/ClickHouse/pulls?q=is%3Aopen+is%3Apr+label%3Arelease) ClickHouse.
- [Политика поддержки](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)
- Мы рекомендуем регулярно обновлять клиент, чтобы не пропустить исправления безопасности и новые улучшения
- Если у вас возникла проблема с миграцией на API версии 2 — [создайте issue](https://github.com/ClickHouse/clickhouse-java/issues/new?assignees=&labels=v2-feedback&projects=&template=v2-feedback.md&title=), и мы ответим!

### Логирование {#logging}

Наш Java-клиент использует [SLF4J](https://www.slf4j.org/) для логирования. Вы можете использовать любую совместимую с SLF4J систему логирования, такую как `Logback` или `Log4j`.
Например, если вы используете Maven, вы можете добавить следующую зависимость в ваш файл `pom.xml`:

```xml title="pom.xml"
<dependencies>
    <!-- API SLF4J -->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-api</artifactId>
        <version>2.0.16</version> <!-- Используйте последнюю версию -->
    </dependency>

    <!-- Ядро Logback -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-core</artifactId>
        <version>1.5.16</version> <!-- Используйте последнюю версию -->
    </dependency>

    <!-- Logback Classic (мост между SLF4J и Logback) -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.5.16</version> <!-- Используйте последнюю версию -->
    </dependency>
</dependencies>
```

#### Настройка логирования {#configuring-logging}

Это будет зависеть от используемой вами системы логирования. Например, если вы используете `Logback`, вы можете настроить логирование в файле с именем `logback.xml`:

```xml title="logback.xml"
<configuration>
    <!-- Appender для консоли -->
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>[%d{yyyy-MM-dd HH:mm:ss}] [%level] [%thread] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- Appender для файла -->
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

```


    <!-- Пользовательские уровни логирования для конкретных пакетов -->
    <logger name="com.clickhouse" level="info" />

</configuration>
```

[Список изменений](https://github.com/ClickHouse/clickhouse-java/blob/main/CHANGELOG.md)
