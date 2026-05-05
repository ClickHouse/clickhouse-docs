---
title: 'AWS IAM 사용자와 S3 버킷 생성 방법'
description: 'AWS IAM 사용자와 S3 버킷을 생성하는 방법입니다.'
keywords: ['AWS', 'IAM', 'S3 버킷']
slug: /integrations/s3/creating-iam-user-and-s3-bucket
sidebar_label: 'AWS IAM 사용자와 S3 버킷 생성 방법'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import s3_1 from '@site/static/images/_snippets/s3/2025/s3-1.png';
import s3_2 from '@site/static/images/_snippets/s3/2025/s3-2.png';
import s3_3 from '@site/static/images/_snippets/s3/2025/s3-3.png';
import s3_4 from '@site/static/images/_snippets/s3/2025/s3-4.png';
import s3_5 from '@site/static/images/_snippets/s3/2025/s3-5.png';
import s3_6 from '@site/static/images/_snippets/s3/2025/s3-6.png';
import s3_7 from '@site/static/images/_snippets/s3/2025/s3-7.png';
import s3_8 from '@site/static/images/_snippets/s3/2025/s3-8.png';
import s3_9 from '@site/static/images/_snippets/s3/2025/s3-9.png';
import s3_10 from '@site/static/images/_snippets/s3/2025/s3-10.png';
import s3_11 from '@site/static/images/_snippets/s3/2025/s3-11.png';
import s3_12 from '@site/static/images/_snippets/s3/2025/s3-12.png';
import s3_13 from '@site/static/images/_snippets/s3/2025/s3-13.png';
import s3_14 from '@site/static/images/_snippets/s3/2025/s3-14.png';
import s3_15 from '@site/static/images/_snippets/s3/2025/s3-15.png';
import s3_16 from '@site/static/images/_snippets/s3/2025/s3-16.png';
import s3_17 from '@site/static/images/_snippets/s3/2025/s3-17.png';
import s3_18 from '@site/static/images/_snippets/s3/2025/s3-18.png';
import s3_19 from '@site/static/images/_snippets/s3/2025/s3-19.png';
import s3_20 from '@site/static/images/_snippets/s3/2025/s3-20.png';

> 이 가이드는 AWS에서 IAM 사용자와 S3 버킷을 설정하는 방법을 설명하며,
> S3로 백업을 수행하거나 ClickHouse가 S3에 데이터를 저장하도록
> 구성하기 위한 선행 단계입니다.


## AWS IAM 사용자 생성 \{#create-an-aws-iam-user\}

이 절차에서는 로그인용 사용자가 아닌 서비스 계정용 사용자를 생성합니다.

1. AWS IAM 관리 콘솔에 로그인합니다.

2. `Users` 탭에서 `Create user`를 선택합니다.

<Image size="lg" img={s3_1} alt="AWS IAM 관리 콘솔 - 새 사용자 추가"/>

3. 사용자 이름을 입력합니다.

<Image size="lg" img={s3_2} alt="AWS IAM 관리 콘솔 - 새 사용자 추가" />

4. `Next`를 선택합니다.

<Image size="lg" img={s3_3} alt="AWS IAM 관리 콘솔 - 새 사용자 추가" />

5. `Next`를 선택합니다.

<Image size="lg" img={s3_4} alt="AWS IAM 관리 콘솔 - 새 사용자 추가" />

6. `Create user`를 선택합니다.

사용자가 생성됩니다.
방금 생성한 사용자를 클릭합니다.

<Image size="lg" img={s3_5} alt="AWS IAM 관리 콘솔 - 새 사용자 추가" />

7. `Create access key`를 선택합니다.

<Image size="lg" img={s3_6} alt="AWS IAM 관리 콘솔 - 새 사용자 추가" />

8. `Application running outside AWS`를 선택합니다.

<Image size="lg" img={s3_7} alt="AWS IAM 관리 콘솔 - 새 사용자 추가" />

9. `Create access key`를 선택합니다.

<Image size="lg" img={s3_8} alt="AWS IAM 관리 콘솔 - 새 사용자 추가" />

10. 나중에 사용하기 위해 액세스 키와 시크릿 키를 CSV 파일로 다운로드합니다.

<Image size="lg" img={s3_9} alt="AWS IAM 관리 콘솔 - 새 사용자 추가" />

