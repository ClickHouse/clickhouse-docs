---
description: 'Документация для Функций Шифрования'
sidebar_label: 'Шифрование'
sidebar_position: 70
slug: /sql-reference/functions/encryption-functions
title: 'Функции Шифрования'
---


# Функции Шифрования

Эти функции реализуют шифрование и расшифровку данных с использованием алгоритма AES (Advanced Encryption Standard).

Длина ключа зависит от режима шифрования. Для режимов `-128-`, `-196-` и `-256-` она составляет 16, 24 и 32 байта соответственно.

Длина вектора инициализации всегда составляет 16 байт (байты сверх 16 игнорируются).

Обратите внимание, что эти функции работают медленно до ClickHouse 21.1.

## encrypt {#encrypt}

Эта функция шифрует данные, используя следующие режимы:

- aes-128-ecb, aes-192-ecb, aes-256-ecb
- aes-128-cbc, aes-192-cbc, aes-256-cbc
- aes-128-ofb, aes-192-ofb, aes-256-ofb
- aes-128-gcm, aes-192-gcm, aes-256-gcm
- aes-128-ctr, aes-192-ctr, aes-256-ctr
- aes-128-cfb, aes-128-cfb1, aes-128-cfb8

**Синтаксис**

```sql
encrypt('mode', 'plaintext', 'key' [, iv, aad])
```

**Аргументы**

- `mode` — Режим шифрования. [String](/sql-reference/data-types/string).
- `plaintext` — Текст, который нужно зашифтовать. [String](/sql-reference/data-types/string).
- `key` — Ключ шифрования. [String](/sql-reference/data-types/string).
- `iv` — Вектор инициализации. Обязателен для режимов `-gcm`, необязателен для остальных. [String](/sql-reference/data-types/string).
- `aad` — Дополнительные аутентифицированные данные. Не шифруется, но влияет на расшифровку. Работает только в режимах `-gcm`, для остальных вызовет исключение. [String](/sql-reference/data-types/string).

**Возвращаемое значение**

- Зашифрованная двоичная строка. [String](/sql-reference/data-types/string).

**Примеры**

Создайте эту таблицу:

Запрос:

```sql
CREATE TABLE encryption_test
(
    `comment` String,
    `secret` String
)
ENGINE = Memory;
```

Вставьте некоторые данные (пожалуйста, избегайте хранения ключей/векторов инициализации в базе данных, так как это подрывает всю концепцию шифрования), также хранение 'подсказок' небезопасно и используется только в иллюстративных целях:

Запрос:

```sql
INSERT INTO encryption_test VALUES('aes-256-ofb no IV', encrypt('aes-256-ofb', 'Secret', '12345678910121314151617181920212')),\
('aes-256-ofb no IV, different key', encrypt('aes-256-ofb', 'Secret', 'keykeykeykeykeykeykeykeykeykeyke')),\
('aes-256-ofb with IV', encrypt('aes-256-ofb', 'Secret', '12345678910121314151617181920212', 'iviviviviviviviv')),\
('aes-256-cbc no IV', encrypt('aes-256-cbc', 'Secret', '12345678910121314151617181920212'));
```

Запрос:

```sql
SELECT comment, hex(secret) FROM encryption_test;
```

Результат:

```text
┌─comment──────────────────────────┬─hex(secret)──────────────────────┐
│ aes-256-ofb no IV                │ B4972BDC4459                     │
│ aes-256-ofb no IV, different key │ 2FF57C092DC9                     │
│ aes-256-ofb with IV              │ 5E6CB398F653                     │
│ aes-256-cbc no IV                │ 1BC0629A92450D9E73A00E7D02CF4142 │
└──────────────────────────────────┴──────────────────────────────────┘
```

Пример с `-gcm`:

Запрос:

```sql
INSERT INTO encryption_test VALUES('aes-256-gcm', encrypt('aes-256-gcm', 'Secret', '12345678910121314151617181920212', 'iviviviviviviviv')), \
('aes-256-gcm with AAD', encrypt('aes-256-gcm', 'Secret', '12345678910121314151617181920212', 'iviviviviviviviv', 'aad'));

SELECT comment, hex(secret) FROM encryption_test WHERE comment LIKE '%gcm%';
```

Результат:

```text
┌─comment──────────────┬─hex(secret)──────────────────────────────────┐
│ aes-256-gcm          │ A8A3CCBC6426CFEEB60E4EAE03D3E94204C1B09E0254 │
│ aes-256-gcm with AAD │ A8A3CCBC6426D9A1017A0A932322F1852260A4AD6837 │
└──────────────────────┴──────────────────────────────────────────────┘
```

## aes_encrypt_mysql {#aes_encrypt_mysql}

