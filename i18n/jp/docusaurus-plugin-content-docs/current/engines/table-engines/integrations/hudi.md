---
slug: /engines/table-engines/integrations/hudi
sidebar_position: 86
sidebar_label: Hudi
title: "Hudi テーブルエンジン"
description: "このエンジンは、Amazon S3 にある既存の Apache Hudi テーブルとのリードオンリー統合を提供します。"
---


# Hudi テーブルエンジン

このエンジンは、Amazon S3 にある既存の Apache [Hudi](https://hudi.apache.org/) テーブルとのリードオンリー統合を提供します。

## テーブルの作成 {#create-table}

Hudi テーブルはすでに S3 に存在する必要があります。このコマンドでは、新しいテーブルを作成するための DDL パラメータは受け付けません。

``` sql
CREATE TABLE hudi_table
    ENGINE = Hudi(url, [aws_access_key_id, aws_secret_access_key,])
```

**エンジンパラメータ**

- `url` — 既存の Hudi テーブルへのパスを持つバケット URL。
- `aws_access_key_id`, `aws_secret_access_key` - [AWS](https://aws.amazon.com/) アカウントユーザーの長期的な資格情報。これを使用してリクエストを認証できます。パラメータはオプションです。資格情報が指定されていない場合は、設定ファイルから使用されます。

エンジンパラメータは、[Named Collections](/operations/named-collections.md) を使用して指定できます。

**例**

```sql
CREATE TABLE hudi_table ENGINE=Hudi('http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/test_table/', 'ABC123', 'Abc+123')
```

名前付きコレクションを使用する場合:

``` xml
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

## 参照 {#see-also}

- [hudi テーブル関数](/sql-reference/table-functions/hudi.md)
