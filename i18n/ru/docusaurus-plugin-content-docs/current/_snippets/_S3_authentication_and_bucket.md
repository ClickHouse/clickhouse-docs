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
  <summary>Создание S3 корзин и IAM пользователя</summary>

Эта статья демонстрирует основы настройки IAM пользователя AWS, создания S3 корзины и настройки ClickHouse для использования корзины в качестве S3 диска. Вам следует работать с командой безопасности, чтобы определить использующиеся разрешения, и рассматривать их как отправную точку.

### Создание AWS IAM пользователя {#create-an-aws-iam-user}
В этой процедуре мы будем создавать учетную запись сервисного пользователя, а не пользователя для входа.
1. Войдите в консоль управления AWS IAM.

2. В разделе "пользователи" выберите **Добавить пользователей**

<img src={s3_1} alt="create_iam_user_0"/>

3. Введите имя пользователя и установите тип учетных данных на **Ключ доступа - Программный доступ** и выберите **Далее: Разрешения**

<img src={s3_2} alt="create_iam_user_1"/>

4. Не добавляйте пользователя в какие-либо группы; выберите **Далее: Теги**

<img src={s3_3} alt="create_iam_user_2"/>

5. Если вам не нужно добавлять какие-либо теги, выберите **Далее: Обзор**

<img src={s3_4} alt="create_iam_user_3"/>

6. Выберите **Создать пользователя**

    :::note
    Сообщение об ошибке, указывающее, что у пользователя нет разрешений, можно игнорировать; разрешения будут предоставлены на корзину для пользователя в следующем разделе.
    :::

<img src={s3_5} alt="create_iam_user_4"/>

7. Пользователь теперь создан; нажмите **показать** и скопируйте ключи доступа и секретные ключи.
:::note
Сохраните ключи в другом месте; это единственный раз, когда секретный ключ доступа будет доступен.
:::

<img src={s3_6} alt="create_iam_user_5"/>

8. Нажмите закрыть, затем найдите пользователя на экране пользователей.

<img src={s3_7} alt="create_iam_user_6"/>

9. Скопируйте ARN (Amazon Resource Name) и сохраните его для использования при настройке политики доступа для корзины.

<img src={s3_8} alt="create_iam_user_7"/>

### Создание S3 корзины {#create-an-s3-bucket}
1. В разделе корзины S3 выберите **Создать корзину**

<img src={s3_9} alt="create_s3_bucket_0"/>

2. Введите имя корзины, оставив остальные опции по умолчанию
:::note
Имя корзины должно быть уникальным по всему AWS, а не только в организации, иначе будет выдана ошибка.
:::
3. Оставьте `Блокировать все публичные доступы` включенным; публичный доступ не требуется.

<img src={s3_a} alt="create_s3_bucket_2"/>

4. Выберите **Создать корзину** внизу страницы

<img src={s3_b} alt="create_s3_bucket_3"/>

5. Выберите ссылку, скопируйте ARN и сохраните его для использования при настройке политики доступа для корзины.

6. После создания корзины найдите новую S3 корзину в списке корзин S3 и выберите ссылку

<img src={s3_c} alt="create_s3_bucket_4"/>

7. Выберите **Создать папку**

<img src={s3_d} alt="create_s3_bucket_5"/>

8. Введите имя папки, которое будет использоваться в качестве целевого для S3 диска ClickHouse, и выберите **Создать папку**

<img src={s3_e} alt="create_s3_bucket_6"/>

9. Папка теперь должна быть видна в списке корзины

<img src={s3_f} alt="create_s3_bucket_7"/>

10. Выберите флажок для новой папки и нажмите **Скопировать URL** Сохраните скопированный URL для использования в конфигурации хранилища ClickHouse в следующем разделе.

<img src={s3_g} alt="create_s3_bucket_8"/>

11. Выберите вкладку **Разрешения** и нажмите кнопку **Изменить** в разделе **Политика корзины**

<img src={s3_h} alt="create_s3_bucket_9"/>

12. Добавьте политику корзины, пример ниже:
```json
{
	"Version": "2012-10-17",
	"Id": "Policy123456",
	"Statement": [
		{
			"Sid": "abc123",
			"Effect": "Allow",
			"Principal": {
				"AWS": "arn:aws:iam::921234567898:user/mars-s3-user"
			},
			"Action": "s3:*",
			"Resource": [
				"arn:aws:s3:::mars-doc-test",
				"arn:aws:s3:::mars-doc-test/*"
			]
		}
	]
}
```

```response
|Параметр | Описание | Пример значения |
|----------|-------------|----------------|
|Version | Версия интерпретатора политики, оставьте как есть | 2012-10-17 |
|Sid | Идентификатор политики, заданный пользователем | abc123 |
|Effect | Разрешены или запрещены запросы пользователя | Allow |
|Principal | Учетные записи или пользователи, которым будет разрешено | arn:aws:iam::921234567898:user/mars-s3-user |
|Action | Какие операции разрешены с корзиной| s3:*|
|Resource | На каких ресурсах в корзине будут разрешены операции | "arn:aws:s3:::mars-doc-test", "arn:aws:s3:::mars-doc-test/*" |
```

:::note
Вам следует работать с вашей командой безопасности, чтобы определить разрешения, которые будут использоваться; рассмотрите эти параметры как отправную точку.
Для получения дополнительной информации о политиках и настройках обращайтесь к документации AWS:
https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
:::

13. Сохраните конфигурацию политики.

</details>
