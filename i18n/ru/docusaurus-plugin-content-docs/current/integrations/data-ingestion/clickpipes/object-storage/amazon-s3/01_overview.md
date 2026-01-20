---
sidebar_label: 'Обзор'
description: 'Легко подключайте объектное хранилище к ClickHouse Cloud.'
slug: /integrations/clickpipes/object-storage/s3/overview
sidebar_position: 1
title: 'Интеграция Amazon S3 с ClickHouse Cloud'
doc_type: 'guide'
---

import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import R2svg from '@site/static/images/integrations/logos/cloudflare.svg';
import cp_advanced_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_advanced_settings.png';
import cp_iam from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_iam.png';
import cp_credentials from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_credentials.png';
import Image from '@theme/IdealImage';

S3 ClickPipe обеспечивает полностью управляемый и отказоустойчивый способ ингестии данных из Amazon S3 и S3-совместимых объектных хранилищ в ClickHouse Cloud. Поддерживаются режимы **однократной** и **непрерывной ингестии** с гарантиями exactly-once.

S3 ClickPipes можно разворачивать и управлять ими вручную через ClickPipes UI, а также программно с использованием [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) и [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe).


## Поддерживаемые источники данных \{#supported-data-sources\}

| Name                 | Logo | Details           |
|----------------------|------|-------------------|
| **Amazon S3**            | <S3svg class="image" alt="Amazon S3 logo" style={{width: '2.5rem', height: 'auto'}}/> | Для непрерывной ингестии по умолчанию требуется [лексикографический порядок](#continuous-ingestion-lexicographical-order), но её можно настроить на [приём файлов в произвольном порядке](#continuous-ingestion-any-order). |
| **Cloudflare R2** <br></br> _S3-compatible_ | <R2svg class="image" alt="Cloudflare R2 logo" style={{width: '2.5rem', height: 'auto'}}/> | Непрерывная ингестия требует [лексикографического порядка](#continuous-ingestion-lexicographical-order). |
| **DigitalOcean Spaces** <br></br> _S3-compatible_ | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '2.5rem', height: 'auto'}}/>|  Непрерывная ингестия требует [лексикографического порядка](#continuous-ingestion-lexicographical-order). |

:::tip
Из-за различий в форматах URL и реализациях API у разных провайдеров объектного хранилища не все S3-совместимые сервисы поддерживаются «из коробки». Если вы сталкиваетесь с проблемами при работе с сервисом, который не указан выше, [свяжитесь с нашей командой](https://clickhouse.com/company/contact?loc=clickpipes).
:::

## Поддерживаемые форматы \{#supported-formats\}

- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [TSV](/interfaces/formats/TabSeparated)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)

## Возможности \{#features\}

### Однократная ингестия \{#one-time-ingestion\}

По умолчанию S3 ClickPipe загружает все файлы, соответствующие заданному шаблону, из указанного бакета в целевую таблицу ClickHouse в рамках одной пакетной операции. После завершения задачи по ингестии ClickPipe автоматически останавливается. Этот режим однократной ингестии обеспечивает семантику exactly-once, гарантируя надёжную обработку каждого файла без дублирования.

### Непрерывная ингестия \{#continuous-ingestion\}

Когда непрерывная ингестия включена, ClickPipes непрерывно принимает данные из указанного пути. Чтобы определить порядок ингестии, S3 ClickPipe по умолчанию полагается на неявный [лексикографический порядок](#continuous-ingestion-lexicographical-order) файлов. Также можно настроить приём файлов в [произвольном порядке](#continuous-ingestion-any-order) с использованием очереди [Amazon SQS](https://aws.amazon.com/sqs/), привязанной к бакету.

#### Лексикографический порядок \{#continuous-ingestion-lexicographical-order\}

По умолчанию S3 ClickPipe предполагает, что файлы добавляются в бакет в лексикографическом порядке и опирается на этот неявный порядок для последовательного приёма файлов. Это означает, что любой новый файл **должен** быть лексикографически больше последнего принятого файла. Например, файлы с именами `file1`, `file2` и `file3` будут приниматься последовательно, но если в бакет будет добавлен новый `file 0`, он будет **проигнорирован**, потому что имя файла лексикографически не больше, чем у последнего принятого файла.

В этом режиме S3 ClickPipe выполняет начальную загрузку **всех файлов** по указанному пути, а затем с настраиваемым интервалом (по умолчанию 30 секунд) периодически проверяет наличие новых файлов. **Невозможно** запустить ингестию, начиная с конкретного файла или момента времени — ClickPipes всегда загружает все файлы по указанному пути.

#### Любой порядок \{#continuous-ingestion-any-order\}

:::note
Режим без упорядочивания **поддерживается только** для Amazon S3 и **не** поддерживается для публичных бакетов. Для него требуется настроить очередь [Amazon SQS](https://aws.amazon.com/sqs/), подключённую к бакету.
:::

Можно настроить S3 ClickPipe для приёма файлов, не имеющих неявного порядка, настроив очередь [Amazon SQS](https://aws.amazon.com/sqs/), подключённую к бакету. Это позволяет ClickPipes прослушивать события создания объектов и выполнять ингестию любых новых файлов независимо от схемы именования.

В этом режиме S3 ClickPipe сначала выполняет начальную загрузку **всех файлов** по указанному пути, а затем прослушивает в очереди события `ObjectCreated:*`, которые соответствуют этому пути. Любое сообщение о ранее обработанном файле, о файле, не соответствующем пути, или о событии другого типа будет **игнорироваться**.

:::note
Указание префикса/постфикса для событий необязательно. Если вы его задаёте, убедитесь, что он совпадает с путём, указанным для ClickPipe. S3 не допускает несколько перекрывающихся правил уведомлений для одних и тех же типов событий.
:::

Файлы ингестируются при достижении порога, заданного в `max insert bytes` или `max file count`, либо по истечении настраиваемого интервала (по умолчанию 30 секунд). **Невозможно** запустить ингестию с конкретного файла или момента времени — ClickPipes всегда будут загружать все файлы по выбранному пути. Если настроен DLQ, неудачно обработанные сообщения будут повторно помещаться в очередь и переобрабатываться до числа раз, указанного в параметре DLQ `maxReceiveCount`.

:::tip
Настоятельно рекомендуем настроить **Dead-Letter-Queue (DLQ)** для очереди SQS, чтобы упростить отладку и повторную обработку неудачных сообщений.
:::

##### SNS в SQS \{#sns-to-sqs\}

Также можно отправлять уведомления о событиях S3 в SQS через тему SNS. Это полезно, если вы сталкиваетесь с ограничениями прямой интеграции S3 → SQS. В этом случае необходимо включить опцию [raw message delivery](https://docs.aws.amazon.com/sns/latest/dg/sns-large-payload-raw-message-delivery.html).

### Сопоставление шаблонов файлов \{#file-pattern-matching\}

Object Storage ClickPipes используют стандарт POSIX для сопоставления файлов по шаблону. Все шаблоны **чувствительны к регистру** и применяются к **полному пути** после имени бакета. Для лучшей производительности используйте максимально конкретный шаблон (например, `data-2024-*.csv` вместо `*.csv`).

#### Поддерживаемые шаблоны \{#supported-patterns\}

| Шаблон | Описание | Пример | Совпадения |
|---------|-------------|---------|---------|
| `?` | Совпадает ровно с **одним** символом (кроме `/`) | `data-?.csv` | `data-1.csv`, `data-a.csv`, `data-x.csv` |
| `*` | Совпадает с **нулём или более** символами (кроме `/`) | `data-*.csv` | `data-1.csv`, `data-001.csv`, `data-report.csv`, `data-.csv` |
| `**` <br></br> Рекурсивный шаблон | Совпадает с **нулём или более** символами (включая `/`). Позволяет **рекурсивно обходить каталоги**. | `logs/**/error.log` | `logs/error.log`, `logs/2024/error.log`, `logs/2024/01/error.log` |

**Примеры:**

* `https://bucket.s3.amazonaws.com/folder/*.csv`
* `https://bucket.s3.amazonaws.com/logs/**/data.json`
* `https://bucket.s3.amazonaws.com/file-?.parquet`
* `https://bucket.s3.amazonaws.com/data-2024-*.csv.gz`

#### Неподдерживаемые шаблоны \{#unsupported-patterns\}

| Шаблон     | Описание                          | Пример                 | Альтернативы                               |
|-------------|-----------------------------------|------------------------|--------------------------------------------|
| `{abc,def}` | Подстановка в фигурных скобках   | `{logs,data}/file.csv` | Создайте отдельные ClickPipes для каждого пути. |
| `{N..M}`    | Подстановка числового диапазона  | `file-{1..100}.csv`    | Используйте `file-*.csv` или `file-?.csv`. |

**Примеры:**

* `https://bucket.s3.amazonaws.com/{documents-01,documents-02}.json`
* `https://bucket.s3.amazonaws.com/file-{1..100}.csv`
* `https://bucket.s3.amazonaws.com/{logs,metrics}/data.parquet`

### Семантика «ровно один раз» \{#exactly-once-semantics\}

При приёме больших наборов данных могут происходить различные сбои, которые приводят к частичным вставкам или дублированию данных. ClickPipes для объектного хранилища устойчивы к ошибкам вставки и обеспечивают семантику «ровно один раз». Это достигается с помощью временных промежуточных (staging) таблиц. Сначала данные вставляются в staging-таблицы. Если при этой вставке что-то идёт не так, staging-таблицу можно очистить (`TRUNCATE`) и повторить вставку из чистого состояния. Только когда вставка завершена и прошла успешно, партиции в staging-таблице переносятся в целевую таблицу. Чтобы узнать больше об этой стратегии, ознакомьтесь с [этой записью в блоге](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3).

### Виртуальные столбцы \{#virtual-columns\}

Чтобы отслеживать, какие файлы были приняты при приёме данных, добавьте виртуальный столбец `_file` в список сопоставления столбцов. Виртуальный столбец `_file` содержит имя файла исходного объекта, которое можно использовать в запросах, чтобы определить, какие файлы были обработаны.

## Контроль доступа \{#access-control\}

### Права доступа \{#permissions\}

S3 ClickPipe поддерживает как общедоступные, так и приватные бакеты. Бакеты типа [Requester Pays](https://docs.aws.amazon.com/AmazonS3/latest/userguide/RequesterPaysBuckets.html) **не** поддерживаются.

#### Бакет S3 \{#s3-bucket\}

В политике бакета должны быть разрешены следующие действия:

* [`s3:GetObject`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html)
* [`s3:ListBucket`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html)

#### Очередь SQS \{#sqs-queue\}

При использовании [неупорядоченного режима](#continuous-ingestion-any-order) в политике очереди должны быть разрешены следующие действия:

* [`sqs:ReceiveMessage`](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_ReceiveMessage.html)
* [`sqs:DeleteMessage`](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_DeleteMessage.html)
* [`sqs:GetQueueAttributes`](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_GetQueueAttributes.html)
* [`sqs:ListQueues`](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_ListQueues.html)

### Аутентификация \{#authentication\}

#### Учетные данные IAM \{#iam-credentials\}

Чтобы использовать [ключи доступа](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) для аутентификации, при настройке подключения ClickPipe в поле **Authentication method** выберите `Credentials`. Затем укажите идентификатор ключа доступа (например, `AKIAIOSFODNN7EXAMPLE`) и секретный ключ доступа (например, `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`) в полях `Access key` и `Secret key` соответственно.

<Image img={cp_credentials} alt="Учетные данные IAM для S3 ClickPipes" size="lg" border/>

#### Роль IAM \{#iam-role\}

Чтобы использовать [управление доступом на основе ролей](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) для аутентификации, выберите `IAM role` в разделе **Authentication method** при настройке подключения ClickPipe.

<Image img={cp_iam} alt="Аутентификация IAM для S3 ClickPipes" size="lg" border/>

Воспользуйтесь [этим руководством](/cloud/data-sources/secure-s3), чтобы [создать роль](/cloud/data-sources/secure-s3#option-2-manually-create-iam-role) с необходимой политикой доверия для доступа к S3. Затем укажите ARN роли IAM в поле `IAM role ARN`.

### Сетевой доступ \{#network-access\}

S3 ClickPipes используют два отдельных сетевых маршрута для обнаружения метаданных и ингестии данных: сервис ClickPipes и сервис ClickHouse Cloud соответственно. Если вы хотите настроить дополнительный уровень сетевой безопасности (например, для целей соответствия требованиям), сетевой доступ **должен быть настроен для обоих маршрутов**.

* Для **контроля доступа на основе IP-адресов** политика корзины S3 должна разрешать статические IP-адреса для региона сервиса ClickPipes, перечисленные [здесь](/integrations/clickpipes#list-of-static-ips), а также [статические IP-адреса](/manage/data-sources/cloud-endpoints-api) для сервиса ClickHouse Cloud. Чтобы получить статические IP-адреса для вашего региона ClickHouse Cloud, откройте терминал и выполните:

    ```bash
    # Замените <your-region> на ваш регион ClickHouse Cloud
    curl -s https://api.clickhouse.cloud/static-ips.json | jq -r '.aws[] | select(.region == "<your-region>") | .egress_ips[]'
    ```

* Для **контроля доступа на основе конечных точек VPC (VPC endpoint)** корзина S3 должна находиться в том же регионе, что и сервис ClickHouse Cloud, и ограничивать операции `GetObject` идентификаторами конечных точек VPC сервиса ClickHouse Cloud. Чтобы получить конечные точки VPC для вашего региона ClickHouse Cloud, откройте терминал и выполните:

    ```bash
    # Замените <your-region> на ваш регион ClickHouse Cloud
    curl -s https://api.clickhouse.cloud/static-ips.json | jq -r '.aws[] | select(.region == "<your-region>") | .s3_endpoints[]'
    ```

## Расширенные настройки \{#advanced-settings\}

ClickPipes предоставляет оптимальные значения по умолчанию, которые удовлетворяют требованиям большинства сценариев. Если вашему сценарию требуется дополнительная настройка, вы можете изменить следующие параметры:

| Параметр                          | Значение по умолчанию |  Описание                     |                    
|-----------------------------------|------------------------|------------------------------------------------------------------|
| `Max insert bytes`                | 10GB                   | Количество байт, обрабатываемых в одном пакете вставки.         |
| `Max file count`                  | 100                    | Максимальное количество файлов, обрабатываемых в одном пакете вставки. |
| `Max threads`                     | auto(3)                | [Максимальное количество параллельных потоков](/operations/settings/settings#max_threads) для обработки файлов. |
| `Max insert threads`              | 1                      | [Максимальное количество параллельных потоков вставки](/operations/settings/settings#max_insert_threads) для обработки файлов. |
| `Min insert block size bytes`     | 1GB                    | [Минимальный размер блока в байтах](/operations/settings/settings#min_insert_block_size_bytes), который может быть вставлен в таблицу. |
| `Max download threads`            | 4                      | [Максимальное количество параллельных потоков загрузки](/operations/settings/settings#max_download_threads). |
| `Object storage polling interval` | 30s                    | Настраивает максимальный период ожидания перед вставкой данных в кластер ClickHouse. |
| `Parallel distributed insert select` | 2                   | [Параметр parallel_distributed_insert_select](/operations/settings/settings#parallel_distributed_insert_select). |
| `Parallel view processing`        | false                  | Включать ли отправку данных в присоединённые представления [параллельно вместо последовательной обработки](/operations/settings/settings#parallel_view_processing). |
| `Use cluster function`            | true                   | Выполнять ли обработку файлов параллельно на нескольких узлах. |

<Image img={cp_advanced_settings} alt="Расширенные настройки для ClickPipes" size="lg" border/>

### Масштабирование \{#scaling\}

Object Storage ClickPipes масштабируются исходя из минимального размера сервиса ClickHouse, определённого [настроенными параметрами вертикального автомасштабирования](/manage/scaling#configuring-vertical-auto-scaling). Размер ClickPipe фиксируется при создании конвейера. Последующие изменения настроек сервиса ClickHouse не повлияют на размер ClickPipe.

Чтобы увеличить пропускную способность при крупных задачах по приёму данных, рекомендуется масштабировать сервис ClickHouse перед созданием ClickPipe.

## Известные ограничения \{#known-limitations\}

### Размер файла \{#file-size\}

ClickPipes будет пытаться принимать только объекты, размер которых **10 ГБ или меньше**. Если файл превышает 10 ГБ, в специализированную таблицу ошибок ClickPipes будет добавлена запись об ошибке.

### Совместимость \{#compatibility\}

Несмотря на совместимость с S3, некоторые сервисы используют иную структуру URL-адресов, которую S3 ClickPipe может оказаться не в состоянии корректно разобрать (например, Backblaze B2), или требуют интеграции с зависящими от провайдера сервисами очередей для непрерывного неупорядоченного приёма данных. Если вы сталкиваетесь с проблемами при работе с сервисом, который не указан в разделе [Поддерживаемые источники данных](#supported-data-sources), пожалуйста, [обратитесь к нашей команде](https://clickhouse.com/company/contact?loc=clickpipes).

### Поддержка представлений \{#view-support\}

Поддерживаются также materialized view для целевой таблицы. ClickPipes создаст промежуточные таблицы не только для целевой таблицы, но и для любых зависящих от неё materialized view.

Мы не создаём промежуточные таблицы для нематериализованных представлений. Это означает, что если у вас есть целевая таблица с одной или несколькими нижестоящими materialized view, этим materialized view не следует выбирать данные из целевой таблицы через обычное представление. В противном случае вы можете столкнуться с отсутствующими данными в соответствующей materialized view.