export const chapters = [
  {
    title: "The production DBA role", part: "Fundamentals", level: "Beginner",
    summary: "Learn what database administrators own in a real organization, how operational work differs from development, and how reliability is measured.",
    objectives: ["Separate DBA, developer, and architect responsibilities", "Describe environment promotion and change control", "Translate business recovery goals into RPO and RTO"],
    lesson: "A production DBA protects the availability, integrity, security, and recoverability of data. The role is operational as much as technical: DBAs review changes, monitor services and storage, test restores, investigate incidents, and document decisions. Developers build application behavior; DBAs partner with them to make data services safe and reliable. Architects shape the long-term platform and standards. In a small company one person may cover all three roles, but production access should still follow review and change controls.",
    example: "A retail company deploys a new checkout release. The DBA checks the change ticket, confirms a recent restorable backup, watches error rates and blocking during rollout, and reports validation results to the incident channel.",
    tasks: ["Map development, test, UAT, and production environments", "Draft a daily health-check report with owner, status, and evidence", "Write an escalation note for a missed recovery objective"],
    code: "SELECT name, state_desc, recovery_model_desc\nFROM sys.databases\nORDER BY name;",
    output: "One row per database, including its current state and recovery model.",
    caution: "RPO is the maximum tolerable data loss measured in time; RTO is the target time to restore service. Neither is guaranteed by a backup schedule alone."
  },
  {
    title: "Relational databases and SQL foundations", part: "Fundamentals", level: "Beginner",
    summary: "Understand relational data, constraints, transactions, and the SQL command families used to operate safely.",
    objectives: ["Explain keys, relationships, and normalization", "Distinguish DDL, DML, DQL, DCL, and TCL", "Use transactions and ACID reasoning"],
    lesson: "A relational database stores facts in tables and uses keys to identify rows and express relationships. Constraints enforce important rules close to the data. Normalization reduces duplicated facts; deliberate denormalization can help read-heavy designs, but it introduces consistency work. SQL Server executes statements inside transactions. ACID describes atomicity, consistency, isolation, and durability; the isolation level controls which concurrent changes a transaction can observe.",
    example: "An order references one customer through CustomerId. A foreign key prevents an order from pointing at a customer row that does not exist.",
    tasks: ["Create a lab database with Department and Employee tables", "Add primary and foreign keys, then test a rejected invalid insert", "Run a transaction and use ROLLBACK to undo a test change"],
    code: "BEGIN TRANSACTION;\nUPDATE dbo.Employee SET DepartmentId = 2 WHERE EmployeeId = 10;\nSELECT @@ROWCOUNT AS RowsChanged;\nROLLBACK TRANSACTION;",
    output: "RowsChanged reports affected rows; ROLLBACK leaves the lab data unchanged.",
    caution: "Test mutations only in a dedicated lab database. A transaction is not a substitute for a backup."
  },
  {
    title: "Windows and infrastructure essentials", part: "Fundamentals", level: "Beginner",
    summary: "Relate Windows services, compute, storage, permissions, and networking to SQL Server availability.",
    objectives: ["Inspect Windows services and resource pressure", "Explain DNS, TCP ports, and firewall paths", "Check storage capacity and service-account access"],
    lesson: "SQL Server depends on the operating system for process scheduling, memory, files, identity, and network access. A healthy database process can still be unavailable when DNS is wrong, a firewall blocks its TCP port, a volume is full, or the service identity cannot access its data directory. Start with observable evidence: service state, event logs, disk free space, CPU, memory, and connectivity from the client network.",
    example: "A connection works on the database host but not from an application server. Compare DNS resolution and TCP reachability from both locations before changing SQL Server settings.",
    tasks: ["Use Task Manager and Resource Monitor to observe a baseline", "Inspect SQL Server service identity and data-folder permissions", "Record server name, DNS result, and configured listener port"],
    code: "Get-Service -Name 'MSSQL*','SQLAgent*' | Select-Object Name, Status\nGet-Volume | Select-Object DriveLetter, SizeRemaining, Size",
    output: "Service status and available capacity for mounted volumes.",
    caution: "Do not change Windows firewall rules or service identities on a managed server without an approved change."
  },
  {
    title: "SQL Server architecture", part: "Fundamentals", level: "Beginner",
    summary: "Follow a request through the Database Engine, understand instances and services, and recognize system databases and file roles.",
    objectives: ["Distinguish an instance from a database", "Describe query processing and storage responsibilities", "Identify system databases and data/log files"],
    lesson: "A SQL Server instance is an Engine installation with its own configuration, logins, and databases. The relational engine parses and optimizes a statement; the storage engine manages pages, files, and transactions. The buffer pool caches data pages in memory. MDF and NDF files hold data; LDF files hold transaction-log records. master stores instance metadata, model is a database template, msdb supports Agent and backup history, and tempdb is recreated at startup for temporary work.",
    example: "A query plan is chosen by the optimizer, while page reads and writes are serviced by the storage engine. A slow query may therefore be CPU-bound, memory-sensitive, or waiting on storage.",
    tasks: ["Check server version, edition, and instance name", "List database files and file types", "Review the SQL Server service start time and system databases"],
    code: "SELECT @@SERVERNAME AS ServerName, @@VERSION AS VersionInfo;\nSELECT DB_NAME(database_id) AS DatabaseName, type_desc, physical_name\nFROM sys.master_files ORDER BY database_id, file_id;",
    output: "Instance identity/version followed by the physical files registered to each database.",
    caution: "Do not move, rename, or delete database files through File Explorer while the Engine is using them."
  },
  {
    title: "Installation and instance configuration", part: "Fundamentals", level: "Beginner",
    summary: "Plan an installation, choose sensible service and storage settings, and verify a local Developer Edition lab.",
    objectives: ["Choose an edition appropriate to the workload", "Plan service accounts, paths, networking, and patching", "Inspect memory, MAXDOP, and TempDB configuration"],
    lesson: "Installation choices become operational constraints. Developer Edition is feature-rich for non-production development and learning but is not licensed for production use. Production planning considers edition, licensing, service identities, collation, dedicated data/log/backup volumes where appropriate, network ports, patch cadence, and monitoring. Configure max server memory to leave capacity for Windows and other processes; tune MAXDOP and cost threshold based on workload and current Microsoft guidance rather than blindly copying a template.",
    example: "A lab instance can use a named instance and local storage. A production build should have documented owners, approved service accounts, tested firewall paths, and standard file locations.",
    tasks: ["Capture edition, version, collation, and startup parameters", "Review max server memory and TempDB file settings", "Write an installation verification checklist"],
    code: "SELECT SERVERPROPERTY('Edition') AS Edition,\n       SERVERPROPERTY('ProductVersion') AS ProductVersion,\n       SERVERPROPERTY('Collation') AS ServerCollation;",
    output: "Edition, product version, and instance collation values.",
    caution: "Developer Edition is for development and test only. Avoid changing memory, networking, or startup configuration on shared systems without approval."
  },
  {
    title: "Database creation and storage", part: "Core administration", level: "Beginner",
    summary: "Create databases deliberately and manage file sizing, autogrowth, filegroups, and capacity without relying on shrink operations.",
    objectives: ["Inspect data and log file properties", "Explain fixed-size autogrowth and capacity planning", "Recognize when filegroups and compatibility levels matter"],
    lesson: "A database has one or more data files and at least one transaction-log file. Initial sizing and fixed-MB growth increments reduce repeated small growth events; percentage growth can become unexpectedly large as a file grows. Autogrowth is a safety net, not a capacity plan. Filegroups organize data placement and restore strategy, but they do not automatically improve performance. Shrinking often creates fragmentation and repeated regrowth, so address the underlying space requirement instead.",
    example: "A reporting database grows predictably by 8 GB per month. Capacity planning should project the trend against volume free space and alert well before the volume is exhausted.",
    tasks: ["Create a disposable database with fixed-size growth settings", "Compare database file size with used space", "Record a capacity forecast and review trigger"],
    code: "SELECT DB_NAME(database_id) AS DatabaseName, name, type_desc,\n       size * 8 / 1024 AS SizeMB, growth, is_percent_growth, physical_name\nFROM sys.master_files ORDER BY database_id, file_id;",
    output: "Configured size in MB, growth setting, and path for each database file.",
    caution: "Do not shrink production files as routine maintenance; determine whether space can be reused internally or whether capacity is genuinely needed."
  },
  {
    title: "Backup strategy and recovery objectives", part: "Core administration", level: "Intermediate",
    summary: "Design a recoverable backup chain, understand recovery models, and test restore workflows against business targets.",
    objectives: ["Compare full, differential, and transaction-log backups", "Explain recovery-model tradeoffs and log chains", "Define verification, retention, off-site copies, RPO, and RTO"],
    lesson: "A full backup contains enough database data to form a restore base. A differential captures changes since its base full backup. In the Full recovery model, transaction-log backups preserve a log chain and enable point-in-time recovery; setting Full alone does not start log backups. Simple recovery reclaims log space after checkpoints and does not support log backups. A backup strategy is only credible when restore tests prove that retained copies can meet the agreed RPO and RTO.",
    example: "For a service with a 15-minute RPO, the team may schedule log backups more frequently than 15 minutes, then confirm operational delays and restore time through regular tests.",
    tasks: ["Back up a disposable database with CHECKSUM", "Restore the backup to a separate lab database and validate rows", "Draft a schedule and retention matrix aligned to sample RPO/RTO"],
    code: "BACKUP DATABASE [DbaLab]\nTO DISK = N'C:\\SQLBackups\\DbaLab_full.bak'\nWITH INIT, CHECKSUM, COMPRESSION, STATS = 10;",
    output: "Progress messages followed by a successful backup completion message; verify the file and test a restore.",
    caution: "The example path must exist and be writable by the SQL Server service account. A successful backup command alone does not prove recoverability."
  },
  {
    title: "Restore and disaster recovery", part: "Core administration", level: "Intermediate",
    summary: "Restore databases in the correct sequence, relocate files safely, and document recovery procedures that are tested.",
    objectives: ["Use NORECOVERY and RECOVERY intentionally", "Inspect backup metadata and logical file names", "Write and rehearse a restore runbook"],
    lesson: "A restore sequence starts from a compatible full backup, optionally applies a differential, then applies each required log backup in order. NORECOVERY leaves the database ready for more backups; RECOVERY brings it online and ends that sequence. WITH MOVE maps logical files to new paths. Point-in-time recovery requires a valid log chain and a carefully selected STOPAT time. Restore to a different name or isolated server first whenever practical.",
    example: "After a failed host, the recovery lead confirms the latest usable full backup, differential base, subsequent log files, target paths, and business-approved recovery point before starting restore.",
    tasks: ["Read backup metadata using RESTORE HEADERONLY and FILELISTONLY", "Restore a lab backup under another name with MOVE", "Document validation queries and stakeholder sign-off"],
    code: "RESTORE FILELISTONLY FROM DISK = N'C:\\SQLBackups\\DbaLab_full.bak';\n-- Use the returned logical names in a lab restore with WITH MOVE.",
    output: "Backup file metadata and logical data/log file names to use in the restore plan.",
    caution: "Never overwrite an existing database or use WITH REPLACE unless the target, backup, and approval have been independently verified."
  },
  {
    title: "Security and access management", part: "Core administration", level: "Intermediate",
    summary: "Apply least privilege from server login through database permissions, then review and audit access over time.",
    objectives: ["Distinguish server logins from database users", "Grant only required permissions through roles", "Plan auditing and encryption controls"],
    lesson: "Authentication establishes who connected; authorization determines what that principal may do. A server login is mapped to a database user, unless contained-database authentication is intentionally used. Prefer Windows/identity-provider authentication and role-based grants. GRANT permits a permission, DENY explicitly blocks it, and REVOKE removes an explicit grant or denial. Encryption at rest (such as TDE) and encrypted backups address different exposure paths and need key-management and recovery planning.",
    example: "A reporting identity should normally receive SELECT access to approved reporting objects through a custom database role, not membership in db_owner.",
    tasks: ["Create a lab role and grant SELECT on one schema", "Verify allowed and denied operations with a test principal", "Produce an access-review report with owner and review date"],
    code: "CREATE ROLE [report_reader];\nGRANT SELECT ON SCHEMA::dbo TO [report_reader];\n-- Add a dedicated lab user to the role; do not use a production identity.",
    output: "A database role receives SELECT on the specified schema; verify with a least-privileged test account.",
    caution: "Never disable authentication protections or grant broad roles to make an error disappear. Keep secrets out of scripts and source control."
  },
  {
    title: "SQL Server Agent and job operations", part: "Core administration", level: "Intermediate",
    summary: "Automate routine DBA work with observable, least-privilege jobs, schedules, alerts, and failure handling.",
    objectives: ["Inspect job steps, schedules, owners, and history", "Design idempotent jobs with useful failure signals", "Understand edition and service availability constraints"],
    lesson: "SQL Server Agent runs scheduled jobs using job steps and execution identities. Operators, alerts, and notifications make failures visible; job history provides evidence but has retention limits. Jobs should be idempotent where possible, log their outcomes, avoid embedded credentials, and use an owner that remains valid. SQL Server Agent availability and feature support depend on edition and deployment model; verify the exact version and edition documentation.",
    example: "A backup job records database, destination, duration, and outcome; a monitoring alert detects missed backups independently rather than assuming a scheduled job succeeded.",
    tasks: ["Inspect Agent service status and job history", "Design a lab backup job with a failure notification", "Test a deliberately invalid lab job step and read its history"],
    code: "SELECT j.name, j.enabled, SUSER_SNAME(j.owner_sid) AS JobOwner\nFROM msdb.dbo.sysjobs AS j ORDER BY j.name;",
    output: "Agent job names, enabled state, and owner names from msdb.",
    caution: "A green schedule is not evidence that a job completed. Validate outputs and monitor missed or failed executions."
  },
  {
    title: "Daily DBA monitoring", part: "Operations & performance", level: "Beginner",
    summary: "Build a repeatable health check around availability, resource headroom, database state, logs, jobs, and actionable evidence.",
    objectives: ["Check database and service availability", "Inspect sessions, waits, storage, and job outcomes", "Report thresholds with owners and follow-up actions"],
    lesson: "Monitoring turns operational signals into decisions. Begin with service state, database state, recent backup outcomes, disk free space, log usage, failed jobs, blocking, error logs, and resource trends. A dashboard without thresholds and ownership creates noise. Record a timestamp, measured value, threshold, impact, and action so a health report can be compared over time.",
    example: "A volume at 82% used may be normal on one system and urgent on another; evaluate growth rate, reserved headroom, provisioning lead time, and business criticality.",
    tasks: ["Run the inventory and active-request scripts in the library", "Build a daily report with evidence timestamps", "Choose lab alert thresholds and describe escalation criteria"],
    code: "SELECT name, state_desc, user_access_desc\nFROM sys.databases ORDER BY name;\nSELECT session_id, status, wait_type, blocking_session_id, command\nFROM sys.dm_exec_requests WHERE session_id <> @@SPID;",
    output: "Database states and current requests visible to the executing principal.",
    caution: "Dynamic management views can require elevated server permissions and expose query text. Follow your organization's monitoring and privacy policies."
  },
  {
    title: "Performance investigation and tuning", part: "Operations & performance", level: "Intermediate",
    summary: "Use a measured, evidence-first workflow to isolate query, CPU, memory, I/O, and concurrency bottlenecks.",
    objectives: ["Read actual execution plans and Query Store history", "Use SARGable predicates and appropriate indexes", "Correlate waits with workload and resource evidence"],
    lesson: "Performance tuning starts with a reproducible symptom and baseline, not a guessed index. Query Store tracks query and plan history when enabled and supported. Actual plans show runtime row counts and operators; estimates that differ greatly can indicate cardinality or parameter sensitivity problems. An index can reduce reads but adds storage and write cost. Wait statistics are clues to investigate over an interval, not a standalone diagnosis.",
    example: "A date filter that wraps a datetime column in a function may prevent an efficient seek. A range predicate can make the condition searchable, but validate plan and results with representative data.",
    tasks: ["Capture a baseline query duration and logical reads", "Compare estimated and actual plan row counts", "Add one lab index, re-measure, and document write/storage tradeoffs"],
    code: "SET STATISTICS IO, TIME ON;\nSELECT OrderId, OrderDate FROM dbo.Orders\nWHERE OrderDate >= '20260101' AND OrderDate < '20260201';\nSET STATISTICS IO, TIME OFF;",
    output: "Result rows plus messages containing logical I/O and elapsed/CPU timing for the lab query.",
    caution: "Do not deploy index or server-setting changes from a single test. Validate workload impact, rollback, and change approval."
  },
  {
    title: "Blocking, locks, and deadlocks", part: "Operations & performance", level: "Intermediate",
    summary: "Trace blocking chains and deadlock evidence to the transaction and application behavior that caused them.",
    objectives: ["Distinguish blocking from a deadlock", "Inspect request and lock evidence safely", "Capture deadlock graphs using Extended Events"],
    lesson: "Blocking is normal when one session holds a lock another needs; it becomes an incident when duration or impact is unacceptable. A deadlock is a cycle in which SQL Server selects a victim to break the cycle. Capture the blocking chain, open transaction, wait resource, query, and application context before deciding on action. Extended Events is the modern lightweight framework for targeted event capture.",
    example: "A report query waits behind an uncommitted update. The first useful question is why that transaction stayed open, not which session ID can be killed.",
    tasks: ["Create a short-lived two-session blocking lab", "Inspect the head blocker and open transaction", "Review the system_health deadlock report if available"],
    code: "SELECT session_id, blocking_session_id, wait_type, wait_time, wait_resource\nFROM sys.dm_exec_requests\nWHERE blocking_session_id <> 0;",
    output: "Requests currently waiting behind another session; no rows means no current blocking was found.",
    caution: "Do not kill a production session based only on session ID. Rollback may take time and can worsen business impact."
  },
  {
    title: "Integrity checks and corruption response", part: "Operations & performance", level: "Intermediate",
    summary: "Use DBCC CHECKDB and backup evidence to respond carefully to consistency errors without risking further data loss.",
    objectives: ["Explain what CHECKDB validates", "Plan recurring checks and review output", "Escalate corruption using safe evidence gathering"],
    lesson: "DBCC CHECKDB validates logical and physical consistency structures. It can consume significant I/O and tempdb resources, so schedule it against production capacity and use an approved strategy. When it reports errors, preserve the exact output, SQL error log, storage events, and backup history. Restore a known-good backup is generally preferred to repair; repair options can cause data loss and require explicit expert-led approval.",
    example: "An I/O error appears alongside a CHECKDB finding. The DBA engages storage and incident responders, protects backup copies, and tests recovery on an isolated target before any repair decision.",
    tasks: ["Run DBCC CHECKDB on a small disposable database", "Interpret the clean-result message and error count", "Draft a corruption escalation checklist"],
    code: "DBCC CHECKDB (N'DbaLab') WITH NO_INFOMSGS, ALL_ERRORMSGS;",
    output: "A clean database reports no allocation or consistency errors; errors require preserving the full output and escalating.",
    caution: "Never intentionally corrupt a database. Do not run repair or emergency-mode commands on production as a beginner exercise."
  },
  {
    title: "Capacity planning and maintenance", part: "Operations & performance", level: "Intermediate",
    summary: "Forecast data, log, TempDB, and backup needs while coordinating maintenance, patching, and compatibility checks.",
    objectives: ["Project resource use from trends", "Plan index/statistics maintenance around workload", "Prepare a reviewed patch and upgrade sequence"],
    lesson: "Capacity planning uses history, seasonality, growth drivers, and provisioning lead time to forecast headroom. Data, log, TempDB, backup, and operating-system volumes may have different patterns. Index maintenance should be workload-driven; rebuilds can consume log, I/O, and space, while statistics updates can change plans. Patching and upgrades require compatibility review, backups, rollback/failover plans, stakeholder communication, and post-change validation.",
    example: "Before a seasonal sales peak, compare monthly database growth and transaction-log peaks against free space, backup windows, and restore capacity.",
    tasks: ["Graph a sample database-size series and forecast 90 days", "Create a maintenance calendar with owners and windows", "Write a patch pre-check, rollback, and validation checklist"],
    code: "SELECT DB_NAME(database_id) AS DatabaseName, type_desc,\n       SUM(size) * 8 / 1024 AS AllocatedMB\nFROM sys.master_files GROUP BY database_id, type_desc;",
    output: "Allocated file space by database and file type; compare repeated snapshots to estimate growth.",
    caution: "Index rebuilds, updates, and patching can affect availability and log use. Test and schedule them under approved change controls."
  },
  {
    title: "High availability design", part: "Advanced operations", level: "Advanced",
    summary: "Choose an availability design based on failure domains, recovery targets, edition, licensing, and operational capability.",
    objectives: ["Separate high availability from disaster recovery", "Compare Availability Groups and failover clustering", "Document failover prerequisites and validation"],
    lesson: "High availability reduces interruption within a defined failure domain; disaster recovery addresses larger site or platform failures. Availability Groups replicate database changes to replicas and use listeners for client routing; failover behavior depends on synchronization, cluster health, and configuration. Failover Cluster Instances protect an instance using shared storage. Both require compatible Windows, SQL Server edition/version, networking, quorum, licensing, and tested operational procedures.",
    example: "A synchronous replica in the same site may support planned failover, while an asynchronous remote replica can protect a distant site with potential data loss during forced failover.",
    tasks: ["Draw primary, secondary, listener, quorum, and network paths", "Map synchronous/asynchronous mode to sample RPO/RTO", "Write preconditions and post-failover checks"],
    code: "SELECT SERVERPROPERTY('Edition') AS Edition,\n       SERVERPROPERTY('ProductVersion') AS Version;",
    output: "Edition and version evidence to compare with current Microsoft feature and licensing requirements.",
    caution: "Do not attempt a live HA deployment without confirming licensing, Windows/cluster prerequisites, and a reviewed recovery plan."
  },
  {
    title: "Disaster recovery technologies", part: "Advanced operations", level: "Advanced",
    summary: "Compare log shipping, replication, backup recovery, and legacy mirroring concepts as components of a tested DR plan.",
    objectives: ["Choose technology based on recovery needs", "Explain log shipping copy/restore delay", "Design recovery tests and business communication"],
    lesson: "Log shipping periodically backs up, copies, and restores transaction logs to a secondary database. Replication distributes selected data for specific integration or reporting needs; it is not automatically a backup or disaster-recovery solution. Database mirroring is a legacy feature for which new designs should use current supported alternatives. Off-site backups remain essential because replicas can reproduce accidental changes or corruption.",
    example: "A reporting subscriber may improve read scale but cannot replace a separately retained, tested backup set.",
    tasks: ["Sketch a log-shipping topology with monitor and copy/restore delays", "Compare three recovery scenarios against RPO/RTO", "Schedule and record an isolated restore exercise"],
    code: "SELECT database_name, backup_start_date, backup_finish_date, type\nFROM msdb.dbo.backupset ORDER BY backup_finish_date DESC;",
    output: "Recent backup records from msdb; this history is local metadata, not proof the off-site copy is available.",
    caution: "Validate the current support status of each technology for the SQL Server version being operated."
  },
  {
    title: "PowerShell for DBA operations", part: "Advanced operations", level: "Intermediate",
    summary: "Automate repeatable Windows and SQL Server checks using explicit errors, least privilege, and durable logs.",
    objectives: ["Inspect SQL Server services and disk capacity", "Use SqlServer module commands safely", "Add error handling, logging, and scheduled execution"],
    lesson: "PowerShell is useful for inventory and orchestration around SQL Server. Scripts should validate inputs, use approved identities, handle nonzero outcomes explicitly, and record timestamps and errors. The SqlServer module provides tools such as Invoke-Sqlcmd, but module availability and authentication must be verified on the execution host. Prefer managed identities or approved secret stores over passwords embedded in scripts.",
    example: "A scheduled report can gather service and volume state, query database metadata, and publish a summary. Alerting should distinguish a real failure from a collection timeout.",
    tasks: ["Create a read-only service and volume report", "Run a simple Invoke-Sqlcmd query in a lab", "Log failures and return a nonzero process exit code"],
    code: "Get-Service -Name 'MSSQL*' | Select-Object Name, Status\nGet-Volume | Select-Object DriveLetter, SizeRemaining",
    output: "SQL Server service states and remaining space for mounted volumes.",
    caution: "Test scripts interactively against a lab before scheduling. Avoid plaintext credentials and destructive cmdlets."
  },
  {
    title: "Production incident management", part: "Advanced operations", level: "Advanced",
    summary: "Use a calm, evidence-based incident workflow to restore service, communicate impact, and prevent recurrence.",
    objectives: ["Triage impact, scope, and severity", "Preserve evidence while restoring service safely", "Write a blameless root-cause and follow-up report"],
    lesson: "During an incident, establish an incident lead, scope, business impact, timeline, and communication channel. Stabilize service using the smallest safe action supported by evidence. Preserve relevant logs, metrics, and timestamps. Separate root cause from contributing factors, then track prevention work with owners and due dates. Do not make irreversible changes without approval and a recovery path.",
    example: "A checkout outage begins after a release. The DBA correlates deployment time, connection errors, SQL errors, blocking, and resource metrics while the application team evaluates rollback options.",
    tasks: ["Run the outage scenario in the War Room", "Write a timestamped incident timeline", "Prepare a concise stakeholder update and post-incident actions"],
    code: "SELECT SYSDATETIMEOFFSET() AS EvidenceCapturedAt,\n       @@SERVERNAME AS ServerName, DB_NAME() AS CurrentDatabase;",
    output: "A timestamp and SQL context to anchor a lab investigation note.",
    caution: "Protect customer and security data in incident notes. Use approved channels and redact secrets and personal information."
  },
  {
    title: "Enterprise operations and career preparation", part: "Advanced operations", level: "Intermediate",
    summary: "Connect daily DBA workflows to governance, releases, inventory, documentation, teamwork, and a practical career plan.",
    objectives: ["Create an operational handbook and service inventory", "Prepare a production change request and release checklist", "Explain DBA responsibilities in an interview"],
    lesson: "Enterprise DBA work is coordinated through ownership, change control, access reviews, recovery objectives, monitoring standards, and documentation. A useful inventory records service owner, business criticality, version, dependencies, backup policy, recovery objectives, and support contacts. Releases should include risk, validation, rollback, communication, and sign-off. Career readiness comes from repeated lab practice, incident reasoning, and explaining tradeoffs—not from finishing a course alone.",
    example: "A deployment request documents database changes, expected locks and duration, backup/rollback strategy, test evidence, maintenance window, and business approver.",
    tasks: ["Build a small database inventory", "Complete a sample change request and release checklist", "Take a mock incident assessment and explain your decisions aloud"],
    code: "SELECT @@SERVERNAME AS InstanceName, @@VERSION AS VersionInfo;\nSELECT name, state_desc, recovery_model_desc FROM sys.databases;",
    output: "A simple starting point for an instance inventory; production inventories also require ownership, dependency, and recovery metadata.",
    caution: "A 60-day plan builds foundations; it cannot guarantee production readiness or substitute for supervised operational experience."
  }
].map((chapter, index) => ({ ...chapter, id: index + 1, slug: `chapter-${String(index + 1).padStart(2, "0")}` }));

