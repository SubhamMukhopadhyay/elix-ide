using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;

namespace ElixUninstaller
{
    public class UninstallerForm : Form
    {
        private Label titleLabel;
        private Label descLabel;
        private ProgressBar progressBar;
        private Button btnUninstall;
        private Button btnCancel;
        private string installDir;

        public UninstallerForm()
        {
            this.installDir = AppDomain.CurrentDomain.BaseDirectory.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
            InitializeUI();
        }

        private void InitializeUI()
        {
            this.Text = "Elix IDE Uninstall";
            this.Size = new Size(480, 260);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.BackColor = Color.FromArgb(18, 18, 24);
            this.ForeColor = Color.FromArgb(240, 240, 240);
            this.Font = new Font("Segoe UI", 9F, FontStyle.Regular);

            try
            {
                string iconPath = Path.Combine(installDir, "Elix IDE.exe");
                if (File.Exists(iconPath))
                {
                    this.Icon = Icon.ExtractAssociatedIcon(iconPath);
                }
            }
            catch { }

            titleLabel = new Label
            {
                Text = "Uninstall Elix IDE",
                Font = new Font("Segoe UI", 14F, FontStyle.Bold),
                ForeColor = Color.White,
                Location = new Point(24, 20),
                AutoSize = true
            };
            this.Controls.Add(titleLabel);

            descLabel = new Label
            {
                Text = "Are you sure you want to completely remove Elix IDE and all of its components from your computer?\n\nInstalled at:\n" + installDir,
                Font = new Font("Segoe UI", 9.5F),
                ForeColor = Color.FromArgb(170, 175, 185),
                Location = new Point(24, 58),
                Size = new Size(415, 80)
            };
            this.Controls.Add(descLabel);

            progressBar = new ProgressBar
            {
                Location = new Point(24, 150),
                Size = new Size(415, 20),
                Style = ProgressBarStyle.Marquee,
                MarqueeAnimationSpeed = 30,
                Visible = false
            };
            this.Controls.Add(progressBar);

            btnUninstall = new Button
            {
                Text = "Uninstall",
                Location = new Point(245, 175),
                Size = new Size(100, 32),
                BackColor = Color.FromArgb(217, 48, 37),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand
            };
            btnUninstall.FlatAppearance.BorderSize = 0;
            btnUninstall.Click += (s, e) => StartUninstall();
            this.Controls.Add(btnUninstall);

            btnCancel = new Button
            {
                Text = "Cancel",
                Location = new Point(355, 175),
                Size = new Size(84, 32),
                BackColor = Color.FromArgb(40, 42, 54),
                ForeColor = Color.FromArgb(220, 220, 220),
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand
            };
            btnCancel.FlatAppearance.BorderSize = 0;
            btnCancel.Click += (s, e) => this.Close();
            this.Controls.Add(btnCancel);
        }

        private void StartUninstall()
        {
            btnUninstall.Enabled = false;
            btnCancel.Enabled = false;
            progressBar.Visible = true;
            descLabel.Text = "Removing application shortcuts, registry entries, and program files...";

            Thread worker = new Thread(() =>
            {
                PerformUninstall();

                this.Invoke(new Action(() =>
                {
                    progressBar.Visible = false;
                    MessageBox.Show(
                        "Elix IDE was successfully removed from your computer.",
                        "Uninstall Complete",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Information
                    );
                    this.Close();
                }));
            });
            worker.IsBackground = true;
            worker.Start();
        }

        private void PerformUninstall()
        {
            // 1. Kill any running Elix IDE processes
            try
            {
                foreach (Process p in Process.GetProcessesByName("Elix IDE"))
                {
                    try { p.Kill(); p.WaitForExit(1000); } catch { }
                }
            }
            catch { }

            // 2. Remove Shortcuts
            try
            {
                string desktopShortcut = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), "Elix IDE.lnk");
                if (File.Exists(desktopShortcut)) File.Delete(desktopShortcut);

                string startMenuShortcut = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), "Elix IDE.lnk");
                if (File.Exists(startMenuShortcut)) File.Delete(startMenuShortcut);
            }
            catch { }

            // 3. Remove Registry Context Menus
            try
            {
                Registry.CurrentUser.DeleteSubKeyTree(@"Software\Classes\*\shell\OpenWithElix", false);
                Registry.CurrentUser.DeleteSubKeyTree(@"Software\Classes\Directory\shell\OpenWithElix", false);
                Registry.CurrentUser.DeleteSubKeyTree(@"Software\Classes\Directory\Background\shell\OpenWithElix", false);
            }
            catch { }

            // 4. Remove from PATH
            try
            {
                using (RegistryKey envKey = Registry.CurrentUser.OpenSubKey(@"Environment", true))
                {
                    if (envKey != null)
                    {
                        string currentPath = (string)envKey.GetValue("Path", "");
                        if (!string.IsNullOrEmpty(currentPath))
                        {
                            string[] parts = currentPath.Split(new char[] { ';' }, StringSplitOptions.RemoveEmptyEntries);
                            string newPath = "";
                            foreach (string part in parts)
                            {
                                if (!part.Trim().Equals(installDir, StringComparison.OrdinalIgnoreCase))
                                {
                                    newPath += (newPath.Length > 0 ? ";" : "") + part.Trim();
                                }
                            }
                            envKey.SetValue("Path", newPath, RegistryValueKind.ExpandString);
                        }
                    }
                }
            }
            catch { }

            // 5. Remove Uninstall Registry Key
            try
            {
                Registry.CurrentUser.DeleteSubKeyTree(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\ElixIDE", false);
            }
            catch { }

            // 6. Schedule self-deletion of installation directory via detached cmd
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = "/c ping 127.0.0.1 -n 2 > nul & rmdir /s /q \"" + installDir + "\"",
                    WindowStyle = ProcessWindowStyle.Hidden,
                    CreateNoWindow = true,
                    UseShellExecute = false
                };
                Process.Start(psi);
            }
            catch { }
        }

        [STAThread]
        public static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            if (args != null && args.Length > 0 && args[0].ToLower() == "/quiet")
            {
                var form = new UninstallerForm();
                // Silent execution
                return;
            }

            Application.Run(new UninstallerForm());
        }
    }
}
