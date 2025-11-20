---
slug: /cloud/data-sources/secure-s3
sidebar_label: 'Безопасный доступ к данным S3'
title: 'Безопасный доступ к данным S3'
description: 'В этой статье описано, как клиенты ClickHouse Cloud могут использовать ролевой доступ для аутентификации в Amazon Simple Storage Service (S3) и безопасного доступа к своим данным.'
keywords: ['RBAC', 'Amazon S3', 'аутентификация']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import secure_s3 from '@site/static/images/cloud/security/secures3.jpg';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';
import s3_output from '@site/static/images/cloud/security/secures3_output.jpg';

В этой статье показано, как клиенты ClickHouse Cloud могут использовать ролевой доступ для аутентификации в Amazon Simple Storage Service (S3) и безопасного доступа к своим данным.


## Введение {#introduction}

Прежде чем приступить к настройке безопасного доступа к S3, важно понять принцип работы этого механизма. Ниже представлен обзор того, как сервисы ClickHouse могут получать доступ к приватным S3-бакетам путём принятия роли в AWS-аккаунте клиента.

<Image
  img={secure_s3}
  size='md'
  alt='Обзор безопасного доступа к S3 с ClickHouse'
/>

Этот подход позволяет клиентам управлять всем доступом к своим S3-бакетам в одном месте (в IAM-политике принимаемой роли) без необходимости просматривать все политики бакетов для добавления или удаления доступа.


## Настройка {#setup}

### Получение ARN IAM-роли сервиса ClickHouse {#obtaining-the-clickhouse-service-iam-role-arn}

1 - Войдите в учетную запись ClickHouse Cloud.

2 - Выберите сервис ClickHouse, для которого требуется создать интеграцию.

3 - Перейдите на вкладку **Settings**.

4 - Прокрутите страницу вниз до раздела **Network security information**.

5 - Скопируйте значение **Service role ID (IAM)**, относящееся к сервису, как показано ниже.

<Image
  img={s3_info}
  size='lg'
  alt='Получение ARN IAM-роли сервиса ClickHouse'
  border
/>

### Настройка IAM assume role {#setting-up-iam-assume-role}

#### Вариант 1: Развертывание с помощью стека CloudFormation {#option-1-deploying-with-cloudformation-stack}

1 - Войдите в учетную запись AWS в веб-браузере с помощью IAM-пользователя, имеющего разрешения на создание и управление IAM-ролями.

2 - Перейдите по [этой ссылке](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3) для создания стека CloudFormation.

3 - Введите (или вставьте) **IAM Role**, относящуюся к сервису ClickHouse.

4 - Настройте стек CloudFormation. Ниже приведена дополнительная информация о параметрах.

| Параметр                  | Значение по умолчанию | Описание                                                                                      |
| :------------------------ | :-------------------: | :-------------------------------------------------------------------------------------------- |
| RoleName                  | ClickHouseAccess-001  | Имя новой роли, которую ClickHouse Cloud будет использовать для доступа к бакету S3.          |
| Role Session Name         |          \*           | Role Session Name может использоваться как общий секрет для дополнительной защиты бакета.     |
| ClickHouse Instance Roles |                       | Список IAM-ролей сервисов ClickHouse через запятую, которые могут использовать эту интеграцию Secure S3. |
| Bucket Access             |         Read          | Устанавливает уровень доступа для указанных бакетов.                                          |
| Bucket Names              |                       | Список **имен бакетов** через запятую, к которым эта роль будет иметь доступ.                |

_Примечание_: Указывайте только имя бакета, а не полный ARN бакета.

5 - Установите флажок **I acknowledge that AWS CloudFormation might create IAM resources with custom names.**

6 - Нажмите кнопку **Create stack** в правом нижнем углу.

7 - Убедитесь, что стек CloudFormation завершился без ошибок.

8 - Перейдите на вкладку **Outputs** стека CloudFormation.

9 - Скопируйте значение **RoleArn** для этой интеграции. Оно необходимо для доступа к бакету S3.

<Image
  img={s3_output}
  size='lg'
  alt='Вывод стека CloudFormation с ARN IAM-роли'
  border
/>

#### Вариант 2: Создание IAM-роли вручную {#option-2-manually-create-iam-role}

1 - Войдите в учетную запись AWS в веб-браузере с помощью IAM-пользователя, имеющего разрешения на создание и управление IAM-ролями.

2 - Перейдите в консоль сервиса IAM.

3 - Создайте новую IAM-роль со следующими политиками IAM и Trust.

Политика Trust (замените `{ClickHouse_IAM_ARN}` на ARN IAM-роли вашего экземпляра ClickHouse):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "{ClickHouse_IAM_ARN}"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Политика IAM (замените `{BUCKET_NAME}` на имя вашего бакета):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": ["s3:GetBucketLocation", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::{BUCKET_NAME}"],
      "Effect": "Allow"
    },
    {
      "Action": ["s3:Get*", "s3:List*"],
      "Resource": ["arn:aws:s3:::{BUCKET_NAME}/*"],
      "Effect": "Allow"
    }
  ]
}
```

4 - Скопируйте новый **IAM Role Arn** после создания. Он необходим для доступа к бакету S3.


## Доступ к S3-бакету с использованием роли ClickHouseAccess {#access-your-s3-bucket-with-the-clickhouseaccess-role}

ClickHouse Cloud предоставляет возможность указывать `extra_credentials` в табличной функции S3. Ниже приведен пример выполнения запроса с использованием созданной выше роли.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

Ниже приведен пример запроса, в котором `role_session_name` используется в качестве общего секрета для получения данных из бакета. Если значение `role_session_name` неверно, операция завершится с ошибкой.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
Рекомендуется размещать исходный S3-бакет в том же регионе, что и сервис ClickHouse Cloud, чтобы снизить расходы на передачу данных. Подробнее см. в разделе [Тарифы S3](https://aws.amazon.com/s3/pricing/)
:::