export const navItems = [
  { section: "Learn", links: [["Dashboard", "/", "LayoutDashboard"], ["Complete Book", "/book", "BookOpen"], ["Learning Roadmap", "/roadmap", "CalendarDays"], ["Practical Labs", "/labs", "FlaskConical"], ["Assignments", "/assignments", "ClipboardCheck"]] },
  { section: "Practice", links: [["SQL Script Library", "/scripts", "Code2"], ["Interview Prep", "/interview", "MessageSquareText"], ["DBA War Room", "/war-room", "Siren"], ["Glossary", "/glossary", "Library"]] },
  { section: "Your workspace", links: [["My Progress", "/progress", "BarChart3"], ["Notes & bookmarks", "/notes", "NotebookPen"]] }
];

export const labTitles = [
  "Install SQL Server Developer Edition", "Connect with SSMS", "Identify SQL Server services", "Inspect system databases", "Inspect database files",
  "Create a lab database", "Create tables and relationships", "Configure fixed file growth", "Take a full backup", "Take a differential backup",
  "Take a transaction-log backup", "Verify backup metadata", "Restore a database safely", "Restore under another name", "Practice point-in-time recovery",
  "Create a SQL login in a lab", "Create a database user", "Grant least-privilege access", "Inspect SQL Agent jobs", "Design a scheduled backup job",
  "Monitor database file sizes", "Review disk capacity", "Read the SQL Server error log", "Investigate a failed lab job", "Inspect active requests",
  "Trace a blocking chain", "Reproduce a two-session deadlock", "Read an actual execution plan", "Measure a query before and after tuning", "Create and evaluate an index",
  "Inspect index fragmentation", "Run DBCC CHECKDB safely", "Plan a maintenance window", "Monitor TempDB allocation", "Inspect transaction-log usage",
  "Build a PowerShell service check", "Automate a read-only health report", "Create a database inventory", "Design backup retention tiers", "Write a DR runbook",
  "Design an Availability Group diagram", "Understand log shipping flow", "Triage a database outage", "Investigate a full-volume alert", "Investigate a backup failure",
  "Investigate a login failure", "Investigate a performance regression", "Prepare a patching plan", "Prepare a release checklist", "Complete a simulated DBA shift"
];

