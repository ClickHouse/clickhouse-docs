---
slug: /cloud/data-sources/secure-s3
sidebar_label: 'Безопасный доступ к данным в S3'
title: 'Безопасный доступ к данным в S3'
description: 'В этой статье показано, как клиенты ClickHouse Cloud могут использовать управление доступом на основе ролей для аутентификации в Amazon Simple Storage Service (S3) и обеспечения безопасного доступа к своим данным.'
keywords: ['RBAC', 'Amazon S3', 'аутентификация']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import secure_s3 from '@site/static/images/cloud/security/secures3.jpg';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';
import s3_output from '@site/static/images/cloud/security/secures3_output.jpg';

В этой статье показано, как клиенты ClickHouse Cloud могут использовать ролевой доступ для аутентификации в Amazon Simple Storage Service (S3) и безопасного доступа к своим данным.


## Введение {#introduction}

Прежде чем переходить к настройке безопасного доступа к S3, важно понять, как это работает. Ниже приведён обзор того, как сервисы ClickHouse могут получать доступ к закрытым S3-бакетам, переходя в роль в AWS-аккаунте клиента.

<Image img={secure_s3} size="md" alt="Обзор безопасного доступа к S3 с ClickHouse"/>

Такой подход позволяет клиентам управлять всем доступом к их S3-бакетам в одном месте (в политике IAM для используемой роли), без необходимости изменять политики всех бакетов для добавления или отзыва доступа.



## Настройка

### Получение ARN IAM-роли сервиса ClickHouse

1 - Войдите в свою учетную запись ClickHouse Cloud.

2 - Выберите сервис ClickHouse, для которого вы хотите создать интеграцию.

3 - Перейдите на вкладку **Settings**.

4 - Пролистайте вниз до раздела **Network security information** в нижней части страницы.

5 - Скопируйте значение **Service role ID (IAM)**, относящееся к сервису, как показано ниже.

<Image img={s3_info} size="lg" alt="Получение ARN IAM-роли сервиса ClickHouse" border />

### Настройка роли IAM для AssumeRole

#### Вариант 1: Развертывание с помощью стека CloudFormation

1 - Войдите в свою учетную запись AWS в веб-браузере под IAM-пользователем, который имеет права на создание и управление IAM-ролями.

2 - Перейдите по [этой ссылке](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml\&stackName=ClickHouseSecureS3), чтобы создать стек CloudFormation.

3 - Введите (или вставьте) **IAM Role**, относящуюся к сервису ClickHouse.

4 - Настройте стек CloudFormation. Ниже приведена дополнительная информация по параметрам.

| Parameter                 |     Default Value    | Description                                                                                              |
| :------------------------ | :------------------: | :------------------------------------------------------------------------------------------------------- |
| RoleName                  | ClickHouseAccess-001 | Имя новой роли, которую ClickHouse Cloud будет использовать для доступа к вашему бакету S3               |
| Role Session Name         |           *          | Role Session Name может использоваться как общий секрет для дополнительной защиты вашего бакета.         |
| ClickHouse Instance Roles |                      | Список через запятую IAM-ролей сервисов ClickHouse, которые могут использовать эту интеграцию Secure S3. |
| Bucket Access             |         Read         | Устанавливает уровень доступа для указанных бакетов.                                                     |
| Bucket Names              |                      | Список через запятую **имен бакетов**, к которым эта роль будет иметь доступ.                            |

*Примечание*: Указывайте не полный ARN бакета, а только его имя.

5 - Установите флажок **I acknowledge that AWS CloudFormation might create IAM resources with custom names.**

6 - Нажмите кнопку **Create stack** в правом нижнем углу.

7 - Убедитесь, что выполнение стека CloudFormation завершилось без ошибок.

8 - Перейдите на вкладку **Outputs** стека CloudFormation.

9 - Скопируйте значение **RoleArn** для этой интеграции. Оно необходимо для доступа к вашему бакету S3.

<Image img={s3_output} size="lg" alt="Выходные данные стека CloudFormation, показывающие ARN IAM-роли" border />

#### Вариант 2: Ручное создание IAM-роли

1 - Войдите в свою учетную запись AWS в веб-браузере под IAM-пользователем, который имеет права на создание и управление IAM-ролями.

2 - Перейдите в IAM Service Console.

3 - Создайте новую IAM-роль со следующими политиками IAM и доверия.

Политика доверия (замените `{ClickHouse_IAM_ARN}` на ARN IAM-роли, относящейся к вашему инстансу ClickHouse):

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

Политика IAM (пожалуйста, замените `{BUCKET_NAME}` на имя вашего бакета):

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

4 - После создания скопируйте новый **ARN роли IAM**. Он понадобится для доступа к вашему бакету S3.


## Получение доступа к вашему бакету S3 с помощью роли ClickHouseAccess

В ClickHouse Cloud появилась новая возможность, которая позволяет указывать `extra_credentials` как часть табличной функции S3. Ниже приведён пример выполнения запроса с использованием только что созданной роли, скопированной выше.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

Ниже приведён пример запроса, который использует `role_session_name` в качестве общего секретного ключа для выборки данных из бакета. Если значение `role_session_name` указано неверно, операция завершится с ошибкой.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
Мы рекомендуем размещать исходный S3‑бакет в том же регионе, что и ваш ClickHouse Cloud Service, чтобы снизить расходы на передачу данных. Для получения дополнительной информации см. [цены на S3](https://aws.amazon.com/s3/pricing/).
:::
