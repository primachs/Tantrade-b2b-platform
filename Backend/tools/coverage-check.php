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
if (! $project || ! isset($project['line-rate'])) {
    fwrite(STDERR, "Coverage file does not contain project line-rate.\n");
    exit(1);
}

$lineRate = (float) $project['line-rate'];
$percentage = $lineRate * 100.0;

if ($percentage + 0.0001 < $minimum) {
    fwrite(STDERR, sprintf("Line coverage %.2f%% is below minimum %.2f%%.\n", $percentage, $minimum));
    exit(1);
}

echo sprintf("Line coverage %.2f%% meets minimum %.2f%%.\n", $percentage, $minimum);
