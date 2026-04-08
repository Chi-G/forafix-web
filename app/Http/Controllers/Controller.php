<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

/**
 * @OA\Info(
 *     title="Forafix API Documentation",
 *     version="1.0.0",
 *     description="Marketplace API with Wallet, Escrow and Booking management",
 *     @OA\Contact(
 *         email="info@forahia.com"
 *     )
 * )
 * @OA\SecurityScheme(
 *     type="http",
 *     securityScheme="sanctum",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 */
#[OA\Info(
    title: "Forafix API Documentation",
    version: "1.0.0",
    description: "Marketplace API with Wallet, Escrow and Booking management",
    contact: new OA\Contact(email: "info@forahia.com")
)]
#[OA\SecurityScheme(
    securityScheme: "sanctum",
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT"
)]
abstract class Controller
{
    //
}
