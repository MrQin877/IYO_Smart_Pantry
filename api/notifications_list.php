<?php
// C:\xampp\htdocs\IYO_Smart_Pantry\api\notifications_list.php
require_once __DIR__ . '/config.php';

$userID = $_SESSION['user_id'] ?? null;
if (!$userID) respond(['ok'=>false,'error'=>'Unauthorized'], 401);

$tab      = $_GET['tab']      ?? 'all';          // all|unread|read
$category = trim($_GET['category'] ?? '');       // e.g. "Expiry"
$q        = trim($_GET['q'] ?? '');
$limit    = max(1, min((int)($_GET['limit'] ?? 20), 100));
$cursorTs = $_GET['cursor'] ?? '';               // ISO timestamp
$cursorId = $_GET['cursor_id'] ?? '';            // noticeID tie-breaker

$where = ["n.userID = :uid"];
$params = [':uid'=>$userID];

if ($tab === 'unread')      $where[] = "n.is_read = 0";
elseif ($tab === 'read')    $where[] = "n.is_read = 1";

if ($category !== '') {
  $where[] = "c.noticeCateName = :cat";
  $params[':cat'] = $category;
}

if ($q !== '') {
  $where[] = "(n.title LIKE :q OR n.message LIKE :q)";
  $params[':q'] = '%'.$q.'%';
}

if ($cursorTs !== '') {
  $dt = date('Y-m-d H:i:s', strtotime($cursorTs));
  $where[] = "(n.created_at < :curTs OR (n.created_at = :curTs AND n.noticeID < :curId))";
  $params[':curTs'] = $dt;
  $params[':curId'] = $cursorId !== '' ? $cursorId : 'ZZZ';
}

$sql = "SELECT n.noticeID, n.title, n.message, n.is_read, n.created_at,
               c.noticeCateName
        FROM notifications n
        LEFT JOIN notification_categories c ON c.noticeCateID = n.noticeCateID
        WHERE ".implode(' AND ', $where)."
        ORDER BY n.created_at DESC, n.noticeID DESC
        LIMIT :lim";

$stmt = $pdo->prepare($sql);
foreach ($params as $k=>$v) $stmt->bindValue($k, $v);
$stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
$stmt->execute();
$rows = $stmt->fetchAll();

$items = array_map(function($r){
  return [
    'id'        => $r['noticeID'],
    'category'  => $r['noticeCateName'] ?? 'System',
    'title'     => $r['title'],
    'message'   => $r['message'] ?? '',
    'createdAt' => date(DATE_ATOM, strtotime($r['created_at'])),
    'isRead'    => (int)$r['is_read'] === 1,
  ];
}, $rows);

$next_cursor = null; $next_cursor_id = null;
if (count($rows) === $limit) {
  $last = end($rows);
  $next_cursor    = date(DATE_ATOM, strtotime($last['created_at']));
  $next_cursor_id = $last['noticeID'];
}

respond(['ok'=>true, 'items'=>$items, 'next_cursor'=>$next_cursor, 'next_cursor_id'=>$next_cursor_id]);
