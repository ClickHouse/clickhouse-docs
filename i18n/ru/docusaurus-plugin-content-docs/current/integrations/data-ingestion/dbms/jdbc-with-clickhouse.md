---
slug: '/integrations/jdbc/jdbc-with-clickhouse'
sidebar_label: JDBC
sidebar_position: 2
description: 'JDBC мост ClickHouse позволяет ClickHouse получать доступ к данным'
title: 'Подключение ClickHouse к внешним источникам данных с помощью JDBC'
keywords: ['clickhouse', 'jdbc', 'connect', 'integrate']
doc_type: guide
---
import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Jdbc01 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-01.png';
import Jdbc02 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-02.png';
import Jdbc03 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-03.png';


# Подключение ClickHouse к внешним источникам данных с помощью JDBC

:::note
Использование JDBC требует наличия моста ClickHouse JDBC, поэтому вам нужно использовать `clickhouse-local` на локальной машине для передачи данных из вашей базы данных в ClickHouse Cloud. Посетите страницу [**Использование clickhouse-local**](/cloud/migration/clickhouse-local#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge) в разделе **Миграция** документации для получения деталей.
:::

**Обзор:** <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge" target="_blank">ClickHouse JDBC Bridge</a> в сочетании с [табличной функцией jdbc](/sql-reference/table-functions/jdbc.md) или [JDBC движком таблицы](/engines/table-engines/integrations/jdbc.md) позволяет ClickHouse получать доступ к данным из любого внешнего источника данных, для которого доступен <a href="https://en.wikipedia.org/wiki/JDBC_driver" target="_blank">JDBC драйвер</a>:

<Image img={Jdbc01} size="lg" alt="Схема архитектуры ClickHouse JDBC Bridge" background='white'/>
Это удобно, когда для внешнего источника данных нет встроенного [движка интеграции](/engines/table-engines/integrations), табличной функции или внешнего словаря, но существует JDBC драйвер для источника данных.

Вы можете использовать ClickHouse JDBC Bridge как для чтения, так и для записи. И параллельно для нескольких внешних источников данных, например, вы можете запускать распределенные запросы в ClickHouse по нескольким внешним и внутренним источникам данных в реальном времени.

В этом уроке мы покажем, насколько легко установить, настроить и запустить ClickHouse JDBC Bridge, чтобы подключить ClickHouse к внешнему источнику данных. В качестве внешнего источника данных мы используем MySQL.

Давайте начнем!

:::note Предварительные условия
У вас есть доступ к машине, на которой:
1. имеется Unix shell и доступ в интернет
2. установлен <a href="https://www.gnu.org/software/wget/" target="_blank">wget</a>
3. установлена текущая версия **Java** (например, <a href="https://openjdk.java.net" target="_blank">OpenJDK</a> версии >= 17)
4. установлена и запущена текущая версия **MySQL** (например, <a href="https://www.mysql.com" target="_blank">MySQL</a> версии >= 8)
5. установлена и запущена текущая версия **ClickHouse** [установлена](/getting-started/install/install.mdx)
:::

## Установка ClickHouse JDBC Bridge локально {#install-the-clickhouse-jdbc-bridge-locally}

Самый простой способ использовать ClickHouse JDBC Bridge — установить и запустить его на том же хосте, где работает ClickHouse:<Image img={Jdbc02} size="lg" alt="Схема локального развертывания ClickHouse JDBC Bridge" background='white'/>

Давайте начнем с подключения к Unix shell на машине, где работает ClickHouse, и создадим локальную папку, в которую мы позже установим ClickHouse JDBC Bridge (вы можете назвать папку как угодно и разместить её в любом месте):
```bash
mkdir ~/clickhouse-jdbc-bridge
```

Теперь мы загрузим <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/" target="_blank">текущую версию</a> ClickHouse JDBC Bridge в эту папку:

```bash
cd ~/clickhouse-jdbc-bridge
wget https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/download/v2.0.7/clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

Чтобы иметь возможность подключиться к MySQL, мы создаем именованный источник данных:

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
- в значении для `jdbcUrl` вам нужно заменить `<host>` и `<port>` на соответствующие значения в соответствии с вашей работающей инстанцией MySQL, например `"jdbc:mysql://localhost:3306"`
- вам нужно заменить `<username>` и `<password>` на ваши учетные данные MySQL, если вы не используете пароль, вы можете удалить строку `"password": "<password>"` в конфигурационном файле выше
- в значении для `driverUrls` мы просто указали URL, по которому можно загрузить <a href="https://repo1.maven.org/maven2/mysql/mysql-connector-java/" target="_blank">текущую версию</a> MySQL JDBC драйвера. Это всё, что нам нужно сделать, и ClickHouse JDBC Bridge автоматически загрузит этот JDBC драйвер (в ОС-специфический каталог).
:::

<br/>

Теперь мы готовы запустить ClickHouse JDBC Bridge:
```bash
cd ~/clickhouse-jdbc-bridge
java -jar clickhouse-jdbc-bridge-2.0.7-shaded.jar
```
:::note
Мы запустили ClickHouse JDBC Bridge в режиме foreground. Чтобы остановить Bridge, вы можете вернуть приложение Unix shell из выше и нажать `CTRL+C`.
:::

## Использование JDBC соединения из ClickHouse {#use-the-jdbc-connection-from-within-clickhouse}

Теперь ClickHouse может получить доступ к данным MySQL, используя либо [табличную функцию jdbc](/sql-reference/table-functions/jdbc.md), либо [JDBC движок таблицы](/engines/table-engines/integrations/jdbc.md).

Самый простой способ выполнить следующие примеры — скопировать и вставить их в [`clickhouse-client`](/interfaces/cli.md) или в [Play UI](/interfaces/http.md).

- jdbc Табличная функция:

```sql
SELECT * FROM jdbc('mysql8', 'mydatabase', 'mytable');
```
:::note
В качестве первого параметра для jdbc табличной функции мы используем имя именованного источника данных, который мы настроили выше.
:::

- JDBC Движок таблицы:
```sql
CREATE TABLE mytable (
     <column> <column_type>,
     ...
)
ENGINE = JDBC('mysql8', 'mydatabase', 'mytable');

SELECT * FROM mytable;
```
:::note
В качестве первого параметра для клаузи jdbc engine мы используем имя именованного источника данных, который мы настроили выше.

Схема таблицы ClickHouse JDBC engine и схема подключенной таблицы MySQL должны совпадать, например, имена и порядок столбцов должны быть одинаковыми, а типы данных столбцов должны быть совместимыми.
:::

## Установка ClickHouse JDBC Bridge снаружи {#install-the-clickhouse-jdbc-bridge-externally}

Для распределенного кластера ClickHouse (кластера с более чем одной хостом ClickHouse) имеет смысл установить и запустить ClickHouse JDBC Bridge на отдельном хосте:
<Image img={Jdbc03} size="lg" alt="Схема внешнего развертывания ClickHouse JDBC Bridge" background='white'/>
Это имеет преимущество, что каждый хост ClickHouse может получить доступ к JDBC Bridge. В противном случае JDBC Bridge нужно было бы устанавливать локально для каждой инстанции ClickHouse, которая должна получать доступ к внешним источникам данных через Bridge.

Чтобы установить ClickHouse JDBC Bridge снаружи, мы выполняем следующие шаги:

1. Мы устанавливаем, настраиваем и запускаем ClickHouse JDBC Bridge на выделенном хосте, следуя шагам, описанным в разделе 1 этого руководства.

2. На каждом хосте ClickHouse мы добавляем следующий блок конфигурации в <a href="https://clickhouse.com/docs/operations/configuration-files/#configuration_files" target="_blank">конфигурацию сервера ClickHouse</a> (в зависимости от выбранного вами формата конфигурации используйте версию XML или YAML):

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
- мы указали порт по умолчанию для ClickHouse JDBC Bridge `9019`, если вы используете другой порт для JDBC Bridge, вам необходимо адаптировать конфигурацию выше соответствующим образом
:::

[//]: # (## 4. Дополнительная информация)

[//]: # ()
[//]: # (TODO: )

[//]: # (- упомянуть, что для jdbc табличной функции это более производительно &#40;не два запроса каждый раз&#41; также указать схему в качестве параметра)

[//]: # ()
[//]: # (- упомянуть ad hoc запрос против табличного запроса, сохраненного запроса, именованного запроса)

[//]: # ()
[//]: # (- упомянуть вставку в )