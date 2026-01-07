---
sidebar_label: 'Обзор'
description: 'Бесшовно подключайте объектное хранилище к ClickHouse Cloud.'
slug: /integrations/clickpipes/object-storage/gcs/overview
sidebar_position: 1
title: 'Интеграция Google Cloud Storage с ClickHouse Cloud'
doc_type: 'guide'
---

import cp_iam from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_iam.png';
import cp_credentials from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/google-cloud-storage/cp_credentials.png';
import cp_advanced_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_advanced_settings.png';
import Image from '@theme/IdealImage';

GCS ClickPipe обеспечивает полностью управляемый и отказоустойчивый способ приёма данных из Google Cloud Storage (GCS). Он поддерживает как **однократную**, так и **непрерывную ингестию** с гарантией exactly-once.

GCS ClickPipes могут быть развернуты и управляться вручную через ClickPipes UI, а также программно с помощью [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) и [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe).


## Поддерживаемые форматы {#supported-formats}

- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [TSV](/interfaces/formats/TabSeparated)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)

## Возможности {#features}

### Одноразовая ингестия {#one-time-ingestion}

По умолчанию GCS ClickPipe загружает все файлы, подходящие под заданный шаблон, из указанного бакета в целевую таблицу ClickHouse одним пакетом. После завершения задачи ингестии ClickPipe автоматически останавливается. Этот режим одноразовой ингестии обеспечивает семантику exactly-once, гарантируя надёжную обработку каждого файла без дубликатов.

### Непрерывная ингестия {#continuous-ingestion}

