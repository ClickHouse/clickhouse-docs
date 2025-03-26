---
sidebar_label: 'JDBC 0.8+'
sidebar_position: 4
keywords: ['clickhouse', 'java', 'jdbc', 'driver', 'integrate']
description: 'Драйвер ClickHouse JDBC'
slug: /integrations/language-clients/java/jdbc
title: 'Драйвер JDBC (0.8+)'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';



# Драйвер JDBC (0.8+)

`clickhouse-jdbc` реализует стандартный интерфейс JDBC, используя последний [java client](/integrations/language-clients/java/client.md).
Мы рекомендуем использовать последний [java client](/integrations/language-clients/java/client.md) напрямую, если производительность/прямой доступ критически важны.

:::note
Если вам нужна предыдущая версия документации по JDBC драйверу, пожалуйста, посмотрите [здесь](/integrations/language-clients/java/jdbc-v1.md).
:::

## Изменения с версии 0.7.x {#changes-from-07x}
В 0.8 мы постарались сделать так, чтобы драйвер более строго соответствовал спецификации JDBC, поэтому были удалены некоторые функции, которые могут оказать на вас влияние:

| Старая функция                      | Примечания                                                                                                                                                                                                                                                                                                           |
|------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Поддержка транзакций               | Ранние версии драйвера **имитировали** поддержку транзакций, что могло привести к неожиданным результатам.                                                                                                                                                                                                       |
| Переименование столбцов ответа     | `ResultSet` стал неизменяемым - для повышения эффективности они теперь только для чтения                                                                                                                                                                                                                           |
| Поддержка многоинструкционного SQL  | Поддержка многоинструкционного SQL была только **симулирована**, теперь она строго соответствует 1:1                                                                                                                                                                                                                |
| Именованные параметры               | Не входят в спецификацию JDBC                                                                                                                                                                                                                                                                                       |
| Потоковая `PreparedStatement`      | Ранние версии драйвера позволяли использование `PreparedStatement` вне JDBC - если вам нужны такие опции, мы рекомендуем посмотреть на [Java Client](/integrations/language-clients/java/client.md) и его [примеры](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2). |

:::note
`Date` хранится без часового пояса, в то время как `DateTime` хранится с часовым поясом. Это может привести к неожиданным результатам, если вы не будете осторожны.
:::

## Требования к окружению {#environment-requirements}

