---
title: 'Клиент (0.7.x и ранее)'
description: 'Java клиентская библиотека для взаимодействия с сервером БД через его протоколы.'
slug: /integrations/language-clients/java/client-v1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# Клиент (0.7.x и ранее)

Java клиентская библиотека для взаимодействия с сервером БД через его протоколы. Текущая реализация поддерживает только [HTTP интерфейс](/interfaces/http). Библиотека предоставляет собственный API для отправки запросов на сервер.

:::warning Устаревание
Эта библиотека будет вскоре устаревать. Используйте последнюю [Java Client](/integrations/language-clients/java/client.md) для новых проектов
:::

## Настройка {#setup}

<Tabs groupId="client-v1-setup">
<TabItem value="maven" label="Maven">

```xml
<!-- https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client -->
<dependency>
    <groupId>com.clickhouse</groupId>
    <artifactId>clickhouse-http-client</artifactId>
    <version>0.7.2</version>
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client
implementation("com.clickhouse:clickhouse-http-client:0.7.2")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client
implementation 'com.clickhouse:clickhouse-http-client:0.7.2'
```

</TabItem>
</Tabs>

Начиная с версии `0.5.0`, драйвер использует новую библиотеку клиентского http, которую необходимо добавить в качестве зависимости.

<Tabs groupId="client-v1-http-client">
<TabItem value="maven" label="Maven">

```xml
<!-- https://mvnrepository.com/artifact/org.apache.httpcomponents.client5/httpclient5 -->
<dependency>
    <groupId>org.apache.httpcomponents.client5</groupId>
    <artifactId>httpclient5</artifactId>
    <version>5.3.1</version>
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/org.apache.httpcomponents.client5/httpclient5
implementation("org.apache.httpcomponents.client5:httpclient5:5.3.1")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/org.apache.httpcomponents.client5/httpclient5
implementation 'org.apache.httpcomponents.client5:httpclient5:5.3.1'
```

</TabItem>
</Tabs>

## Инициализация {#initialization}

Формат URL-подключения: `protocol://host[:port][/database][?param[=value][&param[=value]][#tag[,tag]]`, например:

- `http://localhost:8443?ssl=true&sslmode=NONE`
- `https://(https://explorer@play.clickhouse.com:443`

Подключение к единственному узлу:

```java showLineNumbers
ClickHouseNode server = ClickHouseNode.of("http://localhost:8123/default?compress=0");
```
Подключение к кластеру с несколькими узлами:

```java showLineNumbers
ClickHouseNodes servers = ClickHouseNodes.of(
    "jdbc:ch:http://server1.domain,server2.domain,server3.domain/my_db"
    + "?load_balancing_policy=random&health_check_interval=5000&failover=2");
```

## API запросов {#query-api}

```java showLineNumbers
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers)
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("select * from numbers limit :limit")
        .params(1000)
        .executeAndWait()) {
            ClickHouseResponseSummary summary = response.getSummary();
            long totalRows = summary.getTotalRowsToRead();
}
```

## API стриминговых запросов {#streaming-query-api}

```java showLineNumbers
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers)
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("select * from numbers limit :limit")
        .params(1000)
        .executeAndWait()) {
            for (ClickHouseRecord r : response.records()) {
            int num = r.getValue(0).asInteger();
            // преобразование типов
            String str = r.getValue(0).asString();
            LocalDate date = r.getValue(0).asDate();
        }
}
```

