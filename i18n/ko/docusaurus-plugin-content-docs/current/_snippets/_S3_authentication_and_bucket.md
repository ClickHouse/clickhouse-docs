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
  <summary>S3 버킷 및 IAM 사용자 생성</summary>

이 문서에서는 AWS IAM 사용자를 구성하고 S3 버킷을 생성한 다음 ClickHouse에서 해당 버킷을 S3 디스크로 사용하는 방법의 기본 사항을 설명합니다. 보안 팀과 협력하여 사용할 권한을 결정하고, 이를 시작점으로 삼는 것을 권장합니다.

### AWS IAM 사용자 생성 {#create-an-aws-iam-user}
이 절차에서는 로그인 사용자가 아닌 서비스 계정 사용자를 생성합니다.
1. AWS IAM 관리 콘솔에 로그인합니다.

2. "사용자"에서 **사용자 추가**를 선택합니다.

<Image size="md" img={s3_1} alt="AWS IAM Management Console - 새로운 사용자 추가" border force/>

3. 사용자 이름을 입력하고 자격 증명 유형을 **Access key - Programmatic access**로 설정한 후 **다음: 권한**을 선택합니다.

<Image size="md" img={s3_2} alt="IAM 사용자 이름 및 접근 유형 설정" border force/>

4. 사용자를 그룹에 추가하지 않고 **다음: 태그**를 선택합니다.

<Image size="md" img={s3_3} alt="IAM 사용자에 대한 그룹 배정을 건너뛰기" border force/>

5. 태그를 추가할 필요가 없다면 **다음: 검토**를 선택합니다.

<Image size="md" img={s3_4} alt="IAM 사용자에 대한 태그 배정을 건너뛰기" border force/>

6. **사용자 생성**을 선택합니다.

    :::note
    사용자에게 권한이 없다는 경고 메시지는 무시할 수 있습니다. 사용자에게 대한 권한은 다음 섹션에서 버킷에서 부여됩니다.
    :::

<Image size="md" img={s3_5} alt="권한 경고와 함께 IAM 사용자 생성" border force/>

7. 사용자가 이제 생성되었습니다. **show**를 클릭하고 접근 키와 비밀 키를 복사합니다.
:::note
키를 다른 곳에 저장하십시오. 비밀 접근 키를 사용할 수 있는 것은 이번이 유일한 시점입니다.
:::

<Image size="md" img={s3_6} alt="IAM 사용자 접근 키 보기 및 복사" border force/>

8. 닫기를 클릭한 다음, 사용자 화면에서 사용자를 찾습니다.

<Image size="md" img={s3_7} alt="사용자 목록에 새로 생성된 IAM 사용자 찾기" border force/>

9. ARN (Amazon 리소스 이름)을 복사하고, 버킷의 접근 정책을 구성할 때 사용할 수 있도록 저장합니다.

<Image size="md" img={s3_8} alt="IAM 사용자 ARN 복사" border force/>

### S3 버킷 생성 {#create-an-s3-bucket}
1. S3 버킷 섹션에서 **버킷 생성**을 선택합니다.

<Image size="md" img={s3_9} alt="S3 버킷 생성 프로세스 시작" border force/>

2. 버킷 이름을 입력하고 다른 옵션은 기본값으로 둡니다.
:::note
버킷 이름은 AWS 전역에서 고유해야 하며, 조직 내에서만 고유해서는 안 되며, 그렇지 않으면 오류가 발생합니다.
:::
3. `Block all Public Access`를 활성화한 상태로 두십시오. Public access는 필요하지 않습니다.

<Image size="md" img={s3_a} alt="공용 접근 차단으로 S3 버킷 설정 구성" border force/>

4. 페이지 하단의 **버킷 생성**을 선택합니다.

<Image size="md" img={s3_b} alt="S3 버킷 생성 마무리" border force/>

5. 링크를 선택하고 ARN을 복사하여 버킷의 접근 정책을 구성하는 데 사용합니다.

6. 버킷이 생성된 후 S3 버킷 목록에서 새 S3 버킷을 찾아 링크를 선택합니다.

<Image size="md" img={s3_c} alt="새로 생성된 S3 버킷 발견" border force/>

7. **폴더 만들기**를 선택합니다.

<Image size="md" img={s3_d} alt="S3 버킷에 새 폴더 만들기" border force/>

8. ClickHouse S3 디스크의 대상이 될 폴더 이름을 입력하고 **폴더 만들기**를 선택합니다.

<Image size="md" img={s3_e} alt="ClickHouse S3 디스크 사용을 위한 폴더 이름 설정" border force/>

9. 이제 버킷 목록에 해당 폴더가 표시되어야 합니다.

<Image size="md" img={s3_f} alt="S3 버킷에서 새로 생성된 폴더 보기" border force/>

10. 새 폴더의 체크 박스를 선택하고 **URL 복사**를 클릭합니다. 복사된 URL을 ClickHouse 저장소 구성에 사용하도록 저장합니다.

<Image size="md" img={s3_g} alt="ClickHouse 구성을 위한 S3 폴더 URL 복사" border force/>

11. **Permissions** 탭을 선택하고 **Bucket Policy** 섹션에서 **Edit** 버튼을 클릭합니다.

<Image size="md" img={s3_h} alt="S3 버킷 정책 구성 접근" border force/>

12. 버킷 정책을 추가합니다. 예시는 아래와 같습니다:
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
사용할 권한을 정하기 위해 보안 팀과 협력해야 하며, 이는 시작점으로 고려하십시오.
정책 및 설정에 대한 자세한 내용은 AWS 문서를 참조하십시오:
https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
:::

13. 정책 구성을 저장합니다.

</details>
