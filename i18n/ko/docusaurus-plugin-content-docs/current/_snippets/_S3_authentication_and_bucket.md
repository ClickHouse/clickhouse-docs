import Image from '@theme/IdealImage';
import s3_1 from '@site/static/images/_snippets/s3/s3-1.png';
import s3_2 from '@site/static/images/_snippets/s3/s3-2.png';
import s3_3 from '@site/static/images/_snippets/s3/s3-3.png';
import s3_4 from '@site/static/images/_snippets/s3/s3-4.png';
import s3_5 from '@site/static/images/_snippets/s3/s3-5.png';
import s3_6 from '@site/static/images/_snippets/s3/s3-6.png';
import s3_7 from '@site/static/images/_snippets/s3/s3-7.png';
import s3_8 from '@site/static/images/_snippets/s3/s3-8.png';
import s3_9 from '@site/static/images/_snippets/s3/s3-9.png';
import s3_a from '@site/static/images/_snippets/s3/s3-a.png';
import s3_b from '@site/static/images/_snippets/s3/s3-b.png';
import s3_c from '@site/static/images/_snippets/s3/s3-c.png';
import s3_d from '@site/static/images/_snippets/s3/s3-d.png';
import s3_e from '@site/static/images/_snippets/s3/s3-e.png';
import s3_f from '@site/static/images/_snippets/s3/s3-f.png';
import s3_g from '@site/static/images/_snippets/s3/s3-g.png';
import s3_h from '@site/static/images/_snippets/s3/s3-h.png';

