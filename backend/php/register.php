<?php
require 'database.php';

// Gérer la requête OPTIONS (CORS Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$postdata = file_get_contents("php://input");

if(isset($postdata) && !empty($postdata))
{
  $request = json_decode($postdata);

  // Vérification que les champs ne sont pas vides
  if(trim($request->username) === '' || trim($request->password) === '') {
      http_response_code(400);
      echo json_encode(["success" => false, "message" => "Champs manquants"]);
      exit;
  }

  // Nettoyage et récupération des données (ALIGNÉ AVEC VOTRE ANGULAR)
  $username = mysqli_real_escape_string($con, trim($request->username));
  $password = mysqli_real_escape_string($con, trim($request->password)); 
  $immatricule = mysqli_real_escape_string($con, trim($request->immatricule));
  
  // ICI : On récupère 'adresse' car c'est ce que votre Register.ts envoie
  $adresse = mysqli_real_escape_string($con, trim($request->adresse));

  // Insertion dans la base
  $sql = "INSERT INTO users (username, password, immatricule, adresse) VALUES ('{$username}', '{$password}', '{$immatricule}', '{$adresse}')";

  if(mysqli_query($con, $sql))
  {
    http_response_code(201);
    echo json_encode(["success" => true, "message" => "Inscription réussie !"]);
  }
  else
  {
    // Si erreur (souvent doublon d'email ou username)
    http_response_code(422);
    echo json_encode(["success" => false, "message" => "Erreur: Nom d'utilisateur ou Email déjà pris."]);
  }
}
?>