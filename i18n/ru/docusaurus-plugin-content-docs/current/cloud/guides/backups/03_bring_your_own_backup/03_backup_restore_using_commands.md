---
sidebar_label: 'Резервное копирование и восстановление с помощью команд'
slug: /cloud/manage/backups/backup-restore-via-commands
title: 'Создание и восстановление резервной копии с помощью команд'
description: 'Страница, описывающая, как создать или восстановить резервную копию в собственном бакете с помощью команд'
sidebar_position: 3
doc_type: 'guide'
keywords: ['backups', 'disaster recovery', 'data protection', 'restore', 'cloud features']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Создание и восстановление резервных копий с помощью команд {#commands-experience}

Пользователи могут использовать команды `BACKUP` и `RESTORE` для экспорта резервных копий в свои хранилища,
помимо создания резервных копий и восстановления [через пользовательский интерфейс](/cloud/manage/backups/backup-restore-via-ui).
В этом руководстве приведены команды для всех трёх облачных провайдеров.


## Требования {#requirements}

Для экспорта и восстановления резервных копий в собственное хранилище CSP вам потребуются следующие данные:

<Tabs>
  <TabItem value="AWS" label="AWS" default>
    1. Конечная точка AWS S3 в формате: `s3://<bucket_name>.s3.amazonaws.com/<optional_directory>`
       Например: `s3://testchbackups.s3.amazonaws.com/`
       Где:
         * `testchbackups` — имя корзины S3 для экспорта резервных копий.
         * `backups` — необязательный подкаталог.
    2. Ключ доступа и секретный ключ AWS. Также поддерживается аутентификация на основе ролей AWS, которая может использоваться вместо ключа доступа и секретного ключа AWS, как описано в разделе выше.
    <br/>
  </TabItem>
  <TabItem value="GCP" label="GCP">
   1.  Конечная точка GCS в формате: `https://storage.googleapis.com/<bucket_name>/`
   2. Ключ доступа HMAC и секретный ключ HMAC.
   <br/>
  </TabItem>
  <TabItem value="Azure" label="Azure">
    1. Строка подключения к хранилищу Azure.
    2. Имя контейнера Azure в учетной записи хранения.
    3. Большой двоичный объект Azure внутри контейнера.
    <br/>
  </TabItem>
</Tabs>


## Резервное копирование и восстановление конкретной БД {#backup_restore_db}

Здесь показано резервное копирование и восстановление _одной_ базы данных.
Полный список команд резервного копирования и восстановления см. в [сводке команд резервного копирования](/operations/backup#command-summary).

### AWS S3 {#aws-s3-bucket}

<Tabs>
  <TabItem value="Backup" label="РЕЗЕРВНОЕ КОПИРОВАНИЕ" default>

```sql
BACKUP DATABASE test_backups
TO S3(
  'https://testchbackups.s3.amazonaws.com/<uuid>',
  '<key id>',
  '<key secret>'
)
```

Где `uuid` — это уникальный идентификатор, используемый для различения наборов резервных копий.

:::note
Для каждой новой резервной копии в этом подкаталоге необходимо использовать разные uuid, иначе возникнет ошибка `BACKUP_ALREADY_EXISTS`.
Например, при создании ежедневных резервных копий необходимо использовать новый uuid каждый день.
:::

  </TabItem>
  <TabItem value="Restore" label="ВОССТАНОВЛЕНИЕ" default>

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

### Google Cloud Storage (GCS) {#google-cloud-storage}

<Tabs>
  <TabItem value="Backup" label="РЕЗЕРВНОЕ КОПИРОВАНИЕ" default>
```sql
BACKUP DATABASE test_backups 
TO S3(
  'https://storage.googleapis.com/<bucket>/<uuid>',
  '<hmac-key>',
  '<hmac-secret>'
)
```

Где `uuid` — это уникальный идентификатор, используемый для идентификации резервной копии.

:::note
Для каждой новой резервной копии в этом подкаталоге необходимо использовать разные uuid, иначе возникнет ошибка `BACKUP_ALREADY_EXISTS`.
Например, при создании ежедневных резервных копий необходимо использовать новый uuid каждый день.
:::

  </TabItem>
  <TabItem value="Restore" label="ВОССТАНОВЛЕНИЕ" default>
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

### Azure Blob Storage {#azure-blob-storage}

<Tabs>
  <TabItem value="Backup" label="РЕЗЕРВНОЕ КОПИРОВАНИЕ" default>
```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage(
  '<AzureBlobStorage endpoint connection string>',
  '<container>',
  '<blob>/<uuid>'
)
```

Где `uuid` — это уникальный идентификатор, используемый для идентификации резервной копии.

:::note
Для каждой новой резервной копии в этом подкаталоге необходимо использовать разные uuid, иначе возникнет ошибка `BACKUP_ALREADY_EXISTS`.
Например, при создании ежедневных резервных копий необходимо использовать новый uuid каждый день.
:::

</TabItem>
<TabItem value="Restore" label="ВОССТАНОВЛЕНИЕ" default>
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


## Резервное копирование / Восстановление всего сервиса {#backup_restore_entire_service}

Для резервного копирования всего сервиса используйте команды, приведенные ниже.
Эта резервная копия будет содержать все пользовательские и системные данные для созданных объектов, профилей настроек, политик ролей, квот и функций.
Ниже приведены примеры для AWS S3.
Вы можете использовать эти команды с синтаксисом, описанным выше, для создания резервных копий в GCS и Azure Blob Storage.

<Tabs>
<TabItem value="Backup" label="BACKUP" default>

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

где `uuid` — уникальный идентификатор, используемый для идентификации резервной копии.

</TabItem>
<TabItem value="Restore" label="RESTORE" default>

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


## Часто задаваемые вопросы {#backups-faq}

<details>
<summary>Что происходит с резервными копиями в моем облачном объектном хранилище? Удаляются ли они ClickHouse автоматически?</summary>

Мы предоставляем возможность экспортировать резервные копии в ваше хранилище, однако мы не выполняем очистку и не удаляем резервные копии после их создания. Вы несете ответственность за управление жизненным циклом резервных копий в вашем хранилище, включая удаление, архивирование по мере необходимости или перемещение в более дешевое хранилище для оптимизации общих затрат.

</details>

<details>
<summary>Что произойдет с процессом восстановления, если я перемещу некоторые существующие резервные копии в другое расположение?</summary>

Если какие-либо резервные копии будут перемещены в другое расположение, команду восстановления необходимо будет обновить, указав новое расположение, где хранятся резервные копии.

</details>

<details>
<summary>Что делать, если я изменю учетные данные для доступа к объектному хранилищу?</summary>

Вам потребуется обновить измененные учетные данные в пользовательском интерфейсе, чтобы резервное копирование снова начало выполняться успешно.

</details>

<details>
<summary>Что делать, если я изменю расположение для экспорта внешних резервных копий?</summary>

Вам потребуется обновить новое расположение в пользовательском интерфейсе, после чего резервное копирование начнет выполняться в новое расположение. Старые резервные копии останутся в исходном расположении.

</details>

<details>
<summary>Как отключить внешние резервные копии для сервиса, на котором я их включил?</summary>

Чтобы отключить внешние резервные копии для сервиса, перейдите на экран настроек сервиса и нажмите «Изменить внешнее резервное копирование». На следующем экране нажмите «Удалить настройку», чтобы отключить внешние резервные копии для сервиса.

</details>
