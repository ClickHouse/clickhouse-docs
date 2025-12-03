---
sidebar_label: 'Splunk'
sidebar_position: 198
slug: /integrations/splunk
keywords: ['Splunk', 'integration', 'data visualization']
description: 'Подключите дашборды Splunk к ClickHouse'
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

# Подключение Splunk к ClickHouse {#connecting-splunk-to-clickhouse}

<ClickHouseSupportedBadge/>

:::tip
Хотите сохранять журналы аудита ClickHouse в Splunk? См. руководство ["Storing ClickHouse Cloud Audit logs into Splunk"](/integrations/audit-splunk).
:::

Splunk — популярная платформа для обеспечения безопасности и наблюдаемости. Это также мощный движок для поиска и построения дашбордов. Существуют сотни приложений Splunk для решения различных задач.

Специально для ClickHouse мы используем [Splunk DB Connect App](https://splunkbase.splunk.com/app/2686), который обеспечивает простую интеграцию с высокопроизводительным JDBC-драйвером ClickHouse для прямого выполнения запросов к таблицам в ClickHouse.

Идеальный сценарий использования этой интеграции — когда вы применяете ClickHouse для больших объёмов данных, таких как NetFlow, двоичные данные Avro или Protobuf, DNS, журналы трафика VPC и другие журналы OTel, которыми можно делиться с вашей командой в Splunk для поиска и построения дашбордов. При таком подходе данные не проходят приём в индексный слой Splunk, а запрашиваются напрямую из ClickHouse, аналогично другим интеграциям для визуализации, таким как [Metabase](https://www.metabase.com/) или [Superset](https://superset.apache.org/).

## Цель​ {#goal}

В этом руководстве мы будем использовать JDBC-драйвер ClickHouse для подключения ClickHouse к Splunk. Мы установим локальный экземпляр Splunk Enterprise, но не будем индексировать какие-либо данные. Вместо этого мы будем использовать функции поиска через движок запросов DB Connect.

С помощью этого руководства вы сможете создать панель мониторинга, подключённую к ClickHouse, похожую на эту:

<Image img={splunk_1} size="lg" border alt="Панель Splunk с визуализациями данных такси Нью-Йорка" />

:::note
В этом руководстве используется [набор данных такси города Нью-Йорк](/getting-started/example-datasets/nyc-taxi). В нашей [документации](http://localhost:3000/docs/getting-started/example-datasets) есть и многие другие наборы данных, которые вы можете использовать.
:::

## Предварительные требования {#prerequisites}

Перед началом работы вам потребуется:
- Splunk Enterprise для использования функций поискового узла (search head)
- Установленный в вашей ОС или контейнере [Java Runtime Environment (JRE)](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites), удовлетворяющий требованиям
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- Административный или SSH-доступ к экземпляру ОС с установленным Splunk Enterprise
- Данные для подключения к ClickHouse (см. [здесь](/integrations/metabase#1-gather-your-connection-details), если вы используете ClickHouse Cloud)

## Установка и настройка DB Connect в Splunk Enterprise {#install-and-configure-db-connect-on-splunk-enterprise}

Сначала необходимо установить Java Runtime Environment на инстанс Splunk Enterprise. Если вы используете Docker, можно выполнить команду `microdnf install java-11-openjdk`.

Определите и запишите путь к `java_home`: `java -XshowSettings:properties -version`.

Убедитесь, что приложение DB Connect установлено в Splunk Enterprise. Его можно найти в разделе Apps веб-интерфейса Splunk:
- Войдите в Splunk Web и перейдите в Apps > Find More Apps
- Используйте поле поиска, чтобы найти DB Connect
- Нажмите зелёную кнопку "Install" рядом с Splunk DB Connect
- Нажмите "Restart Splunk"

Если у вас возникают проблемы с установкой приложения DB Connect, обратитесь к [этой странице](https://splunkbase.splunk.com/app/2686) за дополнительными инструкциями.

После того как вы убедились, что приложение DB Connect установлено, добавьте путь к `java_home` в приложение DB Connect в разделе Configuration -> Settings, затем нажмите "Save" и "Reset".

<Image img={splunk_2} size="md" border alt="Страница настроек Splunk DB Connect с конфигурацией Java Home" />

## Настройка JDBC для ClickHouse {#configure-jdbc-for-clickhouse}

Скачайте [драйвер ClickHouse JDBC](https://github.com/ClickHouse/clickhouse-java) в папку DB Connect Drivers, например:

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

Затем необходимо отредактировать конфигурацию типов подключений в `$SPLUNK_HOME/etc/apps/splunk_app_db_connect/default/db_connection_types.conf`, чтобы добавить сведения о классе драйвера JDBC для ClickHouse.

Добавьте в файл следующий раздел:

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

Вернитесь в приложение DB Connect и перейдите в Configuration &gt; Settings &gt; Drivers. Рядом с ClickHouse вы должны увидеть зелёную галочку:

<Image img={splunk_3} size="lg" border alt="Страница драйверов Splunk DB Connect, на которой показано, что драйвер ClickHouse успешно установлен" />

## Подключение поиска Splunk к ClickHouse {#connect-splunk-search-to-clickhouse}

Перейдите в DB Connect App Configuration -> Databases -> Identities и создайте Identity для вашего ClickHouse.

Создайте новое подключение к ClickHouse в Configuration -> Databases -> Connections и выберите «New Connection».

<Image img={splunk_4} size="sm" border alt="Кнопка создания нового подключения Splunk DB Connect" />

<br />

Добавьте параметры хоста ClickHouse и убедитесь, что установлен флажок «Enable SSL»:

<Image img={splunk_5} size="md" border alt="Страница настройки подключения Splunk к ClickHouse" />

После сохранения этого подключения ClickHouse будет успешно подключён к Splunk!

:::note
Если вы получили ошибку, убедитесь, что добавили IP-адрес вашего экземпляра Splunk в список ClickHouse Cloud IP Access List. Для получения дополнительной информации смотрите [документацию](/cloud/security/setting-ip-filters).
:::

## Выполнение SQL-запроса {#run-a-sql-query}

Теперь мы выполним SQL-запрос, чтобы убедиться, что всё работает корректно.

Выберите параметры подключения в SQL Explorer в разделе DataLab приложения DB Connect. В этом примере мы используем таблицу `trips`:

<Image img={splunk_6} size="md" border alt="Выбор подключения к ClickHouse в Splunk SQL Explorer" />

Выполните SQL-запрос к таблице `trips`, который вернёт количество всех записей в таблице:

<Image img={splunk_7} size="md" border alt="Выполнение SQL-запроса в Splunk, показывающее количество записей в таблице trips" />

Если запрос выполнен успешно, вы должны увидеть результат.

## Создайте дашборд {#create-a-dashboard}

Давайте создадим дашборд, который использует сочетание SQL и мощного Splunk Processing Language (SPL).

Прежде чем продолжить, сначала необходимо [деактивировать DPL Safeguards](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards).

Выполните следующий запрос, который показывает 10 районов с наибольшей частотой посадок пассажиров:

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

Выберите вкладку визуализации, чтобы просмотреть созданную столбчатую диаграмму:

<Image img={splunk_8} size="lg" border alt="Визуализация в Splunk: столбчатая диаграмма, показывающая топ-10 районов посадки" />

Теперь создадим дашборд, нажав Save As &gt; Save to Dashboard.

Добавим ещё один запрос, который покажет средний тариф в зависимости от числа пассажиров.

```sql
dbxquery query="SELECT passenger_count,avg(total_amount)
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

На этот раз давайте создадим визуализацию в виде столбчатой диаграммы и сохраним её в ранее созданную панель мониторинга.

<Image img={splunk_9} size="lg" border alt="Столбчатая диаграмма Splunk, показывающая среднюю стоимость проезда по количеству пассажиров" />

Наконец, добавим ещё один запрос, который показывает корреляцию между количеством пассажиров и расстоянием поездки:

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(* FROM default.trips)
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC; " connection="chc"
```

В итоге наш дашборд должен выглядеть так:

<Image img={splunk_10} size="lg" border alt="Final Splunk dashboard with multiple visualizations of NYC taxi data" />

## Данные временных рядов {#time-series-data}

В Splunk есть сотни встроенных функций, которые дашборды могут использовать для визуализации и представления данных временных рядов. В этом примере будут объединены SQL и SPL для создания запроса, который может работать с данными временных рядов в Splunk.

```sql
dbxquery query="SELECT time, orig_h, duration
FROM "demo"."conn" WHERE time >= now() - interval 1 HOURS" connection="chc"
| eval time = strptime(time, "%Y-%m-%d %H:%M:%S.%3Q")
| eval _time=time
| timechart avg(duration) as duration by orig_h
| eval duration=round(duration/60)
| sort - duration:
```

## Дополнительные материалы {#learn-more}

Если вы хотите получить больше информации о Splunk DB Connect и создании дашбордов, перейдите к [документации Splunk](https://docs.splunk.com/Documentation).
