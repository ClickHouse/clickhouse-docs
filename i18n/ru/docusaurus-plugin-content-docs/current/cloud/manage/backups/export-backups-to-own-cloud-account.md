---
sidebar_label: 'Экспорт резервных копий в ваш собственный облачный аккаунт'
slug: /cloud/manage/backups/export-backups-to-own-cloud-account
title: 'Экспорт резервных копий в ваш собственный облачный аккаунт'
description: 'Описание процесса экспорта резервных копий в ваш собственный облачный аккаунт'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

<EnterprisePlanFeatureBadge/>

ClickHouse Cloud поддерживает создание резервных копий в вашем собственном аккаунте поставщика облачных услуг (CSP) (AWS S3, Google Cloud Storage или Azure Blob Storage).
Для получения подробной информации о том, как работают резервные копии ClickHouse Cloud, включая "полные" и "инкрементные" резервные копии, смотрите документацию по [резервным копиям](overview.md).

Здесь мы показываем примеры того, как делать полные и инкрементные резервные копии в AWS, GCP, Azure object storage, а также как восстановить данные из резервных копий.

:::note
Пользователям следует учитывать, что любое использование, при котором резервные копии экспортируются в другой регион одного и того же поставщика облачных услуг или в другой поставщик облачных услуг (в том же или другом регионе), будет сопряжено с затратами на [трансфер данных](../network-data-transfer.mdx).
:::

## Требования {#requirements}

Вам понадобятся следующие данные для экспорта/восстановления резервных копий в ваше собственное хранилище CSP.

### AWS {#aws}

1. Конечная точка AWS S3 в формате:

    ```text
    s3://<bucket_name>.s3.amazonaws.com/<directory>
    ```

    Например: 
    ```text
    s3://testchbackups.s3.amazonaws.com/backups/
   ```
    Где:
   - `testchbackups` — имя S3 bucket, в который будут экспортироваться резервные копии.
   - `backups` — необязательная подпапка.


2. Ключ доступа AWS и секретный ключ.

### Azure {#azure}

1. Строка подключения к хранилищу Azure.
2. Имя контейнера Azure в аккаунте хранения.
3. Azure Blob внутри контейнера.

### Google Cloud Storage (GCS) {#google-cloud-storage-gcs}

1. Конечная точка GCS в формате:

    ```text
    https://storage.googleapis.com/<bucket_name>/
    ```
2. Ключ HMAC и секрет HMAC.

<hr/>

# Резервное копирование / Восстановление

## Резервное копирование / Восстановление в AWS S3 Bucket {#backup--restore-to-aws-s3-bucket}

### Создание резервной копии БД {#take-a-db-backup}

**Полная резервная копия**

```sql
BACKUP DATABASE test_backups 
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

Где `uuid` — уникальный идентификатор, используемый для различения наборов резервных копий.

:::note
Вам нужно будет использовать другой UUID для каждой новой резервной копии в этой подпапке, иначе вы получите ошибку `BACKUP_ALREADY_EXISTS`.
Например, если вы делаете ежедневные резервные копии, вам нужно будет использовать новый UUID каждый день.  
:::

**Инкрементная резервная копия**

```sql
BACKUP DATABASE test_backups 
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>') 
SETTINGS base_backup = S3('https://testchbackups.s3.amazonaws.com/backups/<base-backup-uuid>', '<key id>', '<key secret>')
```

### Восстановление из резервной копии {#restore-from-a-backup}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored 
FROM S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

Смотрите: [Настройка резервного копирования/восстановления для использования с S3 Endpoint](/operations/backup#configuring-backuprestore-to-use-an-s3-endpoint) для получения дополнительных сведений.

## Резервное копирование / Восстановление в Azure Blob Storage {#backup--restore-to-azure-blob-storage}

### Создание резервной копии БД {#take-a-db-backup-1}

**Полная резервная копия**

```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>');
```

Где `uuid` — уникальный идентификатор, используемый для различения наборов резервных копий.

**Инкрементная резервная копия**

```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>/my_incremental') 
SETTINGS base_backup = AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>')
```

### Восстановление из резервной копии {#restore-from-a-backup-1}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored_azure 
FROM AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>')
```

Смотрите: [Настройка резервного копирования/восстановления для использования с Azure Blob Storage](/operations/backup#configuring-backuprestore-to-use-an-azureblobstorage-endpoint) для получения дополнительных сведений.

## Резервное копирование / Восстановление в Google Cloud Storage (GCS) {#backup--restore-to-google-cloud-storage-gcs}

### Создание резервной копии БД {#take-a-db-backup-2}

**Полная резервная копия**

```sql
BACKUP DATABASE test_backups 
TO S3('https://storage.googleapis.com/<bucket>/<uuid>', <hmac-key>', <hmac-secret>)
```
Где `uuid` — уникальный идентификатор, используемый для различения наборов резервных копий.

**Инкрементная резервная копия**

```sql
BACKUP DATABASE test_backups 
TO S3('https://storage.googleapis.com/test_gcs_backups/<uuid>/my_incremental', 'key', 'secret')
SETTINGS base_backup = S3('https://storage.googleapis.com/test_gcs_backups/<uuid>', 'key', 'secret')
```

### Восстановление из резервной копии {#restore-from-a-backup-2}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored_gcs 
FROM S3('https://storage.googleapis.com/test_gcs_backups/<uuid>', 'key', 'secret')
```
