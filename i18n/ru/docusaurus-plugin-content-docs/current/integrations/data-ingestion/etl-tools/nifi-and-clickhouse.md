---
sidebar_label: 'NiFi'
sidebar_position: 12
keywords: ['clickhouse', 'NiFi', 'connect', 'integrate', 'etl', 'data integration']
slug: /integrations/nifi
description: 'Передача данных в ClickHouse с использованием конвейеров данных NiFi'
title: 'Соединение Apache NiFi с ClickHouse'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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


# Соединение Apache NiFi с ClickHouse

<CommunityMaintainedBadge/>

<a href="https://nifi.apache.org/" target="_blank">Apache NiFi</a> — это программное обеспечение с открытым исходным кодом для управления потоками данных, разработанное для автоматизации передачи данных между программными системами. Оно позволяет создавать ETL-конвейеры данных и поставляется с более чем 300 процессорами данных. В этом пошаговом руководстве показано, как подключить Apache NiFi к ClickHouse как к источнику, так и к получателю, и загрузить тестовый набор данных.

## 1. Соберите свои данные для подключения {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Скачайте и запустите Apache NiFi {#2-download-and-run-apache-nifi}

1. Для новой установки загрузите двоичный файл с https://nifi.apache.org/download.html и начните с выполнения команды `./bin/nifi.sh start`


## 3. Скачайте драйвер ClickHouse JDBC {#3-download-the-clickhouse-jdbc-driver}

1. Перейдите на <a href="https://github.com/ClickHouse/clickhouse-java/releases" target="_blank">страницу релизов драйвера ClickHouse JDBC</a> на GitHub и найдите последнюю версию релиза JDBC
2. В релизной версии нажмите на "Показать все xx assets" и найдите файл JAR, содержащий ключевые слова "shaded" или "all", например, `clickhouse-jdbc-0.5.0-all.jar`
3. Поместите файл JAR в папку, доступную для Apache NiFi, и запомните абсолютный путь

## 4. Добавьте сервис контроллера `DBCPConnectionPool` и настройте его свойства {#4-add-dbcpconnectionpool-controller-service-and-configure-its-properties}

1. Чтобы настроить сервис контроллера в Apache NiFi, перейдите на страницу конфигурации потока NiFi, нажав на кнопку "шестерёнка"

    <Image img={nifi01} size="sm" border alt="Страница конфигурации потока NiFi с выделенной кнопкой шестерёнки" />

2. Выберите вкладку Сервисы контроллера и добавьте новый сервис контроллера, нажав на кнопку `+` в правом верхнем углу

    <Image img={nifi02} size="lg" border alt="Вкладка Сервисы контроллера с выделенной кнопкой добавления" />

3. Найдите `DBCPConnectionPool` и нажмите кнопку "Добавить"

    <Image img={nifi03} size="lg" border alt="Диалог выбора сервисов контроллера с выделенным DBCPConnectionPool" />

4. Новый `DBCPConnectionPool` по умолчанию будет в недействительном состоянии. Нажмите кнопку "шестерёнка", чтобы начать конфигурацию

    <Image img={nifi04} size="lg" border alt="Список сервисов контроллера с недействительным DBCPConnectionPool и выделенной кнопкой шестерёнки" />

5. В разделе "Свойства" введите следующие значения

  | Свойство                     | Значение                                                        | Примечание                                                                  |
  | ---------------------------- | ----------------------------------------------------------------| --------------------------------------------------------------------------- |
  | URL соединения с базой данных| jdbc:ch:https://HOSTNAME:8443/default?ssl=true                 | Замените HOSTNAME в URL соединения соответственно                           |
  | Имя класса драйвера базы данных | com.clickhouse.jdbc.ClickHouseDriver                        ||
  | Место расположения драйвера базы данных | /etc/nifi/nifi-X.XX.X/lib/clickhouse-jdbc-0.X.X-patchXX-shaded.jar | Абсолютный путь к JAR-файлу драйвера ClickHouse JDBC                      |
  | Пользователь базы данных      | default                                                        | Имя пользователя ClickHouse                                                |
  | Пароль                       | password                                                        | Пароль ClickHouse                                                          |

6. В разделе Настройки измените имя сервиса контроллера на "ClickHouse JDBC" для удобства

    <Image img={nifi05} size="lg" border alt="Диалог конфигурации DBCPConnectionPool с заполненными свойствами" />

7. Активируйте сервис контроллера `DBCPConnectionPool`, нажав кнопку "молния", а затем кнопку "Включить"

    <Image img={nifi06} size="lg" border alt="Список сервисов контроллера с выделенной кнопкой молнии" />

    <br/>

    <Image img={nifi07} size="lg" border alt="Диалог подтверждения включения сервиса контроллера" />