export const labs = labTitles.map((title, index) => ({
  id: index + 1,
  title,
  topic: chapters[Math.min(Math.floor(index / 3), 19)].title,
  level: index < 18 ? "Beginner" : index < 40 ? "Intermediate" : "Advanced",
  objective: `Practice ${title.toLowerCase()} using an isolated lab and record evidence of the outcome.`,
  prerequisite: index < 3 ? "Windows 11; use a local lab instance." : "A working SQL Server Developer Edition instance and SSMS.",
  steps: ["Confirm you are connected to the intended lab instance.", "Read the command and identify its scope before running it.", "Perform the exercise using disposable lab objects only.", "Capture the output and compare it with the expected result.", "Clean up only objects created for this exercise."],
  command: index === 8 ? "BACKUP DATABASE [DbaLab] TO DISK = N'C:\\SQLBackups\\DbaLab_full.bak' WITH INIT, CHECKSUM, STATS = 10;" :
    index === 12 ? "RESTORE HEADERONLY FROM DISK = N'C:\\SQLBackups\\DbaLab_full.bak';" :
      index === 31 ? "DBCC CHECKDB (N'DbaLab') WITH NO_INFOMSGS, ALL_ERRORMSGS;" :
        "SELECT @@SERVERNAME AS ServerName, DB_NAME() AS CurrentDatabase;",
  expected: "A visible result or completion message that you record with the server, time, and lab database name.",
  warning: "Never run destructive practice against production or shared databases. Verify the selected server and database before each step."
}));

