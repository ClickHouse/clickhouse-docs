---
'slug': '/integrations/clickpipes/secure-rds'
'sidebar_label': 'AWS IAM DB 인증 (RDS/Aurora)'
'title': 'AWS IAM DB 인증 (RDS/Aurora)'
'description': '이 문서에서는 ClickPipes 고객이 Amazon RDS/Aurora에 대해 역할 기반 액세스를 활용하여 인증하고
  데이터베이스에 안전하게 액세스하는 방법을 보여줍니다.'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'rds'
- 'security'
- 'aws'
- 'private connection'
---

import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

This article demonstrates how ClickPipes customers can leverage role-based access to authenticate with Amazon Aurora and RDS and access their databases securely.

:::warning
AWS RDS Postgres 및 Aurora Postgres의 경우 AWS IAM DB 인증의 제한으로 인해 `Initial Load Only` ClickPipes만 실행할 수 있습니다.

MySQL 및 MariaDB의 경우 이 제한은 적용되지 않으며, `Initial Load Only`와 `CDC` ClickPipes를 모두 실행할 수 있습니다.
:::

## Setup {#setup}

### Obtaining the ClickHouse service IAM role Arn {#obtaining-the-clickhouse-service-iam-role-arn}

1 - ClickHouse 클라우드 계정에 로그인합니다.

2 - 통합을 생성할 ClickHouse 서비스를 선택합니다.

3 - **Settings** 탭을 선택합니다.

4 - 페이지 하단의 **Network security information** 섹션으로 스크롤합니다.

5 - 아래와 같이 서비스에 해당하는 **Service role ID (IAM)** 값을 복사합니다.

<Image img={secures3_arn} alt="Secure S3 ARN" size="lg" border/>

이 값을 `{ClickHouse_IAM_ARN}`이라고 부르겠습니다. 이 IAM 역할은 RDS/Aurora 인스턴스에 접근하는 데 사용됩니다.

### Configuring the RDS/Aurora instance {#configuring-the-rds-aurora-instance}

#### Enabling IAM DB Authentication {#enabling-iam-db-authentication}
1. AWS 계정에 로그인하고 구성할 RDS 인스턴스로 이동합니다.
2. **Modify** 버튼을 클릭합니다.
3. **Database authentication** 섹션으로 스크롤합니다.
4. **Password and IAM database authentication** 옵션을 활성화합니다.
5. **Continue** 버튼을 클릭합니다.
6. 변경 사항을 검토하고 **Apply immediately** 옵션을 클릭합니다.

#### Obtaining the RDS/Aurora Resource ID {#obtaining-the-rds-resource-id}

1. AWS 계정에 로그인하고 구성할 RDS 인스턴스/Aurora 클러스터로 이동합니다.
2. **Configuration** 탭을 클릭합니다.
3. **Resource ID** 값을 기록합니다. RDS의 경우 `db-xxxxxxxxxxxxxx` 또는 Aurora 클러스터의 경우 `cluster-xxxxxxxxxxxxxx` 형식이어야 합니다. 이 값을 `{RDS_RESOURCE_ID}`라고 부르겠습니다. 이 리소스 ID는 IAM 정책에서 RDS 인스턴스에 대한 접근을 허용하기 위해 사용됩니다.

#### Setting up the Database User {#setting-up-the-database-user}

##### PostgreSQL {#setting-up-the-database-user-postgres}

1. RDS/Aurora 인스턴스에 연결하고 다음 명령어로 새로운 데이터베이스 사용자를 생성합니다:
```sql
CREATE USER clickpipes_iam_user; 
GRANT rds_iam TO clickpipes_iam_user;
```
2. [PostgreSQL source setup guide](postgres/source/rds)의 나머지 단계를 따라 RDS 인스턴스를 ClickPipes에 맞게 구성합니다.

##### MySQL / MariaDB {#setting-up-the-database-user-mysql}

1. RDS/Aurora 인스턴스에 연결하고 다음 명령어로 새로운 데이터베이스 사용자를 생성합니다:
```sql
CREATE USER 'clickpipes_iam_user' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
```
2. [MySQL source setup guide](mysql/source/rds)의 나머지 단계를 따라 RDS/Aurora 인스턴스를 ClickPipes에 맞게 구성합니다.

### Setting up the IAM role {#setting-up-iam-role}

#### Manually create IAM role. {#manually-create-iam-role}

1 - IAM 역할을 생성 및 관리할 수 있는 권한이 있는 IAM 사용자로 웹 브라우저에서 AWS 계정에 로그인합니다.

2 - IAM 서비스 콘솔로 이동합니다.

3 - 다음 IAM 및 신뢰 정책으로 새로운 IAM 역할을 생성합니다.

신뢰 정책 (이곳에서 `{ClickHouse_IAM_ARN}`을 ClickHouse 인스턴스에 속하는 IAM 역할 ARN으로 교체하세요):

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

IAM 정책 (여기서 `{RDS_RESOURCE_ID}`을 RDS 인스턴스의 리소스 ID로 교체하세요). `{RDS_REGION}`을 RDS/Aurora 인스턴스의 지역으로, `{AWS_ACCOUNT}`을 AWS 계정 ID로 교체하는 것을 잊지 마세요:

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

4 - 생성 후 새 **IAM Role Arn**을 복사합니다. 이것은 ClickPipes에서 AWS 데이터베이스에 안전하게 접근하는 데 필요합니다. 이 값을 `{RDS_ACCESS_IAM_ROLE_ARN}`이라고 부르겠습니다.

이제 이 IAM 역할을 사용하여 ClickPipes에서 RDS/Aurora 인스턴스에 인증할 수 있습니다.
