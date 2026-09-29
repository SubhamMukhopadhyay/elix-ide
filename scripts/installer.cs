using System;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Windows.Forms;
using System.Drawing;
using System.Threading;
using System.Runtime.InteropServices;
using Microsoft.Win32;

namespace ElixInstaller
{
    public class SetupForm : Form
    {
        private Panel headerPanel;
        private Label titleLabel;
        private Label subtitleLabel;
        private Panel contentPanel;
        private Label destLabel;
        private TextBox destTextBox;
        private Button browseButton;
        private CheckBox cbDesktop;
        private CheckBox cbStartMenu;
        private CheckBox cbContextMenu;
        private CheckBox cbPath;
        private CheckBox cbLaunch;
        private ProgressBar progressBar;
        private Label statusLabel;
        private Button actionButton;
        private Button cancelButton;

        private enum Step { Config, Installing, Complete }
        private Step currentStep = Step.Config;
        private string installDir;

        public SetupForm()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            this.Text = "Setup - Elix IDE";
            this.Size = new Size(540, 440);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(245, 245, 245);
            this.Font = new Font("Segoe UI", 9F, FontStyle.Regular);

            // Default install path: %LOCALAPPDATA%\Programs\Elix IDE
            string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            installDir = Path.Combine(localAppData, "Programs", "Elix IDE");

            // Header banner
            headerPanel = new Panel();
            headerPanel.Dock = DockStyle.Top;
            headerPanel.Height = 70;
            headerPanel.BackColor = Color.FromArgb(30, 30, 30);

            titleLabel = new Label();
            titleLabel.Text = "Install Elix IDE";
            titleLabel.Font = new Font("Segoe UI", 12F, FontStyle.Bold);
            titleLabel.ForeColor = Color.White;
            titleLabel.Location = new Point(20, 14);
            titleLabel.AutoSize = true;
            headerPanel.Controls.Add(titleLabel);

            subtitleLabel = new Label();
            subtitleLabel.Text = "Universal Development Environment & Career Platform";
            subtitleLabel.Font = new Font("Segoe UI", 8.5F, FontStyle.Regular);
            subtitleLabel.ForeColor = Color.FromArgb(170, 170, 170);
            subtitleLabel.Location = new Point(21, 38);
            subtitleLabel.AutoSize = true;
            headerPanel.Controls.Add(subtitleLabel);

            this.Controls.Add(headerPanel);

            // Content Panel
            contentPanel = new Panel();
            contentPanel.Location = new Point(20, 85);
            contentPanel.Size = new Size(485, 255);
            this.Controls.Add(contentPanel);

            // Destination controls
            destLabel = new Label();
            destLabel.Text = "Select Destination Location:";
            destLabel.Location = new Point(0, 5);
            destLabel.AutoSize = true;
            contentPanel.Controls.Add(destLabel);

            destTextBox = new TextBox();
            destTextBox.Text = installDir;
            destTextBox.Location = new Point(3, 26);
            destTextBox.Size = new Size(395, 23);
            contentPanel.Controls.Add(destTextBox);

            browseButton = new Button();
            browseButton.Text = "Browse...";
            browseButton.Location = new Point(405, 25);
            browseButton.Size = new Size(78, 25);
            browseButton.Click += (s, e) => {
                using (FolderBrowserDialog fbd = new FolderBrowserDialog())
                {
                    fbd.SelectedPath = destTextBox.Text;
                    if (fbd.ShowDialog() == DialogResult.OK)
                    {
                        destTextBox.Text = Path.Combine(fbd.SelectedPath, "Elix IDE");
                    }
                }
            };
            contentPanel.Controls.Add(browseButton);

            // Options Checkboxes
            Label optLabel = new Label();
            optLabel.Text = "Select Additional Tasks:";
            optLabel.Location = new Point(0, 70);
            optLabel.AutoSize = true;
            contentPanel.Controls.Add(optLabel);

            cbDesktop = new CheckBox();
            cbDesktop.Text = "Create a desktop shortcut";
            cbDesktop.Checked = true;
            cbDesktop.Location = new Point(5, 95);
            cbDesktop.AutoSize = true;
            contentPanel.Controls.Add(cbDesktop);

