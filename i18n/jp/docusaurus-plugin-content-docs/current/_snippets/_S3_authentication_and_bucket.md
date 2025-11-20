import Image from "@theme/IdealImage"
import s3_1 from "@site/static/images/_snippets/s3/s3-1.png"
import s3_2 from "@site/static/images/_snippets/s3/s3-2.png"
import s3_3 from "@site/static/images/_snippets/s3/s3-3.png"
import s3_4 from "@site/static/images/_snippets/s3/s3-4.png"
import s3_5 from "@site/static/images/_snippets/s3/s3-5.png"
import s3_6 from "@site/static/images/_snippets/s3/s3-6.png"
import s3_7 from "@site/static/images/_snippets/s3/s3-7.png"
import s3_8 from "@site/static/images/_snippets/s3/s3-8.png"
import s3_9 from "@site/static/images/_snippets/s3/s3-9.png"
import s3_a from "@site/static/images/_snippets/s3/s3-a.png"
import s3_b from "@site/static/images/_snippets/s3/s3-b.png"
import s3_c from "@site/static/images/_snippets/s3/s3-c.png"
import s3_d from "@site/static/images/_snippets/s3/s3-d.png"
import s3_e from "@site/static/images/_snippets/s3/s3-e.png"
import s3_f from "@site/static/images/_snippets/s3/s3-f.png"
import s3_g from "@site/static/images/_snippets/s3/s3-g.png"
import s3_h from "@site/static/images/_snippets/s3/s3-h.png"

<details>
  <summary>S3バケットとIAMユーザーの作成</summary>

この記事では、AWS IAMユーザーの設定、S3バケットの作成、およびClickHouseでそのバケットをS3ディスクとして使用するための設定の基本について説明します。使用する権限についてはセキュリティチームと協議し、ここで示す内容を出発点として検討してください。

### AWS IAMユーザーの作成 {#create-an-aws-iam-user}

この手順では、ログインユーザーではなく、サービスアカウントユーザーを作成します。

1.  AWS IAM管理コンソールにログインします。

2.  「ユーザー」で**ユーザーを追加**を選択します

<Image
  size='md'
  img={s3_1}
  alt='AWS IAM管理コンソール - 新しいユーザーの追加'
  border
  force
/>

3. ユーザー名を入力し、認証情報タイプを**アクセスキー - プログラムによるアクセス**に設定して、**次へ: アクセス許可**を選択します

<Image
  size='md'
  img={s3_2}
  alt='IAMユーザーのユーザー名とアクセスタイプの設定'
  border
  force
/>

4. ユーザーをどのグループにも追加せず、**次へ: タグ**を選択します

<Image
  size='md'
  img={s3_3}
  alt='IAMユーザーのグループ割り当てをスキップ'
  border
  force
/>

5. タグを追加する必要がない場合は、**次へ: 確認**を選択します

<Image
  size='md'
  img={s3_4}
  alt='IAMユーザーのタグ割り当てをスキップ'
  border
  force
/>

6. **ユーザーの作成**を選択します

   :::note
   ユーザーに権限がないという警告メッセージは無視できます。次のセクションでバケットに対するユーザーの権限を付与します
   :::

<Image
  size='md'
  img={s3_5}
  alt='権限なしの警告を伴うIAMユーザーの作成'
  border
  force
/>

7. ユーザーが作成されました。**表示**をクリックして、アクセスキーとシークレットキーをコピーします。
   :::note
   キーを別の場所に保存してください。シークレットアクセスキーが利用可能なのはこの時だけです。
   :::

<Image
  size='md'
  img={s3_6}
  alt='IAMユーザーのアクセスキーの表示とコピー'
  border
  force
/>

8. 閉じるをクリックし、ユーザー画面でユーザーを見つけます。

<Image
  size='md'
  img={s3_7}
  alt='ユーザーリストで新しく作成されたIAMユーザーを検索'
  border
  force
/>

9. ARN（Amazon Resource Name）をコピーし、バケットのアクセスポリシーを設定する際に使用するために保存します。

<Image
  size='md'
  img={s3_8}
  alt='IAMユーザーのARNのコピー'
  border
  force
/>

### S3バケットの作成 {#create-an-s3-bucket}

1. S3バケットセクションで、**バケットを作成**を選択します

<Image
  size='md'
  img={s3_9}
  alt='S3バケット作成プロセスの開始'
  border
  force
/>

2. バケット名を入力し、その他のオプションはデフォルトのままにします
   :::note
   バケット名は組織内だけでなく、AWS全体で一意である必要があります。そうでない場合はエラーが発生します。
   :::
3. `パブリックアクセスをすべてブロック`を有効のままにします。パブリックアクセスは不要です。


<Image
  size='md'
  img={s3_a}
  alt='パブリックアクセスをブロックしたS3バケット設定の構成'
  border
  force
/>

4. ページ下部の**Create Bucket**を選択します

<Image size='md' img={s3_b} alt='S3バケット作成の完了' border force />

5. リンクを選択してARNをコピーし、バケットのアクセスポリシー構成時に使用するために保存します。

6. バケットが作成されたら、S3バケットリストから新しいS3バケットを見つけ、リンクを選択します

<Image
  size='md'
  img={s3_c}
  alt='バケットリストで新しく作成されたS3バケットを見つける'
  border
  force
/>

7. **Create folder**を選択します

<Image
  size='md'
  img={s3_d}
  alt='S3バケット内に新しいフォルダを作成'
  border
  force
/>

8. ClickHouse S3ディスクのターゲットとなるフォルダ名を入力し、**Create folder**を選択します

<Image
  size='md'
  img={s3_e}
  alt='ClickHouse S3ディスク使用のためのフォルダ名の設定'
  border
  force
/>

9. フォルダがバケットリストに表示されます

<Image
  size='md'
  img={s3_f}
  alt='S3バケット内の新しく作成されたフォルダの表示'
  border
  force
/>

10. 新しいフォルダのチェックボックスを選択し、**Copy URL**をクリックします。コピーしたURLは、次のセクションでClickHouseストレージ構成に使用するために保存します。

<Image
  size='md'
  img={s3_g}
  alt='ClickHouse構成のためのS3フォルダURLのコピー'
  border
  force
/>

11. **Permissions**タブを選択し、**Bucket Policy**セクションの**Edit**ボタンをクリックします

<Image
  size='md'
  img={s3_h}
  alt='S3バケットポリシー構成へのアクセス'
  border
  force
/>

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
      "Resource": ["arn:aws:s3:::mars-doc-test", "arn:aws:s3:::mars-doc-test/*"]
    }
  ]
}
```

```response
|パラメータ | 説明 | 例の値 |
|----------|-------------|----------------|
|Version | ポリシーインタープリタのバージョン、そのままにしておく | 2012-10-17 |
|Sid | ユーザー定義のポリシーID | abc123 |
|Effect | ユーザーリクエストが許可されるか拒否されるか | Allow |
|Principal | 許可されるアカウントまたはユーザー | arn:aws:iam::921234567898:user/mars-s3-user |
|Action | バケットで許可される操作 | s3:*|
|Resource | バケット内で操作が許可されるリソース | "arn:aws:s3:::mars-doc-test", "arn:aws:s3:::mars-doc-test/*" |
```

:::note
使用する権限を決定するには、セキュリティチームと協力してください。これらは出発点として考慮してください。
ポリシーと設定の詳細については、AWSドキュメントを参照してください：
https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
:::

13. ポリシー構成を保存します。

</details>
