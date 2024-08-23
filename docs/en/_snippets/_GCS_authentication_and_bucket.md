
<details><summary>Create GCS buckets and an HMAC key</summary>

### ch_bucket_us_east1

![Add a bucket](@site/docs/en/integrations/data-ingestion/s3/images/GCS-bucket-1.png)

### ch_bucket_us_east4

![Add a bucket](@site/docs/en/integrations/data-ingestion/s3/images/GCS-bucket-2.png)

### Generate an Access key

### Create a service account HMAC key and secret

Open **Cloud Storage > Settings > Interoperability** and either choose an existing **Access key**, or **CREATE A KEY FOR A SERVICE ACCOUNT**.  This guide covers the path for creating a new key for a new service account.

![Add a bucket](@site/docs/en/integrations/data-ingestion/s3/images/GCS-create-a-service-account-key.png)

### Add a new service account

If this is a project with no existing service account, **CREATE NEW ACCOUNT**.

![Add a bucket](@site/docs/en/integrations/data-ingestion/s3/images/GCS-create-service-account-0.png)

There are three steps to creating the service account, in the first step give the account a meaningful name, ID, and description.

![Add a bucket](@site/docs/en/integrations/data-ingestion/s3/images/GCS-create-service-account-a.png)

In the Interoperability settings dialog the IAM role **Storage Object Admin** role is recommended; select that role in step two.

![Add a bucket](@site/docs/en/integrations/data-ingestion/s3/images/GCS-create-service-account-2.png)

Step three is optional and not used in this guide.  You may allow users to have these privileges based on your policies.

![Add a bucket](@site/docs/en/integrations/data-ingestion/s3/images/GCS-create-service-account-3.png)

The service account HMAC key will be displayed.  Save this information, as it will be used in the ClickHouse configuration.

![Add a bucket](@site/docs/en/integrations/data-ingestion/s3/images/GCS-guide-key.png)

</details>
