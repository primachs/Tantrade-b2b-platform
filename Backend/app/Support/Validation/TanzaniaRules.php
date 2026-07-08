<?php

namespace App\Support\Validation;

use App\Support\Geography\TanzaniaRegions;
use Illuminate\Validation\Rule;

final class TanzaniaRules
{
    /** NIDA: 20 numeric digits (Tanzania National ID). */
    public static function nida(bool $required = true): array
    {
        $rules = ['string', 'regex:/^\d{20}$/'];

        return $required ? array_merge(['required'], $rules) : array_merge(['nullable'], $rules);
    }

    /** TIN: 9 numeric digits (TRA Tax Identification Number). */
    public static function tin(bool $required = true): array
    {
        $rules = ['string', 'regex:/^\d{9}$/'];

        return $required ? array_merge(['required'], $rules) : array_merge(['nullable'], $rules);
    }

    /** BRELA registration number: 6–12 alphanumeric characters. */
    public static function brela(bool $required = true): array
    {
        $rules = ['string', 'regex:/^[A-Za-z0-9]{6,12}$/'];

        return $required ? array_merge(['required'], $rules) : array_merge(['nullable'], $rules);
    }

    /** Tanzania mobile: +255 or 0 prefix followed by 9 digits. */
    public static function mobile(bool $required = false): array
    {
        $rules = ['string', 'regex:/^(\+255|0)[67]\d{8}$/'];

        return $required ? array_merge(['required'], $rules) : array_merge(['nullable'], $rules);
    }

    public static function region(bool $required = true): array
    {
        $rules = ['string', Rule::in(TanzaniaRegions::regionNames())];

        return $required ? array_merge(['required'], $rules) : array_merge(['nullable'], $rules);
    }

    public static function district(bool $required = true): array
    {
        return $required ? ['required', 'string', 'max:100'] : ['nullable', 'string', 'max:100'];
    }
}