Совместимо с шифрованием MySQL, и зашифрованный текст может быть расшифрован с помощью функции [AES_DECRYPT](https://dev.mysql.com/doc/refman/8.0/en/encryption-functions.html#function_aes-decrypt).

Будет производить тот же зашифрованный текст, что и `encrypt` при равных входных данных. Но когда `key` или `iv` длиннее, чем должно быть, `aes_encrypt_mysql` будет придерживаться того, что делает `aes_encrypt` в MySQL: 'сгибать' `key` и игнорировать лишние биты `iv`.

Поддерживаемые режимы шифрования:

- aes-128-ecb, aes-192-ecb, aes-256-ecb
- aes-128-cbc, aes-192-cbc, aes-256-cbc
- aes-128-ofb, aes-192-ofb, aes-256-ofb

**Синтаксис**

```sql
aes_encrypt_mysql('mode', 'plaintext', 'key' [, iv])
```

**Аргументы**

- `mode` — Режим шифрования. [String](/sql-reference/data-types/string).
- `plaintext` — Текст, который нужно зашифтовать. [String](/sql-reference/data-types/string).
- `key` — Ключ шифрования. Если ключ длиннее, чем требуется по режиму, выполняется специфическое для MySQL сгибание ключа. [String](/sql-reference/data-types/string).
- `iv` — Вектор инициализации. Необязательный, учитываются только первые 16 байт [String](/sql-reference/data-types/string).

**Возвращаемое значение**

- Зашифрованная двоичная строка. [String](/sql-reference/data-types/string).

**Примеры**

При равном входе `encrypt` и `aes_encrypt_mysql` производят одинаковый зашифрованный текст:

Запрос:

```sql
SELECT encrypt('aes-256-ofb', 'Secret', '12345678910121314151617181920212', 'iviviviviviviviv') = aes_encrypt_mysql('aes-256-ofb', 'Secret', '12345678910121314151617181920212', 'iviviviviviviviv') AS ciphertexts_equal;
```

Результат:

```response
┌─ciphertexts_equal─┐
│                 1 │
└───────────────────┘
```

Но `encrypt` завершится ошибкой, когда `key` или `iv` длиннее, чем ожидалось:

Запрос:

```sql
SELECT encrypt('aes-256-ofb', 'Secret', '123456789101213141516171819202122', 'iviviviviviviviv123');
```

Результат:

```text
Received exception from server (version 22.6.1):
Code: 36. DB::Exception: Received from localhost:9000. DB::Exception: Invalid key size: 33 expected 32: While processing encrypt('aes-256-ofb', 'Secret', '123456789101213141516171819202122', 'iviviviviviviviv123').
```

В то время как `aes_encrypt_mysql` производит совместимый с MySQL вывод:

Запрос:

```sql
SELECT hex(aes_encrypt_mysql('aes-256-ofb', 'Secret', '123456789101213141516171819202122', 'iviviviviviviviv123')) AS ciphertext;
```

Результат:

```response
┌─ciphertext───┐
│ 24E9E4966469 │
└──────────────┘
```

Обратите внимание, как предоставление даже более длинного `IV` производит тот же результат:

Запрос:

```sql
SELECT hex(aes_encrypt_mysql('aes-256-ofb', 'Secret', '123456789101213141516171819202122', 'iviviviviviviviv123456')) AS ciphertext
```

Результат:

```text
┌─ciphertext───┐
│ 24E9E4966469 │
└──────────────┘
```

Что бинарно равно тому, что MySQL производит при тех же входных данных:

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

Эта функция расшифровывает зашифрованный текст в открытый текст, используя следующие режимы:

- aes-128-ecb, aes-192-ecb, aes-256-ecb
- aes-128-cbc, aes-192-cbc, aes-256-cbc
- aes-128-ofb, aes-192-ofb, aes-256-ofb
- aes-128-gcm, aes-192-gcm, aes-256-gcm
- aes-128-ctr, aes-192-ctr, aes-256-ctr
- aes-128-cfb, aes-128-cfb1, aes-128-cfb8

**Синтаксис**

```sql
decrypt('mode', 'ciphertext', 'key' [, iv, aad])
```

**Аргументы**

- `mode` — Режим расшифровки. [String](/sql-reference/data-types/string).
- `ciphertext` — Зашифрованный текст, который нужно расшифровать. [String](/sql-reference/data-types/string).
- `key` — Ключ расшифровки. [String](/sql-reference/data-types/string).
- `iv` — Вектор инициализации. Обязателен для режимов `-gcm`, необязателен для остальных. [String](/sql-reference/data-types/string).
- `aad` — Дополнительные аутентифицированные данные. Не расшифруется, если это значение неверно. Работает только в режимах `-gcm`, для остальных вызовет исключение. [String](/sql-reference/data-types/string).

**Возвращаемое значение**

- Расшифрованная строка. [String](/sql-reference/data-types/string).

**Примеры**

Используя таблицу из [encrypt](#encrypt).

Запрос:

```sql
SELECT comment, hex(secret) FROM encryption_test;
```

Результат:

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

Теперь давайте попробуем расшифровать все эти данные.

Запрос:

```sql
SELECT comment, decrypt('aes-256-cfb128', secret, '12345678910121314151617181920212') as plaintext FROM encryption_test
```

Результат:

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

Обратите внимание, что только часть данных была правильно расшифрована, а остальная часть представляет собой несвязный текст, поскольку `mode`, `key` или `iv` были различны при шифровании.

## tryDecrypt {#trydecrypt}

Похоже на `decrypt`, но возвращает NULL, если расшифровка не удалась из-за использования неверного ключа.

**Примеры**

Создадим таблицу, где `user_id` — уникальный идентификатор пользователя, `encrypted` — зашифрованное строковое поле, `iv` — начальный вектор для расшифровки/шифрования. Предположим, что пользователи знают свой идентификатор и ключ для расшифровки зашифрованного поля:

```sql
CREATE TABLE decrypt_null (
  dt DateTime,
  user_id UInt32,
  encrypted String,
  iv String
) ENGINE = Memory;
```

Вставьте некоторые данные:

```sql
INSERT INTO decrypt_null VALUES
    ('2022-08-02 00:00:00', 1, encrypt('aes-256-gcm', 'value1', 'keykeykeykeykeykeykeykeykeykey01', 'iv1'), 'iv1'),
    ('2022-09-02 00:00:00', 2, encrypt('aes-256-gcm', 'value2', 'keykeykeykeykeykeykeykeykeykey02', 'iv2'), 'iv2'),
    ('2022-09-02 00:00:01', 3, encrypt('aes-256-gcm', 'value3', 'keykeykeykeykeykeykeykeykeykey03', 'iv3'), 'iv3');
```

Запрос:

```sql
SELECT
    dt,
    user_id,
    tryDecrypt('aes-256-gcm', encrypted, 'keykeykeykeykeykeykeykeykeykey02', iv) AS value
FROM decrypt_null
ORDER BY user_id ASC
```

Результат:

```response
┌──────────────────dt─┬─user_id─┬─value──┐
│ 2022-08-02 00:00:00 │       1 │ ᴺᵁᴻᴻ   │
│ 2022-09-02 00:00:00 │       2 │ value2 │
│ 2022-09-02 00:00:01 │       3 │ ᴺᵁᴻᴻ   │
└─────────────────────┴─────────┴────────┘
```

## aes_decrypt_mysql {#aes_decrypt_mysql}

Совместимо с шифрованием MySQL и расшифровывает данные, зашифрованные функцией [AES_ENCRYPT](https://dev.mysql.com/doc/refman/8.0/en/encryption-functions.html#function_aes-encrypt).

Будет производить тот же открытый текст, что и `decrypt` при равных входных данных. Но когда `key` или `iv` длиннее, чем должно быть, `aes_decrypt_mysql` будет придерживаться того, что делает `aes_decrypt` в MySQL: 'сгибать' `key` и игнорировать лишние биты `IV`.

Поддерживаемые режимы расшифровки:

- aes-128-ecb, aes-192-ecb, aes-256-ecb
- aes-128-cbc, aes-192-cbc, aes-256-cbc
- aes-128-cfb128
- aes-128-ofb, aes-192-ofb, aes-256-ofb

**Синтаксис**

```sql
aes_decrypt_mysql('mode', 'ciphertext', 'key' [, iv])
```

**Аргументы**

- `mode` — Режим расшифровки. [String](/sql-reference/data-types/string).
- `ciphertext` — Зашифрованный текст, который нужно расшифровать. [String](/sql-reference/data-types/string).
- `key` — Ключ расшифровки. [String](/sql-reference/data-types/string).
- `iv` — Вектор инициализации. Необязательный. [String](/sql-reference/data-types/string).

**Возвращаемое значение**

- Расшифрованная строка. [String](/sql-reference/data-types/string).

**Примеры**

Давайте расшифруем данные, которые мы ранее зашифровали с помощью MySQL:

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

Запрос:

```sql
SELECT aes_decrypt_mysql('aes-256-ofb', unhex('24E9E4966469'), '123456789101213141516171819202122', 'iviviviviviviviv123456') AS plaintext
```

Результат:

```text
┌─plaintext─┐
│ Secret    │
└───────────┘
```
