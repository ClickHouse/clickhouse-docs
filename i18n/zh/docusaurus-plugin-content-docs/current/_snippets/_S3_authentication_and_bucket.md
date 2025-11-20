import Image from "@theme/IdealImage"
import s3_1 from "@site/static/images/_snippets/s3/s3-1.png"
import s3_2 from "@site/static/images/_snippets/s3/s3-2.png"
import s3_3 from "@site/static/images/_snippets/s3/s3-3.png"
import s3_4 from "@site/static/images/_snippets/s3/s3-4.png"
import s3_5 from "@site/static/images/_snippets/s3/s3-5.png"
import s3_6 from "@site/static/images/_snippets/s3/s3-6.png"
import s3_7 from "@site/static/images/_snippets/s3/s3-7.png"
import s3_8 from "@site/static/images/_snippets/s3/s3-8.png"
import s3_9 from "@site/static/images/_snippets/s3/s3-9.png"
import s3_a from "@site/static/images/_snippets/s3/s3-a.png"
import s3_b from "@site/static/images/_snippets/s3/s3-b.png"
import s3_c from "@site/static/images/_snippets/s3/s3-c.png"
import s3_d from "@site/static/images/_snippets/s3/s3-d.png"
import s3_e from "@site/static/images/_snippets/s3/s3-e.png"
import s3_f from "@site/static/images/_snippets/s3/s3-f.png"
import s3_g from "@site/static/images/_snippets/s3/s3-g.png"
import s3_h from "@site/static/images/_snippets/s3/s3-h.png"

<details>
  <summary>创建 S3 存储桶和 IAM 用户</summary>

本文介绍如何配置 AWS IAM 用户、创建 S3 存储桶以及配置 ClickHouse 使用该存储桶作为 S3 磁盘的基本步骤。您应当与安全团队协作确定所需的权限,本文提供的内容可作为起点参考。

### 创建 AWS IAM 用户 {#create-an-aws-iam-user}

在此过程中,我们将创建服务账户用户,而非登录用户。

1.  登录 AWS IAM 管理控制台。

2.  在"用户"中,选择 **添加用户**

<Image
  size='md'
  img={s3_1}
  alt='AWS IAM 管理控制台 - 添加新用户'
  border
  force
/>

3. 输入用户名并将凭证类型设置为 **访问密钥 - 编程访问**,然后选择 **下一步:权限**

<Image
  size='md'
  img={s3_2}
  alt='为 IAM 用户设置用户名和访问类型'
  border
  force
/>

4. 不要将用户添加到任何组,选择 **下一步:标签**

<Image
  size='md'
  img={s3_3}
  alt='跳过 IAM 用户的组分配'
  border
  force
/>

5. 除非需要添加标签,否则选择 **下一步:审核**

<Image
  size='md'
  img={s3_4}
  alt='跳过 IAM 用户的标签分配'
  border
  force
/>

6. 选择 **创建用户**

   :::note
   可以忽略提示用户没有权限的警告消息,将在下一节中为该用户授予存储桶权限
   :::

<Image
  size='md'
  img={s3_5}
  alt='创建 IAM 用户时显示无权限警告'
  border
  force
/>

7. 用户现已创建,点击 **显示** 并复制访问密钥和私有密钥。
   :::note
   请将密钥保存到其他位置,这是私有访问密钥唯一可获取的时机。
   :::

<Image
  size='md'
  img={s3_6}
  alt='查看并复制 IAM 用户访问密钥'
  border
  force
/>

8. 点击关闭,然后在用户列表中找到该用户。

<Image
  size='md'
  img={s3_7}
  alt='在用户列表中查找新创建的 IAM 用户'
  border
  force
/>

9. 复制 ARN(Amazon 资源名称)并保存,以便在配置存储桶访问策略时使用。

<Image
  size='md'
  img={s3_8}
  alt='复制 IAM 用户的 ARN'
  border
  force
/>

### 创建 S3 存储桶 {#create-an-s3-bucket}

1. 在 S3 存储桶部分,选择 **创建存储桶**

<Image
  size='md'
  img={s3_9}
  alt='开始 S3 存储桶创建过程'
  border
  force
/>

2. 输入存储桶名称,其他选项保持默认值
   :::note
   存储桶名称必须在整个 AWS 中唯一,而不仅仅是在组织内唯一,否则将报错。
   :::
3. 保持 `阻止所有公共访问` 启用状态,无需公共访问权限。


<Image
  size='md'
  img={s3_a}
  alt='配置 S3 存储桶设置并阻止公共访问'
  border
  force
/>

4. 在页面底部选择 **Create Bucket**

<Image size='md' img={s3_b} alt='完成 S3 存储桶创建' border force />

5. 选择链接,复制 ARN,并保存以便在配置存储桶访问策略时使用。

6. 存储桶创建完成后,在 S3 存储桶列表中找到新创建的 S3 存储桶并选择链接

<Image
  size='md'
  img={s3_c}
  alt='在存储桶列表中查找新创建的 S3 存储桶'
  border
  force
/>

7. 选择 **Create folder**

<Image
  size='md'
  img={s3_d}
  alt='在 S3 存储桶中创建新文件夹'
  border
  force
/>

8. 输入将作为 ClickHouse S3 磁盘目标的文件夹名称,然后选择 **Create folder**

<Image
  size='md'
  img={s3_e}
  alt='设置用于 ClickHouse S3 磁盘的文件夹名称'
  border
  force
/>

9. 文件夹现在应该在存储桶列表中可见

<Image
  size='md'
  img={s3_f}
  alt='查看 S3 存储桶中新创建的文件夹'
  border
  force
/>

10. 选中新文件夹的复选框并点击 **Copy URL**,保存复制的 URL 以便在下一节的 ClickHouse 存储配置中使用。

<Image
  size='md'
  img={s3_g}
  alt='复制 S3 文件夹 URL 用于 ClickHouse 配置'
  border
  force
/>

11. 选择 **Permissions** 选项卡,然后在 **Bucket Policy** 部分点击 **Edit** 按钮

<Image
  size='md'
  img={s3_h}
  alt='访问 S3 存储桶策略配置'
  border
  force
/>

12. 添加存储桶策略,示例如下:

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
      "Resource": ["arn:aws:s3:::mars-doc-test", "arn:aws:s3:::mars-doc-test/*"]
    }
  ]
}
```

```response
|参数 | 描述 | 示例值 |
|----------|-------------|----------------|
|Version | 策略解释器版本,保持不变 | 2012-10-17 |
|Sid | 用户定义的策略 ID | abc123 |
|Effect | 用户请求是被允许还是被拒绝 | Allow |
|Principal | 将被允许的账户或用户 | arn:aws:iam::921234567898:user/mars-s3-user |
|Action | 存储桶上允许的操作| s3:*|
|Resource | 存储桶中允许操作的资源 | "arn:aws:s3:::mars-doc-test", "arn:aws:s3:::mars-doc-test/*" |
```

:::note
您应该与安全团队协作确定要使用的权限,可将这些作为起点。
有关策略和设置的更多信息,请参阅 AWS 文档:
https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
:::

13. 保存策略配置。

</details>
