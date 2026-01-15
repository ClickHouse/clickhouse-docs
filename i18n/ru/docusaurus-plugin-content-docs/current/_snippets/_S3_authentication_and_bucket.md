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
  <summary>Создание корзин S3 и пользователя IAM</summary>

В этой статье описаны основы настройки пользователя AWS IAM, создания корзины S3 и настройки ClickHouse для использования корзины в качестве диска S3.
You should work with your security team to determine the permissions to be used, and consider these as a starting point.

### Создание пользователя AWS IAM {#create-an-aws-iam-user}

В следующих шагах вы создадите пользователя служебной учетной записи (не пользователя для входа в систему).

1. Войдите в консоль управления IAM в AWS.

2. В меню `Users` выберите пункт `Create user`

<Image size="md" img={s3_1} alt="Консоль управления AWS IAM — добавление нового пользователя" border force />

3. Введите имя пользователя, установите тип учетных данных в значение `Access key - Programmatic access` и выберите `Next: Permissions`

<Image size="md" img={s3_2} alt="Настройка имени и типа доступа пользователя IAM" border force />

4. Не добавляйте пользователя ни в одну группу; нажмите `Next: Tags`

<Image size="md" img={s3_3} alt="Пропуск назначения группы пользователю IAM" border force />

5. Если вам не нужно добавлять какие-либо теги, выберите `Next: Review`

<Image size="md" img={s3_4} alt="Пропуск назначения тегов пользователю IAM" border force />

6. Нажмите `Create User`

:::note
Предупреждающее сообщение о том, что у пользователя нет разрешений, можно проигнорировать; разрешения будут предоставлены пользователю для корзины в следующем разделе
:::

<Image size="md" img={s3_5} alt="Создание пользователя IAM без предупреждения об отсутствии прав доступа" border force />

7. Пользователь создан. Нажмите `show` и скопируйте ключ доступа и секретный ключ.

:::note
Сохраните ключи в надежном месте; секретный ключ доступа будет доступен только сейчас.
:::

<Image size="md" img={s3_6} alt="Просмотр и копирование ключей доступа IAM-пользователя" border force />

8. Нажмите кнопку Close, затем найдите пользователя на странице пользователей.

<Image size="md" img={s3_7} alt="Поиск созданного пользователя IAM в списке пользователей" border force />

9. Скопируйте ARN (Amazon Resource Name) и сохраните его для последующего использования при настройке политики доступа для корзины.

<Image size="md" img={s3_8} alt="Копирование ARN пользователя IAM" border force />

### Создание корзины S3 {#create-an-s3-bucket}

1. В разделе корзины S3 нажмите `Create bucket`

<Image size="md" img={s3_9} alt="Запуск процесса создания корзины S3" border force />

2. Введите имя корзины, остальные параметры оставьте по умолчанию

:::note
Имя корзины должно быть уникальным в рамках всего AWS, а не только в пределах организации, иначе будет выдана ошибка.
:::

3. Оставьте параметр `Block all Public Access` включённым — публичный доступ не требуется.

<Image size="md" img={s3_a} alt="Настройка параметров корзины S3 с заблокированным публичным доступом" border force />

4. Нажмите `Create Bucket` в нижней части страницы

<Image size="md" img={s3_b} alt="Завершение создания корзины S3" border force />

5. Перейдите по ссылке, скопируйте ARN и сохраните его для последующего использования при настройке политики доступа к корзине.

6. После создания корзины найдите новую корзину S3 в списке корзин S3 и перейдите по ссылке

<Image size="md" img={s3_c} alt="Поиск созданной корзины S3 в списке корзин" border force />

7. Нажмите `Create folder`

<Image size="md" img={s3_d} alt="Создание новой папки в корзине S3" border force />

8. Введите имя папки, которая будет использоваться в качестве целевой для диска S3 ClickHouse, и нажмите **Create folder**

<Image size="md" img={s3_e} alt="Задание имени папки для диска S3 ClickHouse" border force />

9. Папка должна появиться в списке корзины

<Image size="md" img={s3_f} alt="Просмотр созданной папки в корзине S3" border force />

10. Установите флажок для новой папки и нажмите `Copy URL`. Сохраните скопированный URL для использования в конфигурации хранилища ClickHouse в следующем разделе.

<Image size="md" img={s3_g} alt="Копирование URL папки S3 для конфигурации ClickHouse" border force />

11. Перейдите на вкладку `Permissions` и нажмите кнопку `Edit` в разделе `Bucket Policy`

<Image size="md" img={s3_h} alt="Доступ к конфигурации политики корзины S3" border force />

12. Добавьте политику для корзины, пример приведён ниже:

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
|Parameter | Description | Example Value |
|----------|-------------|----------------|
|Version | Version of the policy interpreter, leave as-is | 2012-10-17 |
|Sid | User-defined policy id | abc123 |
|Effect | Whether user requests will be allowed or denied | Allow |
|Principal | The accounts or user that will be allowed | arn:aws:iam::921234567898:user/mars-s3-user |
|Action | What operations are allowed on the bucket| s3:*|
|Resource | Which resources in the bucket will operations be allowed in | "arn:aws:s3:::mars-doc-test", "arn:aws:s3:::mars-doc-test/*" |
```

:::note
Рекомендуется согласовать используемые разрешения с вашей командой безопасности; приведенные настройки можно использовать в качестве отправной точки.
Дополнительную информацию о политиках и настройках см. в документации AWS:
https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
:::

13. Сохраните конфигурацию политики.
</details>