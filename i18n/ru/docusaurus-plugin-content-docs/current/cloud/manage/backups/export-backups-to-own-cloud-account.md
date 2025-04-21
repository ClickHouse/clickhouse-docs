---
sidebar_label: 'Экспорт резервных копий в вашу облачную учетную запись'
slug: /cloud/manage/backups/export-backups-to-own-cloud-account
title: 'Экспорт резервных копий в вашу облачную учетную запись'
description: 'Описание того, как экспортировать резервные копии в вашу облачную учетную запись'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

<EnterprisePlanFeatureBadge/>

ClickHouse Cloud поддерживает создание резервных копий в вашей облачной учетной записи (CSP) (AWS S3, Google Cloud Storage или Azure Blob Storage). Для получения информации о том, как работают резервные копии ClickHouse Cloud, включая "полные" и "инкрементные" резервные копии, смотрите документацию по [резервным копиям](overview.md).

Здесь мы показываем примеры того, как сделать полные и инкрементные резервные копии в AWS, GCP, Azure объектное хранилище, а также как восстановить данные из резервных копий.

:::note
Пользователи должны быть осведомлены о том, что любое использование, при котором резервные копии экспортируются в другой регион в том же облачном провайдере или в другой облачный провайдер (в том же или другом регионе), будет облагаться дополнительными [тарифами на передачу данных](../network-data-transfer.mdx).
:::

## Требования {#requirements}

Вам понадобятся следующие данные для экспорта/восстановления резервных копий в ваше собственное хранилище CSP.

### AWS {#aws}

1. Точка доступа AWS S3 в формате:

    ```text
    s3://<bucket_name>.s3.amazonaws.com/<directory>
    ```

    Например: 
    ```text
    s3://testchbackups.s3.amazonaws.com/backups/
    ```
    Где:
   - `testchbackups` — это имя S3-ведра, в которое будут экспортироваться резервные копии.
   - `backups` — это необязательный подпапка.

2. Ключ доступа AWS и секретный ключ.

### Azure {#azure}

1. Строка подключения к хранилищу Azure.
2. Имя контейнера Azure в учетной записи хранилища.
3. Blob Azure в контейнере.

### Google Cloud Storage (GCS) {#google-cloud-storage-gcs}

1. Точка доступа GCS в формате:

    ```text
    https://storage.googleapis.com/<bucket_name>/
    ```
2. Ключ доступа HMAC и секрет HMAC.

<hr/>

# Резервное копирование / Восстановление

## Резервное копирование / Восстановление в AWS S3 Bucket {#backup--restore-to-aws-s3-bucket}

### Создание резервной копии БД {#take-a-db-backup}

**Полная резервная копия**

```sql
BACKUP DATABASE test_backups 
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

Где `uuid` — это уникальный идентификатор, используемый для различия наборов резервных копий.

:::note
Каждая новая резервная копия в этой подпапке должна использовать другой UUID, иначе вы получите ошибку `BACKUP_ALREADY_EXISTS`. Например, если вы делаете резервные копии ежедневно, вам нужно будет использовать новый UUID каждый день.  
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

Смотрите: [Настройка BACKUP/RESTORE для использования точки доступа S3](/operations/backup#configuring-backuprestore-to-use-an-s3-endpoint) для получения более подробной информации.

## Резервное копирование / Восстановление в Azure Blob Storage {#backup--restore-to-azure-blob-storage}

:::note
Экспорт резервных копий в ваше собственное ведро в Azure Blob Storage пока недоступен. Мы обновим эту страницу, когда функция станет доступна.
:::

### Создание резервной копии БД {#take-a-db-backup-1}

**Полная резервная копия**

```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>');
```

Где `uuid` — это уникальный идентификатор, используемый для различия наборов резервных копий.

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

Смотрите: [Настройка BACKUP/RESTORE для использования точки доступа AzureBlobStorage](/operations/backup#configuring-backuprestore-to-use-an-azureblobstorage-endpoint) для получения более подробной информации.

## Резервное копирование / Восстановление в Google Cloud Storage (GCS) {#backup--restore-to-google-cloud-storage-gcs}

### Создание резервной копии БД {#take-a-db-backup-2}

**Полная резервная копия**

```sql
BACKUP DATABASE test_backups 
TO S3('https://storage.googleapis.com/<bucket>/<uuid>', <hmac-key>', <hmac-secret>)
```
Где `uuid` — это уникальный идентификатор, используемый для различия наборов резервных копий.

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
