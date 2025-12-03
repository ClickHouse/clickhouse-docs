---
description: 'このエンジンは、Amazon S3 上にある既存の Delta Lake テーブルへの読み取り専用統合を提供します。'
sidebar_label: 'DeltaLake'
sidebar_position: 40
slug: /engines/table-engines/integrations/deltalake
title: 'DeltaLake テーブルエンジン'
doc_type: 'reference'
---



# DeltaLake テーブルエンジン {#deltalake-table-engine}

このエンジンは、Amazon S3 上に存在する既存の [Delta Lake](https://github.com/delta-io/delta) テーブルとの読み取り専用の連携を提供します。



## テーブルを作成する {#create-table}

Delta Lake テーブルはあらかじめ S3 上に存在している必要があり、このコマンドでは新しいテーブルを作成するための DDL パラメータは指定できません。

```sql
CREATE TABLE deltalake
    ENGINE = DeltaLake(url, [aws_access_key_id, aws_secret_access_key,])
```

**エンジンパラメータ**

* `url` — 既存の Delta Lake テーブルへのパスを含むバケットの URL。
* `aws_access_key_id`, `aws_secret_access_key` - [AWS](https://aws.amazon.com/) アカウントユーザーの長期的に有効な認証情報。リクエストの認証に使用できます。パラメータは省略可能です。認証情報が指定されていない場合は、設定ファイルで指定されたものが使用されます。

エンジンパラメータは [Named Collections](/operations/named-collections.md) を使用して指定できます。

**例**

```sql
CREATE TABLE deltalake ENGINE=DeltaLake('http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/test_table/', 'ABC123', 'Abc+123')
```

名前付きコレクションの使用:

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

`Iceberg` テーブルエンジンおよびテーブル関数は、`S3`、`AzureBlobStorage`、`HDFS` ストレージと同様に、データキャッシュをサポートします。詳細は[こちら](../../../engines/table-engines/integrations/s3.md#data-cache)を参照してください。


## 関連項目 {#see-also}

- [deltaLake テーブル関数](../../../sql-reference/table-functions/deltalake.md)
