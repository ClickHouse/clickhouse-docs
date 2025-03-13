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
  <summary>Create S3 buckets and an IAM user</summary>

This article demonstrates the basics of how to configure an AWS IAM user, create an S3 bucket and configure ClickHouse to use the bucket as an S3 disk. You should work with your security team to determine the permissions to be used, and consider these as a starting point.

### Create an AWS IAM user {#create-an-aws-iam-user}
In this procedure, we'll be creating a service account user, not a login user.
1.  Log into the AWS IAM Management Console.

2. In "users", select **Add users**

<img src={s3_1} alt="create_iam_user_0"/>

3. Enter the user name and set the credential type to **Access key - Programmatic access** and select **Next: Permissions**

<img src={s3_2} alt="create_iam_user_1"/>

4. Do not add the user to any group; select **Next: Tags**

<img src={s3_3} alt="create_iam_user_2"/>

5. Unless you need to add any tags, select **Next: Review**

<img src={s3_4} alt="create_iam_user_3"/>

6. Select **Create User**

    :::note
    The warning message stating that the user has no permissions can be ignored; permissions will be granted on the bucket for the user in the next section
    :::

<img src={s3_5} alt="create_iam_user_4"/>

7. The user is now created; click on **show** and copy the access and secret keys.
:::note
Save the keys somewhere else; this is the only time that the secret access key will be available.
:::

<img src={s3_6} alt="create_iam_user_5"/>

8. Click close, then find the user in the users screen.

<img src={s3_7} alt="create_iam_user_6"/>

9. Copy the ARN (Amazon Resource Name) and save it for use when configuring the access policy for the bucket.

<img src={s3_8} alt="create_iam_user_7"/>

### Create an S3 bucket {#create-an-s3-bucket}
1. In the S3 bucket section, select **Create bucket**

<img src={s3_9} alt="create_s3_bucket_0"/>

2. Enter a bucket name, leave other options default
:::note
The bucket name must be unique across AWS, not just the organization, or it will emit an error.
:::
3. Leave `Block all Public Access` enabled; public access is not needed.

<img src={s3_a} alt="create_s3_bucket_2"/>

4. Select **Create Bucket** at the bottom of the page

<img src={s3_b} alt="create_s3_bucket_3"/>

5. Select the link, copy the ARN, and save it for use when configuring the access policy for the bucket.

6. Once the bucket has been created, find the new S3 bucket in the S3 buckets list and select the link

<img src={s3_c} alt="create_s3_bucket_4"/>

7. Select **Create folder**

<img src={s3_d} alt="create_s3_bucket_5"/>

8. Enter a folder name that will be the target for the ClickHouse S3 disk and select **Create folder**

<img src={s3_e} alt="create_s3_bucket_6"/>

9. The folder should now be visible on the bucket list

<img src={s3_f} alt="create_s3_bucket_7"/>

10. Select the checkbox for the new folder and click on **Copy URL** Save the URL copied to be used in the ClickHouse storage configuration in the next section.

<img src={s3_g} alt="create_s3_bucket_8"/>

11. Select the **Permissions** tab and click on the **Edit** button in the **Bucket Policy** section

<img src={s3_h} alt="create_s3_bucket_9"/>

12. Add a bucket policy, example below:
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
You should work with your security team to determine the permissions to be used, consider these as a starting point.
For more information on Policies and settings, refer to AWS documentation:
https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
:::

13. Save the policy configuration.

</details>
