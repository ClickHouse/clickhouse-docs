---
'description': '加密函数的 Documentation'
'sidebar_label': 'Encryption'
'sidebar_position': 70
'slug': '/sql-reference/functions/encryption-functions'
'title': '加密函数'
---


# 加密函数

这些函数使用 AES (高级加密标准) 算法实现数据的加密和解密。

密钥长度取决于加密模式。对于 `-128-`、`-196-` 和 `-256-` 模式，长度分别为 16、24 和 32 字节。

初始化向量的长度始终为 16 字节（超出 16 字节的字节将被忽略）。

请注意，这些函数在 ClickHouse 21.1 之前运行缓慢。

## encrypt {#encrypt}

该函数使用以下模式加密数据：

- aes-128-ecb, aes-192-ecb, aes-256-ecb
- aes-128-cbc, aes-192-cbc, aes-256-cbc
- aes-128-ofb, aes-192-ofb, aes-256-ofb
- aes-128-gcm, aes-192-gcm, aes-256-gcm
- aes-128-ctr, aes-192-ctr, aes-256-ctr
- aes-128-cfb, aes-128-cfb1, aes-128-cfb8

**语法**

```sql
encrypt('mode', 'plaintext', 'key' [, iv, aad])
```

**参数**

- `mode` — 加密模式。 [String](/sql-reference/data-types/string)。
- `plaintext` — 需要加密的文本。 [String](/sql-reference/data-types/string)。
- `key` — 加密密钥。 [String](/sql-reference/data-types/string)。
- `iv` — 初始化向量。 对于 `-gcm` 模式是必需的，对于其他模式是可选的。 [String](/sql-reference/data-types/string)。
- `aad` — 附加认证数据。它不被加密，但会影响解密。仅在 `-gcm` 模式下有效，对于其他模式会抛出异常。 [String](/sql-reference/data-types/string)。

**返回值**

- 密文二进制字符串。 [String](/sql-reference/data-types/string)。

**示例**

创建此表：

查询：

```sql
CREATE TABLE encryption_test
(
    `comment` String,
    `secret` String
)
ENGINE = Memory;
```

插入一些数据（请避免将密钥/iv 存储在数据库中，因为这会破坏加密的整个概念）；同时存储“提示”也不安全，仅用于说明目的：

查询：

```sql
INSERT INTO encryption_test VALUES('aes-256-ofb no IV', encrypt('aes-256-ofb', 'Secret', '12345678910121314151617181920212')),\
('aes-256-ofb no IV, different key', encrypt('aes-256-ofb', 'Secret', 'keykeykeykeykeykeykeykeykeykeyke')),\
('aes-256-ofb with IV', encrypt('aes-256-ofb', 'Secret', '12345678910121314151617181920212', 'iviviviviviviviv')),\
('aes-256-cbc no IV', encrypt('aes-256-cbc', 'Secret', '12345678910121314151617181920212'));
```

查询：

```sql
SELECT comment, hex(secret) FROM encryption_test;
```

结果：

```text
┌─comment──────────────────────────┬─hex(secret)──────────────────────┐
│ aes-256-ofb no IV                │ B4972BDC4459                     │
│ aes-256-ofb no IV, different key │ 2FF57C092DC9                     │
│ aes-256-ofb with IV              │ 5E6CB398F653                     │
│ aes-256-cbc no IV                │ 1BC0629A92450D9E73A00E7D02CF4142 │
└──────────────────────────────────┴──────────────────────────────────┘
```

使用 `-gcm` 的示例：

查询：

```sql
INSERT INTO encryption_test VALUES('aes-256-gcm', encrypt('aes-256-gcm', 'Secret', '12345678910121314151617181920212', 'iviviviviviviviv')), \
('aes-256-gcm with AAD', encrypt('aes-256-gcm', 'Secret', '12345678910121314151617181920212', 'iviviviviviviviv', 'aad'));

SELECT comment, hex(secret) FROM encryption_test WHERE comment LIKE '%gcm%';
```

结果：

```text
┌─comment──────────────┬─hex(secret)──────────────────────────────────┐
│ aes-256-gcm          │ A8A3CCBC6426CFEEB60E4EAE03D3E94204C1B09E0254 │
│ aes-256-gcm with AAD │ A8A3CCBC6426D9A1017A0A932322F1852260A4AD6837 │
└──────────────────────┴──────────────────────────────────────────────┘
```

## aes_encrypt_mysql {#aes_encrypt_mysql}

