<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Email Verified</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <style>
      :root {
        --bg-gradient-start: #0f172a;
        --bg-gradient-end: #1e293b;
        --card-bg: #ffffff;
        --card-border: #e5e7eb;
        --text-main: #111827;
        --text-muted: #6b7280;
        --accent: #4f46e5;
        --accent-soft: #eef2ff;
        --success: #22c55e;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
          sans-serif;
        background: radial-gradient(circle at top, var(--bg-gradient-start), var(--bg-gradient-end));
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
      }

      .card {
        background: var(--card-bg);
        border-radius: 18px;
        border: 1px solid var(--card-border);
        box-shadow:
          0 24px 60px rgba(15, 23, 42, 0.35),
          0 0 0 1px rgba(148, 163, 184, 0.18);
        max-width: 480px;
        width: 100%;
        padding: 24px 24px 20px;
        color: var(--text-main);
        position: relative;
        overflow: hidden;
      }

      .card::before {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 0 0, rgba(79, 70, 229, 0.12), transparent 55%);
        pointer-events: none;
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }

      .icon-pill {
        width: 40px;
        height: 40px;
        border-radius: 999px;
        background: var(--accent-soft);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--accent);
        font-size: 22px;
        flex-shrink: 0;
      }

      h1 {
        font-size: 1.25rem;
        margin: 0;
        font-weight: 650;
        letter-spacing: -0.01em;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      h1 span.badge {
        font-size: 0.7rem;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(34, 197, 94, 0.08);
        color: var(--success);
        text-transform: uppercase;
      }

      .subtitle {
        margin-top: 4px;
        font-size: 0.85rem;
        color: var(--text-muted);
      }

      .messages {
        margin: 16px 0 12px;
        display: grid;
        gap: 6px;
      }

      .msg-line {
        font-size: 0.95rem;
      }

      .msg-en {
        font-weight: 500;
      }

      .msg-th {
        color: var(--text-muted);
      }

      .divider {
        margin: 12px 0;
        height: 1px;
        background: linear-gradient(
          to right,
          transparent,
          rgba(148, 163, 184, 0.6),
          transparent
        );
      }

      .countdown-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-size: 0.85rem;
        color: var(--text-muted);
        margin-bottom: 8px;
      }

      .countdown-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 999px;
        background: #f3f4f6;
        font-size: 0.8rem;
        font-weight: 500;
        color: #4b5563;
      }

      .countdown-number {
        font-variant-numeric: tabular-nums;
        font-weight: 600;
        color: var(--accent);
      }

      .progress-track {
        position: relative;
        width: 100%;
        height: 6px;
        border-radius: 999px;
        background: #e5e7eb;
        overflow: hidden;
      }

      .progress-bar {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(
          90deg,
          var(--accent),
          #6366f1,
          #a855f7
        );
        transform-origin: left;
        animation: progressShrink 5s linear forwards;
      }

      .progress-glow {
        position: absolute;
        inset: -6px;
        background: radial-gradient(circle at 10% 0, rgba(79, 70, 229, 0.32), transparent 60%);
        opacity: 0;
        animation: glowIn 0.5s ease-out forwards;
        pointer-events: none;
      }

      @keyframes progressShrink {
        from {
          transform: scaleX(1);
        }
        to {
          transform: scaleX(0);
        }
      }

      @keyframes glowIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .footer-note {
        margin-top: 10px;
        font-size: 0.75rem;
        color: var(--text-muted);
        display: flex;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
      }

      .footer-note a {
        color: var(--accent);
        text-decoration: none;
        font-weight: 500;
      }

      .footer-note a:hover {
        text-decoration: underline;
      }

      @media (max-width: 480px) {
        .card {
          padding: 20px 16px 16px;
        }
        h1 {
          font-size: 1.1rem;
        }
        .msg-line {
          font-size: 0.9rem;
        }
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="card-header">
        <div class="icon-pill">✅</div>
        <div>
          <h1>
            Email verified
            <span class="badge">Secure</span>
          </h1>
          <div class="subtitle">
            This window will close itself in a few seconds.
          </div>
        </div>
      </div>

      <div class="messages">
        <p class="msg-line msg-en">
          Your email has been verified successfully. You can close this window.
        </p>
        <p class="msg-line msg-th">
          อีเมลของคุณได้รับการยืนยันเรียบร้อยแล้ว คุณสามารถปิดหน้าต่างนี้ได้
        </p>
      </div>

      <div class="divider"></div>

      <div class="countdown-row">
        <span>
          Auto close in
          <span class="countdown-number" id="countdown">5</span>
          seconds
        </span>
        <span class="countdown-pill">
          ปิดอัตโนมัติใน
          <span class="countdown-number" id="countdown-th">5</span>
          วิ
        </span>
      </div>

      <div class="progress-track">
        <div class="progress-bar"></div>
        <div class="progress-glow"></div>
      </div>

      <div class="footer-note">
        <span>
          If this tab doesn't close automatically,
          you can safely close it yourself.
        </span>
        <span>
          หากแท็บไม่ปิดเอง ให้คุณปิดหน้าต่างนี้ได้เลย
        </span>
      </div>
    </div>

    <script>
      (function () {
        const TOTAL_SECONDS = 5;
        let remaining = TOTAL_SECONDS;

        const countdownEl = document.getElementById("countdown");
        const countdownThEl = document.getElementById("countdown-th");

        function updateCountdown() {
          remaining -= 1;

          if (remaining < 0) {
            return;
          }

          countdownEl.textContent = remaining;
          countdownThEl.textContent = remaining;

          if (remaining === 0) {
            // Try to close the window/tab (works if opened via script)
            try {
              window.close();
            } catch (e) {
              // Ignore; user can still close manually.
            }
          }
        }

        countdownEl.textContent = remaining;
        countdownThEl.textContent = remaining;

        const intervalId = setInterval(updateCountdown, 1000);

        // Safety stop after TOTAL_SECONDS + 2s
        setTimeout(function () {
          clearInterval(intervalId);
        }, (TOTAL_SECONDS + 2) * 1000);
      })();
    </script>
  </body>
</html>
