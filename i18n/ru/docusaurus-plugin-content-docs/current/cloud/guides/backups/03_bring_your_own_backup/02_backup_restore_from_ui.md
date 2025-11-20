---
sidebar_label: 'Резервное копирование и восстановление через UI'
slug: /cloud/manage/backups/backup-restore-via-ui
title: 'Создание и восстановление резервной копии через UI'
description: 'Страница с описанием создания и восстановления резервной копии через UI с использованием вашего собственного бакета'
sidebar_position: 2
doc_type: 'guide'
keywords: ['backups', 'disaster recovery', 'data protection', 'restore', 'cloud features']
---

import Image from '@theme/IdealImage'
import arn from '@site/static/images/cloud/manage/backups/arn.png'
import change_external_backup from '@site/static/images/cloud/manage/backups/change_external_backup.png'
import configure_arn_s3_details from '@site/static/images/cloud/manage/backups/configure_arn_s3_details.png'
import view_backups from '@site/static/images/cloud/manage/backups/view_backups.png'
import backup_command from '@site/static/images/cloud/manage/backups/backup_command.png'
import gcp_configure from '@site/static/images/cloud/manage/backups/gcp_configure.png'
import gcp_stored_backups from '@site/static/images/cloud/manage/backups/gcp_stored_backups.png'
import gcp_restore_command from '@site/static/images/cloud/manage/backups/gcp_restore_command.png'
import azure_connection_details from '@site/static/images/cloud/manage/backups/azure_connection_details.png'
import view_backups_azure from '@site/static/images/cloud/manage/backups/view_backups_azure.png'
import restore_backups_azure from '@site/static/images/cloud/manage/backups/restore_backups_azure.png'


# Резервное копирование и восстановление через пользовательский интерфейс {#ui-experience}


## AWS {#AWS}

### Создание резервных копий в AWS {#taking-backups-to-aws}

#### 1. Действия в AWS {#aws-steps}

:::note
Эти шаги аналогичны безопасной настройке S3, описанной в разделе [«Безопасный доступ к данным S3»](/cloud/data-sources/secure-s3), однако для разрешений роли требуются дополнительные действия
:::

Выполните следующие действия в вашей учетной записи AWS:

<VerticalStepper headerLevel="h5">

##### Создайте корзину AWS S3 {#create-s3-bucket}

Создайте корзину AWS S3 в вашей учетной записи, в которую вы хотите экспортировать резервные копии.

##### Создайте роль IAM {#create-iam-role}

AWS использует аутентификацию на основе ролей, поэтому создайте роль IAM, которую сможет принять сервис ClickHouse Cloud для записи в эту корзину.

- a. Получите ARN на странице настроек сервиса ClickHouse Cloud в разделе «Информация о сетевой безопасности», который выглядит примерно так:

<Image img={arn} alt='AWS S3 ARN' size='lg' />

- b. Для этой роли создайте политику доверия следующим образом:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "backup service",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::463754717262:role/CH-S3-bordeaux-ar-90-ue2-29-Role"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

##### Обновите разрешения для роли {#update-permissions-for-role}