            cbStartMenu = new CheckBox();
            cbStartMenu.Text = "Create a Start Menu shortcut";
            cbStartMenu.Checked = true;
            cbStartMenu.Location = new Point(5, 120);
            cbStartMenu.AutoSize = true;
            contentPanel.Controls.Add(cbStartMenu);

            cbContextMenu = new CheckBox();
            cbContextMenu.Text = "Add \"Open with Elix IDE\" to Windows Explorer context menu";
            cbContextMenu.Checked = true;
            cbContextMenu.Location = new Point(5, 145);
            cbContextMenu.AutoSize = true;
            contentPanel.Controls.Add(cbContextMenu);

            cbPath = new CheckBox();
            cbPath.Text = "Add Elix IDE to PATH (allows 'elix' from terminal)";
            cbPath.Checked = true;
            cbPath.Location = new Point(5, 170);
            cbPath.AutoSize = true;
            contentPanel.Controls.Add(cbPath);

            // Progress bar and status (hidden initially)
            progressBar = new ProgressBar();
            progressBar.Location = new Point(5, 90);
            progressBar.Size = new Size(475, 23);
            progressBar.Visible = false;
            contentPanel.Controls.Add(progressBar);

            statusLabel = new Label();
            statusLabel.Text = "Extracting files, please wait...";
            statusLabel.Location = new Point(5, 125);
            statusLabel.Size = new Size(475, 40);
            statusLabel.Visible = false;
            contentPanel.Controls.Add(statusLabel);

            // Complete launch checkbox
            cbLaunch = new CheckBox();
            cbLaunch.Text = "Launch Elix IDE now";
            cbLaunch.Checked = true;
            cbLaunch.Location = new Point(5, 95);
            cbLaunch.AutoSize = true;
            cbLaunch.Visible = false;
            contentPanel.Controls.Add(cbLaunch);

            // Bottom Buttons
            actionButton = new Button();
            actionButton.Text = "Install";
            actionButton.Location = new Point(335, 355);
            actionButton.Size = new Size(85, 28);
            actionButton.BackColor = Color.FromArgb(0, 122, 204);
            actionButton.ForeColor = Color.White;
            actionButton.FlatStyle = FlatStyle.Flat;
            actionButton.FlatAppearance.BorderSize = 0;
            actionButton.Click += ActionButton_Click;
            this.Controls.Add(actionButton);

            cancelButton = new Button();
            cancelButton.Text = "Cancel";
            cancelButton.Location = new Point(428, 355);
            cancelButton.Size = new Size(80, 28);
            cancelButton.Click += (s, e) => this.Close();
            this.Controls.Add(cancelButton);
        }

        private void ActionButton_Click(object sender, EventArgs e)
        {
            if (currentStep == Step.Config)
            {
                installDir = destTextBox.Text.Trim();
                if (string.IsNullOrEmpty(installDir)) return;

                currentStep = Step.Installing;
                titleLabel.Text = "Installing Elix IDE...";
                subtitleLabel.Text = "Please wait while Setup installs Elix IDE on your computer.";

                destLabel.Visible = false;
                destTextBox.Visible = false;
                browseButton.Visible = false;
                cbDesktop.Visible = false;
                cbStartMenu.Visible = false;
                cbContextMenu.Visible = false;
                cbPath.Visible = false;

                progressBar.Visible = true;
                statusLabel.Visible = true;
                actionButton.Enabled = false;
                cancelButton.Enabled = false;

                Thread installThread = new Thread(RunInstallation);
                installThread.IsBackground = true;
                installThread.Start();
            }
            else if (currentStep == Step.Complete)
            {
                if (cbLaunch.Checked)
                {
                    string exePath = Path.Combine(installDir, "Elix IDE.exe");
                    if (File.Exists(exePath))
                    {
                        System.Diagnostics.Process.Start(exePath);
                    }
                }
                this.Close();
            }
        }

