import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/cp_step2.png';
import Image from '@theme/IdealImage';

    <Image img={cp_step2} alt="Fill out connection details" size="lg" border/>

    * **Authentication method**: the ABS ClickPipe supports [HMAC credentials](/integrations/clickpipes/object-storage/azure-blob-storage/overview/#) (`Credentials`). See the [reference documentation](/integrations/clickpipes/object-storage/azure-blob-storage/overview/#access-control) for guidance on authentication and permissions.

    * **GCS file path**: The GCS ClickPipe uses the Cloud Storage [XML API](https://docs.cloud.google.com/storage/docs/interoperability) for interoperability, which requires the `storage.googleapis.com` endpoint:

        ```bash
        https://storage.googleapis.com/bucket-name/key-name
        ```

        You can use POSIX wildcards to match multiple files or prefixes. See the [reference documentation](/integrations/clickpipes/object-storage/overview/#file-pattern-matching) for guidance on supported patterns.