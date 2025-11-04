<!doctype html>
<html>
  <body>
    <script>
      (function(){
        const payload = @json(isset($error) ? $error : ['token' => $token]);
        if (window.opener) {
          window.opener.postMessage({ type: 'google-auth-result', payload }, '*');
          window.close();
        } else {
          document.body.innerText = JSON.stringify(payload);
        }
      })();
    </script>
  </body>
</html>
