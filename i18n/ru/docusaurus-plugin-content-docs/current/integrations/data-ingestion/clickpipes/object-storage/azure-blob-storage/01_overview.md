---
sidebar_label: 'Обзор'
description: 'Легко подключайте объектное хранилище к ClickHouse Cloud.'
slug: /integrations/clickpipes/object-storage/abs/overview
sidebar_position: 1
title: 'Интеграция Azure Blob Storage с ClickHouse Cloud'
doc_type: 'guide'
---

import cp_advanced_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_advanced_settings.png';
import Image from '@theme/IdealImage';

ABS ClickPipe предоставляет полностью управляемый и отказоустойчивый способ приёма данных из Azure Blob Storage в ClickHouse Cloud. Он поддерживает как **однократную**, так и **непрерывную ингестию** с семантикой «exactly-once».

ABS ClickPipes можно развернуть и управлять ими вручную через ClickPipes UI, а также программно с помощью [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) и [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe).


## Поддерживаемые форматы \{#supported-formats\}

- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [TSV](/interfaces/formats/TabSeparated)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)

## Возможности \{#features\}

### Однократная ингестия \{#one-time-ingestion\}

ABS ClickPipe загрузит все файлы, соответствующие указанному шаблону, из заданного контейнера в целевую таблицу ClickHouse в рамках одного пакетного выполнения. После завершения задачи ингестии ClickPipe автоматически останавливается. Этот режим однократной ингестии обеспечивает семантику exactly-once, гарантируя, что каждый файл будет надёжно обработан без дубликатов.

### Непрерывная ингестия \{#continuous-ingestion\}