        private void RunInstallation()
        {
            try
            {
                // Ensure directory
                if (!Directory.Exists(installDir))
                {
                    Directory.CreateDirectory(installDir);
                }

                // Extract embedded payload.zip resource
                Assembly asm = Assembly.GetExecutingAssembly();
                string[] resNames = asm.GetManifestResourceNames();
                string payloadRes = null;
                foreach (string r in resNames)
                {
                    if (r.EndsWith("payload.zip", StringComparison.OrdinalIgnoreCase))
                    {
                        payloadRes = r;
                        break;
                    }
                }

                if (payloadRes != null)
                {
                    using (Stream s = asm.GetManifestResourceStream(payloadRes))
                    using (ZipArchive archive = new ZipArchive(s, ZipArchiveMode.Read))
                    {
                        int total = archive.Entries.Count;
                        int count = 0;

                        this.Invoke(new Action(() => {
                            progressBar.Maximum = total;
                            progressBar.Value = 0;
                        }));

                        foreach (ZipArchiveEntry entry in archive.Entries)
                        {
                            string targetPath = Path.Combine(installDir, entry.FullName);
                            if (string.IsNullOrEmpty(entry.Name))
                            {
                                Directory.CreateDirectory(targetPath);
                            }
                            else
                            {
                                Directory.CreateDirectory(Path.GetDirectoryName(targetPath));
                                entry.ExtractToFile(targetPath, true);
                            }

                            count++;
                            if (count % 10 == 0 || count == total)
                            {
                                this.Invoke(new Action(() => {
                                    progressBar.Value = count;
                                    statusLabel.Text = "Extracting: " + entry.Name;
                                }));
                            }
                        }
                    }
                }
                else
                {
                    // Fallback if payload is beside installer
                    string localZip = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "payload.zip");
                    if (File.Exists(localZip))
                    {
                        ZipFile.ExtractToDirectory(localZip, installDir);
                    }
                }

                string exePath = Path.Combine(installDir, "Elix IDE.exe");

                // Shortcuts & Context Menu
                this.Invoke(new Action(() => {
                    statusLabel.Text = "Configuring system integration...";
                }));

                if (cbDesktop.Checked && File.Exists(exePath))
                {
                    string desktopDir = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                    CreateShortcut(Path.Combine(desktopDir, "Elix IDE.lnk"), exePath, "Elix IDE");
                }

                if (cbStartMenu.Checked && File.Exists(exePath))
                {
                    string programsDir = Environment.GetFolderPath(Environment.SpecialFolder.Programs);
                    CreateShortcut(Path.Combine(programsDir, "Elix IDE.lnk"), exePath, "Elix IDE");
                }

                if (cbContextMenu.Checked && File.Exists(exePath))
                {
                    RegisterContextMenu(exePath);
                }

                if (cbPath.Checked)
                {
                    AddToPath(installDir);
                }

                RegisterUninstall(installDir, exePath);

                try
                {
                    SHChangeNotify(0x08000000, 0, IntPtr.Zero, IntPtr.Zero);
                }
                catch { }

                // Finished
                this.Invoke(new Action(() => {
                    currentStep = Step.Complete;
                    titleLabel.Text = "Installation Complete!";
                    subtitleLabel.Text = "Elix IDE has been successfully installed on your computer.";

                    progressBar.Visible = false;
                    statusLabel.Visible = false;

                    cbLaunch.Visible = true;
                    actionButton.Text = "Finish";
                    actionButton.Enabled = true;
                    cancelButton.Visible = false;
                }));
            }
            catch (Exception ex)
            {
                this.Invoke(new Action(() => {
                    MessageBox.Show("Installation encountered an error:\n" + ex.Message, "Setup Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    this.Close();
                }));
            }
        }

        [DllImport("shell32.dll")]
        private static extern void SHChangeNotify(int wEventId, int uFlags, IntPtr dwItem1, IntPtr dwItem2);

