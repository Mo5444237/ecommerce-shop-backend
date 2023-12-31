﻿# ecommerce-shop-backend
## Overview

An ecommerce backend using node js (express js). It manages product data, user authentication, order processing, and integrates with external services like Stripe for secure payments.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Admin](#admin)
  - [Shop](#shop)
- [External Services](#external-services)
  - [Stripe Integration](#stripe-integration)
  - [Mailtrap](#mailtrap)
- [Features](#features)
- [Contact](#contact)

## Getting Started

To get started with the project, follow these steps:

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Stripe Webhook local listener](https://dashboard.stripe.com/test/webhooks/create?endpoint_location=local)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Mo5444237/ecommerce-shop-backend.git
   ```
2. Navigate to the project folder:

    ```bash
   cd ecommerce-shop-backend
   ```
3. Install dependencies:

   ```bash
   npm install
   ```
4. Set up your environment variables:

    Make sure to set-up environment variables inside `.env` file before starting the server.
   
5. Start the server:

   ```bash
   npm start
   ```

## API Endpoints

### Authentication

- **POST /auth/signup**: Register a new user.
- **POST /auth/login**: Log in and receive an authentication token.
- **GET /auth/profile**: Get logged user data.
- **GET /auth/refresh-token**: Send a new access token using a refresh token.
- **GET /auth/logout**: logout the user and clear httpOnly cookie of refresh token.
- **POST /auth/reset-token**: send an email with 6 digits OTP for reseting the password.
- **PUT /auth/reset-password**: Reset the password using the OTP sent in email.
- **PUT /auth/change-password**: Change the old password to a new one.

### Admin

#### Products
- **POST /admin/product**: Ceate a new product.
- **PUT /admin/product/:productId**: Update a specific product.
- **DELETE /admin/product/:productId**: Delete a product from the inventory.

#### Categories
+ **POST /admin/category**: Ceate a new category.
+ **PUT /admin/category/:categoryId**: Update a specific category.
+ **DELETE /admin/category/:categoryId**: Delete a specific category.

#### Sub Categories
* **POST /admin/subcategory**: Ceate a new subcategory.
* **PUT /admin/subcategory/:subCategoryId**: Update a specific subcategory.
* **DELETE /admin/subcategory/:subCategoryId**: Delete a specific subcategory.
  


### Shop
#### Products:
- **GET /shop/products**: Get a list of all products.
- **GET /shop/product/:productId**: Get details of a specific product.

#### Cart:
+ **GET /shop/cart**: Get logged user cart.
+ **POST /shop/cart**: Add item to cart.
+ **PATCH /shop/cart**: Decrease item quantity from cart.
+ **DELETE /shop/cart**: Remove the whole item from cart.

#### Orders:
* **GET /shop/orders**: Get a list of all user orders.
* **GET /shop/orders/:orderId**: Get details of a specific order.
* **POST /shop/checkout**: Create a checkout session using stripe.

## External Services

### Stripe Integration

Application integrates with Stripe for payment processing. To use this feature, make sure to set up your Stripe account and add your Stripe secret key and Stripe webhook secret key to the `.env` file.

### Mailtrap

Mailtrap is utilized for testing email functionality. To enable email testing, configure your Mailtrap credentials in the `.env` file:

```env
EMAIL_USER= your-mailtrap-username
EMAIL_PASSWORD= your-mailtrap-password
```

## Features

- **RESTful APIs:**  Provides RESTful APIs for managing products and orders, making it easy to interact with the server.

- **JWT-based Authentication:** Secure user interactions are ensured through JSON Web Token (JWT) authentication (access and refresh Tokens), enhancing the overall security of the application.

- **Express-validator:** Ensuring that any data submitted by the user is valid, Otherwise generate the appropriate errors status and messages.

- **Errors-middleware:** Make sure that all errors are handled in a right way and the client informed with appropriate messages and data accross all the application.

- **MongoDB Integration:** The backend seamlessly integrates with MongoDB using Mongoose ORM for efficient and scalable data storage, ensuring a reliable foundation for your e-commerce platform.

- **Multer for File Uploads:** Multer is employed for handling file uploads, enabling admins to add and manage product images with ease.

- **Stripe Integration for Payments:** Application integrates with Stripe, allowing for smooth and secure payment processing for your customers.
  
- **Stripe Webhooks:** Application integrates with Stripe weebhooks, providing secure way for managing orders and stroing them in the database.

- **Mailtrap for Email services:** Utilizing Mailtrap for email functionality used when reseting a password or any kind of operation such as (verify accounts, newsLetter subscriptions, ...etc).

- **Npm for Dependency Management:** The project uses Npm as a package manager for efficient and reliable dependency management.

- **Cross-Platform Compatibility:** The application is designed to be compatible with different operating systems, providing a seamless experience for developers across platforms.

## Contact

Have questions or feedback? Reach out to us at:

- Email: [mo5444237@gmail.com](mailto:mo5444237@gmail.com)
- GitHub Issues: [Open an Issue](https://github.com/Mo5444237/ecommerce-shop-backend/issues)


