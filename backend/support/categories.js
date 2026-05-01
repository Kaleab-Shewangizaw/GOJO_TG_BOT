/**
 * Support hub tree: callback pattern m:0 (main), m:{cat}, m:{cat}:{item}
 * @typedef {{ title: string; guideKey?: string; children?: { title: string; guideKey: string }[] }} CategoryDef
 */

/** @type {CategoryDef[]} */
const categories = [
  {
    title: "Account & Login",
    children: [
      { title: "Reset cPanel password", guideKey: "acct_cpanel_reset" },
      { title: "Reset Plesk / Client Area", guideKey: "acct_plesk_portal_reset" },
      { title: "cPanel login URL", guideKey: "acct_cpanel_url" },
      { title: "Webmail login URL", guideKey: "acct_webmail_url" },
      { title: "Find username", guideKey: "acct_username" },
      { title: "Change passwords (guide)", guideKey: "acct_change_password_guide" },
      { title: "Recover lost credentials", guideKey: "acct_recover_credentials" },
      { title: "Verify ownership (support)", guideKey: "acct_verify_ownership" },
    ],
  },
  {
    title: "Domain & DNS",
    children: [
      { title: "Domain setup (hosting)", guideKey: "dns_domain_setup" },
      { title: "DNS records (A/CNAME/MX/TXT)", guideKey: "dns_records" },
      { title: "Nameserver update", guideKey: "dns_nameservers" },
      { title: "Propagation & checks", guideKey: "dns_propagation" },
      { title: "Addon & subdomains", guideKey: "dns_addon_subdomain" },
    ],
  },
  {
    title: "Website troubleshooting",
    children: [
      { title: "Site not loading", guideKey: "web_down" },
      { title: "HTTP 500 error", guideKey: "web_500" },
      { title: "Database connection", guideKey: "web_db_conn" },
      { title: "White / blank screen", guideKey: "web_white_screen" },
      { title: "File permissions", guideKey: "web_permissions" },
      { title: "SSL issues", guideKey: "web_ssl" },
      { title: "Malware / hacked warning", guideKey: "web_malware" },
    ],
  },
  {
    title: "Email support",
    children: [
      { title: "Create email account", guideKey: "mail_create" },
      { title: "Email not sending", guideKey: "mail_not_sending" },
      { title: "Email not receiving", guideKey: "mail_not_receiving" },
      { title: "Phone / tablet setup", guideKey: "mail_phone_setup" },
      { title: "SMTP / IMAP / POP3", guideKey: "mail_protocols" },
      { title: "Spam & deliverability", guideKey: "mail_spam" },
      { title: "Forwarding", guideKey: "mail_forward" },
    ],
  },
  {
    title: "cPanel shared hosting",
    children: [
      { title: "Upload website files", guideKey: "cp_upload" },
      { title: "Extract ZIP in File Manager", guideKey: "cp_zip" },
      { title: "Create MySQL database", guideKey: "cp_mysql_create" },
      { title: "Import database (phpMyAdmin)", guideKey: "cp_mysql_import" },
      { title: "FTP accounts", guideKey: "cp_ftp" },
      { title: "File permissions (755/644)", guideKey: "cp_chmod" },
      { title: "Cron jobs", guideKey: "cp_cron" },
      { title: "Install SSL (cPanel)", guideKey: "cp_ssl" },
    ],
  },
  {
    title: "Windows hosting",
    children: [
      { title: "Deploy ASP.NET site", guideKey: "win_aspnet" },
      { title: "MSSQL database", guideKey: "win_mssql" },
      { title: "web.config tips", guideKey: "win_webconfig" },
      { title: "IIS / 500 errors", guideKey: "win_iis_500" },
      { title: "ODBC connections", guideKey: "win_odbc" },
    ],
  },
  {
    title: "Reseller hosting",
    children: [
      { title: "Create hosting account", guideKey: "res_create_acct" },
      { title: "Packages & quotas", guideKey: "res_packages" },
      { title: "Suspend / unsuspend", guideKey: "res_suspend" },
      { title: "WHM basics", guideKey: "res_whm" },
      { title: "Reseller nameservers", guideKey: "res_ns" },
    ],
  },
  {
    title: "VPS / servers",
    children: [
      { title: "[Managed] Server status", guideKey: "vps_m_status" },
      { title: "[Managed] Restart service", guideKey: "vps_m_restart" },
      { title: "[Managed] Load & resources", guideKey: "vps_m_load" },
      { title: "[Managed] Apache / Nginx errors", guideKey: "vps_m_web" },
      { title: "[Managed] Install SSL", guideKey: "vps_m_ssl" },
      { title: "[Managed] Hardening & scan", guideKey: "vps_m_security" },
      { title: "[Unmanaged] SSH access", guideKey: "vps_u_ssh" },
      { title: "[Unmanaged] LAMP / LEMP", guideKey: "vps_u_stack" },
      { title: "[Unmanaged] Firewall (ufw)", guideKey: "vps_u_firewall" },
      { title: "[Unmanaged] Install control panel", guideKey: "vps_u_panel" },
    ],
  },
  {
    title: "Billing & subscriptions",
    children: [
      { title: "Pay invoice", guideKey: "bill_pay" },
      { title: "View invoices", guideKey: "bill_view" },
      { title: "Renew hosting", guideKey: "bill_renew_host" },
      { title: "Renew domain", guideKey: "bill_renew_domain" },
      { title: "Upgrade plan", guideKey: "bill_upgrade" },
      { title: "Cancel service", guideKey: "bill_cancel" },
    ],
  },
  {
    title: "Backup & restore",
    children: [
      { title: "Create full backup", guideKey: "bak_create" },
      { title: "Restore website", guideKey: "bak_restore_site" },
      { title: "Restore database", guideKey: "bak_restore_db" },
      { title: "Download backup", guideKey: "bak_download" },
    ],
  },
  {
    title: "Security & malware",
    children: [
      { title: "Run malware scan", guideKey: "sec_scan" },
      { title: "Suspicious files", guideKey: "sec_infected" },
      { title: "Secure compromised account", guideKey: "sec_account" },
      { title: "Enable 2FA", guideKey: "sec_2fa" },
    ],
  },
  {
    title: "Contact & escalation",
    children: [
      { title: "Start support ticket (wizard)", guideKey: "__ticket_start" },
      { title: "Talk to agent (contacts)", guideKey: "esc_human" },
      { title: "Send logs checklist", guideKey: "esc_logs" },
      { title: "Maintenance window request", guideKey: "esc_maintenance" },
    ],
  },
];

module.exports = { categories };
