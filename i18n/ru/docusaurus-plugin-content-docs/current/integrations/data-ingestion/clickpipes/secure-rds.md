---
slug: /integrations/clickpipes/secure-rds
sidebar_label: 'Аутентификация БД с помощью AWS IAM (RDS/Aurora)'
title: 'Аутентификация БД с помощью AWS IAM (RDS/Aurora)'
description: 'В этой статье показано, как клиенты ClickPipes могут использовать ролевой доступ для аутентификации в Amazon RDS/Aurora и безопасного подключения к своей базе данных.'
doc_type: 'guide'
keywords: ['clickpipes', 'rds', 'security', 'aws', 'private connection']
---

import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

В этой статье показано, как клиенты ClickPipes могут использовать ролевой доступ для аутентификации в Amazon Aurora и RDS и безопасного подключения к своим базам данных.

:::warning
Для AWS RDS Postgres и Aurora Postgres вы можете запускать только ClickPipes в режиме `Initial Load Only` из-за ограничений AWS IAM DB Authentication.

Для MySQL и MariaDB это ограничение не действует, и вы можете запускать как `Initial Load Only`, так и `CDC` ClickPipes.
:::


## Настройка {#setup}

### Получение ARN роли IAM службы ClickHouse {#obtaining-the-clickhouse-service-iam-role-arn}

1 - Войдите в учетную запись ClickHouse Cloud.

2 - Выберите службу ClickHouse, для которой хотите создать интеграцию.

3 - Выберите вкладку **Настройки**.

4 - Прокрутите вниз до раздела **Информация о сетевой безопасности** в нижней части страницы.

5 - Скопируйте значение **Идентификатор роли службы (IAM)** для этой службы, как показано ниже.

<Image img={secures3_arn} alt='Безопасный ARN S3' size='lg' border />

Давайте назовем это значение `{ClickHouse_IAM_ARN}`. Это роль IAM, которая будет использоваться для доступа к вашему экземпляру RDS/Aurora.

### Настройка экземпляра RDS/Aurora {#configuring-the-rds-aurora-instance}

#### Включение аутентификации IAM для базы данных {#enabling-iam-db-authentication}

1. Войдите в учетную запись AWS и перейдите к экземпляру RDS, который хотите настроить.
2. Нажмите кнопку **Изменить**.
3. Прокрутите вниз до раздела **Аутентификация базы данных**.
4. Включите опцию **Аутентификация с паролем и IAM для базы данных**.
5. Нажмите кнопку **Продолжить**.
6. Просмотрите изменения и выберите опцию **Применить немедленно**.

#### Получение идентификатора ресурса RDS/Aurora {#obtaining-the-rds-resource-id}

1. Войдите в учетную запись AWS и перейдите к экземпляру RDS или кластеру Aurora, который хотите настроить.
2. Выберите вкладку **Конфигурация**.
3. Запишите значение **Идентификатор ресурса**. Оно должно выглядеть как `db-xxxxxxxxxxxxxx` для RDS или `cluster-xxxxxxxxxxxxxx` для кластера Aurora. Давайте назовем это значение `{RDS_RESOURCE_ID}`. Это идентификатор ресурса, который будет использоваться в политике IAM для разрешения доступа к экземпляру RDS.

#### Настройка пользователя базы данных {#setting-up-the-database-user}

##### PostgreSQL {#setting-up-the-database-user-postgres}

1. Подключитесь к экземпляру RDS/Aurora и создайте нового пользователя базы данных с помощью следующей команды:
   ```sql
   CREATE USER clickpipes_iam_user;
   GRANT rds_iam TO clickpipes_iam_user;
   ```
2. Следуйте остальным шагам в [руководстве по настройке источника PostgreSQL](postgres/source/rds), чтобы настроить экземпляр RDS для ClickPipes.

##### MySQL / MariaDB {#setting-up-the-database-user-mysql}

1. Подключитесь к экземпляру RDS/Aurora и создайте нового пользователя базы данных с помощью следующей команды:
   ```sql
   CREATE USER 'clickpipes_iam_user' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
   ```
2. Следуйте остальным шагам в [руководстве по настройке источника MySQL](mysql/source/rds), чтобы настроить экземпляр RDS/Aurora для ClickPipes.

### Настройка роли IAM {#setting-up-iam-role}

#### Ручное создание роли IAM. {#manually-create-iam-role}

1 - Войдите в учетную запись AWS через веб-браузер с пользователем IAM, имеющим разрешения на создание и управление ролями IAM.

2 - Перейдите в консоль службы IAM.

3 - Создайте новую роль IAM со следующими политиками IAM и доверия.

Политика доверия (замените `{ClickHouse_IAM_ARN}` на ARN роли IAM вашего экземпляра ClickHouse):

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

Политика IAM (замените `{RDS_RESOURCE_ID}` на идентификатор ресурса вашего экземпляра RDS). Обязательно замените `{RDS_REGION}` на регион вашего экземпляра RDS/Aurora и `{AWS_ACCOUNT}` на идентификатор вашей учетной записи AWS:

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

4 - После создания скопируйте новый **ARN роли IAM**. Это значение необходимо для безопасного доступа к вашей базе данных AWS из ClickPipes. Давайте назовем его `{RDS_ACCESS_IAM_ROLE_ARN}`.

Теперь вы можете использовать эту роль IAM для аутентификации с вашим экземпляром RDS/Aurora из ClickPipes.