Вам также необходимо установить разрешения для этой роли, чтобы сервис ClickHouse Cloud мог записывать данные в корзину S3.
Это делается путем создания политики разрешений для роли с JSON, подобным приведенному ниже, где вы подставляете ARN вашей корзины в качестве ресурса в обоих местах.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": ["s3:GetBucketLocation", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::byob-ui"],
      "Effect": "Allow"
    },
    {
      "Action": ["s3:Get*", "s3:List*", "s3:PutObject"],
      "Resource": ["arn:aws:s3:::byob-ui/*"],
      "Effect": "Allow"
    },
    {
      "Action": ["s3:DeleteObject"],
      "Resource": ["arn:aws:s3:::byob-ui/*/.lock"],
      "Effect": "Allow"
    }
  ]
}
```

</VerticalStepper>

#### 2. Действия в ClickHouse Cloud {#cloud-steps}

Выполните следующие действия в консоли ClickHouse Cloud для настройки внешней корзины:

<VerticalStepper headerLevel="h5">

##### Настройка внешней резервной копии {#configure-external-bucket}

На странице «Настройки» нажмите «Настроить внешнюю резервную копию»:

<Image img={change_external_backup} alt='Change external backup' size='lg' />

##### Настройте ARN роли AWS IAM и параметры корзины S3 {#configure-aws-iam-role-arn-and-s3-bucket-details}

На следующем экране укажите только что созданный ARN роли AWS IAM и URL корзины S3 в следующем формате:

<Image
  img={configure_arn_s3_details}
  alt='Configure AWS IAM Role ARN and S3 bucket details'
  size='lg'
/>

##### Сохраните изменения {#save-changes}

Нажмите «Сохранить внешнюю корзину» для сохранения настроек

##### Изменение расписания резервного копирования {#changing-the-backup-schedule}

Внешние резервные копии теперь будут создаваться в вашей корзине по расписанию по умолчанию.
Кроме того, вы можете настроить расписание резервного копирования на странице «Настройки».
При использовании пользовательского расписания оно применяется для записи резервных копий в вашу
корзину, а расписание по умолчанию (резервные копии каждые 24 часа) используется для резервных копий в
корзине, принадлежащей ClickHouse Cloud.

##### Просмотр резервных копий, хранящихся в вашей корзине {#view-backups-stored-in-your-bucket}

На странице «Резервные копии» эти резервные копии в вашей корзине будут отображаться в отдельной таблице,
как показано ниже:

<Image img={view_backups} alt='View backups stored in your bucket' size='lg' />

</VerticalStepper>

### Восстановление резервных копий из AWS {#restoring-backups-from-aws}

Выполните следующие действия для восстановления резервных копий из AWS:

<VerticalStepper headerLevel="h5">

##### Создайте новый сервис для восстановления {#create-new-service-to-restore-to}


Создайте новый сервис для восстановления резервной копии.

##### Добавление ARN сервиса {#add-service-arn}

Добавьте ARN нового сервиса (со страницы настроек сервиса в консоли ClickHouse
Cloud) в политику доверия для роли IAM. Это аналогично
[второму шагу](#create-iam-role) в разделе шагов AWS выше. Это необходимо,
чтобы новый сервис мог получить доступ к корзине S3.

##### Получение SQL-команды для восстановления резервной копии {#obtain-sql-command-to-restore-backup}

Нажмите на ссылку «access or restore a backup» над списком резервных копий в
интерфейсе, чтобы получить SQL-команду для восстановления резервной копии. Команда будет выглядеть следующим образом:

<Image
  img={backup_command}
  alt='Получение SQL-команды для восстановления резервной копии'
  size='md'
/>

:::warning Перемещение резервных копий в другое расположение
Если вы переместите резервные копии в другое расположение, вам потребуется изменить команду восстановления, указав новое расположение.
:::

:::tip Команда ASYNC
Для команды восстановления можно дополнительно добавить команду `ASYNC` в конце при восстановлении больших объемов данных.
Это позволяет выполнять восстановление асинхронно, так что при потере соединения восстановление продолжит выполняться.
Важно отметить, что команда ASYNC немедленно возвращает статус успеха.
Это не означает, что восстановление завершилось успешно.
Вам потребуется отслеживать таблицу `system.backups`, чтобы узнать, завершилось ли восстановление и было ли оно успешным.
:::

##### Выполнение команды восстановления {#run-the-restore-command}

Выполните команду восстановления из SQL-консоли в новом сервисе для
восстановления резервной копии.

</VerticalStepper>


## GCP {#gcp}

### Создание резервных копий в GCP {#taking-backups-to-gcp}

Выполните следующие шаги для создания резервных копий в GCP:

#### Действия в GCP {#gcp-steps-to-follow}

<VerticalStepper headerLevel="h5">

##### Создайте бакет хранилища GCP {#create-a-gcp-storage-bucket}

Создайте бакет хранилища в вашей учетной записи GCP для экспорта резервных копий.

##### Сгенерируйте HMAC-ключ и секрет {#generate-an-hmac-key-and-secret}

Сгенерируйте HMAC-ключ и секрет, которые необходимы для аутентификации на основе пароля. Выполните следующие шаги для генерации ключей:

- a. Создайте сервисный аккаунт
  - I. Перейдите в раздел IAM & Admin в Google Cloud Console и выберите `Service Accounts`.
  - II. Нажмите `Create Service Account`, укажите имя и ID. Нажмите `Create and Continue`.
  - III. Назначьте роль Storage Object User этому сервисному аккаунту.
  - IV. Нажмите `Done` для завершения создания сервисного аккаунта.

- b. Сгенерируйте HMAC-ключ
  - I. Перейдите в Cloud Storage в Google Cloud Console и выберите `Settings`
  - II. Перейдите на вкладку Interoperability.
  - III. В разделе `Service account HMAC` нажмите `Create a key for a service account`.
  - IV. Выберите сервисный аккаунт, созданный на предыдущем шаге, из выпадающего меню.
  - V. Нажмите `Create key`.

- c. Безопасно сохраните учетные данные:
  - I. Система отобразит Access ID (ваш HMAC-ключ) и Secret (ваш HMAC-секрет). Сохраните эти значения, так как
    секрет не будет отображаться снова после закрытия этого окна.

</VerticalStepper>

#### Действия в ClickHouse Cloud {#gcp-cloud-steps}

Выполните следующие шаги в консоли ClickHouse Cloud для настройки внешнего бакета:

<VerticalStepper headerLevel="h5">

##### Измените настройки внешнего резервного копирования {#gcp-configure-external-bucket}

На странице `Settings` нажмите `Change external backup`

<Image img={change_external_backup} alt='Изменить внешнее резервное копирование' size='lg' />

##### Настройте HMAC-ключ и секрет GCP {#gcp-configure-gcp-hmac-key-and-secret}

В диалоговом окне укажите путь к бакету GCP, HMAC-ключ и секрет, созданные в предыдущем разделе.

<Image img={gcp_configure} alt='Настройка HMAC-ключа и секрета GCP' size='md' />

##### Сохраните внешний бакет {#gcp-save-external-bucket}

Нажмите `Save External Bucket` для сохранения настроек.

##### Изменение расписания резервного копирования {#gcp-changing-the-backup-schedule}

Внешние резервные копии теперь будут создаваться в вашем бакете по расписанию по умолчанию.
Также вы можете настроить расписание резервного копирования на странице `Settings`.
При использовании пользовательского расписания оно применяется для записи резервных копий в ваш
бакет, а расписание по умолчанию (резервные копии каждые 24 часа) используется для резервных копий в
бакете, принадлежащем ClickHouse Cloud.

##### Просмотр резервных копий в вашем бакете {#gcp-view-backups-stored-in-your-bucket}

Страница Backups должна отображать эти резервные копии из вашего бакета в отдельной таблице, как показано ниже:

<Image
  img={gcp_stored_backups}
  alt='Просмотр резервных копий в вашем бакете'
  size='lg'
/>

</VerticalStepper>

### Восстановление резервных копий из GCP {#gcp-restoring-backups-from-gcp}

Выполните следующие шаги для восстановления резервных копий из GCP:

<VerticalStepper headerLevel="h5">

##### Создайте новый сервис для восстановления {#gcp-create-new-service-to-restore-to}

Создайте новый сервис для восстановления резервной копии.

##### Получите SQL-команду для восстановления резервной копии {#gcp-obtain-sql-command-to-restore-backup}

Нажмите на ссылку `access or restore a backup` над списком резервных копий в
интерфейсе, чтобы получить SQL-команду для восстановления резервной копии. Команда должна выглядеть следующим образом,
и вы можете выбрать нужную резервную копию из выпадающего списка, чтобы получить команду восстановления
для конкретной резервной копии. Вам потребуется добавить ваш секретный ключ доступа
в команду:

<Image
  img={gcp_restore_command}
  alt='Получение SQL-команды для восстановления резервной копии'
  size='md'
/>

:::warning Перемещение резервных копий в другое расположение
Если вы переместите резервные копии в другое расположение, вам потребуется изменить команду восстановления, указав новое расположение.
:::


:::tip Команда ASYNC
Для команды Restore можно также добавить команду `ASYNC` в конце для больших операций восстановления.
Это позволяет выполнять восстановление асинхронно: если соединение будет потеряно, восстановление продолжит выполняться.
Важно отметить, что команда ASYNC немедленно возвращает статус успешного выполнения.
Это не означает, что восстановление завершилось успешно.
Для проверки завершения и результата восстановления необходимо отслеживать таблицу `system.backups`.
:::

##### Выполните SQL-команду для восстановления резервной копии {#gcp-run-sql-command-to-restore-backup}

Выполните команду восстановления из SQL-консоли в созданном сервисе, чтобы
восстановить резервную копию.

</VerticalStepper>


## Azure {#azure}

### Создание резервных копий в Azure {#taking-backups-to-azure}

Выполните следующие шаги для создания резервных копий в Azure:

#### Действия в Azure {#steps-to-follow-in-azure}

<VerticalStepper headerLevel="h5">

##### Создайте учетную запись хранилища {#azure-create-a-storage-account}

Создайте учетную запись хранилища или выберите существующую на портале Azure, где вы хотите хранить резервные копии.

##### Получите строку подключения {#azure-get-connection-string}

- a. В обзоре вашей учетной записи хранилища найдите раздел `Security + networking` и нажмите на `Access keys`.
- b. Здесь вы увидите `key1` и `key2`. Под каждым ключом находится поле `Connection string`.
- c. Нажмите `Show`, чтобы отобразить строку подключения. Скопируйте строку подключения, которая понадобится для настройки в ClickHouse Cloud.

</VerticalStepper>

#### Действия в ClickHouse Cloud {#azure-cloud-steps}

Выполните следующие шаги в консоли ClickHouse Cloud для настройки внешнего хранилища:

<VerticalStepper headerLevel="h5">

##### Измените настройки внешнего резервного копирования {#azure-configure-external-bucket}

На странице `Settings` нажмите на `Change external backup`

<Image img={change_external_backup} alt='Change external backup' size='lg' />

##### Укажите строку подключения и имя контейнера для вашей учетной записи хранилища Azure {#azure-provide-connection-string-and-container-name-azure}

На следующем экране укажите строку подключения (Connection String) и имя контейнера (Container Name) для вашей учетной записи хранилища Azure, созданной в предыдущем разделе:

<Image
  img={azure_connection_details}
  alt='Provide connection string and container name for your Azure storage account'
  size='md'
/>

##### Сохраните настройки внешнего хранилища {#azure-save-external-bucket}

Нажмите на `Save External Bucket`, чтобы сохранить настройки

##### Изменение расписания резервного копирования {#azure-changing-the-backup-schedule}

Внешние резервные копии теперь будут создаваться в вашем хранилище по расписанию по умолчанию. Вы также можете настроить расписание резервного копирования на странице "Settings". Если задано пользовательское расписание, оно используется для записи резервных копий в ваше хранилище, а расписание по умолчанию (резервные копии каждые 24 часа) используется для резервных копий в хранилище ClickHouse Cloud.

##### Просмотр резервных копий в вашем хранилище {#azure-view-backups-stored-in-your-bucket}

На странице резервных копий эти резервные копии из вашего хранилища должны отображаться в отдельной таблице, как показано ниже:

<Image
  img={view_backups_azure}
  alt='View backups stored in your bucket'
  size='md'
/>

</VerticalStepper>

### Восстановление резервных копий из Azure {#azure-restore-steps}

Чтобы восстановить резервные копии из Azure, выполните следующие шаги:

<VerticalStepper headerLevel="h5">

##### Создайте новый сервис для восстановления {#azure-create-new-service-to-restore-to}

Создайте новый сервис для восстановления резервной копии. В настоящее время поддерживается только восстановление резервной копии в новый сервис.

##### Получите SQL-команду для восстановления резервной копии {#azure-obtain-sql-command-to-restore-backup}

Нажмите на ссылку `access or restore a backup` над списком резервных копий в интерфейсе, чтобы получить SQL-команду для восстановления резервной копии. Команда должна выглядеть следующим образом. Вы можете выбрать нужную резервную копию из выпадающего списка, чтобы получить команду восстановления для конкретной резервной копии. Вам потребуется добавить в команду строку подключения к вашей учетной записи хранилища Azure.

<Image img={restore_backups_azure} alt='Restore backups in Azure' size='md' />

:::warning Перемещение резервных копий в другое расположение
Если вы переместите резервные копии в другое расположение, вам потребуется изменить команду восстановления, указав новое расположение.
:::

:::tip Команда ASYNC
Для команды восстановления вы также можете добавить команду `ASYNC` в конце для больших восстановлений.
Это позволяет выполнять восстановление асинхронно, так что если соединение будет потеряно, восстановление продолжит выполняться.
Важно отметить, что команда ASYNC немедленно возвращает статус успеха.
Это не означает, что восстановление было успешным.
Вам потребуется отслеживать таблицу `system.backups`, чтобы проверить, завершилось ли восстановление и было ли оно успешным.
:::

##### Выполните SQL-команду для восстановления резервной копии {#azure-run-sql-command-to-restore-backup}

Выполните команду восстановления из SQL-консоли в только что созданном сервисе, чтобы восстановить резервную копию.

</VerticalStepper>
