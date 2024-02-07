## Turn App Documentation

---

#### Schema Auth

<details>
 <summary>
 <code>POST</code>  <code>/api/auth/register</code></summary>

##### Parameters

> | name     | type     | data type | description              |
> | -------- | -------- | --------- | ------------------------ |
> | email    | required | string    | Unique email to register |
> | password | required | string    | 6-25 length password     |

##### Responses

> | http code | content-type     | response                                                 |
> | --------- | ---------------- | -------------------------------------------------------- |
> | `201`     | application/json | `{"code":"422","content":"Usuario creado exitosamente"}` |
> | `422`     | application/json | `{"code":"422","message":"Unproccesable data"}`          |
> | `500`     | application/json | `{"code":"500","message":"Unkonown server error"}`       |

##### Example cURL

> ```javascript
> axios({
>   method: "post",
>   url: "/api/auth/register",
>   data: { email: "email@example.com", password: "password1234" },
> });
> ```

</details>

<details>
<summary><code>POST </code> <code>/api/auth/login</code> </summary>
##### Parameters

> | name     | type     | data type | description              |
> | -------- | -------- | --------- | ------------------------ |
> | email    | required | string    | Unique email to register |
> | password | required | string    | 6-25 length password     |

##### Responses

> | http code | content-type     | response                                           |
> | --------- | ---------------- | -------------------------------------------------- |
> | `200`     | application/json | `{"code":"200","content": auth: object}`           |
> | `422`     | application/json | `{"code":"422","message":"Unproccesable data"}`    |
> | `500`     | application/json | `{"code":"500","message":"Unkonown server error"}` |

##### Example cURL

> ```javascript
> axios({
>   method: "post",
>   url: "/api/auth/login",
>   data: { email: "email@example.com", password: "password1234" },
> });
> ```

</details>
<details>

<summary><code>POST </code> <code>/api/auth/logout</code> </summary>

##### Headers

> | name          | type     | data type    | description           |
> | ------------- | -------- | ------------ | --------------------- |
> | Authorization | required | Bearer Token | Token provided by api |

##### Parameters

> NONE

##### Responses

> | http code | content-type     | response                                                  |
> | --------- | ---------------- | --------------------------------------------------------- |
> | `200`     | application/json | `{"code":"200","content": "Sesión cerrada exitosamente"}` |
> | `500`     | application/json | `{"code":"500","message":"Unkonown server error"}`        |

##### Example cURL

> ```javascript
> axios({
>   method: "post",
>   headers: {Authorization: `Bearer ${token}`}
>   url: "/api/auth/logout",
> });
> ```

</details>
<details>

<summary><code>POST </code> <code>/api/auth/logout/all</code> </summary>

##### Headers

> | name          | type     | data type    | description           |
> | ------------- | -------- | ------------ | --------------------- |
> | Authorization | required | Bearer Token | Token provided by api |

##### Parameters

> NONE

##### Responses

> | http code | content-type     | response                                                        |
> | --------- | ---------------- | --------------------------------------------------------------- |
> | `200`     | application/json | `{"code":"200","content": "Se han cerrado todas las sesiones"}` |
> | `500`     | application/json | `{"code":"500","message":"Unkonown server error"}`              |

##### Example cURL

> ```javascript
> axios({
>   method: "post",
>   headers: {Authorization: `Bearer ${token}`}
>   url: "/api/auth/logout/all",
> });
> ```

</details>
