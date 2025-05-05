---
sidebar_label: 'Клиент 0.8+'
sidebar_position: 2
keywords: ['clickhouse', 'java', 'клиент', 'интеграция']
description: 'Java ClickHouse Коннектор 0.8+'
slug: /integrations/language-clients/java/client
title: 'Java Клиент (0.8+)'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# Java Клиент (0.8+)

Java клиентская библиотека для взаимодействия с сервером БД через его протоколы. Текущая реализация поддерживает только [HTTP интерфейс](/interfaces/http). 
Библиотека предоставляет собственный API для отправки запросов на сервер. Она также предоставляет инструменты для работы с различными двоичными форматами данных (RowBinary* и Native*).  

:::note
Если вам нужна предыдущая версия документации по клиенту java, пожалуйста, смотрите [здесь](/integrations/language-clients/java/client-v1.md).
:::
## Настройка {#setup}

- Maven Central (веб-страница проекта): https://mvnrepository.com/artifact/com.clickhouse/client-v2
- Ночные сборки (ссылка на репозиторий): https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/

<Tabs groupId="client-setup">
<TabItem value="maven" label="Maven" >

```xml 
<dependency>
    <groupId>com.clickhouse</groupId>
    <artifactId>client-v2</artifactId>
    <version>0.8.2</version>
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/com.clickhouse/client-v2
implementation("com.clickhouse:client-v2:0.8.2")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/com.clickhouse/client-v2
implementation 'com.clickhouse:client-v2:0.8.2'
```

</TabItem>
</Tabs>
## Инициализация {#initialization}

Объект Client инициализируется с помощью `com.clickhouse.client.api.Client.Builder#build()`. Каждый клиент имеет свой собственный контекст, и объекты не разделяются между ними.
Строитель имеет методы конфигурации для удобной настройки. 

Пример: 
```java showLineNumbers
 Client client = new Client.Builder()
                .addEndpoint("https://clickhouse-cloud-instance:8443/")
                .setUsername(user)
                .setPassword(password)
                .build();
```

`Client` является `AutoCloseable` и должен быть закрыт, когда больше не нужен.
### Аутентификация {#authentication}

Аутентификация настраивается для каждого клиента на этапе инициализации. Поддерживаются три метода аутентификации: по паролю, по токену доступа, по SSL клиентскому сертификату. 

Аутентификация по паролю требует установки имени пользователя и пароля с помощью `setUsername(String)` и `setPassword(String)`: 
```java showLineNumbers
 Client client = new Client.Builder()
        .addEndpoint("https://clickhouse-cloud-instance:8443/")
        .setUsername(user)
        .setPassword(password)
        .build();
```

Аутентификация по токену доступа требует установки токена доступа с помощью `setAccessToken(String)`:
```java showLineNumbers
 Client client = new Client.Builder()
        .addEndpoint("https://clickhouse-cloud-instance:8443/")
        .setAccessToken(userAccessToken)
        .build();
```

Аутентификация по SSL клиентскому сертификату требует установки имени пользователя, включения SSL аутентификации, установки клиентского сертификата и клиентского ключа с помощью `setUsername(String)`, `useSSLAuthentication(boolean)`, `setClientCertificate(String)` и `setClientKey(String)` соответственно: 
```java showLineNumbers
Client client = new Client.Builder()
        .useSSLAuthentication(true)
        .setUsername("some_user")
        .setClientCertificate("some_user.crt")
        .setClientKey("some_user.key")
```

:::note
SSL аутентификация может быть трудно отлаживать в производственных условиях, так как многие ошибки из библиотек SSL предоставляют недостаточно информации. Например, если клиентский сертификат и ключ не совпадают, сервер немедленно завершит соединение (в случае HTTP это произойдет на этапе инициации соединения, когда HTTP-запросы еще не отправлены, соответственно, ответ не будет получен).

