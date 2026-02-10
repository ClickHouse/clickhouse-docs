---
sidebar_label: 'Splunk'
sidebar_position: 198
slug: /integrations/splunk
keywords: ['Splunk', 'интеграция', 'визуализация данных']
description: 'Подключите панели мониторинга Splunk к ClickHouse'
title: 'Подключение Splunk к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import splunk_1 from '@site/static/images/integrations/splunk/splunk-1.png';
import splunk_2 from '@site/static/images/integrations/splunk/splunk-2.png';
import splunk_3 from '@site/static/images/integrations/splunk/splunk-3.png';
import splunk_4 from '@site/static/images/integrations/splunk/splunk-4.png';
import splunk_5 from '@site/static/images/integrations/splunk/splunk-5.png';
import splunk_6 from '@site/static/images/integrations/splunk/splunk-6.png';
import splunk_7 from '@site/static/images/integrations/splunk/splunk-7.png';
import splunk_8 from '@site/static/images/integrations/splunk/splunk-8.png';
import splunk_9 from '@site/static/images/integrations/splunk/splunk-9.png';
import splunk_10 from '@site/static/images/integrations/splunk/splunk-10.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Подключение Splunk к ClickHouse \{#connecting-splunk-to-clickhouse\}

<ClickHouseSupportedBadge/>

:::tip
Хотите сохранять журналы аудита ClickHouse в Splunk? Следуйте руководству ["Storing ClickHouse Cloud Audit logs into Splunk"](/integrations/audit-splunk).
:::

Splunk — это популярная платформа для безопасности и обсервабилити. Это также мощный движок для поиска и построения дашбордов. Существуют сотни приложений Splunk для решения различных задач.

