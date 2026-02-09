---
sidebar_label: 'NiFi'
sidebar_position: 12
keywords: ['clickhouse', 'NiFi', 'подключение', 'интеграция', 'etl', 'интеграция данных']
slug: /integrations/nifi
description: 'Потоковая передача данных в ClickHouse с помощью конвейеров данных NiFi'
title: 'Подключение Apache NiFi к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
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

# Подключение Apache NiFi к ClickHouse \{#connect-apache-nifi-to-clickhouse\}

<CommunityMaintainedBadge />

<a href="https://nifi.apache.org/" target="_blank">Apache NiFi</a> — это программное обеспечение с открытым исходным кодом для управления рабочими процессами, предназначенное для автоматизации потоков данных между программными системами. Оно позволяет создавать конвейеры данных ETL и поставляется с более чем 300 процессорами данных. Это пошаговое руководство показывает, как подключить Apache NiFi к ClickHouse в качестве источника и приёмника данных, а также загрузить тестовый набор данных.

<VerticalStepper headerLevel="h2">
  ## Соберите данные для подключения \{#1-gather-your-connection-details\}

  <ConnectionDetails />

  ## Загрузите и запустите Apache NiFi \{#2-download-and-run-apache-nifi\}

  Для новой установки загрузите бинарный файл с https://nifi.apache.org/download.html и запустите его, выполнив команду `./bin/nifi.sh start`

  ## Загрузите JDBC-драйвер ClickHouse \{#3-download-the-clickhouse-jdbc-driver\}

  1. Перейдите на <a href="https://github.com/ClickHouse/clickhouse-java/releases" target="_blank">страницу релизов драйвера ClickHouse JDBC</a> на GitHub и найдите последнюю доступную версию JDBC-драйвера
  2. В разделе релиза нажмите на &quot;Show all xx assets&quot; и найдите JAR-файл, в имени которого есть ключевое слово &quot;shaded&quot; или &quot;all&quot;, например `clickhouse-jdbc-0.5.0-all.jar`
  3. Поместите JAR-файл в каталог, доступный Apache NiFi, и запишите его абсолютный путь

  ## Добавьте службу контроллера `DBCPConnectionPool` и настройте её свойства \{#4-add-dbcpconnectionpool-controller-service-and-configure-its-properties\}

  1. Чтобы настроить Controller Service в Apache NiFi, перейдите на страницу NiFi Flow Configuration, нажав кнопку с иконкой шестерёнки

     <Image img={nifi01} size="sm" border alt="Страница NiFi Flow Configuration с выделенной кнопкой с иконкой шестерёнки" />

  2. Выберите вкладку Controller Services и добавьте новый Controller Service, нажав кнопку `+` в правом верхнем углу

     <Image img={nifi02} size="lg" border alt="Вкладка Controller Services с выделенной кнопкой добавления" />

  3. Найдите `DBCPConnectionPool` и нажмите кнопку Add

     <Image img={nifi03} size="lg" border alt="Диалог выбора Controller Service с выделенным DBCPConnectionPool" />

  4. Только что добавленная служба контроллера `DBCPConnectionPool` по умолчанию будет находиться в состоянии Invalid. Нажмите кнопку с иконкой шестерёнки, чтобы начать настройку

     <Image img={nifi04} size="lg" border alt="Список Controller Services с DBCPConnectionPool в состоянии Invalid и выделенной кнопкой с иконкой шестерёнки" />

  5. В разделе Properties введите следующие значения

  | Property                    | Value                                                              | Remark                                                        |
  | --------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------- |
  | Database Connection URL     | jdbc:ch:https://HOSTNAME:8443/default?ssl=true                     | Замените HOSTNAME в URL подключения соответствующим значением |
  | Database Driver Class Name  | com.clickhouse.jdbc.ClickHouseDriver                               |                                                               |
  | Database Driver Location(s) | /etc/nifi/nifi-X.XX.X/lib/clickhouse-jdbc-0.X.X-patchXX-shaded.jar | Абсолютный путь к JAR-файлу JDBC-драйвера ClickHouse          |
  | Database User               | default                                                            | Имя пользователя ClickHouse                                   |
  | Password                    | password                                                           | Пароль ClickHouse                                             |

  6. В разделе Settings измените имя Controller Service на ClickHouse JDBC для удобства

     <Image img={nifi05} size="lg" border alt="Диалог настройки DBCPConnectionPool с заполненными свойствами" />

  7. Активируйте Controller Service `DBCPConnectionPool`, нажав кнопку с иконкой молнии, а затем кнопку «Enable»

     <Image img={nifi06} size="lg" border alt="Список Controller Services с выделенной кнопкой с иконкой молнии" />

     <br />

     <Image img={nifi07} size="lg" border alt="Диалог подтверждения включения (Enable) Controller Service" />

  8. Проверьте вкладку Controller Services и убедитесь, что Controller Service включён

     <Image img={nifi08} size="lg" border alt="Список Controller Services с включённым сервисом ClickHouse JDBC" />

  ## Чтение из таблицы с помощью процессора `ExecuteSQL` \{#5-read-from-a-table-using-the-executesql-processor\}

  1. Добавьте процессор `ExecuteSQL`, а также соответствующие предшествующие и последующие процессоры

     <Image img={nifi09} size="md" border alt="Рабочая область NiFi с процессором ExecuteSQL в составе workflow" />

  2. В разделе Properties процессора `ExecuteSQL` введите следующие значения

     | Property                            | Value                        | Remark                                                  |
     | ----------------------------------- | ---------------------------- | ------------------------------------------------------- |
     | Database Connection Pooling Service | ClickHouse JDBC              | Выберите Controller Service, настроенный для ClickHouse |
     | SQL select query                    | SELECT * FROM system.metrics | Введите здесь запрос                                    |

  3. Запустите процессор `ExecuteSQL`

     <Image img={nifi10} size="lg" border alt="Окно настройки процессора ExecuteSQL с заполненными свойствами" />

  4. Чтобы убедиться, что запрос был успешно обработан, просмотрите один из объектов `FlowFile` в выходной очереди

     <Image img={nifi11} size="lg" border alt="Диалог списка очереди с flowfile, готовыми к проверке" />

  5. Переключите вид на &quot;formatted&quot;, чтобы просмотреть результат выходного `FlowFile`

     <Image img={nifi12} size="lg" border alt="Просмотр содержимого FlowFile, отображающий результаты запроса в отформатированном виде" />

  ## Запись в таблицу с помощью процессоров `MergeRecord` и `PutDatabaseRecord` \{#6-write-to-a-table-using-mergerecord-and-putdatabaserecord-processor\}

  1. Чтобы записать несколько строк одним оператором INSERT, сначала нужно объединить несколько записей в одну. Это можно сделать с помощью процессора `MergeRecord`.

  2. В разделе Properties процессора `MergeRecord` введите следующие значения

     | Property                  | Value               | Remark                                                                                                              |
     | ------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------- |
     | Record Reader             | `JSONTreeReader`    | Выберите соответствующий Record Reader                                                                              |
     | Record Writer             | `JSONReadSetWriter` | Выберите соответствующий Record Writer                                                                              |
     | Minimum Number of Records | 1000                | Установите большее значение, чтобы минимальное количество строк объединялось в одну запись. По умолчанию — 1 строка |
     | Maximum Number of Records | 10000               | Установите значение больше, чем «Minimum Number of Records». По умолчанию — 1 000 строк                             |

  3. Чтобы убедиться, что несколько записей объединены в одну, проверьте входные и выходные данные процессора `MergeRecord`. Обратите внимание, что выходные данные представляют собой массив, содержащий несколько входных записей.

     Входные данные

     <Image img={nifi13} size="sm" border alt="Входные данные процессора MergeRecord с одиночными записями" />

     Результат

     <Image img={nifi14} size="sm" border alt="Вывод процессора MergeRecord с объединённым массивом записей" />

  4. В разделе Properties процессора `PutDatabaseRecord` введите следующие значения

     | Property                            | Value            | Remark                                                                                                                                                     |
     | ----------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
     | Record Reader                       | `JSONTreeReader` | Выберите подходящий Record Reader                                                                                                                          |
     | Database Type                       | Generic          | Оставьте значение по умолчанию                                                                                                                             |
     | Statement Type                      | INSERT           |                                                                                                                                                            |
     | Database Connection Pooling Service | ClickHouse JDBC  | Выберите службу контроллера ClickHouse                                                                                                                     |
     | Table Name                          | tbl              | Укажите здесь имя вашей таблицы                                                                                                                            |
     | Translate Field Names               | false            | Установите в &quot;false&quot;, чтобы вставляемые имена полей совпадали с именами столбцов                                                                 |
     | Maximum Batch Size                  | 1000             | Максимальное количество строк на один INSERT. Это значение не должно быть меньше значения &quot;Minimum Number of Records&quot; в процессоре `MergeRecord` |

  5. Чтобы подтвердить, что каждая операция вставки содержит несколько строк, убедитесь, что количество строк в таблице увеличивается как минимум на значение параметра «Minimum Number of Records», заданное в `MergeRecord`.

     <Image img={nifi15} size="sm" border alt="Результаты выполнения запроса, показывающие количество строк в целевой таблице" />

  6. Поздравляем — вы успешно загрузили данные в ClickHouse с помощью Apache NiFi!
</VerticalStepper>