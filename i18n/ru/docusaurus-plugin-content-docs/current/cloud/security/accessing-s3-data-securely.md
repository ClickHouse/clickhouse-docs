---
slug: /cloud/security/secure-s3
sidebar_label: 'Безопасный доступ к данным S3'
title: 'Безопасный доступ к данным S3'
description: 'В этой статье показано, как клиенты ClickHouse Cloud могут использовать контроль доступа на основе ролей для аутентификации в Amazon Simple Storage Service(S3) и безопасного доступа к своим данным.'
---

import Image from '@theme/IdealImage';
import secure_s3 from '@site/static/images/cloud/security/secures3.jpg';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';
import s3_output from '@site/static/images/cloud/security/secures3_output.jpg';

В этой статье показано, как клиенты ClickHouse Cloud могут использовать контроль доступа на основе ролей для аутентификации в Amazon Simple Storage Service(S3) и безопасного доступа к своим данным.

## Введение {#introduction}

Перед тем как углубиться в настройку безопасного доступа к S3, важно понять, как это работает. Ниже представлено общее представление о том, как услуги ClickHouse могут получать доступ к приватным S3-бакетам, принимая на себя роль в учетной записи AWS клиентов.

<Image img={secure_s3} size="md" alt="Обзор безопасного доступа к S3 с ClickHouse"/>

Этот подход позволяет клиентам управлять всем доступом к своим S3-бакетам в одном месте (политика IAM для предполагаемой роли), не проходя через все свои политики бакетов для добавления или удаления доступа.

## Настройка {#setup}

### Получение IAM роли Arn для сервиса ClickHouse {#obtaining-the-clickhouse-service-iam-role-arn}

1 - Войдите в свою учетную запись ClickHouse Cloud.

2 - Выберите сервис ClickHouse, для которого хотите создать интеграцию.

3 - Выберите вкладку **Настройки**.

4 - Прокрутите вниз до раздела **Информация о сетевой безопасности** внизу страницы.

5 - Скопируйте значение **ID роли сервиса (IAM)**, принадлежащее сервису, как показано ниже.

<Image img={s3_info} size="lg" alt="Получение IAM роли сервиса ClickHouse ARN" border />

### Настройка предполагаемой роли IAM {#setting-up-iam-assume-role}

#### Вариант 1: Развертывание с помощью стека CloudFormation {#option-1-deploying-with-cloudformation-stack}

1 - Войдите в свою учетную запись AWS в веб-браузере с IAM пользователем, у которого есть разрешение на создание и управление IAM ролями.

2 - Перейдите по [ссылке](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3) для заполнения стека CloudFormation.

3 - Введите (или вставьте) **IAM роль**, принадлежащую сервису ClickHouse.

4 - Настройте стек CloudFormation. Ниже представлена дополнительная информация о этих параметрах.

| Параметр                 | Значение по умолчанию | Описание                                                                                        |
| :---                      |    :----:            | :----                                                                                              |
| RoleName                  | ClickHouseAccess-001 | Имя новой роли, которую ClickHouse Cloud будет использовать для доступа к вашему S3 бакету      |
| Role Session Name         |      *               | Имя сеанса роли может использоваться как общий секрет для дополнительной защиты вашего бакета.   |
| ClickHouse Instance Roles |                      | Список IAM ролей сервиса ClickHouse, которые могут использовать эту интеграцию Secure S3.       |
| Bucket Access             |    Read              | Устанавливает уровень доступа к предоставленным бакетам.                                        |
| Bucket Names              |                      | Список **имен бакетов**, к которым эта роль будет иметь доступ, разделенный запятыми.           |

*Примечание*: Не вводите полный ARN бакета, а просто имя бакета.

5 - Установите флажок **Я подтверждаю, что AWS CloudFormation может создать IAM ресурсы с пользовательскими именами.**

6 - Нажмите кнопку **Создать стек** в правом нижнем углу.

7 - Убедитесь, что стек CloudFormation завершился без ошибок.

8 - Выберите **Выводы** стека CloudFormation.

9 - Скопируйте значение **RoleArn** для этой интеграции. Это то, что нужно для доступа к вашему S3 бакету.

<Image img={s3_output} size="lg" alt="Вывод стека CloudFormation с отображением IAM Role ARN" border />

#### Вариант 2: Ручное создание IAM роли. {#option-2-manually-create-iam-role}

1 - Войдите в свою учетную запись AWS в веб-браузере с IAM пользователем, у которого есть разрешение на создание и управление IAM ролями.

2 - Перейдите в консоль службы IAM.

3 - Создайте новую IAM роль с следующими IAM и политикой доверия.

Политика доверия (Пожалуйста, замените `{ClickHouse_IAM_ARN}` на ARN роли IAM, принадлежащей вашему экземпляру ClickHouse):

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

IAM политика (Пожалуйста, замените `{BUCKET_NAME}` на имя вашего бакета):

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

4 - Скопируйте новый **IAM Role Arn** после создания. Это то, что нужно для доступа к вашему S3 бакету.

## Доступ к вашему S3 бакету с角色 ClickHouseAccess {#access-your-s3-bucket-with-the-clickhouseaccess-role}

ClickHouse Cloud имеет новую функцию, которая позволяет вам указать `extra_credentials` в качестве части функции таблицы S3. Ниже приведен пример того, как выполнить запрос, используя новую созданную роль, скопированную выше.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

Ниже приведен пример запроса, который использует `role_session_name` в качестве общего секрета для запроса данных из бакета. Если `role_session_name` неверен, эта операция завершится неудачей.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
Рекомендуем, чтобы ваш исходный S3 находился в том же регионе, что и ваш сервис ClickHouse Cloud, чтобы уменьшить затраты на передачу данных. Для получения дополнительной информации обратитесь к [ценам на S3](https://aws.amazon.com/s3/pricing/)
:::
