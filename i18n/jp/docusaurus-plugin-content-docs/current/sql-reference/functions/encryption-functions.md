---
slug: '/sql-reference/functions/encryption-functions'
sidebar_position: 70
sidebar_label: '暗号化'
---


# 暗号化関数

これらの関数は、AES（Advanced Encryption Standard）アルゴリズムを用いてデータの暗号化と復号化を実装します。

キーの長さは暗号化モードによって異なります。`-128-`、`-196-`、`-256-` モードでは、それぞれ16、24、32バイトです。

初期化ベクトルの長さは常に16バイト（16バイトを超えるバイトは無視されます）です。

これらの関数は、ClickHouse 21.1まで遅く動作することに注意してください。

## encrypt {#encrypt}

この関数は、以下のモードを使用してデータを暗号化します。

- aes-128-ecb, aes-192-ecb, aes-256-ecb
- aes-128-cbc, aes-192-cbc, aes-256-cbc
- aes-128-ofb, aes-192-ofb, aes-256-ofb
- aes-128-gcm, aes-192-gcm, aes-256-gcm
- aes-128-ctr, aes-192-ctr, aes-256-ctr
- aes-128-cfb, aes-128-cfb1, aes-128-cfb8

**構文**

``` sql
encrypt('mode', 'plaintext', 'key' [, iv, aad])
```

**引数**

- `mode` — 暗号化モード。 [String](/sql-reference/data-types/string).
- `plaintext` — 暗号化する必要のあるテキスト。 [String](/sql-reference/data-types/string).
- `key` — 暗号化キー。 [String](/sql-reference/data-types/string).
- `iv` — 初期化ベクトル。`-gcm` モードでは必須、他のモードではオプション。 [String](/sql-reference/data-types/string).
- `aad` — 追加の認証データ。暗号化されませんが、復号化に影響します。`-gcm` モードでのみ機能し、その他のモードでは例外をスローします。 [String](/sql-reference/data-types/string).

**返される値**

- 暗号文のバイナリ文字列。 [String](/sql-reference/data-types/string).

**例**

このテーブルを作成します:

クエリ:

``` sql
CREATE TABLE encryption_test
(
    `comment` String,
    `secret` String
)
ENGINE = Memory;
```

データを挿入します（この鍵/ ivをデータベースに保存することは安全ではありません）。また、「ヒント」を保存することも安全ではなく、説明目的のみで使用されます:

クエリ:

``` sql
INSERT INTO encryption_test VALUES('aes-256-ofb no IV', encrypt('aes-256-ofb', 'Secret', '12345678910121314151617181920212')),\
('aes-256-ofb no IV, different key', encrypt('aes-256-ofb', 'Secret', 'keykeykeykeykeykeykeykeykeykeyke')),\
('aes-256-ofb with IV', encrypt('aes-256-ofb', 'Secret', '12345678910121314151617181920212', 'iviviviviviviviv')),\
('aes-256-cbc no IV', encrypt('aes-256-cbc', 'Secret', '12345678910121314151617181920212'));
```

クエリ:

``` sql
SELECT comment, hex(secret) FROM encryption_test;
```

結果:

``` text
┌─comment──────────────────────────┬─hex(secret)──────────────────────┐
│ aes-256-ofb no IV                │ B4972BDC4459                     │
│ aes-256-ofb no IV, different key │ 2FF57C092DC9                     │
│ aes-256-ofb with IV              │ 5E6CB398F653                     │
│ aes-256-cbc no IV                │ 1BC0629A92450D9E73A00E7D02CF4142 │
└──────────────────────────────────┴──────────────────────────────────┘
```

`-gcm` を使用した例:

クエリ:

``` sql
INSERT INTO encryption_test VALUES('aes-256-gcm', encrypt('aes-256-gcm', 'Secret', '12345678910121314151617181920212', 'iviviviviviviviv')), \
('aes-256-gcm with AAD', encrypt('aes-256-gcm', 'Secret', '12345678910121314151617181920212', 'iviviviviviviviv', 'aad'));

SELECT comment, hex(secret) FROM encryption_test WHERE comment LIKE '%gcm%';
```

