<?php
require 'database.php';

// Récupération des données brutes envoyées par Angular
$postdata = file_get_contents("php://input");

if(isset($postdata) && !empty($postdata))
{
    // On décode le JSON
    $request = json_decode($postdata);

    // 🔍 CORRECTION ICI : On vérifie 'username' au lieu de 'email'
    // (Assurez-vous que votre formulaire Angular envoie bien "username")
    if(trim($request->username) === '' || trim($request->password) === '') {
        return http_response_code(400);
    }

    // Sécurisation des entrées
    $username = mysqli_real_escape_string($con, trim($request->username));
    $password = mysqli_real_escape_string($con, trim($request->password));

    // La requête SQL cherche par USERNAME
    $sql = "SELECT * FROM users WHERE username='{$username}' AND password='{$password}' LIMIT 1";

    if($result = mysqli_query($con, $sql))
    {
        $rows = array();
        if(mysqli_num_rows($result) > 0)
        {
            $row = mysqli_fetch_assoc($result);
            
            // On retire le mot de passe de la réponse pour la sécurité
            unset($row['password']);
            
            // On renvoie l'utilisateur trouvé (Token fictif ici)
            echo json_encode([
                "success" => true,
                "message" => "Login successful",
                "data" => $row,
                "token" => "fake-jwt-token" 
            ]);
        }
        else
        {
            http_response_code(401); // 401 = Non autorisé
            echo json_encode(["message" => "Username ou mot de passe incorrect"]);
        }
    }
    else
    {
        http_response_code(500);
        echo json_encode(["message" => "Erreur interne SQL"]);
    }
}
?>