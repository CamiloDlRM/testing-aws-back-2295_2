# Arkad API Documentation

Welcome to the Arkad API documentation. Here you'll find information about each API endpoint and how to use them. All is divided by modules.

## Table of Modules
- [Auth](#auth)

## Auth

This module is responsible for user authentication and handling sessions for the Arkad API. It integrates with an external identity provider (Supabase) for credential verification and utilizes JWTs (JSON Web Tokens) for session management.

To enhance security, this API **does not** rely on storing JWTs in browser `localStorage`. Instead, upon successful authentication or token refresh, it sets the necessary tokens (`access-token`, `refresh-token`) as **secure, `HttpOnly` cookies**. This approach mitigates risks associated with Cross-Site Scripting (XSS) attacks trying to steal tokens. Browsers (and tools like Postman) will automatically handle sending these cookies on subsequent requests to the API.

### Endpoints

This module provides the following endpoints:

-   [`POST /auth/login`](#login)
-   [`POST /auth/refresh`](#refresh)
-   [`POST /auth/logout`](#logout)
-   [`GET /auth/me`](#get-user-profile-authme)

---

### Login

<a name="login"></a>
`POST /auth/login`

**Description:** Authenticates a user using their registered email and password. On successful authentication with the identity provider and validation against the local user database (including activating pending accounts), it establishes a session by setting secure `HttpOnly` cookies containing the access and refresh tokens.

**Request Body:**

Requires `Content-Type: application/json`.

```json
{
  "email": "user@example.com",
  "password": "yourSecurePassword"
}
```

### Refresh

<a name="refresh"></a>
`POST /auth/refresh`

**Description:** Refreshes the user's session by generating a new access token using the refresh token stored in a secure `HttpOnly` cookie. This endpoint is typically called when the access token expires.

**Request Headers:**

Requires `Cookie: refresh-token=<refresh_token>`.

### Logout

<a name="logout"></a>
`POST /auth/logout`

**Description:** Logs out the user by clearing the secure `HttpOnly` cookies containing the access and refresh tokens.

**Request Headers:**

Requires `Cookie: access-token=<access_token>, refresh-token=<refresh_token>`.

### Get User Profile (Auth/me)

<a name="get-user-profile-authme"></a>
`GET /auth/me`

**Description:** Retrieves the user's profile information.

**Request Headers:**

Requires `Cookie: access-token=<access_token>`.

**Response Body:**

Returns a JSON object containing the user's profile information.

```json
{
  "id": "user-uuid-string",
  "name": "User Name",
  "username": "username",
  "email": "user@example.com",
  "isActive": true,
  "createdAt": "2023-10-27T10:00:00.000Z",
  "updatedAt": "2023-10-27T10:00:00.000Z",
  "role": {
    "name": "Student",
    "description": "Student role"
  },
  "confirmationStatus": {
    "status": "CONFIRMADO"
  }
}
```
