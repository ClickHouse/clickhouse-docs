---
'description': 'このエンジンは、Amazon S3 の既存の Apache Hudi テーブルとの読み取り専用統合を提供します。'
'sidebar_label': 'Hudi'
'sidebar_position': 86
'slug': '/engines/table-engines/integrations/hudi'
'title': 'Hudi テーブルエンジン'
'doc_type': 'reference'
---


# Hudi テーブルエンジン

このエンジンは、Amazon S3 にある既存の Apache [Hudi](https://hudi.apache.org/) テーブルとの読み取り専用統合を提供します。

## テーブルを作成 {#create-table}

Hudi テーブルはすでに S3 に存在する必要があり、このコマンドは新しいテーブルを作成するための DDL パラメータを受け付けません。

```sql
CREATE TABLE hudi_table
    ENGINE = Hudi(url, [aws_access_key_id, aws_secret_access_key,])
```

**エンジンパラメータ**

- `url` — 既存の Hudi テーブルへのパスを含むバケットの URL。
- `aws_access_key_id`, `aws_secret_access_key` - [AWS](https://aws.amazon.com/) アカウントユーザーのための長期的な資格情報。これらを使用してリクエストを認証できます。パラメータは任意です。資格情報が指定されていない場合、設定ファイルから使用されます。

エンジンパラメータは、[Named Collections](/operations/named-collections.md) を使用して指定できます。

**例**

```sql
CREATE TABLE hudi_table ENGINE=Hudi('http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/test_table/', 'ABC123', 'Abc+123')
```

名前付きコレクションを使用する場合：

```xml
<clickhouse>
    <named_collections>
        <hudi_conf>
            <url>http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/</url>
            <access_key_id>ABC123<access_key_id>
            <secret_access_key>Abc+123</secret_access_key>
        </hudi_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE hudi_table ENGINE=Hudi(hudi_conf, filename = 'test_table')
```

## 参考情報 {#see-also}

- [hudi テーブル関数](/sql-reference/table-functions/hudi.md)
