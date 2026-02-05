---
slug: /integrations/clickpipes/postgres/auth
sidebar_label: 'Аутентификация БД через AWS IAM (RDS/Aurora)'
title: 'Аутентификация БД через AWS IAM (RDS/Aurora)'
description: 'В этой статье показано, как клиенты ClickPipes могут использовать ролевой доступ для аутентификации в Amazon RDS/Aurora и безопасного доступа к своей базе данных.'
doc_type: 'guide'
keywords: ['clickpipes', 'rds', 'безопасность', 'aws', 'приватное подключение']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

В этой статье показано, как клиенты ClickPipes могут использовать ролевой доступ для аутентификации в Amazon Aurora и RDS и безопасного доступа к своим базам данных.

:::warning
Для AWS RDS Postgres и Aurora Postgres вы можете запускать только ClickPipes с типом `Initial Load Only` из‑за ограничений механизма AWS IAM DB Authentication.

Для MySQL и MariaDB это ограничение не действует, и вы можете запускать как ClickPipes с типом `Initial Load Only`, так и `CDC`.
:::


## Настройка \{#setup\}

### Получение ARN роли IAM сервиса ClickHouse \{#obtaining-the-clickhouse-service-iam-role-arn\}

1 - Войдите в свою учетную запись ClickHouse Cloud.

2 - Выберите сервис ClickHouse, для которого вы хотите создать интеграцию.

3 - Перейдите на вкладку **Settings**.

4 - Прокрутите вниз до раздела **Network security information** в нижней части страницы.

5 - Скопируйте значение **Service role ID (IAM)**, принадлежащее сервису, как показано ниже.

<Image img={secures3_arn} alt="Защищённый ARN S3" size="lg" border/>

Назовём это значение `{ClickHouse_IAM_ARN}`. Это роль IAM, которая будет использоваться для доступа к вашему экземпляру RDS/Aurora.

### Настройка экземпляра RDS/Aurora \{#configuring-the-rds-aurora-instance\}

#### Включение IAM DB Authentication \{#enabling-iam-db-authentication\}

1. Войдите в свой аккаунт AWS и перейдите к экземпляру RDS, который нужно настроить.
2. Нажмите кнопку **Modify**.
3. Прокрутите страницу вниз до раздела **Database authentication**.
4. Включите параметр **Password and IAM database authentication**.
5. Нажмите кнопку **Continue**.
6. Просмотрите изменения и выберите параметр **Apply immediately**.

#### Получение идентификатора ресурса RDS/Aurora \{#obtaining-the-rds-resource-id\}

1. Войдите в свою учетную запись AWS и перейдите к экземпляру RDS или кластеру Aurora, который вы хотите настроить.
2. Перейдите на вкладку **Configuration**.
3. Обратите внимание на значение **Resource ID**. Для RDS оно должно иметь вид `db-xxxxxxxxxxxxxx`, а для кластера Aurora — `cluster-xxxxxxxxxxxxxx`. Будем называть это значение `{RDS_RESOURCE_ID}`. Это идентификатор ресурса, который будет использоваться в политике IAM для разрешения доступа к экземпляру RDS.

#### Настройка пользователя базы данных \{#setting-up-the-database-user\}

##### PostgreSQL \{#setting-up-the-database-user-postgres\}

1. Подключитесь к экземпляру RDS/Aurora и создайте пользователя базы данных с помощью следующей команды:
    ```sql
    CREATE USER clickpipes_iam_user; 
    GRANT rds_iam TO clickpipes_iam_user;
    ```
2. Следуйте остальным шагам из [руководства по настройке источника PostgreSQL](./source/rds), чтобы настроить экземпляр RDS для ClickPipes.

##### MySQL / MariaDB \{#setting-up-the-database-user-mysql\}

1. Подключитесь к экземпляру RDS/Aurora и создайте нового пользователя базы данных с помощью следующей команды:
    ```sql
    CREATE USER 'clickpipes_iam_user' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
    ```
2. Следуйте оставшимся шагам из [руководства по настройке источника MySQL](../mysql/source/rds), чтобы настроить экземпляр RDS/Aurora для ClickPipes.

### Настройка роли IAM \{#setting-up-iam-role\}

#### Ручное создание роли IAM. \{#manually-create-iam-role\}

1 - Войдите в свою учетную запись AWS в веб-браузере под пользователем IAM, у которого есть права на создание и управление ролями IAM.

2 - Перейдите в консоль службы IAM.

3 - Создайте новую роль IAM со следующими политикой IAM и политикой доверия (Trust policy).

Политика доверия (замените `{ClickHouse_IAM_ARN}` на ARN роли IAM, принадлежащей вашему экземпляру ClickHouse):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "{ClickHouse_IAM_ARN}"
      },
      "Action": [
        "sts:AssumeRole",
        "sts:TagSession"
      ]
    }
  ]
}
```

Политика IAM (замените `{RDS_RESOURCE_ID}` на идентификатор ресурса вашего экземпляра RDS). Убедитесь, что вы также заменили `{RDS_REGION}` на регион вашего экземпляра RDS/Aurora и `{AWS_ACCOUNT}` на идентификатор вашей учетной записи AWS:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "rds-db:connect"
      ],
      "Resource": [
        "arn:aws:rds-db:{RDS_REGION}:{AWS_ACCOUNT}:dbuser:{RDS_RESOURCE_ID}/clickpipes_iam_user"
      ]
    }
  ]
}
```

4 - Скопируйте новый **IAM Role Arn** после создания. Он необходим для безопасного доступа к вашей базе данных AWS из ClickPipes. Давайте назовём его `{RDS_ACCESS_IAM_ROLE_ARN}`.

Теперь вы можете использовать эту роль IAM для аутентификации при подключении к вашему экземпляру RDS/Aurora из ClickPipes.
