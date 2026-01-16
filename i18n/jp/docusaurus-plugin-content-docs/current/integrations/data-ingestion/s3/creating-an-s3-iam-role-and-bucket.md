---
title: 'AWS IAM ユーザーと S3 バケットの作成方法'
description: 'AWS IAM ユーザーと S3 バケットの作成方法について説明します。'
keywords: ['AWS', 'IAM', 'S3 バケット']
slug: /integrations/s3/creating-iam-user-and-s3-bucket
sidebar_label: 'AWS IAM ユーザーと S3 バケットの作成方法'
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

> このガイドでは、AWS で IAM ユーザーと S3 バケットをセットアップする方法を説明します。
> これは、S3 へのバックアップ取得や、ClickHouse が S3 上にデータを保存するよう構成するための前提となる手順です。


## AWS IAM ユーザーを作成する \\{#create-an-aws-iam-user\\}

この手順では、ログインユーザーではなく、サービスアカウント用ユーザーを作成します。

1.  AWS IAM マネジメントコンソールにログインします。

2. `Users` タブで `Create user` を選択します。

<Image size="lg" img={s3_1} alt="AWS IAM Management Console - 新しいユーザーの追加"/>

3. ユーザー名を入力します。

<Image size="lg" img={s3_2} alt="AWS IAM Management Console - 新しいユーザーの追加" />

4. `Next` を選択します。

<Image size="lg" img={s3_3} alt="AWS IAM Management Console - 新しいユーザーの追加" />

5. `Next` を選択します。

<Image size="lg" img={s3_4} alt="AWS IAM Management Console - 新しいユーザーの追加" />

6. `Create user` を選択します。

これでユーザーが作成されました。
新しく作成されたユーザーをクリックします。

<Image size="lg" img={s3_5} alt="AWS IAM Management Console - 新しいユーザーの追加" />

7. `Create access key` を選択します。

<Image size="lg" img={s3_6} alt="AWS IAM Management Console - 新しいユーザーの追加" />

8. `Application running outside AWS` を選択します。

<Image size="lg" img={s3_7} alt="AWS IAM Management Console - 新しいユーザーの追加" />

9. `Create access key` を選択します。

<Image size="lg" img={s3_8} alt="AWS IAM Management Console - 新しいユーザーの追加" />

10. 後で使用するために、アクセスキーとシークレットアクセスキーを .csv ファイルとしてダウンロードします。

<Image size="lg" img={s3_9} alt="AWS IAM Management Console - 新しいユーザーの追加" />

## S3 バケットを作成する \{#create-an-s3-bucket\}

1. S3 バケットセクションで **Create bucket** をクリックします。

<Image size="lg" img={s3_10} alt="AWS IAM Management Console - Adding a new user" />

2. バケット名を入力し、その他のオプションはデフォルトのままにします。

<Image size="lg" img={s3_11} alt="AWS IAM Management Console - Adding a new user" />

:::note
バケット名は組織単位ではなく AWS 全体で一意である必要があり、そうでない場合はエラーになります。
:::

3. `Block all Public Access` は有効のままにしておきます。パブリックアクセスは不要です。

<Image size="lg" img={s3_12} alt="AWS IAM Management Console - Adding a new user" />

4. ページ下部の **Create Bucket** をクリックします。

<Image size="lg" img={s3_13} alt="AWS IAM Management Console - Adding a new user" />

5. リンクを選択し、ARN をコピーして、後でバケットのアクセスポリシーを設定する際に使用できるよう保存します。

<Image size="lg" img={s3_14} alt="AWS IAM Management Console - Adding a new user" />

6. バケットが作成されたら、S3 バケット一覧から新しい S3 バケットを探し、バケット名を選択します。次の画面が表示されます。

<Image size="lg" img={s3_15} alt="AWS IAM Management Console - Adding a new user" />

7. `Create folder` をクリックします。

8. ClickHouse の S3 ディスクまたはバックアップのターゲットとなるフォルダ名を入力し、ページ下部の `Create folder` をクリックします。

<Image size="lg" img={s3_16} alt="AWS IAM Management Console - Adding a new user" />

9. フォルダがバケットの一覧に表示されているはずです。

<Image size="lg" img={s3_17} alt="AWS IAM Management Console - Adding a new user" />

10. 新しいフォルダのチェックボックスを選択し、`Copy URL` をクリックします。次のセクションで ClickHouse のストレージ設定に使用できるよう、この URL を保存しておきます。

<Image size="lg" img={s3_18} alt="AWS IAM Management Console - Adding a new user" />

11. **Permissions** タブを選択し、**Bucket Policy** セクションの **Edit** ボタンをクリックします。

<Image size="lg" img={s3_19} alt="AWS IAM Management Console - Adding a new user" />

12. バケットポリシーを追加します。例を以下に示します。

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
上記のポリシーにより、このバケットに対してあらゆるアクションを実行できるようになります。
:::

| Parameter | Description                      | Example Value                                                                            |
| --------- | -------------------------------- | ---------------------------------------------------------------------------------------- |
| Version   | ポリシーインタープリタのバージョン。変更せずそのまま使用します。 | 2012-10-17                                                                               |
| Sid       | ユーザー定義のポリシー ID                   | abc123                                                                                   |
| Effect    | ユーザーのリクエストを許可するか拒否するか            | Allow                                                                                    |
| Principal | 許可されるアカウントまたはユーザー                | arn:aws:iam::782985192762:user/docs-s3-user                                              |
| Action    | バケット上で許可される操作                    | s3:*                                                                                     |
| Resource  | バケット内のどのリソースに対して操作を許可するか         | &quot;arn:aws:s3:::ch-docs-s3-bucket&quot;, &quot;arn:aws:s3:::ch-docs-s3-bucket/*&quot; |

:::note
使用する権限についてはセキュリティチームと協議し、ここで示した内容はあくまで出発点として検討してください。
ポリシーと設定の詳細については、AWS ドキュメントを参照してください:
https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
:::

13. ポリシー設定を保存します
