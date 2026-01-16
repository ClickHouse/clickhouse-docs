---
sidebar_label: 'Резервное копирование и восстановление с помощью команд'
slug: /cloud/manage/backups/backup-restore-via-commands
title: 'Создание и восстановление резервной копии с помощью команд'
description: 'Страница, описывающая, как создать или восстановить резервную копию с использованием собственного бакета с помощью команд'
sidebar_position: 3
doc_type: 'guide'
keywords: ['резервные копии', 'восстановление после сбоев', 'защита данных', 'восстановление', 'возможности облака']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Создание и восстановление резервной копии с помощью команд \\{#commands-experience\\}

Помимо создания и восстановления резервных копий [через пользовательский интерфейс](/cloud/manage/backups/backup-restore-via-ui), вы можете использовать команды `BACKUP` и `RESTORE` для экспорта резервных копий в свои бакеты хранилища.
В этом руководстве приведены команды для всех трех облачных провайдеров (CSP).

## Требования \\{#requirements\\}

Вам понадобятся следующие данные, чтобы экспортировать и восстанавливать резервные копии в/из собственного бакета в хранилище CSP:

<Tabs>
  <TabItem value="AWS" label="AWS" default>
    1. Конечная точка AWS S3 в формате: `s3://<bucket_name>.s3.amazonaws.com/<optional_directory>`
       Например: `s3://testchbackups.s3.amazonaws.com/`
       Где:
         * `testchbackups` — имя бакета S3, в который будут экспортироваться резервные копии.
         * `backups` — необязательный подкаталог.
    2. Ключ доступа и секретный ключ AWS. Аутентификация на основе роли AWS также поддерживается и может использоваться вместо ключа доступа и секретного ключа AWS, как описано в разделе выше.
    <br/>
  </TabItem>
  <TabItem value="GCP" label="GCP">
   1. Конечная точка GCS в формате: `https://storage.googleapis.com/<bucket_name>/`
   2. Ключ доступа HMAC и секретный ключ HMAC.
   <br/>
  </TabItem>
  <TabItem value="Azure" label="Azure">
    1. Строка подключения к хранилищу Azure.
    2. Имя контейнера Azure в учетной записи хранилища.
    3. BLOB-объект Azure внутри контейнера.
    <br/>
  </TabItem>
</Tabs>

## Резервное копирование / восстановление отдельной БД \\{#backup_restore_db\\}

Ниже показано резервное копирование и восстановление *одной* базы данных.
Полные команды резервного копирования и восстановления смотрите в разделе [сводка команд резервного копирования](/operations/backup/overview#command-summary).

### AWS S3 \\{#aws-s3-bucket\\}

<Tabs>
  <TabItem value="Backup" label="BACKUP" default>

```sql
BACKUP DATABASE test_backups 
TO S3(
  'https://testchbackups.s3.amazonaws.com/<uuid>',
  '<key id>',
  '<key secret>'
)
```

Здесь `uuid` — уникальный идентификатор, используемый для различения наборов резервных копий.

:::note
Необходимо использовать разный uuid для каждой новой резервной копии в этом подкаталоге, иначе вы получите ошибку `BACKUP_ALREADY_EXISTS`.
Например, если вы делаете ежедневные резервные копии, нужно использовать новый uuid каждый день.
:::
  </TabItem>
  <TabItem value="Restore" label="RESTORE" default>

```sql
RESTORE DATABASE test_backups
FROM S3(
  'https://testchbackups.s3.amazonaws.com/<uuid>',
  '<key id>',
  '<key secret>'
)
```
  </TabItem>
</Tabs>

### Google Cloud Storage (GCS) \\{#google-cloud-storage\\}

<Tabs>
  <TabItem value="Backup" label="BACKUP" default>
```sql
BACKUP DATABASE test_backups 
TO S3(
  'https://storage.googleapis.com/<bucket>/<uuid>',
  '<hmac-key>',
  '<hmac-secret>'
)
```

Здесь `uuid` — уникальный идентификатор, используемый для идентификации резервной копии.

:::note
Необходимо использовать разный uuid для каждой новой резервной копии в этом подкаталоге, иначе вы получите ошибку `BACKUP_ALREADY_EXISTS`.
Например, если вы делаете ежедневные резервные копии, нужно использовать новый uuid каждый день.
:::

  </TabItem>
  <TabItem value="Restore" label="RESTORE" default>
```sql
RESTORE DATABASE test_backups
FROM S3(
  'https://storage.googleapis.com/<bucket>/<uuid>',
  '<hmac-key>',
  '<hmac-secret>'
)
```
  </TabItem>
</Tabs>

### Azure Blob Storage \\{#azure-blob-storage\\}

<Tabs>
  <TabItem value="Backup" label="BACKUP" default>
```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage(
  '<AzureBlobStorage endpoint connection string>',
  '<container>',
  '<blob>/<>'
)
```

Здесь `uuid` — уникальный идентификатор, используемый для идентификации резервной копии.

:::note
Необходимо использовать разный uuid для каждой новой резервной копии в этом подкаталоге, иначе вы получите ошибку `BACKUP_ALREADY_EXISTS`.
Например, если вы делаете ежедневные резервные копии, нужно использовать новый uuid каждый день.
:::
</TabItem>
<TabItem value="Restore" label="RESTORE" default>
```sql
RESTORE DATABASE test_backups
FROM AzureBlobStorage(
  '<AzureBlobStorage endpoint connection string>',
  '<container>',
  '<blob>/<uuid>'
)
```
  </TabItem>
</Tabs>

## Резервное копирование и восстановление всего сервиса \\{#backup_restore_entire_service\\}

Для резервного копирования всего сервиса используйте команды ниже.
Эта резервная копия будет содержать все пользовательские и системные данные созданных сущностей, профилей настроек, политик ролей, квот и функций.
Ниже приведены команды для AWS S3.
Вы можете использовать эти команды с синтаксисом, описанным выше, чтобы выполнять резервное копирование в GCS и Azure Blob Storage.

<Tabs>
<TabItem value="Backup" label="РЕЗЕРВНОЕ КОПИРОВАНИЕ" default>

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
    'https://testchbackups.s3.amazonaws.com/<uuid>',
    '<key id>',
    '<key secret>'
)
```

где `uuid` — уникальный идентификатор резервной копии.

</TabItem>
<TabItem value="Restore" label="ВОССТАНОВЛЕНИЕ" default>

```sql
RESTORE ALL
FROM S3(
    'https://testchbackups.s3.amazonaws.com/<uuid>',
    '<key id>',
    '<key secret>'
)
```
</TabItem>
</Tabs>

## FAQ \\{#backups-faq\\}

<details>
<summary>Что происходит с резервными копиями в моем объектном облачном хранилище? Очищает ли их ClickHouse когда‑нибудь?</summary>

Мы предоставляем вам возможность экспортировать резервные копии в ваш бакет, однако после записи мы не очищаем и не удаляем ни одну из них. Вы самостоятельно отвечаете за управление жизненным циклом резервных копий в вашем бакете, включая их удаление, при необходимости архивирование или перенос в более дешевое хранилище для оптимизации совокупной стоимости.

</details>

<details>
<summary>Что произойдет с процессом восстановления, если я перемещу некоторые из существующих резервных копий в другое место?</summary>

Если какие-либо резервные копии были перемещены в другое место, команду восстановления необходимо обновить, чтобы она ссылалась на новое расположение, где хранятся резервные копии.

</details>

<details>
<summary>Что будет, если я изменю учетные данные, необходимые для доступа к объектному хранилищу?</summary>

Вам потребуется обновить измененные учетные данные в UI, чтобы резервное копирование снова выполнялось успешно.

</details>

<details>
<summary>Что будет, если я изменю расположение, в которое экспортируются мои внешние резервные копии?</summary>

Вам потребуется указать новое расположение в UI, после чего резервные копии начнут создаваться уже туда. Старые резервные копии останутся в исходном расположении.

</details>

<details>
<summary>Как отключить внешние резервные копии для сервиса, для которого они были включены?</summary>

Чтобы отключить внешние резервные копии для сервиса, перейдите на экран настроек сервиса и нажмите «Change external backup». На следующем экране нажмите «Remove setup», чтобы отключить внешние резервные копии для сервиса.

</details>