const incidentSpecs = [
  ["Production database offline", "Checkout requests fail with a database-unavailable message.", "Database state and recent error log identify an offline database following an approved storage move.", "Confirm change timeline and database state; preserve logs; validate data/log paths and volume availability.", "Coordinate with incident lead, verify correct files and permissions, then bring the database online only after root cause and recovery path are confirmed.", "Database online, application connectivity restored, and a recovery check passes."],
  ["SQL Server service stopped", "Application connections abruptly time out across one instance.", "A service restart followed a host patch; startup failed because the service identity lost access to a certificate.", "Check service status, Windows events, SQL error log, patch/change timeline, and certificate permissions.", "Restore the approved service identity access or roll back the documented change with infrastructure support; monitor startup.", "Service is stable, databases are online, and dependent jobs are reviewed."],
  ["Data volume nearly full", "Alerts report low free space and database writes are slowing.", "Unplanned data-file growth consumed headroom on a shared volume.", "Check free space, file growth trend, autogrowth events, recent deployments, and other volume consumers.", "Engage storage owner, add approved capacity or move workload using a planned change; forecast and alert.", "Volume has agreed headroom and the growth cause has an owner."],
  ["Transaction log full", "Writes fail with a log-space error; application retries increase.", "A long-running transaction prevented log truncation in Full recovery.", "Check log usage, recovery model, log_reuse_wait_desc, active transactions, and last successful log backup.", "Do not switch recovery model or shrink blindly. Resolve the cause and take a log backup if the valid chain and policy permit.", "Writes resume, log backups succeed, and transaction owner fixes long-running work."],
  ["Backup job failed", "The morning backup report is missing for a critical database.", "The destination volume filled and the Agent job has repeated failure history.", "Check Agent history, SQL error log, target path, service-account access, and last known good backup.", "Escalate recovery exposure; provision approved space or destination; run an authorized backup and verify a restore path.", "A verified backup copy exists and monitoring catches missed runs."],
  ["Restore exercise failed", "A recovery test cannot bring the restored database online.", "A required log backup was omitted from the restore sequence.", "Inspect backup headers, LSN sequence, restore history, and exact error output.", "Locate the missing valid log backup or restart from a known-good recovery point; document any RPO impact.", "Restored database passes validation and the runbook includes sequence evidence."],
  ["Deadlock alert", "Two order-processing requests fail intermittently with deadlock victim errors.", "Two code paths update the same tables in opposite order.", "Capture deadlock graph, victim query, isolation level, indexes, and application correlation IDs.", "Preserve retries only if application semantics allow; coordinate consistent access order and shorter transactions.", "Deadlock rate is measured after rollout and correctness is confirmed."],
  ["Blocking chain grows", "A report times out while several writes queue behind one session.", "A batch transaction is holding locks while waiting on external work.", "Identify head blocker, open transaction age, wait type, query, application, and business owner.", "Ask owner to confirm safe completion or cancellation; estimate rollback before action and use incident approval.", "Queue drains, application recovers, and transaction scope is corrected."],
  ["CPU saturation", "API latency rises while host CPU remains near capacity.", "A plan regression after statistics changed drives repeated scans.", "Compare Query Store regressions, top CPU queries, actual plans, waits, and deployment timeline.", "Mitigate through reviewed plan correction or workload control; test change and monitor CPU/latency.", "Latency and CPU return to baseline; regression is recorded."],
  ["Memory pressure", "Queries show increased physical reads and intermittent timeouts.", "A workload change increased memory grants and OS memory pressure.", "Review memory counters, grants pending, waits, max server memory, and co-located processes.", "Protect OS headroom; mitigate the offending workload and validate configuration against current capacity.", "Memory pressure indicators clear and workload remains within budget."],
  ["Slow query after release", "A key customer lookup changed from milliseconds to seconds.", "A non-SARGable predicate prevents a selective index seek.", "Compare plans and Query Store history; review parameter values, reads, and recent code change.", "Reproduce with representative data; propose a query/index change through normal review.", "Measured latency and logical reads improve with no regression elsewhere."],
  ["Login failures", "A service reports authentication errors after a credential rotation.", "The application secret was updated on one host but not the other.", "Check SQL error log login state, principal status, client identity, DNS target, and secret rotation records.", "Coordinate secret-store correction; do not weaken authentication or expose credentials in logs.", "All application instances authenticate and failed-login alert volume returns to normal."],
  ["Consistency alert", "A scheduled integrity check reports allocation or consistency errors.", "Storage reports correlated I/O errors; scope and recoverability are unknown.", "Preserve complete CHECKDB output, SQL/Windows logs, storage status, and backup chain details.", "Declare incident and engage senior DBA/storage team; test restore on isolated infrastructure before repair decisions.", "Data is recovered or expert-approved remediation completed with validated integrity."],
  ["TempDB growth", "TempDB consumes its volume during a reporting surge.", "Concurrent sorts and spills increased allocation; autogrowth exhausted volume headroom.", "Review TempDB files, space usage, active requests, waits, and query plan spills.", "Protect host capacity, coordinate workload controls, and tune the responsible query after evidence capture.", "TempDB returns to planned headroom and recurring growth is monitored."],
  ["Unexpected database growth", "A database grows much faster than its monthly baseline.", "A new audit workload stores verbose events without retention cleanup.", "Compare file snapshots, table/index size, deployment changes, and retention jobs.", "Confirm retention requirements with data owner before any cleanup; plan space and a reviewed retention change.", "Growth rate is understood, retention is approved, and forecasting is updated."],
  ["Scheduled job not running", "Daily maintenance output is absent although the schedule appears enabled.", "Agent service is stopped after a host restart.", "Check Agent service, schedule, job history, service startup configuration, and alert delivery.", "Restore Agent through the approved operations process; run missed work only after assessing load and impact.", "Jobs execute, notifications arrive, and startup monitoring is in place."],
  ["Network connectivity loss", "Only application servers in one subnet cannot connect to SQL Server.", "A firewall change removed the required TCP path.", "Compare DNS and port reachability from affected and unaffected clients; review firewall change records.", "Engage network owner to restore the approved rule; avoid exposing SQL Server broadly.", "Connection succeeds from intended subnets and rule is documented."],
  ["Unexpected server restart", "Multiple database services restarted outside the maintenance window.", "Host reboot was triggered by an uncommunicated infrastructure update.", "Correlate Windows events, SQL startup time, cluster events, change calendar, and application impact.", "Confirm service/database recovery and job state; communicate impact and coordinate maintenance governance.", "Services and data validate; future reboot notices reach service owners."],
  ["Long database recovery", "A database remains in recovery after an instance restart.", "A large log and long active transaction require crash recovery work.", "Inspect SQL error log recovery progress, storage latency, database size, and transaction context.", "Avoid repeated restarts; preserve progress and engage senior DBA if progress or storage health is uncertain.", "Database reaches a stable state and recovery duration is added to capacity planning."],
  ["Failed database deployment", "A release pipeline reports a schema migration error and application health declines.", "A migration exceeded the planned lock window and partially completed.", "Identify completed steps, transaction boundaries, schema state, deployment logs, and current blocking.", "Pause further rollout; follow the approved migration rollback/forward plan after verifying its effects.", "Schema and application versions are reconciled and release validation passes."]
];