与 mysql 加密兼容，结果密文可用 [AES_DECRYPT](https://dev.mysql.com/doc/refman/8.0/en/encryption-functions.html#function_aes-decrypt) 函数解密。

在相同输入下将生成与 `encrypt` 相同的密文。但是当 `key` 或 `iv` 超过正常长度时，`aes_encrypt_mysql` 将遵循 MySQL 的 `aes_encrypt` 所做的：'折叠' `key` 并忽略 `iv` 的多余位。

支持的加密模式：

- aes-128-ecb, aes-192-ecb, aes-256-ecb
- aes-128-cbc, aes-192-cbc, aes-256-cbc
- aes-128-ofb, aes-192-ofb, aes-256-ofb

**语法**

```sql
aes_encrypt_mysql('mode', 'plaintext', 'key' [, iv])
```

**参数**

- `mode` — 加密模式。 [String](/sql-reference/data-types/string)。
- `plaintext` — 需要加密的文本。 [String](/sql-reference/data-types/string)。
- `key` — 加密密钥。如果密钥超过模式所需长度，将执行 MySQL 特有的密钥折叠。 [String](/sql-reference/data-types/string)。
- `iv` — 初始化向量。可选，仅考虑前 16 字节。 [String](/sql-reference/data-types/string)。

**返回值**

- 密文二进制字符串。 [String](/sql-reference/data-types/string)。

**示例**

给定相同输入，`encrypt` 和 `aes_encrypt_mysql` 生成相同的密文：

查询：

```sql
SELECT encrypt('aes-256-ofb', 'Secret', '12345678910121314151617181920212', 'iviviviviviviviv') = aes_encrypt_mysql('aes-256-ofb', 'Secret', '12345678910121314151617181920212', 'iviviviviviviviv') AS ciphertexts_equal;
```

结果：

```response
┌─ciphertexts_equal─┐
│                 1 │
└───────────────────┘
```

但是当 `key` 或 `iv` 超过预期时，`encrypt` 会失败：

查询：

```sql
SELECT encrypt('aes-256-ofb', 'Secret', '123456789101213141516171819202122', 'iviviviviviviviv123');
```

结果：

```text
Received exception from server (version 22.6.1):
Code: 36. DB::Exception: Received from localhost:9000. DB::Exception: Invalid key size: 33 expected 32: While processing encrypt('aes-256-ofb', 'Secret', '123456789101213141516171819202122', 'iviviviviviviviv123').
```

而 `aes_encrypt_mysql` 产生 MySQL 兼容的输出：

查询：

```sql
SELECT hex(aes_encrypt_mysql('aes-256-ofb', 'Secret', '123456789101213141516171819202122', 'iviviviviviviviv123')) AS ciphertext;
```

结果：

```response
┌─ciphertext───┐
│ 24E9E4966469 │
└──────────────┘
```

注意，即使提供更长的 `IV` 也会产生相同的结果。

查询：

```sql
SELECT hex(aes_encrypt_mysql('aes-256-ofb', 'Secret', '123456789101213141516171819202122', 'iviviviviviviviv123456')) AS ciphertext
```

结果：

```text
┌─ciphertext───┐
│ 24E9E4966469 │
└──────────────┘
```

这与 MySQL 对相同输入生成的结果是二进制相等的：

```sql
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

此函数使用以下模式将密文解密为明文：

- aes-128-ecb, aes-192-ecb, aes-256-ecb
- aes-128-cbc, aes-192-cbc, aes-256-cbc
- aes-128-ofb, aes-192-ofb, aes-256-ofb
- aes-128-gcm, aes-192-gcm, aes-256-gcm
- aes-128-ctr, aes-192-ctr, aes-256-ctr
- aes-128-cfb, aes-128-cfb1, aes-128-cfb8

**语法**

```sql
decrypt('mode', 'ciphertext', 'key' [, iv, aad])
```

**参数**

- `mode` — 解密模式。 [String](/sql-reference/data-types/string)。
- `ciphertext` — 需要解密的加密文本。 [String](/sql-reference/data-types/string)。
- `key` — 解密密钥。 [String](/sql-reference/data-types/string)。
- `iv` — 初始化向量。对于 `-gcm` 模式是必需的，对于其他模式可选。 [String](/sql-reference/data-types/string)。
- `aad` — 附加认证数据。如果该值不正确将无法解密。仅在 `-gcm` 模式下有效，对于其他模式会抛出异常。 [String](/sql-reference/data-types/string)。

**返回值**

- 解密字符串。 [String](/sql-reference/data-types/string)。

**示例**

重用来自 [encrypt](#encrypt) 的表。

查询：

```sql
SELECT comment, hex(secret) FROM encryption_test;
```

结果：

```text
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

现在让我们尝试解密所有这些数据。

查询：

```sql
SELECT comment, decrypt('aes-256-cfb128', secret, '12345678910121314151617181920212') as plaintext FROM encryption_test
```

结果：

```text
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

请注意，只有一部分数据被正确解密，其余部分则是乱码，因为加密时 `mode`、`key` 或 `iv` 不同。

## tryDecrypt {#trydecrypt}

与 `decrypt` 类似，但如果因使用错误的密钥而解密失败，则返回 NULL。

**示例**

让我们创建一个表，其中 `user_id` 是唯一的用户 ID，`encrypted` 是加密字符串字段，`iv` 是解密/加密的初始向量。假设用户知道他们的 ID 和解密加密字段的密钥：

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

与 mysql 加密兼容，解密用 [AES_ENCRYPT](https://dev.mysql.com/doc/refman/8.0/en/encryption-functions.html#function_aes-encrypt) 函数加密的数据。

在相同输入下将产生与 `decrypt` 相同的明文。但是当 `key` 或 `iv` 超过正常长度时，`aes_decrypt_mysql` 将遵循 MySQL 的 `aes_decrypt` 所做的：'折叠' `key` 并忽略 `IV` 的多余位。

支持的解密模式：

- aes-128-ecb, aes-192-ecb, aes-256-ecb
- aes-128-cbc, aes-192-cbc, aes-256-cbc
- aes-128-cfb128
- aes-128-ofb, aes-192-ofb, aes-256-ofb

**语法**

```sql
aes_decrypt_mysql('mode', 'ciphertext', 'key' [, iv])
```

**参数**

- `mode` — 解密模式。 [String](/sql-reference/data-types/string)。
- `ciphertext` — 需要解密的加密文本。 [String](/sql-reference/data-types/string)。
- `key` — 解密密钥。 [String](/sql-reference/data-types/string)。
- `iv` — 初始化向量。可选。 [String](/sql-reference/data-types/string)。

**返回值**

- 解密字符串。 [String](/sql-reference/data-types/string)。

**示例**

让我们解密之前用 MySQL 加密的数据：

```sql
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

查询：

```sql
SELECT aes_decrypt_mysql('aes-256-ofb', unhex('24E9E4966469'), '123456789101213141516171819202122', 'iviviviviviviviv123456') AS plaintext
```

结果：

```text
┌─plaintext─┐
│ Secret    │
└───────────┘
```

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
