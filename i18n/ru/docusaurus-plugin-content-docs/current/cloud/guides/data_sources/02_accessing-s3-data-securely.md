---
slug: /cloud/data-sources/secure-s3
sidebar_label: 'Безопасный доступ к данным в S3'
title: 'Безопасный доступ к данным в S3'
description: 'В этой статье показано, как клиенты ClickHouse Cloud могут использовать доступ на основе ролей для аутентификации в Amazon Simple Storage Service (S3) и безопасного получения доступа к своим данным.'
keywords: ['RBAC', 'Amazon S3', 'authentication']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import secure_s3 from '@site/static/images/cloud/security/secures3.png';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';
import s3_output from '@site/static/images/cloud/security/secures3_output.jpg';

В этой статье показано, как клиенты ClickHouse Cloud могут использовать ролевой доступ для аутентификации в Amazon Simple Storage Service (S3) и безопасного доступа к своим данным.


## Введение {#introduction}

Прежде чем переходить к настройке безопасного доступа к S3, важно понять, как это работает. Ниже приведён обзор того, как сервисы ClickHouse могут получать доступ к приватным S3‑бакетам, принимая на себя роль в аккаунте AWS клиента.

<Image img={secure_s3} size="lg" alt="Overview of Secure S3 Access with ClickHouse"/>

Такой подход позволяет клиентам управлять всем доступом к своим S3‑бакетам в одном месте (IAM‑политика предполагаемой роли), без необходимости просматривать и изменять политики всех своих бакетов для предоставления или отзыва доступа.

## Настройка {#setup}

### Получение ARN роли IAM сервиса ClickHouse {#obtaining-the-clickhouse-service-iam-role-arn}

1 - Войдите в свою учетную запись ClickHouse Cloud.

2 - Выберите сервис ClickHouse, для которого вы хотите создать интеграцию.

3 - Откройте вкладку **Settings**.

4 - Прокрутите страницу вниз до раздела **Network security information** в нижней части страницы.

5 - Скопируйте значение **Service role ID (IAM)**, соответствующее сервису, как показано ниже.

<Image img={s3_info} size="lg" alt="Obtaining ClickHouse service IAM Role ARN" border />

### Настройка роли IAM для операции AssumeRole {#setting-up-iam-assume-role}

#### Вариант 1: Развертывание с помощью стека CloudFormation {#option-1-deploying-with-cloudformation-stack}

1 - Войдите в свою учетную запись AWS в веб-браузере под пользователем IAM, у которого есть разрешения на создание и управление ролями IAM.

2 - Перейдите по [этой ссылке](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3), чтобы заполнить стек CloudFormation.

3 - Укажите (или вставьте) **роль IAM**, принадлежащую сервису ClickHouse.

4 - Настройте стек CloudFormation. Ниже приведена дополнительная информация об этих параметрах.

| Parameter                 | Default Value        | Description                                                                                                                |
| :---                      |    :----:            | :----                                                                                                                      |
| RoleName                  | ClickHouseAccess-001 | Имя новой роли, которую ClickHouse Cloud будет использовать для доступа к вашему бакету S3                                |
| Role Session Name         |      *               | Role Session Name может использоваться в качестве общего секрета для дополнительной защиты вашего бакета.                |
| ClickHouse Instance Roles |                      | Список ролей IAM сервиса ClickHouse, разделённых запятыми, которые могут использовать эту интеграцию Secure S3.          |
| Bucket Access             |    Read              | Задаёт уровень доступа для указанных бакетов.                                                                             |
| Bucket Names              |                      | Список **имён бакетов**, разделённых запятыми, к которым эта роль будет иметь доступ.                                     |

*Примечание*: Указывайте не полный ARN бакета, а только его имя.

5 - Установите флажок **I acknowledge that AWS CloudFormation might create IAM resources with custom names.**

6 - Нажмите кнопку **Create stack** в правом нижнем углу.

7 - Убедитесь, что создание стека CloudFormation завершилось без ошибок.

8 - Перейдите на вкладку **Outputs** стека CloudFormation.

9 - Скопируйте значение **RoleArn** для этой интеграции. Оно потребуется для доступа к вашему бакету S3.

<Image img={s3_output} size="lg" alt="Результат стека CloudFormation, показывающий ARN роли IAM" border />

#### Вариант 2: создание роли IAM вручную {#option-2-manually-create-iam-role}

1 - Войдите в свою учетную запись AWS в веб-браузере под IAM-пользователем, который имеет права на создание и управление ролями IAM.

2 - Перейдите в консоль сервиса IAM.

3 - Создайте новую роль IAM со следующими политиками IAM и доверия.

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
            "Action": [
                "s3:GetBucketLocation",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::{BUCKET_NAME}"
            ],
            "Effect": "Allow"
        },
        {
            "Action": [
                "s3:Get*",
                "s3:List*"
            ],
            "Resource": [
                "arn:aws:s3:::{BUCKET_NAME}/*"
            ],
            "Effect": "Allow"
        }
    ]
}
```

4 - После создания скопируйте новый **IAM Role Arn**. Он понадобится для доступа к вашему S3-бакету.


## Доступ к бакету S3 с ролью ClickHouseAccess {#access-your-s3-bucket-with-the-clickhouseaccess-role}

В ClickHouse Cloud появилась новая возможность указывать параметр `extra_credentials` в S3 table function. Ниже приведён пример того, как выполнить запрос, используя только что созданную роль, скопированную выше.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

Ниже приведён пример запроса, который использует `role_session_name` как общий секрет для выборки данных из бакета. Если значение `role_session_name` указано неверно, операция завершится с ошибкой.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
Мы рекомендуем размещать исходное хранилище S3 в том же регионе, что и ваш сервис ClickHouse Cloud, чтобы снизить затраты на передачу данных. Для получения дополнительной информации см. раздел [S3 pricing](https://aws.amazon.com/s3/pricing/).
:::
