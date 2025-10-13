---
slug: '/integrations/splunk'
sidebar_label: Splunk
sidebar_position: 198
description: 'Подключите панели управления Splunk к ClickHouse'
title: 'Подключение Splunk к ClickHouse'
keywords: ['Splunk', 'интеграция', 'визуализация данных']
doc_type: guide
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

Splunk — это популярная технология для обеспечения безопасности и мониторинга. Это также мощный движок для поиска и построения панелей мониторинга. Существует сотни приложений Splunk, доступных для решения различных задач.

Для ClickHouse мы используем [приложение Splunk DB Connect](https://splunkbase.splunk.com/app/2686), которое имеет простую интеграцию с высокопроизводительным драйвером ClickHouse JDBC для выполнения запросов к таблицам ClickHouse напрямую.

Идеальный случай использования для этой интеграции — это когда вы используете ClickHouse для больших источников данных, таких как NetFlow, Avro или Protobuf бинарные данные, DNS, VPC журналы потоков и другие OTEL журналы, которые могут быть поделены с вашей командой в Splunk для поиска и создания панелей мониторинга. Используя этот подход, данные не загружаются в индексный слой Splunk, а просто извлекаются непосредственно из ClickHouse, аналогично другим интеграциям визуализации, таким как [Metabase](https://www.metabase.com/) или [Superset](https://superset.apache.org/).

## Цель​ {#goal}

В этом руководстве мы используем драйвер ClickHouse JDBC, чтобы подключить ClickHouse к Splunk. Мы установим локальную версию Splunk Enterprise, но мы не будем индексировать никаких данных. Вместо этого мы используем функции поиска через движок запросов DB Connect.

С помощью этого руководства вы сможете создать панель мониторинга, подключенную к ClickHouse, аналогичную этой:

<Image img={splunk_1} size="lg" border alt="Панель мониторинга Splunk с визуализациями данных такси Нью-Йорка" />

:::note
Это руководство использует [набор данных такси Нью-Йорка](/getting-started/example-datasets/nyc-taxi). Существует множество других наборов данных, которые вы можете использовать из [нашей документации](http://localhost:3000/docs/getting-started/example-datasets).
:::

## Предварительные условия {#prerequisites}

Перед тем как начать, вам нужно:
- Splunk Enterprise для использования функций поиска
- Установленные требования к [Java Runtime Environment (JRE)](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites) на вашей ОС или контейнере
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- Администраторский доступ или доступ по SSH к вашему экземпляру Splunk Enterprise
- Данные подключения к ClickHouse (см. [здесь](/integrations/metabase#1-gather-your-connection-details), если вы используете ClickHouse Cloud)

## Установите и настройте DB Connect на Splunk Enterprise {#install-and-configure-db-connect-on-splunk-enterprise}

Сначала необходимо установить Java Runtime Environment на ваш экземпляр Splunk Enterprise. Если вы используете Docker, вы можете использовать команду `microdnf install java-11-openjdk`.

Запишите путь `java_home`: `java -XshowSettings:properties -version`.

Убедитесь, что приложение DB Connect установлено на Splunk Enterprise. Вы можете найти его в разделе Приложения веб-интерфейса Splunk:
- Войдите в Splunk Web и перейдите в Apps > Найти другие приложения
- Используйте строку поиска, чтобы найти DB Connect
- Нажмите на зеленую кнопку "Установить" рядом с Splunk DB Connect
- Нажмите "Перезапустить Splunk"

Если у вас возникли проблемы с установкой приложения DB Connect, ознакомьтесь с [этой ссылкой](https://splunkbase.splunk.com/app/2686) для получения дополнительных инструкций.

После того как вы убедились, что приложение DB Connect установлено, добавьте путь java_home в приложение DB Connect в Конфигурация -> Настройки и нажмите сохранить, затем сбросить.

<Image img={splunk_2} size="md" border alt="Страница настроек Splunk DB Connect, показывающая конфигурацию Java Home" />

## Настройка JDBC для ClickHouse {#configure-jdbc-for-clickhouse}

Скачайте [драйвер ClickHouse JDBC](https://github.com/ClickHouse/clickhouse-java) в папку драйверов DB Connect, такую как:

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

Затем необходимо отредактировать конфигурацию типов соединений по следующему пути `$SPLUNK_HOME/etc/apps/splunk_app_db_connect/default/db_connection_types.conf`, чтобы добавить детали класса драйвера ClickHouse JDBC.

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

Перезапустите Splunk, используя `$SPLUNK_HOME/bin/splunk restart`.

Вернитесь в приложение DB Connect и перейдите в Конфигурация > Настройки > Драйверы. Вы должны увидеть зеленую галочку рядом с ClickHouse:

<Image img={splunk_3} size="lg" border alt="Страница драйверов Splunk DB Connect, показывающая успешную установку драйвера ClickHouse" />

## Подключите поиск Splunk к ClickHouse {#connect-splunk-search-to-clickhouse}

Перейдите в приложение DB Connect Конфигурация -> Базы данных -> Идентификаторы: Создайте идентификатор для вашего ClickHouse.

Создайте новое соединение с ClickHouse из Конфигурация -> Базы данных -> Соединения и выберите "Новое соединение".

<Image img={splunk_4} size="sm" border alt="Кнопка нового соединения в Splunk DB Connect" />

<br />

Добавьте детали хоста ClickHouse и убедитесь, что стоит галочка "Включить SSL":

<Image img={splunk_5} size="md" border alt="Страница конфигурации соединения Splunk для ClickHouse" />

После сохранения соединения вы успешно подключились к ClickHouse в Splunk!

:::note
Если вы получили ошибку, убедитесь, что вы добавили IP-адрес вашего экземпляра Splunk в список IP-адресов с доступом в ClickHouse Cloud. См. [документацию](/cloud/security/setting-ip-filters) для получения дополнительной информации.
:::

## Выполнение SQL-запроса {#run-a-sql-query}

Теперь мы выполним SQL-запрос, чтобы проверить, работает ли всё.

Выберите ваши данные подключения в SQL Explorer из раздела DataLab приложения DB Connect. Мы используем таблицу `trips` для этой демонстрации:

<Image img={splunk_6} size="md" border alt="Splunk SQL Explorer, выбирающий соединение с ClickHouse" />

Выполните SQL-запрос к таблице `trips`, который возвращает количество всех записей в таблице:

<Image img={splunk_7} size="md" border alt="Выполнение SQL-запроса Splunk, показывающее количество записей в таблице trips" />

Если ваш запрос успешен, вы должны увидеть результаты.

## Создайте панель мониторинга {#create-a-dashboard}

Давайте создадим панель мониторинга, которая использует сочетание SQL и мощного Языка обработки Splunk (SPL).

Перед тем как продолжить, вы должны сначала [Деактивировать защиты DPL](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards).

Запустите следующий запрос, который показывает нам 10 районов с наибольшим количеством подъёмов:

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

Выберите вкладку визуализации, чтобы просмотреть созданную столбчатую диаграмму:

<Image img={splunk_8} size="lg" border alt="Визуализация столбчатой диаграммы Splunk, показывающая 10 лучших районов подъёмов" />

Теперь мы создадим панель мониторинга, нажав Сохранить как > Сохранить в панель мониторинга.

Добавим еще один запрос, который показывает среднюю стоимость на основе количества пассажиров.

```sql
dbxquery query="SELECT passenger_count,avg(total_amount)
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

На этот раз давайте создадим визуализацию в виде столбчатой диаграммы и сохраним её на предыдущей панели мониторинга.

<Image img={splunk_9} size="lg" border alt="Столбчатая диаграмма Splunk, показывающая среднюю стоимость по количеству пассажиров" />

Наконец, давайте добавим еще один запрос, который показывает корреляцию между количеством пассажиров и расстоянием поездки:

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(* FROM default.trips)
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC; " connection="chc"
```

Наша финальная панель мониторинга должна выглядеть так:

<Image img={splunk_10} size="lg" border alt="Финальная панель мониторинга Splunk с несколькими визуализациями данных такси NYC" />

## Данные временных рядов {#time-series-data}

Splunk имеет сотни встроенных функций, которые могут использоваться для визуализации и представления данных временных рядов на панелях мониторинга. Этот пример сочетает SQL и SPL, чтобы создать запрос, который может работать с данными временных рядов в Splunk

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

Если вы хотите найти больше информации о Splunk DB Connect и о том, как создавать панели мониторинга, посетите [документацию Splunk](https://docs.splunk.com/Documentation).