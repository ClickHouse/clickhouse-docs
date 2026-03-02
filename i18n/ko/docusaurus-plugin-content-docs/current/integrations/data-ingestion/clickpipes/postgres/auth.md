---
slug: /integrations/clickpipes/postgres/auth
sidebar_label: 'AWS IAM DB 인증 (RDS/Aurora)'
title: 'AWS IAM DB 인증 (RDS/Aurora)'
description: '이 문서에서는 ClickPipes 고객이 역할 기반 액세스 권한을 활용해 Amazon RDS/Aurora에 인증을 수행하고 데이터베이스에 안전하게 접근하는 방법을 설명합니다.'
doc_type: 'guide'
keywords: ['clickpipes', 'rds', 'security', 'aws', 'private connection']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

이 문서에서는 ClickPipes 고객이 역할 기반 액세스를 활용하여 Amazon Aurora 및 RDS에 대해 인증을 수행하고 데이터베이스에 안전하게 연결하는 방법을 설명합니다.

:::warning
AWS RDS Postgres 및 Aurora Postgres의 경우 AWS IAM DB Authentication의 제한 사항으로 인해 `Initial Load Only` ClickPipes만 실행할 수 있습니다.

MySQL 및 MariaDB에는 이 제한 사항이 적용되지 않으며, `Initial Load Only`와 `CDC` ClickPipes를 모두 실행할 수 있습니다.
:::


## 설정 \{#setup\}

### ClickHouse 서비스 IAM 역할 ARN 가져오기 \{#obtaining-the-clickhouse-service-iam-role-arn\}

1 - ClickHouse Cloud 계정에 로그인합니다.

2 - 통합을 생성하려는 ClickHouse 서비스를 선택합니다.

3 - **Settings** 탭을 선택합니다.

4 - 페이지 하단의 **Network security information** 섹션까지 스크롤합니다.

5 - 아래와 같이 표시된 해당 서비스의 **Service role ID (IAM)** 값을 복사합니다.

<Image img={secures3_arn} alt="Secure S3 ARN" size="lg" border/>

이 값을 `{ClickHouse_IAM_ARN}`이라고 부르겠습니다. 이 IAM 역할은 RDS/Aurora 인스턴스에 액세스하는 데 사용됩니다.

### RDS/Aurora 인스턴스 구성 \{#configuring-the-rds-aurora-instance\}

#### IAM DB 인증 활성화 \{#enabling-iam-db-authentication\}

1. AWS 계정에 로그인한 후 구성하려는 RDS 인스턴스로 이동합니다.
2. **Modify** 버튼을 클릭합니다.
3. 아래로 스크롤하여 **Database authentication** 섹션으로 이동합니다.
4. **Password and IAM database authentication** 옵션을 활성화합니다.
5. **Continue** 버튼을 클릭합니다.
6. 변경 사항을 검토한 후 **Apply immediately** 옵션을 선택합니다.

#### RDS/Aurora 리소스 ID 가져오기 \{#obtaining-the-rds-resource-id\}

1. AWS 계정에 로그인한 후 구성하려는 RDS 인스턴스 또는 Aurora 클러스터로 이동합니다.
2. **Configuration** 탭을 클릭합니다.
3. **Resource ID** 값을 확인합니다. RDS의 경우 `db-xxxxxxxxxxxxxx`, Aurora 클러스터의 경우 `cluster-xxxxxxxxxxxxxx`와 같은 형식입니다. 이 값을 `{RDS_RESOURCE_ID}`라고 하겠습니다. 이 리소스 ID는 IAM 정책에서 해당 RDS 인스턴스에 대한 액세스를 허용하도록 설정할 때 사용됩니다.

#### 데이터베이스 사용자 설정 \{#setting-up-the-database-user\}

##### PostgreSQL \{#setting-up-the-database-user-postgres\}

1. RDS/Aurora 인스턴스에 접속한 후 다음 명령으로 새 데이터베이스 사용자(USER)를 생성합니다:
    ```sql
    CREATE USER clickpipes_iam_user; 
    GRANT rds_iam TO clickpipes_iam_user;
    ```
2. 나머지 단계는 [PostgreSQL 소스 설정 가이드](./source/rds)를 따라 ClickPipes용 RDS 인스턴스를 구성합니다.

##### MySQL / MariaDB \{#setting-up-the-database-user-mysql\}

1. RDS/Aurora 인스턴스에 연결한 다음 다음 명령을 실행하여 새 데이터베이스 사용자를 생성합니다.
    ```sql
    CREATE USER 'clickpipes_iam_user' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
    ```
2. [MySQL 소스 설정 가이드](../mysql/source/rds)의 나머지 단계를 따라 RDS/Aurora 인스턴스를 ClickPipes용으로 구성합니다.

### IAM 역할 설정 \{#setting-up-iam-role\}

#### IAM 역할을 수동으로 생성합니다. \{#manually-create-iam-role\}

1 - IAM 역할을 생성 및 관리할 수 있는 권한이 있는 IAM 사용자로 웹 브라우저에서 AWS 계정에 로그인합니다.

2 - IAM 서비스 콘솔로 이동합니다.

3 - 다음 IAM 및 신뢰 정책을 사용하여 새 IAM 역할을 생성합니다.

신뢰 정책(`{ClickHouse_IAM_ARN}`을(를) 해당 ClickHouse 인스턴스에 연결된 IAM 역할 ARN으로 바꾸십시오):

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

다음 IAM 정책에서 `{RDS_RESOURCE_ID}`를 RDS 인스턴스의 리소스 ID로 교체하십시오. 또한 `{RDS_REGION}`은 RDS/Aurora 인스턴스의 리전으로, `{AWS_ACCOUNT}`는 AWS 계정 ID로 교체해야 합니다:

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

4 - 새로 생성된 **IAM Role ARN**을 복사합니다. 이는 ClickPipes에서 AWS Database에 안전하게 접근하는 데 필요합니다. 이 값을 `{RDS_ACCESS_IAM_ROLE_ARN}`이라고 하겠습니다.

이제 이 IAM 역할을 사용해 ClickPipes에서 RDS/Aurora 인스턴스에 인증할 수 있습니다.