- [OpenJDK](https://openjdk.java.net) версия >= 8

### Установка {#setup}

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

Помимо стандартных свойств JDBC, драйвер поддерживает специфические для ClickHouse свойства, предоставляемые подлежащим [java client](/integrations/language-clients/java/client.md).
Где это возможно, методы будут возвращать `SQLFeatureNotSupportedException`, если функция не поддерживается. Другие пользовательские свойства включают:

| Свойство                           | Значение по умолчанию | Описание                                                    |
|------------------------------------|----------------------|-------------------------------------------------------------|
| `disable_frameworks_detection`     | `true`               | Отключить определение фреймов для User-Agent               |
| `jdbc_ignore_unsupported_values`   | `false`              | Подавляет `SQLFeatureNotSupportedException`                 |
| `clickhouse.jdbc.v1`               | `false`              | Использовать старую реализацию JDBC вместо новой JDBC       |
| `default_query_settings`           | `null`               | Позволяет передавать настройки запросов по умолчанию с операциями запросов |

## Поддерживаемые типы данных {#supported-data-types}

JDBC драйвер поддерживает те же форматы данных, что и подлежащий [java client](/integrations/language-clients/java/client.md).

### Обработка дат, времени и часовых поясов {#handling-dates-times-and-timezones}
`java.sql.Date`, `java.sql.Time` и `java.sql.Timestamp` могут усложнить расчет часовых поясов - хотя они, конечно, поддерживаются,
вы можете рассмотреть возможность использования пакета [java.time](https://docs.oracle.com/javase/8/docs/api/java/time/package-summary.html). `ZonedDateTime` и
`OffsetDateTime` являются отличными заменами для java.sql.Timestamp, java.sql.Date и java.sql.Time.

## Создание подключения {#creating-connection}

```java
String url = "jdbc:ch://my-server:8123/system";

Properties properties = new Properties();
DataSource dataSource = new DataSource(url, properties);//DataSource или DriverManager - главные точки входа
try (Connection conn = dataSource.getConnection()) {
... // что-то сделать с подключением
```

## Указание учетных данных и настроек {#supplying-credentials-and-settings}

```java showLineNumbers
String url = "jdbc:ch://localhost:8123?jdbc_ignore_unsupported_values=true&socket_timeout=10";

Properties info = new Properties();
info.put("user", "default");
info.put("password", "password");
info.put("database", "some_db");

//Создание подключения с DataSource
DataSource dataSource = new DataSource(url, info);
try (Connection conn = dataSource.getConnection()) {
... // что-то сделать с подключением
}

//Альтернативный подход с использованием DriverManager
try (Connection conn = DriverManager.getConnection(url, info)) {
... // что-то сделать с подключением
}
```

## Простой запрос {#simple-statement}

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
    ps.setObject(2, LocalDateTime.now()); // метка времени
    ps.addBatch();
    ...
    ps.executeBatch(); // потоковая отправка всех данных в ClickHouse
}
```

## `HikariCP` {#hikaricp}
    
```java showLineNumbers
// Пул соединений не поможет сильно в терминах производительности,
// так как подлежащая реализация имеет собственный пул.
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
        log.info("Integer: {}, String: {}", rs.getInt(1), rs.getString(1));//Один и тот же столбец, но разные типы
    }
}
```

## Дополнительная информация {#more-information}
Для получения дополнительной информации смотрите наш [репозиторий GitHub](https://github.com/ClickHouse/clickhouse-java) и [документацию Java Client](/integrations/language-clients/java/client.md).


## Устранение неполадок {#troubleshooting}
### Логирование {#logging}
Драйвер использует [slf4j](https://www.slf4j.org/) для логирования и будет использовать первое доступное исполнение в `classpath`.

### Устранение таймаутов JDBC при больших вставках {#resolving-jdbc-timeout-on-large-inserts}

При выполнении больших вставок в ClickHouse с длительным временем выполнения вы можете столкнуться с ошибками таймаута JDBC, такими как:

```plaintext
Caused by: java.sql.SQLException: Read timed out, server myHostname [uri=https://hostname.aws.clickhouse.cloud:8443]
```
Эти ошибки могут нарушить процесс вставки данных и повлиять на стабильность системы. Чтобы решить эту проблему, вам может понадобиться настроить несколько параметров таймаута в ОС клиента.

#### Mac OS {#mac-os}

В Mac OS следующие настройки могут быть изменены для решения этой проблемы:

- `net.inet.tcp.keepidle`: 60000
- `net.inet.tcp.keepintvl`: 45000
- `net.inet.tcp.keepinit`: 45000
- `net.inet.tcp.keepcnt`: 8
- `net.inet.tcp.always_keepalive`: 1

#### Linux {#linux}

На Linux эквивалентные настройки могут не решить проблему. Требуются дополнительные шаги из-за различий в том, как Linux обрабатывает настройки keep-alive для сокетов. Выполните следующие действия:

1. Измените следующие параметры ядра Linux в `/etc/sysctl.conf` или связанном файле конфигурации:

    - `net.inet.tcp.keepidle`: 60000
    - `net.inet.tcp.keepintvl`: 45000
    - `net.inet.tcp.keepinit`: 45000
    - `net.inet.tcp.keepcnt`: 8
    - `net.inet.tcp.always_keepalive`: 1
    - `net.ipv4.tcp_keepalive_intvl`: 75
    - `net.ipv4.tcp_keepalive_probes`: 9
    - `net.ipv4.tcp_keepalive_time`: 60 (вы можете рассмотреть возможность снижения этого значения с 300 секунд по умолчанию)

2. После изменения параметров ядра примените изменения, выполнив следующую команду:

```shell
sudo sysctl -p
```

После настройки этих параметров вы должны убедиться, что ваш клиент включает параметр Keep Alive в сокете:

```java
properties.setProperty("socket_keepalive", "true");
```
