---
sidebar_label: 'Экспорт резервных копий'
slug: /cloud/manage/backups/export-backups-to-own-cloud-account
title: 'Экспорт резервных копий в свою учетную запись в облаке'
description: 'Описывает, как экспортировать резервные копии в свою учетную запись в облаке'
doc_type: 'guide'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

<EnterprisePlanFeatureBadge />

ClickHouse Cloud поддерживает создание резервных копий в вашу собственную учётную запись у провайдера облачных сервисов (CSP) (AWS S3, Google Cloud Storage или Azure Blob Storage).
Подробности о том, как работает резервное копирование в ClickHouse Cloud, включая различия между «полными» и «инкрементными» резервными копиями, см. в разделе [backups](/cloud/manage/backups/overview).

В этом руководстве мы покажем примеры создания полных и инкрементных резервных копий в объектные хранилища AWS, GCP и Azure, а также примеры восстановления из резервных копий.

:::note
Пользователям следует учитывать, что любой сценарий, при котором резервные копии экспортируются в другой регион того же облачного провайдера, повлечёт за собой расходы на [data transfer](/cloud/manage/network-data-transfer). В настоящее время мы не поддерживаем межоблачные резервные копии.
:::


## Требования {#requirements}

Для экспорта и восстановления резервных копий в собственное хранилище CSP потребуются следующие данные.

### AWS {#aws}

1. Конечная точка AWS S3 в формате:

```text
s3://<bucket_name>.s3.amazonaws.com/<directory>
```

Например:

```text
s3://testchbackups.s3.amazonaws.com/backups/
```

Где: - `testchbackups` — имя корзины S3 для экспорта резервных копий. - `backups` — необязательный подкаталог.

2. Ключ доступа и секретный ключ AWS. Также поддерживается аутентификация на основе ролей AWS, которую можно использовать вместо ключа доступа и секретного ключа AWS.

:::note
Для использования аутентификации на основе ролей следуйте инструкциям по [настройке](https://clickhouse.com/docs/cloud/security/secure-s3) Secure S3. Кроме того, необходимо добавить разрешения `s3:PutObject` и `s3:DeleteObject` к политике IAM, описанной [здесь](https://clickhouse.com/docs/cloud/security/secure-s3#option-2-manually-create-iam-role).
:::

### Azure {#azure}

1. Строка подключения к хранилищу Azure.
2. Имя контейнера Azure в учетной записи хранения.
3. Большой двоичный объект Azure (Azure Blob) внутри контейнера.

### Google Cloud Storage (GCS) {#google-cloud-storage-gcs}

1. Конечная точка GCS в формате:

   ```text
   https://storage.googleapis.com/<bucket_name>/
   ```

2. Ключ доступа HMAC и секретный ключ HMAC.


<hr/>
# Резервное копирование и восстановление



## Резервное копирование и восстановление в AWS S3 Bucket {#backup--restore-to-aws-s3-bucket}

### Создание резервной копии БД {#take-a-db-backup}

**Полное резервное копирование**

```sql
BACKUP DATABASE test_backups
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

Где `uuid` — уникальный идентификатор, используемый для разделения наборов резервных копий.

:::note
Для каждой новой резервной копии в этом подкаталоге необходимо использовать отдельный UUID, иначе возникнет ошибка `BACKUP_ALREADY_EXISTS`.
Например, при ежедневном резервном копировании необходимо использовать новый UUID каждый день.
:::

**Инкрементное резервное копирование**

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

См.: [Настройка BACKUP/RESTORE для использования конечной точки S3](/operations/backup#configuring-backuprestore-to-use-an-s3-endpoint) для получения дополнительной информации.


## Резервное копирование и восстановление в Azure Blob Storage {#backup--restore-to-azure-blob-storage}

### Создание резервной копии БД {#take-a-db-backup-1}

**Полное резервное копирование**

```sql
BACKUP DATABASE test_backups
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>');
```

Где `uuid` — уникальный идентификатор, используемый для разделения наборов резервных копий.

**Инкрементное резервное копирование**

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

См.: [Настройка BACKUP/RESTORE для использования конечной точки AzureBlobStorage](/operations/backup#configuring-backuprestore-to-use-an-azureblobstorage-endpoint) для получения дополнительной информации.


## Резервное копирование и восстановление в Google Cloud Storage (GCS) {#backup--restore-to-google-cloud-storage-gcs}

### Создание резервной копии базы данных {#take-a-db-backup-2}

**Полное резервное копирование**

```sql
BACKUP DATABASE test_backups
TO S3('https://storage.googleapis.com/<bucket>/<uuid>', <hmac-key>', <hmac-secret>)
```

Где `uuid` — уникальный идентификатор, используемый для разделения наборов резервных копий.

**Инкрементное резервное копирование**

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
