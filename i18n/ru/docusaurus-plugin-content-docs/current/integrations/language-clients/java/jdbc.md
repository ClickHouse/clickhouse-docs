---
sidebar_label: 'JDBC 0.8+'
sidebar_position: 4
keywords: ['clickhouse', 'java', 'jdbc', 'драйвер', 'интеграция']
description: 'Драйвер JDBC для ClickHouse'
slug: /integrations/language-clients/java/jdbc
title: 'Драйвер JDBC (0.8+)'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';



# Драйвер JDBC (0.8+)

`clickhouse-jdbc` реализует стандартный интерфейс JDBC, используя последний [java client](/integrations/language-clients/java/client.md). Мы рекомендуем использовать последний [java client](/integrations/language-clients/java/client.md) напрямую, если производительность/прямой доступ критичны.

:::note
Если вы ищете предыдущую версию документации по драйверу JDBC, пожалуйста, смотрите [здесь](/integrations/language-clients/java/jdbc-v1.md).
:::

## Изменения с 0.7.x {#changes-from-07x}
В версии 0.8 мы попытались сделать драйвер более строго соответствующим спецификации JDBC, поэтому некоторые функции были удалены, что может повлиять на вас:

| Старая функция                   | Примечания                                                                                                                                                                                                                                           |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Поддержка транзакций             | Ранние версии драйвера только **симулировали** поддержку транзакций, что могло привести к неожиданным результатам.                                                                                                                                 |
| Переименование столбцов ответа   | `ResultSet` был изменяемым - ради эффективности теперь они только для чтения.                                                                                                                                                                       |
| Многозначные SQL                 | Поддержка многозначных выражений была только **симулирована**, теперь она строго следует 1:1.                                                                                                                                                     |
| Именованные параметры             | Не входят в спецификацию JDBC                                                                                                                                                                                                                      |
| Подготовленные выражения на основе потока | Ранняя версия драйвера позволяла не-JDBC использование `PreparedStatement` - если вам нужны такие опции, мы рекомендуем обратить внимание на [Java Client](/integrations/language-clients/java/client.md) и его [примеры](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2). |

:::note
`Date` хранится без часового пояса, в то время как `DateTime` хранится с часовым поясом. Это может привести к неожиданным результатам, если вы не будете осторожны.
:::

## Требования к среде {#environment-requirements}

