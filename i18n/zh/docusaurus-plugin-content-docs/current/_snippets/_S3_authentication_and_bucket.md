---
null
...
---

import Image from '@theme/IdealImage';
import s3_1 from '@site/static/images/_snippets/s3/s3-1.png';
import s3_2 from '@site/static/images/_snippets/s3/s3-2.png';
import s3_3 from '@site/static/images/_snippets/s3/s3-3.png';
import s3_4 from '@site/static/images/_snippets/s3/s3-4.png';
import s3_5 from '@site/static/images/_snippets/s3/s3-5.png';
import s3_6 from '@site/static/images/_snippets/s3/s3-6.png';
import s3_7 from '@site/static/images/_snippets/s3/s3-7.png';
import s3_8 from '@site/static/images/_snippets/s3/s3-8.png';
import s3_9 from '@site/static/images/_snippets/s3/s3-9.png';
import s3_a from '@site/static/images/_snippets/s3/s3-a.png';
import s3_b from '@site/static/images/_snippets/s3/s3-b.png';
import s3_c from '@site/static/images/_snippets/s3/s3-c.png';
import s3_d from '@site/static/images/_snippets/s3/s3-d.png';
import s3_e from '@site/static/images/_snippets/s3/s3-e.png';
import s3_f from '@site/static/images/_snippets/s3/s3-f.png';
import s3_g from '@site/static/images/_snippets/s3/s3-g.png';
import s3_h from '@site/static/images/_snippets/s3/s3-h.png';

<details>
  <summary>创建 S3 桶和 IAM 用户</summary>

本文演示了如何配置 AWS IAM 用户、创建 S3 桶并配置 ClickHouse 使用该桶作为 S3 磁盘的基本知识。您应该与您的安全团队合作，以确定要使用的权限，并将其视为起点。

### 创建 AWS IAM 用户 {#create-an-aws-iam-user}
在此过程中，我们将创建一个服务账户用户，而不是登录用户。
1. 登录到 AWS IAM 管理控制台。

2. 在“用户”中，选择 **添加用户**

<Image size="md" img={s3_1} alt="AWS IAM 管理控制台 - 添加新用户" border force/>

3. 输入用户名并将凭证类型设置为 **访问密钥 - 编程访问**，然后选择 **下一步：权限**

<Image size="md" img={s3_2} alt="为 IAM 用户设置用户名和访问类型" border force/>

4. 不要将用户添加到任何组中；选择 **下一步：标签**

<Image size="md" img={s3_3} alt="跳过对 IAM 用户的组分配" border force/>

5. 除非您需要添加任何标签，否则选择 **下一步：审核**

<Image size="md" img={s3_4} alt="跳过对 IAM 用户的标签分配" border force/>

6. 选择 **创建用户**

    :::note
    提示信息称用户没有权限可以忽略；用户在下一节将获得桶的权限
    :::

<Image size="md" img={s3_5} alt="创建 IAM 用户时不带权限的警告" border force/>

7. 用户现在已创建；单击 **显示** 并复制访问密钥和秘密密钥。
:::note
请将密钥保存在其他地方；这是唯一一次可以使用的秘密访问密钥。
:::

<Image size="md" img={s3_6} alt="查看和复制 IAM 用户访问密钥" border force/>

8. 单击关闭，然后在用户屏幕中找到该用户。

<Image size="md" img={s3_7} alt="在用户列表中找到新创建的 IAM 用户" border force/>

9. 复制 ARN（Amazon 资源名称）并保存，以便在配置桶的访问策略时使用。

<Image size="md" img={s3_8} alt="复制 IAM 用户的 ARN" border force/>

### 创建 S3 桶 {#create-an-s3-bucket}
1. 在 S3 桶部分，选择 **创建桶**

<Image size="md" img={s3_9} alt="开始 S3 桶创建过程" border force/>

2. 输入桶名称，保持其他选项为默认值
:::note
桶名称在 AWS 中必须是唯一的，而不仅仅是在组织中，否则将发出错误。
:::
3. 保持 `阻止所有公共访问` 启用；不需要公共访问。

<Image size="md" img={s3_a} alt="配置公共访问被阻止的 S3 桶设置" border force/>

4. 选择页面底部的 **创建桶**

<Image size="md" img={s3_b} alt="最终确定 S3 桶创建过程" border force/>

5. 选择链接，复制 ARN，并保存以供在配置桶的访问策略时使用。

6. 一旦桶创建完成，在 S3 桶列表中找到新创建的 S3 桶，并选择链接

<Image size="md" img={s3_c} alt="在桶列表中找到新创建的 S3 桶" border force/>

7. 选择 **创建文件夹**

<Image size="md" img={s3_d} alt="在 S3 桶中创建新文件夹" border force/>

8. 输入一个文件夹名称，该名称将作为 ClickHouse S3 磁盘的目标，然后选择 **创建文件夹**

<Image size="md" img={s3_e} alt="设置 ClickHouse S3 磁盘使用的文件夹名称" border force/>

9. 该文件夹现在应在桶列表中可见

<Image size="md" img={s3_f} alt="查看新创建的 S3 桶中的文件夹" border force/>

10. 选择新文件夹的复选框，然后单击 **复制 URL**。保存复制的 URL，以便在下一节的 ClickHouse 存储配置中使用。

<Image size="md" img={s3_g} alt="复制用于 ClickHouse 配置的 S3 文件夹 URL" border force/>

11. 选择 **权限** 选项卡，然后在 **桶策略** 部分单击 **编辑** 按钮

<Image size="md" img={s3_h} alt="访问 S3 桶策略配置" border force/>

12. 添加桶策略，如下面示例所示：
```json
{
  "Version" : "2012-10-17",
  "Id" : "Policy123456",
  "Statement" : [
    {
      "Sid" : "abc123",
      "Effect" : "Allow",
      "Principal" : {
        "AWS" : "arn:aws:iam::921234567898:user/mars-s3-user"
      },
      "Action" : "s3:*",
      "Resource" : [
        "arn:aws:s3:::mars-doc-test",
        "arn:aws:s3:::mars-doc-test/*"
      ]
    }
  ]
}
```

```response
|Parameter | Description | Example Value |
|----------|-------------|----------------|
|Version | Version of the policy interpreter, leave as-is | 2012-10-17 |
|Sid | User-defined policy id | abc123 |
|Effect | Whether user requests will be allowed or denied | Allow |
|Principal | The accounts or user that will be allowed | arn:aws:iam::921234567898:user/mars-s3-user |
|Action | What operations are allowed on the bucket| s3:*|
|Resource | Which resources in the bucket will operations be allowed in | "arn:aws:s3:::mars-doc-test", "arn:aws:s3:::mars-doc-test/*" |
```

:::note
您应该与您的安全团队合作，以确定要使用的权限，并将其视为起点。
有关策略和设置的更多信息，请参考 AWS 文档：
https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
:::

13. 保存策略配置。

</details>
