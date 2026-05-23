# Jenkins Local Configuration - Visual Guide

## Important: Custom Workspace in Jenkinsfile

**Good news!** The custom workspace is already configured in the Jenkinsfile itself:

```groovy
agent {
    any
    customWorkspace 'D:\\Work\\preerp'
}
```

This means you **DON'T need to** configure "Use custom workspace" in the Jenkins UI. Just create the pipeline job and point it to the Jenkinsfile!

---

## Step 1: Create New Pipeline Job

Jenkins Dashboard → **New Item**

```
┌─────────────────────────────────────────────┐
│ Enter an item name                          │
│ ┌─────────────────────────────────────────┐ │
│ │ PreeRP-Local-Build                      │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ○ Freestyle project                         │
│ ● Pipeline                        <-- Select│
│ ○ Multi-configuration project              │
│ ○ Folder                                    │
│                                             │
│                            [OK]   [Cancel]  │
└─────────────────────────────────────────────┘
```

## Step 2: Configure Pipeline (Main Configuration)

Scroll to **Pipeline** section - this is the only required configuration:

```
┌──────────────────────────────────────────────────────────┐
│ Pipeline                                                 │
│                                                          │
│ Definition: [Pipeline script from SCM        ▼]          │
│                                                          │
│ SCM: [None                                   ▼]          │
│                                                          │
│ Script Path: ┌─────────────────────────────────────┐    │
│              │ Jenkinsfile                         │    │
│              └─────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

The custom workspace (`D:\Work\preerp`) is already configured in the Jenkinsfile, so you don't need to set it here!

## Step 3: Optional Settings

If you want control over dependency installation:

```
┌──────────────────────────────────────────────────────────┐
│ ☑ This project is parameterized                          │
│                                                          │
│ [Add Parameter ▼]                                        │
│ # Optional: Discard Old Builds

```
┌──────────────────────────────────────────────────────────┐
│ General                                                  │
│                                                          │
│ ☑ Discard old builds                                     │
│   Strategy: Log Rotation                                 │
│   Days to keep builds: [7]  Max # of builds: [10]       │
└──────────────────────────────────────────────────────────┘
```

### Optional:                                        │
│ ┌─ Boolean Parameter ────────────────────────────────┐   │
│ │ Name: FORCE_INSTALL                                │   │
│ │ ☐ Set by Default                                   │   │
│ │ Description:                                       │   │
│ │ ┌──────────────────────────────────────────────┐   │   │
│ │ │ Force reinstall dependencies even if they    │   │   │
│ │ │ already exist in node_modules                │   │   │
│ │ └──────────────────────────────────────────────┘   │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Step 4: Configure Pipeline

Scroll to **Pipeline** section:

```
┌──────────────────────────────────────────────────────────┐
│ Pipeline                                                 │
│                                                          │
│ Definition: [Pipeline script from SCM        ▼]          │
│                                                          │
│ SCM: [None                                   ▼]          │
│      (or keep as Git - it will be ignored)              │
│                                                          │
│ Script Path: ┌─────────────────────────────────────┐    │
│              │ Jenkinsfile                         │    │
│              └─────────────────────────────────────┘    │
│                                                          │
│ ☐ Lightweight checkout                                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Alternative: Inline Script

```
┌──────────────────────────────────────────────────────────┐
│ Pipeline                                                 │
│                                                          │
│ Definition: [Pipeline script                 ▼]          │
│                                                          │
│ Script: ┌────────────────────────────────────────────┐   │
│         │ pipeline {                                 │   │
│         │   agent any                                │   │
│         │   tools {                                  │   │
│         │     nodejs 'NodeJS'                        │   │
│         │   }                                        │   │
│         │   // ... rest of Jenkinsfile content      │   │
│         │ }                                          │   │
│         └────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Step 5: Save and Build

Click **[Save]** at the bottom

## Running Your First Build

### Without Parameters:

