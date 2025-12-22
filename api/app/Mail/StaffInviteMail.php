<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class StaffInviteMail extends Mailable
{
  use Queueable, SerializesModels;

  public string $acceptUrl;
  public string $shopName;
  public string $shopCode;

  // Optional / themed variables
  public string $appName;
  public string $appSubtitle;
  public string $logoUrl;
  public int $expireHours;
  public ?string $supportEmail;
  public ?string $footerNote;

  /**
   * Create a new message instance.
   */
  public function __construct(
    string $acceptUrl,
    string $shopName,
    string $shopCode,
    array $options = []
  ) {
    $this->acceptUrl = $acceptUrl;
    $this->shopName  = $shopName;
    $this->shopCode  = $shopCode;

    // Defaults (safe for all environments)
    $this->appName     = $options['appName']     ?? config('app.name');
    $this->appSubtitle = $options['appSubtitle'] ?? 'Virtual Pager';
    $this->logoUrl     = $options['logoUrl']     ?? (config('app.url') . '/app-icon.png');
    $this->expireHours = $options['expireHours'] ?? 72;
    $this->supportEmail = $options['supportEmail'] ?? null;
    $this->footerNote   = $options['footerNote'] ?? null;
  }

  /**
   * Build the message.
   */
  public function build()
  {
    return $this
      ->subject("You're invited to join {$this->shopName}")
      ->view('emails.staff-invite')
      ->with([
        'acceptUrl'   => $this->acceptUrl,
        'shopName'    => $this->shopName,
        'shopCode'    => $this->shopCode,
        'appName'     => $this->appName,
        'appSubtitle' => $this->appSubtitle,
        'logoUrl'     => $this->logoUrl,
        'expireHours' => $this->expireHours,
        'supportEmail' => $this->supportEmail,
        'footerNote'  => $this->footerNote,
      ]);
  }
}