export const incidents = incidentSpecs.map(([title, situation, cause, investigate, resolution, validate], index) => ({
  id: index + 1, title, situation, cause, investigate, resolution, validate,
  choices: [
    "Collect scoped evidence and verify impact before a reversible, approved mitigation.",
    "Restart SQL Server immediately and investigate later.",
    "Delete logs or shrink files to free space without checking recovery impact."
  ],
  correct: 0
}));

const questionPatterns = [
  (topic) => `What is the primary DBA concern when working with ${topic}?`,
  (topic) => `Which first step produces the most useful evidence for a ${topic} investigation?`,
  (topic) => `Which action is safest when practicing ${topic}?`,
  (topic) => `How should a DBA validate a change related to ${topic}?`,
  (topic) => `Which statement best describes the operational value of ${topic}?`,
  (topic) => `What should be documented when a ${topic} task is completed?`,
  (topic) => `Which response should be avoided during an incident involving ${topic}?`,
  (topic) => `When is escalation appropriate for ${topic}?`,
  (topic) => `Which evidence helps distinguish a symptom from the cause of ${topic}?`,
  (topic) => `What is a strong interview answer about ${topic} expected to include?`
];

export const questions = chapters.flatMap((chapter) => questionPatterns.map((makeQuestion, index) => ({
  id: `${chapter.id}-${index + 1}`,
  chapterId: chapter.id,
  category: chapter.title,
  question: makeQuestion(chapter.title.toLowerCase()),
  options: [
    "Business impact, scoped evidence, a tested and approved action, and validation.",
    "A broad production change before checking the incident scope.",
    "Assume the most recent event is always the root cause.",
    "Skip documentation because the service appears healthy."
  ],
  answer: 0,
  explanation: `${chapter.lesson.slice(0, 175)}… A sound DBA response also records evidence and validates the outcome.`,
  relatedChapter: chapter.title
})));

