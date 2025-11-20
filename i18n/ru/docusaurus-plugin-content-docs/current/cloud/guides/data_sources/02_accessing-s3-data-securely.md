---
slug: /cloud/data-sources/secure-s3
sidebar_label: 'Безопасный доступ к данным в S3'
title: 'Безопасный доступ к данным в S3'
description: 'В этой статье показано, как клиенты ClickHouse Cloud могут использовать ролевую модель доступа для аутентификации в Amazon Simple Storage Service (S3) и безопасной работы со своими данными.'
keywords: ['RBAC', 'Amazon S3', 'authentication']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import secure_s3 from '@site/static/images/cloud/security/secures3.jpg';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';
import s3_output from '@site/static/images/cloud/security/secures3_output.jpg';

В этой статье показано, как клиенты ClickHouse Cloud могут использовать доступ на основе ролей для аутентификации в Amazon Simple Storage Service (S3) и безопасного получения доступа к своим данным.


## Введение {#introduction}

Прежде чем приступить к настройке безопасного доступа к S3, важно понять принцип работы этого механизма. Ниже представлен обзор того, как сервисы ClickHouse могут получать доступ к приватным S3-бакетам, принимая на себя роль в AWS-аккаунте клиента.

<Image
  img={secure_s3}
  size='md'
  alt='Обзор безопасного доступа к S3 с ClickHouse'
/>

Этот подход позволяет клиентам управлять всем доступом к своим S3-бакетам в одном месте (в IAM-политике принимаемой роли), не требуя внесения изменений во все политики бакетов для добавления или удаления доступа.


## Настройка {#setup}

### Получение ARN роли IAM службы ClickHouse {#obtaining-the-clickhouse-service-iam-role-arn}

1 - Войдите в учетную запись ClickHouse Cloud.

2 - Выберите службу ClickHouse, для которой хотите создать интеграцию.

3 - Выберите вкладку **Настройки**.

4 - Прокрутите вниз до раздела **Информация о сетевой безопасности** в нижней части страницы.

5 - Скопируйте значение **Идентификатор роли службы (IAM)** для этой службы, как показано ниже.

<Image
  img={s3_info}
  size='lg'
  alt='Получение ARN роли IAM службы ClickHouse'
  border
/>

### Настройка роли IAM для AssumeRole {#setting-up-iam-assume-role}

#### Вариант 1: Развертывание с помощью стека CloudFormation {#option-1-deploying-with-cloudformation-stack}

1 - Войдите в учетную запись AWS через веб-браузер с помощью пользователя IAM, у которого есть разрешения на создание и управление ролями IAM.

2 - Перейдите по [этой ссылке](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3), чтобы развернуть стек CloudFormation.

3 - Введите (или вставьте) **роль IAM**, принадлежащую службе ClickHouse.

4 - Настройте стек CloudFormation. Ниже приведена дополнительная информация о параметрах.

| Параметр                  | Значение по умолчанию | Описание                                                                                      |
| :------------------------ | :------------------: | :-------------------------------------------------------------------------------------------- |
| RoleName                  | ClickHouseAccess-001 | Имя новой роли, которую ClickHouse Cloud будет использовать для доступа к вашему бакету S3    |
| Role Session Name         |          \*          | Имя сеанса роли можно использовать как общий секрет для дополнительной защиты вашего бакета.  |
| ClickHouse Instance Roles |                      | Список IAM-ролей инстансов ClickHouse, разделенный запятыми, которые могут использовать эту интеграцию Secure S3. |
| Bucket Access             |         Read         | Устанавливает уровень доступа для указанных бакетов.                                          |
| Bucket Names              |                      | Список имен бакетов, разделенный запятыми, к которым у этой роли будет доступ.                |

_Примечание_: Не указывайте полный ARN бакета, а только имя бакета.

5 - Выберите флажок **Я подтверждаю, что AWS CloudFormation может создать ресурсы IAM с пользовательскими именами**.

6 - Нажмите кнопку **Создать стек** в правом нижнем углу.

7 - Убедитесь, что стек CloudFormation завершается без ошибок.

8 - Выберите **Выводы** стека CloudFormation.

9 - Скопируйте значение **RoleArn** для этой интеграции. Это значение требуется для доступа к вашему бакету S3.

<Image
  img={s3_output}
  size='lg'
  alt='Вывод стека CloudFormation, показывающий ARN роли IAM'
  border
/>

#### Вариант 2: Ручное создание роли IAM {#option-2-manually-create-iam-role}

1 - Войдите в учетную запись AWS через веб-браузер с помощью пользователя IAM, у которого есть разрешения на создание и управление ролями IAM.

2 - Перейдите в консоль службы IAM.

3 - Создайте новую роль IAM со следующими политикой IAM и политикой доверия.

Политика доверия (Замените `{ClickHouse_IAM_ARN}` на ARN роли IAM, принадлежащей вашей инстанции ClickHouse):

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

Политика IAM (Замените `{BUCKET_NAME}` на имя вашего бакета):

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

4 - Скопируйте новый **ARN роли IAM** после создания. Это значение требуется для доступа к вашему бакету S3.


## Доступ к S3-бакету с использованием роли ClickHouseAccess {#access-your-s3-bucket-with-the-clickhouseaccess-role}

ClickHouse Cloud предоставляет возможность указывать параметр `extra_credentials` в табличной функции S3. Ниже приведен пример выполнения запроса с использованием созданной выше роли.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

Ниже приведен пример запроса, в котором `role_session_name` используется в качестве общего секрета для получения данных из бакета. Если значение `role_session_name` указано неверно, операция завершится с ошибкой.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
Рекомендуется размещать исходный S3-бакет в том же регионе, что и сервис ClickHouse Cloud, чтобы снизить расходы на передачу данных. Подробнее см. в разделе [Тарифы S3](https://aws.amazon.com/s3/pricing/)
:::
