<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>TanTrade Admin</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&family=Quicksand:wght@500;600;700&display=swap" rel="stylesheet">

    @viteReactRefresh
    @vite(['resources/css/admin.css', 'resources/js/admin/index.tsx'])
</head>
<body class="antialiased">
    <div id="admin-root"></div>
</body>
</html>
