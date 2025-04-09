---
sidebar_label: 'Splunk'
sidebar_position: 198
slug: /integrations/splunk
keywords: ['Splunk', 'интеграция', 'визуализация данных']
description: 'Подключите панели мониторинга Splunk к ClickHouse'
title: 'Подключение Splunk к ClickHouse'
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

Splunk - это популярная технология для обеспечения безопасности и мониторинга. Она также является мощным движком для поиска и создания панелей мониторинга. Существует сотни приложений Splunk для различных сценариев использования.

Для ClickHouse в частности мы используем [Приложение Splunk DB Connect](https://splunkbase.splunk.com/app/2686), которое имеет простую интеграцию с высокопроизводительным JDBC-драйвером ClickHouse для прямого запроса таблиц в ClickHouse.

Идеальный сценарий использования для этой интеграции - это ситуации, когда вы используете ClickHouse для работы с крупными источниками данных, такими как NetFlow, Avro или Protobuf бинарные данные, DNS, журналы потока VPC и другие журналы OTEL, которые могут быть поделены с вашей командой в Splunk для поиска и создания панелей мониторинга. Используя этот подход, данные не загружаются в уровень индексации Splunk и просто запрашиваются напрямую из ClickHouse, подобно другим интеграциям визуализации, таким как [Metabase](https://www.metabase.com/) или [Superset](https://superset.apache.org/).

## Цель​ {#goal}

В этом руководстве мы используем JDBC-драйвер ClickHouse для подключения ClickHouse к Splunk. Мы установим локальную версию Splunk Enterprise, но мы не будем индексировать никаких данных. Вместо этого мы будем использовать функции поиска через движок запросов DB Connect.

С помощью этого руководства вы сможете создать панель мониторинга, подключенную к ClickHouse, похожую на эту:

<Image img={splunk_1} size="lg" border alt="Панель мониторинга Splunk, показывающая визуализации данных такси NYC" />

:::note
Это руководство использует [данные о такси Нью-Йорка](/getting-started/example-datasets/nyc-taxi). Существует множество других наборов данных, которые вы можете использовать из [нашей документации](http://localhost:3000/docs/getting-started/example-datasets).
:::

## Предварительные условия {#prerequisites}

Прежде чем начинать, вам понадобится:
- Splunk Enterprise для использования функций поискового узла
- Установленные требования [Java Runtime Environment (JRE)](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites) на вашей ОС или контейнере
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- Доступ администратора или SSH к вашему экземпляру Splunk Enterprise OS
- Подробности подключения к ClickHouse (см. [здесь](/integrations/metabase#1-gather-your-connection-details), если вы используете ClickHouse Cloud)

## Установка и настройка DB Connect на Splunk Enterprise {#install-and-configure-db-connect-on-splunk-enterprise}

Сначала необходимо установить Java Runtime Environment на ваш экземпляр Splunk Enterprise. Если вы используете Docker, вы можете использовать команду `microdnf install java-11-openjdk`.

Запомните путь `java_home`: `java -XshowSettings:properties -version`.

Убедитесь, что приложение DB Connect установлено на Splunk Enterprise. Вы можете найти его в разделе Приложения веб-интерфейса Splunk:
- Войдите в Splunk Web и перейдите в Приложения > Найти другие приложения
- Используйте строку поиска, чтобы найти DB Connect
- Нажмите зеленую кнопку "Установить" рядом с Splunk DB Connect
- Нажмите "Перезапустить Splunk"

Если у вас возникли проблемы с установкой приложения DB Connect, пожалуйста, посмотрите [по этой ссылке](https://splunkbase.splunk.com/app/2686) для получения дополнительных инструкций.

После того, как вы убедитесь, что приложение DB Connect установлено, добавьте путь java_home в приложение DB Connect в Конфигурации -> Настройки и нажмите "Сохранить", затем "Сбросить".

<Image img={splunk_2} size="md" border alt="Страница настроек Splunk DB Connect, показывающая конфигурацию Java Home" />

## Настройка JDBC для ClickHouse {#configure-jdbc-for-clickhouse}

Скачайте [JDBC-драйвер ClickHouse](https://github.com/ClickHouse/clickhouse-java) в папку Драйверов DB Connect, например:

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

Затем вам нужно отредактировать конфигурацию типов подключения в `$SPLUNK_HOME/etc/apps/splunk_app_db_connect/default/db_connection_types.conf`, чтобы добавить детали класса драйвера JDBC ClickHouse.

Добавьте следующий раздел в файл:

```text
[ClickHouse]
displayName = ClickHouse
serviceClass = com.splunk.dbx2.DefaultDBX2JDBC
jdbcUrlFormat = jdbc:ch://<host>:<port>/<database>
jdbcUrlSSLFormat = jdbc:ch://<host>:<port>/<database>?ssl=true
jdbcDriverClass = com.clickhouse.jdbc.ClickHouseDriver
ui_default_catalog = $database$
```

Перезапустите Splunk, используя `$SPLUNK_HOME/bin/splunk restart`.

Вернитесь в приложение DB Connect и перейдите в Конфигурация > Настройки > Драйверы. Вы должны увидеть зеленую галочку рядом с ClickHouse:

<Image img={splunk_3} size="lg" border alt="Страница драйверов Splunk DB Connect, показывающая успешно установленный драйвер ClickHouse" />

## Подключение поиска Splunk к ClickHouse {#connect-splunk-search-to-clickhouse}

Перейдите к Конфигурации приложения DB Connect -> Базы данных -> Идентичности: Создайте идентичность для вашего ClickHouse.

Создайте новое соединение с ClickHouse из Конфигурации -> Базы данных -> Соединения и выберите "Новое соединение".

<Image img={splunk_4} size="sm" border alt="Кнопка нового соединения Splunk DB Connect" />

<br />

Добавьте данные хоста ClickHouse и убедитесь, что установлен флажок "Включить SSL":

<Image img={splunk_5} size="md" border alt="Страница конфигурации соединения Splunk для ClickHouse" />

После сохранения соединения вы успешно подключились к ClickHouse через Splunk!

:::note
Если вы получили ошибку, убедитесь, что вы добавили IP-адрес вашего экземпляра Splunk в Список доступа IP ClickHouse Cloud. См. [документы](/cloud/security/setting-ip-filters) для получения дополнительной информации.
:::

## Выполнение SQL-запроса {#run-a-sql-query}

Теперь мы выполним SQL-запрос, чтобы проверить, работает ли всё.

Выберите свои данные подключения в SQL-обозревателе из раздела DataLab приложения DB Connect. Мы используем таблицу `trips` для этой демонстрации:

<Image img={splunk_6} size="md" border alt="SQL-обозреватель Splunk, выбирающий соединение с ClickHouse" />

Выполните SQL-запрос в таблице `trips`, который возвращает количество всех записей в таблице:

<Image img={splunk_7} size="md" border alt="Выполнение SQL-запроса Splunk, показывающее количество записей в таблице trips" />

Если ваш запрос выполнен успешно, вы должны увидеть результаты.

## Создание панели мониторинга {#create-a-dashboard}

Давайте создадим панель мониторинга, которая использует комбинацию SQL и мощного языка обработки Splunk (SPL).

Перед тем как продолжить, сначала вам нужно [Отключить защитные функции DPL](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards).

Запустите следующий запрос, который покажет нам 10 районов с наибольшим количеством поездок:

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

Выберите вкладку визуализации, чтобы увидеть созданную столбчатую диаграмму:

<Image img={splunk_8} size="lg" border alt="Визуализация столбчатой диаграммы Splunk, показывающая 10 районов с наибольшим количеством поездок" />

Теперь мы создадим панель мониторинга, нажав "Сохранить как" > "Сохранить в панель мониторинга".

Добавим ещё один запрос, который показывает средний тариф в зависимости от количества пассажиров.

```sql
dbxquery query="SELECT passenger_count,avg(total_amount)
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

На этот раз давайте создадим визуализацию в виде столбчатой диаграммы и сохраним её на предыдущей панели мониторинга.

<Image img={splunk_9} size="lg" border alt="Столбчатая диаграмма Splunk, показывающая средний тариф по количеству пассажиров" />

Наконец, давайте добавим ещё один запрос, который показывает зависимость между количеством пассажиров и расстоянием поездки:

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(* FROM default.trips)
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC; " connection="chc"
```

Наша финальная панель мониторинга должна выглядеть так:

<Image img={splunk_10} size="lg" border alt="Финальная панель мониторинга Splunk с несколькими визуализациями данных такси NYC" />

## Данные временных рядов {#time-series-data}

Splunk имеет сотни встроенных функций, которые панели мониторинга могут использовать для визуализации и представления данных временных рядов. Этот пример объединит SQL + SPL, чтобы создать запрос, который может работать с данными временных рядов в Splunk.

```sql
dbxquery query="SELECT time, orig_h, duration
FROM "demo"."conn" WHERE time >= now() - interval 1 HOURS" connection="chc"
| eval time = strptime(time, "%Y-%m-%d %H:%M:%S.%3Q")
| eval _time=time
| timechart avg(duration) as duration by orig_h
| eval duration=round(duration/60)
| sort - duration:
```

## Узнать больше {#learn-more}

Если вы хотите найти больше информации о Splunk DB Connect и о том, как строить панели мониторинга, пожалуйста, посетите [документацию Splunk](https://docs.splunk.com/Documentation).
