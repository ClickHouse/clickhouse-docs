---
slug: /sql-reference/functions/encryption-functions
sidebar_position: 70
sidebar_label: '加密'
---


# 加密函数

这些函数使用 AES（高级加密标准）算法实现数据的加密和解密。

密钥长度取决于加密模式。对于 `-128-`、`-196-` 和 `-256-` 模式，密钥长度分别为 16、24 和 32 字节。

初始化向量长度始终为 16 字节（超过 16 字节的字节将被忽略）。

请注意，在 ClickHouse 21.1 之前，这些函数的运行速度较慢。

## encrypt {#encrypt}

此函数使用以下模式加密数据：

- aes-128-ecb, aes-192-ecb, aes-256-ecb
- aes-128-cbc, aes-192-cbc, aes-256-cbc
- aes-128-ofb, aes-192-ofb, aes-256-ofb
- aes-128-gcm, aes-192-gcm, aes-256-gcm
- aes-128-ctr, aes-192-ctr, aes-256-ctr
- aes-128-cfb, aes-128-cfb1, aes-128-cfb8

**语法**

``` sql
encrypt('mode', 'plaintext', 'key' [, iv, aad])
```

**参数**

- `mode` — 加密模式。 [String](/sql-reference/data-types/string).
- `plaintext` — 需要加密的文本。 [String](/sql-reference/data-types/string).
- `key` — 加密密钥。 [String](/sql-reference/data-types/string).
- `iv` — 初始化向量。对于 `-gcm` 模式为必填，其他模式为可选。 [String](/sql-reference/data-types/string).
- `aad` — 附加认证数据。它不会被加密，但会影响解密。仅在 `-gcm` 模式下有效，对于其他模式将抛出异常。 [String](/sql-reference/data-types/string).

**返回值**

- 密文二进制字符串。 [String](/sql-reference/data-types/string).

**示例**

创建此表：

查询：

``` sql
CREATE TABLE encryption_test
(
    `comment` String,
    `secret` String
)
ENGINE = Memory;
```

插入一些数据（请避免将密钥/IV 存储在数据库中，这会破坏加密的整个概念），同时存储“提示”也是不安全的，仅用于说明目的：

查询：

``` sql
INSERT INTO encryption_test VALUES('aes-256-ofb no IV', encrypt('aes-256-ofb', 'Secret', '12345678910121314151617181920212')),\
('aes-256-ofb no IV, different key', encrypt('aes-256-ofb', 'Secret', 'keykeykeykeykeykeykeykeykeykeyke')),\
('aes-256-ofb with IV', encrypt('aes-256-ofb', 'Secret', '12345678910121314151617181920212', 'iviviviviviviviv')),\
('aes-256-cbc no IV', encrypt('aes-256-cbc', 'Secret', '12345678910121314151617181920212'));
```

查询：

``` sql
SELECT comment, hex(secret) FROM encryption_test;
```

结果：

``` text
┌─comment──────────────────────────┬─hex(secret)──────────────────────┐
│ aes-256-ofb no IV                │ B4972BDC4459                     │
│ aes-256-ofb no IV, different key │ 2FF57C092DC9                     │
│ aes-256-ofb with IV              │ 5E6CB398F653                     │
│ aes-256-cbc no IV                │ 1BC0629A92450D9E73A00E7D02CF4142 │
└──────────────────────────────────┴──────────────────────────────────┘
```

`-gcm` 模式示例：

查询：

``` sql
INSERT INTO encryption_test VALUES('aes-256-gcm', encrypt('aes-256-gcm', 'Secret', '12345678910121314151617181920212', 'iviviviviviviviv')), \
('aes-256-gcm with AAD', encrypt('aes-256-gcm', 'Secret', '12345678910121314151617181920212', 'iviviviviviviviv', 'aad'));

SELECT comment, hex(secret) FROM encryption_test WHERE comment LIKE '%gcm%';
```

结果：

``` text
┌─comment──────────────┬─hex(secret)──────────────────────────────────┐
│ aes-256-gcm          │ A8A3CCBC6426CFEEB60E4EAE03D3E94204C1B09E0254 │
│ aes-256-gcm with AAD │ A8A3CCBC6426D9A1017A0A932322F1852260A4AD6837 │
└──────────────────────┴──────────────────────────────────────────────┘
```

## aes_encrypt_mysql {#aes_encrypt_mysql}

