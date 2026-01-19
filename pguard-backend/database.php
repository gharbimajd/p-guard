<?php
// 1. CONFIGURATION DE SÉCURITÉ CORS
// Important : Pour que credentials: true fonctionne, Origin ne doit PAS être '*'
header("Access-Control-Allow-Origin: http://localhost:4200");
// C'EST LA LIGNE QUI MANQUAIT :
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: PUT, GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// 2. GESTION DU PREFLIGHT (La requête préliminaire de vérification)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. IDENTIFIANTS BASE DE DONNÉES
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'api_db');

// 4. CONNEXION
function connect(){
  $connect = @mysqli_connect(DB_HOST ,DB_USER ,DB_PASS ,DB_NAME);

  if (mysqli_connect_errno()) {
    // Si échec, on renvoie une erreur JSON propre (500 Internal Server Error)
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Database Connection Error: " . mysqli_connect_error()
    ]);
    exit();
  }

  mysqli_set_charset($connect, "utf8");
  return $connect;
}

$con = connect();
?>