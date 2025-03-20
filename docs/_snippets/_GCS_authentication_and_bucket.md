import GCS_bucket_1 from '@site/static/images/integrations/data-ingestion/s3/GCS-bucket-1.png';
import GCS_bucket_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-bucket-2.png';
import GCS_create_service_account_key from '@site/static/images/integrations/data-ingestion/s3/GCS-create-a-service-account-key.png';
import GCS_create_service_account_0 from '@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-0.png';
import GCS_create_service_account_a from '@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-a.png';
import GCS_create_service_account_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-2.png';
import GCS_create_service_account_3 from '@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-3.png';
import GCS_guide_key from '@site/static/images/integrations/data-ingestion/s3/GCS-guide-key.png';
import Image from '@theme/IdealImage';

<details>
    <summary>Create GCS buckets and an HMAC key</summary>

### ch_bucket_us_east1 {#ch_bucket_us_east1}

<Image size="md" img={GCS_bucket_1} alt="Creating a GCS bucket in US East 1" border />

### ch_bucket_us_east4 {#ch_bucket_us_east4}

<Image size="md" img={GCS_bucket_2} alt="Creating a GCS bucket in US East 4" border />

### Generate an Access key {#generate-an-access-key}

### Create a service account HMAC key and secret {#create-a-service-account-hmac-key-and-secret}

Open **Cloud Storage > Settings > Interoperability** and either choose an existing **Access key**, or **CREATE A KEY FOR A SERVICE ACCOUNT**.  This guide covers the path for creating a new key for a new service account.

<Image size="md" img={GCS_create_service_account_key} alt="Generating a service account HMAC key in GCS" border />

### Add a new service account {#add-a-new-service-account}

If this is a project with no existing service account, **CREATE NEW ACCOUNT**.

<Image size="md" img={GCS_create_service_account_0} alt="Adding a new service account in GCS" border />

There are three steps to creating the service account, in the first step give the account a meaningful name, ID, and description.

<Image size="md" img={GCS_create_service_account_a} alt="Defining a new service account name and ID in GCS" border />

In the Interoperability settings dialog the IAM role **Storage Object Admin** role is recommended; select that role in step two.

<Image size="md" img={GCS_create_service_account_2} alt="Selecting IAM role Storage Object Admin in GCS" border />

Step three is optional and not used in this guide.  You may allow users to have these privileges based on your policies.

<Image size="md" img={GCS_create_service_account_3} alt="Configuring additional settings for the new service account in GCS" border />

The service account HMAC key will be displayed.  Save this information, as it will be used in the ClickHouse configuration.

<Image size="md" img={GCS_guide_key} alt="Retrieving the generated HMAC key for GCS" border />

</details>
