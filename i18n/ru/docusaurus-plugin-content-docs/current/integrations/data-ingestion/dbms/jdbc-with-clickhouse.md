---
sidebar_label: 'JDBC'
sidebar_position: 2
keywords: ['clickhouse', 'jdbc', 'connect', 'integrate']
slug: /integrations/jdbc/jdbc-with-clickhouse
description: 'Мост JDBC ClickHouse позволяет ClickHouse получать доступ к данным из любого внешнего источника данных, для которого доступен драйвер JDBC'
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
Использование JDBC требует моста JDBC ClickHouse, поэтому вам необходимо использовать `clickhouse-local` на локальной машине, чтобы передавать данные из вашей базы данных в ClickHouse Cloud. Посетите страницу [**Использование clickhouse-local**](/integrations/migration/clickhouse-local-etl.md#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge) в разделе **Миграция** документации для получения подробной информации.
:::

**Обзор:** <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge" target="_blank">Мост JDBC ClickHouse</a> в сочетании с [табличной функцией jdbc](/sql-reference/table-functions/jdbc.md) или [движком таблицы JDBC](/engines/table-engines/integrations/jdbc.md) позволяет ClickHouse получать доступ к данным из любого внешнего источника данных, для которого доступен <a href="https://en.wikipedia.org/wiki/JDBC_driver" target="_blank">драйвер JDBC</a>:

<Image img={Jdbc01} size="lg" alt="Схема архитектуры моста JDBC ClickHouse" background='white'/>
Это удобно, когда нет встроенного [движка интеграции](/engines/table-engines/integrations), табличной функции или внешнего словаря для доступного внешнего источника данных, но существует драйвер JDBC для данного источника данных.

Вы можете использовать мост JDBC ClickHouse как для чтения, так и для записи. И в параллельном режиме для нескольких внешних источников данных, например, вы можете выполнять распределенные запросы в ClickHouse одновременно по нескольким внешним и внутренним источникам данных в реальном времени.

В этом уроке мы покажем, как легко установить, настроить и запустить мост JDBC ClickHouse, чтобы подключить ClickHouse к внешнему источнику данных. Мы будем использовать MySQL в качестве внешнего источника данных для этого урока.

Начнем!

:::note Предварительные условия
У вас есть доступ к машине, на которой установлено:
1. оболочка Unix и доступ в интернет
2. <a href="https://www.gnu.org/software/wget/" target="_blank">wget</a>
3. актуальная версия **Java** (например, <a href="https://openjdk.java.net" target="_blank">OpenJDK</a> версии >= 17)
4. актуальная версия **MySQL** (например, <a href="https://www.mysql.com" target="_blank">MySQL</a> версии >= 8), установленная и работающая
5. актуальная версия **ClickHouse** [установлена](/getting-started/install.md) и работает
:::

## Установка моста JDBC ClickHouse локально {#install-the-clickhouse-jdbc-bridge-locally}

Самый простой способ использовать мост JDBC ClickHouse — это установить и запустить его на том же хосте, где работает и ClickHouse:<Image img={Jdbc02} size="lg" alt="Схема локального развертывания моста JDBC ClickHouse" background='white'/>

Давайте начнем с подключения к оболочке Unix на машине, где работает ClickHouse, и создадим локальную папку, в которую позже установим мост JDBC ClickHouse (вы можете назвать папку так, как вам нравится, и разместить её в любом месте):
```bash
mkdir ~/clickhouse-jdbc-bridge
```

Теперь мы загружаем <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/" target="_blank">текущую версию</a> моста JDBC ClickHouse в эту папку:

```bash
cd ~/clickhouse-jdbc-bridge
wget https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/download/v2.0.7/clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

Для того чтобы подключиться к MySQL, мы создаем именованный источник данных:

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
- в значении `jdbcUrl` вам нужно заменить `<host>` и `<port>` на соответствующие значения в зависимости от вашей работающей экземпляра MySQL, например, `"jdbc:mysql://localhost:3306"`
- вам нужно заменить `<username>` и `<password>` на ваши учетные данные MySQL, если вы не используете пароль, вы можете удалить строку `"password": "<password>"` в конфигурационном файле выше
- в значении `driverUrls` мы просто указали URL, с которого можно загрузить <a href="https://repo1.maven.org/maven2/mysql/mysql-connector-java/" target="_blank">текущую версию</a> драйвера JDBC для MySQL. Это всё, что нам нужно сделать, и мост JDBC ClickHouse автоматически загрузит этот драйвер JDBC (в ОС-специфичный каталог).
:::

<br/>

Теперь мы готовы запустить мост JDBC ClickHouse:
 ```bash
 cd ~/clickhouse-jdbc-bridge
 java -jar clickhouse-jdbc-bridge-2.0.7-shaded.jar
 ```
:::note
Мы запустили мост JDBC ClickHouse в режиме переднего плана. Чтобы остановить мост, вы можете снова вывести оболочку Unix из предыдущего окна на передний план и нажать `CTRL+C`.
:::


## Использование соединения JDBC из ClickHouse {#use-the-jdbc-connection-from-within-clickhouse}

Теперь ClickHouse может получать доступ к данным MySQL, используя либо [табличную функцию jdbc](/sql-reference/table-functions/jdbc.md), либо [движок таблицы JDBC](/engines/table-engines/integrations/jdbc.md).

Самый простой способ выполнить следующие примеры — это скопировать и вставить их в [`clickhouse-client`](/interfaces/cli.md) или в [Play UI](/interfaces/http.md).



- Табличная функция jdbc:

 ```sql
 SELECT * FROM jdbc('mysql8', 'mydatabase', 'mytable');
 ```
:::note
В качестве первого параметра для табличной функции jdbc мы используем имя именованного источника данных, который мы настроили выше.
:::



- Движок таблицы JDBC:
 ```sql
 CREATE TABLE mytable (
      <column> <column_type>,
      ...
 )
 ENGINE = JDBC('mysql8', 'mydatabase', 'mytable');

 SELECT * FROM mytable;
 ```
:::note
 В качестве первого параметра для клаузулы движка jdbc мы используем имя именованного источника данных, который мы настроили выше.

 Схема таблицы движка JDBC ClickHouse и схема подключаемой таблицы MySQL должны быть согласованы, например, имена и порядок столбцов должны совпадать, а типы данных столбцов должны быть совместимы.
:::







## Установка моста JDBC ClickHouse внешне {#install-the-clickhouse-jdbc-bridge-externally}

Для распределенного кластера ClickHouse (кластера с более чем одним хостом ClickHouse) имеет смысл установить и запустить мост JDBC ClickHouse на отдельном хосте:
<Image img={Jdbc03} size="lg" alt="Схема внешнего развертывания моста JDBC ClickHouse" background='white'/>
Это имеет преимущество, так как каждый хост ClickHouse может обращаться к мосту JDBC. В противном случае мост JDBC нужно было бы установить локально для каждого экземпляра ClickHouse, который должен получать доступ к внешним источникам данных через мост.

Для того чтобы установить мост JDBC ClickHouse внешне, мы выполняем следующие шаги:


1. Мы устанавливаем, настраиваем и запускаем мост JDBC ClickHouse на выделенном хосте, следуя шагам, описанным в разделе 1 этого руководства.

2. На каждом хосте ClickHouse мы добавляем следующий блок конфигурации в <a href="https://clickhouse.com/docs/operations/configuration-files/#configuration_files" target="_blank">конфигурацию сервера ClickHouse</a> (в зависимости от выбранного формата конфигурации, используйте либо XML-, либо YAML-версию):

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
   - вам нужно заменить `JDBC-Bridge-Host` на имя хоста или IP-адрес выделенного хоста моста JDBC ClickHouse
   - мы указали стандартный порт моста JDBC ClickHouse `9019`, если вы используете другой порт для моста JDBC, тогда вы должны соответственно адаптировать конфигурацию выше
:::




[//]: # (## 4. Дополнительная информация)

[//]: # ()
[//]: # (TODO: )

[//]: # (- упомянуть, что для табличной функции jdbc более производительно &#40;не два запроса каждый раз&#41; также указывать схему в качестве параметра)

[//]: # ()
[//]: # (- упомянуть экспресс-запрос против табличного запроса, сохраненного запроса, именованного запроса)

[//]: # ()
[//]: # (- упомянуть вставку в )