結果:

``` text
┌─comment──────────────┬─hex(secret)──────────────────────────────────┐
│ aes-256-gcm          │ A8A3CCBC6426CFEEB60E4EAE03D3E94204C1B09E0254 │
│ aes-256-gcm with AAD │ A8A3CCBC6426D9A1017A0A932322F1852260A4AD6837 │
└──────────────────────┴──────────────────────────────────────────────┘
```

## aes_encrypt_mysql {#aes_encrypt_mysql}

MySQLの暗号化と互換性があり、暗号文は [AES_DECRYPT](https://dev.mysql.com/doc/refman/8.0/en/encryption-functions.html#function_aes-decrypt) 関数で復号化できます。

同じ入力に対して `encrypt` と同じ暗号文を生成します。しかし、`key` または `iv` が通常の長さを超える場合、`aes_encrypt_mysql` はMySQLの `aes_encrypt` が行うことに従って、`key` を「折り畳み」、余分なビットの `iv` を無視します。

サポートされている暗号化モード：

- aes-128-ecb, aes-192-ecb, aes-256-ecb
- aes-128-cbc, aes-192-cbc, aes-256-cbc
- aes-128-ofb, aes-192-ofb, aes-256-ofb

**構文**

``` sql
aes_encrypt_mysql('mode', 'plaintext', 'key' [, iv])
```

**引数**

- `mode` — 暗号化モード。 [String](/sql-reference/data-types/string).
- `plaintext` — 暗号化する必要のあるテキスト。 [String](/sql-reference/data-types/string).
- `key` — 暗号化キー。モードごとに必要な長さより長い場合、MySQL特有のキーの折り畳みが行われます。 [String](/sql-reference/data-types/string).
- `iv` — 初期化ベクトル。オプションですが、最初の16バイトのみが考慮されます。 [String](/sql-reference/data-types/string).

**返される値**

- 暗号文のバイナリ文字列。 [String](/sql-reference/data-types/string).

**例**

入力が等しい場合、`encrypt` と `aes_encrypt_mysql` は同じ暗号文を生成します:

クエリ:

``` sql
SELECT encrypt('aes-256-ofb', 'Secret', '12345678910121314151617181920212', 'iviviviviviviviv') = aes_encrypt_mysql('aes-256-ofb', 'Secret', '12345678910121314151617181920212', 'iviviviviviviviv') AS ciphertexts_equal;
```

結果:

```response
┌─ciphertexts_equal─┐
│                 1 │
└───────────────────┘
```

しかし、`key` または `iv` が予想より長い場合、`encrypt` は失敗します:

クエリ:

``` sql
SELECT encrypt('aes-256-ofb', 'Secret', '123456789101213141516171819202122', 'iviviviviviviviv123');
```

結果:

``` text
Received exception from server (version 22.6.1):
Code: 36. DB::Exception: Received from localhost:9000. DB::Exception: Invalid key size: 33 expected 32: While processing encrypt('aes-256-ofb', 'Secret', '123456789101213141516171819202122', 'iviviviviviviviv123').
```

一方、`aes_encrypt_mysql` はMySQL互換の出力を生成します:

クエリ:

``` sql
SELECT hex(aes_encrypt_mysql('aes-256-ofb', 'Secret', '123456789101213141516171819202122', 'iviviviviviviviv123')) AS ciphertext;
```

結果:

```response
┌─ciphertext───┐
│ 24E9E4966469 │
└──────────────┘
```

さらに長い `IV` を指定しても同じ結果が得られます。

クエリ:

``` sql
SELECT hex(aes_encrypt_mysql('aes-256-ofb', 'Secret', '123456789101213141516171819202122', 'iviviviviviviviv123456')) AS ciphertext
```

結果:

``` text
┌─ciphertext───┐
│ 24E9E4966469 │
└──────────────┘
```

これは、同じ入力でMySQLが生成するものと同じバイナリです:

``` sql
mysql> SET  block_encryption_mode='aes-256-ofb';
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT aes_encrypt('Secret', '123456789101213141516171819202122', 'iviviviviviviviv123456') as ciphertext;
+------------------------+
| ciphertext             |
+------------------------+
| 0x24E9E4966469         |
+------------------------+
1 row in set (0.00 sec)
```

## decrypt {#decrypt}

この関数は、以下のモードを使用して暗号文を平文に復号化します。

- aes-128-ecb, aes-192-ecb, aes-256-ecb
- aes-128-cbc, aes-192-cbc, aes-256-cbc
- aes-128-ofb, aes-192-ofb, aes-256-ofb
- aes-128-gcm, aes-192-gcm, aes-256-gcm
- aes-128-ctr, aes-192-ctr, aes-256-ctr
- aes-128-cfb, aes-128-cfb1, aes-128-cfb8

**構文**

``` sql
decrypt('mode', 'ciphertext', 'key' [, iv, aad])
```

**引数**

- `mode` — 復号化モード。 [String](/sql-reference/data-types/string).
- `ciphertext` — 復号化する必要のある暗号化されたテキスト。 [String](/sql-reference/data-types/string).
- `key` — 復号化キー。 [String](/sql-reference/data-types/string).
- `iv` — 初期化ベクトル。`-gcm` モードでは必須、他のモードではオプション。 [String](/sql-reference/data-types/string).
- `aad` — 追加の認証データ。この値が誤っている場合は復号化しません。`-gcm` モードでのみ機能し、他のモードでは例外をスローします。 [String](/sql-reference/data-types/string).

**返される値**

- 復号化された文字列。 [String](/sql-reference/data-types/string).

**例**

[encrypt](#encrypt) からテーブルを再利用します。

クエリ:

``` sql
SELECT comment, hex(secret) FROM encryption_test;
```

結果:

``` text
┌─comment──────────────┬─hex(secret)──────────────────────────────────┐
│ aes-256-gcm          │ A8A3CCBC6426CFEEB60E4EAE03D3E94204C1B09E0254 │
│ aes-256-gcm with AAD │ A8A3CCBC6426D9A1017A0A932322F1852260A4AD6837 │
└──────────────────────┴──────────────────────────────────────────────┘
┌─comment──────────────────────────┬─hex(secret)──────────────────────┐
│ aes-256-ofb no IV                │ B4972BDC4459                     │
│ aes-256-ofb no IV, different key │ 2FF57C092DC9                     │
│ aes-256-ofb with IV              │ 5E6CB398F653                     │
│ aes-256-cbc no IV                │ 1BC0629A92450D9E73A00E7D02CF4142 │
└──────────────────────────────────┴──────────────────────────────────┘
```

では、すべてのデータを復号化してみましょう。

クエリ:

``` sql
SELECT comment, decrypt('aes-256-cfb128', secret, '12345678910121314151617181920212') as plaintext FROM encryption_test
```

結果:

``` text
┌─comment──────────────┬─plaintext──┐
│ aes-256-gcm          │ OQ�E
                             �t�7T�\���\�   │
│ aes-256-gcm with AAD │ OQ�E
                             �\��si����;�o�� │
└──────────────────────┴────────────┘
┌─comment──────────────────────────┬─plaintext─┐
│ aes-256-ofb no IV                │ Secret    │
│ aes-256-ofb no IV, different key │ �4�
                                        �         │
│ aes-256-ofb with IV              │ ���6�~        │
 │aes-256-cbc no IV                │ �2*4�h3c�4w��@
└──────────────────────────────────┴───────────┘
```

どのデータが正しく復号化されたか、そして残りがなぜ異常になるのかに注意してください。`mode`、`key`、または `iv` のいずれかが暗号化時に異なっていたためです。

## tryDecrypt {#trydecrypt}

`decrypt` と似ていますが、復号化に失敗した場合はNULLを返します。

**例**

`user_id` が一意なユーザーIDで、`encrypted` が暗号化された文字列フィールド、`iv` が復号化/暗号化の初期ベクトルであるテーブルを作成します。ユーザーは自分のIDと復号化に使用するキーを知っていると仮定します。

```sql
CREATE TABLE decrypt_null (
  dt DateTime,
  user_id UInt32,
  encrypted String,
  iv String
) ENGINE = Memory;
```

データを挿入します:

```sql
INSERT INTO decrypt_null VALUES
    ('2022-08-02 00:00:00', 1, encrypt('aes-256-gcm', 'value1', 'keykeykeykeykeykeykeykeykeykey01', 'iv1'), 'iv1'),
    ('2022-09-02 00:00:00', 2, encrypt('aes-256-gcm', 'value2', 'keykeykeykeykeykeykeykeykeykey02', 'iv2'), 'iv2'),
    ('2022-09-02 00:00:01', 3, encrypt('aes-256-gcm', 'value3', 'keykeykeykeykeykeykeykeykeykey03', 'iv3'), 'iv3');
```

クエリ:

```sql
SELECT
    dt,
    user_id,
    tryDecrypt('aes-256-gcm', encrypted, 'keykeykeykeykeykeykeykeykeykey02', iv) AS value
FROM decrypt_null
ORDER BY user_id ASC
```

結果:

```response
┌──────────────────dt─┬─user_id─┬─value──┐
│ 2022-08-02 00:00:00 │       1 │ ᴺᵁᴸᴸ   │
│ 2022-09-02 00:00:00 │       2 │ value2 │
│ 2022-09-02 00:00:01 │       3 │ ᴺᵁᴸᴸ   │
└─────────────────────┴─────────┴────────┘
```

## aes_decrypt_mysql {#aes_decrypt_mysql}

MySQLの暗号化と互換性があり、[AES_ENCRYPT](https://dev.mysql.com/doc/refman/8.0/en/encryption-functions.html#function_aes-encrypt) 関数で暗号化されたデータを復号化します。

同じ入力で `decrypt` と同じ平文を生成します。しかし、`key` または `iv` が通常の長さを超える場合、`aes_decrypt_mysql` はMySQLの `aes_decrypt` が行うことに従って、`key` を「折り畳み」、余分なビットの `IV` を無視します。

サポートされている復号化モード：

- aes-128-ecb, aes-192-ecb, aes-256-ecb
- aes-128-cbc, aes-192-cbc, aes-256-cbc
- aes-128-cfb128
- aes-128-ofb, aes-192-ofb, aes-256-ofb

**構文**

``` sql
aes_decrypt_mysql('mode', 'ciphertext', 'key' [, iv])
```

**引数**

- `mode` — 復号化モード。 [String](/sql-reference/data-types/string).
- `ciphertext` — 復号化する必要のある暗号化されたテキスト。 [String](/sql-reference/data-types/string).
- `key` — 復号化キー。 [String](/sql-reference/data-types/string).
- `iv` — 初期化ベクトル。オプション。 [String](/sql-reference/data-types/string).

**返される値**

- 復号化された文字列。 [String](/sql-reference/data-types/string).

**例**

MySQLで以前に暗号化したデータを復号化してみましょう。

``` sql
mysql> SET  block_encryption_mode='aes-256-ofb';
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT aes_encrypt('Secret', '123456789101213141516171819202122', 'iviviviviviviviv123456') as ciphertext;
+------------------------+
| ciphertext             |
+------------------------+
| 0x24E9E4966469         |
+------------------------+
1 row in set (0.00 sec)
```

クエリ:

``` sql
SELECT aes_decrypt_mysql('aes-256-ofb', unhex('24E9E4966469'), '123456789101213141516171819202122', 'iviviviviviviviv123456') AS plaintext
```

結果:

``` text
┌─plaintext─┐
│ Secret    │
└───────────┘
```
