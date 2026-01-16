---
sidebar_label: 'Экспорт резервных копий'
slug: /cloud/manage/backups/export-backups-to-own-cloud-account
title: 'Экспорт резервных копий в вашу облачную учётную запись'
description: 'Описывает, как экспортировать резервные копии в вашу облачную учётную запись'
doc_type: 'guide'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

<EnterprisePlanFeatureBadge />

ClickHouse Cloud поддерживает создание резервных копий в вашу собственную учётную запись облачного провайдера (CSP) (AWS S3, Google Cloud Storage или Azure Blob Storage).
Подробную информацию о том, как работают резервные копии ClickHouse Cloud, включая «полные» и «инкрементальные» резервные копии, см. в документации по [резервному копированию](/cloud/manage/backups/overview).

В этом руководстве мы приведём примеры того, как создавать полные и инкрементальные резервные копии в объектное хранилище AWS, GCP и Azure, а также как восстанавливать данные из этих резервных копий.

:::note
При любом сценарии, когда резервные копии экспортируются в другой регион того же облачного провайдера, будет взиматься плата за [передачу данных](/cloud/manage/network-data-transfer). В настоящий момент мы не поддерживаем резервное копирование между разными облачными провайдерами.
:::


## Требования \\{#requirements\\}

Для экспорта и восстановления резервных копий в собственный бакет в хранилище CSP вам потребуются следующие параметры.

### AWS \{#aws\}

1. Endpoint AWS S3 в формате:

```text
  s3://<bucket_name>.s3.amazonaws.com/<directory>
```

Например:

```text
  s3://testchbackups.s3.amazonaws.com/backups/
```

Где:

* `testchbackups` — имя S3‑бакета, в который будут экспортироваться бэкапы.
  * `backups` — необязательный подкаталог.

2. Ключ доступа AWS и секретный ключ. Также поддерживается аутентификация на основе роли AWS, которую можно использовать вместо ключа доступа и секретного ключа.

:::note
Чтобы использовать аутентификацию на основе роли, следуйте инструкции по безопасной настройке S3 ([setup](https://clickhouse.com/docs/cloud/security/secure-s3)). Кроме того, вам потребуется добавить разрешения `s3:PutObject` и `s3:DeleteObject` к IAM‑политике, описанной [здесь.](https://clickhouse.com/docs/cloud/security/secure-s3#option-2-manually-create-iam-role)
:::


### Azure \\{#azure\\}

1. Строка подключения к хранилищу Azure.
2. Имя контейнера Azure в учетной записи хранилища.
3. Объект (blob) Azure внутри контейнера.

### Google Cloud Storage (GCS) \\{#google-cloud-storage-gcs\\}

1. Endpoint GCS в формате:

   ```text
   https://storage.googleapis.com/<bucket_name>/
   ```
2. HMAC‑ключ и HMAC‑секрет для доступа.

<hr/>

# Резервное копирование / Восстановление \{#backup-restore\}

## Резервное копирование в бакет AWS S3 и восстановление из него \\{#backup--restore-to-aws-s3-bucket\\}

### Создание резервной копии БД \{#take-a-db-backup\}

**Полная резервная копия**

```sql
BACKUP DATABASE test_backups 
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

Где `uuid` — уникальный идентификатор, используемый для различения набора бэкапов.

:::note
Вам необходимо использовать отдельный UUID для каждого нового бэкапа в этом подкаталоге, иначе вы получите ошибку `BACKUP_ALREADY_EXISTS`.
Например, если вы делаете ежедневные бэкапы, нужно использовать новый UUID каждый день.
:::

**Инкрементальный бэкап**

```sql
BACKUP DATABASE test_backups 
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>') 
SETTINGS base_backup = S3('https://testchbackups.s3.amazonaws.com/backups/<base-backup-uuid>', '<key id>', '<key secret>')
```


### Восстановление из резервной копии \{#restore-from-a-backup\}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored 
FROM S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

См. раздел [Настройка BACKUP/RESTORE для использования конечной точки S3](/operations/backup/s3_endpoint) для получения дополнительной информации.


## Резервное копирование и восстановление в Azure Blob Storage \\{#backup--restore-to-azure-blob-storage\\}

### Создание резервной копии базы данных \{#take-a-db-backup-1\}

**Полная резервная копия**

```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>');
```

Где `uuid` — уникальный идентификатор, используемый для различения набора резервных копий.

**Инкрементное резервное копирование**

```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>/my_incremental') 
SETTINGS base_backup = AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>')
```


### Восстановление из резервной копии \{#restore-from-a-backup-1\}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored_azure 
FROM AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>')
```

См. раздел [Настройка BACKUP/RESTORE для использования конечной точки AzureBlobStorage](/operations/backup/azure#configuring-backuprestore-to-use-an-azureblobstorage-endpoint) для получения дополнительной информации.


## Резервное копирование и восстановление в Google Cloud Storage (GCS) \\{#backup--restore-to-google-cloud-storage-gcs\\}

### Создание резервной копии базы данных \{#take-a-db-backup-2\}

**Полная резервная копия**

```sql
BACKUP DATABASE test_backups 
TO S3('https://storage.googleapis.com/<bucket>/<uuid>', <hmac-key>', <hmac-secret>)
```

Где `uuid` — уникальный идентификатор, используемый для различения набора резервных копий.

**Инкрементная резервная копия**

```sql
BACKUP DATABASE test_backups 
TO S3('https://storage.googleapis.com/test_gcs_backups/<uuid>/my_incremental', 'key', 'secret')
SETTINGS base_backup = S3('https://storage.googleapis.com/test_gcs_backups/<uuid>', 'key', 'secret')
```


### Восстановление из резервной копии \{#restore-from-a-backup-2\}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored_gcs 
FROM S3('https://storage.googleapis.com/test_gcs_backups/<uuid>', 'key', 'secret')
```
