---
slug: '/integrations/nifi'
sidebar_label: NiFi
sidebar_position: 12
description: 'Передача данных в ClickHouse с помощью NiFi конвейеров данных'
title: 'Соединение Apache NiFi с ClickHouse'
keywords: ['clickhouse', 'NiFi', 'connect', 'integrate', 'etl', 'data integration']
doc_type: guide
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import nifi01 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_01.png';
import nifi02 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_02.png';
import nifi03 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_03.png';
import nifi04 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_04.png';
import nifi05 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_05.png';
import nifi06 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_06.png';
import nifi07 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_07.png';
import nifi08 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_08.png';
import nifi09 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_09.png';
import nifi10 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_10.png';
import nifi11 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_11.png';
import nifi12 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_12.png';
import nifi13 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_13.png';
import nifi14 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_14.png';
import nifi15 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_15.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение Apache NiFi к ClickHouse

<CommunityMaintainedBadge/>

<a href="https://nifi.apache.org/" target="_blank">Apache NiFi</a> - это программное обеспечение для управления рабочими процессами с открытым исходным кодом, предназначенное для автоматизации потока данных между программными системами. Оно позволяет создавать конвейеры передачи данных ETL и поставляется с более чем 300 процессорами данных. Этот пошаговый учебник показывает, как подключить Apache NiFi к ClickHouse в качестве источника и получателя, а также загрузить пример набора данных.

## 1. Соберите данные для подключения {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Загрузите и запустите Apache NiFi {#2-download-and-run-apache-nifi}

1. Для новой установки загрузите двоичный файл с https://nifi.apache.org/download.html и начните с запуска `./bin/nifi.sh start`

## 3. Загрузите драйвер JDBC для ClickHouse {#3-download-the-clickhouse-jdbc-driver}

1. Перейдите на <a href="https://github.com/ClickHouse/clickhouse-java/releases" target="_blank">страницу релиза драйвера ClickHouse JDBC</a> на GitHub и найдите последнюю версию релиза JDBC
2. В релизной версии нажмите на "Показать все xx активы" и найдите JAR файл с ключевым словом "shaded" или "all", например, `clickhouse-jdbc-0.5.0-all.jar`
3. Поместите JAR файл в папку, доступную Apache NiFi, и запомните абсолютный путь

## 4. Добавьте службу контроллера `DBCPConnectionPool` и настройте его свойства {#4-add-dbcpconnectionpool-controller-service-and-configure-its-properties}

1. Чтобы настроить службу контроллера в Apache NiFi, посетите страницу конфигурации потока NiFi, нажав на кнопку "шестигранник"

    <Image img={nifi01} size="sm" border alt="Страница конфигурации потока NiFi с выделенной кнопкой шестеренки" />

2. Выберите вкладку Службы контроллера и добавьте новую службу контроллера, нажав на кнопку `+` в верхнем правом углу

    <Image img={nifi02} size="lg" border alt="Вкладка Службы контроллера с выделенной кнопкой добавления" />

3. Найдите `DBCPConnectionPool` и нажмите на кнопку "Добавить"

    <Image img={nifi03} size="lg" border alt="Диалог выбора службы контроллера с выделенным DBCPConnectionPool" />

4. Новая добавленная служба `DBCPConnectionPool` по умолчанию будет находиться в состоянии Неверно. Нажмите на кнопку "шестигранник", чтобы начать конфигурацию

    <Image img={nifi04} size="lg" border alt="Список служб контроллера показывает недействительный DBCPConnectionPool с выделенной кнопкой шестеренки" />

5. В разделе "Свойства" введите следующие значения

  | Свойство                     | Значение                                                            | Примечание                                                                |
  |------------------------------|---------------------------------------------------------------------|---------------------------------------------------------------------------|
  | URL подключения к базе данных | jdbc:ch:https://HOSTNAME:8443/default?ssl=true                     | Убедитесь, что HOSTNAME в URL подключения заменен соответственно          |
  | Имя класса драйвера базы данных  | com.clickhouse.jdbc.ClickHouseDriver                               ||
  | Местоположение драйвера базы данных | /etc/nifi/nifi-X.XX.X/lib/clickhouse-jdbc-0.X.X-patchXX-shaded.jar | Абсолютный путь к JAR файлу драйвера JDBC для ClickHouse                 |
  | Пользователь базы данных      | default                                                            | Имя пользователя ClickHouse                                               |
  | Пароль                       | password                                                            | Пароль ClickHouse                                                        |

6. В разделе Настройки измените имя службы контроллера на "ClickHouse JDBC" для удобства

    <Image img={nifi05} size="lg" border alt="Диалог конфигурации DBCPConnectionPool с заполненными свойствами" />

7. Активируйте службу контроллера `DBCPConnectionPool`, нажав на кнопку "молния", а затем кнопку "Включить"

    <Image img={nifi06} size="lg" border alt="Список служб контроллера с выделенной кнопкой молнии" />

    <br/>

    <Image img={nifi07} size="lg" border alt="Диалог подтверждения включения службы контроллера" />

