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
import s3_output from '@site/static/images/cloud/security/secures3_output.png';

В этом руководстве показано, как клиенты ClickHouse Cloud могут использовать доступ на основе ролей для аутентификации в Amazon Simple Storage Service (S3) и безопасного доступа к своим данным.
Прежде чем переходить к настройке безопасного доступа к S3, важно понять, как это работает. Ниже приведён обзор того, как сервисы ClickHouse могут получать доступ к приватным S3‑бакетам, принимая роль в учётной записи AWS клиента.

<Image img={secure_s3} size="lg" alt="Обзор безопасного доступа к S3 в ClickHouse" />

<br />

<Image img={secure_s3} size="md" alt="Обзор безопасного доступа к S3 в ClickHouse" />

<br />

Такой подход позволяет клиентам управлять всем доступом к своим S3‑бакетам в одном месте (через политику IAM принимаемой роли), без необходимости просматривать и изменять политики каждого бакета для добавления или удаления доступа.
В следующем разделе вы узнаете, как это настроить.


## Получение ARN роли IAM вашего сервиса ClickHouse \\{#obtaining-the-clickhouse-service-iam-role-arn\\}

1. Войдите в свою учетную запись ClickHouse Cloud.

2. Выберите сервис ClickHouse, для которого вы хотите создать интеграцию.

3. Откройте вкладку **Settings**.

4. Прокрутите страницу вниз до раздела **Network security information** в нижней части страницы.

5. Скопируйте значение **Service role ID (IAM)**, принадлежащее этому сервису, как показано ниже.

<Image img={s3_info} size="lg" alt="Obtaining ClickHouse service IAM Role ARN" border />

## Настройка роли IAM assume role \\{#setting-up-iam-assume-role\\}

Роль IAM assume role можно настроить одним из двух способов:

- [С помощью стека CloudFormation](#option-1-deploying-with-cloudformation-stack)
- [Ручное создание роли IAM](#option-2-manually-create-iam-role)

### Развертывание с помощью стека CloudFormation \\{#option-1-deploying-with-cloudformation-stack\\}

1. Войдите в свою учетную запись AWS в веб-браузере, используя IAM-пользователя с правами на создание и управление ролью IAM.

2. Перейдите по [этой ссылке](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3), чтобы создать стек CloudFormation.

3. Введите (или вставьте) **service role ID (IAM)** для вашего сервиса, который вы получили ранее, в поле с названием "ClickHouse Instance Roles".
   Вы можете вставить service role ID в точности так, как он отображается в консоли Cloud.

4. Введите имя вашего бакета в поле с названием "Bucket Names". Если URL вашего бакета — `https://ch-docs-s3-bucket.s3.eu-central-1.amazonaws.com/clickhouseS3/`, то именем бакета будет `ch-docs-s3-bucket`.

:::note
Не указывайте полный ARN бакета, указывайте только имя бакета.
:::

5. Настройте стек CloudFormation. Ниже приведена дополнительная информация об этих параметрах.

| Параметр                  | Значение по умолчанию | Описание                                                                                             |
| :---                      |    :----:             | :----                                                                                               |
| RoleName                  | ClickHouseAccess-001  | Имя новой роли, которую ClickHouse Cloud будет использовать для доступа к вашему S3-бакету.         |
| Role Session Name         |      *                | Role Session Name может использоваться в качестве общего секрета для дополнительной защиты вашего бакета. |
| ClickHouse Instance Roles |                       | Список через запятую IAM-ролей сервиса ClickHouse, которые могут использовать эту защищенную интеграцию с S3. |
| Bucket Access             |    Read               | Задает уровень доступа для указанных бакетов.                                                       |
| Bucket Names              |                       | Список через запятую имен бакетов, к которым эта роль будет иметь доступ. **Примечание:** используйте имя бакета, а не полный ARN бакета. |

6. Установите флажок **I acknowledge that AWS CloudFormation might create IAM resources with custom names**.

7. Нажмите кнопку **Create stack** в правом нижнем углу.

8. Убедитесь, что стек CloudFormation создан без ошибок.

9. Выберите только что созданный Stack, затем перейдите на вкладку **Outputs** стека CloudFormation.

10. Скопируйте значение **RoleArn** для этой интеграции — оно потребуется для доступа к вашему S3-бакету.

<Image img={s3_output} size="lg" alt="Результат стека CloudFormation с отображением IAM Role ARN" border />

### Создание роли IAM вручную \{#option-2-manually-create-iam-role\}

1. Войдите в свою учетную запись AWS в веб-браузере под IAM-пользователем, который имеет права на создание и управление ролью IAM.

2. Перейдите в консоль сервиса IAM.

3. Создайте новую роль IAM со следующими политиками IAM и доверия. Замените `{ClickHouse_IAM_ARN}` на ARN роли IAM, принадлежащей вашему экземпляру ClickHouse.

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

**Политика IAM**

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

4. После создания скопируйте новый **IAM Role Arn**, он потребуется для доступа к вашему S3-бакету.


## Доступ к бакету S3 с ролью ClickHouseAccess \{#access-your-s3-bucket-with-the-clickhouseaccess-role\}

ClickHouse Cloud позволяет указывать параметр `extra_credentials` в S3 table function.
Ниже приведён пример того, как выполнить запрос, используя только что созданную роль, скопированную выше.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

Ниже приведён пример запроса, который использует `role_session_name` как общий секрет для выборки данных из бакета.
Если значение `role_session_name` указано неверно, операция завершится с ошибкой.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
Мы рекомендуем размещать исходное хранилище S3 в том же регионе, что и ваш сервис ClickHouse Cloud, чтобы снизить затраты на передачу данных.
Для получения дополнительной информации см. раздел [S3 pricing](https://aws.amazon.com/s3/pricing/)
:::


## Расширенное управление действиями \{#advanced-action-control\}

Для более строгого контроля доступа можно ограничить политику S3‑бакета так, чтобы она принимала только запросы, исходящие из конечных точек VPC ClickHouse Cloud, с использованием условия [`aws:SourceVpce`](https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies-vpc-endpoint.html#example-bucket-policies-restrict-accesss-vpc-endpoint). Чтобы получить конечные точки VPC для вашего региона ClickHouse Cloud, откройте терминал и выполните:

```bash
# Replace <your-region> with your ClickHouse Cloud region
curl -s https://api.clickhouse.cloud/static-ips.json | jq -r '.aws[] | select(.region == "<your-region>") | .s3_endpoints[]'
```

Затем добавьте правило Deny в политику IAM с полученными конечными точками:

```json
{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "VisualEditor0",
                "Effect": "Allow",
                "Action": [
                    "s3:List*",
                    "s3:Get*"
                ],
                "Resource": [
                    "arn:aws:s3:::{BUCKET_NAME}",
                    "arn:aws:s3:::{BUCKET_NAME}/*"
                ]
            },
            {
                "Sid": "VisualEditor3",
                "Effect": "Deny",
                "Action": [
                    "s3:GetObject"
                ],
                "Resource": "*",
                "Condition": {
                    "StringNotEquals": {
                        "aws:SourceVpce": [
                            "{ClickHouse VPC ID from your S3 region}",
                            "{ClickHouse VPC ID from your S3 region}",
                            "{ClickHouse VPC ID from your S3 region}"
                        ]
                    }
                }
            }
        ]
}
```

Дополнительную информацию о доступе к конечным точкам служб ClickHouse Cloud см. в разделе [Cloud IP Addresses](/manage/data-sources/cloud-endpoints-api).
