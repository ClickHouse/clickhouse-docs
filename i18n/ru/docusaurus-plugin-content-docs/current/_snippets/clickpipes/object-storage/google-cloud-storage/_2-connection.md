import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/cp_step2.png';
import Image from '@theme/IdealImage';

<Image img={cp_step2} alt="Заполните данные подключения" size="lg" border />

* **GCS file path**: ClickPipe для GCS использует Cloud Storage [XML API](https://docs.cloud.google.com/storage/docs/interoperability) для обеспечения совместимости, что требует использования endpoint `storage.googleapis.com`:

  ```bash
  https://storage.googleapis.com/bucket-name/key-name
  ```

  Можно использовать POSIX-символы подстановки для сопоставления нескольких файлов или префиксов. См. [справочную документацию](/integrations/clickpipes/object-storage/gcs/overview#file-pattern-matching) для рекомендаций по поддерживаемым шаблонам.