## S3 버킷 생성 \{#create-an-s3-bucket\}

1. S3 버킷 섹션에서 **Create bucket**을 선택합니다.

<Image size="lg" img={s3_10} alt="AWS IAM Management Console - 새 사용자 추가" />

2. 버킷 이름을 입력하고, 다른 옵션은 기본값으로 둡니다.

<Image size="lg" img={s3_11} alt="AWS IAM Management Console - 새 사용자 추가" />

:::note
버킷 이름은 조직이 아니라 AWS 전체에서 고유해야 하며, 그렇지 않으면 오류가 발생합니다.
:::

3. `Block all Public Access`는 활성화 상태로 둡니다. 퍼블릭 액세스는 필요하지 않습니다.

<Image size="lg" img={s3_12} alt="AWS IAM Management Console - 새 사용자 추가" />

4. 페이지 하단에서 **Create Bucket**을 선택합니다.

<Image size="lg" img={s3_13} alt="AWS IAM Management Console - 새 사용자 추가" />

5. 링크를 선택한 후 ARN을 복사하여, 이후 이 버킷의 액세스 정책을 설정할 때 사용할 수 있도록 저장합니다.

<Image size="lg" img={s3_14} alt="AWS IAM Management Console - 새 사용자 추가" />

6. 버킷이 생성되면 S3 버킷 목록에서 새 S3 버킷을 찾은 후 버킷 이름을 선택합니다. 아래와 같은 페이지로 이동합니다.

<Image size="lg" img={s3_15} alt="AWS IAM Management Console - 새 사용자 추가" />

7. `Create folder`를 선택합니다.

8. ClickHouse S3 디스크 또는 백업 대상이 될 폴더 이름을 입력하고, 페이지 하단에서 `Create folder`를 선택합니다.

<Image size="lg" img={s3_16} alt="AWS IAM Management Console - 새 사용자 추가" />

9. 이제 버킷 목록에 해당 폴더가 표시됩니다.

<Image size="lg" img={s3_17} alt="AWS IAM Management Console - 새 사용자 추가" />

10. 새 폴더의 체크박스를 선택한 후 `Copy URL`을 클릭합니다. 다음 섹션에서 ClickHouse 스토리지 구성을 할 때 사용할 수 있도록 이 URL을 저장합니다.

<Image size="lg" img={s3_18} alt="AWS IAM Management Console - 새 사용자 추가" />

11. **Permissions** 탭을 선택한 후 **Bucket Policy** 섹션에서 **Edit** 버튼을 클릭합니다.

<Image size="lg" img={s3_19} alt="AWS IAM Management Console - 새 사용자 추가" />

12. 아래 예시와 같이 버킷 정책을 추가합니다.

```json
{
    "Version": "2012-10-17",
    "Id": "Policy123456",
    "Statement": [
        {
            "Sid": "abc123",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::782985192762:user/docs-s3-user"
            },
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::ch-docs-s3-bucket",
                "arn:aws:s3:::ch-docs-s3-bucket/*"
            ]
        }
    ]
}
```

:::note
위의 정책을 사용하면 버킷에 대해 모든 작업을 수행할 수 있습니다.
:::

| Parameter | Description               | Example Value                                                                            |
| --------- | ------------------------- | ---------------------------------------------------------------------------------------- |
| Version   | 정책 인터프리터 버전으로, 그대로 둡니다    | 2012-10-17                                                                               |
| Sid       | 사용자 정의 정책 ID              | abc123                                                                                   |
| Effect    | 사용자 요청을 허용할지 거부할지를 나타냅니다  | Allow                                                                                    |
| Principal | 허용되는 계정 또는 사용자            | arn:aws:iam::782985192762:user/docs-s3-user                                              |
| Action    | 버킷에서 허용되는 작업              | s3:*                                                                                     |
| Resource  | 버킷에서 어떤 리소스에 대해 작업이 허용되는지 | &quot;arn:aws:s3:::ch-docs-s3-bucket&quot;, &quot;arn:aws:s3:::ch-docs-s3-bucket/*&quot; |

:::note
권한 구성은 보안 팀과 협의하여 결정해야 하며, 위 설정은 시작점으로만 고려하십시오.
정책 및 설정에 대한 자세한 내용은 AWS 문서를 참조하십시오:
https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
:::

13. 정책 구성을 저장합니다.
