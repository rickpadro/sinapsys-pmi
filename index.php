<?php

// Tell Laravel this app runs in a subdirectory
$_SERVER['SCRIPT_NAME'] = '/00_SinapSYS/08_PMI_SinapSYS/index.php';
$_SERVER['SCRIPT_FILENAME'] = __DIR__ . '/public/index.php';

require __DIR__.'/public/index.php';
