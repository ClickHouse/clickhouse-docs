---
'slug': '/cloud/security/secure-s3'
'sidebar_label': 'Безопасный доступ к данным S3'
'title': 'Безопасный доступ к данным S3'
'description': 'В этой статье демонстрируется, как пользователи ClickHouse Cloud могут
  использовать контроль доступа на основе ролей для аутентификации с Amazon Simple
  Storage Service(S3) и безопасного доступа к своим данным.'
'doc_type': 'guide'
---
import Image from '@theme/IdealImage';
import secure_s3 from '@site/static/images/cloud/security/secures3.jpg';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';
import s3_output from '@site/static/images/cloud/security/secures3_output.jpg';

Эта статья демонстрирует, как клиенты ClickHouse Cloud могут использовать контроль доступа на основе ролей для аутентификации с Amazon Simple Storage Service (S3) и безопасного доступа к своим данным.

## Введение {#introduction}

Перед тем как погрузиться в настройку безопасного доступа к S3, важно понять, как это работает. Ниже приведен обзор того, как сервисы ClickHouse могут получать доступ к частным корзинам S3, перейдя на роль в аккаунте AWS клиентов.

<Image img={secure_s3} size="md" alt="Обзор безопасного доступа к S3 с ClickHouse"/>

Этот подход позволяет клиентам управлять всем доступом к своим корзинам S3 в одном месте (политика IAM предполагаемой роли), не проходя через все политики своих корзин для добавления или удаления доступа.

## Настройка {#setup}

### Получение ARN IAM роли сервиса ClickHouse {#obtaining-the-clickhouse-service-iam-role-arn}

1 - Войдите в свой аккаунт ClickHouse cloud.

2 - Выберите сервис ClickHouse, для которого хотите создать интеграцию.

3 - Выберите вкладку **Настройки**.

4 - Прокрутите вниз до раздела **Информация о сетевой безопасности** в нижней части страницы.

5 - Скопируйте значение **ID роли сервиса (IAM)**, принадлежащее сервису, как показано ниже.

<Image img={s3_info} size="lg" alt="Получение ARN IAM роли сервиса ClickHouse" border />

### Настройка IAM предполагаемой роли {#setting-up-iam-assume-role}

#### Опция 1: Развертывание с помощью стека CloudFormation {#option-1-deploying-with-cloudformation-stack}

1 - Войдите в свой аккаунт AWS в веб-браузере с пользователем IAM, у которого есть разрешение на создание и управление IAM ролями.

2 - Перейдите по [этой ссылке](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3), чтобы заполнить стек CloudFormation.

3 - Введите (или вставьте) **IAM роль**, принадлежащую сервису ClickHouse.

4 - Настройте стек CloudFormation. Ниже приведена дополнительная информация об этих параметрах.

| Параметр                 | Значение по умолчанию  | Описание                                                                                       |
| :---                     |    :----:              | :----                                                                                          |
| RoleName                 | ClickHouseAccess-001   | Имя новой роли, которую ClickHouse Cloud будет использовать для доступа к вашей корзине S3     |
| Role Session Name        |      *                 | Имя сессии роли может использоваться как общий секрет для дополнительной защиты вашей корзины. |
| ClickHouse Instance Roles |                        | Список IAM ролей сервиса ClickHouse, которые могут использовать эту интеграцию Secure S3.     |
| Bucket Access            |    Read                | Устанавливает уровень доступа для предоставленных корзин.                                     |
| Bucket Names             |                        | Список **имен корзин**, к которым эта роль будет иметь доступ, разделённый запятыми.           |

*Примечание*: Не указывайте полный ARN корзины, а вместо этого просто укажите только имя корзины.

5 - Выберите флажок **Я подтверждаю, что AWS CloudFormation может создать IAM ресурсы с нестандартными именами.**

6 - Нажмите кнопку **Создать стек** в правом нижнем углу.

7 - Убедитесь, что стек CloudFormation завершен без ошибок.

8 - Выберите **Выходные данные** стека CloudFormation.

9 - Скопируйте значение **RoleArn** для этой интеграции. Это то, что необходимо для доступа к вашей корзине S3.

<Image img={s3_output} size="lg" alt="Вывод стека CloudFormation, показывающий ARN IAM роли" border />

#### Опция 2: Вручную создать IAM роль {#option-2-manually-create-iam-role}

1 - Войдите в свой аккаунт AWS в веб-браузере с пользователем IAM, у которого есть разрешение на создание и управление IAM ролями.

2 - Перейдите в консоль службы IAM.

3 - Создайте новую IAM роль со следующей политикой IAM и политикой доверия.

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

Политика IAM (Пожалуйста, замените `{BUCKET_NAME}` на имя вашей корзины):

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

4 - Скопируйте новый **ARN IAM роли** после создания. Это то, что необходимо для доступа к вашей корзине S3.

## Доступ к вашей корзине S3 с ролью ClickHouseAccess {#access-your-s3-bucket-with-the-clickhouseaccess-role}

ClickHouse Cloud имеет новую функцию, которая позволяет вам указывать `extra_credentials` как часть табличной функции S3. Ниже приведен пример запроса с использованием только что созданной роли, скопированной выше.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

Ниже приведен пример запроса, который использует `role_session_name` как общий секрет для запроса данных из корзины. Если `role_session_name` неверен, эта операция завершится неудачей.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
Мы рекомендуем, чтобы ваша исходная корзина S3 находилась в том же регионе, что и ваш сервис ClickHouse Cloud, чтобы сократить расходы на передачу данных. Для получения дополнительной информации обратитесь к [ценам на S3]( https://aws.amazon.com/s3/pricing/)
:::