- версия [OpenJDK](https://openjdk.java.net) >= 8

### Настройка {#setup}

<Tabs groupId="jdbc-base-dependencies">
<TabItem value="maven" label="Maven" >

```xml 
<!-- https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc -->
<dependency>
    <groupId>com.clickhouse</groupId>
    <artifactId>clickhouse-jdbc</artifactId>
    <version>0.8.2</version>
    <classifier>shaded-all</classifier>    
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc
implementation("com.clickhouse:clickhouse-jdbc:0.8.2:shaded-all")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc
implementation 'com.clickhouse:clickhouse-jdbc:0.8.2:shaded-all'
```

</TabItem>
</Tabs>

## Конфигурация {#configuration}

**Класс драйвера**: `com.clickhouse.jdbc.ClickHouseDriver`

**Синтаксис URL**: `jdbc:(ch|clickhouse)[:<protocol>]://endpoint1[,endpoint2,...][/<database>][?param1=value1&param2=value2][#tag1,tag2,...]`, например:

- `jdbc:clickhouse:http://localhost:8123`
- `jdbc:clickhouse:https://localhost:8443?ssl=true`

**Свойства подключения**:

Помимо стандартных свойств JDBC, драйвер поддерживает специфические для ClickHouse свойства, предоставляемые подлежащим [java client](/integrations/language-clients/java/client.md). Где это возможно, методы будут возвращать `SQLFeatureNotSupportedException`, если функция не поддерживается. Другие пользовательские свойства включают:

| Свойство                         | Значение по умолчанию | Описание                                                    |
|----------------------------------|-----------------------|------------------------------------------------------------|
| `disable_frameworks_detection`   | `true`                | Отключить определение фреймворков для User-Agent          |
| `jdbc_ignore_unsupported_values` | `false`               | Подавляет `SQLFeatureNotSupportedException`                |
| `clickhouse.jdbc.v1`             | `false`               | Использовать старую реализацию JDBC вместо новой JDBC      |
| `default_query_settings`         | `null`                | Позволяет передавать настройки запросов по умолчанию с запросами |

## Поддерживаемые типы данных {#supported-data-types}

Драйвер JDBC поддерживает те же форматы данных, что и подлежащий [java client](/integrations/language-clients/java/client.md).

### Обработка дат, времени и часовых поясов {#handling-dates-times-and-timezones}
`java.sql.Date`, `java.sql.Time` и `java.sql.Timestamp` могут усложнить вычисление часовых поясов - хотя они, конечно, поддерживаются, вы можете рассмотреть возможность использования пакета [java.time](https://docs.oracle.com/javase/8/docs/api/java/time/package-summary.html). `ZonedDateTime` и `OffsetDateTime` являются отличными заменами для `java.sql.Timestamp`, `java.sql.Date` и `java.sql.Time`.

## Создание соединения {#creating-connection}

```java
String url = "jdbc:ch://my-server:8123/system";

Properties properties = new Properties();
DataSource dataSource = new DataSource(url, properties);//DataSource или DriverManager являются основными точками входа
try (Connection conn = dataSource.getConnection()) {
... // делаем что-то с соединением
```

## Подача учетных данных и настроек {#supplying-credentials-and-settings}

```java showLineNumbers
String url = "jdbc:ch://localhost:8123?jdbc_ignore_unsupported_values=true&socket_timeout=10";

Properties info = new Properties();
info.put("user", "default");
info.put("password", "password");
info.put("database", "some_db");

//Создание соединения с DataSource
DataSource dataSource = new DataSource(url, info);
try (Connection conn = dataSource.getConnection()) {
... // делаем что-то с соединением
}

//Альтернативный подход с использованием DriverManager
try (Connection conn = DriverManager.getConnection(url, info)) {
... // делаем что-то с соединением
}
```

## Простой оператор {#simple-statement}

```java showLineNumbers

try (Connection conn = dataSource.getConnection(...);
    Statement stmt = conn.createStatement()) {
    ResultSet rs = stmt.executeQuery("select * from numbers(50000)");
    while(rs.next()) {
        // ...
    }
}
```

## Вставка {#insert}

```java showLineNumbers
try (PreparedStatement ps = conn.prepareStatement("INSERT INTO mytable VALUES (?, ?)")) {
    ps.setString(1, "test"); // id
    ps.setObject(2, LocalDateTime.now()); // timestamp
    ps.addBatch();
    ...
    ps.executeBatch(); // потоковая передача всего в ClickHouse
}
```

## `HikariCP` {#hikaricp}
    
```java showLineNumbers
// пул соединений не сильно поможет с точки зрения производительности,
// так как подлежащая реализация имеет свой собственный пул.
// Например: HttpURLConnection имеет пул для сокетов
HikariConfig poolConfig = new HikariConfig();
poolConfig.setConnectionTimeout(5000L);
poolConfig.setMaximumPoolSize(20);
poolConfig.setMaxLifetime(300_000L);
poolConfig.setDataSource(new ClickHouseDataSource(url, properties));

try (HikariDataSource ds = new HikariDataSource(poolConfig);
     Connection conn = ds.getConnection();
     Statement s = conn.createStatement();
     ResultSet rs = s.executeQuery("SELECT * FROM system.numbers LIMIT 3")) {
    while (rs.next()) {
        // обработка строки
        log.info("Integer: {}, String: {}", rs.getInt(1), rs.getString(1));//Одна и та же колонка, но разные типы
    }
}
```

## Дополнительная информация {#more-information}
Для получения дополнительной информации смотрите наш [GitHub репозиторий](https://github.com/ClickHouse/clickhouse-java) и [документацию по Java Client](/integrations/language-clients/java/client.md).


## Устранение неполадок {#troubleshooting}
### Логирование {#logging}
Драйвер использует [slf4j](https://www.slf4j.org/) для логирования и будет использовать первую доступную реализацию на `classpath`.

### Решение проблем с тайм-аутами JDBC при больших вставках {#resolving-jdbc-timeout-on-large-inserts}

При выполнении больших вставок в ClickHouse с длительным временем выполнения вы можете столкнуться с ошибками тайм-аута JDBC, такими как:

```plaintext
Caused by: java.sql.SQLException: Read timed out, server myHostname [uri=https://hostname.aws.clickhouse.cloud:8443]
```
Эти ошибки могут нарушить процесс вставки данных и повлиять на стабильность системы. Для решения этой проблемы вам может потребоваться настроить несколько тайм-аутов в ОС клиента.

#### Mac OS {#mac-os}

На Mac OS следующие настройки могут быть отрегулированы для решения проблемы:

- `net.inet.tcp.keepidle`: 60000
- `net.inet.tcp.keepintvl`: 45000
- `net.inet.tcp.keepinit`: 45000
- `net.inet.tcp.keepcnt`: 8
- `net.inet.tcp.always_keepalive`: 1

#### Linux {#linux}

На Linux эквивалентные настройки могут не решить проблему. Потребуются дополнительные шаги из-за различий в том, как Linux обрабатывает настройки keep-alive для сокетов. Следуйте следующим шагам:

1. Отрегулируйте следующие параметры ядра Linux в файле `/etc/sysctl.conf` или в связанном файле конфигурации:

    - `net.inet.tcp.keepidle`: 60000
    - `net.inet.tcp.keepintvl`: 45000
    - `net.inet.tcp.keepinit`: 45000
    - `net.inet.tcp.keepcnt`: 8
    - `net.inet.tcp.always_keepalive`: 1
    - `net.ipv4.tcp_keepalive_intvl`: 75
    - `net.ipv4.tcp_keepalive_probes`: 9
    - `net.ipv4.tcp_keepalive_time`: 60 (Вы можете рассмотреть возможность уменьшения этого значения с 300 секунд по умолчанию)

2. После изменения параметров ядра примените изменения, выполнив следующую команду:

```shell
sudo sysctl -p
```

После настройки этих параметров необходимо убедиться, что ваш клиент включает опцию Keep Alive для сокета:

```java
properties.setProperty("socket_keepalive", "true");
```
