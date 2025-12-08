---
sidebar_label: 'Настройка SAML SSO'
slug: /cloud/security/saml-setup
title: 'Настройка SAML SSO'
description: 'Как настроить SAML SSO для ClickHouse Cloud'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'SAML', 'SSO', 'single sign-on', 'IdP', 'Okta', 'Google']
---

import Image from '@theme/IdealImage';
import samlOrgId from '@site/static/images/cloud/security/saml-org-id.png';
import samlOktaSetup from '@site/static/images/cloud/security/saml-okta-setup.png';
import samlGoogleApp from '@site/static/images/cloud/security/saml-google-app.png';
import samlAzureApp from '@site/static/images/cloud/security/saml-azure-app.png';
import samlAzureClaims from '@site/static/images/cloud/security/saml-azure-claims.png';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

# Настройка SAML SSO {#saml-sso-setup}

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloud поддерживает единый вход (SSO) с использованием Security Assertion Markup Language (SAML). Это позволяет вам безопасно входить в вашу организацию ClickHouse Cloud, проходя аутентификацию у вашего поставщика идентификации (IdP).

В настоящее время мы поддерживаем SSO, инициируемый со стороны поставщика услуг (service provider-initiated), несколько организаций с использованием отдельных подключений и just-in-time‑подготовку учётных записей (provisioning). Мы пока не поддерживаем систему управления идентификацией между доменами (SCIM) или сопоставление атрибутов.

## Прежде чем начать {#before-you-begin}

Вам потребуются права администратора в вашем IdP и роль **Admin** в вашей организации ClickHouse Cloud. После настройки подключения в вашем IdP свяжитесь с нами, предоставив информацию, указанную в процедуре ниже, чтобы завершить процесс.

Мы рекомендуем, помимо SAML-подключения, настроить **прямую ссылку на вашу организацию**, чтобы упростить процесс входа. Каждый IdP реализует это по-своему. Ниже описано, как сделать это для вашего IdP.

## Как настроить ваш IdP {#how-to-configure-your-idp}

### Шаги {#steps}