8. Проверьте вкладку Сервисы контроллера и убедитесь, что сервис контроллера включен

    <Image img={nifi08} size="lg" border alt="Список сервисов контроллера с включенным сервисом ClickHouse JDBC" />

## 5. Чтение из таблицы с помощью процессора `ExecuteSQL` {#5-read-from-a-table-using-the-executesql-processor}

1. Добавьте процессор ​`​ExecuteSQL`, а также соответствующие upstream и downstream процессоры

    <Image img={nifi09} size="md" border alt="Канва NiFi с процессором ExecuteSQL в рабочем процессе" />

2. В разделе "Свойства" процессора ​`​ExecuteSQL` введите следующие значения

    | Свойство                                     | Значение                               | Примечание                                                |
    |----------------------------------------------|----------------------------------------|-----------------------------------------------------------|
    | Служба подключения к базе данных            | ClickHouse JDBC                        | Выберите службу контроллера, настроенную для ClickHouse   |
    | SQL запрос                                   | SELECT * FROM system.metrics           | Введите ваш запрос здесь                                   |

3. Запустите процессор `​​ExecuteSQL`

    <Image img={nifi10} size="lg" border alt="Конфигурация процессора ExecuteSQL с заполненными свойствами" />

4. Чтобы убедиться, что запрос был успешно обработан, проверьте один из `FlowFile` в выходной очереди

    <Image img={nifi11} size="lg" border alt="Диалог списка очереди с готовыми для проверки FlowFile" />

5. Переключитесь в режим "отформатировано", чтобы просмотреть результат выходного `FlowFile`

    <Image img={nifi12} size="lg" border alt="Просмотр содержимого FlowFile, показывающий результаты запроса в отформатированном виде" />

## 6. Запись в таблицу с помощью процессов `MergeRecord` и `PutDatabaseRecord` {#6-write-to-a-table-using-mergerecord-and-putdatabaserecord-processor}

1. Чтобы записать несколько строк в одном вставке, сначала нужно объединить несколько записей в одну. Это можно сделать с помощью процессора `MergeRecord`

2. В разделе "Свойства" процессора `MergeRecord` введите следующие значения

    | Свойство                     | Значение             | Примечание                                                                                                                      |
    |------------------------------|----------------------|-------------------------------------------------------------------------------------------------------------------------------|
    | Читатель записей             | `JSONTreeReader`      | Выберите соответствующий читатель записей                                                                                      |
    | Писатель записей             | `JSONReadSetWriter`   | Выберите соответствующий писатель записей                                                                                      |
    | Минимальное число записей     | 1000                  | Увеличьте это значение, чтобы минимальное количество строк было объединено в одну запись. По умолчанию 1 строка               |
    | Максимальное число записей     | 10000                  | Увеличьте это значение больше, чем "Минимальное число записей". По умолчанию 1,000 строк                                     |

3. Чтобы подтвердить, что несколько записей объединяются в одну, проверьте входные и выходные данные процессора `MergeRecord`. Обратите внимание, что выходные данные — это массив нескольких входных записей

    Входные данные
    <Image img={nifi13} size="sm" border alt="Входные данные процессора MergeRecord, показывающие отдельные записи" />

    Выходные данные
    <Image img={nifi14} size="sm" border alt="Выходные данные процессора MergeRecord, показывающие объединённый массив записей" />

4. В разделе "Свойства" процессора `PutDatabaseRecord` введите следующие значения

    | Свойство                            | Значение           | Примечание                                                                                                                                   |
    |-------------------------------------|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
    | Читатель записей                   | `JSONTreeReader`   | Выберите соответствующий читатель записей                                                                                                     |
    | Тип базы данных                    | Generic           | Оставить по умолчанию                                                                                                                      |
    | Тип оператора                      | INSERT            |                                                                                                                                            |
    | Служба подключения к базе данных    | ClickHouse JDBC    | Выберите службу контроллера ClickHouse                                                                                                       |
    | Имя таблицы                       | tbl                | Введите имя вашей таблицы здесь                                                                                                             |
    | Переводить имена полей             | false             | Установите на "false", чтобы имена полей, вставляемые в таблицу, соответствовали именам колонок                                               |
    | Максимальный размер пакета          | 1000              | Максимальное количество строк на одну вставку. Это значение не должно быть ниже значения "Минимальное число записей" в процессоре `MergeRecord` |

5. Чтобы убедиться, что каждая вставка содержит несколько строк, проверьте, что количество строк в таблице увеличивается как минимум на значение "Минимальное число записей", определенное в `MergeRecord`.

    <Image img={nifi15} size="sm" border alt="Результаты запроса, показывающие количество строк в целевой таблице" />

6. Поздравляем - вы успешно загрузили ваши данные в ClickHouse с использованием Apache NiFi!
