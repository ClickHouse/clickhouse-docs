import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_step2.png';
import Image from '@theme/IdealImage';

<Image img={cp_step2} alt="接続詳細を入力する" size="lg" border />

* **Authentication method**: S3 ClickPipe は [IAM credentials](/integrations/clickpipes/object-storage/amazon-s3/overview/#iam-credentials)（`Credentials`）と [IAM role-based authentication](/integrations/clickpipes/object-storage/amazon-s3/overview/#iam-role)（`IAM role`）をサポートします。認証および権限設定の詳細については、[リファレンスドキュメント](/integrations/clickpipes/object-storage/overview/#access-control) を参照してください。

  * **S3 file path**: S3 ClickPipe は、[virtual-hosted-style URI](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#virtual-hosted-style-access) を使用することを前提としています。

    ```bash
        https://bucket-name.s3.region-code.amazonaws.com/key-name
        ```

    複数のファイルやプレフィックスにマッチさせるために POSIX ワイルドカードを使用できます。サポートされているパターンについては、[リファレンスドキュメント](/integrations/clickpipes/object-storage/overview/#file-pattern-matching) を参照してください。
