import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_step2.png';
import Image from '@theme/IdealImage';

<Image img={cp_step2} alt="填写连接详细信息" size="lg" border />

* **Authentication method（身份验证方法）**：S3 ClickPipe 支持使用 [IAM credentials](/integrations/clickpipes/object-storage/amazon-s3/overview/#iam-credentials)（`Credentials`）和 [基于 IAM role 的身份验证](/integrations/clickpipes/object-storage/amazon-s3/overview/#iam-role)（`IAM role`）。有关身份验证和权限的指导，请参阅 [参考文档](/integrations/clickpipes/object-storage/overview/#access-control)。

  * **S3 file path（S3 文件路径）**：S3 ClickPipe 需要使用[虚拟主机风格 URI](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#virtual-hosted-style-access)。

    ```bash
        https://bucket-name.s3.region-code.amazonaws.com/key-name
        ```

    您可以使用 POSIX 通配符匹配多个文件或前缀。有关支持的模式的指导，请参阅 [参考文档](/integrations/clickpipes/object-storage/overview/#file-pattern-matching)。
