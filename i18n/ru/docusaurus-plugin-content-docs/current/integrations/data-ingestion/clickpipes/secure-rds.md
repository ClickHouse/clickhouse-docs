---
slug: /integrations/clickpipes/secure-rds
sidebar_label: 'Аутентификация БД через AWS IAM (RDS/Aurora)'
title: 'Аутентификация БД через AWS IAM (RDS/Aurora)'
description: 'В этой статье показано, как клиенты ClickPipes могут использовать ролевой доступ для аутентификации в Amazon RDS/Aurora и безопасного доступа к своей базе данных.'
doc_type: 'guide'
keywords: ['clickpipes', 'rds', 'security', 'aws', 'private connection']
---

import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

В этой статье показано, как клиенты ClickPipes могут использовать ролевую модель доступа для аутентификации в Amazon Aurora и RDS и безопасного доступа к своим базам данных.

:::warning
Для AWS RDS Postgres и Aurora Postgres вы можете запускать только ClickPipes в режиме `Initial Load Only` из‑за ограничений AWS IAM DB Authentication.

Для MySQL и MariaDB это ограничение не действует, и вы можете запускать как `Initial Load Only`, так и `CDC` ClickPipes.
:::


## Настройка {#setup}

### Получение ARN IAM-роли сервиса ClickHouse {#obtaining-the-clickhouse-service-iam-role-arn}

1 - Войдите в свою учетную запись ClickHouse Cloud.

2 - Выберите сервис ClickHouse, для которого требуется создать интеграцию.

3 - Перейдите на вкладку **Settings** (Настройки).

4 - Прокрутите страницу вниз до раздела **Network security information** (Информация о сетевой безопасности).

5 - Скопируйте значение **Service role ID (IAM)** (Идентификатор роли сервиса (IAM)), относящееся к данному сервису, как показано ниже.

<Image img={secures3_arn} alt='Secure S3 ARN' size='lg' border />

Обозначим это значение как `{ClickHouse_IAM_ARN}`. Это IAM-роль, которая будет использоваться для доступа к вашему экземпляру RDS/Aurora.

### Настройка экземпляра RDS/Aurora {#configuring-the-rds-aurora-instance}

#### Включение аутентификации базы данных через IAM {#enabling-iam-db-authentication}

1. Войдите в свою учетную запись AWS и перейдите к экземпляру RDS, который требуется настроить.
2. Нажмите кнопку **Modify** (Изменить).
3. Прокрутите страницу вниз до раздела **Database authentication** (Аутентификация базы данных).
4. Включите опцию **Password and IAM database authentication** (Аутентификация базы данных по паролю и через IAM).
5. Нажмите кнопку **Continue** (Продолжить).
6. Проверьте изменения и выберите опцию **Apply immediately** (Применить немедленно).

#### Получение идентификатора ресурса RDS/Aurora {#obtaining-the-rds-resource-id}

1. Войдите в свою учетную запись AWS и перейдите к экземпляру RDS или кластеру Aurora, который требуется настроить.
2. Перейдите на вкладку **Configuration** (Конфигурация).
3. Запишите значение **Resource ID** (Идентификатор ресурса). Оно должно иметь вид `db-xxxxxxxxxxxxxx` для RDS или `cluster-xxxxxxxxxxxxxx` для кластера Aurora. Обозначим это значение как `{RDS_RESOURCE_ID}`. Этот идентификатор ресурса будет использоваться в политике IAM для предоставления доступа к экземпляру RDS.

#### Настройка пользователя базы данных {#setting-up-the-database-user}

##### PostgreSQL {#setting-up-the-database-user-postgres}

1. Подключитесь к экземпляру RDS/Aurora и создайте нового пользователя базы данных с помощью следующей команды:
   ```sql
   CREATE USER clickpipes_iam_user;
   GRANT rds_iam TO clickpipes_iam_user;
   ```
2. Выполните остальные шаги из [руководства по настройке источника PostgreSQL](postgres/source/rds) для настройки экземпляра RDS для работы с ClickPipes.

##### MySQL / MariaDB {#setting-up-the-database-user-mysql}

1. Подключитесь к экземпляру RDS/Aurora и создайте нового пользователя базы данных с помощью следующей команды:
   ```sql
   CREATE USER 'clickpipes_iam_user' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
   ```
2. Выполните остальные шаги из [руководства по настройке источника MySQL](mysql/source/rds) для настройки экземпляра RDS/Aurora для работы с ClickPipes.

### Настройка IAM-роли {#setting-up-iam-role}

#### Создание IAM-роли вручную {#manually-create-iam-role}

1 - Войдите в свою учетную запись AWS в веб-браузере с помощью пользователя IAM, имеющего разрешения на создание и управление IAM-ролями.

2 - Перейдите в консоль сервиса IAM.

3 - Создайте новую IAM-роль со следующими политиками IAM и доверия.

Политика доверия (замените `{ClickHouse_IAM_ARN}` на ARN IAM-роли вашего экземпляра ClickHouse):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "{ClickHouse_IAM_ARN}"
      },
      "Action": ["sts:AssumeRole", "sts:TagSession"]
    }
  ]
}
```

Политика IAM (замените `{RDS_RESOURCE_ID}` на идентификатор ресурса вашего экземпляра RDS). Убедитесь, что заменили `{RDS_REGION}` на регион вашего экземпляра RDS/Aurora, а `{AWS_ACCOUNT}` — на идентификатор вашей учетной записи AWS:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["rds-db:connect"],
      "Resource": [
        "arn:aws:rds-db:{RDS_REGION}:{AWS_ACCOUNT}:dbuser:{RDS_RESOURCE_ID}/clickpipes_iam_user"
      ]
    }
  ]
}
```

4 - Скопируйте ARN новой IAM-роли после ее создания. Это значение необходимо для безопасного доступа к вашей базе данных AWS из ClickPipes. Обозначим его как `{RDS_ACCESS_IAM_ROLE_ARN}`.

Теперь вы можете использовать эту IAM-роль для аутентификации в экземпляре RDS/Aurora из ClickPipes.
