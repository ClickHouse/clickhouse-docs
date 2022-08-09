---
sidebar_label: Use S3 Object Storage as a ClickHouse disk
description: Configure AWS IAM user, create an S3 bucket, and use that bucket as a ClickHouse disk.
---
# Use S3 Object Storage as a ClickHouse disk

This article demonstrates the basics of how to configure an AWS IAM user, create an S3 bucket and configure ClickHouse to use the bucket as an S3 disk.
You should work with your security team to determine the permissions to be used, and consider these as a starting point.


## Create an AWS IAM user
In this procedure, we'll be creating a service account user, not a login user.
1.  Log into the AWS IAM Management Console.

2. In "users", select `add users`  
![create_iam_user_0](https://user-images.githubusercontent.com/18219420/177866864-871e7bf2-714d-4bc5-9876-ee6833c1e9da.png)

3. Enter the user name and set the credential type to `Access key - Programatic access` and select `Next: Permissions`
![create_iam_user_1](https://user-images.githubusercontent.com/18219420/177867270-18009113-6098-4c36-94ea-a4d61b62461b.png)

4. Do not add the user to any group, select `Next: Tags`
![create_iam_user_2](https://user-images.githubusercontent.com/18219420/177867667-19fcd2f6-5806-4466-8d64-b6de58ba48fa.png)

5. Unless you need to add any tags, select `Next: Review`
![create_iam_user_3](https://user-images.githubusercontent.com/18219420/177867791-1c9340ab-d242-4349-abc0-0ba5cf313566.png)

6. Select `Create User`
:::note
The warning message stating that the user has no permissions can be ignored; permissions will be granted on the bucket for the user in the next section
:::
![create_iam_user_4](https://user-images.githubusercontent.com/18219420/177868141-eabed9bb-087a-4db3-918a-84739e1d7487.png)

7. The user is now created, click on `show` and copy the access and secret keys.
:::note
Save the keys somewhere else, this is the only time that the secret access key will be available.
:::
![create_iam_user_5](https://user-images.githubusercontent.com/18219420/180260372-8f3e7d3d-9c5e-430f-9e86-54079127c7ff.png)

8. Click close, then find the user created in the users screen.
![create_iam_user_6](https://user-images.githubusercontent.com/18219420/177869430-919c4fc2-3226-43ce-ba19-1bd21eab16c1.png)

9. Copy the ARN (Amazon Resource Name) and save for use when configuring the access policy for the bucket.
![create_iam_user_7](https://user-images.githubusercontent.com/18219420/180262876-4d65cf19-4427-4ac7-b68d-1982e4f27610.png)

## Create an S3 bucket
1. In the S3 bucket section, select `Create bucket`
![create_s3_bucket_0](https://user-images.githubusercontent.com/18219420/177871069-041b1d78-7c85-4fdf-ab78-134b71506d9b.png)

2. Enter a bucket name, leave other options default
:::note
The bucket name must be unique across AWS, not just the organization, or it will emit an error.
:::
3. Leave `Block all Public Access` enabled, it is not needed.
![create_s3_bucket_2](https://user-images.githubusercontent.com/18219420/177871668-68460623-cb73-445d-9e2d-0b3393e7f152.png)

4. Select `Create Bucket` at the bottom of the page
![create_s3_bucket_3](https://user-images.githubusercontent.com/18219420/177872284-4c1732d1-c56b-4cea-8f52-049dd341ebfe.png)

5. Select the link and Copy the ARN and save for use when configuring the access policy for the bucket.

6. Once the bucket has been created, find the new S3 bucket in the S3 buckets list and select the link
![create_s3_bucket_4](https://user-images.githubusercontent.com/18219420/177872474-fde2e93f-7920-4f2d-8d3e-4c60c61b115f.png)

7. Select `Create folder`
![create_s3_bucket_5](https://user-images.githubusercontent.com/18219420/177872808-31b90ddb-c276-4f96-baf7-da3987c70244.png)

8. Enter a folder name which will be the target for the ClickHouse S3 disk and select `Create folder`
![create_s3_bucket_6](https://user-images.githubusercontent.com/18219420/177872959-5ba3dd99-7a27-4831-bc8b-f8288c5ae663.png)

9. The folder should now be visible on the bucket list
![create_s3_bucket_7](https://user-images.githubusercontent.com/18219420/180263927-9e95b98e-92bf-4bf7-86f2-b155452d8209.png)

10. Select the checkbox for the new folder and click on `Copy URL`. Save the URL copied to be used in the ClickHouse storage configuration in the next section.
![create_s3_bucket_8](https://user-images.githubusercontent.com/18219420/177873720-85cd708e-f84f-4854-8347-b385e8172da1.png)

11. Select the `Permissions` tab and click on the `Edit` button in the `Bucket Policy` section
![create_s3_bucket_9](https://user-images.githubusercontent.com/18219420/177874477-f0949992-8fbd-4ed4-898b-a0912f11ead9.png)

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

|Parameter | Description | Example Value |
|----------|-------------|----------------|
|Version | Version of the policy interpreter, leave as-is | 2012-10-17 |
|Sid | User-defined policy id | abc123 |
|Effect | Whether user requests will be allowed or denied | Allow |
|Principal | The accounts or user that will be allowed | arn:aws:iam::921234567898:user/mars-s3-user |
|Action | What operations are allowed on the bucket| s3:*|
|Resource | Which resources in the bucket will operations be allowed in | "arn:aws:s3:::mars-doc-test", "arn:aws:s3:::mars-doc-test/*" |

:::note
You should work with your security team to determine the permissions to be used, consider these as a starting point.
For more information on Policies and settings, refer to AWS documentation: 
https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
:::

13. Save the policy configuration.

## Configure ClickHouse to use the S3 bucket as a disk
The following example is based on a Linux Deb package installed as a service with default ClickHouse directories.

1.  Create a new file in the ClickHouse `config.d` directory to store the storage configuration.
```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```
2. Add the following for storage configuration; substituting the bucket path, access key and secret keys from earlier steps
```xml
<clickhouse>
  <storage_configuration>
     <disks>
        <s3_disk>
           <type>s3</type>
           <endpoint>https://mars-doc-test.s3.amazonaws.com/clickhouse3/</endpoint>
           <access_key_id>ABC123</access_key_id>
           <secret_access_key>Abc+123</secret_access_key>
           <metadata_path>/var/lib/clickhouse/disks/s3_disk/</metadata_path>
           <cache_enabled>true</cache_enabled>
           <data_cache_enabled>true</data_cache_enabled>
           <cache_path>/var/lib/clickhouse/disks/s3_disk/cache/</cache_path>
         </s3_disk>
 </disks>
        <policies>
            <s3_main>
                <volumes>
                    <main>
                        <disk>s3_disk</disk>
                    </main>
                </volumes>
            </s3_main>
    </policies>
   </storage_configuration>
</clickhouse>
```

:::note 
The tag `<s3_disk>` within the `<disks>` tag is an arbitrary label. This can be set to something else but the same label must be used in the `<disk>` tab under the `<policies>` tab to reference the disk.
The `<metadata_path>` and `<cache_path>` are recommended to also include the name in the path to be able to identify the locations on disk.
The `<S3_main>` tag is also arbitrary and is the name of the policy which will be used as the identifier storage target when creating resources in ClickHouse.

For more information about using S3:
Integrations Guide: [S3 Backed MergeTree](https://clickhouse.com/docs/en/integrations/s3/s3-merge-tree)
:::

3. Update the owner of the file to the clickhouse user and group
```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```
4. Restart the ClickHouse instance to have the changes take effect.
```bash
service clickhouse-server restart
```

## Testing
1. Log in with the ClickHouse client, something like the following
```bash
clickhouse-client --user default --password ClickHouse123!
```
2. Create a table specifying the new S3 storage policy
```sql
chnode4 :) CREATE TABLE s3_table1
           (
               `id` UInt64,
               `column1` String
           )
           ENGINE = MergeTree
           ORDER BY id
           SETTINGS storage_policy = 's3_main';

CREATE TABLE s3_table1
(
    `id` UInt64,
    `column1` String
)
ENGINE = MergeTree
ORDER BY id
SETTINGS storage_policy = 's3_main'

Query id: fefd97b5-cce5-4fe3-a1d6-8cdda5616451

Ok.

0 rows in set. Elapsed: 0.254 sec.
```

3. Show that the table was created with the correct policy
```sql
chnode4 :) SHOW CREATE TABLE s3_table1;

SHOW CREATE TABLE s3_table1

Query id: e7a00995-351c-41cb-a3aa-272a5849b134

┌─statement──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE default.s3_table1
(
    `id` UInt64,
    `column1` String
)
ENGINE = MergeTree
ORDER BY id
SETTINGS storage_policy = 's3_main', index_granularity = 8192 │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.004 sec.
```
 
4. Insert test rows into the table
```sql
chnode4 :) INSERT INTO s3_table1
           (id, column1)
           VALUES
           (1, 'abc'),
           (2, 'xyz');

INSERT INTO s3_table1 (id, column1) FORMAT Values

Query id: 0265dd92-3890-4d56-9d12-71d4038b85d5

Ok.

2 rows in set. Elapsed: 0.337 sec.
```
5. View the rows
```sql
chnode4 :) SELECT * FROM s3_table1;

SELECT *
FROM s3_table1

Query id: 967a8f0c-3b67-4154-830f-33bd6ad386ce

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ xyz     │
└────┴─────────┘

2 rows in set. Elapsed: 0.284 sec.
```
6.  In the AWS console, navigate to the buckets, select the new one and the folder. 
You should see something like the following:
![create_s3_bucket_10](https://user-images.githubusercontent.com/18219420/177881470-b8a14d62-f4a6-466f-8a86-95390623f25f.png)

##  Summary
This article provided simple step-by-step instructions on configuring AWS S3 bucket for access and use as a disk for ClickHouse. 