Пожалуйста, используйте инструменты, такие как [openssl](https://docs.openssl.org/master/man1/openssl/), для проверки сертификатов и ключей: 
- проверьте целостность ключа: `openssl rsa -in [key-file.key] -check -noout`
- проверьте, что клиентский сертификат имеет совпадающий CN для пользователя:
    - получите CN из сертификата пользователя: `openssl x509 -noout -subject -in [user.cert]`
    - проверьте, что то же значение установлено в базе данных: `select name, auth_type, auth_params from system.users where auth_type = 'ssl_certificate'` (запрос выведет `auth_params` с чем-то вроде `{"common_names":["some_user"]}`) 

:::
## Конфигурация {#configuration}

Все настройки определяются экземплярными методами (также известными как методы конфигурации), которые делают область и контекст каждого значения ясными. 
Основные параметры конфигурации определяются в одной области (клиент или операция) и не переопределяют друг друга.

Конфигурация определяется во время создания клиента. См. `com.clickhouse.client.api.Client.Builder`.
## Конфигурация клиента {#client-configuration}

| Метод конфигурации                       | Аргументы                                         |  Описание                                  |
|------------------------------------------|:--------------------------------------------------|:-------------------------------------------|
| `addEndpoint(String endpoint)`           | - `enpoint` - URL-формат адреса сервера.         | Добавляет конечную точку сервера в список доступных серверов. В настоящее время поддерживается только одна конечная точка. |
| `addEndpoint(Protocol protocol, String host, int port, boolean secure)` | - `protocol` - протокол подключения `com.clickhouse.client.api.enums.Protocol#HTTP`.<br />- `host` - IP-адрес или имя хоста сервера.<br />- `secure` - если связь должна использовать защищенную версию протокола (HTTPS) | Добавляет конечную точку сервера в список доступных серверов. В настоящее время поддерживается только одна конечная точка. |
| `setOption(String key, String value)`    | - `key` - строковой ключ параметра конфигурации клиента.<br /> - `value` - строковое значение параметра | Устанавливает необработанное значение параметров клиента. Полезно при чтении конфигурации из файлов свойств. | 
| `setUsername(String username)`           | - `username` - Имя пользователя для аутентификации | Устанавливает имя пользователя для метода аутентификации, выбранного дальнейшей конфигурацией | 
| `setPassword(String password)`           | - `password` - секретное значение для аутентификации по паролю | Устанавливает секрет для аутентификации по паролю и эффективно выбирает его в качестве метода аутентификации |
| `setAccessToken(String accessToken)`     | - `accessToken` - строковое представление токена доступа | Устанавливает токен доступа для аутентификации с установленным соответствующим методом аутентификации |
| `useSSLAuthentication(boolean useSSLAuthentication)` | - `useSSLAuthentication` - флаг, который указывает, нужно ли использовать SSL аутентификацию | Устанавливает SSL клиентский сертификат в качестве метода аутентификации | 
| `enableConnectionPool(boolean enable)`   | - `enable` - флаг, который указывает, нужно ли включать опцию | Устанавливает, включен ли пул соединений | 
| `setConnectTimeout(long timeout, ChronoUnit unit)` | - `timeout` - таймаут в некоторой единице времени.<br /> - `unit` - единица времени для `timeout` | Устанавливает таймаут инициации соединения для любого исходящего соединения. Это влияет на время ожидания соединения сокета. |
| `setConnectionRequestTimeout(long timeout, ChronoUnit unit)` | - `timeout` - таймаут в некоторой единице времени.<br /> - `unit` - единица времени для `timeout` | Устанавливает таймаут для запроса соединения. Это имеет эффект только при получении соединения из пула. | 
| `setMaxConnections(int maxConnections)`  | - `maxConnections` - количество соединений | Устанавливает, сколько соединений клиент может открыть к каждой конечной точке сервера. | 
| `setConnectionTTL(long timeout, ChronoUnit unit)` | - `timeout` - таймаут в некоторой единице времени.<br /> - `unit` - единица времени для `timeout` | Устанавливает срок жизни соединения (TTL), после которого соединение будет считаться неактивным |
| `setKeepAliveTimeout(long timeout, ChronoUnit unit)` | - `timeout` - таймаут в некоторой единице времени.<br /> - `unit` - единица времени для `timeout` | Устанавливает таймаут keep-alive для HTTP соединения. Эта опция может быть использована для отключения Keep-Alive, установив таймаут в ноль - `0` |
| `setConnectionReuseStrategy(ConnectionReuseStrategy strategy)` | - `strategy` - перечисление `com.clickhouse.client.api.ConnectionReuseStrategy` | Выбирает, какую стратегию должен использовать пул соединений: `LIFO`, если соединение должно быть повторно использовано, как только оно возвращается в пул, или `FIFO`, чтобы использовать соединение по порядку, когда они становятся доступными (возвращенные соединения не используются немедленно). |
| `setSocketTimeout(long timeout, ChronoUnit unit)` | - `timeout` - таймаут в некоторой единице времени.<br /> - `unit` - единица времени для `timeout` | Устанавливает таймаут сокета, который влияет на операции чтения и записи | 
| `setSocketRcvbuf(long size)`             | - `size` - размер в байтах | Устанавливает размер буфера приема TCP сокета. Этот буфер выходит за пределы памяти JVM. |
| `setSocketSndbuf(long size)`             | - `size` - размер в байтах | Устанавливает размер буфера передачи TCP сокета. Этот буфер выходит за пределы памяти JVM. |
| `setSocketKeepAlive(boolean value)`      | - `value` - флаг, который указывает, нужно ли включать опцию. | Устанавливает опцию `SO_KEEPALIVE` для каждого TCP сокета, создаваемого клиентом. TCP Keep Alive включает механизм, который проверяет активность соединения и помогает обнаруживать внезапно прерванные соединения. | 
| `setSocketTcpNodelay(boolean value)`     | - `value` - флаг, который указывает, нужно ли включать опцию. | Устанавливает опцию `SO_NODELAY` для каждого TCP сокета, создаваемого клиентом. Эта TCP опция заставляет сокет отправлять данные как можно быстрее. |
| `setSocketLinger(int secondsToWait)`     | - `secondsToWait` - количество секунд. | Устанавливает время ожидания для каждого TCP сокета, создаваемого клиентом. |
| `compressServerResponse(boolean enabled)` | - `enabled` - флаг, который указывает, нужно ли включать опцию | Устанавливает, должен ли сервер сжимать свои ответы. | 
| `compressClientRequest(boolean enabled)`  | - `enabled` - флаг, который указывает, нужно ли включать опцию | Устанавливает, должен ли клиент сжимать свои запросы. |
| `useHttpCompression(boolean enabled)`    | - `enabled` - флаг, который указывает, нужно ли включать опцию | Устанавливает, следует ли использовать HTTP сжатие для взаимодействия между клиентом и сервером, если соответствующие опции включены | 
| `setLZ4UncompressedBufferSize(int size)`  | - `size` - размер в байтах | Устанавливает размер буфера, который будет принимать несжатую часть потока данных. Если буфер недооценен, будет создан новый, и соответствующее предупреждение будет присутствовать в логах. | 
| `setDefaultDatabase(String database)`     | - `database` - имя базы данных | Устанавливает базу данных по умолчанию. |
| `addProxy(ProxyType type, String host, int port)` | - `type` - тип прокси.<br /> - `host` - имя хоста прокси или IP-адрес.<br /> - `port` - порт прокси | Устанавливает прокси для использования для связи с сервером. Установка прокси обязательна, если прокси требует аутентификации. |
| `setProxyCredentials(String user, String pass)` | - `user` - имя пользователя прокси.<br /> - `pass` - пароль | Устанавливает учетные данные пользователя для аутентификации с прокси. |
| `setExecutionTimeout(long timeout, ChronoUnit timeUnit)` | - `timeout` - таймаут в некоторой единице времени.<br /> - `timeUnit` - единица времени для `timeout` | Устанавливает максимальный таймаут выполнения для запросов |
| `setHttpCookiesEnabled(boolean enabled)`  | - `enabled` - флаг, который указывает, нужно ли включать опцию | Устанавливает, должны ли HTTP куки запоминаться и отправляться обратно на сервер. |
| `setSSLTrustStore(String path)`           | - `path` - путь к файлу на локальной (клиентской) системе | Устанавливает, должен ли клиент использовать SSL truststore для проверки действительности хоста сервера. | 
| `setSSLTrustStorePassword(String password)` | - `password` - секретное значение | Устанавливает пароль для разблокировки SSL truststore, указанный в `setSSLTrustStore(String path)` |
| `setSSLTrustStoreType(String type)`      | - `type` - имя типа truststore | Устанавливает тип truststore, указанный в `setSSLTrustStore(String path)`. | 
| `setRootCertificate(String path)`         | - `path` - путь к файлу на локальной (клиентской) системе | Устанавливает, должен ли клиент использовать указанный корневой (CA) сертификат для проверки действительности хоста сервера. |
| `setClientCertificate(String path)`       | - `path` - путь к файлу на локальной (клиентской) системе | Устанавливает путь к клиентскому сертификату, который будет использоваться при инициации SSL соединения и для аутентификации по SSL |
| `setClientKey(String path)`               | - `path` - путь к файлу на локальной (клиентской) системе | Устанавливает закрытый ключ клиента, который будет использоваться для шифрования SSL связи с сервером. |
| `useServerTimeZone(boolean useServerTimeZone)` | - `useServerTimeZone` - флаг, который указывает, нужно ли включать опцию | Устанавливает, должен ли клиент использовать временную зону сервера при декодировании значений столбцов DateTime и Date. Если включено, то временная зона сервера должна быть установлена с помощью `setServerTimeZone(String timeZone)` | 
| `useTimeZone(String timeZone)`            | - `timeZone` - строковое значение действительного идентификатора временной зоны java (см. `java.time.ZoneId`) | Устанавливает, должна ли использоваться указанная временная зона при декодировании значений столбцов DateTime и Date. Перекрывает временную зону сервера |
| `setServerTimeZone(String timeZone)`      | - `timeZone` - строковое значение действительного идентификатора временной зоны java (см. `java.time.ZoneId`) | Устанавливает временную зону на стороне сервера. По умолчанию будет использована временная зона UTC. | 
| `useAsyncRequests(boolean async)`         | - `async` - флаг, который указывает, нужно ли включать опцию. | Устанавливает, должен ли клиент выполнять запрос в отдельном потоке. По умолчанию отключено, так как приложение лучше знает, как организовать многопоточные задачи, и запуск задач в отдельном потоке не помогает с производительностью. | 
| `setSharedOperationExecutor(ExecutorService executorService)` | - `executorService` - экземпляр службы исполнителя. | Устанавливает службу исполнителя для операционных задач. | 
| `setClientNetworkBufferSize(int size)`    | - `size` - размер в байтах | Устанавливает размер буфера в пространстве памяти приложения, который используется для копирования данных между сокетом и приложением. Увеличение размера уменьшает количество системных вызовов к стеку TCP, но влияет на количество памяти, выделяемой для каждого соединения. Этот буфер также подлежит сбору мусора, поскольку соединения недолговечны. Также необходимо учитывать, что выделение большого непрерывного блока памяти может быть проблемой. По умолчанию `300,000` байт. |
| `retryOnFailures(ClientFaultCause ...causes)` | - `causes` - перечисление `com.clickhouse.client.api.ClientFaultCause` | Устанавливает типы сбоев, которые могут быть восстановлены/попробованы повторно. | 
| `setMaxRetries(int maxRetries)`          | - `maxRetries` - количество повторных попыток | Устанавливает максимальное количество повторных попыток для сбоев, определённых с помощью `retryOnFailures(ClientFaultCause ...causes)` | 
| `allowBinaryReaderToReuseBuffers(boolean reuse)` | - `reuse` - флаг, который указывает, нужно ли включать опцию | Большинство наборов данных содержат числовые данные, закодированные в виде небольших последовательностей байтов. По умолчанию считыватель будет выделять необходимый буфер, считывать данные в него, а затем преобразовывать в целевой класс Number. Это может вызвать значительное давление на сборщик мусора из-за большого количества выделяемых и освобождаемых объектов. Если эта опция включена, считыватель будет использовать предвыделенные буферы для преобразования чисел. Это безопасно, так как каждый считыватель имеет свой собственный набор буферов, и считыватели используются в одном потоке. |
| `httpHeader(String key, String value)`   | - `key` - ключ HTTP заголовка.<br /> - `value` - строковое значение заголовка. | Устанавливает значение для одного HTTP заголовка. Предыдущее значение заменяется. |
| `httpHeader(String key, Collection values)` | - `key` - ключ HTTP заголовка.<br /> - `values` - список строковых значений. | Устанавливает значения для одного HTTP заголовка. Предыдущее значение заменяется. |
| `httpHeaders(Map headers)`                | - `header` - карта с HTTP заголовками и их значениями. | Устанавливает несколько значений HTTP заголовков одновременно. |
| `serverSetting(String name, String value)` | - `name` - имя настройки на уровне запроса.<br /> - `value` - строковое значение настройки. | Устанавливает, какие настройки передавать на сервер вместе с каждым запросом. Индивидуальные параметры операции могут их переопределить. [Список настроек](/operations/settings/query-level) | 
| `serverSetting(String name,  Collection values)` | - `name` - имя настройки на уровне запроса.<br /> - `values` - строковые значения настройки. | Устанавливает, какие настройки передавать на сервер вместе с каждым запросом. Индивидуальные параметры операции могут их переопределить. [Список настроек](/operations/settings/query-level). Этот метод полезен для установки настроек с несколькими значениями, например [роли](/interfaces/http#setting-role-with-query-parameters) |
| `columnToMethodMatchingStrategy(ColumnToMethodMatchingStrategy strategy)` | - `strategy` - реализация стратегии соответствия столбца и метода | Устанавливает пользовательскую стратегию, которая будет использована для соответствия полей класса DTO и столбцов базы данных при регистрации DTO. | 
| `useHTTPBasicAuth(boolean useBasicAuth)`  | - `useBasicAuth` - флаг, который указывает, нужно ли включать опцию | Устанавливает, должна ли использоваться базовая HTTP аутентификация для аутентификации по имени пользователя и паролю. По умолчанию включена. Использование этого типа аутентификации решает проблемы с паролями, содержащими специальные символы, которые не могут быть переданы через HTTP заголовки. |
| `setClientName(String clientName)`       | - `clientName` - строка, представляющая имя приложения | Устанавливает дополнительную информацию о вызываемом приложении. Эта строка будет передана на сервер в качестве имени клиента. В случае протокола HTTP она будет передана как заголовок `User-Agent`. |
| `useBearerTokenAuth(String bearerToken)` | - `bearerToken` - закодированный токен носителя | Указывает, следует ли использовать аутентификацию на основе носителя и какой токен использовать. Токен будет отправлен как есть, поэтому его следует закодировать перед передачей в этот метод. |
## Общие определения {#common-definitions}
### ClickHouseFormat {#clickhouseformat}

Перечисление [поддерживаемых форматов](/interfaces/formats). Включает все форматы, которые поддерживает ClickHouse. 

* `raw` - пользователь должен перекодировать сырые данные 
* `full` - клиент может самостоятельно перекодировать данные и принимает сырое поток данных
* `-` - операция не поддерживается ClickHouse для этого формата

Эта версия клиента поддерживает:

| Формат                                                                                                                       | Вход  | Выход  |
|------------------------------------------------------------------------------------------------------------------------------|:-----:|:------:|
| [TabSeparated](/interfaces/formats#tabseparated)                                                                          | raw   | raw    |
| [TabSeparatedRaw](/interfaces/formats#tabseparatedraw)                                                                    | raw   | raw    |
| [TabSeparatedWithNames](/interfaces/formats#tabseparatedwithnames)                                                        | raw   | raw    |
| [TabSeparatedWithNamesAndTypes](/interfaces/formats#tabseparatedwithnamesandtypes)                                        | raw   | raw    |
| [TabSeparatedRawWithNames](/interfaces/formats#tabseparatedrawwithnames)                                                  | raw   | raw    |
| [TabSeparatedRawWithNamesAndTypes](/interfaces/formats#tabseparatedrawwithnamesandtypes)                                  | raw   | raw    |
| [Template](/interfaces/formats#format-template)                                                                            | raw   | raw    |
| [TemplateIgnoreSpaces](/interfaces/formats#templateignorespaces)                                                          | raw   | -      |
| [CSV](/interfaces/formats#csv)                                                                                           | raw   | raw    |
| [CSVWithNames](/interfaces/formats#csvwithnames)                                                                         | raw   | raw    |
| [CSVWithNamesAndTypes](/interfaces/formats#csvwithnamesandtypes)                                                         | raw   | raw    |
| [CustomSeparated](/interfaces/formats#format-customseparated)                                                            | raw   | raw    |
| [CustomSeparatedWithNames](/interfaces/formats#customseparatedwithnames)                                                  | raw   | raw    |
| [CustomSeparatedWithNamesAndTypes](/interfaces/formats#customseparatedwithnamesandtypes)                                  | raw   | raw    |
| [SQLInsert](/interfaces/formats#sqlinsert)                                                                                | -     | raw    |
| [Values](/interfaces/formats#data-format-values)                                                                          | raw   | raw    |
| [Vertical](/interfaces/formats#vertical)                                                                                 | -     | raw    |
| [JSON](/interfaces/formats#json)                                                                                         | raw   | raw    |
| [JSONAsString](/interfaces/formats#jsonasstring)                                                                         | raw   | -      |
| [JSONAsObject](/interfaces/formats#jsonasobject)                                                                         | raw   | -      |
| [JSONStrings](/interfaces/formats#jsonstrings)                                                                           | raw   | raw    |
| [JSONColumns](/interfaces/formats#jsoncolumns)                                                                           | raw   | raw    |
| [JSONColumnsWithMetadata](/interfaces/formats#jsoncolumnsmonoblock)                                                       | raw   | raw    |
| [JSONCompact](/interfaces/formats#jsoncompact)                                                                           | raw   | raw    |
| [JSONCompactStrings](/interfaces/formats#jsoncompactstrings)                                                             | -     | raw    |
| [JSONCompactColumns](/interfaces/formats#jsoncompactcolumns)                                                             | raw   | raw    |
| [JSONEachRow](/interfaces/formats#jsoneachrow)                                                                           | raw   | raw    |
| [PrettyJSONEachRow](/interfaces/formats#prettyjsoneachrow)                                                               | -     | raw    |
| [JSONEachRowWithProgress](/interfaces/formats#jsoneachrowwithprogress)                                                   | -     | raw    |
| [JSONStringsEachRow](/interfaces/formats#jsonstringseachrow)                                                             | raw   | raw    |
| [JSONStringsEachRowWithProgress](/interfaces/formats#jsonstringseachrowwithprogress)                                     | -     | raw    |
| [JSONCompactEachRow](/interfaces/formats#jsoncompacteachrow)                                                             | raw   | raw    |
| [JSONCompactEachRowWithNames](/interfaces/formats#jsoncompacteachrowwithnames)                                           | raw   | raw    |
| [JSONCompactEachRowWithNamesAndTypes](/interfaces/formats#jsoncompacteachrowwithnamesandtypes)                           | raw   | raw    |
| [JSONCompactStringsEachRow](/interfaces/formats#jsoncompactstringseachrow)                                               | raw   | raw    |
| [JSONCompactStringsEachRowWithNames](/interfaces/formats#jsoncompactstringseachrowwithnames)                             | raw   | raw    |
| [JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats#jsoncompactstringseachrowwithnamesandtypes)             | raw   | raw    |
| [JSONObjectEachRow](/interfaces/formats#jsonobjecteachrow)                                                               | raw   | raw    |
| [BSONEachRow](/interfaces/formats#bsoneachrow)                                                                           | raw   | raw    |
| [TSKV](/interfaces/formats#tskv)                                                                                         | raw   | raw    |
| [Pretty](/interfaces/formats#pretty)                                                                                     | -     | raw    |
| [PrettyNoEscapes](/interfaces/formats#prettynoescapes)                                                                   | -     | raw    |
| [PrettyMonoBlock](/interfaces/formats#prettymonoblock)                                                                   | -     | raw    |
| [PrettyNoEscapesMonoBlock](/interfaces/formats#prettynoescapesmonoblock)                                               | -     | raw    |
| [PrettyCompact](/interfaces/formats#prettycompact)                                                                       | -     | raw    |
| [PrettyCompactNoEscapes](/interfaces/formats#prettycompactnoescapes)                                                     | -     | raw    |
| [PrettyCompactMonoBlock](/interfaces/formats#prettycompactmonoblock)                                                     | -     | raw    |
| [PrettyCompactNoEscapesMonoBlock](/interfaces/formats#prettycompactnoescapesmonoblock)                                   | -     | raw    |
| [PrettySpace](/interfaces/formats#prettyspace)                                                                           | -     | raw    |
| [PrettySpaceNoEscapes](/interfaces/formats#prettyspacenoescapes)                                                        | -     | raw    |
| [PrettySpaceMonoBlock](/interfaces/formats#prettyspacemonoblock)                                                        | -     | raw    |
| [PrettySpaceNoEscapesMonoBlock](/interfaces/formats#prettyspacenoescapesmonoblock)                                      | -     | raw    |
| [Prometheus](/interfaces/formats#prometheus)                                                                             | -     | raw    |
| [Protobuf](/interfaces/formats#protobuf)                                                                                 | raw   | raw    |
| [ProtobufSingle](/interfaces/formats#protobufsingle)                                                                     | raw   | raw    |
| [ProtobufList](/interfaces/formats#protobuflist)                                                                         | raw   | raw    |
| [Avro](/interfaces/formats#data-format-avro)                                                                             | raw   | raw    |
| [AvroConfluent](/interfaces/formats#data-format-avro-confluent)                                                          | raw   | -      |
| [Parquet](/interfaces/formats#data-format-parquet)                                                                       | raw   | raw    |
| [ParquetMetadata](/interfaces/formats#data-format-parquet-metadata)                                                      | raw   | -      |
| [Arrow](/interfaces/formats#data-format-arrow)                                                                           | raw   | raw    |
| [ArrowStream](/interfaces/formats#data-format-arrow-stream)                                                              | raw   | raw    |
| [ORC](/interfaces/formats#data-format-orc)                                                                               | raw   | raw    |
| [One](/interfaces/formats#data-format-one)                                                                               | raw   | -      |
| [Npy](/interfaces/formats#data-format-npy)                                                                               | raw   | raw    |
| [RowBinary](/interfaces/formats#rowbinary)                                                                               | full  | full   |
| [RowBinaryWithNames](/interfaces/formats#rowbinarywithnamesandtypes)                                                     | full  | full   |
| [RowBinaryWithNamesAndTypes](/interfaces/formats#rowbinarywithnamesandtypes)                                            | full  | full   |
| [RowBinaryWithDefaults](/interfaces/formats#rowbinarywithdefaults)                                                       | full  | -      |
| [Native](/interfaces/formats#native)                                                                                     | full  | raw    |
| [Null](/interfaces/formats#null)                                                                                         | -     | raw    |
| [XML](/interfaces/formats#xml)                                                                                           | -     | raw    |
| [CapnProto](/interfaces/formats#capnproto)                                                                               | raw   | raw    |
| [LineAsString](/interfaces/formats#lineasstring)                                                                         | raw   | raw    |
| [Regexp](/interfaces/formats#data-format-regexp)                                                                         | raw   | -      |
| [RawBLOB](/interfaces/formats#rawblob)                                                                                   | raw   | raw    |
| [MsgPack](/interfaces/formats#msgpack)                                                                                   | raw   | raw    |
| [MySQLDump](/interfaces/formats#mysqldump)                                                                               | raw   | -      |
| [DWARF](/interfaces/formats#dwarf)                                                                                       | raw   | -      |
| [Markdown](/interfaces/formats#markdown)                                                                                 | -     | raw    |
| [Form](/interfaces/formats#form)                                                                                         | raw   | -      |
## API вставки {#insert-api}
```
### insert(String tableName, InputStream data, ClickHouseFormat format) {#insertstring-tablename-inputstream-data-clickhouseformat-format}

Принимает данные в виде `InputStream` байтов в указанном формате. Ожидается, что `data` закодирована в `format`.

**Сигнатуры**

```java
CompletableFuture<InsertResponse> insert(String tableName, InputStream data, ClickHouseFormat format, InsertSettings settings)
CompletableFuture<InsertResponse> insert(String tableName, InputStream data, ClickHouseFormat format)
```

**Параметры**

`tableName` - имя целевой таблицы.

`data` - входной поток закодированных данных.

`format` - формат, в котором данные закодированы.

`settings` - настройки запроса.

**Возвращаемое значение**

Future типа `InsertResponse` - результат операции и дополнительная информация, такая как метрики со стороны сервера.

**Примеры**

```java showLineNumbers
try (InputStream dataStream = getDataStream()) {
    try (InsertResponse response = client.insert(TABLE_NAME, dataStream, ClickHouseFormat.JSONEachRow,
            insertSettings).get(3, TimeUnit.SECONDS)) {

        log.info("Insert finished: {} rows written", response.getMetrics().getMetric(ServerMetrics.NUM_ROWS_WRITTEN).getLong());
    } catch (Exception e) {
        log.error("Failed to write JSONEachRow data", e);
        throw new RuntimeException(e);
    }
}
```

### insert(String tableName, List&lt;?> data, InsertSettings settings) {#insertstring-tablename-listlt-data-insertsettings-settings}

Отправляет запрос на запись в базу данных. Список объектов конвертируется в эффективный формат и затем отправляется на сервер. Класс элементов списка должен быть зарегистрирован заранее с помощью метода `register(Class, TableSchema)`.

**Сигнатуры**
```java
client.insert(String tableName, List<?> data, InsertSettings settings)
client.insert(String tableName, List<?> data)
```

**Параметры**

`tableName` - имя целевой таблицы.

`data` - коллекция объектов DTO (Объект передачи данных).

`settings` - настройки запроса.

**Возвращаемое значение**

Future типа `InsertResponse` - результат операции и дополнительная информация, такая как метрики со стороны сервера.

**Примеры**

```java showLineNumbers
// Важный шаг (выполняется один раз) - регистрация класса для предкомпиляции сериализатора объекта в соответствии со схемой таблицы. 
client.register(ArticleViewEvent.class, client.getTableSchema(TABLE_NAME));

List<ArticleViewEvent> events = loadBatch();

try (InsertResponse response = client.insert(TABLE_NAME, events).get()) {
    // обработать ответ, затем он будет закрыт, и соединение, которое обслуживало запрос, будет освобождено. 
}
```

### InsertSettings {#insertsettings}

Настройки конфигурации для операций вставки.

**Методы конфигурации**

| Метод                                                   | Описание                                                                                                               |
|--------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| `setQueryId(String queryId)`                           | Устанавливает идентификатор запроса, который будет присвоен операции. По умолчанию: `null`.                          |
| `setDeduplicationToken(String token)`                  | Устанавливает токен дедупликации. Этот токен будет отправлен на сервер и может использоваться для идентификации запроса. По умолчанию: `null`. |
| `setInputStreamCopyBufferSize(int size)`               | Размер буфера копирования. Буфер используется во время операций записи для копирования данных из пользовательского входного потока в выходной поток. По умолчанию: `8196`. |
| `serverSetting(String name, String value)`             | Устанавливает отдельные настройки сервера для операции.                                                               |
| `serverSetting(String name, Collection values)`        | Устанавливает отдельные настройки сервера с несколькими значениями для операции. Элементы коллекции должны быть строковыми значениями. |
| `setDBRoles(Collection dbRoles)`                       | Устанавливает роли базы данных, которые должны быть установлены перед выполнением операции. Элементы коллекции должны быть строковыми значениями. |
| `setOption(String option, Object value)`               | Устанавливает конфигурационную опцию в сыром формате. Это не настройка сервера.                                     |

### InsertResponse {#insertresponse}

Объект ответа, который содержит результат операции вставки. Он доступен только в том случае, если клиент получил ответ от сервера.

:::note
Этот объект должен быть закрыт как можно скорее, чтобы освободить соединение, так как соединение не может быть повторно использовано, пока все данные предыдущего ответа не будут полностью прочитаны.
:::

| Метод                                  | Описание                                                                                          |
|----------------------------------------|--------------------------------------------------------------------------------------------------|
| `OperationMetrics getMetrics()`        | Возвращает объект с метриками операции.                                                          |
| `String getQueryId()`                 | Возвращает идентификатор запроса, присвоенный операции приложением (через настройки операции или сервером). |

## Query API {#query-api}
### query(String sqlQuery) {#querystring-sqlquery}

Отправляет `sqlQuery` как есть. Формат ответа задается настройками запроса. `QueryResponse` будет хранить ссылку на поток ответа, который должен быть обработан читателем для поддерживаемого формата.

**Сигнатуры**

```java 
CompletableFuture<QueryResponse> query(String sqlQuery, QuerySettings settings)
CompletableFuture<QueryResponse> query(String sqlQuery)
```

**Параметры**

`sqlQuery` - одно SQL выражение. Запрос отправляется как есть на сервер.

`settings` - настройки запроса.

**Возвращаемое значение**

Future типа `QueryResponse` - набор результатов и дополнительная информация, такая как метрики со стороны сервера. Объект Response должен быть закрыт после обработки набора данных.

**Примеры**

```java 
final String sql = "select * from " + TABLE_NAME + " where title <> '' limit 10";

// Формат по умолчанию - RowBinaryWithNamesAndTypesFormatReader, так что читатель имеет всю информацию о колонках
try (QueryResponse response = client.query(sql).get(3, TimeUnit.SECONDS);) {

    // Создание читателя для удобного доступа к данным
    ClickHouseBinaryFormatReader reader = client.newBinaryFormatReader(response);

    while (reader.hasNext()) {
        reader.next(); // Читает следующую запись из потока и разбирает её

        // получение значений
        double id = reader.getDouble("id");
        String title = reader.getString("title");
        String url = reader.getString("url");

        // сбор данных 
    }
} catch (Exception e) {
    log.error("Failed to read data", e);
}

// поместите бизнес-логику за пределами блока чтения, чтобы освободить http соединение как можно скорее.  
```
### query(String sqlQuery, Map&lt;String, Object> queryParams, QuerySettings settings) {#querystring-sqlquery-mapltstring-object-queryparams-querysettings-settings}

Отправляет `sqlQuery` как есть. Дополнительно отправит параметры запроса, чтобы сервер мог скомпилировать SQL выражение.

**Сигнатуры**
```java 
CompletableFuture<QueryResponse> query(String sqlQuery, Map<String, Object> queryParams, QuerySettings settings)
```

**Параметры**

`sqlQuery` - SQL выражение с заполнительными символами `{}`.

`queryParams` - карта переменных для завершения SQL выражения на сервере.

`settings` - настройки запроса.

**Возвращаемое значение**

Future типа `QueryResponse` - набор результатов и дополнительная информация, такая как метрики со стороны сервера. Объект Response должен быть закрыт после обработки набора данных.

**Примеры**

```java showLineNumbers

// определите параметры. Они будут отправлены на сервер вместе с запросом.   
Map<String, Object> queryParams = new HashMap<>();
queryParams.put("param1", 2);

try (QueryResponse queryResponse =
        client.query("SELECT * FROM " + table + " WHERE col1 >= {param1:UInt32}", queryParams, new QuerySettings()).get()) {

    // Создание читателя для удобного доступа к данным
    ClickHouseBinaryFormatReader reader = client.newBinaryFormatReader(response);

    while (reader.hasNext()) {
        reader.next(); // Читает следующую запись из потока и разбирает её

        // чтение данных 
    }

} catch (Exception e) {
    log.error("Failed to read data", e);
}
```
### queryAll(String sqlQuery) {#queryallstring-sqlquery}

Запрашивает данные в формате `RowBinaryWithNamesAndTypes`. Возвращает результат в виде коллекции. Производительность чтения такая же, как с читателем, но требуется больше памяти для хранения всего набора данных.

**Сигнатуры**
```java 
List<GenericRecord> queryAll(String sqlQuery)
```

**Параметры**

`sqlQuery` - SQL выражение для запроса данных с сервера.

**Возвращаемое значение**

Полный набор данных, представленный списком объектов `GenericRecord`, которые обеспечивают доступ к результатам по строкам.

**Примеры**

```java showLineNumbers
try {
    log.info("Reading whole table and process record by record");
    final String sql = "select * from " + TABLE_NAME + " where title <> ''";

    // Чтение всего набора результатов и обработка записи за записью
    client.queryAll(sql).forEach(row -> {
        double id = row.getDouble("id");
        String title = row.getString("title");
        String url = row.getString("url");

        log.info("id: {}, title: {}, url: {}", id, title, url);
    });
} catch (Exception e) {
    log.error("Failed to read data", e);
}
```
### QuerySettings {#querysettings}

Настройки конфигурации для операций запросов.

**Методы конфигурации**

| Метод                                                   | Описание                                                                                                               |
|--------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| `setQueryId(String queryId)`                           | Устанавливает идентификатор запроса, который будет присвоен операции.                                                |
| `setFormat(ClickHouseFormat format)`                   | Устанавливает формат ответа. Смотрите `RowBinaryWithNamesAndTypes` для полного списка.                                |
| `setMaxExecutionTime(Integer maxExecutionTime)`       | Устанавливает время выполнения операции на сервере. Не повлияет на тайм-аут чтения.                                   |
| `waitEndOfQuery(Boolean waitEndOfQuery)`               | Запрашивает сервер дождаться окончания запроса перед отправкой ответа.                                               |
| `setUseServerTimeZone(Boolean useServerTimeZone)`       | Часовой пояс сервера (см. конфигурацию клиента) будет использоваться для разбора типов даты/времени в результате операции. По умолчанию `false`.  |
| `setUseTimeZone(String timeZone)`                      | Запрашивает сервер использовать `timeZone` для конвертации времени. Смотрите [session_timezone](/operations/settings/settings#session_timezone). |
| `serverSetting(String name, String value)`             | Устанавливает отдельные настройки сервера для операции.                                                              |
| `serverSetting(String name, Collection values)`        | Устанавливает отдельные настройки сервера с несколькими значениями для операции. Элементы коллекции должны быть строковыми значениями. |
| `setDBRoles(Collection dbRoles)`                       | Устанавливает роли базы данных, которые должны быть установлены перед выполнением операции. Элементы коллекции должны быть строковыми значениями. |
| `setOption(String option, Object value)`               | Устанавливает конфигурационную опцию в сыром формате. Это не настройка сервера.                                     |

### QueryResponse {#queryresponse}

Объект ответа, который содержит результат выполнения запроса. Он доступен только в том случае, если клиент получил ответ от сервера.

:::note
Этот объект должен быть закрыт как можно скорее, чтобы освободить соединение, так как соединение не может быть повторно использовано, пока все данные предыдущего ответа не будут полностью прочитаны.
:::

| Метод                                | Описание                                                                                          |
|--------------------------------------|--------------------------------------------------------------------------------------------------|
| `ClickHouseFormat getFormat()`       | Возвращает формат, в котором данные в ответе закодированы.                                      |
| `InputStream getInputStream()`       | Возвращает несжатый байтовый поток данных в указанном формате.                                   |
| `OperationMetrics getMetrics()`      | Возвращает объект с метриками операции.                                                          |
| `String getQueryId()`                | Возвращает идентификатор запроса, присвоенный операции приложением (через настройки операции или сервером). |
| `TimeZone getTimeZone()`             | Возвращает часовой пояс, который должен использоваться для обработки типов Date/DateTime в ответе. |

### Examples {#examples}

- Пример кода доступен в [репозитории](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2)
- Ссылка на реализацию [Spring Service](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-service)

## Common API {#common-api}
### getTableSchema(String table) {#gettableschemastring-table}

Получает схему таблицы для `table`.

**Сигнатуры**

```java 
TableSchema getTableSchema(String table)
TableSchema getTableSchema(String table, String database)
```

**Параметры**

`table` - имя таблицы, для которой должны быть получены данные схемы.

`database` - база данных, в которой определена целевая таблица.

**Возвращаемое значение**

Возвращает объект `TableSchema` со списком колонок таблицы.

### getTableSchemaFromQuery(String sql) {#gettableschemafromquerystring-sql}

Получает схему из SQL выражения. 

**Сигнатуры**

```java 
TableSchema getTableSchemaFromQuery(String sql)
```

**Параметры**

`sql` - SQL выражение "SELECT", для которого должна быть возвращена схема.

**Возвращаемое значение**

Возвращает объект `TableSchema` с колонками, соответствующими SQL выражению.

### TableSchema {#tableschema}
### register(Class&lt;?> clazz, TableSchema schema) {#registerclasslt-clazz-tableschema-schema}

Компилирует слой сериализации и десериализации для Java класса, используемого для записи/чтения данных с использованием `schema`. Метод создаст сериализатор и десериализатор для соответствующей пары геттер/сеттер и соответствующей колонки. Сопоставление колонки определяется путем извлечения её имени из имени метода. Например, `getFirstName` будет соответствовать колонке `first_name` или `firstname`. 

**Сигнатуры**

```java 
void register(Class<?> clazz, TableSchema schema)
```

**Параметры**

`clazz` - класс, представляющий POJO, используемый для чтения/записи данных.

`schema` - схема данных, используемая для сопоставления с свойствами POJO.

**Примеры**

```java showLineNumbers
client.register(ArticleViewEvent.class, client.getTableSchema(TABLE_NAME));
```

## Usage Examples {#usage-examples}

Полные примеры кода хранятся в репозитории в папке 'example' [folder](https://github.com/ClickHouse/clickhouse-java/tree/main/examples):

- [client-v2](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2) - основной набор примеров.
- [demo-service](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-service) - пример того, как использовать клиент в приложении Spring Boot.
- [demo-kotlin-service](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-kotlin-service) - пример того, как использовать клиент в приложении Ktor (Kotlin).