Смотрите [полный пример кода](https://github.com/ClickHouse/clickhouse-java/blob/main/examples/client/src/main/java/com/clickhouse/examples/jdbc/Main.java#L73) в [репозитории](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client).

## API вставки {#insert-api}

```java showLineNumbers

try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers).write()
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("insert into my_table select c2, c3 from input('c1 UInt8, c2 String, c3 Int32')")
        .data(myInputStream) // `myInputStream` — источник данных в формате RowBinary
        .executeAndWait()) {
            ClickHouseResponseSummary summary = response.getSummary();
            summary.getWrittenRows();
}
```

Смотрите [полный пример кода](https://github.com/ClickHouse/clickhouse-java/blob/main/examples/client/src/main/java/com/clickhouse/examples/jdbc/Main.java#L39) в [репозитории](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client).

**Кодирование RowBinary**

Формат RowBinary описан на его [странице](/interfaces/formats#rowbinarywithnamesandtypes).

Есть пример [кода](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/main/src/main/java/com/clickhouse/kafka/connect/sink/db/ClickHouseWriter.java#L622).

## Особенности {#features}
### Сжатие {#compression}

Клиент по умолчанию будет использовать сжатие LZ4, для чего требуется эта зависимость:

<Tabs groupId="client-v1-compression-deps">
<TabItem value="maven" label="Maven" >

```xml
<!-- https://mvnrepository.com/artifact/org.lz4/lz4-java -->
<dependency>
    <groupId>org.lz4</groupId>
    <artifactId>lz4-java</artifactId>
    <version>1.8.0</version>
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/org.lz4/lz4-java
implementation("org.lz4:lz4-java:1.8.0")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/org.lz4/lz4-java
implementation 'org.lz4:lz4-java:1.8.0'
```

</TabItem>
</Tabs>

Вы можете выбрать использование gzip, установив `compress_algorithm=gzip` в URL-подключения.

Кроме того, вы можете отключить сжатие несколькими способами.

1. Отключите, установив `compress=0` в URL-подключения: `http://localhost:8123/default?compress=0`
2. Отключите через конфигурацию клиента:

```java showLineNumbers
ClickHouseClient client = ClickHouseClient.builder()
   .config(new ClickHouseConfig(Map.of(ClickHouseClientOption.COMPRESS, false)))
   .nodeSelector(ClickHouseNodeSelector.of(ClickHouseProtocol.HTTP))
   .build();
```

Смотрите [документацию по сжатию](/data-compression/compression-modes), чтобы узнать больше о различных вариантах сжатия.

### Множественные запросы {#multiple-queries}

Выполните несколько запросов в рабочем потоке один за другим в одной сессии:

```java showLineNumbers
CompletableFuture<List<ClickHouseResponseSummary>> future = ClickHouseClient.send(servers.apply(servers.getNodeSelector()),
    "create database if not exists my_base",
    "use my_base",
    "create table if not exists test_table(s String) engine=Memory",
    "insert into test_table values('1')('2')('3')",
    "select * from test_table limit 1",
    "truncate table test_table",
    "drop table if exists test_table");
List<ClickHouseResponseSummary> results = future.get();
```

### Именованные параметры {#named-parameters}

Вы можете передавать параметры по имени, а не полагаясь исключительно на их позицию в списке параметров. Эта возможность доступна с использованием функции `params`.

```java showLineNumbers
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers)
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("select * from my_table where name=:name limit :limit")
        .params("Ben", 1000)
        .executeAndWait()) {
            //...
        }
}
```

:::note Параметры
Все подписи `params`, содержащие тип `String` (`String`, `String[]`, `Map<String, String>`), предполагают, что переданные ключи являются действительными строками SQL ClickHouse. Например:

```java showLineNumbers
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers)
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("select * from my_table where name=:name")
        .params(Map.of("name","'Ben'"))
        .executeAndWait()) {
            //...
        }
}
```

Если вы предпочитаете не преобразовывать объекты String в SQL ClickHouse вручную, вы можете использовать вспомогательную функцию `ClickHouseValues.convertToSqlExpression`, расположенную в `com.clickhouse.data`:

```java showLineNumbers
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers)
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("select * from my_table where name=:name")
        .params(Map.of("name", ClickHouseValues.convertToSqlExpression("Ben's")))
        .executeAndWait()) {
            //...
        }
}
```

В приведенном выше примере `ClickHouseValues.convertToSqlExpression` экранирует внутреннюю одинарную кавычку и окружает переменную действительными одинарными кавычками.

Другие типы, такие как `Integer`, `UUID`, `Array` и `Enum`, будут автоматически преобразованы внутри `params`.
:::

## Обнаружение узлов {#node-discovery}

Java клиент предоставляет возможность автоматически обнаруживать узлы ClickHouse. Автообнаружение по умолчанию отключено. Чтобы вручную включить его, установите `auto_discovery` в `true`:

```java
properties.setProperty("auto_discovery", "true");
```

Или в URL-подключении:

```plaintext
jdbc:ch://my-server/system?auto_discovery=true
```

Если автообнаружение включено, нет необходимости указывать все узлы ClickHouse в URL-подключении. Узлы, указанные в URL, будут рассматриваться как начальные, а Java клиент автоматически обнаружит дополнительные узлы из системных таблиц и/или clickhouse-keeper или zookeeper.

Следующие параметры отвечают за конфигурацию автообнаружения:

| Свойство                | Значение по умолчанию | Описание                                                                                           |
|-------------------------|-----------------------|---------------------------------------------------------------------------------------------------|
| auto_discovery          | `false`               | Должен ли клиент обнаруживать дополнительные узлы из системных таблиц и/или clickhouse-keeper/zookeeper.  |
| node_discovery_interval | `0`                   | Интервал обнаружения узлов в миллисекундах, нулевое или отрицательное значение означает одноразовое обнаружение.             |
| node_discovery_limit    | `100`                 | Максимальное количество узлов, которые могут быть обнаружены за раз; нулевое или отрицательное значение означает отсутствие ограничения.           |

### Балансировка нагрузки {#load-balancing}

Java клиент выбирает узел ClickHouse для отправки запросов согласно политике балансировки нагрузки. В общем, политика балансировки нагрузки отвечает за следующие вещи:

1. Получение узла из управляемого списка узлов.
2. Управление статусом узла.
3. Опционально планирование фонового процесса для обнаружения узлов (если автообнаружение включено) и проведение проверки состояния.

Вот список опций для настройки балансировки нагрузки:

| Свойство              | Значение по умолчанию | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
|-----------------------|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| load_balancing_policy | `""`                  | Политика балансировки нагрузки может быть одной из: <li>`firstAlive` - запрос отправляется первому здоровому узлу из управляемого списка узлов</li><li>`random` - запрос отправляется на случайный узел из управляемого списка узлов</li><li>`roundRobin` - запрос отправляется каждому узлу из управляемого списка узлов по очереди.</li><li>полное имя класса, реализующего `ClickHouseLoadBalancingPolicy` - пользовательская политика балансировки нагрузки</li>Если не указано, запрос отправляется на первый узел из управляемого списка узлов |
| load_balancing_tags   | `""`                  | Теги балансировки нагрузки для фильтрации узлов. Запросы отправляются только на узлы, имеющие указанные теги                                                                                                                                                                                                                                                                                                                                                                                                      |
| health_check_interval | `0`                   | Интервал проверки состояния в миллисекундах, нулевое или отрицательное значение означает одноразовую проверку.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| health_check_method   | `ClickHouseHealthCheckMethod.SELECT_ONE`  | Метод проверки состояния. Может быть одним из: <li>`ClickHouseHealthCheckMethod.SELECT_ONE` - проверка с помощью запроса `select 1`</li> <li>`ClickHouseHealthCheckMethod.PING` - специфическая для протокола проверка, которая обычно быстрее</li>                                                                                                                                                                                                                                                                                          |
| node_check_interval   | `0`                   | Интервал проверки узлов в миллисекундах, отрицательное число рассматривается как ноль. Статус узла проверяется, если прошло указанное количество времени с момента последней проверки.<br/>Разница между `health_check_interval` и `node_check_interval` в том, что опция `health_check_interval` планирует фоновую работу, которая проверяет состояние для списка узлов (всех или неисправных), а `node_check_interval` определяет количество времени, прошедшего с момента последней проверки конкретного узла                |
| check_all_nodes       | `false`               | Следует ли выполнять проверку состояния для всех узлов или только для неисправных.                                                                                                                                                                                                                                                                                                                                                                                                                                         |

### Перезапуск и повторная попытка {#failover-and-retry}

Java клиент предоставляет параметры конфигурации для настройки поведения перезапуска и повторной попытки для неудавшихся запросов:

| Свойство                | Значение по умолчанию | Описание                                                                                                                                                                                                                        |
|-------------------------|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| failover                | `0`                   | Максимальное количество раз, когда может произойти перезапуск для запроса. Нулевое или отрицательное значение означает отсутствие перезапуска. Перезапуск отправляет неудавшийся запрос на другой узел (в соответствии с политикой балансировки нагрузки), чтобы восстановить выполнение после сбоя. |
| retry                   | `0`                   | Максимальное количество раз, когда может произойти повторная попытка для запроса. Нулевое или отрицательное значение означает отсутствие повторных попыток. Повторная попытка отправляет запрос на тот же узел и только в том случае, если сервер ClickHouse возвращает код ошибки `NETWORK_ERROR`                               |
| repeat_on_session_lock  | `true`                | Следует ли повторять выполнение, когда сессия заблокирована до истечения времени ожидания (в соответствии с `session_timeout` или `connect_timeout`). Неудавшийся запрос повторяется, если сервер ClickHouse возвращает код ошибки `SESSION_IS_LOCKED`               |

### Добавление пользовательских http заголовков {#adding-custom-http-headers}

Java клиент поддерживает HTTP/S уровень транспортировки, если мы хотим добавить пользовательские HTTP заголовки к запросу.
Мы должны использовать свойство custom_http_headers, а заголовки должны разделяться `,`. Ключ/значение заголовка должны разделяться с помощью `=`

## Поддержка Java Client {#java-client-support}

```java
options.put("custom_http_headers", "X-ClickHouse-Quota=test, X-ClickHouse-Test=test");
```

## JDBC Драйвер {#jdbc-driver}

```java
properties.setProperty("custom_http_headers", "X-ClickHouse-Quota=test, X-ClickHouse-Test=test");
```