При включённой непрерывной ингестии ClickPipes осуществляет непрерывную ингестию данных из указанного пути. Чтобы определить порядок ингестии, GCS ClickPipe полагается на неявный [лексикографический порядок](#continuous-ingestion-lexicographical-order) файлов.

#### Лексикографический порядок {#continuous-ingestion-lexicographical-order}

GCS ClickPipe предполагает, что файлы добавляются в бакет в лексикографическом порядке и полагается на этот неявный порядок для последовательного приёма файлов. Это означает, что любой новый файл **должен** быть лексикографически больше последнего принятого файла. Например, файлы с именами `file1`, `file2` и `file3` будут приниматься последовательно, но если в бакет будет добавлен новый `file 0`, он будет **проигнорирован**, поскольку имя файла лексикографически не больше последнего принятого файла.

В этом режиме GCS ClickPipe выполняет начальную загрузку **всех файлов** по указанному пути, а затем с настраиваемым интервалом (по умолчанию 30 секунд) опрашивает хранилище на предмет появления новых файлов. **Невозможно** запустить ингестию с конкретного файла или момента времени — ClickPipes всегда будут загружать все файлы по указанному пути.

### Сопоставление шаблонов файлов {#file-pattern-matching}

Object Storage ClickPipes используют стандарт POSIX для сопоставления файлов по шаблонам. Все шаблоны **чувствительны к регистру** и применяются к **полным путям** после имени бакета. Для лучшей производительности используйте как можно более специфичный шаблон (например, `data-2024-*.csv` вместо `*.csv`).

#### Поддерживаемые шаблоны {#supported-patterns}

| Шаблон | Описание | Пример | Соответствия |
|--------|----------|--------|--------------|
| `?` | Соответствует ровно **одному** символу (кроме `/`) | `data-?.csv` | `data-1.csv`, `data-a.csv`, `data-x.csv` |
| `*` | Соответствует **нулю или более** символам (кроме `/`) | `data-*.csv` | `data-1.csv`, `data-001.csv`, `data-report.csv`, `data-.csv` |
| `**` <br></br> Рекурсивный | Соответствует **нулю или более** символам (включая `/`). Позволяет рекурсивно обходить каталоги. | `logs/**/error.log` | `logs/error.log`, `logs/2024/error.log`, `logs/2024/01/error.log` |

**Примеры:**

* `https://bucket.s3.amazonaws.com/folder/*.csv`
* `https://bucket.s3.amazonaws.com/logs/**/data.json`
* `https://bucket.s3.amazonaws.com/file-?.parquet`
* `https://bucket.s3.amazonaws.com/data-2024-*.csv.gz`

#### Неподдерживаемые шаблоны {#unsupported-patterns}

| Шаблон     | Описание                                   | Пример                 | Альтернативы                                  |
|------------|--------------------------------------------|------------------------|-----------------------------------------------|
| `{abc,def}` | Перечисление вариантов в фигурных скобках | `{logs,data}/file.csv` | Создайте отдельные ClickPipes для каждого пути. |
| `{N..M}`    | Расширение числового диапазона            | `file-{1..100}.csv`    | Используйте `file-*.csv` или `file-?.csv`.    |

**Примеры:**

* `https://bucket.s3.amazonaws.com/{documents-01,documents-02}.json`
* `https://bucket.s3.amazonaws.com/file-{1..100}.csv`
* `https://bucket.s3.amazonaws.com/{logs,metrics}/data.parquet`

### Семантика «ровно один раз» {#exactly-once-semantics}

При приёме больших наборов данных могут возникать различные типы сбоев, которые приводят к частичным вставкам или дублированию данных. Object Storage ClickPipes устойчивы к ошибкам вставки и обеспечивают семантику «ровно один раз». Это достигается с помощью временных таблиц staging. Сначала данные вставляются во временные таблицы. Если при вставке что-то пошло не так, staging-таблицу можно очистить (TRUNCATE) и повторить вставку с «чистого состояния». Только после того как вставка успешно завершена, партиции во временной таблице переносятся в целевую таблицу. Чтобы подробнее ознакомиться с этой стратегией, изучите [эту запись в блоге](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3).

### Виртуальные столбцы {#virtual-columns}

Чтобы отслеживать, какие файлы были загружены, добавьте виртуальный столбец `_file` в список сопоставления столбцов. Виртуальный столбец `_file` содержит имя файла исходного объекта, которое можно использовать при запросах, чтобы определить, какие файлы были обработаны.

## Контроль доступа {#access-control}

### Права доступа {#permissions}

GCS ClickPipe поддерживает публичные и приватные бакеты. Бакеты [Requester Pays](https://docs.cloud.google.com/storage/docs/requester-pays) **не** поддерживаются.

Роль [`roles/storage.objectViewer`](https://docs.cloud.google.com/storage/docs/access-control/iam-roles#storage.objectViewer) должна быть назначена на уровне бакета. Эта роль содержит разрешения IAM [`storage.objects.list`](https://docs.cloud.google.com/storage/docs/json_api/v1/objects/list) и [`storage.objects.get`](https://docs.cloud.google.com/storage/docs/json_api/v1/objects/get#required-permissions), которые позволяют ClickPipes просматривать список и получать объекты в указанном бакете.

### Аутентификация {#authentication}

:::note
Аутентификация с помощью сервисных учётных записей в настоящее время не поддерживается.
:::

#### Учетные данные HMAC {#hmac-credentials}

Чтобы использовать [ключи HMAC](https://docs.cloud.google.com/storage/docs/authentication/hmackeys) для аутентификации, выберите `Credentials` в разделе **Authentication method** при настройке подключения ClickPipe. Затем укажите access key (например, `GOOGTS7C7FUP3AIRVJTE2BCDKINBTES3HC2GY5CBFJDCQ2SYHV6A6XXVTJFSA`) и secret key (например, `bGoa+V7g/yqDXvKRqq+JTFn4uQZbPiQJo4pf9RzJ`) в полях `Access key` и `Secret key` соответственно.

<Image img={cp_credentials} alt="Учетные данные HMAC для GCS ClickPipes" size="lg" border/>

Воспользуйтесь [этим руководством](https://clickhouse.com/docs/integrations/gcs#create-a-service-account-hmac-key-and-secret), чтобы создать учетную запись службы с ключом и секретом HMAC.

### Сетевой доступ {#network-access}

GCS ClickPipes используют два отдельных сетевых маршрута для обнаружения метаданных и ингестии данных: сервис ClickPipes и сервис ClickHouse Cloud соответственно. Если вы хотите настроить дополнительный уровень сетевой безопасности (например, для соблюдения требований комплаенса), сетевой доступ **должен быть настроен для обоих маршрутов**.

* Для **управления доступом на основе IP-адресов** правила [IP-фильтрации](https://docs.cloud.google.com/storage/docs/ip-filtering-overview) для вашего GCS-бакета должны разрешать статические IP-адреса для региона сервиса ClickPipes, перечисленные [здесь](/integrations/clickpipes#list-of-static-ips), а также [статические IP-адреса](/manage/data-sources/cloud-endpoints-api) для сервиса ClickHouse Cloud. Чтобы получить статические IP-адреса для вашего региона ClickHouse Cloud, откройте терминал и выполните:

    ```bash
    # Замените <your-region> на ваш регион ClickHouse Cloud
    curl -s https://api.clickhouse.cloud/static-ips.json | jq -r '.gcp[] | select(.region == "<your-region>") | .egress_ips[]'
    ```

## Расширенные настройки {#advanced-settings}

ClickPipes предоставляет разумные значения по умолчанию, которые покрывают требования большинства сценариев использования. Если вашему сценарию требуется дополнительная тонкая настройка, вы можете изменить следующие параметры:

| Setting                            | Default value |  Description                     |                    
|------------------------------------|---------------|---------------------------------------------------------------------------------------|
| `Max insert bytes`                 | 10GB          | Количество байт, обрабатываемых в одном пакете вставки.                               |
| `Max file count`                   | 100           | Максимальное количество файлов, обрабатываемых в одном пакете вставки.               |
| `Max threads`                      | auto(3)       | [Максимальное количество параллельных потоков](/operations/settings/settings#max_threads) для обработки файлов. |
| `Max insert threads`               | 1             | [Максимальное количество параллельных потоков вставки](/operations/settings/settings#max_insert_threads) для обработки файлов. |
| `Min insert block size bytes`      | 1GB           | [Минимальный размер блока в байтах](/operations/settings/settings#min_insert_block_size_bytes), который может быть вставлен в таблицу. |
| `Max download threads`             | 4             | [Максимальное количество параллельных потоков загрузки](/operations/settings/settings#max_download_threads). |
| `Object storage polling interval`  | 30s           | Настраивает максимальный интервал ожидания перед вставкой данных в кластер ClickHouse при опросе объектного хранилища. |
| `Parallel distributed insert select` | 2           | [Настройка параллельной distributed INSERT SELECT](/operations/settings/settings#parallel_distributed_insert_select). |
| `Parallel view processing`         | false         | Определяет, выполнять ли запись в присоединённые представления [параллельно, а не последовательно](/operations/settings/settings#parallel_view_processing). |
| `Use cluster function`             | true          | Определяет, нужно ли обрабатывать файлы параллельно на нескольких узлах. |

<Image img={cp_advanced_settings} alt="Расширенные настройки для ClickPipes" size="lg" border/>

### Масштабирование {#scaling}

ClickPipes для Object Storage масштабируются на основе минимального размера сервиса ClickHouse, который определяется [настроенными параметрами вертикального автомасштабирования](/manage/scaling#configuring-vertical-auto-scaling). Размер ClickPipe определяется при его создании. Последующие изменения настроек сервиса ClickHouse не повлияют на размер ClickPipe.

Чтобы увеличить пропускную способность при задачах с большим объёмом приёма данных, рекомендуется масштабировать сервис ClickHouse перед созданием ClickPipe.

## Известные ограничения {#known-limitations}

### Размер файла {#file-size}

ClickPipes будет пытаться выполнять приём только объектов размером **10 ГБ или меньше**. Если файл больше 10 ГБ, в выделенную таблицу ошибок ClickPipes будет добавлена запись об ошибке.

### Совместимость {#compatibility}

GCS ClickPipe использует в Cloud Storage интерфейс [XML API](https://docs.cloud.google.com/storage/docs/interoperability) для обеспечения совместимости, что требует использования префикса bucket`https://storage.googleapis.com/` (вместо `gs://`) и применения [HMAC-ключей](https://docs.cloud.google.com/storage/docs/authentication/hmackeys) для аутентификации.

### Поддержка представлений {#view-support}

Поддерживаются также materialized views, основанные на целевой таблице. ClickPipes будут создавать промежуточные таблицы не только для целевой таблицы, но и для всех зависящих от неё materialized views.

Мы не создаём промежуточные таблицы для нематериализованных представлений. Это означает, что если у вас есть целевая таблица с одним или несколькими downstream materialized views, эти materialized views не должны выбирать данные из целевой таблицы через обычное представление. В противном случае вы можете обнаружить, что в materialized view отсутствуют данные.