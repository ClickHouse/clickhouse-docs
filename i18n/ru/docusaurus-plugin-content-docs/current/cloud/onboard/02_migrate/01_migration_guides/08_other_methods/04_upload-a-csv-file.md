---
title: 'Загрузка файлов'
slug: /cloud/migrate/upload-a-csv-file
description: 'Узнайте, как загружать файлы в Cloud'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import csv_01 from '@site/static/images/cloud/migrate/csv_01.png';
import csv_02 from '@site/static/images/cloud/migrate/csv_02.png';
import csv_03 from '@site/static/images/cloud/migrate/csv_03.png';
import csv_04 from '@site/static/images/cloud/migrate/csv_04.png';
import csv_05 from '@site/static/images/cloud/migrate/csv_05.png';
import csv_06 from '@site/static/images/cloud/migrate/csv_06.png';
import csv_07 from '@site/static/images/cloud/migrate/csv_07.png';
import csv_08 from '@site/static/images/cloud/migrate/csv_08.png';
import csv_09 from '@site/static/images/cloud/migrate/csv_09.png';
import csv_10 from '@site/static/images/cloud/migrate/csv_10.png';


# Загрузка файлов в Cloud {#upload-files-to-cloud}

ClickHouse Cloud предоставляет простой способ импорта файлов и поддерживает
следующие форматы:

| Формат                         |
|--------------------------------|
| `CSV`                          |
| `CSVWithNamesAndTypes`         |
| `CSVWithNames`                 |
| `JSONEachRow`                  |
| `TabSeparated`                 |
| `TabSeparatedWithNames`        |
| `TabSeparatedWithNamesAndTypes`|

<VerticalStepper headerLevel="h2">

## Загрузка файла {#upload-file}

На главной странице Cloud выберите свой сервис, как показано ниже:

<Image img={csv_01} alt="upload_file_02" />

Если ваш сервис простаивает, его необходимо запустить.

Выберите `Data sources` в левой панели, как показано ниже:

<Image img={csv_02} alt="upload_file_03" />

Затем выберите `Upload a file` в правой части страницы источников данных:

<Image img={csv_03} alt="upload_file_04" />

Отобразится диалог выбора файла, в котором вы можете указать файл, который хотите
использовать для вставки данных в таблицу в вашем сервисе Cloud.

<Image img={csv_04} alt="upload_file_05" />

## Настройка таблицы {#configure-table}

После загрузки файла вы сможете настроить таблицу, в которую хотите
вставить данные. Отобразится предварительный просмотр таблицы с первыми тремя строками.

<Image img={csv_08} alt="upload_file_08" />

Теперь вы можете выбрать целевую таблицу. Доступные варианты:

- новая таблица
- существующая таблица

<br/>
Вы можете указать, в какую базу данных нужно загрузить данные, а в случае
новой таблицы — имя создаваемой таблицы. Вы также сможете выбрать ключ сортировки:

<Image img={csv_05} alt="upload_file_05" />

Столбцы, прочитанные из файла, отображаются как `Source field`, и для каждого поля вы
можете изменить:
- определённый тип
- значение по умолчанию
- нужно ли делать столбец [Nullable](/sql-reference/data-types/nullable) или нет

<Image img={csv_06} alt="upload_file_06" />

:::note Исключение полей
Вы также можете удалить поле, если не хотите включать его в импорт.
:::

Вы можете указать тип движка таблицы, который хотите использовать:

- `MergeTree`
- `ReplacingMergeTree`
- `SummingMergeTree`
- `Null`
<br/>
Можно задать выражение ключа партиционирования и выражение первичного ключа.

<Image img={csv_07} alt="upload_file_07" />

Нажмите `Import to ClickHouse` (показано выше), чтобы импортировать данные. Импорт данных будет поставлен в очередь, что отражается статусом `queued` в столбце `Status`, как показано ниже. Вы также можете нажать
`Open as query` (показано выше), чтобы открыть запрос вставки в SQL-консоли. Запрос выполнит вставку
файла, который был загружен в бакет S3, с использованием табличной функции `URL`.

<Image img={csv_09} alt="upload_file_09" />

Если задание завершится с ошибкой, вы увидите статус `failed` в столбце `Status` на вкладке
`Data upload history`. Вы можете нажать `View Details`, чтобы получить дополнительную информацию
о причине сбоя загрузки. Возможно, потребуется изменить конфигурацию таблицы или очистить
данные в соответствии с сообщением об ошибке для неудачной вставки.

<Image img={csv_10} alt="upload_file_11" />

</VerticalStepper>