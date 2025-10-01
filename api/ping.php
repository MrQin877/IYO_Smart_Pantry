<?php
require __DIR__ . '/config.php';
send_json(['ok' => true, 'msg' => 'pong', 'time' => date('c')]);
