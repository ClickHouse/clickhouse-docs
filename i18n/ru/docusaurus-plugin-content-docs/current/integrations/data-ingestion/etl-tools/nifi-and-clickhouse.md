---
sidebar_label:  NiFi
sidebar_position: 12
keywords: [clickhouse, NiFi, connect, integrate, etl, data integration]
slug: /integrations/nifi
description: Потоковые данные в ClickHouse с помощью NiFi
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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


# Подключение Apache NiFi к ClickHouse

<a href="https://nifi.apache.org/" target="_blank">Apache NiFi</a> — это программное обеспечение для управления рабочими процессами с открытым исходным кодом, предназначенное для автоматизации потоков данных между программными системами. Оно позволяет создавать ETL конвейеры данных и поставляется с более чем 300 процессорами данных. Этот поэтапный учебник показывает, как подключить Apache NiFi к ClickHouse как источник и приемник, а также загрузить образец набора данных.

## 1. Соберите ваши данные для подключения {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Скачайте и запустите Apache NiFi {#2-download-and-run-apache-nifi}

1. Для новой настройки, скачайте бинарный файл с https://nifi.apache.org/download.html и начните, запустив `./bin/nifi.sh start`


## 3. Скачайте драйвер JDBC для ClickHouse {#3-download-the-clickhouse-jdbc-driver}

1. Посетите <a href="https://github.com/ClickHouse/clickhouse-java/releases" target="_blank">страницу релиза драйвера JDBC для ClickHouse</a> на GitHub и найдите последнюю версию релиза JDBC.
2. В версии релиза нажмите "Показать все xx объектов" и найдите JAR файл, содержащий ключевое слово "shaded" или "all", например, `clickhouse-jdbc-0.5.0-all.jar`.
3. Поместите JAR файл в папку, доступную для Apache NiFi, и запомните абсолютный путь.

## 4. Добавьте сервис контроллера `DBCPConnectionPool` и настройте его свойства {#4-add-dbcpconnectionpool-controller-service-and-configure-its-properties}

1. Чтобы настроить сервис контроллера в Apache NiFi, посетите страницу конфигурации потока NiFi, нажав на кнопку "шестеренка".

    <img src={nifi01} class="image" alt="Конфигурация потока NiFi" style={{width: '50%'}}/>

2. Выберите вкладку Сервисы контроллеров и добавьте новый сервис контроллера, нажав на кнопку `+` в верхнем правом углу.

    <img src={nifi02} class="image" alt="Добавить сервис контроллера" style={{width: '80%'}}/>

3. Найдите `DBCPConnectionPool` и нажмите кнопку "Добавить".

    <img src={nifi03} class="image" alt="Поиск `DBCPConnectionPool`" style={{width: '80%'}}/>

4. Новый `DBCPConnectionPool` будет иметь статус "Неверно" по умолчанию. Нажмите на кнопку "шестеренка", чтобы начать настройку.

    <img src={nifi04} class="image" alt="Конфигурация потока NiFi" style={{width: '80%'}}/>

5. В разделе "Свойства" введите следующие значения.

  | Свойство                     | Значение                                                          | Примечание                                                                       |
  |------------------------------|------------------------------------------------------------------|---------------------------------------------------------------------------------|
  | URL соединения с базой данных| jdbc:ch:https://HOSTNAME:8443/default?ssl=true                  | Замените HOSTNAME в URL соединения соответственно                                 |
  | Имя класса драйвера базы данных | com.clickhouse.jdbc.ClickHouseDriver                             |                                                                                 |
  | Расположение драйвера базы данных | /etc/nifi/nifi-X.XX.X/lib/clickhouse-jdbc-0.X.X-patchXX-shaded.jar | Абсолютный путь к JAR файлу драйвера JDBC для ClickHouse                      |
  | Пользователь базы данных     | default                                                          | Имя пользователя ClickHouse                                                     |
  | Пароль                       | password                                                         | Пароль ClickHouse                                                               |

6. В разделе "Настройки" измените имя сервиса контроллера на "ClickHouse JDBC" для удобства ссылок.

    <img src={nifi05} class="image" alt="Конфигурация потока NiFi" style={{width: '80%'}}/>

7. Активируйте сервис контроллера `DBCPConnectionPool`, нажав кнопку "молния", а затем кнопку "Включить".

    <img src={nifi06} class="image" alt="Конфигурация потока NiFi" style={{width: '80%'}}/>

    <br/>

    <img src={nifi07} class="image" alt="Конфигурация потока NiFi" style={{width: '80%'}}/>

8. Проверьте вкладку Сервисы контроллеров и убедитесь, что сервис контроллера включен.

    <img src={nifi08} class="image" alt="Конфигурация потока NiFi" style={{width: '80%'}}/>