const glossaryRows = [
  ["ACID", "Atomicity, consistency, isolation, and durability properties of transactions.", "A transaction either commits as a unit or is rolled back."],
  ["Agent job", "A SQL Server Agent task made of one or more scheduled steps.", "A job can run a lab backup and notify an operator on failure."],
  ["Availability Group", "A SQL Server high-availability and disaster-recovery feature that replicates databases to replicas.", "A listener gives clients a stable connection name."],
  ["Autogrowth", "Automatic file-size growth when a data or log file needs more allocated space.", "Fixed-MB growth is often easier to forecast than percentage growth."],
  ["Backup chain", "A sequence of compatible backups required to restore to a chosen point.", "A full backup followed by required log backups."],
  ["Buffer pool", "Memory area SQL Server uses to cache database pages.", "A cached page may satisfy a read without disk I/O."],
  ["Blocking", "One request waits for a lock held by another request.", "A report waits behind an uncommitted update."],
  ["Bulk-logged", "A recovery model that minimally logs certain bulk operations under defined conditions.", "It still requires log backups and has point-in-time limitations for affected backups."],
  ["Clustered index", "An index that defines the row organization of a table or indexed view.", "A primary key may be clustered, but need not be."],
  ["Collation", "Rules for sorting and comparing character data.", "Case sensitivity depends on the selected collation."],
  ["Compatibility level", "A database setting that controls certain version-specific behaviors.", "A migrated database can retain an older compatibility level."],
  ["Cost threshold for parallelism", "A configurable optimizer cost threshold for considering parallel plans.", "It is not a number of seconds."],
  ["Crash recovery", "Automatic redo and undo work SQL Server performs after an unexpected stop.", "The error log reports database recovery progress after restart."],
  ["Database Engine", "The SQL Server service that stores, processes, and secures relational data.", "The Engine hosts databases and executes T-SQL."],
  ["Database user", "A database-scoped principal that receives permissions.", "A user can be mapped to a server login."],
  ["DBCC CHECKDB", "A command that checks logical and physical database consistency.", "Schedule it with capacity in mind and preserve all reported errors."],
  ["Deadlock", "A cycle of competing locks where SQL Server chooses a victim to resolve the cycle.", "Two transactions acquire the same tables in opposite order."],
  ["Differential backup", "A backup of changes since the differential base full backup.", "Restore the base full, latest differential, then subsequent logs if used."],
  ["DMV", "Dynamic management view exposing SQL Server state and performance metadata.", "sys.dm_exec_requests lists current requests."],
  ["Failover", "Moving a service role from one node or replica to another.", "A planned failover requires readiness and validation."],
  ["Filegroup", "A logical container for database data files.", "A database may place selected tables in a secondary filegroup."],
  ["Full backup", "A backup containing database data sufficient to establish a restore base.", "A full backup can be restored to an isolated test instance."],
  ["Full recovery model", "A recovery model that supports log backups and point-in-time restore when the chain is maintained.", "Taking a full backup alone does not truncate the log."],
  ["Instance", "An independent SQL Server Engine installation with its own configuration and databases.", "A host can run default and named instances."],
  ["LDF", "Common file extension for a SQL Server transaction log file.", "The log records transactions needed for recovery."],
  ["Listener", "A network name and address used to connect to an Availability Group.", "Applications can use a listener rather than a replica host name."],
  ["Log backup", "A backup of transaction-log records since the previous log backup.", "In Full recovery, regular log backups preserve a recoverable chain."],
  ["Log shipping", "A DR technique that backs up, copies, and restores transaction logs to a secondary.", "Copy and restore delays contribute to recovery point."],
  ["Login", "A server-level principal used to authenticate to a SQL Server instance.", "A Windows group login can be mapped to database users."],
  ["MDF", "Common file extension for a primary SQL Server data file.", "The primary file stores database metadata and can contain data."],
  ["MAXDOP", "Maximum degree of parallelism setting that limits parallel query execution workers.", "A workload-specific setting should follow current guidance and testing."],
  ["Model database", "System database used as the template for new databases.", "Selected settings from model are copied into a newly created database."],
  ["msdb", "System database that stores SQL Agent, backup, and other operational metadata.", "Backup history queries commonly read msdb."],
  ["NDF", "Common file extension often used for secondary SQL Server data files.", "A database may contain multiple secondary data files."],
  ["NORECOVERY", "Restore option that leaves the database unavailable for additional restore operations.", "Use it between full, differential, and log restore steps."],
  ["Normalization", "Structuring relational data to reduce unwanted duplication and update anomalies.", "A department name stored once can be referenced by many employees."],
  ["Page", "The basic 8-KB unit of data storage in SQL Server.", "An index organizes rows across data pages."],
  ["Point-in-time recovery", "Restoring a database to a specified time using a compatible backup chain.", "RESTORE LOG can use STOPAT when the chain supports it."],
  ["Primary key", "A constraint that uniquely identifies each row in a table.", "EmployeeId can be a primary key."],
  ["Query Store", "A database feature that captures query, plan, and runtime history.", "Compare plan performance before and after a release."],
  ["Recovery model", "A database property controlling transaction-log backup and recovery behavior.", "Simple, Full, and Bulk-logged have different log-backup semantics."],
  ["Recovery point objective", "The maximum tolerable data loss measured as time.", "An RPO of 30 minutes informs backup frequency and replication design."],
  ["Recovery time objective", "The target time to restore a service after disruption.", "Restore drills measure whether an RTO is achievable."],
  ["RESTORE WITH RECOVERY", "Finalizes a restore sequence and brings a database online.", "Apply required log backups before recovering."],
  ["SARGable", "A predicate form that can use an index search argument efficiently.", "A direct date range may be more searchable than wrapping the column in a function."],
  ["Service account", "Identity under which a Windows service runs.", "The SQL Server service identity needs appropriate file access."],
  ["SQL Server Agent", "SQL Server service that schedules jobs, alerts, and operators.", "Agent can run maintenance jobs where supported and enabled."],
  ["Statistics", "Metadata describing data distribution that helps the optimizer estimate row counts.", "Outdated statistics can contribute to an unsuitable plan."],
  ["tempdb", "System database used for temporary objects, worktables, and version store.", "Large sorts or row-versioning workloads can increase tempdb use."],
  ["Transaction log", "Sequential record of database changes used for recovery and log backups.", "A long transaction can prevent log truncation."],
  ["Transaction", "A unit of work that commits or rolls back as a whole.", "BEGIN TRANSACTION and ROLLBACK can safely test a lab change."],
  ["TDE", "Transparent Data Encryption encrypts database files at rest.", "TDE certificate and key backups are needed for restore elsewhere."],
  ["Wait statistics", "Cumulative measures of time requests spent waiting on resources.", "Compare deltas over a representative interval, not just lifetime totals."],
  ["Windows Authentication", "Authentication using Windows or domain identities.", "A domain group can be granted a SQL Server login."],
  ["WITH MOVE", "RESTORE option that maps logical database files to target paths.", "Restore a lab backup to a separate directory."],
  ["Write-ahead logging", "Rule requiring log records to be persisted before corresponding data pages.", "This supports transaction durability and recovery."],
  ["Availability", "Measure of whether a service is ready for use.", "Monitoring can track successful connection checks over time."],
  ["Backup checksum", "Option to calculate and validate backup checksums for corruption detection.", "WITH CHECKSUM helps detect certain I/O problems."],
  ["Backup encryption", "Encryption applied to a backup set.", "Protect and retain the certificate/key required for restore."],
  ["Backup retention", "Policy describing how long backup copies are retained.", "A daily backup retention tier may differ from monthly archives."],
  ["Blocking chain", "Linked set of requests waiting on other sessions.", "Identify the head blocker before choosing a response."],
  ["Change management", "Review and approval process for controlled production changes.", "A database deployment includes validation and rollback plans."],
  ["Checkpoint", "Process that writes dirty pages and records recovery progress.", "A checkpoint does not replace a backup."],
  ["Contained database", "Database that can manage certain authentication metadata within the database.", "It can reduce some dependencies on instance-level logins."],
  ["Data file", "Database file that stores tables, indexes, and other database structures.", "MDF and NDF are common file extensions."],
  ["Data masking", "Technique that obscures sensitive values in a non-production context.", "Masking must be designed to prevent re-identification."],
  ["Differential base", "Full backup on which a differential backup depends.", "A copy-only full backup does not reset the differential base."],
  ["Disaster recovery", "Plans and capabilities to restore service after a major disruption.", "A tested off-site restore is part of DR readiness."],
  ["Durability", "ACID property that committed work survives failures according to system guarantees.", "A committed transaction is protected by the transaction log."],
  ["Extended Events", "Lightweight event infrastructure for observing SQL Server activity.", "Capture deadlock reports for later analysis."],
  ["Failover Cluster Instance", "SQL Server instance that can move between cluster nodes, typically using shared storage.", "Cluster health and storage are key dependencies."],
  ["Foreign key", "Constraint that enforces a relationship to a candidate key in another table.", "An order's CustomerId references an existing customer."],
  ["Full-text search", "SQL Server feature for language-aware searching of text data.", "It is distinct from ordinary B-tree indexes."],
  ["Health check", "Repeatable set of checks that summarizes operational state and exceptions.", "A report should include time, evidence, threshold, and action."],
  ["Index", "Structure that can accelerate data access at storage and write cost.", "A selective index may reduce reads for a frequent query."],
  ["Isolation level", "Transaction setting that controls visibility and locking behavior.", "Read Committed is a common default, but behavior depends on configuration."],
  ["Lock escalation", "Conversion of many fine-grained locks into a coarser lock under certain conditions.", "Large updates can increase contention."],
  ["Maintenance window", "Approved period for potentially disruptive administrative work.", "Index maintenance is scheduled during a suitable window."],
  ["Master database", "System database containing instance-level metadata.", "A damaged master database can prevent normal instance startup."],
  ["Network port", "Transport endpoint used by a service for network communication.", "A firewall path must allow the configured SQL Server TCP port."],
  ["Operator", "SQL Agent notification recipient for job and alert messages.", "An operator can receive job failure notifications."],
  ["Parameter sniffing", "Plan compilation behavior where parameter values influence a cached execution plan.", "Skewed data distributions can make one cached plan unsuitable for another value."],
  ["Permissions", "Authorizations that allow or deny actions on securable objects.", "GRANT SELECT on a schema is narrower than db_owner."],
  ["Primary replica", "Availability Group replica that currently hosts read-write primary databases.", "A failover changes which replica has the primary role."],
  ["Quorum", "Cluster voting mechanism used to determine cluster availability and membership.", "Witness configuration can affect resilience to node failure."],
  ["Read committed snapshot", "Database option using row versioning to provide statement-level read consistency.", "It can reduce reader/writer blocking but uses version store in tempdb."],
  ["Replication", "Technology for distributing data or database objects between systems.", "Transactional replication can publish selected table changes."],
  ["Rollback", "Undoing an uncommitted transaction or reverting a planned change.", "ROLLBACK TRANSACTION reverses lab work before commit."],
  ["Schema", "Database namespace and ownership boundary for objects.", "dbo is a common schema; applications can use their own schema."],
  ["SQL injection", "Vulnerability where untrusted input changes the meaning of a SQL statement.", "Parameterized queries avoid concatenating input into SQL text."],
  ["SQL Server Browser", "Service that helps clients discover ports for named instances.", "A fixed port can simplify firewall configuration."],
  ["SQL Server Configuration Manager", "Tool for managing SQL Server services and network configuration.", "Use it to configure supported network protocols."],
  ["SQL Server error log", "SQL Server diagnostic log containing startup and operational messages.", "Review it alongside Windows and application logs."],
  ["Staging environment", "Pre-production environment used to validate changes with production-like configuration.", "A staging restore can validate a migration path."],
  ["Tail-log backup", "Backup of the log records not yet backed up, when possible, before restore.", "It may preserve recent transactions after a failure."],
  ["TCP/IP", "Network protocol used by SQL Server clients to connect over IP.", "Clients need name resolution, a listening port, and firewall reachability."],
  ["UAT", "User acceptance testing environment or phase.", "Business users validate workflows before production release."],
  ["Unique constraint", "Constraint that prevents duplicate values in a column or set of columns.", "A unique email constraint prevents duplicate addresses."],
  ["Wait resource", "Specific resource a request is waiting to access.", "A lock wait identifies a lock resource and blocker."],
  ["Workload", "Set of database requests over time, including their concurrency and resource demands.", "A reporting workload may have different indexes than OLTP traffic."],
  ["Zero data loss", "An objective that may be achievable only under specific synchronous and healthy conditions.", "It should not be promised without validated architecture and failure assumptions."]
];

