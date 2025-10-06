

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
  <summary>S3バケットとIAMユーザーの作成</summary>

この記事では、AWS IAMユーザーの基本的な設定方法、S3バケットの作成、及びClickHouseをS3ディスクとしてバケットを使用するように設定する方法について説明します。使用する権限を決定するためにセキュリティチームと連携し、これを出発点として考慮してください。

### AWS IAMユーザーの作成 {#create-an-aws-iam-user}
この手順では、ログインユーザーではなくサービスアカウントユーザーを作成します。
1. AWS IAM Management Console にログインします。

2. 「ユーザー」で、**ユーザーの追加**を選択します。

<Image size="md" img={s3_1} alt="AWS IAM Management Console - 新しいユーザーの追加" border force/>

3. ユーザー名を入力し、認証情報の種類を**アクセスキー - プログラムによるアクセス**に設定して、**次へ: 権限**を選択します。

<Image size="md" img={s3_2} alt="IAMユーザーのユーザー名とアクセスタイプの設定" border force/>

4. ユーザーをグループに追加しないでください; **次へ: タグ**を選択します。

<Image size="md" img={s3_3} alt="IAMユーザーのグループ割り当てをスキップ" border force/>

5. タグを追加する必要がない限り、**次へ: 確認**を選択します。

<Image size="md" img={s3_4} alt="IAMユーザーのタグ割り当てをスキップ" border force/>

6. **ユーザーの作成**を選択します。

    :::note
    ユーザーに権限がないことを示す警告メッセージは無視できます; 次のセクションでバケットに対してユーザーに権限が付与されます。
    :::

<Image size="md" img={s3_5} alt="警告メッセージなしでIAMユーザーを作成" border force/>

7. ユーザーが作成されました; **表示**をクリックし、アクセスキーとシークレットキーをコピーします。
:::note
キーは他の場所に保存してください; シークレットアクセスキーが使用できるのはこの一度だけです。
:::

<Image size="md" img={s3_6} alt="IAMユーザーのアクセスキーを表示およびコピー" border force/>

8. 閉じるをクリックし、ユーザー画面でユーザーを探します。

<Image size="md" img={s3_7} alt="ユーザーリストで新しく作成したIAMユーザーを見つける" border force/>

9. ARN（Amazon Resource Name）をコピーし、バケットのアクセスポリシーを設定する際に使用するために保存します。

<Image size="md" img={s3_8} alt="IAMユーザーのARNをコピー" border force/>

### S3バケットの作成 {#create-an-s3-bucket}
1. S3バケットセクションで、**バケットの作成**を選択します。

<Image size="md" img={s3_9} alt="S3バケット作成プロセスの開始" border force/>

2. バケット名を入力し、他のオプションはデフォルトのままにします。
:::note
バケット名はAWS全体でユニークである必要があります。処理を行っている組織内だけではなく、エラーが発生します。
:::
3. `Block all Public Access` を有効のままにしておきます; 公開アクセスは不要です。

<Image size="md" img={s3_a} alt="公開アクセスがブロックされたS3バケット設定の構成" border force/>

4. ページの下部で**バケットの作成**を選択します。

<Image size="md" img={s3_b} alt="S3バケット作成を最終化" border force/>

5. リンクを選択し、ARNをコピーして、バケットのアクセスポリシーを設定する際に使用できるように保存します。

6. バケットが作成されたら、新しいS3バケットをS3バケットリストで見つけてリンクを選択します。

<Image size="md" img={s3_c} alt="バケットリストで新しく作成したS3バケットを見つける" border force/>

7. **フォルダの作成**を選択します。

<Image size="md" img={s3_d} alt="S3バケット内に新しいフォルダを作成" border force/>

8. ClickHouse S3ディスクのターゲットとなるフォルダ名を入力し、**フォルダの作成**を選択します。

<Image size="md" img={s3_e} alt="ClickHouse S3ディスク使用のためのフォルダ名を設定" border force/>

9. フォルダは現在、バケットリストに表示されるはずです。

<Image size="md" img={s3_f} alt="S3バケット内の新しく作成したフォルダを表示" border force/>

10. 新しいフォルダのチェックボックスを選択し、**URLをコピー**をクリックします。コピーしたURLは次のセクションでClickHouseストレージ設定で使用します。

<Image size="md" img={s3_g} alt="ClickHouse構成のためのS3フォルダURLをコピー" border force/>

11. **Permissions** タブを選択し、**Bucket Policy** セクション内の**編集**ボタンをクリックします。

<Image size="md" img={s3_h} alt="S3バケットポリシー設定にアクセス" border force/>

12. バケットポリシーを追加します。以下の例を参照してください：
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
使用する権限を決定するためにセキュリティチームと連携してください。これらは出発点として検討してください。
ポリシーと設定についての詳細は、AWSドキュメントを参照してください：
https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
:::

13. ポリシー設定を保存します。

</details>
