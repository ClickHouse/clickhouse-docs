---
'sidebar_label': 'Экспорт резервных копий в вашу собственную облачную учетную запись'
'slug': '/cloud/manage/backups/export-backups-to-own-cloud-account'
'title': 'Экспорт резервных копий в вашу собственную облачную учетную запись'
'description': 'Описание того, как экспортировать резервные копии в вашу собственную
  облачную учетную запись'
'doc_type': 'guide'
---
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

<EnterprisePlanFeatureBadge/>

ClickHouse Cloud поддерживает создание резервных копий в вашем облачном сервис-провайдере (CSP) (AWS S3, Google Cloud Storage или Azure Blob Storage). Для получения подробной информации о том, как работают резервные копии ClickHouse Cloud, включая "полные" и "инкрементные" резервные копии, смотрите документацию о [резервных копиях](overview.md).

Здесь мы показываем примеры того, как создать полные и инкрементные резервные копии в AWS, GCP, Azure объектное хранилище, а также как восстановить данные из резервных копий.

:::note
Пользователи должны учитывать, что любое использование, при котором резервные копии экспортируются в другой регион того же облачного провайдера, повлечет за собой расходы на [перенос данных](/cloud/manage/network-data-transfer). В настоящее время мы не поддерживаем межоблачные резервные копии.
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
    - `testchbackups` — это имя S3 ведра для экспорта резервных копий.
    - `backups` — это необязательный подкаталог.

2. Ключ доступа AWS и секрет. Также поддерживается аутентификация на основе ролей AWS, которую можно использовать вместо ключа доступа и секрета AWS.

:::note
Для использования аутентификации на основе ролей, пожалуйста, следуйте инструкции по безопасности s3 [настройка](https://clickhouse.com/docs/cloud/security/secure-s3). Дополнительно вам нужно будет добавить права `s3:PutObject` и `s3:DeleteObject` в IAM политику, описанную [здесь.](https://clickhouse.com/docs/cloud/security/secure-s3#option-2-manually-create-iam-role)
:::

### Azure {#azure}

1. Строка подключения к хранилищу Azure.
2. Имя контейнера Azure в учетной записи хранилища.
3. Объект Azure Blob внутри контейнера.

### Google Cloud Storage (GCS) {#google-cloud-storage-gcs}

1. Точка доступа GCS в формате:

```text
https://storage.googleapis.com/<bucket_name>/
```
2. HMAC ключ доступа и HMAC секрет.

<hr/>

# Резервное копирование / Восстановление

## Резервное копирование / Восстановление в AWS S3 Ведро {#backup--restore-to-aws-s3-bucket}

### Создание резервной копии БД {#take-a-db-backup}

**Полная резервная копия**

```sql
BACKUP DATABASE test_backups 
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

Где `uuid` — это уникальный идентификатор, используемый для различия наборов резервных копий.

:::note
Вы должны использовать другой UUID для каждой новой резервной копии в этом подкаталоге, в противном случае вы получите ошибку `BACKUP_ALREADY_EXISTS`. Например, если вы выполняете ежедневное резервное копирование, вам нужно будет использовать новый UUID каждый день.
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

Смотрите: [Настройка BACKUP/RESTORE для использования точки доступа S3](/operations/backup#configuring-backuprestore-to-use-an-s3-endpoint) для получения дополнительных сведений.

## Резервное копирование / Восстановление в Azure Blob Storage {#backup--restore-to-azure-blob-storage}

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

Смотрите: [Настройка BACKUP/RESTORE для использования точки доступа Azure Blob Storage](/operations/backup#configuring-backuprestore-to-use-an-azureblobstorage-endpoint) для получения дополнительных сведений.

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