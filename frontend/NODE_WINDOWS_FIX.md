# Windows Rollup / Application Control Fix

OceanX uses Vite 4.5.14 with Rollup 3 to avoid the Rollup 4 native Windows `.node` binary. Some Windows machines block `@rollup/rollup-win32-x64-msvc` through Application Control, which can make Vite fail even when the package is installed.

Clean install:

```powershell
cd D:\OceanX\frontend
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm cache verify
npm install
npm run dev
```

The backend is independent of this issue.
