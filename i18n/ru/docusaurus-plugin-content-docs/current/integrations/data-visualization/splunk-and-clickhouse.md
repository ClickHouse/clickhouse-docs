---
sidebar_label: Splunk
sidebar_position: 198
slug: /integrations/splunk
keywords: ['Splunk', 'integration', 'data visualization']
description: 'Подключение панелей Splunk к ClickHouse'
---

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


# Подключение Splunk к ClickHouse

Splunk — популярная технология для обеспечения безопасности и наблюдаемости. Это также мощный движок поиска и создания панелей мониторинга. Существует множество приложений Splunk, доступных для решения различных задач.

Для ClickHouse мы используем [Splunk DB Connect App](https://splunkbase.splunk.com/app/2686), который обеспечивает простую интеграцию с высокопроизводительным JDBC-драйвером ClickHouse для выполнения запросов к таблицам ClickHouse напрямую.

Идеальный случай для этой интеграции — это использование ClickHouse для больших источников данных, таких как NetFlow, бинарные данные Avro или Protobuf, DNS, журналы потока VPC и другие журналы OTEL, которые можно поделиться с вашей командой в Splunk для поиска и создания панелей мониторинга. Используя этот подход, данные не загружаются в слой индексации Splunk, а просто запрашиваются напрямую из ClickHouse, аналогично другим интеграциям визуализации, таким как [Metabase](https://www.metabase.com/) или [Superset](https://superset.apache.org/).

## Цель​ {#goal}

В этом руководстве мы будем использовать JDBC-драйвер ClickHouse для подключения ClickHouse к Splunk. Мы установим локальную версию Splunk Enterprise, но не будем индексировать никакие данные. Вместо этого мы будем использовать функции поиска через движок запросов DB Connect.

С помощью этого руководства вы сможете создать панель мониторинга, подключенную к ClickHouse, похожую на эту:

<img src={splunk_1} class="image" alt="Splunk"/>

:::note
Это руководство использует [набор данных такси Нью-Йорка](/getting-started/example-datasets/nyc-taxi). Есть много других наборов данных, которые вы можете использовать из [нашей документации](http://localhost:3000/docs/getting-started/example-datasets).
:::

## Некоторые предварительные требования {#prerequisites}

Перед тем как начать, вам потребуется:
- Splunk Enterprise для использования функций поиска
- Установленные требования [Java Runtime Environment (JRE)](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites) на вашей ОС или контейнере
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- Доступ администратора или SSH к вашему экземпляру ОС Splunk Enterprise
- Подробности подключения к ClickHouse (см. [здесь](/integrations/metabase#1-gather-your-connection-details), если вы используете ClickHouse Cloud)

## Установите и настройте DB Connect на Splunk Enterprise {#install-and-configure-db-connect-on-splunk-enterprise}

Сначала вы должны установить Java Runtime Environment на вашем экземпляре Splunk Enterprise. Если вы используете Docker, вы можете использовать команду `microdnf install java-11-openjdk`.

Запишите путь `java_home`: `java -XshowSettings:properties -version`.

Убедитесь, что приложение DB Connect установлено на Splunk Enterprise. Вы можете найти его в разделе Приложения в веб-интерфейсе Splunk:
- Войдите в Splunk Web и перейдите в Apps > Найти другие приложения
- Используйте строку поиска, чтобы найти DB Connect
- Нажмите зеленую кнопку "Установить" рядом со Splunk DB Connect
- Нажмите "Перезапустить Splunk"

Если у вас есть проблемы с установкой приложения DB Connect, пожалуйста, смотрите [эту ссылку](https://splunkbase.splunk.com/app/2686) для получения дополнительных инструкций.

После проверки установки приложения DB Connect добавьте путь java_home в приложение DB Connect в Конфигурация -> Настройки и нажмите сохранить, затем сбросить.

<img src={splunk_2} class="image" alt="Splunk 2"/>

## Настройте JDBC для ClickHouse {#configure-jdbc-for-clickhouse}

Скачайте [JDBC-драйвер ClickHouse](https://github.com/ClickHouse/clickhouse-java) в папку драйверов DB Connect, такую как:

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

Затем вам нужно отредактировать конфигурацию типов соединений в файле `$SPLUNK_HOME/etc/apps/splunk_app_db_connect/default/db_connection_types.conf`, чтобы добавить информацию о классе JDBC-драйвера ClickHouse.

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

<img src={splunk_3} class="image" alt="Splunk 3"/>

## Подключите поиск Splunk к ClickHouse {#connect-splunk-search-to-clickhouse}

Перейдите в Конфигурация приложения DB Connect -> Базы данных -> Идентификаторы: создайте идентификатор для вашего ClickHouse.

Создайте новое соединение с ClickHouse в Конфигурация -> Базы данных -> Соединения и выберите "Новое соединение".

<img width="100" style={{width: '250px'}} src={splunk_4} class="image"/>

<br />

Добавьте данные хоста ClickHouse и убедитесь, что опция "Включить SSL" отмечена:

<img src={splunk_5} class="image" alt="Splunk 5"/>

После сохранения соединения вы успешно подключились к ClickHouse через Splunk!

:::note
Если вы получили ошибку, убедитесь, что вы добавили IP-адрес вашего экземпляра Splunk в список IP-доступа ClickHouse Cloud. См. [документацию](/cloud/security/setting-ip-filters) для получения дополнительной информации.
:::

## Выполните SQL-запрос {#run-a-sql-query}

Теперь мы выполним SQL-запрос, чтобы проверить, что все работает.

Выберите свои данные подключения в SQL-эксплорере из раздела DataLab приложения DB Connect. Мы используем таблицу `trips` для этой демонстрации:

<img src={splunk_6} class="image" alt="Splunk 6"/>

Выполните SQL-запрос для таблицы `trips`, который возвращает количество всех записей в таблице:

<img src={splunk_7} class="image" alt="Splunk 7"/>

Если ваш запрос успешен, вы должны увидеть результаты.

## Создайте панель мониторинга {#create-a-dashboard}

Давайте создадим панель мониторинга, которая сочетает SQL и мощный язык обработки Splunk (SPL).

Перед тем как продолжить, вы должны сначала [деактивировать DPL-защиты](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards).

Запустите следующий запрос, который показывает нам 10 районов с наибольшим числом заборов:

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

Выберите вкладку визуализации, чтобы просмотреть созданную колонную диаграмму:

<img src={splunk_8} class="image" alt="Splunk 8"/>

Теперь мы создадим панель мониторинга, нажав "Сохранить как" > "Сохранить в панель мониторинга".

Давайте добавим еще один запрос, который показывает средний тариф в зависимости от количества пассажиров.

```sql
dbxquery query="SELECT passenger_count,avg(total_amount)
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

На этот раз давайте создадим визуализацию в виде столбчатой диаграммы и сохраним ее на предыдущей панели мониторинга.

<img src={splunk_9} class="image" alt="Splunk 9"/>

Наконец, давайте добавим еще один запрос, который показывает взаимосвязь между числом пассажиров и расстоянием поездки:

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(*) FROM default.trips
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC;" connection="chc"
```

Наша финальная панель мониторинга должна выглядеть так:

<img src={splunk_10} class="image" alt="Splunk 10"/>

## Данные временных рядов {#time-series-data}

Splunk имеет сотни встроенных функций, которые панели мониторинга могут использовать для визуализации и представления данных временных рядов. Этот пример сочетает SQL и SPL для создания запроса, который может работать с данными временных рядов в Splunk.

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

Если вы хотите узнать больше о Splunk DB Connect и о том, как создавать панели мониторинга, посетите [документацию Splunk](https://docs.splunk.com/Documentation).
