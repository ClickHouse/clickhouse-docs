---
'description': 'このエンジンは、Amazon S3 内の既存の Delta Lake テーブルとの読み取り専用統合を提供します。'
'sidebar_label': 'DeltaLake'
'sidebar_position': 40
'slug': '/engines/table-engines/integrations/deltalake'
'title': 'DeltaLake テーブルエンジン'
'doc_type': 'reference'
---


# DeltaLake テーブルエンジン

このエンジンは、Amazon S3 にある既存の [Delta Lake](https://github.com/delta-io/delta) テーブルとの読み取り専用統合を提供します。

## テーブルの作成 {#create-table}

Delta Lake テーブルはすでに S3 に存在している必要があり、このコマンドは新しいテーブルを作成するための DDL パラメータを受け付けません。

```sql
CREATE TABLE deltalake
    ENGINE = DeltaLake(url, [aws_access_key_id, aws_secret_access_key,])
```

**エンジンパラメータ**

- `url` — 既存の Delta Lake テーブルへのパスを含むバケット URL。
- `aws_access_key_id`, `aws_secret_access_key` - [AWS](https://aws.amazon.com/) アカウントユーザーの長期認証情報。これを使用してリクエストの認証を行うことができます。パラメータはオプションです。認証情報が指定されていない場合は、設定ファイルから使用されます。

エンジンパラメータは、[Named Collections](/operations/named-collections.md) を使用して指定できます。

**例**

```sql
CREATE TABLE deltalake ENGINE=DeltaLake('http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/test_table/', 'ABC123', 'Abc+123')
```

ネームドコレクションを使用する：

```xml
<clickhouse>
    <named_collections>
        <deltalake_conf>
            <url>http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/</url>
            <access_key_id>ABC123<access_key_id>
            <secret_access_key>Abc+123</secret_access_key>
        </deltalake_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE deltalake ENGINE=DeltaLake(deltalake_conf, filename = 'test_table')
```

### データキャッシュ {#data-cache}

`Iceberg` テーブルエンジンおよびテーブル関数は、`S3`、`AzureBlobStorage`、`HDFS` ストレージと同様にデータキャッシュをサポートしています。詳細は [こちら](../../../engines/table-engines/integrations/s3.md#data-cache) を参照してください。

## 参考 {#see-also}

- [deltaLake テーブル関数](../../../sql-reference/table-functions/deltalake.md)
