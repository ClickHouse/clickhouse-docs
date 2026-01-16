---
slug: /cloud/data-sources/secure-gcs
sidebar_label: 'Безопасный доступ к данным в GCS'
title: 'Безопасный доступ к данным в GCS'
description: 'В этой статье показано, как пользователи ClickHouse Cloud могут безопасно получать доступ к своим данным в GCS'
keywords: ['GCS']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import IAM_and_admin from '@site/static/images/cloud/guides/accessing-data/GCS/IAM_and_admin.png';
import create_service_account from '@site/static/images/cloud/guides/accessing-data/GCS/create_service_account.png';
import create_and_continue from '@site/static/images/cloud/guides/accessing-data/GCS/create_and_continue.png';
import storage_object_user_role from '@site/static/images/cloud/guides/accessing-data/GCS/storage_object_user.png';
import note_service_account_email from '@site/static/images/cloud/guides/accessing-data/GCS/note_service_account_email.png';
import cloud_storage_settings from '@site/static/images/cloud/guides/accessing-data/GCS/cloud_storage_settings.png';
import create_key_for_service_account from '@site/static/images/cloud/guides/accessing-data/GCS/create_key_for_service_account.png';
import create_key from '@site/static/images/cloud/guides/accessing-data/GCS/create_a_key.png';
import clickpipes_hmac_key from '@site/static/images/cloud/guides/accessing-data/GCS/clickpipes_hmac_key.png';

В этом руководстве показано, как безопасно аутентифицироваться в Google Cloud Storage (GCS) и получать доступ к вашим данным из ClickHouse Cloud.


## Введение \\{#introduction\\}

ClickHouse Cloud подключается к GCS с использованием ключей HMAC (Hash-based Message Authentication Code), связанных с учетной записью службы Google Cloud.
Этот подход обеспечивает безопасный доступ к вашим бакетам GCS без встраивания учетных данных непосредственно в запросы.

Как это работает:

1. Вы создаете учетную запись службы Google Cloud с соответствующими правами доступа к GCS
2. Вы генерируете HMAC-ключи для этой учетной записи службы
3. Вы передаете эти HMAC-учетные данные в ClickHouse Cloud
4. ClickHouse Cloud использует эти учетные данные для доступа к вашим бакетам GCS

Этот подход позволяет управлять всем доступом к бакетам GCS через политики IAM, назначенные учетной записи службы, что упрощает предоставление или отзыв доступа без изменения политик отдельных бакетов.

## Предварительные требования \\{#prerequisites\\}

Для работы по этому руководству вам понадобится:

- Активный сервис ClickHouse Cloud
- Проект Google Cloud с включённым Cloud Storage
- Права на создание сервисных аккаунтов и генерацию HMAC-ключей в вашем проекте GCP

## Настройка \\{#setup\\}

