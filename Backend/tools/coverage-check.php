<?php

$coverageFile = $argv[1] ?? __DIR__.'/../coverage.xml';
$minimum = isset($argv[2]) ? (float) $argv[2] : 100.0;

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

    $metricsNodes = $xml->xpath('//metrics');
    if ($metricsNodes !== false) {
        foreach ($metricsNodes as $metrics) {
            $attrs = $metrics->attributes();
            // Clover may use 'statements' and 'coveredstatements'
            if (isset($attrs['statements']) && isset($attrs['coveredstatements'])) {
                $total = (float) $attrs['statements'];
                $covered = (float) $attrs['coveredstatements'];
                if ($total > 0) {
                    $lineRate = $covered / $total;
                    break;
                }
            }
            // Or use 'lines' and 'coveredlines'
            if (isset($attrs['lines']) && isset($attrs['coveredlines'])) {
                $total = (float) $attrs['lines'];
                $covered = (float) $attrs['coveredlines'];
                if ($total > 0) {
                    $lineRate = $covered / $total;
                    break;
                }
            }
            // Or use 'elements' and 'coveredelements'
            if (isset($attrs['elements']) && isset($attrs['coveredelements'])) {
                $total = (float) $attrs['elements'];
                $covered = (float) $attrs['coveredelements'];
                if ($total > 0) {
                    $lineRate = $covered / $total;
                    break;
                }
            }
        }
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

echo sprintf("Line coverage %.2f%% meets minimum %.2f%%.\n", $percentage, $minimum);
