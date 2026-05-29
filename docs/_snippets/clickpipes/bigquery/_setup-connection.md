import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step2.png';
import Image from '@theme/IdealImage';

To set up a new ClickPipe, you must provide details on how to connect to and authenticate with your BigQuery data warehouse, as well as a staging GCS bucket.

**1.** Upload the `.json` key for the service account you created for ClickPipes. Ensure the service account has the minimum required set of [permissions](/integrations/clickpipes/bigquery/overview#permissions).

    <Image img={cp_step2} alt="Upload service account key" size="lg" border/>    

**2.** Select the **Replication method**. In Private Preview, the only supported option is [**Initial load only**](/integrations/clickpipes/bigquery/overview#initial-load).

**3.** Provide the path to the GCS bucket for staging data during the initial load.

**4.** Click **Next** to validate.