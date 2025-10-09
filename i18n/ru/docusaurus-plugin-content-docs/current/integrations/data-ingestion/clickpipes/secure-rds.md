---
'slug': '/integrations/clickpipes/secure-rds'
'sidebar_label': 'AWS IAM DB Authentication (RDS/Aurora)'
'title': 'AWS IAM DB Authentication (RDS/Aurora)'
'description': 'Эта статья демонстрирует, как клиенты ClickPipes могут использовать
  контроль доступа на основе ролей для аутентификации с Amazon RDS/Aurora и безопасного
  доступа к своей базе данных.'
'doc_type': 'guide'
---
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

Эта статья демонстрирует, как клиенты ClickPipes могут использовать контроль доступа на основе ролей для аутентификации с Amazon Aurora и RDS и безопасного доступа к своим базам данных.

:::warning
Для AWS RDS Postgres и Aurora Postgres вы можете запускать только `Initial Load Only` ClickPipes из-за ограничений аутентификации AWS IAM DB.

Для MySQL и MariaDB это ограничение не применяется, и вы можете запускать как `Initial Load Only`, так и `CDC` ClickPipes.
:::

## Настройка {#setup}

### Получение Arn роли IAM сервиса ClickHouse {#obtaining-the-clickhouse-service-iam-role-arn}

1 - Войдите в свой облачный аккаунт ClickHouse.

2 - Выберите сервис ClickHouse, для которого хотите создать интеграцию.

3 - Выберите вкладку **Настройки**.

4 - Прокрутите вниз до раздела **Информация о сетевой безопасности** в нижней части страницы.

5 - Скопируйте значение **ID роли сервиса (IAM)**, относящееся к сервису, как показано ниже.

<Image img={secures3_arn} alt="Secure S3 ARN" size="lg" border/>

Давайте назовем это значение `{ClickHouse_IAM_ARN}`. Это роль IAM, которая будет использоваться для доступа к вашему экземпляру RDS/Aurora.

### Настройка экземпляра RDS/Aurora {#configuring-the-rds-aurora-instance}

#### Включение аутентификации IAM DB {#enabling-iam-db-authentication}
1. Войдите в свою учетную запись AWS и перейдите к экземпляру RDS, который хотите настроить.
2. Нажмите кнопку **Изменить**.
3. Прокрутите вниз до раздела **Аутентификация базы данных**.
4. Включите опцию **Аутентификация базы данных по паролю и IAM**.
5. Нажмите кнопку **Продолжить**.
6. Просмотрите изменения и выберите опцию **Применить немедленно**.

#### Получение ID ресурса RDS/Aurora {#obtaining-the-rds-resource-id}

1. Войдите в свою учетную запись AWS и перейдите к экземпляру RDS/Aurora, который хотите настроить.
2. Нажмите на вкладку **Конфигурация**.
3. Обратите внимание на значение **ID ресурса**. Оно должно выглядеть как `db-xxxxxxxxxxxxxx`. Давайте назовем это значение `{RDS_RESOURCE_ID}`. Это ID ресурса, который будет использоваться в политике IAM для предоставления доступа к экземпляру RDS.

#### Настройка пользователя базы данных {#setting-up-the-database-user}

##### PostgreSQL {#setting-up-the-database-user-postgres}

1. Подключитесь к вашему экземпляру RDS/Aurora и создайте нового пользователя базы данных с помощью следующей команды:
```sql
CREATE USER clickpipes_iam_user; 
GRANT rds_iam TO clickpipes_iam_user;
```
2. Следуйте остальным шагам в [руководстве по настройке источника PostgreSQL](postgres/source/rds) для настройки вашего экземпляра RDS для ClickPipes.

##### MySQL / MariaDB {#setting-up-the-database-user-mysql}

1. Подключитесь к вашему экземпляру RDS/Aurora и создайте нового пользователя базы данных с помощью следующей команды:
```sql
CREATE USER 'clickpipes_iam_user' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
```
2. Следуйте остальным шагам в [руководстве по настройке источника MySQL](mysql/source/rds) для настройки вашего экземпляра RDS/Aurora для ClickPipes.

### Настройка роли IAM {#setting-up-iam-role}

#### Вручную создайте роль IAM. {#manually-create-iam-role}

1 - Войдите в свою учетную запись AWS в веб-браузере с пользователем IAM, у которого есть разрешение на создание и управление ролями IAM.

2 - Перейдите к консоли обслуживания IAM.

3 - Создайте новую роль IAM со следующими политиками IAM и доверия.

Политика доверия (Пожалуйста, замените `{ClickHouse_IAM_ARN}` на IAM Role arn, относящийся к вашему экземпляру ClickHouse):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "{ClickHouse_IAM_ARN}"
      },
      "Action": [
        "sts:AssumeRole",
        "sts:TagSession"
      ]
    }
  ]
}
```

Политика IAM (Пожалуйста, замените `{RDS_RESOURCE_ID}` на ID ресурса вашего экземпляра RDS). Пожалуйста, убедитесь, что вы заменили `{RDS_REGION}` на регион вашего экземпляра RDS/Aurora и `{AWS_ACCOUNT}` на ID вашей учетной записи AWS:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "rds-db:connect"
      ],
      "Resource": [
        "arn:aws:rds-db:{RDS_REGION}:{AWS_ACCOUNT}:dbuser:{RDS_RESOURCE_ID}/clickpipes_iam_user"
      ]
    }
  ]
}
```

4 - Скопируйте новый **IAM Role Arn** после создания. Это то, что необходимо для безопасного доступа к вашей базе данных AWS из ClickPipes. Давайте назовем это `{RDS_ACCESS_IAM_ROLE_ARN}`.

Теперь вы можете использовать эту роль IAM для аутентификации в вашем экземпляре RDS/Aurora из ClickPipes.