В случае ClickHouse мы используем [Splunk DB Connect App](https://splunkbase.splunk.com/app/2686), который обеспечивает простую интеграцию с высокопроизводительным ClickHouse JDBC-драйвером для прямого выполнения запросов к таблицам в ClickHouse.

Идеальный сценарий использования этой интеграции — когда вы применяете ClickHouse для крупномасштабных источников данных, таких как NetFlow, бинарные данные Avro или Protobuf, DNS, журналы VPC flow и другие OTel-журналы, которыми можно делиться с вашей командой в Splunk для поиска и создания дашбордов. При таком подходе данные не принимаются в индексный слой Splunk и просто запрашиваются напрямую из ClickHouse, аналогично другим интеграциям для визуализации, таким как [Metabase](https://www.metabase.com/) или [Superset](https://superset.apache.org/).

## Цель​ \{#goal\}

В этом руководстве мы будем использовать JDBC-драйвер ClickHouse, чтобы подключить ClickHouse к Splunk. Мы установим локальную версию Splunk Enterprise, но не будем индексировать какие‑либо данные. Вместо этого мы будем использовать функции поиска через движок запросов DB Connect.

С помощью этого руководства вы сможете создать панель мониторинга, подключенную к ClickHouse, похожую на эту:

<Image img={splunk_1} size="lg" border alt="Панель Splunk с визуализацией данных такси Нью-Йорка" />

:::note
В этом руководстве используется [набор данных New York City Taxi](/getting-started/example-datasets/nyc-taxi). Также вы можете использовать многие другие наборы данных из [нашей документации](http://localhost:3000/docs/getting-started/example-datasets).
:::

## Предварительные требования \{#prerequisites\}

Перед началом работы вам потребуется:

- Splunk Enterprise для использования функций search head
- Установленная в вашей ОС или контейнере [Java Runtime Environment (JRE)](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites), соответствующая указанным требованиям
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- Права администратора или SSH-доступ к экземпляру ОС, на котором запущен Splunk Enterprise
- Параметры подключения к ClickHouse (см. [здесь](/integrations/metabase#1-gather-your-connection-details), если вы используете ClickHouse Cloud)

## Установка и настройка DB Connect в Splunk Enterprise \{#install-and-configure-db-connect-on-splunk-enterprise\}

Сначала необходимо установить Java Runtime Environment на экземпляр Splunk Enterprise. Если вы используете Docker, можно выполнить команду `microdnf install java-11-openjdk`.

Определите и зафиксируйте путь к `java_home`: `java -XshowSettings:properties -version`.

Убедитесь, что приложение DB Connect установлено в Splunk Enterprise. Его можно найти в разделе Apps веб-интерфейса Splunk:

- Войдите в Splunk Web и перейдите в Apps > Find More Apps
- Используйте поле поиска, чтобы найти DB Connect
- Нажмите зелёную кнопку «Install» рядом со Splunk DB Connect
- Нажмите «Restart Splunk»

Если у вас возникают проблемы с установкой приложения DB Connect, дополнительные инструкции см. [по этой ссылке](https://splunkbase.splunk.com/app/2686).

После того как вы убедились, что приложение DB Connect установлено, добавьте путь `java_home` в приложение DB Connect в разделе Configuration -> Settings и нажмите «Save», затем «Reset».

<Image img={splunk_2} size="md" border alt="Страница настроек Splunk DB Connect с конфигурацией Java Home" />

## Настройка JDBC для ClickHouse \{#configure-jdbc-for-clickhouse\}

Скачайте [JAR-файл драйвера ClickHouse JDBC](https://github.com/ClickHouse/clickhouse-java/releases/) и скопируйте его в каталог DB Connect Drivers по адресу:

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

Чтобы обеспечить доступность всех необходимых зависимостей для приложения DB Connect, загрузите один из следующих файлов:

```text
- clickhouse-jdbc-<VERSION>-shaded-all.jar (if VERSION < 0.9.0)
- clickhouse-jdbc-<VERSION>-all-dependencies.jar (if VERSION >= 0.9.0)
```

Затем необходимо отредактировать конфигурацию типов подключений в файле `$SPLUNK_HOME/etc/apps/splunk_app_db_connect/local/db_connection_types.conf`, чтобы добавить сведения о классе драйвера JDBC для ClickHouse. Добавьте в `db_connection_types.conf` следующий раздел:

```text
[ClickHouse]
displayName = ClickHouse
serviceClass = com.splunk.dbx2.DefaultDBX2JDBC
jdbcUrlFormat = jdbc:ch://<host>:<port>/<database>
jdbcUrlSSLFormat = jdbc:ch://<host>:<port>/<database>?ssl=true
jdbcDriverClass = com.clickhouse.jdbc.ClickHouseDriver
ui_default_catalog = $database$
```

Перезапустите Splunk с помощью команды `$SPLUNK_HOME/bin/splunk restart`.

Вернитесь в приложение DB Connect и перейдите в Configuration &gt; Settings &gt; Drivers. Вы должны увидеть зелёную галочку рядом с ClickHouse:

<Image img={splunk_3} size="lg" border alt="Страница драйверов Splunk DB Connect, на которой показано, что драйвер ClickHouse успешно установлен" />


## Подключение поиска Splunk к ClickHouse \{#connect-splunk-search-to-clickhouse\}

Перейдите в раздел DB Connect App Configuration -> Databases -> Identities и создайте Identity для подключения к вашему ClickHouse.

Создайте новое подключение к ClickHouse в разделе Configuration -> Databases -> Connections и выберите "New Connection".

<Image img={splunk_4} size="sm" border alt="Кнопка создания нового подключения в Splunk DB Connect" />

<br />

Укажите параметры хоста ClickHouse и убедитесь, что опция "Enable SSL" включена:

<Image img={splunk_5} size="md" border alt="Страница настройки подключения Splunk к ClickHouse" />

После сохранения подключения вы успешно подключите Splunk к ClickHouse!

:::note
Если возникает ошибка, убедитесь, что вы добавили IP-адрес своего экземпляра Splunk в ClickHouse Cloud IP Access List. Дополнительную информацию см. в [документации](/cloud/security/setting-ip-filters).
:::

## Выполнение SQL-запроса \{#run-a-sql-query\}

Теперь мы выполним SQL-запрос, чтобы проверить, что всё работает.

Выберите параметры подключения в SQL Explorer в разделе DataLab приложения DB Connect. В этом примере мы используем таблицу `trips`:

<Image img={splunk_6} size="md" border alt="Splunk SQL Explorer, выбор подключения к ClickHouse" />

Выполните SQL-запрос к таблице `trips`, который возвращает количество записей в таблице:

<Image img={splunk_7} size="md" border alt="Выполнение SQL-запроса в Splunk, показывающее количество записей в таблице trips" />

Если запрос выполнен успешно, вы должны увидеть результаты запроса.

## Создайте дашборд \{#create-a-dashboard\}

Давайте создадим дашборд, который использует сочетание SQL и мощного Splunk Processing Language (SPL).

Прежде чем продолжить, необходимо сначала [отключить защитные механизмы DPL](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards).

Выполните следующий запрос, который показывает 10 районов с наибольшим числом посадок:

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

Выберите вкладку визуализации, чтобы просмотреть созданную столбчатую диаграмму:

<Image img={splunk_8} size="lg" border alt="Визуализация столбчатой диаграммы Splunk, показывающая 10 лучших районов посадки" />

Теперь создадим дашборд, нажав Save As &gt; Save to Dashboard.

Добавим ещё один запрос, который показывает средний тариф в зависимости от количества пассажиров.

```sql
dbxquery query="SELECT passenger_count,avg(total_amount)
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

На этот раз давайте создадим визуализацию столбчатой диаграммы и сохраним её в ранее созданную панель мониторинга.

<Image img={splunk_9} size="lg" border alt="Столбчатая диаграмма Splunk, показывающая средний тариф в зависимости от количества пассажиров" />

Наконец, давайте добавим ещё один запрос, который показывает корреляцию между количеством пассажиров и расстоянием поездки:

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(* FROM default.trips)
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC; " connection="chc"
```

В итоге наш дашборд должен выглядеть так:

<Image img={splunk_10} size="lg" border alt="Итоговый дашборд Splunk с несколькими визуализациями данных нью-йоркского такси" />


## Данные временных рядов \{#time-series-data\}

Splunk предоставляет сотни встроенных функций, которые можно использовать в дашбордах для визуализации и представления данных временных рядов. В этом примере мы объединим SQL и SPL, чтобы создать запрос для работы с данными временных рядов в Splunk.

```sql
dbxquery query="SELECT time, orig_h, duration
FROM "demo"."conn" WHERE time >= now() - interval 1 HOURS" connection="chc"
| eval time = strptime(time, "%Y-%m-%d %H:%M:%S.%3Q")
| eval _time=time
| timechart avg(duration) as duration by orig_h
| eval duration=round(duration/60)
| sort - duration:
```


## Подробнее \{#learn-more\}

Если вы хотите получить более подробную информацию о Splunk DB Connect и о том, как создавать дашборды, обратитесь к [документации Splunk](https://docs.splunk.com/Documentation).