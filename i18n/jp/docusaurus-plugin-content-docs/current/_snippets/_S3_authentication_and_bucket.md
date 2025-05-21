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

この資料では、AWS IAMユーザーの設定方法、S3バケットの作成、それをClickHouseでS3ディスクとして使用する設定の基本を説明します。使用する権限を決定するためにセキュリティチームと協力し、これらを出発点として考慮してください。

### AWS IAMユーザーの作成 {#create-an-aws-iam-user}
この手順では、ログインユーザーではなく、サービスアカウントユーザーを作成します。
1.  AWS IAM管理コンソールにログインします。

2. 「ユーザー」から、**ユーザーの追加**を選択します。

<Image size="md" img={s3_1} alt="AWS IAM管理コンソール - 新しいユーザーの追加" border force/>

3. ユーザー名を入力し、認証情報タイプを**アクセスキー - プログラムによるアクセス**に設定し、**次へ: 権限**を選択します。

<Image size="md" img={s3_2} alt="IAMユーザーのユーザー名とアクセスタイプの設定" border force/>

4. ユーザーをグループに追加しないでください；**次へ: タグ**を選択します。

<Image size="md" img={s3_3} alt="IAMユーザーのグループ割り当てをスキップ" border force/>

5. タグを追加する必要がない限り、**次へ: 確認**を選択します。

<Image size="md" img={s3_4} alt="IAMユーザーのタグ割り当てをスキップ" border force/>

6. **ユーザーの作成**を選択します。

    :::note
    ユーザーに権限がないという警告メッセージは無視できます。権限は次のセクションでバケットに対してユーザーに付与されます。
    :::

<Image size="md" img={s3_5} alt="権限なしの警告でIAMユーザーを作成" border force/>

7. ユーザーが作成されました；**表示**をクリックし、アクセスキーとシークレットキーをコピーします。
:::note
キーは他の場所に保存してください。シークレットアクセスキーが利用可能なのはこの一度きりです。
:::

<Image size="md" img={s3_6} alt="IAMユーザーのアクセスキーを表示してコピーする" border force/>

8. 閉じるをクリックし、ユーザー画面でユーザーを見つけます。

<Image size="md" img={s3_7} alt="ユーザーリストで新しく作成したIAMユーザーを見つける" border force/>

9. ARN (Amazon Resource Name) をコピーして、バケットのアクセスポリシーを設定する際に使用します。

<Image size="md" img={s3_8} alt="IAMユーザーのARNをコピーする" border force/>

### S3バケットの作成 {#create-an-s3-bucket}
1. S3バケットセクションで、**バケットの作成**を選択します。

<Image size="md" img={s3_9} alt="S3バケット作成プロセスの開始" border force/>

2. バケット名を入力し、他のオプションはデフォルトのままにします。
:::note
バケット名はAWS全体で一意でなければなりません。組織内だけでなく、誤ってエラーを発生させないようにしてください。
:::
3. `Block all Public Access`を有効のままにします。公共アクセスは必要ありません。

<Image size="md" img={s3_a} alt="公共アクセスをブロックしたS3バケット設定の構成" border force/>

4. ページの下部で**バケットの作成**を選択します。

<Image size="md" img={s3_b} alt="S3バケット作成の最終確認" border force/>

5. リンクを選択し、ARNをコピーして、バケットのアクセスポリシーを設定する際に使用します。

6. バケットが作成されたら、S3バケットリストで新しいS3バケットを探し、リンクを選択します。

<Image size="md" img={s3_c} alt="バケットリストで新しく作成したS3バケットを見つける" border force/>

7. **フォルダーの作成**を選択します。

<Image size="md" img={s3_d} alt="S3バケットに新しいフォルダーを作成する" border force/>

8. ClickHouse S3ディスクのターゲットとなるフォルダー名を入力し、**フォルダーの作成**を選択します。

<Image size="md" img={s3_e} alt="ClickHouse S3ディスク使用のためのフォルダー名を設定" border force/>

9. フォルダーがバケットリストに表示されるようになります。

<Image size="md" img={s3_f} alt="S3バケットに新しく作成されたフォルダーを表示" border force/>

10. 新しいフォルダーのチェックボックスを選択し、**URLをコピー**をクリックします。コピーしたURLは、次のセクションのClickHouseストレージ設定で使用します。

<Image size="md" img={s3_g} alt="ClickHouse設定用のS3フォルダーURLをコピー" border force/>

11. **権限**タブを選択し、**バケットポリシー**セクションで**編集**ボタンをクリックします。

<Image size="md" img={s3_h} alt="S3バケットポリシー設定にアクセス" border force/>

12. バケットポリシーを追加し、以下の例を参考にします：
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
|Parameter | 説明 | 例の値 |
|----------|-------------|----------------|
|Version | ポリシーインタープリターのバージョン、そのままにします | 2012-10-17 |
|Sid | ユーザー定義のポリシーID | abc123 |
|Effect | ユーザーのリクエストが許可されるか否か | Allow |
|Principal | 許可されるアカウントまたはユーザー | arn:aws:iam::921234567898:user/mars-s3-user |
|Action | バケットに対して許可される操作 | s3:* |
|Resource | バケット内で操作が許可されるリソース | "arn:aws:s3:::mars-doc-test", "arn:aws:s3:::mars-doc-test/*" |
```

:::note
権限については、セキュリティチームと協力して決定してください。これらを出発点としてください。
ポリシーや設定に関する詳細は、AWSの文書を参照してください：
https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
:::

13. ポリシー設定を保存します。

</details>
