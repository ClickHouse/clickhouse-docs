import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/cp_step2.png';
import Image from '@theme/IdealImage';

<Image img={cp_step2} alt="연결 세부 정보 입력" size="lg" border />

* **GCS file path**: GCS ClickPipe는 상호 운용성을 위해 Cloud Storage [XML API](https://docs.cloud.google.com/storage/docs/interoperability)를 사용하며, `storage.googleapis.com` 엔드포인트를 사용해야 합니다:

  ```bash
  https://storage.googleapis.com/bucket-name/key-name
  ```

  여러 파일이나 접두사에 일치시키기 위해 POSIX 와일드카드를 사용할 수 있습니다. 지원되는 패턴에 대한 안내는 [참고 문서](/integrations/clickpipes/object-storage/gcs/overview#file-pattern-matching)를 참고하십시오.
