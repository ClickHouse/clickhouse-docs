
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
  <summary>创建 S3 存储桶和 IAM 用户</summary>

本文演示了如何配置 AWS IAM 用户、创建 S3 存储桶，以及如何配置 ClickHouse 以使用该存储桶作为 S3 磁盘的基本步骤。您应该与您的安全团队合作，以确定使用的权限，并将这些视为起点。

### 创建 AWS IAM 用户 {#create-an-aws-iam-user}
在此过程中，我们将创建一个服务账户用户，而不是登录用户。
1. 登录到 AWS IAM 管理控制台。

2. 在“用户”中，选择 **添加用户**

<img src={s3_1} alt="create_iam_user_0"/>

3. 输入用户名并将凭证类型设置为 **访问密钥 - 程序化访问**，然后选择 **下一步：权限**

<img src={s3_2} alt="create_iam_user_1"/>

4. 不要将用户添加到任何组；选择 **下一步：标签**

<img src={s3_3} alt="create_iam_user_2"/>

5. 除非您需要添加任何标签，否则选择 **下一步：审核**

<img src={s3_4} alt="create_iam_user_3"/>

6. 选择 **创建用户**

    :::note
    可以忽略用户没有权限的警告消息；在下一部分将为用户在存储桶上授予权限。
    :::

<img src={s3_5} alt="create_iam_user_4"/>

7. 现在已创建用户；点击 **显示** 并复制访问和密钥。

:::note
请将密钥保存在其他地方；这是唯一一次可以使用密钥访问的时间。
:::

<img src={s3_6} alt="create_iam_user_5"/>

8. 点击关闭，然后在用户屏幕中找到该用户。

<img src={s3_7} alt="create_iam_user_6"/>

9. 复制 ARN（Amazon 资源名称），并将其保存以备配置存储桶的访问策略时使用。

<img src={s3_8} alt="create_iam_user_7"/>

### 创建 S3 存储桶 {#create-an-s3-bucket}
1. 在 S3 存储桶部分，选择 **创建存储桶**

<img src={s3_9} alt="create_s3_bucket_0"/>

2. 输入存储桶名称，其他选项保持默认
:::note
存储桶名称在 AWS 中必须是唯一的，而不仅仅是在组织中，否则会导致错误。
:::
3. 保持 `阻止所有公共访问` 启用；不需要公共访问。

<img src={s3_a} alt="create_s3_bucket_2"/>

4. 选择页面底部的 **创建存储桶**

<img src={s3_b} alt="create_s3_bucket_3"/>

5. 选择链接，复制 ARN，并将其保存以备配置存储桶的访问策略时使用。

6. 一旦存储桶创建完成，在 S3 存储桶列表中找到新的 S3 存储桶并选择链接。

<img src={s3_c} alt="create_s3_bucket_4"/>

7. 选择 **创建文件夹**

<img src={s3_d} alt="create_s3_bucket_5"/>

8. 输入一个文件夹名称，该名称将作为 ClickHouse S3 磁盘的目标，并选择 **创建文件夹**

<img src={s3_e} alt="create_s3_bucket_6"/>

9. 该文件夹现在应在存储桶列表中可见。

<img src={s3_f} alt="create_s3_bucket_7"/>

10. 选择新文件夹的复选框，然后单击 **复制 URL**。保存复制的 URL，以备在下一部分中用于 ClickHouse 存储配置。

<img src={s3_g} alt="create_s3_bucket_8"/>

11. 选择 **权限** 选项卡，并在 **存储桶策略** 部分中单击 **编辑** 按钮。

<img src={s3_h} alt="create_s3_bucket_9"/>

12. 添加存储桶策略，示例如下：
```json
{
	"Version": "2012-10-17",
	"Id": "Policy123456",
	"Statement": [
		{
			"Sid": "abc123",
			"Effect": "Allow",
			"Principal": {
				"AWS": "arn:aws:iam::921234567898:user/mars-s3-user"
			},
			"Action": "s3:*",
			"Resource": [
				"arn:aws:s3:::mars-doc-test",
				"arn:aws:s3:::mars-doc-test/*"
			]
		}
	]
}
```

```response
| 参数 | 描述 | 示例值 |
|------|------|---------|
| Version | 策略解释器的版本，保持原样 | 2012-10-17 |
| Sid | 用户定义的策略 ID | abc123 |
| Effect | 是否允许或拒绝用户请求 | Allow |
| Principal | 将被允许的账户或用户 | arn:aws:iam::921234567898:user/mars-s3-user |
| Action | 对存储桶允许执行的操作 | s3:* |
| Resource | 在存储桶中允许的操作的资源 | "arn:aws:s3:::mars-doc-test", "arn:aws:s3:::mars-doc-test/*" |
```

:::note
您应该与您的安全团队合作以确定要使用的权限，考虑这些作为起点。
有关策略和设置的更多信息，请参阅 AWS 文档：
https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
:::

13. 保存策略配置。

</details>