Когда включена непрерывная ингестия, ClickPipes осуществляет непрерывный приём данных по указанному пути. Для определения порядка ингестии данных ABS ClickPipe полагается на неявный [лексикографический порядок](#continuous-ingestion-lexicographical-order) файлов.

#### Лексикографический порядок \{#continuous-ingestion-lexicographical-order\}

ABS ClickPipe предполагает, что файлы добавляются в контейнер в лексикографическом порядке и полагается на этот неявный порядок для их последовательного приёма. Это означает, что любой новый файл **должен** быть лексикографически больше последнего принятого файла. Например, файлы с именами `file1`, `file2` и `file3` будут приниматься последовательно, но если в контейнер будет добавлен новый `file0`, он будет **проигнорирован**, потому что имя файла лексикографически не больше имени последнего принятого файла.

В этом режиме ABS ClickPipe выполняет начальную загрузку **всех файлов** по указанному пути, а затем периодически опрашивает источник на наличие новых файлов с настраиваемым интервалом (по умолчанию 30 секунд). **Невозможно** начать ингестию с конкретного файла или момента времени — ClickPipes всегда будут загружать все файлы по указанному пути.

### Сопоставление с шаблонами файлов \{#file-pattern-matching\}

Object Storage ClickPipes следуют стандарту POSIX для сопоставления с шаблонами файлов. Все шаблоны **чувствительны к регистру** и применяются к **полным путям** после имени контейнера. Для повышения производительности используйте наиболее специфичный шаблон (например, `data-2024-*.csv` вместо `*.csv`).

#### Поддерживаемые шаблоны \{#supported-patterns\}

| Шаблон | Описание | Пример | Совпадения |
|---------|-------------|---------|---------|
| `?` | Совпадает ровно с **одним** символом (кроме `/`) | `data-?.csv` | `data-1.csv`, `data-a.csv`, `data-x.csv` |
| `*` | Совпадает с **нулём или более** символами (кроме `/`) | `data-*.csv` | `data-1.csv`, `data-001.csv`, `data-report.csv`, `data-.csv` |
| `**` <br></br> Рекурсивный | Совпадает с **нулём или более** символами (включая `/`). Обеспечивает рекурсивный обход каталогов. | `logs/**/error.log` | `logs/error.log`, `logs/2024/error.log`, `logs/2024/01/error.log` |

**Примеры:**

* `https://storageaccount.blob.core.windows.net/container/folder/*.csv`
* `https://storageaccount.blob.core.windows.net/container/logs/**/data.json`
* `https://storageaccount.blob.core.windows.net/container/file-?.parquet`
* `https://storageaccount.blob.core.windows.net/container/data-2024-*.csv.gz`

#### Неподдерживаемые шаблоны \{#unsupported-patterns\}

| Шаблон     | Описание                                | Пример                | Альтернативы                                   |
|------------|-----------------------------------------|------------------------|-----------------------------------------------|
| `{abc,def}` | Расширение с фигурными скобками (альтернативы) | `{logs,data}/file.csv` | Создайте отдельные ClickPipes для каждого пути. |
| `{N..M}`    | Расширение числового диапазона         | `file-{1..100}.csv`    | Используйте `file-*.csv` или `file-?.csv`.    |

**Примеры:**

* `https://storageaccount.blob.core.windows.net/container/{documents-01,documents-02}.json`
* `https://storageaccount.blob.core.windows.net/container/file-{1..100}.csv`
* `https://storageaccount.blob.core.windows.net/container/{logs,metrics}/data.parquet`

### Семантика «ровно один раз» \{#exactly-once-semantics\}

При приёме больших объёмов данных могут происходить различные сбои, которые приводят к частичным вставкам или дублированию данных. Object Storage ClickPipes устойчивы к ошибкам вставки и обеспечивают семантику «ровно один раз». Это достигается с помощью временных таблиц «staging». Сначала данные вставляются во staging-таблицы. Если при вставке что-то идёт не так, staging-таблицу можно очистить (TRUNCATE), а вставку повторить с чистого состояния. Только после того, как вставка завершена и выполнена успешно, партиции в staging-таблице перемещаются в целевую таблицу. Чтобы подробнее изучить этот подход, ознакомьтесь с [этой записью в блоге](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3).

### Виртуальные столбцы \{#virtual-columns\}

Чтобы отслеживать, какие файлы были загружены (приняты), включите виртуальный столбец `_file` в список сопоставления столбцов. Виртуальный столбец `_file` содержит имя файла исходного объекта, по которому можно выполнять запросы, чтобы определить, какие файлы были обработаны.

## Контроль доступа \{#access-control\}

### Разрешения \{#permissions\}

ABS ClickPipe поддерживает только частные контейнеры. Открытые контейнеры **не** поддерживаются.

В политике корзины (bucket) для контейнеров должны быть разрешены действия [`s3:GetObject`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html) и [`s3:ListBucket`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html).

### Аутентификация \{#authentication\}

:::note
Аутентификация Microsoft Entra ID (включая Managed Identities) в настоящее время не поддерживается.
:::

Для аутентификации в Azure Blob Storage используется [строка подключения](https://docs.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string), которая поддерживает как ключи доступа, так и общие сигнатуры доступа (SAS, Shared Access Signatures).

#### Ключ доступа \{#access-key\}

Для аутентификации с помощью [ключа доступа к учетной записи](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage) укажите строку подключения в следующем формате:

```bash
DefaultEndpointsProtocol=https;AccountName=storage-account-name;AccountKey=account-access-key;EndpointSuffix=core.windows.net
```

Имя учетной записи хранилища и ключ доступа можно найти на портале Azure в разделе **Storage Account &gt; Access keys**.


#### Подпись общего доступа (SAS) \{#sas\}

Для аутентификации с использованием [Shared Access Signature (SAS)](https://docs.microsoft.com/en-us/azure/storage/common/storage-sas-overview) укажите строку подключения, содержащую SAS-токен:

```bash
BlobEndpoint=https://storage-account-name.blob.core.windows.net/;SharedAccessSignature=sas-token
```

Сгенерируйте SAS-токен в Azure Portal в разделе **Storage Account &gt; Shared access signature** с соответствующими правами (`Read`, `List`) для контейнера и BLOB-объектов, данные из которых вы хотите принимать.


### Сетевой доступ \{#network-access\}

ABS ClickPipes используют два отдельных сетевых пути для обнаружения метаданных и ингестии данных: сервис ClickPipes и сервис ClickHouse Cloud соответственно. Если вы хотите настроить дополнительный уровень сетевой безопасности (например, по требованиям соответствия), сетевой доступ **должен быть настроен для обоих путей**.

:::warning
Управление доступом на основе IP-адресов **не работает**, если ваш контейнер Azure Blob Storage находится в том же регионе Azure, что и ваш сервис ClickHouse Cloud. Когда оба сервиса находятся в одном регионе, трафик маршрутизируется через внутреннюю сеть Azure, а не через публичный интернет.
:::

* Для **управления доступом на основе IP-адресов** [сетевые правила IP](https://learn.microsoft.com/en-us/azure/storage/common/storage-network-security) для вашего брандмауэра Azure Storage должны разрешать статические IP-адреса для региона сервиса ClickPipes, перечисленные [здесь](/integrations/clickpipes#list-of-static-ips), а также [статические IP-адреса](/manage/data-sources/cloud-endpoints-api) для сервиса ClickHouse Cloud. Чтобы получить статические IP-адреса для вашего региона ClickHouse Cloud, откройте терминал и выполните:

    ```bash
    # Replace <your-region> with your ClickHouse Cloud region
    curl -s https://api.clickhouse.cloud/static-ips.json | jq -r '.azure[] | select(.region == "<your-region>") | .egress_ips[]'
    ```

## Расширенные настройки \{#advanced-settings\}

ClickPipes предоставляет оптимальные настройки по умолчанию, которые удовлетворяют требованиям большинства сценариев использования. Если вашему сценарию требуется дополнительная тонкая настройка, вы можете изменить следующие параметры:

| Параметр                          | Значение по умолчанию | Описание                                                                 |
|-----------------------------------|------------------------|--------------------------------------------------------------------------|
| `Max insert bytes`                | 10GB                   | Количество байт, обрабатываемых в одном пакете вставки.                  |
| `Max file count`                  | 100                    | Максимальное количество файлов, обрабатываемых в одном пакете вставки.   |
| `Max threads`                     | auto(3)                | [Максимальное количество параллельных потоков](/operations/settings/settings#max_threads) для обработки файлов. |
| `Max insert threads`              | 1                      | [Максимальное количество параллельных потоков вставки](/operations/settings/settings#max_insert_threads) для обработки файлов. |
| `Min insert block size bytes`     | 1GB                    | [Минимальный размер блока в байтах](/operations/settings/settings#min_insert_block_size_bytes), который может быть вставлен в таблицу. |
| `Max download threads`            | 4                      | [Максимальное количество параллельных потоков загрузки](/operations/settings/settings#max_download_threads). |
| `Object storage polling interval` | 30s                    | Настраивает максимальный период ожидания перед вставкой данных в кластер ClickHouse. |
| `Parallel distributed insert select` | 2                   | [Параметр parallel distributed insert select](/operations/settings/settings#parallel_distributed_insert_select). |
| `Parallel view processing`        | false                  | Включать ли отправку данных в присоединённые представления [параллельно вместо последовательной обработки](/operations/settings/settings#parallel_view_processing). |
| `Use cluster function`            | true                   | Следует ли обрабатывать файлы параллельно на нескольких узлах. |

<Image img={cp_advanced_settings} alt="Расширенные настройки для ClickPipes" size="lg" border/>

### Масштабирование \{#scaling\}

Object Storage ClickPipes масштабируются исходя из минимального размера сервиса ClickHouse, задаваемого [настроенными параметрами вертикального автоматического масштабирования](/manage/scaling#configuring-vertical-auto-scaling). Размер ClickPipe определяется при создании конвейера. Последующие изменения настроек сервиса ClickHouse не влияют на размер ClickPipe.

Чтобы увеличить пропускную способность для крупных заданий по приёму данных, рекомендуется масштабировать сервис ClickHouse до создания ClickPipe.

## Известные ограничения \{#known-limitations\}

### Размер файла \{#file-size\}

ClickPipes попытается принять только те объекты, размер которых **10 ГБ или меньше**. Если файл превышает 10 ГБ, в специальную таблицу ошибок ClickPipes будет добавлена запись об этой ошибке.

### Задержка \{#latency\}

Для контейнеров с более чем 100 000 файлов операции `LIST` в Azure Blob Storage добавляют дополнительную задержку при обнаружении новых файлов, сверх стандартного интервала опроса:

- **< 100k файлов**: ~30 секунд (стандартный интервал опроса)
- **100k файлов**: ~40–45 секунд  
- **250k файлов**: ~55–70 секунд
- **500k+ файлов**: может превышать 90 секунд

Для [непрерывной ингестии](#continuous-ingestion) ClickPipes необходимо просканировать контейнер, чтобы определить новые файлы, лексикографически больше, чем последний проингестированный файл. Рекомендуется организовывать файлы в более мелкие контейнеры или использовать иерархические структуры каталогов, чтобы уменьшить количество файлов на одну операцию `LIST`.

### Поддержка view \{#view-support\}

Поддерживаются также materialized view, зависящие от таблицы-приёмника. ClickPipes создаст промежуточные таблицы не только для таблицы-приёмника, но и для всех зависимых materialized view.

Мы не создаём промежуточные таблицы для нематериализованных view. Это означает, что если у вас есть таблица-приёмник с одним или несколькими производными materialized view, этим materialized view не следует выбирать данные через обычное view, построенное над таблицей-приёмником. В противном случае вы можете столкнуться с отсутствием данных в materialized view.

### Зависимости \{#dependencies\}

Любые изменения в целевой таблице, её materialized view (включая каскадные materialized view) или в целевых таблицах этих materialized view во время работы ClickPipe приведут к ошибкам, которые могут быть устранены повторной попыткой. Чтобы внести изменения в схему этих зависимостей, необходимо приостановить ClickPipe, применить изменения, а затем возобновить его.