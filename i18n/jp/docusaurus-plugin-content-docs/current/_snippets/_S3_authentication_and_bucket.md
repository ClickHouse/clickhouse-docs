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
  <summary>S3バケットとIAMユーザーを作成</summary>

この記事では、AWS IAMユーザーの構成、S3バケットの作成、およびClickHouseがバケットをS3ディスクとして使用するための構成の基本を説明します。
使用する権限を決定するには、セキュリティチームと協力してください。これらを出発点として検討してください。

### AWS IAMユーザーの作成 \\{#create-an-aws-iam-user\\}

以下の手順では、サービスアカウントユーザー(ログインユーザーではなく)を作成します。

1. AWS IAM マネジメントコンソールにサインインします。

2. `Users` メニューから `Create user` を選択します

<Image size="md" img={s3_1} alt="AWS IAM 管理コンソール - 新しいユーザーの追加" border force />

3. ユーザー名を入力し、認証情報の種類を`Access key - Programmatic access`に設定し、`Next: Permissions`を選択します。

<Image size="md" img={s3_2} alt="IAM ユーザーのユーザー名とアクセスの種類の設定" border force />

4. ユーザーをどのグループにも追加せずに、`Next: Tags` を選択します

<Image size="md" img={s3_3} alt="IAMユーザーのグループへの割り当てをスキップする" border force />

5. タグを追加する必要がなければ、`Next: Review` を選択します

<Image size="md" img={s3_4} alt="IAMユーザーへのタグ割り当てをスキップ" border force />

6. `Create User` を選択します

:::note
ユーザーに権限がないという警告メッセージは無視できます。次のセクションでバケットに対するユーザーの権限が付与されます
:::

<Image size="md" img={s3_5} alt="権限なしでIAMユーザーを作成した際の警告" border force />

7. ユーザーの作成が完了したら、`show` をクリックし、アクセスキーとシークレットキーをコピーします。

:::note
キーを別の場所に保存してください。シークレットアクセスキーが利用可能なのはこの時だけです。
:::

<Image size="md" img={s3_6} alt="IAM ユーザーアクセスキーの表示とコピー" border force />

8. 「閉じる」をクリックし、ユーザー画面で該当ユーザーを探します。

<Image size="md" img={s3_7} alt="ユーザー一覧で新しく作成されたIAMユーザーを見つける" border force />

9. ARN（Amazon Resource Name）をコピーし、バケットのアクセスポリシーを構成する際に使用できるよう保存しておきます。

<Image size="md" img={s3_8} alt="IAMユーザーのARNをコピー" border force />

### S3バケットの作成 \\{#create-an-s3-bucket\\}

1. S3 バケットセクションで`Create bucket`を選択します

<Image size="md" img={s3_9} alt="S3バケットの作成を開始する" border force />

2. バケット名を入力し、他のオプションはデフォルトのままにしておきます

:::note
バケット名は組織内だけでなく、AWS全体で一意である必要があります。そうでない場合、エラーが発生します。
:::

3. `Block all Public Access` は有効のままにしておきます。パブリックアクセスを許可する必要はありません。

<Image size="md" img={s3_a} alt="パブリックアクセスをブロックしたS3バケットの設定" border force />

4. ページ下部の**バケットを作成**を選択します

<Image size="md" img={s3_b} alt="S3バケット作成の完了" border force />

5. リンクを選択してARNをコピーし、バケットのアクセスポリシー構成時に使用するために保存します。

6. バケットが作成されたら、S3バケット一覧から新しいS3バケットを見つけてそのリンクを選択します

<Image size="md" img={s3_c} alt="バケットリストで新しく作成されたS3バケットを見つける" border force />

7. `Create folder` を選択します

<Image size="md" img={s3_d} alt="S3バケット内に新しいフォルダを作成" border force />

8. ClickHouse S3ディスクの対象となるフォルダ名を入力し、`Create folder` を選択します

<Image size="md" img={s3_e} alt="ClickHouse S3ディスク使用のためのフォルダ名の設定" border force />

9. フォルダがバケットリストに表示されます

<Image size="md" img={s3_f} alt="S3バケット内の新しく作成されたフォルダの表示" border force />

10. 新しいフォルダのチェックボックスを選択し、`Copy URL` をクリックします。コピーしたURLは、次のセクションでのClickHouseストレージ構成で使用するために保存しておきます。

<Image size="md" img={s3_g} alt="ClickHouse構成のためのS3フォルダURLのコピー" border force />

11. `Permissions` タブを選択し、`Bucket Policy` セクションの `Edit` ボタンをクリックします

<Image size="md" img={s3_h} alt="S3バケットポリシー設定へのアクセス" border force />

12. バケットポリシーを追加します。以下は例です：

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
使用する権限を決定するには、セキュリティチームと協力してください。これらを出発点として検討してください。
ポリシーと設定の詳細については、AWSドキュメントを参照してください：
https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
:::

13. ポリシー構成を保存します。
</details>