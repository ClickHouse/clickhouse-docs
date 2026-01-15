---
title: '如何创建 AWS IAM 用户和 S3 存储桶'
description: '如何创建 AWS IAM 用户和 S3 存储桶。'
keywords: ['AWS', 'IAM', 'S3 存储桶']
slug: /integrations/s3/creating-iam-user-and-s3-bucket
sidebar_label: '如何创建 AWS IAM 用户和 S3 存储桶'
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

> 本指南将向您展示如何在 AWS 中创建 IAM 用户和 S3 存储桶，
> 这是将备份写入 S3 或将 ClickHouse 配置为在 S3 上存储数据的先决条件步骤


## 创建 AWS IAM 用户 {#create-an-aws-iam-user}

在本步骤中，我们将创建一个服务账户用户，而不是登录用户。

1.  登录 AWS IAM 管理控制台。

2. 在 `Users` 选项卡中，选择 `Create user`

<Image size="lg" img={s3_1} alt="AWS IAM 管理控制台 - 添加新用户"/>

3. 输入用户名

<Image size="lg" img={s3_2} alt="AWS IAM 管理控制台 - 添加新用户" />

4. 选择 `Next`

<Image size="lg" img={s3_3} alt="AWS IAM 管理控制台 - 添加新用户" />

5. 选择 `Next`

<Image size="lg" img={s3_4} alt="AWS IAM 管理控制台 - 添加新用户" />

6. 选择 `Create user`

用户已创建。
单击新创建的用户

<Image size="lg" img={s3_5} alt="AWS IAM 管理控制台 - 添加新用户" />

7. 选择 `Create access key`

<Image size="lg" img={s3_6} alt="AWS IAM 管理控制台 - 添加新用户" />

8. 选择 `Application running outside AWS`

<Image size="lg" img={s3_7} alt="AWS IAM 管理控制台 - 添加新用户" />

9. 选择 `Create access key`

<Image size="lg" img={s3_8} alt="AWS IAM 管理控制台 - 添加新用户" />

10. 将访问密钥 ID 和密钥下载为 .csv 文件，以便后续使用

<Image size="lg" img={s3_9} alt="AWS IAM 管理控制台 - 添加新用户" />

## 创建一个 S3 bucket {#create-an-s3-bucket}

1. 在 S3 bucket 部分选择 **Create bucket**

<Image size="lg" img={s3_10} alt="AWS IAM Management Console - Adding a new user" />

2. 输入一个 bucket 名称，其余选项保持默认

<Image size="lg" img={s3_11} alt="AWS IAM Management Console - Adding a new user" />

:::note
bucket 名称在整个 AWS 账号空间中必须唯一，而不仅仅是在你的组织内，否则会报错。
:::

3. 保持启用 `Block all Public Access`；不需要公共访问。

<Image size="lg" img={s3_12} alt="AWS IAM Management Console - Adding a new user" />

4. 在页面底部选择 **Create Bucket**

<Image size="lg" img={s3_13} alt="AWS IAM Management Console - Adding a new user" />

5. 点击该链接，复制 ARN，并保存，以便在配置该 bucket 的访问策略时使用

<Image size="lg" img={s3_14} alt="AWS IAM Management Console - Adding a new user" />

6. 创建 bucket 后，在 S3 buckets 列表中找到新的 S3 bucket，并选择该 bucket 名称，这会打开如下所示的页面：

<Image size="lg" img={s3_15} alt="AWS IAM Management Console - Adding a new user" />

7. 选择 `Create folder`

8. 输入一个文件夹名称，该文件夹将作为 ClickHouse S3 磁盘或备份的目标，然后在页面底部选择 `Create folder`

<Image size="lg" img={s3_16} alt="AWS IAM Management Console - Adding a new user" />

9. 现在应当能在 bucket 列表中看到该文件夹

<Image size="lg" img={s3_17} alt="AWS IAM Management Console - Adding a new user" />

10. 勾选新建文件夹前的复选框并点击 `Copy URL`。保存该 URL，以便在下一节中用于 ClickHouse 存储配置。

<Image size="lg" img={s3_18} alt="AWS IAM Management Console - Adding a new user" />

11. 选择 **Permissions** 选项卡，然后在 **Bucket Policy** 部分点击 **Edit** 按钮

<Image size="lg" img={s3_19} alt="AWS IAM Management Console - Adding a new user" />

12. 添加一个 bucket policy，示例如下

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

:::note
上述策略允许对该 bucket 执行所有操作
:::

| Parameter | Description         | Example Value                                                                            |
| --------- | ------------------- | ---------------------------------------------------------------------------------------- |
| Version   | 策略解释器的版本，保持不变       | 2012-10-17                                                                               |
| Sid       | 用户自定义的策略 ID         | abc123                                                                                   |
| Effect    | 是否允许或拒绝用户请求         | Allow                                                                                    |
| Principal | 被允许访问的账号或用户         | arn:aws:iam::782985192762:user/docs-s3-user                                              |
| Action    | 在该 bucket 上允许执行的操作  | s3:*                                                                                     |
| Resource  | 该 bucket 中允许执行操作的资源 | &quot;arn:aws:s3:::ch-docs-s3-bucket&quot;, &quot;arn:aws:s3:::ch-docs-s3-bucket/*&quot; |

:::note
应与安全团队协作确定要使用的权限，可将这些示例视为起点。
有关策略和设置的更多信息，请参阅 AWS 文档：
https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
:::

13. 保存策略配置
