---
sidebar_label: 'JDBC'
sidebar_position: 2
keywords: ['clickhouse', 'jdbc', 'connect', 'integrate']
slug: /integrations/jdbc/jdbc-with-clickhouse
description: 'Мост JDBC для ClickHouse позволяет ClickHouse получать доступ к данным из любого внешнего источника данных, для которого доступен JDBC-драйвер'
title: 'Подключение ClickHouse к внешним источникам данных с помощью JDBC'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Jdbc01 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-01.png';
import Jdbc02 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-02.png';
import Jdbc03 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-03.png';

# Подключение ClickHouse к внешним источникам данных с помощью JDBC {#connecting-clickhouse-to-external-data-sources-with-jdbc}

:::note
Использование JDBC требует ClickHouse JDBC Bridge, поэтому вам понадобится использовать `clickhouse-local` на локальной машине, чтобы передавать данные из вашей базы данных в ClickHouse Cloud. Перейдите на страницу [**Using clickhouse-local**](/cloud/migration/clickhouse-local#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge) в разделе **Migrate** документации для получения подробной информации.
:::

**Обзор:** <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge" target="_blank">ClickHouse JDBC Bridge</a> в сочетании с [табличной функцией jdbc](/sql-reference/table-functions/jdbc.md) или [табличным движком JDBC](/engines/table-engines/integrations/jdbc.md) позволяет ClickHouse получать доступ к данным из любого внешнего источника данных, для которого доступен <a href="https://en.wikipedia.org/wiki/JDBC_driver" target="_blank">JDBC-драйвер</a>:

<Image img={Jdbc01} size="lg" alt="Схема архитектуры ClickHouse JDBC Bridge" background='white'/>
Это удобно, когда для внешнего источника данных нет встроенного [интеграционного движка](/engines/table-engines/integrations), табличной функции или внешнего словаря, но существует JDBC-драйвер для этого источника данных.

Вы можете использовать ClickHouse JDBC Bridge как для чтения, так и для записи, и параллельно — для нескольких внешних источников данных; например, вы можете выполнять распределённые запросы в ClickHouse по нескольким внешним и внутренним источникам данных в режиме реального времени.

В этом уроке мы покажем, насколько просто установить, настроить и запустить ClickHouse JDBC Bridge для подключения ClickHouse к внешнему источнику данных. В качестве внешнего источника данных в этом уроке мы будем использовать MySQL.

Приступим!

:::note Предварительные требования
У вас есть доступ к машине, на которой:
1. установлена оболочка Unix и есть доступ в интернет
2. установлен <a href="https://www.gnu.org/software/wget/" target="_blank">wget</a>
3. установлена актуальная версия **Java** (например, <a href="https://openjdk.java.net" target="_blank">OpenJDK</a> версии >= 17)
4. установлена и запущена актуальная версия **MySQL** (например, <a href="https://www.mysql.com" target="_blank">MySQL</a> версии >= 8)
5. установлена и запущена актуальная версия **ClickHouse** ([см. установку](/getting-started/install/install.mdx))
:::

## Установка ClickHouse JDBC Bridge локально {#install-the-clickhouse-jdbc-bridge-locally}

Самый простой способ использовать ClickHouse JDBC Bridge — установить и запустить его на той же машине, где работает ClickHouse:<Image img={Jdbc02} size="lg" alt="Схема локального развертывания ClickHouse JDBC Bridge" background="white" />

Начнём с подключения к командной оболочке Unix на машине, где запущен ClickHouse, и создания локальной папки, в которую мы позже установим ClickHouse JDBC Bridge (можно назвать папку как угодно и разместить её в любом удобном месте):

```bash
mkdir ~/clickhouse-jdbc-bridge
```

Теперь загрузим <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/" target="_blank">текущую версию</a> ClickHouse JDBC Bridge в эту папку:

```bash
cd ~/clickhouse-jdbc-bridge
wget https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/download/v2.0.7/clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

Чтобы подключиться к MySQL, создадим именованный источник данных:

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

* вы можете использовать любое имя для источника данных, мы использовали `mysql8`
* в значении `jdbcUrl` вам нужно заменить `<host>` и `<port>` на соответствующие значения для запущенного экземпляра MySQL, например `"jdbc:mysql://localhost:3306"`
* вам нужно заменить `<username>` и `<password>` на ваши учётные данные MySQL; если вы не используете пароль, вы можете удалить строку `"password": "<password>"` в конфигурационном файле выше
* в значении `driverUrls` мы просто указали URL, по которому можно скачать <a href="https://repo1.maven.org/maven2/mysql/mysql-connector-java/" target="_blank">текущую версию</a> JDBC‑драйвера MySQL. На этом всё — ClickHouse JDBC Bridge автоматически скачает этот JDBC‑драйвер (в зависящий от ОС каталог).
  :::

<br />

Теперь мы готовы запустить ClickHouse JDBC Bridge:

```bash
cd ~/clickhouse-jdbc-bridge
java -jar clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

:::note
Мы запустили ClickHouse JDBC Bridge в режиме переднего плана. Чтобы остановить Bridge, вы можете вернуть показанное выше окно оболочки Unix на передний план и нажать `CTRL+C`.
:::

## Использование JDBC-подключения из ClickHouse {#use-the-jdbc-connection-from-within-clickhouse}

Теперь ClickHouse может получать доступ к данным MySQL с помощью [табличной функции jdbc](/sql-reference/table-functions/jdbc.md) или [движка таблицы JDBC](/engines/table-engines/integrations/jdbc.md).

Самый простой способ выполнить следующие примеры — скопировать и вставить их в [`clickhouse-client`](/interfaces/cli.md) или в [Play UI](/interfaces/http.md).

* Табличная функция jdbc:

```sql
SELECT * FROM jdbc('mysql8', 'mydatabase', 'mytable');
```

:::note
В качестве первого параметра табличной функции `jdbc` мы используем имя именованного источника данных, который был настроен выше.
:::

* Табличный движок JDBC:

```sql
CREATE TABLE mytable (
     <column> <column_type>,
     ...
)
ENGINE = JDBC('mysql8', 'mydatabase', 'mytable');

SELECT * FROM mytable;
```

:::note
В качестве первого параметра в секции движка `jdbc` мы используем имя именованного источника данных, который мы настроили выше.

Схема таблицы движка ClickHouse JDBC и схема подключённой таблицы MySQL должны быть согласованы: например, имена и порядок столбцов должны совпадать, а типы данных столбцов — быть совместимыми.
:::

## Внешняя установка ClickHouse JDBC Bridge {#install-the-clickhouse-jdbc-bridge-externally}

Для распределённого кластера ClickHouse (кластера с более чем одним хостом ClickHouse) имеет смысл установить и запускать ClickHouse JDBC Bridge отдельно, на выделенном хосте:
<Image img={Jdbc03} size="lg" alt="Схема внешнего развертывания ClickHouse JDBC Bridge" background='white'/>
Преимущество такого подхода в том, что каждый хост ClickHouse может обращаться к JDBC Bridge. В противном случае JDBC Bridge пришлось бы устанавливать локально на каждый экземпляр ClickHouse, который должен обращаться к внешним источникам данных через Bridge.

Для внешней установки ClickHouse JDBC Bridge выполните следующие шаги:

1. Установите, настройте и запустите ClickHouse JDBC Bridge на выделенном хосте, следуя шагам, описанным в разделе 1 данного руководства.

2. На каждом хосте ClickHouse добавьте следующий блок конфигурации в <a href="https://clickhouse.com/docs/operations/configuration-files/#configuration_files" target="_blank">конфигурацию сервера ClickHouse</a> (в зависимости от выбранного формата конфигурации используйте XML- или YAML-вариант):

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
- необходимо заменить `JDBC-Bridge-Host` на имя хоста или IP-адрес выделенного хоста ClickHouse JDBC Bridge
- указан порт ClickHouse JDBC Bridge по умолчанию `9019`; если вы используете для JDBC Bridge другой порт, необходимо соответствующим образом изменить конфигурацию выше
:::

[//]: # (## 4. Дополнительная информация)

[//]: # ()
[//]: # (TODO: )

[//]: # (- упомянуть, что для функции таблицы jdbc более эффективно &#40;не по два запроса каждый раз&#41; также указывать схему в качестве параметра)

[//]: # ()
[//]: # (- упомянуть разницу между разовым запросом и табличным запросом, сохранённым запросом, именованным запросом)

[//]: # ()
[//]: # (- упомянуть insert into )
