---
sidebar_label: 'Использование BACKUP и RESTORE'
slug: /cloud/migration/oss-to-cloud-backup-restore
title: 'Миграция между самоуправляемым ClickHouse и ClickHouse Cloud с помощью BACKUP/RESTORE'
description: 'Страница, на которой описано, как выполнять миграцию между самоуправляемым ClickHouse и ClickHouse Cloud с помощью команд BACKUP и RESTORE'
doc_type: 'guide'
keywords: ['миграция', 'ClickHouse Cloud', 'OSS', 'Миграция самоуправляемого ClickHouse в Cloud', 'BACKUP', 'RESTORE']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Image from '@theme/IdealImage';
import create_service from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/create_service.png';
import service_details from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/service_details.png';
import open_console from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/open_console.png';
import service_role_id from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/service_role_id.png';
import create_new_role from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/create_new_role.png';
import backup_s3_bucket from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/backup_in_s3_bucket.png';


# Миграция с самоуправляемого ClickHouse на ClickHouse Cloud с использованием команд резервного копирования {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud-using-backup-commands}

## Обзор {#overview-migration-approaches}

Существует два основных способа миграции данных из самоуправляемого ClickHouse (OSS) в ClickHouse Cloud:

- С использованием функции [`remoteSecure()`](/cloud/migration/clickhouse-to-cloud), при которой данные напрямую считываются/записываются.
- С использованием команд `BACKUP`/`RESTORE` через объектное хранилище в облаке

>В этом руководстве по миграции основное внимание уделяется подходу с использованием `BACKUP`/`RESTORE` и приводится практический пример
миграции базы данных или полного сервиса из самоуправляемого ClickHouse с открытым исходным кодом в Cloud через бакет S3.

**Предварительные требования**

- Установлен Docker
- У вас есть [бакет S3 и IAM-пользователь](/integrations/s3/creating-iam-user-and-s3-bucket)
- Вы можете создать новый сервис ClickHouse Cloud

Чтобы шаги в этом руководстве было легко повторять и воспроизводить, мы будем использовать одну из конфигураций docker compose
для кластера ClickHouse с двумя сегментами и двумя репликами.

:::note[Требуется кластер]
Этот метод резервного копирования требует кластера ClickHouse, поскольку таблицы должны быть преобразованы из движка `MergeTree` в `ReplicatedMergeTree`.
Если вы запускаете одиночный экземпляр, вместо этого выполните шаги из раздела ["Migrating between self-managed ClickHouse and ClickHouse Cloud using remoteSecure"](/cloud/migration/clickhouse-to-cloud).
:::

## Подготовка OSS {#oss-setup}

Сначала мы развернём кластер ClickHouse с использованием конфигурации Docker Compose из нашего репозитория с примерами.
Вы можете пропустить развертывание кластера ClickHouse, если он у вас уже запущен.

