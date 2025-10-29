---
title: 'How to create an AWS IAM user and S3 bucket'
description: 'How to create an AWS IAM user and S3 bucket.'
keywords: ['AWS', 'IAM', 'S3 bucket']
slug: /integrations/s3/creating-iam-user-and-s3-bucket
sidebar_label: 'How to create an AWS IAM user and S3 bucket'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import s3_1 from '@site/static/images/_snippets/s3/2025/s3-1.png';
import s3_2 from '@site/static/images/_snippets/s3/2025/s3-2.png';
import s3_3 from '@site/static/images/_snippets/s3/2025/s3-3.png';
import s3_4 from '@site/static/images/_snippets/s3/2025/s3-4.png';
import s3_5 from '@site/static/images/_snippets/s3/2025/s3-5.png';
import s3_6 from '@site/static/images/_snippets/s3/2025/s3-6.png';
import s3_7 from '@site/static/images/_snippets/s3/2025/s3-7.png';
import s3_8 from '@site/static/images/_snippets/s3/2025/s3-8.png';
import s3_9 from '@site/static/images/_snippets/s3/2025/s3-9.png';
import s3_10 from '@site/static/images/_snippets/s3/2025/s3-10.png';
import s3_11 from '@site/static/images/_snippets/s3/2025/s3-11.png';
import s3_12 from '@site/static/images/_snippets/s3/2025/s3-12.png';
import s3_13 from '@site/static/images/_snippets/s3/2025/s3-13.png';
import s3_14 from '@site/static/images/_snippets/s3/2025/s3-14.png';
import s3_15 from '@site/static/images/_snippets/s3/2025/s3-15.png';
import s3_16 from '@site/static/images/_snippets/s3/2025/s3-16.png';
import s3_17 from '@site/static/images/_snippets/s3/2025/s3-17.png';
import s3_18 from '@site/static/images/_snippets/s3/2025/s3-18.png';
import s3_19 from '@site/static/images/_snippets/s3/2025/s3-19.png';
import s3_20 from '@site/static/images/_snippets/s3/2025/s3-20.png';

> This guide shows you how you can set up an IAM user and S3 bucket in AWS,
> a prerequisite step for taking backups to S3 or configuring ClickHouse to
> store data on S3

## Create an AWS IAM user {#create-an-aws-iam-user}

In this procedure, we'll be creating a service account user, not a login user.

1.  Log into the AWS IAM Management Console.

2. In the `Users` tab, select `Create user`

<Image size="lg" img={s3_1} alt="AWS IAM Management Console - Adding a new user"/>

3. Enter a user-name

<Image size="lg" img={s3_2} alt="AWS IAM Management Console - Adding a new user" />

4. Select `Next`

<Image size="lg" img={s3_3} alt="AWS IAM Management Console - Adding a new user" />

5. Select `Next`

<Image size="lg" img={s3_4} alt="AWS IAM Management Console - Adding a new user" />

6. Select `Create user`

The user is now created.
Click on the newly created user

<Image size="lg" img={s3_5} alt="AWS IAM Management Console - Adding a new user" />

7. Select `Create access key`

<Image size="lg" img={s3_6} alt="AWS IAM Management Console - Adding a new user" />

8. Select `Application running outside AWS`

<Image size="lg" img={s3_7} alt="AWS IAM Management Console - Adding a new user" />

9. Select `Create access key`

<Image size="lg" img={s3_8} alt="AWS IAM Management Console - Adding a new user" />

10. Download your access key and secret as a .csv for use later

<Image size="lg" img={s3_9} alt="AWS IAM Management Console - Adding a new user" />

## Create an S3 bucket {#create-an-s3-bucket}

1. In the S3 bucket section, select **Create bucket**

<Image size="lg" img={s3_10} alt="AWS IAM Management Console - Adding a new user" />

2. Enter a bucket name, leave other options default

<Image size="lg" img={s3_11} alt="AWS IAM Management Console - Adding a new user" />

:::note
The bucket name must be unique across AWS, not just the organization, or it will emit an error.
:::

3. Leave `Block all Public Access` enabled; public access is not needed.

<Image size="lg" img={s3_12} alt="AWS IAM Management Console - Adding a new user" />

4. Select **Create Bucket** at the bottom of the page

<Image size="lg" img={s3_13} alt="AWS IAM Management Console - Adding a new user" />

5. Select the link, copy the ARN, and save it for use when configuring the access policy for the bucket

<Image size="lg" img={s3_14} alt="AWS IAM Management Console - Adding a new user" />

6. Once the bucket has been created, find the new S3 bucket in the S3 buckets list and select the bucket name which will take you to the page shown below:

<Image size="lg" img={s3_15} alt="AWS IAM Management Console - Adding a new user" />

7. Select `Create folder`

8. Enter a folder name that will be the target for the ClickHouse S3 disk or backup and select `Create folder` at the bottom of the page

<Image size="lg" img={s3_16} alt="AWS IAM Management Console - Adding a new user" />

9. The folder should now be visible on the bucket list

<Image size="lg" img={s3_17} alt="AWS IAM Management Console - Adding a new user" />

10. Select the checkbox for the new folder and click on `Copy URL`. Save the URL for use in the ClickHouse storage configuration in the next section.

<Image size="lg" img={s3_18} alt="AWS IAM Management Console - Adding a new user" />

11. Select the **Permissions** tab and click on the **Edit** button in the **Bucket Policy** section

<Image size="lg" img={s3_19} alt="AWS IAM Management Console - Adding a new user" />

12. Add a bucket policy, example below

```json
{
    "Version": "2012-10-17",
    "Id": "Policy123456",
    "Statement": [
        {
            "Sid": "abc123",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::782985192762:user/docs-s3-user"
            },
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::ch-docs-s3-bucket",
                "arn:aws:s3:::ch-docs-s3-bucket/*"
            ]
        }
    ]
}
```

|Parameter | Description | Example Value |
|----------|-------------|----------------|
|Version | Version of the policy interpreter, leave as-is | 2012-10-17 |
|Sid | User-defined policy id | abc123 |
|Effect | Whether user requests will be allowed or denied | Allow |
|Principal | The accounts or user that will be allowed | arn:aws:iam::782985192762:user/docs-s3-user |
|Action | What operations are allowed on the bucket| s3:*|
|Resource | Which resources in the bucket will operations be allowed in | "arn:aws:s3:::ch-docs-s3-bucket", "arn:aws:s3:::ch-docs-s3-bucket/*" |

:::note
You should work with your security team to determine the permissions to be used, consider these as a starting point.
For more information on Policies and settings, refer to AWS documentation:
https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
:::

13. Save the policy configuration
