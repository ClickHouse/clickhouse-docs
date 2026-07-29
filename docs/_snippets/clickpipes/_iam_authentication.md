import CodeBlock from '@theme/CodeBlock';
import Image from '@theme/IdealImage';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';

export const svc = (s) =>
  String(s).toLowerCase() === 'aurora'
    ? { name: 'Aurora', resource: 'cluster', id: 'cluster-xxxxxxxxxxxxxx' }
    : { name: 'RDS', resource: 'instance', id: 'db-xxxxxxxxxxxxxx' };

Instead of a password, you can authenticate the ClickPipes user with an AWS IAM role. This lets ClickPipes connect to your Amazon {svc(props.service).name} {svc(props.service).resource} without storing database credentials.

<VerticalStepper headerLevel="h4">

#### Enable IAM authentication {#enable-iam-authentication}

1. Log in to your AWS account and go to the {svc(props.service).name} {svc(props.service).resource} you want to configure.
2. Click **Modify**.
3. Scroll to the **Database authentication** section.
4. Select **Password and IAM database authentication**.
5. Click **Continue**.
6. Review the changes and select **Apply immediately**.

#### Create the ClickPipes user {#create-database-user}

Create the ClickPipes user with IAM authentication enabled, then grant it the same schema and replication privileges shown above:

{props.engine === 'postgres' && (
  <CodeBlock language="sql">{`CREATE USER clickpipes_iam_user;
GRANT rds_iam TO clickpipes_iam_user;`}</CodeBlock>
)}
{props.engine === 'mysql' && (
  <CodeBlock language="sql">{`CREATE USER 'clickpipes_iam_user' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';`}</CodeBlock>
)}

{props.children}

#### Obtain the ClickHouse service IAM role ARN {#obtaining-the-clickhouse-service-iam-role-arn}

1. Log in to your ClickHouse Cloud account.
2. Select the ClickHouse service you want to connect.
3. Select the **Settings** tab.
4. Scroll to the **Network security information** section at the bottom of the page.
5. Copy the service's **Service role ID (IAM)** value, shown below.

<Image img={secures3_arn} alt="Service role ID (IAM) value in the Network security information section" size="lg" border/>

This value is your `{ClickHouse_IAM_ARN}` — the role ClickPipes uses to access your {svc(props.service).name} {svc(props.service).resource}.

#### Obtain the resource ID {#obtaining-the-rds-resource-id}

1. Log in to your AWS account and go to the {svc(props.service).name} {svc(props.service).resource} you want to configure.
2. Select the **Configuration** tab.
3. Note the **Resource ID** value — it looks like <code>{svc(props.service).id}</code>. This is your `{RDS_RESOURCE_ID}`, which you reference in the permissions policy.

#### Create the IAM role {#manually-create-iam-role}

1. Log in to your AWS account with an IAM user that has permission to create and manage IAM roles.
2. Open the IAM console.
3. Create a new IAM role with the following trust and permissions policies.

   Trust policy (replace `{ClickHouse_IAM_ARN}` with the IAM role ARN of your ClickHouse instance):

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

   Permissions policy (replace `{RDS_RESOURCE_ID}` with the resource ID of your {svc(props.service).name} {svc(props.service).resource}, `{RDS_REGION}` with its region, and `{AWS_ACCOUNT}` with your AWS account ID):

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

4. Once the role is created, copy its ARN. This is your `{RDS_ACCESS_IAM_ROLE_ARN}`.

</VerticalStepper>

You can now use this IAM role to authenticate with your {svc(props.service).name} {svc(props.service).resource} from ClickPipes.