8. Проверьте вкладку Службы контроллера и убедитесь, что служба контроллера включена

    <Image img={nifi08} size="lg" border alt="Список служб контроллера показывает включенную службу ClickHouse JDBC" />

## 5. Чтение из таблицы с помощью процессора `ExecuteSQL` {#5-read-from-a-table-using-the-executesql-processor}

1. Добавьте процессор `ExecuteSQL`, вместе с соответствующими входящими и исходящими процессорами

    <Image img={nifi09} size="md" border alt="Полотно NiFi с процессором ExecuteSQL в рабочем процессе" />

2. В разделе "Свойства" процессора `ExecuteSQL` введите следующие значения

    | Свойство                             | Значение                               | Примечание                                                  |
    |--------------------------------------|----------------------------------------|-----------------------------------------------------------|
    | Служба пулов подключения к базе данных | ClickHouse JDBC                       | Выберите службу контроллера, настроенную для ClickHouse    |
    | SQL запрос SELECT                    | SELECT * FROM system.metrics           | Впишите ваш запрос сюда                                     |

3. Запустите процессор `ExecuteSQL`

    <Image img={nifi10} size="lg" border alt="Конфигурация процессора ExecuteSQL с заполненными свойствами" />

4. Чтобы подтвердить, что запрос был успешно обработан, проверьте один из `FlowFile` в выходной очереди

    <Image img={nifi11} size="lg" border alt="Диалог списка очереди, показывающий FlowFiles готовые к проверке" />

5. Переключите вид на "форматированный", чтобы увидеть результат выходного `FlowFile`

    <Image img={nifi12} size="lg" border alt="Просмотр содержимого FlowFile показывает результаты запроса в форматированном виде" />

## 6. Запись в таблицу с помощью процессоров `MergeRecord` и `PutDatabaseRecord` {#6-write-to-a-table-using-mergerecord-and-putdatabaserecord-processor}

1. Чтобы записать несколько строк за одну вставку, сначала нужно объединить несколько записей в одну запись. Это можно сделать с помощью процессора `MergeRecord`.

2. В разделе "Свойства" процессора `MergeRecord` введите следующие значения

    | Свойство                  | Значение             | Примечание                                                                                                                   |
    |---------------------------|----------------------|------------------------------------------------------------------------------------------------------------------------------|
    | Читатель записей          | `JSONTreeReader`     | Выберите подходящий читатель записей                                                                                         |
    | Писатель записей          | `JSONReadSetWriter`  | Выберите подходящий писатель записей                                                                                         |
    | Минимальное число записей  | 1000                 | Измените это на большее значение, чтобы минимальное количество строк объединялось в одну запись. По умолчанию - 1 строка     |
    | Максимальное число записей  | 10000                | Измените это на большее число, чем "Минимальное число записей". По умолчанию - 1 000 строк                                   |

3. Чтобы подтвердить, что несколько записей объединены в одну, проверьте входные и выходные данные процессора `MergeRecord`. Обратите внимание, что выходные данные представляют собой массив нескольких входных записей

    Входные данные
    <Image img={nifi13} size="sm" border alt="Входные данные процессора MergeRecord показывают отдельные записи" />

    Выходные данные
    <Image img={nifi14} size="sm" border alt="Выходные данные процессора MergeRecord показывают объединенный массив записей" />

4. В разделе "Свойства" процессора `PutDatabaseRecord` введите следующие значения

    | Свойство                             | Значение           | Примечание                                                                                                                             |
    |--------------------------------------|--------------------|----------------------------------------------------------------------------------------------------------------------------------------|
    | Читатель записей                     | `JSONTreeReader`   | Выберите подходящий читатель записей                                                                                                   |
    | Тип базы данных                      | Generic            | Оставьте по умолчанию                                                                                                                 |
    | Тип оператора                       | INSERT             |                                                                                                                                        |
    | Служба пулов подключения к базе данных | ClickHouse JDBC    | Выберите службу контроллера ClickHouse                                                                                                 |
    | Имя таблицы                         | tbl                | Введите имя вашей таблицы здесь                                                                                                        |
    | Перевод имен полей                  | false              | Установите в "false", чтобы имена полей, вставленных, должны соответствовать именам колонок                                              |
    | Максимальный размер пакета           | 1000               | Максимальное количество строк на вставку. Это значение не должно быть ниже значения "Минимальное число записей" в процессоре `MergeRecord` |

4. Чтобы подтвердить, что каждая вставка содержит несколько строк, проверьте, что количество строк в таблице увеличивается как минимум на значение "Минимальное число записей", определенное в `MergeRecord`.

    <Image img={nifi15} size="sm" border alt="Результаты запроса показывают количество строк в целевой таблице" />

5. Поздравляем - вы успешно загрузили ваши данные в ClickHouse с помощью Apache NiFi!