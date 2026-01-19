<?php
class Database {
    private $host = "localhost";
    private $username = "root";
    private $password = "";
    private $database = "angular_auth_api";
    public $conn;

    public function getConnection() {
        $this->conn = new mysqli($this->host, $this->username, $this->password, $this->database);

        if ($this->conn->connect_error) {
            die("Connexion échouée: " . $this->conn->connect_error);
        }
        return $this->conn;
    }
}
?>
