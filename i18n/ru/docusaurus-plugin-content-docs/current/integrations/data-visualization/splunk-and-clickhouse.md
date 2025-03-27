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

Splunk — это популярная технология для обеспечения безопасности и наблюдаемости. Она также представляет собой мощный движок поиска и создания панелей мониторинга. Существует множество приложений Splunk, предназначенных для различных сценариев использования.

Для ClickHouse мы используем [Splunk DB Connect App](https://splunkbase.splunk.com/app/2686), который имеет простую интеграцию с высокопроизводительным JDBC-драйвером ClickHouse для прямого запроса таблиц в ClickHouse.

Идеальный сценарий использования этой интеграции заключается в том, что вы используете ClickHouse для работы с большими источниками данных, такими как NetFlow, бинарные данные Avro или Protobuf, логи потоков VPC, и другие логи OTEL, которые могут быть поделены с вашей командой в Splunk для поиска и создания панелей. Таким образом, данные не загружаются в индексный слой Splunk, а просто запрашиваются напрямую из ClickHouse, аналогично другим интеграциям визуализации, таким как [Metabase](https://www.metabase.com/) или [Superset](https://superset.apache.org/).

## Цель​ {#goal}

В этом руководстве мы используем JDBC-драйвер ClickHouse для подключения ClickHouse к Splunk. Мы установим локальную версию Splunk Enterprise, но не будем индексировать никаких данных. Вместо этого мы будем использовать функции поиска через движок запросов DB Connect.

С помощью этого руководства вы сможете создать панель мониторинга, подключенную к ClickHouse, подобную этой:

<Image img={splunk_1} size="lg" border alt="Панель мониторинга Splunk, показывающая визуализации данных такси NYC" />

:::note
В этом руководстве используется [набор данных такси Нью-Йорка](/getting-started/example-datasets/nyc-taxi). Существует множество других наборов данных, которые вы можете использовать из [нашей документации](http://localhost:3000/docs/getting-started/example-datasets).
:::

## Предварительные требования {#prerequisites}

Перед тем как начать, вам потребуется:
- Splunk Enterprise для использования функций поискового узла
- Установленные [требования к Java Runtime Environment (JRE)](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites) на вашей ОС или контейнере
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- Доступ администратора или через SSH к вашему экземпляру Splunk Enterprise
- Данные подключения к ClickHouse (см. [здесь](/integrations/metabase#1-gather-your-connection-details), если вы используете ClickHouse Cloud)

## Установка и настройка DB Connect на Splunk Enterprise {#install-and-configure-db-connect-on-splunk-enterprise}

Сначала необходимо установить Java Runtime Environment на ваш экземпляр Splunk Enterprise. Если вы используете Docker, вы можете использовать команду `microdnf install java-11-openjdk`.

Запишите путь `java_home`: `java -XshowSettings:properties -version`.

Убедитесь, что приложение DB Connect установлено на Splunk Enterprise. Вы можете найти его в разделе Приложения веб-интерфейса Splunk:
- Залогиньтесь в Splunk Web и перейдите в Приложения > Найти больше приложений
- Используйте строку поиска, чтобы найти DB Connect
- Нажмите зеленую кнопку "Установить" рядом с Splunk DB Connect
- Нажмите "Перезапустить Splunk"

Если у вас возникли проблемы с установкой приложения DB Connect, пожалуйста, посмотрите [по этой ссылке](https://splunkbase.splunk.com/app/2686) для получения дополнительных инструкций.

После проверки установки приложения DB Connect добавьте путь java_home в приложение DB Connect в Конфигурация -> Настройки и нажмите сохранить, затем сбросить.

<Image img={splunk_2} size="md" border alt="Страница настроек Splunk DB Connect с конфигурацией Java Home" />

## Настройка JDBC для ClickHouse {#configure-jdbc-for-clickhouse}

Скачайте [JDBC-драйвер ClickHouse](https://github.com/ClickHouse/clickhouse-java) в папку драйверов DB Connect, например:

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

Затем вам нужно отредактировать конфигурацию типов подключения в `$SPLUNK_HOME/etc/apps/splunk_app_db_connect/default/db_connection_types.conf`, чтобы добавить детали класса JDBC-драйвера ClickHouse.

Добавьте следующий фрагмент в файл:

```text
[ClickHouse]
displayName = ClickHouse
serviceClass = com.splunk.dbx2.DefaultDBX2JDBC
jdbcUrlFormat = jdbc:ch://<host>:<port>/<database>
jdbcUrlSSLFormat = jdbc:ch://<host>:<port>/<database>?ssl=true
jdbcDriverClass = com.clickhouse.jdbc.ClickHouseDriver
ui_default_catalog = $database$
```

Перезапустите Splunk с помощью `$SPLUNK_HOME/bin/splunk restart`.

Вернитесь в приложение DB Connect и перейдите в Конфигурация > Настройки > Драйверы. Вы должны увидеть зеленую галочку рядом с ClickHouse:

<Image img={splunk_3} size="lg" border alt="Страница драйверов Splunk DB Connect, показывающая успешно установленный драйвер ClickHouse" />

## Подключение поиска Splunk к ClickHouse {#connect-splunk-search-to-clickhouse}

Перейдите в Конфигурация приложения DB Connect -> Базы данных -> Идентификаторы: Создайте идентификатор для вашего ClickHouse.

Создайте новое соединение с ClickHouse из Конфигурация -> Базы данных -> Соединения и выберите "Новое соединение".

<Image img={splunk_4} size="sm" border alt="Кнопка нового соединения Splunk DB Connect" />

<br />

Добавьте детали хоста ClickHouse и убедитесь, что "Включить SSL" отмечено:

<Image img={splunk_5} size="md" border alt="Страница конфигурации соединения Splunk для ClickHouse" />

После сохранения соединения вы успешно подключились к ClickHouse из Splunk!

:::note
Если вы получили ошибку, убедитесь, что вы добавили IP-адрес вашего экземпляра Splunk в список доступных IP-адресов ClickHouse Cloud. Посмотрите [документацию](/cloud/security/setting-ip-filters) для получения дополнительной информации.
:::

## Выполнение SQL-запроса {#run-a-sql-query}

Теперь мы выполним SQL-запрос, чтобы протестировать, что все работает.

Выберите ваши данные подключения в SQL Explorer из секции DataLab приложения DB Connect. Мы используем таблицу `trips` для этой демонстрации:

<Image img={splunk_6} size="md" border alt="Выбор соединения с ClickHouse в SQL Explorer Splunk" />

Выполните SQL-запрос на таблице `trips`, который возвращает общее количество всех записей в таблице:

<Image img={splunk_7} size="md" border alt="Выполнение SQL-запроса Splunk, показывающее количество записей в таблице trips" />

Если ваш запрос успешен, вы должны увидеть результаты.

## Создание панели мониторинга {#create-a-dashboard}

Давайте создадим панель мониторинга, которая использует сочетание SQL и мощного языка обработки Splunk (SPL).

Перед тем как продолжить, вам нужно сначала [деактивировать меры предосторожности DPL](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards).

Запустите следующий запрос, который показывает нам 10 районов с наиболее частыми вызовами:

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

Выберите вкладку визуализации, чтобы увидеть созданный столбчатый график:

<Image img={splunk_8} size="lg" border alt="Визуализация столбчатой диаграммы Splunk, показывающая 10 районов вызовов" />

Теперь мы создадим панель мониторинга, нажав “Сохранить как” > “Сохранить на панель мониторинга”.

Добавим еще один запрос, который показывает среднюю стоимость поездки в зависимости от числа пассажиров.

```sql
dbxquery query="SELECT passenger_count,avg(total_amount)
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

На этот раз создадим визуализацию в виде столбчатой диаграммы и сохраним её на предыдущую панель мониторинга.

<Image img={splunk_9} size="lg" border alt="Столбчатая диаграмма Splunk, показывающая среднюю стоимость поездки по количеству пассажиров" />

Наконец, добавим еще один запрос, который показывает зависимость между количеством пассажиров и расстоянием поездки:

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(* FROM default.trips)
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC;" connection="chc"
```

Наша финальная панель мониторинга должна выглядеть так:

<Image img={splunk_10} size="lg" border alt="Финальная панель мониторинга Splunk с несколькими визуализациями данных такси NYC" />

## Данные временных рядов {#time-series-data}

Splunk имеет сотни встроенных функций, которые могут использоваться для визуализации и представления данных временных рядов на панелях мониторинга. Этот пример объединит SQL и SPL, чтобы создать запрос, который может работать с данными временных рядов в Splunk:

```sql
dbxquery query="SELECT time, orig_h, duration
FROM "demo"."conn" WHERE time >= now() - interval 1 HOURS" connection="chc"
| eval time = strptime(time, "%Y-%m-%d %H:%M:%S.%3Q")
| eval _time=time
| timechart avg(duration) as duration by orig_h
| eval duration=round(duration/60)
| sort - duration:
```

## Узнайте больше {#learn-more}

Если вы хотите узнать больше о Splunk DB Connect и о том, как создавать панели мониторинга, посетите [документацию Splunk](https://docs.splunk.com/Documentation).