## 5. Чтение из таблицы с помощью процессора `ExecuteSQL` {#5-read-from-a-table-using-the-executesql-processor}

1. Добавьте процессор `ExecuteSQL`, вместе с соответствующими предшествующими и последующими процессорами.

    <img src={nifi09} class="image" alt="Процессор `ExecuteSQL`" style={{width: '50%'}}/>

2. В разделе "Свойства" процессора `ExecuteSQL` введите следующие значения.

    | Свойство                            | Значение                             | Примечание                                                  |
    |-------------------------------------|--------------------------------------|-----------------------------------------------------------|
    | Сервис пула соединений с базой данных | ClickHouse JDBC                     | Выберите сервис контроллера, настроенный для ClickHouse   |
    | SQL запрос выборки                  | SELECT * FROM system.metrics         | Введите здесь ваш запрос                                    |

3. Запустите процессор `ExecuteSQL`.

    <img src={nifi10} class="image" alt="Процессор `ExecuteSQL`" style={{width: '80%'}}/>

4. Чтобы подтвердить, что запрос обработан успешно, проверьте один из `FlowFile` в выходной очереди.

    <img src={nifi11} class="image" alt="Процессор `ExecuteSQL`" style={{width: '80%'}}/>

5. Переключите просмотр на "форматированный", чтобы увидеть результат выходного `FlowFile`.

    <img src={nifi12} class="image" alt="Процессор `ExecuteSQL`" style={{width: '80%'}}/>

## 6. Запись в таблицу с помощью процессоров `MergeRecord` и `PutDatabaseRecord` {#6-write-to-a-table-using-mergerecord-and-putdatabaserecord-processor}

1. Чтобы записать несколько строк в одной вставке, сначала необходимо объединить несколько записей в одну. Это можно сделать с помощью процессора `MergeRecord`.

2. В разделе "Свойства" процессора `MergeRecord` введите следующие значения.

    | Свойство                   | Значение            | Примечание                                                                                                                       |
    |----------------------------|---------------------|-------------------------------------------------------------------------------------------------------------------------------|
    | Читатель записей           | `JSONTreeReader`    | Выберите подходящий читатель записей                                                                                           |
    | Писатель записей           | `JSONReadSetWriter` | Выберите подходящий писатель записей                                                                                           |
    | Минимальное количество записей | 1000               | Измените это значение на большее, чтобы минимальное количество строк объединялось в одну запись. По умолчанию 1 строка        |
    | Максимальное количество записей | 10000              | Измените это значение на большее, чем "Минимальное количество записей". По умолчанию 1,000 строк                             |

3. Чтобы подтвердить, что несколько записей объединены в одну, проверьте ввод и вывод процессора `MergeRecord`. Обратите внимание, что вывод — это массив из нескольких входных записей.

    Вход
    <img src={nifi13} class="image" alt="Процессор `ExecuteSQL`" style={{width: '50%'}}/>

    Выход
    <img src={nifi14} class="image" alt="Процессор `ExecuteSQL`" style={{width: '50%'}}/>

4. В разделе "Свойства" процессора `PutDatabaseRecord` введите следующие значения.

    | Свойство                            | Значение           | Примечание                                                                                                                         |
    |-------------------------------------|---------------------|-----------------------------------------------------------------------------------------------------------------------------------|
    | Читатель записей                   | `JSONTreeReader`    | Выберите подходящий читатель записей                                                                                              |
    | Тип базы данных                     | Generic             | Оставьте по умолчанию                                                                                                             |
    | Тип оператора                      | INSERT              |                                                                                                                                   |
    | Сервис пула соединений с базой данных | ClickHouse JDBC     | Выберите сервис контроллера ClickHouse                                                                                           |
    | Имя таблицы                        | tbl                 | Введите сюда имя вашей таблицы                                                                                                    |
    | Преобразовать имена полей          | false               | Установите в "false", чтобы имена полей, которые вставляются, соответствовали именам колонок                                      |
    | Максимальный размер пакета         | 1000                | Максимальное количество строк на вставку. Это значение не должно быть ниже значения "Минимальное количество записей" в процессоре `MergeRecord`. |

5. Чтобы подтвердить, что каждая вставка содержит несколько строк, проверьте, что количество строк в таблице увеличивается как минимум на значение "Минимальное количество записей", определенное в `MergeRecord`.

    <img src={nifi15} class="image" alt="Процессор `ExecuteSQL`" style={{width: '50%'}}/>

6. Поздравляем - вы успешно загрузили свои данные в ClickHouse с помощью Apache NiFi!