1. Клонируйте [репозиторий с примерами](https://github.com/ClickHouse/examples) на локальную машину.
2. В терминале выполните команду `cd` в каталог `examples/docker-compose-recipes/recipes/cluster_2S_2R`.
3. Убедитесь, что Docker запущен, затем запустите кластер ClickHouse:

```bash
docker compose up
```

Вы должны увидеть следующее:

```bash
[+] Running 7/7
 ✔ Container clickhouse-keeper-01  Created  0.1s
 ✔ Container clickhouse-keeper-02  Created  0.1s
 ✔ Container clickhouse-keeper-03  Created  0.1s
 ✔ Container clickhouse-01         Created  0.1s
 ✔ Container clickhouse-02         Created  0.1s
 ✔ Container clickhouse-04         Created  0.1s
 ✔ Container clickhouse-03         Created  0.1s
```

В новом окне терминала в корневом каталоге проекта выполните следующую команду, чтобы подключиться к первому узлу кластера:

```bash
docker exec -it clickhouse-01 clickhouse-client
```


### Создание демонстрационных данных {#create-sample-data}

ClickHouse Cloud работает с [`SharedMergeTree`](/cloud/reference/shared-merge-tree).
При восстановлении резервной копии ClickHouse автоматически преобразует таблицы с `ReplicatedMergeTree` в таблицы `SharedMergeTree`.

Скорее всего, ваши таблицы уже используют движок `ReplciatedMergeTree`, если вы запускаете кластер.
Если нет, вам нужно будет преобразовать все таблицы `MergeTree` в `ReplicatedMergeTree` перед созданием резервной копии.

В целях демонстрации того, как преобразовывать таблицы `MergeTree` в `ReplicatedMergeTree`, мы начнём с таблицы `MergeTree` и затем преобразуем её в `ReplicatedMergeTree`.
Мы воспользуемся первыми двумя шагами из [руководства по данным такси Нью‑Йорка](/getting-started/example-datasets/nyc-taxi), чтобы создать пример таблицы и загрузить в неё данные.
Эти шаги приведены ниже для вашего удобства.

Выполните следующие команды, чтобы создать новую базу данных и вставить данные из бакета S3 в новую таблицу:

```sql
CREATE DATABASE nyc_taxi;

CREATE TABLE nyc_taxi.trips_small (
    trip_id             UInt32,
    pickup_datetime     DateTime,
    dropoff_datetime    DateTime,
    pickup_longitude    Nullable(Float64),
    pickup_latitude     Nullable(Float64),
    dropoff_longitude   Nullable(Float64),
    dropoff_latitude    Nullable(Float64),
    passenger_count     UInt8,
    trip_distance       Float32,
    fare_amount         Float32,
    extra               Float32,
    tip_amount          Float32,
    tolls_amount        Float32,
    total_amount        Float32,
    payment_type        Enum('CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4, 'UNK' = 5),
    pickup_ntaname      LowCardinality(String),
    dropoff_ntaname     LowCardinality(String)
)
ENGINE = MergeTree
PRIMARY KEY (pickup_datetime, dropoff_datetime);
```

```sql
INSERT INTO nyc_taxi.trips_small
SELECT
    trip_id,
    pickup_datetime,
    dropoff_datetime,
    pickup_longitude,
    pickup_latitude,
    dropoff_longitude,
    dropoff_latitude,
    passenger_count,
    trip_distance,
    fare_amount,
    extra,
    tip_amount,
    tolls_amount,
    total_amount,
    payment_type,
    pickup_ntaname,
    dropoff_ntaname
FROM s3(
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_{0..2}.gz',
    'TabSeparatedWithNames'
);
```

Выполните следующую команду, чтобы отсоединить таблицу с помощью `DETACH`.

```sql
DETACH TABLE nyc_taxi.trips_small;
```

Затем подключите её как реплицированную таблицу:

```sql
ATTACH TABLE nyc_taxi.trips_small AS REPLICATED;
```

Наконец, восстановите метаданные реплики:

```sql
SYSTEM RESTORE REPLICA nyc_taxi.trips_small;
```

Убедитесь, что таблица была преобразована в `ReplicatedMergeTree`:

```sql
SELECT engine
FROM system.tables
WHERE name = 'trips_small' AND database = 'nyc_taxi';

┌─engine──────────────┐
│ ReplicatedMergeTree │
└─────────────────────┘
```

Теперь вы готовы перейти к настройке сервиса Cloud в рамках подготовки к последующему
восстановлению резервной копии из вашего S3-бакета.


## Подготовка Cloud {#cloud-setup}

Вы будете восстанавливать данные в новый сервис в Cloud.
Выполните шаги ниже, чтобы создать новый сервис в Cloud.

<VerticalStepper headerLevel="h4">

#### Откройте Cloud Console {#open-cloud-console}

Перейдите по адресу [https://console.clickhouse.cloud/](https://console.clickhouse.cloud/)

#### Создайте новый сервис {#create-new-service}

<Image img={create_service} size="md" alt="создание нового сервиса"/> 

#### Настройте и создайте сервис {#configure-and-create}

Выберите нужный регион и конфигурацию, затем нажмите `Create service`.

<Image img={service_details} size="md" alt="настройка параметров сервиса"/> 

#### Создайте роль доступа {#create-an-access-role}

Откройте SQL‑консоль.

<Image img={open_console} size="md" alt="настройка параметров сервиса"/>

### Настройка доступа к S3 {#set-up-s3-access}

Чтобы восстановить резервную копию из S3, необходимо настроить защищённый доступ между ClickHouse Cloud и вашим бакетом S3.

1. Следуйте шагам из раздела ["Accessing S3 data securely"](/cloud/data-sources/secure-s3), чтобы создать роль доступа и получить ARN роли.

2. Обновите политику бакета S3, созданную в разделе ["How to create an S3 bucket and IAM role"](/integrations/s3/creating-iam-user-and-s3-bucket), добавив ARN роли из предыдущего шага.

Обновлённая политика для бакета S3 будет выглядеть примерно так:

```json
{
    "Version": "2012-10-17",
    "Id": "Policy123456",
    "Statement": [
        {
            "Sid": "abc123",
            "Effect": "Allow",
            "Principal": {
                "AWS": [
#highlight-start                  
                    "arn:aws:iam::123456789123:role/ClickHouseAccess-001",
                    "arn:aws:iam::123456789123:user/docs-s3-user"
#highlight-end                            
                ]
            },
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::ch-docs-s3-bucket",
                "arn:aws:s3:::ch-docs-s3-bucket/*"
            ]
        }
    ]
}
```

Политика включает оба ARN:
- **IAM user** (`docs-s3-user`): разрешает вашему самоуправляемому кластеру ClickHouse создавать резервные копии в S3
- **Роль ClickHouse Cloud** (`ClickHouseAccess-001`): разрешает вашему сервису в Cloud выполнять восстановление из S3

</VerticalStepper>

## Создание резервной копии (в самоуправляемом развертывании) {#taking-a-backup-on-oss}

Чтобы создать резервную копию одной базы данных, выполните следующую команду из clickhouse-client,
подключённого к вашему развертыванию OSS:

```sql
BACKUP DATABASE nyc_taxi
TO S3(
  'BUCKET_URL',
  'KEY_ID',
  'SECRET_KEY'
)
```

Замените `BUCKET_URL`, `KEY_ID` и `SECRET_KEY` на ваши собственные учётные данные AWS.
Руководство [&quot;How to create an S3 bucket and IAM role&quot;](/integrations/s3/creating-iam-user-and-s3-bucket)
объясняет, как получить эти данные, если у вас их ещё нет.

Если всё настроено правильно вы увидите ответ похожий на приведённый ниже
содержащий уникальный id присвоенный бэкапу и статус этого бэкапа.

```response
Query id: efcaf053-75ed-4924-aeb1-525547ea8d45

┌─id───────────────────────────────────┬─status─────────┐
│ e73b99ab-f2a9-443a-80b4-533efe2d40b3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

Если вы проверите ранее пустой бакет S3, то теперь увидите, что в нём появились некоторые папки:

<Image img={backup_s3_bucket} size="md" alt="backup, data and metadata" />

Если вы выполняете полную миграцию, вы можете выполнить следующую команду, чтобы создать резервную копию всего сервера:

```sql
BACKUP
TABLE system.users,
TABLE system.roles,
TABLE system.settings_profiles,
TABLE system.row_policies,
TABLE system.quotas,
TABLE system.functions,
ALL EXCEPT DATABASES INFORMATION_SCHEMA, information_schema, system
TO S3(
  'BUCKET_ID',
  'KEY_ID',
  'SECRET_ID'
)
SETTINGS
  compression_method='lzma',
  compression_level=3;
```

Приведённая выше команда создаёт резервную копию:

* Всех пользовательских баз данных и таблиц
* Учетных записей пользователей и паролей
* Ролей и прав доступа
* Профилей настроек
* Политик на уровне строк
* Квот
* Определяемых пользователем функций

Если вы используете другого поставщика облачных услуг (CSP), вы можете использовать синтаксис `TO S3()` (для AWS и GCP) и `TO AzureBlobStorage()`.

Для очень больших баз данных рассмотрите возможность использования `ASYNC`, чтобы запускать резервное копирование в фоновом режиме:

```sql
BACKUP DATABASE my_database 
TO S3('https://your-bucket.s3.amazonaws.com/backup.zip', 'key', 'secret')
ASYNC;
       
-- Returns immediately with backup ID
-- Example result:
-- ┌─id──────────────────────────────────┬─status────────────┐
-- │ abc123-def456-789                   │ CREATING_BACKUP   │
-- └─────────────────────────────────────┴───────────────────┘
```

Затем можно использовать идентификатор резервной копии, чтобы отслеживать ход резервного копирования:

```sql
SELECT * 
FROM system.backups 
WHERE id = 'abc123-def456-789'
```

Можно также создавать инкрементальные резервные копии.
За более подробной информацией о резервном копировании в целом обратитесь к документации по [резервному копированию и восстановлению](/operations/backup).


## Восстановление в ClickHouse Cloud {#restore-to-clickhouse-cloud}

Чтобы восстановить одну базу данных, выполните следующий запрос из вашего сервиса в ClickHouse Cloud, подставив ниже свои учётные данные AWS и задав `ROLE_ARN` равным значению, которое вы получили в результате выполнения шагов, описанных в разделе «Безопасный доступ к данным в S3» ([@link](/cloud/data-sources/secure-s3))

```sql
RESTORE DATABASE nyc_taxi
FROM S3(
    'BUCKET_URL',
    extra_credentials(role_arn = 'ROLE_ARN')
)
```

Полное восстановление сервиса можно выполнить аналогичным образом:

```sql
RESTORE
    TABLE system.users,
    TABLE system.roles,
    TABLE system.settings_profiles,
    TABLE system.row_policies,
    TABLE system.quotas,
    ALL EXCEPT DATABASES INFORMATION_SCHEMA, information_schema, system
FROM S3(
    'BUCKET_URL',
    extra_credentials(role_arn = 'ROLE_ARN')
)
```

Если теперь выполните следующий запрос в Cloud, вы увидите, что база данных и таблица были
успешно восстановлены в Cloud:

```sql
SELECT count(*) FROM nyc_taxi.trips_small;
3000317
```
