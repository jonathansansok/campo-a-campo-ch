<?php

// unico punto de contacto con la API. cURL a pelo, sin librerias.
class ClienteApi
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim(getenv('API_URL') ?: 'http://localhost:3000', '/');
    }

    public function get(string $ruta): array
    {
        return $this->pedir('GET', $ruta);
    }

    public function post(string $ruta, array $datos): array
    {
        return $this->pedir('POST', $ruta, $datos);
    }

    public function put(string $ruta, array $datos): array
    {
        return $this->pedir('PUT', $ruta, $datos);
    }

    public function delete(string $ruta): array
    {
        return $this->pedir('DELETE', $ruta);
    }

    private function pedir(string $metodo, string $ruta, ?array $datos = null): array
    {
        $conexion = curl_init($this->baseUrl . $ruta);
        curl_setopt_array($conexion, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST  => $metodo,
            CURLOPT_CONNECTTIMEOUT => 3,
            CURLOPT_TIMEOUT        => 5,
        ]);
        if ($datos !== null) {
            curl_setopt($conexion, CURLOPT_POSTFIELDS, json_encode($datos));
            curl_setopt($conexion, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        }

        $respuesta = curl_exec($conexion);
        if ($respuesta === false) {
            $motivo = curl_error($conexion);
            curl_close($conexion);
            throw new RuntimeException("No se pudo conectar con la API ($motivo)");
        }

        $codigo = curl_getinfo($conexion, CURLINFO_RESPONSE_CODE);
        curl_close($conexion);

        $cuerpo = $respuesta === '' ? [] : json_decode($respuesta, true);

        if ($codigo >= 400) {
            $mensaje = $cuerpo['message'] ?? 'La API devolvio un error';
            if (is_array($mensaje)) {
                $mensaje = implode('. ', $mensaje);
            }
            throw new RuntimeException($mensaje, $codigo);
        }

        return is_array($cuerpo) ? $cuerpo : [];
    }
}
