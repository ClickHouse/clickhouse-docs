import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/cp_step2.png';
import Image from '@theme/IdealImage';

<Image img={cp_step2} alt="填写连接详细信息" size="lg" border />

* **Authentication method**：ABS ClickPipe 支持 [HMAC credentials](/integrations/clickpipes/object-storage/azure-blob-storage/overview/#)（`Credentials`）。有关身份验证和权限的说明，请参阅[参考文档](/integrations/clickpipes/object-storage/azure-blob-storage/overview/#access-control)。

  * **GCS file path**：GCS ClickPipe 使用 Cloud Storage 的 [XML API](https://docs.cloud.google.com/storage/docs/interoperability) 以实现互操作性，这需要使用 `storage.googleapis.com` 端点：

    ```bash
        https://storage.googleapis.com/bucket-name/key-name
        ```

    您可以使用 POSIX 通配符来匹配多个文件或前缀。有关支持的模式，请参阅[参考文档](/integrations/clickpipes/object-storage/overview/#file-pattern-matching)。
