---
sidebar_label: 'Настройка SAML SSO'
slug: /cloud/security/saml-setup
title: 'Настройка SAML SSO'
description: 'Как настроить SAML SSO в ClickHouse Cloud'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'SAML', 'SSO', 'единый вход', 'IdP', 'Okta', 'Google']
---

import Image from '@theme/IdealImage';
import samlOrgId from '@site/static/images/cloud/security/saml-org-id.png';
import samlOktaSetup from '@site/static/images/cloud/security/saml-okta-setup.png';
import samlGoogleApp from '@site/static/images/cloud/security/saml-google-app.png';
import samlAzureApp from '@site/static/images/cloud/security/saml-azure-app.png';
import samlAzureClaims from '@site/static/images/cloud/security/saml-azure-claims.png';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# Настройка SAML SSO

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloud поддерживает единый вход (SSO) с использованием Security Assertion Markup Language (SAML). Это позволяет безопасно входить в вашу организацию ClickHouse Cloud, аутентифицируясь через вашего поставщика удостоверений личности (IdP).

В настоящее время мы поддерживаем SSO, инициируемый поставщиком услуг (service provider-initiated SSO), использование нескольких организаций с отдельными подключениями и автоматическое (just-in-time) предоставление учётных записей. Мы пока не поддерживаем систему кросс-доменного управления идентификацией (SCIM) или сопоставление атрибутов.



## Перед началом работы {#before-you-begin}

Вам потребуются права администратора в вашем IdP и роль **Admin** в организации ClickHouse Cloud. После настройки подключения в IdP свяжитесь с нами, предоставив информацию, указанную в процедуре ниже, чтобы завершить процесс.

Мы рекомендуем настроить **прямую ссылку на вашу организацию** в дополнение к SAML-подключению для упрощения процесса входа. Каждый IdP реализует это по-своему. Ниже описано, как это сделать для вашего IdP.


## Как настроить ваш IdP {#how-to-configure-your-idp}

### Шаги {#steps}