export const glossary = glossaryRows.map(([term, definition, example]) => ({ term, definition, example }));

export const scripts = [
  { title: "Instance and version inventory", category: "Server information", purpose: "Record the connected instance and product version.", permissions: "Public server metadata; some properties may be restricted.", code: "SELECT @@SERVERNAME AS ServerName, @@VERSION AS VersionInfo;" },
  { title: "Database state and recovery model", category: "Database inventory", purpose: "Review database online state and recovery configuration.", permissions: "VIEW ANY DATABASE or equivalent visibility.", code: "SELECT name, state_desc, recovery_model_desc FROM sys.databases ORDER BY name;" },
  { title: "Database file sizes", category: "File size monitoring", purpose: "List allocated files, growth settings, and paths.", permissions: "Metadata visibility; access to all databases may require additional rights.", code: "SELECT DB_NAME(database_id) AS DatabaseName, name, type_desc, size*8/1024 AS SizeMB, growth, is_percent_growth, physical_name FROM sys.master_files ORDER BY database_id, file_id;" },
  { title: "Backup history", category: "Backup history", purpose: "Review recent backup records in msdb.", permissions: "Read access to msdb backup history.", code: "SELECT TOP (100) database_name, type, backup_start_date, backup_finish_date, backup_size FROM msdb.dbo.backupset ORDER BY backup_finish_date DESC;" },
  { title: "Verify a lab backup set", category: "Backup verification", purpose: "Check backup-set readability and checksums when available; this is not a substitute for restoring and validating the database.", permissions: "RESTORE permission; the SQL Server service account must access the backup path.", code: "RESTORE VERIFYONLY FROM DISK = N'C:\\SQLBackups\\DbaLab_full.bak' WITH CHECKSUM;" },
  { title: "Active requests and blockers", category: "Active sessions", purpose: "Find current requests that are waiting or blocking.", permissions: "VIEW SERVER STATE or version-specific equivalent.", code: "SELECT session_id, status, wait_type, blocking_session_id, wait_time, command FROM sys.dm_exec_requests WHERE session_id <> @@SPID;" },
  { title: "Open transactions", category: "Blocking sessions", purpose: "Review active transaction age as investigation evidence.", permissions: "VIEW SERVER STATE or equivalent.", code: "DBCC OPENTRAN; -- Run in the selected lab database and review the reported transaction." },
  { title: "Index usage snapshot", category: "Index information", purpose: "Review index operational counters since service start.", permissions: "Metadata visibility; counters reset on restart.", code: "SELECT OBJECT_NAME(s.object_id) AS TableName, i.name, s.user_seeks, s.user_scans, s.user_updates FROM sys.dm_db_index_usage_stats AS s JOIN sys.indexes AS i ON i.object_id=s.object_id AND i.index_id=s.index_id WHERE s.database_id=DB_ID();" },
  { title: "Agent job status", category: "SQL Agent jobs", purpose: "Inventory SQL Agent job names, state, and owner.", permissions: "Read access to relevant msdb metadata.", code: "SELECT name, enabled, SUSER_SNAME(owner_sid) AS JobOwner FROM msdb.dbo.sysjobs ORDER BY name;" },
  { title: "Database role membership", category: "Security auditing", purpose: "Review database role membership for the current database.", permissions: "Metadata visibility.", code: "SELECT r.name AS RoleName, m.name AS MemberName FROM sys.database_role_members AS rm JOIN sys.database_principals AS r ON rm.role_principal_id=r.principal_id JOIN sys.database_principals AS m ON rm.member_principal_id=m.principal_id ORDER BY r.name, m.name;" },
  { title: "Run a consistency check", category: "Database integrity", purpose: "Check consistency of the named disposable lab database.", permissions: "sysadmin or database owner; plan resource use.", code: "DBCC CHECKDB (N'DbaLab') WITH NO_INFOMSGS, ALL_ERRORMSGS;" },
  { title: "Index fragmentation snapshot", category: "Index fragmentation", purpose: "Review fragmentation for indexes in the current database.", permissions: "VIEW DATABASE STATE or equivalent; scan may consume resources.", code: "SELECT OBJECT_NAME(ips.object_id) AS TableName, i.name, ips.avg_fragmentation_in_percent, ips.page_count FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') AS ips JOIN sys.indexes AS i ON i.object_id=ips.object_id AND i.index_id=ips.index_id WHERE ips.page_count > 100 ORDER BY ips.avg_fragmentation_in_percent DESC;" },
  { title: "Wait statistics snapshot", category: "Query performance", purpose: "Take a point-in-time view of accumulated server waits for investigation.", permissions: "VIEW SERVER STATE or equivalent; counters reset at startup.", code: "SELECT TOP (25) wait_type, waiting_tasks_count, wait_time_ms, signal_wait_time_ms FROM sys.dm_os_wait_stats WHERE wait_type NOT LIKE 'SLEEP%' ORDER BY wait_time_ms DESC;" },
  { title: "SQL Server error log", category: "Error log investigation", purpose: "Read the current SQL Server error log using the documented procedure.", permissions: "Typically sysadmin or a granted error-log reader role.", code: "EXEC master.dbo.xp_readerrorlog 0, 1, N'Error';" },
  { title: "Blocking request details", category: "Deadlocks", purpose: "List current blocked requests and their blocker session IDs.", permissions: "VIEW SERVER STATE or version-specific equivalent.", code: "SELECT session_id, blocking_session_id, wait_type, wait_time, wait_resource FROM sys.dm_exec_requests WHERE blocking_session_id > 0;" },
  { title: "TempDB file allocation", category: "Database health checks", purpose: "Review current TempDB file sizes and growth settings.", permissions: "Metadata visibility; some details require elevated permissions.", code: "SELECT name, type_desc, size*8/1024 AS SizeMB, growth, is_percent_growth, physical_name FROM tempdb.sys.database_files;" },
  { title: "Recent Agent job failures", category: "SQL Agent jobs", purpose: "Inspect recent SQL Agent job outcomes recorded in msdb.", permissions: "Read access to msdb job history.", code: "SELECT TOP (50) j.name, h.run_date, h.run_time, h.run_status, h.message FROM msdb.dbo.sysjobhistory AS h JOIN msdb.dbo.sysjobs AS j ON j.job_id=h.job_id WHERE h.step_id=0 ORDER BY h.instance_id DESC;" },
  { title: "Database size by file type", category: "Disk monitoring", purpose: "Summarize allocated data and log file size for visible databases.", permissions: "Metadata visibility.", code: "SELECT DB_NAME(database_id) AS DatabaseName, type_desc, SUM(size)*8/1024 AS AllocatedMB FROM sys.master_files GROUP BY database_id, type_desc ORDER BY DatabaseName, type_desc;" }
];

