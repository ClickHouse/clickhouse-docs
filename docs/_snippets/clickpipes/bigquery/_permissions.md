import cp_iam from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_iam.png';
import Image from '@theme/IdealImage';

ClickPipes authenticates to your Google Cloud project using a [service account key](https://docs.cloud.google.com/iam/docs/keys-create-delete). We recommend creating a dedicated service account with the minimum required set of [permissions](#permissions) to allow ClickPipes to export data from BigQuery, load it into the staging GCS bucket, and read it into ClickHouse.

To create a service account:

1. Select **IAM and admin** from the navigation menu in the Google Cloud console
2. Select **Service accounts**
3. Click **Create service account**

<Image img={cp_iam} alt="Creating a service account key with BigQuery and Cloud Storage permissions" size="lg" border/>

### Service account permissions {#permissions}

The following service account permissions are required:

#### BigQuery {#bigquery}

The service account must have the following BigQuery roles:

* [`roles/bigquery.dataViewer`](https://docs.cloud.google.com/bigquery/docs/access-control#bigquery.dataViewer)
* [`roles/bigquery.jobUser`](https://docs.cloud.google.com/bigquery/docs/access-control#bigquery.jobUser)

To further scope access, we recommend using [IAM conditions](https://docs.cloud.google.com/bigquery/docs/conditions) to restrict the resources the role has access to. For example, you can restrict the `dataViewer` role to the specific dataset containing the tables you want to sync:

```plaintext
resource.name.startsWith("projects/<PROJECT_ID>/datasets/<DATASET_NAME>")
```

#### Cloud Storage {#cloud-storage}

The service account must have the following Cloud Storage roles:

* [`roles/storage.objectAdmin`](https://docs.cloud.google.com/storage/docs/access-control/iam-roles#storage.objectAdmin)
* [`roles/storage.bucketViewer`](https://docs.cloud.google.com/storage/docs/access-control/iam-roles#storage.bucketViewer)

To further scope access, we recommend using [IAM conditions](https://docs.cloud.google.com/bigquery/docs/conditions) to restrict the resources the role has access to. For example, you can restrict the `objectAdmin` and `bucketViewer` roles to the dedicated bucket created for ClickPipes syncs.

```plaintext
resource.name.startsWith("projects/_/buckets/<BUCKET_NAME>")
```