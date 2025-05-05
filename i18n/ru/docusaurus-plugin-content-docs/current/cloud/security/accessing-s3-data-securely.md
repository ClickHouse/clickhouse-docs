---
slug: /cloud/security/secure-s3
sidebar_label: 'Безопасный доступ к данным S3'
title: 'Безопасный доступ к данным S3'
description: 'В этой статье показано, как клиенты ClickHouse Cloud могут использовать контроль доступа на основе ролей для аутентификации с Amazon Simple Storage Service (S3) и безопасного доступа к своим данным.'
---

import Image from '@theme/IdealImage';
import secure_s3 from '@site/static/images/cloud/security/secures3.jpg';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';
import s3_output from '@site/static/images/cloud/security/secures3_output.jpg';

В этой статье показано, как клиенты ClickHouse Cloud могут использовать контроль доступа на основе ролей для аутентификации с Amazon Simple Storage Service (S3) и безопасного доступа к своим данным.

## Введение {#introduction}

Перед тем как погрузиться в настройку безопасного доступа к S3, важно понять, как это работает. Ниже представлено общее представление о том, как службы ClickHouse могут получать доступ к приватным контейнерам S3, принимая на себя роль в учетной записи AWS клиентов.

<Image img={secure_s3} size="md" alt="Обзор безопасного доступа к S3 с ClickHouse"/>

Этот подход позволяет клиентам управлять всем доступом к своим контейнерам S3 в одном месте (политика IAM предполагаемой роли), не проходя через все их политике контейнеров для добавления или удаления доступа.

## Настройка {#setup}

### Получение Arn IAM роли службы ClickHouse {#obtaining-the-clickhouse-service-iam-role-arn}

1 - Войдите в свою учетную запись ClickHouse Cloud.

2 - Выберите службу ClickHouse, для которой хотите создать интеграцию.

3 - Выберите вкладку **Настройки**.

4 - Прокрутите вниз до раздела **Информация о сетевой безопасности** в нижней части страницы.

5 - Скопируйте значение **ID роли службы (IAM)**, принадлежащее службе, как показано ниже.

<Image img={s3_info} size="lg" alt="Получение IAM Role ARN службы ClickHouse" border />

### Настройка IAM assume role {#setting-up-iam-assume-role}

#### Вариант 1: Развертывание с помощью стека CloudFormation {#option-1-deploying-with-cloudformation-stack}

1 - Войдите в свою учетную запись AWS в веб-браузере с IAM пользователем, который имеет разрешение на создание и управление IAM ролями.

2 - Перейдите по [ссылке](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3) для заполнения стека CloudFormation.

3 - Введите (или вставьте) **IAM роль**, принадлежащую службе ClickHouse.

4 - Настройте стек CloudFormation. Ниже представлена дополнительная информация о этих параметрах.

| Параметр                 | Значение по умолчанию  | Описание                                                                                       |
| :---                     |    :----:              | :----                                                                                         |
| RoleName                 | ClickHouseAccess-001   | Имя новой роли, которую ClickHouse Cloud будет использовать для доступа к вашему контейнеру S3 |
| Role Session Name        |      *                 | Имя сессии роли может быть использовано как общий секрет для дополнительной защиты вашего контейнера. |
| ClickHouse Instance Roles |                        | Список IAM ролей службы ClickHouse, разделенный запятыми, которые могут использовать эту интеграцию с безопасным S3. |
| Bucket Access            |    Read                | Устанавливает уровень доступа для предоставленных контейнеров.                                 |
| Bucket Names             |                        | Список **имен контейнеров**, разделенный запятыми, к которым эта роль будет иметь доступ.      |

*Примечание*: Не указывайте полный Arn контейнера, вместо этого укажите только имя контейнера.

5 - Выберите флажок **Я подтверждаю, что AWS CloudFormation может создать IAM-ресурсы с пользовательскими именами.**

6 - Нажмите кнопку **Создать стек** в правом нижнем углу.

7 - Убедитесь, что стек CloudFormation завершился без ошибок.

8 - Выберите **Выходные данные** стека CloudFormation.

9 - Скопируйте значение **RoleArn** для этой интеграции. Оно необходимо для доступа к вашему контейнеру S3.

<Image img={s3_output} size="lg" alt="Выходные данные стека CloudFormation, показывающие IAM Role ARN" border />

#### Вариант 2: Ручное создание IAM роли. {#option-2-manually-create-iam-role}

1 - Войдите в свою учетную запись AWS в веб-браузере с IAM пользователем, который имеет разрешение на создание и управление IAM ролями.

2 - Перейдите в консоль службы IAM.

3 - Создайте новую IAM роль со следующей политикой IAM и доверительными отношениями.

Политика доверия (Пожалуйста, замените `{ClickHouse_IAM_ARN}` на IAM Role arn, принадлежащий вашему экземпляру ClickHouse):

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

IAM политика (Пожалуйста, замените `{BUCKET_NAME}` на имя вашего контейнера):

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

4 - Скопируйте новый **IAM Role Arn** после создания. Оно необходимо для доступа к вашему контейнеру S3.

## Доступ к вашему контейнеру S3 с ролью ClickHouseAccess {#access-your-s3-bucket-with-the-clickhouseaccess-role}

ClickHouse Cloud имеет новую функцию, которая позволяет вам указывать `extra_credentials` в качестве части табличной функции S3. Ниже приведен пример выполнения запроса с использованием вновь созданной роли, скопированной из вышеуказанного.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

Ниже приведен пример запроса, который использует `role_session_name` в качестве общего секрета для запроса данных из контейнера. Если `role_session_name` некорректен, эта операция завершится неудачно.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
Мы рекомендуем, чтобы ваше исходное S3 находилось в том же регионе, что и ваша служба ClickHouse Cloud, чтобы снизить затраты на передачу данных. Для получения дополнительной информации обратитесь к [ценам на S3]( https://aws.amazon.com/s3/pricing/)
:::
