---
slug: /cloud/data-sources/secure-iceberg
sidebar_label: 'Безопасный доступ к данным Iceberg'
title: 'Безопасный доступ к данным Iceberg'
description: 'В этой статье показано, как клиенты ClickHouse Cloud могут безопасно получать доступ к данным Apache Iceberg в объектном хранилище с использованием ролевого управления доступом.'
keywords: ['Iceberg', 'RBAC', 'Amazon S3', 'аутентификация']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';

ClickHouse Cloud поддерживает безопасный ролевой доступ к данным Iceberg, хранящимся в объектном хранилище (обычно S3), с использованием доверительной связи AWS IAM на основе ARN. В этом руководстве используется та же схема безопасной настройки, что и в [Безопасный доступ к данным S3](/cloud/data-sources/secure-s3), а также добавляется специфичная для Iceberg конфигурация ClickHouse.

## Обзор \{#overview\}

* Получите ID сервисной роли ClickHouse Cloud (IAM).
* Создайте роль IAM в своей учетной записи AWS, которую ClickHouse сможет принять.
* Прикрепите к роли политики доступа к объектам и каталогу для Iceberg.
* Используйте табличные функции Iceberg или движок таблицы IcebergS3 с ролевыми учётными данными.

## Получите ARN идентификатора сервисной роли ClickHouse \{#obtaining-the-clickhouse-service-iam-role-arn\}

<VerticalStepper headerLevel="h3">
  ### 1. Войдите в свой аккаунт ClickHouse Cloud. \{#login\}

  ### 2. Выберите сервис ClickHouse, в котором вы хотите выполнять запросы к данным Iceberg. \{#select-service\}

  ### 3. Перейдите на вкладку **Settings**. \{#settings-tab\}

  ### 4. Прокрутите страницу до раздела **Network security information**. \{#network-security-information\}

  ### 5. Скопируйте значение **Service role ID (IAM)**. \{#service-role-iam-value\}

  Этот ARN необходим для политики доверия роли IAM AWS, которая будет получать доступ к вашим данным Iceberg.

  <Image img={s3_info} size="lg" alt="Получение ARN роли IAM сервиса ClickHouse" border />
</VerticalStepper>

## Настройте Assume Role в IAM \{#setting-up-iam-assume-role\}

