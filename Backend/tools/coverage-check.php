<?php

$coverageFile = $argv[1] ?? __DIR__.'/../coverage.xml';
$minimum = isset($argv[2]) ? (float) $argv[2] : 100.0;
$minimumMethods = isset($argv[3]) ? (float) $argv[3] : null;
$methodPercentage = 0.0;
$scopeArg = $argv[4] ?? null;
$scopeDirectories = $scopeArg
    ? array_values(array_filter(array_map('trim', explode(',', (string) $scopeArg))))
    : ['app/MatchingContext', 'app/MarketGovernanceContext', 'app/AuthenticationContext'];

if (! file_exists($coverageFile)) {
    fwrite(STDERR, "Coverage file not found: {$coverageFile}\n");
    exit(1);
}

$xml = simplexml_load_file($coverageFile);
if ($xml === false) {
    fwrite(STDERR, "Failed to parse coverage file.\n");
    exit(1);
}

$project = $xml->project;

// Prefer explicit project line-rate when present
if ($project && isset($project['line-rate'])) {
    $lineRate = (float) $project['line-rate'];
} else {
    // Fallback: try to compute line rate from metrics elements
    $lineRate = null;

    $totalStatements = 0.0;
    $totalCovered = 0.0;

    $fileNodes = $xml->xpath('//file');
    if ($fileNodes !== false && count($fileNodes) > 0) {
        foreach ($fileNodes as $file) {
            $fileName = (string) ($file->attributes()['name'] ?? '');
            if ($fileName === '') {
                continue;
            }

            $inScope = false;
            foreach ($scopeDirectories as $scopeDirectory) {
                if ($scopeDirectory !== '' && str_contains(str_replace('\\', '/', $fileName), '/'.trim($scopeDirectory, '/').'/')) {
                    $inScope = true;
                    break;
                }
            }
            if (! $inScope) {
                continue;
            }

            $metrics = $file->metrics;
            if (! $metrics) {
                continue;
            }

            $attrs = $metrics->attributes();
            if (isset($attrs['statements']) && isset($attrs['coveredstatements'])) {
                $totalStatements += (float) $attrs['statements'];
                $totalCovered += (float) $attrs['coveredstatements'];

                continue;
            }
            if (isset($attrs['lines']) && isset($attrs['coveredlines'])) {
                $totalStatements += (float) $attrs['lines'];
                $totalCovered += (float) $attrs['coveredlines'];

                continue;
            }
            if (isset($attrs['elements']) && isset($attrs['coveredelements'])) {
                $totalStatements += (float) $attrs['elements'];
                $totalCovered += (float) $attrs['coveredelements'];

                continue;
            }
        }
    }

    if ($totalStatements > 0) {
        $lineRate = $totalCovered / $totalStatements;
    }

    if ($lineRate === null) {
        fwrite(STDERR, "Coverage file does not contain project line-rate or usable metrics.\n");
        exit(1);
    }
}
$percentage = $lineRate * 100.0;

if ($percentage + 0.0001 < $minimum) {
    fwrite(STDERR, sprintf("Line coverage %.2f%% is below minimum %.2f%%.\n", $percentage, $minimum));
    exit(1);
}

if ($minimumMethods !== null) {
    $scopePredicates = [];
    foreach ($scopeDirectories as $scopeDirectory) {
        $scopeDirectory = trim($scopeDirectory);
        if ($scopeDirectory === '') {
            continue;
        }
        $scopePredicates[] = "contains(translate(@name, '\\\\', '/'), '/".trim($scopeDirectory, '/')."/')";
    }

    $classMetricsNodes = [];
    if (count($scopePredicates) > 0) {
        $expr = '//file['.implode(' or ', $scopePredicates).']/class/metrics';
        $result = $xml->xpath($expr);
        if ($result !== false) {
            $classMetricsNodes = $result;
        }
    }

    if ($classMetricsNodes === false || count($classMetricsNodes) === 0) {
        fwrite(STDERR, "Coverage file does not contain class metrics for method coverage.\n");
        exit(1);
    }

    $totalMethods = 0.0;
    $totalCoveredMethods = 0.0;
    foreach ($classMetricsNodes as $metrics) {
        $attrs = $metrics->attributes();
        if (isset($attrs['methods']) && isset($attrs['coveredmethods'])) {
            $totalMethods += (float) $attrs['methods'];
            $totalCoveredMethods += (float) $attrs['coveredmethods'];
        }
    }

    if ($totalMethods <= 0) {
        fwrite(STDERR, "No methods found in class metrics.\n");
        exit(1);
    }

    $methodRate = $totalCoveredMethods / $totalMethods;
    $methodPercentage = $methodRate * 100.0;

    if ($methodPercentage + 0.0001 < $minimumMethods) {
        fwrite(STDERR, sprintf("Method coverage %.2f%% is below minimum %.2f%%.\n", $methodPercentage, $minimumMethods));
        exit(1);
    }
}

echo sprintf("Line coverage %.2f%% meets minimum %.2f%%.\n", $percentage, $minimum);
if ($minimumMethods !== null) {
    echo sprintf("Method coverage %.2f%% meets minimum %.2f%%.\n", $methodPercentage, $minimumMethods);
}