<details>
   <summary>  Получите идентификатор организации  </summary>
   
   Для всех конфигураций требуется идентификатор вашей организации. Чтобы получить идентификатор вашей организации:
   
   1. Войдите в свою организацию в [ClickHouse Cloud](https://console.clickhouse.cloud).
   
      <Image img={samlOrgId} size="md" alt="Organization ID" force/>
      
   3. В левом нижнем углу нажмите на имя вашей организации в разделе **Organization**.
   
   4. Во всплывающем меню выберите **Organization details**.
   
   5. Запишите ваш **Organization ID** для использования ниже.
      
</details>

<details> 
   <summary>  Настройте интеграцию SAML  </summary>
   
   ClickHouse использует подключения SAML, инициируемые со стороны провайдера сервиса (service provider-initiated). Это означает, что вы можете войти через https://console.clickhouse.cloud или по прямой ссылке. В настоящее время мы не поддерживаем подключения, инициируемые провайдером идентификации (identity provider-initiated). Базовая конфигурация SAML включает следующее:

- SSO URL или ACS URL:  `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` 

- Audience URI или Entity ID: `urn:auth0:ch-production:{organizationid}` 

- Имя пользователя приложения (Application username): `email`

- Сопоставление атрибутов (Attribute mapping): `email = user.email`

- Прямая ссылка для доступа к вашей организации: `https://console.clickhouse.cloud/?connection={organizationid}` 

   Конкретные шаги настройки смотрите в разделе для вашего провайдера идентификации ниже.
   
</details>

<details>
   <summary>  Получите информацию о подключении  </summary>

   Получите SSO URL и сертификат x.509 вашего провайдера идентификации. Инструкции по получению этой информации смотрите в разделе для вашего провайдера идентификации ниже.

</details>

<details>
   <summary>  Отправьте запрос в поддержку </summary>
   
   1. Вернитесь в консоль ClickHouse Cloud.
      
   2. Выберите **Help** слева, затем подменю **Support**.
   
   3. Нажмите **New case**.
   
   4. Введите тему «SAML SSO Setup».
   
   5. В описании вставьте все ссылки, собранные по инструкциям выше, и приложите сертификат к заявке.
   
   6. Также укажите, какие домены должны быть разрешены для этого подключения (например, domain.com, domain.ai и т. д.).
   
   7. Создайте новый запрос.
   
   8. Мы завершим настройку в ClickHouse Cloud и сообщим вам, когда она будет готова к тестированию.

</details>

<details>
   <summary>  Завершите настройку  </summary>

   1. Назначьте пользователям доступ у вашего провайдера идентификации (Identity Provider). 

   2. Войдите в ClickHouse через https://console.clickhouse.cloud ИЛИ по прямой ссылке, которую вы настроили выше в разделе «Configure your SAML integration». Пользователи изначально получают роль `Member`, которая позволяет входить в организацию и изменять личные настройки.

   3. Выйдите из организации ClickHouse. 

   4. Войдите, используя исходный метод аутентификации, чтобы назначить роль Admin вашему новому SSO-аккаунту.
- Для аккаунтов с email + пароль используйте `https://console.clickhouse.cloud/?with=email`.
- Для социальных входов нажмите соответствующую кнопку (**Continue with Google** или **Continue with Microsoft**)

:::note
`email` в параметре `?with=email` выше — это буквальное значение параметра, а не заполнитель
:::

   5. Выйдите, используя исходный метод аутентификации, и снова войдите через https://console.clickhouse.cloud ИЛИ по прямой ссылке, которую вы настроили выше в разделе «Configure your SAML integration».

   6. Удалите всех пользователей, использующих не-SAML-авторизацию, чтобы обеспечить использование SAML для всей организации. В дальнейшем пользователи назначаются через вашего провайдера идентификации.
   
</details>

### Настройка Okta SAML {#configure-okta-saml}

Для каждой организации ClickHouse вы настроите две интеграции приложений (App Integrations) в Okta: одно SAML-приложение и одно приложение-закладку (bookmark) для хранения прямой ссылки.

<details>
   <summary>  1. Создайте группу для управления доступом  </summary>
   
   1. Войдите в свой инстанс Okta как **Administrator**.

   2. Выберите **Groups** слева.

   3. Нажмите **Add group**.

   4. Введите имя и описание для группы. Эта группа будет использоваться для согласованного управления пользователями между SAML-приложением и связанным с ним bookmark-приложением.

   5. Нажмите **Save**.

   6. Нажмите имя созданной вами группы.

   7. Нажмите **Assign people**, чтобы назначить пользователей, которым вы хотите предоставить доступ к этой организации ClickHouse.

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
   <summary>  3. Создайте SAML-приложение для установки соединения  </summary>
   
   1. Выберите **Applications** слева, затем выберите подраздел **Applications**.
   
   2. Нажмите **Create App Integration**.
   
   3. Выберите SAML 2.0 и нажмите Next.
   
   4. Введите имя приложения, установите флажок **Do not display application icon to users** и нажмите **Next**. 
   
   5. Используйте следующие значения для заполнения экрана настроек SAML.
   
      | Поле                           | Значение |
      |--------------------------------|-------|
      | Single Sign On URL             | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Audience URI (SP Entity ID)    | `urn:auth0:ch-production:{organizationid}` |
      | Default RelayState             | Оставьте пустым       |
      | Name ID format                 | Unspecified       |
      | Application username           | Email             |
      | Update application username on | Create and update |
   
   7. Введите следующее Attribute Statement.

      | Name    | Name format   | Value      |
      |---------|---------------|------------|
      | email   | Basic         | user.email |

9. Нажмите **Next**.

10. Введите запрашиваемую информацию на экране Feedback и нажмите **Finish**.

11. Перейдите на вкладку **Assignments** и добавьте созданную выше группу.

12. На вкладке **Sign On** для нового приложения нажмите кнопку **View SAML setup instructions**.

    <Image
      img={samlOktaSetup}
      size='md'
      alt='Инструкции по настройке Okta SAML'
      force
    />

13. Соберите эти три элемента и перейдите к разделу Submit a Support Case выше, чтобы завершить процесс.


     - Identity Provider Single Sign-On URL
     - Identity Provider Issuer
     - X.509 Certificate

</details>

### Настройка Google SAML {#configure-google-saml}

Вы настроите одно SAML-приложение в Google для каждой организации и должны предоставить пользователям прямую ссылку (`https://console.clickhouse.cloud/?connection={organizationId}`) для добавления в закладки при использовании SSO для нескольких организаций.

<details>
   <summary>  Создайте веб-приложение Google  </summary>
   
   1. Перейдите в консоль Google Admin (admin.google.com).

<Image img={samlGoogleApp} size='md' alt='Приложение Google SAML' force />

2.  Нажмите **Apps**, затем **Web and mobile apps** слева.

3.  Нажмите **Add app** в верхнем меню, затем выберите **Add custom SAML app**.

4.  Введите имя приложения и нажмите **Continue**.

5.  Соберите эти два элемента и перейдите к разделу Submit a Support Case выше, чтобы отправить нам информацию. ПРИМЕЧАНИЕ: Если вы завершите настройку до копирования этих данных, нажмите **DOWNLOAD METADATA** на главном экране приложения, чтобы получить сертификат X.509.


     - SSO URL
     - X.509 Certificate

7.  Введите ACS URL и Entity ID ниже.

    | Поле      | Значение                                                                   |
    | --------- | -------------------------------------------------------------------------- |
    | ACS URL   | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
    | Entity ID | `urn:auth0:ch-production:{organizationid}`                                 |

8.  Установите флажок **Signed response**.

9.  Выберите **EMAIL** для Name ID Format и оставьте Name ID как **Basic Information > Primary email.**

10. Нажмите **Continue**.

11. Введите следующее сопоставление атрибутов:
    | Поле              | Значение      |
    | ----------------- | ------------- |
    | Basic information | Primary email |
    | App attributes    | email         |
12. Нажмите **Finish**.

14. Чтобы включить приложение, нажмите **OFF** для всех и измените настройку на **ON** для всех. Доступ также можно ограничить группами или организационными подразделениями, выбрав соответствующие параметры в левой части экрана.

</details>

### Настройка Azure (Microsoft) SAML {#configure-azure-microsoft-saml}

Azure (Microsoft) SAML также может называться Azure Active Directory (AD) или Microsoft Entra.

<details>
   <summary>  Создание корпоративного приложения Azure </summary>
   
   Вы настроите одну интеграцию приложения с отдельным URL-адресом входа для каждой организации.
   
   1. Войдите в центр администрирования Microsoft Entra.
   
   2. Перейдите в раздел **Applications > Enterprise applications** слева.
   
   3. Нажмите **New application** в верхнем меню.
   
   4. Нажмите **Create your own application** в верхнем меню.
   
   5. Введите имя и выберите **Integrate any other application you don't find in the gallery (Non-gallery)**, затем нажмите **Create**.
   
      <Image img={samlAzureApp} size="md" alt="Приложение Azure вне галереи" force/>
   
   6. Нажмите **Users and groups** слева и назначьте пользователей.
   
   7. Нажмите **Single sign-on** слева.
   
   8. Нажмите **SAML**.
   
   9. Используйте следующие настройки для заполнения экрана Basic SAML Configuration.
   
      | Поле                     | Значение |
      |---------------------------|-------|
      | Identifier (Entity ID)    | `urn:auth0:ch-production:{organizationid}` |
      | Reply URL (Assertion Consumer Service URL) | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Sign on URL               | `https://console.clickhouse.cloud/?connection={organizationid}` |
      | Relay State               | Пусто |
      | Logout URL                | Пусто |
   
   11. Добавьте (A) или обновите (U) следующие параметры в разделе Attributes & Claims:
   
       | Имя утверждения                           | Формат        | Исходный атрибут |
       |--------------------------------------|---------------|------------------|
       | (U) Unique User Identifier (Name ID) | Email address | user.mail        |
       | (A) email                            | Basic         | user.mail        |
       | (U) /identity/claims/name            | Omitted       | user.mail        |
   
         <Image img={samlAzureClaims} size="md" alt="Атрибуты и утверждения" force/>
   
   12. Соберите эти два элемента и перейдите к разделу Submit a Support Case выше, чтобы завершить процесс:
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

3.  Используйте следующие значения для обновления вашего облачного приложения в Duo:

    | Поле                                | Значение                                                                      |
    | :----------------------------------- | :------------------------------------------------------------------------- |
    | Entity ID                            | `urn:auth0:ch-production:{organizationid}`                                 |
    | Assertion Consumer Service (ACS) URL | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
    | Service Provider Login URL           | `https://console.clickhouse.cloud/?connection={organizationid}`            |

4.  Соберите эти два элемента и перейдите к разделу Submit a Support Case выше, чтобы завершить процесс:
    - Single Sign-On URL
    - Certificate

</details>

## Как это работает {#how-it-works}

### Управление пользователями с помощью SAML SSO {#user-management-with-saml-sso}

Для получения дополнительной информации об управлении правами пользователей и ограничении доступа исключительно SAML‑подключениями см. раздел [Manage cloud users](/cloud/security/manage-cloud-users).

### SSO, инициируемое поставщиком услуг {#service-provider-initiated-sso}

Мы используем только SSO, инициируемое поставщиком услуг. Это означает, что пользователи переходят по адресу `https://console.clickhouse.cloud` и вводят свой адрес электронной почты, после чего перенаправляются к IdP для аутентификации. Пользователи, уже аутентифицированные через ваш IdP, могут использовать прямую ссылку для автоматического входа в вашу организацию без ввода адреса электронной почты на странице входа.

### Мультиорганизационное SSO {#multi-org-sso}

ClickHouse Cloud поддерживает мультиорганизационное SSO, предоставляя отдельное подключение для каждой организации. Используйте прямую ссылку (`https://console.clickhouse.cloud/?connection={organizationid}`) для входа в каждую соответствующую организацию. Перед входом в другую организацию обязательно выйдите из текущей.

## Дополнительная информация {#additional-information}

Безопасность — наш главный приоритет, когда речь идет об аутентификации. По этой причине при реализации SSO мы приняли несколько решений, о которых вам необходимо знать.

- **Мы обрабатываем только потоки аутентификации, инициированные со стороны поставщика услуги.** Пользователи должны перейти на `https://console.clickhouse.cloud` и ввести адрес электронной почты, после чего будут перенаправлены к вашему провайдеру идентификации. Инструкции по добавлению приложения-закладки или ярлыка предоставлены для вашего удобства, чтобы вашим пользователям не нужно было запоминать URL.

- **Мы не связываем автоматически учетные записи с SSO и без него.** В вашем списке пользователей ClickHouse вы можете видеть несколько учетных записей для одних и тех же пользователей, даже если они используют один и тот же адрес электронной почты.

## Устранение распространённых проблем {#troubleshooting-common-issues}

| Ошибка | Причина | Решение | 
|:------|:------|:---------|
| Ошибка может быть связана с некорректной конфигурацией системы или сбоем сервиса | Вход, инициированный провайдером идентификации | Чтобы устранить эту ошибку, попробуйте использовать прямую ссылку `https://console.clickhouse.cloud/?connection={organizationid}`. Следуйте приведённым выше инструкциям для вашего провайдера идентификации, чтобы сделать этот метод входа методом по умолчанию для ваших пользователей | 
| Вы перенаправляетесь к вашему провайдеру идентификации, а затем обратно на страницу входа | В провайдере идентификации отсутствует сопоставление атрибута email | Следуйте приведённым выше инструкциям для вашего провайдера идентификации, чтобы настроить атрибут email пользователя и войдите снова | 
| Пользователь не назначен этому приложению | Пользователь не был назначен приложению ClickHouse в провайдере идентификации | Назначьте пользователя приложению в провайдере идентификации и войдите снова |
| У вас несколько организаций ClickHouse, интегрированных с SAML SSO, и вы всегда входите в одну и ту же организацию, независимо от того, по какой ссылке или плитке вы переходите | Вы всё ещё авторизованы в первой организации | Выйдите из учётной записи, затем войдите в другую организацию |
| В URL на короткое время отображается `access denied` | Домен вашего адреса электронной почты не совпадает с доменом, который у нас настроен | Обратитесь в службу поддержки за помощью в устранении этой ошибки |
