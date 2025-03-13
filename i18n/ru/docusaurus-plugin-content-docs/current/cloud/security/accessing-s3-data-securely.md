---
slug: /cloud/security/secure-s3
sidebar_label: Доступ к данным S3 безопасно
title: Доступ к данным S3 безопасно
---

import secure_s3 from '@site/static/images/cloud/security/secures3.jpg';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';
import s3_output from '@site/static/images/cloud/security/secures3_output.jpg';

В этой статье показано, как клиенты ClickHouse Cloud могут использовать доступ на основе ролей для аутентификации с Amazon Simple Storage Service (S3) и безопасного доступа к своим данным.

## Введение {#introduction}

Прежде чем углубляться в настройку безопасного доступа к S3, важно понять, как это работает. Ниже приведен обзор того, как службы ClickHouse могут получать доступ к частным S3-бакетам, принимая на себя роль в учетной записи AWS клиентов.

<img src={secure_s3} alt="Обзор безопасного доступа к S3 с ClickHouse" />

Этот подход позволяет клиентам управлять всем доступом к своим S3-бакетам в одном месте (IAM-политика принимаемой роли), не проходя через все свои политики бакетов для добавления или удаления доступа.

## Настройка {#setup}

### Получение ARN роли сервиса ClickHouse IAM {#obtaining-the-clickhouse-service-iam-role-arn}

1 - Войдите в свою учетную запись ClickHouse Cloud.

2 - Выберите службу ClickHouse, интеграцию с которой вы хотите создать.

3 - Выберите вкладку **Настройки**.

4 - Прокрутите вниз до раздела **Информация о сетевой безопасности** в нижней части страницы.

5 - Скопируйте значение **ID роли сервиса (IAM)**, принадлежащее сервису, как показано ниже.

<img src={s3_info} alt="Получение ARN роли сервиса ClickHouse IAM" />

### Настройка IAM assume role {#setting-up-iam-assume-role}

#### Вариант 1: Развертывание с помощью стека CloudFormation {#option-1-deploying-with-cloudformation-stack}

1 - Войдите в свою учетную запись AWS в веб-браузере с IAM-пользователем, который имеет разрешение на создание и управление IAM-ролями.

2 - Перейдите по [этой ссылке](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3) для заполнения стека CloudFormation.

3 - Введите (или вставьте) **IAM роль**, принадлежащую сервису ClickHouse.

4 - Настройте стек CloudFormation. Ниже приведена дополнительная информация об этих параметрах.

| Параметр                 | Значение по умолчанию | Описание                                                                                                    |
| :---                     |    :----:             | :----                                                                                                      |
| RoleName                 | ClickHouseAccess-001  | Имя новой роли, которую ClickHouse Cloud будет использовать для доступа к вашему S3-бакету                   |
| Role Session Name        |      *                | Имя сессии роли может использоваться как общий секрет для дальнейшей защиты вашего бакета.                   |
| ClickHouse Instance Roles |                      | Список IAM-ролей сервиса ClickHouse, разделенный запятыми, которые могут использовать эту интеграцию Secure S3. |
| Bucket Access            |    Read               | Устанавливает уровень доступа для предоставленных бакетов.                                                  |
| Bucket Names             |                      | Список **имен бакетов**, разделенный запятыми, к которым эта роль будет иметь доступ.                        |

*Примечание*: Не вводите полный ARN бакета, а просто его имя.

5 - Установите флажок **Я понимаю, что AWS CloudFormation может создать ресурсы IAM с пользовательскими именами.**

6 - Нажмите кнопку **Создать стек** в правом нижнем углу.

7 - Убедитесь, что стек CloudFormation завершился без ошибок.

8 - Выберите **Выводы** стека CloudFormation.

9 - Скопируйте значение **RoleArn** для этой интеграции. Это то, что нужно для доступа к вашему S3-бакету.

<img src={s3_output} alt="Вывод стека CloudFormation, показывающий ARN роли IAM" />

#### Вариант 2: Ручное создание IAM-ролей. {#option-2-manually-create-iam-role}

1 - Войдите в свою учетную запись AWS в веб-браузере с IAM-пользователем, который имеет разрешение на создание и управление IAM-ролями.

2 - Перейдите в консоль службы IAM.

3 - Создайте новую IAM-ролю с учетом следующей IAM и Trust политики.

Политика доверия (Пожалуйста, замените `{ClickHouse_IAM_ARN}` на ARN роли IAM, принадлежащий вашему экземпляру ClickHouse):

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

4 - Скопируйте новый **ARN роли IAM** после создания. Это то, что нужно для доступа к вашему S3-бакету.

## Доступ к вашему S3-бакету с ролью ClickHouseAccess {#access-your-s3-bucket-with-the-clickhouseaccess-role}

ClickHouse Cloud имеет новую функцию, которая позволяет вам указывать `extra_credentials` как часть функции таблицы S3. Ниже приведен пример того, как выполнить запрос, используя новую созданную роль, скопированную из выше.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

Ниже приведен пример запроса, который использует `role_session_name` в качестве общего секрета для запроса данных из бакета. Если `role_session_name` неправильный, эта операция завершится неудачей.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
Рекомендуем, чтобы ваш источник S3 находился в том же регионе, что и ваша служба ClickHouse Cloud, чтобы сократить расходы на передачу данных. Для получения дополнительной информации обратитесь к [ценам на S3]( https://aws.amazon.com/s3/pricing/)
:::
