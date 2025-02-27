<details>
  <summary>S3バケットとIAMユーザーの作成</summary>

この記事では、AWS IAMユーザーの基本設定、S3バケットの作成、およびClickHouseをS3ディスクとしてバケットを使用するように設定する方法を示します。権限については、セキュリティチームと協力して決定し、これらを出発点として考慮してください。

### AWS IAMユーザーの作成 {#create-an-aws-iam-user}
この手順では、ログインユーザーではなく、サービスアカウントユーザーを作成します。
1. AWS IAM管理コンソールにログインします。

2. 「ユーザー」で、**ユーザーを追加**を選択します。

  ![create_iam_user_0](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/s3/s3-1.png)

3. ユーザー名を入力し、認証情報のタイプを**アクセスキー - プログラムによるアクセス**に設定し、**次へ: 権限**を選択します。

  ![create_iam_user_1](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/s3/s3-2.png)

4. ユーザーをグループに追加しないでください; **次へ: タグ**を選択します。

  ![create_iam_user_2](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/s3/s3-3.png)

5. タグを追加する必要がない限り、**次へ: 確認**を選択します。

  ![create_iam_user_3](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/s3/s3-4.png)

6. **ユーザーの作成**を選択します。

    :::note
    ユーザーに権限がないという警告メッセージは無視できます; ユーザーには次のセクションでバケットに権限が付与されます。
    :::

  ![create_iam_user_4](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/s3/s3-5.png)

7. ユーザーが作成されました; **表示**をクリックして、アクセスキーとシークレットキーをコピーします。
:::note
キーは他の場所に保存してください; シークレットアクセスキーが利用できるのはこれが唯一の機会です。
:::

  ![create_iam_user_5](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/s3/s3-6.png)

8. 閉じるをクリックし、ユーザー画面でユーザーを見つけます。

  ![create_iam_user_6](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/s3/s3-7.png)

9. ARN (Amazon Resource Name) をコピーし、バケットのアクセスポリシーを設定する際に使用するために保存します。

  ![create_iam_user_7](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/s3/s3-8.png)

### S3バケットの作成 {#create-an-s3-bucket}
1. S3バケットセクションで、**バケットを作成**を選択します。

  ![create_s3_bucket_0](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/s3/s3-9.png)

2. バケット名を入力し、他のオプションはデフォルトのままにします
:::note
バケット名は、AWS全体で一意でなければならず、組織内のみではこのエラーが発生します。
:::
3. `すべてのパブリックアクセスをブロック`を有効のままにします; パブリックアクセスは必要ありません。

  ![create_s3_bucket_2](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/s3/s3-a.png)

4. ページの下部で**バケットを作成**を選択します。

  ![create_s3_bucket_3](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/s3/s3-b.png)

5. リンクを選択し、ARNをコピーして、バケットのアクセスポリシーを設定する際に使用するために保存します。

6. バケットが作成されたら、新しいS3バケットをS3バケットリストで見つけてリンクを選択します。

  ![create_s3_bucket_4](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/s3/s3-c.png)

7. **フォルダーを作成**を選択します。

  ![create_s3_bucket_5](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/s3/s3-d.png)

8. ClickHouse S3ディスクのターゲットとなるフォルダー名を入力し、**フォルダーを作成**を選択します。

  ![create_s3_bucket_6](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/s3/s3-e.png)

9. フォルダーがバケットリストに表示されるようになります。

  ![create_s3_bucket_7](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/s3/s3-f.png)

10. 新しいフォルダーのチェックボックスを選択し、**URLをコピー**をクリックします。次のセクションでClickHouseのストレージ構成で使用するためにコピーしたURLを保存します。

  ![create_s3_bucket_8](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/s3/s3-g.png)

11. **Permissions**タブを選択し、**Bucket Policy**セクションの**編集**ボタンをクリックします。

  ![create_s3_bucket_9](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/s3/s3-h.png)

12. バケットポリシーを追加します。以下の例をご参照ください：
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
|Parameter | Description | Example Value |
|----------|-------------|----------------|
|Version | ポリシーインタープリタのバージョン、デフォルトのままにします | 2012-10-17 |
|Sid | ユーザー定義のポリシーID | abc123 |
|Effect | ユーザーのリクエストを許可するか拒否するか | Allow |
|Principal | 許可されるアカウントまたはユーザー | arn:aws:iam::921234567898:user/mars-s3-user |
|Action | バケットで許可される操作 | s3:*|
|Resource | バケット内で操作が許可されるリソース | "arn:aws:s3:::mars-doc-test", "arn:aws:s3:::mars-doc-test/*" |
```

:::note
権限についてはセキュリティチームと協力して決定し、これらを出発点として考慮してください。
ポリシーと設定に関する詳細については、AWSドキュメントを参照してください：
https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
:::

13. ポリシー設定を保存します。

</details>
