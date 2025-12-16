---
sidebar_label: 'Резервное копирование и восстановление через веб-интерфейс'
slug: /cloud/manage/backups/backup-restore-via-ui
title: 'Создание и восстановление резервной копии через веб-интерфейс'
description: 'Страница, описывающая, как создать резервную копию или восстановить её через веб-интерфейс с использованием вашего собственного бакета'
sidebar_position: 2
doc_type: 'guide'
keywords: ['резервные копии', 'восстановление после сбоев', 'защита данных', 'восстановление', 'облачные возможности']
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


# Резервное копирование и восстановление с помощью пользовательского интерфейса {#ui-experience}



## AWS {#AWS}

### Создание резервных копий в AWS {#taking-backups-to-aws}

#### 1. Действия в AWS {#aws-steps}

:::note
Эти действия аналогичны настройке безопасного доступа к S3, описанной в разделе [«Безопасный доступ к данным S3»](/cloud/data-sources/secure-s3), однако для разрешений роли требуются дополнительные действия
:::

Выполните следующие действия в вашей учетной записи AWS:

<VerticalStepper headerLevel="h5">

##### Создайте корзину AWS S3 {#create-s3-bucket}

Создайте корзину AWS S3 в вашей учетной записи для экспорта резервных копий.

##### Создайте роль IAM {#create-iam-role}

AWS использует аутентификацию на основе ролей, поэтому создайте роль IAM, которую сможет принять сервис ClickHouse Cloud для записи в эту корзину.

- a. Получите ARN на странице настроек сервиса ClickHouse Cloud в разделе информации о сетевой безопасности, который выглядит примерно так:

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
        "AWS":  "arn:aws:iam::463754717262:role/CH-S3-bordeaux-ar-90-ue2-29-Role"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

##### Обновите разрешения для роли {#update-permissions-for-role}

