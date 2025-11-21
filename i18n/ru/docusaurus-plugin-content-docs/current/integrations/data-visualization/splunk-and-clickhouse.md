---
sidebar_label: 'Splunk'
sidebar_position: 198
slug: /integrations/splunk
keywords: ['Splunk', 'интеграция', 'визуализация данных']
description: 'Подключение панелей мониторинга Splunk к ClickHouse'
title: 'Подключение Splunk к ClickHouse'
doc_type: 'guide'
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


# Подключение Splunk к ClickHouse

<ClickHouseSupportedBadge/>

:::tip
Хотите сохранять журналы аудита ClickHouse в Splunk? Воспользуйтесь руководством «[Сохранение журналов аудита ClickHouse Cloud в Splunk](/integrations/audit-splunk)».
:::

Splunk — популярная технология для задач безопасности и наблюдаемости. Это также мощный поисковый движок и платформа для построения панелей мониторинга. Существуют сотни приложений Splunk, ориентированных на различные сценарии использования.

Для интеграции с ClickHouse мы используем [Splunk DB Connect App](https://splunkbase.splunk.com/app/2686), который обеспечивает простую интеграцию с высокопроизводительным JDBC-драйвером ClickHouse и позволяет напрямую выполнять запросы к таблицам в ClickHouse.

Идеальный сценарий использования этой интеграции — когда вы применяете ClickHouse для больших источников данных, таких как NetFlow, бинарные данные Avro или Protobuf, DNS, журналы потоков VPC и другие OTEL‑журналы, которыми вы можете делиться со своей командой в Splunk для поиска и построения панелей. При таком подходе данные не загружаются в индексный слой Splunk и запрашиваются напрямую из ClickHouse, аналогично другим интеграциям для визуализации, таким как [Metabase](https://www.metabase.com/) или [Superset](https://superset.apache.org/).



## Цель​ {#goal}

В этом руководстве мы используем драйвер ClickHouse JDBC для подключения ClickHouse к Splunk. Мы установим локальную версию Splunk Enterprise, но не будем индексировать данные. Вместо этого мы используем функции поиска через движок запросов DB Connect.

С помощью этого руководства вы сможете создать дашборд, подключенный к ClickHouse, аналогичный следующему:

<Image
  img={splunk_1}
  size='lg'
  border
  alt='Дашборд Splunk с визуализацией данных о такси Нью-Йорка'
/>

:::note
В этом руководстве используется [набор данных о такси Нью-Йорка](/getting-started/example-datasets/nyc-taxi). Вы можете использовать множество других наборов данных из [нашей документации](http://localhost:3000/docs/getting-started/example-datasets).
:::


## Предварительные требования {#prerequisites}

Перед началом работы вам потребуется:

- Splunk Enterprise для использования функций поискового узла
- Установленные требования [Java Runtime Environment (JRE)](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites) в вашей операционной системе или контейнере
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- Административный доступ или доступ по SSH к экземпляру ОС Splunk Enterprise
- Параметры подключения к ClickHouse (см. [здесь](/integrations/metabase#1-gather-your-connection-details), если вы используете ClickHouse Cloud)


## Установка и настройка DB Connect в Splunk Enterprise {#install-and-configure-db-connect-on-splunk-enterprise}

Сначала необходимо установить Java Runtime Environment на экземпляре Splunk Enterprise. Если вы используете Docker, выполните команду `microdnf install java-11-openjdk`.

Запишите путь `java_home`: `java -XshowSettings:properties -version`.

Убедитесь, что приложение DB Connect установлено в Splunk Enterprise. Его можно найти в разделе Apps веб-интерфейса Splunk:

- Войдите в Splunk Web и перейдите в Apps > Find More Apps
- Используйте поле поиска для поиска DB Connect
- Нажмите зелёную кнопку «Install» рядом с Splunk DB Connect
- Нажмите «Restart Splunk»

Если при установке приложения DB Connect возникают проблемы, обратитесь к [этой ссылке](https://splunkbase.splunk.com/app/2686) за дополнительными инструкциями.

После того как вы убедились, что приложение DB Connect установлено, добавьте путь java_home в приложении DB Connect в разделе Configuration -> Settings, затем нажмите save и reset.

<Image
  img={splunk_2}
  size='md'
  border
  alt='Страница настроек Splunk DB Connect с конфигурацией Java Home'
/>


## Настройка JDBC для ClickHouse {#configure-jdbc-for-clickhouse}

Загрузите [драйвер ClickHouse JDBC](https://github.com/ClickHouse/clickhouse-java) в папку драйверов DB Connect, например:

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

Затем необходимо отредактировать конфигурацию типов подключений в файле `$SPLUNK_HOME/etc/apps/splunk_app_db_connect/default/db_connection_types.conf`, чтобы добавить параметры класса драйвера ClickHouse JDBC.

Добавьте следующую секцию в файл:

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

Вернитесь в приложение DB Connect и перейдите в Configuration > Settings > Drivers. Рядом с ClickHouse должна отображаться зелёная галочка:

<Image
  img={splunk_3}
  size='lg'
  border
  alt='Страница драйверов Splunk DB Connect с успешно установленным драйвером ClickHouse'
/>


## Подключение поиска Splunk к ClickHouse {#connect-splunk-search-to-clickhouse}

Перейдите в DB Connect App Configuration -> Databases -> Identities и создайте учётные данные для вашего ClickHouse.

Создайте новое подключение к ClickHouse: перейдите в Configuration -> Databases -> Connections и выберите «New Connection».

<Image
  img={splunk_4}
  size='sm'
  border
  alt='Кнопка создания нового подключения в Splunk DB Connect'
/>

<br />

Укажите данные хоста ClickHouse и убедитесь, что установлен флажок «Enable SSL»:

<Image
  img={splunk_5}
  size='md'
  border
  alt='Страница настройки подключения Splunk для ClickHouse'
/>

После сохранения подключения вы успешно подключите ClickHouse к Splunk!

:::note
Если возникла ошибка, убедитесь, что IP-адрес вашего экземпляра Splunk добавлен в список разрешённых IP-адресов ClickHouse Cloud. Подробнее см. в [документации](/cloud/security/setting-ip-filters).
:::


## Выполнение SQL-запроса {#run-a-sql-query}

Теперь выполним SQL-запрос, чтобы убедиться, что всё работает.

Выберите параметры подключения в SQL Explorer из раздела DataLab приложения DB Connect App. В этой демонстрации используется таблица `trips`:

<Image
  img={splunk_6}
  size='md'
  border
  alt='Выбор подключения к ClickHouse в Splunk SQL Explorer'
/>

Выполните SQL-запрос к таблице `trips`, который возвращает количество всех записей в таблице:

<Image
  img={splunk_7}
  size='md'
  border
  alt='Выполнение SQL-запроса в Splunk, показывающее количество записей в таблице trips'
/>

При успешном выполнении запроса вы увидите результаты.


## Создание дашборда {#create-a-dashboard}

Создадим дашборд, который использует комбинацию SQL и мощного языка обработки Splunk (SPL).

Перед началом работы необходимо [отключить защитные механизмы DPL](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards).

Выполните следующий запрос, который показывает топ-10 районов с наибольшим количеством посадок пассажиров:

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

Перейдите на вкладку визуализации для просмотра созданной столбчатой диаграммы:

<Image
  img={splunk_8}
  size='lg'
  border
  alt='Визуализация столбчатой диаграммы Splunk с топ-10 районов посадки пассажиров'
/>

Теперь создадим дашборд, нажав Save As > Save to a Dashboard.

Добавим еще один запрос, который показывает среднюю стоимость поездки в зависимости от количества пассажиров.

```sql
dbxquery query="SELECT passenger_count,avg(total_amount)
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

На этот раз создадим визуализацию в виде линейчатой диаграммы и сохраним её на созданный ранее дашборд.

<Image
  img={splunk_9}
  size='lg'
  border
  alt='Линейчатая диаграмма Splunk со средней стоимостью поездки по количеству пассажиров'
/>

Наконец, добавим еще один запрос, который показывает корреляцию между количеством пассажиров и расстоянием поездки:

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(* FROM default.trips)
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC; " connection="chc"
```

Итоговый дашборд должен выглядеть следующим образом:

<Image
  img={splunk_10}
  size='lg'
  border
  alt='Итоговый дашборд Splunk с несколькими визуализациями данных о поездках такси в Нью-Йорке'
/>


## Данные временных рядов {#time-series-data}

Splunk содержит сотни встроенных функций, которые могут использоваться в дашбордах для визуализации и представления данных временных рядов. В этом примере SQL и SPL объединяются для создания запроса, работающего с данными временных рядов в Splunk

```sql
dbxquery query="SELECT time, orig_h, duration
FROM "demo"."conn" WHERE time >= now() - interval 1 HOURS" connection="chc"
| eval time = strptime(time, "%Y-%m-%d %H:%M:%S.%3Q")
| eval _time=time
| timechart avg(duration) as duration by orig_h
| eval duration=round(duration/60)
| sort - duration:
```


## Дополнительная информация {#learn-more}

Дополнительную информацию о Splunk DB Connect и создании дашбордов можно найти в [документации Splunk](https://docs.splunk.com/Documentation).