与 MySQL 加密兼容，生成的密文可以使用 [AES_DECRYPT](https://dev.mysql.com/doc/refman/8.0/en/encryption-functions.html#function_aes-decrypt) 函数解密。

在相同输入下，将产生与 `encrypt` 相同的密文。但是，当 `key` 或 `iv` 长度大于预期时，`aes_encrypt_mysql` 将遵循 MySQL 的 `aes_encrypt` 操作：'折叠' `key` 并忽略多余的 `iv` 位。

支持的加密模式：

- aes-128-ecb, aes-192-ecb, aes-256-ecb
- aes-128-cbc, aes-192-cbc, aes-256-cbc
- aes-128-ofb, aes-192-ofb, aes-256-ofb

**语法**

``` sql
aes_encrypt_mysql('mode', 'plaintext', 'key' [, iv])
```

**参数**

- `mode` — 加密模式。 [String](/sql-reference/data-types/string).
- `plaintext` — 需要加密的文本。 [String](/sql-reference/data-types/string).
- `key` — 加密密钥。如果密钥长度超过模式要求的长度，将执行 MySQL 特定的密钥折叠。 [String](/sql-reference/data-types/string).
- `iv` — 初始化向量。可选，仅考虑前 16 字节 [String](/sql-reference/data-types/string).

**返回值**

- 密文二进制字符串。 [String](/sql-reference/data-types/string).

**示例**

对于相同输入，`encrypt` 和 `aes_encrypt_mysql` 产生相同的密文：

查询：

``` sql
SELECT encrypt('aes-256-ofb', 'Secret', '12345678910121314151617181920212', 'iviviviviviviviv') = aes_encrypt_mysql('aes-256-ofb', 'Secret', '12345678910121314151617181920212', 'iviviviviviviviv') AS ciphertexts_equal;
```

结果：

```response
┌─ciphertexts_equal─┐
│                 1 │
└───────────────────┘
```

但是，当 `key` 或 `iv` 长于预期时，`encrypt` 会失败：

查询：

``` sql
SELECT encrypt('aes-256-ofb', 'Secret', '123456789101213141516171819202122', 'iviviviviviviviv123');
```

结果：

``` text
从服务器收到的异常 (版本 22.6.1):
代码: 36. DB::Exception: 从 localhost:9000 接收。DB::Exception: 密钥大小无效：33，期望为 32: 在处理 encrypt('aes-256-ofb', 'Secret', '123456789101213141516171819202122', 'iviviviviviviviv123') 时。
```

而 `aes_encrypt_mysql` 产生与 MySQL 兼容的输出：

查询：

``` sql
SELECT hex(aes_encrypt_mysql('aes-256-ofb', 'Secret', '123456789101213141516171819202122', 'iviviviviviviviv123')) AS ciphertext;
```

结果：

```response
┌─ciphertext───┐
│ 24E9E4966469 │
└──────────────┘
```

请注意，即使提供更长的 `IV` 也会产生相同的结果：

查询：

``` sql
SELECT hex(aes_encrypt_mysql('aes-256-ofb', 'Secret', '123456789101213141516171819202122', 'iviviviviviviviv123456')) AS ciphertext;
```

结果：

``` text
┌─ciphertext───┐
│ 24E9E4966469 │
└──────────────┘
```

这与 MySQL 在相同输入下的输出是二进制相等的：

``` sql
mysql> SET  block_encryption_mode='aes-256-ofb';
查询 OK，0 行受影响 (0.00 秒)

mysql> SELECT aes_encrypt('Secret', '123456789101213141516171819202122', 'iviviviviviviviv123456') as ciphertext;
+------------------------+
| ciphertext             |
+------------------------+
| 0x24E9E4966469         |
+------------------------+
1 row in set (0.00 sec)
```

## decrypt {#decrypt}

此函数使用以下模式解密密文为明文：

- aes-128-ecb, aes-192-ecb, aes-256-ecb
- aes-128-cbc, aes-192-cbc, aes-256-cbc
- aes-128-ofb, aes-192-ofb, aes-256-ofb
- aes-128-gcm, aes-192-gcm, aes-256-gcm
- aes-128-ctr, aes-192-ctr, aes-256-ctr
- aes-128-cfb, aes-128-cfb1, aes-128-cfb8

**语法**

``` sql
decrypt('mode', 'ciphertext', 'key' [, iv, aad])
```

**参数**

- `mode` — 解密模式。 [String](/sql-reference/data-types/string).
- `ciphertext` — 需要解密的加密文本。 [String](/sql-reference/data-types/string).
- `key` — 解密密钥。 [String](/sql-reference/data-types/string).
- `iv` — 初始化向量。对于 `-gcm` 模式为必填，其他模式为可选。 [String](/sql-reference/data-types/string).
- `aad` — 附加认证数据。如果这个值不正确，则不会解密。仅在 `-gcm` 模式下有效，对于其他模式将抛出异常。 [String](/sql-reference/data-types/string).

**返回值**

- 解密后的字符串。 [String](/sql-reference/data-types/string).

**示例**

重用来自 [encrypt](#encrypt) 的表。

查询：

``` sql
SELECT comment, hex(secret) FROM encryption_test;
```

结果：

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

现在让我们尝试解密所有数据。

查询：

``` sql
SELECT comment, decrypt('aes-256-cfb128', secret, '12345678910121314151617181920212') as plaintext FROM encryption_test
```

结果：

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

注意，只有一部分数据被正确解密，其余则是乱码，因为在加密时 `mode`、`key` 或 `iv` 不同。

## tryDecrypt {#trydecrypt}

与 `decrypt` 类似，但如果因使用了错误的密钥而导致解密失败，则返回 NULL。

**示例**

我们创建一个表，其中 `user_id` 是唯一用户 ID，`encrypted` 是加密字符串字段，`iv` 是用于解密/加密的初始向量。假设用户知道他们的 ID 及其解密字段的密钥：

```sql
CREATE TABLE decrypt_null (
  dt DateTime,
  user_id UInt32,
  encrypted String,
  iv String
) ENGINE = Memory;
```

插入一些数据：

```sql
INSERT INTO decrypt_null VALUES
    ('2022-08-02 00:00:00', 1, encrypt('aes-256-gcm', 'value1', 'keykeykeykeykeykeykeykeykeykey01', 'iv1'), 'iv1'),
    ('2022-09-02 00:00:00', 2, encrypt('aes-256-gcm', 'value2', 'keykeykeykeykeykeykeykeykeykey02', 'iv2'), 'iv2'),
    ('2022-09-02 00:00:01', 3, encrypt('aes-256-gcm', 'value3', 'keykeykeykeykeykeykeykeykeykey03', 'iv3'), 'iv3');
```

查询：

```sql
SELECT
    dt,
    user_id,
    tryDecrypt('aes-256-gcm', encrypted, 'keykeykeykeykeykeykeykeykeykey02', iv) AS value
FROM decrypt_null
ORDER BY user_id ASC
```

结果：

```response
┌──────────────────dt─┬─user_id─┬─value──┐
│ 2022-08-02 00:00:00 │       1 │ ᴺᵁᴸᴸ   │
│ 2022-09-02 00:00:00 │       2 │ value2 │
│ 2022-09-02 00:00:01 │       3 │ ᴺᵁᴸᴸ   │
└─────────────────────┴─────────┴────────┘
```

## aes_decrypt_mysql {#aes_decrypt_mysql}

与 MySQL 加密兼容，解密使用 [AES_ENCRYPT](https://dev.mysql.com/doc/refman/8.0/en/encryption-functions.html#function_aes-encrypt) 函数加密的数据。

在相同输入下，将生成与 `decrypt` 相同的明文。但是，当 `key` 或 `iv` 长度超过正常长度时，`aes_decrypt_mysql` 将遵循 MySQL 的 `aes_decrypt` 处理方式：'折叠' `key` 并忽略多余的 `IV` 位。

支持的解密模式：

- aes-128-ecb, aes-192-ecb, aes-256-ecb
- aes-128-cbc, aes-192-cbc, aes-256-cbc
- aes-128-cfb128
- aes-128-ofb, aes-192-ofb, aes-256-ofb

**语法**

``` sql
aes_decrypt_mysql('mode', 'ciphertext', 'key' [, iv])
```

**参数**

- `mode` — 解密模式。 [String](/sql-reference/data-types/string).
- `ciphertext` — 需要解密的加密文本。 [String](/sql-reference/data-types/string).
- `key` — 解密密钥。 [String](/sql-reference/data-types/string).
- `iv` — 初始化向量。可选。 [String](/sql-reference/data-types/string).

**返回值**

- 解密后的字符串。 [String](/sql-reference/data-types/string).

**示例**

让我们解密之前使用 MySQL 加密的数据：

``` sql
mysql> SET  block_encryption_mode='aes-256-ofb';
查询 OK，0 行受影响 (0.00 秒)

mysql> SELECT aes_encrypt('Secret', '123456789101213141516171819202122', 'iviviviviviviviv123456') as ciphertext;
+------------------------+
| ciphertext             |
+------------------------+
| 0x24E9E4966469         |
+------------------------+
1 row in set (0.00 sec)
```

查询：

``` sql
SELECT aes_decrypt_mysql('aes-256-ofb', unhex('24E9E4966469'), '123456789101213141516171819202122', 'iviviviviviviviv123456') AS plaintext
```

结果：

``` text
┌─plaintext─┐
│ Secret    │
└───────────┘
```
