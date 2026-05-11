import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_step2.png';
import Image from '@theme/IdealImage';

<Image img={cp_step2} alt="연결 세부 정보 입력" size="lg" border />

* **Authentication method**: S3 ClickPipe는 [IAM credentials](/integrations/clickpipes/object-storage/s3/overview#iam-credentials) (`Credentials`) 및 [IAM role-based authentication](/integrations/clickpipes/object-storage/s3/overview#iam-role) (`IAM role`)을 지원합니다. 인증 및 권한 설정에 대한 안내는 [참고 문서](/integrations/clickpipes/object-storage/s3/overview#access-control)를 참조하십시오.

  * **S3 file path**: S3 ClickPipe는 [virtual-hosted-style URI](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#virtual-hosted-style-access) 형식의 URI를 사용합니다.

    ```bash
    https://bucket-name.s3.region-code.amazonaws.com/key-name
    ```

    여러 파일 또는 접두사에 일치하도록 POSIX 와일드카드를 사용할 수 있습니다. 지원되는 패턴에 대한 안내는 [참고 문서](/integrations/clickpipes/object-storage/s3/overview#file-pattern-matching)를 참조하십시오.
