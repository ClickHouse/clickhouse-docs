---
slug: /integrations/clickpipes/secure-rds
sidebar_label: 'AWS IAM DB Authentication (RDS/Aurora)'
title: 'AWS IAM DB Authentication (RDS/Aurora)'
description: 'This article demonstrates how ClickPipes customers can leverage role-based access to authenticate with Amazon RDS/Aurora and access their database securely.'
doc_type: 'guide'
---

import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

This article demonstrates how ClickPipes customers can leverage role-based access to authenticate with Amazon Aurora and RDS and access their databases securely.

:::warning
For AWS RDS Postgres and Aurora Postgres you can only run `Initial Load Only` ClickPipes due to the limitations of the AWS IAM DB Authentication.

For MySQL and MariaDB, this limitation does not apply, and you can run both `Initial Load Only` and `CDC` ClickPipes.
:::

## Setup {#setup}

### Obtaining the ClickHouse service IAM role Arn {#obtaining-the-clickhouse-service-iam-role-arn}

1 - Login to your ClickHouse cloud account.

2 - Select the ClickHouse service you want to create the integration

3 - Select the **Settings** tab

4 - Scroll down to the **Network security information** section at the bottom of the page

5 - Copy the **Service role ID (IAM)** value belong to the service as shown below.

<Image img={secures3_arn} alt="Secure S3 ARN" size="lg" border/>

Let's call this value `{ClickHouse_IAM_ARN}`. This is the IAM role that will be used to access your RDS/Aurora instance.

### Configuring the RDS/Aurora instance {#configuring-the-rds-aurora-instance}

#### Enabling IAM DB Authentication {#enabling-iam-db-authentication}
1. Login to your AWS Account and navigate to the RDS instance you want to configure.
2. Click on the **Modify** button.
3. Scroll down to the **Database authentication** section.
4. Enable the **Password and IAM database authentication** option.
5. Click on the **Continue** button.
6. Review the changes and click on the **Apply immediately** option.

#### Obtaining the RDS/Aurora Resource ID {#obtaining-the-rds-resource-id}

1. Login to your AWS Account and navigate to the RDS instance/Aurora Cluster you want to configure.
2. Click on the **Configuration** tab.
3. Note the **Resource ID** value. It should look like `db-xxxxxxxxxxxxxx` for RDS or `cluster-xxxxxxxxxxxxxx` for Aurora cluster. Let's call this value `{RDS_RESOURCE_ID}`. This is the resource ID that will be used in the IAM policy to allow access to the RDS instance.

#### Setting up the Database User {#setting-up-the-database-user}

##### PostgreSQL {#setting-up-the-database-user-postgres}

1. Connect to your RDS/Aurora instance and create a new database user with the following command:
    ```sql
    CREATE USER clickpipes_iam_user; 
    GRANT rds_iam TO clickpipes_iam_user;
    ```
2. Follow the rest of the steps in the [PostgreSQL source setup guide](postgres/source/rds) to configure your RDS instance for ClickPipes.

##### MySQL / MariaDB {#setting-up-the-database-user-mysql}

1. Connect to your RDS/Aurora instance and create a new database user with the following command:
    ```sql
    CREATE USER 'clickpipes_iam_user' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
    ```
2. Follow the rest of the steps in the [MySQL source setup guide](mysql/source/rds) to configure your RDS/Aurora instance for ClickPipes.

### Setting up the IAM role {#setting-up-iam-role}

#### Manually create IAM role. {#manually-create-iam-role}

1 - Login to your AWS Account in the web browser with an IAM user that has permission to create & manage IAM role.

2 - Browse to IAM Service Console

3 - Create a new IAM role with the following IAM & Trust policy.

Trust policy (Please replace `{ClickHouse_IAM_ARN}` with the IAM Role arn belong to your ClickHouse instance):

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

IAM policy (Please replace `{RDS_RESOURCE_ID}` with the Resource ID of your RDS instance). Please make sure to replace `{RDS_REGION}` with the region of your RDS/Aurora instance and `{AWS_ACCOUNT}` with your AWS account ID:

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

4 - Copy the new **IAM Role Arn** after creation. This is what needed to access your AWS Database securely from ClickPipes. Let's call this `{RDS_ACCESS_IAM_ROLE_ARN}`.

You can now use this IAM role to authenticate with your RDS/Aurora instance from ClickPipes.