Вам также необходимо настроить разрешения для этой роли, чтобы сервис ClickHouse Cloud мог записывать данные в корзину S3.
Для этого создайте политику разрешений для роли с JSON, аналогичным приведенному ниже, подставив ARN вашей корзины в качестве ресурса в обоих местах.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:GetBucketLocation",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::byob-ui"
      ],
      "Effect": "Allow"
    },
    {
      "Action": [
        "s3:Get*",
        "s3:List*",
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:s3:::byob-ui/*"
      ],
      "Effect": "Allow"
    },
    {
      "Action": [
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::byob-ui/*/.lock"
      ],
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

На странице настроек нажмите «Настроить внешнюю резервную копию»:

<Image img={change_external_backup} alt='Change external backup' size='lg' />

##### Настройте ARN роли AWS IAM и параметры корзины S3 {#configure-aws-iam-role-arn-and-s3-bucket-details}

На следующем экране укажите ARN роли AWS IAM, которую вы только что создали, и URL корзины S3 в следующем формате:

<Image
  img={configure_arn_s3_details}
  alt='Configure AWS IAM Role ARN and S3 bucket details'
  size='lg'
/>

##### Сохраните изменения {#save-changes}

Нажмите «Сохранить внешнюю корзину» для сохранения настроек

##### Изменение расписания резервного копирования {#changing-the-backup-schedule}

Внешние резервные копии теперь будут создаваться в вашей корзине по расписанию по умолчанию.
Также вы можете настроить расписание резервного копирования на странице «Настройки».
При использовании пользовательского расписания оно применяется для записи резервных копий в вашу
корзину, а расписание по умолчанию (резервные копии каждые 24 часа) используется для резервных копий в
корзине, принадлежащей ClickHouse Cloud.

##### Просмотр резервных копий, хранящихся в вашей корзине {#view-backups-stored-in-your-bucket}

На странице резервных копий эти резервные копии из вашей корзины будут отображаться в отдельной таблице,
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
Если вы переместите резервные копии в другое расположение, необходимо будет изменить команду восстановления, указав новое расположение.
:::

:::tip Команда ASYNC
Для команды восстановления можно дополнительно добавить команду `ASYNC` в конце при больших объемах восстановления.
Это позволяет выполнять восстановление асинхронно, так что при потере соединения восстановление продолжит выполняться.
Важно отметить, что команда ASYNC немедленно возвращает статус успеха.
Это не означает, что восстановление было успешным.
Необходимо отслеживать таблицу `system.backups`, чтобы узнать, завершилось ли восстановление и было ли оно успешным или неудачным.
:::

##### Выполнение команды восстановления {#run-the-restore-command}

Выполните команду восстановления из SQL-консоли в новом сервисе для
восстановления резервной копии.

</VerticalStepper>


## GCP {#gcp}

### Создание резервных копий в GCP {#taking-backups-to-gcp}

Выполните следующие шаги для создания резервных копий в GCP:

#### Шаги, которые необходимо выполнить в GCP {#gcp-steps-to-follow}

<VerticalStepper headerLevel="h5">

##### Создайте бакет хранилища GCP {#create-a-gcp-storage-bucket}

Создайте бакет хранилища в вашей учетной записи GCP для экспорта резервных копий.

##### Сгенерируйте HMAC-ключ и секрет {#generate-an-hmac-key-and-secret}

Сгенерируйте HMAC-ключ и секрет, которые необходимы для аутентификации на основе пароля. Выполните следующие шаги для генерации ключей:

- a. Создайте сервисную учетную запись
  - I. Перейдите в раздел IAM & Admin в Google Cloud Console и выберите `Service Accounts`.
  - II. Нажмите `Create Service Account`, укажите имя и идентификатор. Нажмите `Create and Continue`.
  - III. Назначьте роль Storage Object User этой сервисной учетной записи.
  - IV. Нажмите `Done` для завершения создания сервисной учетной записи.

- b. Сгенерируйте HMAC-ключ
  - I. Перейдите в Cloud Storage в Google Cloud Console и выберите `Settings`
  - II. Перейдите на вкладку Interoperability.
  - III. В разделе `Service account HMAC` нажмите `Create a key for a service account`.
  - IV. Выберите сервисную учетную запись, созданную на предыдущем шаге, из выпадающего меню.
  - V. Нажмите `Create key`.

- c. Безопасно сохраните учетные данные:
  - I. Система отобразит Access ID (ваш HMAC-ключ) и Secret (ваш HMAC-секрет). Сохраните эти значения, так как
    секрет не будет отображаться повторно после закрытия этого окна.

</VerticalStepper>

#### Шаги, которые необходимо выполнить в ClickHouse Cloud {#gcp-cloud-steps}

Выполните следующие шаги в консоли ClickHouse Cloud для настройки внешнего бакета:

<VerticalStepper headerLevel="h5">

##### Измените настройки внешнего резервного копирования {#gcp-configure-external-bucket}

На странице `Settings` нажмите `Change external backup`

<Image img={change_external_backup} alt='Change external backup' size='lg' />

##### Настройте HMAC-ключ и секрет GCP {#gcp-configure-gcp-hmac-key-and-secret}

В диалоговом окне укажите путь к бакету GCP, HMAC-ключ и секрет, созданные в предыдущем разделе.

<Image img={gcp_configure} alt='Configure GCP HMAC Key and Secret' size='md' />

##### Сохраните внешний бакет {#gcp-save-external-bucket}

Нажмите `Save External Bucket` для сохранения настроек.

##### Изменение расписания резервного копирования {#gcp-changing-the-backup-schedule}

Внешние резервные копии теперь будут создаваться в вашем бакете по расписанию по умолчанию.
Также вы можете настроить расписание резервного копирования на странице `Settings`.
При использовании пользовательского расписания оно применяется для записи резервных копий в ваш
бакет, а расписание по умолчанию (резервные копии каждые 24 часа) используется для резервных копий в
бакете, принадлежащем ClickHouse Cloud.

##### Просмотр резервных копий, хранящихся в вашем бакете {#gcp-view-backups-stored-in-your-bucket}

Страница Backups должна отображать эти резервные копии из вашего бакета в отдельной таблице, как показано ниже:

<Image
  img={gcp_stored_backups}
  alt='View backups stored in your bucket'
  size='lg'
/>

</VerticalStepper>

### Восстановление резервных копий из GCP {#gcp-restoring-backups-from-gcp}

Выполните следующие шаги для восстановления резервных копий из GCP:

<VerticalStepper headerLevel="h5">

##### Создайте новый сервис для восстановления {#gcp-create-new-service-to-restore-to}

Создайте новый сервис, в который будет восстановлена резервная копия.

##### Получите SQL-команду для восстановления резервной копии {#gcp-obtain-sql-command-to-restore-backup}

Нажмите на ссылку `access or restore a backup` над списком резервных копий в
интерфейсе, чтобы получить SQL-команду для восстановления резервной копии. Команда должна выглядеть следующим образом,
и вы можете выбрать нужную резервную копию из выпадающего списка, чтобы получить команду восстановления
для конкретной резервной копии. Вам потребуется добавить ваш секретный ключ доступа
в команду:

<Image
  img={gcp_restore_command}
  alt='Get SQL command used to restore backup'
  size='md'
/>

:::warning Перемещение резервных копий в другое расположение
Если вы переместите резервные копии в другое расположение, вам потребуется изменить команду восстановления, указав новое расположение.
:::


:::tip Команда ASYNC
Для команды Restore можно дополнительно добавить команду `ASYNC` в конце при восстановлении больших объемов данных.
Это позволяет выполнять восстановление асинхронно, благодаря чему при потере соединения процесс восстановления продолжит выполняться.
Важно отметить, что команда ASYNC немедленно возвращает статус успешного выполнения.
Это не означает, что само восстановление завершилось успешно.
Для проверки завершения восстановления и его результата необходимо отслеживать таблицу `system.backups`.
:::

##### Выполните SQL-команду для восстановления резервной копии {#gcp-run-sql-command-to-restore-backup}

Выполните команду восстановления из SQL-консоли в созданном сервисе для
восстановления резервной копии.

</VerticalStepper>


## Azure {#azure}

### Создание резервных копий в Azure {#taking-backups-to-azure}

Выполните следующие шаги, чтобы создать резервные копии в Azure:

#### Шаги, которые нужно выполнить в Azure {#steps-to-follow-in-azure}

<VerticalStepper headerLevel="h5">

##### Создайте учетную запись хранения {#azure-create-a-storage-account}

Создайте учетную запись хранения или выберите существующую учетную запись хранения в портале Azure,
в которой вы хотите хранить резервные копии.

##### Получите строку подключения {#azure-get-connection-string}

* a. На обзорной странице учетной записи хранения найдите раздел `Security + networking` и нажмите `Access keys`.
* b. Здесь вы увидите `key1` и `key2`. Под каждым ключом находится поле `Connection string`.
* c. Нажмите `Show`, чтобы отобразить строку подключения. Скопируйте строку подключения, которую вы будете использовать для настройки в ClickHouse Cloud.

</VerticalStepper>

#### Шаги, которые нужно выполнить в ClickHouse Cloud {#azure-cloud-steps}

Выполните следующие шаги в консоли ClickHouse Cloud, чтобы настроить внешний бакет:

<VerticalStepper headerLevel="h5">

##### Измените внешний бэкап {#azure-configure-external-bucket}

На странице `Settings` нажмите `Change external backup`.

<Image img={change_external_backup} alt="Change external backup" size="lg" />

##### Укажите строку подключения и имя контейнера для вашей учетной записи хранения Azure {#azure-provide-connection-string-and-container-name-azure}

На следующем экране укажите Connection String и Container Name для вашей
учетной записи хранения Azure, созданной в предыдущем разделе:

<Image img={azure_connection_details} alt="Provide connection string and container name for your Azure storage account" size="md" />

##### Сохраните внешний бакет {#azure-save-external-bucket}

Нажмите `Save External Bucket`, чтобы сохранить настройки.

##### Изменение расписания резервного копирования по умолчанию {#azure-changing-the-backup-schedule}

Внешние резервные копии теперь будут создаваться в вашем бакете по расписанию по умолчанию. Также
вы можете настроить расписание резервного копирования на странице `Settings`. Если задано иное расписание,
то для записи резервных копий в ваш бакет используется пользовательское расписание, а расписание по умолчанию
(резервное копирование каждые 24 часа) используется для резервных копий во внутреннем бакете ClickHouse Cloud.

##### Просмотр резервных копий, сохраненных в вашем бакете {#azure-view-backups-stored-in-your-bucket}

Страница `Backups` должна отображать эти резервные копии в вашем бакете в отдельной таблице,
как показано ниже:

<Image img={view_backups_azure} alt="View backups stored in your bucket" size="md" />

</VerticalStepper>

### Восстановление резервных копий из Azure {#azure-restore-steps}

Чтобы восстановить резервные копии из Azure, выполните следующие шаги:

<VerticalStepper headerLevel="h5">

##### Создайте новый сервис для восстановления {#azure-create-new-service-to-restore-to}

Создайте новый сервис, в который будет восстановлена резервная копия. В настоящее время поддерживается только
восстановление резервной копии в новый сервис.

##### Получите SQL-команду для восстановления резервной копии {#azure-obtain-sql-command-to-restore-backup}

Над списком резервных копий в UI нажмите ссылку `access or restore a backup`,
чтобы получить SQL-команду для восстановления резервной копии. Команда должна
выглядеть примерно так. Вы можете выбрать нужную резервную копию из выпадающего списка,
чтобы получить команду восстановления для этой конкретной резервной копии. Вам нужно будет добавить строку подключения
вашей учетной записи хранения Azure в эту команду.

<Image img={restore_backups_azure} alt="Restore backups in Azure" size="md" />

:::warning Перемещение резервных копий в другое место
Если вы перемещаете резервные копии в другое место, вам нужно изменить команду восстановления так, чтобы она ссылалась на новое расположение.
:::

:::tip Команда ASYNC
Для команды Restore вы также можете необязательно добавить в конец модификатор `ASYNC` для крупных восстановлений.
Это позволяет выполнять восстановление асинхронно, так что при обрыве соединения восстановление продолжит выполняться.
Важно отметить, что команда ASYNC немедленно возвращает статус успеха.
Это не означает, что восстановление прошло успешно.
Вам нужно отслеживать таблицу `system.backups`, чтобы увидеть, завершилось ли восстановление и прошло ли оно успешно или завершилось с ошибкой.
:::

##### Выполните SQL-команду для восстановления резервной копии {#azure-run-sql-command-to-restore-backup}

Выполните команду восстановления из SQL-консоли в созданном сервисе, чтобы
восстановить резервную копию.

</VerticalStepper>
