import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_step1.png';
import Image from '@theme/IdealImage';

**2.** Click the **Amazon S3** tile. You can also use this tile to connect to other S3-compatible services not listed in the ClickPipes UI.

    <Image img={cp_step1} alt="Select imports" size="lg" border/>

    :::tip
    Due to differences in URL formats and API implementations across object storage service providers, not all S3-compatible services are supported out-of-the-box. If you're running into issues with a service that is not listed under [supported data sources](/integrations/clickpipes/object-storage/s3/overview#supported-data-sources), please [reach out to our team](https://clickhouse.com/company/contact?loc=clickpipes).
    :::