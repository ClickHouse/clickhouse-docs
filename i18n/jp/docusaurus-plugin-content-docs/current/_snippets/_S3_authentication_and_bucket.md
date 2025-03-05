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

この記事では、AWS IAMユーザーを設定し、S3バケットを作成し、ClickHouseでそのバケットをS3ディスクとして使用する方法の基本を示します。使用する権限についてセキュリティチームと協力して決定し、これを出発点として考慮する必要があります。

### AWS IAMユーザーの作成 {#create-an-aws-iam-user}
この手順では、ログインユーザーではなく、サービスアカウントユーザーを作成します。
1. AWS IAM管理コンソールにログインします。

2. 「ユーザー」に移動し、**ユーザーの追加**を選択します。

<img src={s3_1} alt="create_iam_user_0"/>

3. ユーザー名を入力し、認証情報の種類を**アクセスキー - プログラムによるアクセス**に設定し、**次へ: 権限**を選択します。

<img src={s3_2} alt="create_iam_user_1"/>

4. ユーザーをいずれのグループにも追加しないでください; **次へ: タグ**を選択します。

<img src={s3_3} alt="create_iam_user_2"/>

5. タグを追加する必要がない限り、**次へ: 確認**を選択します。

<img src={s3_4} alt="create_iam_user_3"/>

6. **ユーザーの作成**を選択します。

    :::note
    ユーザーに権限がないという警告メッセージは無視できます; 次のセクションでバケットに対してユーザーに権限が付与されます。
    :::

<img src={s3_5} alt="create_iam_user_4"/>

7. ユーザーが作成されたので、**表示**をクリックして、アクセスキーとシークレットキーをコピーします。
:::note
キーは別の場所に保存してください; シークレットアクセスキーが利用可能になるのはこの時だけです。
:::

<img src={s3_6} alt="create_iam_user_5"/>

8. 閉じるをクリックし、ユーザー画面でユーザーを見つけます。

<img src={s3_7} alt="create_iam_user_6"/>

9. ARN (Amazonリソースネーム) をコピーし、バケットのアクセスポリシーを設定する際に使用するために保存します。

<img src={s3_8} alt="create_iam_user_7"/>

### S3バケットの作成 {#create-an-s3-bucket}
1. S3バケットセクションで、**バケットの作成**を選択します。

<img src={s3_9} alt="create_s3_bucket_0"/>

2. バケット名を入力し、他のオプションはデフォルトのままにします。
:::note
バケット名はAWS全体で一意である必要があります。組織内だけではなく、そうでなければエラーが発生します。
:::
3. `Block all Public Access`を有効のままにし、公的アクセスは必要ありません。

<img src={s3_a} alt="create_s3_bucket_2"/>

4. ページの下部で**バケットの作成**を選択します。

<img src={s3_b} alt="create_s3_bucket_3"/>

5. リンクを選択し、ARNをコピーして、バケットのアクセスポリシーを設定する際に使用するために保存します。

6. バケットが作成されたら、S3バケットリストで新しいS3バケットを見つけてリンクを選択します。

<img src={s3_c} alt="create_s3_bucket_4"/>

7. **フォルダーの作成**を選択します。

<img src={s3_d} alt="create_s3_bucket_5"/>

8. ClickHouseのS3ディスクの対象となるフォルダー名を入力し、**フォルダーの作成**を選択します。

<img src={s3_e} alt="create_s3_bucket_6"/>

9. フォルダーがバケットリストに表示されるようになります。

<img src={s3_f} alt="create_s3_bucket_7"/>

10. 新しいフォルダーのチェックボックスを選択し、**URLのコピー**をクリックします。コピーしたURLを、次のセクションのClickHouseストレージ設定に使用するために保存します。

<img src={s3_g} alt="create_s3_bucket_8"/>

11. **権限**タブを選択し、**バケットポリシー**セクションの**編集**ボタンをクリックします。

<img src={s3_h} alt="create_s3_bucket_9"/>

12. バケットポリシーを追加します。以下は例です：
```json
{
	"Version": "2012-10-17",
	"Id": "Policy123456",
	"Statement": [
		{
			"Sid": "abc123",
			"Effect": "Allow",
			"Principal": {
				"AWS": "arn:aws:iam::921234567898:user/mars-s3-user"
			},
			"Action": "s3:*",
			"Resource": [
				"arn:aws:s3:::mars-doc-test",
				"arn:aws:s3:::mars-doc-test/*"
			]
		}
	]
}
```

```response
|パラメーター | 説明 | 例の値 |
|----------|-------------|----------------|
|Version | ポリシーインタープリターのバージョン、そのままにしておく | 2012-10-17 |
|Sid | ユーザー定義のポリシーID | abc123 |
|Effect | ユーザーのリクエストが許可されるか拒否されるか | Allow |
|Principal | 許可されるアカウントまたはユーザー | arn:aws:iam::921234567898:user/mars-s3-user |
|Action | バケットで許可される操作は何か | s3:*|
|Resource | 操作が許可されるバケット内のリソース | "arn:aws:s3:::mars-doc-test", "arn:aws:s3:::mars-doc-test/*" |
```

:::note
使用する権限を決定するためにセキュリティチームと協力する必要があります。これは出発点として考慮してください。
ポリシーと設定に関する詳細については、AWSドキュメントを参照してください：
https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
:::

13. ポリシー設定を保存します。

</details>