<VerticalStepper headerLevel="h3">
  ### Создайте сервисный аккаунт Google Cloud

  1. В консоли Google Cloud перейдите в раздел IAM &amp; Admin → Service Accounts

  <Image img={IAM_and_admin} size="md" alt="" />

  2. В левом меню выберите `Service accounts`, затем нажмите `Create service account`:

  <Image img={create_service_account} size="md" alt="" />

  Введите имя и описание для сервисной учётной записи, например:

  ```text
  Service account name: clickhouse-gcs-access (or your preferred name)
  Service account description: Service account for ClickHouse Cloud to access GCS buckets
  ```

  Нажмите `Create and continue`

  <Image img={create_and_continue} size="sm" alt="" />

  Назначьте сервисной учётной записи роль `Storage Object User`:

  <Image img={storage_object_user_role} size="sm" alt="" />

  Данная роль предоставляет доступ на чтение и запись объектов GCS

  :::tip
  Для доступа только на чтение используйте вместо этого роль `Storage Object Viewer`
  Для более гранулярного контроля можно создать пользовательскую роль
  :::

  Нажмите `Continue`, затем `Done`

  Запишите адрес электронной почты учётной записи службы:

  <Image img={note_service_account_email} size="md" alt="" />

  ### Предоставьте сервисному аккаунту доступ к бакету

  Доступ можно предоставить на уровне проекта или на уровне отдельного бакета.

  #### Вариант 1: Предоставить доступ к конкретным бакетам (рекомендуется)

  1. Перейдите в раздел `Cloud Storage` → `Buckets`
  2. Нажмите на бакет, к которому хотите предоставить доступ
  3. Откройте вкладку `Permissions`
  4. В разделе «Permissions» нажмите `Grant access` для принципала, созданного на предыдущих шагах
  5. В поле &quot;New principals&quot; введите адрес электронной почты сервисного аккаунта
  6. Выберите роль:

  * Пользователь объектного хранилища с правами чтения и записи
  * роль Storage Object Viewer для доступа только на чтение

  7. Нажмите `Save`
  8. Повторите для всех дополнительных бакетов

  #### Вариант 2: Предоставить доступ на уровне проекта

  1. Перейдите в `IAM & Admin` → `IAM`
  2. Нажмите `Grant access`
  3. Введите адрес электронной почты сервисного аккаунта в поле `New principals`.
  4. Выберите роль «Storage Object User» (или «Storage Object Viewer» для доступа только на чтение)
  5. Нажмите «Save»

  :::warning Рекомендация по безопасности
  Предоставляйте доступ только к тем бакетам, к которым необходим доступ ClickHouse, вместо разрешений на уровне всего проекта.
  :::

  ### Генерация HMAC-ключей для сервисной учетной записи

  Перейдите в `Cloud Storage` → `Настройки` → `Совместимость`:

  <Image img={cloud_storage_settings} size="sm" alt="" />

  Если вы не видите раздел &quot;Access keys&quot;, нажмите `Enable interoperability access`

  В разделе &quot;Access keys for service accounts&quot; нажмите `Create a key for a service account`:

  <Image img={create_key_for_service_account} size="md" alt="" />

  Выберите сервисный аккаунт, созданный ранее (например, clickhouse-gcs-access@your-project.iam.gserviceaccount.com)

  Нажмите `Create key`:

  <Image img={create_key} size="md" alt="" />

  Будет отображен ключ HMAC.
  Немедленно сохраните Access Key и Secret — вы не сможете просмотреть секрет повторно.

  Примеры ключей приведены ниже:

  ```vbnet
  Access Key: GOOG1EF4YBJVNFQ2YGCP3SLV4Y7CMFHW7HPC6EO7RITLJDDQ75639JK56SQVD
  Secret: nFy6DFRr4sM9OnV6BG4FtWVPR25JfqpmcdZ6w9nV
  ```

  :::danger Важно
  Храните эти учетные данные в безопасном месте.
  После закрытия этого экрана секретный ключ невозможно будет получить повторно.
  В случае утери секретного ключа потребуется сгенерировать новые ключи.
  :::

  ## Использование HMAC-ключей с ClickHouse Cloud

  Теперь вы можете использовать учётные данные HMAC для доступа к GCS из ClickHouse Cloud.
  Для этого используйте табличную функцию GCS:

  ```sql
  SELECT *
  FROM gcs(
      'https://storage.googleapis.com/clickhouse-docs-example-bucket/epidemiology.csv',
      'GOOG1E...YOUR_ACCESS_KEY',
      'YOUR_SECRET_KEY',
      'CSVWithNames'
  );
  ```

  Используйте маски для указания нескольких файлов:

  ```sql
  SELECT *
  FROM gcs(
  'https://storage.googleapis.com/clickhouse-docs-example-bucket/*.parquet',
  'GOOG1E...YOUR_ACCESS_KEY',
  'YOUR_SECRET_KEY',
  'Parquet'
  );
  ```

  ## HMAC-аутентификация в ClickPipes для GCS

  ClickPipes использует ключи HMAC (Hash-based Message Authentication Code) для аутентификации с Google Cloud Storage.

  При [настройке ClickPipe для GCS](/integrations/clickpipes/object-storage/gcs/get-started):

  1. Во время настройки ClickPipe в поле `Authentication method` выберите `Credentials`
  2. Укажите учётные данные HMAC, полученные на предыдущих шагах

  <Image img={clickpipes_hmac_key} size="md" alt="" />

  :::note
  Аутентификация через сервисный аккаунт в настоящее время не поддерживается — необходимо использовать HMAC-ключи
  URL бакета GCS должен иметь формат: `https://storage.googleapis.com/<bucket>/<path>` (а не `gs://`)
  :::

  HMAC-ключи должны быть связаны с сервисной учетной записью, которая имеет роль `roles/storage.objectViewer`, включающую:

  * `storage.objects.list`: для вывода списка объектов в бакете
  * `storage.objects.get`: для извлечения/чтения объектов
</VerticalStepper>

## Рекомендации {#best-practices}

### Используйте отдельные сервисные аккаунты для разных сред \\{#separate-service-accounts\\}

Создавайте отдельные сервисные аккаунты для сред разработки, тестирования (staging) и промышленной эксплуатации (production). Например:

- `clickhouse-gcs-dev@project.iam.gserviceaccount.com`
- `clickhouse-gcs-staging@project.iam.gserviceaccount.com`
- `clickhouse-gcs-prod@project.iam.gserviceaccount.com`

Это позволит при необходимости легко отозвать доступ для конкретной среды, не затрагивая остальные.

### Применяйте принцип наименьших привилегий {#apply-least-privilege-access}

Выдавайте только минимально необходимые разрешения:

- Используйте роль **Storage Object Viewer** для доступа только на чтение
- Предоставляйте доступ к конкретным бакетам, а не ко всему проекту
- Рассмотрите использование условий на уровне бакета для ограничения доступа к определённым путям

### Регулярно выполняйте ротацию HMAC-ключей {#rotate-hmac-keys}

Настройте план ротации ключей:

- Генерируйте новые HMAC-ключи
- Обновляйте конфигурацию ClickHouse с использованием новых ключей
- Проверяйте работоспособность с новыми ключами
- Удаляйте старые HMAC-ключи

:::tip
Google Cloud не устанавливает срок действия HMAC-ключей, поэтому вам необходимо реализовать собственную политику ротации.
:::

### Мониторинг доступа с помощью Cloud Audit Logs \\{#monitor-access\\}

Включите и отслеживайте Cloud Audit Logs для Cloud Storage:

1. Перейдите в IAM & Admin → Audit Logs
2. Найдите Cloud Storage в списке
3. Включите `Admin Read`, `Data Read` и `Data Write logs`
4. Используйте эти журналы для мониторинга активности доступа и обнаружения аномалий