        private void CreateShortcut(string shortcutPath, string targetPath, string description)
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                if (shellType == null) return;
                object shell = Activator.CreateInstance(shellType);
                object shortcut = shellType.InvokeMember("CreateShortcut", BindingFlags.InvokeMethod, null, shell, new object[] { shortcutPath });
                if (shortcut == null) return;
                Type scType = shortcut.GetType();
                scType.InvokeMember("TargetPath", BindingFlags.SetProperty, null, shortcut, new object[] { targetPath });
                scType.InvokeMember("WorkingDirectory", BindingFlags.SetProperty, null, shortcut, new object[] { Path.GetDirectoryName(targetPath) });
                scType.InvokeMember("Description", BindingFlags.SetProperty, null, shortcut, new object[] { description });
                scType.InvokeMember("IconLocation", BindingFlags.SetProperty, null, shortcut, new object[] { targetPath + ",0" });
                scType.InvokeMember("Save", BindingFlags.InvokeMethod, null, shortcut, null);
            }
            catch { }
        }

        private void RegisterContextMenu(string exePath)
        {
            try
            {
                string iconSpec = "\"" + exePath + "\",0";

                // Windows 'Open with' application registration
                using (RegistryKey appKey = Registry.CurrentUser.CreateSubKey(@"Software\Classes\Applications\Elix IDE.exe"))
                {
                    appKey.SetValue("FriendlyAppName", "Elix IDE");
                    appKey.SetValue("Icon", iconSpec);
                    using (RegistryKey cmdKey = appKey.CreateSubKey(@"shell\open\command"))
                    {
                        cmdKey.SetValue("", "\"" + exePath + "\" \"%1\"");
                    }
                }

                // File context menu
                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Classes\*\shell\OpenWithElix"))
                {
                    key.SetValue("", "Open with Elix IDE");
                    key.SetValue("Icon", iconSpec);
                    using (RegistryKey cmdKey = key.CreateSubKey("command"))
                    {
                        cmdKey.SetValue("", "\"" + exePath + "\" \"%1\"");
                    }
                }

                // Directory context menu
                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Classes\Directory\shell\OpenWithElix"))
                {
                    key.SetValue("", "Open with Elix IDE");
                    key.SetValue("Icon", iconSpec);
                    using (RegistryKey cmdKey = key.CreateSubKey("command"))
                    {
                        cmdKey.SetValue("", "\"" + exePath + "\" \"%V\"");
                    }
                }

                // Directory background context menu
                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Classes\Directory\Background\shell\OpenWithElix"))
                {
                    key.SetValue("", "Open with Elix IDE");
                    key.SetValue("Icon", iconSpec);
                    using (RegistryKey cmdKey = key.CreateSubKey("command"))
                    {
                        cmdKey.SetValue("", "\"" + exePath + "\" \"%V\"");
                    }
                }
            }
            catch { }
        }

        private void AddToPath(string dir)
        {
            try
            {
                using (RegistryKey envKey = Registry.CurrentUser.OpenSubKey(@"Environment", true))
                {
                    if (envKey != null)
                    {
                        string currentPath = (string)envKey.GetValue("Path", "");
                        if (!currentPath.Contains(dir))
                        {
                            string newPath = currentPath.TrimEnd(';') + ";" + dir;
                            envKey.SetValue("Path", newPath, RegistryValueKind.ExpandString);
                        }
                    }
                }
            }
            catch { }
        }

        private void RegisterUninstall(string dir, string exe)
        {
            try
            {
                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\ElixIDE"))
                {
                    key.SetValue("DisplayName", "Elix IDE");
                    key.SetValue("DisplayVersion", "1.0.0");
                    key.SetValue("Publisher", "Elix Technologies");
                    key.SetValue("DisplayIcon", exe);
                    key.SetValue("InstallLocation", dir);
                    string uninstallerExe = Path.Combine(dir, "Uninstall Elix IDE.exe");
                    if (File.Exists(uninstallerExe))
                    {
                        key.SetValue("UninstallString", "\"" + uninstallerExe + "\"");
                        key.SetValue("QuietUninstallString", "\"" + uninstallerExe + "\" /quiet");
                    }
                    else
                    {
                        key.SetValue("UninstallString", "cmd.exe /c rmdir /s /q \"" + dir + "\"");
                    }
                }
            }
            catch { }
        }

        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new SetupForm());
        }
    }
}