<details>
  <summary> Получите идентификатор организации </summary>
  Для всех настроек требуется идентификатор организации. Чтобы получить идентификатор организации: 1.
  Войдите в свою организацию [ClickHouse Cloud](https://console.clickhouse.cloud).
  <Image img={samlOrgId} size='md' alt='Идентификатор организации' force />
  3. В левом нижнем углу нажмите на название организации в разделе
  **Organization**. 4. Во всплывающем меню выберите **Organization details**. 5.
  Запишите **Organization ID** для дальнейшего использования.
</details>

<details> 
   <summary>  Настройте интеграцию SAML  </summary>
   
   ClickHouse использует SAML-соединения, инициируемые поставщиком услуг. Это означает, что вы можете войти через https://console.clickhouse.cloud или по прямой ссылке. В настоящее время мы не поддерживаем соединения, инициируемые поставщиком идентификации. Базовая конфигурация SAML включает следующее:

- SSO URL or ACS URL: `https://auth.clickhouse.cloud/login/callback?connection={organizationid}`

- Audience URI or Entity ID: `urn:auth0:ch-production:{organizationid}`

- Application username: `email`

- Attribute mapping: `email = user.email`

- Прямая ссылка для доступа к организации: `https://console.clickhouse.cloud/?connection={organizationid}`

  Конкретные шаги настройки см. в разделе вашего поставщика идентификации ниже.

</details>

<details>
   <summary>  Получите информацию о подключении  </summary>

Получите SSO URL поставщика идентификации и сертификат x.509. Инструкции по получению этой информации см. в разделе вашего поставщика идентификации ниже.

</details>

<details>
   <summary>  Отправьте запрос в службу поддержки </summary>
   
   1. Вернитесь в консоль ClickHouse Cloud.
      
   2. Выберите **Help** слева, затем подменю Support.
   
   3. Нажмите **New case**.
   
   4. Введите тему «SAML SSO Setup».
   
   5. В описании вставьте все ссылки, собранные из инструкций выше, и прикрепите сертификат к заявке.
   
   6. Также укажите, какие домены должны быть разрешены для этого подключения (например, domain.com, domain.ai и т. д.).
   
   7. Создайте новую заявку.
   
   8. Мы завершим настройку в ClickHouse Cloud и сообщим вам, когда она будет готова к тестированию.

</details>

<details>
   <summary>  Завершите настройку  </summary>

1.  Назначьте доступ пользователям в поставщике идентификации.

2.  Войдите в ClickHouse через https://console.clickhouse.cloud ИЛИ по прямой ссылке, которую вы настроили в разделе «Настройте интеграцию SAML» выше. Пользователям изначально назначается роль «Member», которая позволяет входить в организацию и изменять личные настройки.

3.  Выйдите из организации ClickHouse.

4.  Войдите с помощью исходного метода аутентификации, чтобы назначить роль Admin новой учетной записи SSO.

- Для учетных записей с email + паролем используйте `https://console.clickhouse.cloud/?with=email`.
- Для входа через социальные сети нажмите соответствующую кнопку (**Continue with Google** или **Continue with Microsoft**)

:::note
`email` в `?with=email` выше является буквальным значением параметра, а не заполнителем
:::

5.  Выйдите с помощью исходного метода аутентификации и войдите снова через https://console.clickhouse.cloud ИЛИ по прямой ссылке, которую вы настроили в разделе «Настройте интеграцию SAML» выше.

6.  Удалите всех пользователей, не использующих SAML, чтобы обеспечить использование SAML для организации. В дальнейшем пользователи назначаются через поставщика идентификации.

</details>

### Настройка Okta SAML {#configure-okta-saml}

Вы настроите две интеграции приложений в Okta для каждой организации ClickHouse: одно приложение SAML и одну закладку для прямой ссылки.

<details>
   <summary>  1. Создайте группу для управления доступом  </summary>
   
   1. Войдите в экземпляр Okta как **Administrator**.

2.  Выберите **Groups** слева.

3.  Нажмите **Add group**.

4.  Введите имя и описание группы. Эта группа будет использоваться для поддержания согласованности пользователей между приложением SAML и связанным с ним приложением закладки.

5.  Нажмите **Save**.

6.  Нажмите на имя созданной группы.

7.  Нажмите **Assign people**, чтобы назначить пользователей, которым требуется доступ к этой организации ClickHouse.

</details>


<details>
  <summary>
    {" "}
    2. Создайте приложение-закладку для беспрепятственного входа пользователей в систему{" "}
  </summary>
  1. Выберите **Applications** слева, затем выберите подраздел **Applications**.
  2. Нажмите **Browse App Catalog**. 3. Найдите и выберите
  **Bookmark App**. 4. Нажмите **Add integration**. 5. Выберите метку для приложения.
  6. Введите URL в виде `https://console.clickhouse.cloud/?connection=
  {organizationid}` 7. Перейдите на вкладку **Assignments** и добавьте созданную выше группу.
</details>

<details>
   <summary>  3. Создайте приложение SAML для установки соединения  </summary>
   
   1. Выберите **Applications** слева, затем выберите подраздел **Applications**.
   
   2. Нажмите **Create App Integration**.
   
   3. Выберите SAML 2.0 и нажмите Next.
   
   4. Введите имя приложения и установите флажок рядом с **Do not display application icon to users**, затем нажмите **Next**. 
   
   5. Используйте следующие значения для заполнения экрана настроек SAML.
   
      | Поле                           | Значение |
      |--------------------------------|-------|
      | Single Sign On URL             | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Audience URI (SP Entity ID)    | `urn:auth0:ch-production:{organizationid}` |
      | Default RelayState             | Оставьте пустым       |
      | Name ID format                 | Unspecified       |
      | Application username           | Email             |
      | Update application username on | Create and update |
   
   7. Введите следующее объявление атрибутов.

      | Имя     | Формат имени  | Значение   |
      |---------|---------------|------------|
      | email   | Basic         | user.email |

9. Нажмите **Next**.

10. Введите запрашиваемую информацию на экране Feedback и нажмите **Finish**.

11. Перейдите на вкладку **Assignments** и добавьте созданную выше группу.

12. На вкладке **Sign On** для вашего нового приложения нажмите кнопку **View SAML setup instructions**.

    <Image
      img={samlOktaSetup}
      size='md'
      alt='Инструкции по настройке Okta SAML'
      force
    />

13. Соберите эти три элемента и перейдите к разделу «Отправить запрос в службу поддержки» выше, чтобы завершить процесс.


     - Identity Provider Single Sign-On URL
     - Identity Provider Issuer
     - X.509 Certificate

</details>

### Настройка Google SAML {#configure-google-saml}

Вы настроите одно приложение SAML в Google для каждой организации и должны предоставить пользователям прямую ссылку (`https://console.clickhouse.cloud/?connection={organizationId}`) для добавления в закладки при использовании SSO для нескольких организаций.

<details>
   <summary>  Создание веб-приложения Google  </summary>
   
   1. Перейдите в консоль администратора Google (admin.google.com).

<Image img={samlGoogleApp} size='md' alt='Приложение Google SAML' force />

2.  Нажмите **Apps**, затем **Web and mobile apps** слева.

3.  Нажмите **Add app** в верхнем меню, затем выберите **Add custom SAML app**.

4.  Введите имя приложения и нажмите **Continue**.

5.  Соберите эти два элемента и перейдите к разделу «Отправить запрос в службу поддержки» выше, чтобы отправить нам информацию. ПРИМЕЧАНИЕ: Если вы завершите настройку до копирования этих данных, нажмите **DOWNLOAD METADATA** на главном экране приложения, чтобы получить сертификат X.509.


     - SSO URL
     - X.509 Certificate

7.  Введите ACS URL и Entity ID ниже.

    | Поле      | Значение                                                                   |
    | --------- | -------------------------------------------------------------------------- |
    | ACS URL   | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
    | Entity ID | `urn:auth0:ch-production:{organizationid}`                                 |

8.  Установите флажок для **Signed response**.

9.  Выберите **EMAIL** для Name ID Format и оставьте Name ID как **Basic Information > Primary email.**

10. Нажмите **Continue**.

11. Введите следующее сопоставление атрибутов:
    | Поле              | Значение      |
    | ----------------- | ------------- |
    | Basic information | Primary email |
    | App attributes    | email         |
12. Нажмите **Finish**.


14. Чтобы включить приложение, нажмите **OFF** для всех и измените настройку на **ON** для всех. Доступ также можно ограничить для определенных групп или организационных единиц, выбрав соответствующие параметры в левой части экрана.

</details>

### Настройка Azure (Microsoft) SAML {#configure-azure-microsoft-saml}

Azure (Microsoft) SAML также может называться Azure Active Directory (AD) или Microsoft Entra.

<details>
   <summary>  Создание корпоративного приложения Azure </summary>
   
   Вы настроите одну интеграцию приложения с отдельным URL-адресом входа для каждой организации.
   
   1. Войдите в центр администрирования Microsoft Entra.
   
   2. Перейдите в раздел **Applications > Enterprise** applications слева.
   
   3. Нажмите **New application** в верхнем меню.
   
   4. Нажмите **Create your own application** в верхнем меню.
   
   5. Введите имя и выберите **Integrate any other application you don't find in the gallery (Non-gallery)**, затем нажмите **Create**.
   
      <Image img={samlAzureApp} size="md" alt="Приложение Azure не из галереи" force/>
   
   6. Нажмите **Users and groups** слева и назначьте пользователей.
   
   7. Нажмите **Single sign-on** слева.
   
   8. Нажмите **SAML**.
   
   9. Используйте следующие настройки для заполнения экрана Basic SAML Configuration.
   
      | Поле                     | Значение |
      |---------------------------|-------|
      | Identifier (Entity ID)    | `urn:auth0:ch-production:{organizationid}` |
      | Reply URL (Assertion Consumer Service URL) | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Sign on URL               | `https://console.clickhouse.cloud/?connection={organizationid}` |
      | Relay State               | Не заполнять |
      | Logout URL                | Не заполнять |
   
   11. Добавьте (A) или обновите (U) следующие параметры в разделе Attributes & Claims:
   
       | Имя утверждения                           | Формат        | Исходный атрибут |
       |--------------------------------------|---------------|------------------|
       | (U) Unique User Identifier (Name ID) | Email address | user.mail        |
       | (A) email                            | Basic         | user.mail        |
       | (U) /identity/claims/name            | Omitted       | user.mail        |
   
         <Image img={samlAzureClaims} size="md" alt="Атрибуты и утверждения" force/>
   
   12. Соберите следующие два элемента и перейдите к разделу Submit a Support Case выше, чтобы завершить процесс:
     - Login URL
     - Certificate (Base64)

</details>

### Настройка Duo SAML {#configure-duo-saml}

<details>
   <summary> Создание универсального поставщика услуг SAML для Duo </summary>
   
   1. Следуйте инструкциям для [Duo Single Sign-On for Generic SAML Service Providers](https://duo.com/docs/sso-generic). 
   
   2. Используйте следующее сопоставление Bridge Attribute:

      |  Bridge Attribute  |  Атрибут ClickHouse  |
      |:-------------------|:-----------------------|
      | Email Address      | email                  |

3.  Используйте следующие значения для обновления вашего Cloud Application в Duo:

    | Поле                                | Значение                                                                      |
    | :----------------------------------- | :------------------------------------------------------------------------- |
    | Entity ID                            | `urn:auth0:ch-production:{organizationid}`                                 |
    | Assertion Consumer Service (ACS) URL | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
    | Service Provider Login URL           | `https://console.clickhouse.cloud/?connection={organizationid}`            |

4.  Соберите следующие два элемента и перейдите к разделу Submit a Support Case выше, чтобы завершить процесс:
    - Single Sign-On URL
    - Certificate

</details>


## Как это работает {#how-it-works}

### Управление пользователями с помощью SAML SSO {#user-management-with-saml-sso}

Дополнительную информацию об управлении правами пользователей и ограничении доступа только для SAML-подключений см. в разделе [Управление пользователями облака](/cloud/security/manage-cloud-users).

### SSO, инициируемое поставщиком услуг {#service-provider-initiated-sso}

Мы используем только SSO, инициируемое поставщиком услуг. Это означает, что пользователи переходят на `https://console.clickhouse.cloud` и вводят свой адрес электронной почты, после чего перенаправляются к IdP для аутентификации. Пользователи, уже прошедшие аутентификацию через ваш IdP, могут использовать прямую ссылку для автоматического входа в организацию без ввода адреса электронной почты на странице входа.

### SSO для нескольких организаций {#multi-org-sso}

ClickHouse Cloud поддерживает SSO для нескольких организаций, предоставляя отдельное подключение для каждой организации. Используйте прямую ссылку (`https://console.clickhouse.cloud/?connection={organizationid}`) для входа в соответствующую организацию. Обязательно выполните выход из одной организации перед входом в другую.


## Дополнительная информация {#additional-information}

Безопасность — наш главный приоритет в вопросах аутентификации. По этой причине при реализации SSO мы приняли несколько решений, о которых вам необходимо знать.

- **Мы обрабатываем только потоки аутентификации, инициированные поставщиком услуг.** Пользователи должны перейти на `https://console.clickhouse.cloud` и ввести адрес электронной почты, чтобы быть перенаправленными к вашему провайдеру идентификации. Для вашего удобства предоставлены инструкции по добавлению закладки или ярлыка приложения, чтобы вашим пользователям не нужно было запоминать URL.

- **Мы не связываем автоматически учетные записи SSO и не-SSO.** В списке пользователей ClickHouse вы можете увидеть несколько учетных записей для одних и тех же пользователей, даже если они используют один и тот же адрес электронной почты.


## Устранение распространённых проблем {#troubleshooting-common-issues}

| Ошибка                                                                                                                                                              | Причина                                                                                 | Решение                                                                                                                                                                                                                       |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Возможна неправильная конфигурация системы или сбой в работе сервиса                                                                                                | Вход, инициированный провайдером идентификации                                                     | Для устранения этой ошибки попробуйте использовать прямую ссылку `https://console.clickhouse.cloud/?connection={organizationid}`. Следуйте инструкциям для вашего провайдера идентификации выше, чтобы сделать этот способ входа методом по умолчанию для ваших пользователей |
| Вы перенаправляетесь к провайдеру идентификации, а затем обратно на страницу входа                                                                                            | У провайдера идентификации отсутствует сопоставление атрибута электронной почты                       | Следуйте инструкциям для вашего провайдера идентификации выше, чтобы настроить атрибут электронной почты пользователя и войти снова                                                                                                                |
| Пользователь не назначен этому приложению                                                                                                                           | Пользователь не был назначен приложению ClickHouse в провайдере идентификации | Назначьте пользователя приложению в провайдере идентификации и войдите снова                                                                                                                                                   |
| У вас несколько организаций ClickHouse, интегрированных с SAML SSO, и вы всегда входите в одну и ту же организацию, независимо от того, какую ссылку или плитку вы используете | Вы всё ещё находитесь в системе первой организации                                     | Выйдите из системы, затем войдите в другую организацию                                                                                                                                                                                 |
| В URL кратковременно отображается `access denied`                                                                                                                              | Ваш домен электронной почты не совпадает с настроенным доменом                        | Обратитесь в службу поддержки за помощью в устранении этой ошибки                                                                                                                                                                                       |
