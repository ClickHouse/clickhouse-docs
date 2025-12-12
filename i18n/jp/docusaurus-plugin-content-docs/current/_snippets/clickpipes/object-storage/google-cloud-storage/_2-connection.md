import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/cp_step2.png';
import Image from '@theme/IdealImage';

<Image img={cp_step2} alt="接続詳細を入力する" size="lg" border />

* **Authentication method**: ABS ClickPipe は [HMAC credentials](/integrations/clickpipes/object-storage/azure-blob-storage/overview/#)（`Credentials`）をサポートします。認証と権限設定については、[リファレンスドキュメント](/integrations/clickpipes/object-storage/azure-blob-storage/overview/#access-control) を参照してください。

  * **GCS file path**: GCS ClickPipe は相互運用性のために Cloud Storage の [XML API](https://docs.cloud.google.com/storage/docs/interoperability) を使用しており、`storage.googleapis.com` エンドポイントが必要です。

    ```bash
        https://storage.googleapis.com/bucket-name/key-name
        ```

    複数のファイルやプレフィックスに一致させるために POSIX ワイルドカードを使用できます。サポートされているパターンについては、[リファレンスドキュメント](/integrations/clickpipes/object-storage/overview/#file-pattern-matching) を参照してください。