<VerticalStepper headerLevel="h3">
  ### 1. Войдите в AWS и перейдите в сервис IAM. \{#aws-iam-service\}

  ### 2. Выберите Roles, затем Create role. \{#create-role\}

  В поле `Trusted entity type` выберите `Custom trust policy` и введите значения из шага 3.

  ### 3. Добавьте политики доверия и IAM. \{#add-trust-iam-policies\}

  Замените `{service-role-id}` на Service Role ID (IAM) из вашего экземпляра ClickHouse.

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "ClickHouseServiceRoleTrustPolicy",
        "Effect": "Allow",
        "Action": "sts:AssumeRole",
        "Principal": {
          "AWS": "{service-role-id}"  
        }
      },
      {
        "Sid": "ReadOnlyIcebergS3IAMPolicy",
        "Effect": "Allow",
        "Action": [
          "s3:GetBucketLocation",
          "s3:ListBucket",
          "s3:GetObject",
          "s3:ListMultipartUploadParts",
          "s3:GetObjectVersion",
          "s3:ListBucketVersions"
        ],
        "Resource": [
          "arn:aws:s3:::{your-bucket}",
          "arn:aws:s3:::{your-bucket}/*"
        ]
      },
      {
        "Sid": "OptionalGlueDataCatalogIAMPolicy",
        "Effect": "Allow",
        "Action": [
          "glue:GetDatabase",
          "glue:GetDatabases",
          "glue:GetTable",
          "glue:GetTables",
          "glue:GetPartition",
          "glue:GetPartitions"
        ],
        "Resource": "arn:aws:glue:{region}:{account-id}:*"
      }
    ]
  }
  ```

  :::note
  Для рабочих нагрузок с чтением и записью политика IAM должна включать `s3:PutObject`, `s3:DeleteObject` и действия Iceberg, изменяющие метаданные. Приведённый выше пример — это консервативный вариант только для чтения.

  Если вам нужна более строгая изоляция, требуйте, чтобы запросы поступали из конечных точек VPC ClickHouse Cloud. Дополнительная информация об этой настройке приведена в разделе [Secure S3 advanced action control](/docs/cloud/data-sources/secure-s3#advanced-action-control).
  :::

  ### 4. Завершите создание роли. \{#finish-role-creation\}

  a. Нажмите Next, затем ещё раз Next на экране назначения разрешений.

  b. Добавьте имя (например, `iceberg-role-for-clickhouse`) и описание.

  c. Добавьте теги (необязательно).

  d. Проверьте политики.

  e. Выберите `Create role`.

  ### 5. После создания скопируйте новый **ARN роли IAM**. \{#copy-role-arn\}
</VerticalStepper>

## Настройка доступа к Iceberg в ClickHouse Cloud \{#configure-iceberg-access\}

### Вариант A: табличная функция Iceberg с ARN роли \{#iceberg-table-function-with-role-arn\}

Используйте табличную функцию `icebergS3` с настройкой `NOSIGN` и ролевыми учетными данными. ClickHouse Cloud вызовет STS, чтобы принять на себя эту роль.

```sql
SELECT count(*)
FROM icebergS3(
  'https://{your-bucket}.s3.{region}.amazonaws.com/{iceberg-path}/',
  'NOSIGN',
  extra_credentials(role_arn='arn:aws:iam::{account-id}:role/iceberg-role-for-clickhouse', role_session_name='iceberg-session')
);
```

### Вариант B: постоянный движок таблицы Iceberg \{#persistent-iceberg-table-engine\}

```sql
CREATE TABLE iceberg_secure (
  id UInt64,
  event_date Date,
  data String
)
ENGINE = IcebergS3(
  'https://{your-bucket}.s3.{region}.amazonaws.com/{iceberg-path}/',
  'NOSIGN',
  extra_credentials(role_arn='arn:aws:iam::{account-id}:role/iceberg-role-for-clickhouse')
);
```

### Вариант C: каталог Glue + IcebergS3 \{#glue-catalog-plus-icebergs3\}

```sql
CREATE TABLE my_db.my_table
ENGINE = IcebergS3(
  's3://{your-bucekt}/warehouse/{db}/{table}/',
  'NOSIGN',
  extra_credentials(role_arn='arn:aws:iam::{account-id}:role/iceberg-role-for-clickhouse')
)
SETTINGS
  catalog_type = 'glue',
  warehouse = '{your-warehouse}',
  storage_endpoint = 's3://{your-bucket}',
  region = '{region}'
  aws_role_arn = 'arn:aws:iam::{account-id}:role/iceberg-role-for-clickhouse';
```

> Примечание: при использовании каталога Glue убедитесь, что у вашей роли IAM есть разрешения на чтение и просмотр списка как для S3, так и для Glue.

### Вариант D: DataLake Catalog for Glue \{#datalake-catalog-for-glue\}

:::note
DataLake Catalog for Glue будет доступен в версии 26.2.
:::

```sql
CREATE DATABASE glue_test2
ENGINE = DataLakeCatalog
SETTINGS 
    catalog_type = 'glue', 
    region = {region}, 
    aws_role_arn = 'arn:aws:iam::{account-id}:role/iceberg-role-for-clickhouse',
    aws_role_session_name = {session-name},
    SETTINGS
    allow_database_glue_catalog = 1;
```

## Проверьте доступ \{#validate-access\}

1. Выполните простой запрос:

```sql
SELECT * FROM icebergS3('https://{your-bucket}.s3.{region}.amazonaws.com/{iceberg-path}/', 'NOSIGN')
LIMIT 5;
```

2. Проверьте, нет ли ошибок IAM, таких как `AccessDenied` или `InvalidAccessKeyId`.

## Устранение неполадок \{#troubelshooting\}

* Проверьте ARN роли в настройках сервиса ClickHouse Cloud.
* Убедитесь, что бакет и объекты находятся в том же регионе, что и запросы Iceberg, чтобы снизить задержку и стоимость.
* Убедитесь, что путь к таблице Iceberg указывает на корректное расположение метаданных Iceberg (файлы `metadata/v1/...` в корневом каталоге таблицы).
* В режиме каталога проверьте метаданные Glue и видимость партиций в консоли AWS Glue.