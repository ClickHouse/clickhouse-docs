---
'description': 'このエンジンは、Amazon S3内の既存の Apache Hudi テーブルとの読み取り専用統合を提供します。'
'sidebar_label': 'Hudi'
'sidebar_position': 86
'slug': '/engines/table-engines/integrations/hudi'
'title': 'Hudi テーブルエンジン'
---




# Hudi テーブルエンジン

このエンジンは、Amazon S3 上の既存の Apache [Hudi](https://hudi.apache.org/) テーブルとの読み取り専用の統合を提供します。

## テーブルの作成 {#create-table}

Hudi テーブルはすでに S3 に存在する必要があります。このコマンドは新しいテーブルを作成するための DDL パラメーターを受け取りません。

```sql
CREATE TABLE hudi_table
    ENGINE = Hudi(url, [aws_access_key_id, aws_secret_access_key,])
```

**エンジンパラメーター**

- `url` — 既存の Hudi テーブルへのパスを含むバケット URL。
- `aws_access_key_id`, `aws_secret_access_key` - [AWS](https://aws.amazon.com/) アカウントユーザーの長期認証情報。これらを使用してリクエストを認証できます。このパラメーターはオプションです。認証情報が指定されていない場合は、設定ファイルから使用されます。

エンジンパラメーターは [Named Collections](/operations/named-collections.md) を使用して指定できます。

**例**

```sql
CREATE TABLE hudi_table ENGINE=Hudi('http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/test_table/', 'ABC123', 'Abc+123')
```

名付けられたコレクションを使用する場合:

```xml
<clickhouse>
    <named_collections>
        <hudi_conf>
            <url>http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/</url>
            <access_key_id>ABC123</access_key_id>
            <secret_access_key>Abc+123</secret_access_key>
        </hudi_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE hudi_table ENGINE=Hudi(hudi_conf, filename = 'test_table')
```

## 関連項目 {#see-also}

- [hudi テーブル関数](/sql-reference/table-functions/hudi.md)