export const roadmapGroups = [
  [1, 3, 1, "DBA role and database fundamentals"], [4, 6, 3, "Windows Server and infrastructure"],
  [7, 10, 4, "SQL Server architecture and installation"], [11, 14, 6, "Database creation and storage"],
  [15, 20, 7, "Backup and recovery"], [21, 23, 8, "Disaster recovery"], [24, 27, 9, "Security and access management"],
  [28, 31, 10, "SQL Server Agent and automation"], [32, 36, 11, "Monitoring and health checks"],
  [37, 42, 12, "Performance tuning"], [43, 46, 13, "Blocking, deadlocks, and integrity"],
  [47, 49, 15, "Capacity planning and maintenance"], [50, 53, 16, "High availability and disaster recovery"],
  [54, 56, 18, "PowerShell automation"], [57, 58, 19, "Production incident simulations"],
  [59, 60, 20, "Enterprise DBA project and assessment"]
];

export const roadmap = Array.from({ length: 60 }, (_, index) => {
  const day = index + 1;
  const group = roadmapGroups.find(([start, end]) => day >= start && day <= end);
  const chapter = chapters[group[2] - 1];
  const topic = chapter.objectives[index % chapter.objectives.length];
  return {
    day, focus: group[3], chapterId: chapter.id,
    objective: topic,
    lesson: `${chapter.lesson.slice(0, 240)}…`,
    exercise: chapter.tasks[index % chapter.tasks.length],
    command: chapter.code,
    expected: chapter.output,
    assignment: `Write a short evidence-based note demonstrating: ${topic.toLowerCase()}.`,
    quiz: `In your own words, what evidence would show that you understand ${topic.toLowerCase()}?`,
    checklist: ["Read the lesson", "Complete the isolated exercise", "Record the result", "Review the safety note"]
  };
});

export const assignmentList = chapters.map((chapter) => ({
  id: `assignment-${chapter.id}`,
  title: `Chapter ${chapter.id}: ${chapter.tasks[0]}`,
  chapterId: chapter.id,
  description: chapter.tasks.join("; ")
}));
