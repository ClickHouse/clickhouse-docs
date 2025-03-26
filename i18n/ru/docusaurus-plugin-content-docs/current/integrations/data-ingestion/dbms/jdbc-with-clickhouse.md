---
sidebar_label: 'JDBC'
sidebar_position: 2
keywords: ['clickhouse', 'jdbc', 'connect', 'integrate']
slug: /integrations/jdbc/jdbc-with-clickhouse
description: 'ClickHouse JDBC Bridge позволяет ClickHouse получать доступ к данным из любых внешних источников данных, для которых доступен JDBC драйвер'
title: 'Подключение ClickHouse к внешним источникам данных с помощью JDBC'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Jdbc01 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-01.png';
import Jdbc02 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-02.png';
import Jdbc03 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-03.png';


# Подключение ClickHouse к внешним источникам данных с помощью JDBC

:::note
Использование JDBC требует ClickHouse JDBC bridge, поэтому вам нужно использовать `clickhouse-local` на локальной машине, чтобы передать данные из вашей базы данных в ClickHouse Cloud. Посетите страницу [**Использование clickhouse-local**](/integrations/migration/clickhouse-local-etl.md#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge) в разделе **Миграция** документации для получения подробной информации.
:::

**Обзор:** <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge" target="_blank">ClickHouse JDBC Bridge</a> в сочетании с [jdbc table function](/sql-reference/table-functions/jdbc.md) или [JDBC table engine](/engines/table-engines/integrations/jdbc.md) позволяет ClickHouse получать доступ к данным из любого внешнего источника данных, для которого доступен <a href="https://en.wikipedia.org/wiki/JDBC_driver" target="_blank">JDBC драйвер</a>:

<Image img={Jdbc01} size="lg" alt="Схема архитектуры ClickHouse JDBC Bridge" background='white'/>
Это удобно, когда нет встроенного [движка интеграции](/engines/table-engines/integrations), табличной функции или внешнего словаря для доступного источника данных, но существует JDBC драйвер для источника данных.

Вы можете использовать ClickHouse JDBC Bridge как для чтения, так и для записи. И одновременно для нескольких внешних источников данных, например, вы можете выполнять распределенные запросы в ClickHouse по нескольким внешним и внутренним источникам данных в реальном времени.

В этом уроке мы покажем, как легко установить, настроить и запустить ClickHouse JDBC Bridge, чтобы подключить ClickHouse к внешнему источнику данных. В качестве внешнего источника данных для этого урока мы будем использовать MySQL.

Давайте начнем!

:::note Предварительные условия
У вас есть доступ к машине, где установлены:
1. Unix оболочка и доступ в интернет
2. <a href="https://www.gnu.org/software/wget/" target="_blank">wget</a>
3. актуальная версия **Java** (например, <a href="https://openjdk.java.net" target="_blank">OpenJDK</a> версии >= 17)
4. актуальная версия **MySQL** (например, <a href="https://www.mysql.com" target="_blank">MySQL</a> версии >= 8), установленная и работающая
5. актуальная версия **ClickHouse** [установленная](/getting-started/install.md) и работающая
:::

## Установка ClickHouse JDBC Bridge локально {#install-the-clickhouse-jdbc-bridge-locally}

Самый простой способ использовать ClickHouse JDBC Bridge — установить и запустить его на том же хосте, где работает ClickHouse:<Image img={Jdbc02} size="lg" alt="Схема локального развертывания ClickHouse JDBC Bridge" background='white'/>

Давайте начнем с подключения к Unix оболочке на машине, где работает ClickHouse, и создадим локальную папку, в которую мы позже установим ClickHouse JDBC Bridge (не стесняйтесь называть папку как угодно и помещать ее куда угодно):
```bash
mkdir ~/clickhouse-jdbc-bridge
```

Теперь мы скачиваем <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/" target="_blank">актуальную версию</a> ClickHouse JDBC Bridge в эту папку:

```bash
cd ~/clickhouse-jdbc-bridge
wget https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/download/v2.0.7/clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

Чтобы подключиться к MySQL, мы создаем именованный источник данных:

 ```bash
 cd ~/clickhouse-jdbc-bridge
 mkdir -p config/datasources
 touch config/datasources/mysql8.json
 ```

Теперь вы можете скопировать и вставить следующую конфигурацию в файл `~/clickhouse-jdbc-bridge/config/datasources/mysql8.json`:

 ```json
 {
   "mysql8": {
   "driverUrls": [
     "https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.28/mysql-connector-java-8.0.28.jar"
   ],
   "jdbcUrl": "jdbc:mysql://<host>:<port>",
   "username": "<username>",
   "password": "<password>"
   }
 }
 ```

:::note
в конфигурационном файле выше
- вы можете использовать любое имя для источника данных, мы использовали `mysql8`
- в значении для `jdbcUrl` вам нужно заменить `<host>` и `<port>` на соответствующие значения в зависимости от вашей работающей инстанции MySQL, например `"jdbc:mysql://localhost:3306"`
- вам нужно заменить `<username>` и `<password>` на ваши учетные данные MySQL, если вы не используете пароль, вы можете удалить строку `"password": "<password>"` в указанном выше конфигурационном файле
- в значении для `driverUrls` мы просто указали URL, с которого можно скачать <a href="https://repo1.maven.org/maven2/mysql/mysql-connector-java/" target="_blank">актуальную версию</a> MySQL JDBC драйвера. Это все, что нам нужно сделать, и ClickHouse JDBC Bridge автоматически скачает этот JDBC драйвер (в ОС специфическую директорию).
:::

<br/>

Теперь мы готовы запустить ClickHouse JDBC Bridge:
 ```bash
 cd ~/clickhouse-jdbc-bridge
 java -jar clickhouse-jdbc-bridge-2.0.7-shaded.jar
 ```
:::note
Мы запустили ClickHouse JDBC Bridge в фоновом режиме. Чтобы остановить Bridge вы можете вернуть окно Unix оболочки выше на передний план и нажать `CTRL+C`.
:::


## Использование JDBC подключения изнутри ClickHouse {#use-the-jdbc-connection-from-within-clickhouse}

Теперь ClickHouse может получить доступ к данным MySQL, используя либо [jdbc table function](/sql-reference/table-functions/jdbc.md), либо [JDBC table engine](/engines/table-engines/integrations/jdbc.md).

Самый простой способ выполнить следующие примеры — скопировать и вставить их в [`clickhouse-client`](/interfaces/cli.md) или в [Play UI](/interfaces/http.md).



- jdbc Табличная Функция:

 ```sql
 SELECT * FROM jdbc('mysql8', 'mydatabase', 'mytable');
 ```
:::note
В качестве первого параметра для jdbc табличной функции мы используем имя источника данных, который мы настроили выше.
:::



- JDBC Табличный Движок:
 ```sql
 CREATE TABLE mytable (
      <column> <column_type>,
      ...
 )
 ENGINE = JDBC('mysql8', 'mydatabase', 'mytable');

 SELECT * FROM mytable;
 ```
:::note
В качестве первого параметра для статьи jdbc движка мы используем имя источника данных, который мы настроили выше.

Схема таблицы ClickHouse JDBC engine и схема подключенной таблицы MySQL должны совпадать, например, имена столбцов и порядок должны быть одинаковыми, а типы данных столбцов должны быть совместимыми.
:::







## Установка ClickHouse JDBC Bridge внешне {#install-the-clickhouse-jdbc-bridge-externally}

Для распределенного кластера ClickHouse (кластера с более чем одним хостом ClickHouse) имеет смысл установить и запустить ClickHouse JDBC Bridge внешне на отдельном хосте:
<Image img={Jdbc03} size="lg" alt="Схема внешнего развертывания ClickHouse JDBC Bridge" background='white'/>
Это имеет то преимущество, что каждый хост ClickHouse может получить доступ к JDBC Bridge. В противном случае, JDBC Bridge должен был бы быть установлен локально для каждой инстанции ClickHouse, которая должна получать доступ к внешним источникам данных через этот мост.

Чтобы установить ClickHouse JDBC Bridge внешне, мы выполняем следующие шаги:


1. Мы устанавливаем, настраиваем и запускаем ClickHouse JDBC Bridge на выделенном хосте, следуя шагам, описанным в разделе 1 этого руководства.

2. На каждом хосте ClickHouse мы добавляем следующий конфигурационный блок в <a href="https://clickhouse.com/docs/operations/configuration-files/#configuration_files" target="_blank">конфигурацию сервера ClickHouse</a> (в зависимости от вашего выбранного формата конфигурации, используйте либо версию XML, либо YAML):

<Tabs>
<TabItem value="xml" label="XML">

```xml
<jdbc_bridge>
   <host>JDBC-Bridge-Host</host>
   <port>9019</port>
</jdbc_bridge>
```

</TabItem>
<TabItem value="yaml" label="YAML">

```yaml
jdbc_bridge:
    host: JDBC-Bridge-Host
    port: 9019
```

</TabItem>
</Tabs>

:::note
   - вам нужно заменить `JDBC-Bridge-Host` на имя хоста или IP-адрес выделенного хоста ClickHouse JDBC Bridge
   - мы указали порт по умолчанию для ClickHouse JDBC Bridge `9019`, если вы используете другой порт для JDBC Bridge, то вам нужно соответственно адаптировать конфигурацию выше
:::




[//]: # (## 4. Дополнительная информация)

[//]: # ()
[//]: # (TODO: )

[//]: # (- упомянуть, что для jdbc table function более производительно &#40;не два запроса каждый раз&#41; также указывать схему как параметр)

[//]: # ()
[//]: # (- упомянуть ad hoc запрос против табличного запроса, сохраненного запроса, именованного запроса)

[//]: # ()
[//]: # (- упомянуть insert into )