```
┌─────────────────────────────────────────────┐
│ PreeRP-Local-Build                          │
│                                             │
│ [Build Now]  [Configure]  [Delete Project]  │
│                                             │
│ Build History                               │
│ ┌─────────────────────────────────────────┐ │
│ │ #1  May 23, 2026 2:15 PM                │ │
│ │     ✓ Success (2 min 34 sec)            │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### With Parameters:

```
┌─────────────────────────────────────────────┐
│ Build with Parameters                       │
│                                             │
│ FORCE_INSTALL                               │
│ ☑ Force reinstall dependencies              │
│                                             │
│                            [Build] [Cancel] │
└─────────────────────────────────────────────┘
```

## Viewing Build Results

Click on build number → Console Output:

```
┌───────────────────────────────────────────────────────────┐
│ Console Output                                            │
│                                                           │
│ Started by user admin                                     │
│ Running in Durability level: MAX_SURVIVABILITY           │
│ [Pipeline] Start of Pipeline                              │
│ [Pipeline] node                                           │
│ Running on Jenkins in D:\Work\preerp                      │
│ [Pipeline] {                                              │
│ [Pipeline] stage                                          │
│ [Pipeline] { (Verify Source)                              │
│ [Pipeline] echo                                           │
│ 📂 Using local development directory as source            │
│ [Pipeline] echo                                           │
│ Workspace: D:\Work\preerp                                 │
│ [Pipeline] bat                                            │
│  Volume in drive D is Data                                │
│  Directory of D:\Work\preerp                              │
│                                                           │
│ [Pipeline] stage                                          │
│ [Pipeline] { (Install Dependencies)                       │
│ [Pipeline] parallel                                       │
│ [Pipeline] { (Branch: Backend Dependencies)               │
│ [Pipeline] echo                                           │
│ Skipping - dependencies already installed                 │
│ ...                                                       │
│                                                           │
│ [Pipeline] stage                                          │
│ [Pipeline] { (Run Tests)                                  │
│ [Backend Tests] PASS server/__tests__/models/User.test.js │
│ [Frontend Tests] Chrome Headless: Executed 111 of 111 ✓  │
│ ...                                                       │
│                                                           │
│ ✅ Build successful! Release package created.             │
│ Release: preerp-1-20260523-141532.zip                     │
│ [Pipeline] End of Pipeline                                │
│ Finished: SUCCESS                                         │
└───────────────────────────────────────────────────────────┘
```

## Accessing Build Artifacts

On build page:

```
┌─────────────────────────────────────────────────────┐
│ Build #1                                            │
│                                                     │
│ ✓ Success  2 min 34 sec                             │
│                                                     │
│ Tabs:                                               │
│ [Status] [Changes] [Console Output] [Tests]         │
│                                                     │
│ Build Artifacts:                                    │
│ 📦 release/preerp-1-20260523-141532.zip    (12.4MB) │
│                                                     │
│ Test Result:                                        │
│ ✓ 198 tests passed (111 frontend + 87 backend)     │
│                                                     │
│ Coverage Reports:                                   │
│ 📊 Backend Coverage Report                          │
│ 📊 Frontend Coverage Report                         │
└─────────────────────────────────────────────────────┘
```

## Troubleshooting Configuration

### Issue: "No such file or directory"

**Problem:** Jenkins can't find your workspace

**Solution:** The workspace path is now in the Jenkinsfile. If you need to change it:
1. Edit `Jenkinsfile`
2. Change `customWorkspace 'D:\\Work\\preerp'` to your path
3. Use double backslashes: `D:\\Your\\Path`
4. Save and rebuild

### Issue: "Permission denied"

**Problem:** Jenkins service can't read your folder

**Fix:**
1. Right-click `D:\Work\preerp` folder
2. Properties → Security → Edit
3. Add user: `NT AUTHORITY\SYSTEM`
4. Grant: Read & execute, List folder contents, Read
5. Click OK

### Issue: "NodeJS not found"

**Problem:** NodeJS tool not configured

**Fix:**
1. Manage Jenkins → Global Tool Configuration
2. NodeJS → Add NodeJS
3. Name: `NodeJS` (exactly as in Jenkinsfile)
4. Version: Select Node.js 16+ or higher
5. Save

### Issue: "Jenkinsfile not found"

**Problem:** Wrong script path or file doesn't exist

**Fix:**
- Verify Jenkinsfile exists in: `D:\Work\preerp\Jenkinsfile`
- Script Path should be: `Jenkinsfile` (not `./Jenkinsfile`)

## Configuration Checklist

Before your first build:

- [ ] Jenkins job created with name `PreeRP-Local-Build`
- [ ] Pipeline definition set to: `Pipeline script from SCM` (or inline script)
- [ ] Script path set to: `Jenkinsfile`
- [ ] Jenkinsfile exists in: `D:\Work\preerp\Jenkinsfile`
- [ ] Custom workspace configured in Jenkinsfile: `D:\\Work\\preerp` ✓
- [ ] NodeJS tool configured with name: `NodeJS`
- [ ] Chrome installed for tests
- [ ] npm dependencies installed locally (or will be on first build)

**Note:** The custom workspace path is in the Jenkinsfile, so you don't need to set it in Jenkins UI!

## What Happens During Build?

```
Your Development Folder: D:\Work\preerp
         ↓
Jenkins uses it as workspace (no copy!)
         ↓
Verify Source ✓
         ↓
Check Dependencies (skip if exist)
         ↓
Run Tests → Backend (Jest) + Frontend (Karma)
         ↓
Build Frontend → Production build
         ↓
Create Release Package → ZIP file
         ↓
Archive Artifacts → Available for download
         ↓
Done! ✅
```

## Quick Tips

💡 **Stop your dev server** before running Jenkins builds (port 3000 conflict)

💡 **Commit changes first** - Jenkins works on your actual files

💡 **First build is slower** - subsequent builds reuse dependencies

💡 **Check Console Output** for detailed logs if build fails

💡 **Download release ZIP** from build artifacts page

---

**Ready?** Create your job and click Build Now! 🚀