<details>
  <summary>S3 버킷과 IAM 사용자 생성하기</summary>

  이 문서에서는 AWS IAM 사용자 구성, S3 버킷 생성, 그리고 ClickHouse가 해당 버킷을 S3 디스크로 사용하도록 설정하는 기본 방법을 설명합니다.
  보안 팀과 협력하여 사용할 권한을 결정하시고, 본 문서의 내용을 시작점으로 참고하십시오.

  ### AWS IAM 사용자 생성하기 \{#create-an-aws-iam-user\}

  다음 단계에서는 서비스 계정 사용자를 생성합니다(로그인 사용자가 아닙니다).

  1. AWS IAM 관리 콘솔에 로그인합니다.

  2. `Users` 메뉴에서 `Create user`를 선택합니다

  <Image size="md" img={s3_1} alt="AWS IAM 관리 콘솔 - 새 사용자 추가" border force />

  3. 사용자 이름을 입력하고 자격 증명 유형을 `Access key - Programmatic access`로 설정한 다음 `Next: Permissions` 버튼을 선택합니다.

  <Image size="md" img={s3_2} alt="IAM 사용자에 대한 사용자 이름과 액세스 유형 설정" border force />

  4. 사용자를 어떤 그룹에도 추가하지 말고 `Next: Tags`를 선택하십시오.

  <Image size="md" img={s3_3} alt="IAM 사용자에 대한 그룹 할당을 건너뜀" border force />

  5. 추가할 태그가 없으면 `Next: Review`를 선택하십시오

  <Image size="md" img={s3_4} alt="IAM 사용자에 대한 태그 할당을 생략합니다" border force />

  6. `Create User`를 선택하십시오

  :::note
  사용자에게 권한이 없다는 경고 메시지는 무시하셔도 됩니다. 다음 섹션에서 버킷에 대한 권한이 부여됩니다
  :::

  <Image size="md" img={s3_5} alt="「권한 없음」 경고가 표시된 IAM 사용자 생성" border force />

  7. 이제 사용자가 생성되었습니다. `show`를 클릭한 뒤 액세스 키와 시크릿 키를 복사합니다.

  :::note
  키를 다른 곳에 저장하세요. 비밀 액세스 키(secret access key)는 이번에만 확인할 수 있습니다.
  :::

  <Image size="md" img={s3_6} alt="IAM 사용자 액세스 키 조회 및 복사" border force />

  8. 닫기를 클릭한 다음 Users 화면에서 사용자를 찾습니다.

  <Image size="md" img={s3_7} alt="새로 생성한 IAM 사용자를 사용자 목록에서 찾기" border force />

  9. ARN(Amazon Resource Name)을 복사하여 버킷의 액세스 정책을 구성할 때 사용하기 위해 저장합니다.

  <Image size="md" img={s3_8} alt="IAM 사용자 ARN을 복사하기" border force />

  ### S3 버킷 생성 \{#create-an-s3-bucket\}

  1. S3 버킷 섹션에서 `Create bucket`을 선택하십시오

  <Image size="md" img={s3_9} alt="S3 버킷 생성 절차 시작하기" border force />

  2. 버킷 이름을 입력하고 나머지 옵션은 기본값으로 두십시오

  :::note
  버킷 이름은 조직 내에서만이 아니라 AWS 전체에서 고유해야 합니다. 그렇지 않으면 오류가 발생합니다.
  :::

  3. `Block all Public Access`는 활성화된 상태로 유지하십시오. 퍼블릭 액세스는 필요하지 않습니다.

  <Image size="md" img={s3_a} alt="공용 액세스를 차단하도록 S3 버킷 설정 구성" border force />

  4. 페이지 하단에서 `Create Bucket`을 선택하십시오.

  <Image size="md" img={s3_b} alt="S3 버킷 생성 마무리" border force />

  5. 링크를 선택해 ARN을 복사한 후, 나중에 버킷 액세스 정책을 구성할 때 사용할 수 있도록 저장합니다.

  6. 버킷이 생성되면 S3 버킷 목록에서 새 S3 버킷을 찾아 해당 링크를 클릭합니다

  <Image size="md" img={s3_c} alt="버킷 목록에서 새로 생성된 S3 버킷 찾기" border force />

  7. `Create folder` 옵션을 선택하십시오

  <Image size="md" img={s3_d} alt="S3 버킷에 새 폴더를 생성하기" border force />

  8. ClickHouse S3 디스크의 대상으로 사용할 폴더 이름을 입력한 후 `Create folder`를 선택합니다

  <Image size="md" img={s3_e} alt="ClickHouse S3 디스크 사용 시 폴더 이름 설정" border force />

  9. 이제 해당 폴더가 버킷 목록에 표시되어야 합니다

  <Image size="md" img={s3_f} alt="S3 버킷에서 새로 만든 폴더 확인하기" border force />

  10. 새 폴더의 체크박스를 선택한 다음 `Copy URL`을 클릭하십시오. 복사한 URL은 다음 섹션에서 ClickHouse 스토리지 구성을 위해 사용할 수 있도록 저장해 두십시오.

  <Image size="md" img={s3_g} alt="ClickHouse 구성을 위한 S3 폴더 URL 복사" border force />

  11. `Permissions` 탭을 선택한 다음 `Bucket Policy` 섹션에서 `Edit` 버튼을 클릭합니다

  <Image size="md" img={s3_h} alt="S3 버킷 정책 구성에 접근하기" border force />

  12. 아래 예시와 같이 버킷 정책을 추가합니다:

  ```json
  {
    "Version" : "2012-10-17",
    "Id" : "Policy123456",
    "Statement" : [
      {
        "Sid" : "abc123",
        "Effect" : "Allow",
        "Principal" : {
          "AWS" : "arn:aws:iam::921234567898:user/mars-s3-user"
        },
        "Action" : "s3:*",
        "Resource" : [
          "arn:aws:s3:::mars-doc-test",
          "arn:aws:s3:::mars-doc-test/*"
        ]
      }
    ]
  }
  ```

  ```response
  |Parameter | Description | Example Value |
  |----------|-------------|----------------|
  |Version | Version of the policy interpreter, leave as-is | 2012-10-17 |
  |Sid | User-defined policy id | abc123 |
  |Effect | Whether user requests will be allowed or denied | Allow |
  |Principal | The accounts or user that will be allowed | arn:aws:iam::921234567898:user/mars-s3-user |
  |Action | What operations are allowed on the bucket| s3:*|
  |Resource | Which resources in the bucket will operations be allowed in | "arn:aws:s3:::mars-doc-test", "arn:aws:s3:::mars-doc-test/*" |
  ```

  :::note
  사용할 권한을 결정하기 위해 보안 팀과 협력하시기 바랍니다. 이 내용은 시작점으로 참고하십시오.
  정책 및 설정에 대한 자세한 내용은 AWS 문서를 참조하십시오:
  https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
  :::

  13. 정책 설정을 저장하십시오.
</details>