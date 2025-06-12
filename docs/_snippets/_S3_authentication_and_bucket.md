
<details>
  <summary>Create S3 buckets and an IAM user</summary>

This article demonstrates the basics of how to configure an AWS IAM user, create an S3 bucket and configure ClickHouse to use the bucket as an S3 disk. You should work with your security team to determine the permissions to be used, and consider these as a starting point.

### Create an AWS IAM user 
In this procedure, we'll be creating a service account user, not a login user.
1.  Log into the AWS IAM Management Console.

2. In "users", select **Add users**



3. Enter the user name and set the credential type to **Access key - Programmatic access** and select **Next: Permissions**



4. Do not add the user to any group; select **Next: Tags**



5. Unless you need to add any tags, select **Next: Review**



6. Select **Create User**

    :::note
    The warning message stating that the user has no permissions can be ignored; permissions will be granted on the bucket for the user in the next section
    :::



7. The user is now created; click on **show** and copy the access and secret keys.
:::note
Save the keys somewhere else; this is the only time that the secret access key will be available.
:::



8. Click close, then find the user in the users screen.



9. Copy the ARN (Amazon Resource Name) and save it for use when configuring the access policy for the bucket.



### Create an S3 bucket 
1. In the S3 bucket section, select **Create bucket**



2. Enter a bucket name, leave other options default
:::note
The bucket name must be unique across AWS, not just the organization, or it will emit an error.
:::
3. Leave `Block all Public Access` enabled; public access is not needed.



4. Select **Create Bucket** at the bottom of the page



5. Select the link, copy the ARN, and save it for use when configuring the access policy for the bucket.

6. Once the bucket has been created, find the new S3 bucket in the S3 buckets list and select the link



7. Select **Create folder**



8. Enter a folder name that will be the target for the ClickHouse S3 disk and select **Create folder**



9. The folder should now be visible on the bucket list



10. Select the checkbox for the new folder and click on **Copy URL** Save the URL copied to be used in the ClickHouse storage configuration in the next section.



11. Select the **Permissions** tab and click on the **Edit** button in the **Bucket Policy** section



12. Add a bucket policy, example below:
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
You should work with your security team to determine the permissions to be used, consider these as a starting point.
For more information on Policies and settings, refer to AWS documentation:
https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
:::

13. Save the policy configuration.

</details>
